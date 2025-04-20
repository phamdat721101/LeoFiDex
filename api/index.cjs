// CommonJS version for Vercel
const express = require('express');

// Handler function that will be called by Vercel
module.exports = async (req, res) => {
  // Dynamic import for ES modules
  try {
    const { default: handler } = await import('./index.js');
    return handler(req, res);
  } catch (error) {
    console.error('Error loading API handler:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};