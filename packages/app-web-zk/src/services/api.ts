import axios, { AxiosInstance, AxiosError } from 'axios';
import type { User, AuthCredentials, AuthTokens, EncryptedNote, EncryptedFolder } from '../types';

/**
 * API Service for backend communication
 * Note: Only encrypted data is sent to the server
 */

class ApiService {
  private api: AxiosInstance;
  private accessToken: string | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.API_URL || '/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired, attempt refresh
          // This would be implemented with refresh token logic
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Set authentication token
   */
  setToken(token: string): void {
    this.accessToken = token;
  }

  /**
   * Clear authentication token
   */
  clearToken(): void {
    this.accessToken = null;
  }

  // Authentication endpoints

  async register(credentials: AuthCredentials, masterKeyHash: string): Promise<User> {
    const response = await this.api.post<User>('/auth/register', {
      ...credentials,
      masterKeyHash,
    });
    return response.data;
  }

  async login(credentials: AuthCredentials, masterKeyHash: string): Promise<AuthTokens> {
    const response = await this.api.post<AuthTokens>('/auth/login', {
      ...credentials,
      masterKeyHash,
    });
    
    this.setToken(response.data.accessToken);
    return response.data;
  }

  async logout(): Promise<void> {
    await this.api.post('/auth/logout');
    this.clearToken();
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.api.get<User>('/auth/me');
    return response.data;
  }

  // Note endpoints (all data is encrypted)

  async getNotes(): Promise<EncryptedNote[]> {
    const response = await this.api.get<EncryptedNote[]>('/notes');
    return response.data;
  }

  async getNote(id: string): Promise<EncryptedNote> {
    const response = await this.api.get<EncryptedNote>(`/notes/${id}`);
    return response.data;
  }

  async createNote(note: Omit<EncryptedNote, 'id' | 'createdAt' | 'updatedAt' | 'userId'>): Promise<EncryptedNote> {
    const response = await this.api.post<EncryptedNote>('/notes', note);
    return response.data;
  }

  async updateNote(id: string, note: Partial<EncryptedNote>): Promise<EncryptedNote> {
    const response = await this.api.put<EncryptedNote>(`/notes/${id}`, note);
    return response.data;
  }

  async deleteNote(id: string): Promise<void> {
    await this.api.delete(`/notes/${id}`);
  }

  // Folder endpoints (all data is encrypted)

  async getFolders(): Promise<EncryptedFolder[]> {
    const response = await this.api.get<EncryptedFolder[]>('/folders');
    return response.data;
  }

  async getFolder(id: string): Promise<EncryptedFolder> {
    const response = await this.api.get<EncryptedFolder>(`/folders/${id}`);
    return response.data;
  }

  async createFolder(folder: Omit<EncryptedFolder, 'id' | 'createdAt' | 'updatedAt' | 'userId'>): Promise<EncryptedFolder> {
    const response = await this.api.post<EncryptedFolder>('/folders', folder);
    return response.data;
  }

  async updateFolder(id: string, folder: Partial<EncryptedFolder>): Promise<EncryptedFolder> {
    const response = await this.api.put<EncryptedFolder>(`/folders/${id}`, folder);
    return response.data;
  }

  async deleteFolder(id: string): Promise<void> {
    await this.api.delete(`/folders/${id}`);
  }
}

export const apiService = new ApiService();
