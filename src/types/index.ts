// User and Authentication
export interface User {
  id: string
  email: string
  name: string
  avatar?: string
}

// Productivity Types
export interface Goal {
  id: string
  title: string
  description?: string
  category: 'fitness' | 'learning' | 'career' | 'personal' | 'finance'
  targetValue: number
  currentValue: number
  unit: string
  deadline: Date
  isCompleted: boolean
  createdAt: Date
  milestones: Milestone[]
}

export interface Milestone {
  id: string
  title: string
  value: number
  isCompleted: boolean
  completedAt?: Date
}

export interface Task {
  id: string
  title: string
  description?: string
  category: 'work' | 'health' | 'errands' | 'personal' | 'finance'
  priority: 'low' | 'medium' | 'high'
  dueDate?: Date
  isCompleted: boolean
  completedAt?: Date
  isRecurring: boolean
  recurringPattern?: 'daily' | 'weekly' | 'monthly'
  createdAt: Date
}

export interface Habit {
  id: string
  name: string
  description?: string
  category: 'health' | 'productivity' | 'mindfulness' | 'fitness' | 'learning'
  frequency: 'daily' | 'weekly'
  color: string
  isActive: boolean
  createdAt: Date
  records: HabitRecord[]
}

export interface HabitRecord {
  id: string
  habitId: string
  date: Date
  isCompleted: boolean
  notes?: string
}

// Health Types
export interface HealthMetric {
  id: string
  type: 'sleep' | 'exercise' | 'nutrition' | 'weight' | 'mood' | 'symptoms'
  value: number
  unit: string
  date: Date
  notes?: string
}

export interface SleepRecord {
  id: string
  date: Date
  bedtime: Date
  wakeTime: Date
  hoursSlept: number
  quality: 1 | 2 | 3 | 4 | 5
  notes?: string
}

export interface ExerciseRecord {
  id: string
  date: Date
  type: string
  duration: number
  intensity: 'low' | 'medium' | 'high'
  calories?: number
  notes?: string
  image?: string
}

export interface NutritionRecord {
  id: string
  date: Date
  meal: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  food: string
  calories: number
  notes?: string
}

// Finance Types
export interface Transaction {
  id: string
  type: 'income' | 'expense'
  amount: number
  category: string
  description: string
  date: Date
  isRecurring: boolean
  recurringPattern?: 'weekly' | 'monthly'
}

export interface Budget {
  id: string
  category: string
  allocated: number
  spent: number
  month: number
  year: number
}

export interface SavingsGoal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline: Date
  isCompleted: boolean
  createdAt: Date
}

export interface Investment {
  id: string
  name: string
  type: 'stocks' | 'bonds' | 'crypto' | 'real_estate' | 'other'
  currentValue: number
  purchaseValue: number
  purchaseDate: Date
  lastUpdated: Date
}

// Lifestyle Types
export interface JournalEntry {
  id: string
  date: Date
  title?: string
  content: string
  mood: 1 | 2 | 3 | 4 | 5
  tags: string[]
  image?: string
}

export interface Book {
  id: string
  title: string
  author: string
  status: 'to_read' | 'reading' | 'completed'
  currentPage?: number
  totalPages?: number
  rating?: 1 | 2 | 3 | 4 | 5
  startedAt?: Date
  completedAt?: Date
  notes?: string
}

export interface Movie {
  id: string
  title: string
  director?: string
  year?: number
  status: 'to_watch' | 'watching' | 'completed'
  rating?: 1 | 2 | 3 | 4 | 5
  watchedAt?: Date
  notes?: string
}

export interface BadHabit {
  id: string
  name: string
  description?: string
  records: BadHabitRecord[]
  createdAt: Date
}

export interface BadHabitRecord {
  id: string
  habitId: string
  date: Date
  isOccurred: boolean
  notes?: string
}

// Visualization Types
export interface Visualization {
  id: string
  title: string
  description?: string
  imageUrl?: string
  category: 'personal' | 'career' | 'health' | 'finance' | 'relationships'
  targetDate?: Date
  isAchieved: boolean
  progress: number
  createdAt: Date
  notes?: string
}

// Gift Planning Types
export interface Gift {
  id: string
  recipientName: string
  relationship: string
  occasion: string
  giftIdea: string
  budget: number
  spent: number
  purchaseDate?: Date
  eventDate: Date
  status: 'planning' | 'purchased' | 'given'
  notes?: string
  createdAt: Date
}

export interface Event {
  id: string
  title: string
  description?: string
  eventType: 'birthday' | 'anniversary' | 'holiday' | 'celebration' | 'other'
  date: Date
  budget: number
  spent: number
  attendees: string[]
  gifts: Gift[]
  status: 'planning' | 'confirmed' | 'completed'
  createdAt: Date
}

// Income Types
export interface IncomeSource {
  id: string
  name: string
  type: 'salary' | 'freelance' | 'investment' | 'business' | 'other'
  amount: number
  frequency: 'monthly' | 'weekly' | 'yearly' | 'one-time'
  nextPayDate?: Date
  isActive: boolean
  description?: string
  createdAt: Date
}

export interface IncomeRecord {
  id: string
  sourceId: string
  amount: number
  date: Date
  description?: string
  isRecurring: boolean
}

// Gratitude Types
export interface GratitudeEntry {
  id: string
  date: Date
  entries: string[]
  mood: 1 | 2 | 3 | 4 | 5
  notes?: string
}

// Dashboard Types
export interface DashboardMetrics {
  todayTasks: {
    completed: number
    total: number
  }
  habitStreaks: {
    name: string
    streak: number
    color: string
  }[]
  healthScore: number
  financialHealth: {
    budgetUsed: number
    savingsProgress: number
  }
  weeklyProgress: {
    productivity: number
    health: number
    finance: number
    lifestyle: number
  }
}

// App State
export interface AppState {
  user: User | null
  goals: Goal[]
  tasks: Task[]
  habits: Habit[]
  healthMetrics: HealthMetric[]
  sleepRecords: SleepRecord[]
  exerciseRecords: ExerciseRecord[]
  nutritionRecords: NutritionRecord[]
  transactions: Transaction[]
  budgets: Budget[]
  savingsGoals: SavingsGoal[]
  investments: Investment[]
  journalEntries: JournalEntry[]
  books: Book[]
  movies: Movie[]
  badHabits: BadHabit[]
  visualizations: Visualization[]
  gifts: Gift[]
  events: Event[]
  incomeSources: IncomeSource[]
  incomeRecords: IncomeRecord[]
  gratitudeEntries: GratitudeEntry[]
  progressPhotos: ProgressPhoto[]
  memories: Memory[]
  secrets: Secret[]
  freelanceProjects: FreelanceProject[]
  timeEntries: TimeEntry[]
  
  // Notes data
  notes: Note[]
}

// Progress and Memories Types
export interface ProgressPhoto {
  id: string
  image: string
  date: Date
  weight?: number
  bodyFatPercentage?: number
  muscleMass?: number
  notes?: string
}

export interface Memory {
  id: string
  title: string
  description?: string
  images: string[]
  date: Date
  location?: string
  tags: string[]
  isSpecial: boolean
}

// Secrets Management Types
export interface Secret {
  id: string
  title: string
  type: 'password' | 'credit_card' | 'bank_account' | 'identity' | 'secure_note'
  website?: string
  username?: string
  password: string
  notes?: string
  customFields?: { key: string; value: string }[]
  createdAt: Date
  lastAccessed: Date
}

// Freelancing Types
export interface FreelanceProject {
  id: string
  title: string
  client: string
  description?: string
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled'
  hourlyRate: number
  estimatedHours: number
  actualHours: number
  deadline?: Date
  budget?: number
  createdAt: Date
  tasks: ProjectTask[]
  documents: ProjectDocument[]
}

export interface ProjectTask {
  id: string
  projectId: string
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  estimatedHours?: number
  actualHours?: number
  deadline?: Date
  createdAt: Date
}

export interface TimeEntry {
  id: string
  projectId: string
  date: Date
  hours: number
  description: string
  billable: boolean
}

export interface Note {
  id: string
  content: string
  reminderDate?: Date
  isCompleted: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ProjectDocument {
  id: string
  projectId: string
  name: string
  type: string
  size: number
  uploadedAt: Date
  url: string
}
