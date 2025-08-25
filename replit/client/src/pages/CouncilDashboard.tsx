import { useQuery } from "@tanstack/react-query";
import type { VideoSubmission } from "@shared/schema";

interface AnalyticsData {
  totalUsers: number;
  totalSubmissions: number;
  totalPayouts: number;
  approvedSubmissions: number;
}
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatCard from "@/components/StatCard";
import { 
  Users, 
  Video, 
  DollarSign, 
  TrendingDown,
  BarChart3,
  MapPin,
  Calendar,
  TrendingUp
} from "lucide-react";

export default function CouncilDashboard() {
  const { data: analytics } = useQuery<AnalyticsData>({
    queryKey: ['/api/analytics'],
  });

  const { data: submissions } = useQuery<VideoSubmission[]>({
    queryKey: ['/api/submissions'],
  });

  // Mock data for demonstration - in production this would come from analytics API
  const mockTopAreas = [
    { name: 'Downtown District', submissions: 234, growth: 18 },
    { name: 'University Quarter', submissions: 189, growth: 24 },
    { name: 'Central Park Area', submissions: 156, growth: 8 },
  ];

  const mockBudgetData = {
    monthlyBudget: 50000,
    spent: 44660,
    remaining: 5340,
    percentUsed: 89
  };

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Participants"
          value={analytics?.totalUsers.toLocaleString() || '0'}
          subtitle="+12% this month"
          icon={Users}
          color="text-primary"
          bgColor="bg-blue-100"
        />
        <StatCard
          title="Videos Verified"
          value={analytics?.approvedSubmissions.toLocaleString() || '0'}
          subtitle="+8% this month"
          icon={Video}
          color="text-green-600"
          bgColor="bg-green-100"
        />
        <StatCard
          title="Total Payouts"
          value={`$${analytics?.totalPayouts.toLocaleString() || '0'}`}
          subtitle="+15% this month"
          icon={DollarSign}
          color="text-yellow-600"
          bgColor="bg-yellow-100"
        />
        <StatCard
          title="Cost per Disposal"
          value="$5.00"
          subtitle="-3% this month"
          icon={TrendingDown}
          color="text-green-600"
          bgColor="bg-green-100"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Participation Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Participation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-muted-foreground font-medium">Participation Trends</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Interactive chart showing monthly growth in user participation
                </p>
                <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <p className="font-semibold text-gray-900">Last Month</p>
                    <p className="text-green-600">+12%</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-gray-900">This Month</p>
                    <p className="text-primary">+18%</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-gray-900">Projected</p>
                    <p className="text-purple-600">+22%</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Geographic Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Geographic Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-muted-foreground font-medium">Geographic Heatmap</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Submissions density by ward/district
                </p>
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center">
                    <p className="font-semibold text-gray-900">Highest Activity</p>
                    <p className="text-green-600">Downtown</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-gray-900">Growth Leader</p>
                    <p className="text-primary">University Quarter</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers & Budget Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Areas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockTopAreas.map((area, index) => (
                <div key={area.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{area.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {area.submissions} verified submissions
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <p className="font-bold text-green-600">+{area.growth}%</p>
                    </div>
                    <p className="text-xs text-muted-foreground">vs last month</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Budget Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Budget Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">Monthly Budget</p>
                <p className="font-bold text-gray-900">
                  ${mockBudgetData.monthlyBudget.toLocaleString()}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">Spent This Month</p>
                <p className="font-bold text-red-600">
                  ${mockBudgetData.spent.toLocaleString()}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">Remaining</p>
                <p className="font-bold text-green-600">
                  ${mockBudgetData.remaining.toLocaleString()}
                </p>
              </div>
              
              {/* Budget Progress Bar */}
              <div className="space-y-2">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-red-600 h-3 rounded-full transition-all duration-500" 
                    style={{ width: `${mockBudgetData.percentUsed}%` }}
                  ></div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {mockBudgetData.percentUsed}% of monthly budget used
                </p>
              </div>

              <div className="pt-4 border-t">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center">
                    <p className="font-semibold text-gray-900">Avg Daily Spend</p>
                    <p className="text-red-600">${(mockBudgetData.spent / 30).toFixed(0)}</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-gray-900">Days Remaining</p>
                    <p className="text-green-600">{Math.ceil(mockBudgetData.remaining / (mockBudgetData.spent / 30))}</p>
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
