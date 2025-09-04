from models.food_model import FoodModel

class FoodService:

    @staticmethod
    def log_food(user_id, data):
        FoodModel.add_food_entry(
            user_id=user_id,
            name=data.get("name"),
            calories=data.get("calories"),
            protein=data.get("protein"),
            carbs=data.get("carbs"),
            fat=data.get("fat"),
            meal_type=data.get("mealType"),
            timestamp=data.get("timestamp"),
            servings=data.get("servings", 1)
        )
        return True

    @staticmethod
    def get_user_food_entries(user_id):
        return FoodModel.get_entries_by_user(user_id)

    @staticmethod
    def delete_food_entry(user_id, entry_id):
        FoodModel.delete_entry(entry_id, user_id)
        return True

    @staticmethod
    def update_food_servings(user_id, entry_id, servings):
        FoodModel.update_servings(entry_id, user_id, servings)
        return True
      
    @staticmethod
    def update_water_consumed(user_id, water):
        FoodModel.update_or_add_water(user_id, water)
        return True

    @staticmethod
    def get_latest_water(user_id):
        return FoodModel.get_latest_water(user_id)
