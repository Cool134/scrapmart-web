import os
import requests
from duckduckgo_search import DDGS
from PIL import Image
from io import BytesIO

categories = {
    'copper': 'copper metal scrap',
    'aluminum': 'aluminum metal scrap',
    'brass': 'brass metal scrap',
    'steel': 'steel metal scrap',
    'iron': 'iron metal scrap'
}

DATA_DIR = "dataset"
MAX_IMAGES = 20

def verify_image(file_path):
    try:
        img = Image.open(file_path)
        img.verify()
        return True
    except:
        return False

def scrape():
    os.makedirs(DATA_DIR, exist_ok=True)
    
    with DDGS() as ddgs:
        for cat_name, query in categories.items():
            print(f"Scraping images for {cat_name}...")
            cat_dir = os.path.join(DATA_DIR, cat_name)
            os.makedirs(cat_dir, exist_ok=True)
            
            try:
                results = list(ddgs.images(query, max_results=MAX_IMAGES))
                count = 0
                for i, result in enumerate(results):
                    if count >= MAX_IMAGES: break
                    url = result.get('image')
                    if not url: continue
                    
                    try:
                        resp = requests.get(url, timeout=5)
                        if resp.status_code == 200:
                            file_path = os.path.join(cat_dir, f"{count}.jpg")
                            with open(file_path, "wb") as f:
                                f.write(resp.content)
                            
                            if verify_image(file_path):
                                count += 1
                                print(f"Saved {cat_name}/{count}.jpg")
                            else:
                                os.remove(file_path)
                    except Exception as e:
                        pass
            except Exception as e:
                print(f"Error scraping {cat_name}: {e}")

if __name__ == "__main__":
    scrape()
