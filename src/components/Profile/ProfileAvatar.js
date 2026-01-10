import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

const ProfileAvatar = ({
  uri,
  initials,
  theme,
}) => {
  const isImage = !!uri;

  return (
    <View style={{ alignItems: "center", marginBottom: 10 }}>
      {uri ? (
        <Image source={{ uri }} style={styles.avatarImgLg} />
      ) : (
        <View style={[styles.avatarLg, { backgroundColor: theme.avatarBg }]}>
          <Text style={[styles.avatarTxtLg, { color: theme.text }]}>{initials}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  avatarLg: { width: 80, height: 80, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  avatarImgLg: { width: 80, height: 80, borderRadius: 20 },
  avatarTxtLg: { fontWeight: "800", fontSize: 22 },
});

export default ProfileAvatar;
