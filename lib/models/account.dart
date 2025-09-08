class Account {
  final String id;
  final String name;
  final String email;
  final String password; // demo only (plain)

  Account({
    required this.id,
    required this.name,
    required this.email,
    required this.password,
  });

  factory Account.fromJson(Map<String, dynamic> j) => Account(
    id: j['id'] as String,
    name: j['name'] as String,
    email: j['email'] as String,
    password: j['password'] as String,
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'email': email,
    'password': password,
  };
}
