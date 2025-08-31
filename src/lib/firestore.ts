
import { getDb, storage } from "./firebase";
import { collection, addDoc, getDocs, query, where, doc, getDoc, updateDoc, deleteDoc, serverTimestamp, orderBy, Firestore, setDoc, Timestamp, writeBatch } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import type { Project, CloudPage, Template, UserProgress, OnboardingObjectives, PageView, FormSubmission, Brand, Workspace, WorkspaceMember, WorkspaceMemberRole, MediaAsset, ActivityLog, ActivityLogAction, UserProfileType } from "./types";

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

    // Create the workspace
    const workspaceRef = doc(collection(db, 'workspaces'));
    const newWorkspace: Omit<Workspace, 'id'> = {
        name: workspaceName,
        ownerId: userId,
        profileType: profileType,
        createdAt: serverTimestamp(),
    };
    batch.set(workspaceRef, newWorkspace);

    // Create the owner as a member
    const memberRef = doc(collection(db, 'workspaceMembers'));
    const newMember: Omit<WorkspaceMember, 'id'> = {
        userId,
        email: '', // Email can be fetched from auth user object if needed
        workspaceId: workspaceRef.id,
        role: 'owner',
        createdAt: serverTimestamp(),
    };
    batch.set(memberRef, newMember);
    
    await batch.commit();

    return { ...newWorkspace, id: workspaceRef.id, createdAt: Timestamp.now() } as Workspace;
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

export const updateWorkspaceName = async (workspaceId: string, newName: string, user: { uid: string, displayName?: string | null }): Promise<void> => {
    const db = getDbInstance();
    const workspaceRef = doc(db, 'workspaces', workspaceId);
    const oldName = (await getDoc(workspaceRef)).data()?.name || '';
    await updateDoc(workspaceRef, { name: newName });

    await logActivity(workspaceId, user.uid, user.displayName, 'WORKSPACE_RENAMED', { oldName: oldName, newName });
};


export const getWorkspaceMembers = async (workspaceId: string): Promise<WorkspaceMember[]> => {
    const db = getDbInstance();
    const membersQuery = query(collection(db, 'workspaceMembers'), where('workspaceId', '==', workspaceId));
    const querySnapshot = await getDocs(membersQuery);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WorkspaceMember));
};

export const inviteUserToWorkspace = async (workspaceId: string, email: string, role: WorkspaceMemberRole, inviterName: string | null): Promise<void> => {
    const db = getDbInstance();
    
    // This is a simplified invite. It assumes the user exists.
    // In a real app, you'd want to handle users who don't have an account yet.
    const userQuery = query(collection(db, "users"), where("email", "==", email));
    const userSnap = await getDocs(userQuery);

    if (userSnap.empty) {
        // For simplicity, we are not creating an invite for a non-existent user.
        // A full implementation would create a pending invite.
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
        email: email,
        workspaceId: workspaceId,
        role: role,
        createdAt: serverTimestamp(),
    };

    await addDoc(collection(db, 'workspaceMembers'), newMemberData);

    await logActivity(workspaceId, inviterName || 'System', null, 'MEMBER_INVITED', { invitedEmail: email, role });
};

export const removeUserFromWorkspace = async (workspaceId: string, userId: string, removerUser: any, removedUser: WorkspaceMember): Promise<void> => {
    const db = getDbInstance();
    
    const q = query(collection(db, "workspaceMembers"), where("workspaceId", "==", workspaceId), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
        throw new Error("Membro não encontrado para remover.");
    }

    const memberDoc = querySnapshot.docs[0];
    await deleteDoc(memberDoc.ref);

    await logActivity(workspaceId, removerUser.uid, removerUser.displayName, 'MEMBER_REMOVED', { removedMemberEmail: removedUser.email });
}

export const updateUserRole = async (workspaceId: string, userId: string, role: WorkspaceMemberRole, updaterUser: any, updatedUser: WorkspaceMember): Promise<void> => {
    const db = getDbInstance();
     
    const q = query(collection(db, "workspaceMembers"), where("workspaceId", "==", workspaceId), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
     
    if (querySnapshot.empty) {
        throw new Error("Membro não encontrado para atualizar.");
    }
 
    const memberDoc = querySnapshot.docs[0];
    await updateDoc(memberDoc.ref, { role });

    await logActivity(workspaceId, updaterUser.uid, updaterUser.displayName, 'MEMBER_ROLE_CHANGED', { memberName: updatedUser.email, newRole: role });
}


// Projects

export const addProject = async (projectData: Omit<Project, 'id' | 'createdAt'>): Promise<Project> => {
    const db = getDbInstance();
    const newProjectData = {
        ...projectData,
        createdAt: serverTimestamp(),
    };
    const projectRef = await addDoc(collection(db, "projects"), newProjectData);

    await logActivity(projectData.workspaceId, projectData.userId, '', 'PROJECT_CREATED', { projectName: projectData.name });
    
    return {
        id: projectRef.id,
        ...projectData,
        createdAt: Timestamp.now(), 
    };
};

export const updateProject = async (projectId: string, data: Partial<Project>): Promise<void> => {
    const db = getDbInstance();
    await updateDoc(doc(db, "projects", projectId), data);
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
        return null; // Project doesn't exist or user doesn't have access
    }

    const project = { id: projectDoc.id, ...projectDoc.data() } as Project;
    const pages = await getPagesForProject(projectId, workspaceId);

    return { project, pages };
};


export const deleteProject = async (projectId: string): Promise<void> => {
    const db = getDbInstance();
    const projectDocRef = doc(db, "projects", projectId);
    
    // Delete all draft and published pages within the project
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
};


// Pages

export const addPage = async (pageData: Omit<CloudPage, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const db = getDbInstance();
    const pageId = doc(collection(db, 'dummy_id_generator')).id; // Generate a unique ID

    const pageWithTimestamps = {
      ...pageData,
      id: pageId, // Add the ID to the data itself
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    const draftRef = doc(db, "pages_drafts", pageId);
    const publishedRef = doc(db, "pages_published", pageId);

    // Create both draft and published documents simultaneously
    await Promise.all([
        setDoc(draftRef, pageWithTimestamps),
        setDoc(publishedRef, pageWithTimestamps)
    ]);

    return pageId;
};

export const updatePage = async (pageId: string, pageData: Partial<CloudPage>): Promise<void> => {
    const db = getDbInstance();
    // Only update the draft document
    const draftRef = doc(db, "pages_drafts", pageId);
    await updateDoc(draftRef, {
        ...pageData,
        updatedAt: serverTimestamp(),
    });
};

export const publishPage = async (pageId: string, pageData: Partial<CloudPage>): Promise<void> => {
    const db = getDbInstance();
    const publishedRef = doc(db, "pages_published", pageId);
    // Overwrite the published document with the current draft data
    await setDoc(publishedRef, {
        ...pageData,
        updatedAt: serverTimestamp(), // Record the publish time
    }, { merge: true });
};


export const getPage = async (pageId: string, version: 'drafts' | 'published' = 'drafts'): Promise<CloudPage | null> => {
    const db = getDbInstance();
    const collectionName = version === 'drafts' ? 'pages_drafts' : 'pages_published';
    const docRef = doc(db, collectionName, pageId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    const data = docSnap.data();
    // Ensure timestamps are converted correctly
    const page = {
        id: docSnap.id,
        ...data
    } as CloudPage;
    return page;
};

export const getPagesForProject = async (projectId: string, workspaceId: string): Promise<CloudPage[]> => {
    const db = getDbInstance();
    const q = query(
      collection(db, "pages_drafts"), 
      where("projectId", "==", projectId),
      where("workspaceId", "==", workspaceId),
      orderBy("updatedAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CloudPage));
};


export const deletePage = async (pageId: string): Promise<void> => {
    const db = getDbInstance();
    // Delete both the draft and the published version
    const draftRef = doc(db, "pages_drafts", pageId);
    const publishedRef = doc(db, "pages_published", pageId);
    await Promise.all([deleteDoc(draftRef), deleteDoc(publishedRef)]);
};

export const duplicatePage = async (pageId: string): Promise<CloudPage> => {
    // Always duplicate from the draft version, as it's the most current state
    const originalPage = await getPage(pageId, 'drafts');
    if (!originalPage) {
        throw new Error("Página original não encontrada.");
    }
    
    // Create a copy, removing the old ID and timestamps
    const { id, createdAt, updatedAt, ...pageDataToCopy } = originalPage;

    // Create a new name for the duplicated page
    pageDataToCopy.name = `Cópia de ${originalPage.name}`;
    
    const newPageId = await addPage(pageDataToCopy);
    
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
    // Update both documents
    await Promise.all([
        updateDoc(draftRef, updateData),
        updateDoc(publishedRef, updateData)
    ]);
};


// Templates

export const addTemplate = async (templateData: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const db = getDbInstance();
    const templateWithTimestamps = {
        ...templateData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    };
    const templateRef = await addDoc(collection(db, "templates"), templateWithTimestamps);
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

export const deleteTemplate = async (templateId: string): Promise<void> => {
    const db = getDbInstance();
    await deleteDoc(doc(db, "templates", templateId));
};

// Brands
export const addBrand = async (brandData: Omit<Brand, 'id' | 'createdAt'>): Promise<Brand> => {
    const db = getDbInstance();
    const dataWithTimestamp = { ...brandData, createdAt: serverTimestamp() };
    const docRef = await addDoc(collection(db, 'brands'), dataWithTimestamp);
    return { ...brandData, id: docRef.id, createdAt: Timestamp.now() };
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

export const updateBrand = async (brandId: string, data: Partial<Brand>): Promise<void> => {
    const db = getDbInstance();
    const brandRef = doc(db, 'brands', brandId);
    await updateDoc(brandRef, data);
};

export const deleteBrand = async (brandId: string): Promise<void> => {
    const db = getDbInstance();
    await deleteDoc(doc(db, 'brands', brandId));
};


// Media Library
export const uploadMedia = async (file: File, workspaceId: string, userId: string): Promise<MediaAsset> => {
    const db = getDbInstance();
    
    // Create a unique path for the file in Firebase Storage
    const storagePath = `${workspaceId}/${userId}/${Date.now()}-${file.name}`;
    const storageRef = ref(storage, storagePath);

    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    // Create a metadata document in Firestore
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
    
    // Create a reference to the file to delete
    const fileRef = ref(storage, mediaAsset.storagePath);

    // Delete the file from Storage and the document from Firestore
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
        // Create a new progress document if it doesn't exist
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
    
    // Ensure the document exists before trying to update it
    const currentProgress = await getUserProgress(userId);

    if (currentProgress.objectives[objective]) {
        return currentProgress; // Objective already completed, no need to update
    }

    const updates = {
        [`objectives.${objective}`]: true,
    };
    await updateDoc(docRef, updates);

    // Return the updated document
    return {
        ...currentProgress,
        objectives: {
            ...currentProgress.objectives,
            [objective]: true,
        },
    };
};

// Analytics
export const logPageView = async (pageData: CloudPage, headers: Headers): Promise<void> => {
    const db = getDbInstance();

    const viewData: Omit<PageView, 'id'> = {
        pageId: pageData.id,
        projectId: pageData.projectId,
        workspaceId: pageData.workspaceId,
        timestamp: serverTimestamp(),
        country: headers.get('x-vercel-ip-country') || undefined,
        city: headers.get('x-vercel-ip-city') || undefined,
        userAgent: headers.get('user-agent') || undefined,
    };

    try {
        await addDoc(collection(db, 'pageViews'), viewData);
    } catch(e) {
        console.error("Failed to log page view:", e);
    }
};

export const getPageViews = async (pageId: string): Promise<PageView[]> => {
    const db = getDbInstance();
    const q = query(
        collection(db, 'pageViews'),
        where('pageId', '==', pageId),
        orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PageView));
};


export const logFormSubmission = async (pageId: string, formData: { [key: string]: any }): Promise<void> => {
    const db = getDbInstance();

    const submissionData: Omit<FormSubmission, 'id'> = {
        pageId,
        formData,
        timestamp: serverTimestamp(),
    };

    try {
        await addDoc(collection(db, 'formSubmissions'), submissionData);
    } catch (e) {
        console.error("Failed to log form submission:", e);
        // We don't re-throw, as this is a background/backup task.
    }
};

export const getFormSubmissions = async (pageId: string): Promise<FormSubmission[]> => {
    const db = getDbInstance();
    const q = query(
        collection(db, 'formSubmissions'),
        where('pageId', '==', pageId),
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
    action: ActivityLogAction, 
    details: { [key: string]: any }
): Promise<void> => {
    const db = getDbInstance();
    
    // In a real app, you might get the user's avatar from their profile
    const userAvatarUrl = `https://api.dicebear.com/8.x/thumbs/svg?seed=${userId}`;

    const logEntry: Omit<ActivityLog, 'id'> = {
        workspaceId,
        userId,
        userName: userName || 'Usuário Anônimo',
        userAvatarUrl,
        action,
        details,
        timestamp: serverTimestamp(),
    };

    try {
        await addDoc(collection(db, 'activityLogs'), logEntry);
    } catch (error) {
        console.error("Failed to log activity:", error);
        // Don't block the main action if logging fails
    }
};

export const getActivityLogsForWorkspace = async (workspaceId: string): Promise<ActivityLog[]> => {
    const db = getDbInstance();
    const q = query(
        collection(db, 'activityLogs'),
        where('workspaceId', '==', workspaceId),
        orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ActivityLog));
}
