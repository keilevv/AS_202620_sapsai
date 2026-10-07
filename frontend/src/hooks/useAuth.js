import { useState, useEffect, useCallback } from "react";
import authService from "../Services/auth";
import { useNavigate, useLocation } from "react-router-dom";
import useStore from "./useStore";

function useAuth() {
  const { user, setUser, setUiState, logout: logoutFromStore } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [userState, setUserState] = useState(user || null);
  const [loading, setLoading] = useState(false);

  const localLogin = useCallback(async (email, password) => {
    try {
      return await authService.localLogin(email, password).then((response) => {
        if (response.status === 200) {
          setUserState(response.data.user);
          setUser(response.data);
          setLoading(false);
          return response.data.user;
        } else {
          setUserState(null);
          return null;
        }
      });
    } catch (error) {
      return Promise.reject(error);
    }
  }, []);

  const googleLogin = async () => {
    try {
      return await authService.googleLogin().then((response) => {
        if (response.status === 200) {
          setUserState(response.data.user);
          setUser(response.data);
          setLoading(false);
          setUiState({
            login: {
              comesFrom: {
                pathname: "",
                search: "",
                key: "",
              },
            },
          });
          return response.data.user;
        } else {
          setUserState(null);
          return null;
        }
      });
    } catch (error) {
      return Promise.reject(error);
    }
  };

  const checkAuth = useCallback(async () => {
    setLoading(true);
    try {
      const response = await authService.isAuthenticated();
      if (response?.data) {
        setUserState(response.data);
        setUser(response.data);
        return response.data;
      }
      setUserState(null);
      setUser(null);
      return null;
    } catch (error) {
      console.error("Auth check failed:", error);
      setUserState(null);
      setUser(null);
      logoutFromStore();
      return null;
    } finally {
      setLoading(false);
    }
  }, [setUser]);

  // Check auth status when user state changes
  useEffect(() => {
    if (!user) {
      checkAuth();
    }
  }, [user, checkAuth]);

  const isAuthenticated = useCallback(async () => {
    // if (user) return user;
    return await checkAuth();
  }, [user, checkAuth]);

  const localRegister = async (fullName, email, password, phone) => {
    try {
      return await authService.localRegister(fullName, password, email, phone);
    } catch (error) {
      return Promise.reject(error);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUserState(null);
      setUser(null);
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return {
    userState,
    loading,
    logout,
    localLogin,
    googleLogin,
    localRegister,
    isAuthenticated,
  };
}
export default useAuth;
