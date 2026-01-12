import React, { useState, useRef, useEffect } from "react";
import { View, TextInput, Text, StyleSheet } from "react-native";
import { RichEditor, RichToolbar, actions } from "react-native-pell-rich-editor";

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
  const editorRef = useRef(null);
  
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (
      multiline &&
      editorRef.current &&
      !hasInitialized.current &&
      value
    ) {
      editorRef.current.setContentHTML(value);
      hasInitialized.current = true;
    }
  }, [value, multiline]);

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: theme.subtle }]}>{label}</Text>}

      <View
        style={[
          styles.inputWrap,
          {
            borderColor: focused ? theme.primary : theme.border,
            backgroundColor: theme.card,
          },
        ]}
      >
      {/* 🔹 MULTILINE → RICH TEXT */}
      {multiline ? (
        <>
          <View style={[styles.richWrap, { backgroundColor: theme.card }]}>
            <RichToolbar
              editor={editorRef}
              actions={[
                actions.setBold,
                actions.setItalic,
                actions.setUnderline,
              ]}
              iconTint={theme.subtle}
              selectedIconTint={theme.primary}
              style={[styles.toolbar, { borderBottomColor: theme.border, backgroundColor: theme.card }]}
            />
            <RichEditor
              ref={editorRef}
              placeholder={placeholder}
              onChange={onChangeText}
              editorStyle={{
                color: theme.text,
                backgroundColor: theme.card,
                placeholderColor: theme.subtle,
              }}
              style={styles.richInput}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
            />
          </View>
        </>
      ) : (
          /* 🔹 SINGLE LINE → NORMAL INPUT */
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={theme.subtle}
            style={[styles.input, { color: theme.text }]}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginVertical: 8 },
  label: { marginBottom: 6, fontWeight: "700", fontSize: 13 },
  inputWrap: {
    borderRadius: 10,
    borderWidth: 1.5,
    overflow: "hidden",
  },
  input: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 15,
  },
  richWrap: {
    borderRadius: 10,
    overflow: "hidden",
  },
  toolbar: {
    paddingHorizontal: 6,
    borderBottomWidth: 1,
  },
  richInput: {
    minHeight: 120,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
});

export default InputField;