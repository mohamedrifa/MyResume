// src/screens/ViewResumeScreen.js
import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, Alert, Platform } from "react-native";
import { WebView } from "react-native-webview";
// import RNHTMLtoPDF from "react-native-html-to-pdf";

import Button from "../components/Button";
import { resumeTemplate } from "../utils/pdfTemplate";

const ViewResumeScreen = ({ resume, onBack }) => {
  const [loading, setLoading] = useState(false);

  // Build HTML once per resume change
  const html = useMemo(() => resumeTemplate(resume || {}), [resume]);

  const generatePDF = async () => {
    try {
      setLoading(true);

      const fileName = `Resume_${(resume?.name || "profile")
        .replace(/\s+/g, "_")
        .replace(/[^\w\-]/g, "")}`;

      // Create the PDF from the HTML
      // const pdfOptions = {
      //   html,
      //   fileName,
      //   base64: false,
      //   // On Android, 'Downloads' is the most user-visible location without extra perms
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
        // Helpful for better PDF fidelity / fonts:
        javaScriptEnabled
        domStorageEnabled
        scalesPageToFit
        // Avoid bouncing on iOS
        bounces={false}
      />
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
    flexWrap: "wrap",
  },
  webview: {
    flex: 1,
    backgroundColor: "#fff",
  },
});

export default ViewResumeScreen;
