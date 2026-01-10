import React from "react";
import {
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

/* TextAction component */
const TextAction = ({ title, onPress, color }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Text style={[styles.textAction, color && { color }]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  textAction: { fontWeight: "800", fontSize: 14 },
});

export default TextAction;
