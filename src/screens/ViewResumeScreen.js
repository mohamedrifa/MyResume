// src/screens/ViewResumeScreen.js
import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, Alert, Platform, Modal } from "react-native";
import { WebView } from "react-native-webview";
import ColorPicker from "../components/ColorPicker"; // ⬅️ our custom picker
// import RNHTMLtoPDF from "react-native-html-to-pdf";

import Button from "../components/Button";
import { resumeTemplate } from "../utils/pdfTemplate";

const ViewResumeScreen = ({ resume, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [color, setColor] = useState("#0b7285");
  const [showPicker, setShowPicker] = useState(false);

  // IMPORTANT: pass color directly
  const html = useMemo(() => resumeTemplate(resume, color), [resume, color]);

  const generatePDF = async () => {
    try {
      setLoading(true);

      const fileName = `Resume_${(resume?.name || "profile")
        .replace(/\s+/g, "_")
        .replace(/[^\w\-]/g, "")}`;

      // const pdfOptions = {
      //   html,
      //   fileName,
      //   base64: false,
      //   directory: Platform.OS === "android" ? "Downloads" : "Documents",
      // };
      // const { filePath } = await RNHTMLtoPDF.convert(pdfOptions);

      setLoading(false);
      Alert.alert("PDF generated", `Saved to:\n${filePath || "(unknown path)"}`);
    } catch (err) {
      setLoading(false);
      Alert.alert("PDF error", err?.message || "Failed to generate PDF");
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{resume?.name || "Your Name"}</Text>
          {!!resume?.title && <Text style={styles.subtitle}>{resume.title}</Text>}
        </View>

        <View style={styles.actions}>
          <Button title="Pick color" onPress={() => setShowPicker(true)} />
          <View style={[styles.colorDot, { backgroundColor: color }]} />
          <Button
            title={loading ? "Generating..." : "Download as PDF"}
            onPress={generatePDF}
            disabled={loading}
          />
          <Button title="Back" onPress={onBack} style={{ backgroundColor: "#6b7280" }} />
        </View>
      </View>

      {/* HTML Preview */}
      <WebView
        originWhitelist={["*"]}
        source={{ html, baseUrl: "" }}
        style={styles.webview}
        javaScriptEnabled
        domStorageEnabled
        scalesPageToFit
        bounces={false}
      />

      {/* Color Picker Modal (custom, no libraries) */}
      <Modal
        visible={showPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPicker(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Choose an accent color</Text>

            <ColorPicker
              initialColor={color}
              showAlpha={false}
              size={260}
              onChange={({ hex }) => {
                setColor(hex);
              }}
            />

            <View style={styles.modalActions}>
              <Button title="Done" onPress={() => setShowPicker(false)} />
              <Button
                title="Reset"
                onPress={() => setColor("#0b7285")}
                style={{ backgroundColor: "#6b7280" }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  topBar: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  title: { fontSize: 20, fontWeight: "800" },
  subtitle: { color: "#6b7280", marginTop: 2 },
  actions: {
    marginTop: 10,
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  webview: { flex: 1, backgroundColor: "#fff" },
  colorDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginHorizontal: 4,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalTitle: { fontWeight: "800", fontSize: 16, marginBottom: 12 },
  modalActions: { flexDirection: "row", gap: 8, marginTop: 12 },
});

export default ViewResumeScreen;
