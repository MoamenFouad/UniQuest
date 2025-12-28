import { initializeApp } from "firebase/app";
import {
    getAuth,
    GoogleAuthProvider,
    FacebookAuthProvider,
    OAuthProvider,
    signInWithPopup,
    linkWithPopup,
    unlink
} from "firebase/auth";

// Your real Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAnRTZNZIf9CGHyRb6ECEDDOs_npdulkTY",
    authDomain: "uniquest-6d420.firebaseapp.com",
    projectId: "uniquest-6d420",
    storageBucket: "uniquest-6d420.firebasestorage.app",
    messagingSenderId: "55885729378",
    appId: "1:55885729378:web:d5639afcdeb4c5bd104b3b"
};

// Check if keys are actually configured (ignoring the 'YOUR_API_KEY' placeholder)
const isConfigured = firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY";

// Initialize Firebase once
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Providers
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
export const appleProvider = new OAuthProvider('apple.com');

// Helper for popup login with built-in health check
export const socialLogin = async (provider) => {
    if (!isConfigured) {
        throw new Error("FIREBASE_MISSING_KEYS");
    }
    try {
        const result = await signInWithPopup(auth, provider);
        const idToken = await result.user.getIdToken();
        const providerId = result.providerId.split('.')[0];
        return { idToken, providerId };
    } catch (error) {
        console.error("Firebase social login error:", error);
        throw error;
    }
};

export { signInWithPopup, linkWithPopup, unlink };