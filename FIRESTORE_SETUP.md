# Firestore Security Rules Setup

## ⚠️ IMPORTANT: You MUST set up Firestore security rules for the app to work!

The app will not be able to create posts or read data without proper security rules.

## How to Set Up Firestore Rules:

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**
3. **Navigate to**: Firestore Database → Rules tab
4. **Copy and paste** the rules from `firestore.rules` file
5. **Click "Publish"** to save the rules

## What the Rules Do:

- **Posts Collection**: 
  - ✅ Authenticated users can read all posts
  - ✅ Users can create posts (must set their own userId)
  - ✅ Users can update posts (for likes/comments)
  - ✅ Users can delete their own posts

- **Users Collection**:
  - ✅ Authenticated users can read any user profile
  - ✅ Users can only create/update their own profile

## Testing:

After setting up the rules, try creating a post again. The "offline" error should be resolved, and posts should save successfully.

## Troubleshooting:

If you still see errors:
1. Make sure you're logged in (authenticated)
2. Check that the rules were published successfully
3. Verify your Firebase config in `.env` is correct
4. Check the browser/device console for specific error messages

