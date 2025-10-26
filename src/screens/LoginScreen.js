import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import InputField from "../components/InputField";
import Button from "../components/Button";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebaseConfig";

const LoginScreen = ({ onSwitchToSignup }) => {
  const scheme = useColorScheme();
  const theme = scheme === "dark"
    ? {
        bg: "#0B1220",
        card: "#101826",
        text: "#F8FAFC",
        subtle: "#9CA3AF",
        primary: "#2563EB",
      }
    : {
        bg: "#F6F7F9",
        card: "#FFFFFF",
        text: "#0F172A",
        subtle: "#6B7280",
        primary: "#2563EB",
      };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    if (!email || !password) return Alert.alert("Missing Info", "Please fill in both email and password.");
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err) {
      let msg = "Login failed. Please check your email or password.";
      if (err.code === "auth/invalid-email") msg = "Invalid email format.";
      if (err.code === "auth/user-not-found") msg = "No account found for this email.";
      if (err.code === "auth/wrong-password") msg = "Incorrect password.";
      Alert.alert("Login Failed", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.bg }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <Text style={[styles.title, { color: theme.text }]}>Welcome back</Text>
        <Text style={[styles.subtitle, { color: theme.subtle }]}>
          Log in to continue to your dashboard
        </Text>

        <InputField
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          theme={theme}
        />

        <InputField
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Your password"
          secureTextEntry
          theme={theme}
        />

        <Button
          title={loading ? "Logging in..." : "Login"}
          onPress={login}
          disabled={loading}
        />

        {loading && (
          <ActivityIndicator
            style={{ marginTop: 8 }}
            size="small"
            color={theme.primary}
          />
        )}

        <TouchableOpacity
          onPress={onSwitchToSignup}
          style={{ marginTop: 20, alignSelf: "center" }}
        >
          <Text style={{ color: theme.primary, fontWeight: "600" }}>
            Don’t have an account? Sign up
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  card: {
    borderRadius: 16,
    padding: 24,
    elevation: 3,
    shadowColor: "#00000020",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  title: { fontSize: 28, fontWeight: "800", marginBottom: 6, textAlign: 'center' },
  subtitle: { fontSize: 14, marginBottom: 20, textAlign: 'center' },
});

export default LoginScreen;
