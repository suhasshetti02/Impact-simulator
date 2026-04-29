"""Register all route blueprints with the Flask app."""
from app.routes.traffic import traffic_bp
from app.routes.simulation import simulation_bp
from app.routes.comparison import comparison_bp
from app.routes.visualization import visualization_bp


def register_blueprints(app):
    app.register_blueprint(traffic_bp)
    app.register_blueprint(simulation_bp)
    app.register_blueprint(comparison_bp)
    app.register_blueprint(visualization_bp)
