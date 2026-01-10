import React from "react";
import RNFS from "react-native-fs";

export const toBase64DataUri = async (uri, mimeHint = "image/jpeg") => {
  let mime = mimeHint;
  const lower = (uri || "").toLowerCase();
  if (lower.endsWith(".png")) mime = "image/png";
  else if (lower.endsWith(".webp")) mime = "image/webp";
  else if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) mime = "image/jpeg";
  const b64 = await RNFS.readFile(uri, "base64");
  return `data:${mime};base64,${b64}`;
};