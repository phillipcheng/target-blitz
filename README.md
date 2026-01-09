# 🎯 Target Blitz

An iOS shooting game built with React and Capacitor.

![Target Blitz](https://img.shields.io/badge/Game-Target%20Blitz-red)
![React](https://img.shields.io/badge/React-18.2-blue)
![Capacitor](https://img.shields.io/badge/Capacitor-6.0-green)
![Platform](https://img.shields.io/badge/Platform-iOS-lightgrey)

## 🎮 How to Play

- **Tap targets** as they appear to score points
- **Smaller targets** are worth more points (30 > 20 > 10)
- **Gold star targets** (⭐) give 3x bonus points
- **Build combos** by hitting consecutive targets for multipliers up to 5x
- You have **30 seconds** to get the highest score possible

## ✨ Features

- 📱 Native iOS app with Capacitor
- 📳 Haptic feedback on hits
- 💥 Visual hit feedback with explosions
- 🔥 Combo system with on-screen multiplier display
- 🏆 Persistent high score
- ✨ Animated pulsing targets
- 🎨 Clean, modern UI with gradient styling
- 📱 Safe area support for notched iPhones

---

## 🍎 Publishing to Apple App Store

### Prerequisites

1. **Apple Developer Account** ($99/year)
   - Sign up at https://developer.apple.com
   
2. **Mac with Xcode** (15.0+)
   - Download from Mac App Store
   
3. **Node.js** (18+)

### Step 1: Clone and Setup

```bash
git clone https://github.com/phillipcheng/target-blitz.git
cd target-blitz
npm install
```

### Step 2: Build the Web App

```bash
npm run build
```

### Step 3: Initialize iOS Project

```bash
npx cap add ios
npx cap sync ios
```

### Step 4: Open in Xcode

```bash
npx cap open ios
```

### Step 5: Configure in Xcode

1. **Set Bundle Identifier**: `com.chengyi.targetblitz` (or your own)
2. **Set Team**: Select your Apple Developer account
3. **Set Version**: 1.0.0
4. **Set Build**: 1

### Step 6: Add App Icons

Create app icons in these sizes and add to `ios/App/App/Assets.xcassets/AppIcon.appiconset/`:

| Size | Filename | Usage |
|------|----------|-------|
| 20x20 | Icon-20.png | iPad Notifications |
| 29x29 | Icon-29.png | Settings |
| 40x40 | Icon-40.png | Spotlight |
| 60x60 | Icon-60.png | iPhone App |
| 76x76 | Icon-76.png | iPad App |
| 83.5x83.5 | Icon-83.5.png | iPad Pro App |
| 1024x1024 | Icon-1024.png | App Store |

**Tip**: Use https://appicon.co to generate all sizes from one image.

### Step 7: Add Launch Screen

Edit `ios/App/App/Base.lproj/LaunchScreen.storyboard` or configure splash in Capacitor.

### Step 8: Test on Device

1. Connect your iPhone
2. Select your device in Xcode
3. Press ▶️ Run

### Step 9: Archive for App Store

1. Select "Any iOS Device" as target
2. Product → Archive
3. Window → Organizer
4. Distribute App → App Store Connect

### Step 10: App Store Connect Setup

1. Go to https://appstoreconnect.apple.com
2. Create New App
3. Fill in details:
   - **Name**: Target Blitz
   - **Primary Language**: English
   - **Bundle ID**: com.chengyi.targetblitz
   - **SKU**: targetblitz001

4. Add Screenshots (required sizes):
   - 6.7" (iPhone 15 Pro Max): 1290 x 2796
   - 6.5" (iPhone 14 Plus): 1284 x 2778
   - 5.5" (iPhone 8 Plus): 1242 x 2208

5. Fill App Information:
   - **Description**: Fast-paced target shooting game with combos!
   - **Keywords**: game, shooting, arcade, target, casual
   - **Category**: Games → Casual
   - **Age Rating**: 4+

6. Submit for Review

---

## 📁 Project Structure

```
target-blitz/
├── src/
│   ├── App.jsx          # Main game component
│   ├── main.jsx         # React entry point
│   └── index.css        # Tailwind styles
├── public/
│   └── target.svg       # App icon
├── ios/                  # iOS native project (after cap add ios)
├── capacitor.config.json # Capacitor configuration
├── package.json
├── vite.config.js
└── README.md
```

## 🛠️ Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Sync to iOS
npx cap sync ios

# Open Xcode
npx cap open ios
```

## 🔧 Updating the App

After making changes to the React code:

```bash
npm run build
npx cap sync ios
npx cap open ios
```

Then archive and upload a new build.

---

## 📄 License

MIT License - feel free to use this project however you'd like!

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.
