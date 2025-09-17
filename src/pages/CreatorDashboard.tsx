import { useState } from 'react';
import { useAccount, useBalance, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VideoPlatformFactoryABI, VideoPlatformPaymentABI, WUSDTABI } from '@/contracts/abis';
import { CONTRACT_ADDRESSES } from '@/contracts/addresses';
import { formatEther, parseEther } from 'viem';
import { Upload, DollarSign, Wallet, Plus, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function CreatorDashboard() {
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  
  // Form states
  const [videoURI, setVideoURI] = useState('');
  const [viewingFee, setViewingFee] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  // Get user balances
  const { data: wusdtBalance } = useBalance({
    address,
    token: CONTRACT_ADDRESSES.WUSDT,
  });

  const { data: depositsBalance, refetch: refetchDeposits } = useReadContract({
    address: CONTRACT_ADDRESSES.PAYMENT,
    abi: VideoPlatformPaymentABI,
    functionName: 'deposits',
    args: address ? [address] : undefined,
  });

  // Contract write functions
  const { writeContract: createVideo, isPending: isCreatingVideo, data: createVideoHash } = useWriteContract({
    mutation: {
      onSuccess: () => {
        toast({
          title: "Video Created!",
          description: "Your video contract has been deployed successfully.",
        });
        setVideoURI('');
        setViewingFee('');
      },
      onError: (error) => {
        toast({
          title: "Creation Failed",
          description: error.message,
          variant: "destructive",
        });
      },
    },
  });

  const { writeContract: approveToken, isPending: isApproving } = useWriteContract({
    mutation: {
      onError: (error) => {
        toast({
          title: "Approval Failed",
          description: error.message,
          variant: "destructive",
        });
      },
    },
  });

  const { writeContract: depositTokens, isPending: isDepositing } = useWriteContract({
    mutation: {
      onSuccess: () => {
        toast({
          title: "Deposit Successful!",
          description: "WUSDT tokens have been deposited to your account.",
        });
        setDepositAmount('');
        refetchDeposits();
      },
      onError: (error) => {
        toast({
          title: "Deposit Failed",
          description: error.message,
          variant: "destructive",
        });
      },
    },
  });

  const { writeContract: withdrawTokens, isPending: isWithdrawing } = useWriteContract({
    mutation: {
      onSuccess: () => {
        toast({
          title: "Withdrawal Successful!",
          description: "WUSDT tokens have been withdrawn to your wallet.",
        });
        setWithdrawAmount('');
        refetchDeposits();
      },
      onError: (error) => {
        toast({
          title: "Withdrawal Failed",
          description: error.message,
          variant: "destructive",
        });
      },
    },
  });

  // Wait for transaction confirmations
  const { isLoading: isCreateVideoConfirming } = useWaitForTransactionReceipt({ hash: createVideoHash });

  const handleCreateVideo = () => {
    if (!videoURI || !viewingFee) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const feeInWei = parseEther(viewingFee);
    writeContract({
      address: CONTRACT_ADDRESSES.FACTORY,
      abi: VideoPlatformFactoryABI,
      functionName: 'createVideoContract',
      args: [feeInWei, videoURI],
    });
    } catch (error) {
      toast({
        title: "Invalid Fee",
        description: "Please enter a valid viewing fee.",
        variant: "destructive",
      });
    }
  };

  const handleDeposit = async () => {
    if (!depositAmount) return;

    try {
      const amountInWei = parseEther(depositAmount);
      
      approveToken({
        address: CONTRACT_ADDRESSES.WUSDT,
        abi: WUSDTABI,
        functionName: 'approve',
        args: [CONTRACT_ADDRESSES.PAYMENT, amountInWei],
      });

      // Note: In a production app, you'd want to wait for approval confirmation
      // before calling deposit. For this demo, we'll assume quick confirmation.
      setTimeout(() => {
        depositTokens({
          address: CONTRACT_ADDRESSES.PAYMENT,
          abi: VideoPlatformPaymentABI,
          functionName: 'deposit',
          args: [amountInWei],
        });
      }, 2000);
    } catch (error) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid deposit amount.",
        variant: "destructive",
      });
    }
  };

  const handleWithdraw = () => {
    if (!withdrawAmount) return;

    try {
      const amountInWei = parseEther(withdrawAmount);
      withdrawTokens({
        address: CONTRACT_ADDRESSES.PAYMENT,
        abi: VideoPlatformPaymentABI,
        functionName: 'withdraw',
        args: [amountInWei],
      });
    } catch (error) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid withdrawal amount.",
        variant: "destructive",
      });
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Creator Dashboard</h1>
            <p className="text-muted-foreground mb-8">
              Connect your wallet to access the creator dashboard.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Creator Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your videos, earnings, and account balance.
          </p>
        </div>

        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="glass-card border-glass-border">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload Video
            </TabsTrigger>
            <TabsTrigger value="earnings" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Earnings
            </TabsTrigger>
            <TabsTrigger value="wallet" className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Wallet
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <Card className="glass-card border-glass-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Create New Video
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="videoURI">Video URI</Label>
                  <Input
                    id="videoURI"
                    placeholder="https://your-video-url.mp4"
                    value={videoURI}
                    onChange={(e) => setVideoURI(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="viewingFee">Viewing Fee (WUSDT)</Label>
                  <Input
                    id="viewingFee"
                    type="number"
                    step="0.01"
                    placeholder="0.01"
                    value={viewingFee}
                    onChange={(e) => setViewingFee(e.target.value)}
                  />
                </div>

                <Button 
                  onClick={handleCreateVideo}
                  disabled={isCreatingVideo || isCreateVideoConfirming}
                  variant="hero"
                  className="w-full"
                >
                  {isCreatingVideo || isCreateVideoConfirming ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Video Contract
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="earnings">
            <Card className="glass-card border-glass-border">
              <CardHeader>
                <CardTitle>Your Earnings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {depositsBalance ? formatEther(depositsBalance) : '0'} WUSDT
                  </div>
                  <p className="text-muted-foreground">Available for withdrawal</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wallet" className="space-y-6">
            {/* Balance Overview */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="glass-card border-glass-border">
                <CardHeader>
                  <CardTitle className="text-lg">Wallet Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {wusdtBalance ? formatEther(wusdtBalance.value) : '0'} WUSDT
                  </div>
                  <p className="text-sm text-muted-foreground">Available in wallet</p>
                </CardContent>
              </Card>

              <Card className="glass-card border-glass-border">
                <CardHeader>
                  <CardTitle className="text-lg">Platform Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {depositsBalance ? formatEther(depositsBalance) : '0'} WUSDT
                  </div>
                  <p className="text-sm text-muted-foreground">Deposited on platform</p>
                </CardContent>
              </Card>
            </div>

            {/* Deposit Section */}
            <Card className="glass-card border-glass-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-success">
                  <ArrowDownLeft className="h-5 w-5" />
                  Deposit WUSDT
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="depositAmount">Amount</Label>
                  <Input
                    id="depositAmount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handleDeposit}
                  disabled={isApproving || isDepositing}
                  variant="premium"
                  className="w-full"
                >
                  {isApproving || isDepositing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ArrowDownLeft className="h-4 w-4 mr-2" />
                      Deposit
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Withdraw Section */}
            <Card className="glass-card border-glass-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-warning">
                  <ArrowUpRight className="h-5 w-5" />
                  Withdraw WUSDT
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="withdrawAmount">Amount</Label>
                  <Input
                    id="withdrawAmount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handleWithdraw}
                  disabled={isWithdrawing}
                  variant="outline"
                  className="w-full"
                >
                  {isWithdrawing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ArrowUpRight className="h-4 w-4 mr-2" />
                      Withdraw
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}