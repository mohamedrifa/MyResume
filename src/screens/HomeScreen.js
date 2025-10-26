// src/screens/HomeScreen.js
import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  useColorScheme,
  SafeAreaView,
  Image,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import Button from "../components/Button";
import ProfileIcon from "../components/ProfileIcon";
import { AuthContext } from "../context/AuthContext";
import { db } from "../services/firebaseConfig";
import { ref, onValue } from "firebase/database";
import Loader from "../components/Loader";

const HomeScreen = ({ navigateToEdit, navigateToView, navigateToProfile }) => {
  const { user } = useContext(AuthContext);
  const scheme = useColorScheme();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(false);
  const uid = user?.uid;

  const theme = useMemo(
    () =>
      scheme === "dark"
        ? {
            bg: "#0B1220",
            card: "#101826",
            cardBorder: "#1C2736",
            text: "#F8FAFC",
            subtle: "#9CA3AF",
            primary: "#2563EB",
            success: "#10B981",
            danger: "#EF4444",
            chipBg: "rgba(148,163,184,0.12)",
            chipText: "#E5E7EB",
            divider: "rgba(255,255,255,0.06)",
            avatarBg: "rgba(37,99,235,0.2)",
            shadow: { shadowColor: "#000", shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: { width: 0, height: 8 } },
          }
        : {
            bg: "#F6F7F9",
            card: "#FFFFFF",
            cardBorder: "#E5E7EB",
            text: "#0F172A",
            subtle: "#6B7280",
            primary: "#2563EB",
            success: "#10B981",
            danger: "#EF4444",
            chipBg: "#F3F4F6",
            chipText: "#111827",
            divider: "#E5E7EB",
            avatarBg: "rgba(37,99,235,0.12)",
            shadow: { shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
          },
    [scheme]
  );

  useEffect(() => {
    if (!uid) return;
    setLoading(true);
    const r = ref(db, `users/${uid}`);
    const unsub = onValue(
      r,
      (snapshot) => {
        setResume(snapshot.val());
        setLoading(false);
      },
      (error) => {
        console.warn(error);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [uid]);

  const initials = useMemo(() => {
    const n = (resume?.name || user?.email || "You").trim();
    return n
      .split(/\s+/)
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }, [resume?.name, user?.email]);

  // counts for chips
  const countOf = (val) => {
    if (!val) return 0;
    if (Array.isArray(val)) return val.length;
    if (typeof val === "object") return Object.keys(val).length;
    if (typeof val === "string") {
      try {
        const a = JSON.parse(val);
        return Array.isArray(a) ? a.length : 0;
      } catch {
        return (val.split(";").filter(Boolean) || []).length;
      }
    }
    return 0;
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={scheme === "dark" ? "light-content" : "dark-content"} backgroundColor={theme.bg} />

      <ScrollView contentContainerStyle={[styles.container, { paddingBottom: 28 }]}>
        {/* header */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.hi, { color: theme.subtle }]}>Hello,</Text>
            <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
              {resume?.name || user?.email || "Your Name"}
            </Text>
          </View>

          <ProfileIcon
            resume={resume}
            onPress={() => navigateToProfile()}
          />
        </View>

        {/* profile card */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.card, borderColor: theme.cardBorder },
            theme.shadow,
          ]}
        >
          <View style={styles.cardHeaderRow}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Profile</Text>
            <TouchableOpacity onPress={() => navigateToEdit(resume || {})} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={[styles.link, { color: theme.primary }]}>Edit</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
            {resume?.title || "Add your title"}
          </Text>
          <Text style={[styles.summary, { color: theme.subtle }]} numberOfLines={3}>
            {resume?.summary || "Tell a short, impactful summary about yourself."}
          </Text>

          {/* chips */}
          <View style={styles.chipsRow}>
            <Chip label={`${countOf(resume?.skills)} skills`} theme={theme} />
            <Chip label={`${countOf(resume?.experience)} experience`} theme={theme} />
            <Chip label={`${countOf(resume?.projects)} projects`} theme={theme} />
          </View>

          <View style={[styles.divider, { backgroundColor: theme.divider }]} />

          {/* actions */}
          <View style={styles.actionsCol}>
            <Button
              title="View & Download PDF"
              onPress={() => navigateToView(resume || {})}
              style={{ backgroundColor: theme.success }}
            />
          </View>
        </View>

        <Text style={[styles.tip, { color: theme.subtle }]}>
          Tip: Keep your summary short and impactful. Add your latest projects and roles.
        </Text>
      </ScrollView>

      {/* Floating Edit */}
      <TouchableOpacity
        onPress={() => navigateToEdit(resume || {})}
        activeOpacity={0.9}
        accessibilityRole="button"
        accessibilityLabel="Edit Resume"
        style={[styles.fab, { backgroundColor: theme.primary }]}
      >
        <Text style={styles.fabTxt}>Edit Resume</Text>
      </TouchableOpacity>
      {loading &&
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0b1220", position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
        <Loader message="Loading your profile..." />
      </View>}

    </SafeAreaView>
  );
};

const Chip = ({ label, theme }) => (
  <View style={[styles.chip, { backgroundColor: theme.chipBg, borderColor: theme.cardBorder }]}>
    <Text style={[styles.chipTxt, { color: theme.chipText }]}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: 18 },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  hi: { fontSize: 15 },
  name: { fontSize: 24, fontWeight: "800" },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImg: { width: 48, height: 48, borderRadius: 12 },
  avatarTxt: { fontWeight: "800" },

  card: {
    width: "100%",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  sectionTitle: { fontWeight: "800", fontSize: 16 },
  link: { fontWeight: "800" },

  title: { fontSize: 16, fontWeight: "700", marginTop: 2 },
  summary: { marginTop: 6, fontSize: 14, lineHeight: 20 },

  chipsRow: { flexDirection: "row", gap: 8, marginTop: 12, flexWrap: "wrap" },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  chipTxt: { fontWeight: "700", fontSize: 12 },

  divider: { height: 1, width: "100%", marginTop: 14, marginBottom: 12 },

  actionsCol: { gap: 10 },

  tip: { marginTop: 12, fontSize: 12 },

  fab: {
    position: "absolute",
    right: 16,
    bottom: 20,
    height: 50,
    paddingHorizontal: 16,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  fabIcon: { color: "#fff", marginRight: 8, fontSize: 16 },
  fabTxt: { color: "#fff", fontWeight: "800", fontSize: 15 },
});

export default HomeScreen;
