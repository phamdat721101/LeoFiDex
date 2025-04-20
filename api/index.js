// This file is used by Vercel to run the server in serverless mode
// Using CommonJS syntax for compatibility with Vercel's serverless functions
const express = require('express');
const path = require('path');

// Singleton to store the Express app instance
let app = null;

// Create and configure Express app
const createApp = async () => {
  if (app) return app;
  
  console.log('Initializing Express app for Vercel serverless function');
  
  // Create new Express app
  app = express();
  
  // Basic middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // CORS headers for API endpoints
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
    // Import routes dynamically
    // This avoids issues with ESM vs CommonJS
    const serverRoutesPath = path.join(process.cwd(), 'dist/server/routes.js');
    console.log(`Loading routes from: ${serverRoutesPath}`);
    
    // In Vercel we need to handle potential ESM modules
    let registerRoutes;
    try {
      // Try CommonJS first
      const routes = require(serverRoutesPath);
      registerRoutes = routes.registerRoutes;
    } catch (err) {
      if (err.code === 'ERR_REQUIRE_ESM') {
        // Handle ESM modules (for newer Node.js versions)
        console.log('Detected ESM module, using dynamic import');
        const routes = await import(serverRoutesPath);
        registerRoutes = routes.registerRoutes;
      } else {
        throw err;
      }
    }
    
    if (!registerRoutes) {
      throw new Error('Could not find registerRoutes function');
    }
    
    // Register routes
    await registerRoutes(app);
    
    // Add error handling middleware
    app.use((err, req, res, next) => {
      console.error('API Error:', err);
      res.status(500).json({ 
        error: 'Internal server error',
        message: err.message 
      });
    });
    
    return app;
  } catch (error) {
    console.error('Failed to initialize Express app:', error);
    // Reset app so we can try again on next request
    app = null;
    throw error;
  }
};

// Handler function for Vercel serverless functions
module.exports = async (req, res) => {
  try {
    const app = await createApp();
    return app(req, res);
  } catch (error) {
    console.error('Error handling request:', error);
    return res.status(500).json({
      error: 'Failed to process request',
      message: error.message
    });
  }
};