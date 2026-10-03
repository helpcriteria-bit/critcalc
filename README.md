# CritCalc 📐

An interactive dynamic geometry canvas, math calculator, and AI geometry tutor built with React and Vite.

## ✨ Features

- **Interactive Geometry Canvas**: Draw points, segments, lines, circles (2-point & 3-point), polygons, regular polygons, triangles, and rectangles.
- **Geometric Constructions**: Midpoints, perpendiculars, parallels, perpendicular bisectors, angle bisectors, line/circle intersections, and tangents.
- **Measurements**: Interactive distance ruler, angle arcs, and protractor overlays.
- **Keyboard Shortcuts**: Complete hotkey coverage for all 24+ tools and actions, with a searchable in-app cheatsheet (<kbd>?</kbd>).
- **History & Dependencies**: 40-step undo/redo stack with real-time geometric constraint solving.
- **AI Math Tutor**: Natural language geometry guidance and step-by-step proofs powered by Groq.

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env` and add the API keys you intend to use locally (optional, for AI Tutor):
```bash
cp .env.example .env
```

Do not commit `.env` or put unrestricted API keys in a public deployment. Browser-based API keys are visible to visitors; restrict them to the required APIs and production domain, or use a server-side proxy.

### 3. Start Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```

### 5. Publish to Firebase Hosting

The Hosting target is the Firebase project `critcalc`, which serves `https://critcalc.web.app`. Firebase Hosting access is required. The app's Firebase client configuration remains independent, so existing authentication and saved canvases continue to use the project configured in `.env`.

```bash
firebase login
npm run build
firebase deploy --only hosting
```

The production build statically renders public pages for search engines. After a successful deploy, check the canonical URLs, `https://critcalc.web.app/robots.txt`, and `https://critcalc.web.app/sitemap.xml`.

## ⌨️ Canvas Keyboard Shortcuts

| Tool | Shortcut |
| :--- | :--- |
| Point | <kbd>P</kbd> |
| Line / Segment | <kbd>L</kbd> |
| Circle | <kbd>C</kbd> |
| 3-Point Circle | <kbd>Shift + C</kbd> or <kbd>3</kbd> |
| Triangle | <kbd>T</kbd> |
| Rectangle | <kbd>R</kbd> |
| Regular Polygon | <kbd>Shift + R</kbd> |
| Polygon | <kbd>G</kbd> |
| Midpoint | <kbd>M</kbd> |
| Perpendicular | <kbd>Shift + P</kbd> |
| Parallel | <kbd>Shift + L</kbd> |
| Perpendicular Bisector | <kbd>B</kbd> |
| Angle Bisector | <kbd>Shift + B</kbd> |
| Intersection | <kbd>I</kbd> or <kbd>X</kbd> |
| Tangent | <kbd>Shift + T</kbd> |
| Distance / Ruler | <kbd>D</kbd> |
| Angle Arc | <kbd>A</kbd> |
| Protractor | <kbd>O</kbd> |
| Select | <kbd>V</kbd> |
| Hand (Pan) | <kbd>H</kbd> |
| Eraser | <kbd>E</kbd> |
| Shortcuts Cheatsheet | <kbd>?</kbd> |
| Undo / Redo | <kbd>Ctrl + Z</kbd> / <kbd>Ctrl + Y</kbd> |
| Clear Canvas | <kbd>Alt + Del</kbd> |
