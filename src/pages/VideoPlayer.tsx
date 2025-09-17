import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
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

  const { data: hasWatched } = useReadContract({
    address: videoContractAddress as `0x${string}`,
    abi: VideoABI,
    functionName: 'viewingHistory',
    args: userAddress ? [userAddress] : undefined,
  });

  // Watch video transaction
  const { writeContract, isPending } = useWriteContract();

  const handleWatchVideo = () => {
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
          <Card className="clean-card hover-lift mb-6">
            <CardContent className="p-0">
              <div className="relative aspect-video bg-muted rounded-t-lg overflow-hidden">
                {canWatch ? (
                  videoURI ? (
                    <video controls className="w-full h-full">
                      <source src={videoURI} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <AlertCircle className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center space-y-4">
                      <Lock className="h-16 w-16 mx-auto text-primary" />
                      <div>
                        <h3 className="text-xl font-semibold mb-2">Premium Content</h3>
                        <p className="text-muted-foreground mb-4">
                          Pay {viewingFee ? formatEther(viewingFee) : '0'} WUSDT to unlock this video
                        </p>
                        <Button 
                          onClick={handleWatchVideo}
                          disabled={isPending}
                          variant="hero"
                          size="lg"
                        >
                          {isPending ? 'Processing...' : 'Watch Video'}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="clean-card hover-lift">
            <CardHeader>
              <CardTitle>{videoTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Price: {viewingFee ? formatEther(viewingFee) : '0'} WUSDT
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}