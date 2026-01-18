# 🚀 DEPLOYMENT GUIDE

Your app is ready to go live! Here are the best free options to deploy your **Personal Wallet / Drive App**.

---

## 🥇 **Option 1: Netlify (Recommended & Easiest)**

Netlify is perfect for Vite/React apps. It's free, fast, and gives you a secure https URL instantly.

### **Steps:**

1.  **Push your code to GitHub**
    *   Create a new repository on GitHub.
    *   Push your code:
        ```bash
        git init
        git add .
        git commit -m "Initial commit"
        git branch -M main
        git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
        git push -u origin main
        ```

2.  **Deploy on Netlify**
    *   Go to [netlify.com](https://netlify.com) and sign up/login.
    *   Click **"Add new site"** -> **"Import from specific repository"**.
    *   Choose **GitHub** and select your repository.
    *   **Build Settings:**
        *   **Build command:** `npm run build`
        *   **Publish directory:** `dist`
    *   Click **"Deploy site"**.

3.  **Fix Routing (Important for React Router)**
    *   Create a file named `_redirects` in your `public` folder with this content:
        ```
        /*  /index.html  200
        ```
    *   Push this change to GitHub. Netlify will re-deploy automatically.

---

## 🥈 **Option 2: Vercel**

Very similar to Netlify, also excellent performance.

1.  Push code to GitHub (same as above).
2.  Go to [vercel.com](https://vercel.com) and sign up.
3.  Click **"Add New..."** -> **"Project"**.
4.  Import your GitHub repository.
5.  Vercel automatically detects Vite. Click **"Deploy"**.

---

## 🥉 **Option 3: Firebase Hosting**

Since you are already using Firebase for Authentication, this keeps everything in one console.

1.  **Install Firebase CLI:**
    ```bash
    npm install -g firebase-tools
    ```

2.  **Login:**
    ```bash
    firebase login
    ```

3.  **Initialize:**
    ```bash
    firebase init
    ```
    *   Select **Hosting**.
    *   Select **Use an existing project** (choose your `perso-rslh` project).
    *   **Public directory:** `dist`
    *   **Configure as a single-page app?** Yes (Important!)
    *   **Set up automatic builds and deploys with GitHub?** No (unless you want to).

4.  **Build & Deploy:**
    ```bash
    npm run build
    firebase deploy
    ```

---

## ⚠️ **Important Checks Before Deploying:**

1.  **Environment Variables:**
    *   Check your `.env` file. Do NOT upload `.env` to GitHub.
    *   In Netlify/Vercel dashboard, go to **Settings > Environment Variables** and add your Firebase config keys manually (e.g., `VITE_FIREBASE_API_KEY`, etc.).

2.  **Firebase Security Domains:**
    *   Go to **Firebase Console > Authentication > Settings > Authorized domains**.
    *   Add your new Netlify/Vercel domain (e.g., `your-app.netlify.app`) to the list. **If you forget this, Google Sign-in will fail.**

3.  **CORS:**
    *   If you use cloud storage features later, update CORS rules to allow your new domain.

---

## 🏆 **My Recommendation:**

**Go with Netlify.**
It's incredibly simple for this type of app.
1. Push to GitHub.
2. Connect Netlify.
3. Add Environment Variables in Netlify Settings.
4. Done! 🎉
