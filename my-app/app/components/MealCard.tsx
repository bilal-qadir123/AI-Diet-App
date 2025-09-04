import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../../styles/screens/Dashboard";

const getMealTypeEmoji = (type: string) => {
  switch (type) {
    case "breakfast":
      return "🍳";
    case "lunch":
      return "🥗";
    case "dinner":
      return "🍽️";
    case "snack":
      return "🍟";
    case "water":
      return "💧";
    default:
      return "🍽️";
  }
};

export const MealCard = ({ meal, onUpdate, onDelete, waterGlassesConsumed }) => {
  const [tempServings, setTempServings] = useState(meal.servings);
  const [showCheckmark, setShowCheckmark] = useState(false);

  const handleServingsChange = (delta: number) => {
    const newServings = Math.max(0, tempServings + delta);
    setTempServings(newServings);
    setShowCheckmark(true);
  };

  const handleConfirm = () => {
    if (tempServings === 0) {
      onDelete(meal.id);
    } else {
      onUpdate(meal.id, { servings: tempServings });
    }
    setShowCheckmark(false);
  };

  return (
    <View style={styles.mealCard}>
      <View style={styles.mealHeader}>
        <View style={styles.mealInfo}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
            <Text style={styles.mealTypeText}>
              {meal.meal_type.charAt(0).toUpperCase() + meal.meal_type.slice(1)}
            </Text>
          </View>
          <Text style={[styles.mealName, { fontFamily: "Outfit_500Medium" }]}>
            {meal.name.charAt(0).toUpperCase() + meal.name.slice(1)}
          </Text>
          {meal.meal_type !== "water" && (
            <Text style={styles.mealDetails}>
              {meal.calories} Kcal • {meal.protein}g Protein • {meal.carbs}g Carbs • {meal.fat}g Fat
            </Text>
          )}
        </View>

        <View style={{ alignItems: "flex-end" }}>
          <View style={styles.mealServings}>
            {meal.meal_type === "water" ? (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={styles.servingsCount}>{waterGlassesConsumed}</Text>
                <Text style={styles.servingsLabel}>
                  {waterGlassesConsumed === 1 ? " glass" : " glasses"}
                </Text>
              </View>
            ) : (
              <>
                <Text style={styles.servingsCount}>{tempServings}</Text>
                <Text style={styles.servingsLabel}>servings</Text>
              </>
            )}
          </View>

          <View style={styles.mealActions}>
            <TouchableOpacity onPress={() => handleServingsChange(-1)} style={styles.actionButton}>
              <Ionicons name="remove" size={18} color="#64748B" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleServingsChange(1)} style={styles.actionButton}>
              <Ionicons name="add" size={18} color="#64748B" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleServingsChange(-tempServings)}
              style={[styles.actionButton, styles.deleteButton]}
            >
              <Ionicons name="trash-outline" size={18} color="#EF4444" />
            </TouchableOpacity>
          </View>

          {showCheckmark && (
            <TouchableOpacity onPress={handleConfirm} style={styles.confirmButton}>
              <Ionicons name="checkmark" size={16} color="white" />
              <Text style={[styles.confirmButtonText, { fontFamily: "Outfit_500Medium" }]}>Save</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};