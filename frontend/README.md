# Frontend (webpack)

This frontend uses React + TypeScript and is configured to run with webpack instead of Vite.

Run locally:

```powershell
cd frontend;
npm install;
npm run dev
```

Build (production):

```powershell
npm run build
npx serve dist -s
```

Notes:
- The project was converted from Vite to webpack.
- The `public` folder is copied into the final `dist` so assets in `public` remain available.
