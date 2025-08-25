import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { VideoSubmission } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import VideoPlayer from "@/components/VideoPlayer";
import { apiRequest } from "@/lib/queryClient";
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  Flag, 
  RefreshCw,
  User,
  History,
  MapPin,
  Clock
} from "lucide-react";

export default function ReviewQueue() {
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: submissions, isLoading } = useQuery<VideoSubmission[]>({
    queryKey: ['/api/admin/review-queue'],
  });

  const approveMutation = useMutation({
    mutationFn: async (submissionId: string) => {
      return apiRequest('POST', `/api/admin/submissions/${submissionId}/approve`, {
        pointsAwarded: 75
      });
    },
    onSuccess: () => {
      toast({
        title: "Submission Approved",
        description: "Points have been awarded to the user.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/review-queue'] });
      setSelectedSubmission(null);
    },
    onError: (error) => {
      toast({
        title: "Approval Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ submissionId, reason }: { submissionId: string; reason: string }) => {
      return apiRequest('POST', `/api/admin/submissions/${submissionId}/reject`, {
        reason
      });
    },
    onSuccess: () => {
      toast({
        title: "Submission Rejected",
        description: "User has been notified of the rejection.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/review-queue'] });
      setSelectedSubmission(null);
      setRejectionReason("");
    },
    onError: (error) => {
      toast({
        title: "Rejection Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleApprove = (submissionId: string) => {
    approveMutation.mutate(submissionId);
  };

  const handleReject = (submissionId: string) => {
    if (!rejectionReason) {
      toast({
        title: "Rejection Reason Required",
        description: "Please select a reason for rejection.",
        variant: "destructive",
      });
      return;
    }
    rejectMutation.mutate({ submissionId, reason: rejectionReason });
  };

  const getRiskLevel = (score: number) => {
    if (score > 70) return { label: 'HIGH RISK', color: 'bg-red-100 text-red-800' };
    if (score > 40) return { label: 'MEDIUM', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'LOW RISK', color: 'bg-green-100 text-green-800' };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading review queue...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Review Queue</CardTitle>
            <div className="flex items-center space-x-4">
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High Risk</SelectItem>
                  <SelectItem value="medium">Medium Risk</SelectItem>
                  <SelectItem value="low">Low Risk</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/admin/review-queue'] })}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!submissions || submissions.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Submissions to Review</h3>
              <p className="text-muted-foreground">
                All submissions have been processed. Great job!
              </p>
            </div>
          ) : (
            <>
              {/* Current Review Item */}
              {selectedSubmission ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 p-6 border-2 border-primary rounded-lg">
                  {/* Video Player */}
                  <div className="lg:col-span-1">
                    <VideoPlayer 
                      src={`/uploads/${selectedSubmission.s3Key}`} 
                      className="w-full aspect-video"
                    />
                    
                    {/* Risk Level Badge */}
                    <div className="mt-4 flex justify-center">
                      <Badge className={getRiskLevel(selectedSubmission.autoScore).color}>
                        {getRiskLevel(selectedSubmission.autoScore).label}
                      </Badge>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="lg:col-span-1">
                    <h4 className="font-semibold text-gray-900 mb-4">Submission Details</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Waste Type</p>
                        <p className="font-medium">
                          {selectedSubmission.wasteType?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Duration</p>
                        <p className="font-medium flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {selectedSubmission.durationS} seconds
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Location</p>
                        <p className="font-medium flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          GPS Verified
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Submitted</p>
                        <p className="font-medium">{formatDate(selectedSubmission.createdAt)}</p>
                      </div>
                    </div>

                    {/* Auto-Check Results */}
                    <div className="mt-6">
                      <h5 className="font-medium text-gray-900 mb-3">Auto-Check Results</h5>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">GPS within bin radius</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Minimum duration met</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <XCircle className="w-4 h-4 text-orange-500" />
                          <span className="text-sm">Quality check: Manual review needed</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="lg:col-span-1">
                    <h4 className="font-semibold text-gray-900 mb-4">Review Actions</h4>
                    
                    <div className="space-y-3 mb-6">
                      <Button
                        className="w-full"
                        onClick={() => handleApprove(selectedSubmission.id)}
                        disabled={approveMutation.isPending}
                        data-testid="button-approve-submission"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve (+75 points)
                      </Button>
                      
                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={() => handleReject(selectedSubmission.id)}
                        disabled={rejectMutation.isPending}
                        data-testid="button-reject-submission"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                      
                      <Button variant="outline" className="w-full">
                        <Flag className="w-4 h-4 mr-2" />
                        Flag for Admin
                      </Button>
                    </div>

                    {/* Rejection Reason */}
                    <div className="mb-4">
                      <Label htmlFor="rejection-reason">Rejection Reason</Label>
                      <Select value={rejectionReason} onValueChange={setRejectionReason}>
                        <SelectTrigger data-testid="select-rejection-reason">
                          <SelectValue placeholder="Select reason..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="poor-quality">Poor video quality</SelectItem>
                          <SelectItem value="wrong-location">Wrong location</SelectItem>
                          <SelectItem value="duplicate">Duplicate submission</SelectItem>
                          <SelectItem value="fraud">Fraudulent activity</SelectItem>
                          <SelectItem value="no-disposal">Does not show waste disposal</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Quick Actions */}
                    <div className="border-t pt-4">
                      <h5 className="font-medium text-gray-700 mb-3">Quick Actions</h5>
                      <div className="space-y-2">
                        <Button variant="ghost" className="w-full justify-start text-sm">
                          <User className="w-4 h-4 mr-2" />
                          View User Profile
                        </Button>
                        <Button variant="ghost" className="w-full justify-start text-sm">
                          <History className="w-4 h-4 mr-2" />
                          User Submission History
                        </Button>
                        <Button variant="ghost" className="w-full justify-start text-sm">
                          <MapPin className="w-4 h-4 mr-2" />
                          View on Map
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Queue List */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">
                  {selectedSubmission ? 'Upcoming Reviews' : 'Submissions Awaiting Review'}
                </h4>
                <div className="space-y-3">
                  {submissions.map((submission) => (
                    <div
                      key={submission.id}
                      className={`flex items-center space-x-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedSubmission?.id === submission.id 
                          ? 'border-primary bg-primary/5' 
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedSubmission(submission)}
                      data-testid={`submission-queue-item-${submission.id}`}
                    >
                      <div className="w-16 h-12 bg-gray-200 rounded flex items-center justify-center">
                        <Play className="w-5 h-5 text-gray-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">
                              {submission.wasteType?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Disposal
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(submission.createdAt)} • {submission.durationS}s
                            </p>
                          </div>
                          <Badge className={getRiskLevel(submission.autoScore).color}>
                            {getRiskLevel(submission.autoScore).label}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
