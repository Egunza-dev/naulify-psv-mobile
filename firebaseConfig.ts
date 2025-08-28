import { initializeApp } from "firebase/app";
import {
// Import both initialization methods
initializeAuth,
getAuth, // The standard web-first auth initializer
getReactNativePersistence,
GoogleAuthProvider
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { Platform } from 'react-native'; // Import the Platform module
// Your web app's Firebase configuration (no changes here)
const firebaseConfig = {
apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};
// Configure Google Sign-In (no changes here)
GoogleSignin.configure({
webClientId: 'YOUR_WEB_CLIENT_ID',
});
// Initialize Firebase App
const app = initializeApp(firebaseConfig);
// THE DEFINITIVE FIX IS HERE
// We create a function to initialize auth based on the platform.
const createAuth = () => {
if (Platform.OS === 'web') {
// For the web, use the standard getAuth which uses browser storage.
return getAuth(app);
} else {
// For native platforms, initialize with React Native's AsyncStorage for persistence.
return initializeAuth(app, {
persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
}
};
// Call the function to create the auth object.
export const auth = createAuth();
// Export other services (no changes here)
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
