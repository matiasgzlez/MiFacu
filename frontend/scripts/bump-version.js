const fs = require('fs');
const path = require('path');

const appJsonPath = path.join(__dirname, '..', 'app.json');
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

const currentVersion = appJson.expo.version;
let [major, minor, patch] = currentVersion.split('.').map(Number);

patch++;
if (patch > 9) {
  patch = 0;
  minor++;
}
if (minor > 9) {
  minor = 0;
  major++;
}

const newVersion = `${major}.${minor}.${patch}`;
appJson.expo.version = newVersion;

fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + '\n');
console.log(`Version: ${currentVersion} -> ${newVersion}`);
