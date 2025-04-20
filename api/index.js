// This file is used by Vercel to run the server in serverless mode
// Using CommonJS for better compatibility with Vercel serverless functions
const express = require('express');
const path = require('path');

// Export the serverless function handler for Vercel
module.exports = async (req, res) => {
  // Lazily initialize our express app to reduce cold starts
  if (!module.exports.app) {
    // Create Express app
    const app = express();
    
    // Middleware setup
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    
    // CORS setup
    app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      
      if (req.method === 'OPTIONS') {
        return res.status(200).end();
      }
      
      next();
    });
    
    try {
      // Import the server routes dynamically 
      // Note: in Vercel, the import paths are relative to the function
      const { registerRoutes } = require('../dist/server/routes');
      
      // Register the API routes
      registerRoutes(app);
      
      // Add generic error handler
      app.use((err, req, res, next) => {
        console.error('API Error:', err);
        res.status(500).json({ error: 'Internal server error' });
      });
      
      // Store app instance to reuse
      module.exports.app = app;
    } catch (error) {
      console.error('Failed to initialize app:', error);
      // Return a simple error if initialization fails
      return res.status(500).send('Server initialization failed');
    }
  }
  
  // Process the request with our initialized app
  return module.exports.app(req, res);
};