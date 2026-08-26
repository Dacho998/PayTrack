import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCBRh4Bd-iLSewMWbAqMtJRzjvD0Q2v7wE",
  authDomain: "paytrack-ca731.firebaseapp.com",
  projectId: "paytrack-ca731",
  storageBucket: "paytrack-ca731.firebasestorage.app",
  messagingSenderId: "65918548891",
  appId: "1:65918548891:web:eb1f7129a614c1cd9ebf3e",
  measurementId: "G-TCF9NVTX11"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);