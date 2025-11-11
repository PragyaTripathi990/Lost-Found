#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Lost & Found App setup...\n');

// Check if all required files exist
const requiredFiles = [
  'frontend/package.json',
  'backend/package.json',
  'python-ai/requirements.txt',
  'database/schema.sql',
  'frontend/src/App.jsx',
  'backend/server.js',
  'python-ai/app.py'
];

let allFilesExist = true;

console.log('📁 Checking required files...');
requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

// Check if node_modules exist
console.log('\n📦 Checking dependencies...');
const frontendNodeModules = path.join(__dirname, '..', 'frontend', 'node_modules');
const backendNodeModules = path.join(__dirname, '..', 'backend', 'node_modules');

if (fs.existsSync(frontendNodeModules)) {
  console.log('✅ Frontend dependencies installed');
} else {
  console.log('❌ Frontend dependencies not installed - run: cd frontend && npm install');
  allFilesExist = false;
}

if (fs.existsSync(backendNodeModules)) {
  console.log('✅ Backend dependencies installed');
} else {
  console.log('❌ Backend dependencies not installed - run: cd backend && npm install');
  allFilesExist = false;
}

// Check Python virtual environment
const pythonVenv = path.join(__dirname, '..', 'python-ai', 'venv');
if (fs.existsSync(pythonVenv)) {
  console.log('✅ Python virtual environment exists');
} else {
  console.log('❌ Python virtual environment not created - run: cd python-ai && python -m venv venv');
  allFilesExist = false;
}

// Check environment files
console.log('\n🔧 Checking environment files...');
const backendEnv = path.join(__dirname, '..', 'backend', '.env');
const frontendEnv = path.join(__dirname, '..', 'frontend', '.env');

if (fs.existsSync(backendEnv)) {
  console.log('✅ Backend .env file exists');
} else {
  console.log('⚠️  Backend .env file missing - copy from env.example and configure');
}

if (fs.existsSync(frontendEnv)) {
  console.log('✅ Frontend .env file exists');
} else {
  console.log('⚠️  Frontend .env file missing - copy from env.example and configure');
}

console.log('\n' + '='.repeat(50));

if (allFilesExist) {
  console.log('🎉 Setup test PASSED! All required files are present.');
  console.log('\nNext steps:');
  console.log('1. Configure your environment variables');
  console.log('2. Set up your Supabase database');
  console.log('3. Run the database schema');
  console.log('4. Start the development servers with: npm run dev');
} else {
  console.log('❌ Setup test FAILED! Some files are missing.');
  console.log('\nPlease run: npm run setup');
}

console.log('\nFor more information, see README.md');
