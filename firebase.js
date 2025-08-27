// firebase.js
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAD2Vm5cSdnpFOvP0hgIZwYRyI-V6kq3P8",
  authDomain: "namaz-tracker-6929b.firebaseapp.com",
  projectId: "namaz-tracker-6929b",
  storageBucket: "namaz-tracker-6929b.appspot.com",
  messagingSenderId: "303467179990",
  appId: "1:303467179990:web:ce2c692861b9d7a9b17e77"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps() [0];
const auth = getAuth(app);
const db = getFirestore(app);

function showMessage(message, divId) {
  const messageDiv = document.getElementById(divId);
  if (!messageDiv) return;
  messageDiv.style.display = "block";
  messageDiv.innerHTML = message;
  messageDiv.style.opacity = 1;
  setTimeout(() => {
    messageDiv.style.opacity = 0;
  }, 5000);
}

export { auth, db, showMessage };
