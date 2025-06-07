import AsyncStorage from '@react-native-async-storage/async-storage';

const TRANSACTIONS_KEY = 'expense_tracker_transactions';

// Get all transactions
export const getTransactions = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(TRANSACTIONS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error('Error getting transactions:', error);
    return [];
  }
};

// Save a new transaction
export const saveTransaction = async (transaction) => {
  try {
    // Get existing transactions
    const transactions = await getTransactions();
    
    // Add new transaction with a unique ID
    const newTransaction = {
      ...transaction,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    };
    
    // Add to the beginning of the array for reverse chronological order
    const updatedTransactions = [newTransaction, ...transactions];
    
    // Save to storage
    await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(updatedTransactions));
    
    return newTransaction;
  } catch (error) {
    console.error('Error saving transaction:', error);
    throw error;
  }
};

// Delete a transaction by ID
export const deleteTransaction = async (id) => {
  try {
    // Get existing transactions
    const transactions = await getTransactions();
    
    // Filter out the transaction to delete
    const updatedTransactions = transactions.filter(item => item.id !== id);
    
    // Save the filtered list back to storage
    await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(updatedTransactions));
    
    return updatedTransactions;
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
};

// Clear all transactions (for testing or resetting the app)
export const clearAllTransactions = async () => {
  try {
    await AsyncStorage.removeItem(TRANSACTIONS_KEY);
  } catch (error) {
    console.error('Error clearing transactions:', error);
    throw error;
  }
};

// Calculate summary (balance, income, expenses)
export const getTransactionSummary = async () => {
  try {
    const transactions = await getTransactions();
    
    let income = 0;
    let expenses = 0;
    
    transactions.forEach(transaction => {
      if (transaction.type === 'income') {
        income += parseFloat(transaction.amount);
      } else {
        expenses += parseFloat(transaction.amount);
      }
    });
    
    const balance = income - expenses;
    
    return { balance, income, expenses };
  } catch (error) {
    console.error('Error calculating summary:', error);
    return { balance: 0, income: 0, expenses: 0 };
  }
};

// Get transactions by month
export const getTransactionsByMonth = async () => {
  try {
    const transactions = await getTransactions();
    const monthlyData = {};
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthYear = `${date.getMonth() + 1}-${date.getFullYear()}`;
      
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = {
          income: 0,
          expenses: 0,
          month: date.toLocaleString('default', { month: 'short' }),
          year: date.getFullYear()
        };
      }
      
      if (transaction.type === 'income') {
        monthlyData[monthYear].income += parseFloat(transaction.amount);
      } else {
        monthlyData[monthYear].expenses += parseFloat(transaction.amount);
      }
    });
    
    return Object.values(monthlyData).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return a.month.localeCompare(b.month);
    });
  } catch (error) {
    console.error('Error getting transactions by month:', error);
    return [];
  }
};

// Get transactions by category
export const getTransactionsByCategory = async (type = 'expense') => {
  try {
    const transactions = await getTransactions();
    const categoryData = {};
    
    transactions
      .filter(t => type === 'income' ? t.type === 'income' : t.type === 'expense')
      .forEach(transaction => {
        if (!categoryData[transaction.category]) {
          categoryData[transaction.category] = 0;
        }
        
        categoryData[transaction.category] += parseFloat(transaction.amount);
      });
    
    return Object.entries(categoryData).map(([category, amount]) => ({
      category,
      amount,
    }));
  } catch (error) {
    console.error('Error getting transactions by category:', error);
    return [];
  }
};