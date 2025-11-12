# Framez - Social Media Mobile App

A modern, feature-rich social media mobile application built with React Native (Expo) and Firebase. Framez allows users to share posts, interact with content through likes and comments, and manage their profiles.

## 📱 Features

### ✅ Authentication
- **Sign Up**: Create account with email, password, and username
- **Sign In**: Secure login with email and password
- **Logout**: Sign out functionality
- **Persistent Sessions**: Users remain logged in after app restart
- **Password Reset**: Forgot password functionality

### ✅ Posts
- **Create Posts**: Share text-based posts with the community
- **Real-time Feed**: View all posts from all users in chronological order
- **Post Interactions**:
  - Like/Unlike posts
  - Add comments
  - View comment counts
  - Edit own posts
  - Delete own posts
- **Post Details**: Dedicated screen for viewing full post with all comments
- **Timestamps**: Relative time display (e.g., "2h ago", "Just now")

### ✅ Profile
- **User Profile**: View current user's information
  - Username
  - Email
  - Avatar (if available)
  - Post count
  - Comments received on posts
  - Comments made on other posts
- **User Posts**: View all posts created by the current user
- **Post Management**: Edit and delete posts from profile

### ✅ UI/UX
- **Dark/Light Theme**: Toggle between themes
- **Onboarding**: Beautiful onboarding experience with image backgrounds
- **Banner**: Promotional banner on feed screen
- **Card Design**: Modern card-based post design with shadows
- **Drag to Refresh**: Pull to refresh on all screens
- **Responsive Layout**: Works on both Android and iOS
- **Safe Area Handling**: Proper support for device notches

## 🛠️ Technologies Used

- **Framework**: React Native (Expo ~54.0)
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **State Management**: Zustand
- **Navigation**: React Navigation (Stack & Bottom Tabs)
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Form Handling**: Formik + Yup
- **Icons**: Expo Vector Icons (Ionicons)
- **TypeScript**: Full type safety

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Firebase account
- Android Studio (for Android) or Xcode (for iOS)

## 🚀 Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd framez-social-sharing
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication:
   - Go to Authentication → Sign-in method
   - Enable Email/Password authentication
3. Create Firestore Database:
   - Go to Firestore Database
   - Create database in production mode
   - Copy the security rules from `firestore.rules` file
   - Paste them in Firestore → Rules tab and publish
4. Get Firebase Configuration:
   - Go to Project Settings → General
   - Scroll to "Your apps" section
   - Add a web app or use existing
   - Copy the Firebase config object

### 4. Environment Variables

Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

**Important**: Replace all values with your actual Firebase configuration.

### 5. Firestore Security Rules

The security rules are already provided in `firestore.rules`. Make sure to:
1. Copy the content from `firestore.rules`
2. Go to Firebase Console → Firestore Database → Rules
3. Paste the rules and click "Publish"

See `FIRESTORE_SETUP.md` for detailed instructions.

### 6. Run the App

```bash
# Start the development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on web (for testing)
npm run web
```

## 📁 Project Structure

```
framez-social-sharing/
├── src/
│   ├── navigation/          # Navigation configuration
│   │   ├── AppNavigator.tsx # Main navigation stack
│   │   └── MainTabNavigator.tsx # Bottom tab navigation
│   ├── screens/              # Screen components
│   │   ├── auth/            # Authentication screens
│   │   ├── feed/             # Feed screen
│   │   ├── profile/          # Profile screen
│   │   ├── create-post/      # Create post screen
│   │   ├── post-detail/      # Post detail screen
│   │   └── onboarding/       # Onboarding screens
│   ├── services/             # Backend services
│   │   ├── firebase.ts      # Firebase initialization
│   │   ├── posts.ts         # Post operations
│   │   └── users.ts         # User operations
│   ├── state/               # State management
│   │   └── auth.ts          # Authentication state (Zustand)
│   ├── theme/               # Theme configuration
│   └── utils/               # Utility functions
├── assets/                   # Images and static assets
├── App.tsx                   # Root component
├── firestore.rules          # Firestore security rules
└── package.json             # Dependencies
```

## 🔐 Security

- Firestore security rules ensure users can only:
  - Read all posts
  - Create posts with their own userId
  - Update posts (for likes/comments)
  - Delete only their own posts
  - Read any user profile
  - Create/update only their own profile

## 📱 Testing

### Using Expo Go
1. Install Expo Go app on your device
2. Scan the QR code from `npm start`
3. The app will load on your device

### Using Simulators
- **Android**: Use Android Studio emulator
- **iOS**: Use Xcode simulator (Mac only)

## 🚢 Deployment

### For Appetize.io
1. Build the app for web or create a standalone build
2. Upload to Appetize.io following their documentation
3. Share the public link

### Building Standalone Apps
```bash
# Android
eas build --platform android

# iOS
eas build --platform ios
```

## 🎯 Key Features Implementation

### Real-time Updates
- Uses Firestore `onSnapshot` for real-time post updates
- Comments and likes update instantly across all users

### State Management
- Zustand for lightweight, performant state management
- Firebase Auth persistence handles session management

### Navigation
- Stack navigation for auth flow
- Bottom tab navigation for main app
- Proper deep linking support

## 🐛 Troubleshooting

### Common Issues

1. **Firebase Connection Errors**
   - Verify `.env` file has correct values
   - Check Firebase project is active
   - Ensure Firestore is enabled

2. **Posts Not Showing**
   - Check Firestore security rules are published
   - Verify user is authenticated
   - Check browser/device console for errors

3. **Build Errors**
   - Clear cache: `expo start -c`
   - Delete `node_modules` and reinstall
   - Check Node.js version compatibility

## 📝 Notes

- Image upload for posts was intentionally removed (text-only posts)
- Username validation: 3-20 characters, alphanumeric and underscores only
- Password requirements: Minimum 6 characters with uppercase, lowercase, and number

## 👨‍💻 Development

### Code Style
- TypeScript for type safety
- Functional components with hooks
- Clean component structure
- Proper error handling

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is part of HNG-13 Stage 3 submission.

## 🙏 Acknowledgments

- Firebase for backend services
- Expo for React Native tooling
- React Navigation for navigation
- NativeWind for styling

---

**Built with ❤️ for HNG-13**

