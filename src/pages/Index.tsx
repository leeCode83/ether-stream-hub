import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePublicClient } from 'wagmi';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { VideoPlatformFactoryABI } from '@/contracts/abis';
import { CONTRACT_ADDRESSES } from '@/contracts/addresses';
import { formatEther } from 'viem';
import { Play, Search, Zap, Shield, Coins, Upload } from 'lucide-react';
import type { Video } from '@/types/video';

export default function Index() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const publicClient = usePublicClient();

  useEffect(() => {
    async function fetchVideos() {
      if (!publicClient) return;

      try {
        // Fetch VideoContractCreated events from the factory
        const logs = await publicClient.getLogs({
          address: CONTRACT_ADDRESSES.FACTORY,
          event: {
            type: 'event',
            name: 'VideoContractCreated',
            inputs: [
              { type: 'address', name: 'creator', indexed: true },
              { type: 'address', name: 'videoContract', indexed: false },
              { type: 'uint256', name: 'viewingFee', indexed: false },
              { type: 'string', name: 'videoURI', indexed: false },
            ],
          },
          fromBlock: 'earliest',
          toBlock: 'latest',
        });

        const videoList: Video[] = logs.map((log, index) => {
          const args = log.args as {
            creator: string;
            videoContract: string;
            viewingFee: bigint;
            videoURI: string;
          };

          const title = args.videoURI.split('/').pop()?.replace(/\.[^/.]+$/, "") || `Video ${index + 1}`;

          return {
            id: args.videoContract,
            contractAddress: args.videoContract,
            creator: args.creator,
            title,
            videoURI: args.videoURI,
            viewingFee: args.viewingFee,
          };
        });

        setVideos(videoList.reverse()); // Show newest first
      } catch (error) {
        console.error('Error fetching videos:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchVideos();
  }, [publicClient]);

  const filteredVideos = videos.filter(video =>
    video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.creator.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-hero bg-clip-text text-transparent">
              StreamDeFi
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              The future of video streaming powered by blockchain technology.
              <br />
              Upload, monetize, and discover premium content with cryptocurrency.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/dashboard">
                <Button variant="hero" size="lg" className="text-lg px-8 py-4">
                  <Upload className="h-5 w-5 mr-2" />
                  Start Creating
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                <Play className="h-5 w-5 mr-2" />
                Watch Videos
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="glass-card border-glass-border text-center p-6">
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Instant Payments</h3>
              <p className="text-muted-foreground">
                Pay and get paid instantly with WUSDT tokens on the blockchain.
              </p>
            </Card>

            <Card className="glass-card border-glass-border text-center p-6">
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure & Transparent</h3>
              <p className="text-muted-foreground">
                All transactions are secured by smart contracts on the blockchain.
              </p>
            </Card>

            <Card className="glass-card border-glass-border text-center p-6">
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                <Coins className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Direct Monetization</h3>
              <p className="text-muted-foreground">
                Creators earn directly from viewers without intermediaries.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Video Feed Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Latest Videos</h2>
              <p className="text-muted-foreground">
                Discover premium content from creators around the world.
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 md:w-80">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search videos or creators..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <Card key={index} className="glass-card border-glass-border">
                  <CardContent className="p-0">
                    <div className="aspect-video bg-muted animate-pulse rounded-t-lg" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-muted animate-pulse rounded" />
                      <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredVideos.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVideos.map((video) => (
                <Link key={video.id} to={`/video/${video.contractAddress}`}>
                  <Card className="glass-card border-glass-border hover:shadow-glow transition-all duration-300 transform hover:scale-105 cursor-pointer group">
                    <CardContent className="p-0">
                      <div className="relative aspect-video bg-gradient-to-br from-muted to-muted/50 rounded-t-lg overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center group-hover:bg-black/20 transition-colors duration-300">
                          <Play className="h-12 w-12 text-primary opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" />
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-300">
                          {video.title}
                        </h3>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span className="truncate">
                            {video.creator.slice(0, 6)}...{video.creator.slice(-4)}
                          </span>
                          <span className="font-semibold text-primary">
                            {formatEther(video.viewingFee)} WUSDT
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Play className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {searchQuery ? 'No videos found' : 'No videos yet'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery 
                  ? 'Try adjusting your search terms.'
                  : 'Be the first to upload a video to the platform!'}
              </p>
              {!searchQuery && (
                <Link to="/dashboard">
                  <Button variant="hero">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload First Video
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}