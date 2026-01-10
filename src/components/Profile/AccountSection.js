import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Button from "../Button";

const AccountSection = ({ theme, onLogout }) => {
  return (
    <>
      <Text style={[styles.sectionHeading, { color: theme.text }]}>Account</Text>
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Button
          title="Logout"
          onPress={onLogout}
          style={{ backgroundColor: theme.softDangerBg }}
          textStyle={{ color: theme.softDangerText, fontWeight: "800" }}
        />
      </View>
    </>
  );
};

export default AccountSection;

const styles = StyleSheet.create({
  sectionHeading: { fontSize: 16, fontWeight: "800", marginTop: 4 },
  card: { borderRadius: 14, padding: 14, borderWidth: 1, gap: 10 },
});
