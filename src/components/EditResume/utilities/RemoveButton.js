import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";


const RemoveButton = ({ onPress, theme }) => {
  return(
    <TouchableOpacity
      onPress={onPress}
      style={[styles.removeButton, { backgroundColor: theme.card }]}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Text style={[styles.removeText, { color: theme.danger }]}>✕</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  removeButton: { position: "absolute", top: 8, right: 8, paddingVertical: 4, paddingHorizontal: 6, borderRadius: 8, zIndex: 10 },
  removeText: { fontWeight: "900", fontSize: 16 },
});

export default RemoveButton;