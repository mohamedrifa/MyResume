import React from "react";
import { View, Text } from "react-native";
import Section from "./utilities/Section";
import InputField from "./utilities/InputField";
import AddButton from "./utilities/AddButton";
import RemoveButton from "./utilities/RemoveButton";
import { styles } from "../EditResume/style";

export default function LanguageSection({
  form,
  setForm,
  theme,
  emptyLang,
}) {
  return (
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
  );
}