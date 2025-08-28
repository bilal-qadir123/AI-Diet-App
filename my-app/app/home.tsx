import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import HomeBackground from "../styles/HomeBackground";
import { useRouter } from "expo-router";
import { styles } from "../styles/Home";
export default function Welcome() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <HomeBackground style={{ position: "absolute", top: -130, left: 0, right: 0, bottom: 0 }} />
      <Image
        source={require("../assets/images/noise.png")}
        style={styles.noise}
        resizeMode="repeat"
      />
      <View style={styles.content}>
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.icon}
        />
        <Text style={styles.title}>Welcome to Stickr</Text>
        <Text style={styles.tagline}>Out of Sight, Never Out of Sync</Text>
        <Image
          source={require("../assets/images/human.png")}
          style={styles.illustration}
        />

        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.push("/info")}
          >
            <Text style={styles.primaryBtnText}>Get Started</Text>
          </TouchableOpacity>
          <TouchableOpacity
          onPress={() => router.push("/login")}
          >
            <Text style={styles.secondaryText}>Already have an account?</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

