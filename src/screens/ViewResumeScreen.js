// src/screens/ViewResumeScreen.js
import React, { useMemo, useState, useContext, useCallback } from "react";
import {
  View,
  Image,
  Text,
  StyleSheet,
  Alert,
  Platform,
  Modal,
  Pressable,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
  useColorScheme,
  PermissionsAndroid,
  ToastAndroid,
} from "react-native";
import { WebView } from "react-native-webview";
import ColorPicker from "../components/ColorPicker";
import Button from "../components/Button";
import ProfileIcon from "../components/ProfileIcon";
import { resumeTemplate } from "../utils/resumeTemplate";
import Share from "react-native-share";
import RNFS from "react-native-fs";
import RNHTMLtoPDF from "react-native-html-to-pdf";
import { db } from "../services/firebaseConfig";
import { ref, set } from "firebase/database";
import { AuthContext } from "../context/AuthContext";
import { lightTheme, darkTheme } from "../constants/ColorConstants";

const ViewResumeScreen = ({ resume, onBack, navigateToEdit, navigateToProfile }) => {
  const { user } = useContext(AuthContext);
  const uid = user?.uid;
  const scheme = useColorScheme();

  const THEME = scheme === "dark" ? darkTheme : lightTheme;

  const [loading, setLoading] = useState(false);
  const [color, setColor] = useState(resume.resumeColor || "#0b7285");
  const [showPicker, setShowPicker] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [pdfPath, setPdfPath] = useState(null);

  const html = useMemo(() => resumeTemplate(resume, color), [resume, color]);

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const jobName = useMemo(
    () =>
      `Resume_${(resume?.name || "profile")
        .replace(/\s+/g, "_")
        .replace(/[^\w\-]/g, "")}`,
    [resume?.name]
  );

  const initials =
    (resume?.name || "Your Name")
      .trim()
      .split(/\s+/)
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "YN";

  /* ---------- Permissions & Paths ---------- */

  const requestStoragePermission = useCallback(async () => {
    try {
      if (Platform.OS !== "android") return true;
      if (Platform.Version >= 29) return true;
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch {
      return false;
    }
  }, []);

  const getPreferredSaveDir = useCallback(() => {
    if (Platform.OS === "ios") {
      return RNFS.DocumentDirectoryPath;
    }
    // ANDROID
    if (Platform.Version >= 29) {
      return RNFS.DownloadDirectoryPath || RNFS.DocumentDirectoryPath;
    }
    return `${RNFS.ExternalStorageDirectoryPath}/Documents`;
  }, []);

  /* ---------- Firebase color store ---------- */

  const persistColor = useCallback(async (nextColor) => {
    try {
      await set(ref(db, `users/${uid}/resumeColor`), nextColor);
    } catch (e) {
      console.log("Failed to persist color:", e);
    }
  }, [uid]);

  /* ---------- PDF helpers ---------- */

  const generatePDF = useCallback(async (dirOverride) => {
    const options = {
      html,
      fileName: jobName,
      pageSize: "A4",
      base64: false,
    };
    const file = await RNHTMLtoPDF.convert(options);
    if (dirOverride) {
      const newPath = `${dirOverride}/${jobName}.pdf`;
      try {
        // ensure dir exists
        const exists = await RNFS.exists(dirOverride);
        if (!exists) await RNFS.mkdir(dirOverride);
        await RNFS.moveFile(file.filePath, newPath);
        return newPath;
      } catch (err) {
        console.log("Move failed; keeping original:", err);
        return file.filePath;
      }
    }
    return file.filePath;
  }, [html, jobName]);

  const cachePDF = useCallback(async () => {
    try {
      const options = {
        html,
        fileName: jobName,
        pageSize: "A4",
      };
      const file = await RNHTMLtoPDF.convert(options);
      setPdfPath(file.filePath);
      return file.filePath;
    } catch (e) {
      console.log("Cache PDF error:", e);
      throw e;
    }
  }, [html, jobName]);

  /* ---------- Actions ---------- */

  const handleSaveAsPdf = useCallback(async () => {
    setLoading(true);
    try {
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        Alert.alert("Permission needed", "Storage permission is required to save the PDF.");
        return;
      }
      const saveDir = getPreferredSaveDir();
      const outPath = await generatePDF(saveDir);
      setPdfPath(outPath);

      if (Platform.OS === "android") {
        ToastAndroid.show("PDF saved to: " + outPath, ToastAndroid.LONG);
      } else {
        Alert.alert("PDF Saved", `Location:\n${outPath}`);
      }
    } catch (e) {
      console.log("Save error:", e);
      Alert.alert("Couldn't save PDF", "Please try again.");
    } finally {
      setLoading(false);
      setShowActions(false);
    }
  }, [generatePDF, getPreferredSaveDir, requestStoragePermission]);

  const handleSharePdf = useCallback(async () => {
    setLoading(true);
    try {
      let path = pdfPath;
      if (!path) {
        path = await cachePDF();
      }
      await Share.open({
        url: `file://${path}`,
        type: "application/pdf",
        failOnCancel: false,
      });
    } catch (e) {
      if (e?.message?.includes("User did not share")) {
      } else {
        console.log("Share error:", e);
        Alert.alert("Couldn't share PDF", "Please try again.");
      }
    } finally {
      setLoading(false);
      setShowActions(false);
    }
  }, [cachePDF, pdfPath]);

  const handleOpenPicker = useCallback(() => setShowPicker(true), []);
  const handleClosePicker = useCallback(() => {
    setShowPicker(false);
    setColor(resume.resumeColor || "#0b7285");
  }, [resume.resumeColor]);

  const handleColorDone = useCallback(async () => {
    setShowPicker(false);
    await persistColor(color);
    resume.resumeColor = color;
  }, [color, persistColor, resume]);

  const goToEdit = useCallback(() => navigateToEdit?.(resume), [navigateToEdit, resume]);

  /* ---------- UI ---------- */

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: THEME.bg }]}>
      <StatusBar
        barStyle={scheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={THEME.headerBg}
      />
      <View style={[styles.container, { backgroundColor: THEME.bg }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: THEME.headerBg, borderBottomColor: THEME.border }]}>
          <View style={styles.headerRow}>
            <Button
              title="Back"
              onPress={onBack}
              style={{ backgroundColor: THEME.mutedBtnBg }}
              textStyle={{ color: THEME.text }}
              accessibilityLabel="Go back"
            />

            <View style={styles.headerCenter}>
              <Text style={[styles.title, { color: THEME.text }]} numberOfLines={1}>
                {resume?.name || "Your Name"}
              </Text>
              {!!resume?.title && (
                <Text style={[styles.subtitle, { color: THEME.subtle }]} numberOfLines={1}>
                  {resume.title}
                </Text>
              )}
            </View>
            <ProfileIcon
              resume={resume}
              onPress={() => navigateToProfile()}
            />
          </View>

          {/* quick actions */}
          <View style={styles.actionsRow}>
            <Pressable
              onPress={goToEdit}
              style={({ pressed }) => [
                styles.iconBtn,
                { backgroundColor: THEME.card, borderColor: THEME.border },
                pressed && styles.pressed,
              ]}
              android_ripple={{ color: THEME.ripple }}
              accessibilityRole="button"
              accessibilityLabel="Edit resume"
              hitSlop={8}
            >
              <Text style={[styles.iconText, { color: THEME.text }]}>Edit</Text>
            </Pressable>

            <View style={{ flex: 1 }} />

            <TouchableOpacity
              style={[
                styles.colorDotWrap,
                { borderColor: THEME.border, backgroundColor: THEME.card },
              ]}
              onPress={handleOpenPicker}
              accessibilityRole="button"
              accessibilityLabel="Choose accent color"
            >
              <View style={[styles.colorDot, { backgroundColor: color }]} />
              <Text style={{ color: THEME.text, fontWeight: "600" }}>Color</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Preview card */}
        <View
          style={[
            styles.card,
            THEME.shadow,
            { borderColor: THEME.border, backgroundColor: THEME.card },
          ]}
        >
          <WebView
            originWhitelist={["*"]}
            source={{ html, baseUrl: "" }}
            style={styles.webview}
            javaScriptEnabled
            domStorageEnabled
            bounces={false}
            automaticallyAdjustContentInsets
          />
        </View>

        {/* Main action: share / save */}
        <Pressable
          onPress={() => setShowActions(true)}
          disabled={loading}
          style={({ pressed }) => [
            styles.fab,
            { backgroundColor: THEME.primary },
            pressed && { opacity: 0.92, transform: [{ scale: 0.99 }] },
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
            <View style={[styles.loadingCard, THEME.shadow, { backgroundColor: THEME.card }]}>
              <ActivityIndicator size="small" />
              <Text style={[styles.loadingText, { color: THEME.text }]}>Preparing…</Text>
            </View>
          </View>
        )}

        {/* Color Picker Sheet */}
        <Modal
          visible={showPicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowPicker(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={[styles.modalCard, { backgroundColor: THEME.card }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: THEME.text }]}>Choose an accent color</Text>
                <Pressable
                  onPress={handleClosePicker}
                  style={({ pressed }) => [
                    styles.closeBtn,
                    { backgroundColor: THEME.soft, borderColor: THEME.border },
                    pressed && styles.pressed,
                  ]}
                  android_ripple={{ color: THEME.ripple }}
                  accessibilityRole="button"
                  accessibilityLabel="Close color picker"
                >
                  <Text style={{ fontSize: 18, color: THEME.text }}>✕</Text>
                </Pressable>
              </View>

              <View style={[styles.pickerWrap, { backgroundColor: THEME.pickerBg }]}>
                <ColorPicker
                  initialColor={color}
                  showAlpha={false}
                  size={260}
                  onChange={({ hex }) => setColor(hex)}
                />
              </View>

              <View style={styles.modalActions}>
                <Button title="Done" onPress={handleColorDone} />
                <Button
                  title="Reset"
                  onPress={async () => {
                    setShowPicker(false);
                    setColor("#0b7285");
                    await wait(0);
                    setShowPicker(true);
                  }}
                  style={{ backgroundColor: THEME.mutedBtnBg }}
                  textStyle={{ color: THEME.text }}
                />
              </View>
            </View>
          </View>
        </Modal>

        {/* Action Sheet */}
        <Modal
          visible={showActions}
          transparent
          animationType="fade"
          onRequestClose={() => setShowActions(false)}
        >
          <Pressable style={styles.sheetBackdrop} onPress={() => setShowActions(false)}>
            <View />
          </Pressable>

          <View style={[styles.sheetCard, THEME.shadow, { backgroundColor: THEME.card }]}>
            <Text style={[styles.sheetTitle, { color: THEME.text }]}>What would you like to do?</Text>
            <View style={styles.sheetButtons}>
              <Pressable
                onPress={handleSharePdf}
                style={({ pressed }) => [
                  styles.sheetBtn,
                  { backgroundColor: THEME.soft, borderColor: THEME.border },
                  pressed && styles.pressed,
                ]}
                android_ripple={{ color: THEME.ripple }}
              >
                <Text style={[styles.sheetBtnText, { color: THEME.text }]}>Share as PDF</Text>
              </Pressable>

              <Pressable
                onPress={handleSaveAsPdf}
                style={({ pressed }) => [
                  styles.sheetBtn,
                  { backgroundColor: THEME.soft, borderColor: THEME.border },
                  pressed && styles.pressed,
                ]}
                android_ripple={{ color: THEME.ripple }}
              >
                <Text style={[styles.sheetBtnText, { color: THEME.text }]}>Save as PDF</Text>
              </Pressable>
            </View>

            <Pressable
              onPress={() => setShowActions(false)}
              style={({ pressed }) => [
                styles.sheetCancel,
                { backgroundColor: THEME.card, borderColor: THEME.border },
                pressed && styles.pressed,
              ]}
              android_ripple={{ color: THEME.ripple }}
            >
              <Text style={[styles.sheetCancelText, { color: THEME.subtle }]}>Cancel</Text>
            </Pressable>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1 },

  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerCenter: { flex: 1, alignItems: "flex-end" },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontWeight: "800" },
  title: { fontSize: 20, fontWeight: "800" },
  subtitle: { marginTop: 2 },

  actionsRow: {
    marginTop: 12,
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },
  iconText: { fontSize: 16, fontWeight: "700" },
  pressed: { opacity: 0.9 },

  card: {
    flex: 1,
    margin: 16,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
  },
  webview: { flex: 1 },

  colorDotWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 10,
    height: 40,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  colorDot: {
    width: 18,
    height: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  fab: {
    position: "absolute",
    right: 16,
    bottom: 20,
    minWidth: 190,
    height: 50,
    paddingHorizontal: 18,
    borderRadius: 26,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  fabLabel: { fontSize: 15, color: "#fff", fontWeight: "800" },

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
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  loadingText: { fontWeight: "600" },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  modalCard: {
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
    borderWidth: StyleSheet.hairlineWidth,
  },
  modalTitle: { fontWeight: "800", fontSize: 16 },
  pickerWrap: { borderRadius: 12, padding: 12, alignItems: "center" },
  modalActions: { flexDirection: "row", gap: 8, marginTop: 12 },

  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  sheetCard: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    paddingBottom: 24,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  sheetTitle: { fontSize: 16, fontWeight: "800", marginBottom: 12 },
  sheetButtons: { gap: 8 },
  sheetBtn: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  sheetBtnText: { fontSize: 15, fontWeight: "600", textAlign: "center" },
  sheetCancel: {
    marginTop: 10,
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  sheetCancelText: { fontSize: 15, fontWeight: "700", textAlign: "center" },
});

export default ViewResumeScreen;