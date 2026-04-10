# FysioApp — Deployment Guide

This is a zero-build PWA. No npm, no terminal needed to deploy.
Just put the files on GitHub Pages and open the URL on your phone.

---

## Step 1 — Create a GitHub account (free)

Go to https://github.com and sign up with a free account.

---

## Step 2 — Create a new repository

1. Click the **+** button (top right) → **New repository**
2. Name it: `fysio-app` (or anything you like)
3. Set it to **Public**
4. Click **Create repository**

---

## Step 3 — Upload the files

1. On the repository page, click **uploading an existing file**
2. Drag and drop **all the files and folders** from this project:
   ```
   index.html
   manifest.json
   sw.js
   css/
   js/
   icons/
   ```
3. Scroll down, click **Commit changes**

---

## Step 4 — Enable GitHub Pages

1. Go to your repository → **Settings** tab
2. Left sidebar → **Pages**
3. Under "Source", select **Deploy from a branch**
4. Branch: **main**, folder: **/ (root)**
5. Click **Save**

GitHub will show you your URL — it looks like:
```
https://yourusername.github.io/fysio-app/
```

It takes about 1–2 minutes to go live.

---

## Step 5 — Install on your phone

### Android
1. Open Chrome on your Android phone
2. Go to your GitHub Pages URL
3. Tap the **⋮** menu (three dots, top right)
4. Tap **Add to Home screen**
5. Tap **Add** — done!

### iPhone
1. Open **Safari** on your iPhone (must be Safari, not Chrome)
2. Go to your GitHub Pages URL
3. Tap the **Share** button (square with arrow)
4. Scroll down → tap **Add to Home Screen**
5. Tap **Add** — done!

---

## Updating the app

If you want to update the app later (e.g. after a new version):
1. Go to your GitHub repository
2. Click on the file you want to replace → **Edit** (pencil icon) or drag new files
3. Commit the changes
4. GitHub Pages updates automatically within a minute or two
5. On your phone: open the app and refresh once — the new version loads

---

## Sharing with colleagues

Your app URL is:
```
https://yourusername.github.io/fysio-app/
```

Anyone with this URL can install the app.

To share your exercise/workout database with a colleague:
1. Open the app → **Settings** → **Export database**
2. A `.json` file is saved to your downloads
3. Send it via WhatsApp or email
4. Colleague opens the app → **Settings** → **Import database**
5. They now have the exact same exercises and workouts

---

## Troubleshooting

**App doesn't load offline?**  
The service worker caches on first visit. Make sure you opened the app once with internet before going offline.

**Data disappeared?**  
This can happen if Chrome's site data was cleared, or on very old iOS. Use the Export/Import feature regularly as a backup.

**Changes not showing after update?**  
Close and reopen the app, or do a hard refresh in the browser (hold reload button).
