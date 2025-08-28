import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTrading } from '@/contexts/TradingContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowRightLeft, 
  Wallet, 
  DollarSign,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

export default function BalanceConverter() {
  const [amount, setAmount] = useState('');
  const [direction, setDirection] = useState<'total-to-trading' | 'trading-to-total'>('total-to-trading');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { convertBalance } = useTrading();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getSourceBalance = () => {
    if (!user) return 0;
    return direction === 'total-to-trading' ? user.totalBalance : user.tradingBalance;
  };

  const getTargetBalance = () => {
    if (!user) return 0;
    return direction === 'total-to-trading' ? user.tradingBalance : user.totalBalance;
  };

  const isValidAmount = () => {
    const amountNum = parseFloat(amount);
    return amountNum > 0 && amountNum <= getSourceBalance();
  };

  const handleConvert = async () => {
    if (!isValidAmount()) {
      toast.error('Invalid amount');
      return;
    }

    setIsLoading(true);
    try {
      const from = direction === 'total-to-trading' ? 'total' : 'trading';
      const to = direction === 'total-to-trading' ? 'trading' : 'total';
      
      const success = await convertBalance(parseFloat(amount), from, to);
      if (success) {
        toast.success(`Successfully converted ${formatCurrency(parseFloat(amount))}`);
        setAmount('');
        // Refresh the page to show updated balances
        window.location.reload();
      } else {
        toast.error('Conversion failed');
      }
    } catch (error) {
      toast.error('An error occurred during conversion');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDirection = () => {
    setDirection(prev => 
      prev === 'total-to-trading' ? 'trading-to-total' : 'total-to-trading'
    );
    setAmount('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowRightLeft className="h-5 w-5 text-blue-600" />
          Balance Converter
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Balances */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="h-4 w-4 text-slate-600" />
              <span className="text-sm font-medium">Total Balance</span>
            </div>
            <div className="text-lg font-bold">{formatCurrency(user?.totalBalance || 0)}</div>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Trading Balance</span>
            </div>
            <div className="text-lg font-bold text-green-600">{formatCurrency(user?.tradingBalance || 0)}</div>
          </div>
        </div>

        {/* Conversion Direction */}
        <div className="space-y-2">
          <Label>Conversion Direction</Label>
          <Button
            variant="outline"
            onClick={toggleDirection}
            className="w-full justify-between"
          >
            <span>
              {direction === 'total-to-trading' 
                ? 'Total Balance → Trading Balance' 
                : 'Trading Balance → Total Balance'
              }
            </span>
            <ArrowRightLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Amount Input */}
        <div className="space-y-2">
          <Label htmlFor="convert-amount">
            Amount to Convert from {direction === 'total-to-trading' ? 'Total' : 'Trading'} Balance
          </Label>
          <Input
            id="convert-amount"
            type="number"
            step="0.01"
            min="0"
            max={getSourceBalance()}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="font-mono"
          />
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Available: {formatCurrency(getSourceBalance())}
          </div>
        </div>

        {/* Conversion Summary */}
        {amount && isValidAmount() && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Conversion Preview</span>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">From:</span>
                <span className="font-mono">{formatCurrency(parseFloat(amount))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">To:</span>
                <span className="font-mono">{formatCurrency(parseFloat(amount))}</span>
              </div>
              <div className="flex justify-between font-medium text-green-600">
                <span>Conversion Rate:</span>
                <span>1:1 (No fees)</span>
              </div>
            </div>
          </div>
        )}

        {/* Error for insufficient balance */}
        {amount && !isValidAmount() && parseFloat(amount) > 0 && (
          <Alert className="bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700 dark:text-red-300">
              Insufficient balance. Maximum available: {formatCurrency(getSourceBalance())}
            </AlertDescription>
          </Alert>
        )}

        {/* Convert Button */}
        <Button
          onClick={handleConvert}
          disabled={isLoading || !isValidAmount()}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? 'Converting...' : `Convert ${amount ? formatCurrency(parseFloat(amount)) : 'Amount'}`}
        </Button>

        {/* Info */}
        <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
          Conversions are instant with no fees. Move funds between your total and trading balances as needed.
        </div>
      </CardContent>
    </Card>
  );
}
