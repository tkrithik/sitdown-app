import 'dart:math' as math;
import 'package:flutter/foundation.dart';
import '../models/restaurant.dart';
import '../models/event.dart';
import '../models/review.dart';
import '../models/account.dart';
import '../services/static_restaurant_service.dart';
import '../services/storage_service.dart';

class AppState extends ChangeNotifier {
  // Auth
  Account? currentUser;

  // Data
  final _static = StaticRestaurantService();
  final _store = StorageService();
  final _rng = math.Random();

  List<Restaurant> _all = [];
  List<Restaurant> restaurants = [];
  Restaurant? selectedRestaurant;
  String? selectedCategory;
  String searchText = '';

  // Persisted
  List<Account> accounts = [];
  List<Event> events = [];
  List<Review> allReviews = [];

  // ====== Auth ======
  Future<void> loadAccounts() async {
    final raw = await _store.readList('accounts.json');
    accounts = raw.map((e) => Account.fromJson(e)).toList();
  }

  Future<void> saveAccounts() async {
    await _store.writeList('accounts.json', accounts.map((e) => e.toJson()).toList());
  }

  Future<bool> createAccount(String name, String email, String password) async {
    await loadAccounts();
    if (accounts.any((a) => a.email.toLowerCase() == email.toLowerCase())) {
      return false;
    }
    final acc = Account(id: email.toLowerCase(), name: name, email: email, password: password);
    accounts.add(acc);
    await saveAccounts();
    currentUser = acc;
    notifyListeners();
    return true;
  }

  Future<bool> signIn(String email, String password) async {
    await loadAccounts();
    final matches = accounts.where(
      (a) => a.email.toLowerCase() == email.toLowerCase() && a.password == password);
    if (matches.isEmpty) return false;
    currentUser = matches.first;
    notifyListeners();
    return true;
  }

  void signOut() {
    currentUser = null;
    notifyListeners();
  }

  // ====== Static Restaurants ======
  Future<void> loadStaticRestaurants() async {
    _all = await _static.load();
    _applyFilter();
  }

  void setCategory(String? cat) {
    selectedCategory = cat;
    _applyFilter();
  }

  void setSearchText(String text) {
    searchText = text;
    _applyFilter();
  }

  void _applyFilter() {
    Iterable<Restaurant> cur = _all;

    // Category filter
    if (selectedCategory != null && selectedCategory!.isNotEmpty) {
      final c = selectedCategory!.toLowerCase();
      cur = cur.where((r) {
        final cuisine = (r.cuisine ?? '').toLowerCase();
        final tags = (r.tags ?? const []).map((e) => e.toLowerCase()).toList();
        return cuisine.contains(c) || tags.contains(c);
      });
    }

    // Text search (name / cuisine / address)
    final q = searchText.trim().toLowerCase();
    if (q.isNotEmpty) {
      cur = cur.where((r) =>
          r.name.toLowerCase().contains(q) ||
          (r.cuisine ?? '').toLowerCase().contains(q) ||
          (r.address ?? '').toLowerCase().contains(q));
    }

    restaurants = cur.toList();
    notifyListeners();
  }

  Restaurant? pickRandom() {
    if (restaurants.isEmpty) return null;
    return restaurants[_rng.nextInt(restaurants.length)];
  }

  void selectRestaurant(Restaurant? r) {
    selectedRestaurant = r;
    notifyListeners();
  }

  // ====== Events & Reviews (persisted) ======
  Future<void> loadEvents() async {
    final raw = await _store.readList('events.json');
    events = raw.map((e) => Event.fromJson(e)).toList();
  }

  Future<void> saveEvents() async {
    await _store.writeList('events.json', events.map((e) => e.toJson()).toList());
  }

  Future<void> addEvent(String restaurantId, String title, DateTime when) async {
    final email = currentUser?.email ?? 'guest@local';
    final e = Event(
      id: '${DateTime.now().millisecondsSinceEpoch}-${_rng.nextInt(99999)}',
      restaurantId: restaurantId,
      title: title,
      when: when,
      createdBy: email,
    );
    events.add(e);
    await saveEvents();
    notifyListeners();
  }

  List<Event> eventsFor(String restaurantId) =>
      (events.where((e) => e.restaurantId == restaurantId).toList()
        ..sort((a, b) => a.when.compareTo(b.when)));

  Future<void> loadReviews() async {
    final raw = await _store.readList('reviews.json');
    allReviews = raw.map((e) => Review.fromJson(e)).toList();
  }

  Future<void> saveReviews() async {
    await _store.writeList('reviews.json', allReviews.map((e) => e.toJson()).toList());
  }

  Future<void> addReview(String restaurantId, String text, int rating) async {
    final email = currentUser?.email ?? 'guest@local';
    final r = Review(
      id: '${DateTime.now().millisecondsSinceEpoch}-${_rng.nextInt(99999)}',
      restaurantId: restaurantId,
      text: text,
      rating: rating,
      at: DateTime.now(),
      author: email,
    );
    allReviews.add(r);
    await saveReviews();
    notifyListeners();
  }

  List<Review> reviewsFor(String restaurantId) =>
      (allReviews.where((r) => r.restaurantId == restaurantId).toList()
        ..sort((a, b) => b.at.compareTo(a.at)));

  // ====== Utility ======
  double? distanceMiles(double? lat, double? lon) {
    if (lat == null || lon == null) return null;
    const toRad = 3.14159265358979323846 / 180.0;
    const R = 3958.8; // miles
    const cLat = 37.7793, cLon = -122.4193; // SF City Hall
    final dLat = (lat - cLat) * toRad;
    final dLon = (lon - cLon) * toRad;
    final a = (math.sin(dLat/2) * math.sin(dLat/2)) +
              (math.cos(cLat*toRad) * math.cos(lat*toRad) * math.sin(dLon/2) * math.sin(dLon/2));
    final c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a));
    return R * c;
  }
}
