# PEI Planner – refactor (HTML + CSS + JS)

File separati:
- `index.html`
- `assets/css/styles.css`
- `assets/js/app.js`

## Caching / Offline
Incluso `service-worker.js` per cache degli asset statici (HTML/CSS/JS).
Nota: la libreria DOCX è da CDN (`html-docx-js`). Per uso offline, scaricala e sostituisci lo `<script src="https://...">` con un percorso locale.

Build: 2026-01-05
