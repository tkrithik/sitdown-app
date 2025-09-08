import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import '../state/app_state.dart';
import '../widgets/restaurant_card.dart';
import '../widgets/restaurant_grid_card.dart';
import '../widgets/chip_filter_bar.dart';
import '../widgets/restaurant_detail_sheet.dart';
import '../theme.dart';

class DiscoverScreen extends StatefulWidget {
  const DiscoverScreen({super.key});
  @override
  State<DiscoverScreen> createState() => _DiscoverScreenState();
}

class _DiscoverScreenState extends State<DiscoverScreen> {
  final _categories = const ['Vegetarian','Sushi','Indian','Mexican','Coffee','BBQ','Pizza','Burgers','Italian','Bakery','Seafood'];
  final _search = TextEditingController();
  bool _loading = true;
  bool _mapMode = false; // default to grid view

  @override
  void initState() {
    super.initState();
    _init();
  }

  Future<void> _init() async {
    final app = context.read<AppState>();
    await app.loadAccounts();
    await app.loadStaticRestaurants();
    await app.loadEvents();
    await app.loadReviews();
    if (!mounted) return;
    setState(() => _loading = false);
  }

  void _openDetails(BuildContext context) {
    final app = context.read<AppState>();
    final r = app.selectedRestaurant;
    if (r == null) return;
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.paleNavy,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => RestaurantDetailSheet(restaurant: r),
    );
  }

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppState>();
    return Scaffold(
      appBar: AppBar(
        title: const Text('Discover'),
        actions: [
          IconButton(
            tooltip: _mapMode ? 'Show grid' : 'Show map',
            icon: Icon(_mapMode ? Icons.grid_view : Icons.map),
            onPressed: () => setState(() => _mapMode = !_mapMode),
          ),
          IconButton(
            tooltip: 'Random',
            icon: const Icon(Icons.casino),
            onPressed: () {
              final r = app.pickRandom();
              if (r != null) { app.selectRestaurant(r); _openDetails(context); }
              else { ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('No restaurants to choose from'))); }
            },
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                // Search bar (ivory fill, NAVY TEXT)
                Padding(
                  padding: const EdgeInsets.fromLTRB(12, 8, 12, 4),
                  child: TextField(
                    controller: _search,
                    style: const TextStyle(color: AppColors.navy),
                    onChanged: (v) => app.setSearchText(v),
                    decoration: const InputDecoration(
                      prefixIcon: Icon(Icons.search, color: AppColors.navy),
                      hintText: 'Search by name, cuisine, or address',
                    ),
                  ),
                ),
                // Chips
                Padding(
                  padding: const EdgeInsets.only(top: 4, bottom: 6),
                  child: ChipFilterBar(
                    categories: _categories,
                    selected: app.selectedCategory,
                    onSelected: (c) => app.setCategory(c),
                  ),
                ),
                const Divider(height: 1, color: AppColors.gold),
                Expanded(child: _mapMode ? _buildMap(app) : _buildGrid(app)),
              ],
            ),
    );
  }

  // 2-per-row grid like your screenshot
  Widget _buildGrid(AppState app) {
    if (app.restaurants.isEmpty) {
      return const Center(child: Text('No results', style: TextStyle(color: AppColors.desatGold)));
    }
    return GridView.builder(
      padding: const EdgeInsets.fromLTRB(12, 10, 12, 12),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
        childAspectRatio: 1.05, // closer to the mock
      ),
      itemCount: app.restaurants.length,
      itemBuilder: (_, i) {
        final r = app.restaurants[i];
        return RestaurantGridCard(
          restaurant: r,
          onTap: () { app.selectRestaurant(r); _openDetails(context); },
        );
      },
    );
  }

  // Keep map option too
  Widget _buildMap(AppState app) {
    final center = const LatLng(37.7793, -122.4193);
    final markers = <Marker>[
      for (final r in app.restaurants)
        if (r.lat != null && r.lon != null)
          Marker(
            point: LatLng(r.lat!, r.lon!),
            width: 28,
            height: 28,
            child: GestureDetector(
              onTap: () { app.selectRestaurant(r); _openDetails(context); },
              child: Container(
                decoration: BoxDecoration(
                  color: AppColors.gold,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppColors.ivory, width: 2),
                ),
              ),
            ),
          ),
    ];

    return FlutterMap(
      options: MapOptions(
        initialCenter: center,
        initialZoom: 12.4,
      ),
      children: [
        TileLayer(
          urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
          userAgentPackageName: 'com.example.sitdown',
        ),
        MarkerLayer(markers: markers),
      ],
    );
  }
}
