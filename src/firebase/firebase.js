// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBPLyo8BtdCi1cfVg6NC7lLuxiqn5uzUmI",
  authDomain: "smartbudget-47030.firebaseapp.com",
  projectId: "smartbudget-47030",
  storageBucket: "smartbudget-47030.firebasestorage.app",
  messagingSenderId: "78827391061",
  appId: "1:78827391061:web:cbf85c2b1508f1760b2cdc",
  measurementId: "G-RYK2LQ7TXM",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };
