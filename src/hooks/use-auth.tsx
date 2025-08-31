
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { getAuth, onAuthStateChanged, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, Auth, GoogleAuthProvider, signInWithPopup, updateProfile } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { Logo } from '@/components/icons';
import { useToast } from './use-toast';
import type { Workspace, UserProfileType } from '@/lib/types';
import { getWorkspacesForUser, createWorkspace, updateWorkspaceName as updateWorkspaceNameInDb, logActivity, isProfileComplete, completeGoogleSignup } from '@/lib/firestore';
import { produce } from 'immer';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isUpdatingAvatar: boolean;
  activeWorkspace: Workspace | null;
  workspaces: Workspace[];
  switchWorkspace: (workspaceId: string) => void;
  updateWorkspaceName: (workspaceId: string, newName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<any>;
  signup: (email: string, password: string, firstName: string, lastName: string, profileType: UserProfileType, companyName?: string) => Promise<any>;
  loginWithGoogle: () => Promise<any>;
  logout: () => void;
  updateUserAvatar: () => Promise<void>;
  updateUserName: (firstName: string, lastName: string) => Promise<void>;
  reloadWorkspaces: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const publicRoutes = ['/login', '/signup', '/debug-workspace', '/welcome'];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
  const [auth, setAuth] = useState<Auth | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);

  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const fetchWorkspaces = useCallback(async (userId: string) => {
    try {
      const userWorkspaces = await getWorkspacesForUser(userId);
      setWorkspaces(userWorkspaces);
      if (userWorkspaces.length > 0) {
        const lastWorkspaceId = localStorage.getItem('activeWorkspaceId');
        const found = userWorkspaces.find(w => w.id === lastWorkspaceId);
        setActiveWorkspace(found || userWorkspaces[0]);
      } else {
        setActiveWorkspace(null); 
      }
    } catch (error) {
      console.error("Failed to fetch workspaces:", error);
      toast({ variant: 'destructive', title: 'Erro Crítico', description: 'Não foi possível carregar seu workspace.' });
    }
  }, [toast]);


  useEffect(() => {
    const authInstance = getAuth(app);
    setAuth(authInstance);

    const unsubscribe = onAuthStateChanged(authInstance, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const profileComplete = await isProfileComplete(currentUser.uid);
        if (profileComplete) {
            await fetchWorkspaces(currentUser.uid);
        }
        // Loading is set to false after checks are done
      } else {
        setUser(null);
        setWorkspaces([]);
        setActiveWorkspace(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchWorkspaces]);

  useEffect(() => {
    if (!loading && !user && !publicRoutes.includes(pathname)) {
      router.push('/login');
    }
     if (!loading && user && !isProfileComplete(user.uid) && pathname !== '/welcome') {
        const checkProfile = async () => {
            const complete = await isProfileComplete(user.uid);
            if (!complete) {
                router.push('/welcome');
            }
        };
        checkProfile();
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
    if (!user || !activeWorkspace) return;
    const oldName = activeWorkspace.name;
    await updateWorkspaceNameInDb(workspaceId, newName, user);
    
    await logActivity(workspaceId, user.uid, user.displayName, 'WORKSPACE_RENAMED', { oldName: oldName, newName });

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

  const signup = async (email: string, password: string, firstName: string, lastName: string, profileType: UserProfileType, companyName?: string) => {
    if (!auth) throw new Error("Firebase Auth not initialized");
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const avatarUrl = `https://api.dicebear.com/7.x/thumbs/svg?seed=${user.uid}`;
    await updateProfile(user, { 
        displayName: `${firstName} ${lastName}`,
        photoURL: avatarUrl
    });

    setUser(produce(user, draft => {
        draft.displayName = `${firstName} ${lastName}`;
        draft.photoURL = avatarUrl;
    }));
    
    let workspaceName: string;
    if (profileType === 'owner' && companyName) {
        workspaceName = companyName;
    } else {
        workspaceName = `Workspace de ${firstName}`;
    }

    const newWorkspace = await createWorkspace(user.uid, workspaceName, profileType);
    setWorkspaces([newWorkspace]);
    setActiveWorkspace(newWorkspace);

    return userCredential;
  }

  const loginWithGoogle = async () => {
    if (!auth) throw new Error("Firebase Auth not initialized");
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
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
    const updatedUser = { ...auth.currentUser };
    setUser(updatedUser as User);
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
    reloadWorkspaces: () => fetchWorkspaces(user!.uid),
  };

  if (loading) {
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
