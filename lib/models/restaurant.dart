import 'dart:convert';

class Restaurant {
  final String id;
  final String name;
  final String? cuisine;
  final String? address;
  final double? lat;
  final double? lon;
  final String? price; // $, $$, $$$
  final double? rating; // 0 - 5
  final int? ratingCount;
  final String? opensAt; // e.g. "Opens at 11:30am"
  final List<String>? tags;
  final String? imageUrl;

  Restaurant({
    required this.id,
    required this.name,
    this.cuisine,
    this.address,
    this.lat,
    this.lon,
    this.price,
    this.rating,
    this.ratingCount,
    this.opensAt,
    this.tags,
    this.imageUrl,
  });

  factory Restaurant.fromJson(Map<String, dynamic> json) {
    String slugify(String s) => s
      .toLowerCase()
      .replaceAll(RegExp(r'[^a-z0-9]+'), '-')
      .replaceAll(RegExp(r'-+'), '-')
      .replaceAll(RegExp(r'^-|-$'), '');
    final name = (json['name'] as String?) ?? 'Unknown';
    return Restaurant(
      id: (json['id'] as String?) ?? slugify(name),
      name: name,
      cuisine: json['cuisine'] as String?,
      address: json['address'] as String?,
      lat: (json['lat'] as num?)?.toDouble(),
      lon: (json['lon'] as num?)?.toDouble(),
      price: json['price'] as String?,
      rating: (json['rating'] as num?)?.toDouble(),
      ratingCount: (json['ratingCount'] as num?)?.toInt(),
      opensAt: json['opensAt'] as String?,
      tags: (json['tags'] as List?)?.map((e) => e.toString()).toList(),
      imageUrl: json['imageUrl'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'cuisine': cuisine,
    'address': address,
    'lat': lat,
    'lon': lon,
    'price': price,
    'rating': rating,
    'ratingCount': ratingCount,
    'opensAt': opensAt,
    'tags': tags,
    'imageUrl': imageUrl,
  };

  static List<Restaurant> listFromJsonString(String jsonStr) {
    final list = (json.decode(jsonStr) as List).cast<Map<String, dynamic>>();
    return list.map(Restaurant.fromJson).toList();
  }
}
