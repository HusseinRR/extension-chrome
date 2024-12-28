# ChromeFocus: A Productivity Extension

This repository contains a **Google Chrome** extension designed to help you stay focused by blocking distracting websites during a configurable _Focus Mode_. When Focus Mode is active, visiting a blocked site redirects you to a motivational page instead of the site’s content. The extension also offers a custom new tab page with quick Focus Mode activation.

---

## Features

- **Focus Mode Timer**: Easily enable a focus session for a user-defined number of minutes (default is 50).  
- **Website Blocking**: Maintains a list of blocked sites. When in Focus Mode, visiting any blocked site shows a “Get Back to Work” page.  
- **Prompt to Focus**: If you are **not** in Focus Mode and attempt to visit a blocked site, the extension will prompt you to start a 50-minute Focus Mode session.  
- **New Tab Override**: Replaces the default new tab page with a custom page that allows quick activation of Focus Mode.  
- **Popup UI**: Use the popup (accessible from the extension’s icon) to start/extend focus time, see the countdown timer, and configure blocked sites.  

---

## How It Works

1. **Focus Timer**:  
   - When you start a Focus Mode (e.g., 50 minutes), the extension saves an `endTime` (current time + chosen minutes) in Chrome’s local storage.  
   - As long as the current time is less than `endTime`, you are in Focus Mode.  

2. **Blocking Logic**:  
   - The extension checks if the current website is in the blocked sites list (by hostname).  
   - If you are in Focus Mode, it will replace the page with a custom “GET BACK TO WORK” page.  
   - If you are **not** in Focus Mode, the extension will prompt you to start Focus Mode for 50 minutes when you land on a blocked site.  

3. **New Tab Override**:  
   - When you open a new tab, a custom page (`newTab.html`) displays a prompt to start Focus Mode (if you’re not already in it) or notifies you that you are already in Focus Mode.  

4. **Popup**:  
   - The popup (`popup.html`) shows the remaining time if you are in Focus Mode, or “Not in focus mode.” if not.  
   - You can configure how many minutes you want for your focus session.  
   - You can edit the list of blocked sites unless you are currently in an active Focus Mode.  

---

## Installation

1. **Clone or Download** this repository.  
2. Open **Google Chrome** (or any Chromium-based browser) and go to:   chrome://extensions/
3.  Turn on **Developer mode** (toggle switch in the upper right corner).  
4. Click on **Load unpacked**.  
5. Select the folder where you have this repository.  

Chrome will now load the extension. You should see **Focus Extension** in your list of extensions.

---

## Usage

1. **Configure Blocked Sites**:  
- Click on the extension icon.  
- In the popup, scroll down to the “Blocked Sites” section.  
- Enter one hostname (e.g., `www.youtube.com`) per line.  
- Click **Save Block List**.  

2. **Start a Focus Session**:  
- Still in the popup, under “Set Focus Time,” enter the number of minutes (default: 50).  
- Click **Start Focus**.  
- The popup will show a countdown for the session.  

3. **Browse as Usual**:  
- If you visit a blocked site during Focus Mode, you’ll see the “404 GET BACK TO WORK” page.  
- If you attempt to visit a blocked site **without** being in Focus Mode, the extension will ask if you want to start a 50-minute session. You can either accept or decline.

4. **New Tab**:  
- The extension overrides the new tab page.  
- If you open a new tab and you are not in Focus Mode, you can quickly start a Focus session from there.  
- If you are in Focus Mode already, it will let you know.  

5. **Ending or Extending Focus**:  
- The Focus Mode timer automatically ends after the specified time.  
- If you want to extend the current focus time, just enter a bigger number of minutes in the popup and hit **Start Focus** again.  

---

## Configuration

- **Focus Minutes**: Default is 50, but you can set any positive integer in the popup or on the new tab page.  
- **Blocked Sites**:  
- Add or remove sites in the popup by listing hostnames, one per line.  
- Once you start a Focus session, you **cannot** edit the blocked sites until the session ends.  

---

## Code Overview

The extension uses the **Manifest V3** format and consists of several files:

### `manifest.json`

- **Permissions**: Requests `"storage"` to store user settings (blocked sites, focus times).  
- **Content Scripts**: Injects `content.js` on all pages.  
- **Background**: Uses `background.js` as the service worker for extension events.  
- **Chrome URL Overrides**: Replaces the new tab page with `newTab.html`.  
- **Action**: Defines popup UI via `popup.html`.

### `content.js`

1. **Check Focus Mode**: Looks up `focusEndTime` in Chrome storage to see if the user is in Focus Mode.  
2. **Blocked Site Detection**: Compares the current hostname to the blocked sites list.  
3. **Prompt or Block**:
- If in Focus Mode, display a custom block page.  
- If not in Focus Mode, prompt user to start a Focus session.  
4. **Dynamic Navigation Handling**:  
- Watches for history pushState/replaceState events to detect single-page app (SPA) navigation changes.  
- Re-runs the blocking logic whenever the URL changes.

### `popup.html` & `popup.js`

- **Popup UI**  
- Displays the current Focus Mode status (timer or “Not in focus mode”).  
- Allows the user to set a new Focus session and duration.  
- Contains a textarea to list blocked sites.  
- **Saves** user changes to Chrome local storage.  
- **Live Countdown** for the remaining Focus Mode time.  

### `newTab.html` & `newTab.js`

- Replaces the default new tab.  
- If **not** in Focus Mode, asks if the user wants to start.  
- If **in** Focus Mode, informs the user that Focus Mode is already active.  

### `background.js`

- The service worker (background script) handles extension install and startup events (for logging or any initialization).

---

## Contributing

Contributions are welcome! To contribute:

1. **Fork** this repository.  
2. Create a **feature branch** (`git checkout -b feature/my-new-feature`).  
3. Commit your changes (`git commit -m 'Add some feature'`).  
4. **Push** to your fork (`git push origin feature/my-new-feature`).  
5. Open a **Pull Request**.  

---


### Enjoy your distraction-free browsing!

If you have any questions or suggestions, feel free to open an issue or submit a pull request. Happy focusing!
