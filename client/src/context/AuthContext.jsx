import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import api from "../services/api";
import {
  registerUser,
  loginUser,
  fetchCurrentUser,
} from "../services/authService";
import { getToken, setToken, removeToken } from "../utils/tokenStorage";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setTokenState] = useState(() => getToken());
  const [currentUser, setCurrentUser] = useState(null);
  // `loading` is true while we restore a session from a stored token on boot.
  const [loading, setLoading] = useState(true);

  /**
   * Keep the shared Axios instance in sync with the current token so every
   * subsequent request automatically carries `Authorization: Bearer <token>`.
   */
  useEffect(() => {
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common.Authorization;
    }
  }, [token]);

  /**
   * On mount, if a token exists, verify it against /auth/me and restore
   * the authenticated user. A 401 clears the stale token.
   */
  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      const storedToken = getToken();

      if (!storedToken) {
        if (!cancelled) setLoading(false);
        return;
      }

      api.defaults.headers.common.Authorization = `Bearer ${storedToken}`;

      try {
        const data = await fetchCurrentUser();
        if (!cancelled) {
          setCurrentUser(data.user);
          setTokenState(storedToken);
        }
      } catch {
        if (!cancelled) {
          removeToken();
          setCurrentUser(null);
          setTokenState(null);
          delete api.defaults.headers.common.Authorization;
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const data = await loginUser({ email, password });
    setToken(data.token);
    setTokenState(data.token);
    setCurrentUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async ({ name, email, password }) => {
    const data = await registerUser({ name, email, password });
    setToken(data.token);
    setTokenState(data.token);
    setCurrentUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    removeToken();
    setTokenState(null);
    setCurrentUser(null);
    delete api.defaults.headers.common.Authorization;
  }, []);

  const value = useMemo(
    () => ({
      currentUser,
      token,
      loading,
      isAuthenticated: Boolean(currentUser),
      login,
      register,
      logout,
    }),
    [currentUser, token, loading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
