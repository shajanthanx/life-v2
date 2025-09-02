'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { IncomeSource, IncomeRecord } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { 
  Plus, 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Briefcase, 
  Code, 
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

interface IncomeManagementProps {
  incomeSources: IncomeSource[]
  incomeRecords: IncomeRecord[]
  onAddIncomeSource: () => void
  onUpdateIncomeSource: (source: IncomeSource) => void
  onAddIncomeRecord: (record: Omit<IncomeRecord, 'id'>) => void
}

export function IncomeManagement({ 
  incomeSources, 
  incomeRecords, 
  onAddIncomeSource, 
  onUpdateIncomeSource, 
  onAddIncomeRecord 
}: IncomeManagementProps) {
  const [activeTab, setActiveTab] = useState('overview')

  // Calculate metrics
  const activeSources = (incomeSources || []).filter(source => source.isActive)
  const totalMonthlyIncome = activeSources.reduce((acc, source) => {
    switch (source.frequency) {
      case 'monthly':
        return acc + source.amount
      case 'weekly':
        return acc + (source.amount * 4.33) // Average weeks per month
      case 'yearly':
        return acc + (source.amount / 12)
      default:
        return acc
    }
  }, 0)

  const last30DaysRecords = (incomeRecords || []).filter(record => {
    const recordDate = new Date(record.date)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    return recordDate >= thirtyDaysAgo
  })

  const actualMonthlyIncome = last30DaysRecords.reduce((acc, record) => acc + record.amount, 0)
  const incomeVariance = actualMonthlyIncome - totalMonthlyIncome
  const variancePercentage = totalMonthlyIncome > 0 ? (incomeVariance / totalMonthlyIncome) * 100 : 0

  // Income by type
  const incomeByType = activeSources.reduce((acc, source) => {
    const monthlyAmount = source.frequency === 'monthly' ? source.amount :
                         source.frequency === 'weekly' ? source.amount * 4.33 :
                         source.frequency === 'yearly' ? source.amount / 12 : source.amount
    
    acc[source.type] = (acc[source.type] || 0) + monthlyAmount
    return acc
  }, {} as Record<string, number>)

  const pieData = Object.entries(incomeByType).map(([type, amount]) => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    value: amount,
    percentage: ((amount / totalMonthlyIncome) * 100).toFixed(1)
  }))

  // Income trend (last 12 months)
  const incomeTrend = Array.from({ length: 12 }, (_, i) => {
    const date = new Date()
    date.setMonth(date.getMonth() - (11 - i))
    
    const monthRecords = (incomeRecords || []).filter(record => {
      const recordDate = new Date(record.date)
      return recordDate.getMonth() === date.getMonth() && recordDate.getFullYear() === date.getFullYear()
    })
    
    const monthlyTotal = monthRecords.reduce((acc, record) => acc + record.amount, 0)
    
    return {
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      amount: monthlyTotal,
      target: totalMonthlyIncome
    }
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'salary':
        return Briefcase
      case 'freelance':
        return Code
      case 'business':
        return TrendingUp
      case 'investment':
        return DollarSign
      default:
        return DollarSign
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'salary':
        return 'bg-blue-100 text-blue-700'
      case 'freelance':
        return 'bg-green-100 text-green-700'
      case 'business':
        return 'bg-purple-100 text-purple-700'
      case 'investment':
        return 'bg-orange-100 text-orange-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'monthly':
        return 'Monthly'
      case 'weekly':
        return 'Weekly'
      case 'yearly':
        return 'Yearly'
      case 'one-time':
        return 'One-time'
      default:
        return frequency
    }
  }

  const getNextPayDate = (source: IncomeSource) => {
    if (!source.nextPayDate) return null
    
    const next = new Date(source.nextPayDate)
    const now = new Date()
    const diffTime = next.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return { text: 'Overdue', color: 'text-red-500' }
    if (diffDays === 0) return { text: 'Today', color: 'text-green-500' }
    if (diffDays === 1) return { text: 'Tomorrow', color: 'text-orange-500' }
    return { text: `${diffDays} days`, color: 'text-muted-foreground' }
  }

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Income Management</h2>
          <p className="text-muted-foreground">Track and manage income from multiple sources</p>
        </div>
        <Button onClick={onAddIncomeSource}>
          <Plus className="h-4 w-4 mr-2" />
          Add Income Source
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Monthly Target</p>
                <p className="text-2xl font-bold">{formatCurrency(totalMonthlyIncome)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Actual (30 days)</p>
                <p className="text-2xl font-bold">{formatCurrency(actualMonthlyIncome)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              {variancePercentage >= 0 ? (
                <TrendingUp className="h-5 w-5 text-green-600" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-600" />
              )}
              <div>
                <p className="text-sm text-muted-foreground">Variance</p>
                <p className={`text-2xl font-bold ${variancePercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {variancePercentage >= 0 ? '+' : ''}{variancePercentage.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Briefcase className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Active Sources</p>
                <p className="text-2xl font-bold">{activeSources.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sources">Sources</TabsTrigger>
          <TabsTrigger value="records">Records</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="space-y-6">
            {/* Income Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Income Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percentage }) => `${name} ${percentage}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="space-y-3">
                    {pieData.map((item, index) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="text-sm">{item.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{formatCurrency(item.value)}</div>
                          <div className="text-xs text-muted-foreground">{item.percentage}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Income Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Income Trend (Last 12 Months)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={incomeTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Line 
                        type="monotone" 
                        dataKey="amount" 
                        stroke="#8884d8" 
                        strokeWidth={2}
                        name="Actual Income"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="target" 
                        stroke="#82ca9d" 
                        strokeDasharray="5 5"
                        name="Target Income"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sources" className="mt-6">
          <div className="space-y-4">
            {(incomeSources || []).map((source) => {
              const TypeIcon = getTypeIcon(source.type)
              const nextPay = getNextPayDate(source)
              const monthlyEquivalent = source.frequency === 'monthly' ? source.amount :
                                     source.frequency === 'weekly' ? source.amount * 4.33 :
                                     source.frequency === 'yearly' ? source.amount / 12 : source.amount
              
              return (
                <Card key={source.id} className={!source.isActive ? 'opacity-60' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${getTypeColor(source.type)}`}>
                          <TypeIcon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-lg">{source.name}</h4>
                          {source.description && (
                            <p className="text-sm text-muted-foreground">{source.description}</p>
                          )}
                          <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                            <span>{getFrequencyLabel(source.frequency)}</span>
                            <span>•</span>
                            <span>{formatCurrency(source.amount)}</span>
                            <span>•</span>
                            <span>{formatCurrency(monthlyEquivalent)}/month equivalent</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <Badge className={getTypeColor(source.type)}>
                          {source.type}
                        </Badge>
                        {!source.isActive && (
                          <Badge variant="outline" className="ml-2 text-red-600">
                            Inactive
                          </Badge>
                        )}
                      </div>
                    </div>

                    {nextPay && source.isActive && (
                      <div className="flex items-center justify-between mt-4 p-3 bg-muted rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Next payment</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{formatDate(source.nextPayDate!)}</div>
                          <div className={`text-xs ${nextPay.color}`}>{nextPay.text}</div>
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-2 mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const amount = prompt(`Record income from ${source.name}:`)
                          if (amount && !isNaN(Number(amount))) {
                            onAddIncomeRecord({
                              sourceId: source.id,
                              amount: Number(amount),
                              date: new Date(),
                              description: `Payment from ${source.name}`,
                              isRecurring: source.frequency !== 'one-time'
                            })
                          }
                        }}
                        disabled={!source.isActive}
                      >
                        <DollarSign className="h-4 w-4 mr-1" />
                        Record Payment
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onUpdateIncomeSource({ ...source, isActive: !source.isActive })}
                      >
                        {source.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}

            {(incomeSources || []).length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No income sources yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Add your income sources to track earnings from multiple streams
                  </p>
                  <Button onClick={onAddIncomeSource}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Income Source
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="records" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Income Records</CardTitle>
              <Button
                onClick={() => {
                  const sourceId = activeSources[0]?.id
                  if (!sourceId) {
                    alert('Please add an income source first')
                    return
                  }
                  const amount = prompt('Record income amount:')
                  if (amount && !isNaN(Number(amount))) {
                    onAddIncomeRecord({
                      sourceId,
                      amount: Number(amount),
                      date: new Date(),
                      description: 'Manual income entry',
                      isRecurring: false
                    })
                  }
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Record
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(incomeRecords || []).slice(0, 20).map((record) => {
                  const source = (incomeSources || []).find(s => s.id === record.sourceId)
                  const TypeIcon = source ? getTypeIcon(source.type) : DollarSign
                  
                  return (
                    <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${source ? getTypeColor(source.type) : 'bg-gray-100'}`}>
                          <TypeIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="font-medium">{source?.name || 'Unknown Source'}</h4>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(record.date)}</span>
                            {record.isRecurring && (
                              <>
                                <span>•</span>
                                <Badge variant="outline" className="text-xs">
                                  Recurring
                                </Badge>
                              </>
                            )}
                          </div>
                          {record.description && (
                            <p className="text-xs text-muted-foreground mt-1">{record.description}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          +{formatCurrency(record.amount)}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {(incomeRecords || []).length === 0 && (
                <div className="text-center py-8">
                  <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No income records yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <div className="space-y-6">
            {/* Monthly Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Income Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={incomeTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Bar dataKey="amount" fill="#8884d8" name="Actual Income" />
                      <Bar dataKey="target" fill="#82ca9d" name="Target Income" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {((actualMonthlyIncome / totalMonthlyIncome) * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Target Achievement</div>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(actualMonthlyIncome * 12)}
                    </div>
                    <div className="text-sm text-muted-foreground">Projected Annual</div>
                  </div>
                  
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {(incomeRecords || []).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Records</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
