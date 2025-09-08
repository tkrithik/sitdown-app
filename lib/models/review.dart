class Review {
  final String id;
  final String restaurantId;
  final String text;
  final int rating; // 1-5
  final DateTime at;
  final String author; // email

  Review({
    required this.id,
    required this.restaurantId,
    required this.text,
    required this.rating,
    required this.at,
    required this.author,
  });

  factory Review.fromJson(Map<String, dynamic> j) => Review(
    id: j['id'] as String,
    restaurantId: j['restaurantId'] as String,
    text: j['text'] as String,
    rating: (j['rating'] as num).toInt(),
    at: DateTime.parse(j['at'] as String),
    author: j['author'] as String,
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'restaurantId': restaurantId,
    'text': text,
    'rating': rating,
    'at': at.toIso8601String(),
    'author': author,
  };
}
