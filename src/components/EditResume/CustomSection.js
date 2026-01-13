import React from "react";
import { View } from "react-native";
import Section from "./utilities/Section";
import InputField from "./utilities/InputField";
import RemoveButton from "./utilities/RemoveButton";
import AddButton from "./utilities/AddButton";
import { styles } from "./style";

export default function CustomSection({ form, setForm, theme }) {
  const addSection = () => {
    setForm({
      ...form,
      customSections: [
        ...(form.customSections || []),
        { title: "", items: [{ heading: "", description: "" }] },
      ],
    });
  };

  const updateSectionTitle = (sIdx, value) => {
    const updated = [...form.customSections];
    updated[sIdx] = { ...updated[sIdx], title: value };
    setForm({ ...form, customSections: updated });
  };

  const updateItem = (sIdx, iIdx, key, value) => {
    const updated = [...form.customSections];
    updated[sIdx].items = updated[sIdx].items.map((item, idx) =>
      idx === iIdx ? { ...item, [key]: value } : item
    );
    setForm({ ...form, customSections: updated });
  };

  const addItem = (sIdx) => {
    const updated = [...form.customSections];
    updated[sIdx].items = [
      ...updated[sIdx].items,
      { heading: "", description: "" },
    ];
    setForm({ ...form, customSections: updated });
  };

  const removeItem = (sIdx, iIdx) => {
    const updated = [...form.customSections];
    updated[sIdx].items = updated[sIdx].items.filter((_, i) => i !== iIdx);
    setForm({ ...form, customSections: updated });
  };

  const removeSection = (sIdx) => {
    setForm({
      ...form,
      customSections: form.customSections.filter((_, i) => i !== sIdx),
    });
  };

  return (
    <>
      {(form.customSections || []).map((section, sIdx) => (
        <Section
          key={sIdx}
          title={`Custom Section ${sIdx + 1}`}
          theme={theme}
        >
          <RemoveButton onPress={() => removeSection(sIdx)} theme={theme} />

          <InputField
            label="Section Name"
            value={section.title}
            onChangeText={(t) => updateSectionTitle(sIdx, t)}
            theme={theme}
          />

          {section.items.map((item, iIdx) => (
            <View
              key={iIdx}
              style={[
                styles.card,
                { backgroundColor: theme.bg, borderColor: theme.border },
              ]}
            >
              <RemoveButton
                onPress={() => removeItem(sIdx, iIdx)}
                theme={theme}
              />

              <InputField
                label={`Title ${iIdx + 1}`}
                value={item.heading}
                onChangeText={(t) =>
                  updateItem(sIdx, iIdx, "heading", t)
                }
                theme={theme}
              />

              <InputField
                label="Description"
                multiline
                value={item.description}
                onChangeText={(t) =>
                  updateItem(sIdx, iIdx, "description", t)
                }
                theme={theme}
              />
            </View>
          ))}

          <AddButton title="+ Add Item" onPress={() => addItem(sIdx)} />
        </Section>
      ))}

      <AddButton title="+ Add Custom Section" onPress={addSection} />
    </>
  );
}
