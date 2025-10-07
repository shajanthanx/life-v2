'use client'

import { useState, useEffect, useMemo } from 'react'
import { LoginForm } from './auth/login-form'
import { MainLayout } from './layout/main-layout'
import { DashboardView } from './dashboard/dashboard-view'
import { ProductivityView } from './productivity/productivity-view'
import { GoalsPage } from './goals/goals-page'
import { TasksPage } from './tasks/tasks-page'
import { HabitsPage } from './habits/habits-page'
import { NotesPage } from './notes/notes-page'
import { HealthView } from './health/health-view'
import { FinanceView } from './finance/finance-view'
import { LifestyleView } from './lifestyle/lifestyle-view'
import { AnalyticsView } from './analytics/analytics-view'
import { VisualizationBoard } from './visualization/visualization-board'
import { GiftPlanning } from './gifts/gift-planning'
import { BadHabitsTracker } from './habits/bad-habits-tracker'
import { IncomeManagement } from './income/income-management'
import { GratitudeLog } from './gratitude/gratitude-log'
import { SettingsView } from './settings/settings-view'
import { GlobalSearch } from './search/global-search'
import { NotificationCenter } from './notifications/notification-center'
import { ProgressPhotos } from './progress/progress-photos'
import { MemoriesView } from './memories/memories-view'
import { BadHabitsView } from './bad-habits/bad-habits-view'
import { SecretsManager } from './secrets/secrets-manager'
import { FreelancingView } from './freelancing/freelancing-view'
import { ToastProvider, useToast } from '@/hooks/use-toast'
import { SettingsProvider } from '@/contexts/settings-context'
import { AddTaskModal } from './modals/add-task-modal'
import { EditTaskModal } from './modals/edit-task-modal'
import { EditHabitModal } from './modals/edit-habit-modal'
import { EditJournalModal } from './modals/edit-journal-modal'
import { AddGoalModal } from './modals/add-goal-modal'
import { EditGoalModal } from './modals/edit-goal-modal'
import { createGoal, updateGoal, deleteGoal } from '@/lib/api/goals'
import { createTask, updateTask, deleteTask } from '@/lib/api/tasks'
import { createHabit, updateHabit, deleteHabit } from '@/lib/api/habits'
import { createJournalEntry, updateJournalEntry, deleteJournalEntry } from '@/lib/api/journal'
import { createTransaction } from '@/lib/api/transactions'
import { createSavingsGoal } from '@/lib/api/savings-goals'
import { createVisualization } from '@/lib/api/visualizations'
import { createMemory } from '@/lib/api/memories'
import { createProgressPhoto, updateProgressPhoto, deleteProgressPhoto } from '@/lib/api/progress-photos'
import { createSleepRecord, createExerciseRecord, createNutritionRecord } from '@/lib/api/health'
import { createSecret, updateSecret, deleteSecret } from '@/lib/api/secrets'
import { createBook } from '@/lib/api/books'
import { createMovie } from '@/lib/api/movies'
import { AuthDebug } from './auth-debug'
import { AddExpenseModal } from './modals/add-expense-modal'
import { LogHabitModal } from './modals/log-habit-modal'
import { AddJournalModal } from './modals/add-journal-modal'
import { AddHealthModal } from './modals/add-health-modal'
import { AddHabitModal } from './modals/add-habit-modal'
import { AddSavingsGoalModal } from './modals/add-savings-goal-modal'
import { AddVisualizationModal } from './modals/add-visualization-modal'
import { AddGiftModal } from './modals/add-gift-modal'
import { AddIncomeSourceModal } from './modals/add-income-source-modal'
import { AddEventModal } from './modals/add-event-modal'
import { AddMovieModal } from './modals/add-movie-modal'
import { AddBookModal } from './modals/add-book-modal'
import { AddBadHabitModal } from './modals/add-bad-habit-modal'
import { authService } from '@/lib/auth'
import { databaseService } from '@/lib/database'
import { AppState, Goal, Task, Habit, JournalEntry } from '@/types'

const getTabTitle = (tab: string) => {
  switch (tab) {
    case 'dashboard':
      return 'Home'
    case 'goals':
      return 'Goals'
    case 'tasks':
      return 'Tasks'
    case 'habits':
      return 'Habits'
    case 'notes':
      return 'Quick Notes'
    case 'productivity':
      return 'Goals & Productivity'
    case 'health':
      return 'Health & Wellness'
    case 'finance':
      return 'Finance & Budget'
    case 'lifestyle':
      return 'Lifestyle'
    case 'visualization':
      return 'Vision Board'
    case 'gifts':
      return 'Gift Planning'
    case 'analytics':
      return 'Analytics'
    case 'progress':
      return 'Progress Photos'
    case 'memories':
      return 'Memories'
    case 'badhabits':
      return 'Bad Habits'
    case 'secrets':
      return 'Secrets Manager'
    case 'freelancing':
      return 'Freelancing'
    case 'settings':
      return 'Settings'
    default:
      return 'Dashboard'
  }
}

const getTabSubtitle = (tab: string) => {
  switch (tab) {
    case 'dashboard':
      return 'Your personal life overview'
    case 'goals':
      return 'Track your progress towards achieving your dreams'
    case 'tasks':
      return 'Manage your daily tasks and to-dos'
    case 'habits':
      return 'Build positive habits for a better life'
    case 'notes':
      return 'Capture quick thoughts and set reminders'
    case 'productivity':
      return 'Goals, tasks, and habit management'
    case 'health':
      return 'Monitor your physical and mental wellbeing'
    case 'finance':
      return 'Track spending, budgets, and savings'
    case 'lifestyle':
      return 'Journal, entertainment, and personal interests'
    case 'visualization':
      return 'Visualize your dreams and aspirations'
    case 'gifts':
      return 'Plan thoughtful gifts and events'
    case 'analytics':
      return 'Insights and progress reports'
    case 'progress':
      return 'Weekly progress photo tracking'
    case 'memories':
      return 'Capture and preserve special moments'
    case 'badhabits':
      return 'Track and reduce negative habits'
    case 'secrets':
      return 'Secure password and data management'
    case 'freelancing':
      return 'Projects, time tracking, and client management'
    case 'settings':
      return 'App preferences and data management'
    default:
      return 'Your personal life overview'
  }
}

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [appData, setAppData] = useState<AppState | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { addToast } = useToast()
  
  // Modal states
  const [showAddTaskModal, setShowAddTaskModal] = useState(false)
  const [showEditTaskModal, setShowEditTaskModal] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [showAddGoalModal, setShowAddGoalModal] = useState(false)
  const [showEditGoalModal, setShowEditGoalModal] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false)
  const [showLogHabitModal, setShowLogHabitModal] = useState(false)
  const [showAddJournalModal, setShowAddJournalModal] = useState(false)
  const [showEditJournalModal, setShowEditJournalModal] = useState(false)
  const [editingJournalEntry, setEditingJournalEntry] = useState<JournalEntry | null>(null)
  const [showAddHealthModal, setShowAddHealthModal] = useState(false)
  const [showAddHabitModal, setShowAddHabitModal] = useState(false)
  const [showEditHabitModal, setShowEditHabitModal] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [showAddSavingsGoalModal, setShowAddSavingsGoalModal] = useState(false)
  const [showAddVisualizationModal, setShowAddVisualizationModal] = useState(false)
  const [showAddGiftModal, setShowAddGiftModal] = useState(false)
  const [showAddIncomeSourceModal, setShowAddIncomeSourceModal] = useState(false)
  const [showAddEventModal, setShowAddEventModal] = useState(false)
  const [showAddMovieModal, setShowAddMovieModal] = useState(false)
  const [showAddBookModal, setShowAddBookModal] = useState(false)
  const [showAddBadHabitModal, setShowAddBadHabitModal] = useState(false)
  const [showGlobalSearch, setShowGlobalSearch] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  useEffect(() => {
    // Wait for auth initialization and set up auth listener
    const initializeApp = async () => {
      await authService.waitForInitialization()
      
      const user = authService.getCurrentUser()
      setIsAuthenticated(!!user)

      // Load app data
      const data = await databaseService.loadData()
      setAppData(data)
      setIsLoading(false)
    }

    // Set up auth state listener
    const unsubscribe = authService.onAuthChange((user) => {
      console.log('Auth change detected:', user?.email || 'logged out')
      setIsAuthenticated(!!user)
      
      if (user) {
        // User logged in, reload data
        databaseService.loadData().then(setAppData)
      } else {
        // User logged out, clear data
        setAppData(databaseService.getInitialData())
      }
    })

    initializeApp()

    // Cleanup listener on unmount
    return () => {
      unsubscribe()
    }
  }, [])

  const handleLoginSuccess = async () => {
    setIsAuthenticated(true)
    const data = await databaseService.loadData()
    setAppData(data)
  }

  // Replace bulk data updates with individual API calls
  const handleDataUpdate = (newData: AppState) => {
    // This method is kept for compatibility but should be replaced with individual API calls
    setAppData(newData)
  }

  // Helper function to reload data from the database
  const reloadData = async () => {
    try {
      const data = await databaseService.loadData()
      setAppData(data)
    } catch (error) {
      console.error('Failed to reload data:', error)
      addToast({
        type: 'error',
        title: 'Database Error',
        message: 'Failed to reload data from database'
      })
    }
  }

  const handleDataExport = () => {
    if (appData) {
      const dataStr = JSON.stringify(appData, null, 2)
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
      const exportFileDefaultName = `life-manager-backup-${new Date().toISOString().split('T')[0]}.json`
      
      const linkElement = document.createElement('a')
      linkElement.setAttribute('href', dataUri)
      linkElement.setAttribute('download', exportFileDefaultName)
      linkElement.click()
    }
  }

  const handleDataImport = (importedData: AppState) => {
    setAppData(importedData)
    databaseService.saveData(importedData)
  }

  const handleDataReset = () => {
    const freshData = databaseService.getInitialData()
    setAppData(freshData)
    databaseService.saveData(freshData)
  }

  const handleSearchNavigation = (tab: string, subtab?: string) => {
    setActiveTab(tab)
    // TODO: Could implement subtab navigation within components
  }

  const handleGoalEdit = (goal: Goal) => {
    setEditingGoal(goal)
    setShowEditGoalModal(true)
  }

  const handleGoalDelete = async (goalId: string) => {
    const result = await deleteGoal(goalId)
    if (result.error) {
      addToast({
        type: 'error',
        title: 'Error',
        message: result.error
      })
    } else {
      // Reload data to get updated goals list
      const updatedData = await databaseService.loadData()
      setAppData(updatedData)
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Goal deleted successfully!'
      })
    }
  }

  const handleTaskEdit = (task: Task) => {
    setEditingTask(task)
    setShowEditTaskModal(true)
  }

  const handleTaskDelete = async (taskId: string) => {
    const result = await deleteTask(taskId)
    if (result.error) {
      addToast({
        type: 'error',
        title: 'Error',
        message: result.error
      })
    } else {
      // Reload data to get updated tasks list
      const updatedData = await databaseService.loadData()
      setAppData(updatedData)
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Task deleted successfully!'
      })
    }
  }

  const handleHabitEdit = (habit: Habit) => {
    setEditingHabit(habit)
    setShowEditHabitModal(true)
  }

  const handleHabitDelete = async (habitId: string) => {
    const result = await deleteHabit(habitId)
    if (result.error) {
      addToast({
        type: 'error',
        title: 'Error',
        message: result.error
      })
    } else {
      // Reload data to get updated habits list
      const updatedData = await databaseService.loadData()
      setAppData(updatedData)
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Habit deleted successfully!'
      })
    }
  }

  const handleJournalEdit = (entry: JournalEntry) => {
    setEditingJournalEntry(entry)
    setShowEditJournalModal(true)
  }

  const handleJournalDelete = async (entryId: string) => {
    const result = await deleteJournalEntry(entryId)
    if (result.error) {
      addToast({
        type: 'error',
        title: 'Error',
        message: result.error
      })
    } else {
      // Reload data to get updated journal entries list
      const updatedData = await databaseService.loadData()
      setAppData(updatedData)
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Journal entry deleted successfully!'
      })
    }
  }

  // Calculate notification count
  const notificationCount = useMemo(() => {
    if (!appData) return 0
    
    let count = 0
    const today = new Date()
    
    // Count overdue tasks and goals
    appData.tasks?.forEach(task => {
      if (!task.isCompleted && task.dueDate && new Date(task.dueDate) < today) {
        count++
      }
    })
    
    appData.goals?.forEach(goal => {
      if (!goal.isCompleted && goal.deadline && new Date(goal.deadline) < today) {
        count++
      }
    })
    
    // Count budget alerts
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()
    const monthlyBudgets = appData.budgets?.filter(b => b.month === currentMonth && b.year === currentYear) || []
    
    monthlyBudgets.forEach(budget => {
      const percentage = (budget.spent / budget.allocated) * 100
      if (percentage >= 90) {
        count++
      }
    })
    
    return count
  }, [appData])

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setShowGlobalSearch(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'add-task':
        setShowAddTaskModal(true)
        break
      case 'log-habit':
        setShowLogHabitModal(true)
        break
      case 'add-expense':
        setShowAddExpenseModal(true)
        break
      case 'journal-entry':
        setShowAddJournalModal(true)
        break
      case 'set-goal':
        setShowAddGoalModal(true)
        break
      case 'health-log':
        setShowAddHealthModal(true)
        break
      default:
        console.log('Unknown quick action:', action)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />
  }

  if (!appData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">Failed to load application data</p>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div>
            <DashboardView
              data={appData}
              onQuickAction={handleQuickAction}
              onNavigateToFinance={() => setActiveView('finance')}
              onAddTransaction={async (transaction) => {
                const result = await createTransaction(transaction)
                if (result.error) {
                  addToast({
                    type: 'error',
                    title: 'Error',
                    message: result.error
                  })
                } else {
                  await reloadData()
                  addToast({
                    type: 'success',
                    message: 'Transaction added successfully!'
                  })
                }
              }}
            />
          </div>
        )
      case 'goals':
        return (
          <GoalsPage 
            data={appData}
            onDataUpdate={handleDataUpdate}
            onAddGoal={() => setShowAddGoalModal(true)}
            onGoalEdit={handleGoalEdit}
            onGoalDelete={handleGoalDelete}
          />
        )
      case 'tasks':
        return (
          <TasksPage 
            data={appData}
            onDataUpdate={handleDataUpdate}
            onAddTask={() => setShowAddTaskModal(true)}
            onTaskEdit={handleTaskEdit}
            onTaskDelete={handleTaskDelete}
          />
        )
      case 'habits':
        return (
          <HabitsPage 
            data={appData}
            onDataUpdate={handleDataUpdate}
            onAddHabit={() => setShowAddHabitModal(true)}
            onHabitEdit={handleHabitEdit}
            onHabitDelete={handleHabitDelete}
          />
        )
      case 'notes':
        return <NotesPage />
      case 'productivity':
        return (
          <ProductivityView 
            data={appData}
            onDataUpdate={handleDataUpdate}
            onAddGoal={() => setShowAddGoalModal(true)}
            onGoalEdit={handleGoalEdit}
            onGoalDelete={handleGoalDelete}
            onAddTask={() => setShowAddTaskModal(true)}
            onTaskEdit={handleTaskEdit}
            onTaskDelete={handleTaskDelete}
            onAddHabit={() => setShowAddHabitModal(true)}
            onHabitEdit={handleHabitEdit}
            onHabitDelete={handleHabitDelete}
          />
        )
      case 'health':
        return (
          <HealthView 
            data={appData}
            onDataUpdate={handleDataUpdate}
            onAddHealth={() => setShowAddHealthModal(true)}
          />
        )
      case 'finance':
        return (
          <FinanceView 
            data={appData}
            onDataUpdate={handleDataUpdate}
            onAddTransaction={() => setShowAddExpenseModal(true)}
            onAddSavingsGoal={() => setShowAddSavingsGoalModal(true)}
            onAddIncomeSource={() => setShowAddIncomeSourceModal(true)}
          />
        )
      case 'lifestyle':
        return (
          <LifestyleView 
            data={appData}
            onDataUpdate={handleDataUpdate}
            onAddJournalEntry={() => setShowAddJournalModal(true)}
            onJournalEdit={handleJournalEdit}
            onJournalDelete={handleJournalDelete}
            onAddBook={() => setShowAddBookModal(true)}
            onAddMovie={() => setShowAddMovieModal(true)}
          />
        )
      case 'visualization':
        return (
          <VisualizationBoard
            visualizations={appData.visualizations}
            onAddVisualization={() => setShowAddVisualizationModal(true)}
            onUpdateVisualization={(viz) => {
              const updated = appData.visualizations.map(v => v.id === viz.id ? viz : v)
              handleDataUpdate({ ...appData, visualizations: updated })
            }}
          />
        )
      case 'gifts':
        return (
          <GiftPlanning
            gifts={appData.gifts}
            events={appData.events}
            onAddGift={() => setShowAddGiftModal(true)}
            onAddEvent={() => setShowAddEventModal(true)}
            onUpdateGift={(gift) => {
              const updated = appData.gifts.map(g => g.id === gift.id ? gift : g)
              handleDataUpdate({ ...appData, gifts: updated })
            }}
            onUpdateEvent={(event) => {
              const updated = appData.events.map(e => e.id === event.id ? event : e)
              handleDataUpdate({ ...appData, events: updated })
            }}
          />
        )
      case 'badhabits':
        return (
          <BadHabitsView
            data={appData}
            onDataUpdate={handleDataUpdate}
            onAddBadHabit={() => setShowAddBadHabitModal(true)}
          />
        )
      case 'secrets':
        return (
          <SecretsManager
            secrets={appData.secrets}
            onAddSecret={async (secret) => {
              const result = await createSecret(secret)
              if (result.error) {
                addToast({
                  type: 'error',
                  title: 'Error',
                  message: result.error
                })
              } else {
                await reloadData()
                addToast({
                  type: 'success',
                  message: 'Secret saved securely!'
                })
              }
            }}
            onUpdateSecret={async (secret) => {
              const result = await updateSecret(secret.id, secret)
              if (result.error) {
                addToast({
                  type: 'error',
                  title: 'Error',
                  message: result.error
                })
              } else {
                await reloadData()
                addToast({
                  type: 'success',
                  message: 'Secret updated successfully!'
                })
              }
            }}
            onDeleteSecret={async (id) => {
              const result = await deleteSecret(id)
              if (result.error) {
                addToast({
                  type: 'error',
                  title: 'Error',
                  message: result.error
                })
              } else {
                await reloadData()
                addToast({
                  type: 'success',
                  message: 'Secret deleted successfully!'
                })
              }
            }}
          />
        )
      case 'freelancing':
        return (
          <FreelancingView
            projects={appData.freelanceProjects}
            timeEntries={appData.timeEntries}
            onAddProject={(project) => {
              const newProject = { ...project, id: Date.now().toString() }
              handleDataUpdate({
                ...appData,
                freelanceProjects: [...appData.freelanceProjects, newProject]
              })
            }}
            onUpdateProject={(project) => {
              const updated = appData.freelanceProjects.map(p => p.id === project.id ? project : p)
              handleDataUpdate({ ...appData, freelanceProjects: updated })
            }}
            onAddTimeEntry={(entry) => {
              const newEntry = { ...entry, id: Date.now().toString() }
              handleDataUpdate({
                ...appData,
                timeEntries: [...appData.timeEntries, newEntry]
              })
            }}
            onAddTask={(task) => {
              const newTask = { ...task, id: Date.now().toString() }
              // This would need to be implemented to add task to specific project
              addToast({
                type: 'info',
                message: 'Task management will be enhanced in future updates'
              })
            }}
          />
        )
      case 'analytics':
        return (
          <AnalyticsView data={appData} />
        )
      case 'progress':
        return (
          <ProgressPhotos
            photos={appData.progressPhotos}
            onAddPhoto={async (photo) => {
              const result = await createProgressPhoto(photo)
              if (result.error) {
                addToast({
                  type: 'error',
                  title: 'Error',
                  message: result.error
                })
              } else if (result.data) {
                await reloadData()
                addToast({
                  type: 'success',
                  message: 'Progress photo added successfully!'
                })
              }
            }}
            onUpdatePhoto={async (photo) => {
              const result = await updateProgressPhoto(photo.id, photo)
              if (result.error) {
                addToast({
                  type: 'error',
                  title: 'Error',
                  message: result.error
                })
              } else if (result.data) {
                await reloadData()
                addToast({
                  type: 'success',
                  message: 'Progress photo updated successfully!'
                })
              }
            }}
            onDeletePhoto={async (id) => {
              const result = await deleteProgressPhoto(id)
              if (result.error) {
                addToast({
                  type: 'error',
                  title: 'Error',
                  message: result.error
                })
              } else {
                await reloadData()
                addToast({
                  type: 'success',
                  message: 'Progress photo deleted successfully!'
                })
              }
            }}
          />
        )
      case 'memories':
        return (
          <MemoriesView
            memories={appData.memories}
            onAddMemory={async (memory) => {
              const result = await createMemory(memory)
              if (result.error) {
                addToast({
                  type: 'error',
                  title: 'Error',
                  message: result.error
                })
              } else if (result.data) {
                await reloadData()
                addToast({
                  type: 'success',
                  message: 'Memory created successfully!'
                })
              }
            }}
            onUpdateMemory={(memory) => {
              // TODO: Implement updateMemory API call
              const updated = appData.memories.map(m => m.id === memory.id ? memory : m)
              handleDataUpdate({ ...appData, memories: updated })
            }}
          />
        )
      case 'settings':
        return (
          <SettingsView
            onDataExport={handleDataExport}
            onDataImport={handleDataImport}
            onDataReset={handleDataReset}
          />
        )
      default:
        return (
          <DashboardView
            data={appData}
            onQuickAction={handleQuickAction}
            onNavigateToFinance={() => setActiveView('finance')}
            onAddTransaction={async (transaction) => {
              const result = await createTransaction(transaction)
              if (result.error) {
                addToast({
                  type: 'error',
                  title: 'Error',
                  message: result.error
                })
              } else {
                await reloadData()
                addToast({
                  type: 'success',
                  message: 'Transaction added successfully!'
                })
              }
            }}
          />
        )
    }
  }

  return (
    <>
      <MainLayout
        activeTab={activeTab}
        onTabChange={setActiveTab}
        title={getTabTitle(activeTab)}
        subtitle={getTabSubtitle(activeTab)}
        onSearchClick={() => setShowGlobalSearch(true)}
        onNotificationClick={() => setShowNotifications(true)}
        notificationCount={notificationCount}
      >
        {renderContent()}
      </MainLayout>

      {/* Modals */}
      <AddTaskModal
        isOpen={showAddTaskModal}
        onClose={() => setShowAddTaskModal(false)}
                onSubmit={async (task) => {
          const result = await createTask(task)
          if (result.error) {
            addToast({
              type: 'error',
              title: 'Error',
              message: result.error
            })
          } else if (result.data) {
            // Reload data to get the updated tasks list
            const updatedData = await databaseService.loadData()
            setAppData(updatedData)
            addToast({
              type: 'success',
              title: 'Success',
              message: 'Task created successfully!'
            })
          }
          setShowAddTaskModal(false)
        }}
      />

      <EditTaskModal
        isOpen={showEditTaskModal}
        onClose={() => {
          setShowEditTaskModal(false)
          setEditingTask(null)
        }}
        task={editingTask}
        onSubmit={async (task) => {
          const result = await updateTask(task.id, task)
          if (result.error) {
            addToast({
              type: 'error',
              title: 'Error',
              message: result.error
            })
          } else if (result.data) {
            // Reload data to get the updated tasks list
            const updatedData = await databaseService.loadData()
            setAppData(updatedData)
            addToast({
              type: 'success',
              title: 'Success',
              message: 'Task updated successfully!'
            })
          }
          setShowEditTaskModal(false)
          setEditingTask(null)
        }}
      />

      <AddGoalModal
        isOpen={showAddGoalModal}
        onClose={() => setShowAddGoalModal(false)}
        onSubmit={async (goal) => {
          const result = await createGoal(goal)
          if (result.error) {
            addToast({
              type: 'error',
              title: 'Error',
              message: result.error
            })
          } else if (result.data) {
            // Reload data to get the updated goals list
            const updatedData = await databaseService.loadData()
            setAppData(updatedData)
            addToast({
              type: 'success',
              title: 'Success',
              message: 'Goal created successfully!'
            })
          }
          setShowAddGoalModal(false)
        }}
      />

      <EditGoalModal
        isOpen={showEditGoalModal}
        onClose={() => {
          setShowEditGoalModal(false)
          setEditingGoal(null)
        }}
        goal={editingGoal}
        onSubmit={async (goal) => {
          const result = await updateGoal(goal.id, goal)
          if (result.error) {
            addToast({
              type: 'error',
              title: 'Error',
              message: result.error
            })
          } else if (result.data) {
            // Reload data to get the updated goals list
            const updatedData = await databaseService.loadData()
            setAppData(updatedData)
            addToast({
              type: 'success',
              title: 'Success',
              message: 'Goal updated successfully!'
            })
          }
          setShowEditGoalModal(false)
          setEditingGoal(null)
        }}
      />

      <AddExpenseModal
        isOpen={showAddExpenseModal}
        onClose={() => setShowAddExpenseModal(false)}
        onSubmit={async (transaction) => {
          const result = await createTransaction(transaction)
          if (result.error) {
            addToast({
              type: 'error',
              title: 'Error',
              message: result.error
            })
          } else if (result.data) {
            // Reload data to get the updated transactions list
            await reloadData()
            addToast({
              type: 'success',
              message: 'Transaction added successfully!'
            })
          }
          setShowAddExpenseModal(false)
        }}
      />

      <LogHabitModal
        isOpen={showLogHabitModal}
        onClose={() => setShowLogHabitModal(false)}
        habits={appData?.habits || []}
        onLogHabit={(habitId, record) => {
          const newRecord = { ...record, id: Date.now().toString(), habitId }
          const updatedHabits = appData!.habits.map(habit => 
            habit.id === habitId 
              ? { ...habit, records: [newRecord, ...habit.records] }
              : habit
          )
          handleDataUpdate({
            ...appData!,
            habits: updatedHabits
          })
          setShowLogHabitModal(false)
          addToast({
            type: 'success',
            message: 'Habit logged successfully!'
          })
        }}
      />

      <AddJournalModal
        isOpen={showAddJournalModal}
        onClose={() => setShowAddJournalModal(false)}
        onSubmit={async (entry) => {
          const result = await createJournalEntry(entry)
          if (result.error) {
            addToast({
              type: 'error',
              title: 'Error',
              message: result.error
            })
          } else if (result.data) {
            // Reload data to get the updated journal entries list
            await reloadData()
            addToast({
              type: 'success',
              message: 'Journal entry added successfully!'
            })
          }
          setShowAddJournalModal(false)
        }}
      />

      <EditJournalModal
        isOpen={showEditJournalModal}
        onClose={() => {
          setShowEditJournalModal(false)
          setEditingJournalEntry(null)
        }}
        entry={editingJournalEntry}
        onSubmit={async (entry) => {
          const result = await updateJournalEntry(entry.id, entry)
          if (result.error) {
            addToast({
              type: 'error',
              title: 'Error',
              message: result.error
            })
          } else if (result.data) {
            // Reload data to get the updated journal entries list
            const updatedData = await databaseService.loadData()
            setAppData(updatedData)
            addToast({
              type: 'success',
              title: 'Success',
              message: 'Journal entry updated successfully!'
            })
          }
          setShowEditJournalModal(false)
          setEditingJournalEntry(null)
        }}
      />

      <AddHealthModal
        isOpen={showAddHealthModal}
        onClose={() => setShowAddHealthModal(false)}
        onSubmitSleep={async (record) => {
          const result = await createSleepRecord(record)
          if (result.error) {
            addToast({
              type: 'error',
              title: 'Error',
              message: result.error
            })
          } else if (result.data) {
            await reloadData()
            addToast({
              type: 'success',
              message: 'Sleep data logged successfully!'
            })
          }
          setShowAddHealthModal(false)
        }}
        onSubmitExercise={async (record) => {
          const result = await createExerciseRecord(record)
          if (result.error) {
            addToast({
              type: 'error',
              title: 'Error',
              message: result.error
            })
          } else if (result.data) {
            await reloadData()
            addToast({
              type: 'success',
              message: 'Exercise logged successfully!'
            })
          }
          setShowAddHealthModal(false)
        }}
        onSubmitNutrition={async (record) => {
          const result = await createNutritionRecord(record)
          if (result.error) {
            addToast({
              type: 'error',
              title: 'Error',
              message: result.error
            })
          } else if (result.data) {
            await reloadData()
            addToast({
              type: 'success',
              message: 'Nutrition logged successfully!'
            })
          }
          setShowAddHealthModal(false)
        }}
      />

      <AddHabitModal
        isOpen={showAddHabitModal}
        onClose={() => setShowAddHabitModal(false)}
        onSubmit={async (habit) => {
          const result = await createHabit(habit)
          if (result.error) {
            addToast({
              type: 'error',
              title: 'Error',
              message: result.error
            })
          } else if (result.data) {
            // Reload data to get the updated habits list
            await reloadData()
            addToast({
              type: 'success',
              message: 'Habit created successfully!'
            })
          }
          setShowAddHabitModal(false)
        }}
      />

      <EditHabitModal
        isOpen={showEditHabitModal}
        onClose={() => {
          setShowEditHabitModal(false)
          setEditingHabit(null)
        }}
        habit={editingHabit}
        onSubmit={async (habit) => {
          const result = await updateHabit(habit.id, habit)
          if (result.error) {
            addToast({
              type: 'error',
              title: 'Error',
              message: result.error
            })
          } else if (result.data) {
            // Reload data to get the updated habits list
            const updatedData = await databaseService.loadData()
            setAppData(updatedData)
            addToast({
              type: 'success',
              title: 'Success',
              message: 'Habit updated successfully!'
            })
          }
          setShowEditHabitModal(false)
          setEditingHabit(null)
        }}
      />

      <AddSavingsGoalModal
        isOpen={showAddSavingsGoalModal}
        onClose={() => setShowAddSavingsGoalModal(false)}
        onSubmit={async (goal) => {
          const result = await createSavingsGoal(goal)
          if (result.error) {
            addToast({
              type: 'error',
              title: 'Error',
              message: result.error
            })
          } else if (result.data) {
            await reloadData()
            addToast({
              type: 'success',
              message: 'Savings goal created successfully!'
            })
          }
          setShowAddSavingsGoalModal(false)
        }}
      />

      <AddVisualizationModal
        isOpen={showAddVisualizationModal}
        onClose={() => setShowAddVisualizationModal(false)}
        onSubmit={async (visualization) => {
          const result = await createVisualization(visualization)
          if (result.error) {
            addToast({
              type: 'error',
              title: 'Error',
              message: result.error
            })
          } else if (result.data) {
            await reloadData()
            addToast({
              type: 'success',
              message: 'Visualization created successfully!'
            })
          }
          setShowAddVisualizationModal(false)
        }}
      />

      <AddGiftModal
        isOpen={showAddGiftModal}
        onClose={() => setShowAddGiftModal(false)}
        onSubmit={(gift) => {
          const newGift = { ...gift, id: Date.now().toString() }
          handleDataUpdate({
            ...appData!,
            gifts: [...appData!.gifts, newGift]
          })
          setShowAddGiftModal(false)
          addToast({
            type: 'success',
            message: 'Gift planned successfully!'
          })
        }}
      />

      <AddIncomeSourceModal
        isOpen={showAddIncomeSourceModal}
        onClose={() => setShowAddIncomeSourceModal(false)}
        onSubmit={(source) => {
          const newSource = { ...source, id: Date.now().toString() }
          handleDataUpdate({
            ...appData!,
            incomeSources: [...appData!.incomeSources, newSource]
          })
          setShowAddIncomeSourceModal(false)
          addToast({
            type: 'success',
            message: 'Income source added successfully!'
          })
        }}
      />

      <AddEventModal
        isOpen={showAddEventModal}
        onClose={() => setShowAddEventModal(false)}
        onSubmit={(event) => {
          const newEvent = { ...event, id: Date.now().toString() }
          handleDataUpdate({
            ...appData!,
            events: [...appData!.events, newEvent]
          })
          setShowAddEventModal(false)
          addToast({
            type: 'success',
            message: 'Event planned successfully!'
          })
        }}
      />

      <AddMovieModal
        isOpen={showAddMovieModal}
        onClose={() => setShowAddMovieModal(false)}
        onSubmit={async (movie) => {
          const result = await createMovie(movie)
          if (result.error) {
            addToast({
              type: 'error',
              title: 'Error',
              message: result.error
            })
          } else if (result.data) {
            await reloadData()
            addToast({
              type: 'success',
              message: 'Movie added successfully!'
            })
          }
          setShowAddMovieModal(false)
        }}
      />

      <AddBookModal
        isOpen={showAddBookModal}
        onClose={() => setShowAddBookModal(false)}
        onSubmit={async (book) => {
          const result = await createBook(book)
          if (result.error) {
            addToast({
              type: 'error',
              title: 'Error',
              message: result.error
            })
          } else if (result.data) {
            await reloadData()
            addToast({
              type: 'success',
              message: 'Book added successfully!'
            })
          }
          setShowAddBookModal(false)
        }}
      />

      <AddBadHabitModal
        isOpen={showAddBadHabitModal}
        onClose={() => setShowAddBadHabitModal(false)}
        onSubmit={(badHabit) => {
          const newBadHabit = { ...badHabit, id: Date.now().toString() }
          handleDataUpdate({
            ...appData!,
            badHabits: [...appData!.badHabits, newBadHabit]
          })
          setShowAddBadHabitModal(false)
          addToast({
            type: 'success',
            message: 'Bad habit tracking started successfully!'
          })
        }}
      />

      {/* Global Search */}
      <GlobalSearch
        data={appData!}
        onNavigate={handleSearchNavigation}
        isOpen={showGlobalSearch}
        onClose={() => setShowGlobalSearch(false)}
      />

      {/* Notifications */}
      <NotificationCenter
        data={appData!}
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        onNavigate={(tab) => {
          setActiveTab(tab)
          setShowNotifications(false)
        }}
      />
    </>
  )
}

export function App() {
  return (
    <ToastProvider>
      <SettingsProvider>
        <AppContent />
      </SettingsProvider>
    </ToastProvider>
  )
}
