import React from "react";
import {
  View,
  Text,
  Pressable,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

const QuickActions = ({
  theme,
  color,
  showQR,
  onEdit,
  onToggleQR,
  onOpenColorPicker,
}) => {
  return (
    <View style={styles.actionsRow}>
      {/* Edit */}
      <Pressable
        onPress={onEdit}
        style={({ pressed }) => [
          styles.iconBtn,
          { backgroundColor: theme.card, borderColor: theme.border },
          pressed && styles.pressed,
        ]}
        android_ripple={{ color: theme.ripple }}
        accessibilityRole="button"
        accessibilityLabel="Edit resume"
        hitSlop={8}
      >
        <Text style={[styles.iconText, { color: theme.text }]}>
          Edit
        </Text>
      </Pressable>

      <View style={{ flex: 1 }} />

      {/* QR Toggle */}
      <TouchableOpacity
        style={[
          styles.radioWrap,
          { borderColor: theme.border, backgroundColor: theme.card },
        ]}
        onPress={onToggleQR}
        accessibilityRole="radio"
        accessibilityState={{ selected: showQR }}
      >
        <View
          style={[
            styles.radioOuter,
            { borderColor: showQR ? theme.primary : theme.border },
          ]}
        >
          {showQR && (
            <View
              style={[
                styles.radioInner,
                { backgroundColor: theme.primary },
              ]}
            />
          )}
        </View>

        <Text style={{ color: theme.text, fontWeight: "600" }}>
          QR
        </Text>
      </TouchableOpacity>

      {/* Color Picker */}
      <TouchableOpacity
        style={[
          styles.colorDotWrap,
          { borderColor: theme.border, backgroundColor: theme.card },
        ]}
        onPress={onOpenColorPicker}
        accessibilityRole="button"
        accessibilityLabel="Choose accent color"
      >
        <View
          style={[styles.colorDot, { backgroundColor: color }]}
        />
        <Text style={{ color: theme.text, fontWeight: "600" }}>
          Color
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  actionsRow: {
    marginTop: 12,
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },
  iconText: { fontSize: 16, fontWeight: "700" },
  pressed: { opacity: 0.9 },
  colorDotWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 10,
    height: 40,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  colorDot: {
    width: 18,
    height: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  radioWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default React.memo(QuickActions);
