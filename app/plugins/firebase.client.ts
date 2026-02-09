import { initializeApp, getApps } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const firebaseConfig = {
    apiKey: "AIzaSyDEGikx6E5Aj6OAZcsA-wy8VAatig9GvoA",
  authDomain: "expense-f3dbb.firebaseapp.com",
  projectId: "expense-f3dbb",
  storageBucket: "expense-f3dbb.firebasestorage.app",
  messagingSenderId: "738772022758",
  appId: "1:738772022758:web:cc7acebccd76d697cad227",
  measurementId: "G-WM86QXL1LF"
  }

  // Prevent multiple initializations (HMR / refresh safe)
  const app =
    getApps().length === 0
      ? initializeApp(firebaseConfig)
      : getApps()[0]

  const auth = getAuth(app)
  const db = getFirestore(app)
  const storage = getStorage(app)

  return {
    provide: {
      firebaseApp: app,
      firebaseAuth: auth,
      firestore: db,
      firebaseStorage: storage,
    },
  }
})
