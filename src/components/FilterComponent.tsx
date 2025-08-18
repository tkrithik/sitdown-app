import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FilterOptions } from '../types';

interface FilterComponentProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
}

const dietaryOptions = ['vegetarian', 'vegan', 'gluten-free'];
const priceRanges = ['$', '$$', '$$$', '$$$$'];
const cuisineTypes = [
  'American', 'Mexican', 'Italian', 'Chinese', 'Japanese', 'Thai',
  'Indian', 'Mediterranean', 'French', 'Greek', 'Vietnamese', 'Korean'
];

export const FilterComponent: React.FC<FilterComponentProps> = ({
  filters,
  onFiltersChange,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'dietary' | 'price' | 'cuisine'>('dietary');

  const toggleFilter = (type: keyof FilterOptions, value: string) => {
    const currentFilters = { ...filters };
    
    if (type === 'dietary' || type === 'priceRange' || type === 'cuisineType') {
      const array = currentFilters[type] as string[];
      const index = array.indexOf(value);
      
      if (index > -1) {
        array.splice(index, 1);
      } else {
        array.push(value);
      }
    }
    
    onFiltersChange(currentFilters);
  };

  const getActiveFiltersCount = () => {
    return filters.dietary.length + filters.priceRange.length + filters.cuisineType.length;
  };

  const renderFilterChips = (options: string[], type: keyof FilterOptions) => {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsContainer}>
        {options.map((option) => {
          const isSelected = (filters[type] as string[]).includes(option);
          return (
            <TouchableOpacity
              key={option}
              style={[styles.chip, isSelected && styles.chipSelected]}
              onPress={() => toggleFilter(type, option)}
            >
              <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                {option}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="filter" size={20} color="#666" />
        <Text style={styles.filterButtonText}>Filters</Text>
        {getActiveFiltersCount() > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{getActiveFiltersCount()}</Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'dietary' && styles.activeTab]}
                onPress={() => setActiveTab('dietary')}
              >
                <Text style={[styles.tabText, activeTab === 'dietary' && styles.activeTabText]}>
                  Dietary
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'price' && styles.activeTab]}
                onPress={() => setActiveTab('price')}
              >
                <Text style={[styles.tabText, activeTab === 'price' && styles.activeTabText]}>
                  Price
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'cuisine' && styles.activeTab]}
                onPress={() => setActiveTab('cuisine')}
              >
                <Text style={[styles.tabText, activeTab === 'cuisine' && styles.activeTabText]}>
                  Cuisine
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.filterContent}>
              {activeTab === 'dietary' && renderFilterChips(dietaryOptions, 'dietary')}
              {activeTab === 'price' && renderFilterChips(priceRanges, 'priceRange')}
              {activeTab === 'cuisine' && renderFilterChips(cuisineTypes, 'cuisineType')}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => {
                  onFiltersChange({
                    dietary: [],
                    priceRange: [],
                    cuisineType: [],
                    radius: 5
                  });
                }}
              >
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff', // White background
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#e5e7eb', // Light gray border
  },
  filterButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#1f2937', // Dark gray text
    fontWeight: '500',
    fontFamily: 'System',
  },
  badge: {
    backgroundColor: '#ff4757',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#2ed573',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#2ed573',
    fontWeight: '600',
  },
  filterContent: {
    padding: 20,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    backgroundColor: '#f9fafb', // Light gray background
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb', // Light gray border
  },
  chipSelected: {
    backgroundColor: '#374151', // Dark gray background
    borderColor: '#374151', // Dark gray border
  },
  chipText: {
    fontSize: 14,
    color: '#6b7280', // Gray text
    fontWeight: '500',
    fontFamily: 'System',
  },
  chipTextSelected: {
    color: '#ffffff', // White text
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  clearButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  applyButton: {
    flex: 1,
    backgroundColor: '#374151', // Dark gray background
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    color: '#ffffff', // White text
    fontWeight: '600',
    fontFamily: 'System',
  },
});

