// src/screens/ProfileScreen.js
import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from "react-native";
import { AuthContext } from "../context/AuthContext";
import { auth, db } from "../services/firebaseConfig";
import { ref, onValue } from "firebase/database";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword, signOut } from "firebase/auth";
import Loader from "../components/Loader";
import { getTheme } from "../constants/ColorConstants";
import Header from "../components/Profile/Header";
import ProfileAvatar from "../components/Profile/ProfileAvatar";
import BasicDetailCard from "../components/Profile/BasicDetailCard";
import ChangePasswordSection from "../components/Profile/ChangePasswordSection";
import AccountSection from "../components/Profile/AccountSection";

const ProfileScreen = ({ onBack }) => {
  const scheme = useColorScheme();
  const { user } = useContext(AuthContext);
  const uid = user?.uid;
  const theme = useMemo(() => getTheme(scheme), [scheme]);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // password fields
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [changing, setChanging] = useState(false);

  useEffect(() => {
    if (!uid) return;
    const r = ref(db, `users/${uid}`);
    const unsub = onValue(
      r,
      (snap) => {
        setProfile(snap.val());
        setLoading(false);
      },
      () => setLoading(false)
    );
    return () => unsub();
  }, [uid]);

  const initials = (() => {
    const n = (profile?.name || user?.email || "U").trim();
    return n
      .split(/\s+/)
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  })();

  const validatePassword = () => {
    if (!oldPwd || !newPwd || !confirmPwd) {
      Alert.alert("Missing info", "Please fill all password fields.");
      return false;
    }
    if (newPwd.length < 6) {
      Alert.alert("Weak password", "New password must be at least 6 characters.");
      return false;
    }
    if (newPwd !== confirmPwd) {
      Alert.alert("Mismatch", "New password and confirmation do not match.");
      return false;
    }
    if (newPwd === oldPwd) {
      Alert.alert("Try a new one", "New password should be different from the old password.");
      return false;
    }
    return true;
  };

  const changePassword = async () => {
    if (!validatePassword()) return;
    if (!user?.email) {
      Alert.alert("Unavailable", "Password change requires an email account.");
      return;
    }
    try {
      setChanging(true);
      const cred = EmailAuthProvider.credential(user.email, oldPwd);
      await reauthenticateWithCredential(auth.currentUser, cred);
      await updatePassword(auth.currentUser, newPwd);
      setOldPwd("");
      setNewPwd("");
      setConfirmPwd("");
      Alert.alert("Success", "Your password has been updated.");
    } catch (e) {
      let msg = "Could not change password. Please check your old password.";
      if (e?.code === "auth/wrong-password") msg = "Old password is incorrect.";
      if (e?.code === "auth/too-many-requests") msg = "Too many attempts. Please try again later.";
      Alert.alert("Password change failed", msg);
    } finally {
      setChanging(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      Alert.alert("Logout failed", err.message);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.bg, alignItems: "center", justifyContent: "center" }}>
        <Loader message="Loading profile..." />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={[styles.container, { paddingBottom: 24 }]}>

          <Header
            onBack={onBack}
            theme={theme}
            title="Profile"
            subtitle={user?.email}
          />

          <ProfileAvatar
            uri={profile?.profile}
            initials={initials}
            theme={theme}
          />

          <BasicDetailCard profile={profile} theme={theme} />

          <ChangePasswordSection
            theme={theme}
            oldPwd={oldPwd}
            newPwd={newPwd}
            confirmPwd={confirmPwd}
            setOldPwd={setOldPwd}
            setNewPwd={setNewPwd}
            setConfirmPwd={setConfirmPwd}
            onSubmit={changePassword}
            loading={changing}
          />

          <AccountSection
            theme={theme}
            onLogout={logout}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

/* styles */
const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: 16, gap: 12 },
});

export default ProfileScreen;
