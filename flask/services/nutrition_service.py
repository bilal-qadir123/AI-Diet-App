from models.nutrition_model import NutritionModel
import math

class NutritionService:
    @staticmethod
    def get_by_user_id(user_id: int):
        return NutritionModel.get_by_user_id(user_id)

    @staticmethod
    def _normalize_activity(level: str) -> str:
        mapping = {
            "sedentary": "sedentary",
            "lightly active": "lightly active",
            "moderately active": "moderately active",
            "very active": "very active"
        }
        return mapping.get((level or "").strip().lower(), "sedentary")

    @staticmethod
    def _activity_multiplier(level: str) -> float:
        multipliers = {
            "sedentary": 1.2,
            "lightly active": 1.375,
            "moderately active": 1.55,
            "very active": 1.725
        }
        return multipliers[NutritionService._normalize_activity(level)]

    @staticmethod
    def _add_flag(flags: list, code: str, level: str, message: str):
        flags.append({"code": code, "level": level, "message": message})

    @staticmethod
    def _calculate_minor_bmr(weight: float, height_cm: float, age: int, gender: str) -> float:
        height_m = height_cm / 100.0
        g = (gender or "").lower()
        if g == "male":
            if age <= 18:
                # WHO: boys 10–18
                val = 17.5 * weight + 651
            else:
                val = 10 * weight + 6.25 * height_cm - 5 * age + 5
        else:
            if age <= 18:
                # WHO: girls 10–18
                val = 12.2 * weight + 746
            else:
                val = 10 * weight + 6.25 * height_cm - 5 * age - 161
        return max(val, 1000.0)

    @staticmethod
    def _safe_weekly_rate(age: int, current_weight: float, total_change: float, goal: str, gender: str) -> float:
        goal_norm = (goal or "").lower()
        if goal_norm == "maintenance" or total_change <= 0:
            return 0.0
        is_loss = goal_norm == "weight loss"
        base = 0.75 if is_loss else 0.50
        if age < 30:
            age_factor = 1.0
        elif age < 50:
            age_factor = 0.9
        elif age < 65:
            age_factor = 0.8
        elif age < 75:
            age_factor = 0.65
        else:
            age_factor = 0.55
        gender_factor = 0.95 if (gender or "").lower() == "female" else 1.0
        magnitude_factor = 0.6 + 0.4 * math.exp(-max(total_change, 0.0) / max(20.0, current_weight))
        weekly_rate = base * age_factor * gender_factor * magnitude_factor
        min_rate = 0.18 if is_loss else 0.15
        max_rate = 1.0 if is_loss else 0.8
        if current_weight < 45:
            min_rate *= 0.75
            max_rate *= 0.6
        if current_weight > 140:
            max_rate *= 1.2
        return max(min(weekly_rate, max_rate), min_rate)

    @staticmethod
    def _dynamic_calorie_bounds(bmr: float, weight_kg: float, age: int, tdee: float, gender: str):
        if age < 50:
            lower = max(bmr * 1.00, 9.5 * weight_kg + 200)
        elif age < 65:
            lower = max(bmr * 1.05, 9.5 * weight_kg + 250)
        else:
            lower = max(bmr * 1.10, 9.5 * weight_kg + 300)
        gender_min = 1200 if (gender or "").lower() == "female" else 1400
        lower = max(lower, gender_min)
        upper_candidates = [tdee * 1.25, bmr * 1.9, 40.0 * weight_kg]
        upper = min(upper_candidates)
        if lower >= upper:
            lower = min(lower, tdee * 0.95)
            upper = max(upper, tdee * 1.05)
        if lower >= upper:
            lower = bmr
            upper = max(bmr * 1.4, weight_kg * 30.0)
        return (lower, upper)

    @staticmethod
    def _apply_macro_overrides(age: int, gender: str, carb_p: float, prot_p: float, fat_p: float):
        flags = []
        if age >= 50:
            new_prot = min(prot_p + 0.05, 0.35)
            if new_prot > prot_p:
                delta = new_prot - prot_p
                prot_p = new_prot
                taken = min(carb_p, delta)
                carb_p -= taken
                rem = delta - taken
                if rem > 0:
                    fat_p = max(0.2, fat_p - rem)
                NutritionService._add_flag(flags, "protein_increased_for_age", "info", "Protein increased for age >= 50")
        if (gender or "").lower() == "female":
            fat_floor = 0.28
            if fat_p < fat_floor:
                needed = fat_floor - fat_p
                fat_p = fat_floor
                taken = min(carb_p, needed)
                carb_p -= taken
                rem = needed - taken
                if rem > 0:
                    prot_p = max(0.2, prot_p - rem)
                NutritionService._add_flag(flags, "fat_raised_for_gender", "info", "Fat raised to minimum for female users")
        total = carb_p + prot_p + fat_p
        if total <= 0:
            carb_p, prot_p, fat_p = 0.45, 0.30, 0.25
            NutritionService._add_flag(flags, "macro_fallback_applied", "warning", "Fallback macros applied")
            return carb_p, prot_p, fat_p, flags
        carb_p, prot_p, fat_p = carb_p / total, prot_p / total, fat_p / total
        prot_p = max(prot_p, 0.18)
        carb_p = max(carb_p, 0.35)
        fat_p = max(fat_p, 0.20)
        total = carb_p + prot_p + fat_p
        carb_p, prot_p, fat_p = carb_p / total, prot_p / total, fat_p / total
        return carb_p, prot_p, fat_p, flags

    @staticmethod
    def _water_intake_liters(weight: float, activity_level: str, age: int, gender: str, climate: str = "temperate") -> float:
        base = 0.035 * weight
        if age >= 70:
            base *= 0.9
        activity_mult = {
            "sedentary": 1.0,
            "lightly active": 1.08,
            "moderately active": 1.16,
            "very active": 1.24
        }[NutritionService._normalize_activity(activity_level)]
        age_adj = 1.0
        if age >= 60:
            age_adj = max(0.85, 1.0 - (age - 60) * 0.01)
        climate_mult = 1.2 if (climate or "").lower() == "hot" else 1.0
        sex_boost = 1.0
        if (gender or "").lower() == "male" and NutritionService._normalize_activity(activity_level) == "very active" and age < 50:
            sex_boost = 1.05
        result = base * activity_mult * age_adj * climate_mult * sex_boost
        return round(result, 2)

    @staticmethod
    def _calculate_bmr(weight: float, height: float, age: int, gender: str):
        if age < 18:
            height_cm = height if height > 0 and height > 3 else height * 100.0
            return NutritionService._calculate_minor_bmr(weight, height_cm, age, gender)
        if (gender or "").lower() == "male":
            return 10 * weight + 6.25 * height - 5 * age + 5
        else:
            return 10 * weight + 6.25 * height - 5 * age - 161

    @staticmethod
    def calculate_nutrition(data, user_id):
        try:
            flags = []
            age = int(data.get("age") or 0)
            gender = (data.get("gender") or "").strip()
            weight = float(data.get("weight") or 0.0)
            height = float(data.get("height") or 0.0)
            activity_level = data.get("activityLevel") or "sedentary"
            goal = (data.get("primaryGoal") or "maintenance").lower()
            weight_goal = float(data.get("weightGoal") or weight)
            climate = (data.get("climate") or "temperate").lower()
            if age < 0 or weight <= 0 or height <= 0:
                raise ValueError("Invalid age/weight/height provided")
            bmr = NutritionService._calculate_bmr(weight, height, age, gender)
            am = NutritionService._activity_multiplier(activity_level)
            tdee = bmr * am
            if goal == "maintenance" or abs(weight_goal - weight) < 1e-6:
                calorie_target = round(tdee)
                carb_p, prot_p, fat_p = 0.50, 0.25, 0.25
                time_frame = 0
            else:
                delta = weight_goal - weight
                total_change = abs(delta)
                weekly_rate = NutritionService._safe_weekly_rate(age, weight, total_change, goal, gender)
                if weekly_rate <= 0:
                    raise ValueError("Computed weekly rate is zero; cannot estimate timeframe")
                min_weeks = 6
                est_weeks = max(min_weeks, math.ceil(total_change / weekly_rate))
                est_weeks = min(est_weeks, 104)
                daily_kcal_adjust = (delta * 7700.0) / (est_weeks * 7.0) if est_weeks > 0 else 0.0
                calorie_target = tdee + daily_kcal_adjust
                lower_bound, upper_bound = NutritionService._dynamic_calorie_bounds(bmr, weight, age, tdee, gender)
                if calorie_target < lower_bound:
                    NutritionService._add_flag(flags, "calorie_below_lower_bound", "warning", "Calorie target below safe lower bound")
                    safe_weekly = max(weekly_rate, 0.35)
                    est_weeks = math.ceil(total_change / safe_weekly)
                    est_weeks = min(max(est_weeks, min_weeks), 104)
                    daily_kcal_adjust = (delta * 7700.0) / (est_weeks * 7.0)
                    calorie_target = max(lower_bound, tdee + daily_kcal_adjust)
                    NutritionService._add_flag(flags, "timeframe_extended_for_safety", "info", "Timeframe extended to respect calorie floor")
                elif calorie_target > upper_bound:
                    NutritionService._add_flag(flags, "calorie_above_upper_bound", "warning", "Calorie target above safe upper bound")
                    safe_weekly = max(weekly_rate * 0.7, 0.25)
                    est_weeks = math.ceil(total_change / safe_weekly)
                    est_weeks = min(max(est_weeks, min_weeks), 104)
                    daily_kcal_adjust = (delta * 7700.0) / (est_weeks * 7.0)
                    calorie_target = min(upper_bound, tdee + daily_kcal_adjust)
                    NutritionService._add_flag(flags, "timeframe_extended_for_safety", "info", "Timeframe extended to respect calorie ceiling")
                time_frame = int(est_weeks)
                if delta < 0:
                    carb_p, prot_p, fat_p = 0.40, 0.30, 0.30
                else:
                    carb_p, prot_p, fat_p = 0.50, 0.25, 0.25
            carb_p, prot_p, fat_p, macro_flags = NutritionService._apply_macro_overrides(age, gender, carb_p, prot_p, fat_p)
            flags.extend(macro_flags)
            if age < 18:
                NutritionService._add_flag(flags, "minor_user_warning", "warning", "User is a minor; parental/clinical oversight recommended")
            if age >= 70:
                NutritionService._add_flag(flags, "elderly_user_warning", "info", "Elderly user; consider clinical review for major changes")
            if weight < 40 or weight > 180:
                NutritionService._add_flag(flags, "extreme_weight_range", "warning", "User weight in extreme range; consider clinical review")
            calorie_target = round(calorie_target)
            carbs_g = round((calorie_target * carb_p) / 4.0)
            protein_g = round((calorie_target * prot_p) / 4.0)
            fat_g = round((calorie_target * fat_p) / 9.0)
            water_l = NutritionService._water_intake_liters(weight, activity_level, age, gender, climate)
            NutritionModel.create_profile(user_id, calorie_target, carbs_g, protein_g, fat_g, time_frame, water_l)
            return {
                "calorie_target": calorie_target,
                "carbs_g": carbs_g,
                "protein_g": protein_g,
                "fat_g": fat_g,
                "time_frame": time_frame,
                "water_l": water_l,
                "flags": flags
            }
        except Exception as e:
            raise
