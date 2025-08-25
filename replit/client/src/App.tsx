import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Layout from "@/components/Layout";
import TouristDashboard from "@/pages/TouristDashboard";
import VideoUpload from "@/pages/VideoUpload";
import Submissions from "@/pages/Submissions";
import Wallet from "@/pages/Wallet";
import ModeratorDashboard from "@/pages/ModeratorDashboard";
import ReviewQueue from "@/pages/ReviewQueue";
import FraudTools from "@/pages/FraudTools";
import AuditLog from "@/pages/AuditLog";
import CouncilDashboard from "@/pages/CouncilDashboard";
import Reports from "@/pages/Reports";
import BudgetOverview from "@/pages/BudgetOverview";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={() => <Layout><TouristDashboard /></Layout>} />
          <Route path="/upload" component={() => <Layout><VideoUpload /></Layout>} />
          <Route path="/submissions" component={() => <Layout><Submissions /></Layout>} />
          <Route path="/wallet" component={() => <Layout><Wallet /></Layout>} />
          <Route path="/mod-dashboard" component={() => <Layout><ModeratorDashboard /></Layout>} />
          <Route path="/review-queue" component={() => <Layout><ReviewQueue /></Layout>} />
          <Route path="/fraud-tools" component={() => <Layout><FraudTools /></Layout>} />
          <Route path="/audit-log" component={() => <Layout><AuditLog /></Layout>} />
          <Route path="/council-dashboard" component={() => <Layout><CouncilDashboard /></Layout>} />
          <Route path="/reports" component={() => <Layout><Reports /></Layout>} />
          <Route path="/budget-overview" component={() => <Layout><BudgetOverview /></Layout>} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
