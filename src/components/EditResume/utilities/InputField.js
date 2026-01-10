import React, { useState } from "react";
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from "react-native";
import Svg, { Path } from "react-native-svg";

const InputField = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  multiline = false,
  keyboardType,
  autoCapitalize,
  theme = {
    card: "#fff",
    text: "#0f172a",
    subtle: "#6b7280",
    border: "#e5e7eb",
    primary: "#2563eb",
  },
}) => {
  const [focused, setFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(secureTextEntry);

  return (
    <View style={styles.container}>
      {label ? <Text style={[styles.label, { color: theme.subtle }]}>{label}</Text> : null}

      <View
        style={[
          styles.inputWrap,
          {
            borderColor: focused ? theme.primary : theme.border,
            backgroundColor: theme.card,
          },
        ]}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.subtle}
          style={[
            styles.input,
            multiline && styles.multiline,
            { color: theme.text },
          ]}
          multiline={multiline}
          textAlignVertical={multiline ? "top" : "center"}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          secureTextEntry={isSecure}
        />

        {secureTextEntry ? (
          <TouchableOpacity
            onPress={() => setIsSecure(!isSecure)}
            style={styles.eyeBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {isSecure ? <EyeOffIcon color={theme.subtle} /> : <EyeIcon color={theme.primary} />}
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

/* ---------- SVG ICONS ---------- */
const EyeIcon = ({ color = "#6b7280", size = 22 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12z"
      stroke={color}
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"
      stroke={color}
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const EyeOffIcon = ({ color = "#6b7280", size = 22 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 3l18 18M10.6 10.6a3 3 0 1 0 4.8 4.8M9.88 4.26A8.73 8.73 0 0 1 12 4c6.5 0 10.5 7 10.5 7a17.1 17.1 0 0 1-2.2 2.85M6.6 6.6C3.67 8.75 1.5 12 1.5 12s4 7 10.5 7c1.26 0 2.45-.23 3.54-.64"
      stroke={color}
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  container: { marginVertical: 8 },
  label: { marginBottom: 6, fontWeight: "700", fontSize: 13 },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1.5,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
  },
  multiline: { minHeight: 100 },
  eyeBtn: {
    paddingLeft: 8,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default InputField;
