import { db } from '../firebase'; 
import { 
  doc, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp,
  getDoc,
  getDocs,
  setDoc,
  query,
  where
} from 'firebase/firestore';

// Fonctions utilitaires génériques
const updateLastUpdate = async (classId) => {
  try {
    const classRef = doc(db, 'classes', classId);
    await updateDoc(classRef, {
      lastUpdate: serverTimestamp()
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de lastUpdate:", error);
    throw error;
  }
};

// ==================== CLASSES ====================

/**
 * Ajoute une nouvelle classe
 * @param {string} classId - ID de la classe
 * @param {string} nom - Nom de la classe
 * @returns {Promise<string>} ID de la classe créée
 */
export const addClasse = async (classId, nom) => {
  try {
    const docRef = await setDoc(doc(db, 'classes', classId), {
      nom,
      lastUpdate: serverTimestamp()
    });
  } catch (error) {
    console.error("Erreur lors de l'ajout de la classe:", error);
    throw error;
  }
};

/**
 * Modifie une classe existante
 * @param {string} classId - ID de la classe
 * @param {string} newNom - Nouveau nom
 */
export const updateClasse = async (classId, newNom) => {
  try {
    const classRef = doc(db, 'classes', classId);
    await updateDoc(classRef, {
      nom: newNom,
      lastUpdate: serverTimestamp()
    });
  } catch (error) {
    console.error("Erreur lors de la modification de la classe:", error);
    throw error;
  }
};

/**
 * Supprime une classe et tout son contenu (à utiliser avec prudence)
 * @param {string} classId - ID de la classe
 */
export const deleteClasse = async (classId) => {
  try {
    const classRef = doc(db, 'classes', classId);
    await deleteDoc(classRef);
    // Note: Firestore ne supprime pas automatiquement les sous-collections
    // Vous devrez implémenter une fonction récursive ou Cloud Function pour ça
  } catch (error) {
    console.error("Erreur lors de la suppression de la classe:", error);
    throw error;
  }
};

/**
 * Récupère toutes les classes
 * @returns {Promise<Array<{id: string, nom: string, lastUpdate: Date, type: 'classe'}>>}
 */
export const getAllClasses = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'classes'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      type: 'classe',
      title:doc.data().nom
    }));
  } catch (error) {
    console.error("Erreur lors de la récupération des classes:", error);
    throw error;
  }
};

/**
 * Récupère une classe spécifique
 * @param {string} classId 
 * @returns {Promise<{id: string, nom: string, lastUpdate: Date, type: 'classe'}>}
 */
export const getClasse = async (classId) => {
  try {
    const docSnap = await getDoc(doc(db, 'classes', classId));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data(), type: 'classe', title:docSnap.data().nom };
    } else {
      throw new Error('Classe non trouvée');
    }
  } catch (error) {
    console.error("Erreur lors de la récupération de la classe:", error);
    throw error;
  }
};

export const checkClassExists = async (name, excludeId = null) => {
    const q = excludeId 
      ? query(collection(db, 'classes'), where('nom', '==', name), where('__name__', '!=', excludeId))
      : query(collection(db, 'classes'), where('nom', '==', name));
    
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
};

// ==================== MATIERES ====================

/**
 * Ajoute une matière à une classe
 * @param {string} classId - ID de la classe parente
 * @param {string} matiereId - ID de la matière
 * @param {string} nom - Nom de la matière
 * @param {string} [icon] - icon de la matière (optionnel)
 * @returns {Promise<string>} ID de la matière créée
 */
export const addMatiere = async ( classId, matiereId, nom, icon=undefined) => {
  try {
    const matieresRef = doc(db, `classes/${classId}/matieres`, matiereId);
    const docRef = !icon ? await setDoc(matieresRef, { nom }) : await setDoc(matieresRef, { nom, icon });
    await updateLastUpdate(classId);
  } catch (error) {
    console.error("Erreur lors de l'ajout de la matière:", error);
    throw error;
  }
};

/**
 * Modifie une matière existante
 * @param {string} classId - ID de la classe parente
 * @param {string} matiereId - ID de la matière
 * @param {string} newNom - Nouveau nom
 * @param {string} [newIcon] - Nouvelle icon (optionnel)
 */
export const updateMatiere = async (classId, matiereId, newNom, newIcon=undefined) => {
  try {
    const matiereRef = doc(db, `classes/${classId}/matieres`, matiereId);
    !newIcon ? await updateDoc(matiereRef, { nom: newNom }): await updateDoc(matiereRef, { nom: newNom, icon: newIcon });
    await updateLastUpdate(classId);
  } catch (error) {
    console.error("Erreur lors de la modification de la matière:", error);
    throw error;
  }
};

/**
 * Supprime une matière
 * @param {string} classId - ID de la classe parente
 * @param {string} matiereId - ID de la matière
 */
export const deleteMatiere = async (classId, matiereId) => {
  try {
    const matiereRef = doc(db, `classes/${classId}/matieres`, matiereId);
    await deleteDoc(matiereRef);
    await updateLastUpdate(classId);
  } catch (error) {
    console.error("Erreur lors de la suppression de la matière:", error);
    throw error;
  }
};

/**
 * Récupère toutes les matières d'une classe
 * @param {string} classId 
 * @returns {Promise<Array<{id: string, nom: string, type: 'matiere'}>>}
 */
export const getAllMatieres = async (classId) => {
  try {
    const querySnapshot = await getDocs(collection(db, `classes/${classId}/matieres`));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      type: 'matiere',
      title:doc.data().nom
    }));
  } catch (error) {
    console.error("Erreur lors de la récupération des matières:", error);
    throw error;
  }
};

/**
 * Récupère une matière spécifique
 * @param {string} classId 
 * @param {string} matiereId 
 * @returns {Promise<{id: string, nom: string, type: 'matiere'}>}
 */
export const getMatiere = async (classId, matiereId) => {
  try {
    const docSnap = await getDoc(doc(db, `classes/${classId}/matieres`, matiereId));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data(), type: 'matiere', title:docSnap.data().nom };
    } else {
      throw new Error('Matière non trouvée');
    }
  } catch (error) {
    console.error("Erreur lors de la récupération de la matière:", error);
    throw error;
  }
};

// ==================== MODULES ====================

/**
 * Ajoute un module à une matière
 * @param {string} classId - ID de la classe parente
 * @param {string} matiereId - ID de la matière parente
 * @param {string} moduleId - ID du module
 * @param {string} intitule - Intitulé du module
 * @param {number} index - Numéro du module
 * @param {string} [icon] - Icon du module (optionnel)
 * @returns {Promise<string>} ID du module créé
 */
export const addModule = async (classId, matiereId, moduleId, intitule, index, icon=undefined) => {
  try {
    const modulesRef = doc(db, `classes/${classId}/matieres/${matiereId}/modules`, moduleId);
    const docRef = !icon ? await setDoc(modulesRef, { intitule, index }) : await setDoc(modulesRef, { intitule, icon, index });
    await updateLastUpdate(classId);
  } catch (error) {
    console.error("Erreur lors de l'ajout du module:", error);
    throw error;
  }
};

/**
 * Modifie un module existant
 * @param {string} classId - ID de la classe parente
 * @param {string} matiereId - ID de la matière parente
 * @param {string} moduleId - ID du module
 * @param {string} newIntitule - Nouvel intitulé
 * @param {number} newIndex - Numéro du module
 * @param {string} [newIcon] - Nouvelle icon (optionnel)
 */
export const updateModule = async (classId, matiereId, moduleId, newIntitule, newIndex, newIcon=undefined) => {
  try {
    const moduleRef = doc(db, `classes/${classId}/matieres/${matiereId}/modules`, moduleId);
    !newIcon ? await updateDoc(moduleRef, { index:newIndex, intitule: newIntitule }) : await updateDoc(moduleRef, { index:newIndex, intitule: newIntitule, icon: newIcon });
    await updateLastUpdate(classId);
  } catch (error) {
    console.error("Erreur lors de la modification du module:", error);
    throw error;
  }
};

/**
 * Supprime un module
 * @param {string} classId - ID de la classe parente
 * @param {string} matiereId - ID de la matière parente
 * @param {string} moduleId - ID du module
 */
export const deleteModule = async (classId, matiereId, moduleId) => {
  try {
    const moduleRef = doc(db, `classes/${classId}/matieres/${matiereId}/modules`, moduleId);
    await deleteDoc(moduleRef);
    await updateLastUpdate(classId);
  } catch (error) {
    console.error("Erreur lors de la suppression du module:", error);
    throw error;
  }
};

/**
 * Récupère tous les modules d'une matière
 * @param {string} classId 
 * @param {string} matiereId 
 * @returns {Promise<Array<{id: string, intitule: string, type: 'module'}>>}
 */
export const getAllModules = async (classId, matiereId) => {
  try {
    const querySnapshot = await getDocs(collection(db, `classes/${classId}/matieres/${matiereId}/modules`));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      type: 'module',
      title:doc.data().intitule
    }));
  } catch (error) {
    console.error("Erreur lors de la récupération des modules:", error);
    throw error;
  }
};

/**
 * Récupère un module spécifique
 * @param {string} classId 
 * @param {string} matiereId 
 * @param {string} moduleId 
 * @returns {Promise<{id: string, intitule: string, type: 'module'}>}
 */
export const getModule = async (classId, matiereId, moduleId) => {
  try {
    const docSnap = await getDoc(doc(db, `classes/${classId}/matieres/${matiereId}/modules`, moduleId));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data(), type: 'module', title:docSnap.data().intitule };
    } else {
      throw new Error('Module non trouvé');
    }
  } catch (error) {
    console.error("Erreur lors de la récupération du module:", error);
    throw error;
  }
};

// ==================== CHAPITRES ====================

/**
 * Ajoute un chapitre à un module
 * @param {string} classId - ID de la classe parente
 * @param {string} matiereId - ID de la matière parente
 * @param {string} moduleId - ID du module parent
 * @param {string} chapitreId - ID du chapitre
 * @param {string} intitule - Intitulé du chapitre
 * @param {number} index - Numéro du chapitre
 * @param {string} [icon] - Icon du chapitre (optionnel)
 * @returns {Promise<string>} ID du chapitre créé
 */
export const addChapitre = async (classId, matiereId, moduleId, chapitreId, intitule, index, icon=undefined) => {
  try {
    const chapitresRef = doc(db, `classes/${classId}/matieres/${matiereId}/modules/${moduleId}/chapitres`, chapitreId);
    const docRef = !icon ? await setDoc(chapitresRef, { intitule, index }): await setDoc(chapitresRef, { intitule, icon, index });
    await updateLastUpdate(classId);
  } catch (error) {
    console.error("Erreur lors de l'ajout du chapitre:", error);
    throw error;
  }
};

/**
 * Modifie un chapitre existant
 * @param {string} classId - ID de la classe parente
 * @param {string} matiereId - ID de la matière parente
 * @param {string} moduleId - ID du module parent
 * @param {string} chapitreId - ID du chapitre
 * @param {string} newIntitule - Nouvel intitulé
 * @param {number} newIndex - Numéro du chapitre
 * @param {string} [newIcon] - Nouvelle icon (optionnel)
 */
export const updateChapitre = async (classId, matiereId, moduleId, chapitreId, newIntitule, newIndex, newIcon=undefined) => {
  try {
    const chapitreRef = doc(db, `classes/${classId}/matieres/${matiereId}/modules/${moduleId}/chapitres`, chapitreId);
    !newIcon ? await updateDoc(chapitreRef, { index:newIndex, intitule: newIntitule }) : await updateDoc(chapitreRef, { index:newIndex, intitule: newIntitule, icon: newIcon });
    await updateLastUpdate(classId);
  } catch (error) {
    console.error("Erreur lors de la modification du chapitre:", error);
    throw error;
  }
};

/**
 * Supprime un chapitre
 * @param {string} classId - ID de la classe parente
 * @param {string} matiereId - ID de la matière parente
 * @param {string} moduleId - ID du module parent
 * @param {string} chapitreId - ID du chapitre
 */
export const deleteChapitre = async (classId, matiereId, moduleId, chapitreId) => {
  try {
    const chapitreRef = doc(db, `classes/${classId}/matieres/${matiereId}/modules/${moduleId}/chapitres`, chapitreId);
    await deleteDoc(chapitreRef);
    await updateLastUpdate(classId);
  } catch (error) {
    console.error("Erreur lors de la suppression du chapitre:", error);
    throw error;
  }
};

/**
 * Récupère tous les chapitres d'un module
 * @param {string} classId 
 * @param {string} matiereId 
 * @param {string} moduleId 
 * @returns {Promise<Array<{id: string, intitule: string, type: 'chapitre'}>>}
 */
export const getAllChapitres = async (classId, matiereId, moduleId) => {
  try {
    const querySnapshot = await getDocs(collection(db, `classes/${classId}/matieres/${matiereId}/modules/${moduleId}/chapitres`));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      type: 'chapitre',
      title:doc.data().intitule
    }));
  } catch (error) {
    console.error("Erreur lors de la récupération des chapitres:", error);
    throw error;
  }
};

/**
 * Récupère un chapitre spécifique
 * @param {string} classId 
 * @param {string} matiereId 
 * @param {string} moduleId 
 * @param {string} chapitreId 
 * @returns {Promise<{id: string, intitule: string, type: 'chapitre'}>}
 */
export const getChapitre = async (classId, matiereId, moduleId, chapitreId) => {
  try {
    const docSnap = await getDoc(doc(db, `classes/${classId}/matieres/${matiereId}/modules/${moduleId}/chapitres`, chapitreId));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data(), type: 'chapitre', title:docSnap.data().intitule };
    } else {
      throw new Error('Chapitre non trouvé');
    }
  } catch (error) {
    console.error("Erreur lors de la récupération du chapitre:", error);
    throw error;
  }
};

// ==================== LESSONS ====================

/**
 * Ajoute une lesson à un chapitre
 * @param {string} classId - ID de la classe parente
 * @param {string} matiereId - ID de la matière parente
 * @param {string} moduleId - ID du module parent
 * @param {string} chapitreId - ID du chapitre parent
 * @param {string} lessonId - ID de la lesson
 * @param {string} intitule - Intitulé de la lesson
 * @param {number} index - Numéro de la lesson
 * @param {string} [icon] - Icon de la lesson (optionnel)
 * @returns {Promise<string>} ID de la lesson créée
 */
export const addLesson = async (classId, matiereId, moduleId, chapitreId, lessonId, intitule, index, icon=undefined) => {
  try {
    const lessonsRef = doc(db, `classes/${classId}/matieres/${matiereId}/modules/${moduleId}/chapitres/${chapitreId}/lecons`, lessonId);
    const docRef = !icon ? await setDoc(lessonsRef, { intitule, index }) : await setDoc(lessonsRef, { intitule, icon, index });
    await updateLastUpdate(classId);
  } catch (error) {
    console.error("Erreur lors de l'ajout de la lesson:", error);
    throw error;
  }
};

/**
 * Modifie une lesson existante
 * @param {string} classId - ID de la classe parente
 * @param {string} matiereId - ID de la matière parente
 * @param {string} moduleId - ID du module parent
 * @param {string} chapitreId - ID du chapitre parent
 * @param {string} lessonId - ID de la lesson
 * @param {string} newIntitule - Nouvel intitulé
 * @param {number} newIndex - le numero de la lesson
 * @param {string} [newIcon] - Nouvelle icon (optionnel)
 */
export const updateLesson = async (classId, matiereId, moduleId, chapitreId, lessonId, newIntitule, newIndex, newIcon=undefined) => {
  try {
    const lessonRef = doc(db, `classes/${classId}/matieres/${matiereId}/modules/${moduleId}/chapitres/${chapitreId}/lecons`, lessonId);
    !newIcon ? await updateDoc(lessonRef, { index:newIndex, intitule: newIntitule }) : await updateDoc(lessonRef, { index:newIndex, intitule: newIntitule, icon: newIcon });
    await updateLastUpdate(classId);
  } catch (error) {
    console.error("Erreur lors de la modification de la lesson:", error);
    throw error;
  }
};

/**
 * Supprime une lesson
 * @param {string} classId - ID de la classe parente
 * @param {string} matiereId - ID de la matière parente
 * @param {string} moduleId - ID du module parent
 * @param {string} chapitreId - ID du chapitre parent
 * @param {string} lessonId - ID de la lesson
 */
export const deleteLesson = async (classId, matiereId, moduleId, chapitreId, lessonId) => {
  try {
    const lessonRef = doc(db, `classes/${classId}/matieres/${matiereId}/modules/${moduleId}/chapitres/${chapitreId}/lecons`, lessonId);
    await deleteDoc(lessonRef);
    await updateLastUpdate(classId);
  } catch (error) {
    console.error("Erreur lors de la suppression de la lesson:", error);
    throw error;
  }
};

/**
 * Récupère toutes les lessons d'un chapitre
 * @param {string} classId 
 * @param {string} matiereId 
 * @param {string} moduleId 
 * @param {string} chapitreId 
 * @returns {Promise<Array<{id: string, intitule: string, type: 'lesson', cours?: any, questions?: any, exercices?: any}>>}
 */
export const getAllLessons = async (classId, matiereId, moduleId, chapitreId) => {
  try {
    const querySnapshot = await getDocs(collection(db, `classes/${classId}/matieres/${matiereId}/modules/${moduleId}/chapitres/${chapitreId}/lecons`));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      type: 'lesson',
      title:doc.data().intitule
    }));
  } catch (error) {
    console.error("Erreur lors de la récupération des lessons:", error);
    throw error;
  }
};

/**
 * Récupère une lesson spécifique avec son contenu
 * @param {string} classId 
 * @param {string} matiereId 
 * @param {string} moduleId 
 * @param {string} chapitreId 
 * @param {string} lessonId 
 * @returns {Promise<{id: string, intitule: string, type: 'lesson', cours?: any, questions?: any, exercices?: any}>}
 */
export const getLesson = async (classId, matiereId, moduleId, chapitreId, lessonId) => {
  try {
    const docSnap = await getDoc(doc(db, `classes/${classId}/matieres/${matiereId}/modules/${moduleId}/chapitres/${chapitreId}/lecons`, lessonId));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data(), type: 'lesson', title:docSnap.data().intitule };
    } else {
      throw new Error('Lesson non trouvée');
    }
  } catch (error) {
    console.error("Erreur lors de la récupération de la lesson:", error);
    throw error;
  }
};



// ==================== CONTENU LESSON ====================
/**
 * Récupère l'URL du document de cours d'une leçon
 * @param {string} classId 
 * @param {string} matiereId 
 * @param {string} moduleId 
 * @param {string} chapitreId 
 * @param {string} lessonId 
 * @returns {Promise<string|null>} URL du document ou null si inexistant
 */
export const getLessonDocUrl = async (classId, matiereId, moduleId, chapitreId, lessonId) => {
  try {
    const lesson = await getLesson(classId, matiereId, moduleId, chapitreId, lessonId);
    return lesson.url_cours_doc || null;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'URL document:", error);
    throw error;
  }
};

/**
 * Récupère l'URL du document de cours d'une leçon
 * @param {string} classId 
 * @param {string} matiereId 
 * @param {string} moduleId 
 * @param {string} chapitreId 
 * @param {string} lessonId 
 * @returns {Promise<string|null>} URL du document ou null si inexistant
 */
export const getLessonDocFileId = async (classId, matiereId, moduleId, chapitreId, lessonId) => {
  try {
    const lesson = await getLesson(classId, matiereId, moduleId, chapitreId, lessonId);
    return lesson.file_id_doc || null;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'URL document:", error);
    throw error;
  }
};

/**
 * Récupère toutes les vidéos de cours d'une leçon
 * @param {string} classId 
 * @param {string} matiereId 
 * @param {string} moduleId 
 * @param {string} chapitreId 
 * @param {string} lessonId 
 * @returns {Promise<string[]>} Liste des URLs vidéo YouTube
 */
export const getLessonVideoUrls = async (classId, matiereId, moduleId, chapitreId, lessonId) => {
  try {
    const lesson = await getLesson(classId, matiereId, moduleId, chapitreId, lessonId);
    return lesson.url_cours_videos || [];
  } catch (error) {
    console.error("Erreur lors de la récupération des URLs vidéo:", error);
    throw error;
  }
};

/**
 * Met à jour ou ajoute l'URL du document de cours
 * @param {string} classId 
 * @param {string} matiereId 
 * @param {string} moduleId 
 * @param {string} chapitreId 
 * @param {string} lessonId 
 * @param {string} docUrl 
 * @returns {Promise<void>}
 */
export const updateLessonDocUrl = async (classId, matiereId, moduleId, chapitreId, lessonId, docUrl) => {
  try {
    const lessonRef = doc(db, `classes/${classId}/matieres/${matiereId}/modules/${moduleId}/chapitres/${chapitreId}/lecons`, lessonId);
    await updateDoc(lessonRef, { 
      url_cours_doc: docUrl,
      last_updated: serverTimestamp() 
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'URL document:", error);
    throw error;
  }
};

/**
 * Met à jour ou ajoute l'URL du document de cours
 * @param {string} classId 
 * @param {string} matiereId 
 * @param {string} moduleId 
 * @param {string} chapitreId 
 * @param {string} lessonId 
 * @param {string} fileId 
 * @returns {Promise<void>}
 */
export const updateLessonDocFileId = async (classId, matiereId, moduleId, chapitreId, lessonId, fileId) => {
  try {
    const lessonRef = doc(db, `classes/${classId}/matieres/${matiereId}/modules/${moduleId}/chapitres/${chapitreId}/lecons`, lessonId);
    await updateDoc(lessonRef, { 
      file_id_doc: fileId,
      last_updated: serverTimestamp() 
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'URL document:", error);
    throw error;
  }
};

/**
 * Met à jour la liste des URLs vidéo de cours
 * @param {string} classId 
 * @param {string} matiereId 
 * @param {string} moduleId 
 * @param {string} chapitreId 
 * @param {string} lessonId 
 * @param {string[]} videoUrls - Liste des URLs vidéo YouTube
 * @returns {Promise<void>}
 */
export const updateLessonVideoUrls = async (classId, matiereId, moduleId, chapitreId, lessonId, videoUrls) => {
  try {
    const lessonRef = doc(db, `classes/${classId}/matieres/${matiereId}/modules/${moduleId}/chapitres/${chapitreId}/lecons`, lessonId);
    await updateDoc(lessonRef, { 
      url_cours_videos: videoUrls,
      last_updated: serverTimestamp() 
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour des URLs vidéo:", error);
    throw error;
  }
};

/**
 * Vérifie si un lien Telegram est encore valide
 * @param {string} fileUrl - URL du fichier Telegram
 * @returns {Promise<{isValid: boolean, status?: number, error?: string}>}
 */
export const checkTelegramLinkValidity = async (fileUrl) => {
  try {
    const response = await fetch(fileUrl, { method: 'HEAD' });
    
    // Les liens Telegram retournent 200 même si expirés, donc vérification supplémentaire
    if (response.ok) {
      const contentLength = response.headers.get('content-length');
      const contentType = response.headers.get('content-type');
      
      return {
        isValid: true,
        fileSize: parseInt(contentLength || '0'),
        fileType: contentType
      };
    }

    return {
      isValid: false,
      status: response.status,
      error: 'Link not reachable'
    };

  } catch (error) {
    return {
      isValid: false,
      error: error.message
    };
  }
};

/**
 * Génère un lien de téléchargement pour un fichier Telegram
 * @param {string} fileId - Le file_id Telegram
 * @param {string} botToken - Token du bot (optionnel si dans .env)
 * @returns {Promise<{url: string, expiresAt: Date}>} Lien et date d'expiration
 */
export const generateTelegramDownloadLink = async (
  fileId, 
  botToken = process.env.REACT_APP_TELEGRAM_BOT_TOKEN
) => {
  try {
    // 1. Obtenir les infos du fichier
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`
    );
    const data = await response.json();

    if (!data.ok) {
      throw new Error(data.description || 'Failed to get file info');
    }

    // 2. Construire l'URL (valide 1h)
    const fileUrl = `https://api.telegram.org/file/bot${botToken}/${data.result.file_path}`;
    
    // 3. Calculer l'expiration (1h après génération)
    const expiresAt = new Date(Date.now() + 3600000); // 1 heure

    return {
      url: fileUrl,
      expiresAt,
      fileSize: data.result.file_size, // Taille en octets
      filePath: data.result.file_path
    };

  } catch (error) {
    console.error('Error generating download link:', error);
    throw error;
  }
};

/**
 * Télécharge un fichier PDF à partir de son file_id Telegram
 * @param {string} fileId - Le file_id du document
 * @param {string} fileName - Le nom souhaité pour le fichier téléchargé (ex: "mon-document.pdf")
 * @param {string} botToken - Le token de votre bot Telegram (optionnel si dans .env)
 */
export const downloadTelegramPdf = async (fileId, fileName = 'document.pdf', botToken = process.env.REACT_APP_TELEGRAM_BOT_TOKEN) => {
  try {
    // 1. Obtenir le chemin du fichier
    const fileInfoResponse = await fetch(
      `https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`
    );
    const fileInfo = await fileInfoResponse.json();
    
    if (!fileInfo.ok) {
      throw new Error('Erreur lors de la récupération des infos du fichier');
    }

    // 2. Construire l'URL de téléchargement
    const fileUrl = `https://api.telegram.org/file/bot${botToken}/${fileInfo.result.file_path}`;

    // 3. Télécharger le fichier
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error('Erreur lors du téléchargement');
    }

    // 4. Créer un blob et déclencher le téléchargement
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    
    // Nettoyage
    setTimeout(() => {
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(link);
    }, 100);

  } catch (error) {
    console.error('Erreur de téléchargement:', error);
    throw error;
  }
};

/**
 * Met à jour les deux URLs en une seule opération
 * @param {string} classId 
 * @param {string} matiereId 
 * @param {string} moduleId 
 * @param {string} chapitreId 
 * @param {string} lessonId 
 * @param {string} docUrl 
 * @param {string} videoUrl 
 * @returns {Promise<void>}
 */
export const updateLessonUrls = async (classId, matiereId, moduleId, chapitreId, lessonId, docUrl, videoUrl) => {
  try {
    const lessonRef = doc(db, `classes/${classId}/matieres/${matiereId}/modules/${moduleId}/chapitres/${chapitreId}/lecons`, lessonId);
    await updateDoc(lessonRef, { 
      url_cours_doc: docUrl,
      url_cours_video: videoUrl,
      last_updated: serverTimestamp() 
    });
    await updateLastUpdate(classId);
  } catch (error) {
    console.error("Erreur lors de la mise à jour des URLs:", error);
    throw error;
  }
};

/**
 * Ajoute ou met à jour le cours d'une lesson
 * @param {string} classId - ID de la classe parente
 * @param {string} matiereId - ID de la matière parente
 * @param {string} moduleId - ID du module parent
 * @param {string} chapitreId - ID du chapitre parent
 * @param {string} lessonId - ID de la lesson
 * @param {object} coursData - Contenu du cours
 */
export const updateLessonCours = async (classId, matiereId, moduleId, chapitreId, lessonId, coursData) => {
  try {
    const lessonRef = doc(db, `classes/${classId}/matieres/${matiereId}/modules/${moduleId}/chapitres/${chapitreId}/lecons`, lessonId);
    await updateDoc(lessonRef, { 
      cours: coursData,
      lastUpdate: serverTimestamp() 
    });
    await updateLastUpdate(classId);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du cours:", error);
    throw error;
  }
};

/**
 * Récupère toutes les questions d'une leçon
 * @param {string} classId 
 * @param {string} matiereId 
 * @param {string} moduleId 
 * @param {string} chapitreId 
 * @param {string} lessonId 
 * @returns {Promise<Array<{
 *   id: string,
 *   questionText: string,
 *   options: string[],
 *   correctAnswer: number,
 *   difficulty: 'easy'|'medium'|'hard'|'very hard',
 *   explanation?: string
 * }>>}
 */
export const getAllQuestions = async (classId, matiereId, moduleId, chapitreId, lessonId) => {
  try {
    const querySnapshot = await getDocs(
      collection(db, 
        `classes/${classId}/matieres/${matiereId}/modules/${moduleId}/chapitres/${chapitreId}/lecons/${lessonId}/questions`
      )
    );
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      questionText: doc.data().questionText,
      options: doc.data().options || [],
      correctAnswer: doc.data().correctAnswer,
      difficulty: doc.data().difficuty || 'medium',
      explanation: doc.data().explanation
    }));
  } catch (error) {
    console.error("Erreur lors de la récupération des questions:", error);
    throw error;
  }
};

/**
 * Supprime une question
 * @param {string} classId 
 * @param {string} matiereId 
 * @param {string} moduleId 
 * @param {string} chapitreId 
 * @param {string} lessonId 
 * @param {string} questionId 
 */
export const deleteQuestion = async (classId, matiereId, moduleId, chapitreId, lessonId, questionId) => {
  try {
    await deleteDoc(
      doc(db,
        `classes/${classId}/matieres/${matiereId}/modules/${moduleId}/chapitres/${chapitreId}/lecons/${lessonId}/questions/${questionId}`
      )
    );
  } catch (error) {
    console.error("Erreur lors de la suppression de la question:", error);
    throw error;
  }
};

/**
 * Ajoute ou met à jour une question
 * @param {string} classId 
 * @param {string} matiereId 
 * @param {string} moduleId 
 * @param {string} chapitreId 
 * @param {string} lessonId 
 * @param {string} questionId - Si null, création d'une nouvelle question
 * @param {object} questionData 
 * @returns {Promise<string>} ID de la question
 */
export const saveQuestion = async (
  classId, matiereId, moduleId, chapitreId, lessonId, 
  questionId, 
  { questionText, options, correctAnswer, difficulty, explanation }
) => {
  try {
    const questionRef = questionId 
      ? doc(db, 
          `classes/${classId}/matieres/${matiereId}/modules/${moduleId}/chapitres/${chapitreId}/lecons/${lessonId}/questions/${questionId}`
        )
      : doc(collection(db, 
          `classes/${classId}/matieres/${matiereId}/modules/${moduleId}/chapitres/${chapitreId}/lecons/${lessonId}/questions`
        ));

    await setDoc(questionRef, {
      questionText,
      options,
      correctAnswer: Number(correctAnswer),
      difficuty: difficulty,
      explanation: explanation || null,
      lastUpdated: serverTimestamp()
    });

    return questionRef.id;
  } catch (error) {
    console.error("Erreur lors de la sauvegarde de la question:", error);
    throw error;
  }
};


/**
 * Récupère tous les exercices d'une lesson
 * @param {string} classId 
 * @param {string} matiereId 
 * @param {string} moduleId 
 * @param {string} chapitreId 
 * @param {string} lessonId 
 * @returns {Promise<Exercice[]>}
 */
export const getAllExercices = async (classId, matiereId, moduleId, chapitreId, lessonId) => {
  try {
    const querySnapshot = await getDocs(
      collection(db, `classes/${classId}/matieres/${matiereId}/modules/${moduleId}/chapitres/${chapitreId}/lecons/${lessonId}/exercices`)
    );
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    }));
  } catch (error) {
    console.error("Erreur lors de la récupération des exercices:", error);
    throw error;
  }
};
/**
 * Récupère un exercice spécifique
 * @param {string} classId 
 * @param {string} matiereId 
 * @param {string} moduleId 
 * @param {string} chapitreId 
 * @param {string} lessonId 
 * @param {string} exerciceId 
 * @returns {Promise<Exercice>}
 */
export const getExercice = async (classId, matiereId, moduleId, chapitreId, lessonId, exerciceId) => {
  try {
    const docSnap = await getDoc(
      doc(db, `classes/${classId}/matieres/${matiereId}/modules/${moduleId}/chapitres/${chapitreId}/lecons/${lessonId}/exercices`, exerciceId)
    );
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate(),
        updatedAt: docSnap.data().updatedAt?.toDate()
      };
    } else {
      throw new Error('Exercice non trouvé');
    }
  } catch (error) {
    console.error("Erreur lors de la récupération de l'exercice:", error);
    throw error;
  }
};
/**
 * Crée un nouvel exercice
 * @param {string} classId 
 * @param {string} matiereId 
 * @param {string} moduleId 
 * @param {string} chapitreId 
 * @param {string} lessonId 
 * @param {Omit<Exercice, 'id' | 'createdAt' | 'updatedAt'>} exerciceData 
 * @returns {Promise<string>} ID du nouvel exercice
 */
export const createExercice = async (classId, matiereId, moduleId, chapitreId, lessonId, exerciceData) => {
  try {
    const now = new Date();
    const docRef = await addDoc(
      collection(db, `classes/${classId}/matieres/${matiereId}/modules/${moduleId}/chapitres/${chapitreId}/lecons/${lessonId}/exercices`),
      {
        ...exerciceData,
        createdAt: now,
        updatedAt: now
      }
    );
    
    return docRef.id;
  } catch (error) {
    console.error("Erreur lors de la création de l'exercice:", error);
    throw error;
  }
};
/**
 * Met à jour un exercice existant
 * @param {string} classId 
 * @param {string} matiereId 
 * @param {string} moduleId 
 * @param {string} chapitreId 
 * @param {string} lessonId 
 * @param {string} exerciceId 
 * @param {Partial<Exercice>} updateData 
 * @returns {Promise<void>}
 */
export const updateExercice = async (classId, matiereId, moduleId, chapitreId, lessonId, exerciceId, updateData) => {
  try {
    await updateDoc(
      doc(db, `classes/${classId}/matieres/${matiereId}/modules/${moduleId}/chapitres/${chapitreId}/lecons/${lessonId}/exercices`, exerciceId),
      {
        ...updateData,
        updatedAt: new Date()
      }
    );
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'exercice:", error);
    throw error;
  }
};
/**
 * Ajoute ou met à jour un exercice
 * @param {string} classId 
 * @param {string} matiereId 
 * @param {string} moduleId 
 * @param {string} chapitreId 
 * @param {string} lessonId 
 * @param {string} exerciceId - Si null, création d'un nouvel exercice
 * @param {object} exerciceData 
 * @returns {Promise<string>} ID de l'exercice
 */
export const saveExercice = async (
  classId, matiereId, moduleId, chapitreId, lessonId, 
  exerciceId, 
  { intitule, type, niveau, enonce, questions }
) => {
  try {
    const exerciceRef = exerciceId 
      ? doc(db, 
          `classes/${classId}/matieres/${matiereId}/modules/${moduleId}/chapitres/${chapitreId}/lecons/${lessonId}/exercices/${exerciceId}`
        )
      : doc(collection(db, 
          `classes/${classId}/matieres/${matiereId}/modules/${moduleId}/chapitres/${chapitreId}/lecons/${lessonId}/exercices`
        ));

    await setDoc(exerciceRef, {
      intitule,
      type,
      niveau,
      enonce: {
        texte: enonce.texte,
        images: enonce.images || [] // Tableau d'images en base64
      },
      questions: questions.map(q => ({
        numero: q.numero,
        texte: q.texte,
        niveau: q.niveau,
        reponse: q.reponse || null,
        sousQuestions: q.sousQuestions?.map(sq => ({
          numero: sq.numero,
          texte: sq.texte,
          niveau: sq.niveau,
          reponse: sq.reponse || null
        })) || []
      })),
      createdAt: exerciceId ? null : serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return exerciceRef.id;
  } catch (error) {
    console.error("Erreur lors de la sauvegarde de l'exercice:", error);
    throw error;
  }
};

/**
 * Supprime un exercice
 * @param {string} classId 
 * @param {string} matiereId 
 * @param {string} moduleId 
 * @param {string} chapitreId 
 * @param {string} lessonId 
 * @param {string} exerciceId 
 * @returns {Promise<void>}
 */
export const deleteExercice = async (classId, matiereId, moduleId, chapitreId, lessonId, exerciceId) => {
  try {
    await deleteDoc(
      doc(db, `classes/${classId}/matieres/${matiereId}/modules/${moduleId}/chapitres/${chapitreId}/lecons/${lessonId}/exercices`, exerciceId)
    );
  } catch (error) {
    console.error("Erreur lors de la suppression de l'exercice:", error);
    throw error;
  }
};
/**
 * Récupère les exercices filtrés par niveau de difficulté
 * @param {string} classId 
 * @param {string} matiereId 
 * @param {string} moduleId 
 * @param {string} chapitreId 
 * @param {string} lessonId 
 * @param {'easy' | 'medium' | 'hard' | 'very hard'} niveau 
 * @returns {Promise<Exercice[]>}
 */
export const getExercicesByNiveau = async (classId, matiereId, moduleId, chapitreId, lessonId, niveau) => {
  try {
    const querySnapshot = await getDocs(
      query(
        collection(db, `classes/${classId}/matieres/${matiereId}/modules/${moduleId}/chapitres/${chapitreId}/lecons/${lessonId}/exercices`),
        where("niveau", "==", niveau)
      )
    );
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    }));
  } catch (error) {
    console.error("Erreur lors de la récupération des exercices par niveau:", error);
    throw error;
  }
};

/**
 * Récupère tous les exercices vidéo d'une leçon spécifique
 * @param {string} classId 
 * @param {string} matiereId 
 * @param {string} moduleId 
 * @param {string} chapitreId 
 * @param {string} lessonId 
 * @returns {Promise<Array<{id: string, titre: string, youtubeUrl: string}>>}
 */
export const getAllExercicesVideo = async (classId, matiereId, moduleId, chapitreId, lessonId) => {
  try {
    const querySnapshot = await getDocs(
      collection(db, 
        `classes/${classId}/matieres/${matiereId}/modules/${moduleId}/chapitres/${chapitreId}/lecons/${lessonId}/exercices_video`)
    );
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      titre: doc.data().titre,
      youtubeUrl: doc.data().youtubeUrl
    }));
  } catch (error) {
    console.error("Erreur lors de la récupération des exercices vidéo:", error);
    throw error;
  }
};

/**
 * Sauvegarde un exercice vidéo (ajout ou modification)
 * @param {string} classId 
 * @param {string} matiereId 
 * @param {string} moduleId 
 * @param {string} chapitreId 
 * @param {string} lessonId 
 * @param {string} exerciceId - Laissez vide pour créer un nouvel exercice
 * @param {Object} data - { titre: string, youtubeUrl: string }
 * @returns {Promise<string>} - ID de l'exercice créé/modifié
 */
export const saveExerciceVideo = async (classId, matiereId, moduleId, chapitreId, lessonId, exerciceId, data) => {
  try {
    // Si aucun ID n'est fourni, Firestore en générera un nouveau
    const exerciceRef = exerciceId 
      ? doc(db, 
          `classes/${classId}/matieres/${matiereId}/modules/${moduleId}/chapitres/${chapitreId}/lecons/${lessonId}/exercices_video`, 
          exerciceId)
      : doc(collection(db, 
          `classes/${classId}/matieres/${matiereId}/modules/${moduleId}/chapitres/${chapitreId}/lecons/${lessonId}/exercices_video`));

    await setDoc(exerciceRef, {
      titre: data.titre,
      youtubeUrl: data.youtubeUrl
    }, { merge: true });

    return exerciceRef.id;
  } catch (error) {
    console.error("Erreur lors de la sauvegarde de l'exercice vidéo:", error);
    throw error;
  }
};

/**
 * Supprime un exercice vidéo
 * @param {string} classId 
 * @param {string} matiereId 
 * @param {string} moduleId 
 * @param {string} chapitreId 
 * @param {string} lessonId 
 * @param {string} exerciceId 
 * @returns {Promise<void>}
 */
export const deleteExerciceVideo = async (classId, matiereId, moduleId, chapitreId, lessonId, exerciceId) => {
  try {
    await deleteDoc(doc(db, 
      `classes/${classId}/matieres/${matiereId}/modules/${moduleId}/chapitres/${chapitreId}/lecons/${lessonId}/exercices_video`, 
      exerciceId));
  } catch (error) {
    console.error("Erreur lors de la suppression de l'exercice vidéo:", error);
    throw error;
  }
};

// ==================== SUJETS ====================

/**
 * Récupère tous les sujets d'une matière
 * @param {string} classId 
 * @param {string} matiereId 
 * @returns {Promise<Array<{
 *   id: string,
 *   anneeScolaire: string,
 *   etablissement: string,
 *   examinateur: string,
 *   url_doc: string,
 *   sequence: string
 * }>>}
 */
export const getSujetsByMatiere = async (classId, matiereId) => {
  try {
    const querySnapshot = await getDocs(collection(db, `classes/${classId}/matieres/${matiereId}/sujets`));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Erreur lors de la récupération des sujets:", error);
    throw error;
  }
};

/**
 * Ajoute un sujet à une matière
 * @param {string} classId 
 * @param {string} matiereId 
 * @param {string} sujetId 
 * @param {string} anneeScolaire 
 * @param {string} etablissement 
 * @param {string} examinateur 
 * @param {string} url_doc 
 * @param {string} sequence 
 */
export const addSujet = async (classId, matiereId, sujetId, anneeScolaire, etablissement, examinateur, url_doc, sequence) => {
  try {
    const sujetRef = doc(db, `classes/${classId}/matieres/${matiereId}/sujets`, sujetId);
    await setDoc(sujetRef, {
      anneeScolaire,
      etablissement,
      examinateur: examinateur || '',
      url_doc,
      sequence,
      createdAt: serverTimestamp()
    });
    await updateLastUpdate(classId);
  } catch (error) {
    console.error("Erreur lors de l'ajout du sujet:", error);
    throw error;
  }
};

/**
 * Modifie un sujet existant
 * @param {string} classId 
 * @param {string} matiereId 
 * @param {string} sujetId 
 * @param {string} anneeScolaire 
 * @param {string} etablissement 
 * @param {string} examinateur 
 * @param {string} url_doc 
 * @param {string} sequence 
 */
export const updateSujet = async (classId, matiereId, sujetId, anneeScolaire, etablissement, examinateur, url_doc, sequence) => {
  try {
    const sujetRef = doc(db, `classes/${classId}/matieres/${matiereId}/sujets`, sujetId);
    await updateDoc(sujetRef, {
      anneeScolaire,
      etablissement,
      examinateur: examinateur || '',
      url_doc,
      sequence,
      updatedAt: serverTimestamp()
    });
    await updateLastUpdate(classId);
  } catch (error) {
    console.error("Erreur lors de la modification du sujet:", error);
    throw error;
  }
};

/**
 * Supprime un sujet
 * @param {string} classId 
 * @param {string} matiereId 
 * @param {string} sujetId 
 */
export const deleteSujet = async (classId, matiereId, sujetId) => {
  try {
    const sujetRef = doc(db, `classes/${classId}/matieres/${matiereId}/sujets`, sujetId);
    await deleteDoc(sujetRef);
    await updateLastUpdate(classId);
  } catch (error) {
    console.error("Erreur lors de la suppression du sujet:", error);
    throw error;
  }
};