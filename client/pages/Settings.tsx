import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Settings as SettingsIcon, 
  User, 
  Mail, 
  Lock, 
  Phone, 
  Globe,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const { user, updateUserProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Profile settings
  const [profile, setProfile] = useState({
    username: user?.username || '',
    email: user?.email || '',
    phone: user?.phone || '',
    country: user?.country || ''
  });

  // Password settings
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const success = await updateUserProfile(profile);
      if (success) {
        toast.success('Profile updated successfully!');
      } else {
        setError('Failed to update profile');
      }
    } catch (err) {
      setError('An error occurred while updating profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('New passwords do not match');
      setIsLoading(false);
      return;
    }

    if (passwords.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    try {
      const success = await updateUserProfile({
        ...profile,
        password: passwords.newPassword,
        currentPassword: passwords.currentPassword
      });
      
      if (success) {
        toast.success('Password updated successfully!');
        setPasswords({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setError('Failed to update password. Please check your current password.');
      }
    } catch (err) {
      setError('An error occurred while updating password');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Card className="max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <SettingsIcon className="h-12 w-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">Not Authenticated</h3>
            <p className="text-slate-600 dark:text-slate-400 text-center">
              Please log in to access settings.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <SettingsIcon className="h-6 w-6 text-slate-600" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Settings</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Update your personal information and contact details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={profile.username}
                  onChange={(e) => setProfile(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="Enter your username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter your email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  type="text"
                  value={profile.country}
                  onChange={(e) => setProfile(prev => ({ ...prev, country: e.target.value }))}
                  placeholder="United States"
                />
              </div>

              {error && (
                <Alert className="bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
                  <AlertDescription className="text-red-700 dark:text-red-300">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Updating...' : 'Update Profile'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Password Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Change Password
            </CardTitle>
            <CardDescription>
              Update your password to keep your account secure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords(prev => ({ ...prev, currentPassword: e.target.value }))}
                  placeholder="Enter your current password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="Enter your new password"
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-new-password">Confirm New Password</Label>
                <Input
                  id="confirm-new-password"
                  type="password"
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Confirm your new password"
                  minLength={6}
                />
              </div>

              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Account Information
          </CardTitle>
          <CardDescription>
            Your current account details and status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Account Type</Label>
              <div className="px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-md">
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Account
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Member Since</Label>
              <div className="px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-md">
                {new Date(user.createdAt).toLocaleDateString()}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Account Status</Label>
              <div className="px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-md">
                <span className={`inline-flex items-center gap-1 ${user.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                  <CheckCircle className="h-4 w-4" />
                  {user.status?.charAt(0).toUpperCase() + user.status?.slice(1) || 'Active'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">User ID</Label>
              <div className="px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-md font-mono text-sm">
                {user.id}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}