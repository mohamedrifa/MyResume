import React from "react";
import { View, Text, StyleSheet } from "react-native";
import ProfileIcon from "../ProfileIcon";

const Header = ({ resume, user, theme, onProfilePress }) => {
  return (
    <View style={styles.headerRow}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.hi, { color: theme.subtle }]}>Hello,</Text>

        <Text
          style={[styles.name, { color: theme.text }]}
          numberOfLines={1}
        >
          {resume?.name || user?.email || "Your Name"}
        </Text>
      </View>

      <ProfileIcon
        resume={resume}
        onPress={onProfilePress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  hi: { fontSize: 15 },
  name: { fontSize: 24, fontWeight: "800" },
});

export default React.memo(Header);
