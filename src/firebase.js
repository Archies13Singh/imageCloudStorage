// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyDM3y0k_vskmmCBjURwbrKUp7bx7b9Udoo",
    authDomain: "imagestorage-6c529.firebaseapp.com",
    projectId: "imagestorage-6c529",
    storageBucket: "imagestorage-6c529.appspot.com",
    messagingSenderId: "575392187110",
    appId: "1:575392187110:web:cbed82e052b107dc73b127",
    measurementId: "G-D7T07M7GXZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const auth = getAuth(app)

