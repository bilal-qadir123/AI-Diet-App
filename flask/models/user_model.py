from database import get_db_connection
import json

class UserModel:

    @staticmethod
    def get_by_email(email):
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        cursor.close()
        db.close()
        return user

    @staticmethod
    def create_user(data):
        db = get_db_connection()
        cursor = db.cursor()
        sql = """INSERT INTO users 
                 (email, password_hash, name, age, gender, height_cm, weight_kg, activity_level, goal, weight_goal, diet, allergies, health_conditions) 
                 VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"""
        health_conditions = data.get("healthConditions")
        if isinstance(health_conditions, list):
            health_conditions = json.dumps(health_conditions)
        values = (
            data.get("email"),
            data.get("password_hash"),
            data.get("name"),
            data.get("age"),
            data.get("gender"),
            data.get("height"),
            data.get("weight"),
            data.get("activityLevel"),
            data.get("primaryGoal"),
            data.get("weightGoal"),
            data.get("diet"),
            data.get("allergies"),
            health_conditions
        )
        cursor.execute(sql, values)
        db.commit()
        cursor.close()
        db.close()
        return True
