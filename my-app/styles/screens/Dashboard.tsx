import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  greeting: {
    fontFamily: "Outfit_400Regular",
    fontSize: 26,
    color: "#6B7280",
  },
  userName: {
    fontFamily: "Outfit_700Bold",
    fontSize: 40,
    color: "#111827",
    marginTop: 4,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  section: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: "Outfit_700Bold",
    fontSize: 18,
    color: "#111827",
  },
  seeAll: {
    fontFamily: "Outfit_500Medium",
    fontSize: 14,
    color: "#4F46E5",
  },
  macroContainer: {
    alignItems: "center",
    marginVertical: 10,
  },
  circleWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  circleCenter: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: "-54%" }, { translateY: "-90%" }],
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  circleCenterText: {
    fontFamily: "Outfit_700Bold",
    fontSize: 22,
    color: "#111827",
    textAlign: "center",
  },
  circleCenterSubtext: {
    fontFamily: "Outfit_400Regular",
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  macroDetails: {
    width: "100%",
  },
  macroRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  macroDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  macroTextContainer: {
    flex: 1,
  },
  macroName: {
    fontFamily: "Outfit_500Medium",
    fontSize: 16,
    color: "#374151",
    marginBottom: 2,
  },
  macroAmount: {
    fontFamily: "Outfit_400Regular",
    fontSize: 14,
    color: "#6B7280",
  },
  macroPercentage: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 16,
    color: "#111827",
  },
  statsContainer: {
    flexDirection: "row",
    marginHorizontal: -5,
  },
  statCard: {
    width: 140,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 5,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statValue: {
    fontFamily: "Outfit_700Bold",
    fontSize: 20,
    color: "#111827",
    marginBottom: 2,
  },
  statUnit: {
    fontFamily: "Outfit_400Regular",
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  statTitle: {
    fontFamily: "Outfit_500Medium",
    fontSize: 14,
    color: "#374151",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  quickAction: {
    marginTop: 20,
    alignItems: "center",
    width: "30%",
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  actionText: {
    fontFamily: "Outfit_500Medium",
    fontSize: 14,
    color: "#374151",
    textAlign: "center",
  },
  mealCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontFamily: "Outfit_500Medium",
    fontSize: 16,
    color: "#111827",
    marginBottom: 4,
  },
  mealTime: {
    fontFamily: "Outfit_400Regular",
    fontSize: 14,
    color: "#6B7280",
  },
});

export default styles;