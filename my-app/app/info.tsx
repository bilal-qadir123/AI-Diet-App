import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  TextInput,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import { useRef, useEffect, useState } from "react";
import { styles } from "../styles/Info";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import HomeBackground from "@/styles/HomeBackground";

export default function Info() {
  const [step, setStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [activityLevel, setActivityLevel] = useState("");
  const [primaryGoal, setPrimaryGoal] = useState("");
  const [diet, setDiet] = useState("");
  const [allergies, setAllergies] = useState("");
  const [healthConditions, setHealthConditions] = useState([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const totalSteps = 11;
  const progress = ((step + 1) / totalSteps) * 100;

  useEffect(() => fadeIn(), [step]);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const fadeIn = () =>
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

  const fadeOut = (callback) =>
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(callback);

  const validateStep = () => {
    const newErrors = {};
    switch (step) {
      case 1:
        if (name.length === 0) newErrors.name = "Enter your name";
        if (!name.trim() || name.trim().length < 2)
          newErrors.name = "Name must be at least 2 characters";
        if (/\d/.test(name.trim()))
          newErrors.name = "Name cannot contain numbers";
        break;
      case 2:
        const ageNum = parseInt(age);
        if (!age.trim() || isNaN(ageNum) || ageNum < 10 || ageNum > 120)
          newErrors.age = "Enter valid age (10-120)";
        break;
      case 3:
        if (!gender) newErrors.gender = "Select your gender";
        break;
      case 4:
        const weightNum = parseFloat(weight);
        const heightNum = parseFloat(height);
        if (
          !weight.trim() ||
          isNaN(weightNum) ||
          weightNum < 30 ||
          weightNum > 300
        )
          newErrors.weight = "Weight 30-300kg";
        if (
          !height.trim() ||
          isNaN(heightNum) ||
          heightNum < 90 ||
          heightNum > 250
        )
          newErrors.height = "Height 90-250cm";
        break;
      case 5:
        if (!activityLevel) newErrors.activityLevel = "Select activity level";
        break;
      case 6:
        if (!primaryGoal) newErrors.primaryGoal = "Select your primary goal";
        break;
      case 7:
        if (!diet) newErrors.diet = "Select diet preference";
        if (!allergies.trim()) setAllergies("None");
        break;
      case 8:
        break;
      case 9:
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
          newErrors.email = "Enter a valid email";
        break;
      case 10:
        const passwordErrors = [];
        if (password.length < 6) passwordErrors.push("at least 6 characters");
        if (password.length > 20) passwordErrors.push("at most 20 characters");
        if (!/[0-9]/.test(password)) passwordErrors.push("one number");
        if (!/[A-Z]/.test(password))
          passwordErrors.push("one uppercase letter");

        if (passwordErrors.length > 0)
          newErrors.password =
            "Password must contain " + passwordErrors.join(", ") + ".";
        break;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) fadeOut(() => setStep(step + 1));
  };

  const handleSubmit = async () => {
    if (validateStep()) {
      try {
        if (healthConditions.length === 0) setHealthConditions(["None"]);
        await fetch("http://localhost:5000/receive-info", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            age,
            gender,
            weight,
            height,
            activityLevel,
            primaryGoal,
            diet,
            allergies,
            healthConditions: healthConditions.length
              ? healthConditions
              : ["None"],
            email,
            password,
          }),
        });
        nextStep();
      } catch (error) {
        console.error("Error sending data:", error);
        Alert.alert("Error", "Failed to submit your information.");
      }
    }
  };

  const renderInputStep = (title, inputProps, errorKey) => (
    <Animated.View style={{ alignItems: "center", width: "100%" }}>
      <View style={styles.content}>
        <Text style={styles.heading}>{title}</Text>
        <TextInput
          {...inputProps}
          style={[
            styles.input,
            errorKey && errors[errorKey] ? styles.inputError : null,
          ]}
          placeholderTextColor="#9CA3AF"
        />
        {errorKey && errors[errorKey] && (
          <Text style={styles.errorText}>{errors[errorKey]}</Text>
        )}
        <TouchableOpacity
          style={[
            styles.primaryBtn,
            { marginTop: 20 },
            Platform.OS === "web" && { cursor: "pointer" },
          ]}
          onPress={nextStep}
        >
          <Text style={styles.primaryBtnText}>Next</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderPickerStep = (
    title,
    selectedValue,
    setValue,
    options,
    errorKey
  ) => (
    <Animated.View style={{ alignItems: "center", width: "100%" }}>
      <View style={styles.content}>
        <Text style={styles.heading}>{title}</Text>
        <View
          style={[
            styles.pickerWrapper,
            errorKey && errors[errorKey] ? styles.inputError : null,
          ]}
        >
          <Picker
            selectedValue={selectedValue}
            onValueChange={(val) => setValue(val)}
            style={styles.picker}
          >
            {options.map((opt) => (
              <Picker.Item
                key={opt.value}
                label={opt.label}
                value={opt.value}
              />
            ))}
          </Picker>
        </View>
        {errorKey && errors[errorKey] && (
          <Text style={styles.errorText}>{errors[errorKey]}</Text>
        )}
        <TouchableOpacity
          style={[
            styles.primaryBtn,
            { marginTop: 20 },
            Platform.OS === "web" && { cursor: "pointer" },
          ]}
          onPress={nextStep}
        >
          <Text style={styles.primaryBtnText}>Next</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.progressBarContainer}>
          <Animated.View
            style={[
              styles.progressBarFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ["0%", "100%"],
                }),
              },
            ]}
          />
        </View>

        {step === 0 && (
          <Animated.View style={{ alignItems: "center", width: "100%" }}>
            <View style={styles.content}>
              <Text style={styles.heading}>Hey there!</Text>
              <Text style={styles.prompt}>
                A few fun questions coming your way! 😄 {"\n"} Don’t worry it’s
                quick and all about YOU!
              </Text>
              <TouchableOpacity
                style={[
                  styles.primaryBtn,
                  Platform.OS === "web" && { cursor: "pointer" },
                ]}
                onPress={nextStep}
              >
                <Text style={styles.primaryBtnText}>I’m Excited!</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        {step === 1 &&
          renderInputStep(
            "Let’s start with your name! 😃",
            {
              placeholder: "Your name",
              value: name,
              onChangeText: setName,
            },
            "name"
          )}

        {step === 2 &&
          renderInputStep(
            "Candle count, please! 🕯️",
            {
              placeholder: "Age",
              keyboardType: "numeric",
              value: age,
              onChangeText: setAge,
            },
            "age"
          )}

        {step === 3 &&
          renderPickerStep(
            "Heels 👠 or sneakers 👟?",
            gender,
            setGender,
            [
              { label: "Select gender", value: "" },
              { label: "Male", value: "Male" },
              { label: "Female", value: "Female" },
              { label: "Other", value: "Other" },
            ],
            "gender"
          )}

        {step === 4 && (
          <Animated.View style={{ alignItems: "center", width: "100%" }}>
            <View style={styles.content}>
              <Text style={styles.heading}>
                How heavy? ⚖️ {"\n"}How tall? 🗼
              </Text>
              <TextInput
                style={[styles.input, errors.weight ? styles.inputError : null]}
                placeholder="Weight (kg)"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={weight}
                onChangeText={setWeight}
              />
              {errors.weight && (
                <Text style={styles.errorText}>{errors.weight}</Text>
              )}
              <TextInput
                style={[
                  styles.input,
                  { marginTop: 12 },
                  errors.height ? styles.inputError : null,
                ]}
                placeholder="Height (cm)"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={height}
                onChangeText={setHeight}
              />
              {errors.height && (
                <Text style={styles.errorText}>{errors.height}</Text>
              )}
              <TouchableOpacity
                style={[
                  styles.primaryBtn,
                  { marginTop: 20 },
                  Platform.OS === "web" && { cursor: "pointer" },
                ]}
                onPress={nextStep}
              >
                <Text style={styles.primaryBtnText}>Next</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        {step === 5 &&
          renderPickerStep(
            "What’s your daily vibe? 💤 or 🏃‍♂️?",
            activityLevel,
            setActivityLevel,
            [
              { label: "Select activity level", value: "" },
              {
                label: "Sedentary (little or no exercise)",
                value: "Sedentary",
              },
              {
                label: "Lightly active (1–3 days/week)",
                value: "Lightly active",
              },
              {
                label: "Moderately active (3–5 days/week)",
                value: "Moderately active",
              },
              { label: "Very active (6–7 days/week)", value: "Very active" },
            ],
            "activityLevel"
          )}

        {step === 6 &&
          renderPickerStep(
            "What’s the 🎯? Lose, gain, or maintain?",
            primaryGoal,
            setPrimaryGoal,
            [
              { label: "Select goal", value: "" },
              { label: "Weight loss", value: "Weight loss" },
              { label: "Weight gain", value: "Weight gain" },
              { label: "Maintenance", value: "Maintenance" },
            ],
            "primaryGoal"
          )}

        {step === 7 && (
          <Animated.View style={{ alignItems: "center", width: "100%" }}>
            <View style={styles.content}>
              <Text style={styles.heading}>What’s your foodie style?</Text>
              <View
                style={[
                  styles.pickerWrapper,
                  errors.diet ? styles.inputError : null,
                ]}
              >
                <Picker
                  selectedValue={diet}
                  onValueChange={(val) => setDiet(val)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select diet" value="" />
                  <Picker.Item label="Non-Vegetarian" value="Non-Vegetarian" />
                  <Picker.Item label="Vegetarian" value="Vegetarian" />
                  <Picker.Item
                    label="No restrictions"
                    value="No restrictions"
                  />
                </Picker>
              </View>
              {errors.diet && (
                <Text style={styles.errorText}>{errors.diet}</Text>
              )}
              <TextInput
                style={[styles.input, { marginTop: 12 }]}
                placeholder="Intolerances (optional)"
                placeholderTextColor="#9CA3AF"
                value={allergies}
                onChangeText={setAllergies}
              />
              <TouchableOpacity
                style={[
                  styles.primaryBtn,
                  { marginTop: 20 },
                  Platform.OS === "web" && { cursor: "pointer" },
                ]}
                onPress={nextStep}
              >
                <Text style={styles.primaryBtnText}>Next</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        {step === 8 && (
          <Animated.View style={{ alignItems: "center", width: "100%" }}>
            <View style={styles.content}>
              <Text style={styles.heading}>Health Conditions (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Diabetes, Hypertension, Heart disease, Other"
                placeholderTextColor="#9CA3AF"
                value={healthConditions.join(", ")}
                onChangeText={(text) =>
                  setHealthConditions(
                    text.split(",").map((item) => item.trim())
                  )
                }
              />
              <TouchableOpacity
                style={[
                  styles.primaryBtn,
                  { marginTop: 20 },
                  Platform.OS === "web" && { cursor: "pointer" },
                ]}
                onPress={nextStep}
              >
                <Text style={styles.primaryBtnText}>
                  {healthConditions.length === 0 ||
                  healthConditions[0] === "None"
                    ? "Skip"
                    : "Next"}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        {step === 9 && (
          <Animated.View style={{ alignItems: "center", width: "100%" }}>
            <View style={styles.content}>
              <Text style={styles.heading}>
                Drop your email so we can stay in touch! 📬
              </Text>
              <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                style={[styles.input, errors.email ? styles.inputError : null]}
                placeholderTextColor="#9CA3AF"
              />
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}

              <TouchableOpacity
                style={[
                  styles.primaryBtn,
                  { marginTop: 20 },
                  Platform.OS === "web" && { cursor: "pointer" },
                ]}
                onPress={async () => {
                  if (validateStep()) {
                    try {
                      const response = await fetch(
                        "http://localhost:5000/receive-info",
                        {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            name,
                            age,
                            gender,
                            weight,
                            height,
                            activityLevel,
                            primaryGoal,
                            diet,
                            allergies,
                            healthConditions: healthConditions.length
                              ? healthConditions
                              : ["None"],
                            email,
                            password: "temp",
                          }),
                        }
                      );
                      const data = await response.json();

                      if (data.exists) {
                        setErrors({
                          email: "Email already exists, please login",
                        });
                        return; // stop here
                      }

                      setErrors({});
                      nextStep();
                    } catch (err) {
                      console.error("Error checking email:", err);
                      setErrors({ email: "Unable to check email right now" });
                    }
                  }
                }}
              >
                <Text style={styles.primaryBtnText}>Next</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        {step === 10 && (
          <Animated.View
            style={{ alignItems: "center", width: "100%", marginTop: -5 }}
          >
            <View style={styles.content}>
              <Text style={styles.heading}>Choose a strong password.</Text>
              <Text style={styles.passwordCriteria}>• 6-20 characters</Text>
              <Text style={styles.passwordCriteria}>• At least one number</Text>
              <Text style={styles.passwordCriteria}>
                • At least one uppercase letter
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  width: "113%",
                }}
              >
                <TextInput
                  style={[
                    styles.input,
                    errors.password ? styles.inputError : null,
                    { flex: 1 },
                  ]}
                  placeholder="Password"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={24}
                    color="#9CA3AF"
                    style={{ marginLeft: -35 }}
                  />
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
              <TouchableOpacity
                style={[
                  styles.primaryBtn,
                  { marginTop: 15 },
                  Platform.OS === "web" && { cursor: "pointer" },
                ]}
                onPress={handleSubmit}
              >
                <Text style={styles.primaryBtnText}>Finish</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        {step > 10 && (
          <Animated.View style={{ alignItems: "center", width: "100%" }}>
            <View style={styles.content}>
              <Text style={styles.heading}>All Set!</Text>
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
