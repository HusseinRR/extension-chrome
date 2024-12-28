/****************************************************
 * 1) Check if we are currently in focus mode
 ****************************************************/
function checkFocusMode() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["focusEndTime"], (res) => {
      const { focusEndTime } = res;
      if (focusEndTime && Date.now() < focusEndTime) {
        resolve(true);  // In focus
      } else {
        resolve(false); // Not in focus
      }
    });
  });
}

/****************************************************
 * 1a) Helper to set focus mode for 50 minutes
 ****************************************************/
function setFocusModeFor50Minutes() {
  const focusMinutes = 50;
  const focusEndTime = Date.now() + focusMinutes * 60 * 1000;
  chrome.storage.local.set({ focusEndTime }, () => {
    console.log(`Focus mode set for ${focusMinutes} minutes.`);
  });
}

/****************************************************
 * 2) Show a custom block page if user visits a
 *    blocked site while in focus mode
 ****************************************************/
function showBlockPage(siteName) {
  document.head.innerHTML = generateBlockStyles();
  document.body.innerHTML = generateBlockHTML(siteName);
}

function generateBlockStyles() {
  return `
    <style>
      @import url("https://fonts.googleapis.com/css?family=Open+Sans:500");
      body {
        background: #33cc99;
        color: #fff;
        font-family: "Open Sans", sans-serif;
        max-height: 700px;
        overflow: hidden;
      }
      .c {
        text-align: center;
        display: block;
        position: relative;
        width: 80%;
        margin: 100px auto;
      }
      ._404 {
        font-size: 220px;
        position: relative;
        display: inline-block;
        z-index: 2;
        height: 250px;
        letter-spacing: 15px;
      }
      ._1 {
        text-align: center;
        display: block;
        position: relative;
        letter-spacing: 12px;
        font-size: 4em;
        line-height: 80%;
      }
      ._2 {
        text-align: center;
        display: block;
        position: relative;
        font-size: 20px;
      }
      hr {
        padding: 0;
        border: none;
        border-top: 5px solid #fff;
        color: #fff;
        text-align: center;
        margin: 0px auto;
        width: 420px;
        height: 10px;
        z-index: -10;
      }
      hr:after {
        display: inline-block;
        position: relative;
        top: -0.75em;
        font-size: 2em;
        padding: 0 0.2em;
        background: #33cc99;
      }
      /* If you have CSS animations or "cloud" divs, include them here */
    </style>
  `;
}

function generateBlockHTML(siteName) {
  return `
    <div id="clouds">
      <div class="cloud x1"></div>
      <div class="cloud x1_5"></div>
      <div class="cloud x2"></div>
      <div class="cloud x3"></div>
      <div class="cloud x4"></div>
      <div class="cloud x5"></div>
    </div>
    <div class="c">
      <div class="_404">404</div>
      <hr />
      <div class="_1">GET BACK TO WORK</div>
      <div class="_2">STUDYING > ${siteName}</div>
    </div>
  `;
}

/****************************************************
 * 3) Main function: checks if user is in focus mode,
 *    if site is blocked, etc.
 ****************************************************/
async function main() {
  const inFocus = await checkFocusMode();

  chrome.storage.local.get(["blockedSites"], (res) => {
    const blockedSites = res.blockedSites || [];
    const currentHost = window.location.hostname.toLowerCase();

    for (let site of blockedSites) {
      site = site.toLowerCase().trim();

      // If currentHost is exactly 'youtube.com' or ends with '.youtube.com', etc.
      if (currentHost === site || currentHost.endsWith("." + site)) {
        
        // If already in focus mode, show block page
        if (inFocus) {
          showBlockPage(currentHost.toUpperCase());
        } else {
          // Ask user if they want to start a 50-min session
          const userAgreed = confirm(
            `This site (${currentHost}) is on your blocked list. 
Do you want to start a 50-minute focus session now?`
          );

          if (userAgreed) {
            // Start 50-minute focus
            setFocusModeFor50Minutes();
            // Show block page
            showBlockPage(currentHost.toUpperCase());
          }
          // If user did NOT agree, do nothing => allow access
        }
        // Once we've matched a site, we can stop checking the rest
        break;
      }
    }
  });
}

/****************************************************
 * 4) Run the logic at least once on page load
 ****************************************************/
main();

/****************************************************
 * 5) Detecting in-page navigation (pushState, etc.)
 *    so that "main()" re-runs if the user moves to
 *    another path/subdomain without a full reload.
 ****************************************************/
(function(history) {
  // Store original pushState
  const pushState = history.pushState;
  const replaceState = history.replaceState;

  // Override pushState
  history.pushState = function(...args) {
    const result = pushState.apply(history, args);
    window.dispatchEvent(new Event("locationchange"));
    return result;
  };

  // Override replaceState
  history.replaceState = function(...args) {
    const result = replaceState.apply(history, args);
    window.dispatchEvent(new Event("locationchange"));
    return result;
  };

  // Trigger locationchange on back/forward navigation
  window.addEventListener("popstate", () => {
    window.dispatchEvent(new Event("locationchange"));
  });
})(window.history);

// Listen for our custom event and re-run main()
window.addEventListener("locationchange", () => {
  main();
});
