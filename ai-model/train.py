import os
import pickle
import numpy as np
from PIL import Image
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

def extract_features(img_path):
    try:
        img = Image.open(img_path).convert('RGB')
        img = img.resize((64, 64))
        # Use color histograms as features
        features = np.array(img).flatten()
        return features
    except Exception as e:
        return None

def train_model():
    data_dir = 'dataset'
    if not os.path.exists(data_dir):
        print(f"Dataset directory '{data_dir}' not found. Run scrape_images.py first.")
        return

    classes = [d for d in os.listdir(data_dir) if os.path.isdir(os.path.join(data_dir, d))]
    X = []
    y = []

    print(f"Classes found: {classes}")

    for label, cls in enumerate(classes):
        cls_dir = os.path.join(data_dir, cls)
        for img_name in os.listdir(cls_dir):
            img_path = os.path.join(cls_dir, img_name)
            features = extract_features(img_path)
            if features is not None:
                X.append(features)
                y.append(label)

    X = np.array(X)
    y = np.array(y)

    print(f"Extracted features from {len(X)} images.")
    if len(X) == 0:
        print("No images found.")
        return

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = RandomForestClassifier(n_estimators=100, random_state=42)
    print("Training Random Forest model...")
    model.fit(X_train, y_train)

    score = model.score(X_test, y_test)
    print(f"Validation Accuracy: {score:.4f}")

    with open('classes.txt', 'w') as f:
        f.write('\n'.join(classes))
    
    with open('metal_classifier.pkl', 'wb') as f:
        pickle.dump(model, f)
    print("Model saved to metal_classifier.pkl")

if __name__ == '__main__':
    train_model()
