# Firebase Setup Guide

Follow these steps to set up Firebase for your Personal Wallet application.

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter a project name (e.g., "personal-wallet")
4. Click **Continue**
5. Disable Google Analytics (optional) or configure it
6. Click **Create project**
7. Wait for the project to be created, then click **Continue**

## Step 2: Register Your Web App

1. In your Firebase project dashboard, click the **Web icon** (`</>`) to add a web app
2. Enter an app nickname (e.g., "Personal Wallet Web")
3. **Do NOT** check "Also set up Firebase Hosting" (unless you want to deploy to Firebase)
4. Click **Register app**
5. You'll see your Firebase configuration object - **keep this page open**, you'll need these values

## Step 3: Enable Authentication

1. In the left sidebar, click **Build** → **Authentication**
2. Click **Get started**
3. Click on the **Sign-in method** tab
4. Enable **Email/Password**:
   - Click on "Email/Password"
   - Toggle **Enable** to ON
   - Click **Save**
5. (Optional) Enable **Google** sign-in:
   - Click on "Google"
   - Toggle **Enable** to ON
   - Select a support email
   - Click **Save**

## Step 4: Set Up Firestore Database

1. In the left sidebar, click **Build** → **Firestore Database**
2. Click **Create database**
3. Select **Start in test mode** (we'll add security rules later)
4. Click **Next**
5. Choose a Firestore location (select closest to your region)
6. Click **Enable**
7. Wait for the database to be created

## Step 5: Configure Firestore Security Rules

1. In Firestore Database, click on the **Rules** tab
2. Replace the existing rules with the following:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own wallet items
    match /users/{userId}/walletItems/{itemId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Prevent access to other users' data
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

3. Click **Publish**

## Step 6: Configure Your Application

1. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Open the `.env` file and fill in your Firebase configuration values from Step 2:
   ```
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

3. Generate a random encryption salt (important for security):
   ```
   VITE_ENCRYPTION_SALT=your_random_string_here_make_it_long_and_complex
   ```
   
   **Tip**: Use a password generator to create a strong random string (30+ characters)

## Step 7: Install Dependencies

**IMPORTANT**: You need to install Node.js first if you haven't already.

1. Download and install Node.js from [nodejs.org](https://nodejs.org/) (LTS version recommended)
2. Restart your terminal/command prompt
3. Navigate to your project directory
4. Run:
   ```bash
   npm install
   ```

## Step 8: Run the Application

```bash
npm run dev
```

The application will start at `http://localhost:5173` (or another port if 5173 is busy)

## Security Best Practices

1. **Never commit your `.env` file** to version control (it's already in `.gitignore`)
2. **Keep your encryption salt secret** and never share it
3. **Use strong passwords** for your wallet account
4. **Enable 2FA** on your Firebase account for extra security
5. **Regularly review** Firebase Authentication users and Firestore data

## Troubleshooting

### "Firebase: Error (auth/configuration-not-found)"
- Make sure your `.env` file exists and has the correct values
- Restart the development server after creating/modifying `.env`

### "Missing or insufficient permissions"
- Check that Firestore security rules are properly configured
- Make sure you're logged in to the application

### "Module not found" errors
- Run `npm install` to install all dependencies
- Delete `node_modules` and `package-lock.json`, then run `npm install` again

## Need Help?

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules Guide](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Authentication Guide](https://firebase.google.com/docs/auth)
