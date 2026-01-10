import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Button from "../Button";
import ProfileIcon from "../ProfileIcon";

const Header = ({
  resume,
  theme,
  onBack,
  onProfilePress,
}) => {
  return (
    <View style={styles.headerRow}>
      <Button
        title="Back"
        onPress={onBack}
        style={{ backgroundColor: theme.mutedBtnBg }}
        textStyle={{ color: theme.text }}
        accessibilityLabel="Go back"
      />

      <View style={styles.headerCenter}>
        <Text
          style={[styles.title, { color: theme.text }]}
          numberOfLines={1}
        >
          {resume?.name || "Your Name"}
        </Text>

        {!!resume?.title && (
          <Text
            style={[styles.subtitle, { color: theme.subtle }]}
            numberOfLines={1}
          >
            {resume.title}
          </Text>
       )}
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
    gap: 12,
  },
  headerCenter: { flex: 1, alignItems: "flex-end" },
  title: { fontSize: 20, fontWeight: "800" },
  subtitle: { marginTop: 2 },
});

export default React.memo(Header);
