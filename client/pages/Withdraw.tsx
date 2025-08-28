import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTrading } from '@/contexts/TradingContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowDownCircle, 
  AlertTriangle, 
  Info,
  TrendingDown,
  Clock,
  Shield,
  DollarSign
} from 'lucide-react';
import { toast } from 'sonner';
import { CryptoType } from '@shared/types';

// Mock exchange rates - in real app, these would come from crypto API
const MOCK_EXCHANGE_RATES = {
  BTC: 43250.67,
  ETH: 2645.89,
  USDT: 1.00,
  USDC: 1.00
};

// Withdrawal fees (in USD)
const WITHDRAWAL_FEES = {
  BTC: 15.00,
  ETH: 8.00,
  USDT: 5.00,
  USDC: 5.00
};

// Minimum withdrawal amounts (in USD)
const MIN_WITHDRAWAL = {
  BTC: 50.00,
  ETH: 25.00,
  USDT: 20.00,
  USDC: 20.00
};

const CRYPTO_INFO = [
  {
    type: 'BTC' as CryptoType,
    name: 'Bitcoin',
    symbol: 'BTC',
    network: 'Bitcoin',
    icon: '₿'
  },
  {
    type: 'ETH' as CryptoType,
    name: 'Ethereum',
    symbol: 'ETH',
    network: 'Ethereum (ERC-20)',
    icon: 'Ξ'
  },
  {
    type: 'USDT' as CryptoType,
    name: 'Tether USD',
    symbol: 'USDT',
    network: 'Ethereum (ERC-20)',
    icon: '₮'
  },
  {
    type: 'USDC' as CryptoType,
    name: 'USD Coin',
    symbol: 'USDC',
    network: 'Ethereum (ERC-20)',
    icon: '$'
  }
];

export default function Withdraw() {
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoType>('USDT');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const selectedCryptoInfo = CRYPTO_INFO.find(c => c.type === selectedCrypto);
  const exchangeRate = MOCK_EXCHANGE_RATES[selectedCrypto];
  const withdrawalFee = WITHDRAWAL_FEES[selectedCrypto];
  const minWithdrawal = MIN_WITHDRAWAL[selectedCrypto];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const calculateCryptoAmount = () => {
    const usdAmount = parseFloat(withdrawAmount) || 0;
    return usdAmount / exchangeRate;
  };

  const calculateNetAmount = () => {
    const usdAmount = parseFloat(withdrawAmount) || 0;
    return Math.max(0, usdAmount - withdrawalFee);
  };

  const isValidWithdraw = () => {
    const usdAmount = parseFloat(withdrawAmount) || 0;
    return usdAmount >= minWithdrawal && 
           usdAmount <= (user?.totalBalance || 0) && 
           withdrawAddress.length > 20; // Basic address validation
  };

  const { createWithdrawal } = useTrading();

  const handleWithdraw = async () => {
    if (!isValidWithdraw()) {
      toast.error('Please check your withdrawal details');
      return;
    }

    setIsLoading(true);
    try {
      const success = await createWithdrawal(
        parseFloat(withdrawAmount),
        selectedCrypto,
        withdrawAddress
      );

      if (success) {
        toast.success('Withdrawal request submitted! It will be processed within 24 hours.');
        setWithdrawAmount('');
        setWithdrawAddress('');
      } else {
        toast.error('Insufficient balance or invalid withdrawal details');
      }
    } catch (error) {
      toast.error('Failed to submit withdrawal request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <ArrowDownCircle className="h-6 w-6 text-slate-600" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Crypto Withdrawal</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Account Balance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Available Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {formatCurrency(user?.totalBalance || 0)}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Total account balance
              </p>
            </div>

            <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-700 dark:text-blue-300 text-sm">
                <strong>Security Notice:</strong> All withdrawals are manually reviewed for security. 
                Processing time: 1-24 hours.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Middle Column - Withdrawal Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              Withdrawal Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Crypto Selection */}
            <div className="space-y-4">
              <Label>Select Cryptocurrency</Label>
              <Tabs value={selectedCrypto} onValueChange={(value) => setSelectedCrypto(value as CryptoType)}>
                <TabsList className="grid w-full grid-cols-4">
                  {CRYPTO_INFO.map((crypto) => (
                    <TabsTrigger key={crypto.type} value={crypto.type} className="text-xs">
                      {crypto.symbol}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            {/* Selected Crypto Info */}
            {selectedCryptoInfo && (
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-semibold flex items-center gap-2">
                      <span className="text-lg">{selectedCryptoInfo.icon}</span>
                      {selectedCryptoInfo.name}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{selectedCryptoInfo.network}</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                    {formatCurrency(exchangeRate)}
                  </Badge>
                </div>
              </div>
            )}

            {/* Amount Input */}
            <div className="space-y-2">
              <Label htmlFor="amount">Withdrawal Amount (USD)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min={minWithdrawal}
                max={user?.totalBalance || 0}
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder={`Min: ${formatCurrency(minWithdrawal)}`}
                className="font-mono text-lg"
              />
              {withdrawAmount && (
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  ≈ {calculateCryptoAmount().toFixed(8)} {selectedCrypto}
                </p>
              )}
            </div>

            {/* Withdrawal Address */}
            <div className="space-y-2">
              <Label htmlFor="address">{selectedCrypto} Withdrawal Address</Label>
              <Input
                id="address"
                type="text"
                value={withdrawAddress}
                onChange={(e) => setWithdrawAddress(e.target.value)}
                placeholder={`Enter your ${selectedCrypto} address`}
                className="font-mono text-sm"
              />
              <p className="text-xs text-slate-500">
                Make sure this address supports {selectedCryptoInfo?.network}
              </p>
            </div>

            {/* Address Validation Warning */}
            {withdrawAddress && withdrawAddress.length < 20 && (
              <Alert className="bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700 dark:text-red-300 text-sm">
                  Please enter a valid {selectedCrypto} address
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Right Column - Fee Structure & Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-600" />
              Withdrawal Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Fee Structure */}
            <div className="space-y-3">
              <h4 className="font-medium">Fee Structure</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Withdrawal Amount:</span>
                  <span className="font-medium">{withdrawAmount ? formatCurrency(parseFloat(withdrawAmount)) : '$0.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Network Fee:</span>
                  <span className="font-medium">{formatCurrency(withdrawalFee)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-medium">
                  <span>You'll receive:</span>
                  <span className="text-green-600">{formatCurrency(calculateNetAmount())}</span>
                </div>
                {withdrawAmount && (
                  <div className="text-xs text-slate-500">
                    ≈ {(calculateNetAmount() / exchangeRate).toFixed(8)} {selectedCrypto}
                  </div>
                )}
              </div>
            </div>

            {/* Processing Time */}
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Processing Time</span>
              </div>
              <p className="text-sm text-purple-600 dark:text-purple-400">
                1-24 hours (manual review required)
              </p>
            </div>

            {/* Minimum Withdrawal Notice */}
            <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
              <Info className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-700 dark:text-amber-300 text-sm">
                <strong>Minimum:</strong> {formatCurrency(minWithdrawal)} 
                <br />
                <strong>Maximum:</strong> {formatCurrency(user?.totalBalance || 0)} (your balance)
              </AlertDescription>
            </Alert>

            {/* Submit Button */}
            <Button
              onClick={handleWithdraw}
              disabled={!isValidWithdraw() || isLoading}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              {isLoading ? 'Processing...' : `Withdraw ${selectedCrypto}`}
            </Button>

            {/* Security Notice */}
            <div className="text-xs text-slate-500 text-center">
              <Shield className="h-3 w-3 inline mr-1" />
              All withdrawals are encrypted and require manual approval for security
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Withdrawals */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Withdrawals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <ArrowDownCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">No withdrawals yet</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Your withdrawal history will appear here once you make your first withdrawal.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
