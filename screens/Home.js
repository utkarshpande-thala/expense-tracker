import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import SummaryCard from '../components/SummaryCard';
import TransactionItem from '../components/TransactionItem';
import { getTransactions, getTransactionSummary, deleteTransaction } from '../utils/storage';

const HomeScreen = ({ navigation }) => {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ balance: 0, income: 0, expenses: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  // Function to load transaction data and summary
  const loadData = async () => {
    setLoading(true);
    try {
      const transactionsData = await getTransactions();
      const summaryData = await getTransactionSummary();
      
      setTransactions(transactionsData);
      setSummary(summaryData);
    } catch (error) {
      console.error('Error loading data:', error);
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
      
      // Update summary
      const summaryData = await getTransactionSummary();
      setSummary(summaryData);
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E86C1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SummaryCard 
        balance={summary.balance}
        income={summary.income}
        expenses={summary.expenses}
      />
      
      <View style={styles.recentTransactionsHeader}>
        <Text style={styles.recentTransactionsTitle}>Recent Transactions</Text>
      </View>
      
      {transactions.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateText}>No transactions yet</Text>
          <Text style={styles.emptyStateSubText}>
            Add your first transaction by tapping the "Add" tab below
          </Text>
        </View>
      ) : (
        <FlatList
          data={transactions.slice(0, 5)} // Show only recent 5 transactions
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
  recentTransactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  recentTransactionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  listContent: {
    paddingBottom: 16,
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

export default HomeScreen;