/**
 * Comprehensive API Testing Script for Fixed Endpoints
 * 
 * This script tests all newly implemented and fixed API endpoints.
 * Run this in the browser console after logging into the app.
 */

// Mock Data for Testing
const testData = {
  savingsGoal: {
    name: "Emergency Fund",
    targetAmount: 10000,
    currentAmount: 2500,
    deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
    isCompleted: false
  },

  incomeSource: {
    name: "Software Development Job",
    type: "salary",
    amount: 5000,
    frequency: "monthly",
    nextPayDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    isActive: true,
    description: "Full-time software developer position"
  },

  incomeRecord: {
    amount: 5000,
    date: new Date(),
    description: "Monthly salary payment",
    isRecurring: true
  },

  sleepRecord: {
    date: new Date(),
    bedtime: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    wakeTime: new Date(),
    hoursSlept: 8,
    quality: 4,
    notes: "Good quality sleep"
  },

  exerciseRecord: {
    date: new Date(),
    type: "Weight Training",
    duration: 60,
    intensity: "high",
    calories: 350,
    notes: "Upper body workout"
  },

  nutritionRecord: {
    date: new Date(),
    meal: "lunch",
    food: "Grilled chicken salad with quinoa",
    calories: 450,
    notes: "High protein, balanced meal"
  },

  book: {
    title: "Clean Code",
    author: "Robert C. Martin",
    status: "reading",
    currentPage: 150,
    totalPages: 464,
    rating: null,
    startedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    notes: "Great insights on software development"
  },

  movie: {
    title: "The Matrix",
    director: "The Wachowskis",
    year: 1999,
    status: "to_watch",
    rating: null,
    notes: "Classic sci-fi movie"
  },

  badHabit: {
    name: "Excessive Social Media",
    description: "Spending too much time on social media platforms",
    unit: "minutes",
    targetReduction: 30
  },

  badHabitRecord: {
    date: new Date(),
    count: 45,
    notes: "Caught myself scrolling mindlessly"
  },

  visualization: {
    title: "Dream Home",
    description: "A beautiful house with a garden",
    imageUrl: null,
    category: "personal",
    targetDate: new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000), // 5 years from now
    isAchieved: false,
    progress: 15,
    notes: "Saving for down payment"
  }
};

// Test Results Storage
const apiTestResults = {
  savingsGoals: { create: null, read: null, update: null, delete: null },
  income: { createSource: null, readSources: null, updateSource: null, deleteSource: null, createRecord: null, readRecords: null },
  health: { 
    sleep: { create: null, read: null, update: null, delete: null },
    exercise: { create: null, read: null, update: null, delete: null },
    nutrition: { create: null, read: null, update: null, delete: null }
  },
  books: { create: null, read: null, update: null, delete: null },
  movies: { create: null, read: null, update: null, delete: null },
  badHabits: { create: null, read: null, update: null, delete: null, logRecord: null },
  visualizations: { create: null, read: null, update: null, delete: null }
};

// Test Functions
async function testSavingsGoalsAPI() {
  console.log('💰 Testing Savings Goals API...');
  
  try {
    const { createSavingsGoal, getUserSavingsGoals, updateSavingsGoal, deleteSavingsGoal, addToSavingsGoal } = await import('./src/lib/api/savings-goals.js');
    
    // Test CREATE
    console.log('  Creating savings goal...');
    const createResult = await createSavingsGoal(testData.savingsGoal);
    apiTestResults.savingsGoals.create = createResult;
    console.log('  ✅ Savings goal created:', createResult);

    if (createResult.data) {
      const goalId = createResult.data.id;

      // Test READ
      console.log('  Reading savings goals...');
      const readResult = await getUserSavingsGoals();
      apiTestResults.savingsGoals.read = readResult;
      console.log('  ✅ Savings goals read:', readResult.data?.length || 0, 'goals found');

      // Test UPDATE (add money)
      console.log('  Adding money to savings goal...');
      const addResult = await addToSavingsGoal(goalId, 500);
      apiTestResults.savingsGoals.update = addResult;
      console.log('  ✅ Money added to savings goal:', addResult);

      console.log('  ⚠️ Delete test skipped to preserve data');
    }

  } catch (error) {
    console.error('❌ Savings Goals API test failed:', error);
    apiTestResults.savingsGoals.error = error.message;
  }
}

async function testIncomeAPI() {
  console.log('💵 Testing Income API...');
  
  try {
    const { 
      createIncomeSource, getUserIncomeSources, updateIncomeSource, deleteIncomeSource,
      createIncomeRecord, getUserIncomeRecords, updateIncomeRecord, deleteIncomeRecord
    } = await import('./src/lib/api/income.js');
    
    // Test Income Sources
    console.log('  Creating income source...');
    const createSourceResult = await createIncomeSource(testData.incomeSource);
    apiTestResults.income.createSource = createSourceResult;
    console.log('  ✅ Income source created:', createSourceResult);

    if (createSourceResult.data) {
      const sourceId = createSourceResult.data.id;

      // Test READ
      console.log('  Reading income sources...');
      const readSourcesResult = await getUserIncomeSources();
      apiTestResults.income.readSources = readSourcesResult;
      console.log('  ✅ Income sources read:', readSourcesResult.data?.length || 0, 'sources found');

      // Test Income Records
      console.log('  Creating income record...');
      const recordData = { ...testData.incomeRecord, sourceId };
      const createRecordResult = await createIncomeRecord(recordData);
      apiTestResults.income.createRecord = createRecordResult;
      console.log('  ✅ Income record created:', createRecordResult);

      // Test READ Records
      console.log('  Reading income records...');
      const readRecordsResult = await getUserIncomeRecords();
      apiTestResults.income.readRecords = readRecordsResult;
      console.log('  ✅ Income records read:', readRecordsResult.data?.length || 0, 'records found');

      console.log('  ⚠️ Delete tests skipped to preserve data');
    }

  } catch (error) {
    console.error('❌ Income API test failed:', error);
    apiTestResults.income.error = error.message;
  }
}

async function testHealthAPI() {
  console.log('💪 Testing Health API...');
  
  try {
    const { 
      createSleepRecord, getUserSleepRecords, updateSleepRecord, deleteSleepRecord,
      createExerciseRecord, getUserExerciseRecords, updateExerciseRecord, deleteExerciseRecord,
      createNutritionRecord, getUserNutritionRecords, updateNutritionRecord, deleteNutritionRecord
    } = await import('./src/lib/api/health.js');
    
    // Test Sleep Records
    console.log('  Testing sleep records...');
    const createSleepResult = await createSleepRecord(testData.sleepRecord);
    apiTestResults.health.sleep.create = createSleepResult;
    console.log('  ✅ Sleep record created:', createSleepResult);

    // Test Exercise Records
    console.log('  Testing exercise records...');
    const createExerciseResult = await createExerciseRecord(testData.exerciseRecord);
    apiTestResults.health.exercise.create = createExerciseResult;
    console.log('  ✅ Exercise record created:', createExerciseResult);

    // Test Nutrition Records
    console.log('  Testing nutrition records...');
    const createNutritionResult = await createNutritionRecord(testData.nutritionRecord);
    apiTestResults.health.nutrition.create = createNutritionResult;
    console.log('  ✅ Nutrition record created:', createNutritionResult);

    // Test READ operations
    const sleepReadResult = await getUserSleepRecords();
    const exerciseReadResult = await getUserExerciseRecords();
    const nutritionReadResult = await getUserNutritionRecords();
    
    apiTestResults.health.sleep.read = sleepReadResult;
    apiTestResults.health.exercise.read = exerciseReadResult;
    apiTestResults.health.nutrition.read = nutritionReadResult;
    
    console.log('  ✅ Health records read successfully');
    console.log('  ⚠️ Update/Delete tests skipped to preserve data');

  } catch (error) {
    console.error('❌ Health API test failed:', error);
    apiTestResults.health.error = error.message;
  }
}

async function testBooksAPI() {
  console.log('📚 Testing Books API...');
  
  try {
    const { createBook, getUserBooks, updateBook, deleteBook, updateBookProgress } = await import('./src/lib/api/books.js');
    
    // Test CREATE
    console.log('  Creating book...');
    const createResult = await createBook(testData.book);
    apiTestResults.books.create = createResult;
    console.log('  ✅ Book created:', createResult);

    if (createResult.data) {
      const bookId = createResult.data.id;

      // Test READ
      console.log('  Reading books...');
      const readResult = await getUserBooks();
      apiTestResults.books.read = readResult;
      console.log('  ✅ Books read:', readResult.data?.length || 0, 'books found');

      // Test UPDATE (progress)
      console.log('  Updating book progress...');
      const progressResult = await updateBookProgress(bookId, 200);
      apiTestResults.books.update = progressResult;
      console.log('  ✅ Book progress updated:', progressResult);

      console.log('  ⚠️ Delete test skipped to preserve data');
    }

  } catch (error) {
    console.error('❌ Books API test failed:', error);
    apiTestResults.books.error = error.message;
  }
}

async function testMoviesAPI() {
  console.log('🎬 Testing Movies API...');
  
  try {
    const { createMovie, getUserMovies, updateMovie, deleteMovie, markMovieAsWatched } = await import('./src/lib/api/movies.js');
    
    // Test CREATE
    console.log('  Creating movie...');
    const createResult = await createMovie(testData.movie);
    apiTestResults.movies.create = createResult;
    console.log('  ✅ Movie created:', createResult);

    if (createResult.data) {
      const movieId = createResult.data.id;

      // Test READ
      console.log('  Reading movies...');
      const readResult = await getUserMovies();
      apiTestResults.movies.read = readResult;
      console.log('  ✅ Movies read:', readResult.data?.length || 0, 'movies found');

      // Test UPDATE (mark as watched)
      console.log('  Marking movie as watched...');
      const watchedResult = await markMovieAsWatched(movieId, 5, "Excellent movie!");
      apiTestResults.movies.update = watchedResult;
      console.log('  ✅ Movie marked as watched:', watchedResult);

      console.log('  ⚠️ Delete test skipped to preserve data');
    }

  } catch (error) {
    console.error('❌ Movies API test failed:', error);
    apiTestResults.movies.error = error.message;
  }
}

async function testBadHabitsAPI() {
  console.log('🚫 Testing Bad Habits API...');
  
  try {
    const { 
      createBadHabit, getUserBadHabits, updateBadHabit, deleteBadHabit, 
      logBadHabitOccurrence, getBadHabitRecords 
    } = await import('./src/lib/api/bad-habits.js');
    
    // Test CREATE
    console.log('  Creating bad habit...');
    const createResult = await createBadHabit(testData.badHabit);
    apiTestResults.badHabits.create = createResult;
    console.log('  ✅ Bad habit created:', createResult);

    if (createResult.data) {
      const habitId = createResult.data.id;

      // Test READ
      console.log('  Reading bad habits...');
      const readResult = await getUserBadHabits();
      apiTestResults.badHabits.read = readResult;
      console.log('  ✅ Bad habits read:', readResult.data?.length || 0, 'habits found');

      // Test LOG OCCURRENCE
      console.log('  Logging bad habit occurrence...');
      const logResult = await logBadHabitOccurrence(habitId, testData.badHabitRecord);
      apiTestResults.badHabits.logRecord = logResult;
      console.log('  ✅ Bad habit occurrence logged:', logResult);

      console.log('  ⚠️ Delete test skipped to preserve data');
    }

  } catch (error) {
    console.error('❌ Bad Habits API test failed:', error);
    apiTestResults.badHabits.error = error.message;
  }
}

async function testVisualizationsAPI() {
  console.log('👁️ Testing Visualizations API...');
  
  try {
    const { 
      createVisualization, getUserVisualizations, updateVisualization, deleteVisualization,
      updateVisualizationProgress, markVisualizationAsAchieved
    } = await import('./src/lib/api/visualizations.js');
    
    // Test CREATE
    console.log('  Creating visualization...');
    const createResult = await createVisualization(testData.visualization);
    apiTestResults.visualizations.create = createResult;
    console.log('  ✅ Visualization created:', createResult);

    if (createResult.data) {
      const vizId = createResult.data.id;

      // Test READ
      console.log('  Reading visualizations...');
      const readResult = await getUserVisualizations();
      apiTestResults.visualizations.read = readResult;
      console.log('  ✅ Visualizations read:', readResult.data?.length || 0, 'visualizations found');

      // Test UPDATE (progress)
      console.log('  Updating visualization progress...');
      const progressResult = await updateVisualizationProgress(vizId, 25);
      apiTestResults.visualizations.update = progressResult;
      console.log('  ✅ Visualization progress updated:', progressResult);

      console.log('  ⚠️ Delete test skipped to preserve data');
    }

  } catch (error) {
    console.error('❌ Visualizations API test failed:', error);
    apiTestResults.visualizations.error = error.message;
  }
}

// Main Test Runner
async function runAllNewAPITests() {
  console.log('🚀 Starting New API Tests...\n');
  
  await testSavingsGoalsAPI();
  console.log('');
  
  await testIncomeAPI();
  console.log('');
  
  await testHealthAPI();
  console.log('');
  
  await testBooksAPI();
  console.log('');
  
  await testMoviesAPI();
  console.log('');
  
  await testBadHabitsAPI();
  console.log('');
  
  await testVisualizationsAPI();
  console.log('');
  
  console.log('📊 New API Test Results Summary:');
  console.table(apiTestResults);
  
  return apiTestResults;
}

// Generate Updated Test Report
function generateUpdatedTestReport(results) {
  let report = '\n# Updated API Test Report\n\n';
  
  const allAPIs = {
    'Savings Goals': results.savingsGoals,
    'Income Management': results.income,
    'Health Records': results.health,
    'Books': results.books,
    'Movies': results.movies,
    'Bad Habits': results.badHabits,
    'Visualizations': results.visualizations
  };
  
  Object.keys(allAPIs).forEach(apiName => {
    report += `## ${apiName} API\n\n`;
    
    const apiResult = allAPIs[apiName];
    if (apiResult.error) {
      report += `❌ **Error**: ${apiResult.error}\n\n`;
      return;
    }
    
    Object.keys(apiResult).forEach(operation => {
      const result = apiResult[operation];
      if (result && operation !== 'error') {
        const status = result.error ? '❌' : '✅';
        const message = result.error || 'Success';
        report += `${status} **${operation.toUpperCase()}**: ${message}\n\n`;
      }
    });
  });
  
  return report;
}

// Export for use
window.newAPITestSuite = {
  runAllNewAPITests,
  testSavingsGoalsAPI,
  testIncomeAPI,
  testHealthAPI,
  testBooksAPI,
  testMoviesAPI,
  testBadHabitsAPI,
  testVisualizationsAPI,
  generateUpdatedTestReport,
  testData,
  apiTestResults
};

console.log('New API Test Suite loaded! Run window.newAPITestSuite.runAllNewAPITests() to start testing.');
