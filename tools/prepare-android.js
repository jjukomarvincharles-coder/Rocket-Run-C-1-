const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const androidRoot = path.join(root, 'android');
const appRoot = path.join(androidRoot, 'app', 'src', 'main');
const manifestPath = path.join(appRoot, 'AndroidManifest.xml');
const resRoot = path.join(appRoot, 'res');

if (!fs.existsSync(manifestPath)) {
  console.error('Android project not found. Run `npx cap add android` first.');
  process.exit(1);
}

let manifest = fs.readFileSync(manifestPath, 'utf8');
manifest = manifest.replace(/<application\b([^>]*)>/, (match, attrs) => {
  let next = attrs;
  if (/android:appCategory=/.test(next)) next = next.replace(/android:appCategory="[^"]*"/, 'android:appCategory="game"');
  else next += ' android:appCategory="game"';
  if (!/android:icon=/.test(next)) next += ' android:icon="@mipmap/ic_launcher"';
  if (!/android:roundIcon=/.test(next)) next += ' android:roundIcon="@mipmap/ic_launcher_round"';
  return `<application${next}>`;
});
manifest = manifest.replace(/<activity\b([^>]*)>/, (match, attrs) => {
  if (/android:screenOrientation=/.test(attrs)) attrs = attrs.replace(/android:screenOrientation="[^"]*"/, 'android:screenOrientation="fullUser"');
  else attrs += ' android:screenOrientation="fullUser"';
  return `<activity${attrs}>`;
});
if (!manifest.includes('android.permission.VIBRATE')) {
  manifest = manifest.replace('</manifest>', '    <uses-permission android:name="android.permission.VIBRATE" />\n</manifest>');
}
fs.writeFileSync(manifestPath, manifest);

const iconRoot = path.join(root, 'android-res');
for (const density of ['mipmap-mdpi','mipmap-hdpi','mipmap-xhdpi','mipmap-xxhdpi','mipmap-xxxhdpi','mipmap-anydpi-v26','values']) {
  const source = path.join(iconRoot, density);
  const target = path.join(resRoot, density);
  if (!fs.existsSync(source)) continue;
  fs.mkdirSync(target, { recursive: true });
  for (const file of fs.readdirSync(source)) {
    const srcFile=path.join(source,file),dstFile=path.join(target,file);
    if(file==='colors.xml' && fs.existsSync(dstFile)) {
      let existing=fs.readFileSync(dstFile,'utf8');
      if(!/name="rocket_run_icon_background"/.test(existing)) existing=existing.replace('</resources>','    <color name="rocket_run_icon_background">#020816</color>\n</resources>');
      fs.writeFileSync(dstFile,existing);
    } else fs.copyFileSync(srcFile,dstFile);
  }
}
console.log('Android game category, flexible orientation, vibration permission and Rocket Run adaptive launcher icons applied.');
