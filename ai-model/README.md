# Metal Scrap Classification

1. **Setup**: The environment is isolated in `venv`.
2. **Scraping**: `scrape_images.py` searches images, but because DDG gets rate limited easily, `mock_data.py` fills the blanks so training can proceed immediately.
3. **Training**: PyTorch was too huge for the current disk space (< 1GB available), so I replaced the deep learning stack with a lightweight scikit-learn model that uses image color histograms via `RandomForestClassifier`. Run `train.py` to train it and generate `metal_classifier.pkl`.
4. **Inference**: Run `app.py` (or `uvicorn app:app --port 8080`) to start the FastAPI server on port 8080. It has a `/predict` endpoint that takes an image upload and returns `{ "prediction": "copper", "confidence": 0.92 }`.
