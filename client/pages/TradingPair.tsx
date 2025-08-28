import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTrading } from '@/contexts/TradingContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Activity, Volume2 } from 'lucide-react';
import PriceChart from '@/components/PriceChart';
import TradingModal from '@/components/TradingModal';

export default function TradingPair() {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const { pairs } = useTrading();
  const { user } = useAuth();
  const [showTradingModal, setShowTradingModal] = useState(false);

  const pair = pairs.find(p => p.symbol === symbol);

  useEffect(() => {
    if (!pair) {
      navigate('/');
    }
  }, [pair, navigate]);

  if (!pair) {
    return null;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPrice = (price: number) => {
    const decimals = pair.symbol.includes('JPY') ? 2 : 4;
    return price.toFixed(decimals);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {pair.symbol}
            </h1>
            <p className="text-slate-600 dark:text-slate-400">{pair.name}</p>
          </div>
        </div>
        
        <Button 
          onClick={() => setShowTradingModal(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Trade {pair.symbol}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2">
          <PriceChart pair={pair} height={400} />
        </div>

        {/* Trading Info */}
        <div className="space-y-6">
          {/* Price Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Market Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600 dark:text-slate-400">Current Price</span>
                <span className="font-mono text-lg font-semibold">
                  {formatPrice(pair.price)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600 dark:text-slate-400">24h Change</span>
                <Badge variant={pair.change24h >= 0 ? 'default' : 'destructive'}>
                  {pair.change24h >= 0 ? '+' : ''}{pair.change24h.toFixed(2)}%
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600 dark:text-slate-400">24h Volume</span>
                <div className="flex items-center gap-1">
                  <Volume2 className="h-3 w-3 text-slate-500" />
                  <span className="font-medium">{formatCurrency(pair.volume24h)}</span>
                </div>
              </div>
              
              <div className="pt-2 border-t">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Activity className="h-3 w-3" />
                  <span>Market Status: </span>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                    ACTIVE
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Balance */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Balance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600 dark:text-slate-400">Total Balance</span>
                <span className="font-semibold">
                  {formatCurrency(user?.totalBalance || 0)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600 dark:text-slate-400">Trading Balance</span>
                <span className="font-semibold text-blue-600">
                  {formatCurrency(user?.tradingBalance || 0)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Trade */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Trade</CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setShowTradingModal(true)}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Open Trading Panel
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Trading Modal */}
      <TradingModal
        pair={pair}
        isOpen={showTradingModal}
        onClose={() => setShowTradingModal(false)}
      />
    </div>
  );
}
