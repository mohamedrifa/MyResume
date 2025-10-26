import React, { useMemo } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from "react-native";

const ProfileIcon = ({ resume, onPress }) => {
  const scheme = useColorScheme();

  const theme = useMemo(
    () =>
      scheme === "dark"
        ? {
            text: "#F8FAFC",
            avatarBg: "rgba(37,99,235,0.2)",
          }
        : {
            text: "#0F172A",
            avatarBg: "rgba(37,99,235,0.12)",
          },
    [scheme]
  );

  const initials = (resume?.name || "U")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Open profile"
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={styles.wrapper}
    >
      {resume?.profile ? (
        <Image source={{ uri: resume.profile }} style={styles.avatarImg} />
      ) : (
        <View style={[styles.avatar, { backgroundColor: theme.avatarBg }]}>
          <Text style={[styles.avatarTxt, { color: theme.text }]}>{initials}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImg: {
    width: 44,
    height: 44,
    borderRadius: 12,
  },
  avatarTxt: {
    fontWeight: "700",
    fontSize: 16,
  },
});

export default ProfileIcon;
