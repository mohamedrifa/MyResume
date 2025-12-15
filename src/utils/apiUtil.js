// src/utils/apiUtil.js
import { useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from "../context/AuthContext";
import { db } from "../services/firebaseConfig";
import { ref, onValue } from "firebase/database";

const CACHE_PREFIX = "My_Resume_Cache_";

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
          setLoading(false); // instant UI
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
        setResume(data);
        setLoading(false);

        // 3️⃣ Update cache
        try {
          await AsyncStorage.setItem(cacheKey, JSON.stringify(data));
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
