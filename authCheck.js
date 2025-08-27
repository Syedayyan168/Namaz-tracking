// Import Firebase Auth
import { auth, db } from './firebase.js';


// Store current user (null by default)
let currentUser = null;

// Listen for authentication state change
auth.onAuthStateChanged(user => {
    // Get current page filename (e.g., "dashboard.html")
    const currentPage = window.location.pathname.split('/').pop().toLowerCase();
    console.log("Current Page:", currentPage);
    console.log("User Logged In?", !!user);

    // Pages that should NOT be accessed if logged in
    const publicPages = ['index.html', 'login.html', 'register.html'];

    // Pages that require authentication
    const privatePages = [
        'Dashboard.html',
        'namaz-history.html',
        'profile.html',
        'namaz-time.html',
        'weekly.html',
        'daily-pray.html',
        'calender.html'
    ];

    // Set the current user variable
    currentUser = user;

    if (user) {
        // If logged in and on a public page → redirect to dashboard
        if (publicPages.includes(currentPage)) {
            console.log("Redirecting to dashboard...");
            window.location.href = 'dashboard.html';
        }
    } else {
        // If not logged in and trying to access a private page → redirect to login
        if (privatePages.includes(currentPage)) {
            console.log("Redirecting to login/index...");
            window.location.href = 'index.html';
        }
    }
});
