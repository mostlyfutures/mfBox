import { apiService } from './api';
import { deriveKeys, generateSalt, hashPasswordForAuth } from '../crypto/zkCrypto';
import { keyManager } from '../crypto/keyManager';
import type { User, AuthCredentials } from '../types';

/**
 * Authentication Service
 * Handles zero-knowledge authentication
 */

class AuthService {
  /**
   * Register a new user
   * Password never leaves the client - only hash is sent
   */
  async register(credentials: AuthCredentials): Promise<User> {
    try {
      // Generate salt for key derivation
      const salt = generateSalt();

      // Derive encryption keys from password
      const keys = await deriveKeys(credentials.password, salt);

      // Store keys in memory
      keyManager.setKeys(keys);

      // Create password hash for server authentication
      const masterKeyHash = await hashPasswordForAuth(credentials.password, salt);

      // Register user (server only receives email and hash)
      const user = await apiService.register(
        { email: credentials.email, password: salt }, // Send salt as "password" for storage
        masterKeyHash
      );

      return user;
    } catch (error) {
      keyManager.clearKeys();
      throw new Error(`Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Login user
   * Password is used to derive keys locally
   */
  async login(credentials: AuthCredentials): Promise<User> {
    try {
      // First, get the user's salt from the server
      // In a real implementation, you'd have an endpoint to retrieve this
      // For now, we'll assume the salt is stored on server with the user account
      
      // Derive encryption keys from password
      // Note: In production, you'd fetch the salt from server first
      const tempSalt = generateSalt(); // Placeholder
      const keys = await deriveKeys(credentials.password, tempSalt);

      // Store keys in memory
      keyManager.setKeys(keys);

      // Create password hash for authentication
      const masterKeyHash = await hashPasswordForAuth(credentials.password, tempSalt);

      // Login (server verifies the hash)
      await apiService.login(credentials, masterKeyHash);

      // Get current user info
      const user = await apiService.getCurrentUser();

      return user;
    } catch (error) {
      keyManager.clearKeys();
      throw new Error(`Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Logout user
   * Clears all keys from memory
   */
  async logout(): Promise<void> {
    try {
      await apiService.logout();
    } finally {
      // Always clear keys, even if logout request fails
      await keyManager.clearAll();
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return keyManager.hasKeys();
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User> {
    return await apiService.getCurrentUser();
  }
}

export const authService = new AuthService();
