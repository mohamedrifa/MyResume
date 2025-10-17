// src/App.js
import React, { useContext, useState } from "react";
import { SafeAreaView, StatusBar } from "react-native";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";
import HomeScreen from "./screens/HomeScreen";
import EditResumeScreen from "./screens/EditResumeScreen";
import ViewResumeScreen from "./screens/ViewResumeScreen";

const AppContent = () => {
  const { user, initializing } = useContext(AuthContext);
  const [authMode, setAuthMode] = useState("login"); // login | signup
  const [route, setRoute] = useState("home"); // home | edit | view
  const [resumeData, setResumeData] = useState(null);

  if (initializing) return null;

  // NOT LOGGED IN: show auth screens
  if (!user) {
    return authMode === "login" ? (
      <LoginScreen onSwitchToSignup={() => setAuthMode("signup")} />
    ) : (
      <SignupScreen onSwitchToLogin={() => setAuthMode("login")} />
    );
  }

  // LOGGED IN: show app screens via conditional rendering (no react-navigation)
  return route === "home" ? (
    <HomeScreen
      navigateToEdit={(data) => { setResumeData(data); setRoute("edit"); }}
      navigateToView={(data) => { setResumeData(data); setRoute("view"); }}
    />
  ) : route === "edit" ? (
    <EditResumeScreen initialData={resumeData} onBack={() => setRoute("home")} />
  ) : (
    <ViewResumeScreen resume={resumeData} onBack={() => setRoute("home")} />
  );
};

export default function App() {
  return (
    <AuthProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f3f4f6" }}>
        <StatusBar barStyle="dark-content" />
        <AppContent />
      </SafeAreaView>
    </AuthProvider>
  );
}
