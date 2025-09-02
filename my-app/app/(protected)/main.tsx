import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../../styles/screens/Dashboard";
import MacroCircle from "../macros/macro";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const { token } = useAuth();
  
  const hour = new Date().getUTCHours() + 5;
  const normalizedHour = hour % 24;

  let emoji = "☀️,";
  let greeting = "Good morning";

  if (normalizedHour >= 12 && normalizedHour < 18) {
    emoji = "🌇,";
    greeting = "Good afternoon";
  } else if (normalizedHour >= 18 || normalizedHour < 5) {
    emoji = "🌙,";
    greeting = "Good evening";
  }

  const emojis = ["😎", "🌟", "😃", "😌", "🤗", "😄", "🤠", "🫶"];
  const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

  type StatCardProps = {
    icon: string;
    title: string;
    value: string;
    unit: string;
    color: string;
  };
  
  const StatCard = ({ icon, title, value, unit, color }: StatCardProps) => (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color }]}>
        <Ionicons name={icon as any} size={20} color="white" />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statUnit}>{unit}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  type QuickActionProps = {
    icon: string;
    title: string;
    color: string;
    onPress?: () => void;
  };
  
  const QuickAction = ({ icon, title, onPress, color }: QuickActionProps) => (
    <TouchableOpacity style={styles.quickAction} onPress={onPress ?? (() => {})}>
      <View style={[styles.actionIcon, { backgroundColor: color }]}>
        <Ionicons name={icon as any} size={22} color="white" />
      </View>
      <Text style={styles.actionText}>{title}</Text>
    </TouchableOpacity>
  );
  
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return;
      try {
        const res = await axios.get("http://localhost:5000/auth/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(res.data);
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);
  
  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" color="#4F46E5" />;
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}> {greeting} {emoji} </Text>
          <Text style={styles.userName}> {profile?.user?.name} {randomEmoji} </Text>
        </View>
        <TouchableOpacity style={styles.profileButton}>
          <Ionicons name="person-outline" size={24} color="#4F46E5" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today&apos;s Nutrition</Text>
        {profile && (
          <MacroCircle
            calorieTarget={profile?.nutrition?.calorie_target}
            carbs={profile?.nutrition?.carbs_g}
            protein={profile?.nutrition?.protein_g}
            fat={profile?.nutrition?.fat_g}
            water={profile?.nutrition?.water_l}
          />
        )}
      </View>

      <View style={styles.section}>
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>Daily Stats</Text>
    <TouchableOpacity>
      <Text style={styles.seeAll}>See all</Text>
    </TouchableOpacity>
  </View>
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    style={styles.statsContainer}
  >
    {/* Calories from backend */}
    {profile && (
      <StatCard
        icon="flame-outline"
        title="Calories"
        value={String(profile?.nutrition?.calorie_target)}
        unit="kcal"
        color="#EF4444"
      />
    )}

    {/* Water from backend */}
    {profile && (
      <StatCard
        icon="water-outline"
        title="Water"
        value={String(profile?.nutrition?.water_l)}
        unit="L"
        color="#3B82F6"
      />
    )}

    {/* Steps placeholder */}
    <StatCard
      icon="footsteps-outline"
      title="Steps"
      value="7,642"
      unit="steps"
      color="#10B981"
    />
  </ScrollView>
</View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsContainer}>
          <QuickAction icon="add-outline" title="Log Meal" color="#4F46E5" />
          <QuickAction icon="camera-outline" title="Scan Food" color="#F59E0B" />
          <QuickAction icon="barbell-outline" title="Workout" color="#EF4444" />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Meals</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.mealCard}>
          <View style={styles.mealInfo}>
            <Text style={styles.mealName}>Breakfast Burrito</Text>
            <Text style={styles.mealTime}>8:30 AM • 420 kcal</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </View>
        <View style={styles.mealCard}>
          <View style={styles.mealInfo}>
            <Text style={styles.mealName}>Greek Salad</Text>
            <Text style={styles.mealTime}>12:15 PM • 320 kcal</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </View>
      </View>
    </ScrollView>
  );
}
