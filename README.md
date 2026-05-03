# 🚦 AI-Based Policy Impact Simulator



---

## 🌟 Vision
The **Policy Impact Simulator** is a state-of-the-art decision-support tool designed for urban planners. It leverages Machine Learning to predict how infrastructure policies—such as tunnel construction, flyovers, and signal optimization—affect real-world traffic patterns, pollution levels, and travel efficiency in Bengaluru.

---

## 🚀 Key Features

- **🤖 AI-Driven Predictions**: Utilizes Random Forest and Gradient Boosting models trained on real Bengaluru traffic datasets.
- **🛣️ Policy Modeling**: Simulate complex scenarios like underground tunnels (+capacity) or elevated flyovers (traffic redistribution).
- **📊 Comparative Analytics**: Instant "Before vs After" visualization of metrics:
    - **Vehicle Count**
    - **Average Speed**
    - **Travel Time Index**
    - **Pollution Index**
- **🌿 Sustainability Insights**: Integrated impact scoring aligned with UN SDG 9 KPIs.
- **📈 Live Visualization**: Real-time chart rendering using Recharts for trend analysis.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Backend** | ![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white) ![Flask](https://img.shields.io/badge/Flask-000000?style=flat&logo=flask&logoColor=white) |
| **Frontend** | ![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB) ![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white) ![Recharts](https://img.shields.io/badge/Recharts-222222?style=flat) |
| **ML/Data** | ![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-F7931E?style=flat&logo=scikit-learn&logoColor=white) ![Pandas](https://img.shields.io/badge/Pandas-150458?style=flat&logo=pandas&logoColor=white) ![NumPy](https://img.shields.io/badge/NumPy-013243?style=flat&logo=numpy&logoColor=white) |
| **Database** | ![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=flat&logo=mongodb&logoColor=white) |
| **DevOps** | ![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white) |

---

## 💻 Getting Started (Installation)

Follow these instructions to get the project running on your local machine.

### Prerequisites
- **Python 3.9+**
- **Node.js 18+**
- **MongoDB** (running locally or via Atlas)

---

### 1. Backend Setup
1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Create and activate a virtual environment:
    ```bash
    python -m venv venv
    # Windows:
    .\venv\Scripts\activate
    # Linux/Mac:
    source venv/bin/activate
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Configure Environment Variables:
    - Copy `.env.example` to `.env` and update your `MONGO_URI`.
5.  Run the server:
    ```bash
    python run.py
    ```
    *Backend will be live at `http://localhost:5001`*

---

### 2. Frontend Setup
1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run the development server:
    ```bash
    npm start
    ```
    *Frontend will be live at `http://localhost:3000`*

---

### 3. Docker (Quickest Setup)
If you have Docker installed, simply run:
```bash
docker-compose up --build
```
This will spin up the Backend, Frontend, and MongoDB instances automatically.

---

## 📂 Project Structure

```text
├── backend/                # Flask API & ML Logic
│   ├── app/
│   │   ├── ml/             # Training & Model Architectures
│   │   ├── routes/         # Simulation & Visualization Endpoints
│   │   └── simulation/     # Physics-based Policy Engines
│   └── data/               # Datasets & Serialized Models (.joblib)
├── frontend/               # React Application
│   ├── src/
│   │   ├── components/     # UI: Simulator, Charts, Comparison
│   │   └── pages/          # Home, Simulator, Results
├── notebooks/              # EDA & Model Training Experiments
├── scripts/                # Database setup & Sample data generation
└── docker-compose.yml      # Container orchestration
```

---

## 🤝 Contribution
Contributions are welcome! Please follow these steps:
1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.
