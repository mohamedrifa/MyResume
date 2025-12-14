// src/utils/apiUtil.js
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { db } from "../services/firebaseConfig";
import { ref, onValue } from "firebase/database";

export function useFetchUserData() {
  const { user } = useContext(AuthContext);

  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);

  const uid = user?.uid;

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }

    const r = ref(db, `users/${uid}`);

    const unsub = onValue(
      r,
      (snapshot) => {
        setResume(snapshot.val());
        setLoading(false);
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
