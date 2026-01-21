# Firebase Migration - Setup Instructions

## Prerequisites

1. **Firebase Project Setup**
   - Ensure you have a Firebase project created
   - Firebase configuration added to `.env.local`
   - Firebase CLI installed: `npm install -g firebase-tools`

2. **Environment Variables**
   Create `.env.local` in the `frontend` directory:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

## Step-by-Step Setup

### Step 1: Deploy Security Rules

From the project root directory:

```bash
# Deploy Firestore security rules
firebase deploy --only firestore:rules

# Deploy Firestore indexes
firebase deploy --only firestore:indexes
```

### Step 2: Create First Admin User

From the `frontend` directory:

```bash
# Option 1: Use default credentials (admin@example.com / Admin@123456)
node scripts/createFirstAdmin.js

# Option 2: Use custom credentials via environment variables
ADMIN_EMAIL=your@email.com ADMIN_PASSWORD=YourPassword123 node scripts/createFirstAdmin.js
```

**Important:** Save the credentials displayed in the console!

### Step 3: Seed Database

From the `frontend` directory:

```bash
node scripts/seedDatabase.js
```

This will create:
- 1 Department (Computer Science)
- 3 Rooms (101, 102, Lab-1)
- 4 Subjects (Data Structures, Database Systems, Operating Systems, Database Lab)
- 2 Classes (CS-3A, CS-3B)
- 30 Time Slots (Monday-Friday, 6 periods each)
- 2 Teachers (John Doe, Jane Smith)
- 3 Teacher-Subject mappings

### Step 4: Verify Setup

1. **Check Firebase Console:**
   - Go to Firestore Database
   - Verify all collections are created
   - Check that data exists in each collection

2. **Check Authentication:**
   - Go to Firebase Authentication
   - Verify admin user is created

### Step 5: Run Development Server

```bash
cd frontend
npm run dev
```

### Step 6: Test Login

1. Navigate to `http://localhost:5173/auth`
2. Login with admin credentials
3. Verify you're redirected to dashboard
4. Check that admin dashboard loads correctly

## Troubleshooting

### "Permission denied" errors
- Ensure Firestore rules are deployed: `firebase deploy --only firestore:rules`
- Check that user is authenticated
- Verify user has correct role in Firestore

### "User profile not found"
- Ensure user document exists in Firestore `users` collection
- Document ID must match Firebase Auth UID
- Check that document has `role` field

### "Auth state not persisting"
- Clear browser cache and localStorage
- Check that `AuthInitializer` is wrapping the app in `main.jsx`
- Verify Firebase config is correct in `.env.local`

### Scripts fail with "Firebase not initialized"
- Ensure `.env.local` exists with all Firebase config
- Check that environment variables are loaded (use `process.env.VITE_*`)
- Verify Firebase project exists and is active

### "Firestore indexes required" error
- Deploy indexes: `firebase deploy --only firestore:indexes`
- Wait 2-3 minutes for indexes to build
- Check index status in Firebase Console

## Next Steps

After successful setup:

1. **Change Admin Password:**
   - Login as admin
   - Go to settings/profile
   - Update password

2. **Create Additional Users:**
   - Use admin panel to create teachers, students, HODs
   - Assign appropriate roles and departments

3. **Configure Departments:**
   - Add your actual departments
   - Update seed data departmentId references

4. **Test RBAC:**
   - Login as different roles
   - Verify access restrictions work
   - Test unauthorized page

## File Structure

```
frontend/
├── scripts/
│   ├── createFirstAdmin.js   # Creates first admin user
│   └── seedDatabase.js        # Seeds database with sample data
├── src/
│   ├── config/
│   │   └── firebase.js        # Firebase configuration
│   ├── features/
│   │   └── auth/
│   │       ├── api/
│   │       │   ├── createUser.js    # User creation API
│   │       │   └── getUserData.js   # User data fetching
│   │       ├── hooks/
│   │       │   └── useAuth.js       # Auth hooks
│   │       ├── authInit.jsx         # Auth state listener
│   │       ├── dashboard.jsx        # Role-based dashboard
│   │       └── unauthorized.jsx     # Access denied page
│   ├── components/
│   │   └── ProtectedRoute.jsx       # Route guards
│   └── constants/
│       └── roles.js                  # Role definitions
├── .env.local                        # Firebase config (create this)
└── package.json

Root/
├── firestore.rules                   # Security rules
├── firestore.indexes.json            # Composite indexes
└── firebase.json                     # Firebase config
```

## Security Checklist

- [x] Firestore rules deployed (no wide-open access)
- [x] Authentication required for all data access
- [x] Role-based access control implemented
- [x] Admin-only routes protected
- [x] HOD department-level restrictions
- [ ] Admin password changed from default
- [ ] Production environment variables secured

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Firebase Console for errors
3. Check browser console for client-side errors
4. Verify all environment variables are set correctly
