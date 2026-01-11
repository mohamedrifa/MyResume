import React, { useState } from "react";
import { View, TextInput, Text, StyleSheet } from "react-native";

const InputField = ({
  label,
  value,
  onChangeText,
  placeholder,
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
        />
      </View>
    </View>
  );
};

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
});

export default InputField;
