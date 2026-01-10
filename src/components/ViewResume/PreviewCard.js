import React from "react";
import { View, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";

const PreviewCard = ({ html, theme }) => {
  return (
    <>
      <View
        style={[
          styles.card,
          theme.shadow,
          { borderColor: theme.border, backgroundColor: theme.card },
        ]}
      >
        <WebView
          textZoom={65}
          originWhitelist={["*"]}
          source={{ html, baseUrl: "" }}
          style={styles.webview}
          javaScriptEnabled
          domStorageEnabled
          bounces={false}
          automaticallyAdjustContentInsets
        />
      </View>

      <View style={{ height: 50 }} />
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
  },
  webview: { flex: 1 },
});

export default React.memo(PreviewCard);
