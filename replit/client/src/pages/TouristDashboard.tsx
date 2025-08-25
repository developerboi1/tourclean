import { useQuery } from "@tanstack/react-query";
import type { VideoSubmission, UserWallet } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/StatCard";
import { 
  Coins, 
  Video, 
  CheckCircle, 
  DollarSign, 
  Upload, 
  CreditCard,
  Play,
  Clock,
  MapPin
} from "lucide-react";
import { Link } from "wouter";

export default function TouristDashboard() {
  const { data: wallet } = useQuery<UserWallet>({
    queryKey: ['/api/wallet'],
  });

  const { data: submissions } = useQuery<VideoSubmission[]>({
    queryKey: ['/api/submissions'],
  });

  const { data: recentSubmissions } = useQuery<VideoSubmission[]>({
    queryKey: ['/api/submissions'],
    select: (data: VideoSubmission[]) => data?.slice(0, 3) || [],
  });

  const approvedCount = submissions?.filter(s => s.status === 'approved').length || 0;
  const totalEarned = submissions?.reduce((sum, s) => sum + (s.pointsAwarded || 0), 0) || 0;
  const cashEarned = totalEarned * 0.05; // 20 points = $1, so 0.05 per point

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'needs_review': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'needs_review': return 'Under Review';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Points"
          value={wallet?.pointsBalance || 0}
          icon={Coins}
          color="text-green-600"
          bgColor="bg-green-100"
        />
        <StatCard
          title="Videos Submitted"
          value={submissions?.length || 0}
          icon={Video}
          color="text-primary"
          bgColor="bg-blue-100"
        />
        <StatCard
          title="Approved"
          value={approvedCount}
          icon={CheckCircle}
          color="text-green-600"
          bgColor="bg-green-100"
        />
        <StatCard
          title="Cash Earned"
          value={`$${cashEarned.toFixed(2)}`}
          icon={DollarSign}
          color="text-yellow-600"
          bgColor="bg-yellow-100"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Upload</h3>
            <p className="text-muted-foreground mb-4">
              Submit a new waste disposal video and earn points!
            </p>
            <Link href="/upload">
              <Button className="w-full" data-testid="button-upload-video">
                <Upload className="w-4 h-4 mr-2" />
                Upload Video
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cash Out</h3>
            <p className="text-muted-foreground mb-4">
              Convert your points to cash rewards.
            </p>
            <Link href="/wallet">
              <Button variant="outline" className="w-full" data-testid="button-cash-out">
                <CreditCard className="w-4 h-4 mr-2" />
                Request Payout
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Submissions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          {!recentSubmissions || recentSubmissions.length === 0 ? (
            <div className="text-center py-8">
              <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-muted-foreground">No submissions yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Upload your first video to get started earning points!
              </p>
              <Link href="/upload">
                <Button data-testid="button-first-upload">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Your First Video
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentSubmissions.map((submission) => (
                <div
                  key={submission.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  data-testid={`submission-${submission.id}`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Play className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {submission.wasteType} Disposal
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {submission.durationS}s
                        </span>
                        <span className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          GPS Verified
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        submission.status
                      )}`}
                      data-testid={`status-${submission.status}`}
                    >
                      {getStatusLabel(submission.status)}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      +{submission.pointsAwarded || 0} pts
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
