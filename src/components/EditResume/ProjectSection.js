import React from "react";
import { View, Text } from "react-native";
import Section from "./utilities/Section";
import InputField from "./utilities/InputField";
import AddButton from "./utilities/AddButton";
import RemoveButton from "./utilities/RemoveButton";
import { styles } from "../EditResume/style";

export default function ProjectsSection({
  form,
  setForm,
  theme,
  emptyProj,
}) {
  const updateProject = (idx, key, value) => {
    setForm({
      ...form,
      projects: form.projects.map((p, i) =>
        i === idx ? { ...p, [key]: value } : p
      ),
    });
  };

  const removeProject = (idx) => {
    setForm({
      ...form,
      projects: form.projects.filter((_, i) => i !== idx),
    });
  };

  const addProject = () => {
    setForm({
      ...form,
      projects: [...form.projects, emptyProj()],
    });
  };

  return (
    <Section
      title="Projects"
      suggestion='Use ";" for new lines in Description'
      theme={theme}
    >
      {form.projects.map((p, idx) => (
        <View
          key={idx}
          style={[
            styles.card,
            { backgroundColor: theme.bg, borderColor: theme.border },
          ]}
        >
          <RemoveButton onPress={() => removeProject(idx)} theme={theme} />

          <Text style={[styles.cardHeader, { color: theme.text }]}>
            Project #{idx + 1}
          </Text>

          <InputField
            label="Title"
            value={p.title}
            onChangeText={(t) => updateProject(idx, "title", t)}
            theme={theme}
          />

          <InputField
            label="Stack/Technologies"
            value={p.stack}
            onChangeText={(t) => updateProject(idx, "stack", t)}
            theme={theme}
          />

          <InputField
            label="Description"
            multiline
            value={p.description}
            onChangeText={(t) => updateProject(idx, "description", t)}
            theme={theme}
          />

          <InputField
            label="Link (optional)"
            value={p.link}
            onChangeText={(t) => updateProject(idx, "link", t)}
            theme={theme}
          />
        </View>
      ))}

      <AddButton title="+ Add Project" onPress={addProject} />
    </Section>
  );
}