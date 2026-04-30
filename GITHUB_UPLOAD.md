# GitHub Upload Notes

This folder is the clean web app copy for GitHub.

Upload these project files and folders:

- `index.html`
- `app.js`
- `styles.css`
- `server.js`
- `sw.js`
- `manifest.webmanifest`
- `assets/`
- `package.json`
- `package-lock.json`
- `README.md`
- `.gitignore`
- `.env.example`

Do not upload private notes, local data, test folders, screenshots, or logs:

- `docs/`
- `GITHUB_UPLOAD.md`
- `.edge-profile-*`
- `qa-*.png`
- `server.log`
- `server.err.log`
- `data/`

## Run Locally

```powershell
npm start
```

Then open:

```text
http://localhost:4173?workspace=demo-family
```

## GitHub Pages Note

The app can be viewed as a static web app, but the local family-sync server will not run on GitHub Pages. For live shared family data, deploy the Node server or later connect Supabase/Firebase.
