# Security Notes & TODOs

## Code Review Findings

The following items were identified during code review and should be addressed before production use:

### High Priority (Security)

1. **Nonce Reuse in Note Encryption** (noteService.ts:103)
   - Currently uses same nonce for title and content
   - **Fix:** Generate separate nonce for each field
   - **Impact:** Could compromise encryption security

2. **Login Salt Implementation** (authService.ts:54-55)
   - Uses temporary salt instead of fetching user's salt from server
   - **Fix:** Add API endpoint to retrieve user's salt by email
   - **Impact:** Login won't work until fixed

### Medium Priority (Code Quality)

3. **TypeScript Type Suppressions** (zkCrypto.ts)
   - Multiple @ts-ignore comments for tweetnacl-util
   - **Fix:** Create proper type declarations or use @types packages
   - **Impact:** Reduced type safety, harder maintenance

4. **Strict Mode Disabled** (tsconfig.json:15)
   - TypeScript strict mode is off
   - **Fix:** Enable strict mode and fix all type errors
   - **Impact:** Potential runtime errors from type issues

5. **Auto-save Debounce** (NoteEditor.tsx:21-25)
   - Multiple timeouts could be pending simultaneously
   - **Fix:** Use proper debounce library (lodash.debounce)
   - **Impact:** Potential race conditions, multiple save requests

### Low Priority (API Design)

6. **Misleading Parameter Name** (authService.ts:32)
   - Sends salt as 'password' parameter
   - **Fix:** Update API contract to accept salt explicitly
   - **Impact:** Confusing for API developers

## Proper Implementation Flow

### Registration Flow (Production-Ready)
```typescript
async register(credentials: AuthCredentials): Promise<User> {
  // 1. Generate salt
  const salt = generateSalt();
  
  // 2. Derive keys
  const keys = await deriveKeys(credentials.password, salt);
  
  // 3. Store keys in memory
  keyManager.setKeys(keys);
  
  // 4. Create auth hash
  const authHash = await hashPasswordForAuth(credentials.password, salt);
  
  // 5. Send to server: email, salt, authHash
  const user = await apiService.register({
    email: credentials.email,
    salt,  // Server stores this for future key derivation
    passwordHash: authHash  // Server uses this for authentication
  });
  
  return user;
}
```

### Login Flow (Production-Ready)
```typescript
async login(credentials: AuthCredentials): Promise<User> {
  // 1. Fetch user's salt from server (by email)
  const { salt } = await apiService.getSaltByEmail(credentials.email);
  
  // 2. Derive keys using fetched salt
  const keys = await deriveKeys(credentials.password, salt);
  
  // 3. Store keys in memory
  keyManager.setKeys(keys);
  
  // 4. Create auth hash
  const authHash = await hashPasswordForAuth(credentials.password, salt);
  
  // 5. Login with auth hash
  await apiService.login({
    email: credentials.email,
    passwordHash: authHash
  });
  
  return await apiService.getCurrentUser();
}
```

### Note Encryption (Production-Ready)
```typescript
private encryptNoteForStorage(note, key): EncryptedNote {
  // Generate separate nonces for title and content
  const titleNonce = generateNonce();
  const contentNonce = generateNonce();
  
  const encryptedTitle = encrypt(note.title, key, titleNonce);
  const encryptedContent = encrypt(note.content, key, contentNonce);
  
  return {
    encryptedTitle: encryptedTitle.ciphertext,
    titleNonce: encryptedTitle.nonce,
    encryptedContent: encryptedContent.ciphertext,
    contentNonce: encryptedContent.nonce,
    folderId: note.folderId,
  };
}
```

## Required Backend API Endpoints

Add these to make the scaffolding functional:

```typescript
// Get salt for login (public endpoint)
GET /api/auth/salt?email=user@example.com
Response: { salt: "base64-encoded-salt" }

// Register with proper parameters
POST /api/auth/register
Body: {
  email: string,
  salt: string,        // Store for future key derivation
  passwordHash: string // Use for authentication
}

// Updated note schema
interface EncryptedNote {
  id: string;
  encryptedTitle: string;
  titleNonce: string;       // Separate nonce
  encryptedContent: string;
  contentNonce: string;     // Separate nonce
  userId: string;
  folderId?: string;
  createdAt: number;
  updatedAt: number;
}
```

## Additional Production Recommendations

### Security Enhancements
- [ ] Implement rate limiting on login attempts
- [ ] Add password strength requirements (zxcvbn library)
- [ ] Implement secure session management
- [ ] Add CSRF protection
- [ ] Enable HTTPS only
- [ ] Implement CSP headers
- [ ] Add audit logging

### Code Quality
- [ ] Enable TypeScript strict mode
- [ ] Add comprehensive unit tests
- [ ] Add E2E encryption tests
- [ ] Implement proper error boundaries
- [ ] Add logging infrastructure
- [ ] Set up monitoring/alerting

### User Experience
- [ ] Add offline support (service worker)
- [ ] Implement proper loading states
- [ ] Add toast notifications
- [ ] Implement keyboard shortcuts
- [ ] Add note search functionality
- [ ] Add export/backup functionality
- [ ] Implement note sharing (with re-encryption)

### Performance
- [ ] Implement virtual scrolling for large note lists
- [ ] Add note pagination
- [ ] Optimize encryption for large notes
- [ ] Add indexedDB caching
- [ ] Implement lazy loading

## Testing Strategy

### Unit Tests
```typescript
// Example: Test encryption/decryption
test('encrypt and decrypt note content', async () => {
  const password = 'test-password-123';
  const salt = generateSalt();
  const keys = await deriveKeys(password, salt);
  
  const plaintext = 'Secret note content';
  const encrypted = encrypt(plaintext, keys.encryptionKey);
  const decrypted = decrypt(
    encrypted.ciphertext,
    encrypted.nonce,
    keys.encryptionKey
  );
  
  expect(decrypted).toBe(plaintext);
});
```

### Integration Tests
```typescript
// Example: Test full auth flow
test('user can register and login', async () => {
  const credentials = {
    email: 'test@example.com',
    password: 'secure-password-123'
  };
  
  // Register
  const user = await authService.register(credentials);
  expect(user.email).toBe(credentials.email);
  expect(keyManager.hasKeys()).toBe(true);
  
  // Logout
  await authService.logout();
  expect(keyManager.hasKeys()).toBe(false);
  
  // Login
  await authService.login(credentials);
  expect(keyManager.hasKeys()).toBe(true);
});
```

### E2E Tests
```typescript
// Example: Test note encryption end-to-end
test('notes are encrypted before storage', async () => {
  // Create note
  const note = await noteService.createNote({
    title: 'Test Note',
    content: 'Secret content'
  });
  
  // Fetch from API (should be encrypted)
  const storedNote = await apiService.getNote(note.id);
  expect(storedNote.encryptedTitle).not.toBe('Test Note');
  expect(storedNote.encryptedContent).not.toBe('Secret content');
  
  // Decrypt should work
  const decrypted = await noteService.getNote(note.id);
  expect(decrypted.title).toBe('Test Note');
  expect(decrypted.content).toBe('Secret content');
});
```

## Conclusion

This scaffolding provides a solid foundation for a zero-knowledge notes application. However, the items listed above must be addressed before production deployment to ensure security, reliability, and maintainability.

The core cryptographic principles are sound, but the implementation details need refinement for real-world use.
