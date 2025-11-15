# ChronoChat iOS App

A note-taking iOS application that lets you take notes like chatting, with chronological organization and inline hashtag support.

## Features

- **Chat-like Interface**: Take notes as if you're having a conversation
- **Chronological Timeline**: Notes are automatically organized by timestamp
- **Tagging System**: Create topic-based timelines with tags
- **Markdown Export**: Export all your notes as a Markdown file
- **iOS Optimized**: Native iOS experience with proper keyboard handling and animations

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- iOS development environment (Xcode)
- Expo CLI

### Installation

1. Navigate to the project directory:
```bash
cd ChronoChat
```

2. Install dependencies:
```bash
npm install
```

3. Start the Expo development server:
```bash
npm start
```

4. Run on iOS:
```bash
npm run ios
```

Or open the Expo Go app on your iOS device and scan the QR code.

## Usage

1. **Taking Notes**: Simply type in the input field and tap "Send" to add a new note
2. **Adding Tags**: Type hashtags directly in your notes (e.g., "Meeting with #team about #project")
3. **Filtering**: Tap on tag filters to view notes by specific topics

5. **Deleting**: Tap "Delete" on any note to remove it

## Project Structure

```
StrflowIOS/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── NoteItem.tsx   # Individual note display
│   │   ├── TagInput.tsx   # Tag input component

│   ├── screens/           # Screen components
│   │   ├── MainScreen.tsx # Main note-taking screen
│   │   └── TagTimelineScreen.tsx # Tag-specific timeline
│   └── context/
│       └── NoteContext.tsx # Note management context
├── assets/               # Images and icons
└── App.tsx              # Main app component
```

## iOS-Specific Features

- Native keyboard handling with KeyboardAvoidingView
- iOS-style animations and transitions
- Portrait-only orientation lock
- Optimized for iPhone and iPad
- Native file sharing integration

## Technologies Used

- React Native with TypeScript
- Expo for cross-platform development
- React Navigation for screen management
- AsyncStorage for local data persistence


## Building for Production

To build the app for production:

1. Configure app.json with your app details
2. Run the build command:
```bash
expo build:ios
```

3. Follow the Expo build process to generate your IPA file

## License

This project is part of the ChronoChat note-taking application suite.