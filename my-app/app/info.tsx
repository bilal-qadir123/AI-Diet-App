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
  Image,
} from "react-native";
import { useRef, useEffect, useState, useMemo, useCallback } from "react";
import { styles } from "../styles/Info";
import { Picker } from "@react-native-picker/picker";
import HomeBackground from "@/styles/HomeBackground";
import { z } from "zod";
import { useAuth } from "./context/AuthContext";
import { useRouter } from "expo-router";

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
  const [healthConditions, setHealthConditions] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword] = useState(false);
  const [weightGoal, setWeightGoal] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { user, login } = useAuth();
  const router = useRouter();

  const totalSteps = 12;
  const progress = step === 0 ? 0 : (step / totalSteps) * 100;

  const kidEating = useMemo(
    () => require("../assets/images/kid-eating.png"),
    []
  );
  const kidStanding = useMemo(
    () => require("../assets/images/kid-standing.png"),
    []
  );

  useEffect(() => {
    if (user) {
      router.replace("/main");
    }
  }, [user, router]);

  const genderOptions = useMemo(
    () => [
      { label: "Select gender", value: "" },
      { label: "Male", value: "Male" },
      { label: "Female", value: "Female" },
      { label: "Other", value: "Other" },
    ],
    []
  );

  const activityOptions = useMemo(
    () => [
      { label: "Select activity level", value: "" },
      { label: "Sedentary (little or no exercise)", value: "Sedentary" },
      { label: "Lightly active (1–3 days/week)", value: "Lightly active" },
      {
        label: "Moderately active (3–5 days/week)",
        value: "Moderately active",
      },
      { label: "Very active (6–7 days/week)", value: "Very active" },
    ],
    []
  );

  const goalOptions = useMemo(
    () => [
      { label: "Select goal", value: "" },
      { label: "Weight loss", value: "Weight loss" },
      { label: "Weight gain", value: "Weight gain" },
      { label: "Maintenance", value: "Maintenance" },
    ],
    []
  );

  const onFadeIn = useCallback(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const onFadeOut = useCallback(
    (callback: () => void) => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) callback();
      });
    },
    [fadeAnim]
  );

  useEffect(() => {
    fadeAnim.setValue(0);
    onFadeIn();
  }, [step, fadeAnim, onFadeIn]);

  useEffect(() => {
    progressAnim.stopAnimation();
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [progress, progressAnim]);

  const stepSchemas = useMemo<Record<number, z.ZodSchema>>(
    () => ({
      1: z.object({
        name: z
          .string()
          .min(1, "Enter your name")
          .min(2, "Name must be at least 2 characters")
          .refine((v) => !/\d/.test(v.trim()), "Name cannot contain numbers"),
      }),
      2: z.object({
        age: z.preprocess(
          (v) => (typeof v === "string" ? Number(v) : v),
          z
            .number()
            .int("Enter valid age (10-120)")
            .min(10, "Enter valid age (10-120)")
            .max(120, "Enter valid age (10-120)")
        ),
      }),
      3: z.object({
        gender: z.string().min(1, "Select your gender"),
      }),
      4: z.object({
        weight: z.preprocess(
          (v) => (typeof v === "string" ? parseFloat(v) : v),
          z.number().min(30, "Weight 30-300kg").max(300, "Weight 30-300kg")
        ),
        height: z.preprocess(
          (v) => (typeof v === "string" ? parseFloat(v) : v),
          z.number().min(90, "Height 90-250cm").max(250, "Height 90-250cm")
        ),
      }),
      5: z.object({
        weightGoal: z.preprocess(
          (v) => (typeof v === "string" ? parseFloat(v) : v),
          z
            .number()
            .min(30, "Weight goal must be at least 30kg")
            .max(300, "Weight goal max 300kg")
        ),
      }),
      6: z.object({
        activityLevel: z.string().min(1, "Select activity level"),
      }),
      7: z.object({
        primaryGoal: z.string().min(1, "Select your primary goal"),
      }),
      8: z.object({
        diet: z.string().min(1, "Select diet preference"),
        allergies: z.string().optional(),
      }),
      9: z.object({}),
      10: z.object({
        email: z.string().email("Enter a valid email"),
      }),
      11: z.object({
        password: z
          .string()
          .min(6, "The password must contain at least 6 characters")
          .max(20, "The password must contain at most 20 characters")
          .refine(
            (v) => /[0-9]/.test(v),
            "The password must contain one number"
          )
          .refine(
            (v) => /[A-Z]/.test(v),
            "The password must contain one uppercase letter"
          )
          .refine(
            (v) => /[^A-Za-z0-9]/.test(v),
            "The password must contain at least one special character"
          ),
      }),
    }),
    []
  );

  const validateStep = useCallback(() => {
    const schema = stepSchemas[step] ?? z.object({});
    const data = {
      name,
      age,
      gender,
      weight,
      height,
      weightGoal,
      activityLevel,
      primaryGoal,
      diet,
      allergies,
      email,
      password,
    };

    const res = schema.safeParse(data);

    if (res.success) {
      if (step === 7 && (!allergies || !allergies.trim())) {
        setAllergies("None");
      }
      if (step === 8) {
        const cw = parseFloat(weight);
        const dw = parseFloat(weightGoal);
    
        if (primaryGoal === "Weight gain" && dw <= cw) {
          setErrors({ primaryGoal: "Dream weight must be higher than current weight to gain!" });
          return false;
        }
        if (primaryGoal === "Weight loss" && dw >= cw) {
          setErrors({ primaryGoal: "Dream weight must be lower than current weight to lose!" });
          return false;
        }
        if (primaryGoal === "Maintenance" && dw !== cw) {
          setErrors({ primaryGoal: "To maintain, your dream weight must match current weight!" });
          return false;
        }
      }
      setErrors({});
      return true;
    } else {
      const newErrors: Record<string, string> = {};
      for (const issue of res.error.issues) {
        const key = issue.path[0] as string | undefined;
        if (key && !newErrors[key]) newErrors[key] = issue.message;
      }
      setErrors(newErrors);
      return false;
    }
  }, [
    step,
    name,
    age,
    gender,
    weight,
    height,
    weightGoal,
    activityLevel,
    primaryGoal,
    diet,
    allergies,
    email,
    password,
    stepSchemas,
  ]);

  const prevStep = useCallback(() => {
    if (step > 0) {
      onFadeOut(() => setStep((s) => s - 1));
    }
  }, [step, onFadeOut]);

  const nextStep = useCallback(() => {
    if (!validateStep()) return;

    const handleFadeOut = (callback: () => void) =>
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(callback);

    if (step === totalSteps - 1) {
      Animated.timing(progressAnim, {
        toValue: ((step + 1) / totalSteps) * 100,
        duration: 400,
        useNativeDriver: false,
      }).start(() => {
        handleFadeOut(() => setStep((s) => s + 1));
      });
    } else {
      handleFadeOut(() => setStep((s) => s + 1));
    }
  }, [step, totalSteps, progressAnim, fadeAnim, validateStep]);

  const checkEmail = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:5000/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (data.exists) {
        setErrors({ email: "Email already exists, please login" });
        return false;
      }
      setErrors((e) => {
        const { email: _, ...rest } = e;
        return rest;
      });
      return true;
    } catch {
      setErrors({ email: "Unable to check email right now" });
      return false;
    }
  }, [email]);

  const handleSubmit = useCallback(async () => {
    if (validateStep()) {
      try {
        if (healthConditions.length === 0) setHealthConditions(["None"]);
        const response = await fetch("http://localhost:5000/receive-info", {
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
            weightGoal,
            diet,
            allergies,
            healthConditions: healthConditions.length
              ? healthConditions
              : ["None"],
            email,
            password,
          }),
        });
        const data = await response.json();

        if (response.ok) {
          await login(email, password);
          router.replace("/main");
        } else {
          Alert.alert("Error", data.error || "Registration failed");
        }
      } catch {
        Alert.alert("Error", "Failed to submit your information.");
      }
    }
  }, [
    validateStep,
    healthConditions,
    name,
    age,
    gender,
    weight,
    height,
    weightGoal,
    activityLevel,
    primaryGoal,
    diet,
    allergies,
    email,
    password,
    login,
    router,
  ]);

  const webCursorStyle = useMemo(
    () => (Platform.OS === "web" ? { cursor: "pointer" } : null),
    []
  );

  const renderInputStep = useCallback(
    (title: string, inputProps: any, errorKey?: string) => (
      <Animated.View style={{ alignItems: "center", width: "100%" }}>
        <View style={styles.content}>
          <Image source={kidEating} style={styles.kid} />
          <Text style={styles.heading}>{title}</Text>
          <TextInput
            {...inputProps}
            style={[
              styles.input,
              errorKey && errors[errorKey] ? styles.inputError : null,
            ]}
            placeholderTextColor="#9CA3AF"
          />
          {errorKey && errors[errorKey] ? (
            <Text style={styles.errorText}>{errors[errorKey]}</Text>
          ) : null}
          <TouchableOpacity
            style={[
              styles.primaryBtn,
              { marginTop: 20 },
              webCursorStyle as any,
            ]}
            onPress={nextStep}
          >
            <Text style={styles.primaryBtnText}> Next → </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.primaryBtn,
              { marginTop: 10 },
              webCursorStyle as any,
            ]}
            onPress={prevStep}
          >
            <Text style={styles.primaryBtnText}> ← Back </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    ),
    [errors, kidEating, nextStep, prevStep, webCursorStyle]
  );

  const renderPickerStep = useCallback(
    (
      title: string,
      selectedValue: string,
      setValue: (v: string) => void,
      options: { label: string; value: string }[],
      errorKey?: string
    ) => (
      <Animated.View style={{ alignItems: "center", width: "100%" }}>
        <View style={styles.content}>
          <Image source={kidEating} style={styles.kid} />
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
                  key={opt.value || opt.label}
                  label={opt.label}
                  value={opt.value}
                />
              ))}
            </Picker>
          </View>
          {errorKey && errors[errorKey] ? (
            <Text style={styles.errorText}>{errors[errorKey]}</Text>
          ) : null}
          <TouchableOpacity
            style={[
              styles.primaryBtn,
              { marginTop: 20 },
              webCursorStyle as any,
            ]}
            onPress={nextStep}
          >
            <Text style={styles.primaryBtnText}> Next → </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.primaryBtn,
              { marginTop: 10 },
              webCursorStyle as any,
            ]}
            onPress={prevStep}
          >
            <Text style={styles.primaryBtnText}> ← Back </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    ),
    [errors, kidEating, nextStep, prevStep, webCursorStyle]
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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
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
              <Image source={kidStanding} style={styles.kid} />
              <Text style={styles.heading}>Hey there, I&apos;m Stickr!</Text>
              <Text style={styles.prompt}>
                A few fun questions coming your way! 😄 {"\n"} Don’t worry it’s
                quick and all about YOU!
              </Text>
              <TouchableOpacity
                style={[styles.primaryBtn, webCursorStyle as any]}
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
            genderOptions,
            "gender"
          )}

        {step === 4 && (
          <Animated.View style={{ alignItems: "center", width: "100%" }}>
            <View style={styles.content}>
              <Image source={kidEating} style={styles.kid} />
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
              {errors.weight ? (
                <Text style={styles.errorText}>{errors.weight}</Text>
              ) : null}
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
              {errors.height ? (
                <Text style={styles.errorText}>{errors.height}</Text>
              ) : null}
              <TouchableOpacity
                style={[
                  styles.primaryBtn,
                  { marginTop: 20 },
                  webCursorStyle as any,
                ]}
                onPress={nextStep}
              >
                <Text style={styles.primaryBtnText}> Next → </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.primaryBtn,
                  { marginTop: 10 },
                  webCursorStyle as any,
                ]}
                onPress={prevStep}
              >
                <Text style={styles.primaryBtnText}> ← Back </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        {step === 5 && (
          <Animated.View style={{ alignItems: "center", width: "100%" }}>
            <View style={styles.content}>
              <Image source={kidEating} style={styles.kid} />
              <Text style={styles.heading}>What’s your dream weight? ⚖️</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.weightGoal ? styles.inputError : null,
                ]}
                placeholder="Weight goal (kg)"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={weightGoal}
                onChangeText={setWeightGoal}
              />
              {errors.weightGoal ? (
                <Text style={styles.errorText}>{errors.weightGoal}</Text>
              ) : null}
              <TouchableOpacity
                style={[
                  styles.primaryBtn,
                  { marginTop: 20 },
                  webCursorStyle as any,
                ]}
                onPress={nextStep}
              >
                <Text style={styles.primaryBtnText}> Next → </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.primaryBtn,
                  { marginTop: 10 },
                  webCursorStyle as any,
                ]}
                onPress={prevStep}
              >
                <Text style={styles.primaryBtnText}> ← Back </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        {step === 6 &&
          renderPickerStep(
            "What’s your daily vibe? 💤 or 🏃‍♂️?",
            activityLevel,
            setActivityLevel,
            activityOptions,
            "activityLevel"
          )}

        {step === 7 &&
          renderPickerStep(
            "What’s the 🎯? Lose, gain, or maintain?",
            primaryGoal,
            setPrimaryGoal,
            goalOptions,
            "primaryGoal"
          )}

        {step === 8 && (
          <Animated.View style={{ alignItems: "center", width: "100%" }}>
            <View style={styles.content}>
              <Image source={kidEating} style={styles.kid} />
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
              {errors.diet ? (
                <Text style={styles.errorText}>{errors.diet}</Text>
              ) : null}
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
                  webCursorStyle as any,
                ]}
                onPress={nextStep}
              >
                <Text style={styles.primaryBtnText}> Next → </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.primaryBtn,
                  { marginTop: 10 },
                  webCursorStyle as any,
                ]}
                onPress={prevStep}
              >
                <Text style={styles.primaryBtnText}> ← Back </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        {step === 9 && (
          <Animated.View style={{ alignItems: "center", width: "100%" }}>
            <View style={styles.content}>
              <Image source={kidEating} style={styles.kid} />
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
                  webCursorStyle as any,
                ]}
                onPress={nextStep}
              >
                <Text style={styles.primaryBtnText}>
                  {healthConditions.filter(
                    (item) =>
                      item.trim() !== "" && item.toLowerCase() !== "none"
                  ).length > 0
                    ? "Next"
                    : "Skip"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.primaryBtn,
                  { marginTop: 10 },
                  webCursorStyle as any,
                ]}
                onPress={prevStep}
              >
                <Text style={styles.primaryBtnText}> ← Back </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        {step === 10 && (
          <Animated.View style={{ alignItems: "center", width: "100%" }}>
            <View style={styles.content}>
              <Image source={kidEating} style={styles.kid} />
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
                autoCapitalize="none"
              />
              {errors.email ? (
                <Text style={styles.errorText}>{errors.email}</Text>
              ) : null}
              <TouchableOpacity
                style={[
                  styles.primaryBtn,
                  { marginTop: 20 },
                  webCursorStyle as any,
                ]}
                onPress={async () => {
                  if (validateStep()) {
                    const ok = await checkEmail();
                    if (ok) nextStep();
                  }
                }}
              >
                <Text style={styles.primaryBtnText}> Next → </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.primaryBtn,
                  { marginTop: 10 },
                  webCursorStyle as any,
                ]}
                onPress={prevStep}
              >
                <Text style={styles.primaryBtnText}> ← Back </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        {step === 11 && (
          <Animated.View
            style={{ alignItems: "center", width: "100%", marginTop: -5 }}
          >
            <View style={styles.content}>
              <Image source={kidEating} style={styles.kid} />
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
                    { flex: 1, paddingRight: 40 },
                  ]}
                  placeholder="Password"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
              </View>
              {errors.password ? (
                <Text style={styles.errorText}>{errors.password}</Text>
              ) : null}
              <TouchableOpacity
                style={[
                  styles.primaryBtn,
                  { marginTop: 15 },
                  webCursorStyle as any,
                ]}
                onPress={handleSubmit}
              >
                <Text style={styles.primaryBtnText}>Finish</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.primaryBtn,
                  { marginTop: 10 },
                  webCursorStyle as any,
                ]}
                onPress={prevStep}
              >
                <Text style={styles.primaryBtnText}> ← Back </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
