// src/components/InputField.js
import React from "react";
import { View, TextInput, Text, StyleSheet } from "react-native";

const InputField = ({ label, value, onChangeText, placeholder, multiline=false }) => {
  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        style={[styles.input, multiline && styles.multiline]}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginVertical: 8 },
  label: { marginBottom: 6, color: "#374151", fontWeight: "600" },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#00000010",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
  },
  multiline: { minHeight: 100 }
});

export default InputField;
