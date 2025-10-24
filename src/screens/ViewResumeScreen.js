// src/screens/ViewResumeScreen.js
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Platform,
  Modal,
  Pressable,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  AppState,
  ToastAndroid,
} from "react-native";
import { WebView } from "react-native-webview";
import ColorPicker from "../components/ColorPicker";
import Button from "../components/Button";
import { resumeTemplate } from "../utils/resumeTemplate";
import Share from "react-native-share";
import RNFS from "react-native-fs";
import RNHTMLtoPDF from "react-native-html-to-pdf";

const ViewResumeScreen = ({ resume, onBack, onEdit, navigateToEdit }) => {
  const [loading, setLoading] = useState(false);
  const [color, setColor] = useState("#0b7285");
  const [showPicker, setShowPicker] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [pdfPath, setPdfPath] = useState(null);

  const html = useMemo(() => resumeTemplate(resume, color), [resume, color]);
  const jobName = useMemo(
    () =>
      `Resume_${(resume?.name || "profile")
        .replace(/\s+/g, "_")
        .replace(/[^\w\-]/g, "")}`,
    [resume?.name]
  );

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android' && Platform.Version < 30) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const handleSaveAsPdf = async () => {
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      console.log('Storage permission denied');
      return;
    }
    const customPath = `${RNFS.ExternalStorageDirectoryPath}/Documents`; 
    const dirExists = await RNFS.exists(customPath);
    if (!dirExists) {
      await RNFS.mkdir(customPath);
    }
    const options = {
      html: html,
      fileName: jobName,
      pageSize: 'A4',
    };
    const file = await RNHTMLtoPDF.convert(options);
    const originalPath = file.filePath;
    const newFilePath = `${customPath}/${jobName}.pdf`;
    await RNFS.moveFile(originalPath, newFilePath);
    Alert.alert('PDF Saved', `Location: ${customPath}`);
    setPdfPath(newFilePath);
    return newFilePath;
  };

  const cachePDF = async () => {
    const customPath = `${RNFS.CachesDirectoryPath}/Documents`; 
    const dirExists = await RNFS.exists(customPath);
    if (!dirExists) {
      await RNFS.mkdir(customPath);
    }
    const options = {
      html: html,
      fileName: jobName,
      pageSize: 'A4',
      directory: customPath,
    };
    const file = await RNHTMLtoPDF.convert(options);
    console.log('Cached PDF at:', file.filePath);
    setPdfPath(file.filePath);
    return file.filePath;
  };

  const handleSharePdf = async () => {
    let path = pdfPath;
    console.log('Sharing PDF, current path:', path);
    if (!pdfPath) {
      console.log('No cached PDF found, generating new one for sharing.');
      path = await cachePDF();
    }
    if (path) {
      console.log('Opening share dialog for PDF at:', path);
      await Share.open({ url: `file://${path}` });
    }
  };

  const goToEdit = () => navigateToEdit?.(resume);

  // helpful deriveds
  const initials =
    (resume?.name || "Name")
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "YN";

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle={Platform.OS === "ios" ? "dark-content" : "light-content"} />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatarWrap}>
            <View style={[styles.avatar, { backgroundColor: color }]}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.title} numberOfLines={1}>
                {resume?.name || "Your Name"}
              </Text>
              {!!resume?.title && (
                <Text style={styles.subtitle} numberOfLines={1}>
                  {resume.title}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.actions}>
            <Pressable
              onPress={goToEdit}
              style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
              android_ripple={{ color: "#E5E7EB" }}
              accessibilityRole="button"
              accessibilityLabel="Edit resume"
              hitSlop={8}
            >
              <Text style={styles.iconText}>Edit</Text>
            </Pressable>

            <Button title="Pick color" onPress={() => setShowPicker(true)} />
            <View style={[styles.colorDot, { backgroundColor: color }]} />

            <Button
              title="Back"
              onPress={onBack}
              style={{ backgroundColor: "#6b7280" }}
            />
          </View>
        </View>

        {/* Preview as a card */}
        <View style={styles.card}>
          <WebView
            originWhitelist={["*"]}
            source={{ html, baseUrl: "" }}
            style={styles.webview}
            javaScriptEnabled
            domStorageEnabled
            bounces={false}
          />
        </View>

        {/* Extended FAB */}
        <Pressable
          onPress={() => setShowActions(true)}
          disabled={loading}
          style={({ pressed }) => [
            styles.fab,
            pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] },
            loading && { opacity: 0.65 },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Share or Save as PDF"
          hitSlop={6}
        >
          <Text style={styles.fabLabel}>Share / Save as PDF</Text>
        </Pressable>

        {/* Loading overlay */}
        {loading && (
          <View style={styles.loadingOverlay} pointerEvents="none">
            <View style={styles.loadingCard}>
              <ActivityIndicator size="small" />
              <Text style={styles.loadingText}>Preparing…</Text>
            </View>
          </View>
        )}

        {/* Color Picker Modal */}
        <Modal
          visible={showPicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowPicker(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Choose an accent color</Text>
                <Pressable
                  onPress={() => setShowPicker(false)}
                  style={({ pressed }) => [styles.closeBtn, pressed && styles.pressed]}
                  android_ripple={{ color: "#E5E7EB" }}
                  accessibilityRole="button"
                  accessibilityLabel="Close color picker"
                >
                  <Text style={{ fontSize: 18 }}>✕</Text>
                </Pressable>
              </View>

              <View style={styles.pickerWrap}>
                <ColorPicker
                  initialColor={color}
                  showAlpha={false}
                  size={260}
                  onChange={({ hex }) => setColor(hex)}
                />
              </View>

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

        {/* ACTION SHEET: Share or Save */}
        <Modal
          visible={showActions}
          transparent
          animationType="fade"
          onRequestClose={() => setShowActions(false)}
        >
          <Pressable style={styles.sheetBackdrop} onPress={() => setShowActions(false)}>
            <View />
          </Pressable>
          <View style={styles.sheetCard}>
            <Text style={styles.sheetTitle}>What would you like to do?</Text>
            <View style={styles.sheetButtons}>
              <Pressable
                onPress={handleSharePdf}
                style={({ pressed }) => [styles.sheetBtn, pressed && styles.pressed]}
                android_ripple={{ color: "#E5E7EB" }}
              >
                <Text style={styles.sheetBtnText}>Share as PDF</Text>
              </Pressable>
              <Pressable
                onPress={handleSaveAsPdf}
                style={({ pressed }) => [styles.sheetBtn, pressed && styles.pressed]}
                android_ripple={{ color: "#E5E7EB" }}
              >
                <Text style={styles.sheetBtnText}>Save as PDF</Text>
              </Pressable>
            </View>
            <Pressable
              onPress={() => setShowActions(false)}
              style={({ pressed }) => [styles.sheetCancel, pressed && styles.pressed]}
              android_ripple={{ color: "#E5E7EB" }}
            >
              <Text style={styles.sheetCancelText}>Cancel</Text>
            </Pressable>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const SHADOW =
  Platform.OS === "ios"
    ? {
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 16,
      }
    : { elevation: 10 };

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F8FAFC" }, // slate-50
  container: { flex: 1 },

  /* Header */
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  avatarWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontWeight: "800" },
  title: { fontSize: 20, fontWeight: "800" },
  subtitle: { color: "#6b7280", marginTop: 2 },

  actions: {
    marginTop: 12,
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
  },
  iconText: { fontSize: 16 },
  pressed: { opacity: 0.85 },

  /* Preview Card */
  card: {
    flex: 1,
    margin: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
    ...SHADOW,
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

  /* Extended FAB */
  fab: {
    position: "absolute",
    right: 16,
    bottom: 20,
    minWidth: 164,
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 24,
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    ...SHADOW,
  },
  fabIcon: { fontSize: 16, color: "#fff" },
  fabLabel: { fontSize: 15, color: "#fff", fontWeight: "700" },

  /* Loading Overlay */
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.08)",
  },
  loadingCard: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    ...SHADOW,
  },
  loadingText: { fontWeight: "600" },

  /* Color Picker Modal */
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#fff",
    padding: 16,
    paddingBottom: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
  },
  modalTitle: { fontWeight: "800", fontSize: 16 },
  pickerWrap: {
    backgroundColor: "#0F172A", // slate-900
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  modalActions: { flexDirection: "row", gap: 8, marginTop: 12 },

  /* Action sheet */
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  sheetCard: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    padding: 16,
    paddingBottom: 24,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    ...SHADOW,
  },
  sheetTitle: { fontSize: 16, fontWeight: "800", marginBottom: 12 },
  sheetButtons: { gap: 8 },
  sheetBtn: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
  },
  sheetBtnText: { fontSize: 15, fontWeight: "600", textAlign: "center" },
  sheetCancel: {
    marginTop: 10,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
  },
  sheetCancelText: { fontSize: 15, fontWeight: "600", textAlign: "center", color: "#6b7280" },
});

export default ViewResumeScreen;
