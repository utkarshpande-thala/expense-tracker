import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TransactionItem = ({ transaction, onDelete }) => {
  const { id, title, amount, type, category, date } = transaction;
  
  // Format the date
  const formattedDate = new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <View style={[
          styles.iconBackground, 
          { backgroundColor: type === 'income' ? '#E8F6F3' : '#FDEDEC' }
        ]}>
          <Ionicons 
            name={
              category === 'food' ? 'fast-food' :
              category === 'transport' ? 'car' :
              category === 'shopping' ? 'cart' :
              category === 'entertainment' ? 'film' :
              category === 'bills' ? 'document-text' :
              category === 'salary' ? 'cash' :
              category === 'gift' ? 'gift' : 'wallet'
            } 
            size={24} 
            color={type === 'income' ? '#27AE60' : '#E74C3C'} 
          />
        </View>
      </View>
      
      <View style={styles.detailsContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.date}>{formattedDate}</Text>
      </View>
      
      <View style={styles.amountContainer}>
        <Text style={[
          styles.amount, 
          { color: type === 'income' ? '#27AE60' : '#E74C3C' }
        ]}>
          {type === 'income' ? '+' : '-'}₹{Math.abs(amount).toFixed(2)}
        </Text>
        
        <TouchableOpacity 
          style={styles.deleteButton} 
          onPress={() => onDelete(id)}
        >
          <Ionicons name="trash-outline" size={18} color="#95A5A6" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    marginRight: 12,
  },
  iconBackground: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  date: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 2,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  deleteButton: {
    padding: 4,
  },
});

export default TransactionItem;