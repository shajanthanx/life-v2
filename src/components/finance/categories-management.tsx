'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Category } from '@/types'
import { Plus, Edit2, Trash2, DollarSign, TrendingUp, TrendingDown, Palette } from 'lucide-react'
import { createCategory, updateCategory, deleteCategory, getCategoryUsageStats } from '@/lib/api/categories'

interface CategoriesManagementProps {
  categories: Category[]
  onUpdateCategories: (categories: Category[]) => void
}

interface CategoryFormData {
  name: string
  type: 'income' | 'expense'
  icon: string
  color: string
}

const DEFAULT_ICONS = {
  expense: ['🍽️', '🚗', '🏠', '⚡', '🏥', '🎬', '🛍️', '📚', '💄', '📱', '🛡️', '📝'],
  income: ['💼', '💻', '🏢', '📈', '🎁', '🎉', '💰', '📊']
}

const DEFAULT_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e',
  '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#6b7280'
]

export function CategoriesManagement({ categories, onUpdateCategories }: CategoriesManagementProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    type: 'expense',
    icon: '📝',
    color: '#6b7280'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all')

  const filteredCategories = categories.filter(category => 
    filter === 'all' || category.type === filter
  )

  const expenseCategories = categories.filter(c => c.type === 'expense')
  const incomeCategories = categories.filter(c => c.type === 'income')

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category)
      setFormData({
        name: category.name,
        type: category.type,
        icon: category.icon || '📝',
        color: category.color || '#6b7280'
      })
    } else {
      setEditingCategory(null)
      setFormData({
        name: '',
        type: 'expense',
        icon: '📝',
        color: '#6b7280'
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingCategory(null)
    setFormData({
      name: '',
      type: 'expense',
      icon: '📝',
      color: '#6b7280'
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    setIsLoading(true)
    try {
      if (editingCategory) {
        // Update existing category
        const { data, error } = await updateCategory(editingCategory.id, {
          name: formData.name,
          type: formData.type,
          icon: formData.icon,
          color: formData.color,
          isDefault: editingCategory.isDefault,
          createdAt: editingCategory.createdAt
        })

        if (error) {
          console.error('Error updating category:', error)
          return
        }

        if (data) {
          const updatedCategories = categories.map(cat => 
            cat.id === editingCategory.id ? data : cat
          )
          onUpdateCategories(updatedCategories)
        }
      } else {
        // Create new category
        const { data, error } = await createCategory({
          name: formData.name,
          type: formData.type,
          isDefault: false,
          icon: formData.icon,
          color: formData.color
        })

        if (error) {
          console.error('Error creating category:', error)
          return
        }

        if (data) {
          onUpdateCategories([...categories, data])
        }
      }

      handleCloseModal()
    } catch (error) {
      console.error('Error saving category:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (category: Category) => {
    if (!confirm(`Are you sure you want to delete "${category.name}"? This cannot be undone.`)) {
      return
    }

    setIsLoading(true)
    try {
      // Check usage first
      const { data: usage, error: usageError } = await getCategoryUsageStats(category.id)
      
      if (usageError) {
        console.error('Error checking category usage:', usageError)
        return
      }

      if (usage && (usage.transactionCount > 0 || usage.predefinedExpenseCount > 0)) {
        alert(`Cannot delete "${category.name}" because it's being used by ${usage.transactionCount} transaction(s) and ${usage.predefinedExpenseCount} predefined expense(s).`)
        return
      }

      const { success, error } = await deleteCategory(category.id)

      if (error) {
        console.error('Error deleting category:', error)
        return
      }

      if (success) {
        const updatedCategories = categories.filter(cat => cat.id !== category.id)
        onUpdateCategories(updatedCategories)
      }
    } catch (error) {
      console.error('Error deleting category:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getCategoryTypeIcon = (type: string) => {
    return type === 'income' ? TrendingUp : TrendingDown
  }

  const getCategoryTypeColor = (type: string) => {
    return type === 'income' 
      ? 'text-[#17BEBB] bg-gray-50 border-[#17BEBB]' 
      : 'text-[#C41E3D] bg-gray-50 border-[#C41E3D]'
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Categories Management</h3>
          <p className="text-sm text-muted-foreground">
            Organize your income and expenses with custom categories
          </p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-[#2667FF] shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gray-50 rounded-full">
                <DollarSign className="h-5 w-5 text-[#2667FF]" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Categories</p>
                <p className="text-2xl font-bold text-[#2667FF]">{categories.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#17BEBB] shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gray-50 rounded-full">
                <TrendingUp className="h-5 w-5 text-[#17BEBB]" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Income Categories</p>
                <p className="text-2xl font-bold text-[#17BEBB]">{incomeCategories.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#C41E3D] shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gray-50 rounded-full">
                <TrendingDown className="h-5 w-5 text-[#C41E3D]" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Expense Categories</p>
                <p className="text-2xl font-bold text-[#C41E3D]">{expenseCategories.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2">
        {[
          { key: 'all', label: 'All Categories', count: categories.length },
          { key: 'income', label: 'Income', count: incomeCategories.length },
          { key: 'expense', label: 'Expenses', count: expenseCategories.length }
        ].map(({ key, label, count }) => (
          <Button
            key={key}
            variant={filter === key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(key as any)}
            className="flex items-center space-x-2"
          >
            <span>{label}</span>
            <Badge variant="secondary" className="ml-1">
              {count}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Categories List */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {filteredCategories.map((category) => {
          const TypeIcon = getCategoryTypeIcon(category.type)
          
          return (
            <Card key={category.id} className={getCategoryTypeColor(category.type)}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <div 
                      className="p-2 rounded-lg flex items-center justify-center text-lg"
                      style={{ backgroundColor: `${category.color}20`, border: `1px solid ${category.color}40` }}
                    >
                      {category.icon || '📝'}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{category.name}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <TypeIcon className="h-3 w-3" />
                        <span className="text-xs capitalize">{category.type}</span>
                        {category.isDefault && (
                          <Badge variant="outline" className="text-xs">
                            Default
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleOpenModal(category)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    {!category.isDefault && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(category)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredCategories.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              No {filter === 'all' ? '' : filter} categories found
            </h3>
            <p className="text-muted-foreground mb-4">
              Create your first category to start organizing your finances
            </p>
            <Button onClick={() => handleOpenModal()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Category Form Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                placeholder="e.g., Groceries, Salary"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Type</label>
              <select 
                className="w-full p-2 border rounded-md"
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'income' | 'expense' }))}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Icon</label>
              <div className="grid grid-cols-6 gap-2 mt-2">
                {DEFAULT_ICONS[formData.type].map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    className={`p-2 text-lg border rounded hover:bg-muted ${
                      formData.icon === icon ? 'border-[#2667FF] bg-gray-50' : ''
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, icon }))}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Color</label>
              <div className="grid grid-cols-9 gap-2 mt-2">
                {DEFAULT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded border-2 ${
                      formData.color === color ? 'border-gray-400 scale-110' : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                  />
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || !formData.name.trim()}>
                {isLoading ? 'Saving...' : editingCategory ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
