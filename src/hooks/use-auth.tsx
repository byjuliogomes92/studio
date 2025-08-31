
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, Auth, GoogleAuthProvider, signInWithPopup, updateProfile } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { Logo } from '@/components/icons';
import { useToast } from './use-toast';
import type { Workspace, UserProfileType } from '@/lib/types';
import { getWorkspacesForUser, createWorkspace, updateWorkspaceName as updateWorkspaceNameInDb, logActivity } from '@/lib/firestore';
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const publicRoutes = ['/login', '/signup', '/debug-workspace'];

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

  useEffect(() => {
    const authInstance = getAuth(app);
    setAuth(authInstance);

    const unsubscribe = onAuthStateChanged(authInstance, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Workspace logic is now handled in a separate effect to react to user changes
      } else {
        setUser(null);
        setWorkspaces([]);
        setActiveWorkspace(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const manageWorkspaces = async () => {
      if (user) {
        try {
          const userWorkspaces = await getWorkspacesForUser(user.uid);
          setWorkspaces(userWorkspaces);
          if (userWorkspaces.length > 0) {
              const lastWorkspaceId = localStorage.getItem('activeWorkspaceId');
              const found = userWorkspaces.find(w => w.id === lastWorkspaceId);
              setActiveWorkspace(found || userWorkspaces[0]);
          } else {
             // This case will now be handled during signup, but keep as fallback.
             const newWorkspace = await createWorkspace(user.uid, `Workspace de ${user.displayName?.split(' ')[0] || 'Usuário'}`, 'freelancer');
             setWorkspaces([newWorkspace]);
             setActiveWorkspace(newWorkspace);
          }
        } catch (error) {
          console.error("Failed to fetch or create workspace:", error);
          toast({ variant: 'destructive', title: 'Erro Crítico', description: 'Não foi possível carregar seu workspace.' });
        } finally {
           setLoading(false); // Set loading to false after user and workspace logic is complete
        }
      }
    };
    
    manageWorkspaces();
  }, [user, toast]);


  useEffect(() => {
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
    if (!user || !activeWorkspace) return;
    const oldName = activeWorkspace.name;
    await updateWorkspaceNameInDb(workspaceId, newName, user);
    
    // Log the activity
    await logActivity(workspaceId, user.uid, user.displayName, 'WORKSPACE_RENAMED', { oldName, newName });

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

    // Manually update the user state to reflect the new profile immediately
    setUser(produce(user, draft => {
        draft.displayName = `${firstName} ${lastName}`;
        draft.photoURL = avatarUrl;
    }));
    
    // Create workspace based on profile
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
    const user = result.user;
    
    const userWorkspaces = await getWorkspacesForUser(user.uid);
    const isNewUser = userWorkspaces.length === 0;

    if (isNewUser) {
        const workspaceName = `Meu Workspace`;
        const profileType = 'freelancer'; // Default profile type for Google sign-ups
        const newWorkspace = await createWorkspace(user.uid, workspaceName, profileType);
        setWorkspaces([newWorkspace]);
        setActiveWorkspace(newWorkspace);

        // Ensure photoURL exists
        if (!user.photoURL) {
            const avatarUrl = `https://api.dicebear.com/7.x/thumbs/svg?seed=${user.uid}`;
            await updateProfile(user, { photoURL: avatarUrl });
        }
        
        // Manually update the user object in state
        setUser(produce(auth.currentUser, draft => {
            if (draft) {
                draft.photoURL = user.photoURL;
            }
        }));

        // Redirect to account page if name is not properly set
        const hasFullName = user.displayName && user.displayName.includes(' ');
        if (!hasFullName) {
            toast({
                title: 'Complete seu perfil',
                description: 'Por favor, verifique seu nome e sobrenome para continuar.',
            });
            router.push('/account');
        }
    } else {
        setWorkspaces(userWorkspaces);
        const lastWorkspaceId = localStorage.getItem('activeWorkspaceId');
        const found = userWorkspaces.find(w => w.id === lastWorkspaceId);
        setActiveWorkspace(found || userWorkspaces[0]);
        setUser({ ...user }); // Trigger re-render
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
    // Re-create the user object to trigger a state update correctly
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
