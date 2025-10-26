// src/screens/EditResumeScreen.js
import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
  SafeAreaView,
  Image,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import InputField from "../components/InputField";
import Button from "../components/Button";
import { db } from "../services/firebaseConfig";
import { ref, update, get, child } from "firebase/database";
import { AuthContext } from "../context/AuthContext";
import RNFS from "react-native-fs";
import { launchImageLibrary } from "react-native-image-picker";

/* ---------- helpers / normalizers ---------- */
const emptyEdu = () => ({ stream: "", from: "", to: "", percentage: "", institute: "" });
const emptyExp = () => ({ role: "", location: "", company: "", from: "", to: "", summary: "" });
const emptyProj = () => ({ title: "", stack: "", description: "" });
const emptyCert = () => ({ name: "" });
const emptyLang = () => ({ language: "", proficiency: "" });

const ensureArray = (val) => {
  if (Array.isArray(val)) return val;
  if (val && typeof val === "object") return Object.values(val);
  if (typeof val === "string") {
    try { const p = JSON.parse(val); return Array.isArray(p) ? p : []; } catch { return []; }
  }
  return [];
};

const normalizeEducation = (raw) => {
  const arr = ensureArray(raw);
  return (arr.length ? arr : [emptyEdu()]).map((e) => ({
    stream: e.stream || e.degree || "",
    from: e.from || e.start || "",
    to: e.to || e.end || "",
    percentage: e.percentage || e.cgpa || "",
    institute: e.institute || e.school || e.college || e.name || "",
  }));
};
const normalizeExperience = (raw) => {
  const arr = ensureArray(raw);
  return (arr.length ? arr : [emptyExp()]).map((x) => ({
    role: x.role || "",
    location: x.location || x.mode || "",
    company: x.company || "",
    from: x.from || "",
    to: x.to || "",
    summary: x.summary || "",
  }));
};
const normalizeProjects = (raw) => {
  const arr = ensureArray(raw);
  return (arr.length ? arr : [emptyProj()]).map((p) => ({
    title: p.title || p.name || "",
    stack: p.stack || "",
    description: p.description || "",
  }));
};
const normalizeCertifications = (raw) => {
  const arr = ensureArray(raw);
  return (arr.length ? arr : [emptyCert()]).map((c) => ({
    name: c.name || c.title || c.certificate || c || "",
  }));
};
const normalizeLanguages = (raw) => {
  const arr = ensureArray(raw);
  const toNum = (v) => {
    const n = Number(String(v || "").replace(/[^\d.-]/g, ""));
    if (Number.isNaN(n)) return "";
    return Math.max(0, Math.min(100, Math.round(n)));
  };
  return (arr.length ? arr : [emptyLang()]).map((l) => ({
    language: l.language || l.name || "",
    proficiency: l.proficiency === "" || l.proficiency === undefined ? "" : toNum(l.proficiency),
  }));
};

const TextAction = ({ title, onPress, color }) => (
  <TouchableOpacity onPress={onPress} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
    <Text style={[styles.textAction, color ? { color } : null]}>{title}</Text>
  </TouchableOpacity>
);

const AppBar = ({ title, onBack, theme }) => (
  <SafeAreaView style={[styles.appbarSafe, { backgroundColor: theme.headerBg, borderBottomColor: theme.border }]}>
    <View style={styles.appbar}>
      <TextAction title={"Back"} onPress={onBack} color={theme.primary} />
      <Text style={[styles.appbarTitle, { color: theme.text }]} numberOfLines={1}>
        {title}
      </Text>
      <View style={{ width: 60 }} />
    </View>
  </SafeAreaView>
);

const RemoveButton = ({ onPress, theme }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.removeButton, { backgroundColor: theme.card }]}
    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
  >
    <Text style={[styles.removeText, { color: theme.danger }]}>✕</Text>
  </TouchableOpacity>
);

const Section = ({ title, children, suggestion, theme }) => (
  <View style={[styles.sectionContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>
      <View style={{width: 50 }}/>
      {suggestion ? <Text style={{ color: theme.subtle, fontSize: 12, flexShrink: 1, textAlign: 'right' }}>{suggestion}</Text> : null}
    </View>
    {children}
  </View>
);

/* image to base64 */
const toBase64DataUri = async (uri, mimeHint = "image/jpeg") => {
  let mime = mimeHint;
  const lower = (uri || "").toLowerCase();
  if (lower.endsWith(".png")) mime = "image/png";
  else if (lower.endsWith(".webp")) mime = "image/webp";
  else if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) mime = "image/jpeg";
  const b64 = await RNFS.readFile(uri, "base64");
  return `data:${mime};base64,${b64}`;
};

/* ---------- Floating Save FAB ---------- */
const FloatingSaveButton = ({ onPress, theme, disabled }) => (
  <Pressable
    onPress={onPress}
    disabled={disabled}
    accessibilityRole="button"
    accessibilityLabel="Save resume"
    hitSlop={8}
    style={({ pressed }) => [
      styles.fab,
      { backgroundColor: pressed ? theme.primaryPressed : theme.primary },
      disabled && { opacity: 0.6 },
    ]}
  >
    <Text style={styles.fabText}>Save</Text>
  </Pressable>
);

export default function EditResumeScreen({ initialData, onBack }) {
  const { user } = useContext(AuthContext);
  const uid = user?.uid;
  const scheme = useColorScheme();

  const theme = useMemo(
    () =>
      scheme === "dark"
        ? {
            bg: "#0b1220",
            headerBg: "#0f172a",
            card: "#111827",
            text: "#f9fafb",
            subtle: "#9ca3af",
            border: "#1f2937",
            primary: "#2563eb",
            primaryPressed: "#1e40af",
            accent: "#0b7285",
            danger: "#ef4444",
            good: "#16a34a",
            note: "#eab308",
          }
        : {
            bg: "#f7f8fb",
            headerBg: "#ffffff",
            card: "#ffffff",
            text: "#0f172a",
            subtle: "#6b7280",
            border: "#e5e7eb",
            primary: "#2563eb",
            primaryPressed: "#1e40af",
            accent: "#0b7285",
            danger: "#ef4444",
            good: "#16a34a",
            note: "#a16207",
          },
    [scheme]
  );

  const [form, setForm] = useState({
    name: "",
    title: "",
    email: "",
    git: "",
    linkedIn: "",
    phone: "",
    address: "",
    summary: "",
    skills: "",
    profile: "",
    education: [emptyEdu()],
    experience: [emptyExp()],
    projects: [emptyProj()],
    certifications: [emptyCert()],
    languages: [emptyLang()],
  });

  /* load */
  const setFromObj = (d = {}) => {
    setForm({
      name: d.name || "",
      title: d.title || "",
      email: d.email || user?.email || "",
      git: d.git || "",
      linkedIn: d.linkedIn || "",
      phone: d.phone || "",
      address: d.address || "",
      summary: d.summary || "",
      skills: Array.isArray(d.skills) ? d.skills.join("; ") : d.skills || "",
      profile: d.profile || "",
      education: normalizeEducation(d.education),
      experience: normalizeExperience(d.experience),
      projects: normalizeProjects(d.projects),
      certifications: normalizeCertifications(d.certifications),
      languages: normalizeLanguages(d.languages),
    });
  };

  useEffect(() => {
    if (initialData) setFromObj(initialData);
    else if (uid) {
      get(child(ref(db), `users/${uid}`))
        .then((snap) => snap.exists() && setFromObj(snap.val()))
        .catch(console.warn);
    }
  }, [initialData, uid]);

  /* profile image */
  const pickProfile = async () => {
    try {
      const res = await launchImageLibrary({ mediaType: "photo", quality: 0.8, selectionLimit: 1 });
      if (res.didCancel) return;
      const asset = res.assets?.[0];
      if (!asset?.uri) return;
      const dataUri = await toBase64DataUri(asset.uri, asset.type || "image/jpeg");
      setForm((prev) => ({ ...prev, profile: dataUri }));
    } catch (e) {
      console.log(e);
      Alert.alert("Image Error", "Unable to pick/convert the image.");
    }
  };
  const removeProfile = () => setForm((p) => ({ ...p, profile: "" }));

  /* helpers */
  const onlyDigits = (s) => String(s || "").replace(/[^\d]/g, "");
  const clamp0to100 = (n) => Math.max(0, Math.min(100, Number.isFinite(n) ? n : 0));

  /* save */
  const save = async () => {
    try {
      const payload = {
        ...form,
        skills: String(form.skills)
          .split(";")
          .map((s) => s.trim())
          .filter(Boolean),
        languages: (form.languages || [])
          .map((l) => ({
            language: (l.language || "").trim(),
            proficiency:
              l.proficiency === "" || l.proficiency === undefined
                ? ""
                : clamp0to100(Number(onlyDigits(l.proficiency))),
          }))
          .filter((l, idx, arr) => l.language || l.proficiency !== "" || arr.length === 1),
      };
      await update(ref(db, `users/${uid}`), payload);
      Alert.alert("✅ Saved", "Your resume was updated successfully!");
      onBack && onBack();
    } catch (err) {
      Alert.alert("Save failed", err.message);
    }
  };

  const AddButton = ({title, onPress}) => {
    return(
      <View style={styles.addButtonContainer}>
        <Button
          title = {title}
          onPress={() => onPress()}
          style={{
            backgroundColor: "transparent",
            elevation: 0,
            shadowOpacity: 0,
            marginVertical: 0,
          }}
          textStyle={{
            color: theme.primary,
            fontWeight: "700",
          }}
        />
      </View>
    );
  };

  /* UI */
  return (
    <View style={[styles.wrapper, { backgroundColor: theme.bg }]}>
      <AppBar title="Edit Your Resume" onBack={onBack} theme={theme} />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={[styles.container, { paddingBottom: 120 }]} // extra bottom padding for FAB
          keyboardShouldPersistTaps="handled"
        >
          {/* PERSONAL */}
          <Section title="Personal Information" theme={theme}>
            <View style={styles.profileRow}>
              <View style={styles.avatarWrap}>
                {form.profile ? (
                  <>
                    <Image source={{ uri: form.profile }} style={styles.avatar} />
                    <TouchableOpacity style={[styles.avatarRemove]} onPress={removeProfile}>
                      <Text style={[styles.avatarRemoveText]}>-</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: scheme === "dark" ? "#1f2937" : "#e2e8f0" }]}>
                    <Text style={{ fontWeight: "700", color: theme.subtle }}>Add</Text>
                  </View>
                )}
              </View>

              <View style={styles.profileActions}>
                <Text style={[styles.profileLabel, { color: theme.text }]}>Profile Photo</Text>
                <View style={{ flexDirection: "row", gap: 14 }}>
                  <TextAction title="Change Photo" onPress={pickProfile} color={theme.primary} />
                  {form.profile ? (
                    <TextAction title="Remove" onPress={removeProfile} color={theme.danger} />
                  ) : null}
                </View>
              </View>
            </View>

            <InputField label="Full Name" value={form.name} onChangeText={(t) => setForm({ ...form, name: t })} theme={theme} />
            <InputField label="Professional Title" value={form.title} onChangeText={(t) => setForm({ ...form, title: t })} theme={theme} />
            <InputField label="Email" value={form.email} onChangeText={(t) => setForm({ ...form, email: t })} keyboardType="email-address" autoCapitalize="none" theme={theme} />
            <InputField label="Phone" value={form.phone} onChangeText={(t) => setForm({ ...form, phone: t })} keyboardType="phone-pad" theme={theme} />
            <InputField label="GitHub/Others" value={form.git} onChangeText={(t) => setForm({ ...form, git: t })} autoCapitalize="none" theme={theme} />
            <InputField label="LinkedIn" value={form.linkedIn} onChangeText={(t) => setForm({ ...form, linkedIn: t })} autoCapitalize="none" theme={theme} />
            <InputField multiline label="Address" value={form.address} onChangeText={(t) => setForm({ ...form, address: t })} theme={theme} />
          </Section>

          <Section title="Summary" theme={theme}>
            <InputField multiline value={form.summary} onChangeText={(t) => setForm({ ...form, summary: t })} placeholder="Brief overview of your experience and goals." theme={theme} />
          </Section>

          <Section title="Skills" suggestion='Separate skills by ";" — supports <strong>bold</strong>' theme={theme}>
            <InputField multiline value={form.skills} onChangeText={(t) => setForm({ ...form, skills: t })} placeholder="e.g., JavaScript; React; Node.js" theme={theme} />
          </Section>

          {/* PROJECTS */}
          <Section title="Projects" suggestion='Use ";" for new lines in Description' theme={theme}>
            {form.projects.map((p, idx) => (
              <View key={idx} style={[styles.card, { backgroundColor: theme.bg, borderColor: theme.border }]}>
                <RemoveButton onPress={() => setForm({ ...form, projects: form.projects.filter((_, i) => i !== idx) })} theme={theme} />
                <Text style={[styles.cardHeader, { color: theme.text }]}>Project #{idx + 1}</Text>
                <InputField label="Title" value={p.title} onChangeText={(t) => setForm({ ...form, projects: form.projects.map((x, i) => (i === idx ? { ...x, title: t } : x)) })} theme={theme} />
                <InputField label="Stack/Technologies" value={p.stack} onChangeText={(t) => setForm({ ...form, projects: form.projects.map((x, i) => (i === idx ? { ...x, stack: t } : x)) })} theme={theme} />
                <InputField label="Description" multiline value={p.description} onChangeText={(t) => setForm({ ...form, projects: form.projects.map((x, i) => (i === idx ? { ...x, description: t } : x)) })} theme={theme} />
              </View>
            ))}
            <AddButton title="+ Add Project" onPress={() => setForm({ ...form, projects: [...form.projects, emptyProj()] })} />
          </Section>

          {/* EXPERIENCE */}
          <Section title="Experience" suggestion='Use ";" for new lines in Summary' theme={theme}>
            {form.experience.map((x, idx) => (
              <View key={idx} style={[styles.card, { backgroundColor: theme.bg, borderColor: theme.border }]}>
                <RemoveButton onPress={() => setForm({ ...form, experience: form.experience.filter((_, i) => i !== idx) })} theme={theme} />
                <Text style={[styles.cardHeader, { color: theme.text }]}>Experience #{idx + 1}</Text>
                <InputField label="Role" value={x.role} onChangeText={(t) => setForm({ ...form, experience: form.experience.map((e, i) => (i === idx ? { ...e, role: t } : e)) })} theme={theme} />
                <InputField label="Mode/Location" value={x.location} onChangeText={(t) => setForm({ ...form, experience: form.experience.map((e, i) => (i === idx ? { ...e, location: t } : e)) })} theme={theme} />
                <InputField label="Company" value={x.company} onChangeText={(t) => setForm({ ...form, experience: form.experience.map((e, i) => (i === idx ? { ...e, company: t } : e)) })} theme={theme} />
                <View style={styles.row}>
                  <View style={styles.half}>
                    <InputField label="From" value={x.from} onChangeText={(t) => setForm({ ...form, experience: form.experience.map((e, i) => (i === idx ? { ...e, from: t } : e)) })} theme={theme} />
                  </View>
                  <View style={styles.half}>
                    <InputField label="To" value={x.to} onChangeText={(t) => setForm({ ...form, experience: form.experience.map((e, i) => (i === idx ? { ...e, to: t } : e)) })} theme={theme} />
                  </View>
                </View>
                <InputField label="Summary" multiline value={x.summary} onChangeText={(t) => setForm({ ...form, experience: form.experience.map((e, i) => (i === idx ? { ...e, summary: t } : e)) })} theme={theme} />
              </View>
            ))}
            <AddButton title="+ Add Experience" onPress={() => setForm({ ...form, experience: [...form.experience, emptyExp()] })} />
          </Section>

          {/* EDUCATION */}
          <Section title="Education" theme={theme}>
            {form.education.map((e, idx) => (
              <View key={idx} style={[styles.card, { backgroundColor: theme.bg, borderColor: theme.border }]}>
                <RemoveButton onPress={() => setForm({ ...form, education: form.education.filter((_, i) => i !== idx) })} theme={theme} />
                <Text style={[styles.cardHeader, { color: theme.text }]}>Education #{idx + 1}</Text>
                <InputField label="Course / Stream" value={e.stream} onChangeText={(t) => setForm({ ...form, education: form.education.map((ed, i) => (i === idx ? { ...ed, stream: t } : ed)) })} theme={theme} />
                <InputField label="Institution" value={e.institute} onChangeText={(t) => setForm({ ...form, education: form.education.map((ed, i) => (i === idx ? { ...ed, institute: t } : ed)) })} theme={theme} />
                <View style={styles.row}>
                  <View className="half" style={styles.half}>
                    <InputField label="From" value={e.from} onChangeText={(t) => setForm({ ...form, education: form.education.map((ed, i) => (i === idx ? { ...ed, from: t } : ed)) })} theme={theme} />
                  </View>
                  <View style={styles.half}>
                    <InputField label="To" value={e.to} onChangeText={(t) => setForm({ ...form, education: form.education.map((ed, i) => (i === idx ? { ...ed, to: t } : ed)) })} theme={theme} />
                  </View>
                </View>
                <InputField label="Percentage / CGPA" value={e.percentage} onChangeText={(t) => setForm({ ...form, education: form.education.map((ed, i) => (i === idx ? { ...ed, percentage: t } : ed)) })} theme={theme} />
              </View>
            ))}
            <AddButton title="+ Add Education" onPress={() => setForm({ ...form, education: [...form.education, emptyEdu()] })} />
          </Section>

          {/* LANGUAGES */}
          <Section title="Languages" suggestion="Proficiency: 0–100" theme={theme}>
            {form.languages?.map((l, idx) => (
              <View key={idx} style={[styles.card, { backgroundColor: theme.bg, borderColor: theme.border }]}>
                <RemoveButton onPress={() => setForm({ ...form, languages: form.languages.filter((_, i) => i !== idx) })} theme={theme} />
                <Text style={[styles.cardHeader, { color: theme.text }]}>Language #{idx + 1}</Text>
                <InputField label="Language" value={l.language} onChangeText={(t) => setForm({ ...form, languages: form.languages.map((x, i) => (i === idx ? { ...x, language: t } : x)) })} theme={theme} />
                <InputField
                  label="Proficiency (0–100)"
                  value={String(l.proficiency)}
                  onChangeText={(t) => {
                    const digits = t.replace(/[^\d]/g, "");
                    const n = digits === "" ? "" : Math.max(0, Math.min(100, Number(digits)));
                    setForm({ ...form, languages: form.languages.map((x, i) => (i === idx ? { ...x, proficiency: n } : x)) });
                  }}
                  placeholder="e.g., 85"
                  keyboardType="number-pad"
                  theme={theme}
                />
              </View>
            ))}
            <AddButton title="+ Add Language" onPress={() => setForm({ ...form, languages: [...form.languages, emptyLang()] })} />
          </Section>

          {/* CERTIFICATIONS */}
          <Section title="Certifications" theme={theme}>
            {form.certifications.map((c, idx) => (
              <View key={idx} style={[styles.cardAccent, { borderColor: theme.border, backgroundColor: scheme === "dark" ? "#1b2433" : "#fffbeb" }]}>
                <RemoveButton onPress={() => setForm({ ...form, certifications: form.certifications.filter((_, i) => i !== idx) })} theme={theme} />
                <Text style={[styles.cardHeader, { color: theme.text }]}>Certificate #{idx + 1}</Text>
                <InputField label="Certificate Name" value={c.name} onChangeText={(t) => setForm({ ...form, certifications: form.certifications.map((cert, i) => (i === idx ? { ...cert, name: t } : cert)) })} theme={theme} />
              </View>
            ))}
            <AddButton title="+ Add Certification" onPress={() => setForm({ ...form, certifications: [...form.certifications, emptyCert()] })} />
          </Section>

          {/* (removed old footer save button) */}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Floating Save FAB */}
      <FloatingSaveButton onPress={save} theme={theme} />
    </View>
  );
}

/* ---------- styles ---------- */
const styles = StyleSheet.create({
  wrapper: { flex: 1, position: "relative" },
  appbarSafe: { borderBottomWidth: 1 },
  appbar: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  appbarTitle: { fontSize: 17, fontWeight: "700" },
  container: { padding: 16 },

  sectionContainer: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
  },
  sectionTitle: { fontSize: 18, fontWeight: "800" },

  profileRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  avatarWrap: { marginRight: 14 },
  avatar: { width: 86, height: 86, borderRadius: 43 },
  avatarPlaceholder: { alignItems: "center", justifyContent: "center" },
  avatarRemove: {
    position: "absolute",
    right: -6,
    top: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fee2e2",
    borderWidth: 1,
    borderColor: "#fecaca",
    zIndex: 10,
    elevation: 3,
  },
  avatarRemoveText: { color: "#ef4444", fontSize: 16, fontWeight: "900", lineHeight: 18 },
  profileActions: { flex: 1 },
  profileLabel: { fontWeight: "800", marginBottom: 6 },

  card: {
    position: "relative",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  cardAccent: {
    position: "relative",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  cardHeader: { fontSize: 15, fontWeight: "800", marginBottom: 8, paddingRight: 28 },

  removeButton: { position: "absolute", top: 8, right: 8, paddingVertical: 4, paddingHorizontal: 6, borderRadius: 8, zIndex: 10 },
  removeText: { fontWeight: "900", fontSize: 16 },

  row: { flexDirection: "row", columnGap: 10 },
  half: { flex: 1 },

  addButtonContainer: { alignItems: "center" },

  textAction: { fontWeight: "800", fontSize: 14 },

  /* Floating Save FAB */
  fab: {
    position: "absolute",
    right: 16,
    bottom: 20,
    height: 56,
    paddingHorizontal: 20,
    borderRadius: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 6 },
      },
      android: { elevation: 8 },
    }),
  },
  fabIcon: { fontSize: 18, marginRight: 8, color: "#ffffff" },
  fabText: { color: "#ffffff", fontWeight: "800", fontSize: 16, letterSpacing: 0.3 },
});
