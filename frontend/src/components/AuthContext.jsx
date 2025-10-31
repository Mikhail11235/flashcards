import { createContext, useContext, useState, useEffect } from "react";
import { tokenStorage } from "../api/authHelpers";
import api from "../api/axios";
import i18n from "../i18n";

const AuthContext = createContext();

const SETTINGS_KEYS = {
  LANGUAGE: 'user-language',
  COLOR: 'user-color'
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [language, setLanguage] = useState(localStorage.getItem(SETTINGS_KEYS.LANGUAGE) || 'en')

    const applyUserSettings = (settings) => {
        const color = settings?.color || localStorage.getItem(SETTINGS_KEYS.COLOR) || 'yellow';
        const newLanguage = settings?.language || localStorage.getItem(SETTINGS_KEYS.LANGUAGE) || 'en';
        document.documentElement.style.setProperty(
            '--main-color',
            `var(--main-${color}-color)`
        );
        document.documentElement.lang = newLanguage;
        localStorage.setItem(SETTINGS_KEYS.COLOR, color);
        localStorage.setItem(SETTINGS_KEYS.LANGUAGE, newLanguage);
        setLanguage(newLanguage);
    };

    const updateSettings = async (settings) => {
        try {
            if (user) {
                const res = await api.patch("/api/auth/me", settings);
                const updatedUser = { ...user, ...settings };
                setUser(updatedUser);
            }
            applyUserSettings(settings);
            return { success: true };
        } catch (error) {
            return { success: false, error };
        }
    };

    useEffect(() => {
        i18n.changeLanguage(language);
    }, [language])

    useEffect(() => {
        const loadUser = async () => {
            const access = tokenStorage.access;
            const refresh = tokenStorage.refresh;
            if (!access || !refresh) {
                applyUserSettings(null);
                setLoading(false);
                return;
            }
            try {
                const res = await api.get("/api/auth/me");
                const userData = res.data;
                applyUserSettings(userData);
                setUser(userData);
            } catch (error) {
                tokenStorage.clear();
                applyUserSettings(null);
            } finally {
                setLoading(false);
            }
        };
        loadUser();
    }, []);

    const login = async ({ access, refresh }) => {
        tokenStorage.set({ access, refresh });
        try {
            const res = await api.get("/api/auth/me");
            const userData = res.data;
            applyUserSettings(userData);
            setUser(userData);
            return { success: true };
        } catch (error) {
            tokenStorage.clear();
            applyUserSettings(null);
            return { success: false, error };
        }
    };

    const logout = () => {
        tokenStorage.clear();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            isAuthenticated: !!user,
            login,
            logout,
            updateSettings,
            currentLanguage: language
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};