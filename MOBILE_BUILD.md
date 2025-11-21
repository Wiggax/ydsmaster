# Mobile App Build Guide

This guide explains how to build and run the YDS Master Pro mobile app on iOS and Android.

## Prerequisites

### For Android Development
- **Android Studio** (latest version)
- **Java Development Kit (JDK)** 17 or higher
- **Android SDK** (installed via Android Studio)

### For iOS Development (Mac only)
- **macOS** (required for iOS builds)
- **Xcode** 14 or higher
- **CocoaPods** (install with: `sudo gem install cocoapods`)
- **Apple Developer Account** (for device testing and App Store deployment)

## Backend Setup

⚠️ **Important:** The mobile app needs to connect to a backend server.

### Development (Local Testing)
1. Find your computer's local IP address:
   - Windows: Run `ipconfig` and look for IPv4 Address
   - Mac/Linux: Run `ifconfig` and look for inet address

2. Update `capacitor.config.ts`:
   ```typescript
   server: {
     url: 'http://10.100.228.29:5173',
     cleartext: true
   }
   ```

3. Start the backend server:
   ```bash
   npm start
   ```

4. Make sure your mobile device/emulator is on the same WiFi network

### Production Deployment
For production, deploy your backend to a hosting service:
- **Heroku** (easy, free tier available)
- **DigitalOcean** (VPS)
- **AWS** (scalable)
- **Vercel/Netlify** (for serverless)

Then update the API URL in `src/utils/platform.js`:
```javascript
return import.meta.env.VITE_API_URL || 'https://your-backend-url.com';
```

## Building the App

### 1. Build Web Assets
```bash
npm run build
```

### 2. Sync to Native Projects
```bash
npx cap sync
```

This command:
- Copies web assets to native projects
- Updates native dependencies
- Syncs Capacitor plugins

## Android Development

### Opening in Android Studio
```bash
npx cap open android
```

Or manually open the `android` folder in Android Studio.

### Running on Emulator
1. In Android Studio, click **Device Manager**
2. Create a new virtual device (recommended: Pixel 5 with Android 13+)
3. Click the **Run** button (green play icon)

### Running on Physical Device
1. Enable **Developer Options** on your Android device:
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times
   
2. Enable **USB Debugging**:
   - Settings → Developer Options → USB Debugging

3. Connect device via USB
4. Click **Run** in Android Studio

### Building APK (Debug)
```bash
cd android
./gradlew assembleDebug
```
APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

### Building APK (Release)
1. Generate a keystore:
   ```bash
   keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
   ```

2. Create `android/key.properties`:
   ```properties
   storePassword=YOUR_STORE_PASSWORD
   keyPassword=YOUR_KEY_PASSWORD
   keyAlias=my-key-alias
   storeFile=../my-release-key.keystore
   ```

3. Build release APK:
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

APK location: `android/app/build/outputs/apk/release/app-release.apk`

## iOS Development (Mac Only)

### Opening in Xcode
```bash
npx cap open ios
```

Or manually open `ios/App/App.xcworkspace` in Xcode.

### Installing Dependencies
```bash
cd ios/App
pod install
```

### Running on Simulator
1. In Xcode, select a simulator from the device dropdown (e.g., iPhone 15 Pro)
2. Click the **Run** button (play icon) or press `Cmd + R`

### Running on Physical Device
1. Connect your iPhone/iPad via USB
2. In Xcode, select your device from the device dropdown
3. Configure signing:
   - Select the project in the navigator
   - Go to **Signing & Capabilities**
   - Select your **Team** (Apple Developer Account required)
4. Click **Run**

### Building for App Store
1. Archive the app:
   - Product → Archive
2. Distribute:
   - Window → Organizer → Archives
   - Select your archive → Distribute App
   - Follow the App Store Connect workflow

## Development Workflow

### Making Changes to Web Code
1. Edit your React code in `src/`
2. Build: `npm run build`
3. Sync: `npx cap sync`
4. Reload app in Android Studio/Xcode

### Live Reload (Development)
For faster development, use live reload:

1. Start dev server:
   ```bash
   npm run dev
   ```

2. Update `capacitor.config.ts`:
   ```typescript
   server: {
     url: 'http://YOUR_LOCAL_IP:5173',
     cleartext: true
   }
   ```

3. Run `npx cap sync`
4. Run app - it will connect to your dev server

### Updating Native Plugins
When adding new Capacitor plugins:
```bash
npm install @capacitor/plugin-name --legacy-peer-deps
npx cap sync
```

## Troubleshooting

### Android Issues

**Gradle build fails:**
- Update Android Studio to the latest version
- File → Invalidate Caches → Invalidate and Restart
- Delete `android/.gradle` and rebuild

**App crashes on startup:**
- Check `adb logcat` for errors
- Verify backend URL is accessible from device
- Check AndroidManifest.xml permissions

### iOS Issues

**Pod install fails:**
- Update CocoaPods: `sudo gem install cocoapods`
- Clean pod cache: `pod cache clean --all`
- Delete `ios/App/Pods` and run `pod install` again

**Code signing errors:**
- Verify Apple Developer Account is active
- Check Bundle Identifier is unique
- Ensure provisioning profiles are up to date

**App crashes on startup:**
- Check Xcode console for errors
- Verify backend URL is accessible from device
- Check Info.plist permissions

### Common Issues

**White screen on app launch:**
- Verify `npm run build` completed successfully
- Check `capacitor.config.ts` has correct `webDir: 'dist'`
- Run `npx cap sync` to copy assets

**API calls failing:**
- Verify backend is running and accessible
- Check network permissions in AndroidManifest.xml / Info.plist
- Test API URL in browser from mobile device
- For HTTPS, ensure valid SSL certificate

**Plugins not working:**
- Run `npx cap sync` after installing plugins
- Check plugin is listed in native project dependencies
- Verify permissions in AndroidManifest.xml / Info.plist

## App Store Deployment

### Android (Google Play)
1. Build release APK or AAB (Android App Bundle)
2. Create a Google Play Developer account ($25 one-time fee)
3. Create app listing in Google Play Console
4. Upload APK/AAB
5. Complete store listing (screenshots, description, etc.)
6. Submit for review

### iOS (App Store)
1. Create an Apple Developer account ($99/year)
2. Create App ID in Apple Developer Portal
3. Create app in App Store Connect
4. Archive and upload build from Xcode
5. Complete app information and screenshots
6. Submit for review

## Additional Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Developer Guide](https://developer.android.com)
- [iOS Developer Guide](https://developer.apple.com)
- [React Documentation](https://react.dev)

## Support

For issues specific to this app, check:
- Backend logs: Check terminal running `npm start`
- Mobile logs: `adb logcat` (Android) or Xcode console (iOS)
- Network requests: Use Chrome DevTools for web debugging
