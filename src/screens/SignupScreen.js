// src/screens/SignupScreen.js
import React, { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import InputField from "../components/InputField";
import Button from "../components/Button";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebaseConfig";
import { ref, set } from "firebase/database";
import { db } from "../services/firebaseConfig";

const SignupScreen = ({ onSwitchToLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const signup = async () => {
    if (!email || !password) return Alert.alert("Fill email & password");
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      // Set basic profile in realtime DB
      await set(ref(db, `users/${cred.user.uid}`), {
        name: name || "",
        email,
        phone: "",
        title: "",
        summary: "",
        skills: [],
        experience: [],
        education: []
      });
    } catch (err) {
      Alert.alert("Signup error", err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create account</Text>
      <InputField label="Full name" value={name} onChangeText={setName} placeholder="Mohamed Rifayath" />
      <InputField label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" />
      <InputField label="Password" value={password} onChangeText={setPassword} placeholder="Password" />
      <Button title="Sign up" onPress={signup} />
      <Text style={{textAlign:"center", marginTop:12}}>
        Already have an account? <Text style={{color:"#2563eb"}} onPress={onSwitchToLogin}>Login</Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex:1, padding: 20, justifyContent: "center" },
  title: { fontSize: 28, fontWeight: "800", marginBottom: 20 }
});

export default SignupScreen;
