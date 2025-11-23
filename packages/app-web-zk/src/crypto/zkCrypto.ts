import * as nacl from 'tweetnacl';
import { encodeBase64, decodeBase64, encodeUTF8, decodeUTF8 } from 'tweetnacl-util';
import { hash } from 'argon2-browser';
import type { EncryptedData, EncryptionKeys, KeyDerivationParams } from '../types';

/**
 * Zero-Knowledge Cryptography Module
 * Implements client-side encryption/decryption using NaCl (TweetNaCl)
 * All encryption happens in the browser - server never sees plaintext or keys
 */

// Constants for key derivation
const DEFAULT_SALT_LENGTH = 16;
const DEFAULT_NONCE_LENGTH = nacl.secretbox.nonceLength;

/**
 * Generate a random salt for key derivation
 */
export function generateSalt(): string {
  const salt = nacl.randomBytes(DEFAULT_SALT_LENGTH);
  return encodeBase64(salt);
}

/**
 * Generate a random nonce for encryption
 */
export function generateNonce(): string {
  const nonce = nacl.randomBytes(DEFAULT_NONCE_LENGTH);
  return encodeBase64(nonce);
}

/**
 * Derive encryption keys from password using Argon2
 * This is the Zero-Knowledge part - password never leaves the client
 */
export async function deriveKeys(
  password: string,
  salt: string,
  params?: Partial<KeyDerivationParams>
): Promise<EncryptionKeys> {
  const saltBytes = decodeBase64(salt);
  
  const defaultParams: KeyDerivationParams = {
    salt: encodeBase64(saltBytes),
    iterations: 3,
    memorySize: 4096, // 4 MB
    parallelism: 1,
  };

  const derivationParams = { ...defaultParams, ...params };

  try {
    const result = await hash({
      pass: password,
      salt: saltBytes,
      time: derivationParams.iterations,
      mem: derivationParams.memorySize,
      hashLen: 96, // 32 bytes for master key + 32 for encryption + 32 for auth
      parallelism: derivationParams.parallelism,
      type: 2, // Argon2id
    });

    const keyMaterial = result.hash;

    return {
      masterKey: keyMaterial.slice(0, 32),
      encryptionKey: keyMaterial.slice(32, 64),
      authKey: keyMaterial.slice(64, 96),
    };
  } catch (error) {
    throw new Error(`Key derivation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Encrypt data using NaCl secretbox
 */
export function encrypt(
  plaintext: string,
  key: Uint8Array,
  nonce?: string
): EncryptedData {
  const nonceBytes = nonce ? decodeBase64(nonce) : nacl.randomBytes(DEFAULT_NONCE_LENGTH);
  const plaintextBytes = encodeUTF8(plaintext);
  
  const ciphertext = nacl.secretbox(plaintextBytes, nonceBytes, key);
  
  if (!ciphertext) {
    throw new Error('Encryption failed');
  }

  return {
    ciphertext: encodeBase64(ciphertext),
    nonce: encodeBase64(nonceBytes),
  };
}

/**
 * Decrypt data using NaCl secretbox
 */
export function decrypt(
  ciphertext: string,
  nonce: string,
  key: Uint8Array
): string {
  const ciphertextBytes = decodeBase64(ciphertext);
  const nonceBytes = decodeBase64(nonce);
  
  const plaintextBytes = nacl.secretbox.open(ciphertextBytes, nonceBytes, key);
  
  if (!plaintextBytes) {
    throw new Error('Decryption failed - invalid key or corrupted data');
  }

  return decodeUTF8(plaintextBytes);
}

/**
 * Hash password for server authentication (not for encryption!)
 * This hash is sent to server for auth, but cannot decrypt user data
 */
export async function hashPasswordForAuth(
  password: string,
  salt: string
): Promise<string> {
  const saltBytes = decodeBase64(salt);
  
  const result = await hash({
    pass: password,
    salt: saltBytes,
    time: 3,
    mem: 4096,
    hashLen: 32,
    parallelism: 1,
    type: 2,
  });

  return encodeBase64(result.hash);
}

/**
 * Generate a secure random ID
 */
export function generateId(): string {
  const bytes = nacl.randomBytes(16);
  return encodeBase64(bytes);
}

/**
 * Verify data integrity using auth key
 */
export function createAuthTag(data: string, authKey: Uint8Array): string {
  const dataBytes = encodeUTF8(data);
  const tag = nacl.hash(new Uint8Array([...authKey, ...dataBytes])).slice(0, 32);
  return encodeBase64(tag);
}
