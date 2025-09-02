from models.nutrition_model import NutritionModel
import math
from models.nutrition_model import NutritionModel

class NutritionService:
    """
    Business rules:
    - Safe weekly rate is dynamic: depends on age and the magnitude of the weight difference.
    - Timeframe is computed (user does not supply it).
    - Calorie bounds are dynamic and individualized; if a target violates bounds, the timeframe is lengthened until safe.
    - Macros adapt to age and gender (higher protein for 50+, fat floor for females), with renormalization.
    - Transparent safeguards are recorded as flags.
    """
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
        key = NutritionService._normalize_activity(level)
        return multipliers[key]

    @staticmethod
    def _safe_weekly_rate(age: int, weight_diff: float, goal: str) -> float:
        """
        Returns kg/week (positive magnitude).
        - Base rates: loss 0.75 kg/wk, gain 0.50 kg/wk.
        - Age factors reduce aggressiveness with age.
        - Magnitude factor slows large total changes to promote sustainability.
        """
        base = 0.75 if (goal or "").lower() == "weight loss" else (0.50 if (goal or "").lower() == "weight gain" else 0.0)
        # If maintenance, no rate needed.
        if base == 0.0:
            return 0.0

        # Age factor
        if age < 30:
            age_factor = 1.0
        elif age < 50:
            age_factor = 0.9
        elif age < 60:
            age_factor = 0.75
        elif age < 70:
            age_factor = 0.6
        else:
            age_factor = 0.5  # ≥70: gentler pace

        # Magnitude factor (larger targets -> more gradual). Range ~[0.6, 1.0]
        # weight_diff in kg
        magnitude_factor = 0.6 + 0.4 * math.exp(-max(weight_diff, 0.0) / 20.0)

        rate = base * age_factor * magnitude_factor

        # Practical lower/upper bounds on the *rate* itself
        # (avoid absurdly tiny/large values due to extreme inputs)
        rate = max(min(rate, base), 0.25 if base >= 0.5 else 0.2)

        return rate

    @staticmethod
    def _dynamic_calorie_bounds(bmr: float, weight_kg: float, age: int, tdee: float, goal: str):
        """
        Returns (lower_bound, upper_bound).
        - Lower bound: >= BMR, scaled slightly by age; also ensure not below a simple size-based heuristic.
        - Upper bound: tied to TDEE, BMR and body size; avoids arbitrary fixed ceilings.
        """
        # Lower bound: Never below BMR; slightly higher for older adults to preserve lean mass.
        if age < 50:
            lower = max(bmr * 1.00, 9.5 * weight_kg + 200)  # size-aware floor
        elif age < 65:
            lower = max(bmr * 1.05, 9.5 * weight_kg + 250)
        else:
            lower = max(bmr * 1.10, 9.5 * weight_kg + 300)

        # Upper bound: plausible ceilings based on physiology/activity
        # - cap relative to TDEE and BMR; guard with size-based absolute ceiling.
        upper_candidates = [
            tdee * 1.25,          # modest surplus above TDEE
            bmr * 1.9,            # typical high end for very active but still plausible
            40.0 * weight_kg      # absolute sanity check
        ]
        upper = min(upper_candidates)

        # Ensure lower < upper with some slack
        if lower >= upper:
            # If this happens, relax by anchoring to TDEE
            lower = min(lower, tdee * 0.95)
            upper = max(upper, tdee * 1.05)

        return (lower, upper)

    @staticmethod
    def _apply_macro_overrides(age: int, gender: str, goal: str, carb_p: float, prot_p: float, fat_p: float):
        """
        Age/gender adjustments:
        - Protein +5% for age >= 50 (muscle retention), capped at 35%.
        - For females, ensure fat >= 28% for hormonal health.
        Renormalize by taking from carbs first, then fat if needed.
        """
        flags = []

        # Increase protein for older adults
        if age >= 50:
            incr = 0.05
            new_prot = min(prot_p + incr, 0.35)
            if new_prot > prot_p:
                delta = new_prot - prot_p
                prot_p = new_prot
                carb_take = min(carb_p, delta)
                carb_p -= carb_take
                rem = delta - carb_take
                if rem > 0:
                    fat_take = min(fat_p, rem)
                    fat_p -= fat_take
                flags.append("protein_increased_for_age")

        # Fat floor for females
        if (gender or "").lower() == "female":
            fat_floor = 0.28
            if fat_p < fat_floor:
                needed = fat_floor - fat_p
                fat_p = fat_floor
                # pull first from carbs, then protein if necessary
                carb_take = min(carb_p, needed)
                carb_p -= carb_take
                rem = needed - carb_take
                if rem > 0:
                    prot_take = min(prot_p - 0.20, rem)  # don’t drop protein below ~20%
                    if prot_take > 0:
                        prot_p -= prot_take
                flags.append("fat_raised_for_gender")

        # Normalize small float drift
        total = carb_p + prot_p + fat_p
        if total <= 0:
            # Fallback to a balanced default (should not happen)
            carb_p, prot_p, fat_p = 0.45, 0.30, 0.25
            flags.append("macro_fallback_applied")
        else:
            carb_p, prot_p, fat_p = carb_p / total, prot_p / total, fat_p / total

        return carb_p, prot_p, fat_p, flags

    @staticmethod
    def _water_intake_liters(weight: float, activity_level: str) -> float:
        base = 0.035 * weight
        mult = {
            "sedentary": 1.0,
            "lightly active": 1.1,
            "moderately active": 1.2,
            "very active": 1.3
        }
        key = NutritionService._normalize_activity(activity_level)
        print(f"Water multiplier: {mult[key]}")
        return round(base * mult[key], 2)

    @staticmethod
    def calculate_nutrition(data, user_id):
        try:
            flags = []
            print("Received data for nutrition calculation:", data)

            # Inputs
            age = int(data.get("age"))
            gender = data.get("gender")
            weight = float(data.get("weight"))
            height = float(data.get("height"))
            activity_level = data.get("activityLevel")
            goal = (data.get("primaryGoal") or "").lower()
            weight_goal = float(data.get("weightGoal"))
            
            print("--------------------")
            print("Age:", age)
            print("Gender:", gender)
            print("Weight:", weight)
            print("Height:", height)
            print("Activity Level:", activity_level)
            print("Goal:", goal)
            print("Weight Goal:", weight_goal)
            print("--------------------")

            # BMR (Mifflin-St Jeor)
            if (gender or "").lower() == "male":
                bmr = 10 * weight + 6.25 * height - 5 * age + 5
            else:
                bmr = 10 * weight + 6.25 * height - 5 * age - 161

            am = NutritionService._activity_multiplier(activity_level)
            tdee = bmr * am

            print(f"BMR: {bmr:.2f}, TDEE: {tdee:.2f}, Activity Multiplier: {am}")

            # If maintenance selected, aim to maintain (ignore weight_goal deltas)
            if goal == "maintenance":
                time_frame = 0  # not applicable
                calorie_target = tdee
                carb_p, prot_p, fat_p = 0.50, 0.25, 0.25
                carb_p, prot_p, fat_p, macro_flags = NutritionService._apply_macro_overrides(age, gender, goal, carb_p, prot_p, fat_p)
                flags.extend(macro_flags)

            else:
                # Determine direction and magnitude
                delta = weight_goal - weight  # positive => gain, negative => loss
                weight_diff = abs(delta)

                # Safe weekly rate (kg/wk)
                safe_rate = NutritionService._safe_weekly_rate(age, weight_diff, "weight loss" if delta < 0 else "weight gain")
                # Minimum timeframe heuristic to avoid “crash” changes (at least 6 weeks if any change; longer for large diffs)
                min_weeks = 6 if weight_diff > 0 else 0
                soft_min_weeks = max(min_weeks, math.ceil(weight_diff / max(safe_rate, 1e-6)))

                # Initial timeframe (weeks)
                time_frame = soft_min_weeks

                # Convert weekly change to daily kcal: 1 kg ≈ 7700 kcal
                def kcal_target_for_weeks(weeks: int):
                    if weeks <= 0 or weight_diff == 0:
                        return tdee
                    weekly_change = (delta / weeks)  # kg per week; sign-carries direction
                    daily_adjust = (weekly_change * 7700.0) / 7.0
                    return tdee + daily_adjust

                calorie_target = kcal_target_for_weeks(time_frame)

                # Dynamic calorie bounds
                lower_bound, upper_bound = NutritionService._dynamic_calorie_bounds(bmr, weight, age, tdee, goal)

                # If outside bounds, progressively lengthen timeframe until safe
                # Cap iterations to avoid infinite loops
                max_weeks_cap = max(104, soft_min_weeks)  # up to 2 years if needed
                adjusted = False
                if calorie_target < lower_bound:
                    # instead of pushing weeks endlessly, allow a faster safe_rate up to ~1.0 kg/week for younger adults
                    if age < 30:
                        max_safe_rate = 0.9
                    elif age < 50:
                        max_safe_rate = 0.75
                    elif age < 65:
                        max_safe_rate = 0.5
                    else:
                        max_safe_rate = 0.45

                    adjusted_rate = min(max_safe_rate, weight_diff / min_weeks)
                    time_frame = math.ceil(weight_diff / adjusted_rate)
                    calorie_target = kcal_target_for_weeks(time_frame)
                    flags.append("safe_rate_adjusted_upwards")


                if adjusted:
                    flags.append("timeframe_extended_for_safety")

                # If still out of bounds at cap, clamp to nearest bound and flag
                if calorie_target < lower_bound:
                    calorie_target = lower_bound
                    flags.append("calorie_floor_applied_after_max_weeks")
                elif calorie_target > upper_bound:
                    calorie_target = upper_bound
                    flags.append("calorie_ceiling_applied_after_max_weeks")

                # Base macro template by goal
                if delta < 0:
                    # weight loss
                    carb_p, prot_p, fat_p = 0.40, 0.30, 0.30
                else:
                    # weight gain
                    carb_p, prot_p, fat_p = 0.50, 0.25, 0.25

                # Apply age/gender overrides with renormalization
                carb_p, prot_p, fat_p, macro_flags = NutritionService._apply_macro_overrides(age, gender, goal, carb_p, prot_p, fat_p)
                flags.extend(macro_flags)

            # Final rounding & macro grams
            calorie_target = round(calorie_target)

            carbs_g  = round((calorie_target * carb_p) / 4.0)
            protein_g = round((calorie_target * prot_p) / 4.0)
            fat_g    = round((calorie_target * fat_p) / 9.0)
            
            water_l = NutritionService._water_intake_liters(weight, activity_level)

            print(f"Timeframe (weeks): {time_frame}")
            print(f"Calorie target: {calorie_target} kcal")
            print(f"Macros: {carbs_g}g carbs | {protein_g}g protein | {fat_g}g fat")
            if flags:
                print("Safety/Personalization flags:", flags)

            # Persist
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
            print(f"Error in calculate_nutrition: {e}")
            raise
