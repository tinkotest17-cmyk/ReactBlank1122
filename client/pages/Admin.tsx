
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Settings,
  UserPlus,
  Wallet,
  Ban,
  CheckCircle,
  XCircle,
  RefreshCw,
  Clock,
  AlertTriangle,
  Edit,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  getAllUsers, 
  getAllTransactions, 
  getAllDepositsWithdrawals,
  approveDepositWithdrawal,
  rejectDepositWithdrawal,
  suspendUser,
  activateUser,
  adjustUserBalance
} from '@/contexts/TradingContext';
import { User, DepositWithdraw } from '@shared/types';

export default function Admin() {
  const { user, isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [pendingTransactions, setPendingTransactions] = useState<DepositWithdraw[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [balanceAdjustment, setBalanceAdjustment] = useState({
    totalBalance: 0,
    tradingBalance: 0
  });
  const [rejectReason, setRejectReason] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<DepositWithdraw | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  // Redirect if not admin
  if (!isAdmin()) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Card className="max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Settings className="h-12 w-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">Access Denied</h3>
            <p className="text-slate-600 dark:text-slate-400 text-center">
              You need admin privileges to access this page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const refreshData = () => {
    setUsers([...getAllUsers()]);
    setPendingTransactions(getAllDepositsWithdrawals().filter(t => t.status === 'pending'));
    setRefreshKey(prev => prev + 1);
  };

  useEffect(() => {
    refreshData();
    
    // Auto-refresh every 5 seconds for real-time updates
    const interval = setInterval(refreshData, 5000);
    
    // Listen for admin refresh events
    const handleAdminRefresh = () => {
      refreshData();
    };
    
    const handleUserStatusChange = (event: CustomEvent) => {
      const { user, action } = event.detail;
      console.log(`User ${user.email} has been ${action}`);
      refreshData();
    };
    
    window.addEventListener('refreshAdminData', handleAdminRefresh);
    window.addEventListener('userStatusChanged', handleUserStatusChange as EventListener);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('refreshAdminData', handleAdminRefresh);
      window.removeEventListener('userStatusChanged', handleUserStatusChange as EventListener);
    };
  }, []);

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

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'active').length;
  const suspendedUsers = users.filter(u => u.status === 'suspended').length;
  const totalBalance = users.reduce((sum, user) => sum + user.totalBalance, 0);
  const totalTradingBalance = users.reduce((sum, user) => sum + user.tradingBalance, 0);

  const handleApproveTransaction = async (transaction: DepositWithdraw) => {
    if (!user) return;
    
    const success = approveDepositWithdrawal(transaction.id, user.id, user.email);
    if (success) {
      toast.success(`${transaction.type} approved successfully!`);
      refreshData();
    } else {
      toast.error('Failed to approve transaction');
    }
  };

  const handleRejectTransaction = async (transaction: DepositWithdraw) => {
    if (!user || !rejectReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    
    const success = rejectDepositWithdrawal(transaction.id, user.id, user.email, rejectReason);
    if (success) {
      toast.success(`${transaction.type} rejected successfully!`);
      setRejectReason('');
      setSelectedTransaction(null);
      refreshData();
    } else {
      toast.error('Failed to reject transaction');
    }
  };

  const handleSuspendUser = async (targetUser: User) => {
    if (!user) return;
    
    const success = suspendUser(targetUser.id, user.id, user.email);
    if (success) {
      toast.success(`User ${targetUser.email} suspended successfully!`);
      refreshData();
    } else {
      toast.error('Failed to suspend user');
    }
  };

  const handleActivateUser = async (targetUser: User) => {
    if (!user) return;
    
    const success = activateUser(targetUser.id, user.id, user.email);
    if (success) {
      toast.success(`User ${targetUser.email} activated successfully!`);
      refreshData();
    } else {
      toast.error('Failed to activate user');
    }
  };

  const handleBalanceAdjustment = async () => {
    if (!user || !selectedUser) {
      toast.error('Please select a user');
      return;
    }

    if (balanceAdjustment.totalBalance < 0 || balanceAdjustment.tradingBalance < 0) {
      toast.error('Balances cannot be negative');
      return;
    }

    const success = adjustUserBalance(
      selectedUser.id,
      balanceAdjustment.totalBalance,
      balanceAdjustment.tradingBalance,
      user.id,
      user.email,
      'Manual balance adjustment by admin'
    );

    if (success) {
      toast.success(`Balance adjusted for ${selectedUser.email}!`);
      closeBalanceModal();
      refreshData();
    } else {
      toast.error('Failed to adjust balance');
    }
  };

  const openBalanceModal = (targetUser: User) => {
    setSelectedUser(targetUser);
    setBalanceAdjustment({
      totalBalance: targetUser.totalBalance,
      tradingBalance: targetUser.tradingBalance
    });
    setIsBalanceModalOpen(true);
  };

  const closeBalanceModal = () => {
    setIsBalanceModalOpen(false);
    setSelectedUser(null);
    setBalanceAdjustment({ totalBalance: 0, tradingBalance: 0 });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-slate-600" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Admin Panel</h1>
        </div>
        <Button onClick={refreshData} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh Data
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {activeUsers} active, {suspendedUsers} suspended
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalBalance)}</div>
            <p className="text-xs text-muted-foreground">
              Across all accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trading Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalTradingBalance)}</div>
            <p className="text-xs text-muted-foreground">
              Available for trading
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Transactions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTransactions.length}</div>
            <p className="text-xs text-muted-foreground">
              Require admin approval
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Transactions */}
      {pendingTransactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Pending Transactions (Real-time)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingTransactions.map((transaction) => (
                <div key={transaction.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 gap-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="bg-orange-100 dark:bg-orange-900 p-2 rounded-full flex-shrink-0">
                      {transaction.type === 'withdraw' ? (
                        <XCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium capitalize truncate">
                        {transaction.type} - {transaction.userEmail}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        {formatCurrency(transaction.amount)} {transaction.cryptoType} • {formatDate(transaction.timestamp)}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-500 truncate">
                        {transaction.address.slice(0, 20)}...
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleApproveTransaction(transaction)}
                      className="text-green-600 border-green-300 hover:bg-green-50 dark:text-green-400 dark:border-green-700 dark:hover:bg-green-900/20"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedTransaction(transaction)}
                          className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-900/20"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Reject {transaction.type}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="reject-reason">Reason for rejection</Label>
                            <Textarea
                              id="reject-reason"
                              value={rejectReason}
                              onChange={(e) => setRejectReason(e.target.value)}
                              placeholder="Please provide a reason for rejection..."
                              className="mt-1"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleRejectTransaction(transaction)}
                              variant="destructive"
                              disabled={!rejectReason.trim()}
                            >
                              Confirm Rejection
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSelectedTransaction(null);
                                setRejectReason('');
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>User Management (Real-time)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((userItem) => (
              <div key={`${userItem.id}-${refreshKey}`} className="flex flex-col lg:flex-row lg:items-center justify-between p-4 border rounded-lg gap-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full flex-shrink-0">
                    <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">{userItem.email}</div>
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      @{userItem.username}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                      <div>📞 {userItem.phone || 'No phone'}</div>
                      <div>🌍 {userItem.country || 'No country'}</div>
                      <div>🔒 {userItem.password || 'No password'}</div>
                      <div>📅 Joined {formatDate(userItem.createdAt)}</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="text-left sm:text-right">
                    <div className="font-medium">{formatCurrency(userItem.totalBalance)}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Trading: {formatCurrency(userItem.tradingBalance)}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={userItem.role === 'admin' ? 'default' : 'secondary'}>
                      {userItem.role.toUpperCase()}
                    </Badge>
                    
                    <Badge variant={userItem.status === 'active' ? 'default' : 'destructive'}>
                      {userItem.status?.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    {userItem.status === 'active' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSuspendUser(userItem)}
                        className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-900/20"
                      >
                        <Ban className="h-4 w-4 mr-1" />
                        Suspend
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleActivateUser(userItem)}
                        className="text-green-600 border-green-300 hover:bg-green-50 dark:text-green-400 dark:border-green-700 dark:hover:bg-green-900/20"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Activate
                      </Button>
                    )}
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openBalanceModal(userItem)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Adjust Balance
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Balance Adjustment Modal */}
      <Dialog open={isBalanceModalOpen} onOpenChange={setIsBalanceModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Balance for {selectedUser?.email}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="total-balance">Total Balance</Label>
                <Input
                  id="total-balance"
                  type="number"
                  value={balanceAdjustment.totalBalance}
                  onChange={(e) => setBalanceAdjustment(prev => ({
                    ...prev,
                    totalBalance: parseFloat(e.target.value) || 0
                  }))}
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <Label htmlFor="trading-balance">Trading Balance</Label>
                <Input
                  id="trading-balance"
                  type="number"
                  value={balanceAdjustment.tradingBalance}
                  onChange={(e) => setBalanceAdjustment(prev => ({
                    ...prev,
                    tradingBalance: parseFloat(e.target.value) || 0
                  }))}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleBalanceAdjustment}
              >
                Apply Changes
              </Button>
              <Button
                variant="outline"
                onClick={closeBalanceModal}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
