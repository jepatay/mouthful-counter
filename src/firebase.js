import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyD4bScoD55CRnzY_Dyt1STko3Eut7tR1yk",
  authDomain: "mouthful-counter.firebaseapp.com",
  projectId: "mouthful-counter",
  storageBucket: "mouthful-counter.firebasestorage.app",
  messagingSenderId: "891897284579",
  appId: "1:891897284579:web:b7e5abca0a9eb46ed2c2d6",
};

const app = initializeApp(firebaseConfig);

export default app;
