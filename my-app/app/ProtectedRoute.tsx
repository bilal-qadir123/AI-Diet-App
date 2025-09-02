import { useAuth } from "./context/AuthContext";
import { Redirect, Slot } from "expo-router";

export default function ProtectedRoute( { children }: any ) {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) return <Redirect href="/login" />;

  return <>{children ?? <Slot />}</>;
}
