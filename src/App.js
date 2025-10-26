// src/App.js
import React, { useContext, useState, useEffect } from "react";
import { SafeAreaView, StatusBar, BackHandler, Alert } from "react-native";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";
import HomeScreen from "./screens/HomeScreen";
import EditResumeScreen from "./screens/EditResumeScreen";
import ViewResumeScreen from "./screens/ViewResumeScreen";
import ProfileScreen from "./screens/ProfileScreen";

const AppContent = () => {
  const { user, initializing } = useContext(AuthContext);
  const [authMode, setAuthMode] = useState("login");
  const [routeStack, setRouteStack] = useState(["home"]);
  const [resumeData, setResumeData] = useState(null);

  const currentRoute = routeStack[routeStack.length - 1];

  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      if (!user) return false;
      if (routeStack.length > 1) {
        setRouteStack(prevStack => prevStack.slice(0, prevStack.length - 1));
        return true;
      } else {
        Alert.alert("Exit App", "Do you want to exit the app?", [
          { text: "Cancel", style: "cancel" },
          { text: "Exit", onPress: () => BackHandler.exitApp() },
        ]);
        return true;
      }
    });

    return () => backHandler.remove();
  }, [routeStack, user]);

  if (initializing) return null;

  if (!user) {
    return authMode === "login" ? (
      <LoginScreen onSwitchToSignup={() => setAuthMode("signup")} />
    ) : (
      <SignupScreen onSwitchToLogin={() => setAuthMode("login")} />
    );
  }

  const navigate = (newRoute, data = null) => {
    if (data) setResumeData(data);
    setRouteStack(prev => [...prev, newRoute]);
  };

  switch (currentRoute) {
    case "home":
      return (
        <HomeScreen
          navigateToEdit={(data) => navigate("edit", data)}
          navigateToView={(data) => navigate("view", data)}
          navigateToProfile={() => navigate("profile")}
        />
      );
    case "edit":
      return (
        <EditResumeScreen
          initialData={resumeData}
          onBack={() => setRouteStack(prev => prev.slice(0, prev.length - 1))}
          navigateToProfile={() => navigate("profile")}
        />
      );
    case "profile":
      return (
        <ProfileScreen
          onBack={() => setRouteStack(prev => prev.slice(0, prev.length - 1))}
        />
      );
    case "view":
      return (
        <ViewResumeScreen
          resume={resumeData}
          onBack={() => setRouteStack(prev => prev.slice(0, prev.length - 1))}
          navigateToEdit={(data) => navigate("edit", data)}
          navigateToProfile={() => navigate("profile")}
        />
      );
    default:
      return null;
  }
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
