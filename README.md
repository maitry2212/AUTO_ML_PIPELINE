# Auto ML Pipeline

A one-click machine learning pipeline using FastAPI, Scikit-learn, MLflow, and Docker.

## Features
- **FastAPI Endpoint**: Upload CSV data and trigger training via `/upload`.
- **MLflow Integration**: Track experiments, parameters, and metrics automatically.
- **Dockerized**: Containerized application for consistent deployment.
- **CI/CD**: GitHub Actions pipeline for automated builds and testing.

## Project Structure
- `app/`: FastAPI application.
- `src/`: Training and prediction logic.
- `data/`: Local storage for uploaded datasets.
- `models/`: Storage for trained model files.

## Installation
1. Clone the repository.
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   .\venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Usage
### Running Locally
Run the FastAPI server:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### MLflow UI
To view experiment logs:
```bash
mlflow ui
```

### Docker
Build and run the container:
```bash
docker build -t oneclick-ml .
docker run -p 8000:8000 oneclick-ml
```

## License
MIT
