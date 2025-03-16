"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createUserAccount, getCurrentUser, signIn, signOut } from "./api";

// Define a UserType interface to replace 'any'
interface UserType {
  $id: string;
  name: string;
  email: string;
  // Add other user properties as needed
}

interface AuthContextType {
    user: UserType | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    isVerifying: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoading: false,
    isAuthenticated: false,
    login: async () => {},
    logout: async () => {},
    register: async () => {},
    isVerifying: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<UserType | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isVerifying, setIsVerifying] = useState<boolean>(false);
    const router = useRouter();

    useEffect(() => {
        // Check if user is authenticated
        const checkAuth = async () => {
            try {
                setIsLoading(true);
                const currentAccount = await getCurrentUser();
                
                if (currentAccount) {
                    setUser(currentAccount);
                    setIsAuthenticated(true);
                } else {
                    setUser(null);
                    setIsAuthenticated(false);
                }
            } catch {
                // We won't log any errors here since getCurrentUser already handles that
                setUser(null);
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = async (email: string, password: string) => {
        setIsVerifying(true);
        try {
            setIsLoading(true);
            const session = await signIn(email, password);
            
            if (session) {
                const currentUser = await getCurrentUser();
                setUser(currentUser);
                setIsAuthenticated(true);
                router.push('/');
            }
        } catch (error) {
            console.error("Login error:", error);
            throw error;
        } finally {
            setIsLoading(false);
            setIsVerifying(false);
        }
    };

    const logout = async () => {
        try {
            setIsLoading(true);
            await signOut();
            setUser(null);
            setIsAuthenticated(false);
            router.push('/sign-in');
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (name: string, email: string, password: string) => {
        try {
            setIsLoading(true);
            const newUser: UserType = await createUserAccount(name, email, password);
            
            if (newUser) {
                await login(email, password);
            }
        } catch (error) {
            console.error("Register error:", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const value = {
        user,
        isLoading,
        isAuthenticated,
        login,
        logout,
        register,
        isVerifying
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}; 