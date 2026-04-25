#!/usr/bin/env node

/**
 * Firestore Seeding - Pre-flight Check Script
 *
 * This script validates that you have everything needed to seed the database
 * Run with: node check-setup.js
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const checks = {
  passed: [],
  failed: [],
  warnings: []
};

function checkSeparator() {
  console.log('\n' + '='.repeat(60));
}

function checkPassed(message) {
  console.log('  ✅ ' + message);
  checks.passed.push(message);
}

function checkFailed(message) {
  console.log('  ❌ ' + message);
  checks.failed.push(message);
}

function checkWarning(message) {
  console.log('  ⚠️  ' + message);
  checks.warnings.push(message);
}

console.log('\n' + '='.repeat(60));
console.log('🔍 DataLogger Manager - Pre-flight Check');
console.log('='.repeat(60) + '\n');

// Check 1: Node.js version
console.log('1️⃣  Checking Node.js...');
try {
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.substring(1).split('.')[0]);
  if (majorVersion >= 18) {
    checkPassed(`Node.js ${nodeVersion} (required: 18+)`);
  } else {
    checkFailed(`Node.js ${nodeVersion} (required: 18+)`);
  }
} catch (e) {
  checkFailed('Could not determine Node.js version');
}

// Check 2: seed.js exists
console.log('\n2️⃣  Checking seed script...');
if (existsSync(join(__dirname, 'seed.js'))) {
  checkPassed('seed.js found');
} else {
  checkFailed('seed.js not found');
}

// Check 3: Firebase credentials
console.log('\n3️⃣  Checking Firebase credentials...');
let credentialFound = false;

// Check 3a: serviceAccountKey.json
if (existsSync(join(__dirname, 'serviceAccountKey.json'))) {
  checkPassed('serviceAccountKey.json found in project root');
  credentialFound = true;
} else {
  checkWarning('serviceAccountKey.json not found in project root');
}

// Check 3b: GOOGLE_APPLICATION_CREDENTIALS
if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  if (existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
    checkPassed(`GOOGLE_APPLICATION_CREDENTIALS set: ${process.env.GOOGLE_APPLICATION_CREDENTIALS}`);
    credentialFound = true;
  } else {
    checkFailed(`GOOGLE_APPLICATION_CREDENTIALS points to non-existent file`);
  }
} else {
  checkWarning('GOOGLE_APPLICATION_CREDENTIALS environment variable not set');
}

// Check 4: Firebase dependencies
console.log('\n4️⃣  Checking Firebase dependencies...');
try {
  const packageJson = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf8'));

  if (packageJson.dependencies['firebase-admin']) {
    checkPassed(`firebase-admin: ${packageJson.dependencies['firebase-admin']}`);
  } else {
    checkFailed('firebase-admin not in dependencies');
  }

  if (packageJson.dependencies['firebase']) {
    checkPassed(`firebase: ${packageJson.dependencies['firebase']}`);
  } else {
    checkFailed('firebase not in dependencies');
  }
} catch (e) {
  checkFailed('Could not read package.json');
}

// Check 5: npm_modules
console.log('\n5️⃣  Checking node_modules...');
if (existsSync(join(__dirname, 'node_modules'))) {
  checkPassed('node_modules directory exists');
} else {
  checkFailed('node_modules directory not found - run: npm install');
}

// Summary
checkSeparator();
console.log('\n📊 CHECK SUMMARY\n');
console.log(`  ✅ Passed:  ${checks.passed.length}`);
console.log(`  ❌ Failed:  ${checks.failed.length}`);
console.log(`  ⚠️  Warnings: ${checks.warnings.length}`);

if (checks.failed.length === 0 && credentialFound) {
  console.log('\n✨ Everything looks good! Ready to seed.');
  console.log('\n🌱 To seed the database, run:');
  console.log('   npm run seed');
  checkSeparator();
  console.log();
  process.exit(0);
} else if (checks.failed.length === 0) {
  console.log('\n⚠️  Credentials not detected. You need either:');
  console.log('   1. serviceAccountKey.json in project root, OR');
  console.log('   2. GOOGLE_APPLICATION_CREDENTIALS environment variable');
  console.log('\n📖 See SEEDING_README.md for setup instructions');
  checkSeparator();
  console.log();
  process.exit(1);
} else {
  console.log('\n❌ Some checks failed. Please fix the issues above.');
  console.log('\n📖 See SEEDING_README.md for help');
  checkSeparator();
  console.log();
  process.exit(1);
}

