import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  // Container
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  
  // Header
  headerGradient: {
    padding: 24,
    paddingTop: 50,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  greetingContainer: {
    marginTop: 16,
    marginBottom: 20,
    alignItems: "flex-start",
  },
  
  greeting: {
    fontSize: 36,
    color: "rgba(255, 255, 255, 0.7)",
    fontFamily: "Outfit_700Bold",
    marginBottom: 4,
    marginLeft: 2,
    letterSpacing: 0.5,
  },
  
  userName: {
    fontSize: 28,
    color: "white",
    fontFamily: "Outfit_700Bold",
    marginBottom: 34,
    marginLeft: 5,
    letterSpacing: 0.5,
  },
  
  mealType: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.85)",
    fontFamily: "Outfit_400Regular",
    fontStyle: "italic",
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 12,
    overflow: "hidden",
    alignSelf: "center",
  },  
  
  // Content
  contentContainer: {
    padding: 16,
    marginTop: -40,
  },
  
  // Nutrition Section
  nutritionCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    color: "#1E293B",
    fontFamily: "Outfit_700Bold",
    marginBottom: 6,
  },
  circleWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  circleCenter: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: "-54%" }, { translateY: "-70%" }],
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  circleCenterText: {
    fontFamily: "Outfit_700Bold",
    fontSize: 18,
    color: "#111827",
    textAlign: "center",
  },
  circleCenterSubtext: {
    fontFamily: "Outfit_400Regular",
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  macroRow: {
    marginBottom: 12,
  },
  macroProgressBar: {
    height: 6,
    backgroundColor: "#F1F5F9",
    borderRadius: 3,
    overflow: "hidden",
  },
  seeAllText: {
    fontFamily: "Outfit_500Medium",
    fontSize: 14,
    color: "#4F46E5",
  },
  // Stats Section
  statsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  statsScrollView: {
    paddingVertical: 8,
  },
  statCard: {
    width: 140,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 16,
  },
  quickActionsCard: {
    width: 120,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 16,
    alignItems: "center",
  },  
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 18,
    color: "#1E293B",
    fontFamily: "Outfit_700Bold",
  },
  statUnit: {
    fontSize: 12,
    color: "#64748B",
    fontFamily: "Outfit_500Medium",
  },
  statTitle: {
    fontSize: 14,
    color: "#475569",
    fontFamily: "Outfit_600SemiBold",
  },
  statSpacer: {
    width: 12,
  },
  
  // Quick Actions
  quickActionsContainer: {
    marginTop: 24,
    marginBottom: 24,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  quickAction: {
    width: "30%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    alignItems: "center",
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  actionText: {
    fontSize: 14,
    color: "#1E293B",
    fontFamily: "Outfit_600SemiBold",
    marginTop: 8,
    textAlign: "center",
  },
  
  // Meals Section
  mealsContainer: {
    marginBottom: 24,
  },
  mealsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  emptyMealsContainer: {
    backgroundColor: "white",
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  
  // Meal Card
  mealCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  mealHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  mealInfo: {
    flex: 1,
  },
  mealTypeBadge: {
    backgroundColor: "#F8FAFC",
    padding: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  mealTypeText: {
    fontSize: 14,
    fontFamily: "Outfit_500Medium",
    color: "#64748B",
  },
  mealName: {
    fontSize: 16,
    color: "#1E293B",
    fontFamily: "Outfit_600SemiBold",
    marginBottom: 4,
  },
  mealDetails: {
    fontSize: 14,
    color: "#64748B",
    fontFamily: "Outfit_400Regular",
  },
  mealServings: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  servingsCount: {
    fontSize: 18,
    color: "#4F46E5",
    fontFamily: "Outfit_700Bold",
    marginRight: 8,
  },
  servingsLabel: {
    fontSize: 14,
    color: "#64748B",
  },
  mealActions: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  actionButton: {
    backgroundColor: "#F8FAFC",
    padding: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  deleteButton: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },
  confirmButton: {
    backgroundColor: "#4F46E5",
    padding: 8,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButtonText: {
    color: "white",
    fontSize: 12,
    fontFamily: "Outfit_600SemiBold",
    marginLeft: 4,
  },
  
  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    width: "90%",
    borderRadius: 24,
    padding: 24,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    color: "#1E293B",
    fontFamily: "Outfit_700Bold",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  searchInput: {
    flex: 1,
    height: 48,
    color: "#1E293B",
    fontFamily: "Outfit_400Regular",
  },
  searchButton: {
    backgroundColor: "#4F46E5",
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  foodItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    color: "#1E293B",
    fontFamily: "Outfit_600SemiBold",
    fontSize: 16,
    marginBottom: 4,
  },
  foodDetails: {
    color: "#64748B",
    fontFamily: "Outfit_400Regular",
    fontSize: 14,
  },
  foodActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    backgroundColor: "#F1F5F9",
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  addFoodButton: {
    backgroundColor: "#4F46E5",
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  closeModalButton: {
    backgroundColor: "#F8FAFC",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  closeModalText: {
    color: "#64748B",
    fontFamily: "Outfit_600SemiBold",
  },
  doneButton: {
    backgroundColor: "#4F46E5",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  doneButtonText: {
    color: "white",
    fontFamily: "Outfit_600SemiBold",
  },
  emptyResultsContainer: {
    padding: 24,
    alignItems: "center",
  },
  
  // Celebration Modal
  celebrationContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  celebrationContent: {
    backgroundColor: "white",
    padding: 30,
    borderRadius: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  trophyIcon: {
    backgroundColor: "#4ADE80",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  celebrationTitle: {
    fontSize: 26,
    fontFamily: "Outfit_700Bold",
    color: "#1E293B",
    marginBottom: 16,
    textAlign: "center",
  },
  celebrationMessage: {
    fontSize: 16,
    fontFamily: "Outfit_400Regular",
    textAlign: "center",
    marginBottom: 24,
    color: "#64748B",
  },
  celebrationButton: {
    backgroundColor: "#4F46E5",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  celebrationButtonText: {
    color: "white",
    fontFamily: "Outfit_600SemiBold",
    fontSize: 16,
  },
  
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
});