// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebaseConfig";

export const AuthContext = createContext({
  user: null,
  initializing: true,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Listen for auth state changes and persist user automatically
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setInitializing(false);
    });

    // Cleanup on unmount
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, initializing, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
