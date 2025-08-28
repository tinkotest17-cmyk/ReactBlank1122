import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTrading } from '@/contexts/TradingContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  Activity,
  BarChart3,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Timer,
  History as HistoryIcon,
  ArrowRightLeft
} from 'lucide-react';
import { TradingPair } from '@shared/types';
import { useNavigate } from 'react-router-dom';
import TradingModal from '@/components/TradingModal';
import TimedTradingModal from '@/components/TimedTradingModal';
import TimedTradingSection from '@/components/TimedTradingSection';
import BalanceConverter from '@/components/BalanceConverter';
import PriceChart from '@/components/PriceChart';

export default function Dashboard() {
  const { user } = useAuth();
  const { pairs, transactions, refreshData } = useTrading();
  const navigate = useNavigate();
  const [selectedPair, setSelectedPair] = useState<TradingPair | null>(null);
  const [selectedTimedPairId, setSelectedTimedPairId] = useState<string>('');
  const [showTradingModal, setShowTradingModal] = useState(false);
  const [showTimedTradingModal, setShowTimedTradingModal] = useState(false);

  const handleTrade = (pair: TradingPair) => {
    setSelectedPair(pair);
    setShowTradingModal(true);
  };

  const handleTimedTrade = (pair: TradingPair) => {
    setSelectedPair(pair);
    setShowTimedTradingModal(true);
  };

  const handleTradeRedirect = (pair: TradingPair) => {
    setSelectedTimedPairId(pair.id);
    // Scroll to timed trading section
    setTimeout(() => {
      const timedTradingSection = document.querySelector('[data-testid="timed-trading-section"]');
      timedTradingSection?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  // Get recent transactions (last 5)
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  // Get active trades (pending timed trades)
  const activeTrades = transactions.filter(t => t.status === 'pending' && t.isTimedTrade);

  // Calculate active trades value
  const activeTradesValue = activeTrades.reduce((sum, trade) => sum + trade.total, 0);

  // Timer for updating active trades display
  const [, forceUpdate] = useState({});
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeTrades.length > 0) {
        forceUpdate({}); // Force re-render to update timers
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTrades.length]);

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

  // Filter pairs by category
  const forexPairs = pairs.filter(pair => pair.symbol.includes('/') && !pair.symbol.includes('USD'));
  const cryptoPairs = pairs.filter(pair => pair.symbol.includes('USDT') || pair.symbol.includes('BTC/') || pair.symbol.includes('ETH/'));
  const commodityPairs = pairs.filter(pair => pair.symbol.includes('XAU'));
  const majorPairs = pairs.filter(pair => 
    ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD', 'USD/CHF', 'NZD/USD'].includes(pair.symbol)
  );

  const PairsList = ({ pairsList, title }: { pairsList: TradingPair[], title: string }) => (
    <div className="space-y-3">
      <h3 className="font-semibold text-slate-700 dark:text-slate-300">{title}</h3>
      <div className="grid gap-4">
        {pairsList.map((pair) => (
          <Card key={pair.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100">{pair.symbol}</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{pair.name}</p>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {formatPrice(pair.price, pair.symbol)}
                  </div>
                  <div className="flex items-center gap-1">
                    {pair.change24h >= 0 ? (
                      <ArrowUpRight className="h-3 w-3 text-green-500" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 text-red-500" />
                    )}
                    <span className={`text-sm font-medium ${
                      pair.change24h >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {pair.change24h >= 0 ? '+' : ''}{pair.change24h.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Mini Chart */}
              <div className="mb-3">
                <PriceChart
                  pair={pair}
                  height={80}
                  showTitle={false}
                  className="h-20"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => navigate(`/pair/${pair.symbol}`)}
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1"
                >
                  <Eye className="h-3 w-3" />
                  View
                </Button>
                <Button
                  onClick={() => handleTradeRedirect(pair)}
                  size="sm"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 gap-1"
                >
                  <TrendingUp className="h-3 w-3" />
                  Trade
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Balance</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  // Force refresh balance from database
                  refreshData();
                }}
                className="h-6 w-6 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800"
                data-testid="balance-refresh-button"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
              <Wallet className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {formatCurrency(user?.totalBalance || 0)}
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              Your total account value
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Trading Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">
              {formatCurrency(user?.tradingBalance || 0)}
            </div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              Available for trading
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">Market Status</CardTitle>
            <Activity className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                OPEN
              </Badge>
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
              Markets are active
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">Active Trades</CardTitle>
            <Timer className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
              {activeTrades.length}
            </div>
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
              {formatCurrency(activeTradesValue)} invested
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Balance Converter */}
      <BalanceConverter />

      {/* Timed Trading Section */}
      <div data-testid="timed-trading-section">
        <TimedTradingSection selectedPairId={selectedTimedPairId} />
      </div>

      {/* Trading Pairs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-slate-600" />
              <CardTitle>Trading Pairs</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshData}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="major" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="major">Major</TabsTrigger>
              <TabsTrigger value="crypto">Crypto</TabsTrigger>
              <TabsTrigger value="forex">Forex</TabsTrigger>
              <TabsTrigger value="commodities">Commodities</TabsTrigger>
            </TabsList>
            
            <TabsContent value="major" className="mt-6">
              <PairsList pairsList={majorPairs.slice(0, 6)} title="Major Currency Pairs" />
            </TabsContent>

            <TabsContent value="crypto" className="mt-6">
              <PairsList pairsList={cryptoPairs.slice(0, 6)} title="Cryptocurrency Pairs" />
            </TabsContent>

            <TabsContent value="forex" className="mt-6">
              <PairsList pairsList={forexPairs.slice(0, 6)} title="Forex Pairs" />
            </TabsContent>

            <TabsContent value="commodities" className="mt-6">
              <PairsList pairsList={commodityPairs.slice(0, 6)} title="Commodities" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Enhanced Transaction History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HistoryIcon className="h-5 w-5 text-slate-600" />
              <CardTitle>Transaction History</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/history')}
              className="gap-2"
            >
              View All History
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <HistoryIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">No transactions yet</h3>
              <p className="text-slate-600 dark:text-slate-400">Start trading to see your transaction history here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Active Trades Section */}
              {activeTrades.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                    <Timer className="h-4 w-4 text-orange-500" />
                    Active Timed Trades ({activeTrades.length})
                  </h4>
                  <div className="space-y-3 mb-6">
                    {activeTrades.map((transaction) => {
                      const remainingTime = transaction.tradeEndTime
                        ? Math.max(0, Math.floor((new Date(transaction.tradeEndTime).getTime() - Date.now()) / 1000))
                        : 0;
                      const minutes = Math.floor(remainingTime / 60);
                      const seconds = remainingTime % 60;

                      return (
                        <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400">
                              <Timer className="h-4 w-4 animate-pulse" />
                            </div>
                            <div>
                              <div className="font-medium">{transaction.symbol}</div>
                              <div className="text-sm text-slate-600 dark:text-slate-400">
                                Prediction: <span className={`font-medium ${
                                  transaction.prediction === 'up' ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {transaction.prediction?.toUpperCase()}
                                </span> • Entry: {transaction.entryPrice?.toFixed(4)}
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="flex items-center gap-2">
                              <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">
                                {remainingTime > 0 ? `${minutes}:${seconds.toString().padStart(2, '0')}` : 'ENDING...'}
                              </Badge>
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                              {formatCurrency(transaction.total)} invested
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Recent Completed Transactions */}
              <div>
                <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                  <HistoryIcon className="h-4 w-4 text-slate-500" />
                  Recent Transactions
                </h4>
                <div className="space-y-3">
                  {recentTransactions.filter(t => t.status !== 'pending').slice(0, 8).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          transaction.status === 'won' ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400' :
                          transaction.status === 'lost' ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400' :
                          transaction.action === 'buy' ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400'
                        }`}>
                          {transaction.isTimedTrade ? (
                            transaction.status === 'won' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />
                          ) : transaction.action === 'buy' ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{transaction.symbol}</div>
                          <div className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                            <span>{formatDate(transaction.timestamp)}</span>
                            {transaction.isTimedTrade && (
                              <Badge variant="outline" className="text-xs">
                                {transaction.tradeDuration}min Timed
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            transaction.status === 'won' ? 'default' :
                            transaction.status === 'lost' ? 'destructive' :
                            transaction.action === 'buy' ? 'default' : 'destructive'
                          }>
                            {transaction.isTimedTrade ?
                              transaction.status.toUpperCase() :
                              transaction.action.toUpperCase()
                            }
                          </Badge>
                          {transaction.pnl && (
                            <span className={`text-sm font-medium ${
                              transaction.pnl > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {transaction.pnl > 0 ? '+' : ''}{formatCurrency(transaction.pnl)}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          {formatCurrency(transaction.total)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trading Modals */}
      {selectedPair && (
        <>
          <TradingModal
            pair={selectedPair}
            isOpen={showTradingModal}
            onClose={() => {
              setShowTradingModal(false);
              setSelectedPair(null);
            }}
          />
          <TimedTradingModal
            pair={selectedPair}
            isOpen={showTimedTradingModal}
            onClose={() => {
              setShowTimedTradingModal(false);
              setSelectedPair(null);
            }}
          />
        </>
      )}
    </div>
  );
}
