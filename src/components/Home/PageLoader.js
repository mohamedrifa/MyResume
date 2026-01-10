import React from "react";
import { View } from "react-native";
import Loader from "../Loader";

const PageLoader = ({ visible, theme, message = "Loading..." }) => {
  if (!visible) return null;

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: theme.bg,
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <Loader message={message} />
    </View>
  );
};

export default React.memo(PageLoader);
