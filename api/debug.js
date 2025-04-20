// Utility API endpoint to help debug Vercel deployment issues
module.exports = async (req, res) => {
  try {
    // Basic info to help with debugging
    const info = {
      environment: process.env.NODE_ENV,
      vercel: process.env.VERCEL === '1',
      timestamp: new Date().toISOString(),
      request: {
        method: req.method,
        path: req.url,
        query: req.query,
        headers: req.headers,
      },
      // Include any other useful debugging information here
      nodeVersion: process.version,
      memoryUsage: process.memoryUsage(),
    };
    
    // Return the debug information
    res.status(200).json({
      status: 'ok',
      message: 'API is running on Vercel',
      info
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred in the debug endpoint',
      error: error.message
    });
  }
};