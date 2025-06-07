import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { saveTransaction } from '../utils/storage';

const AddTransactionScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense'); // 'income' or 'expense'
  const [category, setCategory] = useState('other');
  const [loading, setLoading] = useState(false);
  
  const categories = {
    expense: [
      { id: 'food', label: 'Food', icon: 'fast-food' },
      { id: 'transport', label: 'Transport', icon: 'car' },
      { id: 'shopping', label: 'Shopping', icon: 'cart' },
      { id: 'entertainment', label: 'Entertainment', icon: 'film' },
      { id: 'bills', label: 'Bills', icon: 'document-text' },
      { id: 'health', label: 'Health', icon: 'medical' },
      { id: 'education', label: 'Education', icon: 'school' },
      { id: 'other', label: 'Other', icon: 'wallet' },
    ],
    income: [
      { id: 'salary', label: 'Salary', icon: 'cash' },
      { id: 'gift', label: 'Gift', icon: 'gift' },
      { id: 'investment', label: 'Investment', icon: 'trending-up' },
      { id: 'business', label: 'Business', icon: 'briefcase' },
      { id: 'refund', label: 'Refund', icon: 'return-down-back' },
      { id: 'other', label: 'Other', icon: 'wallet' },
    ]
  };

  const handleAmountChange = (value) => {
    // Allow only numbers and decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    
    // Prevent multiple decimal points
    const parts = numericValue.split('.');
    if (parts.length > 2) {
      return;
    }
    
    setAmount(numericValue);
  };
  
  const handleSubmit = async () => {
    // Validate inputs
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    
    setLoading(true);
    
    try {
      // Create transaction object
      const newTransaction = {
        title: title.trim(),
        amount: parseFloat(amount),
        type,
        category,
      };
      
      // Save transaction
      await saveTransaction(newTransaction);
      
      // Reset form and navigate back
      setTitle('');
      setAmount('');
      setType('expense');
      setCategory('other');
      
      // Show success message
      Alert.alert(
        'Success',
        'Transaction added successfully',
        [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
      );
    } catch (error) {
      console.error('Error adding transaction:', error);
      Alert.alert('Error', 'Failed to add transaction');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formContainer}>
          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                type === 'expense' && styles.activeTypeButton
              ]}
              onPress={() => {
                setType('expense');
                setCategory('other');
              }}
            >
              <Ionicons
                name="arrow-down"
                size={18}
                color={type === 'expense' ? '#FFFFFF' : '#E74C3C'}
              />
              <Text style={[
                styles.typeText,
                type === 'expense' && styles.activeTypeText
              ]}>Expense</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.typeButton,
                type === 'income' && styles.activeIncomeButton
              ]}
              onPress={() => {
                setType('income');
                setCategory('other');
              }}
            >
              <Ionicons
                name="arrow-up"
                size={18}
                color={type === 'income' ? '#FFFFFF' : '#27AE60'}
              />
              <Text style={[
                styles.typeText,
                type === 'income' && styles.activeTypeText
              ]}>Income</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Title</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter title"
              placeholderTextColor="#95A5A6"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Amount (₹)</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={handleAmountChange}
              placeholder="0.00"
              placeholderTextColor="#95A5A6"
              keyboardType="numeric"
            />
          </View>
          
          <View style={styles.categoryContainer}>
            <Text style={styles.inputLabel}>Category</Text>
            <View style={styles.categoriesGrid}>
              {categories[type].map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryItem,
                    category === cat.id && styles.activeCategoryItem
                  ]}
                  onPress={() => setCategory(cat.id)}
                >
                  <View style={[
                    styles.categoryIconContainer,
                    category === cat.id && (
                      type === 'expense' 
                        ? styles.activeExpenseCategoryIcon 
                        : styles.activeIncomeCategoryIcon
                    )
                  ]}>
                    <Ionicons
                      name={cat.icon}
                      size={20}
                      color={
                        category === cat.id 
                          ? '#FFFFFF' 
                          : type === 'expense' ? '#E74C3C' : '#27AE60'
                      }
                    />
                  </View>
                  <Text style={[
                    styles.categoryText,
                    category === cat.id && styles.activeCategoryText
                  ]}>{cat.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <TouchableOpacity
            style={[
              styles.submitButton,
              type === 'income' ? styles.incomeSubmitButton : styles.expenseSubmitButton,
              loading && styles.disabledButton
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Adding...' : 'Add Transaction'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F4F4',
    borderRadius: 8,
    paddingVertical: 10,
    marginHorizontal: 4,
  },
  activeTypeButton: {
    backgroundColor: '#E74C3C',
  },
  activeIncomeButton: {
    backgroundColor: '#27AE60',
  },
  typeText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#7F8C8D',
  },
  activeTypeText: {
    color: '#FFFFFF',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F2F4F4',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#2C3E50',
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  categoryItem: {
    width: '25%',
    alignItems: 'center',
    padding: 8,
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F4F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  activeExpenseCategoryIcon: {
    backgroundColor: '#E74C3C',
  },
  activeIncomeCategoryIcon: {
    backgroundColor: '#27AE60',
  },
  categoryText: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  activeCategoryText: {
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  submitButton: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expenseSubmitButton: {
    backgroundColor: '#E74C3C',
  },
  incomeSubmitButton: {
    backgroundColor: '#27AE60',
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddTransactionScreen;