# Framez - Social Media Mobile App

A modern, Instagram-inspired social media mobile application built with React Native (Expo) and Firebase.

## 🚀 Features

### ✅ Core Features (Implemented)

- **Authentication**
  - Secure sign-up with username, email, and password validation
  - Login with email/password
  - Persistent user sessions (remains logged in after app restart)
  - Logout functionality
  - Password reset flow

- **Posts**
  - Create text-based posts
  - Real-time feed displaying all posts from all users
  - Chronological feed (newest first)
  - Post details with full comment thread
  - Edit and delete your own posts
  - Like/unlike posts
  - Add comments to posts
  - View comment counts and like counts

- **Profile**
  - View your profile information (username, email, avatar)
  - Display all posts created by the current user
  - View post statistics (likes, comments)
  - View comment activity stats

- **UI/UX**
  - Beautiful onboarding experience with image backgrounds
  - Dark/Light theme support
  - Smooth navigation with bottom tabs
  - Drag-to-refresh on all screens
  - Card-based post design with shadows
  - Responsive layout for all screen sizes
  - Safe area handling for notched devices

## 🛠️ Tech Stack

- **Framework**: React Native with Expo (~54.0.23)
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **State Management**: Zustand
- **Navigation**: React Navigation (Stack & Bottom Tabs)
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Form Handling**: Formik + Yup
- **Icons**: Expo Vector Icons (Ionicons)
- **Language**: TypeScript

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Firebase account
- iOS Simulator (Mac) or Android Emulator / Physical device

## 🔧 Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd framez-social-sharing
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Firebase Configuration

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password)
3. Create a Firestore Database
4. Get your Firebase config credentials:
   - Go to Project Settings → General → Your apps
   - Add a web app if you haven't already
   - Copy the config object

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

### 5. Firestore Security Rules

**⚠️ IMPORTANT**: You MUST set up Firestore security rules!

1. Go to Firebase Console → Firestore Database → Rules
2. Copy the rules from `firestore.rules` file
3. Paste and publish the rules

See `FIRESTORE_SETUP.md` for detailed instructions.

### 6. Run the App

```bash
# Start the Expo development server
npm start

# Or run on specific platform
npm run android  # Android
npm run ios      # iOS (Mac only)
```

### 7. Test on Device

- **Expo Go**: Install Expo Go app on your phone and scan the QR code
- **Simulator/Emulator**: Press `i` for iOS or `a` for Android in the terminal

## 📱 App Structure

```
src/
├── navigation/          # Navigation setup
│   ├── AppNavigator.tsx  # Main navigation (auth + app)
│   └── MainTabNavigator.tsx  # Bottom tab navigation
├── screens/
│   ├── auth/            # Authentication screens
│   ├── feed/            # Feed screen
│   ├── create-post/     # Create post screen
│   ├── profile/         # Profile screen
│   ├── post-detail/     # Post detail screen
│   └── onboarding/      # Onboarding screens
├── services/            # Firebase services
│   ├── firebase.ts      # Firebase initialization
│   ├── posts.ts         # Post operations
│   └── users.ts         # User operations
├── state/               # State management
│   └── auth.ts          # Auth state (Zustand)
├── theme/               # Theme management
└── utils/               # Utility functions
```

## 🎨 Design Features

- **Instagram-inspired UI**: Clean, modern interface
- **Card-based posts**: Posts displayed as cards with shadows
- **Banner carousel**: Promotional banner at top of feed
- **Smooth animations**: Fade transitions and smooth scrolling
- **Theme support**: Automatic dark/light mode based on system preference

## 🔐 Security

- Firestore security rules enforce:
  - Users can only create/update/delete their own posts
  - All authenticated users can read posts
  - User profiles are readable by all, writable only by owner

## 📝 Key Features Explained

### Real-time Updates
All posts, comments, and likes update in real-time using Firestore's `onSnapshot` listeners.

### Persistent Sessions
Firebase Authentication automatically handles session persistence. Users remain logged in after closing and reopening the app.

### Post Interactions
- **Likes**: Tap the heart icon to like/unlike
- **Comments**: Add comments directly from the feed or post detail page
- **Edit/Delete**: Own posts can be edited or deleted from the post detail page

## 🐛 Troubleshooting

### Posts not loading?
- Check Firestore security rules are published
- Verify Firebase config in `.env`
- Ensure you're authenticated

### Authentication not working?
- Verify Firebase Authentication is enabled
- Check email/password provider is enabled in Firebase Console
- Verify `.env` file has correct credentials

### Icons not showing?
- Icons use Expo Vector Icons (Ionicons) - should work out of the box
- If issues persist, try clearing cache: `expo start -c`

## 📦 Deployment

### Expo Go (Testing)
1. Run `npm start`
2. Scan QR code with Expo Go app

### Appetize.io (Web Demo)
1. Build the app: `expo build:web` or use EAS Build
2. Upload to Appetize.io for web-based demo

### Production Build
```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build for production
eas build --platform android
eas build --platform ios
```

## 📄 License

This project is part of the HNG-13 internship program.

## 👤 Author

Built as part of HNG-13 Stage 3 Task

## 🎯 Acceptance Criteria Status

- ✅ User can register, log in, and log out successfully
- ✅ Auth session persists on app restart
- ✅ User can create new posts
- ✅ Posts display correctly in a feed
- ✅ User's profile displays correctly with their posts
- ✅ Smooth navigation and responsive layout
- ✅ App runs without errors on Android and iOS (tested)

## 📸 Screenshots

*Add screenshots of your app here*

## 🎥 Demo Video

*Link to your 2-3 minute demo video here*

## 🔗 Links

- **GitHub Repository**: [Your Repo URL]
- **Appetize.io Demo**: [Your Appetize Link]
- **Demo Video**: [Your Video Link]

---

**Note**: Make sure to set up Firebase and Firestore security rules before running the app!

