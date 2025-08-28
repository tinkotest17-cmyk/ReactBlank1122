import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  DollarSign, 
  Settings,
  UserPlus,
  Search,
  Edit,
  Trash2
} from 'lucide-react';
import { useState } from 'react';

// Mock users data (in real app, this would come from backend)
const MOCK_ALL_USERS = [
  {
    id: '1',
    email: 'admin@trading.com',
    role: 'admin' as const,
    totalBalance: 100000,
    tradingBalance: 25000,
    createdAt: new Date('2024-01-01'),
    status: 'active' as const,
    lastLogin: new Date('2024-12-20')
  },
  {
    id: '2',
    email: 'user@trading.com',
    role: 'user' as const,
    totalBalance: 10000,
    tradingBalance: 5000,
    createdAt: new Date('2024-01-15'),
    status: 'active' as const,
    lastLogin: new Date('2024-12-19')
  },
  {
    id: '3',
    email: 'trader@example.com',
    role: 'user' as const,
    totalBalance: 7500,
    tradingBalance: 3000,
    createdAt: new Date('2024-02-01'),
    status: 'active' as const,
    lastLogin: new Date('2024-12-18')
  }
];

export default function UserManagement() {
  const { user, isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredUsers = MOCK_ALL_USERS.filter(userItem =>
    userItem.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalUsers = MOCK_ALL_USERS.length;
  const totalBalance = MOCK_ALL_USERS.reduce((sum, user) => sum + user.totalBalance, 0);
  const totalTradingBalance = MOCK_ALL_USERS.reduce((sum, user) => sum + user.tradingBalance, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-slate-600" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">User Management</h1>
        </div>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Active trading accounts
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
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalTradingBalance)}</div>
            <p className="text-xs text-muted-foreground">
              Available for trading
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search by email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((userItem) => (
              <div key={userItem.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                    <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="font-medium">{userItem.email}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Joined {formatDate(userItem.createdAt)} • Last login: {formatDate(userItem.lastLogin)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(userItem.totalBalance)}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Trading: {formatCurrency(userItem.tradingBalance)}
                    </div>
                  </div>
                  
                  <Badge variant={userItem.role === 'admin' ? 'default' : 'secondary'}>
                    {userItem.role.toUpperCase()}
                  </Badge>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-1">
                      <Edit className="h-3 w-3" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1 text-red-600 hover:text-red-700">
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
