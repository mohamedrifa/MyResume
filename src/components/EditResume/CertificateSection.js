import react from "react";
import { View, Text, useColorScheme } from "react-native";
import Section from "./utilities/Section";
import InputField from "./utilities/InputField";
import AddButton from "./utilities/AddButton";
import RemoveButton from "./utilities/RemoveButton";
import { styles } from "./style";

export default function CertificateSection({ form, setForm, theme, emptyCert }) {
  const scheme = useColorScheme();
  return(
    <Section title="Certifications" theme={theme}>
      {form.certifications.map((c, idx) => (
        <View key={idx} style={[styles.cardAccent, { borderColor: theme.border, backgroundColor: scheme === "dark" ? "#1b2433" : "#fffbeb" }]}>
          <RemoveButton onPress={() => setForm({ ...form, certifications: form.certifications.filter((_, i) => i !== idx) })} theme={theme} />
          <Text style={[styles.cardHeader, { color: theme.text }]}>Certificate #{idx + 1}</Text>
          <InputField label="Certificate Name" value={c.name} onChangeText={(t) => setForm({ ...form, certifications: form.certifications.map((cert, i) => (i === idx ? { ...cert, name: t } : cert)) })} theme={theme} />
          <InputField label="Link (optional)" value={c.link} onChangeText={(t) => setForm({ ...form, certifications: form.certifications.map((cert, i) => (i === idx ? { ...cert, link: t } : cert)) })} theme={theme} />
        </View>
      ))}
      <AddButton title="+ Add Certification" onPress={() => setForm({ ...form, certifications: [...form.certifications, emptyCert()] })} />
    </Section>
  )
}