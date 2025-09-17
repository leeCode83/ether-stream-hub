import { Link, useLocation } from 'react-router-dom';
import { WalletConnect } from './WalletConnect';
import { Button } from './ui/button';
import { Home, Upload, Play } from 'lucide-react';

export function Navigation() {
  const location = useLocation();

  return (
    <nav className="bg-card border-b sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Play className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-primary">
            StreamDeFi
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-4">
          <Link to="/">
            <Button 
              variant={location.pathname === '/' ? 'premium' : 'ghost'} 
              size="sm"
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Home
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button 
              variant={location.pathname === '/dashboard' ? 'premium' : 'ghost'} 
              size="sm"
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Dashboard
            </Button>
          </Link>
        </div>

        {/* Wallet Connection */}
        <WalletConnect />
      </div>
    </nav>
  );
}