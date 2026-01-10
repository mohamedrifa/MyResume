import React from "react";
import { View, Text, StyleSheet } from "react-native";
import InputField from "../InputField";
import Button from "../Button";

const ChangePasswordSection = ({
  theme,
  oldPwd,
  newPwd,
  confirmPwd,
  setOldPwd,
  setNewPwd,
  setConfirmPwd,
  onSubmit,
  loading,
}) => {
  return (
    <>
      <Text style={[styles.sectionHeading, { color: theme.text }]}>Change Password</Text>
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <InputField
          label="Current Password"
          value={oldPwd}
          onChangeText={setOldPwd}
          placeholder="Enter current password"
          theme={theme}
          secureTextEntry
        />
        <InputField
          label="New Password"
          value={newPwd}
          onChangeText={setNewPwd}
          placeholder="Enter new password"
          theme={theme}
          secureTextEntry
        />
        <InputField
          label="Confirm New Password"
          value={confirmPwd}
          onChangeText={setConfirmPwd}
          placeholder="Re-enter new password"
          theme={theme}
          secureTextEntry
        />
        <Button
          title={loading ? "Updating..." : "Update Password"}
          onPress={onSubmit}
          disabled={loading}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  sectionHeading: { fontSize: 16, fontWeight: "800", marginTop: 4 },
  card: { borderRadius: 14, padding: 14, borderWidth: 1, gap: 10 },
});

export default ChangePasswordSection;