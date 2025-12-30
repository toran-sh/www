#!/usr/bin/env node

/**
 * Verify environment variables are properly configured
 */

const requiredVars = [
  'MONGODB_URI',
  'MONGODB_DATABASE'
];

console.log('🔍 Verifying environment variables...\n');

let allSet = true;

for (const varName of requiredVars) {
  const value = process.env[varName];
  const isSet = value && !value.includes('PASTE_YOUR');

  if (isSet) {
    console.log(`  ✅ ${varName}: configured`);
  } else {
    console.log(`  ❌ ${varName}: missing or not configured`);
    allSet = false;
  }
}

console.log();

if (allSet) {
  console.log('✅ All environment variables are configured!\n');
  console.log('Next step: Run MongoDB setup script');
  console.log('  npm run setup:mongodb\n');
  process.exit(0);
} else {
  console.log('❌ Some environment variables are missing\n');
  console.log('Please edit .env.setup and ensure all values are filled in.\n');
  process.exit(1);
}
