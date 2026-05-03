# PawCare: Complete Launch & Deployment Program

Taking PawCare from a local development environment to a live, production-ready startup involves several critical phases. This guide outlines the exact steps, infrastructure choices, and pre-launch checklists required to successfully launch the platform.

---

## Phase 1: Pre-Launch Preparation

Before touching any cloud providers, the codebase must be prepped for production.

### 1. Database Migration
Currently, the app uses `mongodb-memory-server` for local development. For production, you need a persistent, scalable database.
*   **Action**: Create a free or paid cluster on **MongoDB Atlas** (https://www.mongodb.com/atlas).
*   **Security**: Whitelist your production server IP addresses (or allow access from anywhere `0.0.0.0/0` if using a PaaS like Render, but use strong passwords).
*   **String**: Obtain your production connection string: `mongodb+srv://<username>:<password>@cluster0...`

### 2. Third-Party API Production Keys
Swap all "test" keys for live production keys.
*   **Razorpay**: Generate "Live Mode" API keys from the Razorpay dashboard.
*   **ZegoCloud**: Ensure your project is set to "Production" in the Zego console to lift minute restrictions.
*   **Nodemailer**: Create a dedicated Google Workspace email (e.g., `support@pawcare.in`) and generate an App Password.

### 3. Clean Up Code
*   **CORS**: Update the `cors` middleware in `server/index.js` to strictly allow requests *only* from your production frontend URL (e.g., `https://pawcare.in`), rather than `*` or `localhost`.
*   **Seed Data**: Ensure the auto-seeding logic in `server/index.js` is disabled or modified so it doesn't wipe production data on every restart.

---

## Phase 2: Infrastructure Setup

For a MERN stack startup, the most cost-effective and scalable approach is separating the frontend and backend hosting.

### 1. Frontend Hosting (Vercel or Netlify)
React (Vite) applications are static files once built. They should be hosted on an Edge CDN for maximum speed.
*   **Platform**: **Vercel** (Highly recommended for Vite/React).
*   **Steps**:
    1. Push your `client` folder to a GitHub repository.
    2. Connect Vercel to the repository.
    3. Set the Root Directory to `client`.
    4. Build Command: `npm run build`
    5. Output Directory: `dist`
    6. **Environment Variables**: Add `VITE_API_URL` pointing to your future backend URL (e.g., `https://api.pawcare.in/api`).

### 2. Backend Hosting (Render, Railway, or AWS EC2)
The Node.js backend requires a continuous runtime environment.
*   **Platform**: **Render** (Great for startups, easy CI/CD) or **DigitalOcean App Platform**.
*   **Steps**:
    1. Connect Render to your GitHub repository.
    2. Create a "Web Service".
    3. Set the Root Directory to `server`.
    4. Build Command: `npm install`
    5. Start Command: `npm start` (which runs `node index.js`).
    6. **Environment Variables**: Add all production variables here (see Phase 3).

---

## Phase 3: Production Environment Variables

Ensure these are securely added to your backend hosting provider (e.g., Render Dashboard):

```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://<db_user>:<db_pass>@cluster0.mongodb.net/pawcare_prod
JWT_SECRET=generate_a_very_long_secure_random_string

# Razorpay (Live Keys)
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=...

# ZegoCloud
ZEGO_APP_ID=...
ZEGO_SERVER_SECRET=...

# Email 
EMAIL_USER=support@pawcare.in
EMAIL_PASS=...
```

---

## Phase 4: Domain & SSL Setup

1.  **Purchase a Domain**: Buy a domain via Namecheap, GoDaddy, or AWS Route53 (e.g., `pawcare.in`).
2.  **DNS Configuration**:
    *   Point the root domain (`@` and `www`) to Vercel (Frontend) via A/CNAME records.
    *   Create a subdomain (e.g., `api.pawcare.in`) and point it to your Render backend URL via a CNAME record.
3.  **SSL Certificates**: Both Vercel and Render automatically provision and renew free Let's Encrypt SSL certificates. Ensure your site forces HTTPS.

---

## Phase 5: CI/CD Pipeline (Continuous Deployment)

By linking Vercel and Render directly to your GitHub repository, you automatically enable CI/CD:
*   Whenever you push code to the `main` branch, Vercel will rebuild and deploy the React frontend.
*   Render will simultaneously detect changes in the `server` folder and deploy the new Node.js API.
*   *Tip*: Setup staging environments. Have a `staging` branch that deploys to a test URL before pushing to `main`.

---

## Phase 6: Launch Day Execution Plan

Follow this exact sequence on launch day:

1.  **Database Initialized**: Connect to MongoDB Atlas via MongoDB Compass. Run your `seed.js` script *locally* pointing to the production URI to establish the initial Admin account and default Site Settings.
2.  **Deploy Backend**: Trigger a manual deploy on Render. Monitor the logs to ensure "MongoDB connected" and "Server running".
3.  **Deploy Frontend**: Trigger a manual deploy on Vercel.
4.  **Sanity Testing (Live)**:
    *   Create a dummy customer account.
    *   Add a product to the cart and checkout (Test the COD flow).
    *   Log in as Admin, assign a delivery agent, and check if the email arrives.
    *   Test the Razorpay integration (make a ₹1 test payment for a consult).
    *   Join a WebRTC video room to ensure ZegoCloud works in production.
5.  **Soft Launch**: Invite 10-20 friends/beta testers to try breaking the app.
6.  **Hard Launch**: Remove the password protection (if any), announce on social media, and turn on marketing campaigns.

> [!WARNING] 
> **Security Checklist Before Launch**:
> - Double-check that `cors` strictly limits origins to `pawcare.in`.
> - Ensure all `console.log` statements containing sensitive data are removed.
> - Verify that MongoDB network access is restricted to Render's IPs.

---

## Phase 7: Post-Launch Operations

Once live, the focus shifts to monitoring and scaling:
*   **Error Tracking**: Integrate **Sentry** into both React and Node.js. It will alert you via email/Slack the moment an unhandled exception or crash occurs in production.
*   **Analytics**: Add Google Analytics or PostHog to the React app to track user behavior, drop-off rates in the cart, and popular products.
*   **Database Backups**: Enable automated daily backups in MongoDB Atlas.
