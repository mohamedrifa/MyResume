import React from "react";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  card: {
    position: "relative",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  cardAccent: {
    position: "relative",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  cardHeader: { fontSize: 15, fontWeight: "800", marginBottom: 8, paddingRight: 28 },
  row: { flexDirection: "row", columnGap: 10 },
  half: { flex: 1 },
});