import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const ProfileHeader = ({ onBack, theme, title = "Profile", subtitle }) => {
  return (
    <View style={styles.headerRow}>
      <TouchableOpacity
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={styles.backBtn}
      >
        <Text style={[styles.backTxt, { color: theme.primary }]}>Back</Text>
      </TouchableOpacity>

      <View style={styles.center}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: theme.subtle }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {/* spacer for symmetry */}
      <View style={styles.spacer} />
    </View>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  backBtn: { width: 60 },
  backTxt: { fontSize: 16, fontWeight: "800" },
  headerTitle: { fontSize: 18, fontWeight: "800" },
  center: {
    flex: 1,
    alignItems: "center",
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  spacer: {
    width: 60,
  },
});

export default ProfileHeader;
