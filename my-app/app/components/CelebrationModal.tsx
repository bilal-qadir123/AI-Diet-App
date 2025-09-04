import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Modal, Animated, Easing, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../../styles/screens/Dashboard";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export const CelebrationModal = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, friction: 5, useNativeDriver: true }),
        Animated.timing(confettiAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0);
      confettiAnim.setValue(0);
    }
  }, [visible]);

  const confettiTransforms = Array.from({ length: 30 }).map(() => {
    const rotate = confettiAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", `${360 + Math.random() * 360}deg`],
    });
    const translateY = confettiAnim.interpolate({ inputRange: [0, 1], outputRange: [0, screenHeight] });
    const translateX = confettiAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, (Math.random() - 0.5) * screenWidth * 2],
    });
    return { rotate, translateY, translateX };
  });

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.celebrationContainer}>
        <Animated.View style={[styles.celebrationContent, { transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.trophyIcon}>
            <Ionicons name="trophy" size={30} color="white" />
          </View>
          <Text style={styles.celebrationTitle}>Congratulations!</Text>
          <Text style={styles.celebrationMessage}>You've reached your daily water goal! Stay hydrated and healthy!</Text>
          <TouchableOpacity onPress={onClose} style={styles.celebrationButton}>
            <Text style={[styles.celebrationButtonText, { fontFamily: "Outfit_500Medium", fontSize: 18 }]}>Continue</Text>
          </TouchableOpacity>
        </Animated.View>
        {confettiTransforms.map((transform, index) => (
          <Animated.View
            key={index}
            style={{
              position: "absolute",
              top: 0,
              left: Math.random() * screenWidth,
              width: 10,
              height: 10,
              backgroundColor: ["#EF4444", "#3B82F6", "#F59E0B", "#10B981", "#8B5CF6"][index % 5],
              borderRadius: 5,
              transform: [
                { translateY: transform.translateY },
                { translateX: transform.translateX },
                { rotate: transform.rotate },
              ],
              opacity: confettiAnim.interpolate({ inputRange: [0, 0.8, 1], outputRange: [1, 1, 0] }),
            }}
          />
        ))}
      </View>
    </Modal>
  );
};