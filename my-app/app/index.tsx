import { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, Image } from "react-native";
import { useRouter } from "expo-router";
import { styles } from "../styles/Index";
export default function Index() {
  const router = useRouter();
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.delay(1000),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
      { iterations: 1 }
    ).start();

    const timer = setTimeout(() => router.replace("/home"), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require("../assets/images/logo.png")}
        style={[styles.logo, { opacity }]}
        accessibilityLabel="Splash Logo"
      />
    </View>
  );
}