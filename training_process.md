# Leaf Classifier — Current Training Process

This document describes the retraining pipeline implemented in
`classifier/app/routes/retrain.py` and its helper modules
(`label_detector.py`, `model_versioning.py`, `models_loader.py`, `config.py`).

---

## 1. Request entry & concurrency guard

**Endpoint:** `POST /retrain?model=especies|hojas|plantas`
(`retrain_model`, retrain.py:90)

- Validates the `model` query param (400 if not `especies`, `hojas`, or `plantas`).
- Under a global `training_lock`, checks the `training_status` dict. If that model
  is already training, it responds **409 Conflict**.
- Otherwise it marks `is_training=True` with a `started_at` timestamp.

## 2. Pre-flight class detection

Before spawning the worker thread, `detect_new_classes(model)` scans
`DATA_DIR/<model>/train` folders and compares them against the current class lists
in `config.py`. This only populates the API response with:

- `classes_detected`
- `current_classes`
- `new_classes`
- `removed_classes`
- `has_changes`

## 3. Background thread spawn

- `train_thread(model)` runs as a **daemon thread** so the API responds
  immediately with `status: "Entrenamiento iniciado"` without blocking.
- The thread object is stored in `training_status[model]['thread']`.

## 4. Cloudflare R2 sync (species only)

- Only when `model == 'especies'`: if all four R2 credentials
  (`CLOUDFLARE_R2_BUCKET_NAME`, `_ACCOUNT_ID`, `_ACCESS_KEY_ID`,
  `_SECRET_ACCESS_KEY`) are set, `download_verified_images_from_r2(...)` pulls new
  verified images into `DATA_DIR/especies/train` **before** training.
- Failures or missing credentials are logged; training continues with existing
  local data.

## 5. GPU detection & setup

- Lists physical GPUs, enables `set_memory_growth` on each, and prints device
  details.
- If a GPU exists, hard-sets `CUDA_VISIBLE_DEVICES=0` and calls
  `tf.config.set_visible_devices(gpus[0], 'GPU')`.
- If no GPU is found, training falls back to CPU.

## 6. Path & data validation

- Computes:
  - `model_path = MODEL_DIR/modelo_<name>.h5`
  - `train_data_path = DATA_DIR/<model>/train`
- Raises `FileNotFoundError` if the train dir does not exist, or `ValueError` if
  it is empty.

## 7. Class detection & config sync

- `detect_new_classes(model)` runs again (inside the thread, so it sees any newly
  downloaded R2 images).
- **Always** calls `update_config_with_detected_classes(model, detected_classes)`,
  which rewrites the `_DEFAULT_SPECIES` / `_DEFAULT_SHAPES` / `_DEFAULT_PLANTS`
  lists in `config.py` in **alphabetical order** so that the generator's class
  indices match the model's output order.
- Then `reload_config()` hot-reloads the `config` module and re-syncs the static
  `SPECIES`/`SHAPES`/`PLANTS` variables without restarting the app.

## 8. Model load & architecture adjustment

- Picks the device string (`/GPU:0` or `/CPU:0`) and loads the existing `.h5`
  model inside `with tf.device(device):`.
- Compares the model's output classes (`model.output[0].shape[-1]`) against the
  detected class count:

  - **Data has more classes** → `adjust_model_for_new_classes(...)` replaces the
    final Dense layer with one sized to the new class count and **copies the
    existing weights** into the new layer. New classes get random init.
  - **Data has fewer classes** → the output layer is rebuilt directly from the
    penultimate layer with the correct count.
  - **Equal** → no architectural change.

- Activation per model:
  - `especies`, `hojas` → `softmax`
  - `plantas` → `sigmoid` (binary)

## 9. Adaptive batch size

- **GPU:** probes VRAM via `get_memory_info` / device details (fallback 1.5 GB),
  reserves ~60% of it for batches, estimates `batch_size`, and caps it by VRAM
  tier (256 / 128 / 64 / 32), with a minimum of 8.
- **CPU:** `batch_size = 32`.

## 10. Image count & validation split

- Counts image files (png/jpg/jpeg/bmp/gif) across all class folders.
- If total images ≥ 10 → `validation_split = 0.2` (20% held out).
- Otherwise `validation_split = 0.0` (train on 100% of the data).

## 11. Data generators

- `ImageDataGenerator(rescale=1./255, validation_split=...)`.
- `flow_from_directory` with `target_size=(128, 128)`,
  `batch_size=batch_size`, `class_mode='categorical'`.
- A validation generator is created only when validation is active, and dropped
  if it yields 0 samples.

## 12. Final class-count check

- Compares `train_gen.num_classes` against the model's output class count and
  raises `ValueError` on mismatch (fail-fast before training).

## 13. Compilation

- `optimizer=tf.keras.optimizers.Adam(1e-5)` (low LR for fine-tuning)
- `loss='categorical_crossentropy'`
- `metrics=['accuracy']`
- Compiled inside the device context.

## 14. Training

- `model.fit(train_gen, epochs=5, verbose=1)`, adding `validation_data=val_gen`
  only when validation is available.
- GPU extras:
  - Mixed precision **disabled** (to avoid OOM on limited VRAM).
  - XLA JIT enabled.

### OOM handling

- Any exception during `fit` is inspected for OOM signatures (`OOM`,
  `ResourceExhaustedError`, `out of memory`, etc.).
- If OOM is detected:
  1. Halve `batch_size` (abort if it drops below 8).
  2. Garbage-collect (without `clear_session`, which would destroy the model).
  3. Recreate both generators with the new batch size.
  4. Recompile the model.
  5. Retry `model.fit` inside `with tf.device('/GPU:0')`.
- Non-OOM errors are re-raised.

## 15. Versioning, save & hot reload

- `create_model_version(...)` snapshots the **old** model into
  `backups/modelo_<name>_vNNNN_YYYYMMDDTHHMMSS.h5`, records metadata in
  `<name>_versions.json`, and keeps only the newest `MAX_BACKUPS` (3) versions
  (model_versioning.py:53).
- `model.save(model_path)` overwrites the active `.h5`, then validates it by
  reloading it with `tf.keras.models.load_model`.
- `reload_model(model_name)` loads the new weights on **CPU** into the global
  prediction registry (models_loader.py:152), so the `/predict` endpoint uses the
  new model immediately without a restart.

## 16. Cleanup

- The `finally` block flips `is_training=False`, records `completed_at`, and
  stores `error` if the run failed.

---

## Error handling

- Three catch tiers: `FileNotFoundError`, `ValueError`, and generic `Exception`.
  Each prints Spanish debug guidance and points to `/retrain/restore-version` as
  a rollback path.

---

## Notes & known caveats

- **GPU targeting:** `CUDA_VISIBLE_DEVICES=0` and
  `tf.config.set_visible_devices(gpus[0], 'GPU')` are hard-coded to the first GPU
  even when multiple GPUs exist.
- **OOM catch-all:** the `except (tf.errors.ResourceExhaustedError, RuntimeError,
  Exception)` clause routes *every* exception through OOM detection before
  re-raising non-OOM errors.
- **Framework discrepancy:** `.agents/rules/*.md` describe the Classifier service
  as Python + PyTorch (ViT), but this implementation is TensorFlow/Keras.
- **Validation threshold:** validation split is enabled only when total image
  count ≥ 10; small datasets train without validation.
- **Class order:** `config.py` class lists are rewritten alphabetically on every
  retrain to keep generator indices aligned with model output nodes.