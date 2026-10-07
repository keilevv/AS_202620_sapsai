# %% [markdown]
# # Leaf Classifier - Kaggle Training Notebook
# This script is designed to be executed directly in a Kaggle Environment.
# It assumes the dataset has been uploaded and is available in `/kaggle/input/`.
# Models and visual metrics will be saved to `/kaggle/working/` so they can be downloaded or used as outputs.

# %% [code]
import os
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import matplotlib
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import classification_report, confusion_matrix
import pandas as pd
import PIL

# Disable DecompressionBombError for large images
PIL.Image.MAX_IMAGE_PIXELS = None

# %% [code]
# ---------------------------------------------------------------------------
# Kaggle Paths Setup
# ---------------------------------------------------------------------------
# Replace 'plant-leaf-dataset' with the exact name of your dataset as uploaded to Kaggle
DATASET_NAME = 'plant-leaf-dataset'
DATASET_DIR = f'/kaggle/input/{DATASET_NAME}'

TRAIN_DIR   = os.path.join(DATASET_DIR, 'train')
TEST_DIR    = os.path.join(DATASET_DIR, 'test')

# /kaggle/working is the persistent output directory where saved models and plots will go
OUTPUT_DIR  = '/kaggle/working'
MODELS_DIR  = os.path.join(OUTPUT_DIR, 'models')
os.makedirs(MODELS_DIR, exist_ok=True)

print(f"Input Dataset Path: {DATASET_DIR}")
print(f"Output Models Path: {MODELS_DIR}")

# %% [code]
# ---------------------------------------------------------------------------
# Config maps
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
EPOCHS     = 10

# %% [code]
# ---------------------------------------------------------------------------
# Data Builders (DataFrame Mappers)
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
    """Returns { shape_label: [list_of_dirs] }"""
    dirs = {}  
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

# %% [code]
# ---------------------------------------------------------------------------
# Training Logic
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

def plot_and_save_metrics(history, cm, class_names, task_name):
    fig, axes = plt.subplots(1, 2, figsize=(18, 7))

    ax = axes[0]
    ax.plot(history.history['loss'],         label='Train Loss',  color='#1f77b4', lw=2)
    ax.plot(history.history['val_loss'],     label='Val Loss',    color='#ff7f0e', lw=2)
    ax.plot(history.history['accuracy'],     label='Train Acc',   color='#2ca02c', lw=2, ls='--')
    ax.plot(history.history['val_accuracy'], label='Val Acc',     color='#d62728', lw=2, ls='--')
    ax.set_title(f'{task_name.upper()} — Training Metrics', fontsize=14)
    ax.set_xlabel('Epoch'); ax.set_ylabel('Value')
    ax.grid(True, linestyle='--', alpha=0.6)
    ax.legend()

    ax = axes[1]
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
                xticklabels=class_names, yticklabels=class_names, cbar=False, ax=ax)
    ax.set_title(f'{task_name.upper()} — Confusion Matrix', fontsize=14)
    ax.set_xlabel('Predicted'); ax.set_ylabel('True')
    plt.xticks(rotation=45, ha='right'); plt.yticks(rotation=0)

    plt.tight_layout()
    # Save into /kaggle/working so you can access the file easily
    save_path = os.path.join(OUTPUT_DIR, f'training_metrics_{task_name}.png')
    plt.savefig(save_path, dpi=150, bbox_inches='tight')
    plt.show()  # Display inline in notebook
    plt.close()
    print(f"   📊 Report saved → {save_path}")

def build_df(class_dir_map):
    rows = []
    for label, dir_data in class_dir_map.items():
        # Handle both single dir (str) and list of dirs (list)
        dir_list = [dir_data] if isinstance(dir_data, str) else dir_data
        for dirpath in dir_list:
            if not os.path.exists(dirpath): continue
            for fname in os.listdir(dirpath):
                if fname.lower().endswith(('.jpg', '.jpeg', '.png')):
                    rows.append({'filepath': os.path.join(dirpath, fname), 'label': str(label)})
    return pd.DataFrame(rows)

def train_model(task_name, train_dirs, test_dirs, output_filename):
    print("\n" + "="*60)
    print(f"  🚀  TRAINING: {task_name.upper()}")
    print("="*60)

    train_df = build_df(train_dirs)
    test_df  = build_df(test_dirs)

    if train_df.empty or test_df.empty:
        print(f"  ⚠️  Skipping {task_name}: empty train or test data.")
        return

    class_names = sorted(train_df['label'].unique())
    num_classes  = len(class_names)
    print(f"  Classes ({num_classes}): {class_names}")
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

    # Save model in /kaggle/working/models/
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


# %% [code]
# ---------------------------------------------------------------------------
# MAIN EXECUTION
# ---------------------------------------------------------------------------
print("="*60)
print("🌿  LEAF CLASSIFIER — KAGGLE TRAINING ENVIRONMENT  🌿")
print("="*60)

if not os.path.exists(TRAIN_DIR) or not os.path.exists(TEST_DIR):
    print("⚠️  Dataset directories not found. Ensure DATASET_NAME is correct and data is uploaded.")
else:
    # ── Model 1: Especies ──────────────────────────────────────────────────
    train_especies = build_especies_dirs(TRAIN_DIR)
    test_especies  = build_especies_dirs(TEST_DIR)
    if train_especies and test_especies:
        train_model('especies', train_especies, test_especies, 'modelo_especies.h5')

    # ── Model 2: Formas (Hojas) ────────────────────────────────────────────
    train_formas = build_formas_dirs(TRAIN_DIR)
    test_formas  = build_formas_dirs(TEST_DIR)
    if train_formas and test_formas:
        train_model('hojas', train_formas, test_formas, 'modelo_hojas.h5')

    # ── Model 3: Plantas (plant vs non-plant) ─────────────────────────────
    train_plantas = build_plantas_dirs(TRAIN_DIR)
    test_plantas  = build_plantas_dirs(TEST_DIR)
    if train_plantas.get('True') and train_plantas.get('False'):
        train_model('plantas', train_plantas, test_plantas, 'modelo_plantas.h5')

    print("\n✅  All tasks complete. Outputs saved to `/kaggle/working/`.")
