from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from models.user_model import UserModel

class UserService:

    @staticmethod
    def check_email_exists(email):
        user = UserModel.get_by_email(email)
        return user is not None

    @staticmethod
    def register_user(data):
        hashed_password = generate_password_hash(data["password"])
        data["password_hash"] = hashed_password
        return UserModel.create_user(data)

    @staticmethod
    def authenticate_user(email, password):
        user = UserModel.get_by_email(email)
        if not user or not check_password_hash(user["password_hash"], password):
            return None
        token = create_access_token(identity=email)
        return {"token": token, "user_id": user["id"]}
    
    @staticmethod
    def get_user_by_email(email: str):
        return UserModel.get_by_email(email)
