import { Router } from 'express';
import { 
  createUser, 
  getUserByAddress, 
  updateUserLogin,
  recordUserAction,
  getUserActions, 
  updateActionStatus
} from '../db/schema';
import { ethers } from 'ethers';

// Create router
const router = Router();

import { 
  generateAuthMessage, 
  verifySignature, 
  authenticateUser as authService,
  verifyAuthToken
} from '../services/auth';

// Middleware to authenticate user by wallet signature
async function authenticateUser(req: any, res: any, next: any) {
  try {
    // Check if we have Authorization header (Bearer token)
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // Extract token (signature)
      const token = authHeader.substring(7);
      const address = req.query.address || req.body.address;
      
      if (!address) {
        return res.status(400).json({ error: 'Address is required' });
      }
      
      // Verify token is valid for this address
      const isValid = verifyAuthToken(token, address);
      
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }
      
      // Get or create user
      const user = await authService(
        address, 
        req.body.walletType || 'unknown', 
        req.body.chainId || 1
      );
      
      if (!user) {
        return res.status(500).json({ error: 'Failed to authenticate user' });
      }
      
      // Attach user to request
      req.user = user;
      next();
      return;
    }
    
    // If no Authorization header, check for direct signature in body
    const { address, signature } = req.body;
    
    if (!address || !signature) {
      return res.status(400).json({ error: 'Address and signature are required' });
    }

    // The message we expect to be signed is the current timestamp
    // This prevents replay attacks by using a message that expires
    const now = Math.floor(Date.now() / 1000);
    const fiveMinutesAgo = now - 300; // 5 minutes in seconds
    
    // Try all timestamps within the last 5 minutes
    let isValid = false;
    for (let timestamp = now; timestamp >= fiveMinutesAgo; timestamp--) {
      const message = generateAuthMessage(address, timestamp);
      if (verifySignature(address, message, signature)) {
        isValid = true;
        break;
      }
    }

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Authenticate user
    const user = await authService(
      address, 
      req.body.walletType || 'unknown', 
      req.body.chainId || 1
    );
    
    if (!user) {
      return res.status(500).json({ error: 'Failed to authenticate user' });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Error in auth middleware:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}

// Login route
router.post('/login', async (req, res) => {
  try {
    const { address, walletType, chainId } = req.body;
    
    if (!address) {
      return res.status(400).json({ error: 'Address is required' });
    }

    // Authenticate the user (create if doesn't exist)
    const user = await authService(
      address, 
      walletType || 'unknown', 
      chainId || 1
    );
    
    if (!user) {
      return res.status(500).json({ error: 'Authentication failed' });
    }

    // Generate message for the user to sign
    const timestamp = Math.floor(Date.now() / 1000);
    const message = generateAuthMessage(address, timestamp);

    res.json({ 
      user, 
      auth: {
        message,
        timestamp
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get user profile
router.get('/profile', authenticateUser, async (req: any, res) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Record user action
router.post('/actions', authenticateUser, async (req: any, res) => {
  try {
    const { actionType, details, chainId, transactionHash } = req.body;
    
    if (!actionType || !details) {
      return res.status(400).json({ error: 'Action type and details are required' });
    }

    const action = await recordUserAction(
      req.user.id,
      actionType,
      details,
      chainId || req.user.chain_id,
      transactionHash
    );

    if (!action) {
      return res.status(500).json({ error: 'Failed to record action' });
    }

    res.json({ action });
  } catch (error) {
    console.error('Error recording action:', error);
    res.status(500).json({ error: 'Failed to record action' });
  }
});

// Update action status
router.put('/actions/:id', authenticateUser, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { status, transactionHash } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const success = await updateActionStatus(id, status, transactionHash);

    if (!success) {
      return res.status(500).json({ error: 'Failed to update action status' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating action status:', error);
    res.status(500).json({ error: 'Failed to update action status' });
  }
});

// Get user actions
router.get('/actions', authenticateUser, async (req: any, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
    
    const actions = await getUserActions(req.user.id, limit);

    if (actions === null) {
      return res.status(500).json({ error: 'Failed to get actions' });
    }

    res.json({ actions });
  } catch (error) {
    console.error('Error getting actions:', error);
    res.status(500).json({ error: 'Failed to get actions' });
  }
});

// Verify token validity
router.get('/verify-token', async (req, res) => {
  try {
    const token = req.query.token as string;
    const address = req.query.address as string;
    
    if (!token || !address) {
      return res.status(400).json({ error: 'Token and address are required' });
    }
    
    const isValid = verifyAuthToken(token, address);
    
    res.json({ valid: isValid });
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(500).json({ error: 'Failed to verify token' });
  }
});

export default router;