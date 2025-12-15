// src/App.js
import React, { useContext, useState, useEffect, useMemo } from "react";
import {
  BackHandler,
  Alert,
  Modal,
  useColorScheme,
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Linking,
} from "react-native";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { db } from "./services/firebaseConfig";
import { ref, onValue } from "firebase/database";

import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";
import HomeScreen from "./screens/HomeScreen";
import EditResumeScreen from "./screens/EditResumeScreen";
import ViewResumeScreen from "./screens/ViewResumeScreen";
import ProfileScreen from "./screens/ProfileScreen";
import { getTheme } from "./constants/ColorConstants";

const CURRENT_VERSION = "1.2";

const AppContent = () => {
  const { user, initializing } = useContext(AuthContext);
  const [authMode, setAuthMode] = useState("login");
  const [routeStack, setRouteStack] = useState(["home"]);
  const [resumeData, setResumeData] = useState(null);

  const currentRoute = routeStack[routeStack.length - 1];

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (!user) return false;

        if (routeStack.length > 1) {
          setRouteStack((prev) => prev.slice(0, prev.length - 1));
          return true;
        } else {
          Alert.alert("Exit App", "Do you want to exit the app?", [
            { text: "Cancel", style: "cancel" },
            { text: "Exit", onPress: () => BackHandler.exitApp() },
          ]);
          return true;
        }
      }
    );

    return () => backHandler.remove();
  }, [routeStack, user]);

  if (initializing) return null;

  if (!user) {
    return authMode === "login" ? (
      <LoginScreen onSwitchToSignup={() => setAuthMode("signup")} />
    ) : (
      <SignupScreen onSwitchToLogin={() => setAuthMode("login")} />
    );
  }

  const navigate = (newRoute, data = null) => {
    if (data) setResumeData(data);
    setRouteStack((prev) => [...prev, newRoute]);
  };

  switch (currentRoute) {
    case "home":
      return (
        <HomeScreen
          navigateToEdit={() => navigate("edit")}
          navigateToView={() => navigate("view")}
          navigateToProfile={() => navigate("profile")}
        />
      );

    case "edit":
      return (
        <EditResumeScreen
          onBack={() =>
            setRouteStack((prev) => prev.slice(0, prev.length - 1))
          }
          navigateToProfile={() => navigate("profile")}
        />
      );

    case "profile":
      return (
        <ProfileScreen
          onBack={() =>
            setRouteStack((prev) => prev.slice(0, prev.length - 1))
          }
        />
      );

    case "view":
      return (
        <ViewResumeScreen
          resume={resumeData}
          onBack={() =>
            setRouteStack((prev) => prev.slice(0, prev.length - 1))
          }
          navigateToEdit={(data) => navigate("edit")}
          navigateToProfile={() => navigate("profile")}
        />
      );

    default:
      return null;
  }
};

export default function App() {
  const scheme = useColorScheme();
  const [AppData, setAppData] = useState(null);
  const [showUpdate, setShowUpdate] = useState(false);

  const theme = useMemo(() => getTheme(scheme), [scheme]);

  /* ---------- Fetch App Config ---------- */
  useEffect(() => {
    const r = ref(db, "App");
    const unsub = onValue(
      r,
      (snapshot) => setAppData(snapshot.val()),
      (error) => console.warn(error)
    );
    return () => unsub();
  }, []);

  /* ---------- Version Check ---------- */
  useEffect(() => {
    if (!AppData?.version) return;

    const latest = parseFloat(AppData.version);
    const current = parseFloat(CURRENT_VERSION);

    if (latest > current) setShowUpdate(true);
  }, [AppData]);

  return (
    <AuthProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f3f4f6" }}>
        <AppContent />

        {/* 🔔 Update Modal */}
        <Modal visible={showUpdate} transparent animationType="fade">
          <View style={styles.updateBackdrop}>
            <View style={[styles.updateCard, { backgroundColor: theme.card }]}>
              <Text style={[styles.updateTitle, { color: theme.text }]}>
                New Version Available
              </Text>

              <Text style={[styles.updateText, { color: theme.subtle }]}>
                A newer version of the app is available. Please update to
                continue.
              </Text>

              <View style={styles.updateActions}>
                <TouchableOpacity
                  style={[
                    styles.updateBtn,
                    { backgroundColor: theme.mutedBtnBg },
                  ]}
                  onPress={() => setShowUpdate(false)}
                >
                  <Text style={{ color: theme.text, fontWeight: "700" }}>
                    Later
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.updateBtn,
                    { backgroundColor: theme.primary },
                  ]}
                  onPress={() => Linking.openURL(AppData?.url)}
                >
                  <Text style={{ color: "#fff", fontWeight: "800" }}>
                    Download
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  updateBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 24,
  },
  updateCard: {
    borderRadius: 16,
    padding: 20,
  },
  updateTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 6,
  },
  updateText: {
    fontSize: 14,
    marginBottom: 16,
  },
  updateActions: {
    flexDirection: "row",
    gap: 10,
  },
  updateBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
