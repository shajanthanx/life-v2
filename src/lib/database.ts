import { supabase } from './supabase'
import { AppState, Goal, Task, Habit, JournalEntry, Book, Movie, Transaction, SleepRecord, ExerciseRecord, NutritionRecord } from '@/types'
import { authService } from './auth'
import { getUserGoals } from './api/goals'
import { getUserTasks } from './api/tasks'
import { getUserHabits } from './api/habits'
import { getUserJournalEntries } from './api/journal'
import { getUserTransactions } from './api/transactions'
import { getUserSavingsGoals } from './api/savings-goals'
import { getUserIncomeSources, getUserIncomeRecords } from './api/income'
import { getUserSleepRecords, getUserExerciseRecords, getUserNutritionRecords } from './api/health'
import { getUserBooks } from './api/books'
import { getUserMovies } from './api/movies'
import { getUserBadHabits } from './api/bad-habits'
import { getUserVisualizations } from './api/visualizations'
import { getUserGifts, getUserEvents } from './api/gifts'
import { getUserMemories } from './api/memories'
import { getUserProgressPhotos } from './api/progress-photos'
import { getUserSecrets } from './api/secrets'
import { getUserFreelanceProjects, getUserTimeEntries } from './api/freelancing'

export class DatabaseService {
  private static instance: DatabaseService

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService()
    }
    return DatabaseService.instance
  }

  async loadData(): Promise<AppState> {
    try {
      const user = authService.getCurrentUser()
      if (!user) {
        return this.getEmptyAppState()
      }

      // Load all data in parallel
      const [
        goalsResult,
        tasksResult,
        habitsResult,
        journalEntriesResult,
        books,
        movies,
        transactionsResult,
        sleepRecords,
        exerciseRecords,
        nutritionRecords,
        savingsGoals,
        incomeSources,
        incomeRecords,
        badHabits,
        visualizations,
        gifts,
        events,
        memories,
        progressPhotos,
        secrets,
        freelanceProjects,
        timeEntries
      ] = await Promise.all([
        getUserGoals(),
        getUserTasks(),
        getUserHabits(),
        getUserJournalEntries(),
        getUserBooks(),
        getUserMovies(),
        getUserTransactions(),
        getUserSleepRecords(),
        getUserExerciseRecords(),
        getUserNutritionRecords(),
        getUserSavingsGoals(),
        getUserIncomeSources(),
        getUserIncomeRecords(),
        getUserBadHabits(),
        getUserVisualizations(),
        getUserGifts(),
        getUserEvents(),
        getUserMemories(),
        getUserProgressPhotos(),
        getUserSecrets(),
        getUserFreelanceProjects(),
        getUserTimeEntries()
      ])

      return {
        user,
        goals: goalsResult.data || [],
        tasks: tasksResult.data || [],
        habits: habitsResult.data || [],
        healthMetrics: [], // Will be implemented later
        sleepRecords: sleepRecords.data || [],
        exerciseRecords: exerciseRecords.data || [],
        nutritionRecords: nutritionRecords.data || [],
        transactions: transactionsResult.data || [],
        budgets: [], // Will be implemented later
        savingsGoals: savingsGoals.data || [],
        investments: [], // Will be implemented later
        journalEntries: journalEntriesResult.data || [],
        books: books.data || [],
        movies: movies.data || [],
        badHabits: badHabits.data || [],
        visualizations: visualizations.data || [],
        gifts: gifts.data || [],
        events: events.data || [],
        incomeSources: incomeSources.data || [],
        incomeRecords: incomeRecords.data || [],
        gratitudeEntries: [], // Will be implemented later
        progressPhotos: progressPhotos.data || [],
        memories: memories.data || [],
        secrets: secrets.data || [],
        freelanceProjects: freelanceProjects.data || [],
        timeEntries: timeEntries.data || []
      }

    } catch (error) {
      console.error('Error loading data:', error)
      return this.getEmptyAppState()
    }
  }

  private getEmptyAppState(): AppState {
    return {
      user: null,
      goals: [],
      tasks: [],
      habits: [],
      healthMetrics: [],
      sleepRecords: [],
      exerciseRecords: [],
      nutritionRecords: [],
      transactions: [],
      budgets: [],
      savingsGoals: [],
      investments: [],
      journalEntries: [],
      books: [],
      movies: [],
      badHabits: [],
      visualizations: [],
      gifts: [],
      events: [],
      incomeSources: [],
      incomeRecords: [],
      gratitudeEntries: [],
      progressPhotos: [],
      memories: [],
      secrets: [],
      freelanceProjects: [],
      timeEntries: []
    }
  }

  // Journal Entries
  async getJournalEntries(): Promise<{ data: JournalEntry[]; error: string | null }> {
    try {
      const userId = authService.getUserId()
      if (!userId) {
        return { data: [], error: 'Not authenticated' }
      }

      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })

      if (error) {
        return { data: [], error: error.message }
      }

      const transformedEntries: JournalEntry[] = data.map(entry => ({
        id: entry.id,
        date: new Date(entry.date),
        title: entry.title,
        content: entry.content,
        mood: entry.mood,
        tags: entry.tags || [],
        image: entry.image_url
      }))

      return { data: transformedEntries, error: null }

    } catch (error) {
      return { data: [], error: 'Failed to fetch journal entries' }
    }
  }

  async createJournalEntry(entryData: Omit<JournalEntry, 'id'>): Promise<{ data: JournalEntry | null; error: string | null }> {
    try {
      const userId = authService.getUserId()
      if (!userId) {
        return { data: null, error: 'Not authenticated' }
      }

      const { data, error } = await supabase
        .from('journal_entries')
        .insert({
          user_id: userId,
          date: entryData.date.toISOString().split('T')[0],
          title: entryData.title,
          content: entryData.content,
          mood: entryData.mood,
          tags: entryData.tags,
          image_url: entryData.image
        })
        .select()
        .single()

      if (error) {
        return { data: null, error: error.message }
      }

      const transformedEntry: JournalEntry = {
        id: data.id,
        date: new Date(data.date),
        title: data.title,
        content: data.content,
        mood: data.mood,
        tags: data.tags || [],
        image: data.image_url
      }

      return { data: transformedEntry, error: null }

    } catch (error) {
      return { data: null, error: 'Failed to create journal entry' }
    }
  }

  // Books - now handled by dedicated API

  // Movies - now handled by dedicated API

  // Transactions
  async getTransactions(): Promise<{ data: Transaction[]; error: string | null }> {
    try {
      const userId = authService.getUserId()
      if (!userId) {
        return { data: [], error: 'Not authenticated' }
      }

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })

      if (error) {
        return { data: [], error: error.message }
      }

      const transformedTransactions: Transaction[] = data.map(transaction => ({
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount,
        category: transaction.category,
        description: transaction.description,
        date: new Date(transaction.date),
        isRecurring: transaction.is_recurring,
        recurringPattern: transaction.recurring_pattern
      }))

      return { data: transformedTransactions, error: null }

    } catch (error) {
      return { data: [], error: 'Failed to fetch transactions' }
    }
  }

  // Health Records - now handled by dedicated API

  // This method is kept for compatibility but doesn't save to localStorage anymore
  saveData(data: AppState): void {
    // Data is automatically saved to Supabase when created/updated
    console.log('Data saving is now handled automatically by Supabase')
  }

  // Get initial/mock data - kept for compatibility
  getInitialData(): AppState {
    return this.getEmptyAppState()
  }
}

export const databaseService = DatabaseService.getInstance()
