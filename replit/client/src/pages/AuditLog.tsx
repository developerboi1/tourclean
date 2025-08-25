import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { SubmissionEvent } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  XCircle, 
  Flag, 
  DollarSign,
  Clock,
  User,
  Search
} from "lucide-react";

export default function AuditLog() {
  const [actionFilter, setActionFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  const { data: auditEvents, isLoading } = useQuery<SubmissionEvent[]>({
    queryKey: ['/api/admin/audit-log'],
  });

  const filteredEvents = auditEvents?.filter(event => {
    if (actionFilter !== "all" && event.eventType !== actionFilter) return false;
    if (dateFilter) {
      const eventDate = new Date(event.createdAt).toISOString().split('T')[0];
      if (eventDate !== dateFilter) return false;
    }
    return true;
  }) || [];

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'approved': return CheckCircle;
      case 'rejected': return XCircle;
      case 'flagged': return Flag;
      case 'payout': return DollarSign;
      default: return User;
    }
  };

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case 'approved': return 'border-green-500';
      case 'rejected': return 'border-red-500';
      case 'flagged': return 'border-yellow-500';
      case 'payout': return 'border-blue-500';
      default: return 'border-gray-500';
    }
  };

  const getEventTitle = (eventType: string) => {
    switch (eventType) {
      case 'approved': return 'Submission Approved';
      case 'rejected': return 'Submission Rejected';
      case 'flagged': return 'User Flagged';
      case 'payout': return 'Payout Processed';
      case 'submitted': return 'Video Submitted';
      default: return eventType.charAt(0).toUpperCase() + eventType.slice(1);
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
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-20 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Audit Log</CardTitle>
            <div className="flex items-center space-x-4">
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-40"
                data-testid="input-date-filter"
              />
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-40" data-testid="select-action-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="approved">Approvals</SelectItem>
                  <SelectItem value="rejected">Rejections</SelectItem>
                  <SelectItem value="flagged">Flags</SelectItem>
                  <SelectItem value="payout">Payouts</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No audit entries found
              </h3>
              <p className="text-muted-foreground">
                {actionFilter === "all" && !dateFilter
                  ? "No audit events recorded yet."
                  : "Try adjusting your filters to see more results."
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEvents.map((event) => {
                const Icon = getEventIcon(event.eventType);
                
                return (
                  <div
                    key={event.id}
                    className={`flex items-center space-x-4 p-4 border-l-4 ${getEventColor(event.eventType)} rounded-lg bg-white`}
                    data-testid={`audit-event-${event.id}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      event.eventType === 'approved' ? 'bg-green-100' :
                      event.eventType === 'rejected' ? 'bg-red-100' :
                      event.eventType === 'flagged' ? 'bg-yellow-100' :
                      event.eventType === 'payout' ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <Icon className={`w-4 h-4 ${
                        event.eventType === 'approved' ? 'text-green-600' :
                        event.eventType === 'rejected' ? 'text-red-600' :
                        event.eventType === 'flagged' ? 'text-yellow-600' :
                        event.eventType === 'payout' ? 'text-blue-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {getEventTitle(event.eventType)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {event.eventType === 'approved' && 'Moderator approved submission with points awarded'}
                        {event.eventType === 'rejected' && `Moderator rejected submission - Reason: ${event.meta?.reason || 'Not specified'}`}
                        {event.eventType === 'flagged' && 'Moderator flagged user for suspicious activity'}
                        {event.eventType === 'payout' && 'System processed payout to user account'}
                        {event.eventType === 'submitted' && 'User submitted new video for review'}
                        {!['approved', 'rejected', 'flagged', 'payout', 'submitted'].includes(event.eventType) && 
                          `Event: ${event.eventType}`
                        }
                      </p>
                      <div className="flex items-center space-x-4 mt-1">
                        <p className="text-xs text-muted-foreground flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatDate(event.createdAt)}
                        </p>
                        {event.actorId && (
                          <p className="text-xs text-muted-foreground flex items-center">
                            <User className="w-3 h-3 mr-1" />
                            Actor ID: {event.actorId.substring(0, 8)}...
                          </p>
                        )}
                        {event.submissionId && (
                          <p className="text-xs text-muted-foreground">
                            Submission: {event.submissionId.substring(0, 8)}...
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-xs">
                        {event.eventType.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
