import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTrading } from '@/contexts/TradingContext';
import { TradingPair } from '@shared/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  DollarSign,
  AlertTriangle,
  Timer
} from 'lucide-react';
import { toast } from 'sonner';

interface TimedTradingModalProps {
  pair: TradingPair;
  isOpen: boolean;
  onClose: () => void;
}

const TRADE_DURATIONS = [
  { value: 2, label: '2 min' },
  { value: 3, label: '3 min' },
  { value: 5, label: '5 min' },
  { value: 10, label: '10 min' },
  { value: 15, label: '15 min' }
];

export default function TimedTradingModal({ pair, isOpen, onClose }: TimedTradingModalProps) {
  const [amount, setAmount] = useState('');
  const [duration, setDuration] = useState(5);
  const [prediction, setPrediction] = useState<'up' | 'down'>('up');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { executeTimedTrade } = useTrading();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatPrice = (price: number, symbol: string) => {
    const decimals = symbol.includes('JPY') ? 2 : symbol.includes('/') ? 4 : 6;
    return price.toFixed(decimals);
  };

  const calculatePayout = () => {
    const amountNum = parseFloat(amount) || 0;
    return amountNum * 1.85; // 85% payout
  };

  const handleTimedTrade = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const amountNum = parseFloat(amount);
    if (amountNum > (user?.tradingBalance || 0)) {
      toast.error('Insufficient trading balance');
      return;
    }

    setIsLoading(true);
    try {
      const success = await executeTimedTrade(pair.id, prediction, amountNum, duration);
      if (success) {
        toast.success(`Timed trade placed! Duration: ${duration} minutes`);
        setAmount('');
        onClose();
      } else {
        toast.error('Trade execution failed');
      }
    } catch (error) {
      toast.error('An error occurred during trade execution');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setAmount('');
    setPrediction('up');
    setDuration(5);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5 text-blue-600" />
            Timed Trade - {pair.symbol}
          </DialogTitle>
          <DialogDescription>
            {pair.name} • Predict price direction in {duration} minutes
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Price */}
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Current Price</span>
              <div className="text-right">
                <div className="font-mono text-xl font-bold">
                  {formatPrice(pair.price, pair.symbol)}
                </div>
                <div className="flex items-center gap-1">
                  {pair.change24h >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span className={`text-sm ${
                    pair.change24h >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {pair.change24h >= 0 ? '+' : ''}{pair.change24h.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Trading Form */}
          <div className="space-y-4">
            {/* Investment Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Trading  Amount</Label>
              <Input
                id="amount"
                type="number"
                step="1"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount to trade"
                className="font-mono"
              />
            </div>

            {/* Trade Duration */}
            <div className="space-y-2">
              <Label>Trade Duration</Label>
              <div className="grid grid-cols-5 gap-2">
                {TRADE_DURATIONS.map((dur) => (
                  <Button
                    key={dur.value}
                    variant={duration === dur.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDuration(dur.value)}
                    className="text-xs"
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    {dur.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Prediction */}
            <div className="space-y-2">
              <Label>Price Prediction</Label>
              <Tabs value={prediction} onValueChange={(value) => setPrediction(value as 'up' | 'down')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="up" className="text-green-600 data-[state=active]:bg-green-100 data-[state=active]:text-green-700">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    BUY
                  </TabsTrigger>
                  <TabsTrigger value="down" className="text-red-600 data-[state=active]:bg-red-100 data-[state=active]:text-red-700">
                    <TrendingDown className="h-4 w-4 mr-1" />
                    SELL
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Trade Summary */}
            {amount && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Trade Summary</span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Investment:</span>
                    <span className="font-mono">{formatCurrency(parseFloat(amount))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Duration:</span>
                    <span className="font-medium">{duration} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Prediction:</span>
                    <Badge variant={prediction === 'up' ? 'default' : 'destructive'}>
                      {prediction.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex justify-between font-medium text-green-600">
                    <span>Potential Payout:</span>
                    <span className="font-mono">{formatCurrency(calculatePayout())}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Warning */}
            <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-700 dark:text-amber-300">
                <strong>Trading Ratio:</strong> Only trades with what you can afford to loss. Trade responsibly!
              </AlertDescription>
            </Alert>

            {/* Balance Check */}
            {amount && parseFloat(amount) > (user?.tradingBalance || 0) && (
              <Alert className="bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700 dark:text-red-300">
                  Insufficient trading balance. You have {formatCurrency(user?.tradingBalance || 0)} available.
                </AlertDescription>
              </Alert>
            )}

            {/* Available Balance */}
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Available balance: <span className="font-medium">{formatCurrency(user?.tradingBalance || 0)}</span>
            </div>
          </div>

          {/* Action Button */}
          <Button
            onClick={handleTimedTrade}
            disabled={isLoading || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > (user?.tradingBalance || 0)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? 'Placing Trade...' : `Place Timed Trade`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
