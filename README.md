# AI-Based Policy Impact Simulator for Smart Infrastructure Planning
**Theme:** SDG 9 — Industry, Innovation and Infrastructure  
**College:** RV College of Engineering, Bengaluru  
**Mentor:** Dr. Vinay Hegde

---

## Project Structure

```
policy-impact-simulator/
│
├── backend/                        # Flask Python Backend
│   ├── app/
│   │   ├── routes/                 # API endpoints
│   │   │   ├── traffic.py          # /api/traffic
│   │   │   ├── simulation.py       # /api/simulate
│   │   │   ├── comparison.py       # /api/compare
│   │   │   └── visualization.py    # /api/visualize
│   │   ├── models/                 # MongoDB schemas
│   │   │   ├── traffic_model.py
│   │   │   └── policy_model.py
│   │   ├── ml/                     # Machine Learning core
│   │   │   ├── models/
│   │   │   │   ├── random_forest.py
│   │   │   │   └── lstm_model.py
│   │   │   ├── training/train.py
│   │   │   └── evaluation/metrics.py
│   │   ├── simulation/             # Policy simulation engine
│   │   │   ├── tunnel_sim.py       # +30% road capacity
│   │   │   ├── flyover_sim.py      # traffic redistribution
│   │   │   └── scenario_engine.py  # before/after orchestrator
│   │   └── utils/
│   │       ├── data_preprocessing.py
│   │       ├── feature_engineering.py
│   │       └── db.py               # MongoDB connection
│   ├── data/
│   │   ├── raw/        # Original datasets
│   │   ├── processed/  # Cleaned data
│   │   └── sample/     # Demo data
│   ├── tests/
│   ├── run.py          # Entry point
│   ├── config.py
│   └── requirements.txt
│
├── frontend/                       # React JS Frontend
│   └── src/
│       ├── components/
│       │   ├── Dashboard/
│       │   ├── Simulator/          # Policy input controls
│       │   ├── Comparison/         # Before vs After view
│       │   ├── Visualization/      # Charts & graphs
│       │   └── Layout/             # Navbar, Sidebar, Footer
│       ├── pages/
│       │   ├── Home.jsx
│       │   ├── SimulatorPage.jsx
│       │   └── ResultsPage.jsx
│       ├── services/
│       │   ├── api.js
│       │   └── simulationService.js
│       └── utils/
│           ├── helpers.js
│           └── constants.js
│
├── notebooks/
│   ├── 01_EDA.ipynb
│   ├── 02_model_training.ipynb
│   └── 03_simulation_testing.ipynb
│
├── scripts/
│   ├── generate_sample_data.py
│   └── setup_db.py
│
├── docs/
└── docker-compose.yml
```

## Tech Stack
| Layer | Technology |
|---|---|
| Backend | Python, Flask |
| ML | Scikit-learn, TensorFlow |
| Data Processing | Pandas, NumPy |
| Visualization | Matplotlib, Seaborn |
| Frontend | React JS |
| Database | MongoDB |
