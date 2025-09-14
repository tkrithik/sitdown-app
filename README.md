# 🍽️ SitDown – Restaurant Discovery (Flutter Edition)

A modern **Flutter** app that focuses on restaurant discovery with a polished navy & gold design, 2-up grid, search & filters, map with pins, and lightweight social features (events & reviews) — **no backend required**.

---

## ✨ Features

### 🏪 Restaurant Discovery

* **Smart Search** – Find restaurants by name, cuisine, or address
* **Cuisine Filters** – Quick chips (Vegetarian, Sushi, Indian, etc.)
* **Random Picker** – Let fate decide your next meal
* **Detailed Info** – Hero image, tags, price/rating/distance pills, open hours
* **Map View** – Toggle to a map (OpenStreetMap via `flutter_map`) with gold pins
* **Offline Seed Data** – Ships with `assets/restaurants_sf_full.json` (SF sample data)

### 🗓️ Social (Local)

* **Create Events** – Log meetups per restaurant (saved to `events.json`)
* **Reviews** – Post 1–5★ reviews with text (saved to `reviews.json`)
* **Accounts (Local)** – Sign Up/Sign In; saved to `accounts.json` (no Firebase)

> Images load from each restaurant’s `imageUrl` with graceful fallbacks (no UI overflows if a URL fails).

---

## 🔁 Differences from the React Native Edition

| Area        | Flutter Edition (this repo)                                                             | React Native edition                          |
| ----------- | --------------------------------------------------------------------------------------- | --------------------------------------------- |
| Framework   | **Flutter** (Dart, Material 3)                                                          | **React Native** (JavaScript/TypeScript)      |
| Data Source | **Local JSON** seed (`assets/restaurants_sf_full.json`); **no geolocation** or Overpass | May include location & different data flow    |
| Persistence | On-device JSON (`accounts.json`, `events.json`, `reviews.json`) via `path_provider`     | RN storage/Firebase in RN edition             |
| Map         | `flutter_map` + OpenStreetMap tiles                                                     | RN map libraries                              |
| UI          | Navy canvas, gold accents, ivory text                                                   | RN implementation                             |
| Discover    | **2-per-row grid** + search + chips + map toggle                                        | RN layout differs                             |
| Chat        | **Not included** (focus on discovery, events, reviews)                                  | RN edition includes universal chat (Firebase) |

---

## 🚀 Getting Started

### Prerequisites

* **Flutter** (stable **≥ 3.22**), **Dart ≥ 3.3**
* **Xcode** (with iOS Simulator)
* **CocoaPods**: `brew install cocoapods`

### Installation & Run (iOS Simulator)

```bash
# 1) Clone
git clone https://github.com/tkrithik/sitdown-app
cd sitdown-flutter

# 2) Get packages
flutter pub get

# 3) Generate iOS config (writes ios/Flutter/Generated.xcconfig)
flutter build ios --config-only

# 4) Install CocoaPods
cd ios
pod install
cd ..

# 5) Run on simulator
open -a Simulator
flutter run -d "iPhone 16" -t lib/main.dart
```

> If `pod install` complains about podhelper/platform: run `flutter build ios --config-only` again, then `cd ios && pod install`.

---

## 🏗️ Architecture

### Frontend

* **Flutter (Dart)** with **Material 3** and a custom **navy & gold** theme
* **State Management**: `provider` (single `AppState` for auth, filters, events, reviews)
* **Routing**: simple named routes (`/signin`, `/signup`, `/discover`)

### Data & Services

* **Static Restaurants**: `assets/restaurants_sf_full.json`
* **Persistence**: `path_provider` → Documents directory

  * `accounts.json`
  * `events.json`
  * `reviews.json`
* **Images**: `imageUrl` per restaurant; fallbacks to safe placeholders

### Maps

* **`flutter_map` + `latlong2`** (OpenStreetMap tiles)
* Gold pins; distance calculated from SF City Hall for display

---

## 📱 Screens & Navigation

* **Sign Up** – Create a local account (ivory fields, **navy input text**)
* **Sign In** – Local auth; persists to `accounts.json`
* **Discover** – 2-per-row grid (navy & gold), search bar, cuisine chips, map toggle
* **Restaurant Detail Sheet** – Hero image, open time, price/rating/distance pills, tags, create event & post review

---

## 🔧 Configuration

* **No Firebase / No API keys** required
* Seed dataset: `assets/restaurants_sf_full.json`
* Add/modify restaurants by editing that file, then **hot restart**

---

## 🎨 UI/UX Notes

* Navy canvas `#0A0F2C`, Gold `#D4AF37`, Ivory `#FFFFF0`, Desaturated Gold `#B99A2E`
* Inputs are **ivory filled with navy text**
* Chips: navy bg + gold border (unselected), **gold fill** when selected
* Buttons, borders, pins: gold; icons invert appropriately

---

## 🧪 Manual Testing

* Search by name/cuisine/address
* Toggle chips (Vegetarian, Sushi, Indian, …)
* Randomize a pick and open details
* Create an event → verify it appears and persists
* Post a review → verify order (newest first)
* Toggle **Map** and tap pins to open details

---

## 📦 Building for Production

### iOS (Release)

```bash
# Prepare signing in Xcode (Runner target > Signing)
flutter build ios --release
```

> Note: you’ll need a valid Apple developer team for device/TestFlight.

### Android (optional)

```bash
flutter build apk --release
```

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit: `git commit -m "Add amazing feature"`
4. Push: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**. See `LICENSE` for details.

---

**Made with ❤️ for food lovers everywhere.**
Discover restaurants, plan meetups, and leave reviews — all in a sleek Flutter experience.
