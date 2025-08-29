import { View, Text, Button } from "react-native";
import { useAuth } from "../context/AuthContext";

export default function Main() {
  const { logout } = useAuth();
  return (
    <View>
      <Text>Main</Text>
      <Button title="Logout" onPress={logout} />
    </View>
  )
}