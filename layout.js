// Function to show/hide content sections
function showSection(sectionId) {
  const sections = document.querySelectorAll('.content-section');
  sections.forEach(section => {
    section.style.display = 'none';
  });

  const target = document.getElementById(sectionId);
  if (target) {
    target.style.display = 'block';
  }
}

// Format date for Pakistan
function formatDate(date) {
  return date.toLocaleDateString('en-PK', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Timer placeholder (you can replace with actual logic)
function updateEndingTimer(now) {
  // console.log("Timer updated:", now);
}

document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const menuBtn = document.getElementById("menuToggle");
  const sidebar = document.getElementById("sidebar");

  // Toggle sidebar
  if (menuBtn && sidebar) {
    menuBtn.addEventListener("click", () => {
      sidebar.classList.toggle("active");
    });
  }

  // Show dashboard section by default
  showSection('dashboard');

  // Show today's date
  const today = new Date();
  const dateEl = document.getElementById('date');
  if (dateEl) {
    dateEl.textContent = `Today's Date: ${formatDate(today)}`;
  }

  // Live clock and timer updater
  setInterval(() => {
    const now = new Date();

    const gregorianDateEl = document.getElementById("gregorianDate");
    if (gregorianDateEl) gregorianDateEl.textContent = now.toDateString();

    const liveClockEl = document.getElementById("liveClock");
    if (liveClockEl) liveClockEl.textContent = now.toLocaleTimeString();

    updateEndingTimer(now);
  }, 1000);
});
