// src/utils/apiUtil.js
import { useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from "../context/AuthContext";
import { db } from "../services/firebaseConfig";
import { ref, onValue } from "firebase/database";
import { CACHE_PREFIX } from "../constants/TextConstant";

export function useFetchUserData() {
  const { user } = useContext(AuthContext);

  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);

  const uid = user?.uid;
  const cacheKey = `${CACHE_PREFIX}${uid}`;

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }

    // 1️⃣ Load from cache first
    const loadFromCache = async () => {
      try {
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) {
          setResume(JSON.parse(cached));
          setTimeout(() => {
            setLoading(false);
          }, 1000);
        }
      } catch (e) {
        console.warn("Cache read error", e);
      }
    };

    loadFromCache();

    // 2️⃣ Fetch fresh data from Firebase
    const r = ref(db, `users/${uid}`);

    const unsub = onValue(
      r,
      async (snapshot) => {
        const data = snapshot.val();
    
        // 🔹 REMOVE image from each project
        const sanitized = {
          ...data,
          projects: Array.isArray(data?.projects)
            ? data.projects.map(({ image, ...rest }) => rest)
            : [],
        };
    
        setResume(sanitized);
        setTimeout(() => {
          setLoading(false);
        }, 1000);
        try {
          await AsyncStorage.setItem(cacheKey, JSON.stringify(sanitized));
        } catch (e) {
          console.warn("Cache write error", e);
        }
      },
      (error) => {
        console.warn(error);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [uid]);

  return { resume, loading };
}
