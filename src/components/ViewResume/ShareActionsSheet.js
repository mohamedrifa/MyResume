import React from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

const ShareActionsSheet = ({
  visible,
  theme,
  onClose,
  onSharePdf,
  onSavePdf,
  onOpenLink,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <Pressable style={styles.sheetBackdrop} onPress={onClose}>
        <View />
      </Pressable>

      {/* Sheet */}
      <View
        style={[
          styles.sheetCard,
          theme.shadow,
          { backgroundColor: theme.card },
        ]}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <Text style={[styles.sheetTitle, { color: theme.text }]}>
            What would you like to do?
          </Text>

          <TouchableOpacity
            style={[
              styles.colorDotWrap,
              { borderColor: theme.border, backgroundColor: theme.card },
            ]}
            onPress={onOpenLink}
            accessibilityRole="button"
            accessibilityLabel="Open shareable link"
          >
            <Text style={{ color: theme.text, fontWeight: "600" }}>
              🔗 Link
            </Text>
          </TouchableOpacity>
        </View>

        {/* Actions */}
        <View style={styles.sheetButtons}>
          <Pressable
            onPress={onSharePdf}
            style={({ pressed }) => [
              styles.sheetBtn,
              { backgroundColor: theme.soft, borderColor: theme.border },
              pressed && styles.pressed,
            ]}
            android_ripple={{ color: theme.ripple }}
          >
            <Text
              style={[styles.sheetBtnText, { color: theme.text }]}
            >
              Share as PDF
            </Text>
          </Pressable>

          <Pressable
            onPress={onSavePdf}
            style={({ pressed }) => [
              styles.sheetBtn,
              { backgroundColor: theme.soft, borderColor: theme.border },
              pressed && styles.pressed,
            ]}
            android_ripple={{ color: theme.ripple }}
          >
            <Text
              style={[styles.sheetBtnText, { color: theme.text }]}
            >
              Save as PDF
            </Text>
          </Pressable>
        </View>

        {/* Cancel */}
        <Pressable
          onPress={onClose}
          style={({ pressed }) => [
            styles.sheetCancel,
            { backgroundColor: theme.card, borderColor: theme.border },
            pressed && styles.pressed,
          ]}
          android_ripple={{ color: theme.ripple }}
        >
          <Text
            style={[
              styles.sheetCancelText,
              { color: theme.subtle },
            ]}
          >
            Cancel
          </Text>
        </Pressable>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  sheetCard: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    paddingBottom: 24,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  sheetTitle: { fontSize: 16, fontWeight: "800", marginBottom: 12 },
  sheetButtons: { gap: 8 },
  sheetBtn: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  sheetBtnText: { fontSize: 15, fontWeight: "600", textAlign: "center" },
  sheetCancel: {
    marginTop: 10,
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  sheetCancelText: { fontSize: 15, fontWeight: "700", textAlign: "center" },
});

export default React.memo(ShareActionsSheet);
