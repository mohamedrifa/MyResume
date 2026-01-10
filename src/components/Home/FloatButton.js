import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

const FloatButton = ({ visible, theme, onPress }) => {
  if (!visible) return null;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      accessibilityRole="button"
      accessibilityLabel="Edit Resume"
      style={[styles.fab, { backgroundColor: theme.primary }]}
    >
      <Text style={styles.fabTxt}>Edit Resume</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 16,
    bottom: 20,
    height: 50,
    paddingHorizontal: 16,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  fabTxt: { color: "#fff", fontWeight: "800", fontSize: 15 },
});

export default React.memo(FloatButton);
