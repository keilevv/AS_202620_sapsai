import os
import shutil

SPECIES_MAP = {
    'yam':     'discorea-alata-l',
    'eggplant':'solanum-melongena',
    'cucumber':'cucumis-sativus',
    'corn':    'zea-mays',
    'cassava': 'manihot-esculenta',
}

def migrate_initial_dataset(data_dir, model_name):
    """
    Migrates the Kaggle dataset structure (DATA_DIR/train/species/health)
    into the format expected by retrain.py (DATA_DIR/<model_name>/train/<species_slug>_<health>)
    """
    if model_name != "especies":
        return
        
    initial_train_dir = os.path.join(data_dir, "train")
    if not os.path.exists(initial_train_dir):
        return
        
    target_train_dir = os.path.join(data_dir, model_name, "train")
    os.makedirs(target_train_dir, exist_ok=True)
    
    for species_folder in os.listdir(initial_train_dir):
        if species_folder.lower() not in SPECIES_MAP:
            continue
            
        species_path = os.path.join(initial_train_dir, species_folder)
        if not os.path.isdir(species_path):
            continue
            
        mapped_species = SPECIES_MAP[species_folder.lower()]
        
        for health_folder in os.listdir(species_path):
            health_path = os.path.join(species_path, health_folder)
            if not os.path.isdir(health_path):
                continue
                
            # e.g., 'solanum-melongena_healthy'
            target_class_dir = os.path.join(target_train_dir, f"{mapped_species}_{health_folder}")
            os.makedirs(target_class_dir, exist_ok=True)
            
            # Copy images
            for img_name in os.listdir(health_path):
                if img_name.lower().endswith(('.png', '.jpg', '.jpeg')):
                    src_img = os.path.join(health_path, img_name)
                    dst_img = os.path.join(target_class_dir, img_name)
                    if not os.path.exists(dst_img):
                        shutil.copy2(src_img, dst_img)
