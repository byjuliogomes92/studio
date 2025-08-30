
import { getDb } from "./firebase";
import { collection, addDoc, getDocs, query, where, doc, getDoc, updateDoc, deleteDoc, serverTimestamp, orderBy, Firestore, setDoc, Timestamp, writeBatch } from "firebase/firestore";
import type { Project, CloudPage, Template, UserProgress, OnboardingObjectives, PageView, FormSubmission, Brand, Workspace, WorkspaceMember } from "./types";

const getDbInstance = (): Firestore => {
    const db = getDb();
    if (!db) {
        throw new Error("Firestore is not initialized. This function should only be called on the client-side.");
    }
    return db;
};


// Workspaces
export const createWorkspace = async (userId: string, userEmail: string, workspaceName: string): Promise<Workspace> => {
    const db = getDbInstance();
    const batch = writeBatch(db);

    // Create the workspace
    const workspaceRef = doc(collection(db, 'workspaces'));
    const newWorkspace: Omit<Workspace, 'id'> = {
        name: workspaceName,
        ownerId: userId,
        createdAt: serverTimestamp(),
    };
    batch.set(workspaceRef, newWorkspace);

    // Create the owner as a member
    const memberRef = doc(db, 'workspaceMembers', `${userId}_${workspaceRef.id}`);
    const newMember: Omit<WorkspaceMember, 'id'> = {
        userId,
        email: userEmail,
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
    
    const workspacesQuery = query(collection(db, 'workspaces'), where('__name__', 'in', workspaceIds));
    const workspaceSnapshots = await getDocs(workspacesQuery);
    
    return workspaceSnapshots.docs.map(doc => ({ id: doc.id, ...doc.data() } as Workspace));
};


// Projects

const addProject = async (projectData: Omit<Project, 'id' | 'createdAt'>): Promise<Project> => {
    const db = getDbInstance();
    const newProjectData = {
        ...projectData,
        createdAt: serverTimestamp(),
    };
    const projectRef = await addDoc(collection(db, "projects"), newProjectData);
    
    return {
        id: projectRef.id,
        ...projectData,
        createdAt: Timestamp.now(), 
    };
};

const updateProject = async (projectId: string, data: Partial<Project>): Promise<void> => {
    const db = getDbInstance();
    await updateDoc(doc(db, "projects", projectId), data);
}

const getProjectsForUser = async (workspaceId: string): Promise<{ projects: Project[], pages: CloudPage[] }> => {
    const db = getDbInstance();
    const projectsQuery = query(collection(db, "projects"), where("workspaceId", "==", workspaceId));
    // Fetch from drafts to get the most recent page data for UI purposes (like page count)
    const pagesQuery = query(collection(db, "pages_drafts"), where("workspaceId", "==", workspaceId));

    const projectSnapshot = await getDocs(projectsQuery);
    const projects = projectSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));

    const pageSnapshot = await getDocs(pagesQuery);
    const pages = pageSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CloudPage));

    return { projects, pages };
};

const getProject = async (projectId: string): Promise<Project | null> => {
    const db = getDbInstance();
    const docRef = doc(db, "projects", projectId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Project : null;
};


const deleteProject = async (projectId: string): Promise<void> => {
    const db = getDbInstance();
    const projectDocRef = doc(db, "projects", projectId);
    
    // Delete all draft and published pages within the project
    const draftPagesQuery = query(collection(db, "pages_drafts"), where("projectId", "==", projectId));
    const publishedPagesQuery = query(collection(db, "pages_published"), where("projectId", "==", projectId));

    const [draftsSnapshot, publishedSnapshot] = await Promise.all([
        getDocs(draftPagesQuery),
        getDocs(publishedPagesQuery)
    ]);
    
    const deletePromises = [
        ...draftsSnapshot.docs.map(pageDoc => deleteDoc(pageDoc.ref)),
        ...publishedSnapshot.docs.map(pageDoc => deleteDoc(pageDoc.ref))
    ];
    await Promise.all(deletePromises);

    // Now delete the project itself
    await deleteDoc(projectDocRef);
};


// Pages

const addPage = async (pageData: Omit<CloudPage, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
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

const updatePage = async (pageId: string, pageData: Partial<CloudPage>): Promise<void> => {
    const db = getDbInstance();
    // Only update the draft document
    const draftRef = doc(db, "pages_drafts", pageId);
    await updateDoc(draftRef, {
        ...pageData,
        updatedAt: serverTimestamp(),
    });
};

const publishPage = async (pageId: string, pageData: Partial<CloudPage>): Promise<void> => {
    const db = getDbInstance();
    const publishedRef = doc(db, "pages_published", pageId);
    // Overwrite the published document with the current draft data
    await setDoc(publishedRef, {
        ...pageData,
        updatedAt: serverTimestamp(), // Record the publish time
    }, { merge: true });
};


const getPage = async (pageId: string, version: 'drafts' | 'published' = 'drafts'): Promise<CloudPage | null> => {
    const db = getDbInstance();
    const collectionName = version === 'drafts' ? 'pages_drafts' : 'pages_published';
    const docRef = doc(db, collectionName, pageId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    const data = docSnap.data();
    // Ensure timestamps are converted correctly
    const page = {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
    } as CloudPage;
    return page;
};

const getPagesForProject = async (projectId: string): Promise<CloudPage[]> => {
    const db = getDbInstance();
    const q = query(collection(db, "pages_drafts"), where("projectId", "==", projectId), orderBy("updatedAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CloudPage));
};

const getProjectWithPages = async (projectId: string, workspaceId: string): Promise<{ project: Project; pages: CloudPage[] } | null> => {
    const db = getDbInstance();
    const projectRef = doc(db, 'projects', projectId);
    const projectDoc = await getDoc(projectRef);

    if (!projectDoc.exists() || projectDoc.data().workspaceId !== workspaceId) {
        return null; // Project doesn't exist or user doesn't have access
    }

    const project = { id: projectDoc.id, ...projectDoc.data() } as Project;

    // Fetch from drafts as this represents the user's working set
    const pagesQuery = query(
        collection(db, 'pages_drafts'),
        where('projectId', '==', projectId),
        where('workspaceId', '==', workspaceId),
        orderBy('updatedAt', 'desc')
    );
    
    const pagesSnapshot = await getDocs(pagesQuery);
    const pages = pagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CloudPage));

    return { project, pages };
};


const deletePage = async (pageId: string): Promise<void> => {
    const db = getDbInstance();
    // Delete both the draft and the published version
    const draftRef = doc(db, "pages_drafts", pageId);
    const publishedRef = doc(db, "pages_published", pageId);
    await Promise.all([deleteDoc(draftRef), deleteDoc(publishedRef)]);
};

const duplicatePage = async (pageId: string): Promise<CloudPage> => {
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

const movePageToProject = async (pageId: string, newProjectId: string): Promise<void> => {
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

const addTemplate = async (templateData: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const db = getDbInstance();
    const templateWithTimestamps = {
        ...templateData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    };
    const templateRef = await addDoc(collection(db, "templates"), templateWithTimestamps);
    return templateRef.id;
};


const getTemplates = async (userId: string): Promise<Template[]> => {
    const db = getDbInstance();
    const templatesQuery = query(collection(db, "templates"), where("createdBy", "==", userId), orderBy("name", "asc"));
    const querySnapshot = await getDocs(templatesQuery);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Template));
};

const getTemplate = async (templateId: string): Promise<Template | null> => {
    const db = getDbInstance();
    const docRef = doc(db, "templates", templateId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Template : null;
};

const deleteTemplate = async (templateId: string): Promise<void> => {
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


// User Progress (Onboarding)
const getUserProgress = async (userId: string): Promise<UserProgress> => {
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

const updateUserProgress = async (userId: string, objective: keyof OnboardingObjectives): Promise<UserProgress> => {
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
const logPageView = async (pageData: CloudPage, headers: Headers): Promise<void> => {
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

const getPageViews = async (pageId: string): Promise<PageView[]> => {
    const db = getDbInstance();
    const q = query(
        collection(db, 'pageViews'),
        where('pageId', '==', pageId),
        orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PageView));
};


const logFormSubmission = async (pageId: string, formData: { [key: string]: any }): Promise<void> => {
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

const getFormSubmissions = async (pageId: string): Promise<FormSubmission[]> => {
    const db = getDbInstance();
    const q = query(
        collection(db, 'formSubmissions'),
        where('pageId', '==', pageId),
        orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FormSubmission));
};


export {
    addProject,
    updateProject,
    getProjectsForUser,
    getProject,
    deleteProject,
    addPage,
    updatePage,
    publishPage,
    getPage,
    getPagesForProject,
    getProjectWithPages,
    deletePage,
    duplicatePage,
    movePageToProject,
    addTemplate,
    getTemplates,
    getTemplate,
    deleteTemplate,
    getUserProgress,
    updateUserProgress,
    logPageView,
    getPageViews,
logFormSubmission,
    getFormSubmissions,
};
