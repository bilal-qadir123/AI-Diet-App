import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  FlatList,
  Animated,
  Easing,
  Dimensions,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Circle } from "react-native-svg";
import { styles } from "../../styles/screens/Dashboard";
import { useAuth } from "../context/AuthContext";
import { waterService } from "../services/waterService";
import { MealCard } from "../components/MealCard";
import { CelebrationModal } from "../components/CelebrationModal";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

const NUTRITIONIX_APP_ID = "a6ae2c29";
const NUTRITIONIX_API_KEY = "c64a3a410503d12dcc880931bba9e352";
const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const API_BASE = "http://localhost:5000";

const startOfLocalDayISO = (d = new Date()) => {
  const local = new Date(d);
  local.setHours(0, 0, 0, 0);
  const yyyy = local.getFullYear();
  const mm = String(local.getMonth() + 1).padStart(2, "0");
  const dd = String(local.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const isSameLocalDay = (isoStringA: string, isoStringB: string) => {
  return startOfLocalDayISO(new Date(isoStringA)) === startOfLocalDayISO(new Date(isoStringB));
};

const MEAL_ORDER: Record<string, number> = {
  breakfast: 0,
  lunch: 1,
  dinner: 2,
  snack: 3,
};

const normalizeMeal = (m: any) => ({
  id: m.id,
  user_id: m.user_id,
  name: m.name,
  calories: Number(m.calories || 0),
  protein: Number(m.protein || 0),
  carbs: Number(m.carbs || 0),
  fat: Number(m.fat || 0),
  meal_type: (m.meal_type || m.mealType || "").toLowerCase(),
  timestamp: m.timestamp,
  servings: Number(m.servings || 0),
});

const StatCard = ({ icon, title, value, unit, color, onPress }: any) => (
  <TouchableOpacity onPress={onPress}>
    <LinearGradient colors={["#FFFFFF", "#F8FAFC"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color }]}>
        <Ionicons name={icon} size={20} color="white" />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={[styles.statUnit, { fontSize: 14, textTransform: "capitalize" }]}>{unit}</Text>
      <Text style={[styles.statTitle, { fontFamily: "Outfit_500Medium" }]}>{title}</Text>
    </LinearGradient>
  </TouchableOpacity>
);

const QuickActions = ({ icon, title, value, unit, color, onPress }: any) => (
  <TouchableOpacity onPress={onPress}>
    <LinearGradient colors={["#FFFFFF", "#F8FAFC"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.quickActionsCard}>
      <View style={[styles.statIcon, { backgroundColor: color }]}>
        <Ionicons name={icon} size={20} color="white" />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={[styles.statUnit, { fontSize: 14, textTransform: "capitalize" }]}>{unit}</Text>
      <Text style={[styles.statTitle, { fontFamily: "Outfit_500Medium" }]}>{title}</Text>
    </LinearGradient>
  </TouchableOpacity>
);

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const { token } = useAuth();

  const [modalVisible, setModalVisible] = useState(false);
  const [seeAllVisible, setSeeAllVisible] = useState(false);

  const [search, setSearch] = useState("");
  const [foodResults, setFoodResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [noResults, setNoResults] = useState(false);

  const [meals, setMeals] = useState<any[]>([]);
  const [buttonScale] = useState(new Animated.Value(1));
  const [number, setNumber] = useState(0);

  const [waterGlassesConsumed, setWaterGlassesConsumed] = useState(0);
  const [showFill, setShowFill] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [clickDisabled, setClickDisabled] = useState(false);
  const fillAnim = useRef(new Animated.Value(0)).current;

  const hour = new Date().getUTCHours() + 5;
  const normalizedHour = hour % 24;
  let emoji = "☀️";
  let greeting = "Good morning";
  if (normalizedHour >= 12 && normalizedHour < 18) {
    emoji = "🌇";
    greeting = "Good afternoon";
  } else if (normalizedHour >= 18 || normalizedHour < 5) {
    emoji = "🌙";
    greeting = "Good evening";
  }
  const emojis = ["😎", "🌟", "😃", "😌", "🤗", "😄", "🤠", "🫶"];
  const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

  const QuickAction = ({ icon, title, onPress, color }) => (
    <TouchableOpacity onPress={onPress ?? (() => {})}>
      <LinearGradient colors={["#FFFFFF", "#F8FAFC"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.quickAction}>
        <View style={[styles.actionIcon, { backgroundColor: color }]}>
          <Ionicons name={icon} size={22} color="white" />
        </View>
        <Text style={styles.actionText}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const fetchProfile = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_BASE}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWater = async () => {
    if (!token) return;
    try {
      const waterData = await waterService.getWater(token);
      setWaterGlassesConsumed((waterData.waterConsumed / 0.25));
    } catch (err) {
      console.error("Error fetching water:", err);
    }
  };

  const fetchMealsForToday = async () => {
    if (!token) return;
    try {
      const today = startOfLocalDayISO();
      const res = await axios.get(`${API_BASE}/food/entries`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { date: today },
      });

      const list = Array.isArray(res.data?.entries) ? res.data.entries : Array.isArray(res.data) ? res.data : [];
      setMeals(list.map(normalizeMeal).filter((m) => isSameLocalDay(m.timestamp, new Date().toISOString())));
    } catch (err) {
      console.error("Error fetching meals:", err);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchProfile();
    fetchMealsForToday();
    fetchWater();
  }, [token]);

  const handleSearch = async () => {
    if (!search) return;
    setSearching(true);
    setNumber(0);

    try {
      const res = await axios.post(
        "https://trackapi.nutritionix.com/v2/natural/nutrients",
        { query: search },
        {
          headers: {
            "x-app-id": NUTRITIONIX_APP_ID,
            "x-app-key": NUTRITIONIX_API_KEY,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.data.foods || res.data.foods.length === 0) {
        setFoodResults([]);
        setNoResults(true);
      } else {
        const parsed = res.data.foods.map((item) => ({
          id: uuidv4(),
          name: item.food_name,
          calories: Math.round(item.nf_calories || 0),
          protein: Math.round(item.nf_protein || 0),
          carbs: Math.round(item.nf_total_carbohydrate || 0),
          fat: Math.round(item.nf_total_fat || 0),
        }));

        setFoodResults(parsed);
        setNoResults(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const getMealType = () => {
    const now = new Date();
    const hours = now.getHours();

    if (hours >= 5 && hours < 11) return "🍳 Breakfast";
    if (hours >= 11 && hours < 16) return "🥗 Lunch";
    if (hours >= 16 && hours <= 21) return "🍽️ Dinner";
    return "🍟 Snack";
  };

  const addMeal = async (food: any) => {
    setNumber(0);
    const mealType = getMealType();
    try {
      const res = await fetch(`${API_BASE}/food/log`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: food.name,
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fat: food.fat,
          mealType,
          timestamp: new Date().toISOString(),
          servings: number > 0 ? number : 1,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error("Backend error:", data?.error || "Unknown error");
        Alert.alert("Error", data?.error || "Failed to log food intake");
      } else {
        await fetchMealsForToday();
      }
    } catch (err) {
      console.error("Network error:", err);
      Alert.alert("Error", "Unable to connect to server");
    }
  };

  const updateMeal = async (mealId: number, patch: Partial<any>) => {
    try {
      const res = await fetch(`${API_BASE}/food/update/${mealId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to update meal");
      }
      await fetchMealsForToday();
    } catch (err: any) {
      console.error("Update error:", err);
      Alert.alert("Error", err.message || "Failed to update meal");
    }
  };

  const deleteMeal = async (mealId: number) => {
    try {
      const res = await fetch(`${API_BASE}/food/delete/${mealId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to delete meal");
      }
      await fetchMealsForToday();
    } catch (err: any) {
      console.error("Delete error:", err);
      Alert.alert("Error", err.message || "Failed to delete meal");
    }
  };

  const handleAddFood = (food: any) => {
    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 1.15, duration: 100, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    addMeal(food);
  };

  const todayMealsSortedDesc = useMemo(() => {
    return [...meals].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [meals]);

  const recentMeals = useMemo(() => todayMealsSortedDesc.slice(0, 5), [todayMealsSortedDesc]);

  const totals = useMemo(
    () =>
      meals.reduce(
        (acc, f) => {
          acc.calories += Number(f.calories || 0);
          acc.protein += Number(f.protein || 0);
          acc.carbs += Number(f.carbs || 0);
          acc.fat += Number(f.fat || 0);
          return acc;
        },
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      ),
    [meals]
  );

  const groupedByMealType = useMemo(() => {
    const groups: Record<string, any[]> = { breakfast: [], lunch: [], dinner: [], snack: [] };
    meals.forEach((m) => {
      const key = (m.meal_type || "snack").toLowerCase();
      if (!groups[key]) groups[key] = [];
      groups[key].push(m);
    });

    Object.keys(groups).forEach((key) => {
      groups[key] = groups[key].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    });

    return Object.entries(groups)
      .sort((a, b) => (MEAL_ORDER[a[0]] ?? 99) - (MEAL_ORDER[b[0]] ?? 99))
      .map(([mealType, items]) => ({ mealType, items }));
  }, [meals]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  const radius = 70;
  const strokeWidth = 16;
  const center = radius + strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;

  const macros = [
    {
      name: "Protein",
      grams: profile?.nutrition?.protein_g,
      calories: (profile?.nutrition?.protein_g || 0) * 4,
      consumedGrams: totals.protein,
      consumedCalories: totals.protein * 4,
      color: "#4F46E5",
    },
    {
      name: "Carbs",
      grams: profile?.nutrition?.carbs_g,
      calories: (profile?.nutrition?.carbs_g || 0) * 4,
      consumedGrams: totals.carbs,
      consumedCalories: totals.carbs * 4,
      color: "#F59E0B",
    },
    {
      name: "Fat",
      grams: profile?.nutrition?.fat_g,
      calories: (profile?.nutrition?.fat_g || 0) * 9,
      consumedGrams: totals.fat,
      consumedCalories: totals.fat * 9,
      color: "#EF4444",
    },
  ];

  const handleDrinkWater = async () => {
    if (clickDisabled) return;
    setClickDisabled(true);
    const newValue = waterGlassesConsumed + 1;
    setWaterGlassesConsumed(newValue);
    fillAnim.setValue(0);
    setShowFill(true);
    
    Animated.timing(fillAnim, {
      toValue: 1,
      duration: 300,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
    
    setTimeout(() => {
      setShowFill(false);
      setClickDisabled(false);
    }, 500);
    
    if (newValue === Math.ceil((profile?.nutrition?.water_l || 0) / 0.25)) {
      setTimeout(() => setShowCelebration(true), 300);
    }

    try {
      await waterService.updateWater(token, newValue);
    } catch (err) {
      console.error("Failed to update water:", err);
      setWaterGlassesConsumed((prev) => prev - 1);
    }
  };

  const fillHeight = fillAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });

  const quickEditCalories = async (meal: any, delta: number) => {
    const next = Math.max(0, (meal.calories || 0) + delta);
    await updateMeal(meal.id, { calories: next });
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient colors={["#4F46E5", "#6366F1"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.headerGradient}>
          <View style={styles.greetingContainer}>
            <Text style={styles.greeting}>
              {greeting} {emoji}
            </Text>
            <Text style={styles.userName}>
              {profile?.user?.name} {randomEmoji}
            </Text>
            <Text style={styles.mealType}>Done with your {getMealType()}?</Text>
          </View>
        </LinearGradient>

        <View style={styles.contentContainer}>
          <View style={styles.nutritionCard}>
            <Text style={styles.sectionTitle}>Today's Nutrition</Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={styles.circleWrapper}>
                <Svg width={(radius + strokeWidth) * 2} height={(radius + strokeWidth) * 2}>
                  <Circle stroke="#F1F5F9" fill="none" cx={center} cy={center} r={radius} strokeWidth={strokeWidth} />
                  {macros.map((macro, index) => {
                    const target = profile?.nutrition?.calorie_target || 1;
                    const arcFraction = Math.min(1, (macro.consumedCalories || 0) / target);
                    const segmentLength = circumference * arcFraction;
                    const strokeDasharray = `${segmentLength} ${circumference}`;
                    const strokeDashoffset = circumference;
                    return (
                      <Circle
                        key={index}
                        stroke={macro.color}
                        fill="none"
                        cx={center}
                        cy={center}
                        r={radius}
                        strokeWidth={strokeWidth}
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        rotation={-90}
                        origin={`${center}, ${center}`}
                      />
                    );
                  })}
                </Svg>
                <View style={styles.circleCenter}>
                  <Text style={styles.circleCenterText}>
                    {totals.calories} / {profile?.nutrition?.calorie_target}
                  </Text>
                  <Text style={styles.circleCenterSubtext}>kcal target</Text>
                </View>
              </View>

              <View style={{ flex: 1, marginLeft: 16 }}>
                {macros.map((macro, idx) => {
                  const percentage = macro.calories > 0 ? Math.min(100, parseInt(((macro.consumedCalories / macro.calories) * 100).toFixed(1))) : 0;
                  return (
                    <View key={idx} style={styles.macroRow}>
                      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                          <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: macro.color, marginRight: 8 }} />
                          <Text style={{ color: "#475569", fontFamily: "Outfit_500Medium", fontSize: 14 }}>{macro.name}</Text>
                        </View>
                        <Text style={{ color: "#1E293B", fontFamily: "Outfit_400Regular", fontSize: 14 }}>{Math.min(percentage, 100)}%</Text>
                      </View>
                      <View style={styles.macroProgressBar}>
                        <View style={{ height: "100%", width: `${Math.min(percentage, 100)}%`, backgroundColor: macro.color, borderRadius: 3 }} />
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statsHeader}>
              <Text style={styles.sectionTitle}>Daily Stats</Text>
              <TouchableOpacity onPress={() => setSeeAllVisible(true)}>
                <Text style={[styles.seeAllText, { fontFamily: "Outfit_500Medium" }]}>See all</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScrollView}>
              <StatCard
                icon="flame-outline"
                value={`${totals.calories} / ${profile?.nutrition?.calorie_target}`}
                unit="kcal"
                color="#EF4444"
              />
              <View style={styles.statSpacer} />
              <StatCard
                icon="water-outline"
                value={`${waterGlassesConsumed} / ${Math.ceil((profile?.nutrition?.water_l || 0) / 0.25)}`}
                unit="glasses"
                color="#3B82F6"
                onPress={handleDrinkWater}
              />
              <View style={styles.statSpacer} />
              <StatCard icon="footsteps-outline" value="7,642" unit="steps" color="#10B981" />
            </ScrollView>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statsHeader}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScrollView}>
              <QuickActions icon="add-outline" title="Log Meal" color="#4F46E5" onPress={() => setModalVisible(true)} />
              <View style={styles.statSpacer} />
              <QuickActions icon="camera-outline" title="Scan Food" color="#F59E0B" />
              <View style={styles.statSpacer} />
              <QuickActions icon="barbell-outline" title="Workout" color="#EF4444" />
            </ScrollView>
          </View>

          <View style={styles.mealsContainer}>
            <View style={styles.mealsHeader}>
              <Text style={styles.sectionTitle}>Recent Meals</Text>
              <TouchableOpacity onPress={() => setSeeAllVisible(true)}>
                <Text style={[styles.seeAllText, { fontFamily: "Outfit_500Medium" }]}>See all</Text>
              </TouchableOpacity>
            </View>

            {recentMeals.length === 0 ? (
              <View style={styles.emptyMealsContainer}>
                <Ionicons name="fast-food-outline" size={40} color="#CBD5E1" />
                <Text style={{ color: "#64748B", fontFamily: "Outfit_400Regular", marginTop: 8 }}>No meals logged yet today.</Text>
              </View>
            ) : (
              recentMeals.map((meal) => (
                <MealCard key={meal.id} meal={meal} onUpdate={updateMeal} onDelete={deleteMeal} waterGlassesConsumed={waterGlassesConsumed} />
              ))
            )}
          </View>
        </View>
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Log Meal</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <View style={styles.searchInputContainer}>
                <Ionicons name="search" size={20} color="#64748B" style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search food..."
                  placeholderTextColor="#94A3B8"
                  value={search}
                  onChangeText={setSearch}
                />
              </View>
              <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                <Ionicons name="search" size={20} color="white" />
              </TouchableOpacity>
            </View>

            {searching && <ActivityIndicator size="small" color="#4F46E5" style={{ marginBottom: 16 }} />}

            {noResults ? (
              <View style={styles.emptyResultsContainer}>
                <Ionicons name="search-outline" size={40} color="#CBD5E1" />
                <Text style={{ color: "#64748B", fontFamily: "Outfit_400Regular", marginTop: 8 }}>No foods found</Text>
              </View>
            ) : (
              <FlatList
                data={foodResults}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.foodItem}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                      <View style={styles.foodInfo}>
                        <Text style={[styles.foodName, { fontFamily: "Outfit_500Medium" }]}>
                          {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
                        </Text>
                        <Text style={styles.foodDetails}>
                          {item.calories} kcal • P {item.protein}g • C {item.carbs}g • F {item.fat}g
                        </Text>
                      </View>
                      <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                        <View style={styles.foodActions}>
                          <TouchableOpacity style={styles.quantityButton} onPress={() => setNumber(number + 1)}>
                            {number === 0 ? <Ionicons name="add" size={20} color="#4F46E5" /> : <Text style={{ color: "#4F46E5", fontWeight: "bold" }}>{number}</Text>}
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.addFoodButton}
                            onPress={() => {
                              handleAddFood(item);
                            }}
                          >
                            <Ionicons name="checkmark" size={20} color="white" />
                          </TouchableOpacity>
                        </View>
                      </Animated.View>
                    </View>
                  </View>
                )}
                style={{ maxHeight: 300 }}
              />
            )}

            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => {
                setModalVisible(false);
                setFoodResults([]);
                setNoResults(false);
                setNumber(0);
              }}
            >
              <Text style={[styles.closeModalText, { fontFamily: "Outfit_500Medium", fontSize: 18 }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={seeAllVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>All Meals Today</Text>
              <TouchableOpacity onPress={() => setSeeAllVisible(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            {groupedByMealType.every(({ items }) => items.length === 0) ? (
              <View style={styles.emptyResultsContainer}>
                <Ionicons name="search-outline" size={40} color="#CBD5E1" />
                <Text
                  style={{
                    color: "#64748B",
                    fontFamily: "Outfit_400Regular",
                    marginTop: 8,
                  }}
                >
                  No meals
                </Text>
              </View>
            ) : (
              <ScrollView style={{ marginBottom: 16 }}>
                {groupedByMealType
                  .filter(({ items }) => items.length > 0)
                  .map(({ mealType, items }) => (
                    <View key={mealType} style={{ marginBottom: 24 }}>
                      <Text
                        style={{
                          color: "#1E293B",
                          fontFamily: "Outfit_700Bold",
                          fontSize: 18,
                          marginBottom: 12,
                          textTransform: "capitalize",
                        }}
                      >
                        {mealType} ({items.length})
                      </Text>
                      {items.map((meal) => (
                        <MealCard
                          key={meal.id}
                          meal={meal}
                          onUpdate={updateMeal}
                          onDelete={deleteMeal}
                        />
                      ))}
                    </View>
                  ))}
              </ScrollView>
            )}

            <TouchableOpacity style={styles.doneButton} onPress={() => setSeeAllVisible(false)}>
              <Text style={[styles.doneButtonText, { fontFamily: "Outfit_500Medium", fontSize: 18 }]}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <CelebrationModal visible={showCelebration} onClose={() => setShowCelebration(false)} />
    </View>
  );
}