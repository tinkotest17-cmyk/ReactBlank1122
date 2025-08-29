import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTrading } from '@/contexts/TradingContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  History as HistoryIcon,
  TrendingUp,
  TrendingDown,
  ArrowUpCircle,
  ArrowDownCircle,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Transaction } from '@shared/types';

export default function History() {
  const { user } = useAuth();
  const { transactions, refreshData } = useTrading();
  const [filter, setFilter] = useState<'all' | 'trade' | 'deposit' | 'withdrawal'>('all');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    refreshData();
  }, [user]);

  // Auto-refresh every 10 seconds to show real-time updates
  useEffect(() => {
    refreshData(); // Initial call

    const interval = setInterval(() => {
      refreshData();
      setRefreshKey(prev => prev + 1);
    }, 10000);

    return () => clearInterval(interval);
  }, [refreshData]); // Dependency added for refreshData

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const getTransactionIcon = (transaction: Transaction) => {
    switch (transaction.type) {
      case 'trade':
        return transaction.action === 'buy' ? (
          <TrendingUp className="h-4 w-4" />
        ) : (
          <TrendingDown className="h-4 w-4" />
        );
      case 'deposit':
        return <ArrowUpCircle className="h-4 w-4" />;
      case 'withdrawal':
        return <ArrowDownCircle className="h-4 w-4" />;
      case 'balance_adjustment':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <HistoryIcon className="h-4 w-4" />;
    }
  };

  const getTransactionColor = (transaction: Transaction) => {
    switch (transaction.type) {
      case 'trade':
        return transaction.action === 'buy' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600';
      case 'deposit':
        return 'bg-blue-100 text-blue-600';
      case 'withdrawal':
        return 'bg-orange-100 text-orange-600';
      case 'balance_adjustment':
        return 'bg-purple-100 text-purple-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusBadge = (transaction: Transaction) => {
    switch (transaction.status) {
      case 'completed':
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800">COMPLETED</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">PENDING</Badge>;
      case 'rejected':
      case 'failed':
        return <Badge variant="destructive">FAILED</Badge>;
      case 'won':
        return <Badge variant="default" className="bg-green-100 text-green-800">WON</Badge>;
      case 'lost':
        return <Badge variant="destructive">LOST</Badge>;
      default:
        return <Badge variant="secondary">{transaction.status?.toUpperCase()}</Badge>;
    }
  };

  const tradeTransactions = transactions.filter(t => t.type === 'trade');
  const depositWithdrawalTransactions = transactions.filter(t => t.type === 'deposit' || t.type === 'withdrawal');
  const balanceAdjustments = transactions.filter(t => t.type === 'balance_adjustment');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <HistoryIcon className="h-6 w-6 text-slate-600" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Transaction History</h1>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Transactions</TabsTrigger>
          <TabsTrigger value="trades">Trades ({tradeTransactions.length})</TabsTrigger>
          <TabsTrigger value="deposits">Deposits & Withdrawals ({depositWithdrawalTransactions.length})</TabsTrigger>
          <TabsTrigger value="adjustments">Balance Adjustments ({balanceAdjustments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Transactions (Real-time)</CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <HistoryIcon className="h-12 w-12 text-slate-400 mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">No transactions yet</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-center max-w-sm">
                    Start trading or make deposits to see your transaction history here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div key={`${transaction.id}-${refreshKey}`} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${getTransactionColor(transaction)}`}>
                          {getTransactionIcon(transaction)}
                        </div>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {transaction.symbol || transaction.cryptoType || 'Balance Adjustment'}
                            {getStatusBadge(transaction)}
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">
                            {formatDate(transaction.timestamp)}
                          </div>
                          {transaction.type === 'trade' && (
                            <div className="text-xs text-slate-500">
                              {transaction.isTimedTrade ? 'Timed Trade' : 'Spot Trade'}
                              {transaction.action && ` • ${transaction.action.toUpperCase()}`}
                            </div>
                          )}
                          {(transaction.type === 'deposit' || transaction.type === 'withdrawal') && transaction.address && (
                            <div className="text-xs text-slate-500">
                              Address: {transaction.address.slice(0, 20)}...
                            </div>
                          )}
                          {transaction.adminNotes && (
                            <div className="text-xs text-slate-500">
                              Note: {transaction.adminNotes}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-medium">
                          {transaction.type === 'withdrawal' || (transaction.type === 'balance_adjustment' && transaction.amount < 0) ? '-' : '+'}
                          {formatCurrency(Math.abs(transaction.amount))}
                        </div>
                        {transaction.price && (
                          <div className="text-sm text-slate-600 dark:text-slate-400">
                            @ {transaction.price.toFixed(4)}
                          </div>
                        )}
                        {transaction.pnl !== undefined && (
                          <div className={`text-sm ${transaction.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            P&L: {transaction.pnl >= 0 ? '+' : ''}{formatCurrency(transaction.pnl)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trades">
          <Card>
            <CardHeader>
              <CardTitle>Trading History</CardTitle>
            </CardHeader>
            <CardContent>
              {tradeTransactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <TrendingUp className="h-12 w-12 text-slate-400 mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">No trades yet</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-center max-w-sm">
                    Start trading to see your trade history here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tradeTransactions.map((transaction) => (
                    <div key={`${transaction.id}-${refreshKey}`} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${getTransactionColor(transaction)}`}>
                          {getTransactionIcon(transaction)}
                        </div>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {transaction.symbol}
                            {getStatusBadge(transaction)}
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">
                            {formatDate(transaction.timestamp)}
                          </div>
                          <div className="text-xs text-slate-500">
                            {transaction.isTimedTrade ? 'Timed Trade' : 'Spot Trade'}
                            {transaction.action && ` • ${transaction.action.toUpperCase()}`}
                            {transaction.prediction && ` • Prediction: ${transaction.prediction.toUpperCase()}`}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-medium">{transaction.amount} units</div>
                        {transaction.price && (
                          <div className="text-sm text-slate-600 dark:text-slate-400">
                            @ {transaction.price.toFixed(4)} = {formatCurrency(transaction.total)}
                          </div>
                        )}
                        {transaction.pnl !== undefined && (
                          <div className={`text-sm ${transaction.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            P&L: {transaction.pnl >= 0 ? '+' : ''}{formatCurrency(transaction.pnl)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deposits">
          <Card>
            <CardHeader>
              <CardTitle>Deposits & Withdrawals</CardTitle>
            </CardHeader>
            <CardContent>
              {depositWithdrawalTransactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <ArrowUpCircle className="h-12 w-12 text-slate-400 mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">No deposits or withdrawals yet</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-center max-w-sm">
                    Make your first deposit or withdrawal to see the history here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {depositWithdrawalTransactions.map((transaction) => (
                    <div key={`${transaction.id}-${refreshKey}`} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${getTransactionColor(transaction)}`}>
                          {getTransactionIcon(transaction)}
                        </div>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {transaction.cryptoType} {transaction.type}
                            {getStatusBadge(transaction)}
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">
                            {formatDate(transaction.timestamp)}
                          </div>
                          {transaction.address && (
                            <div className="text-xs text-slate-500">
                              Address: {transaction.address.slice(0, 30)}...
                            </div>
                          )}
                          {transaction.txHash && (
                            <div className="text-xs text-slate-500">
                              TX: {transaction.txHash.slice(0, 20)}...
                            </div>
                          )}
                          {transaction.adminNotes && (
                            <div className="text-xs text-red-500">
                              Admin Note: {transaction.adminNotes}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-medium">
                          {transaction.type === 'withdrawal' ? '-' : '+'}
                          {formatCurrency(transaction.amount)}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          {transaction.cryptoType}
                        </div>
                        {transaction.confirmations !== undefined && (
                          <div className="text-xs text-slate-500">
                            Confirmations: {transaction.confirmations}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="adjustments">
          <Card>
            <CardHeader>
              <CardTitle>Balance Adjustments</CardTitle>
            </CardHeader>
            <CardContent>
              {balanceAdjustments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <TrendingUp className="h-12 w-12 text-slate-400 mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">No balance adjustments</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-center max-w-sm">
                    Balance adjustments made by administrators will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {balanceAdjustments.map((transaction) => (
                    <div key={`${transaction.id}-${refreshKey}`} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${getTransactionColor(transaction)}`}>
                          {getTransactionIcon(transaction)}
                        </div>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            Balance Adjustment
                            {getStatusBadge(transaction)}
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">
                            {formatDate(transaction.timestamp)}
                          </div>
                          {transaction.adminNotes && (
                            <div className="text-xs text-slate-500">
                              Reason: {transaction.adminNotes}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-medium">
                          {transaction.amount >= 0 ? '+' : ''}
                          {formatCurrency(transaction.amount)}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          Admin Adjustment
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}