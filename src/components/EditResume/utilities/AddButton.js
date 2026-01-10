import React, { useMemo } from "react";
import {
  View,
  StyleSheet,
  useColorScheme,
} from "react-native";
import { getTheme } from "../../../constants/ColorConstants";
import Button from "../../Button";

const AddButton = ({title, onPress}) => {
  const scheme = useColorScheme();
  const theme = useMemo(() => getTheme(scheme), [scheme]);
  return(
    <View style={styles.addButtonContainer}>
      <Button
        title = {title}
        onPress={() => onPress()}
        style={{
          backgroundColor: "transparent",
          elevation: 0,
          shadowOpacity: 0,
          marginVertical: 0,
        }}
        textStyle={{
          color: theme.primary,
          fontWeight: "700",
        }}
      />
     </View>
  );
};

const styles = StyleSheet.create({
  addButtonContainer: { alignItems: "center" },
});

export default AddButton;