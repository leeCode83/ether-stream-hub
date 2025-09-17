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
  const { writeContract: createVideo, isPending: isCreatingVideo } = useWriteContract();
  const { writeContract: approveToken, isPending: isApproving } = useWriteContract();
  const { writeContract: depositTokens, isPending: isDepositing } = useWriteContract();
  const { writeContract: withdrawTokens, isPending: isWithdrawing } = useWriteContract();

  const handleCreateVideo = () => {
    createVideo({
      address: CONTRACT_ADDRESSES.FACTORY,
      abi: VideoPlatformFactoryABI,
      functionName: 'createVideoContract',
      args: [parseEther(viewingFee), videoURI],
    });
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
          <TabsList className="clean-card">
            <TabsTrigger value="upload">Upload Video</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
            <TabsTrigger value="wallet">Wallet</TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <Card className="clean-card hover-lift">
              <CardHeader>
                <CardTitle>Create New Video</CardTitle>
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
                  disabled={isCreatingVideo}
                  variant="hero"
                  className="w-full"
                >
                  {isCreatingVideo ? 'Creating...' : 'Create Video Contract'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="earnings">
            <Card className="clean-card hover-lift">
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

          <TabsContent value="wallet">
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="clean-card hover-lift">
                  <CardHeader>
                    <CardTitle>Wallet Balance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {wusdtBalance ? formatEther(wusdtBalance.value) : '0'} WUSDT
                    </div>
                  </CardContent>
                </Card>

                <Card className="clean-card hover-lift">
                  <CardHeader>
                    <CardTitle>Platform Balance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {depositsBalance ? formatEther(depositsBalance) : '0'} WUSDT
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}