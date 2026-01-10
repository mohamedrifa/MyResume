import React from "react";
import { View, Text } from "react-native";
import Section from "./utilities/Section";
import InputField from "./utilities/InputField";
import AddButton from "./utilities/AddButton";
import RemoveButton from "./utilities/RemoveButton";
import { styles } from "../EditResume/style";

export default function EducationSection({
  form,
  setForm,
  theme,
  emptyEdu,
}) {
  return (
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
  );
}