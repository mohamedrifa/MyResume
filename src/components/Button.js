// src/components/Button.js
import React from "react";
import { Pressable, Text, StyleSheet, Platform } from "react-native";

const Button = ({
  title,
  onPress,
  style,
  textStyle,
  variant = "primary",
  disabled = false,
}) => {
  const palette = {
    primary: { bg: "#2563EB", bgPressed: "#1E40AF", text: "#FFFFFF" },
    neutral: { bg: "#E5E7EB", bgPressed: "#D1D5DB", text: "#0F172A" },
    danger: { bg: "#EF4444", bgPressed: "#B91C1C", text: "#FFFFFF" },
  }[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        {
          backgroundColor: pressed
            ? palette.bgPressed
            : palette.bg,
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ]}
      android_ripple={{
        color: variant === "neutral" ? "#d1d5db" : "rgba(255,255,255,0.2)",
      }}
    >
      <Text style={[styles.txt, { color: palette.text }, textStyle]}>
        {title}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 3 },
    }),
  },
  txt: {
    fontWeight: "700",
    fontSize: 15,
    letterSpacing: 0.3,
  },
});

export default Button;
