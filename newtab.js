// newTab.js

function checkFocusMode() {
    return new Promise((resolve) => {
      chrome.storage.local.get(["focusEndTime"], (res) => {
        const { focusEndTime } = res;
        if (focusEndTime && Date.now() < focusEndTime) {
          resolve(true);  // in focus
        } else {
          resolve(false); // not in focus
        }
      });
    });
  }
  
  function setFocusMode(minutes) {
    const focusEndTime = Date.now() + minutes * 60 * 1000;
    chrome.storage.local.set({ focusEndTime }, () => {
      console.log(`Focus mode set for ${minutes} minutes.`);
    });
  }
  
  (async function init() {
    const statusEl = document.getElementById("status");
    const yesBtn = document.getElementById("focusYes");
    const noBtn = document.getElementById("focusNo");
    const inputEl = document.getElementById("focusMinutes");
  
    // If already in focus, show a quick message
    const inFocus = await checkFocusMode();
    if (inFocus) {
      statusEl.textContent = "You are already in focus mode!";
      // If you want to redirect or do something else, you could do so here.
      return;
    }
  
    // If not in focus, let user choose
    yesBtn.addEventListener("click", () => {
      let minutes = parseInt(inputEl.value, 10);
      if (isNaN(minutes) || minutes < 1) {
        minutes = 50; // default
      }
      setFocusMode(minutes);
      statusEl.textContent = "Focus mode activated! Redirecting...";
      // Example redirect
      window.location.href = "https://mediacast.ensta.fr";
    });
  
    noBtn.addEventListener("click", () => {
      statusEl.textContent = "No focus mode started. Enjoy your new tab!";
    });
  })();
  