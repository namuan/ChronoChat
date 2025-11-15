# ChronoChat Mobile App Deployment Guide

This guide provides comprehensive instructions for setting up and deploying the ChronoChat application on real mobile devices for both testing and production environments.

## 📱 Overview

ChronoChat is a React Native application built with Expo that allows users to create timestamped notes with tags, images, and file attachments. The app features calendar-based navigation for browsing messages by date.

## 🛠 Prerequisites

### Development Environment
- **Node.js** (v16 or higher)
- **npm** or **yarn** package manager
- **Expo CLI** (`npm install -g expo-cli`)
- **Git** for version control

### Mobile Development Setup
- **Android Studio** (for Android development)
- **Xcode** (for iOS development, macOS only)
- **Expo Go** app installed on your test device

## 🔧 Development Setup

### 1. Clone and Install
```bash
# Clone the repository
git clone <your-repo-url>
cd ChronoChat

# Install dependencies
npm install
# or
yarn install
```

### 2. Start Development Server
```bash
# Start Expo development server
npm start
# or
expo start
```

### 3. Test on Device

#### Android Device
1. Install **Expo Go** from Google Play Store
2. Ensure your phone and computer are on the same Wi-Fi network
3. Scan the QR code shown in your terminal/browser
4. The app will load in Expo Go

#### iOS Device
1. Install **Expo Go** from App Store
2. Ensure your phone and computer are on the same Wi-Fi network
3. Scan the QR code with your iPhone camera
4. The app will open in Expo Go

## 🧪 Test Mode Deployment

### Local Testing
```bash
# Start development server
npm start

# For specific platforms
npm run android  # Android emulator/device
npm run ios      # iOS simulator/device
```

### TestFlight (iOS Beta Testing)
1. **Create Apple Developer Account** ($99/year)
2. **Install Expo Application Services (EAS)**
   ```bash
   npm install -g eas-cli
   eas login
   ```

3. **Configure iOS Build**
   ```bash
   eas build:configure
   # Select iOS when prompted
   ```

4. **Create iOS Build**
   ```bash
   eas build --platform ios
   ```

5. **Submit to TestFlight**
   ```bash
   eas submit --platform ios
   ```

6. **Add Testers**
   - Go to [App Store Connect](https://appstoreconnect.apple.com)
   - Add internal/external testers
   - Share TestFlight invitation codes

### Google Play Console (Android Beta Testing)
1. **Create Google Play Developer Account** ($25 one-time fee)
2. **Install EAS CLI**
   ```bash
   npm install -g eas-cli
   eas login
   ```

3. **Configure Android Build**
   ```bash
   eas build:configure
   # Select Android when prompted
   ```

4. **Create Android Build**
   ```bash
   eas build --platform android
   ```

5. **Upload to Play Console**
   - Download the APK/AAB from EAS build
   - Upload to [Google Play Console](https://play.google.com/console)
   - Create internal/closed testing track
   - Add tester email addresses

## 🚀 Production Deployment

### iOS App Store
1. **Prepare App for Production**
   ```bash
   # Update app.json with production details
   {
     "expo": {
       "name": "ChronoChat",
       "slug": "chronochat",
       "version": "1.0.0",
       "ios": {
         "bundleIdentifier": "com.yourcompany.chronochat",
         "buildNumber": "1.0.0"
       }
     }
   }
   ```

2. **Build for Production**
   ```bash
   eas build --platform ios --profile production
   ```

3. **App Store Submission**
   ```bash
   eas submit --platform ios
   ```

4. **Complete App Store Requirements**
   - App description and screenshots
   - App icon (1024x1024px)
   - Privacy policy
   - App review information

### Google Play Store
1. **Prepare App for Production**
   ```bash
   # Update app.json with production details
   {
     "expo": {
       "name": "ChronoChat",
       "slug": "chronochat",
       "version": "1.0.0",
       "android": {
         "package": "com.yourcompany.chronochat",
         "versionCode": 1
       }
     }
   }
   ```

2. **Build for Production**
   ```bash
   eas build --platform android --profile production
   ```

3. **Google Play Submission**
   - Upload AAB file to Play Console
   - Complete store listing
   - Add screenshots and descriptions
   - Set up pricing and distribution

## 📋 Pre-Deployment Checklist

### App Configuration
- [ ] Update `app.json` with correct app name and bundle ID
- [ ] Set appropriate version numbers
- [ ] Configure app icons and splash screens
- [ ] Set up proper app permissions
- [ ] Configure app signing certificates

### Security & Privacy
- [ ] Review and update privacy policy
- [ ] Configure data encryption for sensitive information
- [ ] Set up secure API endpoints
- [ ] Review app permissions and justify each one

### Performance
- [ ] Optimize images and assets
- [ ] Minimize bundle size
- [ ] Test on various device sizes
- [ ] Performance profiling completed

### Testing
- [ ] Unit tests passing
- [ ] Integration tests completed
- [ ] Device testing on multiple models
- [ ] User acceptance testing done

## 🔧 Configuration Files

### app.json
```json
{
  "expo": {
    "name": "ChronoChat",
    "slug": "chronochat",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.chronochat"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      },
      "package": "com.yourcompany.chronochat"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    }
  }
}
```

### eas.json
```json
{
  "cli": {
    "version": ">= 0.52.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "distribution": "store",
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

## 🐛 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear cache and rebuild
expo start --clear
# or
eas build --platform ios --clear-cache
```

#### Device Connection Issues
- Ensure device and computer are on same network
- Check firewall settings
- Restart Expo Go app
- Restart development server

#### iOS Specific Issues
- **Certificate Issues**: Regenerate certificates in Apple Developer Portal
- **Provisioning Profile**: Ensure device is added to provisioning profile
- **Bundle Identifier**: Must match exactly with Apple Developer setup

#### Android Specific Issues
- **USB Debugging**: Enable on device (Settings > Developer Options)
- **Unknown Sources**: Allow installation from unknown sources
- **APK Installation**: May need to uninstall previous versions first

### Performance Issues
- Optimize images (use appropriate formats and sizes)
- Lazy load components when possible
- Minimize re-renders with proper React optimization
- Use FlatList for large lists of messages

### Storage Issues
- AsyncStorage has size limitations (6MB on Android)
- Consider migrating to SQLite for larger datasets
- Implement data cleanup/archival strategies

## 📞 Support & Resources

### Official Documentation
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)

### Community Support
- [Expo Community Forums](https://forums.expo.dev/)
- [React Native Community](https://reactnative.dev/community/overview)

### Platform Resources
- [Apple Developer Portal](https://developer.apple.com/)
- [Google Play Console](https://play.google.com/console/)
- [App Store Connect](https://appstoreconnect.apple.com/)

## 🔄 Continuous Deployment

### Automated Builds
Set up GitHub Actions for automated builds:
```yaml
name: Build and Deploy
on:
  push:
    branches: [ main ]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: expo/expo-github-action@v7
        with:
          expo-version: 5.x
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - run: eas build --platform all --non-interactive
```

### Version Management
- Use semantic versioning (MAJOR.MINOR.PATCH)
- Update version in `app.json` before each release
- Keep changelog for version history
- Tag releases in git repository

---

**Note**: This guide assumes you're using Expo managed workflow. For bare React Native workflow, additional native configuration may be required.

**Last Updated**: November 2025
**App Version**: 1.0.0