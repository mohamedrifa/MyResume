import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import Section from "./utilities/Section";
import InputField from "./utilities/InputField";
import TextAction from "./utilities/TextAction";

export default function PersonalInfoSection({
  form,
  setForm,
  theme,
  scheme,
  pickProfile,
  removeProfile,
}) {
  return (
    <Section title="Personal Information" theme={theme}>
      <View style={styles.profileRow}>
        <View style={styles.avatarWrap}>
          {form.profile ? (
            <>
              <Image source={{ uri: form.profile }} style={styles.avatar} />
              <TouchableOpacity
                style={styles.avatarRemove}
                onPress={removeProfile}
              >
                <Text style={styles.avatarRemoveText}>-</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View
              style={[
                styles.avatar,
                styles.avatarPlaceholder,
                {
                  backgroundColor:
                    scheme === "dark" ? "#1f2937" : "#e2e8f0",
                },
              ]}
            >
              <Text style={{ fontWeight: "700", color: theme.subtle }}>
                Add
              </Text>
            </View>
          )}
        </View>

        <View style={styles.profileActions}>
          <Text style={[styles.profileLabel, { color: theme.text }]}>
            Profile Photo
          </Text>
          <View style={{ flexDirection: "row", gap: 14 }}>
            <TextAction
              title="Change Photo"
              onPress={pickProfile}
              color={theme.primary}
            />
            {form.profile && (
              <TextAction
                title="Remove"
                onPress={removeProfile}
                color={theme.danger}
              />
            )}
          </View>
        </View>
      </View>

      <InputField
        label="Full Name"
        value={form.name}
        onChangeText={(t) => setForm({ ...form, name: t })}
        theme={theme}
      />
      <InputField
        label="Professional Title"
        value={form.title}
        onChangeText={(t) => setForm({ ...form, title: t })}
        theme={theme}
      />
      <InputField
        label="Email"
        value={form.email}
        onChangeText={(t) => setForm({ ...form, email: t })}
        keyboardType="email-address"
        autoCapitalize="none"
        theme={theme}
      />
      <InputField
        label="Phone"
        value={form.phone}
        onChangeText={(t) => setForm({ ...form, phone: t })}
        keyboardType="phone-pad"
        theme={theme}
      />
      <InputField
        label="GitHub/Others"
        value={form.git}
        onChangeText={(t) => setForm({ ...form, git: t })}
        autoCapitalize="none"
        theme={theme}
      />
      <InputField
        label="LinkedIn"
        value={form.linkedIn}
        onChangeText={(t) => setForm({ ...form, linkedIn: t })}
        autoCapitalize="none"
        theme={theme}
      />
      <InputField
        label="Portfolio"
        value={form.portfolio}
        onChangeText={(t) => setForm({ ...form, portfolio: t })}
        autoCapitalize="none"
        theme={theme}
      />
      <InputField
        multiline
        label="Address"
        value={form.address}
        onChangeText={(t) => setForm({ ...form, address: t })}
        theme={theme}
      />
    </Section>
  );
}

const styles = StyleSheet.create({
  profileRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  avatarWrap: { marginRight: 14 },
  avatar: { width: 86, height: 86, borderRadius: 43 },
  avatarPlaceholder: { alignItems: "center", justifyContent: "center" },
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
  profileLabel: { fontWeight: "800", marginBottom: 6 },
});