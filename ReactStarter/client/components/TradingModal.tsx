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
  DollarSign, 
  Calculator,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

interface TradingModalProps {
  pair: TradingPair;
  isOpen: boolean;
  onClose: () => void;
}

export default function TradingModal({ pair, isOpen, onClose }: TradingModalProps) {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { executeTrade } = useTrading();

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

  const calculateTotal = () => {
    const amountNum = parseFloat(amount) || 0;
    return amountNum * pair.price;
  };

  const handleTrade = async (action: 'buy' | 'sell') => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const total = calculateTotal();
    if (total > (user?.tradingBalance || 0)) {
      toast.error('Insufficient trading balance');
      return;
    }

    setIsLoading(true);
    try {
      const success = await executeTrade(pair.id, action, parseFloat(amount));
      if (success) {
        toast.success(`${action.toUpperCase()} order executed successfully!`);
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
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Trade {pair.symbol}
          </DialogTitle>
          <DialogDescription>
            {pair.name}
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
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (Units)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount to trade"
                className="font-mono"
              />
            </div>

            {amount && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Calculator className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Order Summary</span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Amount:</span>
                    <span className="font-mono">{amount} units</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Price:</span>
                    <span className="font-mono">{formatPrice(pair.price, pair.symbol)}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Total:</span>
                    <span className="font-mono">{formatCurrency(calculateTotal())}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Balance Check */}
            {amount && calculateTotal() > (user?.tradingBalance || 0) && (
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

          {/* Action Buttons */}
          <Tabs defaultValue="buy" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="buy" className="text-green-600 data-[state=active]:bg-green-100 data-[state=active]:text-green-700">
                Buy
              </TabsTrigger>
              <TabsTrigger value="sell" className="text-red-600 data-[state=active]:bg-red-100 data-[state=active]:text-red-700">
                Sell
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="buy" className="mt-4">
              <Button
                onClick={() => handleTrade('buy')}
                disabled={isLoading || !amount || parseFloat(amount) <= 0 || calculateTotal() > (user?.tradingBalance || 0)}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                {isLoading ? 'Executing...' : `Buy ${pair.symbol}`}
              </Button>
            </TabsContent>
            
            <TabsContent value="sell" className="mt-4">
              <Button
                onClick={() => handleTrade('sell')}
                disabled={isLoading || !amount || parseFloat(amount) <= 0 || calculateTotal() > (user?.tradingBalance || 0)}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                {isLoading ? 'Executing...' : `Sell ${pair.symbol}`}
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
