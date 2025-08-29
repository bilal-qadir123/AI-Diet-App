import { Stack } from "expo-router";
import { useFonts, Outfit_400Regular, Outfit_500Medium, Outfit_700Bold } from "@expo-google-fonts/outfit";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { Asset } from "expo-asset";
import { AuthProvider } from "./context/AuthContext";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_700Bold,
  });

  const [assetsLoaded, setAssetsLoaded] = useState(false);

  useEffect(() => {
    async function prepare() {
      await Asset.loadAsync([
        require("../assets/images/human.png"),
        require("../assets/images/logo.png"),
        require("../assets/images/kid-standing.png"),
        require("../assets/images/kid-eating.png"),
        require("../assets/images/door.png"),
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
      ]);
      setAssetsLoaded(true);
    }
    prepare();
  }, []);

  useEffect(() => {
    if (fontsLoaded && assetsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, assetsLoaded]);

  if (!fontsLoaded || !assetsLoaded) return null;

  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="info" />

        <Stack.Screen name="(protected)" options={{ headerShown: false }} />
      </Stack>
    </AuthProvider>
  );
}
