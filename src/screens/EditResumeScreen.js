// src/screens/EditResumeScreen.js
import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import InputField from "../components/EditResume/utilities/InputField";
import { db } from "../services/firebaseConfig";
import { ref, update, get, child } from "firebase/database";
import { AuthContext } from "../context/AuthContext";
import { launchImageLibrary } from "react-native-image-picker";
import { getTheme } from "../constants/ColorConstants";
import { resumeTemplate } from "../utils/resumeTemplate";
import { useFetchUserData } from "../utils/apiUtil";
import AppBar from "../components/EditResume/utilities/AppBar";
import Section from "../components/EditResume/utilities/Section";
import FloatingSaveButton from "../components/EditResume/utilities/FloatingSaveButton";
import PersonalInfoSection from "../components/EditResume/PersonalInfoSection";
import PreviewModal from "../components/EditResume/PreviewModal";
import ProjectSection from "../components/EditResume/ProjectSection";
import ExperienceSection from "../components/EditResume/ExperienceSection";
import EducationSection from "../components/EditResume/EducationSection";
import LanguageSection from "../components/EditResume/LanguageSection";
import CertificateSection from "../components/EditResume/CertificateSection";
import { normalizeEducation, normalizeExperience, normalizeProjects, normalizeCertifications, normalizeLanguages } from "../utils/EditResume/normalization";
import { toBase64DataUri } from "../utils/EditResume/profileProcess";

/* ---------- helpers / normalizers ---------- */
const emptyEdu = () => ({ stream: "", from: "", to: "", percentage: "", institute: "" });
const emptyExp = () => ({ role: "", location: "", company: "", from: "", to: "", summary: "" });
const emptyProj = () => ({ title: "", stack: "", description: "", image: "", link: "" });
const emptyCert = () => ({ name: "", link: "" });
const emptyLang = () => ({ language: "", proficiency: "" });


export default function EditResumeScreen({ onBack }) {
  const { user } = useContext(AuthContext);
  const uid = user?.uid;
  const scheme = useColorScheme();
  const { resume: initialData, loading } = useFetchUserData();

  const theme = useMemo(() => getTheme(scheme), [scheme]);

  const [showPreview, setShowPreview] = useState(false);

  const [form, setForm] = useState({
    name: "",
    title: "",
    email: "",
    git: "",
    linkedIn: "",
    portfolio: "",
    phone: "",
    address: "",
    summary: "",
    skills: "",
    profile: "",
    resumeColor: "#0b7285",
    education: [emptyEdu()],
    experience: [emptyExp()],
    projects: [emptyProj()],
    certifications: [emptyCert()],
    languages: [emptyLang()],
  });

  const onlyDigits = (val) => {
    if (val == null) return "";   
    const s = typeof val === "string" ? val : String(val);
    return s.replace(/\D+/g, "");            
  };

  const clamp0to100 = (num) => {
    const n = Number(num);
    if (Number.isNaN(n)) return 0;
    return Math.max(0, Math.min(100, Math.round(n)));
  };

  /* Generate preview HTML */
  const previewHtml = useMemo(() => {
    const previewData = {
      ...form,
      projects: [...form.projects].reverse().map(({ id, ...rest }) => rest),
      education: [...form.education].reverse().map(({ id, ...rest }) => rest),
      experience: [...form.experience].reverse().map(({ id, ...rest }) => rest),
      certifications: [...form.certifications].reverse().map(({ id, ...rest }) => rest),
      skills: String(form.skills)
        .replace(/""([^"]+)""/g, "<strong>$1</strong>")
        .split(";")
        .map((s) => s.trim())
        .filter(Boolean),
      languages: [...(form.languages || [])]
        .reverse()
        .map((l) => ({
          language: (l.language || "").trim(),
          proficiency:
            l.proficiency === "" || l.proficiency === undefined
              ? ""
              : clamp0to100(Number(onlyDigits(l.proficiency))),
        }))
      .filter((l, idx, arr) => l.language || l.proficiency !== "" || arr.length === 1),
    };
    return resumeTemplate(previewData, form.resumeColor || "#0b7285");
  }, [form]);

  /* load */
  const setFromObj = (d = {}) => {
    setForm({
      name: d.name || "",
      title: d.title || "",
      email: d.email || user?.email || "",
      git: d.git || "",
      portfolio: d.portfolio || "",
      linkedIn: d.linkedIn || "",
      phone: d.phone || "",
      address: d.address || "",
      summary: d.summary || "",
      skills: Array.isArray(d.skills)
        ? d.skills.join("; ").replace(/<strong>(.*?)<\/strong>/g, '""$1""')
        : (d.skills || "").replace(/<strong>(.*?)<\/strong>/g, '""$1""'),
      profile: d.profile || "",
      resumeColor: d.resumeColor || "#0b7285",
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

  /* save */
  const save = async () => {
    try {
      const payload = {
        ...form,
        projects: [...form.projects].reverse().map(({ id, ...rest }) => rest),
        education: [...form.education].reverse().map(({ id, ...rest }) => rest),
        experience: [...form.experience].reverse().map(({ id, ...rest }) => rest),
        certifications: [...form.certifications].reverse().map(({ id, ...rest }) => rest),
        skills: String(form.skills)
          .replace(/""([^"]+)""/g, "<strong>$1</strong>")
          .split(";")
          .map((s) => s.trim())
          .filter(Boolean),
        languages: [...(form.languages || [])]
          .reverse()
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

  /* UI */
  return (
    <View style={[styles.wrapper, { backgroundColor: theme.bg }]}>
      <AppBar title="Edit Your Resume" onBack={onBack} onPreview={() => setShowPreview(true)} theme={theme} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={[styles.container, { paddingBottom: 120 }]}
          keyboardShouldPersistTaps="handled"
        >
          <PersonalInfoSection
            form={form}
            setForm={setForm}
            theme={theme}
            scheme={scheme}
            pickProfile={pickProfile}
            removeProfile={removeProfile}
          />
          <Section title="Summary" theme={theme}>
            <InputField multiline value={form.summary} onChangeText={(t) => setForm(prev => ({ ...prev, summary: t }))} placeholder="Brief overview of your experience and goals." theme={theme} />
          </Section>

          <Section title="Skills" suggestion='Separate skills by ";" — supports ""bold""' theme={theme}>
            <InputField multiline value={form.skills} onChangeText={(t) => setForm(prev => ({ ...prev, skills: t }))} placeholder="e.g., JavaScript; React; Node.js" theme={theme} />
          </Section>

          <Text style={{ color: "#ffffff93" }}>Note: Enter data in chronological order (oldest to newest)</Text>

          <ProjectSection form={form} setForm={setForm} theme={theme} emptyProj={emptyProj} />

          <ExperienceSection form={form} setForm={setForm} theme={theme} emptyExp={emptyExp} />

          <EducationSection form={form} setForm={setForm} theme={theme} emptyEdu={emptyEdu} />

          <LanguageSection form={form} setForm={setForm} theme={theme} emptyLang={emptyLang} />

          <CertificateSection form={form} setForm={setForm} theme={theme} emptyCert={emptyCert} />
        </ScrollView>
      </KeyboardAvoidingView>

      <FloatingSaveButton onPress={save} theme={theme} loading={loading} />

      <PreviewModal
        visible={showPreview}
        onClose={() => setShowPreview(false)}
        previewHtml={previewHtml}
        theme={theme}
        scheme={scheme}
      />
    </View>
  );
}

/* ---------- styles ---------- */
const styles = StyleSheet.create({
  wrapper: { flex: 1, position: "relative" },
  container: { padding: 16 },
});