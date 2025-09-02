from database import get_db_connection

class NutritionModel:
    
    @staticmethod
    def create_profile(user_id, calorie_target, carbs_g, protein_g, fat_g, time_frame, water_l):
        try:
            db = get_db_connection()
            cursor = db.cursor()
            sql = """INSERT INTO nutrition_profiles 
                     (user_id, calorie_target, carbs_g, protein_g, fat_g, time_frame, water_l)
                     VALUES (%s, %s, %s, %s, %s, %s, %s)"""
            values = (user_id, calorie_target, carbs_g, protein_g, fat_g, time_frame, water_l)
            print(f"Executing SQL: {sql} with values {values}")
            cursor.execute(sql, values)
            db.commit()
            print("Insert committed.")  
        except Exception as e:
            print(f"Error inserting nutrition profile: {e}")
            db.rollback()
            raise
        finally:
            cursor.close()
            db.close()

    @staticmethod
    def get_by_user_id(user_id):
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM nutrition_profiles WHERE user_id = %s", (user_id,))
        result = cursor.fetchone()
        cursor.close()

        if not result:
            return None

        return {
            "calorie_target": result["calorie_target"],
            "carbs_g": result["carbs_g"],
            "protein_g": result["protein_g"],
            "fat_g": result["fat_g"],
            "time_frame": result["time_frame"],
            "water_l": result["water_l"]
        }
