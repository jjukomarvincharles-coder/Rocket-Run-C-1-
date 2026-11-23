# ROCKET RUN — project layout

| Folder | What is in it |
|---|---|
| `dist/ROCKET_RUN.html` | **The playable game** — one file, double-click to play. |
| `src/css/` | Styles, split by area (core HUD, cockpit, phone overrides). |
| `src/html/` | Page markup (canvas, HUD, overlays). |
| `src/js/` | Game code in 45 numbered sections (`14_fx.js`, `40_main-loop.js`, `41_performance-manager.js` …). |
| `src/index.template.html` | Page shell that the build fills in. |
| `tools/build.js` | Joins `src/` into `dist/ROCKET_RUN.html` and `www/index.html`. Run: `node tools/build.js` |
| `tools/vendor-three.js` | Copies Three.js and Capacitor App/Core locally so the Android app can load its game modules and Back-button integration offline. |
| `www/` | Generated web folder used by the Android wrapper. |
| `.github/workflows/` | Builds the Android APK automatically on GitHub. |

**Why one built file and not separate script files?** Browsers refuse to load separate JavaScript module files when a page is opened by double-click (`file://`).
The build step keeps the code organised in folders *and* keeps the game playable straight from your desktop or phone.

Edit files in `src/`, run `node tools/build.js`, play `dist/ROCKET_RUN.html`.
In-game: Pause menu → **FPS INFO** shows live FPS, resolution scale, draw calls and triangles. **BATTERY SAVER** caps to 30 FPS.

## v12 mobile and Android improvements
- Gameplay utility controls are reduced to a single camera switch and the co-pilot drone toggle; pause is accessed with Android Back and sound remains in Settings.
- Android hardware Back uses the Capacitor App plugin: gameplay opens Pause, Back from Pause resumes, sub-screens restore the previous screen, and the Main Menu requires a second Back press to exit.
- Menus and overlays scroll inside the phone's safe screen area. Portrait menus remain usable; flight asks for landscape.
- Hyperdrive adds a radial background blur while the centre flight focus remains sharper; existing speed lines and world acceleration remain enabled.
- Android is tagged with `android:appCategory="game"` and receives a custom launcher icon.

## Build Android locally
`npm install` → `npm run build` → `npm run verify` → `npm run vendor` → `npx cap add android` (once) → `npx cap sync android` → `npm run android:prepare` → `cd android && ./gradlew assembleDebug`.

## Smoke test (optional, for developers)
`tools/test/` runs the real game code in a headless browser against a stand-in Three.js, clicks through the menus, starts every game mode and plays ~20 s
with abilities and camera switches, reporting any JavaScript error. It checks game logic, not graphics or FPS.
Install the optional test runner with `npm install --no-save playwright` and `npx playwright install chromium`, then run `node tools/test/modes.js $(pwd)/dist/ROCKET_RUN.html`.

### v11 notes
- Screen effects (vignette, damage/hit flash, boost tunnel, tints, shield glow) are drawn by ONE shader pass (`src/js/40a_screen-fx.js`) instead of ~12 full-screen DOM layers.
- `src/js/41_performance-manager.js` measures CPU time per frame and picks the remedy (fewer effects when CPU-bound; resolution/AA/glow when GPU-bound). FPS INFO shows `cpu` ms.
- Planets (`08_background.js`) are placed with 3D + screen-space clearance, drift at one shared speed, and are disposed when recycled.
- Extra tests: `tools/test/planets_test.js` (placement/leak stress) and `tools/test/shader_test.js` (compiles the effect shader in real WebGL).
