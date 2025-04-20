// This file is used by Vercel to run the server in serverless mode
import express from 'express';
import { json, urlencoded } from 'express';
import { registerRoutes } from '../dist/server/routes.js';

const app = express();

// Middleware
app.use(json());
app.use(urlencoded({ extended: true }));

// CORS setup for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Register API routes
registerRoutes(app);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Initialize the server
const server = app.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on port ${process.env.PORT || 3000}`);
});

// Export for Vercel serverless function
export default async function handler(req, res) {
  // This passes the request to the express app
  app(req, res);
}