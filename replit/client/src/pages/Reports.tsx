import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Download, 
  BarChart3, 
  Calendar,
  MapPin,
  DollarSign,
  Users,
  Eye,
  Filter
} from "lucide-react";

export default function Reports() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [selectedReportTypes, setSelectedReportTypes] = useState<string[]>([]);

  const quickReports = [
    {
      title: "Weekly Summary",
      description: "Participation & payout summary",
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Monthly Analytics",
      description: "Detailed monthly breakdown",
      icon: BarChart3,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Geographic Report",
      description: "Area-wise participation data",
      icon: MapPin,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    }
  ];

  const recentReports = [
    {
      id: 1,
      name: "November 2023 Monthly Report",
      description: "Generated 2 days ago • 1,234 submissions analyzed",
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      id: 2,
      name: "Q3 Geographic Analysis",
      description: "Generated 1 week ago • All districts covered",
      icon: MapPin,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      id: 3,
      name: "October Budget Report",
      description: "Generated 3 weeks ago • Financial summary",
      icon: DollarSign,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100"
    }
  ];

  const reportTypes = [
    { id: "participation", label: "Participation Stats" },
    { id: "payout", label: "Payout Summary" },
    { id: "geographic", label: "Geographic Analysis" },
    { id: "cost", label: "Cost Analysis" }
  ];

  const handleReportTypeChange = (reportType: string, checked: boolean) => {
    if (checked) {
      setSelectedReportTypes([...selectedReportTypes, reportType]);
    } else {
      setSelectedReportTypes(selectedReportTypes.filter(type => type !== reportType));
    }
  };

  const handleGenerateReport = () => {
    // Implementation would generate custom report based on selected criteria
    console.log("Generating report with criteria:", {
      dateFrom,
      dateTo,
      selectedDistrict,
      selectedReportTypes
    });
  };

  const handleQuickReport = (reportType: string) => {
    // Implementation would generate predefined report
    console.log("Generating quick report:", reportType);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Reports</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickReports.map((report) => {
              const Icon = report.icon;
              
              return (
                <button
                  key={report.title}
                  onClick={() => handleQuickReport(report.title)}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
                  data-testid={`button-quick-report-${report.title.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 ${report.bgColor} rounded-lg flex items-center justify-center`}>
                        <Icon className={`w-4 h-4 ${report.color}`} />
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">{report.title}</span>
                        <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
                      </div>
                    </div>
                    <Download className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Custom Report Builder */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="w-5 h-5" />
                <span>Custom Report Builder</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date-from">From Date</Label>
                  <Input
                    id="date-from"
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    data-testid="input-date-from"
                  />
                </div>
                <div>
                  <Label htmlFor="date-to">To Date</Label>
                  <Input
                    id="date-to"
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    data-testid="input-date-to"
                  />
                </div>
              </div>

              {/* District Selection */}
              <div>
                <Label htmlFor="district">District/Ward</Label>
                <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                  <SelectTrigger data-testid="select-district">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Districts</SelectItem>
                    <SelectItem value="downtown">Downtown</SelectItem>
                    <SelectItem value="university">University Quarter</SelectItem>
                    <SelectItem value="central-park">Central Park Area</SelectItem>
                    <SelectItem value="industrial">Industrial Zone</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Report Types */}
              <div>
                <Label className="text-sm font-medium">Report Types</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {reportTypes.map((type) => (
                    <div key={type.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={type.id}
                        checked={selectedReportTypes.includes(type.id)}
                        onCheckedChange={(checked) => handleReportTypeChange(type.id, checked as boolean)}
                        data-testid={`checkbox-${type.id}`}
                      />
                      <Label 
                        htmlFor={type.id} 
                        className="text-sm font-normal cursor-pointer"
                      >
                        {type.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <Button
                  onClick={handleGenerateReport}
                  className="flex-1"
                  data-testid="button-generate-report"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
                <Button
                  variant="outline"
                  onClick={handleGenerateReport}
                  data-testid="button-export-csv"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentReports.map((report) => {
              const Icon = report.icon;
              
              return (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  data-testid={`report-item-${report.id}`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 ${report.bgColor} rounded-lg flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${report.color}`} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{report.name}</p>
                      <p className="text-sm text-muted-foreground">{report.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      data-testid={`button-view-${report.id}`}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      data-testid={`button-download-${report.id}`}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
