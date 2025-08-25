import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import type { UserWallet, VideoSubmission } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Recycle, 
  Home, 
  Upload, 
  List, 
  Wallet,
  BarChart3,
  ClipboardList,
  Shield,
  History,
  FileText,
  DollarSign,
  Bell,
  Settings,
  Coins
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

const getRoleBasedNav = (role: string) => {
  switch (role) {
    case 'moderator':
      return [
        { path: '/mod-dashboard', label: 'Dashboard', icon: Home },
        { path: '/review-queue', label: 'Review Queue', icon: ClipboardList },
        { path: '/fraud-tools', label: 'Fraud Detection', icon: Shield },
        { path: '/audit-log', label: 'Audit Log', icon: History },
      ];
    case 'council':
      return [
        { path: '/council-dashboard', label: 'Analytics', icon: BarChart3 },
        { path: '/reports', label: 'Reports', icon: FileText },
        { path: '/budget-overview', label: 'Budget Overview', icon: DollarSign },
      ];
    default: // tourist
      return [
        { path: '/', label: 'Dashboard', icon: Home },
        { path: '/upload', label: 'Upload Video', icon: Upload },
        { path: '/submissions', label: 'My Submissions', icon: List },
        { path: '/wallet', label: 'Wallet', icon: Wallet },
      ];
  }
};

export default function Layout({ children }: LayoutProps) {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();
  const [selectedRole, setSelectedRole] = useState(user?.role || 'tourist');

  const { data: wallet } = useQuery<UserWallet>({
    queryKey: ['/api/wallet'],
    enabled: !!user && user.role === 'tourist',
  });

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const navItems = getRoleBasedNav(selectedRole);
  const currentPath = location;

  const handleRoleChange = (newRole: string) => {
    setSelectedRole(newRole);
    // Navigate to the appropriate dashboard based on role
    const roleRoutes = {
      tourist: '/',
      moderator: '/mod-dashboard',
      council: '/council-dashboard'
    };
    window.location.href = roleRoutes[newRole as keyof typeof roleRoutes] || '/';
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg border-r border-gray-200 fixed h-full z-20">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Recycle className="text-white text-lg" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">EcoPoints</h1>
              <p className="text-sm text-muted-foreground">Waste Management</p>
            </div>
          </div>
        </div>

        {/* Role Selector */}
        <div className="p-4 border-b border-gray-200">
          <label className="text-sm font-medium text-gray-700 block mb-2">Current Role</label>
          <Select value={selectedRole} onValueChange={handleRoleChange}>
            <SelectTrigger data-testid="select-role">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tourist">Tourist</SelectItem>
              <SelectItem value="moderator">Moderator Admin</SelectItem>
              <SelectItem value="council">City Council</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            
            return (
              <Link key={item.path} href={item.path}>
                <div
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                  {item.label === 'Review Queue' && selectedRole === 'moderator' && (
                    <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full ml-auto">
                      7
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.profileImageUrl || ''} />
              <AvatarFallback>
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900" data-testid="text-username">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {selectedRole}
              </p>
            </div>
            <Button variant="ghost" size="sm" data-testid="button-settings">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900" data-testid="text-page-title">
                Dashboard
              </h2>
              <p className="text-muted-foreground" data-testid="text-page-subtitle">
                Welcome back! Here's your overview.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="relative" data-testid="button-notifications">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full"></span>
              </Button>
              {selectedRole === 'tourist' && wallet && (
                <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg">
                  <Coins className="h-4 w-4 text-green-600" />
                  <span className="font-semibold text-green-700" data-testid="text-points-balance">
                    {wallet.pointsBalance} points
                  </span>
                </div>
              )}
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/api/logout'}
                data-testid="button-logout"
              >
                Logout
              </Button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
