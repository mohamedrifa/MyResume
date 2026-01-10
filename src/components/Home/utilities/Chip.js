import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function Chip ({ label, theme }) {
  return (
    <View style={[styles.chip, { backgroundColor: theme.chipBg, borderColor: theme.cardBorder }]}>
      <Text style={[styles.chipTxt, { color: theme.chipText }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  chipTxt: { fontWeight: "700", fontSize: 12 },
});