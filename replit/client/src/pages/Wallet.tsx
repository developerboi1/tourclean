import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { UserWallet, CashoutRequest } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { Coins, CreditCard, Clock, CheckCircle } from "lucide-react";

export default function Wallet() {
  const [pointsToConvert, setPointsToConvert] = useState("");
  const [payoutMethod, setPayoutMethod] = useState("");
  const [accountDetails, setAccountDetails] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: wallet } = useQuery<UserWallet>({
    queryKey: ['/api/wallet'],
  });

  const { data: cashoutHistory } = useQuery<CashoutRequest[]>({
    queryKey: ['/api/cashout'],
  });

  const cashoutMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/cashout', data);
    },
    onSuccess: () => {
      toast({
        title: "Cashout Request Submitted",
        description: "Your cashout request has been submitted for processing.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/cashout'] });
      queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
      // Reset form
      setPointsToConvert("");
      setPayoutMethod("");
      setAccountDetails("");
    },
    onError: (error) => {
      toast({
        title: "Cashout Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCashout = (e: React.FormEvent) => {
    e.preventDefault();
    
    const points = parseInt(pointsToConvert);
    
    if (!points || points < 100) {
      toast({
        title: "Invalid Amount",
        description: "Minimum 100 points required for cashout.",
        variant: "destructive",
      });
      return;
    }

    if (!wallet || wallet.pointsBalance < points) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough points for this cashout.",
        variant: "destructive",
      });
      return;
    }

    if (!payoutMethod || !accountDetails) {
      toast({
        title: "Missing Information",
        description: "Please select a payout method and enter account details.",
        variant: "destructive",
      });
      return;
    }

    cashoutMutation.mutate({
      pointsUsed: points,
      method: payoutMethod,
      destinationRef: accountDetails,
    });
  };

  const calculateCash = (points: number) => {
    return (points / 20).toFixed(2); // 20 points = $1
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'initiated': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'succeeded': return 'Completed';
      case 'failed': return 'Failed';
      case 'pending': return 'Processing';
      case 'initiated': return 'Initiated';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return '1 day ago';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Wallet Balance */}
      <div className="lg:col-span-2 space-y-6">
        {/* Balance Card */}
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Available Balance</p>
                <p className="text-4xl font-bold" data-testid="text-points-balance">
                  {wallet?.pointsBalance || 0} Points
                </p>
                <p className="text-green-100 text-sm mt-1">
                  ≈ ${calculateCash(wallet?.pointsBalance || 0)} USD
                </p>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <Coins className="w-8 h-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cash Out Form */}
        <Card>
          <CardHeader>
            <CardTitle>Request Cash Out</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCashout} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="points">Points to Convert</Label>
                  <Input
                    id="points"
                    type="number"
                    placeholder="Enter points"
                    min="100"
                    max={wallet?.pointsBalance || 0}
                    value={pointsToConvert}
                    onChange={(e) => setPointsToConvert(e.target.value)}
                    data-testid="input-points-to-convert"
                  />
                </div>
                <div>
                  <Label htmlFor="cash-amount">Cash Amount</Label>
                  <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-700">
                    ${pointsToConvert ? calculateCash(parseInt(pointsToConvert)) : '0.00'}
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="payout-method">Payout Method</Label>
                <Select value={payoutMethod} onValueChange={setPayoutMethod}>
                  <SelectTrigger data-testid="select-payout-method">
                    <SelectValue placeholder="Select payout method..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                    <SelectItem value="digital">Digital Wallet</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="account-details">Account Details</Label>
                <Input
                  id="account-details"
                  placeholder="Enter payment details"
                  value={accountDetails}
                  onChange={(e) => setAccountDetails(e.target.value)}
                  data-testid="input-account-details"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={cashoutMutation.isPending}
                data-testid="button-submit-cashout"
              >
                {cashoutMutation.isPending ? (
                  <>Processing...</>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Request Cash Out
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Payout History */}
      <Card>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
        </CardHeader>
        <CardContent>
          {!cashoutHistory || cashoutHistory.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-muted-foreground">No cashout history</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cashoutHistory.map((cashout) => (
                <div key={cashout.id} className="border-l-4 border-green-500 pl-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        ${cashout.cashAmount}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {cashout.pointsUsed} points
                      </p>
                    </div>
                    <Badge className={getStatusColor(cashout.status)}>
                      {getStatusLabel(cashout.status)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(cashout.createdAt)} • {cashout.method}
                  </p>
                  {cashout.failureReason && (
                    <p className="text-xs text-red-600 mt-1">
                      {cashout.failureReason}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
