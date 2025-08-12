// Importez les fonctions Firebase dont vous avez besoin
import { initializeApp } from "firebase/app";
// Importez les services Firebase que vous souhaitez utiliser
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Votre configuration Firebase (remplacez par vos propres valeurs)
const firebaseConfig = {
  apiKey: "AIzaSyBi9oFrj5dri_xA3txtjUoGbX1O87wn4rY",
  authDomain: "revision-14f2b.firebaseapp.com",
  projectId: "revision-14f2b",
  storageBucket: "revision-14f2b.firebasestorage.app",
  messagingSenderId: "566669664431",
  appId: "1:566669664431:web:a424ae0101526863fd345a",
  measurementId: "G-CY572K2HN0"
};

// Initialisez Firebase
const app = initializeApp(firebaseConfig);

// Initialisez les services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Exportez les services dont vous avez besoin
export { auth, db, storage };