
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, Auth, GoogleAuthProvider, signInWithPopup, updateProfile } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { Logo } from '@/components/icons';
import { useToast } from './use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isGoogleAuthEnabled: boolean;
  isUpdatingAvatar: boolean;
  login: (email: string, password: string) => Promise<any>;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<any>;
  loginWithGoogle: () => Promise<any>;
  logout: () => void;
  updateUserAvatar: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const publicRoutes = ['/login', '/signup'];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
  const [auth, setAuth] = useState<Auth | null>(null);
  const [isGoogleAuthEnabled, setIsGoogleAuthEnabled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const authInstance = getAuth(app);
      setAuth(authInstance);

      // Check if the current hostname is the production one.
      setIsGoogleAuthEnabled(window.location.hostname === 'cloudpagestudio.vercel.app');

      const unsubscribe = onAuthStateChanged(authInstance, (user) => {
        setUser(user);
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    // This effect should only run on the client side
    if (typeof window !== 'undefined' && !loading && !user && !publicRoutes.includes(pathname)) {
      router.push('/login');
    }
  }, [loading, user, router, pathname]);

  const login = (email: string, password: string) => {
    if (!auth) return Promise.reject(new Error("Firebase Auth not initialized"));
    return signInWithEmailAndPassword(auth, email, password);
  }

  const signup = async (email: string, password: string, firstName: string, lastName: string) => {
    if (!auth) throw new Error("Firebase Auth not initialized");
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const avatarUrl = `https://api.dicebear.com/7.x/micah/svg?seed=${user.uid}`;
    await updateProfile(user, { 
        displayName: `${firstName} ${lastName}`,
        photoURL: avatarUrl
    });
    // Manually update the user in the context to reflect the new profile data immediately
    setUser({ ...user, displayName: `${firstName} ${lastName}`, photoURL: avatarUrl });
    return userCredential;
  }

  const loginWithGoogle = async () => {
    if (!auth) throw new Error("Firebase Auth not initialized");
    if (!isGoogleAuthEnabled) throw new Error("Google Auth is not enabled for this domain.");
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    // If the user is new and doesn't have a photoURL, generate one
    if (result.user && !result.user.photoURL) {
        const avatarUrl = `https://api.dicebear.com/7.x/micah/svg?seed=${result.user.uid}`;
        await updateProfile(result.user, { photoURL: avatarUrl });
        setUser({ ...result.user, photoURL: avatarUrl });
    }
    return result;
  };

  const logout = async () => {
    if (!auth) return;
    await signOut(auth);
    router.push('/login');
  };

  const updateUserAvatar = async () => {
    if (!auth?.currentUser) return;
    setIsUpdatingAvatar(true);
    try {
        const newSeed = `${auth.currentUser.uid}-${Date.now()}`;
        const newAvatarUrl = `https://api.dicebear.com/7.x/micah/svg?seed=${newSeed}`;
        await updateProfile(auth.currentUser, { photoURL: newAvatarUrl });
        // The onAuthStateChanged listener will pick up the change and update the user state.
        // For an immediate UI update, we can manually set it here as well.
        setUser({ ...auth.currentUser, photoURL: newAvatarUrl });
        toast({ title: "Avatar atualizado!", description: "Seu novo avatar foi salvo." });
    } catch (error: any) {
        console.error("Avatar update error:", error);
        toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível atualizar o avatar.' });
    } finally {
        setIsUpdatingAvatar(false);
    }
  };
  
  const value = {
    user,
    loading,
    isGoogleAuthEnabled,
    isUpdatingAvatar,
    login,
    signup,
    loginWithGoogle,
    logout,
    updateUserAvatar
  };

  if (loading && !publicRoutes.includes(pathname)) {
      return (
        <div className="flex h-screen w-full items-center justify-center">
            <Logo className="h-10 w-10 animate-spin text-primary" />
        </div>
      );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
