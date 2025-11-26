// Railway entry point - starts the backend server
console.log('Starting Lost & Found Backend...');

// Import and start the backend server
import('./backend/server.js').catch(err => {
  console.error('Failed to start backend:', err);
  process.exit(1);
});
