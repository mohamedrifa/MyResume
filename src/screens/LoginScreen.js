// src/screens/LoginScreen.js
import React, { useState } from "react";
import { View, Text, StyleSheet, Alert, TouchableOpacity } from "react-native";
import InputField from "../components/InputField";
import Button from "../components/Button";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebaseConfig";

const LoginScreen = ({ onSwitchToSignup }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    if (!email || !password) return Alert.alert("Please fill email and password");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      Alert.alert("Login failed", err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome back</Text>
      <InputField label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" />
      <InputField label="Password" value={password} onChangeText={setPassword} placeholder="Password" />
      <Button title="Login" onPress={login} />
      <TouchableOpacity onPress={onSwitchToSignup} style={{marginTop:12}}>
        <Text style={{color:"#2563eb"}}>Don't have an account? Sign up</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex:1, padding: 20, justifyContent: "center" },
  title: { fontSize: 28, fontWeight: "800", marginBottom: 20 }
});

export default LoginScreen;
