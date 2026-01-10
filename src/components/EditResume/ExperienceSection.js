import React from "react";
import { View, Text } from "react-native";
import Section from "./utilities/Section";
import InputField from "./utilities/InputField";
import RemoveButton from "./utilities/RemoveButton";
import AddButton from "./utilities/AddButton";
import { styles } from "../EditResume/style";

export default function ExperienceSection({
  form,
  setForm,
  theme,
  emptyExp,
}) {
  const updateExperience = (idx, key, value) => {
    setForm({
      ...form,
      experience: form.experience.map((e, i) =>
        i === idx ? { ...e, [key]: value } : e
      ),
    });
  };

  const removeExperience = (idx) => {
    setForm({
      ...form,
      experience: form.experience.filter((_, i) => i !== idx),
    });
  };

  return (
    <Section
      title="Experience"
      suggestion='Use ";" for new lines in Summary'
      theme={theme}
    >
      {form.experience.map((x, idx) => (
        <View
          key={idx}
          style={[
            styles.card,
            { backgroundColor: theme.bg, borderColor: theme.border },
          ]}
        >
          <RemoveButton
            onPress={() => removeExperience(idx)}
            theme={theme}
          />

          <Text style={[styles.cardHeader, { color: theme.text }]}>
            Experience #{idx + 1}
          </Text>

          <InputField
            label="Role"
            value={x.role}
            onChangeText={(t) => updateExperience(idx, "role", t)}
            theme={theme}
          />

          <InputField
            label="Mode/Location"
            value={x.location}
            onChangeText={(t) => updateExperience(idx, "location", t)}
            theme={theme}
          />

          <InputField
            label="Company"
            value={x.company}
            onChangeText={(t) => updateExperience(idx, "company", t)}
            theme={theme}
          />

          <View style={styles.row}>
            <View style={styles.half}>
              <InputField
                label="From"
                value={x.from}
                onChangeText={(t) => updateExperience(idx, "from", t)}
                theme={theme}
              />
            </View>

            <View style={styles.half}>
              <InputField
                label="To"
                value={x.to}
                onChangeText={(t) => updateExperience(idx, "to", t)}
                theme={theme}
              />
            </View>
          </View>

          <InputField
            label="Summary"
            multiline
            value={x.summary}
            onChangeText={(t) => updateExperience(idx, "summary", t)}
            theme={theme}
          />
        </View>
      ))}

      <AddButton
        title="+ Add Experience"
        onPress={() =>
          setForm({
            ...form,
            experience: [...form.experience, emptyExp()],
          })
        }
      />
    </Section>
  );
}