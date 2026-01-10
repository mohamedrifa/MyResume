import React from "react";
import {
  Modal,
  SafeAreaView,
  View,
  Text,
  Pressable,
  StatusBar,
  StyleSheet,
} from "react-native";
import { WebView } from "react-native-webview";

export default function PreviewModal({
  visible,
  onClose,
  previewHtml,
  theme,
  scheme,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView
        style={[
          styles.previewContainer,
          { backgroundColor: theme.bg },
        ]}
      >
        <StatusBar
          barStyle={scheme === "dark" ? "light-content" : "dark-content"}
          backgroundColor={theme.headerBg}
        />

        {/* Header */}
        <View
          style={[
            styles.previewHeader,
            {
              backgroundColor: theme.headerBg,
              borderBottomColor: theme.border,
            },
          ]}
        >
          <Text
            style={[
              styles.previewTitle,
              { color: theme.text },
            ]}
          >
            Resume Preview
          </Text>

          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.previewCloseBtn,
              {
                backgroundColor: theme.soft,
                borderColor: theme.border,
              },
              pressed && { opacity: 0.9 },
            ]}
            android_ripple={{ color: theme.ripple }}
            accessibilityRole="button"
            accessibilityLabel="Close preview"
          >
            <Text style={{ fontSize: 18, color: theme.text }}>✕</Text>
          </Pressable>
        </View>

        {/* Content */}
        <View
          style={[
            styles.previewCard,
            theme.shadow,
            {
              borderColor: theme.border,
              backgroundColor: theme.card,
            },
          ]}
        >
          <WebView
            originWhitelist={["*"]}
            source={{ html: previewHtml, baseUrl: "" }}
            style={styles.webview}
            javaScriptEnabled
            domStorageEnabled
            bounces={false}
            automaticallyAdjustContentInsets
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  previewContainer: {
    flex: 1,
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  previewCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },
  previewCard: {
    flex: 1,
    margin: 16,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
  },
  webview: { flex: 1 }, 
});