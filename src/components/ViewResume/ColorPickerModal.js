import React from "react";
import { Modal, View, Text, Pressable, StyleSheet } from "react-native";
import ColorPicker from "./utilities/ColorPicker";
import Button from "../Button";

const ColorPickerModal = ({
  visible,
  theme,
  color,
  onChangeColor,
  onClose,
  onDone,
  onReset,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View style={[styles.modalCard, { backgroundColor: theme.card }]}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Choose an accent color
            </Text>

            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                styles.closeBtn,
                { backgroundColor: theme.soft, borderColor: theme.border },
                pressed && styles.pressed,
              ]}
              android_ripple={{ color: theme.ripple }}
              accessibilityRole="button"
              accessibilityLabel="Close color picker"
            >
              <Text style={{ fontSize: 18, color: theme.text }}>✕</Text>
            </Pressable>
          </View>

          {/* Picker */}
          <View
            style={[
              styles.pickerWrap,
              { backgroundColor: theme.pickerBg },
            ]}
          >
            <ColorPicker
              initialColor={color}
              showAlpha={false}
              size={260}
              onChange={({ hex }) => onChangeColor(hex)}
            />
          </View>

          {/* Actions */}
          <View style={styles.modalActions}>
            <Button title="Done" onPress={onDone} />
            <Button
              title="Reset"
              onPress={onReset}
              style={{ backgroundColor: theme.mutedBtnBg }}
              textStyle={{ color: theme.text }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  modalCard: {
    padding: 16,
    paddingBottom: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },
  modalTitle: { fontWeight: "800", fontSize: 16 },
  pickerWrap: { borderRadius: 12, padding: 12, alignItems: "center" },
  modalActions: { flexDirection: "row", gap: 8, marginTop: 12 },
});

export default React.memo(ColorPickerModal);
