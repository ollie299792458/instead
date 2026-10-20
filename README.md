# Instead — Pause, Remember Why, Do Instead

> A calm, non-adversarial micro-contract app to replace impulse TikTok/Shorts scrolling with intentional actions derived from first principles.

## The Behavioral Philosophy
1. **The Micro-Contract:** Never promise not to scroll in the future. You only promise to open this app for 10 seconds first.
2. **First Principles:** The 10-second countdown gives System 2 a moment to wake up, presenting your personal "Why" (*"5 minutes becomes 2 hours"*).
3. **Frictionless Substitution:** Curated alternatives from your personal note with 1-tap deep links or built-in tools.
4. **No Shaming:** If you choose to scroll anyway, pick a 5/10/15 min timebox. A local notification checks in afterwards, feeding your honest reflection into future pause screens.

---

## What's Included

### Seeded Alternatives (From your note)
- **Study:** Duolingo / Babbel, Flashcards (Anki), Peak Brain Training
- **Read:** Instapaper, Google News, Reading book
- **Work:** Emails, Tasks, Flat todo (DIY home jobs checklist)
- **Other:** Meditation (3-min mindful breather), Walk (10-min prompt), Watch the dock (2-min open awareness visual)

### Built-in Micro-Tools
- **Flat Todo (DIY):** Built-in checklist with 1-tap starter chips (*Tighten loose hinge, Oil squeaky door, Clear one surface, Sort tool drawer, Measure space, Bleed radiators*) and effort tags (`5 min`, `15 min`, `Weekend`).
- **Mindful Timer:** In-app audio/haptic timers for Meditation, Walk, and Watch the dock.

---

## Running the App

### Requirements
- Node.js 18+
- [Expo Go](https://expo.dev/client) app installed on your Android device (from Google Play Store)

### Development
```bash
# 1. Install dependencies
npm install

# 2. Start Expo Metro bundler
npx expo start

# 3. Press 'a' for Android emulator, or scan the QR code from the Expo Go app on your phone!
```

### Automatic Interception (Android & iOS)
- **Android Muscle Memory:** Move TikTok off your dock or home screen, and place **Instead** in that exact position. Alternatively, use MacroDroid/Tasker with trigger "App Opened: TikTok" → Action "Open URL: `instead://pause`".
- **iOS Shortcuts:** Create a Personal Automation: When TikTok opens → Open URL `instead://pause`.
