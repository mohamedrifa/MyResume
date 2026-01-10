import React from "react";
import { View, StyleSheet } from "react-native";

export default function Divider ({ color }) {
  return (
    <View style={[styles.divider, { backgroundColor: color }]} />
  );
}

const styles = StyleSheet.create({
  divider: { height: 1, width: "100%", opacity: 0.6 },
});