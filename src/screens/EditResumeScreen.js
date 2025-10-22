import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from "react-native";
import InputField from "../components/InputField";
import Button from "../components/Button"; // still used for Save only
import { db } from "../services/firebaseConfig";
import { ref, update, get, child } from "firebase/database";
import { AuthContext } from "../context/AuthContext";
import RNFS from "react-native-fs";
import { launchImageLibrary } from "react-native-image-picker";

const emptyEdu = () => ({ stream: "", from: "", to: "", percentage: "", institute: "" });
const emptyExp = () => ({ role: "", location: "", company: "", from: "", to: "", summary: "" });
const emptyProj = () => ({ title: "", stack: "", description: "" });
const emptyCert = () => ({ name: "" });
const emptyLang = () => ({ language: "", proficiency: "" }); // 0–100

const ensureArray = (val) => {
  if (Array.isArray(val)) return val;
  if (val && typeof val === "object") return Object.values(val);
  if (typeof val === "string") {
    try {
      const p = JSON.parse(val);
      return Array.isArray(p) ? p : [];
    } catch {
      return [];
    }
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
    location: x.location || x.mode || "", // <-- keep location
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

// ---------- Small UI Components ----------
const TextAction = ({ title, onPress, color = "#2563eb" }) => (
  <TouchableOpacity onPress={onPress} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
    <Text style={[styles.textAction, { color }]}>{title}</Text>
  </TouchableOpacity>
);

const AppBar = ({ title, onBack }) => (
  <SafeAreaView style={styles.appbarSafe}>
    <View style={styles.appbar}>
      <TextAction title={"‹ Back"} onPress={onBack} />
      <Text style={styles.appbarTitle} numberOfLines={1}>
        {title}
      </Text>
      <View style={{ width: 60 }} /> {/* Spacer */}
    </View>
  </SafeAreaView>
);

// Make remove a reusable button with proper layering + hitSlop
const RemoveButton = ({ onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={styles.removeButton}
    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
  >
    <Text style={styles.removeText}>✕</Text>
  </TouchableOpacity>
);

// --- Section wrapper ---
const Section = ({ title, children, suggetion }) => (
  <View style={styles.sectionContainer}>
    <View style={{ flexDirection: "row" , justifyContent: "space-between", alignItems: "center" }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {suggetion ? <Text style={{ color: "#6b7280", fontSize: 12, alignSelf: "center" }}>{suggetion}</Text> : null}
    </View>
    {children}
  </View>
);

// --- Convert photo uri -> Data URI base64
const toBase64DataUri = async (uri, mimeHint = "image/jpeg") => {
  // try to infer mime from extension
  let mime = mimeHint;
  const lower = (uri || "").toLowerCase();
  if (lower.endsWith(".png")) mime = "image/png";
  else if (lower.endsWith(".webp")) mime = "image/webp";
  else if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) mime = "image/jpeg";

  const b64 = await RNFS.readFile(uri, "base64");
  return `data:${mime};base64,${b64}`;
};

export default function EditResumeScreen({ initialData, onBack }) {
  const { user } = useContext(AuthContext);
  const uid = user?.uid;

  const [form, setForm] = useState({
    name: "",
    title: "",
    email: "",
    git: "",
    linkedIn: "",
    phone: "",
    address: "",
    summary: "",
    skills: "",          // semicolon-delimited in UI
    profile: "",         // base64 data uri
    education: [emptyEdu()],
    experience: [emptyExp()],
    projects: [emptyProj()],
    certifications: [emptyCert()],
    languages: [emptyLang()], // <-- new
  });

  // --- Load Data ---
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

  // --- Pick & set profile photo ---
  const pickProfile = async () => {
    try {
      const res = await launchImageLibrary({
        mediaType: "photo",
        quality: 0.8,
        selectionLimit: 1,
      });

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

  // helpers
  const onlyDigits = (s) => String(s || "").replace(/[^\d]/g, "");
  const clamp0to100 = (n) => Math.max(0, Math.min(100, Number.isFinite(n) ? n : 0));

  // --- Save to Firebase ---
  const save = async () => {
    try {
      const payload = {
        ...form,
        // split skills by semicolon consistently
        skills: String(form.skills)
          .split(";")
          .map((s) => s.trim())
          .filter(Boolean),
        // ensure languages are valid and numeric
        languages: (form.languages || [])
          .map((l) => ({
            language: (l.language || "").trim(),
            proficiency:
              l.proficiency === "" || l.proficiency === undefined
                ? ""
                : clamp0to100(Number(onlyDigits(l.proficiency))),
          }))
          // allow empty item if it's the only one; otherwise drop empties
          .filter((l, idx, arr) => l.language || l.proficiency !== "" || arr.length === 1),
      };

      await update(ref(db, `users/${uid}`), payload);
      Alert.alert("✅ Saved", "Your resume was updated successfully!");
      onBack && onBack();
    } catch (err) {
      Alert.alert("Save failed", err.message);
    }
  };

  return (
    <View style={styles.wrapper}>
      <AppBar title="Edit Your Resume" onBack={onBack} />

      <ScrollView contentContainerStyle={styles.container}>
        {/* PERSONAL INFO */}
        <Section title="Personal Information">
          {/* Profile image block */}
          <View style={styles.profileRow}>
            <View style={styles.avatarWrap}>
              {form.profile ? (
                <>
                  <Image source={{ uri: form.profile }} style={styles.avatar} />
                  <TouchableOpacity style={styles.avatarRemove} onPress={removeProfile} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Text style={styles.avatarRemoveText}>-</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Text style={{ fontWeight: "700", color: "#64748b" }}>Add</Text>
                </View>
              )}
            </View>

            <View style={styles.profileActions}>
              <Text style={styles.profileLabel}>Profile Photo</Text>
              <View style={{ flexDirection: "row", gap: 14 }}>
                <TextAction title="Change Photo" onPress={pickProfile} />
                {form.profile ? (
                  <TextAction title="Remove" onPress={removeProfile} color="#ef4444" />
                ) : null}
              </View>
            </View>
          </View>

          <InputField label="Full Name" value={form.name} onChangeText={(t) => setForm({ ...form, name: t })} />
          <InputField label="Professional Title" value={form.title} onChangeText={(t) => setForm({ ...form, title: t })} />
          <InputField label="Email" value={form.email} onChangeText={(t) => setForm({ ...form, email: t })} />
          <InputField label="Phone" value={form.phone} onChangeText={(t) => setForm({ ...form, phone: t })} />
          <InputField label="GitHub/Others" value={form.git} onChangeText={(t) => setForm({ ...form, git: t })} />
          <InputField label="LinkedIn" value={form.linkedIn} onChangeText={(t) => setForm({ ...form, linkedIn: t })} />
          <InputField multiline label="Address" value={form.address} onChangeText={(t) => setForm({ ...form, address: t })} />
        </Section>

        <Section title="Summary">
          <InputField multiline value={form.summary} onChangeText={(t) => setForm({ ...form, summary: t })} />
        </Section>

        <Text style={{ color: "#6b7280", fontSize: 12 }}>{"Note: separate skills by semicolon and use <strong></strong> for Bold"}</Text>
        <Section title="Skills">
          <InputField multiline value={form.skills} onChangeText={(t) => setForm({ ...form, skills: t })} placeholder="e.g., JavaScript; React; Node.js" />
        </Section>

        {/* PROJECTS */}
        <Text style={{ color: "#6b7280", fontSize: 12 }}>Note: use ; for new lines</Text>
        <Section title="Projects">
          {form.projects.map((p, idx) => (
            <View key={idx} style={styles.card}>
              <RemoveButton
                onPress={() =>
                  setForm({ ...form, projects: form.projects.filter((_, i) => i !== idx) })
                }
              />

              <Text style={styles.cardHeader}>Project #{idx + 1}</Text>
              <InputField
                label="Title"
                value={p.title}
                onChangeText={(t) =>
                  setForm({
                    ...form,
                    projects: form.projects.map((x, i) => (i === idx ? { ...x, title: t } : x)),
                  })
                }
              />
              <InputField
                label="Stack/Technologies"
                value={p.stack}
                onChangeText={(t) =>
                  setForm({
                    ...form,
                    projects: form.projects.map((x, i) => (i === idx ? { ...x, stack: t } : x)),
                  })
                }
              />
              <InputField
                label="Description"
                multiline
                value={p.description}
                onChangeText={(t) =>
                  setForm({
                    ...form,
                    projects: form.projects.map((x, i) => (i === idx ? { ...x, description: t } : x)),
                  })
                }
              />
            </View>
          ))}
          <View style={styles.addButtonContainer}>
            <TextAction
              title="+ Add Project"
              onPress={() => setForm({ ...form, projects: [...form.projects, emptyProj()] })}
            />
          </View>
        </Section>

        {/* EXPERIENCE */}
        <Text style={{ color: "#6b7280", fontSize: 12 }}>Note: use ; for new lines</Text>
        <Section title="Experience">
          {form.experience.map((x, idx) => (
            <View key={idx} style={styles.card}>
              <RemoveButton
                onPress={() =>
                  setForm({ ...form, experience: form.experience.filter((_, i) => i !== idx) })
                }
              />

              <Text style={styles.cardHeader}>Experience #{idx + 1}</Text>
              <InputField
                label="Role"
                value={x.role}
                onChangeText={(t) =>
                  setForm({
                    ...form,
                    experience: form.experience.map((e, i) => (i === idx ? { ...e, role: t } : e)),
                  })
                }
              />
              <InputField
                label="Mode/Location"
                value={x.location}
                onChangeText={(t) =>
                  setForm({
                    ...form,
                    experience: form.experience.map((e, i) => (i === idx ? { ...e, location: t } : e)),
                  })
                }
              />
              <InputField
                label="Company"
                value={x.company}
                onChangeText={(t) =>
                  setForm({
                    ...form,
                    experience: form.experience.map((e, i) => (i === idx ? { ...e, company: t } : e)),
                  })
                }
              />
              <View style={styles.row}>
                <View style={styles.half}>
                  <InputField
                    label="From"
                    value={x.from}
                    onChangeText={(t) =>
                      setForm({
                        ...form,
                        experience: form.experience.map((e, i) =>
                          i === idx ? { ...e, from: t } : e
                        ),
                      })
                    }
                  />
                </View>
                <View style={styles.half}>
                  <InputField
                    label="To"
                    value={x.to}
                    onChangeText={(t) =>
                      setForm({
                        ...form,
                        experience: form.experience.map((e, i) =>
                          i === idx ? { ...e, to: t } : e
                        ),
                      })
                    }
                  />
                </View>
              </View>
              <InputField
                label="Summary"
                multiline
                value={x.summary}
                onChangeText={(t) =>
                  setForm({
                    ...form,
                    experience: form.experience.map((e, i) => (i === idx ? { ...e, summary: t } : e)),
                  })
                }
              />
            </View>
          ))}
          <View style={styles.addButtonContainer}>
            <TextAction
              title="+ Add Experience"
              onPress={() => setForm({ ...form, experience: [...form.experience, emptyExp()] })}
            />
          </View>
        </Section>

        {/* EDUCATION */}
        <Section title="Education">
          {form.education.map((e, idx) => (
            <View key={idx} style={styles.card}>
              <RemoveButton
                onPress={() =>
                  setForm({ ...form, education: form.education.filter((_, i) => i !== idx) })
                }
              />

              <Text style={styles.cardHeader}>Education #{idx + 1}</Text>
              <InputField
                label="Course / Stream"
                value={e.stream}
                onChangeText={(t) =>
                  setForm({
                    ...form,
                    education: form.education.map((ed, i) => (i === idx ? { ...ed, stream: t } : ed)),
                  })
                }
              />
              <InputField
                label="Institution"
                value={e.institute}
                onChangeText={(t) =>
                  setForm({
                    ...form,
                    education: form.education.map((ed, i) => (i === idx ? { ...ed, institute: t } : ed)),
                  })
                }
              />
              <View style={styles.row}>
                <View style={styles.half}>
                  <InputField
                    label="From"
                    value={e.from}
                    onChangeText={(t) =>
                      setForm({
                        ...form,
                        education: form.education.map((ed, i) =>
                          i === idx ? { ...ed, from: t } : ed
                        ),
                      })
                    }
                  />
                </View>
                <View style={styles.half}>
                  <InputField
                    label="To"
                    value={e.to}
                    onChangeText={(t) =>
                      setForm({
                        ...form,
                        education: form.education.map((ed, i) =>
                          i === idx ? { ...ed, to: t } : ed
                        ),
                      })
                    }
                  />
                </View>
              </View>
              <InputField
                label="Percentage / CGPA"
                value={e.percentage}
                onChangeText={(t) =>
                  setForm({
                    ...form,
                    education: form.education.map((ed, i) => (i === idx ? { ...ed, percentage: t } : ed)),
                  })
                }
              />
            </View>
          ))}
          <View style={styles.addButtonContainer}>
            <TextAction
              title="+ Add Education"
              onPress={() => setForm({ ...form, education: [...form.education, emptyEdu()] })}
            />
          </View>
        </Section>

        {/* LANGUAGES */}
        <Text style={{ color: "#6b7280", fontSize: 12 }}>Proficiency must be between 0 and 100.</Text>
        <Section title="Languages">
          {form?.languages.map((l, idx) => (
            <View key={idx} style={styles.card}>
              <RemoveButton
                onPress={() =>
                  setForm({ ...form, languages: form.languages.filter((_, i) => i !== idx) })
                }
              />
              <Text style={styles.cardHeader}>Language #{idx + 1}</Text>
              <InputField
                label="Language"
                value={l.language}
                onChangeText={(t) =>
                  setForm({
                    ...form,
                    languages: form.languages.map((x, i) => (i === idx ? { ...x, language: t } : x)),
                  })
                }
              />
              <InputField
                label="Proficiency (0–100)"
                value={String(l.proficiency)}
                onChangeText={(t) => {
                  const digits = t.replace(/[^\d]/g, "");
                  const n = digits === "" ? "" : Math.max(0, Math.min(100, Number(digits)));
                  setForm({
                    ...form,
                    languages: form.languages.map((x, i) => (i === idx ? { ...x, proficiency: n } : x)),
                  });
                }}
                placeholder="e.g., 85"
              />
            </View>
          ))}
          <View style={styles.addButtonContainer}>
            <TextAction
              title="+ Add Language"
              onPress={() => setForm({ ...form, languages: [...form.languages, emptyLang()] })}
            />
          </View>
        </Section>

        {/* CERTIFICATIONS */}
        <Section title="Certifications">
          {form.certifications.map((c, idx) => (
            <View key={idx} style={styles.cardYellow}>
              <RemoveButton
                onPress={() =>
                  setForm({
                    ...form,
                    certifications: form.certifications.filter((_, i) => i !== idx),
                  })
                }
              />

              <Text style={styles.cardHeader}>Certificate #{idx + 1}</Text>
              <InputField
                label="Certificate Name"
                value={c.name}
                onChangeText={(t) =>
                  setForm({
                    ...form,
                    certifications: form.certifications.map((cert, i) =>
                      i === idx ? { ...cert, name: t } : cert
                    ),
                  })
                }
              />
            </View>
          ))}
          <View style={styles.addButtonContainer}>
            <TextAction
              title="+ Add Certification"
              onPress={() =>
                setForm({ ...form, certifications: [...form.certifications, emptyCert()] })
              }
            />
          </View>
        </Section>

        <View style={{ marginTop: 30, marginBottom: 40 }}>
          <Button title="💾 Save Resume" onPress={save} />
        </View>
      </ScrollView>
    </View>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: "#f8fafc" },
  appbarSafe: { backgroundColor: "#fff" },
  appbar: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  appbarTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0f172a",
  },
  container: { padding: 16 },

  sectionContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 10,
  },

  // Profile
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarWrap: {
    marginRight: 14,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "#e2e8f0",
  },
  avatarPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
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
  profileLabel: { fontWeight: "700", color: "#0f172a", marginBottom: 6 },

  // Cards
  card: {
    position: "relative",
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderColor: "#e5e7eb",
    borderWidth: 1,
  },
  cardYellow: {
    position: "relative",
    backgroundColor: "#fffcf0",
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderColor: "#fde68a",
    borderWidth: 1,
  },
  cardHeader: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 8,
    paddingRight: 28,
  },

  // Remove on cards
  removeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 8,
    zIndex: 10,
    backgroundColor: "transparent",
  },
  removeText: { color: "#ef4444", fontWeight: "900", fontSize: 16 },

  // Half-width inputs
  row: {
    flexDirection: "row",
    columnGap: 10,
  },
  half: {
    flex: 1,
  },

  addButtonContainer: {
    marginTop: 6,
    alignItems: "center",
  },

  textAction: { fontWeight: "700", fontSize: 14 },
});
