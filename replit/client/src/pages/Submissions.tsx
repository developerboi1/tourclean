import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { VideoSubmission } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Play, Clock, MapPin, AlertTriangle } from "lucide-react";

export default function Submissions() {
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: submissions, isLoading } = useQuery<VideoSubmission[]>({
    queryKey: ['/api/submissions'],
  });

  const filteredSubmissions = submissions?.filter(submission => 
    statusFilter === "all" || submission.status === statusFilter
  ) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'needs_review': return 'bg-yellow-100 text-yellow-800';
      case 'queued': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'needs_review': return 'Under Review';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      case 'queued': return 'Queued';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
    
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>My Submissions</CardTitle>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40" data-testid="select-status-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="queued">Queued</SelectItem>
                <SelectItem value="needs_review">Under Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredSubmissions.length === 0 ? (
            <div className="text-center py-12">
              <Play className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {statusFilter === "all" ? "No submissions yet" : "No submissions with this status"}
              </h3>
              <p className="text-muted-foreground">
                {statusFilter === "all" 
                  ? "Upload your first video to get started earning points!"
                  : "Try selecting a different status filter."
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSubmissions.map((submission) => (
                <div
                  key={submission.id}
                  className="flex items-center justify-between p-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  data-testid={`submission-card-${submission.id}`}
                >
                  <div className="flex items-center space-x-4 flex-1">
                    {/* Video Thumbnail */}
                    <div className="relative">
                      <div className="w-20 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Play className="w-6 h-6 text-gray-500" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-8 h-5 bg-gray-800 text-white text-xs rounded flex items-center justify-center">
                        {submission.durationS}s
                      </div>
                    </div>

                    {/* Submission Details */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            {submission.wasteType?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Disposal
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(submission.createdAt)} • {submission.pointsAwarded || 0} points
                          </p>
                          
                          {/* Metadata */}
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="flex items-center text-xs text-muted-foreground">
                              <MapPin className="w-3 h-3 mr-1" />
                              GPS Verified
                            </span>
                            <span className="flex items-center text-xs text-muted-foreground">
                              <Clock className="w-3 h-3 mr-1" />
                              {submission.durationS} seconds
                            </span>
                            {submission.status === 'rejected' && submission.rejectionReason && (
                              <span className="flex items-center text-xs text-red-600">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                {submission.rejectionReason}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Status and Points */}
                        <div className="text-right">
                          <Badge
                            className={`${getStatusColor(submission.status)} mb-1`}
                            data-testid={`status-badge-${submission.status}`}
                          >
                            {getStatusLabel(submission.status)}
                          </Badge>
                          <p className="text-sm font-medium text-gray-900">
                            {submission.status === 'approved' ? '+' : ''}
                            {submission.pointsAwarded || 0} points
                          </p>
                        </div>
                      </div>
                    </div>
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
