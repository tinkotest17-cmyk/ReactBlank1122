import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTrading } from '@/contexts/TradingContext';
import { TradingPair } from '@shared/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Timer, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  DollarSign,
  AlertTriangle,
  Play,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TRADE_DURATIONS = [
  { value: 2, label: '2 min' },
  { value: 3, label: '3 min' },
  { value: 5, label: '5 min' },
  { value: 10, label: '10 min' },
  { value: 15, label: '15 min' }
];

interface TimedTradingSectionProps {
  selectedPairId?: string;
}

export default function TimedTradingSection({ selectedPairId }: TimedTradingSectionProps) {
  const [amount, setAmount] = useState('');
  const [duration, setDuration] = useState(5);
  const [prediction, setPrediction] = useState<'up' | 'down'>('up');
  const [selectedPairIdState, setSelectedPairIdState] = useState(selectedPairId || '');
  const [isLoading, setIsLoading] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  
  const { user } = useAuth();
  const { pairs, executeTimedTrade } = useTrading();

  const selectedPair = pairs.find(p => p.id === selectedPairIdState);

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
    if (!selectedPair) {
      toast.error('Please select a trading pair');
      return;
    }

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
      const success = await executeTimedTrade(selectedPair.id, prediction, amountNum, duration);
      if (success) {
        toast.success(`Timed trade placed! Duration: ${duration} minutes`);
        setAmount('');
        setSelectedPairIdState('');
      } else {
        toast.error('Trade execution failed');
      }
    } catch (error) {
      toast.error('An error occurred during trade execution');
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToSection = () => {
    sectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Auto-scroll when a pair is selected from outside
  useState(() => {
    if (selectedPairId && selectedPairId !== selectedPairIdState) {
      setSelectedPairIdState(selectedPairId);
      setTimeout(scrollToSection, 100);
    }
  });

  return (
    <Card ref={sectionRef} className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
          <Timer className="h-6 w-6" />
          Timed Trading
          <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">
            Live Trading
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Trading Pair Selection */}
        <div className="space-y-2">
          <Label htmlFor="pair-select">Select Trading Pair</Label>
          <Select value={selectedPairIdState} onValueChange={setSelectedPairIdState}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a trading pair..." />
            </SelectTrigger>
            <SelectContent>
              {pairs.slice(0, 10).map((pair) => (
                <SelectItem key={pair.id} value={pair.id}>
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium">{pair.symbol}</span>
                    <div className="flex items-center gap-2 ml-4">
                      <span className="font-mono text-sm">{formatPrice(pair.price, pair.symbol)}</span>
                      <div className="flex items-center gap-1">
                        {pair.change24h >= 0 ? (
                          <ArrowUpRight className="h-3 w-3 text-green-500" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3 text-red-500" />
                        )}
                        <span className={`text-xs ${
                          pair.change24h >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {pair.change24h >= 0 ? '+' : ''}{pair.change24h.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Current Price Display */}
        {selectedPair && (
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-lg">{selectedPair.symbol}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">{selectedPair.name}</p>
              </div>
              <div className="text-right">
                <div className="font-mono text-2xl font-bold">
                  {formatPrice(selectedPair.price, selectedPair.symbol)}
                </div>
                <div className="flex items-center gap-1 justify-end">
                  {selectedPair.change24h >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`text-sm font-medium ${
                    selectedPair.change24h >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {selectedPair.change24h >= 0 ? '+' : ''}{selectedPair.change24h.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Trade Setup */}
          <div className="space-y-4">
            {/* Investment Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Trading Amount</Label>
              <Input
                id="amount"
                type="number"
                step="1"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount to trade"
                className="font-mono text-lg"
              />
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Available: {formatCurrency(user?.tradingBalance || 0)}
              </div>
            </div>

            {/* Trade Duration */}
            <div className="space-y-2">
              <Label>Trade Duration</Label>
              <div className="grid grid-cols-3 gap-2">
                {TRADE_DURATIONS.map((dur) => (
                  <Button
                    key={dur.value}
                    variant={duration === dur.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDuration(dur.value)}
                    className="text-sm"
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
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={prediction === 'up' ? "default" : "outline"}
                  onClick={() => setPrediction('up')}
                  className={`${prediction === 'up' ? 'bg-green-600 hover:bg-green-700' : 'border-green-200 text-green-700 hover:bg-green-50'}`}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  BUY
                </Button>
                <Button
                  variant={prediction === 'down' ? "default" : "outline"}
                  onClick={() => setPrediction('down')}
                  className={`${prediction === 'down' ? 'bg-red-600 hover:bg-red-700' : 'border-red-200 text-red-700 hover:bg-red-50'}`}
                >
                  <TrendingDown className="h-4 w-4 mr-2" />
                  SELL
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column - Trade Summary & Action */}
          <div className="space-y-4">
            {/* Trade Summary */}
            {amount && selectedPair && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Trade Summary</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Pair:</span>
                    <span className="font-medium">{selectedPair.symbol}</span>
                  </div>
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
                  <div className="flex justify-between font-medium text-green-600 pt-2 border-t">
                    <span>Potential Payout:</span>
                    <span className="font-mono">{formatCurrency(calculatePayout())}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Warnings */}
            <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-700 dark:text-amber-300 text-sm">
                <strong>Risk Warning:</strong> Only trade with what you can afford to loose. Trade responsibly!
              </AlertDescription>
            </Alert>

            {/* Balance Check */}
            {amount && parseFloat(amount) > (user?.tradingBalance || 0) && (
              <Alert className="bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700 dark:text-red-300 text-sm">
                  Insufficient trading balance. You have {formatCurrency(user?.tradingBalance || 0)} available.
                </AlertDescription>
              </Alert>
            )}

            {/* Action Button */}
            <Button
              onClick={handleTimedTrade}
              disabled={isLoading || !selectedPair || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > (user?.tradingBalance || 0)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-6"
            >
              {isLoading ? (
                <>
                  <Timer className="mr-2 h-5 w-5 animate-spin" />
                  Placing Trade...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-5 w-5" />
                  Start Timed Trade
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
