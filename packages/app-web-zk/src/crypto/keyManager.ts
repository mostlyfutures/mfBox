import localforage from 'localforage';
import type { EncryptionKeys } from '../types';

/**
 * Secure Key Storage Manager
 * Manages encryption keys in browser memory and optionally in IndexedDB
 * IMPORTANT: Keys are never sent to the server
 */

class KeyManager {
  private keys: EncryptionKeys | null = null;
  private sessionStore: typeof localforage;

  constructor() {
    // Configure IndexedDB for secure key storage
    this.sessionStore = localforage.createInstance({
      name: 'zkNotes',
      storeName: 'secureKeys',
      driver: localforage.INDEXEDDB,
    });
  }

  /**
   * Store keys in memory for current session
   */
  setKeys(keys: EncryptionKeys): void {
    this.keys = keys;
  }

  /**
   * Get keys from memory
   */
  getKeys(): EncryptionKeys | null {
    return this.keys;
  }

  /**
   * Get encryption key
   */
  getEncryptionKey(): Uint8Array | null {
    return this.keys?.encryptionKey || null;
  }

  /**
   * Get auth key
   */
  getAuthKey(): Uint8Array | null {
    return this.keys?.authKey || null;
  }

  /**
   * Get master key
   */
  getMasterKey(): Uint8Array | null {
    return this.keys?.masterKey || null;
  }

  /**
   * Check if keys are available
   */
  hasKeys(): boolean {
    return this.keys !== null;
  }

  /**
   * Clear keys from memory (logout)
   */
  clearKeys(): void {
    this.keys = null;
  }

  /**
   * Store encrypted keys in IndexedDB (optional, for "remember me" feature)
   * WARNING: Only use with additional device-specific encryption
   */
  async persistKeys(keys: EncryptionKeys, deviceKey: string): Promise<void> {
    // In a production app, you'd encrypt the keys with a device-specific key
    // For now, this is a placeholder
    try {
      await this.sessionStore.setItem('encryptedKeys', {
        masterKey: Array.from(keys.masterKey),
        encryptionKey: Array.from(keys.encryptionKey),
        authKey: Array.from(keys.authKey),
        encrypted: true,
        deviceKey: deviceKey, // Hash of device fingerprint
      });
    } catch (error) {
      console.error('Failed to persist keys:', error);
      throw new Error('Key persistence failed');
    }
  }

  /**
   * Load keys from IndexedDB
   */
  async loadPersistedKeys(deviceKey: string): Promise<EncryptionKeys | null> {
    try {
      const stored = await this.sessionStore.getItem<any>('encryptedKeys');
      
      if (!stored || stored.deviceKey !== deviceKey) {
        return null;
      }

      return {
        masterKey: new Uint8Array(stored.masterKey),
        encryptionKey: new Uint8Array(stored.encryptionKey),
        authKey: new Uint8Array(stored.authKey),
      };
    } catch (error) {
      console.error('Failed to load persisted keys:', error);
      return null;
    }
  }

  /**
   * Remove persisted keys
   */
  async clearPersistedKeys(): Promise<void> {
    try {
      await this.sessionStore.removeItem('encryptedKeys');
    } catch (error) {
      console.error('Failed to clear persisted keys:', error);
    }
  }

  /**
   * Clear all stored data
   */
  async clearAll(): Promise<void> {
    this.clearKeys();
    await this.clearPersistedKeys();
  }
}

// Singleton instance
export const keyManager = new KeyManager();
