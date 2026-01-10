import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";

const PreparingOverlay = ({ visible, theme, styles, message = "Preparing…" }) => {
  if (!visible) return null;

  return (
    <View style={styles.loadingOverlay} pointerEvents="none">
      <View
        style={[
          styles.loadingCard,
          theme.shadow,
          { backgroundColor: theme.card },
        ]}
      >
        <ActivityIndicator size="small" />
        <Text style={[styles.loadingText, { color: theme.text }]}>
          {message}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.08)",
  },
  loadingCard: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  loadingText: { fontWeight: "600" },
});
export default React.memo(PreparingOverlay);
