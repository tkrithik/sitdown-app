import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Person {
  id: string;
  name: string;
  items: BillItem[];
  total: number;
}

interface BillItem {
  id: string;
  name: string;
  price: number;
  sharedBy: string[];
}

interface BillSplitterProps {
  restaurantName: string;
}

export const BillSplitter: React.FC<BillSplitterProps> = ({ restaurantName }) => {
  const [people, setPeople] = useState<Person[]>([
    { id: '1', name: 'You', items: [], total: 0 },
    { id: '2', name: 'Sarah', items: [], total: 0 },
    { id: '3', name: 'Mike', items: [], total: 0 },
  ]);
  
  const [availableItems, setAvailableItems] = useState<BillItem[]>([
    { id: '1', name: 'Burger', price: 15.99, sharedBy: [] },
    { id: '2', name: 'Fries', price: 4.99, sharedBy: [] },
    { id: '3', name: 'Salad', price: 12.99, sharedBy: [] },
    { id: '4', name: 'Pizza', price: 18.99, sharedBy: [] },
    { id: '5', name: 'Pasta', price: 16.99, sharedBy: [] },
    { id: '6', name: 'Drinks', price: 3.99, sharedBy: [] },
    { id: '7', name: 'Dessert', price: 8.99, sharedBy: [] },
  ]);

  const [newPersonName, setNewPersonName] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');

  const addPerson = () => {
    if (newPersonName.trim()) {
      const newPerson: Person = {
        id: Date.now().toString(),
        name: newPersonName.trim(),
        items: [],
        total: 0,
      };
      setPeople([...people, newPerson]);
      setNewPersonName('');
    }
  };

  const addItem = () => {
    if (newItemName.trim() && newItemPrice.trim()) {
      const price = parseFloat(newItemPrice);
      if (!isNaN(price) && price > 0) {
        const newItem: BillItem = {
          id: Date.now().toString(),
          name: newItemName.trim(),
          price: price,
          sharedBy: [],
        };
        setAvailableItems([...availableItems, newItem]);
        setNewItemName('');
        setNewItemPrice('');
      }
    }
  };

  const assignItemToPerson = (itemId: string, personId: string) => {
    const item = availableItems.find(i => i.id === itemId);
    const person = people.find(p => p.id === personId);
    
    if (item && person) {
      // Add item to person's list
      const updatedPeople = people.map(p => {
        if (p.id === personId) {
          return {
            ...p,
            items: [...p.items, item],
            total: p.total + item.price,
          };
        }
        return p;
      });
      setPeople(updatedPeople);

      // Remove item from available items
      setAvailableItems(prev => prev.filter(i => i.id !== itemId));
    }
  };

  const removeItemFromPerson = (personId: string, itemId: string) => {
    const person = people.find(p => p.id === personId);
    const item = person?.items.find(i => i.id === itemId);
    
    if (person && item) {
      // Remove item from person's list
      const updatedPeople = people.map(p => {
        if (p.id === personId) {
          return {
            ...p,
            items: p.items.filter(i => i.id !== itemId),
            total: p.total - item.price,
          };
        }
        return p;
      });
      setPeople(updatedPeople);

      // Add item back to available items
      setAvailableItems(prev => [...prev, item]);
    }
  };

  const removePerson = (personId: string) => {
    const person = people.find(p => p.id === personId);
    if (person) {
      // Return all items to available items
      setAvailableItems(prev => [...prev, ...person.items]);
      setPeople(prev => prev.filter(p => p.id !== personId));
    }
  };

  const resetBill = () => {
    Alert.alert(
      'Reset Bill',
      'Are you sure you want to reset the entire bill? This will return all items to available items.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            const allItems = people.reduce((items, person) => [...items, ...person.items], [] as BillItem[]);
            setAvailableItems(prev => [...prev, ...allItems]);
            setPeople(people.map(p => ({ ...p, items: [], total: 0 })));
          }
        }
      ]
    );
  };

  const handlePayment = () => {
    const subtotal = getTotalBill();
    if (subtotal === 0) {
      Alert.alert('No Items', 'Please assign some items before proceeding to payment.');
      return;
    }

    const { total } = getTaxAndTip(subtotal);
    Alert.alert(
      'Payment Summary',
      `Total Bill: $${total.toFixed(2)}\n\nPayment Options:\n• Split equally\n• Pay individually\n• Custom amounts`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Split Equally', onPress: () => splitEqually(total) },
        { text: 'Individual', onPress: () => individualPayment() },
      ]
    );
  };

  const splitEqually = (total: number) => {
    const perPerson = total / people.length;
    Alert.alert(
      'Split Equally',
      `Each person pays: $${perPerson.toFixed(2)}`,
      [
        { text: 'OK', onPress: () => {
          Alert.alert('Payment Complete', 'Bill has been split equally among all people!');
        }}
      ]
    );
  };

  const individualPayment = () => {
    const subtotal = getTotalBill();
    const { total } = getTaxAndTip(subtotal);
    
    let message = 'Individual Payments:\n\n';
    finalTotals.forEach(person => {
      message += `${person.name}: $${person.finalTotal.toFixed(2)}\n`;
    });
    message += `\nTotal: $${total.toFixed(2)}`;
    
    Alert.alert('Individual Payments', message, [
      { text: 'OK', onPress: () => {
        Alert.alert('Payment Complete', 'All individual payments have been processed!');
      }}
    ]);
  };

  const getTotalBill = () => {
    return people.reduce((total, person) => total + person.total, 0);
  };

  const getTaxAndTip = (subtotal: number) => {
    const tax = subtotal * 0.08; // 8% tax
    const tip = subtotal * 0.18; // 18% tip
    return { tax, tip, total: subtotal + tax + tip };
  };

  const calculateFinalTotals = () => {
    const subtotal = getTotalBill();
    const { tax, tip, total } = getTaxAndTip(subtotal);
    
    return people.map(person => {
      // Avoid division by zero
      const personShare = subtotal > 0 ? person.total / subtotal : 0;
      return {
        ...person,
        taxShare: tax * personShare,
        tipShare: tip * personShare,
        finalTotal: (person.total + tax * personShare + tip * personShare),
      };
    });
  };

  const finalTotals = useMemo(() => calculateFinalTotals(), [people]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Bill Splitter</Text>
      <Text style={styles.subtitle}>{restaurantName}</Text>

      {/* Add Person */}
      <View style={styles.addSection}>
        <Text style={styles.sectionTitle}>Add Person</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Person name"
            value={newPersonName}
            onChangeText={setNewPersonName}
          />
          <TouchableOpacity style={styles.addButton} onPress={addPerson}>
            <Ionicons name="add" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Add Item */}
      <View style={styles.addSection}>
        <Text style={styles.sectionTitle}>Add Item</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, { flex: 2 }]}
            placeholder="Item name"
            value={newItemName}
            onChangeText={setNewItemName}
          />
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Price"
            value={newItemPrice}
            onChangeText={setNewItemPrice}
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.addButton} onPress={addItem}>
            <Ionicons name="add" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Available Items */}
      {availableItems.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Items</Text>
          {availableItems.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
              </View>
              <View style={styles.assignButtons}>
                {people.map((person) => (
                  <TouchableOpacity
                    key={person.id}
                    style={styles.assignButton}
                    onPress={() => assignItemToPerson(item.id, person.id)}
                  >
                    <Text style={styles.assignButtonText}>{person.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Debug Info */}
      <View style={styles.debugSection}>
        <Text style={styles.debugTitle}>Debug Info</Text>
        <Text style={styles.debugText}>Total Bill: ${getTotalBill().toFixed(2)}</Text>
        <Text style={styles.debugText}>People Count: {people.length}</Text>
        {people.map(person => (
          <Text key={person.id} style={styles.debugText}>
            {person.name}: ${person.total.toFixed(2)} ({person.items.length} items)
          </Text>
        ))}
      </View>

      {/* People and Their Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bill Breakdown</Text>
        {finalTotals.map((person) => (
          <View key={person.id} style={styles.personCard}>
            <View style={styles.personHeader}>
              <Text style={styles.personName}>{person.name}</Text>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removePerson(person.id)}
              >
                <Ionicons name="close-circle" size={20} color="#e74c3c" />
              </TouchableOpacity>
            </View>
            
            {person.items.map((item) => (
              <View key={item.id} style={styles.personItem}>
                <Text style={styles.personItemName}>{item.name}</Text>
                <View style={styles.personItemActions}>
                  <Text style={styles.personItemPrice}>${item.price.toFixed(2)}</Text>
                  <TouchableOpacity
                    onPress={() => removeItemFromPerson(person.id, item.id)}
                  >
                    <Ionicons name="remove-circle" size={16} color="#e74c3c" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            
            <View style={styles.personTotal}>
              <Text style={styles.personTotalLabel}>Subtotal:</Text>
              <Text style={styles.personTotalValue}>${person.total.toFixed(2)}</Text>
            </View>
            <View style={styles.personTotal}>
              <Text style={styles.personTotalLabel}>Tax (8%):</Text>
              <Text style={styles.personTotalValue}>${person.taxShare.toFixed(2)}</Text>
            </View>
            <View style={styles.personTotal}>
              <Text style={styles.personTotalLabel}>Tip (18%):</Text>
              <Text style={styles.personTotalValue}>${person.tipShare.toFixed(2)}</Text>
            </View>
            <View style={styles.personFinalTotal}>
              <Text style={styles.personFinalTotalLabel}>Total:</Text>
              <Text style={styles.personFinalTotalValue}>${person.finalTotal.toFixed(2)}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Bill Summary */}
      <View style={styles.billSummary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal:</Text>
          <Text style={styles.summaryValue}>${getTotalBill().toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tax (8%):</Text>
          <Text style={styles.summaryValue}>${(getTotalBill() > 0 ? getTaxAndTip(getTotalBill()).tax : 0).toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tip (18%):</Text>
          <Text style={styles.summaryValue}>${(getTotalBill() > 0 ? getTaxAndTip(getTotalBill()).tip : 0).toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Grand Total:</Text>
          <Text style={styles.summaryValue}>
            ${(getTotalBill() > 0 ? getTaxAndTip(getTotalBill()).total : 0).toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.payButton]} 
          onPress={handlePayment}
        >
          <Ionicons name="card" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Pay Bill</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.resetButton]} 
          onPress={resetBill}
        >
          <Ionicons name="refresh" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Reset Bill</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#dc2626', // Red background
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff', // White text
    marginBottom: 4,
    fontFamily: 'System',
  },
  subtitle: {
    fontSize: 16,
    color: '#e5e7eb', // Light gray text
    marginBottom: 20,
    fontFamily: 'System',
  },
  addSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#374151', // Dark gray background
    padding: 12,
    borderRadius: 8,
  },
  section: {
    marginBottom: 20,
  },
  itemCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  itemInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2ed573',
  },
  assignButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  assignButton: {
    backgroundColor: '#374151', // Dark gray background
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  assignButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  personCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  personHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  personName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  removeButton: {
    padding: 4,
  },
  personItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  personItemName: {
    fontSize: 14,
    color: '#666',
  },
  personItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  personItemPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
  },
  personTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  personTotalLabel: {
    fontSize: 14,
    color: '#666',
  },
  personTotalValue: {
    fontSize: 14,
    color: '#2c3e50',
  },
  personFinalTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    marginTop: 8,
  },
  personFinalTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  personFinalTotalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2ed573',
  },
  grandTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2ed573',
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
  },
  grandTotalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  grandTotalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  billSummary: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  payButton: {
    backgroundColor: '#374151', // Dark gray background
  },
  resetButton: {
    backgroundColor: '#dc2626', // Red background
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  debugSection: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    fontFamily: 'System',
  },
  debugText: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
    fontFamily: 'System',
  },
});
