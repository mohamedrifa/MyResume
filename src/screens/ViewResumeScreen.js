// src/screens/ViewResumeScreen.js
import React, { useMemo, useState, useContext, useCallback } from "react";
import {
  View,
  StyleSheet,
  Alert,
  Platform,
  SafeAreaView,
  StatusBar,
  useColorScheme,
  PermissionsAndroid,
  ToastAndroid,
} from "react-native";
import { resumeTemplate } from "../utils/resumeTemplate";
import Share from "react-native-share";
import RNFS from "react-native-fs";
import RNHTMLtoPDF from "react-native-html-to-pdf";
import { db } from "../services/firebaseConfig";
import { ref, set } from "firebase/database";
import { AuthContext } from "../context/AuthContext";
import { lightTheme, darkTheme } from "../constants/ColorConstants";
import { getTheme } from "../constants/ColorConstants";
import Loader from "../components/Loader";
import { useFetchUserData } from "../utils/apiUtil";
import { RESUME_LINK } from "../constants/TextConstant";
import Header from "../components/ViewResume/Header";
import QuickActions from "../components/ViewResume/QuickActions";
import PreviewCard from "../components/ViewResume/PreviewCard";
import ShareSaveFAB from "../components/ViewResume/ShareSaveFab";
import PreparingOverlay from "../components/ViewResume/PreparingOverlay";
import ColorPickerModal from "../components/ViewResume/ColorPickerModal";
import ShareActionsSheet from "../components/ViewResume/ShareActionsSheet";

const ViewResumeScreen2 = ({ resume, onBack, navigateToEdit, navigateToProfile }) => {
  const { user } = useContext(AuthContext);
  const uid = user?.uid;
  const scheme = useColorScheme();

  const THEME = scheme === "dark" ? darkTheme : lightTheme;

  const [loading, setLoading] = useState(false);
  const [color, setColor] = useState(resume.resumeColor || "#0b7285");
  const [showQR, setShowQR] = useState(resume.QREnabled || false);
  const [showPicker, setShowPicker] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [pdfPath, setPdfPath] = useState(null);

  const html = useMemo(() => resumeTemplate(resume, color, showQR), [resume, color, showQR]);

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const jobName = useMemo(
    () =>
      `Resume_${(resume?.name || "profile")
        .replace(/\s+/g, "_")
        .replace(/[^\w\-]/g, "")}`,
    [resume?.name]
  );
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

  const QREnabled = async() => {
    try {
      await set(ref(db, `users/${uid}/QREnabled`), !showQR);
    } catch (e) {
      console.log("Failed to persist QR:", e);
    }
  }
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
      setPdfPath(newFilePath);
    if (Platform.OS === "android") {
      ToastAndroid.show("PDF saved to: " + newFilePath, ToastAndroid.LONG);
    } else {
      Alert.alert("PDF Saved", `Location:\n${newFilePath}`);
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

  const handleOpenLink = async () => {
    try {
      await Share.open({
        message: `${RESUME_LINK}/${uid}`,
        type: "link",
      });
    } catch (error) {
      console.log(error);
    }
  }

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
      <StatusBar barStyle={scheme === "dark" ? "light-content" : "dark-content"} backgroundColor={THEME.headerBg} />
      <View style={[styles.container, { backgroundColor: THEME.bg }]}>

        <Header
          resume={resume}
          theme={THEME}
          styles={styles}
          onBack={onBack}
          onProfilePress={navigateToProfile}
        />

        <QuickActions
          theme={THEME}
          styles={styles}
          color={color}
          showQR={showQR}
          onEdit={goToEdit}
          onToggleQR={() => {
            QREnabled();
            setShowQR(v => !v);
          }}
          onOpenColorPicker={handleOpenPicker}
        />

        <PreviewCard
          html={html}
          theme={THEME}
        />

        <ShareSaveFAB
          loading={loading}
          theme={THEME}
          onPress={() => setShowActions(true)}
        />

        {/* Loading overlay */}
        <PreparingOverlay
          visible={loading}
          theme={THEME}
          styles={styles}
        />

        {/* Color Picker Sheet */}
        <ColorPickerModal
          visible={showPicker}
          theme={THEME}
          color={color}
          onChangeColor={setColor}
          onClose={handleClosePicker}
          onDone={handleColorDone}
          onReset={async () => {
            setShowPicker(false);
            setColor("#0b7285");
            await wait(0);
            setShowPicker(true);
          }}
        />

        {/* Action Sheet */}
        <ShareActionsSheet
          visible={showActions}
          theme={THEME}
          onClose={() => setShowActions(false)}
          onSharePdf={handleSharePdf}
          onSavePdf={handleSaveAsPdf}
          onOpenLink={handleOpenLink}
        />
      </View>
    </SafeAreaView>
  );
};

const ViewResumeScreen = ({ onBack, navigateToEdit, navigateToProfile }) => {
  const scheme = useColorScheme();
  const theme = useMemo(() => getTheme(scheme), [scheme]);
  const { resume, loading } = useFetchUserData();
  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { justifyContent: "center", alignItems: "center" }]}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.bg, position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
        <Loader message="Loading..." />
      </View>
      </SafeAreaView>
    );
  } else {
    return (
      <ViewResumeScreen2
        resume={resume}
        onBack={onBack}
        navigateToEdit={navigateToEdit}
        navigateToProfile={navigateToProfile}
      />
    );
  }
}

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, padding: 12 },
});

export default ViewResumeScreen;