
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
    if (typeof window !== 'undefined') {
      const authInstance = getAuth(app);
      setAuth(authInstance);
      setIsGoogleAuthEnabled(window.location.hostname === 'cloudpagestudio.vercel.app');

      const unsubscribe = onAuthStateChanged(authInstance, (currentUser) => {
        setUser(currentUser);
        if (!currentUser) {
            // Clear workspace state on logout
            setWorkspaces([]);
            setActiveWorkspace(null);
            setLoading(false);
        }
      });

      return () => unsubscribe();
    } else {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      getWorkspacesForUser(user.uid)
        .then(async (userWorkspaces) => {
          if (userWorkspaces.length > 0) {
            setWorkspaces(userWorkspaces);
            const lastWorkspaceId = localStorage.getItem('activeWorkspaceId');
            const found = userWorkspaces.find(w => w.id === lastWorkspaceId);
            setActiveWorkspace(found || userWorkspaces[0]);
          } else {
            // If user has no workspaces, create a default one
            try {
              const newWorkspace = await createWorkspace(user.uid, user.email || 'Usuário', 'Meu Workspace');
              setWorkspaces([newWorkspace]);
              setActiveWorkspace(newWorkspace);
            } catch (error) {
              console.error("Failed to create default workspace:", error);
              toast({ variant: 'destructive', title: 'Erro Crítico', description: 'Não foi possível criar seu workspace inicial.' });
            }
          }
        })
        .finally(() => setLoading(false));
    } else {
      // No user, not loading.
      if (!publicRoutes.includes(pathname)) {
        setLoading(false);
      }
    }
  }, [user, toast]);

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
      // We don't need a full page reload, but we might want to trigger a data refetch
      // on the component level. For now, we'll just switch context.
      // A full router.refresh() might be too heavy.
      window.location.reload(); // Simple solution for now
    }
  };

  const updateWorkspaceName = async (workspaceId: string, newName: string) => {
    await updateWorkspaceNameInDb(workspaceId, newName);
    
    // Update local state to reflect the change immediately
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
    const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`;
    await updateProfile(user, { 
        displayName: `${firstName} ${lastName}`,
        photoURL: avatarUrl
    });
    setUser({ ...user, displayName: `${firstName} ${lastName}`, photoURL: avatarUrl });
    return userCredential;
  }

  const loginWithGoogle = async () => {
    if (!auth) throw new Error("Firebase Auth not initialized");
    if (!isGoogleAuthEnabled) throw new Error("Google Auth is not enabled for this domain.");
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    if (result.user && !result.user.photoURL) {
        const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${result.user.uid}`;
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
        const newAvatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${newSeed}`;
        await updateProfile(auth.currentUser, { photoURL: newAvatarUrl });
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
    updateUserAvatar,
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
