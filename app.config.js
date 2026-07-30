const path = require('path');
const fs = require('fs');

const mobileRoot = path.join(__dirname, 'apps/mobile');
const envPath = path.join(mobileRoot, '.env');

if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

const mobile = require(path.join(mobileRoot, 'app.json'));

/** @type {import('expo/config').ExpoConfig} */
module.exports = {
  ...mobile.expo,
  icon: './apps/mobile/assets/icon.png',
  splash: {
    ...mobile.expo.splash,
    image: './apps/mobile/assets/splash-icon.png',
  },
  android: {
    ...mobile.expo.android,
    adaptiveIcon: {
      ...mobile.expo.android.adaptiveIcon,
      foregroundImage: './apps/mobile/assets/adaptive-icon.png',
    },
  },
};
