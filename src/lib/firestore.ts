

import { getDb, storage } from "./firebase";
import { collection, addDoc, getDocs, query, where, doc, getDoc, updateDoc, deleteDoc, serverTimestamp, orderBy, Firestore, setDoc, Timestamp, writeBatch, limit } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import type { Project, CloudPage, Template, UserProgress, OnboardingObjectives, PageView, FormSubmission, Brand, Workspace, WorkspaceMember, WorkspaceMemberRole, MediaAsset, ActivityLog, ActivityLogAction, UserProfileType, FtpConfig, BitlyConfig } from "./types";
import { updateProfile, type User } from "firebase/auth";
import { encryptPassword, decryptPassword } from "./crypto";


const getDbInstance = (): Firestore => {
    const db = getDb();
    if (!db) {
        throw new Error("Firestore is not initialized. This function should only be called on the client-side.");
    }
    return db;
};


// Workspaces
export const createWorkspace = async (userId: string, workspaceName: string, profileType: UserProfileType): Promise<Workspace> => {
    const db = getDbInstance();
    const batch = writeBatch(db);

    const workspaceRef = doc(collection(db, 'workspaces'));
    const newWorkspace: Omit<Workspace, 'id'> = {
        name: workspaceName,
        ownerId: userId,
        profileType: profileType,
        createdAt: serverTimestamp(),
    };
    batch.set(workspaceRef, newWorkspace);

    const memberRef = doc(collection(db, 'workspaceMembers'));
    const newMember: Omit<WorkspaceMember, 'id'> = {
        userId,
        workspaceId: workspaceRef.id,
        role: 'owner',
        createdAt: serverTimestamp(),
    };
    batch.set(memberRef, newMember);
    
    await batch.commit();

    return { ...newWorkspace, id: workspaceRef.id, createdAt: Timestamp.now() } as Workspace;
};

// Check if user has a workspace, which implies their profile is complete
export const isProfileComplete = async (userId: string): Promise<boolean> => {
    const db = getDbInstance();
    const membersQuery = query(collection(db, 'workspaceMembers'), where('userId', '==', userId));
    const memberSnapshots = await getDocs(membersQuery);
    return !memberSnapshots.empty;
};


// Function to finalize signup for Google users
interface CompleteSignupParams {
    user: User;
    firstName: string;
    lastName: string;
    profileType: UserProfileType;
    companyName?: string;
}
export const completeGoogleSignup = async ({ user, firstName, lastName, profileType, companyName }: CompleteSignupParams) => {
    const newDisplayName = `${firstName} ${lastName}`.trim();
    if (user.displayName !== newDisplayName) {
        await updateProfile(user, { displayName: newDisplayName });
    }
    
    let workspaceName: string;
    if (profileType === 'owner' && companyName) {
        workspaceName = companyName;
    } else {
        workspaceName = `Workspace de ${firstName}`;
    }

    await createWorkspace(user.uid, workspaceName, profileType);
};


export const getWorkspacesForUser = async (userId: string): Promise<Workspace[]> => {
    const db = getDbInstance();
    const membersQuery = query(collection(db, 'workspaceMembers'), where('userId', '==', userId));
    const memberSnapshots = await getDocs(membersQuery);
    
    if (memberSnapshots.empty) return [];

    const workspaceIds = memberSnapshots.docs.map(doc => doc.data().workspaceId);
    
    if (workspaceIds.length === 0) return [];

    const workspacesQuery = query(collection(db, 'workspaces'), where('__name__', 'in', workspaceIds));
    const workspaceSnapshots = await getDocs(workspacesQuery);
    
    return workspaceSnapshots.docs.map(doc => ({ id: doc.id, ...doc.data() } as Workspace));
};

export const updateWorkspaceName = async (workspaceId: string, newName: string, user: User): Promise<void> => {
    const db = getDbInstance();
    const workspaceRef = doc(db, 'workspaces', workspaceId);
    const oldName = (await getDoc(workspaceRef)).data()?.name || '';
    await updateDoc(workspaceRef, { name: newName });

    await logActivity(workspaceId, user.uid, user.displayName, user.photoURL, 'WORKSPACE_RENAMED', { oldName: oldName, newName });
};


export const getWorkspaceMembers = async (workspaceId: string): Promise<WorkspaceMember[]> => {
    const db = getDbInstance();
    const membersQuery = query(collection(db, 'workspaceMembers'), where('workspaceId', '==', workspaceId));
    const querySnapshot = await getDocs(membersQuery);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WorkspaceMember));
};

export const inviteUserToWorkspace = async (workspaceId: string, email: string, role: WorkspaceMemberRole, inviterUser: User): Promise<void> => {
    const db = getDbInstance();
    
    // This is a simplified approach. In a real app, you'd use a callable function to find the user by email.
    // Firestore security rules would prevent this client-side query across the 'users' collection.
    // For this prototype, we assume a 'users' collection where doc ID is UID and it has an 'email' field.
    const userQuery = query(collection(db, "users"), where("email", "==", email), limit(1));
    const userSnap = await getDocs(userQuery);

    if (userSnap.empty) {
        throw new Error("Usuário não encontrado. Peça para que ele se cadastre primeiro.");
    }
    const userDoc = userSnap.docs[0];
    const userId = userDoc.id;

    // Check if user is already a member
    const qMembers = query(collection(db, "workspaceMembers"), where("workspaceId", "==", workspaceId), where("userId", "==", userId));
    const memberSnap = await getDocs(qMembers);
    if (!memberSnap.empty) {
        throw new Error("Este usuário já é membro do workspace.");
    }
    
    const newMemberData: Omit<WorkspaceMember, 'id'> = {
        userId: userId,
        email: email, // Store email for display purposes
        workspaceId: workspaceId,
        role: role,
        createdAt: serverTimestamp(),
    };

    const newMemberRef = await addDoc(collection(db, 'workspaceMembers'), newMemberData);

    await logActivity(workspaceId, inviterUser.uid, inviterUser.displayName, inviterUser.photoURL, 'MEMBER_INVITED', { invitedEmail: email, role });
};

export const removeUserFromWorkspace = async (workspaceId: string, userId: string, removerUser: User, removedUser: WorkspaceMember): Promise<void> => {
    const db = getDbInstance();
    
    const q = query(collection(db, "workspaceMembers"), where("workspaceId", "==", workspaceId), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
        throw new Error("Membro não encontrado para remover.");
    }

    const memberDoc = querySnapshot.docs[0];
    await deleteDoc(memberDoc.ref);

    await logActivity(workspaceId, removerUser.uid, removerUser.displayName, removerUser.photoURL, 'MEMBER_REMOVED', { removedMemberEmail: removedUser.email });
}

export const updateUserRole = async (workspaceId: string, userId: string, role: WorkspaceMemberRole, updaterUser: User, updatedUser: WorkspaceMember): Promise<void> => {
    const db = getDbInstance();
     
    const q = query(collection(db, "workspaceMembers"), where("workspaceId", "==", workspaceId), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
     
    if (querySnapshot.empty) {
        throw new Error("Membro não encontrado para atualizar.");
    }
 
    const memberDoc = querySnapshot.docs[0];
    await updateDoc(memberDoc.ref, { role });

    await logActivity(workspaceId, updaterUser.uid, updaterUser.displayName, updaterUser.photoURL, 'MEMBER_ROLE_CHANGED', { memberName: updatedUser.email, newRole: role });
}


// Projects

export const addProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'userId'>, user: User): Promise<Project> => {
    const db = getDbInstance();
    const newProjectData = {
        ...projectData,
        createdAt: serverTimestamp(),
    };
    const projectRef = await addDoc(collection(db, "projects"), newProjectData);

    await logActivity(projectData.workspaceId, user.uid, user.displayName, user.photoURL, 'PROJECT_CREATED', { projectName: projectData.name });
    
    return {
        id: projectRef.id,
        ...projectData,
        createdAt: Timestamp.now(), 
        userId: user.uid
    };
};

export const updateProject = async (projectId: string, data: Partial<Project>, user: User): Promise<void> => {
    const db = getDbInstance();
    const projectRef = doc(db, "projects", projectId);
    await updateDoc(projectRef, data);

    const projectSnap = await getDoc(projectRef);
    const projectData = projectSnap.data();
    if(projectData) {
        await logActivity(projectData.workspaceId, user.uid, user.displayName, user.photoURL, 'PROJECT_UPDATED', { projectName: data.name || projectData.name });
    }
}

export const getProjectsForUser = async (workspaceId: string): Promise<{ projects: Project[], pages: CloudPage[] }> => {
    if (!workspaceId) {
        return { projects: [], pages: [] };
    }
    const db = getDbInstance();
    const projectsQuery = query(collection(db, "projects"), where("workspaceId", "==", workspaceId));
    const pagesQuery = query(collection(db, "pages_drafts"), where("workspaceId", "==", workspaceId));

    const [projectSnapshot, pageSnapshot] = await Promise.all([
        getDocs(projectsQuery),
        getDocs(pagesQuery)
    ]);
    
    const projects = projectSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
    const pages = pageSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CloudPage));

    return { projects, pages };
};

export const getProjectWithPages = async (projectId: string, workspaceId: string): Promise<{ project: Project; pages: CloudPage[] } | null> => {
    const db = getDbInstance();
    const projectRef = doc(db, 'projects', projectId);
    const projectDoc = await getDoc(projectRef);

    if (!projectDoc.exists() || projectDoc.data().workspaceId !== workspaceId) {
        return null;
    }

    const project = { id: projectDoc.id, ...projectDoc.data() } as Project;
    const pages = await getPagesForProject(projectId, workspaceId);

    return { project, pages };
};


export const deleteProject = async (projectId: string, user: User): Promise<void> => {
    const db = getDbInstance();
    const projectDocRef = doc(db, "projects", projectId);
    const projectSnap = await getDoc(projectDocRef);
    const projectData = projectSnap.data();

    if (!projectData) return;
    
    const draftPagesQuery = query(collection(db, "pages_drafts"), where("projectId", "==", projectId));
    const publishedPagesQuery = query(collection(db, "pages_published"), where("projectId", "==", projectId));

    const [draftsSnapshot, publishedSnapshot] = await Promise.all([
        getDocs(draftPagesQuery),
        getDocs(publishedPagesQuery)
    ]);
    
    const batch = writeBatch(db);
    draftsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
    publishedSnapshot.docs.forEach(doc => batch.delete(doc.ref));
    batch.delete(projectDocRef);

    await batch.commit();

    await logActivity(projectData.workspaceId, user.uid, user.displayName, user.photoURL, 'PROJECT_DELETED', { projectName: projectData.name });
};


// Pages

const generateSlug = (name: string) => {
  const slugBase = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
  return `${slugBase}-${Date.now()}`;
};

export const addPage = async (pageData: Omit<CloudPage, 'id' | 'createdAt' | 'updatedAt' | 'slug'>, user: User): Promise<string> => {
    const db = getDbInstance();
    const pageId = doc(collection(db, 'dummy_id_generator')).id; 

    const pageWithTimestamps = {
      ...pageData,
      id: pageId,
      slug: generateSlug(pageData.name),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    const draftRef = doc(db, "pages_drafts", pageId);
    const publishedRef = doc(db, "pages_published", pageId);

    await Promise.all([
        setDoc(draftRef, pageWithTimestamps),
        setDoc(publishedRef, pageWithTimestamps)
    ]);
    
    await logActivity(pageData.workspaceId, user.uid, user.displayName, user.photoURL, 'PAGE_CREATED', { pageName: pageData.name });

    return pageId;
};

export const updatePage = async (pageId: string, pageData: Partial<CloudPage>): Promise<void> => {
    const db = getDbInstance();
    const draftRef = doc(db, "pages_drafts", pageId);
    await updateDoc(draftRef, {
        ...pageData,
        updatedAt: serverTimestamp(),
    });
};

export const publishPage = async (pageId: string, pageData: Partial<CloudPage>, user: User): Promise<void> => {
    const db = getDbInstance();
    const publishedRef = doc(db, "pages_published", pageId);
    await setDoc(publishedRef, {
        ...pageData,
        status: 'published',
        updatedAt: serverTimestamp(), 
    }, { merge: true });
    
    if (pageData.workspaceId) {
        await logActivity(pageData.workspaceId, user.uid, user.displayName, user.photoURL, 'PAGE_PUBLISHED', { pageName: pageData.name });
    }
};


export const getPage = async (pageId: string, version: 'drafts' | 'published' = 'drafts'): Promise<CloudPage | null> => {
    const db = getDbInstance();
    const collectionName = version === 'drafts' ? 'pages_drafts' : 'pages_published';
    const docRef = doc(db, collectionName, pageId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    const data = docSnap.data();
    const page = {
        id: docSnap.id,
        ...data
    } as CloudPage;
    return page;
};

export const getPageBySlug = async (slug: string, version: 'drafts' | 'published' = 'drafts'): Promise<CloudPage | null> => {
    const db = getDbInstance();
    const collectionName = version === 'drafts' ? 'pages_drafts' : 'pages_published';
    const q = query(collection(db, collectionName), where('slug', '==', slug), limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return null;
    }
    
    const docSnap = querySnapshot.docs[0];
    return { id: docSnap.id, ...docSnap.data() } as CloudPage;
};


export const getPagesForProject = async (projectId: string, workspaceId: string): Promise<CloudPage[]> => {
    const db = getDbInstance();
    const draftsQuery = query(
      collection(db, "pages_drafts"), 
      where("projectId", "==", projectId),
      where("workspaceId", "==", workspaceId)
    );
    const publishedQuery = query(
      collection(db, "pages_published"), 
      where("projectId", "==", projectId),
      where("workspaceId", "==", workspaceId)
    );
  
    const [draftsSnapshot, publishedSnapshot] = await Promise.all([
      getDocs(draftsQuery),
      getDocs(publishedQuery)
    ]);
  
    const publishedPagesMap = new Map<string, CloudPage>();
    publishedSnapshot.docs.forEach(doc => {
      publishedPagesMap.set(doc.id, { id: doc.id, ...doc.data() } as CloudPage);
    });
  
    const pagesWithStatus = draftsSnapshot.docs.map(doc => {
      const draftPage = { id: doc.id, ...doc.data() } as CloudPage;
      const publishedPage = publishedPagesMap.get(doc.id);
  
      let status: 'published' | 'draft' = 'draft';
      if (publishedPage && publishedPage.status === 'published') {
          status = 'published';
      }
      
      return {
        ...draftPage,
        status: status
      };
    });
  
    // Sort pages by updatedAt date in descending order
    return pagesWithStatus.sort((a, b) => (b.updatedAt?.toMillis() || 0) - (a.updatedAt?.toMillis() || 0));
};


export const deletePage = async (pageId: string, user: User): Promise<void> => {
    const db = getDbInstance();
    const draftRef = doc(db, "pages_drafts", pageId);
    
    // Get page data before deleting to log it
    const pageSnap = await getDoc(draftRef);
    const pageData = pageSnap.data();

    const publishedRef = doc(db, "pages_published", pageId);
    await Promise.all([deleteDoc(draftRef), deleteDoc(publishedRef)]);
    
    if(pageData && pageData.workspaceId) {
       await logActivity(pageData.workspaceId, user.uid, user.displayName, user.photoURL, 'PAGE_DELETED', { pageName: pageData.name });
    }
};

export const duplicatePage = async (pageId: string, user: User): Promise<CloudPage> => {
    const originalPage = await getPage(pageId, 'drafts');
    if (!originalPage) {
        throw new Error("Página original não encontrada.");
    }
    
    const { id, createdAt, updatedAt, slug, ...pageDataToCopy } = originalPage;

    pageDataToCopy.name = `Cópia de ${originalPage.name}`;
    
    const newPageId = await addPage(pageDataToCopy, user);
    
    const newPage = await getPage(newPageId, 'drafts');
    if (!newPage) {
        throw new Error("Falha ao criar a duplicata da página.");
    }

    return newPage;
};

export const movePageToProject = async (pageId: string, newProjectId: string): Promise<void> => {
    const db = getDbInstance();
    const draftRef = doc(db, 'pages_drafts', pageId);
    const publishedRef = doc(db, 'pages_published', pageId);
    const updateData = {
        projectId: newProjectId,
        updatedAt: serverTimestamp()
    };
    await Promise.all([
        updateDoc(draftRef, updateData),
        updateDoc(publishedRef, updateData)
    ]);
};


// Templates

export const addTemplate = async (templateData: Omit<Template, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>, user: User): Promise<string> => {
    const db = getDbInstance();
    const templateWithTimestamps = {
        ...templateData,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    };
    const templateRef = await addDoc(collection(db, "templates"), templateWithTimestamps);
    await logActivity(templateData.workspaceId, user.uid, user.displayName, user.photoURL, 'TEMPLATE_CREATED', { templateName: templateData.name });
    return templateRef.id;
};


export const getTemplates = async (workspaceId: string): Promise<Template[]> => {
    if (!workspaceId) return [];
    const db = getDbInstance();
    const templatesQuery = query(collection(db, "templates"), where("workspaceId", "==", workspaceId), orderBy("name", "asc"));
    const querySnapshot = await getDocs(templatesQuery);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Template));
};

export const getTemplate = async (templateId: string): Promise<Template | null> => {
    const db = getDbInstance();
    const docRef = doc(db, "templates", templateId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Template : null;
};

export const deleteTemplate = async (templateId: string, user: User): Promise<void> => {
    const db = getDbInstance();
    const templateRef = doc(db, 'templates', templateId);
    const templateSnap = await getDoc(templateRef);
    const templateData = templateSnap.data();

    if (templateData) {
        await deleteDoc(templateRef);
        await logActivity(templateData.workspaceId, user.uid, user.displayName, user.photoURL, 'TEMPLATE_DELETED', { templateName: templateData.name });
    }
};

// Brands
export const addBrand = async (brandData: Omit<Brand, 'id' | 'createdAt'>, user: User): Promise<Brand> => {
    const db = getDbInstance();
    
    // Encrypt password if it exists
    if (brandData.integrations?.ftp?.password) {
        brandData.integrations.ftp.encryptedPassword = encryptPassword(brandData.integrations.ftp.password);
        delete brandData.integrations.ftp.password; // Remove plain text password
    }
    if (brandData.integrations?.bitly?.accessToken) {
        brandData.integrations.bitly.encryptedAccessToken = encryptPassword(brandData.integrations.bitly.accessToken);
        delete brandData.integrations.bitly.accessToken;
    }

    const dataWithTimestamp = { ...brandData, createdAt: serverTimestamp() };
    const docRef = await addDoc(collection(db, 'brands'), dataWithTimestamp);
    
    await logActivity(brandData.workspaceId, user.uid, user.displayName, user.photoURL, 'BRAND_CREATED', { brandName: brandData.name });

    return { ...brandData, id: docRef.id, createdAt: Timestamp.now() } as Brand;
};

export const getBrandsForUser = async (workspaceId: string): Promise<Brand[]> => {
    if (!workspaceId) return [];
    const db = getDbInstance();
    const q = query(collection(db, 'brands'), where('workspaceId', '==', workspaceId), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Brand));
};

export const getBrand = async (brandId: string): Promise<Brand | null> => {
    const db = getDbInstance();
    const docRef = doc(db, "brands", brandId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Brand : null;
};

export const updateBrand = async (brandId: string, data: Partial<Brand>, user: User): Promise<void> => {
    const db = getDbInstance();
    const brandRef = doc(db, 'brands', brandId);
    
    // Encrypt secrets if they are being updated
    if (data.integrations?.ftp?.password) {
        data.integrations.ftp.encryptedPassword = encryptPassword(data.integrations.ftp.password);
        delete data.integrations.ftp.password;
    }
    if (data.integrations?.bitly?.accessToken) {
        data.integrations.bitly.encryptedAccessToken = encryptPassword(data.integrations.bitly.accessToken);
        delete data.integrations.bitly.accessToken;
    }

    await updateDoc(brandRef, data);
    const brandSnap = await getDoc(brandRef);
    const brandData = brandSnap.data();
    if(brandData) {
        await logActivity(brandData.workspaceId, user.uid, user.displayName, user.photoURL, 'BRAND_UPDATED', { brandName: brandData.name });
    }
};

export const deleteBrand = async (brandId: string, user: User): Promise<void> => {
    const db = getDbInstance();
    const brandRef = doc(db, 'brands', brandId);
    const brandSnap = await getDoc(brandRef);
    const brandData = brandSnap.data();

    if(brandData) {
        await deleteDoc(brandRef);
        await logActivity(brandData.workspaceId, user.uid, user.displayName, user.photoURL, 'BRAND_DELETED', { brandName: brandData.name });
    }
};


// Media Library
export const uploadMedia = async (file: File, workspaceId: string, userId: string): Promise<MediaAsset> => {
    const db = getDbInstance();
    
    const storagePath = `${workspaceId}/${userId}/${Date.now()}-${file.name}`;
    const storageRef = ref(storage, storagePath);

    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    const mediaData: Omit<MediaAsset, 'id'> = {
        workspaceId,
        userId,
        fileName: file.name,
        url: downloadURL,
        storagePath,
        contentType: file.type,
        size: file.size,
        createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'media'), mediaData);

    return { ...mediaData, id: docRef.id, createdAt: Timestamp.now() };
}

export const getMediaForWorkspace = async (workspaceId: string): Promise<MediaAsset[]> => {
    if (!workspaceId) return [];
    const db = getDbInstance();
    const q = query(collection(db, 'media'), where('workspaceId', '==', workspaceId), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MediaAsset));
}

export const deleteMedia = async (mediaAsset: MediaAsset): Promise<void> => {
    const db = getDbInstance();
    
    const fileRef = ref(storage, mediaAsset.storagePath);

    await deleteObject(fileRef);
    await deleteDoc(doc(db, 'media', mediaAsset.id));
}


// User Progress (Onboarding)
export const getUserProgress = async (userId: string): Promise<UserProgress> => {
    const db = getDbInstance();
    const docRef = doc(db, "userProgress", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as UserProgress;
    } else {
        const newProgress: UserProgress = {
            id: userId,
            userId,
            objectives: {
                createdFirstProject: false,
                createdFirstPage: false,
                addedFirstForm: false,
                createdFirstTemplate: false,
                addedFirstAmpscript: false,
            },
        };
        await setDoc(docRef, newProgress);
        return newProgress;
    }
};

export const updateUserProgress = async (userId: string, objective: keyof OnboardingObjectives): Promise<UserProgress> => {
    const db = getDbInstance();
    const docRef = doc(db, "userProgress", userId);
    
    const currentProgress = await getUserProgress(userId);

    if (currentProgress.objectives[objective]) {
        return currentProgress; 
    }

    const updates = {
        [`objectives.${objective}`]: true,
    };
    await updateDoc(docRef, updates);

    return {
        ...currentProgress,
        objectives: {
            ...currentProgress.objectives,
            [objective]: true,
        },
    };
};

// Analytics
const parseUserAgent = (ua: string): { os: string, browser: string, deviceType: string } => {
    if (!ua) return { os: 'N/A', browser: 'N/A', deviceType: 'N/A' };

    let os = 'N/A', browser = 'N/A', deviceType = 'Desktop';

    // Device Type
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
        deviceType = "Tablet";
    } else if (/Mobi|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
        deviceType = 'Mobile';
    }

    // OS
    if (/windows phone/i.test(ua)) os = "Windows Phone";
    else if (/windows nt 10/i.test(ua)) os = "Windows";
    else if (/windows nt 6.3/i.test(ua)) os = "Windows";
    else if (/windows nt 6.2/i.test(ua)) os = "Windows";
    else if (/windows nt 6.1/i.test(ua)) os = "Windows";
    else if (/windows nt 6.0/i.test(ua)) os = "Windows";
    else if (/windows nt 5.1/i.test(ua)) os = "Windows";
    else if (/windows nt 5.0/i.test(ua)) os = "Windows";
    else if (/macintosh|mac os x/i.test(ua)) os = "macOS";
    else if (/android/i.test(ua)) os = "Android";
    else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";
    else if (/linux/i.test(ua)) os = "Linux";
    else if (/cros/i.test(ua)) os = "Chrome OS";


    // Browser
    if (/edg/i.test(ua)) browser = "Edge";
    else if (/chrome|crios/i.test(ua) && !/edg/i.test(ua)) browser = "Chrome";
    else if (/firefox|fxios/i.test(ua)) browser = "Firefox";
    else if (/safari/i.test(ua) && !/chrome|crios|edg/i.test(ua)) browser = "Safari";
    else if (/msie/i.test(ua) || /trident/i.test(ua)) browser = "Internet Explorer";
    else if (/opr/i.test(ua)) browser = "Opera";


    return { os, browser, deviceType };
};


export const logPageView = async (pageData: CloudPage, headers: Headers): Promise<void> => {
    const db = getDbInstance();
    const userAgent = headers.get('user-agent') || '';
    const { os, browser, deviceType } = parseUserAgent(userAgent);


    const viewData: Omit<PageView, 'id'> = {
        pageId: pageData.id,
        projectId: pageData.projectId,
        workspaceId: pageData.workspaceId,
        timestamp: serverTimestamp(),
        country: headers.get('x-vercel-ip-country') || undefined,
        city: headers.get('x-vercel-ip-city') || undefined,
        userAgent: userAgent,
        referrer: headers.get('referer') || undefined,
        os,
        browser,
        deviceType,
    };

    try {
        await addDoc(collection(db, 'pageViews'), viewData);
    } catch(e) {
        console.error("Failed to log page view:", e);
    }
};

export const getPageViews = async (pageId: string, workspaceId: string): Promise<PageView[]> => {
    const db = getDbInstance();
    const q = query(
        collection(db, 'pageViews'),
        where('pageId', '==', pageId),
        where('workspaceId', '==', workspaceId),
        orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PageView));
};


export const logFormSubmission = async (pageId: string, formData: { [key: string]: any }): Promise<void> => {
    const db = getDbInstance();
    
    // Get workspaceId from the page document to ensure it's logged correctly
    const pageRef = doc(db, 'pages_published', pageId);
    const pageSnap = await getDoc(pageRef);
    const workspaceId = pageSnap.exists() ? pageSnap.data().workspaceId : null;

    if (!workspaceId) {
        console.error(`Could not log submission: workspaceId not found for page ${pageId}`);
        return;
    }

    const submissionData: Omit<FormSubmission, 'id'> = {
        pageId,
        workspaceId,
        formData,
        timestamp: serverTimestamp(),
    };

    try {
        await addDoc(collection(db, 'formSubmissions'), submissionData);
    } catch (e) {
        console.error("Failed to log form submission:", e);
    }
};

export const getFormSubmissions = async (pageId: string, workspaceId: string): Promise<FormSubmission[]> => {
    const db = getDbInstance();
    const q = query(
        collection(db, 'formSubmissions'),
        where('pageId', '==', pageId),
        where('workspaceId', '==', workspaceId),
        orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FormSubmission));
};


// Activity Logs
export const logActivity = async (
    workspaceId: string, 
    userId: string, 
    userName: string | null,
    userAvatarUrl: string | null,
    action: ActivityLogAction, 
    details: { [key: string]: any }
): Promise<void> => {
    const db = getDbInstance();
    
    const finalAvatarUrl = userAvatarUrl || `https://api.dicebear.com/8.x/thumbs/svg?seed=${userId}`;

    const logEntry: Omit<ActivityLog, 'id'> = {
        workspaceId,
        userId,
        userName: userName || 'Usuário Anônimo',
        userAvatarUrl: finalAvatarUrl,
        action,
        details,
        timestamp: serverTimestamp(),
    };

    try {
        await addDoc(collection(db, 'activityLogs'), logEntry);
    } catch (error) {
        console.error("Failed to log activity:", error);
    }
};

export const getActivityLogsForWorkspace = async (workspaceId: string): Promise<ActivityLog[]> => {
    const db = getDbInstance();
    const q = query(
        collection(db, 'activityLogs'),
        where('workspaceId', '==', workspaceId),
        orderBy('timestamp', 'desc'),
        limit(50) // Limit to the last 50 activities for performance
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ActivityLog));
}
