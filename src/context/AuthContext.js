import React, { createContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI, getErrorMessage } from '../api/endpoints';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔒 Safe storage clear helper (fix for iOS issues)
  const clearStorage = async () => {
    try {
      await AsyncStorage.multiRemove(['token', 'user']);
    } catch (e) {
      console.log('Storage clear error:', e);
    }
  };

  // Auto-login on app start
  useEffect(() => {
    restoreSession();
  }, []);

  const restoreSession = async () => {
    try {
      const [storedToken, storedUser] = await Promise.all([
        AsyncStorage.getItem('token'),
        AsyncStorage.getItem('user'),
      ]);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));

        try {
          // Verify token is still valid
          const response = await authAPI.me();
          const freshUser = response.data?.data || response.data;
          setUser(freshUser);
          await AsyncStorage.setItem('user', JSON.stringify(freshUser));
        } catch (err) {
          // Token invalid → clear safely
          await clearStorage();
          setToken(null);
          setUser(null);
        }
      }
    } catch (err) {
      // Any unexpected failure → clear safely
      await clearStorage();
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const response = await authAPI.login({ email, password });
      const { token: newToken, user: newUser } =
        response.data?.data || response.data;

      await Promise.all([
        AsyncStorage.setItem('token', newToken),
        AsyncStorage.setItem('user', JSON.stringify(newUser)),
      ]);

      setToken(newToken);
      setUser(newUser);
      return { success: true };
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  const register = useCallback(
    async (name, email, password, role = 'STUDENT') => {
      setError(null);
      try {
        const response = await authAPI.register({
          name,
          email,
          password,
          role,
        });
        const { token: newToken, user: newUser } =
          response.data?.data || response.data;

        await Promise.all([
          AsyncStorage.setItem('token', newToken),
          AsyncStorage.setItem('user', JSON.stringify(newUser)),
        ]);

        setToken(newToken);
        setUser(newUser);
        return { success: true };
      } catch (err) {
        const message = getErrorMessage(err);
        setError(message);
        return { success: false, error: message };
      }
    },
    []
  );

  const logout = useCallback(async () => {
    await clearStorage(); // ✅ fixed
    setToken(null);
    setUser(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const isOrganizer =
    user?.role === 'ORGANIZER' || user?.role === 'ADMIN';
  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        isOrganizer,
        isAdmin,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}