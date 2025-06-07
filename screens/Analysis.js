import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Dimensions } from 'react-native';
import { getTransactionsByCategory, getTransactions } from '../utils/storage';

const screenWidth = Dimensions.get('window').width;

const AnalysisScreen = () => {
  const [loading, setLoading] = useState(true);
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [activeChartType, setActiveChartType] = useState('expense');
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0
  });
  
  const chartColors = [
    '#E74C3C', '#3498DB', '#2ECC71', '#F1C40F', '#9B59B6', 
    '#1ABC9C', '#F39C12', '#D35400', '#27AE60', '#2980B9'
  ];

  useEffect(() => {
    loadData();
  }, [activeChartType]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Get category data
      const categories = await getTransactionsByCategory(activeChartType);
      
      // Format category data
      const formattedCategoryData = categories.map((item, index) => ({
        name: item.category.charAt(0).toUpperCase() + item.category.slice(1),
        amount: item.amount,
        color: chartColors[index % chartColors.length]
      }));
      
      setCategoryData(formattedCategoryData);
      
      // Get all transactions
      const transactions = await getTransactions();
      
      // Process transactions to get monthly data
      const monthlyDataMap = {};
      let totalIncome = 0;
      let totalExpenses = 0;
      
      // Get current year
      const currentYear = new Date().getFullYear();
      
      // Initialize all months for the current year
      for (let month = 0; month < 12; month++) {
        const date = new Date(currentYear, month, 1);
        const monthKey = `${month + 1}-${currentYear}`;
        monthlyDataMap[monthKey] = {
          income: 0,
          expenses: 0,
          month: date.toLocaleString('default', { month: 'short' }),
          year: currentYear,
          monthIndex: month
        };
      }
      
      // Add transaction data to appropriate months
      transactions.forEach(transaction => {
        const date = new Date(transaction.date);
        const year = date.getFullYear();
        
        // Only process transactions from the current year
        if (year === currentYear) {
          const monthIndex = date.getMonth();
          const monthKey = `${monthIndex + 1}-${year}`;
          
          if (!monthlyDataMap[monthKey]) {
            monthlyDataMap[monthKey] = {
              income: 0,
              expenses: 0,
              month: date.toLocaleString('default', { month: 'short' }),
              year: year,
              monthIndex: monthIndex
            };
          }
          
          if (transaction.type === 'income') {
            monthlyDataMap[monthKey].income += parseFloat(transaction.amount);
            totalIncome += parseFloat(transaction.amount);
          } else {
            monthlyDataMap[monthKey].expenses += parseFloat(transaction.amount);
            totalExpenses += parseFloat(transaction.amount);
          }
        }
      });
      
      // Update summary data
      setSummary({
        totalIncome,
        totalExpenses,
        balance: totalIncome - totalExpenses
      });
      
      // Convert to array and sort by month index (January to December)
      const formattedMonthlyData = Object.values(monthlyDataMap).sort((a, b) => a.monthIndex - b.monthIndex);
      
      setMonthlyData(formattedMonthlyData);
    } catch (error) {
      console.error('Error loading analysis data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E86C1" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.chartTypeContainer}>
        <TouchableOpacity
          style={[
            styles.chartTypeButton,
            activeChartType === 'expense' && styles.activeChartTypeButton
          ]}
          onPress={() => setActiveChartType('expense')}
        >
          <Text style={[
            styles.chartTypeText,
            activeChartType === 'expense' && styles.activeChartTypeText
          ]}>Expenses</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.chartTypeButton,
            activeChartType === 'income' && styles.activeChartTypeButton
          ]}
          onPress={() => setActiveChartType('income')}
        >
          <Text style={[
            styles.chartTypeText,
            activeChartType === 'income' && styles.activeChartTypeText
          ]}>Income</Text>
        </TouchableOpacity>
      </View>
      
      {/* Summary Box */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryTitle}>Financial Summary</Text>
        </View>
        
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Income:</Text>
          <Text style={[styles.summaryValue, styles.incomeText]}>₹{summary.totalIncome.toFixed(2)}</Text>
        </View>
        
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Expenses:</Text>
          <Text style={[styles.summaryValue, styles.expenseText]}>₹{summary.totalExpenses.toFixed(2)}</Text>
        </View>
        
        <View style={[styles.summaryItem, styles.balanceItem]}>
          <Text style={styles.summaryLabel}>Balance:</Text>
          <Text 
            style={[
              styles.summaryValue, 
              summary.balance >= 0 ? styles.incomeText : styles.expenseText
            ]}
          >
            ₹{summary.balance.toFixed(2)}
          </Text>
        </View>
      </View>
      
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>
          {activeChartType === 'expense' ? 'Expense' : 'Income'} by Category
        </Text>
        
        {categoryData.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No {activeChartType} data available
            </Text>
          </View>
        ) : (
          <View style={styles.categoryListContainer}>
            {categoryData.map((item, index) => (
              <View key={index} style={styles.categoryItem}>
                <View style={[styles.categoryDot, { backgroundColor: item.color }]} />
                <Text style={styles.categoryName}>{item.name}</Text>
                <Text style={styles.categoryAmount}>₹{item.amount.toFixed(2)}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
      
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Monthly Breakdown</Text>
        {monthlyData.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No monthly data available
            </Text>
          </View>
        ) : (
          <View style={styles.monthlyBreakdownContainer}>
            {monthlyData.map((item, index) => (
              <View key={index} style={styles.monthlyItem}>
                <Text style={styles.monthText}>{item.month}</Text>
                
                <View style={styles.monthlyAmountContainer}>
                  <View style={styles.monthlyAmountRow}>
                    <Text style={styles.monthlyAmountLabel}>Income:</Text>
                    <Text style={[styles.monthlyAmount, styles.incomeText]}>
                      ₹{item.income.toFixed(2)}
                    </Text>
                  </View>
                  
                  <View style={styles.monthlyAmountRow}>
                    <Text style={styles.monthlyAmountLabel}>Expense:</Text>
                    <Text style={[styles.monthlyAmount, styles.expenseText]}>
                      ₹{item.expenses.toFixed(2)}
                    </Text>
                  </View>
                  
                  <View style={styles.monthlyAmountRow}>
                    <Text style={styles.monthlyAmountLabel}>Balance:</Text>
                    <Text 
                      style={[
                        styles.monthlyAmount, 
                        (item.income - item.expenses) >= 0 ? styles.incomeText : styles.expenseText
                      ]}
                    >
                      ₹{(item.income - item.expenses).toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
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
  chartTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EAECEE',
  },
  chartTypeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: '#F2F4F4',
  },
  activeChartTypeButton: {
    backgroundColor: '#2E86C1',
  },
  chartTypeText: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  activeChartTypeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  summaryContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  summaryHeader: {
    backgroundColor: '#2E86C1',
    padding: 12,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EAECEE',
  },
  balanceItem: {
    backgroundColor: '#F8F9F9',
  },
  summaryLabel: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    margin: 16,
    marginTop: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  emptyContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#95A5A6',
  },
  categoryListContainer: {
    marginTop: 8,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EAECEE',
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  categoryName: {
    flex: 1,
    fontSize: 14,
    color: '#2C3E50',
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  monthlyBreakdownContainer: {
    marginTop: 8,
  },
  monthlyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EAECEE',
  },
  monthText: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '500',
    alignSelf: 'center',
    width: 70,
  },
  monthlyAmountContainer: {
    flex: 1,
    marginLeft: 20,
  },
  monthlyAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  monthlyAmountLabel: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  monthlyAmount: {
    fontSize: 14,
    fontWeight: '500',
  },
  expenseText: {
    color: '#E74C3C',
  },
  incomeText: {
    color: '#27AE60',
  },
});

export default AnalysisScreen;