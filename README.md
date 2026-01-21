# Professional Node.js API Template with OAuth Authentication

A comprehensive Node.js API template with professional OAuth authentication implementation using Passport.js, supporting Google and Facebook login.

## Features

- **OAuth Authentication**: Google and Facebook login integration
- **JWT Token Management**: Secure token-based authentication
- **User Management**: Complete user CRUD operations
- **Email Verification**: OTP-based email verification
- **Password Reset**: Secure password reset functionality
- **File Upload**: Multer-based file upload system
- **Error Handling**: Comprehensive error handling and logging
- **Validation**: Zod schema validation
- **Database**: MongoDB with Mongoose ODM
- **Logging**: Winston-based logging system
- **Security**: Helmet, CORS, rate limiting

## OAuth Implementation

### Supported Providers
- **Google OAuth 2.0**: Full Google login integration
- **Facebook OAuth**: Facebook login integration

### OAuth Flow
1. User clicks OAuth login button
2. Redirected to provider (Google/Facebook)
3. User authenticates with provider
4. Provider redirects back to callback URL
5. User data is processed and JWT tokens are generated
6. User is redirected to frontend with tokens

### OAuth Routes
```
GET /api/v1/auth/google          - Initiate Google OAuth
GET /api/v1/auth/google/callback - Google OAuth callback
GET /api/v1/auth/facebook        - Initiate Facebook OAuth
GET /api/v1/auth/facebook/callback - Facebook OAuth callback
```

## Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
IP_ADDRESS=localhost
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000

# Database
DATABASE_URL=mongodb://localhost:27017/your_database

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE_IN=1d
JWT_REFRESH_SECRET=your_jwt_refresh_secret
JWT_REFRESH_EXPIRE_IN=7d

# OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback

FACEBOOK_CLIENT_ID=your_facebook_client_id
FACEBOOK_CLIENT_SECRET=your_facebook_client_secret

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
EMAIL_FROM=your_email@gmail.com
EMAIL_HEADER_NAME=Your App Name

# Session
EXPRESS_SESSION_SECRET_KEY=your_session_secret

# Other Configuration
BCRYPT_SALT_ROUNDS=12
ALLOWED_ORIGINS=http://localhost:3000
RESET_TOKEN_EXPIRE_TIME=10m
```

## OAuth Setup Instructions

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Set Application Type to "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:5000/api/v1/auth/google/callback` (development)
   - `https://yourdomain.com/api/v1/auth/google/callback` (production)
7. Copy Client ID and Client Secret to your `.env` file

### Facebook OAuth Setup

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Facebook Login product
4. Configure OAuth settings:
   - Valid OAuth Redirect URIs: `http://localhost:5000/api/v1/auth/facebook/callback`
5. Copy App ID and App Secret to your `.env` file

## Installation

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## API Endpoints

### Authentication
```
POST /api/v1/auth/login              - User login
POST /api/v1/auth/verify-email       - Verify email with OTP
POST /api/v1/auth/forget-password    - Request password reset
POST /api/v1/auth/reset-password     - Reset password
POST /api/v1/auth/change-password    - Change password
POST /api/v1/auth/refresh-token      - Refresh JWT token
POST /api/v1/auth/resend-otp         - Resend OTP
```

### OAuth Authentication
```
GET /api/v1/auth/google              - Google OAuth login
GET /api/v1/auth/google/callback     - Google OAuth callback
GET /api/v1/auth/facebook            - Facebook OAuth login
GET /api/v1/auth/facebook/callback   - Facebook OAuth callback
```

### User Management
```
GET /api/v1/users/profile            - Get user profile
PATCH /api/v1/users/profile          - Update user profile
POST /api/v1/users                   - Create new user
```

## User Model Schema

```typescript
interface IUser {
  name: string;
  role: USER_ROLES;
  email: string;
  password?: string; // Optional for OAuth users
  image?: string;
  status: 'active' | 'blocked';
  verified: boolean;
  isDeleted: boolean;
  stripeCustomerId: string;
  
  // OAuth fields
  googleId?: string;
  facebookId?: string;
  oauthProvider?: 'google' | 'facebook';
  
  authentication?: {
    isResetPassword: boolean;
    oneTimeCode: number;
    expireAt: Date;
  };
}
```

## OAuth User Flow

### New OAuth User
1. User clicks "Login with Google/Facebook"
2. OAuth provider authenticates user
3. System checks if user exists by OAuth ID
4. If not found, checks by email
5. If email exists, links OAuth account to existing user
6. If no user found, creates new user with OAuth data
7. User is auto-verified and logged in
8. JWT tokens are generated and returned

### Existing OAuth User
1. User clicks "Login with Google/Facebook"
2. OAuth provider authenticates user
3. System finds user by OAuth ID
4. User is logged in with JWT tokens

### Mixed Authentication
- Users can link multiple OAuth providers to same email
- System prevents duplicate accounts
- OAuth users are auto-verified
- OAuth users cannot use password login

## Security Features

- **Password Hashing**: bcrypt with configurable salt rounds
- **JWT Tokens**: Secure token-based authentication
- **Session Management**: Express-session for OAuth flows
- **CORS**: Configurable CORS settings
- **Rate Limiting**: Built-in rate limiting
- **Input Validation**: Zod schema validation
- **Error Handling**: Comprehensive error handling
- **Logging**: Winston-based logging system

## Error Handling

The API includes comprehensive error handling:

- **Validation Errors**: Zod schema validation errors
- **Authentication Errors**: JWT and OAuth errors
- **Database Errors**: MongoDB connection and query errors
- **Business Logic Errors**: Custom application errors
- **Global Error Handler**: Centralized error processing

## Logging

The application uses Winston for logging:

- **Success Logs**: API requests and responses
- **Error Logs**: Application errors and exceptions
- **Daily Rotation**: Log files rotate daily
- **Multiple Levels**: Different log levels for different purposes

## Development

```bash
# Run with hot reload
npm run dev

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Seed admin user
npm run seed
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Configure production database
3. Set secure JWT secrets
4. Configure OAuth callback URLs
5. Set up proper CORS origins
6. Configure email settings
7. Set up logging and monitoring

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Additional Resources

Happy Coding! 🚀 Thank you for using the **Backend Template**! 🚴‍♂️

## Step 1 - Set Up Your Project Environment

Here's how you can set up your Node.js project with the required dependencies:

**1. Initialize the Project:**

Create a `package.json` file for managing your project dependencies.

```bash
npm init -y
```

**2. Install Required Packages:**

Add essential libraries and tools for your application:

```bash
npm install express       # Web framework for building APIs
npm install cors          # Enables Cross-Origin Resource Sharing
npm install dotenv        # Manages environment variables
npm install mongoose      # MongoDB object modeling tool
```

**3. Add TypeScript Support:**

Install TypeScript type definitions for the above libraries:

```bash
npm install @types/express @types/node @types/cors --save-dev
```

**4. Install Development Tools:**

Add `nodemon` for automatic server restarts during development:

```bash
npm install -D nodemon
```

## Step 2 — Adding TypeScript

We need to add a typescript package in our project, so that we can use the TypeScript compiler and other related tools.

```bash
npm i -D typescript
```

This command will add typescript package as a dev-dependency in our project.

Now, we need to add typescript config file, for that we will use the below given command.

```bash
tsc --init
```

This will create a **tsconfig.json file**, with the default compiler configurations shown in the image below.

In the **tsconfig.json file**, remove the comments on the **rootDir** option and modify it, to set **src** as root directory for typescript.

`"rootDir": "./src"`,

Similarly, do this for **outDir** option as well

`"outDir": "./dist"`,

All .js files will be created in this **build** folder after compiling the .ts files which are inside the src folder.

## Step 3 — Adding Eslint

For adding eslint, we will install the required packages given below.

```bash
npm i -D eslint@9.14.0 @eslint/js @types/eslint__js typescript typescript-eslint
```

Now make a eslint.config.mjs file in the root of the project director.

```bash
npx eslint --init
```

At this point you may see that your version of `eslint: "^9.14.0"` has been changed to eslint: `"^9.15.0"`

if that happens remove the eslint : `npm remove eslint` Then re-install: `npm i -D eslint@9.14.0`

Now add the following code inside it.

```js
{
    ignores: ["node_modules", "dist"],
    rules: {
      "no-unused-vars": "error",
    },
  },
```

```js
import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
     { files: ['**/*.{js,mjs,cjs,ts}'] },
     { languageOptions: { globals: globals.node } },
     pluginJs.configs.recommended,
     ...tseslint.configs.recommended,
     {
          ignores: ['node_modules', 'dist'],
          rules: {
               'no-unused-vars': 'off',
               '@typescript-eslint/no-unused-vars': 'error',
               'no-unused-expressions': 'error',
               'prefer-const': 'error',
               'no-undef': 'error',
               'no-console': 'warn',
          },
     },
];
```

Now in the terminal, you can run npm eslint . You can see that eslint is working.

We can also add scripts for eslint in the **package.json** file.

```js
"scripts": {
"lint": "eslint src/**/*.ts",
"lint:fix": "eslint src/**/*.ts --fix"
},
```

## Step 4 — Adding Prettier

Add the prettier package in your project.

```bash
npm i -D --exact prettier
```

Now create `.prettierrc` and `.prettierignore` file in the root of your project.

Include basic configurations for prettier in the `.prettierrc` file.

```js
{
  "semi": true,
  "singleQuote": true
}
```

Also, we need to tell prettier which files to not format So inside `.prettierignore` include the following.

```js
dist;
```

Finally we can add scripts for prettier as well in the **package.json** file.

`"format": "prettier . --write"`

## Step 5 — Adding Ts-Node-Dev

`ts-node-dev` Installation and Usage

**Why install and use** `ts-node-dev`?

**Installation:**

- `ts-node-dev` is a development dependency for TypeScript projects.

**Install it using:**

```bash
npm i ts-node-dev --save-dev
```

**Usage:**

- It runs TypeScript files directly, so you don't need to manually compile them using tsc.

- It automatically restarts the server when file changes are detected, making development faster.

- Command to start your server:

```bash
npx ts-node-dev --transpile-only src/server.ts
```

## Project Scripts

```
"scripts": {
  "build": "tsc",                                                   # Compiles TypeScript files to JavaScript
  "start:dev": "npx ts-node-dev --transpile-only src/server.ts",    # Runs the server in development mode with hot-reloading
  "start:prod": "node ./dist/server.js",                            # Starts the server in production mode
  "start": "nodemon ./dist/server.js",                              # Runs the production build with automatic restarts
  "lint": "eslint src/**/*.ts",                                     # Checks code style and errors using ESLint
  "lint:fix": "eslint src/**/*.ts --fix",                           # Fixes code style issues automatically
  "format": "prettier . --write"                                    # Formats code consistently with Prettier
}
