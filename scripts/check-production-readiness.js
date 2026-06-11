const fs = require('node:fs');
const path = require('node:path');

const rootDir = path.resolve(__dirname, '..');
const checks = [];

function addCheck(name, pass, detail) {
  checks.push({ name, pass, detail });
}

function fileExists(relativePath) {
  return fs.existsSync(path.join(rootDir, relativePath));
}

function readPackage(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(rootDir, relativePath), 'utf8'));
}

function hasScript(packageJson, name) {
  return Boolean(packageJson.scripts?.[name]);
}

const rootPackage = readPackage('package.json');
const apiPackage = readPackage('api/package.json');
const botPackage = readPackage('bot/package.json');
const miniappPackage = readPackage('miniapp/package.json');

addCheck('api ecosystem config exists', fileExists('api/ecosystem.config.js'));
addCheck('bot ecosystem config exists', fileExists('bot/ecosystem.config.js'));
addCheck('api env example exists', fileExists('api/.env.example'));
addCheck('bot env example exists', fileExists('bot/.env.example'));
addCheck('miniapp build script exists', hasScript(miniappPackage, 'build'));
addCheck('api test script exists', hasScript(apiPackage, 'test'));
addCheck('bot test script exists', hasScript(botPackage, 'test'));
addCheck('workspace verify script exists', hasScript(rootPackage, 'verify'));

if (process.env.NODE_ENV === 'production') {
  [
    'APP_BASE_URL',
    'FRONTEND_URL',
    'REDIS_URL',
    'JWT_SECRET',
    'PAYPAL_CLIENT_ID',
    'PAYPAL_CLIENT_SECRET',
    'PAYPAL_WEBHOOK_ID',
    'TELEGRAM_BOT_TOKEN',
    'TELEGRAM_MINI_APP_URL',
    'CORS_ALLOWED_ORIGINS'
  ].forEach((key) => {
    addCheck(`production env ${key}`, Boolean(process.env[key]), `${key} must be set before deployment`);
  });
} else {
  addCheck('production env validation mode', true, 'Set NODE_ENV=production to validate required deployment variables.');
}

const failed = checks.filter((check) => !check.pass);

checks.forEach((check) => {
  const marker = check.pass ? 'OK' : 'FAIL';
  const detail = check.detail ? ` - ${check.detail}` : '';
  console.log(`${marker} ${check.name}${detail}`);
});

if (failed.length > 0) {
  console.error(`Production readiness failed: ${failed.length} check(s) did not pass.`);
  process.exitCode = 1;
}
