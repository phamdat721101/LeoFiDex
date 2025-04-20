#!/usr/bin/env node

/**
 * This script handles the build process for Vercel deployment
 * It sets up the necessary environment variables and structure
 * without modifying the original vite.config.ts
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function executeCommand(command) {
  try {
    log(`Executing: ${command}`, colors.blue);
    execSync(command, { stdio: 'inherit', env: { ...process.env, VERCEL: '1' } });
    return true;
  } catch (error) {
    log(`Error executing command: ${command}`, colors.red);
    log(error.toString(), colors.red);
    return false;
  }
}

function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    log(`Created directory: ${dir}`, colors.green);
  }
}

function copyFileIfExists(source, destination) {
  if (fs.existsSync(source)) {
    fs.copyFileSync(source, destination);
    log(`Copied ${source} to ${destination}`, colors.green);
    return true;
  }
  log(`Source file ${source} does not exist, skipping copy`, colors.yellow);
  return false;
}

// Main build process
async function build() {
  log('Starting Vercel build process...', colors.green);
  
  // Set environment variables for Vercel build
  process.env.VERCEL = '1';
  process.env.NODE_ENV = 'production';
  
  // Build the client
  log('Building client...', colors.yellow);
  if (!executeCommand('vite build')) {
    process.exit(1);
  }
  
  // Build the server
  log('Building server...', colors.yellow);
  if (!executeCommand('esbuild server/index.ts --platform=node --packages=external --bundle --outdir=dist/server')) {
    process.exit(1);
  }
  
  // Create required directories
  ensureDirectoryExists(path.join(__dirname, 'dist/client'));
  ensureDirectoryExists(path.join(__dirname, 'api'));
  
  // Copy static assets if they exist
  copyFileIfExists(
    path.join(__dirname, 'dist/public/index.html'),
    path.join(__dirname, 'dist/client/index.html')
  );
  
  // Ensure the dist/client directory has all the built files
  if (fs.existsSync(path.join(__dirname, 'dist/public'))) {
    executeCommand('cp -r dist/public/* dist/client/');
  }
  
  log('Vercel build completed successfully!', colors.green);
}

build().catch(err => {
  log(`Build failed with error: ${err}`, colors.red);
  process.exit(1);
});