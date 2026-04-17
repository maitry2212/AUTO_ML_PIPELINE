# 📘 One-Click ML Pipeline — Complete Interview Guide

---

## 🏗️ PROJECT OVERVIEW

### What Is This Project?
A **full-stack AutoML platform** that lets a user:
1. Upload a CSV dataset
2. Automatically analyze it (EDA)
3. Pick a machine learning model
4. Train it with MLflow tracking
5. View a final report

```
[User Browser]
     ↓  uploads CSV, picks task & target
[React Frontend (Vite + TailwindCSS)]
     ↓  HTTP calls via Axios
[FastAPI Backend (Python)]
     ↓  processes data
[Pandas / Scikit-learn / XGBoost / MLflow]
     ↓  saves results
[Local Filesystem Storage (storage/projects/)]
     ↓  experiment logs
[MLflow Tracking Server (mlflow.db)]
```

---

## 🗂️ FILE MAP

```
one-click-ml-pipeline/
├── app/
│   └── main.py              ← FastAPI entry point — all API routes live here
├── src/
│   ├── config.py            ← Central settings & directory paths
│   ├── data_loader.py       ← Load/save CSV files
│   ├── validator.py         ← Validate uploaded datasets
│   ├── eda_engine.py        ← Generate EDA charts (Plotly)
│   ├── model_suggester.py   ← Suggest models based on task type
│   ├── model_selector.py    ← Return actual ML model objects
│   ├── preprocessor.py      ← Scale numbers, encode categories
│   ├── trainer.py           ← Train model + log to MLflow
│   ├── registry.py          ← Promote model to Production in MLflow
│   ├── predictor.py         ← Load model and make predictions
│   ├── storage_manager.py   ← Save/load project files on disk
│   └── history_manager.py   ← Track all projects in index.json
├── pipelines/
│   ├── validation_stage.py
│   ├── preprocessing_stage.py
│   ├── eda_stage.py
│   └── training_stage.py    ← DVC pipeline stages (CLI runners)
├── frontend/src/
│   ├── main.jsx             ← React entry point
│   ├── App.jsx              ← Router + layout wrapper
│   ├── context/PipelineContext.jsx  ← Global state
│   ├── services/api.js      ← All Axios API calls
│   ├── pages/
│   │   ├── LandingPage.jsx
│   │   ├── Dashboard.jsx    ← File upload page
│   │   ├── EDAPage.jsx
│   │   ├── TrainingPage.jsx
│   │   └── ReportPage.jsx
│   └── components/
│       ├── Navbar.jsx
│       ├── Sidebar.jsx      ← Project history panel
│       ├── FileUpload.jsx
│       └── Loader.jsx
├── dvc.yaml                 ← DVC pipeline definition
├── Dockerfile               ← Container instructions
├── requirements.txt         ← Python dependencies
└── .github/workflows/ci.yml ← GitHub CI/CD pipeline
```

---

## 📁 FILE 1: `src/config.py` — Settings & Paths

### Purpose
Single source of truth for all settings. Every other file imports from here. Think of it as the "headquarters address book."

### Big Picture
```
config.py → imported by ALL src/ files
         → tells them WHERE to save files
         → tells them WHAT the project is called
         → tells them WHERE MLflow is running
```

### Line-by-Line

```python
import os                          # Line 1: Access file system paths
from pydantic_settings import BaseSettings  # Line 2: Load typed settings (like a typed config class)

class Settings(BaseSettings):      # Line 4: Define a settings class
    PROJECT_NAME: str = "One-Click ML Pipeline"   # Line 5: Name shown in API welcome message
    API_V1_STR: str = "/api/v1"    # Line 6: API version prefix (not yet used in routes but good practice)

    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    # Line 9: __file__ = config.py path → dirname twice = project root folder
    # e.g. C:/Users/.../one-click-ml-pipeline

    DATA_DIR: str = os.path.join(BASE_DIR, "data")       # Line 10: Where raw CSVs go
    MODELS_DIR: str = os.path.join(BASE_DIR, "models")   # Line 11: Where trained models go
    ARTIFACTS_DIR: str = os.path.join(BASE_DIR, "artifacts") # Line 12: EDA reports etc
    STORAGE_DIR: str = os.path.join(BASE_DIR, "storage")     # Line 13: Project history root
    PROJECTS_DIR: str = os.path.join(STORAGE_DIR, "projects") # Line 14: Individual project folders

    MLFLOW_TRACKING_URI: str = "http://localhost:5000"   # Line 17: Where MLflow UI runs
    MLFLOW_EXPERIMENT_NAME: str = "One_Click_ML_Experiment" # Line 18: Experiment group name in MLflow

    DVC_PATH: str = os.path.join(BASE_DIR, "dvc.yaml")  # Line 21: Path to pipeline definition

    class Config:
        case_sensitive = True      # Line 24: ENV variable names are case-sensitive

settings = Settings()              # Line 26: Create ONE global instance — import this everywhere

for path in [settings.DATA_DIR, settings.MODELS_DIR, ...]:
    os.makedirs(path, exist_ok=True)  # Lines 29-30: Auto-create folders on startup if missing
```

### Interview Q&A
- **Why `BaseSettings`?** It allows reading from `.env` files automatically — great for secrets.
- **Why `os.path.abspath(__file__)`?** Makes the path absolute so it works from any working directory.
- **What if `exist_ok=False`?** It would crash if the folder already exists.

---

## 📁 FILE 2: `src/validator.py` — Data Quality Guard

### Purpose
A security checkpoint. Before doing ANY machine learning, we check the data is valid. Like airport security before a flight.

```
User uploads CSV
       ↓
DataValidator.validate_dataset()   → Is it empty? Duplicate columns?
       ↓
DataValidator.check_target_exists() → Does the target column exist?
       ↓
DataValidator.validate_task_alignment() → Does target TYPE match task?
       ↓
Proceed to EDA + Training
```

### Line-by-Line

```python
import pandas as pd               # Line 1: pandas for DataFrame operations
from typing import Tuple, List    # Line 2: Type hints — Tuple[bool, List[str]] = (True, [])

class DataValidator:              # Line 4: No __init__ needed — all methods are @staticmethod

    @staticmethod
    def validate_dataset(df: pd.DataFrame) -> Tuple[bool, List[str]]:
    # Line 6: Takes DataFrame, returns (is_valid, list_of_errors)
        errors = []               # Line 8: Start with empty error list
        if df.empty:              # Line 9: Is the DataFrame empty? (0 rows)
            errors.append("Dataset is empty.")  # Line 10: Record the error
        if df.columns.duplicated().any():       # Line 12: Any column name appears twice?
            errors.append("Dataset contains duplicate columns.")
        return len(errors) == 0, errors  # Line 15: True if no errors, else False + error list

    @staticmethod
    def check_target_exists(df, target: str) -> bool:
        return target in df.columns  # Line 20: Simple membership check — is column name in df?

    @staticmethod
    def validate_task_alignment(df, target, task_type):
        target_series = df[target].dropna()     # Line 25: Get target column, drop NaN values
        unique_count = target_series.nunique()  # Line 26: How many unique values?
        is_numeric = pd.api.types.is_numeric_dtype(target_series)  # Line 27: Are values numbers?

        if task_type == "classification":
            # Line 31: If target has > 20% unique numeric values AND > 50 uniques → probably Regression
            if is_numeric and unique_count > (len(df) * 0.2) and unique_count > 50:
                return False, f"... Did you mean Regression?"

        elif task_type == "regression":
            if not is_numeric:   # Line 35: Regression MUST have numeric target
                return False, "Regression requires numeric target values."

        return True, ""          # Line 41: No issues found
```

### Real-World Analogy
Like a **form validator on a website**. Before submitting, it checks: Is the field filled? Is the email format correct? Same idea — check data quality before wasting compute.

---

## 📁 FILE 3: `src/preprocessor.py` — Data Cleaner & Transformer

### Purpose
Raw data is messy — missing values, text labels, different scales. This file cleans and standardizes it so ML models can understand it.

```
Raw CSV Data
     ↓
Numbers → Fill missing with median → Scale to standard range (mean=0, std=1)
Text    → Fill missing with "missing" → One-Hot Encode (convert to 0/1 columns)
     ↓
Clean numeric array ready for ML model
```

### Line-by-Line

```python
from sklearn.compose import ColumnTransformer   # Line 2: Apply different transforms to different columns
from sklearn.pipeline import Pipeline           # Line 3: Chain steps together
from sklearn.preprocessing import StandardScaler, OneHotEncoder  # Line 4: Scaling + encoding tools
from sklearn.impute import SimpleImputer        # Line 5: Fill missing values
import joblib                                  # Line 6: Save/load Python objects to disk

class DataPreprocessor:
    def __init__(self):
        self.preprocessor = None   # Line 12: Will hold the built pipeline

    def build_pipeline(self, X: pd.DataFrame):
        numeric_features = X.select_dtypes(include=['int64', 'float64']).columns
        # Line 15: Automatically detect number columns

        categorical_features = X.select_dtypes(include=['object']).columns
        # Line 16: Automatically detect text/category columns

        numeric_transformer = Pipeline(steps=[
            ('imputer', SimpleImputer(strategy='median')),  # Fill NaN with column median
            ('scaler', StandardScaler())                    # Scale: (value - mean) / std
        ])
        # Lines 18-21: For numbers: fill gaps → normalize scale

        categorical_transformer = Pipeline(steps=[
            ('imputer', SimpleImputer(strategy='constant', fill_value='missing')),
            # Fill NaN text with literal string "missing"
            ('onehot', OneHotEncoder(handle_unknown='ignore'))
            # One-Hot: "cat" → [1,0,0], "dog" → [0,1,0], "bird" → [0,0,1]
        ])
        # Lines 23-26: handle_unknown='ignore' → unseen categories in test set become all-zeros

        self.preprocessor = ColumnTransformer(transformers=[
            ('num', numeric_transformer, numeric_features),
            ('cat', categorical_transformer, categorical_features)
        ])
        # Lines 28-33: Apply numeric transform to number cols, categorical transform to text cols

        return self.preprocessor

    def save(self, path: str):
        joblib.dump(self.preprocessor, path)  # Line 37: Serialize object to .joblib file

    @staticmethod
    def load(path: str):
        return joblib.load(path)  # Line 41: Deserialize from disk
```

### Interview Q&A
- **Why `StandardScaler`?** Models like Logistic Regression are sensitive to feature scale. StandardScaler makes all features comparable.
- **Why `OneHotEncoder`?** ML models need numbers, not strings like "cat" or "dog".
- **Why `handle_unknown='ignore'`?** Production data may have categories not seen during training. This prevents crashes.

---

## 📁 FILE 4: `src/model_selector.py` — Model Library

### Purpose
A menu of available ML models. Given a name string like `"random_forest_classifier"`, return the actual model object.

```
model_id string → ModelSelector.get_model() → Scikit-learn / XGBoost model object
```

### Line-by-Line

```python
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor, GradientBoostingRegressor
from xgboost import XGBClassifier

class ModelSelector:
    @staticmethod
    def get_model(model_id: str) -> Any:
        models = {
            # CLASSIFICATION models
            "logistic_regression": LogisticRegression(max_iter=1000),
            # max_iter=1000: default 100 often not enough → increase to ensure convergence

            "random_forest_classifier": RandomForestClassifier(n_estimators=100),
            # n_estimators=100: use 100 decision trees and vote on the answer

            "xgboost_classifier": XGBClassifier(use_label_encoder=False, eval_metric='logloss'),
            # use_label_encoder=False: suppress deprecation warning
            # eval_metric='logloss': use log-loss to evaluate during training

            # REGRESSION models
            "linear_regression": LinearRegression(),
            "random_forest_regressor": RandomForestRegressor(n_estimators=100),
            "gradient_boosting_regressor": GradientBoostingRegressor()
        }
        if model_id not in models:
            raise ValueError(f"Model ID '{model_id}' is not supported.")
        return models[model_id]
```

---

## 📁 FILE 5: `src/trainer.py` — The Training Engine (Core File)

### Purpose
The heart of the project. Takes data, preprocesses it, trains a model, logs everything to MLflow, and returns results.

```
Input: DataFrame + target column + task_type + model_id
    ↓
Split: 80% Train, 20% Test
    ↓
Build Pipeline: [Preprocessor → Model]
    ↓
Fit on Train data
    ↓
Predict on Test data
    ↓
Calculate Metrics (accuracy/f1 OR mse/r2)
    ↓
Log params + metrics + model to MLflow
    ↓
Output: {run_id, metrics, duration, model_uri}
```

### Line-by-Line

```python
from sklearn.model_selection import train_test_split  # Line 3: Split data into train/test
from sklearn.metrics import accuracy_score, f1_score, mean_squared_error, r2_score  # Line 4
from sklearn.pipeline import Pipeline                 # Line 5: Chain preprocessor + model
import mlflow                                        # Line 6: Experiment tracking
import mlflow.sklearn                                # Line 7: Log sklearn models specifically
import time                                          # Line 13: Measure training duration

class Trainer:
    def __init__(self, experiment_name: str = "One_Click_Experiment"):
        mlflow.set_tracking_uri(settings.MLFLOW_TRACKING_URI)  # Line 17: Tell MLflow WHERE to log
        mlflow.set_experiment(experiment_name)  # Line 18: Group runs under this experiment name

    def train(self, df, target, task_type, model_id):
        start_time = time.time()    # Line 21: Start the stopwatch

        X = df.drop(columns=[target])  # Line 22: Features = everything EXCEPT target
        y = df[target]                 # Line 23: Target = the column we want to predict

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        # Line 25: 80% train, 20% test. random_state=42 ensures same split every run (reproducible)

        preprocessor_obj = DataPreprocessor()
        preprocessor = preprocessor_obj.build_pipeline(X_train)  # Line 29: Fit on train data ONLY
        # IMPORTANT: Never fit preprocessor on test data → data leakage!

        model = ModelSelector.get_model(model_id)  # Line 32: Get model object by name

        full_pipeline = Pipeline(steps=[
            ('preprocessor', preprocessor),
            ('model', model)
        ])
        # Lines 35-38: One pipeline = preprocess + model together
        # Advantage: In production, just call pipeline.predict(raw_data) — no manual preprocessing

        with mlflow.start_run() as run:    # Line 40: Start an MLflow experiment run
            full_pipeline.fit(X_train, y_train)   # Line 42: TRAIN the model
            y_pred = full_pipeline.predict(X_test) # Line 45: PREDICT on unseen test data

            metrics = {}
            if task_type == "classification":
                metrics["accuracy"] = accuracy_score(y_test, y_pred)
                # accuracy = correct predictions / total predictions
                metrics["f1"] = f1_score(y_test, y_pred, average='weighted')
                # f1 = harmonic mean of precision and recall. 'weighted' handles class imbalance
            else:
                metrics["mse"] = mean_squared_error(y_test, y_pred)
                # mse = average of (actual - predicted)^2. Lower is better
                metrics["r2"] = r2_score(y_test, y_pred)
                # r2 = 1 means perfect. 0 means model = just predicting mean. <0 = worse than mean

            duration = time.time() - start_time   # Line 56: How long training took

            mlflow.log_params({"model_id": model_id, "task_type": task_type})  # Line 58: Log config
            mlflow.log_metrics(metrics)           # Line 59: Log performance scores
            mlflow.log_metric("duration", duration) # Line 60: Log training time

            model_info = mlflow.sklearn.log_model(
                sk_model=full_pipeline,
                artifact_path="model",
                registered_model_name=f"Model_{model_id}"
            )
            # Lines 63-67: Save the ENTIRE pipeline (preprocessor + model) to MLflow registry

            return {
                "run_id": run.info.run_id,
                "model_id": model_id,
                "metrics": metrics,
                "duration": duration,
                "model_uri": model_info.model_uri
            }
```

### Interview Q&A
- **Why log the full pipeline, not just the model?** So predictions later automatically apply the same preprocessing. No extra code needed.
- **Why `random_state=42`?** Ensures reproducible results. Same split every run.
- **What is MLflow?** An open-source tool that records every model training run: what parameters you used, what metrics you got, which model file was saved.

---

## 📁 FILE 6: `src/eda_engine.py` — Data Inspector

### Purpose
Exploratory Data Analysis — understand the data BEFORE training. Generates interactive Plotly charts and returns them as JSON.

```
DataFrame + target column
     ↓
Generate 4 plots:
  1. Missing values bar chart
  2. Correlation matrix heatmap
  3. Target column distribution
  4. Feature distributions (top 5)
     ↓
Save as eda_report.json
     ↓
Return file path
```

### Line-by-Line

```python
import plotly.express as px          # Line 2: High-level plotting (simple charts)
import plotly.graph_objects as go    # Line 3: Low-level plotting (custom charts)

class EDAEngine:
    @staticmethod
    def generate_eda_report(df, target) -> str:
        report = {}                  # Line 14: Dictionary to hold all chart JSONs

        # CHART 1: Missing Values
        null_counts = df.isnull().sum()   # Line 17: Count NaN per column
        fig_nulls = px.bar(x=null_counts.index, y=null_counts.values, title="Missing Values per Column")
        report["missing_values"] = json.loads(fig_nulls.to_json())
        # fig_nulls.to_json() → converts Plotly figure to JSON string
        # json.loads() → converts JSON string back to Python dict
        # This dict is sent to frontend where react-plotly.js renders it

        # CHART 2: Correlation Matrix
        numeric_df = df.select_dtypes(include=["number"])  # Only numeric columns
        corr_matrix = numeric_df.corr()
        # corr() computes pairwise correlation: 1=perfect positive, -1=perfect negative, 0=no relation
        fig_corr = px.imshow(corr_matrix, text_auto=True, title="Correlation Matrix")
        report["correlation_matrix"] = json.loads(fig_corr.to_json())

        # CHART 3: Target Distribution
        if df[target].nunique() < 20:
            fig_target = px.histogram(df, x=target)  # Categorical → histogram
        else:
            fig_target = px.box(df, y=target)        # Continuous → box plot

        # CHART 4: Feature Distributions (Top 5)
        features = [col for col in numeric_df.columns if col != target][:5]
        for feature in features:
            fig = px.histogram(df, x=feature)
            feature_plots[feature] = json.loads(fig.to_json())

        # Save JSON to disk
        report_path = os.path.join(settings.ARTIFACTS_DIR, "eda_report.json")
        with open(report_path, "w") as f:
            json.dump(report, f)

        return report_path  # FastAPI reads this file and returns its content to frontend
```

---

## 📁 FILE 7: `src/storage_manager.py` — File System Manager

### Purpose
Manages the local `storage/projects/` folder. Each ML run gets its own folder with a unique ID.

```
storage/
└── projects/
    ├── proj_a3f2d1b0/
    │   ├── raw_data.csv
    │   ├── eda.json
    │   └── results.json
    └── proj_b7e9c4d2/
        ├── raw_data.csv
        └── results.json
```

### Line-by-Line

```python
import uuid    # Line 4: Generate universally unique identifiers
import shutil  # Line 3: Delete directory trees (like rm -rf)

class StorageManager:
    @staticmethod
    def create_project_structure() -> str:
        project_id = f"proj_{uuid.uuid4().hex[:8]}"
        # uuid4() = random UUID. hex = hex string. [:8] = first 8 chars
        # Result: "proj_a3f2d1b0" — short, unique, readable

        project_path = os.path.join(settings.PROJECTS_DIR, project_id)
        os.makedirs(project_path, exist_ok=True)
        return project_id

    @classmethod
    def save_dataset(cls, project_id, df, filename="raw_data.csv"):
        path = os.path.join(cls.get_project_path(project_id), filename)
        df.to_csv(path, index=False)  # index=False: don't write row numbers as a column
        return path

    @classmethod
    def save_json(cls, project_id, data, filename):
        path = os.path.join(cls.get_project_path(project_id), filename)
        with open(path, 'w') as f:
            json.dump(data, f, indent=4)  # indent=4: pretty-print for readability

    @classmethod
    def load_json(cls, project_id, filename):
        path = os.path.join(cls.get_project_path(project_id), filename)
        if os.path.exists(path):           # Always check before opening — prevents crashes
            with open(path, 'r') as f:
                return json.load(f)
        return None                        # Return None if file doesn't exist

    @classmethod
    def delete_project(cls, project_id):
        path = cls.get_project_path(project_id)
        if os.path.exists(path):
            shutil.rmtree(path)  # Recursively delete folder and all contents
```

---

## 📁 FILE 8: `src/history_manager.py` — Project Index

### Purpose
Maintains `storage/index.json` — a master list of all past projects. Like a table of contents.

```
storage/
├── index.json   ← [{project_id, dataset_name, task_type, timestamp, score}, ...]
└── projects/
    └── proj_xxx/
```

### Key Methods

```python
INDEX_FILE = os.path.join(settings.STORAGE_DIR, "index.json")  # Single source of truth

def add_project(cls, project_id, metadata):
    index = cls._load_index()
    # Check if project already exists (for updating score after training)
    existing_idx = next((i for i, p in enumerate(index) if p['project_id'] == project_id), -1)

    project_entry = {"project_id": project_id, "timestamp": datetime.now().isoformat(), **metadata}
    # **metadata unpacks dict: {dataset_name: "iris.csv", task_type: "classification", ...}

    if existing_idx > -1:
        index[existing_idx] = project_entry  # UPDATE existing
    else:
        index.insert(0, project_entry)  # ADD to top (newest first, like ChatGPT history)

    cls._save_index(index)

def get_all_projects(cls):
    index = cls._load_index()
    # Filter stale entries — project may be deleted from disk but still in index
    valid_projects = [p for p in index if os.path.exists(
        os.path.join(settings.PROJECTS_DIR, p['project_id'])
    )]
    return valid_projects
```

---

## 📁 FILE 9: `app/main.py` — FastAPI Backend (API Routes)

### Purpose
The server. Exposes HTTP endpoints the frontend calls. Orchestrates all `src/` modules.

### All API Endpoints

```
GET  /                   → Health check: "Welcome to One-Click ML Pipeline API"
POST /upload             → Upload CSV, validate, create project, return project_id
GET  /eda                → Run EDA on current session DataFrame
GET  /model-suggestions  → Return suggested models based on task type
POST /train?model_id=X   → Train model X, log to MLflow, return metrics
POST /promote            → Promote model version to "Production" in MLflow
POST /predict            → Load Production model, predict on input dict
GET  /projects           → List all past project sessions
GET  /project/{id}       → Load a specific past project
DELETE /project/{id}     → Delete a project from disk and index
```

### Critical Design: In-Memory Session

```python
current_session = {
    "project_id": None,
    "df": None,          # ← The DataFrame lives in RAM while session is active
    "task_type": None,
    "target": None
}
```

Think of this like a shopping cart — it holds what you're working on right now. If the server restarts, the session is gone (but the files on disk are not).

### Upload Endpoint — Full Flow

```python
@app.post("/upload")
async def upload_dataset(file: UploadFile = File(...), task_type: str = Form(...), target_column: str = Form(...)):
    # File(...) = required file upload
    # Form(...) = required form field

    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")
    # HTTP 400 = Bad Request (client's fault)

    contents = await file.read()       # Async read → non-blocking
    df = pd.read_csv(io.BytesIO(contents))
    # io.BytesIO wraps raw bytes as a file-like object so pd.read_csv can read it

    is_valid, errors = DataValidator.validate_dataset(df)
    if not is_valid:
        raise HTTPException(status_code=400, detail={"errors": errors})

    project_id = StorageManager.create_project_structure()  # Create folder proj_xxxxxxxx
    StorageManager.save_dataset(project_id, df, "raw_data.csv")  # Save CSV to disk

    HistoryManager.add_project(project_id, {
        "dataset_name": file.filename,
        "task_type": task_type,
        "target": target_column,
        "score": None              # Score will be updated after training
    })

    current_session["project_id"] = project_id
    current_session["df"] = df    # Store DataFrame in RAM for fast access

    return {"message": "Dataset uploaded and validated successfully.", "project_id": project_id}
```

### CORS Middleware

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],     # Accept requests from ANY domain (development mode)
    allow_credentials=True,
    allow_methods=["*"],     # GET, POST, PUT, DELETE, etc.
    allow_headers=["*"],     # Accept any request headers
)
```
**Why needed?** Browser security blocks JavaScript from calling a different domain's server (CORS policy). This middleware tells the browser "it's OK, I allow it."

---

## 📁 FILE 10: `frontend/src/context/PipelineContext.jsx` — Global State

### Purpose
Shares data across ALL pages without passing props. Like a global whiteboard everyone can read and write.

```
PipelineProvider (wraps entire app)
     ↓ provides:
  pipelineState  → read current state
  updateState    → update state partially
  resetPipeline  → clear after run
  hydrateProject → restore old project from history
     ↓ consumed by any component:
  Dashboard → updateState({projectId, task, ...})
  EDAPage   → reads pipelineState.edaData
  Training  → reads pipelineState.suggestions
  Report    → reads pipelineState.trainingResults
```

### Line-by-Line

```jsx
const PipelineContext = createContext();  // Line 3: Create empty context container

export const PipelineProvider = ({ children }) => {
    const [pipelineState, setPipelineState] = useState({
        projectId: null,          // Current project's unique ID
        file: null,               // The File object (from browser)
        task: '',                 // "classification" or "regression"
        target: '',               // Target column name
        suggestions: [],          // Model suggestions from backend
        selectedModel: null,      // Which model user clicked
        edaData: null,            // EDA charts JSON
        trainingResults: null,    // Training metrics + run_id
        projects: [],             // All past projects (for sidebar)
    });

    const updateState = (newState) => {
        setPipelineState((prev) => ({ ...prev, ...newState }));
        // Spread operator: merge new values into existing state
        // e.g. updateState({edaData: {...}}) only updates edaData, keeps rest
    };

    const hydrateProject = (projectData) => {
        // Used when loading an old project from sidebar
        const { metadata, eda_data, training_results } = projectData;
        setPipelineState((prev) => ({
            ...prev,
            projectId: metadata.project_id,
            task: metadata.task_type,
            target: metadata.target,
            edaData: eda_data,
            trainingResults: training_results,
            selectedModel: training_results?.model_id || null,
            // ?. = optional chaining: safe access even if training_results is null
        }));
    };

    return (
        <PipelineContext.Provider value={{ pipelineState, updateState, resetPipeline, hydrateProject }}>
            {children}   {/* All child components get access to context */}
        </PipelineContext.Provider>
    );
};

export const usePipeline = () => {
    const context = useContext(PipelineContext);
    if (!context) throw new Error('usePipeline must be used within a PipelineProvider');
    // Guard against using hook outside PipelineProvider
    return context;
};
```

---

## 📁 FILE 11: `frontend/src/services/api.js` — HTTP Client

### Purpose
Central place for all API calls. Frontend components import from here — they never write raw HTTP calls directly.

```
Component → calls api.js function → Axios sends HTTP → FastAPI backend
                                  ← receives JSON response ←
```

### Line-by-Line

```javascript
import axios from 'axios';                    // Line 1: HTTP client library

const API_BASE_URL = 'http://localhost:8000'; // Line 3: Backend server address

const api = axios.create({ baseURL: API_BASE_URL });
// Line 5-7: Create configured Axios instance — all calls use this base URL

export const uploadDataset = async (file, taskType, targetColumn) => {
    const formData = new FormData();          // Browser-native multipart form object
    formData.append('file', file);            // Attach the CSV file
    formData.append('task_type', taskType);   // Attach task string
    formData.append('target_column', targetColumn);

    const response = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
        // Must set this header so backend knows it's a file upload, not JSON
    });
    return response.data;  // Return just the data part of the response
};

export const trainModel = async (modelId) => {
    const response = await api.post(`/train?model_id=${modelId}`);
    // Query parameter style: /train?model_id=random_forest_classifier
    return response.data;
};
```

---

## 📁 FILE 12: `frontend/src/App.jsx` — Layout & Router

### Purpose
The shell of the app. Sets up URL routing and wraps everything in the global context provider.

### Line-by-Line

```jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// BrowserRouter: uses history API for clean URLs (/dashboard, /eda)
// Routes: container for all Route definitions
// Navigate: redirect to another page

function App() {
  return (
    <PipelineProvider>         {/* Wrap everything: all pages share state */}
      <Router>
        <div className="h-screen bg-background text-white flex flex-col overflow-hidden">
          <Navbar />            {/* Always visible at top */}

          <div className="flex flex-1 pt-[100px] overflow-hidden">
            {/* pt-[100px]: push content below fixed navbar */}
            <Sidebar />         {/* Left panel: project history */}

            <main className="flex-1 overflow-y-auto">
              <Routes>
                <Route path="/"          element={<LandingPage />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/eda"       element={<EDAPage />} />
                <Route path="/train"     element={<TrainingPage />} />
                <Route path="/report"    element={<ReportPage />} />
                <Route path="*"          element={<Navigate to="/" />} />
                {/* path="*" catches any unknown URL and redirects to home */}
              </Routes>
              <Footer />
            </main>
          </div>

          {/* Decorative blurred gradient orbs in background */}
          <div className="fixed inset-0 pointer-events-none -z-20">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px]" />
          </div>
        </div>
      </Router>
    </PipelineProvider>
  );
}
```

---

## 📁 FILE 13: `frontend/src/pages/Dashboard.jsx` — Upload Page

### Purpose
The entry point of the ML workflow. User selects a CSV, enters a target column, picks a task type, and clicks "Start Pipeline."

### Key Flow

```
handleUpload called
     ↓
uploadDataset(file, taskType, targetColumn)  → POST /upload
     ↓
getModelSuggestions()                         → GET /model-suggestions
     ↓
getProjects()                                 → GET /projects
     ↓
updateState({projectId, task, target, suggestions, projects})
     ↓
navigate('/eda')                              → go to EDA page
```

---

## 📁 FILE 14: `frontend/src/pages/EDAPage.jsx` — Charts Page

### Purpose
Fetches and displays EDA charts (missing values, correlation matrix, target distribution).

### Key Pattern — `useEffect` for data fetching

```jsx
useEffect(() => {
    const fetchEDA = async () => {
        if (pipelineState.edaData) return;   // Don't re-fetch if data exists (caching)
        setLoading(true);
        const data = await getEDA();          // GET /eda
        updateState({ edaData: data });       // Store in global state
        setLoading(false);
    };
    fetchEDA();
}, []);  // [] = run ONCE on mount, not on every render
```

### Rendering Charts

```jsx
<Plot
    data={missing_values.data}          // Plotly trace data (bars, lines, etc.)
    layout={{
        ...missing_values.layout,       // Spread original layout
        paper_bgcolor: 'rgba(0,0,0,0)', // Transparent background
        plot_bgcolor: 'rgba(0,0,0,0)',  // Transparent chart area
        font: { color: '#fff' },        // White text for dark theme
    }}
    style={{ width: '100%', height: '350px' }}
    useResizeHandler={true}             // Responsive: chart resizes with window
/>
```

---

## 📁 FILE 15: `dvc.yaml` — Data Pipeline Definition

### Purpose
DVC (Data Version Control) defines a reproducible, step-by-step data pipeline. Like a Makefile for ML.

```yaml
stages:
  data_validation:          # Stage 1
    cmd: python pipelines/validation_stage.py   # What to run
    deps:                   # What it depends on (triggers re-run if changed)
      - data/raw_dataset.csv
      - src/validator.py
    outs:                   # What it produces
      - artifacts/val_status.txt

  preprocessing:            # Stage 2
    cmd: python pipelines/preprocessing_stage.py
    deps:
      - data/raw_dataset.csv
    outs:
      - models/preprocessor.joblib    # Saved preprocessor

  training:                 # Stage 4
    cmd: python pipelines/training_stage.py
    deps:
      - models/preprocessor.joblib   # Depends on preprocessing output
      - data/raw_dataset.csv
    outs:
      - models/latest_model.pkl
```

**Why DVC?** Regular `git` can't track large binary files (datasets, models). DVC tracks them separately while Git tracks the code. Perfect for ML projects.

---

## 📁 FILE 16: `Dockerfile` — Container Instructions

### Purpose
Package the entire app into a Docker container. "If it runs on my machine, it runs anywhere."

### Line-by-Line

```dockerfile
FROM python:3.10-slim            # Start with minimal Python image (~50MB vs ~900MB full)

ENV PYTHONUNBUFFERED=1           # Print logs immediately (don't buffer)
    PYTHONDONTWRITEBYTECODE=1    # Don't create .pyc cache files
    PORT=8000                    # Default port
    MLFLOW_TRACKING_URI=sqlite:///mlflow.db   # In container, use SQLite (not localhost:5000)

WORKDIR /app                     # All container commands run from /app

RUN apt-get update && apt-get install -y \
    build-essential \            # Compilers needed for some Python packages
    libgomp1 \                   # Required by XGBoost (OpenMP for parallel computing)
    && rm -rf /var/lib/apt/lists/*   # Clean up to reduce image size

COPY requirements.txt .          # Copy just requirements first (Docker layer caching!)
RUN pip install -r requirements.txt
# If code changes but requirements don't, this layer is cached → faster builds

COPY . .                         # Copy entire project into container

RUN mkdir -p artifacts models data storage/projects mlartifacts
# Create directories that the app needs but .dockerignore excludes

EXPOSE ${PORT}                   # Document which port the container uses

HEALTHCHECK CMD curl -f http://localhost:${PORT}/ || exit 1
# Docker checks every 30s: is the API responding? If not → restart container

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]
# Start FastAPI. 0.0.0.0 = accept connections from outside container
```

---

## 📁 FILE 17: `.github/workflows/ci.yml` — CI/CD Pipeline

### Purpose
Automatically runs tests and deploys a Docker image on every push to GitHub.

```
Developer pushes code to GitHub
          ↓
GitHub Actions triggered automatically
          ↓
Job 1: validate
  → Checkout code
  → Install Python 3.10
  → pip install requirements
  → Test module imports
  → Check DVC stages
          ↓ (only if Job 1 passes)
Job 2: build-and-push (only on main branch push)
  → Build Docker image
  → Push to Docker Hub as maitry2212/one-click-ml-pipeline:latest
```

### Key Lines

```yaml
on:
  push:
    branches: [ main ]     # Trigger on push to main
  pull_request:
    branches: [ main ]     # Trigger on PR to main

jobs:
  validate:
    runs-on: ubuntu-latest  # Use a fresh Ubuntu VM
    steps:
    - uses: actions/checkout@v3    # Download repository code into VM
    - uses: actions/setup-python@v4
      with: { python-version: '3.10' }

    - name: Validate Module Imports
      run: |
        python -c "from src.config import settings; print('Config loaded')"
        # Quick smoke test: if imports fail, something is broken

  build-and-push:
    needs: validate   # Only run if validate job succeeded
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    # Only build Docker image on direct push to main (not PRs)
    
    steps:
    - uses: docker/login-action@v2
      with:
        username: maitry2212
        password: ${{ secrets.DOCKER_PASSWORD }}   # Secret stored in GitHub Settings
    
    - uses: docker/build-push-action@v4
      with:
        push: true
        tags: |
          maitry2212/one-click-ml-pipeline:latest
          maitry2212/one-click-ml-pipeline:${{ github.sha }}
          # Tag with git commit hash → can roll back to any exact version
        cache-from: type=gha    # Use GitHub Actions cache → faster builds
```

---

## 🔄 COMPLETE DATA FLOW — FROM CLICK TO PREDICTION

```
USER clicks "Start Pipeline" in browser
         │
         ▼
FileUpload.jsx  →  calls onUpload(file, taskType, targetColumn)
         │
         ▼
Dashboard.jsx  →  calls uploadDataset(file, taskType, targetColumn)
         │
         ▼
api.js  →  POST http://localhost:8000/upload  (multipart form)
         │
         ▼
app/main.py  upload_dataset()
    ├── pd.read_csv(io.BytesIO(contents))   [parse CSV into DataFrame]
    ├── DataValidator.validate_dataset(df)  [check empty/duplicate]
    ├── DataValidator.check_target_exists() [check column exists]
    ├── DataValidator.validate_task_alignment() [check type match]
    ├── StorageManager.create_project_structure() [create folder proj_xxx]
    ├── StorageManager.save_dataset()       [save raw_data.csv to disk]
    ├── HistoryManager.add_project()        [write to index.json]
    └── Returns: {project_id: "proj_xxx"}
         │
         ▼
Dashboard.jsx  →  navigate('/eda')
         │
         ▼
EDAPage.jsx  →  useEffect calls getEDA()
         │
         ▼
app/main.py  get_eda()
    ├── EDAEngine.generate_eda_report(df, target)
    │    ├── null_counts bar chart (Plotly)
    │    ├── correlation matrix heatmap (Plotly)
    │    └── target distribution chart (Plotly)
    ├── StorageManager.save_json(project_id, data, "eda.json")
    └── Returns: {missing_values: {...}, correlation_matrix: {...}, ...}
         │
         ▼
EDAPage.jsx  →  <Plot data={...} />  renders interactive charts
         │
         ▼
USER clicks "Initialize Model Selection"  →  navigate('/train')
         │
         ▼
TrainingPage.jsx  →  shows model cards from pipelineState.suggestions
         │
         ▼
USER clicks model card  →  handleTrain(modelId)
         │
         ▼
api.js  →  POST /train?model_id=random_forest_classifier
         │
         ▼
app/main.py  train_model()
    ├── Trainer.train(df, target, task_type, model_id)
    │    ├── train_test_split (80/20)
    │    ├── DataPreprocessor.build_pipeline()
    │    │    ├── Numeric: Impute median → StandardScaler
    │    │    └── Categorical: Impute "missing" → OneHotEncoder
    │    ├── ModelSelector.get_model(model_id)
    │    ├── Pipeline([preprocessor, model])
    │    ├── pipeline.fit(X_train, y_train)
    │    ├── y_pred = pipeline.predict(X_test)
    │    ├── metrics = accuracy/f1 OR mse/r2
    │    └── mlflow.start_run():
    │         ├── log_params({model_id, task_type})
    │         ├── log_metrics(metrics)
    │         └── log_model(pipeline) → registered as "Model_random_forest_classifier"
    └── Returns: {run_id, metrics, duration, model_uri}
         │
         ▼
TrainingPage.jsx  →  navigate('/report') after 1 second
         │
         ▼
ReportPage.jsx  →  generates Markdown report from pipelineState.trainingResults
                →  ReactMarkdown renders it beautifully
```

---

## 🎤 TOP INTERVIEW QUESTIONS & ANSWERS

### Q1: Why FastAPI over Flask?
> FastAPI is async-native (handles multiple requests simultaneously), has automatic Swagger docs at `/docs`, uses Python type hints for validation, and is **faster** than Flask. Flask is synchronous by default.

### Q2: What is MLflow and why use it?
> MLflow is an experiment tracking tool. Every training run records: parameters used, metrics achieved, model artifact saved. If 10 models are trained, MLflow shows which was best. The model is saved to the MLflow Registry, which has stages: None → Staging → Production.

### Q3: What is a Scikit-learn Pipeline?
> A Pipeline chains steps (preprocessor + model) into a single object. When you call `pipeline.fit()`, ALL steps fit in order. When you call `pipeline.predict()`, ALL steps transform in order. This prevents data leakage and simplifies production deployment.

### Q4: What is data leakage?
> Leakage = when test data influences training. Example: if you fit `StandardScaler` on ALL data (train + test), the scaler learns the test data's statistics. The model then "knows" about test data, making metrics unrealistically high. Solution: fit ONLY on train data, then transform both.

### Q5: What is React Context?
> Context is a way to share state across components without "prop drilling" (passing props through every level). `PipelineContext` stores the entire pipeline state globally — any component can read or update it via `usePipeline()`.

### Q6: What is DVC?
> Data Version Control. Git can't track large files (CSVs, models). DVC stores these in separate storage (local or cloud), while tracking metadata in Git. `dvc.yaml` defines reproducible pipeline stages with dependencies and outputs.

### Q7: Why CORS middleware?
> Browsers block JavaScript from calling a different origin (different domain/port). The React frontend runs on port 5173, backend on 8000. Without CORS middleware, all API calls would be blocked by the browser's security policy.

### Q8: Why `io.BytesIO` when reading uploaded file?
> `file.read()` returns raw bytes. `pd.read_csv()` expects a file-like object. `io.BytesIO(bytes)` wraps bytes as an in-memory file — no need to save to disk first.

### Q9: What is `uuid4()`?
> UUID version 4 generates a random 128-bit identifier. Probability of collision is astronomically low. Used for project IDs: `proj_a3f2d1b0`. Alternative: auto-increment int, but that fails in distributed systems.

### Q10: Why use `@staticmethod` in classes like DataValidator?
> Static methods don't need `self` or `cls`. They're pure utility functions logically grouped in a class. No instance state is needed — `DataValidator.validate_dataset(df)` is cleaner than creating `DataValidator()` then calling method.

---

## ⚠️ MISTAKES & EDGE CASES

| Scenario | Problem | Solution |
|----------|---------|---------|
| Upload non-CSV | Extension check on frontend AND backend | Both validate `.endswith('.csv')` |
| Wrong target column | Column not in DataFrame | `check_target_exists()` returns 400 |
| Regression on categorical target | Type mismatch | `validate_task_alignment()` catches it |
| Server restart clears session | `current_session` is in-memory | Projects persist on disk via StorageManager |
| Unseen category in test set | OneHotEncoder crashes | `handle_unknown='ignore'` in preprocessor |
| Missing values in data | Model crashes on NaN | SimpleImputer fills before model sees data |
| Delete project still in index | index.json has stale entry | `get_all_projects()` filters by disk existence |
| XGBoost on multi-class | Default eval_metric warning | `eval_metric='logloss'` set explicitly |

---

## 📝 INTERVIEW SUMMARY (MEMORIZE THESE)

### Backend (Python FastAPI)
- **FastAPI** serves REST API. `@app.post("/upload")` handles CSV upload.
- **DataValidator** checks: empty, duplicate columns, target exists, type matches task.
- **DataPreprocessor** builds Scikit-learn Pipeline: numbers → impute+scale; text → impute+one-hot.
- **Trainer** splits data 80/20, builds full pipeline, trains, evaluates, logs EVERYTHING to MLflow.
- **StorageManager** creates `proj_xxxxxxxx` folder per run. **HistoryManager** maintains `index.json`.

### Frontend (React + Vite)
- **PipelineContext** = global state shared across all pages via React Context API.
- **api.js** = all Axios HTTP calls in one place (Single Responsibility Principle).
- **EDAPage** renders interactive Plotly charts received as JSON from backend.
- **Navbar** dynamically enables/disables links based on pipeline progress.

### DevOps
- **Dockerfile** packages app into a container. Uses layer caching (copy requirements first).
- **ci.yml** = GitHub Actions: test imports on every push, build+push Docker image on main pushes.
- **dvc.yaml** = reproducible ML pipeline stages with tracked inputs/outputs.

### Key Technologies
| Tool | Purpose |
|------|---------|
| FastAPI | Python web framework for REST API |
| Pandas | Data manipulation (CSV → DataFrame) |
| Scikit-learn | ML algorithms + preprocessing pipelines |
| XGBoost | Gradient boosting classifier |
| MLflow | Experiment tracking + model registry |
| DVC | Dataset + model version control |
| Plotly | Interactive charts (JSON-serializable) |
| React | Frontend UI framework |
| Axios | HTTP client for API calls |
| React Context | Global state management |
| Docker | Containerization |
| GitHub Actions | CI/CD automation |

---

---

## 🆚 TWO FOLDERS: `ml_pipeline` vs `one-click-ml-pipeline`

You have **TWO versions** of the same project on your Desktop. Here is the difference:

```
ml pipline/
├── ml_pipeline/               ← VERSION 1: Simpler MVP (Minimum Viable Product)
│   ├── app/main.py            ← No StorageManager, no HistoryManager
│   └── src/                   ← No project history, no sidebar support
│
└── one-click-ml-pipeline/     ← VERSION 2: Full Production Version
    ├── app/main.py            ← Has StorageManager + HistoryManager
    └── src/                   ← Full project history, sidebar, session reload
```

### Side-by-Side Comparison

| Feature | `ml_pipeline` (V1 MVP) | `one-click-ml-pipeline` (V2 Full) |
|---------|------------------------|-----------------------------------|
| `current_session` keys | `df, task_type, target` | `project_id, df, task_type, target` |
| Upload saves to | Only `data/raw_dataset.csv` | Project folder `storage/projects/proj_xxx/` |
| History tracking | ❌ None | ✅ `index.json` via HistoryManager |
| Past sessions | ❌ Not possible | ✅ Sidebar shows all past runs |
| Reload old project | ❌ Not possible | ✅ `GET /project/{id}` reloads session |
| Delete project | ❌ Not possible | ✅ `DELETE /project/{id}` |
| Task alignment check | ❌ Missing | ✅ `validate_task_alignment()` |
| Error handling in train | ❌ Basic | ✅ Catches `ValueError` + type mismatch |
| Sidebar UI | ❌ Not present | ✅ Full `Sidebar.jsx` component |

### Interview Answer: "Why Two Versions?"
> The `ml_pipeline` folder is my **initial prototype** — I built it first to validate the core ML flow (upload → validate → EDA → train → predict). Once I confirmed the core worked, I built `one-click-ml-pipeline` which adds **persistent storage, project history, and a sidebar** — features needed for a real product. This is a standard **iterative development** approach.

---

## 📁 FILE 18: `frontend/src/components/Navbar.jsx` — Navigation Bar

### Purpose
Fixed top navigation bar. Dynamically **enables/disables** links based on pipeline progress — you can't jump to Report before training.

```
Pipeline Progress → Controls which nav links are clickable

Upload → always enabled
EDA    → enabled ONLY after upload (suggestions.length > 0)
Train  → enabled ONLY after upload
Report → enabled ONLY after training (trainingResults exists)
```

### Key Lines Explained

```jsx
const isDataLoaded = !!pipelineState.suggestions.length;
// !! converts to boolean: [] → false, [{...}] → true
// True when suggestions exist = user already uploaded data

const isTrained = !!pipelineState.trainingResults;
// True when training is complete

const navLinks = [
    { name: 'Upload', path: '/dashboard', icon: LayoutDashboard, enabled: true },
    { name: 'EDA',    path: '/eda',       icon: BarChart2,       enabled: isDataLoaded },
    { name: 'Training', path: '/train',   icon: Zap,             enabled: isDataLoaded },
    { name: 'Report', path: '/report',    icon: FileText,        enabled: isTrained },
];

// In the Link component:
to={link.enabled ? link.path : '#'}
// If disabled → go to '#' (stays on same page)
className={link.enabled ? 'hover:text-white' : 'text-gray-600 cursor-not-allowed'}
// Disabled links look grayed out
onClick={(e) => !link.enabled && e.preventDefault()}
// Prevent navigation if disabled
```

### Real-World Analogy
Like a **wizard form** (Step 1 → Step 2 → Step 3). You cannot jump to Step 3 without completing Step 2. The navbar enforces this linearly.

---

## 📁 FILE 19: `frontend/src/components/FileUpload.jsx` — Upload Widget

### Purpose
Handles drag-and-drop OR click-to-browse file selection. Has local validation BEFORE sending to backend.

### State Variables
```jsx
const [file, setFile] = useState(null);          // The selected File object
const [error, setError] = useState(null);         // Error message to display
const [dragActive, setDragActive] = useState(false); // Is user dragging over the zone?
const [taskType, setTaskType] = useState('classification'); // Selected task
const [targetColumn, setTargetColumn] = useState('');       // Typed target name
```

### Drag-and-Drop Flow
```
User drags file over zone
         ↓
onDragEnter → setDragActive(true)  [border glows]
         ↓
onDrop → e.preventDefault()        [stop browser from opening the file]
       → e.dataTransfer.files[0]    [get the dropped file]
       → validateFile(file)         [check .csv and < 10MB]
       → setFile(file)              [store in state]
```

### Key Validation
```jsx
const validateFile = (file) => {
    if (!file.name.endsWith('.csv')) {
        setError("Please upload a CSV file only.");
        return false;
    }
    if (file.size > 10 * 1024 * 1024) {  // 10MB = 10 * 1024 * 1024 bytes
        setError("File size should be less than 10MB.");
        return false;
    }
    setError(null);    // Clear any previous error
    return true;
};
```

### The Hidden File Input Trick
```jsx
{/* Input is hidden — ugly browser default */}
<input type="file" id="file-upload" className="hidden" accept=".csv" onChange={handleChange} />

{/* Label clicks trigger the hidden input */}
<label htmlFor="file-upload" className="btn-primary cursor-pointer">
    Choose File
</label>
{/* When label is clicked → it triggers the input with matching id → file picker opens */}
```

---

## 📁 FILE 20: `frontend/src/pages/TrainingPage.jsx` — Model Selection & Training

### Purpose
Shows model cards (from suggestions). User clicks a card → training starts → auto-navigates to Report.

### Key Flow
```
useEffect on mount:
  → if no suggestions yet, fetch from GET /model-suggestions
  → store in pipelineState.suggestions

User clicks model card:
  → handleTrain(modelId)
  → setLoading(true) → shows animated Loader
  → POST /train?model_id=xxx
  → updateState({ trainingResults: result })
  → setTimeout(1000) → navigate('/report')
  (1 second delay for smooth UX)
```

### Animated Model Cards
```jsx
<motion.button
    key={m.id}
    whileHover={{ y: -5 }}       // Card lifts up 5px on hover
    onClick={() => handleTrain(m.id)}
    className={`glass p-8 rounded-[2rem] border ${
        pipelineState.selectedModel === m.id
            ? 'border-primary bg-primary/5'   // Highlight selected model
            : 'border-white/10'               // Subtle border otherwise
    }`}
>
    <h3>{m.name}</h3>
    <p>{m.reason}</p>    {/* e.g. "Handles non-linear patterns well." */}
    <div>Initialize Training ⚡</div>
</motion.button>
```

---

## 📁 FILE 21: `frontend/src/pages/ReportPage.jsx` — Final Report

### Purpose
Generates a **Markdown-formatted** professional ML report from training results and renders it beautifully.

### How the Report is Built
```jsx
const { metrics, duration, run_id, model_uri } = pipelineState.trainingResults;
// Destructure the training result object

const metricKey = Object.keys(metrics)[0];
// Get first metric key: "accuracy" or "mse"
const metricValue = metrics[metricKey];
// Get its value: e.g. 0.9543

const modelLabel = pipelineState.selectedModel
    .split('_')                            // "random_forest_classifier" → ["random","forest","classifier"]
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))  // Capitalize each word
    .join(' ');                            // → "Random Forest Classifier"

// Template literal builds the Markdown:
const reportMarkdown = `
# 🔬 ML Pipeline Performance Report
## 📈 Key Metrics
| Metric | Value  |
| ${metricKey.toUpperCase()} | ${metricValue.toFixed(4)} |
`;

// Render it:
<ReactMarkdown>{reportMarkdown}</ReactMarkdown>
// ReactMarkdown converts Markdown text to styled HTML elements
```

### Buttons at Bottom
```jsx
{/* Go back and try a different model */}
<button onClick={() => navigate('/train')}>Retrain Different Model</button>

{/* Reset EVERYTHING and start fresh */}
<button onClick={() => { resetPipeline(); navigate('/'); }}>Run New Pipeline</button>
// resetPipeline() clears: projectId, file, task, target, suggestions, edaData, trainingResults
```

---

## 📁 FILE 22: `frontend/src/components/Sidebar.jsx` — Project History Panel

### Purpose
Left panel showing all past ML sessions saved on disk. Click any session → it reloads in the app. Think of it like ChatGPT's conversation history.

### Key Logic
```jsx
useEffect(() => {
    fetchProjects();   // Load all projects from GET /projects on sidebar mount
}, []);

const handleLoadProject = async (id) => {
    const data = await getProject(id);   // GET /project/{id}
    hydrateProject(data);                // Restore state from saved JSON files
    navigate('/report');                 // Go straight to report (or EDA if no results)
};

const handleDelete = async (e, id) => {
    e.stopPropagation();  // IMPORTANT: stop click from bubbling up to parent div
    // Without this, clicking Delete would also trigger handleLoadProject!
    if (window.confirm("Delete this workspace forever?")) {
        await deleteProject(id);          // DELETE /project/{id}
        fetchProjects();                  // Refresh the list
    }
};
```

### Conditional Rendering Pattern
```jsx
{pipelineState.projects.length === 0 ? (
    <div>No history yet. Start your first pipeline.</div>  // Empty state
) : (
    <AnimatePresence>
        {pipelineState.projects.map((project) => (
            <motion.div
                key={project.project_id}
                initial={{ opacity: 0, x: -20 }}  // Slide in from left
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }} // Shrink out on delete
                onClick={() => handleLoadProject(project.project_id)}
            >
                <h4>{project.dataset_name}</h4>
                <span>{project.task_type}</span>
                <span>{new Date(project.timestamp).toLocaleDateString()}</span>
                {project.score && <div>Score: {project.score.toFixed(4)}</div>}
            </motion.div>
        ))}
    </AnimatePresence>
)}
```

---

## 📁 FILE 23: `frontend/src/main.jsx` — React Entry Point

```jsx
import { StrictMode } from 'react'       // Line 1: Development mode — detect problems
import { createRoot } from 'react-dom/client'  // Line 2: Modern React 18 rendering API
import './index.css'                     // Line 3: Global CSS styles
import App from './App.jsx'             // Line 4: Root component

createRoot(document.getElementById('root'))
// Line 6: Find the <div id="root"> in index.html
// createRoot is React 18's API (replaces ReactDOM.render)
.render(
    <StrictMode>
        <App />
    </StrictMode>
);
// StrictMode renders components TWICE in dev to catch side effects
// Has NO effect in production build
```

**Flow:** Browser loads `index.html` → finds `<script src="main.jsx">` → React injects the entire app into `<div id="root">`.

---

## 🔑 REGISTRY & PREDICTOR — The Deployment Loop

### `src/registry.py` — MLflow Model Registry

```python
class ModelRegistry:
    def __init__(self):
        self.client = MlflowClient()   # MLflow tracking client

    def promote_to_production(self, model_name, version):
        self.client.transition_model_version_stage(
            name=model_name,
            version=version,
            stage="Production",
            archive_existing_versions=True  # Previous Production → Archived
        )
        # Lifecycle: None → Staging → Production → Archived
```

**Analogy:** Like a software release process. Code goes through Dev → QA → Production. Only ONE version is in Production at a time.

### `src/predictor.py` — Make Predictions

```python
class Predictor:
    def __init__(self, model_name: str):
        self.model_uri = self.registry.get_production_model_uri(model_name)
        # Returns: "models:/Model_random_forest_classifier/Production"

        try:
            self.model = mlflow.sklearn.load_model(self.model_uri)
            # Load the full pipeline (preprocessor + model) from MLflow storage
        except Exception:
            self.model = None   # Graceful fallback if Production doesn't exist yet

    def predict(self, df: pd.DataFrame):
        if self.model is None:
            raise RuntimeError("No model loaded for prediction.")
        return self.model.predict(df).tolist()
        # .tolist() converts numpy array to Python list (JSON-serializable)
```

---

## 🧠 FULL TECHNOLOGY STACK — INTERVIEW CHEAT SHEET

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React + Vite)                 │
│                                                             │
│  main.jsx → App.jsx → [PipelineContext]                     │
│                    ↓                                        │
│  Pages: Landing → Dashboard → EDA → Training → Report      │
│  Components: Navbar, Sidebar, FileUpload, Loader            │
│  State: React Context API (no Redux needed)                 │
│  HTTP: Axios (api.js)                                       │
│  Charts: react-plotly.js                                    │
│  Animations: framer-motion                                  │
│  Icons: lucide-react                                        │
│  Routing: react-router-dom                                  │
│  Markdown: react-markdown                                   │
└──────────────────────┬──────────────────────────────────────┘
                       │  HTTP (JSON / multipart/form-data)
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND (FastAPI + Python)                 │
│                                                             │
│  app/main.py  ← All routes: /upload /eda /train /predict    │
│       ↓                                                     │
│  src/config.py       ← Settings + directory paths           │
│  src/validator.py    ← Data quality checks                  │
│  src/data_loader.py  ← CSV read/write                       │
│  src/eda_engine.py   ← Plotly chart generation              │
│  src/model_suggester.py ← Suggest models by task type       │
│  src/model_selector.py  ← Return sklearn/xgboost objects    │
│  src/preprocessor.py    ← Impute + Scale + Encode           │
│  src/trainer.py         ← Train + MLflow logging            │
│  src/registry.py        ← Promote model to Production       │
│  src/predictor.py       ← Load Production model + predict   │
│  src/storage_manager.py ← Local filesystem per project      │
│  src/history_manager.py ← index.json master list            │
└──────────────────────┬──────────────────────────────────────┘
                       │
          ┌────────────┴─────────────┐
          ▼                         ▼
┌─────────────────┐       ┌─────────────────────┐
│   MLflow Server  │       │  Local Filesystem    │
│  (mlflow.db)     │       │  storage/projects/   │
│                  │       │  └── proj_xxx/       │
│  Experiments     │       │      ├── raw_data.csv │
│  Runs            │       │      ├── eda.json     │
│  Metrics         │       │      └── results.json │
│  Model Registry  │       │  storage/index.json  │
└─────────────────┘       └─────────────────────┘
          │
┌─────────┴──────────┐
│  DVC Pipeline      │
│  dvc.yaml          │
│  Stage 1: validate │
│  Stage 2: preprocess│
│  Stage 3: eda      │
│  Stage 4: train    │
└────────────────────┘
          │
┌─────────┴──────────┐
│  Docker + CI/CD    │
│  Dockerfile        │
│  ci.yml            │
│  → Docker Hub push │
└────────────────────┘
```

---

## 🎤 FINAL 10-SECOND ELEVATOR PITCH (for interviews)

> *"I built a full-stack AutoML platform called One-Click ML Pipeline. A user uploads any CSV, the system validates the data, runs exploratory data analysis with interactive Plotly charts, suggests machine learning models, trains the selected model using a Scikit-learn pipeline with MLflow experiment tracking, and generates a professional performance report — all in one click. The backend is FastAPI with Python, the frontend is React with Vite, experiments are tracked in MLflow, and the entire app is containerized with Docker and deployed via a GitHub Actions CI/CD pipeline."*

---

*Generated by Antigravity (Google DeepMind) — One-Click ML Pipeline Interview Guide v1.0*
