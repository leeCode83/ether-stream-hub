import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VideoABI } from '@/contracts/abis';
import { formatEther } from 'viem';
import { Play, Lock, Check, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function VideoPlayer() {
  const { address: videoContractAddress } = useParams<{ address: string }>();
  const { address: userAddress, isConnected } = useAccount();
  const { toast } = useToast();
  const [hasAccess, setHasAccess] = useState(false);

  // Contract reads
  const { data: videoURI } = useReadContract({
    address: videoContractAddress as `0x${string}`,
    abi: VideoABI,
    functionName: 'videoURI',
  });

  const { data: viewingFee } = useReadContract({
    address: videoContractAddress as `0x${string}`,
    abi: VideoABI,
    functionName: 'viewingFee',
  });

  const { data: creator } = useReadContract({
    address: videoContractAddress as `0x${string}`,
    abi: VideoABI,
    functionName: 'creator',
  });

  const { data: hasWatched } = useReadContract({
    address: videoContractAddress as `0x${string}`,
    abi: VideoABI,
    functionName: 'viewingHistory',
    args: userAddress ? [userAddress] : undefined,
  });

  // Watch video transaction
  const { writeContract, data: hash, isPending } = useWriteContract({
    mutation: {
      onSuccess: () => {
        toast({
          title: "Payment Successful!",
          description: "You now have access to this video.",
        });
        setHasAccess(true);
      },
      onError: (error) => {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      },
    },
  });

  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  const handleWatchVideo = () => {
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to watch videos.",
        variant: "destructive",
      });
      return;
    }

    writeContract({
      address: videoContractAddress as `0x${string}`,
      abi: VideoABI,
      functionName: 'watchVideo',
    });
  };

  const canWatch = hasWatched || hasAccess;
  const videoTitle = videoURI ? videoURI.split('/').pop()?.replace(/\.[^/.]+$/, "") || "Untitled Video" : "Loading...";

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Video Player Section */}
          <Card className="glass-card border-glass-border mb-6">
            <CardContent className="p-0">
              <div className="relative aspect-video bg-gradient-to-br from-muted to-muted/50 rounded-t-lg overflow-hidden">
                {canWatch ? (
                  videoURI ? (
                    <video 
                      controls 
                      className="w-full h-full"
                      poster="/placeholder-video.jpg"
                    >
                      <source src={videoURI} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">Video not available</p>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center space-y-4">
                      <Lock className="h-16 w-16 mx-auto text-primary animate-glow-pulse" />
                      <div>
                        <h3 className="text-xl font-semibold mb-2">Premium Content</h3>
                        <p className="text-muted-foreground mb-4">
                          Pay {viewingFee ? formatEther(viewingFee) : '0'} WUSDT to unlock this video
                        </p>
                        <Button 
                          onClick={handleWatchVideo}
                          disabled={isPending || isConfirming}
                          variant="hero"
                          size="lg"
                          className="animate-glow-pulse"
                        >
                          {isPending || isConfirming ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-2" />
                              Watch Video
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Video Information */}
          <Card className="glass-card border-glass-border">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="text-2xl font-bold">{videoTitle}</span>
                {canWatch && (
                  <div className="flex items-center text-success">
                    <Check className="h-5 w-5 mr-1" />
                    <span className="text-sm">Purchased</span>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  Creator: {creator ? `${creator.slice(0, 6)}...${creator.slice(-4)}` : 'Loading...'}
                </span>
                <span>
                  Price: {viewingFee ? formatEther(viewingFee) : '0'} WUSDT
                </span>
              </div>
              
              {!isConnected && (
                <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                  <p className="text-warning-foreground text-sm">
                    Connect your wallet to purchase and watch this video.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}