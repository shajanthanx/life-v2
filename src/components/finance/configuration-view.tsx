'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Category, PredefinedExpense, IncomeSource } from '@/types'
import { CategoriesManagement } from './categories-management'
import { PredefinedExpensesManagement } from './predefined-expenses-management'
import { IncomeManagement } from '../income/income-management'
import { Settings, DollarSign, Calendar, Briefcase } from 'lucide-react'

interface ConfigurationViewProps {
  categories: Category[]
  predefinedExpenses: PredefinedExpense[]
  incomeSources: IncomeSource[]
  onUpdateCategories: (categories: Category[]) => void
  onUpdatePredefinedExpenses: (expenses: PredefinedExpense[]) => void
  onUpdateIncomeSources: (sources: IncomeSource[]) => void
  onAddIncomeSource?: () => void
}

export function ConfigurationView({
  categories,
  predefinedExpenses,
  incomeSources,
  onUpdateCategories,
  onUpdatePredefinedExpenses,
  onUpdateIncomeSources,
  onAddIncomeSource
}: ConfigurationViewProps) {
  const [activeTab, setActiveTab] = useState('categories')

  // Calculate statistics
  const expenseCategories = categories.filter(c => c.type === 'expense')
  const incomeCategories = categories.filter(c => c.type === 'income')
  const activeExpenses = predefinedExpenses.filter(e => e.isActive)
  const activeSources = incomeSources.filter(s => s.isActive)

  const totalMonthlyPredefined = activeExpenses
    .filter(e => e.frequency === 'monthly')
    .reduce((sum, e) => sum + e.amount, 0)

  const totalYearlyPredefined = activeExpenses
    .filter(e => e.frequency === 'yearly')
    .reduce((sum, e) => sum + e.amount, 0)

  const totalWeeklyPredefined = activeExpenses
    .filter(e => e.frequency === 'weekly')
    .reduce((sum, e) => sum + e.amount, 0)

  const estimatedMonthlyExpenses = totalMonthlyPredefined + (totalYearlyPredefined / 12) + (totalWeeklyPredefined * 4.33)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Settings className="h-6 w-6 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold">Finance Configuration</h2>
            <p className="text-muted-foreground">Set up categories, income sources, and recurring expenses</p>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-[#2667FF] shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gray-50 rounded-full">
                <DollarSign className="h-5 w-5 text-[#2667FF]" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-[#2667FF]">{categories.length}</p>
                <p className="text-xs text-muted-foreground">
                  {incomeCategories.length} income • {expenseCategories.length} expense
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#17BEBB] shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gray-50 rounded-full">
                <Briefcase className="h-5 w-5 text-[#17BEBB]" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Income Sources</p>
                <p className="text-2xl font-bold text-[#17BEBB]">{activeSources.length}</p>
                <p className="text-xs text-muted-foreground">
                  {incomeSources.length - activeSources.length} inactive
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#C41E3D] shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gray-50 rounded-full">
                <Calendar className="h-5 w-5 text-[#C41E3D]" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Recurring Expenses</p>
                <p className="text-2xl font-bold text-[#C41E3D]">{activeExpenses.length}</p>
                <p className="text-xs text-muted-foreground">
                  {predefinedExpenses.length - activeExpenses.length} inactive
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#3B6064] shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gray-50 rounded-full">
                <DollarSign className="h-5 w-5 text-[#3B6064]" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Est. Monthly</p>
                <p className="text-2xl font-bold text-[#3B6064]">
                  ${estimatedMonthlyExpenses.toFixed(0)}
                </p>
                <p className="text-xs text-muted-foreground">from recurring expenses</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuration Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="categories" className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4" />
            <span>Categories</span>
            <Badge variant="secondary" className="ml-1">
              {categories.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="expenses" className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Recurring Expenses</span>
            <Badge variant="secondary" className="ml-1">
              {activeExpenses.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="income" className="flex items-center space-x-2">
            <Briefcase className="h-4 w-4" />
            <span>Income Sources</span>
            <Badge variant="secondary" className="ml-1">
              {activeSources.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="mt-6">
          <CategoriesManagement
            categories={categories}
            onUpdateCategories={onUpdateCategories}
          />
        </TabsContent>

        <TabsContent value="expenses" className="mt-6">
          <PredefinedExpensesManagement
            predefinedExpenses={predefinedExpenses}
            categories={categories}
            onUpdatePredefinedExpenses={onUpdatePredefinedExpenses}
          />
        </TabsContent>

        <TabsContent value="income" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Income Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <IncomeManagement
                incomeSources={incomeSources}
                incomeRecords={[]} // We'll pass empty array since this is just for setup
                onAddIncomeSource={onAddIncomeSource || (() => {})}
                onUpdateIncomeSource={(source) => {
                  const updated = incomeSources.map(s => s.id === source.id ? source : s)
                  onUpdateIncomeSources(updated)
                }}
                onAddIncomeRecord={() => {}} // Not needed in configuration view
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Setup Tips */}
      <Card>
        <CardHeader>
          <CardTitle>💡 Setup Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 border-l-4 border-l-[#2667FF] border border-gray-200 rounded-lg">
              <h4 className="font-medium text-[#2667FF] mb-2">🏷️ Categories</h4>
              <p className="text-sm text-gray-600">
                Create specific categories for better expense tracking. Example: separate "Groceries" from "Restaurants".
              </p>
            </div>
            
            <div className="p-4 border-l-4 border-l-[#17BEBB] border border-gray-200 rounded-lg">
              <h4 className="font-medium text-[#17BEBB] mb-2">💰 Income Sources</h4>
              <p className="text-sm text-gray-600">
                Set up all your income sources with accurate amounts and frequencies for better budgeting.
              </p>
            </div>
            
            <div className="p-4 border-l-4 border-l-[#C41E3D] border border-gray-200 rounded-lg">
              <h4 className="font-medium text-[#C41E3D] mb-2">📅 Recurring Expenses</h4>
              <p className="text-sm text-gray-600">
                Add all your bills and subscriptions. Enable auto-add to never miss recording them.
              </p>
            </div>
            
            <div className="p-4 border-l-4 border-l-[#3B6064] border border-gray-200 rounded-lg">
              <h4 className="font-medium text-[#3B6064] mb-2">🎨 Customization</h4>
              <p className="text-sm text-gray-600">
                Use icons and colors to make your categories visually distinct and easier to identify.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
