from flask import Flask
from flask_cors import CORS
from config import Config
from extensions import jwt
from routes.user_routes import user_bp
from routes.auth_routes import auth_bp
from routes.food_routes import food_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app)
    jwt.init_app(app)

    app.register_blueprint(user_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(food_bp)

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
