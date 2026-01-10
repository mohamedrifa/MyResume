import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Chip from "./utilities/Chip";
import Button from "../Button";

const InfoCard = ({
  resume,
  theme,
  onEdit,
  onView,
  countOf,
}) => {
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.card, borderColor: theme.cardBorder },
        theme.shadow,
      ]}
    >
      {/* Header */}
      <View style={styles.cardHeaderRow}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Profile
        </Text>

        <TouchableOpacity
          onPress={onEdit}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.link, { color: theme.primary }]}>Edit</Text>
        </TouchableOpacity>
      </View>

      {/* Title & summary */}
      <Text
        style={[styles.title, { color: theme.text }]}
        numberOfLines={1}
      >
        {resume?.title || "Add your title"}
      </Text>

      <Text
        style={[styles.summary, { color: theme.subtle }]}
        numberOfLines={3}
      >
        {resume?.summary ||
          "Tell a short, impactful summary about yourself."}
      </Text>

      {/* Chips */}
      <View style={styles.chipsRow}>
        <Chip label={`${countOf(resume?.skills)} skills`} theme={theme} />
        <Chip label={`${countOf(resume?.experience)} experience`} theme={theme} />
        <Chip label={`${countOf(resume?.projects)} projects`} theme={theme} />
      </View>

      <View
        style={[styles.divider, { backgroundColor: theme.divider }]}
      />

      {/* Actions */}
      <View style={styles.actionsCol}>
        <Button
          title="View & Download PDF"
          onPress={() => onView(resume || {})}
          style={{ backgroundColor: theme.success }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "100%",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  sectionTitle: { fontWeight: "800", fontSize: 16 },
  link: { fontWeight: "800" },

  title: { fontSize: 16, fontWeight: "700", marginTop: 2 },
  summary: { marginTop: 6, fontSize: 14, lineHeight: 20 },

  chipsRow: { flexDirection: "row", gap: 8, marginTop: 12, flexWrap: "wrap" },

  divider: { height: 1, width: "100%", marginTop: 14, marginBottom: 12 },

  actionsCol: { gap: 10 },
});

export default React.memo(InfoCard);
