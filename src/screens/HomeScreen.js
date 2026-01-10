// src/screens/HomeScreen.js
import React, { useContext, useMemo } from "react";
import {
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { AuthContext } from "../context/AuthContext";
import { getTheme } from "../constants/ColorConstants";
import { useFetchUserData } from "../utils/apiUtil";
import Header from "../components/Home/Header";
import InfoCard from "../components/Home/InfoCard";
import FloatButton from "../components/Home/FloatButton";
import PageLoader from "../components/Home/PageLoader";

const HomeScreen = ({ navigateToEdit, navigateToView, navigateToProfile }) => {
  const { user } = useContext(AuthContext);
  const scheme = useColorScheme();
  const { resume, loading } = useFetchUserData();

  const theme = useMemo(() => getTheme(scheme), [scheme]);

  // counts for chips
  const countOf = (val) => {
    if (!val) return 0;
    if (Array.isArray(val)) return val.length;
    if (typeof val === "object") return Object.keys(val).length;
    if (typeof val === "string") {
      try {
        const a = JSON.parse(val);
        return Array.isArray(a) ? a.length : 0;
      } catch {
        return (val.split(";").filter(Boolean) || []).length;
      }
    }
    return 0;
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={scheme === "dark" ? "light-content" : "dark-content"} backgroundColor={theme.bg} />

      <ScrollView contentContainerStyle={[styles.container, { paddingBottom: 28 }]}>
        <Header
          resume={resume}
          user={user}
          theme={theme}
          onProfilePress={navigateToProfile}
        />
        <InfoCard
          resume={resume}
          theme={theme}
          countOf={countOf}
          onEdit={navigateToEdit}
          onView={navigateToView}
        />

        <Text style={[styles.tip, { color: theme.subtle }]}>
          Tip: Keep your summary short and impactful. Add your latest projects and roles.
        </Text>
      </ScrollView>

      {/* Floating Edit */}
      <FloatButton
        visible={!loading}
        theme={theme}
        onPress={() => navigateToEdit(resume || {})}
      />
      <PageLoader
        visible={loading}
        theme={theme}
        message="Loading your profile..."
      />

    </SafeAreaView>
  );
};



const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: 18 },
  tip: { marginTop: 12, fontSize: 12 },
});

export default HomeScreen;