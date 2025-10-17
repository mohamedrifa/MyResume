// src/screens/EditResumeScreen.js
import React, { useContext, useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, Alert } from "react-native";
import InputField from "../components/InputField";
import Button from "../components/Button";
import { auth, db } from "../services/firebaseConfig";
import { ref, update, get, child } from "firebase/database";
import { AuthContext } from "../context/AuthContext";

const EditResumeScreen = ({ initialData, onBack }) => {
  const { user } = useContext(AuthContext);
  const uid = user?.uid;
  const [form, setForm] = useState({
    name: "",
    title: "",
    email: "",
    phone: "",
    address: "",
    summary: "",
    skills: "",
    experience: "",
    education: ""
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        title: initialData.title || "",
        email: initialData.email || user?.email || "",
        phone: initialData.phone || "",
        address: initialData.address || "",
        summary: initialData.summary || "",
        skills: (initialData.skills || []).join(", "),
        experience: JSON.stringify(initialData.experience || []),
        education: JSON.stringify(initialData.education || [])
      });
    } else if (uid) {
      // load from db
      get(child(ref(db), `users/${uid}`)).then(snap => {
        if (snap.exists()) {
          const d = snap.val();
          setForm({
            name: d.name || "",
            title: d.title || "",
            email: d.email || user?.email || "",
            phone: d.phone || "",
            address: d.address || "",
            summary: d.summary || "",
            skills: (d.skills || []).join(", "),
            experience: JSON.stringify(d.experience || []),
            education: JSON.stringify(d.education || [])
          });
        }
      }).catch(err => console.warn(err));
    }
  }, [initialData, uid]);

  const save = async () => {
    try {
      const payload = {
        name: form.name,
        title: form.title,
        email: form.email,
        phone: form.phone,
        address: form.address,
        summary: form.summary,
        skills: form.skills.split(",").map(s => s.trim()).filter(Boolean),
        experience: JSON.parse(form.experience || "[]"),
        education: JSON.parse(form.education || "[]")
      };
      await update(ref(db, `users/${uid}`), payload);
      Alert.alert("Saved", "Resume updated successfully.");
      onBack && onBack();
    } catch (err) {
      Alert.alert("Save failed", err.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Edit Resume</Text>

      <InputField label="Full name" value={form.name} onChangeText={(t)=>setForm({...form,name:t})} />
      <InputField label="Title" value={form.title} onChangeText={(t)=>setForm({...form,title:t})} />
      <InputField label="Email" value={form.email} onChangeText={(t)=>setForm({...form,email:t})} />
      <InputField label="Phone" value={form.phone} onChangeText={(t)=>setForm({...form,phone:t})} />
      <InputField label="Address" value={form.address} onChangeText={(t)=>setForm({...form,address:t})} />
      <InputField label="Summary" value={form.summary} onChangeText={(t)=>setForm({...form,summary:t})} multiline />
      <InputField label="Skills (comma separated)" value={form.skills} onChangeText={(t)=>setForm({...form,skills:t})} />
      <InputField label="Experience (JSON array)" value={form.experience} onChangeText={(t)=>setForm({...form,experience:t})} multiline />
      <InputField label="Education (JSON array)" value={form.education} onChangeText={(t)=>setForm({...form,education:t})} multiline />

      <Button title="Save" onPress={save} />
      <Button title="Back" onPress={onBack} style={{backgroundColor:"#6b7280"}} />
      <Text style={{color:"#6b7280", marginTop:8, fontSize:12}}>
        Experience/education must be JSON arrays. Example:
        {'[{"role":"Developer","company":"X","duration":"2023-2024","desc":"Did Y"}]'}
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 22, fontWeight: "800", marginBottom: 12 }
});

export default EditResumeScreen;
