# Build the Rocket Run APK (no coding needed)

## Easiest: GitHub builds it for you (free)
1. Create a free account at github.com and click **New repository** (any name, Public or Private).
2. On the new repo page choose **uploading an existing file**, then drag in EVERYTHING from this folder
   (`src`, `tools`, `www`, `.github`, `package.json`, `capacitor.config.json`). Make sure the `.github` folder is included.
   (If the web uploader skips `.github`, create the file `.github/workflows/android-apk.yml` with **Add file → Create new file** and paste the contents.)
3. Click **Commit changes**. Open the **Actions** tab — the "Build Android APK" job starts by itself.
4. When it shows a green tick, open the run and download **rocket-run-apk** at the bottom. Unzip it: `app-debug.apk`.
5. Copy the APK to your Android phone, open it, and allow "Install unknown apps" when asked.

## Alternative: Android Studio on a PC
Install Node 20, JDK 17 and Android Studio, then in this folder run:
`npm install` → `npm run build` → `npm run verify` → `npm run vendor` → `npx cap add android` (once) → `npx cap sync android` → `npm run android:prepare` → `npx cap open android` → Build ▸ Build APK.
The preparation script applies the game category, safe-area launcher icons, flexible orientation and VIBRATE permission automatically.

## Play Store (.aab)
The debug APK is for testing/sideloading. A Play Store bundle needs your own signing key:
Android Studio ▸ Build ▸ Generate Signed Bundle / APK ▸ Android App Bundle. Keep the keystore file safe.

## Known limits of this build
- Not yet tested on a real device by the author: please report anything odd.
- "Capture photo" in Photo Mode uses a browser download and may not save inside the Android WebView.
- AI voice uses the phone's text-to-speech if available; subtitles always show.


## Android game classification and Samsung Game Hub
The Android package declares `android:appCategory="game"`, uses a custom adaptive launcher icon, and is configured for landscape gameplay. This supplies the correct Android game-category metadata. Samsung Gaming Hub still controls its own discovery/classification and may not automatically list a manually sideloaded APK; Play Store category and Samsung device settings can affect discovery.
