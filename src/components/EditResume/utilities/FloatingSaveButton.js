import React from "react";
import {
  Pressable,
  Text,
  StyleSheet,
} from "react-native";

const FloatingSaveButton = ({ onPress, theme, loading }) => (
  <Pressable
    onPress={onPress}
    disabled={loading}
    accessibilityRole="button"
    accessibilityLabel="Save resume"
    hitSlop={8}
    style={({ pressed }) => [
      styles.fab,
      { backgroundColor: pressed ? theme.primaryPressed : theme.primary },
      loading && { opacity: 0.6 },
    ]}
  >
    <Text style={styles.fabText}>
      {loading ? "Loading..." : "Save"}
    </Text>
  </Pressable>
);

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 16,
    bottom: 20,
    height: 56,
    paddingHorizontal: 20,
    borderRadius: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 6 },
      },
      android: { elevation: 8 },
    }),
  },
  fabIcon: { fontSize: 18, marginRight: 8, color: "#ffffff" },
  fabText: { color: "#ffffff", fontWeight: "800", fontSize: 16, letterSpacing: 0.3 },
});

export default FloatingSaveButton;