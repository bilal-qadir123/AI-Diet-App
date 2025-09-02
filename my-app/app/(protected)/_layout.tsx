import { Tabs } from "expo-router";
import { View, Text, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ProtectedRoute from "../ProtectedRoute";
import { useEffect, useRef } from "react";

// Custom tab bar component for a more beautiful UI
const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  const animationValues = state.routes.map(() => useRef(new Animated.Value(1)).current);

  useEffect(() => {
    state.routes.forEach((route: any, index: number) => {
      if (index === state.index) {
        // Animate the active tab
        Animated.spring(animationValues[index], {
          toValue: 1.1,
          friction: 4,
          useNativeDriver: true,
        }).start();
      } else {
        // Reset other tabs
        Animated.spring(animationValues[index], {
          toValue: 1,
          friction: 4,
          useNativeDriver: true,
        }).start();
      }
    });
  }, [state.index, state.routes, animationValues]);

  return (
    <View style={styles.tabBar}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        let iconName;
        if (route.name === "main") {
          iconName = isFocused ? "home" : "home-outline";
        } else if (route.name === "recipe") {
          iconName = isFocused ? "book" : "book-outline";
        } else if (route.name === "profile") {
          iconName = isFocused ? "person" : "person-outline";
        }

        return (
          <Animated.View
            key={index}
            style={[
              styles.tabItem,
              isFocused && styles.tabItemFocused,
              { transform: [{ scale: animationValues[index] }] },
            ]}
          >
            <Ionicons
              name={iconName}
              size={24}
              color={isFocused ? "#4F46E5" : "#9CA3AF"}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.icon}
            />
            <Text
              style={[
                styles.tabLabel,
                isFocused ? styles.tabLabelFocused : styles.tabLabelInactive,
              ]}
            >
              {label}
            </Text>
          </Animated.View>
        );
      })}
    </View>
  );
};

export default function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <Tabs
        initialRouteName="main"
        screenOptions={{ headerShown: false }}
        tabBar={(props) => <CustomTabBar {...props} />}
      >
        <Tabs.Screen name="main" options={{ title: "Dashboard" }} />
        <Tabs.Screen name="recipe" options={{ title: "Recipe" }} />
        <Tabs.Screen name="profile" options={{ title: "Profile" }} />
      </Tabs>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingVertical: 8,
    paddingHorizontal: 10,
    height: 70,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 5,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    minWidth: 70,
  },
  tabItemFocused: {
    backgroundColor: "#F5F3FF",
  },
  icon: {
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 12,
    fontFamily: "Outfit_500Medium",
  },
  tabLabelFocused: {
    color: "#4F46E5",
  },
  tabLabelInactive: {
    color: "#9CA3AF",
  },
});