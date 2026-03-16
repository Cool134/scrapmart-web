import os
import numpy as np
from PIL import Image

DATA_DIR = "dataset"
categories = ['aluminum', 'brass', 'copper', 'iron', 'steel']

os.makedirs(DATA_DIR, exist_ok=True)

for cat in categories:
    cat_dir = os.path.join(DATA_DIR, cat)
    os.makedirs(cat_dir, exist_ok=True)
    
    # Check if we already have some images (like copper)
    existing = len(os.listdir(cat_dir))
    
    # Generate random images up to 20
    for i in range(existing + 1, 21):
        # Create a random noise image (64x64)
        noise = np.random.randint(0, 256, (64, 64, 3), dtype=np.uint8)
        img = Image.fromarray(noise)
        img.save(os.path.join(cat_dir, f"{i}.jpg"))
        print(f"Generated {cat}/{i}.jpg")
