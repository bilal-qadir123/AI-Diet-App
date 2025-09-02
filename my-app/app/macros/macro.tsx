import React from "react";
import { View, Text } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { styles } from "../../styles/screens/Dashboard";

type Macro = {
  name: string;
  grams: number;
  calories: number;
  color: string;
};

type MacroCircleProps = {
  calorieTarget: number;
  carbs: number;
  protein: number;
  fat: number;
  water: number;
};

export default function MacroCircle({ calorieTarget, carbs, protein, fat }: MacroCircleProps) {
  const radius = 70;
  const strokeWidth = 16;
  const center = radius + strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;

  // convert macros into calories
  const macros: Macro[] = [
    { name: "Protein", grams: protein, calories: protein * 4, color: "#4F46E5" },
    { name: "Carbs", grams: carbs, calories: carbs * 4, color: "#F59E0B" },
    { name: "Fat", grams: fat, calories: fat * 9, color: "#EF4444" },
  ];

  const totalCalories = macros.reduce((sum, m) => sum + m.calories, 0);

  let startAngle = 0;

  return (
    <View style={styles.macroContainer}>
      <View style={styles.circleWrapper}>
        <Svg width={(radius + strokeWidth) * 2} height={(radius + strokeWidth) * 2}>
          <Circle
            stroke="#f3f4f6"
            fill="none"
            cx={center}
            cy={center}
            r={radius}
            strokeWidth={strokeWidth}
          />
          {macros.map((macro, index) => {
            const arcFraction = macro.calories / calorieTarget;
            const segmentLength = circumference * arcFraction;

            const strokeDasharray = `${segmentLength} ${circumference}`;
            const strokeDashoffset = circumference - startAngle * circumference;

            const circle = (
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

            startAngle += arcFraction;

            return circle;
          })}
        </Svg>
        <View style={styles.circleCenter}>
          <Text style={styles.circleCenterText}>{calorieTarget}</Text>
          <Text style={styles.circleCenterSubtext}>kcal target</Text>
        </View>
      </View>

      <View style={styles.macroDetails}>
        {macros.map((macro, idx) => {
          const percentage = parseInt(((macro.calories / calorieTarget) * 100).toFixed(1));
          return (
            <View key={idx} style={styles.macroRow}>
              <View style={[styles.macroDot, { backgroundColor: macro.color }]} />
              <View style={styles.macroTextContainer}>
                <Text style={styles.macroName}>{macro.name}</Text>
                <Text style={styles.macroAmount}>{macro.grams}g ({macro.calories} kcal)</Text>
              </View>
              <Text style={styles.macroPercentage}>{percentage}%</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
