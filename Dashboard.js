// dashboard.js

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import {
  getFirestore,
  getDoc,
  setDoc,
  doc,
  collection,
  getDocs,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyAD2Vm5cSdnpFOvP0hgIZwYRyI-V6kq3P8",
  authDomain: "namaz-tracker-6929b.firebaseapp.com",
  projectId: "namaz-tracker-6929b",
  storageBucket: "namaz-tracker-6929b.firebasestorage.app",
  messagingSenderId: "303467179990",
  appId: "1:303467179990:web:ce2c692861b9d7a9b17e77"
};

// Initialize Firebase only once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

// Auth listener to load user info and data
onAuthStateChanged(auth, async user => {
  if (!user) {
    console.log("No user signed in, redirecting to login...");
    window.location.href = 'index.html';  // redirect if not logged in
    return;
  }
  try {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      document.getElementById("loggedUserFName").innerText = userData.firstName || "";
      document.getElementById("loggedUserLName").innerText = userData.lastName || "";
      document.getElementById("loggedUserEmail").innerText = userData.email || "";

      await loadPrayerHistory(user.uid);
      await loadWeeklyStats(user.uid);
      await loadDailyPrayerStats(user.uid);
    }
  } catch (err) {
    console.error("Error loading user data:", err);
  }
});

// Utility: Get current Pakistan date string YYYY-MM-DD
function getPKDateString() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const pkTime = new Date(utc + 5 * 3600000);
  return pkTime.toISOString().split("T")[0];
}

document.addEventListener("DOMContentLoaded", () => {
  const saveBtn = document.getElementById("saveBtn");
  if (saveBtn) {
    saveBtn.addEventListener("click", async () => {
      const user = auth.currentUser;
      if (!user) {
        alert("User not logged in.");
        return;
      }

      saveBtn.disabled = true;
      saveBtn.textContent = "Saving...";

      let dateStr;
      try {
        dateStr = getPKDateString();
      } catch (e) {
        console.error("Date error:", e);
        alert("Error getting current date.");
        saveBtn.disabled = false;
        saveBtn.textContent = "Save Namaz";
        return;
      }

      const prayerData = {
        fajr: document.querySelector('input[name="fajr"]:checked')?.value ?? "qaza",
        zohor: document.querySelector('input[name="zohor"]:checked')?.value ?? "qaza",
        asr: document.querySelector('input[name="asr"]:checked')?.value ?? "qaza",
        maghrib: document.querySelector('input[name="maghrib"]:checked')?.value ?? "qaza",
        isha: document.querySelector('input[name="isha"]:checked')?.value ?? "qaza",
      };

      try {
        await setDoc(doc(db, "users", user.uid, "namaz", dateStr), prayerData);
        await setDoc(doc(db, "history", `${user.uid}_${dateStr}`), {
          ...prayerData,
          uid: user.uid,
          date: dateStr,
          timestamp: new Date().toISOString()
        });

        alert("✅ Namaz saved successfully.");
        await loadPrayerHistory(user.uid);
        await loadWeeklyStats(user.uid);
        await loadDailyPrayerStats(user.uid);
      } catch (err) {
        console.error("Error saving data:", err);
        alert("❌ Failed to save Namaz data.");
      } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = "Save Namaz";
      }
    });
  }

  // ✅ Add logout button logic here
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try {
        await signOut(auth);
        alert("Logged out successfully.");
        window.location.href = "index.html";
      } catch (error) {
        console.error("Logout error:", error);
        alert("Error logging out. Try again.");
      }
    });
  }
});

// -------------- LOAD PRAYER HISTORY ----------------
async function loadPrayerHistory(uid) {
  const historyDiv = document.getElementById("historyContent");
  if (!historyDiv) {
    console.error("historyContent element not found!");
    return;
  }

  try {
    const q = collection(db, "users", uid, "namaz");
    const querySnapshot = await getDocs(q);

    let html = `<h3>Prayer History:</h3><div class="history-cards">`;

    querySnapshot.forEach(doc => {
      const data = doc.data();
      html += `
        <div class="history-card">
          <h4>${doc.id}</h4>
          <ul>
            ${Object.entries(data).map(([namaz, status]) => `
              <li>
                <span class="namaz-name">${namaz.toUpperCase()}</span>
                <span class="status ${status.toLowerCase()}">${status}</span>
              </li>
            `).join('')}
          </ul>
        </div>
      `;
    });

    html += `</div>`;
    historyDiv.innerHTML = html;
  } catch (err) {
    console.error("Error loading prayer history:", err);
  }
}

// -------------- LOAD WEEKLY STATS -----------------
async function loadWeeklyStats(uid) {
  const weeklyStatsDiv = document.getElementById("weeklyStats");
  if (!weeklyStatsDiv) {
    console.error("weeklyStats element not found!");
    return;
  }

  try {
    const snapshot = await getDocs(collection(db, "users", uid, "namaz"));
    if (snapshot.empty) {
      weeklyStatsDiv.innerHTML = "<p>No prayer records found.</p>";
      return;
    }

    const weeks = {};

    snapshot.forEach(docSnap => {
      const dateStr = docSnap.id;
      const prayerData = docSnap.data();

      const [year, month, day] = dateStr.split("-").map(Number);
      const dateObj = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
      const pkDateObj = new Date(dateObj.getTime() + 5 * 3600000); // Adjust to PK time

      const weekStartPK = getWeekStartDate(pkDateObj);
      const weekStartStr = weekStartPK.toISOString().split("T")[0];

      if (!weeks[weekStartStr]) weeks[weekStartStr] = { offered: 0, total: 0 };

      // Count each prayer of the day
      Object.values(prayerData).forEach(status => {
        weeks[weekStartStr].total++;
        if (status.toLowerCase().trim() === "offered") {
          weeks[weekStartStr].offered++;
        }
      });
    });

    const sortedWeeks = Object.keys(weeks).sort((a, b) => b.localeCompare(a));

    let html = `<h3 class="stats-title">📊 Weekly Prayer Completion:</h3><div class="weekly-cards">`;

    sortedWeeks.forEach(weekStart => {
      const { offered, total } = weeks[weekStart];
      const percentage = total > 0 ? Math.round((offered / total) * 100) : 0;

      html += `
        <div class="stat-card">
          <h4>Week Starting: ${weekStart}</h4>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${percentage}%">${percentage}%</div>
          </div>
        </div>
      `;
    });

    html += `</div>`;
    weeklyStatsDiv.innerHTML = html;

  } catch (err) {
    console.error("Error loading weekly stats:", err);
    weeklyStatsDiv.innerHTML = "<p>Error loading stats. Try again.</p>";
  }
}

// Helper to get start of week (Monday in PK time)
function getWeekStartDate(date) {
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Sunday => -6, Monday => 0, etc.
  const weekStart = new Date(date);
  weekStart.setDate(weekStart.getDate() + diff);
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
}


// -------------- LOAD DAILY PRAYER STATS ----------------
async function loadDailyPrayerStats(uid) {
  const dailyStatsDiv = document.getElementById("dailyStats"); // changed to separate div!
  if (!dailyStatsDiv) {
    console.error("dailyStats element not found!");
    return;
  }

  try {
    const snapshot = await getDocs(collection(db, "users", uid, "namaz"));
    if (snapshot.empty) {
      dailyStatsDiv.innerHTML = "<p>No prayer records found.</p>";
      return;
    }

    const sortedDocs = snapshot.docs.sort((a, b) => b.id.localeCompare(a.id));

    let html = "<h3>Daily Prayer Completion:</h3><ul>";

    sortedDocs.forEach(docSnap => {
      const dateStr = docSnap.id;
      const prayerData = docSnap.data();

      let offered = 0;
      let total = 0;

      Object.values(prayerData).forEach(status => {
        total++;
        if (status.toLowerCase().trim() === "offered") offered++;
      });

      const percentage = total > 0 ? Math.round((offered / total) * 100) : 0;
      html += `<li><strong>${dateStr}</strong>: ${percentage}% prayers offered</li>`;
    });

    html += "</ul>";
    dailyStatsDiv.innerHTML = html;
  } catch (err) {
    console.error("Error loading daily prayer stats:", err);
  }
}
