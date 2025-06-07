import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SummaryCard = ({ balance, income, expenses }) => {
  return (
    <View style={styles.container}>
      <View style={styles.balanceContainer}>
        <Text style={styles.balanceTitle}>Current Balance</Text>
        <Text style={styles.balanceAmount}>₹{balance.toFixed(2)}</Text>
      </View>
      
      <View style={styles.statContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statTitle}>Income</Text>
          <Text style={styles.incomeAmount}>₹{income.toFixed(2)}</Text>
        </View>
        
        <View style={styles.verticalLine} />
        
        <View style={styles.statItem}>
          <Text style={styles.statTitle}>Expenses</Text>
          <Text style={styles.expenseAmount}>₹{expenses.toFixed(2)}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  balanceContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceTitle: {
    fontSize: 16,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E86C1',
  },
  statContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statTitle: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  incomeAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27AE60',
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E74C3C',
  },
  verticalLine: {
    width: 1,
    backgroundColor: '#EAECEE',
  },
});

export default SummaryCard;