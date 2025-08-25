import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Recycle, Video, Coins, Shield, Users, BarChart3 } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Recycle className="text-white text-lg" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">EcoPoints</h1>
                <p className="text-sm text-muted-foreground">Waste Management Platform</p>
              </div>
            </div>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              data-testid="button-login"
            >
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Turn Waste into
            <span className="text-primary"> Rewards</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Join our video-based eco-points system where tourists can earn rewards 
            for proper waste disposal while helping cities maintain cleaner environments.
          </p>
          <Button 
            size="lg" 
            onClick={() => window.location.href = '/api/login'}
            className="text-lg px-8 py-4"
            data-testid="button-get-started"
          >
            Get Started Today
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Submit Videos</h3>
              <p className="text-muted-foreground">
                Record yourself properly disposing of waste and upload videos for verification.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Coins className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Earn Points</h3>
              <p className="text-muted-foreground">
                Get rewarded with points for every approved waste disposal video submission.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Quality Control</h3>
              <p className="text-muted-foreground">
                Professional moderation ensures authentic submissions and fair reward distribution.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Role-based Benefits */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Benefits for Everyone
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-8">
                <div className="flex items-center space-x-3 mb-4">
                  <Users className="h-6 w-6 text-primary" />
                  <h3 className="text-xl font-semibold">For Tourists</h3>
                </div>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Earn money for proper waste disposal</li>
                  <li>• Simple video submission process</li>
                  <li>• Track your environmental impact</li>
                  <li>• Secure payment processing</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8">
                <div className="flex items-center space-x-3 mb-4">
                  <Shield className="h-6 w-6 text-green-600" />
                  <h3 className="text-xl font-semibold">For Moderators</h3>
                </div>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Comprehensive review tools</li>
                  <li>• Fraud detection systems</li>
                  <li>• Detailed audit trails</li>
                  <li>• Efficient workflow management</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8">
                <div className="flex items-center space-x-3 mb-4">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                  <h3 className="text-xl font-semibold">For City Council</h3>
                </div>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Real-time participation analytics</li>
                  <li>• Geographic distribution insights</li>
                  <li>• Budget tracking and reporting</li>
                  <li>• Environmental impact metrics</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-20">
          <Card className="bg-primary text-white">
            <CardContent className="p-12">
              <h2 className="text-3xl font-bold mb-4">Ready to Make a Difference?</h2>
              <p className="text-xl mb-8 text-blue-100">
                Join thousands of users already earning rewards for environmental responsibility.
              </p>
              <Button 
                size="lg" 
                variant="secondary"
                onClick={() => window.location.href = '/api/login'}
                className="text-lg px-8 py-4"
                data-testid="button-join-now"
              >
                Join Now - It's Free
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
