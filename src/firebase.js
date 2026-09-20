import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// คอนฟิกหลักของโปรเจกต์ smokedetect
const firebaseConfig = {
  apiKey: "AIzaSyCs5bRbF49De80uOiTj_D3rR1bPSeonn58", // คัดลอกมาจาก Firebase Console
  authDomain: "smokedetect-e7e05.firebaseapp.com",
  projectId: "smokedetect-e7e05",
  databaseURL: "https://smokedetect-e7e05-default-rtdb.asia-southeast1.firebasedatabase.app",
  appId: "1:968022866972:web:18b9575b9d7ba218b573d9"    // คัดลอกมาจาก Firebase Console
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
