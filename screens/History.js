import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TransactionItem from '../components/TransactionItem';
import { getTransactions, deleteTransaction } from '../utils/storage';

const HistoryScreen = ({ navigation }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'income', 'expense'

  // Load data when screen focuses
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });

    return unsubscribe;
  }, [navigation]);

  // Load data initially
  useEffect(() => {
    loadData();
  }, []);

  // Function to load transaction data
  const loadData = async () => {
    setLoading(true);
    try {
      const transactionsData = await getTransactions();
      setTransactions(transactionsData);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handler for pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Handler for deleting transactions
  const handleDeleteTransaction = async (id) => {
    try {
      const updatedTransactions = await deleteTransaction(id);
      setTransactions(updatedTransactions);
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  // Filter transactions based on current filter
  const filteredTransactions = transactions.filter(transaction => {
    if (filter === 'all') return true;
    return transaction.type === filter;
  });

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E86C1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'all' && styles.activeFilterButton
          ]}
          onPress={() => setFilter('all')}
        >
          <Text style={[
            styles.filterButtonText,
            filter === 'all' && styles.activeFilterButtonText
          ]}>All</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'income' && styles.activeFilterButton
          ]}
          onPress={() => setFilter('income')}
        >
          <Text style={[
            styles.filterButtonText,
            filter === 'income' && styles.activeFilterButtonText
          ]}>Income</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'expense' && styles.activeFilterButton
          ]}
          onPress={() => setFilter('expense')}
        >
          <Text style={[
            styles.filterButtonText,
            filter === 'expense' && styles.activeFilterButtonText
          ]}>Expenses</Text>
        </TouchableOpacity>
      </View>
      
      {filteredTransactions.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateText}>No transactions found</Text>
          {filter !== 'all' ? (
            <Text style={styles.emptyStateSubText}>
              Try changing the filter or add a new {filter}
            </Text>
          ) : (
            <Text style={styles.emptyStateSubText}>
              Add your first transaction by tapping the "Add" tab below
            </Text>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredTransactions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TransactionItem
              transaction={item}
              onDelete={handleDeleteTransaction}
            />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EAECEE',
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: '#F2F4F4',
  },
  activeFilterButton: {
    backgroundColor: '#2E86C1',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  activeFilterButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  listContent: {
    paddingVertical: 16,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7F8C8D',
    marginBottom: 8,
  },
  emptyStateSubText: {
    fontSize: 14,
    color: '#95A5A6',
    textAlign: 'center',
  },
});

export default HistoryScreen;