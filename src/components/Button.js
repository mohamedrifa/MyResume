// src/components/Button.js
import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

const Button = ({ title, onPress, style }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={[styles.btn, style]}>
    <Text style={styles.txt}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  btn: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 8
  },
  txt: { color: "#fff", fontWeight: "700" }
});

export default Button;
