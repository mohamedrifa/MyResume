// src/screens/HomeScreen.js
import React, { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import Button from "../components/Button";
import { AuthContext } from "../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth, db } from "../services/firebaseConfig";
import { ref, onValue } from "firebase/database";

const HomeScreen = ({ navigateToEdit, navigateToView }) => {
  const { user } = useContext(AuthContext);
  const [resume, setResume] = useState(null);
  const uid = user?.uid;

  useEffect(() => {
    if (!uid) return;
    const r = ref(db, `users/${uid}`);
    const unsub = onValue(r, snapshot => {
      setResume(snapshot.val());
    });
    return () => unsub();
  }, [uid]);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      Alert.alert("Logout failed", err.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={{ width: "100%" }}>
        <Text style={styles.hi}>Hello,</Text>
        <Text style={styles.name}>{resume?.name || user?.email}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Profile</Text>
        <Text style={styles.text}>{resume?.title || "No title"}</Text>
        <Text style={[styles.text, {marginTop:8}]}>{resume?.summary || "Add a summary about yourself."}</Text>

        <View style={{marginTop:12}}>
          <Button title="Edit Resume" onPress={() => navigateToEdit(resume)} />
          <Button title="View & Download PDF" onPress={() => navigateToView(resume)} style={{backgroundColor:"#10b981"}} />
          <Button title="Logout" onPress={logout} style={{backgroundColor:"#ef4444"}} />
        </View>
      </View>

      <Text style={{color:"#6b7280", marginTop:10}}>Tip: Add skills, experience and education in Edit Resume screen.</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: "center" },
  hi: { fontSize: 18, color: "#6b7280" },
  name: { fontSize: 24, fontWeight: "800", marginBottom: 12 },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#00000010",
    shadowOffset: { width:0, height:4 },
    shadowOpacity: 0.06
  },
  sectionTitle: { fontWeight: "700", marginBottom:6 },
  text: { color: "#374151" }
});

export default HomeScreen;
