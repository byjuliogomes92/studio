
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, Auth, GoogleAuthProvider, signInWithPopup, updateProfile } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { Logo } from '@/components/icons';
import { useToast } from './use-toast';
import type { Workspace } from '@/lib/types';
import { getWorkspacesForUser, createWorkspace, updateWorkspaceName as updateWorkspaceNameInDb } from '@/lib/firestore';
import { produce } from 'immer';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isGoogleAuthEnabled: boolean;
  isUpdatingAvatar: boolean;
  activeWorkspace: Workspace | null;
  workspaces: Workspace[];
  switchWorkspace: (workspaceId: string) => void;
  updateWorkspaceName: (workspaceId: string, newName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<any>;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<any>;
  loginWithGoogle: () => Promise<any>;
  logout: () => void;
  updateUserAvatar: () => Promise<void>;
  updateUserName: (firstName: string, lastName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const publicRoutes = ['/login', '/signup', '/debug-workspace'];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
  const [auth, setAuth] = useState<Auth | null>(null);
  const [isGoogleAuthEnabled, setIsGoogleAuthEnabled] = useState(false);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);

  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    const authInstance = getAuth(app);
    setAuth(authInstance);
    setIsGoogleAuthEnabled(process.env.NODE_ENV === 'production' || window.location.hostname === 'cloudpagestudio.vercel.app');

    const unsubscribe = onAuthStateChanged(authInstance, async (currentUser) => {
        setLoading(true);
        if (currentUser) {
            setUser(currentUser);
            try {
                const userWorkspaces = await getWorkspacesForUser(currentUser.uid);
                if (userWorkspaces.length > 0) {
                    setWorkspaces(userWorkspaces);
                    const lastWorkspaceId = localStorage.getItem('activeWorkspaceId');
                    const found = userWorkspaces.find(w => w.id === lastWorkspaceId);
                    setActiveWorkspace(found || userWorkspaces[0]);
                } else {
                    const newWorkspace = await createWorkspace(currentUser.uid, currentUser.email || 'Usuário', 'Meu Workspace');
                    setWorkspaces([newWorkspace]);
                    setActiveWorkspace(newWorkspace);
                }
            } catch (error) {
                console.error("Failed to fetch or create workspace:", error);
                toast({ variant: 'destructive', title: 'Erro Crítico', description: 'Não foi possível carregar seu workspace.' });
            }
        } else {
            setUser(null);
            setWorkspaces([]);
            setActiveWorkspace(null);
        }
        setLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);


  useEffect(() => {
    // This effect should only run on the client side for route protection
    if (typeof window !== 'undefined' && !loading && !user && !publicRoutes.includes(pathname)) {
      router.push('/login');
    }
  }, [loading, user, router, pathname]);

  const switchWorkspace = (workspaceId: string) => {
    const newActiveWorkspace = workspaces.find(w => w.id === workspaceId);
    if (newActiveWorkspace) {
      setActiveWorkspace(newActiveWorkspace);
      localStorage.setItem('activeWorkspaceId', workspaceId);
      window.location.reload(); 
    }
  };

  const updateWorkspaceName = async (workspaceId: string, newName: string) => {
    await updateWorkspaceNameInDb(workspaceId, newName);
    
    const updateState = (ws: Workspace) => produce(ws, draft => {
        if(draft.id === workspaceId) {
            draft.name = newName;
        }
    });

    setWorkspaces(prev => prev.map(updateState));
    if (activeWorkspace && activeWorkspace.id === workspaceId) {
        setActiveWorkspace(prev => prev ? updateState(prev) : null);
    }
  };

  const login = (email: string, password: string) => {
    if (!auth) return Promise.reject(new Error("Firebase Auth not initialized"));
    return signInWithEmailAndPassword(auth, email, password);
  }

  const signup = async (email: string, password: string, firstName: string, lastName: string) => {
    if (!auth) throw new Error("Firebase Auth not initialized");
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const avatarUrl = `https://api.dicebear.com/7.x/thumbs/svg?seed=${user.uid}`;
    await updateProfile(user, { 
        displayName: `${firstName} ${lastName}`,
        photoURL: avatarUrl
    });
    setUser({ ...user, displayName: `${firstName} ${lastName}`, photoURL: avatarUrl } as User);
    return userCredential;
  }

  const loginWithGoogle = async () => {
    if (!auth) throw new Error("Firebase Auth not initialized");
    if (!isGoogleAuthEnabled) throw new Error("Google Auth is not enabled for this domain.");
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    if (result.user && !result.user.photoURL) {
        const avatarUrl = `https://api.dicebear.com/7.x/thumbs/svg?seed=${result.user.uid}`;
        await updateProfile(result.user, { photoURL: avatarUrl });
        setUser({ ...result.user, photoURL: avatarUrl } as User);
    }
    return result;
  };

  const logout = async () => {
    if (!auth) return;
    await signOut(auth);
    router.push('/login');
  };

  const updateUserName = async (firstName: string, lastName: string) => {
    if (!auth?.currentUser || !user) return;
    const newDisplayName = `${firstName} ${lastName}`.trim();
    if (!newDisplayName) {
        toast({ variant: 'destructive', title: 'Erro', description: 'O nome não pode ser vazio.' });
        return;
    }
    await updateProfile(auth.currentUser, { displayName: newDisplayName });
    // Create a new plain object from the user to update state
    setUser({
        ...auth.currentUser,
    } as User);
  };

  const updateUserAvatar = async () => {
    if (!auth?.currentUser) return;
    setIsUpdatingAvatar(true);
    try {
        const newSeed = `${auth.currentUser.uid}-${Date.now()}`;
        const newAvatarUrl = `https://api.dicebear.com/7.x/thumbs/svg?seed=${newSeed}`;
        await updateProfile(auth.currentUser, { photoURL: newAvatarUrl });
        setUser({ ...auth.currentUser, photoURL: newAvatarUrl } as User);
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
    updateUserAvatar,
    updateUserName,
    activeWorkspace,
    workspaces,
    switchWorkspace,
    updateWorkspaceName,
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
