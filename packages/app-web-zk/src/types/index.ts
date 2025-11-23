// User and Authentication Types
export interface User {
  id: string;
  email: string;
  masterKeyHash: string;
  createdAt: number;
  updatedAt: number;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// Note Types
export interface Note {
  id: string;
  title: string;
  content: string;
  encrypted: boolean;
  createdAt: number;
  updatedAt: number;
  userId: string;
  folderId?: string;
}

export interface EncryptedNote {
  id: string;
  encryptedTitle: string;
  encryptedContent: string;
  nonce: string;
  createdAt: number;
  updatedAt: number;
  userId: string;
  folderId?: string;
}

// Folder Types
export interface Folder {
  id: string;
  name: string;
  encrypted: boolean;
  createdAt: number;
  updatedAt: number;
  userId: string;
  parentId?: string;
}

export interface EncryptedFolder {
  id: string;
  encryptedName: string;
  nonce: string;
  createdAt: number;
  updatedAt: number;
  userId: string;
  parentId?: string;
}

// Encryption Types
export interface EncryptionKeys {
  masterKey: Uint8Array;
  encryptionKey: Uint8Array;
  authKey: Uint8Array;
}

export interface EncryptedData {
  ciphertext: string;
  nonce: string;
}

export interface KeyDerivationParams {
  salt: string;
  iterations: number;
  memorySize: number;
  parallelism: number;
}

// UI State Types
export interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface NoteState {
  notes: Note[];
  selectedNote: Note | null;
  isLoading: boolean;
  error: string | null;
}

export interface FolderState {
  folders: Folder[];
  selectedFolder: Folder | null;
  isLoading: boolean;
  error: string | null;
}
