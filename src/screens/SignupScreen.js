import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
} from "react-native";
import InputField from "../components/InputField";
import Button from "../components/Button";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../services/firebaseConfig";
import { ref, set } from "firebase/database";
import { getTheme } from "../constants/ColorConstants";

const SignupScreen = ({ onSwitchToLogin }) => {
  const scheme = useColorScheme();
  const theme = useMemo(() => getTheme(scheme), [scheme]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const signup = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      return Alert.alert("Missing Info", "Please fill in all fields.");
    }
    if (password !== confirmPassword) {
      return Alert.alert("Password Mismatch", "The passwords you entered do not match.");
    }
    if (password.length < 6) {
      return Alert.alert("Weak Password", "Password must be at least 6 characters.");
    }

    try {
      setLoading(true);
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      // Create a base user record in Realtime Database
      await set(ref(db, `users/${cred.user.uid}`), {
        name: name.trim(),
        email: email.trim(),
        phone: "",
        title: "",
        summary: "",
        skills: [],
        experience: [],
        education: [],
        projects: [],
        certifications: [],
        languages: [],
      });
      Alert.alert("Welcome!", "Account created successfully.");
    } catch (err) {
      let msg = "Could not create account. Please try again.";
      if (err.code === "auth/email-already-in-use") msg = "This email is already in use.";
      if (err.code === "auth/invalid-email") msg = "Please enter a valid email address.";
      if (err.code === "auth/weak-password") msg = "Password should be at least 6 characters.";
      Alert.alert("Signup Failed", msg);
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
        <Text style={[styles.title, { color: theme.text }]}>Create account</Text>
        <Text style={[styles.subtitle, { color: theme.subtle }]}>
          Sign up to get started with your resume
        </Text>

        <InputField
          label="Full Name"
          value={name}
          onChangeText={setName}
          placeholder="Your full name"
          theme={theme}
        />
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
          placeholder="Password"
          secureTextEntry = {true}
          theme={theme}
        />

        <InputField
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm Password"
          secureTextEntry = {true}
          theme={theme}
        />

        <Button
          title={loading ? "Creating account..." : "Sign Up"}
          onPress={signup}
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
          onPress={onSwitchToLogin}
          style={{ marginTop: 20, alignSelf: "center" }}
        >
          <Text style={{ color: theme.primary, fontWeight: "600" }}>
            Already have an account? Log in
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

export default SignupScreen;
