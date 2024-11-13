import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyDR9gRzfEVif-b0yZmZzQylIxcIX3RPHkA",
    authDomain: "projet-22de0.firebaseapp.com",
    projectId: "projet-22de0",
    storageBucket: "projet-22de0.appspot.com",
    messagingSenderId: "370226948536",
    appId: "1:370226948536:web:c743a891db54612edd074d"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, googleProvider, facebookProvider, db, storage };