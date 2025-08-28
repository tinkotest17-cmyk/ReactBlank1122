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
  Wallet, 
  Copy, 
  CheckCircle, 
  AlertCircle,
  QrCode,
  Info,
  TrendingUp,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { CryptoType, CryptoWallet } from '@shared/types';

// Mock crypto wallets - in real app, these would come from Supabase
const MOCK_CRYPTO_WALLETS: CryptoWallet[] = [
  {
    id: '1',
    type: 'BTC',
    name: 'Bitcoin',
    symbol: 'BTC',
    address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    network: 'Bitcoin',
    isActive: true
  },
  {
    id: '2',
    type: 'ETH',
    name: 'Ethereum',
    symbol: 'ETH',
    address: '0x742d35Cc6634C0532925a3b8D4a2aE4e1B8b8B8B',
    network: 'Ethereum (ERC-20)',
    isActive: true
  },
  {
    id: '3',
    type: 'USDT',
    name: 'Tether USD',
    symbol: 'USDT',
    address: '0x742d35Cc6634C0532925a3b8D4a2aE4e1B8b8B8B',
    network: 'Ethereum (ERC-20)',
    isActive: true
  },
  {
    id: '4',
    type: 'USDC',
    name: 'USD Coin',
    symbol: 'USDC',
    address: '0x742d35Cc6634C0532925a3b8D4a2aE4e1B8b8B8B',
    network: 'Ethereum (ERC-20)',
    isActive: true
  }
];

// Mock exchange rates - in real app, these would come from crypto API
const MOCK_EXCHANGE_RATES = {
  BTC: 43250.67,
  ETH: 2645.89,
  USDT: 1.00,
  USDC: 1.00
};

export default function Deposit() {
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoType>('USDT');
  const [depositAmount, setDepositAmount] = useState('');
  const [copiedAddress, setCopiedAddress] = useState('');
  const { user } = useAuth();

  const selectedWallet = MOCK_CRYPTO_WALLETS.find(w => w.type === selectedCrypto);
  const exchangeRate = MOCK_EXCHANGE_RATES[selectedCrypto];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const calculateUsdValue = () => {
    const amount = parseFloat(depositAmount) || 0;
    return amount * exchangeRate;
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(type);
      toast.success(`${type} copied to clipboard!`);
      setTimeout(() => setCopiedAddress(''), 2000);
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const { createDeposit } = useTrading();

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!selectedWallet?.address) {
      toast.error('No wallet address available');
      return;
    }

    const success = await createDeposit(
      parseFloat(depositAmount),
      selectedCrypto,
      selectedWallet.address
    );

    if (success) {
      toast.success('Deposit request created! Please send the crypto to the provided address.');
      setDepositAmount('');
    } else {
      toast.error('Failed to create deposit request');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Wallet className="h-6 w-6 text-slate-600" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Crypto Deposit</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Crypto Selection & Amount */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Deposit Cryptocurrency
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Crypto Selection */}
            <div className="space-y-4">
              <Label>Select Cryptocurrency</Label>
              <Tabs value={selectedCrypto} onValueChange={(value) => setSelectedCrypto(value as CryptoType)}>
                <TabsList className="grid w-full grid-cols-4">
                  {MOCK_CRYPTO_WALLETS.map((wallet) => (
                    <TabsTrigger key={wallet.type} value={wallet.type} className="text-xs">
                      {wallet.symbol}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            {/* Selected Crypto Info */}
            {selectedWallet && (
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-semibold">{selectedWallet.name}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{selectedWallet.network}</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                    {formatCurrency(exchangeRate)}
                  </Badge>
                </div>
              </div>
            )}

            {/* Amount Input */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount ({selectedCrypto})</Label>
              <Input
                id="amount"
                type="number"
                step="0.00000001"
                min="0"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder={`Enter ${selectedCrypto} amount`}
                className="font-mono text-lg"
              />
              {depositAmount && (
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  ≈ {formatCurrency(calculateUsdValue())} USD
                </p>
              )}
            </div>

            {/* Minimum Deposit Warning */}
            <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-700 dark:text-blue-300">
                <strong>Minimum Deposit:</strong> $10 USD equivalent. 
                Deposits typically take 1-6 confirmations depending on the network.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Right Column - Deposit Address & Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-blue-600" />
              Deposit Address
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {selectedWallet && (
              <>
                {/* Deposit Address */}
                <div className="space-y-2">
                  <Label>Send {selectedCrypto} to this address:</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={selectedWallet.address}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(selectedWallet.address, 'Address')}
                      className="shrink-0"
                    >
                      {copiedAddress === 'Address' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* QR Code Placeholder */}
                <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-8 text-center">
                  <QrCode className="h-24 w-24 text-slate-400 mx-auto mb-4" />
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    QR Code for {selectedWallet.address}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    (QR code would be generated here)
                  </p>
                </div>

                {/* Network Warning */}
                <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-700 dark:text-amber-300">
                    <strong>Important:</strong> Only send {selectedCrypto} on the {selectedWallet.network} network. 
                    Sending other cryptocurrencies or using wrong networks will result in permanent loss.
                  </AlertDescription>
                </Alert>

                {/* Deposit Instructions */}
                <div className="space-y-3">
                  <h4 className="font-medium">Deposit Instructions:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-slate-600 dark:text-slate-400">
                    <li>Copy the address above or scan the QR code</li>
                    <li>Send {selectedCrypto} from your wallet to this address</li>
                    <li>Wait for network confirmations (usually 1-6 blocks)</li>
                    <li>Your balance will be updated automatically</li>
                  </ol>
                </div>

                {/* Processing Time */}
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">Processing Time</span>
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    {selectedCrypto === 'BTC' ? '30-60 minutes' : 
                     selectedCrypto === 'ETH' ? '5-15 minutes' : 
                     '5-10 minutes'} (depending on network congestion)
                  </p>
                </div>

                {/* Confirm Deposit Button */}
                <Button
                  onClick={handleDeposit}
                  disabled={!depositAmount || parseFloat(depositAmount) <= 0}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  I've Sent the {selectedCrypto}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Deposits */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Deposits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Wallet className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">No deposits yet</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Your deposit history will appear here once you make your first deposit.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
