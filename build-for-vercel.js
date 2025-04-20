#!/usr/bin/env node

// This script is used to build the application for Vercel deployment
// It's executed by Vercel's build command defined in vercel.json

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
    execSync(command, { stdio: 'inherit' });
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

// Main build process
async function build() {
  log('Starting Vercel build process...', colors.green);
  
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
  
  // Ensure the API directory exists
  ensureDirectoryExists(path.join(__dirname, 'api'));
  
  // Copy needed files for Vercel deployment
  log('Setting up Vercel deployment...', colors.yellow);
  
  log('Build completed successfully!', colors.green);
}

build().catch(err => {
  log(`Build failed with error: ${err}`, colors.red);
  process.exit(1);
});