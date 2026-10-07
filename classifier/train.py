import os
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import classification_report, confusion_matrix
import PIL

# Disable DecompressionBombError for large images
PIL.Image.MAX_IMAGE_PIXELS = None

# ---------------------------------------------------------------------------
# Paths — works locally AND in Kaggle (where __file__ may not exist)
# ---------------------------------------------------------------------------
try:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
except NameError:
    BASE_DIR = os.getcwd()

DATASET_DIR = os.path.join(BASE_DIR, 'plant-leaf-dataset')
TRAIN_DIR   = os.path.join(DATASET_DIR, 'train')
TEST_DIR    = os.path.join(DATASET_DIR, 'test')
MODELS_DIR  = os.path.join(BASE_DIR, 'models')

os.makedirs(MODELS_DIR, exist_ok=True)

# ---------------------------------------------------------------------------
# Config maps — folder names  →  class labels used by predict.py
# ---------------------------------------------------------------------------
SPECIES_MAP = {
    'yam':     'discorea-alata-l',
    'eggplant':'solanum-melongena',
    'cucumber':'cucumis-sativus',
    'corn':    'zea-mays',
    'cassava': 'manihot-esculenta',
}

SPECIES_SHAPES_MAP = {
    'yam':     'ovate',
    'eggplant':'ovate',
    'cucumber':'palmeate',
    'corn':    'lanceolate',
    'cassava': 'simple_palmeate',
}

IMG_SIZE   = (128, 128)
BATCH_SIZE = 32
EPOCHS     = 2

# ---------------------------------------------------------------------------
# Helper: collect leaf images from a split directory (train or test)
# ---------------------------------------------------------------------------
def collect_images_from_split(split_dir):
    """
    Returns a dict  { class_label: [img_path, ...] }
    Ignores the non_plants subfolder (handled separately).
    """
    data = {}
    if not os.path.exists(split_dir):
        return data
    for species_folder in sorted(os.listdir(split_dir)):
        species_path = os.path.join(split_dir, species_folder)
        if not os.path.isdir(species_path):
            continue
        if species_folder.lower() == 'non_plants':
            continue
        mapped = SPECIES_MAP.get(species_folder.lower(), species_folder.lower())
        for health_folder in sorted(os.listdir(species_path)):
            health_path = os.path.join(species_path, health_folder)
            if not os.path.isdir(health_path):
                continue
            label = f"{mapped}_{health_folder}"
            imgs  = [os.path.join(health_path, f) for f in os.listdir(health_path)
                     if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
            if imgs:
                data[label] = imgs
    return data

def collect_non_plant_images(split_dir):
    folder = os.path.join(split_dir, 'non_plants')
    if not os.path.exists(folder):
        return []
    imgs = []
    for root, _, files in os.walk(folder):
        imgs += [os.path.join(root, f) for f in files
                 if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
    return imgs

# ---------------------------------------------------------------------------
# Model builder
# ---------------------------------------------------------------------------
def build_model(num_classes):
    base = tf.keras.applications.MobileNetV2(
        weights='imagenet', include_top=False, input_shape=(128, 128, 3)
    )
    base.trainable = False
    x = base.output
    x = tf.keras.layers.GlobalAveragePooling2D()(x)
    x = tf.keras.layers.Dense(128, activation='relu')(x)
    x = tf.keras.layers.Dropout(0.3)(x)
    out = tf.keras.layers.Dense(num_classes, activation='softmax')(x)
    model = tf.keras.Model(inputs=base.input, outputs=out)
    model.compile(
        optimizer=tf.keras.optimizers.Adam(1e-4),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    return model

# ---------------------------------------------------------------------------
# Metrics & plot
# ---------------------------------------------------------------------------
def plot_and_save_metrics(history, cm, class_names, task_name):
    fig, axes = plt.subplots(1, 2, figsize=(18, 7))

    # -- Loss / Accuracy curve --
    ax = axes[0]
    ax.plot(history.history['loss'],         label='Train Loss',  color='#1f77b4', lw=2)
    ax.plot(history.history['val_loss'],     label='Val Loss',    color='#ff7f0e', lw=2)
    ax.plot(history.history['accuracy'],     label='Train Acc',   color='#2ca02c', lw=2, ls='--')
    ax.plot(history.history['val_accuracy'], label='Val Acc',     color='#d62728', lw=2, ls='--')
    ax.set_title(f'{task_name.upper()} — Training Metrics', fontsize=14)
    ax.set_xlabel('Epoch'); ax.set_ylabel('Value')
    ax.grid(True, linestyle='--', alpha=0.6)
    ax.legend()

    # -- Confusion Matrix --
    ax = axes[1]
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
                xticklabels=class_names, yticklabels=class_names,
                cbar=False, ax=ax)
    ax.set_title(f'{task_name.upper()} — Confusion Matrix', fontsize=14)
    ax.set_xlabel('Predicted'); ax.set_ylabel('True')
    plt.xticks(rotation=45, ha='right'); plt.yticks(rotation=0)

    plt.tight_layout()
    save_path = os.path.join(BASE_DIR, f'training_metrics_{task_name}.png')
    plt.savefig(save_path, dpi=150, bbox_inches='tight')
    plt.close()
    print(f"   📊 Report saved → {save_path}")

# ---------------------------------------------------------------------------
# Generic training function for a task
# ---------------------------------------------------------------------------
def train_model(task_name, train_class_dirs, test_class_dirs, output_filename):
    """
    train_class_dirs / test_class_dirs: dict { label: directory_path }
    Both dicts must have the same keys (one dir per class).
    This uses a custom ImageDataGenerator.flow_from_dataframe approach
    so we can merge and rename folders on-the-fly without copying files.
    """
    print("\n" + "="*60)
    print(f"  🚀  TRAINING: {task_name.upper()}")
    print("="*60)

    class_names = sorted(train_class_dirs.keys())
    num_classes  = len(class_names)
    print(f"  Classes ({num_classes}): {class_names}")

    # We pass each class directory to flow_from_directory via a flat structure
    # built in-memory using symbolic paths (no file copies needed).
    # Strategy: write a small CSV dataframe for flow_from_dataframe.
    import pandas as pd

    def build_df(class_dir_map):
        rows = []
        for label, dirpath in class_dir_map.items():
            if not os.path.exists(dirpath):
                continue
            for fname in os.listdir(dirpath):
                if fname.lower().endswith(('.jpg', '.jpeg', '.png')):
                    rows.append({'filepath': os.path.join(dirpath, fname),
                                 'label':    str(label)})
        return pd.DataFrame(rows)

    train_df = build_df(train_class_dirs)
    test_df  = build_df(test_class_dirs)

    if train_df.empty or test_df.empty:
        print(f"  ⚠️  Skipping {task_name}: empty train or test data.")
        return

    print(f"  Train samples: {len(train_df)} | Test samples: {len(test_df)}")

    datagen = ImageDataGenerator(rescale=1./255)

    train_gen = datagen.flow_from_dataframe(
        train_df, x_col='filepath', y_col='label',
        target_size=IMG_SIZE, batch_size=BATCH_SIZE,
        class_mode='categorical', classes=class_names, shuffle=True
    )
    test_gen = datagen.flow_from_dataframe(
        test_df, x_col='filepath', y_col='label',
        target_size=IMG_SIZE, batch_size=BATCH_SIZE,
        class_mode='categorical', classes=class_names, shuffle=False
    )

    model   = build_model(num_classes)
    history = model.fit(train_gen, epochs=EPOCHS, validation_data=test_gen, verbose=1)

    # Save model
    model_path = os.path.join(MODELS_DIR, output_filename)
    model.save(model_path)
    print(f"\n  💾 Model saved → {model_path}")

    # Evaluate
    print(f"\n  📈 EVALUATION — {task_name.upper()}")
    test_gen.reset()
    y_true       = test_gen.classes
    y_pred_probs = model.predict(test_gen, verbose=0)
    y_pred       = np.argmax(y_pred_probs, axis=1)

    print("\n  Classification Report:")
    print(classification_report(y_true, y_pred, target_names=class_names, zero_division=0))

    cm = confusion_matrix(y_true, y_pred)
    plot_and_save_metrics(history, cm, class_names, task_name)

# ---------------------------------------------------------------------------
# Build the per-task directory maps from the pre-split dataset
# ---------------------------------------------------------------------------
def build_especies_dirs(split_dir):
    """Returns { 'slug_health': dir_path }"""
    dirs = {}
    if not os.path.exists(split_dir): return dirs
    for species_folder in os.listdir(split_dir):
        if species_folder.lower() not in SPECIES_MAP: continue
        species_path = os.path.join(split_dir, species_folder)
        mapped = SPECIES_MAP[species_folder.lower()]
        for health_folder in os.listdir(species_path):
            health_path = os.path.join(species_path, health_folder)
            if os.path.isdir(health_path):
                dirs[f"{mapped}_{health_folder}"] = health_path
    return dirs

def build_formas_dirs(split_dir):
    """
    Returns { shape_label: merged_dir } — since multiple species can share
    the same shape we create temporary merged views via a dataframe approach,
    so we just return a dict { shape: [list_of_dirs] } here and handle it
    in the train function.
    """
    dirs = {}  # { shape: [path1, path2, ...] }
    if not os.path.exists(split_dir): return dirs
    for species_folder in os.listdir(split_dir):
        if species_folder.lower() not in SPECIES_MAP: continue
        shape = SPECIES_SHAPES_MAP.get(species_folder.lower())
        if not shape: continue
        species_path = os.path.join(split_dir, species_folder)
        for health_folder in os.listdir(species_path):
            health_path = os.path.join(species_path, health_folder)
            if os.path.isdir(health_path):
                dirs.setdefault(shape, []).append(health_path)
    return dirs

def build_plantas_dirs(split_dir):
    """Returns { 'True': [plant_dirs...], 'False': [non_plant_dirs...] }"""
    plant_dirs     = []
    non_plant_dirs = []
    if not os.path.exists(split_dir): return {'True': plant_dirs, 'False': non_plant_dirs}

    for species_folder in os.listdir(split_dir):
        species_path = os.path.join(split_dir, species_folder)
        if not os.path.isdir(species_path): continue
        if species_folder.lower() == 'non_plants':
            non_plant_dirs.append(species_path)
        elif species_folder.lower() in SPECIES_MAP:
            for health_folder in os.listdir(species_path):
                health_path = os.path.join(species_path, health_folder)
                if os.path.isdir(health_path):
                    plant_dirs.append(health_path)

    return {'True': plant_dirs, 'False': non_plant_dirs}

# ---------------------------------------------------------------------------
# Specialised trainer for formas/plantas that need multi-dir classes
# ---------------------------------------------------------------------------
def train_model_multi_dir(task_name, train_class_dirs_list, test_class_dirs_list, output_filename):
    """
    train_class_dirs_list / test_class_dirs_list:
        dict { label: [list_of_directories] }
    """
    import pandas as pd

    print("\n" + "="*60)
    print(f"  🚀  TRAINING: {task_name.upper()}")
    print("="*60)

    class_names = sorted(train_class_dirs_list.keys())
    num_classes  = len(class_names)
    print(f"  Classes ({num_classes}): {class_names}")

    def build_df(class_dir_map):
        rows = []
        for label, dir_list in class_dir_map.items():
            for dirpath in dir_list:
                if not os.path.exists(dirpath): continue
                for fname in os.listdir(dirpath):
                    if fname.lower().endswith(('.jpg', '.jpeg', '.png')):
                        rows.append({'filepath': os.path.join(dirpath, fname),
                                     'label':    str(label)})
        return pd.DataFrame(rows)

    train_df = build_df(train_class_dirs_list)
    test_df  = build_df(test_class_dirs_list)

    if train_df.empty or test_df.empty:
        print(f"  ⚠️  Skipping {task_name}: empty train or test data.")
        return

    print(f"  Train samples: {len(train_df)} | Test samples: {len(test_df)}")

    datagen = ImageDataGenerator(rescale=1./255)

    train_gen = datagen.flow_from_dataframe(
        train_df, x_col='filepath', y_col='label',
        target_size=IMG_SIZE, batch_size=BATCH_SIZE,
        class_mode='categorical', classes=class_names, shuffle=True
    )
    test_gen = datagen.flow_from_dataframe(
        test_df, x_col='filepath', y_col='label',
        target_size=IMG_SIZE, batch_size=BATCH_SIZE,
        class_mode='categorical', classes=class_names, shuffle=False
    )

    model   = build_model(num_classes)
    history = model.fit(train_gen, epochs=EPOCHS, validation_data=test_gen, verbose=1)

    model_path = os.path.join(MODELS_DIR, output_filename)
    model.save(model_path)
    print(f"\n  💾 Model saved → {model_path}")

    print(f"\n  📈 EVALUATION — {task_name.upper()}")
    test_gen.reset()
    y_true       = test_gen.classes
    y_pred_probs = model.predict(test_gen, verbose=0)
    y_pred       = np.argmax(y_pred_probs, axis=1)

    print("\n  Classification Report:")
    print(classification_report(y_true, y_pred, target_names=class_names, zero_division=0))

    cm = confusion_matrix(y_true, y_pred)
    plot_and_save_metrics(history, cm, class_names, task_name)

# ---------------------------------------------------------------------------
# MAIN
# ---------------------------------------------------------------------------
def main():
    print("="*60)
    print("🌿  LEAF CLASSIFIER — FULL MULTI-MODEL TRAINING  🌿")
    print("="*60)
    print(f"   Dataset : {DATASET_DIR}")
    print(f"   Train   : {TRAIN_DIR}")
    print(f"   Test    : {TEST_DIR}")
    print(f"   Models  : {MODELS_DIR}\n")

    if not os.path.exists(TRAIN_DIR) or not os.path.exists(TEST_DIR):
        raise FileNotFoundError(
            f"Expected pre-split directories:\n  {TRAIN_DIR}\n  {TEST_DIR}\n"
            "Make sure your dataset is placed at classifier/plant-leaf-dataset/"
        )

    # ── Model 1: Especies ──────────────────────────────────────────────────
    train_especies = build_especies_dirs(TRAIN_DIR)
    test_especies  = build_especies_dirs(TEST_DIR)
    if train_especies and test_especies:
        train_model('especies', train_especies, test_especies, 'modelo_especies.h5')
    else:
        print("⚠️  Skipping 'especies': no species folders found.")

    # ── Model 2: Formas (Hojas) ────────────────────────────────────────────
    train_formas = build_formas_dirs(TRAIN_DIR)
    test_formas  = build_formas_dirs(TEST_DIR)
    if train_formas and test_formas:
        train_model_multi_dir('hojas', train_formas, test_formas, 'modelo_hojas.h5')
    else:
        print("⚠️  Skipping 'hojas': no shape folders found.")

    # ── Model 3: Plantas (plant vs non-plant) ─────────────────────────────
    train_plantas = build_plantas_dirs(TRAIN_DIR)
    test_plantas  = build_plantas_dirs(TEST_DIR)
    if train_plantas['True'] and train_plantas['False']:
        train_model_multi_dir('plantas', train_plantas, test_plantas, 'modelo_plantas.h5')
    else:
        print("⚠️  Skipping 'plantas': plant or non_plant images missing.")

    print("\n✅  All done! Check the 'models/' directory for .h5 files.")
    print("    Check the root directory for training_metrics_*.png reports.\n")

if __name__ == '__main__':
    main()
