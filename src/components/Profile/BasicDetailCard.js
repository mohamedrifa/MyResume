import React from "react";
import { View, StyleSheet } from "react-native";
import Row from "./utilities/Row";
import Divider from "./utilities/Divider";

const BasicDetailCard = ({ profile, theme }) => {
  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Row label="Name" value={profile?.name || "—"} theme={theme} />
      <Divider color={theme.border} />
      <Row label="Title" value={profile?.title || "—"} theme={theme} />
      <Divider color={theme.border} />
      <Row label="Phone" value={profile?.phone || "—"} theme={theme} />
    </View>
  );
};

const styles = StyleSheet.create({
  card: { 
    borderRadius: 14, 
    padding: 14, 
    borderWidth: 1, 
    gap: 10 
  },
});

export default BasicDetailCard;