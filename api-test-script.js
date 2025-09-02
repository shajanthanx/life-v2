/**
 * Life Manager Dashboard API Testing Script
 * 
 * This script tests all API endpoints with realistic mock data.
 * Run this in the browser console after logging into the app.
 */

// Mock Data Templates
const mockData = {
  goal: {
    title: "Complete Marathon Training",
    description: "Train for and complete a full marathon in under 4 hours",
    category: "fitness",
    targetValue: 42.2,
    currentValue: 0,
    unit: "kilometers",
    deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
    isCompleted: false,
    milestones: [
      { title: "Complete 10K", value: 10.5, isCompleted: false },
      { title: "Complete 21K", value: 21.1, isCompleted: false },
      { title: "Complete 30K", value: 30, isCompleted: false }
    ]
  },

  task: {
    title: "Weekly grocery shopping",
    description: "Buy groceries for the week including healthy meal prep ingredients",
    category: "errands",
    priority: "medium",
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    isCompleted: false,
    isRecurring: true,
    recurringPattern: "weekly"
  },

  habit: {
    name: "Daily Meditation",
    description: "Practice mindfulness meditation for mental clarity and stress reduction",
    category: "mindfulness",
    target: 20,
    unit: "minutes",
    frequency: "daily",
    color: "#8B5CF6",
    isActive: true
  },

  habitRecord: {
    date: new Date(),
    value: 15,
    isCompleted: true,
    notes: "Felt very relaxed after session"
  },

  journalEntry: {
    date: new Date(),
    title: "Productive Day",
    content: "Had a really productive day today. Completed all my planned tasks and felt energized throughout. The morning workout really helped set a positive tone for the day.",
    mood: 4,
    tags: ["productivity", "wellness", "gratitude"],
    image: null
  },

  transaction: {
    type: "expense",
    amount: 45.67,
    category: "food",
    description: "Grocery shopping - healthy meal prep ingredients",
    date: new Date(),
    isRecurring: false,
    recurringPattern: null
  },

  sleepRecord: {
    date: new Date(),
    bedtime: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    wakeTime: new Date(),
    hoursSlept: 7.5,
    quality: 4,
    notes: "Felt well-rested, no disturbances during night"
  },

  exerciseRecord: {
    date: new Date(),
    type: "Running",
    duration: 45,
    intensity: "medium",
    calories: 400,
    notes: "5K morning run, felt great!"
  },

  nutritionRecord: {
    date: new Date(),
    meal: "breakfast",
    food: "Oatmeal with berries and almonds",
    calories: 350,
    notes: "High fiber, good protein balance"
  }
};

// Test Results Storage
const testResults = {
  goals: { create: null, read: null, update: null, delete: null },
  tasks: { create: null, read: null, update: null, delete: null, toggle: null },
  habits: { create: null, read: null, update: null, delete: null, logProgress: null },
  journal: { create: null, read: null, update: null, delete: null },
  transactions: { create: null, read: null, update: null, delete: null },
  health: { 
    sleep: { create: null, read: null },
    exercise: { create: null, read: null },
    nutrition: { create: null, read: null }
  }
};

// API Testing Functions
async function testGoalsAPI() {
  console.log('🎯 Testing Goals API...');
  
  try {
    // Import API functions (adjust import path as needed)
    const { createGoal, getUserGoals, updateGoal, deleteGoal } = await import('./src/lib/api/goals.js');
    
    // Test CREATE
    console.log('  Creating goal...');
    const createResult = await createGoal(mockData.goal);
    testResults.goals.create = createResult;
    console.log('  ✅ Goal created:', createResult);

    if (createResult.data) {
      const goalId = createResult.data.id;

      // Test READ
      console.log('  Reading goals...');
      const readResult = await getUserGoals();
      testResults.goals.read = readResult;
      console.log('  ✅ Goals read:', readResult.data?.length || 0, 'goals found');

      // Test UPDATE
      console.log('  Updating goal...');
      const updateResult = await updateGoal(goalId, {
        currentValue: 5.2,
        description: "Updated: Train for and complete a full marathon in under 4 hours"
      });
      testResults.goals.update = updateResult;
      console.log('  ✅ Goal updated:', updateResult);

      // Test DELETE (commented out to preserve test data)
      // console.log('  Deleting goal...');
      // const deleteResult = await deleteGoal(goalId);
      // testResults.goals.delete = deleteResult;
      // console.log('  ✅ Goal deleted:', deleteResult);
      console.log('  ⚠️ Delete test skipped to preserve data');
    }

  } catch (error) {
    console.error('❌ Goals API test failed:', error);
    testResults.goals.error = error.message;
  }
}

async function testTasksAPI() {
  console.log('📋 Testing Tasks API...');
  
  try {
    const { createTask, getUserTasks, updateTask, deleteTask, toggleTaskCompletion } = await import('./src/lib/api/tasks.js');
    
    // Test CREATE
    console.log('  Creating task...');
    const createResult = await createTask(mockData.task);
    testResults.tasks.create = createResult;
    console.log('  ✅ Task created:', createResult);

    if (createResult.data) {
      const taskId = createResult.data.id;

      // Test READ
      console.log('  Reading tasks...');
      const readResult = await getUserTasks();
      testResults.tasks.read = readResult;
      console.log('  ✅ Tasks read:', readResult.data?.length || 0, 'tasks found');

      // Test UPDATE
      console.log('  Updating task...');
      const updateResult = await updateTask(taskId, {
        priority: "high",
        description: "Updated: Buy groceries for the week including healthy meal prep ingredients and protein powder"
      });
      testResults.tasks.update = updateResult;
      console.log('  ✅ Task updated:', updateResult);

      // Test TOGGLE
      console.log('  Toggling task completion...');
      const toggleResult = await toggleTaskCompletion(taskId);
      testResults.tasks.toggle = toggleResult;
      console.log('  ✅ Task toggled:', toggleResult);

      // Test DELETE (commented out to preserve test data)
      console.log('  ⚠️ Delete test skipped to preserve data');
    }

  } catch (error) {
    console.error('❌ Tasks API test failed:', error);
    testResults.tasks.error = error.message;
  }
}

async function testHabitsAPI() {
  console.log('🔄 Testing Habits API...');
  
  try {
    const { createHabit, getUserHabits, updateHabit, deleteHabit, logHabitProgress } = await import('./src/lib/api/habits.js');
    
    // Test CREATE
    console.log('  Creating habit...');
    const createResult = await createHabit(mockData.habit);
    testResults.habits.create = createResult;
    console.log('  ✅ Habit created:', createResult);

    if (createResult.data) {
      const habitId = createResult.data.id;

      // Test READ
      console.log('  Reading habits...');
      const readResult = await getUserHabits();
      testResults.habits.read = readResult;
      console.log('  ✅ Habits read:', readResult.data?.length || 0, 'habits found');

      // Test LOG PROGRESS
      console.log('  Logging habit progress...');
      const logResult = await logHabitProgress(habitId, mockData.habitRecord);
      testResults.habits.logProgress = logResult;
      console.log('  ✅ Habit progress logged:', logResult);

      // Test UPDATE
      console.log('  Updating habit...');
      const updateResult = await updateHabit(habitId, {
        target: 25,
        description: "Updated: Practice mindfulness meditation for mental clarity, stress reduction, and improved focus"
      });
      testResults.habits.update = updateResult;
      console.log('  ✅ Habit updated:', updateResult);

      // Test DELETE (commented out to preserve test data)
      console.log('  ⚠️ Delete test skipped to preserve data');
    }

  } catch (error) {
    console.error('❌ Habits API test failed:', error);
    testResults.habits.error = error.message;
  }
}

async function testJournalAPI() {
  console.log('📖 Testing Journal API...');
  
  try {
    const { createJournalEntry, getUserJournalEntries, updateJournalEntry, deleteJournalEntry } = await import('./src/lib/api/journal.js');
    
    // Test CREATE
    console.log('  Creating journal entry...');
    const createResult = await createJournalEntry(mockData.journalEntry);
    testResults.journal.create = createResult;
    console.log('  ✅ Journal entry created:', createResult);

    if (createResult.data) {
      const entryId = createResult.data.id;

      // Test READ
      console.log('  Reading journal entries...');
      const readResult = await getUserJournalEntries();
      testResults.journal.read = readResult;
      console.log('  ✅ Journal entries read:', readResult.data?.length || 0, 'entries found');

      // Test UPDATE
      console.log('  Updating journal entry...');
      const updateResult = await updateJournalEntry(entryId, {
        content: "Updated: Had a really productive day today. Completed all my planned tasks and felt energized throughout. The morning workout really helped set a positive tone for the day. Also managed to learn something new!",
        mood: 5,
        tags: ["productivity", "wellness", "gratitude", "learning"]
      });
      testResults.journal.update = updateResult;
      console.log('  ✅ Journal entry updated:', updateResult);

      // Test DELETE (commented out to preserve test data)
      console.log('  ⚠️ Delete test skipped to preserve data');
    }

  } catch (error) {
    console.error('❌ Journal API test failed:', error);
    testResults.journal.error = error.message;
  }
}

async function testTransactionsAPI() {
  console.log('💰 Testing Transactions API...');
  
  try {
    const { createTransaction, getUserTransactions, updateTransaction, deleteTransaction } = await import('./src/lib/api/transactions.js');
    
    // Test CREATE
    console.log('  Creating transaction...');
    const createResult = await createTransaction(mockData.transaction);
    testResults.transactions.create = createResult;
    console.log('  ✅ Transaction created:', createResult);

    if (createResult.data) {
      const transactionId = createResult.data.id;

      // Test READ
      console.log('  Reading transactions...');
      const readResult = await getUserTransactions();
      testResults.transactions.read = readResult;
      console.log('  ✅ Transactions read:', readResult.data?.length || 0, 'transactions found');

      // Test UPDATE
      console.log('  Updating transaction...');
      const updateResult = await updateTransaction(transactionId, {
        amount: 52.33,
        description: "Updated: Grocery shopping - healthy meal prep ingredients + supplements"
      });
      testResults.transactions.update = updateResult;
      console.log('  ✅ Transaction updated:', updateResult);

      // Test DELETE (commented out to preserve test data)
      console.log('  ⚠️ Delete test skipped to preserve data');
    }

  } catch (error) {
    console.error('❌ Transactions API test failed:', error);
    testResults.transactions.error = error.message;
  }
}

async function testHealthAPI() {
  console.log('💪 Testing Health API...');
  
  try {
    const { databaseService } = await import('./src/lib/database.js');
    
    // Test Sleep Records
    console.log('  Testing sleep records...');
    const sleepReadResult = await databaseService.getSleepRecords();
    testResults.health.sleep.read = sleepReadResult;
    console.log('  ✅ Sleep records read:', sleepReadResult.data?.length || 0, 'records found');

    // Test Exercise Records
    console.log('  Testing exercise records...');
    const exerciseReadResult = await databaseService.getExerciseRecords();
    testResults.health.exercise.read = exerciseReadResult;
    console.log('  ✅ Exercise records read:', exerciseReadResult.data?.length || 0, 'records found');

    // Test Nutrition Records
    console.log('  Testing nutrition records...');
    const nutritionReadResult = await databaseService.getNutritionRecords();
    testResults.health.nutrition.read = nutritionReadResult;
    console.log('  ✅ Nutrition records read:', nutritionReadResult.data?.length || 0, 'records found');

  } catch (error) {
    console.error('❌ Health API test failed:', error);
    testResults.health.error = error.message;
  }
}

// Main Test Runner
async function runAllTests() {
  console.log('🚀 Starting Life Manager API Tests...\n');
  
  await testGoalsAPI();
  console.log('');
  
  await testTasksAPI();
  console.log('');
  
  await testHabitsAPI();
  console.log('');
  
  await testJournalAPI();
  console.log('');
  
  await testTransactionsAPI();
  console.log('');
  
  await testHealthAPI();
  console.log('');
  
  console.log('📊 Test Results Summary:');
  console.table(testResults);
  
  return testResults;
}

// Generate Test Report
function generateTestReport(results) {
  let report = '\n# API Test Report\n\n';
  
  Object.keys(results).forEach(apiName => {
    report += `## ${apiName.toUpperCase()} API\n\n`;
    
    if (results[apiName].error) {
      report += `❌ **Error**: ${results[apiName].error}\n\n`;
      return;
    }
    
    Object.keys(results[apiName]).forEach(operation => {
      const result = results[apiName][operation];
      if (result) {
        const status = result.error ? '❌' : '✅';
        const message = result.error || 'Success';
        report += `${status} **${operation.toUpperCase()}**: ${message}\n\n`;
        
        if (result.data) {
          report += `   - Data returned: ${JSON.stringify(result.data, null, 2).substring(0, 100)}...\n\n`;
        }
      }
    });
  });
  
  return report;
}

// Export for use
window.apiTestSuite = {
  runAllTests,
  testGoalsAPI,
  testTasksAPI,
  testHabitsAPI,
  testJournalAPI,
  testTransactionsAPI,
  testHealthAPI,
  generateTestReport,
  mockData,
  testResults
};

console.log('API Test Suite loaded! Run window.apiTestSuite.runAllTests() to start testing.');
