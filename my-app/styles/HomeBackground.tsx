import { View, Animated, StyleSheet, Dimensions, Easing } from "react-native";
import { useEffect, useRef, useMemo } from "react";

const { width, height } = Dimensions.get("window");

const imageSources = [
  require("../assets/images/food1-min.png"),
  require("../assets/images/food2-min.png"),
  require("../assets/images/food3-min.png"),
  require("../assets/images/food4-min.png"),
  require("../assets/images/food5-min.png"),
  require("../assets/images/food6-min.png"),
  require("../assets/images/food7-min.png"),
  require("../assets/images/food8-min.png"),
  require("../assets/images/food9-min.png"),
  require("../assets/images/food10-min.png"),
];

const positions = [
  { top: 10, left: 10 },
  { top: height - 150, left: 10 },
  { top: height * 0.4, left: 30 },
  { top: height - 80, left: width - 70 },
  { top: height * 0.5, left: width - 60 },
  { top: height - 150, left: 100 },
  { top: height * 0.35, left: width * 0.45 },
  { top: 40, left: width * 0.75 },
  { top: 30, left: width * 0.35 },
  { top: height * 0.6, left: width * 0.5 },
];

const getRandomSize = () => 50 + Math.random() * 100;

const FloatingImage = ({ source, position }: { source: any; position: { top: number; left: number } }) => {
  const floatAnim = useRef(new Animated.Value(0)).current;

  const size = useMemo(() => getRandomSize(), []);
  const opacity = useMemo(() => 0.2, []);

  const floatRange = Math.max(8, size * 0.15);

  useEffect(() => {
    const duration = 3000 + Math.random() * 3000;
    const delay = Math.random() * 2000;

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -floatRange,
          duration: duration / 2,
          delay,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: floatRange,
          duration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: duration / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [floatRange]);


  return (
    <Animated.Image
      source={source}
      style={{
        position: "absolute",
        top: position.top,
        left: position.left,
        width: size,
        height: size,
        opacity,
        transform: [{ translateY: floatAnim }],
      }}
      resizeMode="contain"
    />
  );
};

export default function HomeBackground( { style }) {
  return (
    <View style={[styles.container, style]}>
      {imageSources.map((src, i) => (
        <FloatingImage key={i} source={src} position={positions[i]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
    backgroundColor: "transparent",
  },
});
