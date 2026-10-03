# 💸 SplitTrip — Smart Group Expense & Trip Expense Splitter

SplitTrip is a **mobile group expense splitting app** built for trips, outings, restaurants, and other group activities 🌍

It helps you create groups, add members, record expenses by category, automatically calculate each person's share, track who has paid, and export expense details for easy sharing.

> **"Split expenses. Forget the calculations."**

---

## 🚀 Tech Stack

| Area | Technology |
|------|------------|
| **Frontend / Mobile** | React Native + Expo |
| **Language** | TypeScript |
| **Styling** | NativeWind + Tailwind CSS |
| **Navigation** | React Navigation |
| **State Management** | Zustand |
| **Local Storage** | AsyncStorage |
| **Animations** | React Native Reanimated |
| **PDF Export** | Expo Print |
| **Image Export** | React Native View Shot |
| **File Sharing** | Expo Sharing |
| **Build** | EAS Build |

---

## ✨ Features

👥 **Create Groups**
Create a trip or outing group and add multiple members.

💰 **Add Expenses**
Record expenses such as food, drinks, petrol, hotel stays, smoking, and any other custom category.

📊 **Automatic Expense Splitting**
Split each category among selected members and automatically calculate everyone's share.

💳 **Payment Tracking**
Track which members have paid their share and who still has an outstanding amount.

🧮 **Smart Calculations**
The app calculates how much each member owes based on their participation in each expense category.

📱 **Offline First**
All groups, expenses, calculations, and payment information are stored locally on your Android device.

📄 **PDF Export**
Export expense summaries as PDF files.

🖼️ **Image Export**
Generate an image of the expense summary for easy sharing.

🔗 **Native Sharing**
Share expense summaries directly through Android's sharing options.

🎨 **Modern UI**
Dark-themed interface with smooth animations, rounded cards, and a clean mobile-first design.

---

## 🧮 How SplitTrip Works

Suppose a group has a total expense of **₹4,000**:

| Category | Amount | Participants |
|----------|-------:|--------------|
| Food | ₹1,000 | You, John, Ryan, Alex |
| Drinks | ₹1,200 | Ryan, John, Alex |
| Petrol | ₹1,800 | You, Ryan |

SplitTrip calculates each person's share automatically:

| Member | Share |
|--------|------:|
| You | ₹1,150 |
| John | ₹650 |
| Ryan | ₹1,550 |
| Alex | ₹650 |

Members can then be marked as **Paid** once they settle their amount ✅

---

## 📱 Download & Try SplitTrip

You can download the Android APK and install SplitTrip directly on your personal Android device.

### 📥 Download APK

**[⬇️ Download SplitTrip for Android](https://expo.dev/accounts/bperfect13/projects/SplitTrip/builds/c09064bd-32ac-4fd8-ae51-ef17616d3cfd)**

> **Note:** SplitTrip is currently distributed as an APK for Android and is not yet published on the Google Play Store.

### 🔧 Installation

1. Open the download link on your Android phone.
2. Download the SplitTrip APK.
3. Open the downloaded APK file.
4. Allow installation from your browser or file manager if Android asks for permission.
5. Install SplitTrip.
6. Open the app and start creating your first trip 🎉

---

## 💾 Offline Data Storage

SplitTrip works **completely offline**. All your data stays on your device.

There is:

- ❌ No user login
- ❌ No registration
- ❌ No online database
- ❌ No cloud backend
- ❌ No server dependency

---

## 💻 Local Setup Instructions

### 1. Clone this repository

```bash
git clone https://github.com/bperfect13/SplitTrip.git
cd SplitTrip
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npx expo start
```

Scan the QR code with the **Expo Go** app on your Android phone, or press `a` to open it on an Android emulator.

### 4. Build an APK (optional)

```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview
```

---

## 🏗️ Project Structure

```text
/mobile
│
├── app/              → App routes / screens
├── assets/           → App icons and splash assets
├── components/       → Reusable UI components
├── constants/        → App constants and configuration
├── navigation/       → React Navigation setup
├── screens/          → Application screens
├── services/         → Storage and export services
├── store/            → Zustand state management
├── utils/            → Expense calculation and helper functions
│
├── App.tsx           → Application entry point
├── app.json          → Expo configuration
├── eas.json          → EAS build configuration
├── package.json      → Project dependencies
└── tsconfig.json     → TypeScript configuration
```

---

## 🛠️ Future Improvements

- 📱 Google Play Store release
- 📤 Improved expense sharing
- 📊 Advanced expense history and analytics
- 🔄 Expense editing improvements
- 👥 Better group management
- 💱 Multi-currency support
- 🌐 Optional cloud synchronization
- 📈 Detailed trip spending insights

---

## 👨‍💻 Author

**Ryan Dsouza**
🎓 B.E. Information Technology
🏫 Don Bosco Institute of Technology
🌐 GitHub: [bperfect13](https://github.com/bperfect13)

Built with ❤️ to make group expenses simple and stress-free.
