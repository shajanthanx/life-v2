import { supabase } from './supabase'
import { AppState, Goal, Task, Habit, JournalEntry, Book, Movie, Transaction, SleepRecord, ExerciseRecord, NutritionRecord } from '@/types'
import { authService } from './auth'
import { getUserGoals } from './api/goals'
import { getUserTasks } from './api/tasks'
import { getUserHabits } from './api/habits'
import { getUserJournalEntries } from './api/journal'
import { getUserTransactions } from './api/transactions'

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
        nutritionRecords
      ] = await Promise.all([
        getUserGoals(),
        getUserTasks(),
        getUserHabits(),
        getUserJournalEntries(),
        this.getBooks(),
        this.getMovies(),
        getUserTransactions(),
        this.getSleepRecords(),
        this.getExerciseRecords(),
        this.getNutritionRecords()
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
        savingsGoals: [], // Will be implemented later
        investments: [], // Will be implemented later
        journalEntries: journalEntriesResult.data || [],
        books: books.data || [],
        movies: movies.data || [],
        badHabits: [], // Will be implemented later
        visualizations: [], // Will be implemented later
        gifts: [], // Will be implemented later
        events: [], // Will be implemented later
        incomeSources: [], // Will be implemented later
        incomeRecords: [], // Will be implemented later
        gratitudeEntries: [], // Will be implemented later
        progressPhotos: [], // Will be implemented later
        memories: [], // Will be implemented later
        secrets: [], // Will be implemented later
        freelanceProjects: [], // Will be implemented later
        timeEntries: [] // Will be implemented later
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

  // Books
  async getBooks(): Promise<{ data: Book[]; error: string | null }> {
    try {
      const userId = authService.getUserId()
      if (!userId) {
        return { data: [], error: 'Not authenticated' }
      }

      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        return { data: [], error: error.message }
      }

      const transformedBooks: Book[] = data.map(book => ({
        id: book.id,
        title: book.title,
        author: book.author,
        status: book.status,
        currentPage: book.current_page,
        totalPages: book.total_pages,
        rating: book.rating,
        startedAt: book.started_at ? new Date(book.started_at) : undefined,
        completedAt: book.completed_at ? new Date(book.completed_at) : undefined,
        notes: book.notes
      }))

      return { data: transformedBooks, error: null }

    } catch (error) {
      return { data: [], error: 'Failed to fetch books' }
    }
  }

  async createBook(bookData: Omit<Book, 'id'>): Promise<{ data: Book | null; error: string | null }> {
    try {
      const userId = authService.getUserId()
      if (!userId) {
        return { data: null, error: 'Not authenticated' }
      }

      const { data, error } = await supabase
        .from('books')
        .insert({
          user_id: userId,
          title: bookData.title,
          author: bookData.author,
          status: bookData.status,
          current_page: bookData.currentPage,
          total_pages: bookData.totalPages,
          rating: bookData.rating,
          started_at: bookData.startedAt?.toISOString(),
          completed_at: bookData.completedAt?.toISOString(),
          notes: bookData.notes
        })
        .select()
        .single()

      if (error) {
        return { data: null, error: error.message }
      }

      const transformedBook: Book = {
        id: data.id,
        title: data.title,
        author: data.author,
        status: data.status,
        currentPage: data.current_page,
        totalPages: data.total_pages,
        rating: data.rating,
        startedAt: data.started_at ? new Date(data.started_at) : undefined,
        completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
        notes: data.notes
      }

      return { data: transformedBook, error: null }

    } catch (error) {
      return { data: null, error: 'Failed to create book' }
    }
  }

  // Movies
  async getMovies(): Promise<{ data: Movie[]; error: string | null }> {
    try {
      const userId = authService.getUserId()
      if (!userId) {
        return { data: [], error: 'Not authenticated' }
      }

      const { data, error } = await supabase
        .from('movies')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        return { data: [], error: error.message }
      }

      const transformedMovies: Movie[] = data.map(movie => ({
        id: movie.id,
        title: movie.title,
        director: movie.director,
        year: movie.year,
        status: movie.status,
        rating: movie.rating,
        watchedAt: movie.watched_at ? new Date(movie.watched_at) : undefined,
        notes: movie.notes
      }))

      return { data: transformedMovies, error: null }

    } catch (error) {
      return { data: [], error: 'Failed to fetch movies' }
    }
  }

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

  // Sleep Records
  async getSleepRecords(): Promise<{ data: SleepRecord[]; error: string | null }> {
    try {
      const userId = authService.getUserId()
      if (!userId) {
        return { data: [], error: 'Not authenticated' }
      }

      const { data, error } = await supabase
        .from('sleep_records')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })

      if (error) {
        return { data: [], error: error.message }
      }

      const transformedRecords: SleepRecord[] = data.map(record => ({
        id: record.id,
        date: new Date(record.date),
        bedtime: record.bedtime ? new Date(record.bedtime) : new Date(),
        wakeTime: record.wake_time ? new Date(record.wake_time) : new Date(),
        hoursSlept: record.hours_slept || 0,
        quality: record.quality || 3,
        notes: record.notes
      }))

      return { data: transformedRecords, error: null }

    } catch (error) {
      return { data: [], error: 'Failed to fetch sleep records' }
    }
  }

  // Exercise Records
  async getExerciseRecords(): Promise<{ data: ExerciseRecord[]; error: string | null }> {
    try {
      const userId = authService.getUserId()
      if (!userId) {
        return { data: [], error: 'Not authenticated' }
      }

      const { data, error } = await supabase
        .from('exercise_records')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })

      if (error) {
        return { data: [], error: error.message }
      }

      const transformedRecords: ExerciseRecord[] = data.map(record => ({
        id: record.id,
        date: new Date(record.date),
        type: record.type,
        duration: record.duration,
        intensity: record.intensity,
        calories: record.calories,
        notes: record.notes,
        image: record.image_url
      }))

      return { data: transformedRecords, error: null }

    } catch (error) {
      return { data: [], error: 'Failed to fetch exercise records' }
    }
  }

  // Nutrition Records
  async getNutritionRecords(): Promise<{ data: NutritionRecord[]; error: string | null }> {
    try {
      const userId = authService.getUserId()
      if (!userId) {
        return { data: [], error: 'Not authenticated' }
      }

      const { data, error } = await supabase
        .from('nutrition_records')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })

      if (error) {
        return { data: [], error: error.message }
      }

      const transformedRecords: NutritionRecord[] = data.map(record => ({
        id: record.id,
        date: new Date(record.date),
        meal: record.meal,
        food: record.food,
        calories: record.calories,
        notes: record.notes
      }))

      return { data: transformedRecords, error: null }

    } catch (error) {
      return { data: [], error: 'Failed to fetch nutrition records' }
    }
  }

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
