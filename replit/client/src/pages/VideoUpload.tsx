import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiRequest } from "@/lib/queryClient";
import { Video, Upload, CloudUpload, MapPin, Clock, Info } from "lucide-react";

export default function VideoUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [wasteType, setWasteType] = useState("");
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get user location
  useState(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return apiRequest('POST', '/api/submissions', formData);
    },
    onSuccess: () => {
      toast({
        title: "Video Uploaded Successfully",
        description: "Your submission has been queued for review.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/submissions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
      // Reset form
      setFile(null);
      setWasteType("");
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 100 * 1024 * 1024) { // 100MB limit
        toast({
          title: "File Too Large",
          description: "Video file must be under 100MB.",
          variant: "destructive",
        });
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast({
        title: "Video Required",
        description: "Please select a video file to upload.",
        variant: "destructive",
      });
      return;
    }

    if (!wasteType) {
      toast({
        title: "Waste Type Required",
        description: "Please select the type of waste being disposed.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('video', file);
    formData.append('wasteType', wasteType);
    formData.append('duration', Math.floor(15 + Math.random() * 20).toString()); // Mock duration
    formData.append('deviceHash', 'browser-' + Date.now());
    
    if (location) {
      formData.append('gpsLat', location.lat.toString());
      formData.append('gpsLng', location.lng.toString());
    }

    uploadMutation.mutate(formData);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Video className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Upload Waste Disposal Video</h1>
        <p className="text-muted-foreground">
          Record yourself properly disposing of waste to earn points
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Video Submission</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Video Upload */}
            <div className="space-y-2">
              <Label htmlFor="video">Video File</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                <input
                  id="video"
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="hidden"
                  data-testid="input-video-file"
                />
                <label htmlFor="video" className="cursor-pointer">
                  <CloudUpload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    {file ? file.name : 'Drop your video here'}
                  </p>
                  <p className="text-muted-foreground">
                    or click to browse (MP4, max 100MB)
                  </p>
                </label>
              </div>
              {file && (
                <p className="text-sm text-green-600 mt-2">
                  ✓ Video selected: {file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)
                </p>
              )}
            </div>

            {/* Auto-captured Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Location</Label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-900 flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    {location ? 'GPS Location Detected' : 'Getting location...'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {location 
                      ? `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`
                      : 'Auto-detected via GPS'
                    }
                  </p>
                </div>
              </div>
              <div>
                <Label>Timestamp</Label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-900 flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Just now
                  </p>
                  <p className="text-xs text-muted-foreground">Auto-captured</p>
                </div>
              </div>
            </div>

            {/* Waste Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="waste-type">Waste Type</Label>
              <Select value={wasteType} onValueChange={setWasteType}>
                <SelectTrigger data-testid="select-waste-type">
                  <SelectValue placeholder="Select waste type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="plastic-bottles">Plastic Bottles</SelectItem>
                  <SelectItem value="aluminum-cans">Aluminum Cans</SelectItem>
                  <SelectItem value="paper-cardboard">Paper/Cardboard</SelectItem>
                  <SelectItem value="glass-containers">Glass Containers</SelectItem>
                  <SelectItem value="electronic-waste">Electronic Waste</SelectItem>
                  <SelectItem value="general-recyclables">General Recyclables</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={uploadMutation.isPending}
              data-testid="button-submit-video"
            >
              {uploadMutation.isPending ? (
                <>Processing...</>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Submit Video for Review
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Upload Guidelines */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Upload Guidelines:</strong>
          <ul className="mt-2 space-y-1 text-sm">
            <li>• Video must be at least 10 seconds long</li>
            <li>• Clearly show yourself disposing of waste properly</li>
            <li>• Must be recorded within 500m of a registered waste bin</li>
            <li>• No duplicate submissions within 24 hours</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
}
