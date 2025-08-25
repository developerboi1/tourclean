import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Users,
  Settings,
  BarChart3,
  PieChart,
  Calendar
} from "lucide-react";

export default function BudgetOverview() {
  // Mock data - in production this would come from API
  const budgetData = {
    annual: {
      total: 600000,
      spent: 456780,
      remaining: 143220,
      percentUsed: 76
    },
    monthly: {
      current: 50000,
      spent: 44660,
      remaining: 5340,
      percentUsed: 89
    }
  };

  const costBreakdown = [
    { category: 'User Payouts', amount: 387560, percentage: 84.8, icon: Users, color: 'text-primary', bgColor: 'bg-blue-100' },
    { category: 'Operations', amount: 42120, percentage: 9.2, icon: Settings, color: 'text-green-600', bgColor: 'bg-green-100' },
    { category: 'Moderation', amount: 18900, percentage: 4.1, icon: Settings, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
    { category: 'Analytics', amount: 8200, percentage: 1.8, icon: BarChart3, color: 'text-purple-600', bgColor: 'bg-purple-100' }
  ];

  const monthlySpending = [
    { month: 'Jan', amount: 38000, efficiency: 92 },
    { month: 'Feb', amount: 42000, efficiency: 88 },
    { month: 'Mar', amount: 45000, efficiency: 85 },
    { month: 'Apr', amount: 41000, efficiency: 90 },
    { month: 'May', amount: 39000, efficiency: 94 },
    { month: 'Jun', amount: 47000, efficiency: 82 },
  ];

  return (
    <div className="space-y-8">
      {/* Budget Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Annual Budget */}
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader>
            <CardTitle className="text-white">Annual Budget Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-blue-100 text-sm font-medium">Total Annual Budget</p>
              <p className="text-3xl font-bold" data-testid="text-annual-budget">
                ${budgetData.annual.total.toLocaleString()}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-blue-100 text-sm font-medium">Spent to Date</p>
              <p className="text-xl font-bold text-blue-200">
                ${budgetData.annual.spent.toLocaleString()}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-blue-100 text-sm font-medium">Remaining</p>
              <p className="text-xl font-bold text-blue-100">
                ${budgetData.annual.remaining.toLocaleString()}
              </p>
            </div>
            
            {/* Annual Progress Bar */}
            <div className="space-y-2">
              <Progress 
                value={budgetData.annual.percentUsed} 
                className="h-4 bg-blue-400/30"
              />
              <p className="text-sm text-blue-100">
                {budgetData.annual.percentUsed}% of annual budget utilized
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Spending Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Spending Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-muted-foreground font-medium">Monthly Spending Chart</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Bar chart showing spending trends over time
                </p>
                
                {/* Simple spending indicator */}
                <div className="mt-6 grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <p className="font-semibold text-gray-900">Average/Month</p>
                    <p className="text-green-600">$42,000</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-gray-900">This Month</p>
                    <p className="text-red-600">$44,660</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-gray-900">Projected</p>
                    <p className="text-blue-600">$46,000</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Month Budget Status */}
      <Card className="border-l-4 border-l-red-500">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Current Month Budget Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                ${budgetData.monthly.current.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Monthly Allocation</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                ${budgetData.monthly.spent.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Spent So Far</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                ${budgetData.monthly.remaining.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Remaining</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {budgetData.monthly.percentUsed}%
              </p>
              <p className="text-sm text-muted-foreground">Budget Used</p>
            </div>
          </div>
          
          <div className="mt-6">
            <Progress 
              value={budgetData.monthly.percentUsed} 
              className="h-3"
            />
            <p className="text-sm text-muted-foreground mt-2">
              Monthly budget utilization - {30 - new Date().getDate()} days remaining
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Cost Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Breakdown by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {costBreakdown.map((item) => {
              const Icon = item.icon;
              
              return (
                <div key={item.category} className="text-center">
                  <div className={`w-16 h-16 ${item.bgColor} rounded-full flex items-center justify-center mx-auto mb-3`}>
                    <Icon className={`w-8 h-8 ${item.color}`} />
                  </div>
                  <p className="text-2xl font-bold text-gray-900" data-testid={`cost-${item.category.toLowerCase().replace(/\s+/g, '-')}`}>
                    ${item.amount.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">{item.category}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.percentage}% of total</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Budget Efficiency Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Budget Efficiency Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Cost per Verified Submission</span>
                <div className="flex items-center space-x-2">
                  <TrendingDown className="w-4 h-4 text-green-600" />
                  <span className="font-bold text-green-600">$5.12</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Processing Efficiency</span>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="font-bold text-green-600">94%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Fraud Prevention Savings</span>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="font-bold text-green-600">$12,340</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Administrative Overhead</span>
                <div className="flex items-center space-x-2">
                  <TrendingDown className="w-4 h-4 text-green-600" />
                  <span className="font-bold text-green-600">8.2%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Budget Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <TrendingUp className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-800">Increase Monthly Allocation</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Current pace suggests you'll exceed budget by 12%. Consider increasing monthly allocation to $52,000.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <TrendingDown className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-800">Optimize Fraud Detection</p>
                    <p className="text-sm text-green-700 mt-1">
                      Enhanced fraud detection could save an estimated $8,000/month in false payouts.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <BarChart3 className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-800">Seasonal Adjustment</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Consider seasonal budget adjustments based on tourism patterns.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
