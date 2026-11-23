// Copies Three.js and the installed Capacitor ESM distributions into www/vendor.
// Capacitor Core v6 publishes its module entry at dist/index.js (not dist/esm/index.js),
// while individual plugins may use dist/esm/index.js. Read each package's `module`
// field instead of assuming a shared directory layout.
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const nodeModules = path.join(root, 'node_modules');
const www = path.join(root, 'www');
const vendor = path.join(www, 'vendor');

function fail(message) {
  console.error(`[vendor] ${message}`);
  process.exit(1);
}

function copyThree() {
  const src = path.join(nodeModules, 'three');
  if (!fs.existsSync(src)) fail('Three.js is not installed. Run "npm install" first.');

  const buildFile = path.join(src, 'build', 'three.module.js');
  const addonsDir = path.join(src, 'examples', 'jsm');
  if (!fs.existsSync(buildFile) || !fs.existsSync(addonsDir)) {
    fail('Three.js package is incomplete; expected build/three.module.js and examples/jsm/.');
  }

  const dst = path.join(vendor, 'three');
  fs.rmSync(dst, { recursive: true, force: true });
  fs.mkdirSync(path.join(dst, 'build'), { recursive: true });
  fs.copyFileSync(buildFile, path.join(dst, 'build', 'three.module.js'));
  fs.cpSync(addonsDir, path.join(dst, 'examples', 'jsm'), { recursive: true });
}

function copyCapacitorPackage(packageName, vendorName) {
  const packageDir = path.join(nodeModules, ...packageName.split('/'));
  const packageJsonPath = path.join(packageDir, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    fail(`${packageName} is not installed. Check that it is listed in package.json and rerun npm install.`);
  }

  const metadata = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const distDir = path.join(packageDir, 'dist');
  if (!fs.existsSync(distDir)) {
    fail(`${packageName}@${metadata.version || 'unknown'} has no dist/ directory.`);
  }

  const moduleEntry = metadata.module || metadata.browser || 'dist/index.js';
  const normalizedEntry = moduleEntry.replace(/\\/g, '/').replace(/^\.\//, '');
  const entryAbs = path.resolve(packageDir, normalizedEntry);
  const distAbs = path.resolve(distDir);
  if (!entryAbs.startsWith(distAbs + path.sep) || !fs.existsSync(entryAbs) || !fs.statSync(entryAbs).isFile()) {
    const candidates = ['dist/esm/index.js', 'dist/index.js', 'dist/plugin.js'];
    const fallback = candidates.map(candidate => path.join(packageDir, candidate))
      .find(candidate => candidate.startsWith(distAbs + path.sep) && fs.existsSync(candidate));
    if (!fallback) {
      fail(`${packageName}@${metadata.version || 'unknown'}: module entry "${moduleEntry}" was not found. Checked ${entryAbs}.`);
    }
  }

  const target = path.join(vendor, vendorName);
  fs.rmSync(target, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.cpSync(distDir, path.join(target, 'dist'), { recursive: true });

  const resolvedEntry = fs.existsSync(entryAbs)
    ? entryAbs
    : ['dist/esm/index.js', 'dist/index.js', 'dist/plugin.js']
      .map(candidate => path.join(packageDir, candidate)).find(candidate => fs.existsSync(candidate));
  const relativeEntry = path.relative(packageDir, resolvedEntry).replace(/\\/g, '/');
  return `./vendor/${vendorName}/${relativeEntry}`;
}

function rewriteImportMap(coreEntry, appEntry) {
  const indexPath = path.join(www, 'index.html');
  if (!fs.existsSync(indexPath)) fail('www/index.html is missing. Run "npm run build" first.');
  let html = fs.readFileSync(indexPath, 'utf8');

  const replacements = [
    [/((?:"|')three(?:"|')\s*:\s*)(?:"|')[^"']+(?:"|')/, '$1"./vendor/three/build/three.module.js"'],
    [/((?:"|')three\/addons\/(?:"|')\s*:\s*)(?:"|')[^"']+(?:"|')/, '$1"./vendor/three/examples/jsm/"'],
    [/((?:"|')@capacitor\/core(?:"|')\s*:\s*)(?:"|')[^"']+(?:"|')/, `$1"${coreEntry}"`],
    [/((?:"|')@capacitor\/app(?:"|')\s*:\s*)(?:"|')[^"']+(?:"|')/, `$1"${appEntry}"`]
  ];

  for (const [pattern, replacement] of replacements) {
    if (!pattern.test(html)) fail(`Could not find import-map entry matching ${pattern}.`);
    html = html.replace(pattern, replacement);
  }

  fs.writeFileSync(indexPath, html);
}

fs.mkdirSync(vendor, { recursive: true });
copyThree();
const coreEntry = copyCapacitorPackage('@capacitor/core', 'capacitor-core');
const appEntry = copyCapacitorPackage('@capacitor/app', 'capacitor-app');
rewriteImportMap(coreEntry, appEntry);

console.log('Three.js and Capacitor Core/App distributions copied into www/vendor.');
console.log(`  @capacitor/core -> ${coreEntry}`);
console.log(`  @capacitor/app  -> ${appEntry}`);
console.log('Android web assets now use local vendor modules instead of CDN imports.');
