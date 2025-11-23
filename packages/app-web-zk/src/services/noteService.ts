import { apiService } from './api';
import { encrypt, decrypt } from '../crypto/zkCrypto';
import { keyManager } from '../crypto/keyManager';
import type { Note, EncryptedNote } from '../types';

/**
 * Note Service - handles encryption/decryption of notes
 * Transparently encrypts before sending to server and decrypts after receiving
 */

class NoteService {
  /**
   * Get all notes (decrypted)
   */
  async getAllNotes(): Promise<Note[]> {
    const encryptedNotes = await apiService.getNotes();
    const encryptionKey = keyManager.getEncryptionKey();

    if (!encryptionKey) {
      throw new Error('Encryption key not available');
    }

    return encryptedNotes.map(encNote => this.decryptNote(encNote, encryptionKey));
  }

  /**
   * Get a single note (decrypted)
   */
  async getNote(id: string): Promise<Note> {
    const encryptedNote = await apiService.getNote(id);
    const encryptionKey = keyManager.getEncryptionKey();

    if (!encryptionKey) {
      throw new Error('Encryption key not available');
    }

    return this.decryptNote(encryptedNote, encryptionKey);
  }

  /**
   * Create a new note (encrypted before sending)
   */
  async createNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'encrypted'>): Promise<Note> {
    const encryptionKey = keyManager.getEncryptionKey();

    if (!encryptionKey) {
      throw new Error('Encryption key not available');
    }

    const encryptedNote = this.encryptNoteForStorage(note, encryptionKey);
    const savedNote = await apiService.createNote(encryptedNote);
    
    return this.decryptNote(savedNote, encryptionKey);
  }

  /**
   * Update an existing note (encrypted before sending)
   */
  async updateNote(id: string, updates: Partial<Omit<Note, 'id' | 'userId' | 'encrypted'>>): Promise<Note> {
    const encryptionKey = keyManager.getEncryptionKey();

    if (!encryptionKey) {
      throw new Error('Encryption key not available');
    }

    const encryptedUpdates: Partial<EncryptedNote> = {};

    if (updates.title !== undefined) {
      const encrypted = encrypt(updates.title, encryptionKey);
      encryptedUpdates.encryptedTitle = encrypted.ciphertext;
    }

    if (updates.content !== undefined) {
      const encrypted = encrypt(updates.content, encryptionKey);
      encryptedUpdates.encryptedContent = encrypted.ciphertext;
      encryptedUpdates.nonce = encrypted.nonce;
    }

    const savedNote = await apiService.updateNote(id, encryptedUpdates);
    return this.decryptNote(savedNote, encryptionKey);
  }

  /**
   * Delete a note
   */
  async deleteNote(id: string): Promise<void> {
    await apiService.deleteNote(id);
  }

  /**
   * Encrypt note for storage
   */
  private encryptNoteForStorage(
    note: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'encrypted'>,
    key: Uint8Array
  ): Omit<EncryptedNote, 'id' | 'createdAt' | 'updatedAt' | 'userId'> {
    const encryptedTitle = encrypt(note.title, key);
    const encryptedContent = encrypt(note.content, key);

    return {
      encryptedTitle: encryptedTitle.ciphertext,
      encryptedContent: encryptedContent.ciphertext,
      nonce: encryptedContent.nonce,
      folderId: note.folderId,
    };
  }

  /**
   * Decrypt note from storage
   */
  private decryptNote(encNote: EncryptedNote, key: Uint8Array): Note {
    try {
      const title = decrypt(encNote.encryptedTitle, encNote.nonce, key);
      const content = decrypt(encNote.encryptedContent, encNote.nonce, key);

      return {
        id: encNote.id,
        title,
        content,
        encrypted: true,
        createdAt: encNote.createdAt,
        updatedAt: encNote.updatedAt,
        userId: encNote.userId,
        folderId: encNote.folderId,
      };
    } catch (error) {
      throw new Error(`Failed to decrypt note: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const noteService = new NoteService();
