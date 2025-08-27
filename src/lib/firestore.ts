

import { getDb } from "./firebase";
import { collection, addDoc, getDocs, query, where, doc, getDoc, updateDoc, deleteDoc, serverTimestamp, orderBy, Firestore, setDoc } from "firebase/firestore";
import type { Project, CloudPage, Template, UserProgress, OnboardingObjectives, PageView, FormSubmission } from "./types";

const getDbInstance = (): Firestore => {
    const db = getDb();
    if (!db) {
        throw new Error("Firestore is not initialized. This function should only be called on the client-side.");
    }
    return db;
};


// Projects

const addProject = async (name: string, userId: string): Promise<Project> => {
    const db = getDbInstance();
    const projectRef = await addDoc(collection(db, "projects"), {
        name,
        userId,
        createdAt: serverTimestamp(),
    });
    const newProjectDoc = await getDoc(projectRef);
    return { id: newProjectDoc.id, ...newProjectDoc.data() } as Project;
};

const updateProject = async (projectId: string, data: Partial<Project>): Promise<void> => {
    const db = getDbInstance();
    await updateDoc(doc(db, "projects", projectId), data);
}

const getProjectsForUser = async (userId: string): Promise<{ projects: Project[], pages: CloudPage[] }> => {
    const db = getDbInstance();
    const projectsQuery = query(collection(db, "projects"), where("userId", "==", userId));
    const pagesQuery = query(collection(db, "pages"), where("userId", "==", userId));

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
    // You might want to delete all pages within the project first
    const pagesQuery = query(collection(db, "pages"), where("projectId", "==", projectId));
    const pagesSnapshot = await getDocs(pagesQuery);
    const deletePromises = pagesSnapshot.docs.map(pageDoc => deleteDoc(pageDoc.ref));
    await Promise.all(deletePromises);

    // Now delete the project itself
    await deleteDoc(projectDocRef);
};


// Pages

const addPage = async (pageData: Omit<CloudPage, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const db = getDbInstance();
    const pageWithTimestamps = {
      ...pageData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const pageRef = await addDoc(collection(db, "pages"), pageWithTimestamps);
    return pageRef.id;
};

const updatePage = async (pageId: string, pageData: Partial<CloudPage>): Promise<void> => {
    const db = getDbInstance();
    await updateDoc(doc(db, "pages", pageId), {
        ...pageData,
        updatedAt: serverTimestamp(),
    });
};

const getPage = async (pageId: string): Promise<CloudPage | null> => {
    const db = getDbInstance();
    const docRef = doc(db, "pages", pageId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    const data = docSnap.data();
    // Ensure timestamps are converted correctly, especially after being written by serverTimestamp
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
    const q = query(collection(db, "pages"), where("projectId", "==", projectId), orderBy("updatedAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CloudPage));
};

const getProjectWithPages = async (projectId: string, userId: string): Promise<{ project: Project; pages: CloudPage[] } | null> => {
    const db = getDbInstance();
    const projectRef = doc(db, 'projects', projectId);
    const projectDoc = await getDoc(projectRef);

    if (!projectDoc.exists() || projectDoc.data().userId !== userId) {
        return null; // Project doesn't exist or user doesn't have access
    }

    const project = { id: projectDoc.id, ...projectDoc.data() } as Project;

    const pagesQuery = query(
        collection(db, 'pages'),
        where('projectId', '==', projectId),
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
    );
    
    const pagesSnapshot = await getDocs(pagesQuery);
    const pages = pagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CloudPage));

    return { project, pages };
};


const deletePage = async (pageId: string): Promise<void> => {
    const db = getDbInstance();
    await deleteDoc(doc(db, "pages", pageId));
};

const duplicatePage = async (pageId: string): Promise<CloudPage> => {
    const originalPage = await getPage(pageId);
    if (!originalPage) {
        throw new Error("Página original não encontrada.");
    }
    
    // Create a copy, removing the old ID and timestamps
    const { id, createdAt, updatedAt, ...pageDataToCopy } = originalPage;

    // Create a new name for the duplicated page
    pageDataToCopy.name = `Cópia de ${originalPage.name}`;
    
    const newPageId = await addPage(pageDataToCopy);
    
    const newPage = await getPage(newPageId);
    if (!newPage) {
        throw new Error("Falha ao criar a duplicata da página.");
    }

    return newPage;
};

const movePageToProject = async (pageId: string, newProjectId: string): Promise<void> => {
    const db = getDbInstance();
    const pageRef = doc(db, 'pages', pageId);
    await updateDoc(pageRef, {
        projectId: newProjectId,
        updatedAt: serverTimestamp()
    });
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
        userId: pageData.userId,
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
