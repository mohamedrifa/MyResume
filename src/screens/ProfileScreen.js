// src/screens/ProfileScreen.js
import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  useColorScheme,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { AuthContext } from "../context/AuthContext";
import { auth, db } from "../services/firebaseConfig";
import { ref, onValue } from "firebase/database";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword, signOut } from "firebase/auth";
import Button from "../components/Button";
import InputField from "../components/InputField";
import Loader from "../components/Loader";
import { getTheme } from "../constants/ColorConstants";

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
          {/* Header with Back */}
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={onBack}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.backBtn}
            >
              <Text style={[styles.backTxt, { color: theme.primary }]}>Back</Text>
            </TouchableOpacity>

            <View style={{ flex: 1, alignItems: "center" }}>
              <Text style={[styles.headerTitle, { color: theme.text }]}>Profile</Text>
              <Text style={{ color: theme.subtle, fontSize: 12 }}>{user?.email}</Text>
            </View>

            {/* spacer for symmetry */}
            <View style={{ width: 60 }} />
          </View>

          {/* Avatar */}
          <View style={{ alignItems: "center", marginBottom: 10 }}>
            {profile?.profile ? (
              <Image source={{ uri: profile.profile }} style={styles.avatarImgLg} />
            ) : (
              <View style={[styles.avatarLg, { backgroundColor: theme.avatarBg }]}>
                <Text style={[styles.avatarTxtLg, { color: theme.text }]}>{initials}</Text>
              </View>
            )}
          </View>

          {/* Basic details card */}
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Row label="Name" value={profile?.name || "—"} theme={theme} />
            <Divider color={theme.border} />
            <Row label="Title" value={profile?.title || "—"} theme={theme} />
            <Divider color={theme.border} />
            <Row label="Phone" value={profile?.phone || "—"} theme={theme} />
          </View>

          {/* Change password */}
          <Text style={[styles.sectionHeading, { color: theme.text }]}>Change Password</Text>
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <InputField
              label="Current Password"
              value={oldPwd}
              onChangeText={setOldPwd}
              placeholder="Enter current password"
              theme={theme}
              secureTextEntry
            />
            <InputField
              label="New Password"
              value={newPwd}
              onChangeText={setNewPwd}
              placeholder="Enter new password"
              theme={theme}
              secureTextEntry
            />
            <InputField
              label="Confirm New Password"
              value={confirmPwd}
              onChangeText={setConfirmPwd}
              placeholder="Re-enter new password"
              theme={theme}
              secureTextEntry
            />
            <Button
              title={changing ? "Updating..." : "Update Password"}
              onPress={changePassword}
              disabled={changing}
            />
          </View>

          {/* Account / Logout */}
          <Text style={[styles.sectionHeading, { color: theme.text }]}>Account</Text>
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Button
              title="Logout"
              onPress={logout}
              style={{ backgroundColor: theme.softDangerBg }}
              textStyle={{ color: theme.softDangerText, fontWeight: "800" }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

/* small presentational bits */
const Row = ({ label, value, theme }) => (
  <View style={styles.row}>
    <Text style={[styles.rowLabel, { color: theme.subtle }]}>{label}</Text>
    <Text style={[styles.rowValue, { color: theme.text }]} numberOfLines={1}>
      {value}
    </Text>
  </View>
);

const Divider = ({ color }) => <View style={[styles.divider, { backgroundColor: color }]} />;

/* styles */
const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: 16, gap: 12 },

  /* header with back */
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  backBtn: { width: 60 },
  backTxt: { fontSize: 16, fontWeight: "800" },
  headerTitle: { fontSize: 18, fontWeight: "800" },

  /* avatar */
  avatarLg: { width: 80, height: 80, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  avatarImgLg: { width: 80, height: 80, borderRadius: 20 },
  avatarTxtLg: { fontWeight: "800", fontSize: 22 },

  /* cards */
  sectionHeading: { fontSize: 16, fontWeight: "800", marginTop: 4 },
  card: { borderRadius: 14, padding: 14, borderWidth: 1, gap: 10 },

  /* rows */
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  rowLabel: { fontSize: 13, fontWeight: "700" },
  rowValue: { fontSize: 15, fontWeight: "700", maxWidth: "70%" },

  divider: { height: 1, width: "100%", opacity: 0.6 },
});

export default ProfileScreen;
