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

// Verify signature for authentication
function verifySignature(address: string, message: string, signature: string): boolean {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === address.toLowerCase();
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
}

// Middleware to authenticate user by wallet signature
async function authenticateUser(req: any, res: any, next: any) {
  try {
    const { address, signature } = req.body;
    
    if (!address || !signature) {
      return res.status(400).json({ error: 'Address and signature are required' });
    }

    // The message we expect to be signed is the current timestamp
    // This prevents replay attacks by using a message that expires
    const now = Math.floor(Date.now() / 1000);
    const fiveMinutesAgo = now - 300; // 5 minutes in seconds
    
    // The message format should be: "Login to LeoFi: {timestamp}"
    // Try all timestamps within the last 5 minutes
    let isValid = false;
    for (let timestamp = now; timestamp >= fiveMinutesAgo; timestamp--) {
      const message = `Login to LeoFi: ${timestamp}`;
      if (verifySignature(address, message, signature)) {
        isValid = true;
        break;
      }
    }

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Check if user exists, if not create a new user
    let user = await getUserByAddress(address);
    
    if (!user) {
      // Get wallet type and chain ID from the request
      const { walletType = 'unknown', chainId = 1 } = req.body;
      user = await createUser(address, walletType, chainId);
      
      if (!user) {
        return res.status(500).json({ error: 'Failed to create user' });
      }
    } else {
      // Update last login time
      await updateUserLogin(address);
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

    // Check if user exists, if not create a new user
    let user = await getUserByAddress(address);
    
    if (!user) {
      user = await createUser(address, walletType || 'unknown', chainId || 1);
      
      if (!user) {
        return res.status(500).json({ error: 'Failed to create user' });
      }
    } else {
      // Update last login time
      await updateUserLogin(address);
    }

    // Generate nonce for the user to sign
    const timestamp = Math.floor(Date.now() / 1000);
    const message = `Login to LeoFi: ${timestamp}`;

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

export default router;