// popup.js

let timerInterval;

// On load, initialize
init();

async function init() {
  const data = await getFocusData();
  updateTimerUI(data);
  setupBlockedSitesUI(data.inFocus);
  setupEventListeners(data);
}

/********************************************
 * 1) Retrieve current focus info
 ********************************************/
function getFocusData() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["focusEndTime"], (res) => {
      const { focusEndTime } = res;
      if (focusEndTime && Date.now() < focusEndTime) {
        const timeLeftMs = focusEndTime - Date.now();
        resolve({ inFocus: true, timeLeftMs });
      } else {
        resolve({ inFocus: false, timeLeftMs: 0 });
      }
    });
  });
}

/********************************************
 * 2) Set a new focus end time (in minutes)
 ********************************************/
function setFocusMode(minutes, callback) {
  const focusEndTime = Date.now() + minutes * 60 * 1000;
  chrome.storage.local.set({ focusEndTime }, callback);
}

/********************************************
 * 3) Update the UI for the focus timer
 ********************************************/
function updateTimerUI({ inFocus, timeLeftMs }) {
  const timerEl = document.getElementById("timer");
  clearInterval(timerInterval);

  if (!inFocus) {
    timerEl.textContent = "Not in focus mode.";
    return;
  }

  // If inFocus, show a live countdown
  function renderTime() {
    chrome.storage.local.get(["focusEndTime"], (res) => {
      const end = res.focusEndTime;
      const diff = end - Date.now();
      if (diff <= 0) {
        timerEl.textContent = "Focus ended just now!";
        clearInterval(timerInterval);
      } else {
        const minutes = Math.floor(diff / 1000 / 60);
        const seconds = Math.floor((diff / 1000) % 60);
        timerEl.textContent = `Time left: ${minutes}m ${seconds}s`;
      }
    });
  }

  renderTime(); // run once immediately
  timerInterval = setInterval(renderTime, 1000);
}

/********************************************
 * 4) Configure the Blocked Sites UI
 ********************************************/
function setupBlockedSitesUI(inFocus) {
  const blockedSitesInput = document.getElementById("blockedSitesInput");
  const saveBlockedSitesBtn = document.getElementById("saveBlockedSitesBtn");

  // Disable editing if currently in focus
  blockedSitesInput.disabled = inFocus;
  saveBlockedSitesBtn.disabled = inFocus;

  // Load the current list from storage
  chrome.storage.local.get(["blockedSites"], (res) => {
    const userSites = res.blockedSites || [];
    blockedSitesInput.value = userSites.join("\n");
  });
}

/********************************************
 * 5) Setup button event listeners
 ********************************************/
function setupEventListeners(initialData) {
  const startBtn = document.getElementById("startBlockBtn");
  const focusInput = document.getElementById("focusMinutes");
  const saveBlockedSitesBtn = document.getElementById("saveBlockedSitesBtn");

  // Start/Extend focus
  startBtn.addEventListener("click", async () => {
    const currentData = await getFocusData();

    let newMinutes = parseInt(focusInput.value, 10);
    if (isNaN(newMinutes) || newMinutes <= 0) {
      newMinutes = 50; // default
    }

    if (currentData.inFocus) {
      // Already in focus => see how many minutes remain
      const leftoverMs = currentData.timeLeftMs;
      const leftoverMinutes = Math.ceil(leftoverMs / (60 * 1000));

      // If user tries to reduce the time below the leftover, block them
      if (newMinutes < leftoverMinutes) {
        showStatus(
          `You still have ${leftoverMinutes} min left. You cannot reduce it.`,
          "red"
        );
        return;
      }
    }

    // If not in focus or user picks a bigger time => set or extend focus
    setFocusMode(newMinutes, () => {
      showStatus("Focus activated!", "green");
      getFocusData().then((updatedData) => {
        updateTimerUI(updatedData);
        // Disable editing the blocked list now that we are in focus
        setupBlockedSitesUI(true);
      });
    });
  });

  // Save updated blocked sites (only if not in focus)
  saveBlockedSitesBtn.addEventListener("click", () => {
    const blockedSitesInput = document.getElementById("blockedSitesInput");
    // Split by lines, trim whitespace, remove empty lines
    const sites = blockedSitesInput.value
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    chrome.storage.local.set({ blockedSites: sites }, () => {
      showStatus("Blocked sites updated!", "green");
    });
  });
}

/********************************************
 * 6) Helper to display a status message
 ********************************************/
function showStatus(message, color) {
  const statusEl = document.getElementById("statusMsg");
  statusEl.innerText = message;
  statusEl.style.color = color;
}
