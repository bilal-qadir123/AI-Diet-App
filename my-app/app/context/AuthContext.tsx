import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

interface AuthContextType {
  user: string | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const verifyToken = async (storedToken: string) => {
    try {
      const res = await axios.get("http://localhost:5000/auth/verify-token", {
        headers: {
          Authorization: `Bearer ${storedToken}`
        }
      });
      setUser(res.data.email);
      setToken(storedToken);
    } catch (err) {
      await AsyncStorage.removeItem("token");
      setUser(null);
      setToken(null);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = await AsyncStorage.getItem("token");
      if (storedToken) await verifyToken(storedToken);
      setLoading(false);
    };
    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      const res = await axios.post("http://localhost:5000/auth/login", { email, password });
      const token = res.data.token;
      await AsyncStorage.setItem("token", token);
      setToken(token);
      setUser(email);
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem("token");
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
