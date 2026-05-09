// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
export const auth = getAuth(app);
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDwHvU_fHp4iXZ-_HeDIZUfMCAP88jwuPc",
  authDomain: "happy-car-bazaar.firebaseapp.com",
  projectId: "happy-car-bazaar",
  storageBucket: "happy-car-bazaar.firebasestorage.app",
  messagingSenderId: "73497003975",
  appId: "1:73497003975:web:1069d6f3c0eae7ae12bbe2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);