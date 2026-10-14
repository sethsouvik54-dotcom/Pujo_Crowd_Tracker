import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD4m0nJ1rAtu_D4zRD0bW8aR7OSpR0cW28",
  authDomain: "pujo-crowd-tracker.firebaseapp.com",
  projectId: "pujo-crowd-tracker",
  storageBucket: "pujo-crowd-tracker.firebasestorage.app",
  messagingSenderId: "227301411925",
  appId: "1:227301411925:web:8934d60e6c714cf4ead8dc",
  measurementId: "G-72RX7CXT2W"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);