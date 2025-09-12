// Test script for all finance module APIs
// Run this in the browser console to test all finance APIs

console.log('🧪 Testing Finance Module APIs...')

// Test data
const testTransactionData = {
  type: 'expense',
  amount: 25.50,
  categoryId: null, // Will be set after categories are created
  category: 'Food & Dining', // Fallback for old schema
  description: 'Test lunch expense',
  date: new Date(),
  isRecurring: false
}

const testCategoryData = {
  name: 'Test Category',
  type: 'expense',
  isDefault: false,
  icon: '🧪',
  color: '#3b82f6'
}

const testPredefinedExpenseData = {
  name: 'Test Subscription',
  categoryId: null, // Will be set after categories are created
  amount: 9.99,
  frequency: 'monthly',
  nextDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  isActive: true,
  description: 'Test recurring expense',
  autoAdd: false
}

async function testFinanceAPIs() {
  const results = {
    categories: {},
    transactions: {},
    predefinedExpenses: {},
    integration: {}
  }

  try {
    // ===== CATEGORIES API TESTS =====
    console.log('\n📂 Testing Categories API...')
    
    // Test getUserCategories
    console.log('  Testing getUserCategories...')
    const categoriesResult = await window.getUserCategories()
    results.categories.getUserCategories = {
      success: !categoriesResult.error,
      data: categoriesResult.data,
      error: categoriesResult.error
    }
    console.log('  ✅ getUserCategories:', results.categories.getUserCategories.success ? 'PASS' : 'FAIL')

    // Test initializeUserCategories
    console.log('  Testing initializeUserCategories...')
    const initResult = await window.initializeUserCategories()
    results.categories.initializeUserCategories = {
      success: initResult.success,
      error: initResult.error
    }
    console.log('  ✅ initializeUserCategories:', results.categories.initializeUserCategories.success ? 'PASS' : 'FAIL')

    // Test createCategory
    console.log('  Testing createCategory...')
    const createCategoryResult = await window.createCategory(testCategoryData)
    results.categories.createCategory = {
      success: !createCategoryResult.error,
      data: createCategoryResult.data,
      error: createCategoryResult.error
    }
    console.log('  ✅ createCategory:', results.categories.createCategory.success ? 'PASS' : 'FAIL')

    // Get created category ID for other tests
    const testCategoryId = createCategoryResult.data?.id

    // ===== TRANSACTIONS API TESTS =====
    console.log('\n💰 Testing Transactions API...')

    // Test with categoryId (new schema)
    if (testCategoryId) {
      console.log('  Testing createTransaction with categoryId...')
      const transactionWithCategoryId = { ...testTransactionData, categoryId: testCategoryId, category: undefined }
      const createTransactionResult1 = await window.createTransaction(transactionWithCategoryId)
      results.transactions.createTransactionWithCategoryId = {
        success: !createTransactionResult1.error,
        data: createTransactionResult1.data,
        error: createTransactionResult1.error
      }
      console.log('  ✅ createTransaction (categoryId):', results.transactions.createTransactionWithCategoryId.success ? 'PASS' : 'FAIL')
    }

    // Test with category text (old schema)
    console.log('  Testing createTransaction with category text...')
    const transactionWithCategory = { ...testTransactionData, categoryId: undefined }
    const createTransactionResult2 = await window.createTransaction(transactionWithCategory)
    results.transactions.createTransactionWithCategory = {
      success: !createTransactionResult2.error,
      data: createTransactionResult2.data,
      error: createTransactionResult2.error
    }
    console.log('  ✅ createTransaction (category):', results.transactions.createTransactionWithCategory.success ? 'PASS' : 'FAIL')

    // Test getUserTransactions
    console.log('  Testing getUserTransactions...')
    const transactionsResult = await window.getUserTransactions()
    results.transactions.getUserTransactions = {
      success: !transactionsResult.error,
      data: transactionsResult.data,
      error: transactionsResult.error
    }
    console.log('  ✅ getUserTransactions:', results.transactions.getUserTransactions.success ? 'PASS' : 'FAIL')

    // ===== PREDEFINED EXPENSES API TESTS =====
    console.log('\n📅 Testing Predefined Expenses API...')

    // Test getUserPredefinedExpenses
    console.log('  Testing getUserPredefinedExpenses...')
    const predefinedExpensesResult = await window.getUserPredefinedExpenses()
    results.predefinedExpenses.getUserPredefinedExpenses = {
      success: !predefinedExpensesResult.error,
      data: predefinedExpensesResult.data,
      error: predefinedExpensesResult.error
    }
    console.log('  ✅ getUserPredefinedExpenses:', results.predefinedExpenses.getUserPredefinedExpenses.success ? 'PASS' : 'FAIL')

    // Test createPredefinedExpense
    if (testCategoryId) {
      console.log('  Testing createPredefinedExpense...')
      const predefinedExpenseWithCategory = { ...testPredefinedExpenseData, categoryId: testCategoryId }
      const createPredefinedExpenseResult = await window.createPredefinedExpense(predefinedExpenseWithCategory)
      results.predefinedExpenses.createPredefinedExpense = {
        success: !createPredefinedExpenseResult.error,
        data: createPredefinedExpenseResult.data,
        error: createPredefinedExpenseResult.error
      }
      console.log('  ✅ createPredefinedExpense:', results.predefinedExpenses.createPredefinedExpense.success ? 'PASS' : 'FAIL')
    }

    // ===== INTEGRATION TESTS =====
    console.log('\n🔗 Testing Integration...')

    // Test that categories are properly loaded
    const finalCategoriesResult = await window.getUserCategories()
    results.integration.categoriesLoaded = {
      success: !finalCategoriesResult.error && finalCategoriesResult.data.length > 0,
      count: finalCategoriesResult.data?.length || 0
    }
    console.log('  ✅ Categories loaded:', results.integration.categoriesLoaded.success ? 'PASS' : 'FAIL', `(${results.integration.categoriesLoaded.count} categories)`)

    // Test that transactions work with categories
    const finalTransactionsResult = await window.getUserTransactions()
    results.integration.transactionsWithCategories = {
      success: !finalTransactionsResult.error,
      count: finalTransactionsResult.data?.length || 0,
      hasCategories: finalTransactionsResult.data?.some(t => t.category || t.categoryId) || false
    }
    console.log('  ✅ Transactions with categories:', results.integration.transactionsWithCategories.success ? 'PASS' : 'FAIL', `(${results.integration.transactionsWithCategories.count} transactions)`)

  } catch (error) {
    console.error('❌ Test failed with error:', error)
    results.error = error.message
  }

  // ===== SUMMARY =====
  console.log('\n📊 TEST SUMMARY:')
  console.log('==================')
  
  const allTests = [
    ...Object.entries(results.categories).map(([name, result]) => ({ category: 'Categories', name, success: result.success })),
    ...Object.entries(results.transactions).map(([name, result]) => ({ category: 'Transactions', name, success: result.success })),
    ...Object.entries(results.predefinedExpenses).map(([name, result]) => ({ category: 'Predefined Expenses', name, success: result.success })),
    ...Object.entries(results.integration).map(([name, result]) => ({ category: 'Integration', name, success: result.success }))
  ]

  const passedTests = allTests.filter(test => test.success).length
  const totalTests = allTests.length

  allTests.forEach(test => {
    console.log(`${test.success ? '✅' : '❌'} ${test.category}: ${test.name}`)
  })

  console.log('\n📈 RESULTS:')
  console.log(`Passed: ${passedTests}/${totalTests} (${Math.round(passedTests/totalTests*100)}%)`)
  
  if (passedTests === totalTests) {
    console.log('🎉 ALL TESTS PASSED! Finance module is working correctly.')
  } else {
    console.log('⚠️  Some tests failed. Check the details above.')
  }

  return results
}

// Make APIs available globally for testing
if (typeof window !== 'undefined') {
  // Import the APIs (you'll need to adapt these imports based on your setup)
  console.log('📦 Setting up test environment...')
  console.log('ℹ️  To run tests, make sure to import the finance APIs first, then call: testFinanceAPIs()')
  
  // You can paste this into browser console after the page loads
  window.testFinanceAPIs = testFinanceAPIs
} else {
  // Node.js environment
  module.exports = { testFinanceAPIs }
}

console.log('🧪 Finance API test suite loaded!')
console.log('💡 To run tests in browser console:')
console.log('   1. Open browser dev tools')
console.log('   2. Navigate to finance page')
console.log('   3. Run: testFinanceAPIs()')
