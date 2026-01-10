import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";

const ShareSaveFAB = ({
  visible = true,
  loading,
  theme,
  onPress,
}) => {
  if (!visible) return null;

  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={({ pressed }) => [
        styles.fab,
        { backgroundColor: theme.primary },
        pressed && { opacity: 0.92, transform: [{ scale: 0.99 }] },
        loading && { opacity: 0.65 },
      ]}
      accessibilityRole="button"
      accessibilityLabel="Share or Save as PDF"
      hitSlop={6}
    >
      <Text style={styles.fabLabel}>
        Share / Save as PDF
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 16,
    bottom: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 26,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  fabLabel: { fontSize: 15, color: "#fff", fontWeight: "800" },
});

export default React.memo(ShareSaveFAB);
