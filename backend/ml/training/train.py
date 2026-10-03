import os
import csv
import json
import pickle
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, accuracy_score, precision_score, recall_score, f1_score
from backend.ml.dataset.generator import generate_dataset, CATEGORIES

def train_and_evaluate(dataset_path: Path, model_save_path: Path, metrics_save_path: Path):
    if not dataset_path.exists():
        print("Dataset not found, generating 2,500 samples...")
        generate_dataset(dataset_path, count=2500)
    
    texts = []
    labels = []
    with open(dataset_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            full_text = f"{row.get('title', '')} {row.get('content', '')}"
            texts.append(full_text)
            labels.append(row["category"])

    X_train, X_test, y_train, y_test = train_test_split(
        texts, labels, test_size=0.2, random_state=42, stratify=labels
    )

    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(
            ngram_range=(1, 2),
            max_features=5000,
            sublinear_tf=True,
            stop_words="english"
        )),
        ("clf", LogisticRegression(
            C=2.0,
            max_iter=1000,
            random_state=42
        ))
    ])

    print("Training TF-IDF + Logistic Regression Classifier...")
    pipeline.fit(X_train, y_train)

    y_pred = pipeline.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred, average="macro", zero_division=0)
    recall = recall_score(y_test, y_pred, average="macro", zero_division=0)
    f1 = f1_score(y_test, y_pred, average="macro", zero_division=0)

    print(f"Accuracy: {accuracy * 100:.2f}%")
    print(f"Macro Precision: {precision * 100:.2f}%")
    print(f"Macro Recall: {recall * 100:.2f}%")
    print(f"Macro F1-Score: {f1 * 100:.2f}%")

    model_save_path.parent.mkdir(parents=True, exist_ok=True)
    with open(model_save_path, "wb") as f:
        pickle.dump(pipeline, f)
    print(f"Saved trained model to {model_save_path}")

    metrics = {
        "accuracy": round(float(accuracy), 4),
        "precision_macro": round(float(precision), 4),
        "recall_macro": round(float(recall), 4),
        "f1_macro": round(float(f1), 4),
        "num_classes": len(CATEGORIES),
        "categories": CATEGORIES,
        "sample_count": len(texts)
    }
    with open(metrics_save_path, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)
    print(f"Saved evaluation metrics to {metrics_save_path}")

    return pipeline, metrics

if __name__ == "__main__":
    base = Path(__file__).resolve().parent.parent
    ds = base / "dataset" / "notices.csv"
    mod = base / "models" / "notice_classifier.pkl"
    met = base / "models" / "model_metrics.json"
    train_and_evaluate(ds, mod, met)
