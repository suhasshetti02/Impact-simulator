from flask import Flask
from flask_cors import CORS
from config import get_config


def create_app():
    """Application factory."""
    app = Flask(__name__)
    cfg = get_config()
    app.config.from_object(cfg)

    # Enable CORS for all origins (tighten in production)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Register blueprints
    from app.routes import register_blueprints
    register_blueprints(app)

    return app
