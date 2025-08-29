import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  Alert,
  Image,
} from "react-native";
import { useEffect, useState } from "react";
import { styles } from "../styles/Info";
import HomeBackground from "@/styles/HomeBackground";
import { useRouter } from "expo-router";
import { useAuth } from "./context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const { login,  user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace("/main");
    }
  }, [user, router]);

  const validate = () => {
    const newErrors: any = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "Enter a valid email";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    await login(email, password);
    if (user) router.replace("/main");
    if (validate()) {
      try {
        const response = await fetch("http://localhost:5000/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
  
        if (response.ok && data.success) {
          Alert.alert("Success", "Logged in successfully");
          router.push("/main");
        } else {
          if (data.error === "Incorrect email or password") {
            setErrors({ email: "", password: "Incorrect email or password" });
          } else {
            Alert.alert("Error", data.error || "Login failed");
          }
        }
      } catch {
        Alert.alert("Error", "Unable to connect to server");
      }
    }
  };  

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <HomeBackground
        style={{
          position: "absolute",
          top: -130,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />
      <View style={styles.loginContent}>
      <Image
        source={require("../assets/images/door.png")}
        style={{ width: 100, height: 150, borderRadius: 50, marginBottom: 20 }}
        resizeMode="repeat"
      />
        <Text style={styles.heading}>Welcome Back!</Text>
        <TextInput
          style={[styles.input, errors.email ? styles.inputError : null]}
          placeholder="Email"
          placeholderTextColor="#9CA3AF"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        <TextInput
          style={[
            styles.input,
            { marginTop: 12 },
            errors.password ? styles.inputError : null,
          ]}
          placeholder="Password"
          placeholderTextColor="#9CA3AF"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        {errors.password && (
          <Text style={styles.errorText}>{errors.password}</Text>
        )}
        <TouchableOpacity
          style={[
            styles.primaryBtn,
            { marginTop: 20 },
            Platform.OS === "web" && { cursor: "pointer" },
          ]}
          onPress={handleLogin}
        >
          <Text style={styles.primaryBtnText}>Login</Text>
        </TouchableOpacity>
        <Text
          style={{ marginTop: 16, color: "#4F46E5", fontSize: 15 }}
          onPress={() => router.push("/info")}
        >
          Click <Text style={{ fontWeight: "bold" }}>here</Text> to register
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}
