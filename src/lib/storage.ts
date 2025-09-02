'use client'

import { AppState, User } from '@/types'
import { format } from 'date-fns'

const STORAGE_KEY = 'life-dashboard-data'

// Generate mock data for initial setup
const generateMockData = (): Omit<AppState, 'user'> => {
  const today = new Date()
  const thisMonth = today.getMonth()
  const thisYear = today.getFullYear()

  return {
    goals: [
      {
        id: '1',
        title: 'Read 24 Books This Year',
        description: 'Expand knowledge and improve reading habits',
        category: 'learning',
        targetValue: 24,
        currentValue: 8,
        unit: 'books',
        deadline: new Date(thisYear, 11, 31),
        isCompleted: false,
        createdAt: new Date(thisYear, 0, 1),
        milestones: [
          { id: '1', title: 'Q1 Goal (6 books)', value: 6, isCompleted: true, completedAt: new Date(thisYear, 2, 31) },
          { id: '2', title: 'Q2 Goal (12 books)', value: 12, isCompleted: false },
          { id: '3', title: 'Q3 Goal (18 books)', value: 18, isCompleted: false },
          { id: '4', title: 'Q4 Goal (24 books)', value: 24, isCompleted: false }
        ]
      },
      {
        id: '2',
        title: 'Save $5000 Emergency Fund',
        description: 'Build financial security',
        category: 'finance',
        targetValue: 5000,
        currentValue: 2500,
        unit: 'dollars',
        deadline: new Date(thisYear, 11, 31),
        isCompleted: false,
        createdAt: new Date(thisYear, 0, 1),
        milestones: [
          { id: '1', title: 'First $1000', value: 1000, isCompleted: true, completedAt: new Date(thisYear, 1, 15) },
          { id: '2', title: 'Reach $2500', value: 2500, isCompleted: true, completedAt: new Date(thisYear, 3, 10) },
          { id: '3', title: 'Hit $5000', value: 5000, isCompleted: false }
        ]
      }
    ],
    tasks: [
      {
        id: '1',
        title: 'Complete monthly budget review',
        description: 'Analyze spending patterns and adjust budget',
        category: 'finance',
        priority: 'high',
        dueDate: new Date(today.getTime() + 86400000), // tomorrow
        isCompleted: false,
        isRecurring: true,
        recurringPattern: 'monthly',
        createdAt: new Date()
      },
      {
        id: '2',
        title: 'Schedule annual health checkup',
        category: 'health',
        priority: 'medium',
        dueDate: new Date(today.getTime() + 7 * 86400000), // next week
        isCompleted: false,
        isRecurring: false,
        createdAt: new Date()
      },
      {
        id: '3',
        title: 'Meal prep for the week',
        category: 'health',
        priority: 'medium',
        dueDate: today,
        isCompleted: true,
        completedAt: today,
        isRecurring: true,
        recurringPattern: 'weekly',
        createdAt: new Date()
      }
    ],
    habits: [
      {
        id: '1',
        name: 'Drink Water',
        description: 'Stay hydrated throughout the day',
        category: 'health',
        target: 8,
        unit: 'glasses',
        frequency: 'daily',
        color: '#3B82F6',
        isActive: true,
        createdAt: new Date(),
        records: Array.from({ length: 30 }, (_, i) => ({
          id: `water-${i}`,
          habitId: '1',
          date: new Date(today.getTime() - i * 86400000),
          value: Math.floor(Math.random() * 10) + 5,
          isCompleted: Math.random() > 0.2
        }))
      },
      {
        id: '2',
        name: 'Exercise',
        description: 'Physical activity for at least 30 minutes',
        category: 'fitness',
        target: 30,
        unit: 'minutes',
        frequency: 'daily',
        color: '#10B981',
        isActive: true,
        createdAt: new Date(),
        records: Array.from({ length: 30 }, (_, i) => ({
          id: `exercise-${i}`,
          habitId: '2',
          date: new Date(today.getTime() - i * 86400000),
          value: Math.floor(Math.random() * 60) + 20,
          isCompleted: Math.random() > 0.3
        }))
      },
      {
        id: '3',
        name: 'Read',
        description: 'Read for personal development',
        category: 'learning',
        target: 30,
        unit: 'minutes',
        frequency: 'daily',
        color: '#8B5CF6',
        isActive: true,
        createdAt: new Date(),
        records: Array.from({ length: 30 }, (_, i) => ({
          id: `read-${i}`,
          habitId: '3',
          date: new Date(today.getTime() - i * 86400000),
          value: Math.floor(Math.random() * 45) + 15,
          isCompleted: Math.random() > 0.25
        }))
      }
    ],
    healthMetrics: [],
    sleepRecords: Array.from({ length: 7 }, (_, i) => ({
      id: `sleep-${i}`,
      date: new Date(today.getTime() - i * 86400000),
      bedtime: new Date(today.getTime() - i * 86400000 - 8 * 3600000),
      wakeTime: new Date(today.getTime() - i * 86400000),
      hoursSlept: Math.random() * 3 + 6,
      quality: Math.floor(Math.random() * 5) + 1 as 1 | 2 | 3 | 4 | 5
    })),
    exerciseRecords: [],
    nutritionRecords: [],
    transactions: [
      {
        id: '1',
        type: 'expense',
        amount: 45.50,
        category: 'Food',
        description: 'Grocery shopping',
        date: today,
        isRecurring: false
      },
      {
        id: '2',
        type: 'expense',
        amount: 1200,
        category: 'Housing',
        description: 'Monthly rent',
        date: new Date(thisYear, thisMonth, 1),
        isRecurring: true,
        recurringPattern: 'monthly'
      },
      {
        id: '3',
        type: 'income',
        amount: 4500,
        category: 'Salary',
        description: 'Monthly salary',
        date: new Date(thisYear, thisMonth, 1),
        isRecurring: true,
        recurringPattern: 'monthly'
      }
    ],
    budgets: [
      { id: '1', category: 'Food', allocated: 400, spent: 245.80, month: thisMonth, year: thisYear },
      { id: '2', category: 'Housing', allocated: 1200, spent: 1200, month: thisMonth, year: thisYear },
      { id: '3', category: 'Transportation', allocated: 200, spent: 89.50, month: thisMonth, year: thisYear },
      { id: '4', category: 'Entertainment', allocated: 150, spent: 67.20, month: thisMonth, year: thisYear }
    ],
    savingsGoals: [
      {
        id: '1',
        name: 'Emergency Fund',
        targetAmount: 5000,
        currentAmount: 2500,
        deadline: new Date(thisYear, 11, 31),
        isCompleted: false,
        createdAt: new Date(thisYear, 0, 1)
      },
      {
        id: '2',
        name: 'Vacation Fund',
        targetAmount: 2000,
        currentAmount: 750,
        deadline: new Date(thisYear, 6, 1),
        isCompleted: false,
        createdAt: new Date(thisYear, 0, 1)
      }
    ],
    investments: [],
    journalEntries: [
      {
        id: '1',
        date: today,
        title: 'Great Productive Day',
        content: 'Had an amazing day today! Completed all my planned tasks and felt really energized. The morning workout really set the tone for the entire day.',
        mood: 5,
        tags: ['productivity', 'exercise', 'energy']
      }
    ],
    books: [
      {
        id: '1',
        title: 'Atomic Habits',
        author: 'James Clear',
        status: 'reading',
        currentPage: 150,
        totalPages: 320,
        startedAt: new Date(thisYear, thisMonth - 1, 15)
      },
      {
        id: '2',
        title: 'The 7 Habits of Highly Effective People',
        author: 'Stephen Covey',
        status: 'completed',
        totalPages: 381,
        rating: 5,
        startedAt: new Date(thisYear, thisMonth - 2, 1),
        completedAt: new Date(thisYear, thisMonth - 1, 10)
      }
    ],
    movies: [
      {
        id: '1',
        title: 'The Pursuit of Happyness',
        director: 'Gabriele Muccino',
        year: 2006,
        status: 'completed',
        rating: 5,
        watchedAt: new Date(thisYear, thisMonth, today.getDate() - 3)
      }
    ],
    badHabits: [
      {
        id: '1',
        name: 'Social Media',
        description: 'Reduce mindless scrolling',
        unit: 'minutes',
        targetReduction: 60,
        createdAt: new Date(),
        records: Array.from({ length: 7 }, (_, i) => ({
          id: `social-${i}`,
          habitId: '1',
          date: new Date(today.getTime() - i * 86400000),
          count: Math.floor(Math.random() * 120) + 30
        }))
      }
    ],
    visualizations: [
      {
        id: '1',
        title: 'Dream Home',
        description: 'A cozy house with a garden in the suburbs',
        category: 'personal',
        targetDate: new Date(thisYear + 2, 6, 1),
        isAchieved: false,
        progress: 25,
        createdAt: new Date(),
        notes: 'Saving for down payment and researching neighborhoods'
      },
      {
        id: '2',
        title: 'Promotion to Senior Developer',
        description: 'Advance to senior role with leadership responsibilities',
        category: 'career',
        targetDate: new Date(thisYear, 11, 31),
        isAchieved: false,
        progress: 60,
        createdAt: new Date(),
        notes: 'Need to improve technical skills and take on more projects'
      }
    ],
    gifts: [
      {
        id: '1',
        recipientName: 'Mom',
        relationship: 'family',
        occasion: 'Birthday',
        giftIdea: 'Spa Day Package',
        budget: 200,
        spent: 0,
        eventDate: new Date(thisYear, thisMonth + 1, 15),
        status: 'planning',
        createdAt: new Date(),
        notes: 'She mentioned wanting to relax more'
      }
    ],
    events: [
      {
        id: '1',
        title: "Mom's Birthday Celebration",
        description: 'Family dinner and celebration',
        eventType: 'birthday',
        date: new Date(thisYear, thisMonth + 1, 15),
        budget: 500,
        spent: 0,
        attendees: ['Dad', 'Sister', 'Brother'],
        gifts: [],
        status: 'planning',
        createdAt: new Date()
      }
    ],
    incomeSources: [
      {
        id: '1',
        name: 'Main Job',
        type: 'salary',
        amount: 4500,
        frequency: 'monthly',
        nextPayDate: new Date(thisYear, thisMonth + 1, 1),
        isActive: true,
        description: 'Full-time software developer position',
        createdAt: new Date()
      },
      {
        id: '2',
        name: 'Freelance Projects',
        type: 'freelance',
        amount: 800,
        frequency: 'monthly',
        isActive: true,
        description: 'Web development projects',
        createdAt: new Date()
      }
    ],
    incomeRecords: [
      {
        id: '1',
        sourceId: '1',
        amount: 4500,
        date: new Date(thisYear, thisMonth, 1),
        description: 'Monthly salary',
        isRecurring: true
      }
    ],
    gratitudeEntries: [
      {
        id: '1',
        date: today,
        entries: [
          'Grateful for my health and energy today',
          'Thankful for supportive family and friends',
          'Appreciative of the opportunity to learn and grow'
        ],
        mood: 4,
        notes: 'Feeling blessed and optimistic about the future'
      }
    ],
    progressPhotos: [],
    memories: [],
    secrets: [],
    freelanceProjects: [],
    timeEntries: []
  }
}

export class StorageService {
  private static instance: StorageService

  private constructor() {}

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService()
    }
    return StorageService.instance
  }

  loadData(): AppState {
    if (typeof window === 'undefined') {
      return { user: null, ...generateMockData() }
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored)
        // Convert date strings back to Date objects
        return this.deserializeDates(data)
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error)
    }

    // Return mock data if nothing stored or error occurred
    const mockData = generateMockData()
    this.saveData({ user: null, ...mockData })
    return { user: null, ...mockData }
  }

  saveData(data: AppState): void {
    if (typeof window === 'undefined') return

    try {
      const jsonString = JSON.stringify(data)
      const sizeInMB = new Blob([jsonString]).size / (1024 * 1024)
      
      console.log(`Attempting to save ${sizeInMB.toFixed(2)}MB of data`)
      
      if (sizeInMB > 8) {
        throw new Error('Data too large for localStorage (>8MB). Consider removing some images.')
      }
      
      localStorage.setItem(STORAGE_KEY, jsonString)
    } catch (error) {
      console.error('Error saving data to localStorage:', error)
      
      if (error instanceof Error && error.message.includes('quota')) {
        // Try to free up space by removing old images
        const cleanedData = this.cleanupOldImages(data)
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanedData))
          console.log('Successfully cleaned up and saved data after quota exceeded')
          return // Successfully saved after cleanup
        } catch (retryError) {
          console.error('Even after cleanup, could not save data:', retryError)
          throw new Error('Storage quota exceeded. Please remove some images or data manually.')
        }
      }
      
      throw error
    }
  }

  private cleanupOldImages(data: AppState): AppState {
    // More aggressive cleanup strategy
    console.log('Starting aggressive cleanup to free storage space...')
    
    // Keep only last 5 journal entries with images
    const recentJournalEntries = data.journalEntries
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map((entry, index) => ({
        ...entry,
        image: index < 5 ? entry.image : undefined // Keep images only for latest 5
      }))

    // Keep only last 10 exercise records with images
    const recentExerciseRecords = data.exerciseRecords
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map((record, index) => ({
        ...record,
        image: index < 10 ? record.image : undefined // Keep images only for latest 10
      }))

    // Clean up visualization images - keep only last 5
    const cleanedVisualizations = data.visualizations
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((viz, index) => ({
        ...viz,
        imageUrl: index < 5 ? viz.imageUrl : undefined
      }))

    // Clean up progress photos - keep only last 10
    const cleanedProgressPhotos = data.progressPhotos
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10)

    // Clean up memories - keep only last 5 with reduced images
    const cleanedMemories = data.memories
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
      .map(memory => ({
        ...memory,
        images: memory.images.slice(0, 2) // Keep only first 2 images per memory
      }))

    const cleanedData = {
      ...data,
      journalEntries: recentJournalEntries,
      exerciseRecords: recentExerciseRecords,
      visualizations: cleanedVisualizations,
      progressPhotos: cleanedProgressPhotos,
      memories: cleanedMemories
    }

    return cleanedData
  }

  clearData(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(STORAGE_KEY)
  }

  getInitialData(): AppState {
    return { user: null, ...generateMockData() }
  }

  private deserializeDates(obj: any): any {
    if (obj === null || typeof obj !== 'object') return obj

    if (Array.isArray(obj)) {
      return obj.map(item => this.deserializeDates(item))
    }

    const result: any = {}
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string' && this.isDateString(value)) {
        result[key] = new Date(value)
      } else if (typeof value === 'object') {
        result[key] = this.deserializeDates(value)
      } else {
        result[key] = value
      }
    }
    return result
  }

  private isDateString(value: string): boolean {
    // Check if string matches common date formats
    const date = new Date(value)
    return !isNaN(date.getTime()) && (
      value.includes('T') || // ISO format
      value.includes('-') || // YYYY-MM-DD
      /^\d{4}-\d{2}-\d{2}/.test(value) // Date-like pattern
    )
  }
}

export const storageService = StorageService.getInstance()
