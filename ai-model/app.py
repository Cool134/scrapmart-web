import io
import pickle
import numpy as np
from PIL import Image
from fastapi import FastAPI, UploadFile, File

app = FastAPI()

class_names = []
try:
    with open('classes.txt', 'r') as f:
        class_names = [line.strip() for line in f.readlines()]
except Exception as e:
    class_names = ['aluminum', 'brass', 'copper', 'iron', 'steel']

model = None
try:
    with open('metal_classifier.pkl', 'rb') as f:
        model = pickle.load(f)
    print("Model loaded successfully")
except Exception as e:
    print(f"Error loading model: {e}. Ensure it's trained first.")

def extract_features(img_bytes):
    try:
        img = Image.open(io.BytesIO(img_bytes)).convert('RGB')
        img = img.resize((64, 64))
        return np.array(img).flatten()
    except Exception as e:
        return None

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if model is None:
        return {"error": "Model not loaded."}
    
    contents = await file.read()
    features = extract_features(contents)
    
    if features is None:
        return {"error": "Invalid image format."}

    prediction = model.predict([features])[0]
    probabilities = model.predict_proba([features])[0]
    confidence = probabilities[prediction]
    
    return {"prediction": class_names[prediction], "confidence": float(confidence)}

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
