# SitDown (geo-free patch)
This ZIP contains **only the updated source files** + assets + iOS Info.plist/Podfile for a list-only build (no geolocator, no network).

## Use with your existing project
1. Backup your current project.
2. Unzip this into your project root and allow it to overwrite:
   - `lib/**`
   - `assets/restaurants_sf.json`
   - `ios/Runner/Info.plist`
   - `ios/Podfile`
   - `pubspec.yaml`
3. From project root, run:
   ```bash
   flutter clean
   flutter pub get
   cd ios && pod install && cd ..
   open -a Simulator
   flutter run -d "iPhone 16" -t lib/main.dart
   ```
