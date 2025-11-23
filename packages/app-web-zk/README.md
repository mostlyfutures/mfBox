# ZK Notes - Zero-Knowledge Encrypted Notes Web Application

A modern, secure, zero-knowledge notes application with end-to-end encryption, inspired by Filen's clean and intuitive interface.

## Features

### Zero-Knowledge Encryption
- **Client-Side Encryption**: All encryption happens in the browser
- **No Server Access**: Server never sees your plaintext notes or encryption keys
- **Argon2 Key Derivation**: Strong password-based key derivation
- **NaCl/TweetNaCl**: Industry-standard cryptographic primitives
- **End-to-End Security**: Data is encrypted before leaving your device

### User Interface (Filen-Inspired)
- **Modern Dark Theme**: Clean, professional interface
- **Responsive Design**: Works on desktop and mobile
- **Real-time Autosave**: Changes are saved automatically
- **Sidebar Navigation**: Easy access to notes and folders
- **Note Editor**: Simple, distraction-free writing experience

### Architecture

```
src/
├── components/         # React UI components
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── DashboardPage.tsx
│   ├── Sidebar.tsx
│   ├── NotesList.tsx
│   └── NoteEditor.tsx
├── crypto/            # Zero-knowledge cryptography
│   ├── zkCrypto.ts    # Encryption/decryption utilities
│   └── keyManager.ts  # Secure key storage
├── services/          # API and business logic
│   ├── api.ts         # Backend API client
│   ├── authService.ts # Authentication
│   └── noteService.ts # Note management
├── types/             # TypeScript type definitions
├── routes/            # Route definitions
└── styles/            # CSS styles
```

## Zero-Knowledge Architecture

### How It Works

1. **Registration**
   - User creates a master password
   - Password is used to derive encryption keys using Argon2
   - Keys are stored in browser memory (never sent to server)
   - Only a password hash is sent to server for authentication

2. **Encryption Flow**
   ```
   Plaintext → Encrypt (Client) → Ciphertext → Server
   ```

3. **Decryption Flow**
   ```
   Server → Ciphertext → Decrypt (Client) → Plaintext
   ```

4. **Key Derivation**
   ```
   Master Password + Salt → Argon2 → Master Key
   Master Key → Encryption Key + Auth Key
   ```

### Security Features

- **Argon2id**: Memory-hard password hashing
- **NaCl SecretBox**: Authenticated encryption
- **Random Nonces**: Unique nonce for each encryption
- **Local Key Storage**: Keys never leave the device
- **No Password Recovery**: By design - we cannot access your data

## Getting Started

### Prerequisites

- Node.js >= 18
- Yarn 4.x

### Installation

```bash
# Install dependencies
yarn install

# Start development server
yarn dev

# Build for production
yarn build
```

### Development

```bash
# Start dev server
yarn start

# Run tests
yarn test

# Type checking
yarn tsc
```

## API Endpoints

The application expects the following API endpoints:

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Notes (All data is encrypted)
- `GET /api/notes` - Get all notes
- `GET /api/notes/:id` - Get single note
- `POST /api/notes` - Create note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

### Folders (All data is encrypted)
- `GET /api/folders` - Get all folders
- `GET /api/folders/:id` - Get single folder
- `POST /api/folders` - Create folder
- `PUT /api/folders/:id` - Update folder
- `DELETE /api/folders/:id` - Delete folder

## Environment Variables

```bash
API_URL=http://localhost:8080/api  # Backend API URL
```

## Security Considerations

### What We Store
- Email address (plaintext)
- Password hash (for authentication)
- Encrypted notes and folders
- Salt for key derivation

### What We NEVER Store
- Master password
- Encryption keys
- Plaintext notes or content

### Best Practices
- Use a strong, unique master password
- Store password in a password manager
- Enable two-factor authentication (if available)
- Regularly backup encrypted data

## Technology Stack

- **React 18**: UI framework
- **TypeScript**: Type safety
- **TweetNaCl**: Cryptography library
- **Argon2**: Password hashing
- **Axios**: HTTP client
- **React Router**: Navigation
- **Webpack**: Build tool

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

Requires support for:
- Web Crypto API
- IndexedDB
- ES2020 features

## Contributing

This is scaffolding code - implement the backend API to make it functional.

## License

See root LICENSE file.

## Acknowledgments

- Inspired by Filen's clean and secure interface
- Built on Joplin's foundation
- Uses industry-standard cryptography libraries
