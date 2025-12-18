#!/usr/bin/env node

/**
 * Script to regenerate package-lock.json after removing dependencies
 * Run this locally to fix deployment issues
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Regenerating package-lock.json...');

// Check if package.json exists
const packageJsonPath = path.join(__dirname, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ package.json not found!');
  process.exit(1);
}

// Remove existing package-lock.json if exists
const lockPath = path.join(__dirname, 'package-lock.json');
if (fs.existsSync(lockPath)) {
  console.log('🗑️  Removing old package-lock.json...');
  fs.unlinkSync(lockPath);
}

// Remove node_modules if exists
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  console.log('🗑️  Removing node_modules...');
  execSync('rm -rf node_modules', { cwd: __dirname });
}

try {
  // Run npm install to generate new lock file
  console.log('📦 Running npm install...');
  execSync('npm install', { 
    cwd: __dirname, 
    stdio: 'inherit' 
  });
  
  console.log('✅ Successfully regenerated package-lock.json');
  console.log('🚀 Ready for deployment!');
  
} catch (error) {
  console.error('❌ Failed to regenerate package-lock.json:', error.message);
  process.exit(1);
}