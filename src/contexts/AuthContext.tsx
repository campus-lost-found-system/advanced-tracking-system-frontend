import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { getProfile } from '../api/services';

interface UserProfile {
    uid: string;
    email: string;
    role: 'user' | 'admin';
    campusId?: string;
    displayName?: string;
    phoneNumber?: string;
}

interface AuthContextType {
    user: User | null;
    userProfile: UserProfile | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<UserProfile>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Clear any leftover fake_admin flag from local development
        localStorage.removeItem('fake_admin');

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);

            if (firebaseUser) {
                try {
                    const profileData = await getProfile();
                    setUserProfile(profileData.data);
                } catch (error) {
                    console.error('Failed to fetch profile:', error);
                }
            } else {
                setUserProfile(null);
            }

            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const login = async (email: string, password: string): Promise<UserProfile> => {
        await signInWithEmailAndPassword(auth, email, password);
        const profileData = await getProfile();
        setUserProfile(profileData.data);
        return profileData.data;
    };

    const logout = async () => {
        localStorage.removeItem('fake_admin');
        await signOut(auth);
    };

    return (
        <AuthContext.Provider value={{ user, userProfile, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};