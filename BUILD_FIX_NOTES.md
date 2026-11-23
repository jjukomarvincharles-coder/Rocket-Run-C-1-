# Rocket Run V12 Android build fix

The previous GitHub Actions run completed dependency installation, game bundling, and the project verification step. It failed only in `npm run vendor`.

The cause was an incorrect assumption in `tools/vendor-three.js`: the script expected both Capacitor packages to publish their ESM entry files under `dist/esm/`. Capacitor Core 6.1.0 declares its ESM module entry as `dist/index.js`, so the old check failed even though the package had been installed. The upstream Capacitor Core 6.1.0 package metadata confirms this `module` entry.

The updated vendor script now reads each installed package's own `module` (or `browser`) entry, copies the complete `dist/` directory into `www/vendor`, and rewrites the import map to the correct local file. This preserves relative imports within each package and supports packages whose module entry is under either `dist/` or `dist/esm/`.

## What to replace in GitHub

Upload/replace these files from this patch in the existing repository:

- `tools/vendor-three.js`
- `src/index.template.html`
- `.github/workflows/android-apk.yml`

Then commit and push. The workflow will run again automatically.

## Validation performed here

- `npm run build`: passed.
- `npm run verify`: passed.
- `tools/vendor-three.js`: syntax check passed.
- Vendor-copy test with fixture packages matching Capacitor Core's `dist/index.js` and the plugin's `dist/esm/index.js` layout: passed.

A full Android Gradle build and physical-phone installation were not run in this environment.
