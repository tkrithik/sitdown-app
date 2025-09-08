# SitDown Enhanced Patch (Map, Events, Reviews, Accounts)

## What's included
- Navy/Gold styling like your screenshot
- Map/List toggle with pins (flutter_map)
- Working category chips (Vegetarian, Sushi, Indian, etc.)
- Detail sheet: hero image, open time, price/rating/distance line, tags
- Create Event + Review sections, persisted to JSON in app documents dir
- Sign Up / Sign In pages; fields in navy text; accounts persisted to JSON
- Online images via Unsplash Source links

## Apply
1) Backup your current app.
2) Unzip over your project root (overwrite lib/, assets/, ios/Podfile, ios/Runner/Info.plist, pubspec.yaml).
3) From project root:
   flutter clean
   flutter pub get
   flutter build ios --config-only
   cd ios && pod install && cd ..
   open -a Simulator
   flutter run -d "iPhone 16" -t lib/main.dart
