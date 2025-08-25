import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Search, 
  MapPin, 
  Shield, 
  AlertTriangle, 
  Clock, 
  ExternalLink 
} from "lucide-react";

export default function FraudTools() {
  const fraudAlerts = [
    {
      id: 1,
      type: 'duplicate',
      title: 'Potential duplicate video detected',
      description: 'User: john.doe@email.com • Similarity: 95%',
      severity: 'high',
      action: 'Investigate'
    },
    {
      id: 2,
      type: 'location',
      title: 'GPS location outside bin radius',
      description: 'User: alice.johnson@email.com • Distance: 2.1km',
      severity: 'medium',
      action: 'Review'
    },
    {
      id: 3,
      type: 'rate-limit',
      title: 'Rate limit exceeded',
      description: 'User: mike.chen@email.com • 15 submissions in 1 hour',
      severity: 'medium',
      action: 'Suspend'
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityIcon = (type: string) => {
    switch (type) {
      case 'duplicate': return AlertTriangle;
      case 'location': return MapPin;
      case 'rate-limit': return Clock;
      default: return Shield;
    }
  };

  return (
    <div className="space-y-8">
      {/* Fraud Detection Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Search className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Duplicate Detection</h3>
                <p className="text-muted-foreground">Scan for duplicate videos using perceptual hashing</p>
              </div>
            </div>
            <Button className="w-full" data-testid="button-duplicate-scan">
              Run Duplicate Scan
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">GPS Validation</h3>
                <p className="text-muted-foreground">Check submissions against registered bin locations</p>
              </div>
            </div>
            <Button variant="outline" className="w-full" data-testid="button-gps-validation">
              Validate Locations
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Fraud Detection Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">12</p>
            <p className="text-sm text-muted-foreground">High Risk Alerts</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">3</p>
            <p className="text-sm text-muted-foreground">Duplicate Videos</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <MapPin className="w-6 h-6 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">8</p>
            <p className="text-sm text-muted-foreground">Location Violations</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">1</p>
            <p className="text-sm text-muted-foreground">Suspended Users</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Fraud Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Fraud Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {fraudAlerts.map((alert) => {
              const Icon = getSeverityIcon(alert.type);
              
              return (
                <Alert key={alert.id} className="border-l-4 border-l-red-500">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        alert.severity === 'high' ? 'bg-red-100' :
                        alert.severity === 'medium' ? 'bg-yellow-100' : 'bg-green-100'
                      }`}>
                        <Icon className={`w-5 h-5 ${
                          alert.severity === 'high' ? 'text-red-600' :
                          alert.severity === 'medium' ? 'text-yellow-600' : 'text-green-600'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{alert.title}</p>
                        <p className="text-sm text-muted-foreground">{alert.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                      <Button
                        size="sm"
                        variant={alert.severity === 'high' ? 'destructive' : 'outline'}
                        data-testid={`button-${alert.action.toLowerCase()}-${alert.id}`}
                      >
                        {alert.action}
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </Alert>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Fraud Prevention Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Fraud Prevention Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Detection Patterns</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Multiple submissions from same location within short timeframe</li>
                <li>• Videos with identical or very similar content</li>
                <li>• GPS coordinates that don't match registered bin locations</li>
                <li>• Unusual submission patterns or timing</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Prevention Measures</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Regular automated duplicate scans</li>
                <li>• GPS radius validation for all submissions</li>
                <li>• Rate limiting per user account</li>
                <li>• Manual review for high-risk submissions</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
