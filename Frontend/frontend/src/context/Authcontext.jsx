import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import api from "../../axios/auth.axios";
import { FireBaseContext } from "./FireBaseProvider";
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
const {googleSignup} = useContext(FireBaseContext)
  const fetchCurrentUser = useCallback(async () => {
    try {
      const { data } = await api.get("/auth/account");
      setCurrentUser(data.UserData);
      return data.UserData;
    } catch (error) {
      setCurrentUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);
  const loginWithGoogle = async () => {
    const result = await googleSignup(); 
    console.log(result)
    const { uid, displayName, email, photoURL } = result.user;

    let firstName = displayName || "";
    let lastName = "";
    if (displayName) {
      const parts = displayName.trim().split(" ").filter(Boolean);
      firstName = parts[0];
      lastName = parts.slice(1).join(" ") || parts[0];
    }

    const { data } = await api.post("/auth/create-user", {
      uid,
      displayName,
      email,
      photoURL,
      firstName,
      lastName,
    });

    const user = await fetchCurrentUser();
    return { ...data, user };
  };

  const logout = async () => {
    try {
      await api.get("/auth/logout");
    } finally {
    
      setCurrentUser(null);
    }
  };

  const value = {
    currentUser,
    loading,
    isAuthenticated: !!currentUser,
    loginWithGoogle,
    logout,
    fetchCurrentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an <AuthProvider>");
  }
  return ctx;
}