"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createUserAccount, getCurrentUser, getUserNotifications, markAllNotificationsAsRead, markNotificationAsRead, signIn, signOut } from "./api";
import { Notification } from "./types";

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
    notifications: Notification[];
    unreadNotificationsCount: number;
    loadNotifications: () => Promise<void>;
    markNotificationRead: (notificationId: string) => Promise<void>;
    markAllNotificationsRead: () => Promise<void>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {},
  register: async () => {},
  isVerifying: false,
  notifications: [],
  unreadNotificationsCount: 0,
  loadNotifications: async () => {},
  markNotificationRead: async () => {},
  markAllNotificationsRead: async () => {},
});

// Custom hook to use the Auth context
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<UserType | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isVerifying, setIsVerifying] = useState<boolean>(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(0);
    const router = useRouter();

    const loadNotifications = async () => {
        if (user) {
            try {
                const notificationsData = await getUserNotifications(user.$id);
                setNotifications(notificationsData as unknown as Notification[]);
                setUnreadNotificationsCount(
                    (notificationsData as unknown as Notification[]).filter(
                        notification => !notification.isRead
                    ).length
                );
            } catch (error) {
                console.error("Error loading notifications:", error);
            }
        }
    };

    const markNotificationRead = async (notificationId: string) => {
        try {
            await markNotificationAsRead(notificationId);
            setNotifications(prev => 
                prev.map(notification => 
                    notification.$id === notificationId 
                        ? { ...notification, isRead: true } 
                        : notification
                )
            );
            setUnreadNotificationsCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const markAllNotificationsRead = async () => {
        if (user) {
            try {
                await markAllNotificationsAsRead(user.$id);
                setNotifications(prev => 
                    prev.map(notification => ({ ...notification, isRead: true }))
                );
                setUnreadNotificationsCount(0);
            } catch (error) {
                console.error("Error marking all notifications as read:", error);
            }
        }
    };

    useEffect(() => {
        // Check if user is authenticated
        const checkAuth = async () => {
            try {
                setIsLoading(true);
                const currentAccount = await getCurrentUser();
                
                if (currentAccount) {
                    setUser(currentAccount);
                    setIsAuthenticated(true);
                    // Load notifications after authenticating
                    await loadNotifications();
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

    // Add a listener for when the route changes to refresh notifications
    useEffect(() => {
        const _handleRouteChange = () => {
            if (isAuthenticated && user) {
                loadNotifications();
            }
        };
        
        // Check for router events or call manually on mount
        if (isAuthenticated && user) {
            loadNotifications();
        }
        
        return () => {
            // Clean up if needed
        };
    }, [isAuthenticated, user]);

    const login = async (email: string, password: string) => {
        setIsVerifying(true);
        try {
            setIsLoading(true);
            const session = await signIn(email, password);
            
            if (session) {
                const currentUser = await getCurrentUser();
                setUser(currentUser);
                setIsAuthenticated(true);
                await loadNotifications();
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

    const register = async (name: string, email: string, password: string) => {
        try {
            setIsLoading(true);
            
            // Create user account
            await createUserAccount(name, email, password);
            
            router.push('/sign-in');
        } catch (error) {
            console.error("Registration error:", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            setIsLoading(true);
            await signOut();
            setUser(null);
            setIsAuthenticated(false);
            setNotifications([]);
            setUnreadNotificationsCount(0);
            router.push('/sign-in');
        } catch (error) {
            console.error("Logout error:", error);
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
        isVerifying,
        notifications,
        unreadNotificationsCount,
        loadNotifications,
        markNotificationRead,
        markAllNotificationsRead,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}; 