import React from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";

const Section = ({ title, children, suggestion, theme }) => (
  <View style={[styles.sectionContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>
      <View style={{width: 50 }}/>
      {suggestion ? <Text style={{ color: theme.subtle, fontSize: 12, flexShrink: 1, textAlign: 'right' }}>{suggestion}</Text> : null}
    </View>
    {children}
  </View>
);

const styles = StyleSheet.create({
  sectionContainer: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
  },
  sectionTitle: { fontSize: 18, fontWeight: "800" },
});

export default Section;
