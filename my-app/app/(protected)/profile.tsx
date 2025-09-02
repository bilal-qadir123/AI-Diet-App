import { View, Text, Button } from "react-native";
import { useAuth } from "../context/AuthContext";
import styles from "../../styles/screens/Profile";
export default function Profile() {

  const { logout } = useAuth();
  return (
    <View style={styles.container}>
      <Button title="Logout" onPress={logout} />
      <Text style={styles.text}>Profile</Text>
    </View>
  );
}


