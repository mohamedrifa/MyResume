import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function Row ({ label, value, theme }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, { color: theme.subtle }]}>{label}</Text>
      <Text style={[styles.rowValue, { color: theme.text }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  rowLabel: { fontSize: 13, fontWeight: "700" },
  rowValue: { fontSize: 15, fontWeight: "700", maxWidth: "70%" },
});