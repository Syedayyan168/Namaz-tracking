// firebaseauth.js

import {
  auth,
  db,
  showMessage
} from './firebase.js';

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import {
  setDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

// -------- SIGNUP HANDLER --------
const signUp = document.getElementById('submitSignUp');
if (signUp) {
  signUp.addEventListener('click', async (event) => {
    event.preventDefault();

    const email = document.getElementById('rEmail').value;
    const password = document.getElementById('rPassword').value;
    const firstName = document.getElementById('fName').value;
    const lastName = document.getElementById('lName').value;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        email,
        firstName,
        lastName
      });

      showMessage('Account Created Successfully', 'signUpMessage');
      window.location.href = 'index.html';
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        showMessage('Email Address Already Exists !!!', 'signUpMessage');
      } else {
        console.error("Signup Error:", error);
        showMessage('Unable to create user', 'signUpMessage');
      }
    }
  });
}

// -------- SIGNIN HANDLER --------
const signIn = document.getElementById('submitSignIn');
if (signIn) {
  signIn.addEventListener('click', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      localStorage.setItem('loggedInUserId', user.uid);
      showMessage('Login is successful', 'signInMessage');
      window.location.href = 'Dashboard.html';
    } catch (error) {
      if (error.code === 'auth/invalid-credential') {
        showMessage('Incorrect Email or Password', 'signInMessage');
      } else {
        console.error("Login Error:", error);
        showMessage('Account does not exist', 'signInMessage');
      }
    }
  });
}
