# Upload Rocket Run to GitHub and build the Android APK

1. Extract the ZIP on your PC.
2. Create a new repository on GitHub.
3. Upload the **contents** of the extracted `rocket-run` folder (not the outer folder itself). Make sure `.github/workflows/android-apk.yml` is included.
4. Commit the files. The `Build Rocket Run Android APK` workflow starts on the push.
5. Open the repository's **Actions** tab and select the latest successful build.
6. Download the `rocket-run-apk` artifact and extract `app-debug.apk`.
7. Transfer the APK to your Android phone and install it. Android may ask you to allow installation from that file manager/browser.

## Rebuilding after edits

Edit files in `src/`, then commit and push. GitHub Actions rebuilds the APK after each push.

For a local build, install Node.js 20, JDK 17 and Android Studio, then run:

```bash
npm install
npm run build
npm run verify
npm run vendor
npx cap add android   # only when the android/ folder does not exist
npx cap sync android
npm run android:prepare
cd android
./gradlew assembleDebug
```

The debug APK is for testing and sideloading. A store release needs a signed release build and your own protected signing key.

## Samsung Gaming Hub note

The Android manifest declares the app category as `game` and uses a dedicated launcher icon. Samsung Gaming Hub controls its own discovery rules, so a sideloaded APK is not guaranteed to appear there automatically. Installing from a recognized store and checking Samsung's Game Hub/Game Launcher settings may still be necessary.
