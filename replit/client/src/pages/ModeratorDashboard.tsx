import { useQuery } from "@tanstack/react-query";
import type { VideoSubmission } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/StatCard";
import { Clock, CheckCircle, TrendingUp, Timer, AlertTriangle, Shield } from "lucide-react";
import { Link } from "wouter";

export default function ModeratorDashboard() {
  const { data: reviewQueue } = useQuery<VideoSubmission[]>({
    queryKey: ['/api/admin/review-queue'],
  });

  const { data: analytics } = useQuery({
    queryKey: ['/api/analytics'],
  });

  const pendingReviews = reviewQueue?.length || 0;
  const highRiskCount = reviewQueue?.filter(item => item.autoScore > 70).length || 0;

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Pending Reviews"
          value={pendingReviews}
          icon={Clock}
          color="text-red-600"
          bgColor="bg-red-100"
        />
        <StatCard
          title="Reviewed Today"
          value={23}
          icon={CheckCircle}
          color="text-primary"
          bgColor="bg-blue-100"
        />
        <StatCard
          title="Approval Rate"
          value="87%"
          icon={TrendingUp}
          color="text-green-600"
          bgColor="bg-green-100"
        />
        <StatCard
          title="Avg Review Time"
          value="2.5m"
          icon={Timer}
          color="text-blue-600"
          bgColor="bg-blue-100"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority Queue</h3>
            <p className="text-muted-foreground mb-4">
              High-risk submissions requiring immediate attention
            </p>
            <Link href="/review-queue">
              <Button className="w-full bg-red-600 hover:bg-red-700" data-testid="button-priority-queue">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Review Priority Items ({highRiskCount})
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Fraud Detection</h3>
            <p className="text-muted-foreground mb-4">
              Check for suspicious patterns and duplicates
            </p>
            <Link href="/fraud-tools">
              <Button variant="outline" className="w-full" data-testid="button-fraud-detection">
                <Shield className="w-4 h-4 mr-2" />
                Run Fraud Scan
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Review Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {!reviewQueue || reviewQueue.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-muted-foreground">No pending reviews</p>
                <p className="text-sm text-muted-foreground">
                  All submissions have been processed!
                </p>
              </div>
            ) : (
              reviewQueue.slice(0, 5).map((submission) => (
                <div
                  key={submission.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-10 bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-xs text-gray-600">
                        {submission.durationS}s
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {submission.wasteType?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Disposal
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(submission.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        submission.autoScore > 70
                          ? 'bg-red-100 text-red-800'
                          : submission.autoScore > 40
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {submission.autoScore > 70 ? 'HIGH RISK' : 
                       submission.autoScore > 40 ? 'MEDIUM' : 'LOW RISK'}
                    </span>
                    <Link href="/review-queue">
                      <Button size="sm" variant="outline">
                        Review
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
