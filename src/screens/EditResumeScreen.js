import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import InputField from "../components/InputField";
import Button from "../components/Button"; // still used for Save only
import { db } from "../services/firebaseConfig";
import { ref, update, get, child } from "firebase/database";
import { AuthContext } from "../context/AuthContext";

const emptyEdu = () => ({ stream: "", from: "", to: "", percentage: "", institute: "" });
const emptyExp = () => ({ role: "", company: "", from: "", to: "", summary: "" });
const emptyProj = () => ({ title: "", description: "" });
const emptyCert = () => ({ name: "" });

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

const normalizeEducation = (raw) =>
  (ensureArray(raw).length ? ensureArray(raw) : [emptyEdu()]).map((e) => ({
    stream: e.stream || e.degree || "",
    from: e.from || e.start || "",
    to: e.to || e.end || "",
    percentage: e.percentage || e.cgpa || "",
    institute: e.institute || e.school || e.college || e.name || "",
  }));

const normalizeExperience = (raw) =>
  (ensureArray(raw).length ? ensureArray(raw) : [emptyExp()]).map((x) => ({
    role: x.role || "",
    company: x.company || "",
    from: x.from || "",
    to: x.to || "",
    summary: x.summary || "",
  }));

const normalizeProjects = (raw) =>
  (ensureArray(raw).length ? ensureArray(raw) : [emptyProj()]).map((p) => ({
    title: p.title || p.name || "",
    description: p.description || "",
  }));

const normalizeCertifications = (raw) =>
  (ensureArray(raw).length ? ensureArray(raw) : [emptyCert()]).map((c) => ({
    name: c.name || c.title || c.certificate || c || "",
  }));

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
const Section = ({ title, children }) => (
  <View style={styles.sectionContainer}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

export default function EditResumeScreen({ initialData, onBack }) {
  const { user } = useContext(AuthContext);
  const uid = user?.uid;

  const [form, setForm] = useState({
    name: "",
    title: "",
    email: "",
    phone: "",
    address: "",
    summary: "",
    skills: "",
    education: [emptyEdu()],
    experience: [emptyExp()],
    projects: [emptyProj()],
    certifications: [emptyCert()],
  });

  // --- Load Data ---
  const setFromObj = (d = {}) => {
    setForm({
      name: d.name || "",
      title: d.title || "",
      email: d.email || user?.email || "",
      phone: d.phone || "",
      address: d.address || "",
      summary: d.summary || "",
      skills: Array.isArray(d.skills) ? d.skills.join(", ") : d.skills || "",
      education: normalizeEducation(d.education),
      experience: normalizeExperience(d.experience),
      projects: normalizeProjects(d.projects),
      certifications: normalizeCertifications(d.certifications),
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

  // --- Save to Firebase ---
  const save = async () => {
    try {
      const payload = {
        ...form,
        skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
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
          <InputField label="Full Name" value={form.name} onChangeText={(t) => setForm({ ...form, name: t })} />
          <InputField label="Professional Title" value={form.title} onChangeText={(t) => setForm({ ...form, title: t })} />
          <InputField label="Email" value={form.email} onChangeText={(t) => setForm({ ...form, email: t })} />
          <InputField label="Phone" value={form.phone} onChangeText={(t) => setForm({ ...form, phone: t })} />
          <InputField label="Address" value={form.address} onChangeText={(t) => setForm({ ...form, address: t })} />
        </Section>

        <Section title="Summary">
          <InputField multiline value={form.summary} onChangeText={(t) => setForm({ ...form, summary: t })} />
        </Section>

        <Section title="Skills">
          <InputField value={form.skills} onChangeText={(t) => setForm({ ...form, skills: t })} placeholder="e.g., JavaScript, React" />
        </Section>

        {/* PROJECTS */}
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
    paddingRight: 28, // keep header text away from the close button
  },

  // >>> Fix: make the remove button clickable everywhere (Android needs zIndex + elevation)
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

  // >>> Fix: half-width inputs
  row: {
    flexDirection: "row",
    columnGap: 10, // RN 0.71+; if older, replace with marginRight on first child
  },
  half: {
    flex: 1, // each child gets half width
  },

  addButtonContainer: {
    marginTop: 6,
    alignItems: "center",
  },

  textAction: { fontWeight: "700", fontSize: 14 },
});
