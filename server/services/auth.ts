import { ethers } from 'ethers';
import { 
  createUser, 
  getUserByAddress, 
  updateUserLogin 
} from '../db/schema';

/**
 * Generate an authentication message for the user to sign
 * @param address User's wallet address  
 * @param timestamp Current timestamp
 * @returns Message to be signed by the user
 */
export function generateAuthMessage(address: string, timestamp: number): string {
  return `Login to LeoFi: ${timestamp}`;
}

/**
 * Verify a signature against a message and address
 * @param address The address that supposedly signed the message
 * @param message The original message that was signed
 * @param signature The signature to verify
 * @returns True if the signature is valid
 */
export function verifySignature(address: string, message: string, signature: string): boolean {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === address.toLowerCase();
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
}

/**
 * Authenticate a user by their wallet address
 * @param address User's wallet address
 * @param walletType Type of wallet (e.g., 'metamask', 'walletconnect')
 * @param chainId Chain ID of the connected network
 * @returns User object or null if authentication failed
 */
export async function authenticateUser(
  address: string, 
  walletType: string, 
  chainId: number
) {
  try {
    // Normalize address
    const normalizedAddress = address.toLowerCase();
    
    // Check if user exists
    let user = await getUserByAddress(normalizedAddress);
    
    // If user doesn't exist, create a new one
    if (!user) {
      user = await createUser(normalizedAddress, walletType, chainId);
      if (!user) {
        throw new Error('Failed to create user');
      }
    } else {
      // Update last login time
      await updateUserLogin(normalizedAddress);
    }
    
    return user;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

/**
 * Verify that a token is valid for a given address
 * @param token The authentication token (signature)
 * @param address The address to authenticate
 * @returns Boolean indicating if the token is valid
 */
export function verifyAuthToken(token: string, address: string): boolean {
  try {
    // For signature-based auth, we need to reconstruct and verify the signed message
    // The token is the signature itself
    const now = Math.floor(Date.now() / 1000);
    const fiveMinutesAgo = now - 300; // 5 minutes window
    
    // Try all possible timestamps within the window
    for (let timestamp = now; timestamp >= fiveMinutesAgo; timestamp--) {
      const message = generateAuthMessage(address, timestamp);
      if (verifySignature(address, message, token)) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Token verification error:', error);
    return false;
  }
}