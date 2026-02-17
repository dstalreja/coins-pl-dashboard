import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { jwtDecode } from "jwt-decode";

interface GoogleCredential {
    email: string;
    name: string;
    picture: string;
    sub: string; // Google ID
    exp?: number;
}

interface AuthContextType {
    user: GoogleCredential | null;
    token: string | null;
    login: (credentialResponse: string) => void;
    logout: () => void;
    isAllowed: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<GoogleCredential | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isAllowed, setIsAllowed] = useState(false);

    useEffect(() => {
        // Check local storage on load
        const storedToken = localStorage.getItem("google_token");
        if (storedToken) {
            try {
                const decoded = jwtDecode<GoogleCredential>(storedToken);
                const currentTime = Date.now() / 1000;

                if (decoded.exp && decoded.exp < currentTime) {
                    console.warn("Token expired, clearing session");
                    localStorage.removeItem("google_token");
                    return;
                }

                setUser(decoded);
                setToken(storedToken);
                checkAllowed(decoded.email);
            } catch (e) {
                console.error("Invalid stored token", e);
                localStorage.removeItem("google_token");
            }
        }
    }, []);

    const checkAllowed = (email: string) => {
        const allowed = import.meta.env.VITE_ALLOWED_EMAILS?.split(",") || [];
        setIsAllowed(allowed.includes(email));
    };

    const login = (credential: string) => {
        try {
            const decoded = jwtDecode<GoogleCredential>(credential);
            setUser(decoded);
            setToken(credential);
            localStorage.setItem("google_token", credential);
            checkAllowed(decoded.email);
        } catch (e) {
            console.error("Login failed: invalid token", e);
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        setIsAllowed(false);
        localStorage.removeItem("google_token");
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAllowed }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
