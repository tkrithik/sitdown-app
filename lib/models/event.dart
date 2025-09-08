class Event {
  final String id;
  final String restaurantId;
  final String title;
  final DateTime when;
  final String createdBy; // email

  Event({
    required this.id,
    required this.restaurantId,
    required this.title,
    required this.when,
    required this.createdBy,
  });

  factory Event.fromJson(Map<String, dynamic> j) => Event(
    id: j['id'] as String,
    restaurantId: j['restaurantId'] as String,
    title: j['title'] as String,
    when: DateTime.parse(j['when'] as String),
    createdBy: j['createdBy'] as String,
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'restaurantId': restaurantId,
    'title': title,
    'when': when.toIso8601String(),
    'createdBy': createdBy,
  };
}
