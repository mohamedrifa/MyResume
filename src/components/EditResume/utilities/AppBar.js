import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
} from "react-native";
import TextAction from "./TextAction";

/* AppBar component */
const AppBar = ({ title, onBack, onPreview, theme }) => (
  <SafeAreaView style={[styles.appbarSafe, { backgroundColor: theme.headerBg, borderBottomColor: theme.border }]}>
    <View style={styles.appbar}>
      <TextAction title={"Back"} onPress={onBack} color={theme.primary} />
      <Text style={[styles.appbarTitle, { color: theme.text }]} numberOfLines={1}>
        {title}
      </Text>
      <TextAction title={"Preview"} onPress={onPreview} color={theme.primary} />
    </View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  appbarSafe: { borderBottomWidth: 1 },
  appbar: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  appbarTitle: { fontSize: 17, fontWeight: "700" },
});

export default AppBar;
