
import { db } from "./firebase";
import { collection, addDoc, getDocs, query, where, doc, getDoc, updateDoc, deleteDoc, serverTimestamp, orderBy } from "firebase/firestore";
import type { Project, CloudPage } from "./types";

// Projects

const addProject = async (name: string, userId: string): Promise<Project> => {
    const projectRef = await addDoc(collection(db, "projects"), {
        name,
        userId,
        createdAt: serverTimestamp(),
    });
    const newProjectDoc = await getDoc(projectRef);
    return { id: newProjectDoc.id, ...newProjectDoc.data() } as Project;
};

const updateProject = async (projectId: string, data: Partial<Project>): Promise<void> => {
    await updateDoc(doc(db, "projects", projectId), data);
}

const getProjectsForUser = async (userId: string): Promise<{ projects: Project[], pages: CloudPage[] }> => {
    const projectsQuery = query(collection(db, "projects"), where("userId", "==", userId));
    const pagesQuery = query(collection(db, "pages"), where("userId", "==", userId));

    const projectSnapshot = await getDocs(projectsQuery);
    const projects = projectSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));

    const pageSnapshot = await getDocs(pagesQuery);
    const pages = pageSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CloudPage));

    return { projects, pages };
};

const getProject = async (projectId: string): Promise<Project | null> => {
    const docRef = doc(db, "projects", projectId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Project : null;
};


const deleteProject = async (projectId: string): Promise<void> => {
    await deleteDoc(doc(db, "projects", projectId));
};


// Pages

const addPage = async (pageData: Omit<CloudPage, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const pageWithTimestamps = {
      ...pageData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const pageRef = await addDoc(collection(db, "pages"), pageWithTimestamps);
    return pageRef.id;
};

const updatePage = async (pageId: string, pageData: Partial<CloudPage>): Promise<void> => {
    await updateDoc(doc(db, "pages", pageId), {
        ...pageData,
        updatedAt: serverTimestamp(),
    });
};

const getPage = async (pageId: string): Promise<CloudPage | null> => {
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
    const q = query(collection(db, "pages"), where("projectId", "==", projectId), orderBy("updatedAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CloudPage));
};

const getProjectWithPages = async (projectId: string, userId: string): Promise<{ project: Project; pages: CloudPage[] } | null> => {
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
    const pageRef = doc(db, 'pages', pageId);
    await updateDoc(pageRef, {
        projectId: newProjectId,
        updatedAt: serverTimestamp()
    });
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
    movePageToProject
};

    