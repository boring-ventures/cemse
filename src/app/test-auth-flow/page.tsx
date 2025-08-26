"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useJWTAuth';
import { useRole } from '@/hooks/useRole';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, ArrowRight, LogOut, RefreshCw, User, Shield } from 'lucide-react';

export default function TestAuthFlowPage() {
  const auth = useAuth();
  const role = useRole();
  const router = useRouter();
  
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [testStatus, setTestStatus] = useState<{
    login: 'pending' | 'success' | 'error' | null;
    profile: 'pending' | 'success' | 'error' | null;
    refresh: 'pending' | 'success' | 'error' | null;
    logout: 'pending' | 'success' | 'error' | null;
  }>({
    login: null,
    profile: null,
    refresh: null,
    logout: null,
  });
  const [error, setError] = useState<string | null>(null);

  // Test complete authentication flow
  const runCompleteTest = async () => {
    setError(null);
    setTestStatus({ login: null, profile: null, refresh: null, logout: null });

    try {
      // Step 1: Login
      setTestStatus(prev => ({ ...prev, login: 'pending' }));
      await auth.login(username, password);
      setTestStatus(prev => ({ ...prev, login: 'success' }));
      
      // Wait a bit for state to update
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 2: Check profile
      setTestStatus(prev => ({ ...prev, profile: 'pending' }));
      const user = await auth.getCurrentUser();
      if (user) {
        setTestStatus(prev => ({ ...prev, profile: 'success' }));
      } else {
        throw new Error('Failed to get user profile');
      }

      // Step 3: Test token refresh
      setTestStatus(prev => ({ ...prev, refresh: 'pending' }));
      const refreshSuccess = await auth.refreshToken();
      if (refreshSuccess) {
        setTestStatus(prev => ({ ...prev, refresh: 'success' }));
      } else {
        throw new Error('Token refresh failed');
      }

      // Step 4: Logout
      setTestStatus(prev => ({ ...prev, logout: 'pending' }));
      await auth.logout();
      setTestStatus(prev => ({ ...prev, logout: 'success' }));

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Test failed');
      // Mark current step as error
      const currentStep = Object.entries(testStatus).find(([_, status]) => status === 'pending');
      if (currentStep) {
        setTestStatus(prev => ({ ...prev, [currentStep[0]]: 'error' }));
      }
    }
  };

  // Individual test functions
  const testLogin = async () => {
    setError(null);
    try {
      setTestStatus(prev => ({ ...prev, login: 'pending' }));
      await auth.login(username, password);
      setTestStatus(prev => ({ ...prev, login: 'success' }));
    } catch (err) {
      setTestStatus(prev => ({ ...prev, login: 'error' }));
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  const testLogout = async () => {
    setError(null);
    try {
      setTestStatus(prev => ({ ...prev, logout: 'pending' }));
      await auth.logout();
      setTestStatus(prev => ({ ...prev, logout: 'success' }));
    } catch (err) {
      setTestStatus(prev => ({ ...prev, logout: 'error' }));
      setError(err instanceof Error ? err.message : 'Logout failed');
    }
  };

  const testRefresh = async () => {
    setError(null);
    try {
      setTestStatus(prev => ({ ...prev, refresh: 'pending' }));
      const success = await auth.refreshToken();
      if (success) {
        setTestStatus(prev => ({ ...prev, refresh: 'success' }));
      } else {
        throw new Error('Refresh failed');
      }
    } catch (err) {
      setTestStatus(prev => ({ ...prev, refresh: 'error' }));
      setError(err instanceof Error ? err.message : 'Refresh failed');
    }
  };

  const navigateToDashboard = () => {
    router.push('/dashboard');
  };

  const StatusIcon = ({ status }: { status: 'pending' | 'success' | 'error' | null }) => {
    if (status === 'pending') return <RefreshCw className="w-4 h-4 animate-spin" />;
    if (status === 'success') return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    if (status === 'error') return <XCircle className="w-4 h-4 text-red-500" />;
    return null;
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">JWT Authentication Flow Test</h1>

      {/* Current Auth State */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Current Authentication State
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <span className="font-medium w-32">Loading:</span>
              <Badge variant={auth.loading ? "secondary" : "outline"}>
                {auth.loading ? "Yes" : "No"}
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-medium w-32">Authenticated:</span>
              <Badge variant={auth.isAuthenticated ? "default" : "destructive"}>
                {auth.isAuthenticated ? "Yes" : "No"}
              </Badge>
            </div>
            {auth.user && (
              <>
                <div className="flex items-center gap-4">
                  <span className="font-medium w-32">Username:</span>
                  <span>{auth.user.username}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-medium w-32">Role:</span>
                  <Badge className="bg-purple-600">{auth.user.role}</Badge>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-medium w-32">User ID:</span>
                  <span className="text-xs font-mono">{auth.user.id}</span>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Role Information */}
      {auth.isAuthenticated && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Role Permissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <span className="font-medium w-32">Display Name:</span>
                <span>{role.getRoleDisplayName()}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-medium w-32">Groups:</span>
                <div className="flex gap-2">
                  {role.isAdmin && <Badge>Admin</Badge>}
                  {role.isStudent && <Badge>Student</Badge>}
                  {role.isOrganization && <Badge>Organization</Badge>}
                  {role.isService && <Badge>Service</Badge>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!auth.isAuthenticated && (
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Username</label>
                <Input 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Password</label>
                <Input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                />
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={runCompleteTest}
              disabled={auth.loading}
              className="bg-green-600 hover:bg-green-700"
            >
              Run Complete Flow Test
            </Button>
            
            {!auth.isAuthenticated ? (
              <Button onClick={testLogin} disabled={auth.loading}>
                Test Login
              </Button>
            ) : (
              <>
                <Button onClick={testRefresh} disabled={auth.loading}>
                  Test Token Refresh
                </Button>
                <Button onClick={testLogout} disabled={auth.loading} variant="destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Test Logout
                </Button>
                <Button onClick={navigateToDashboard} variant="outline">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Go to Dashboard
                </Button>
              </>
            )}
          </div>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>Authentication Flow Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <StatusIcon status={testStatus.login} />
              <span className="font-medium w-32">1. Login:</span>
              <span className="text-sm text-gray-600">
                {testStatus.login === 'pending' && 'Testing login...'}
                {testStatus.login === 'success' && 'Successfully authenticated with JWT'}
                {testStatus.login === 'error' && 'Login failed'}
                {testStatus.login === null && 'Not tested yet'}
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <StatusIcon status={testStatus.profile} />
              <span className="font-medium w-32">2. Get Profile:</span>
              <span className="text-sm text-gray-600">
                {testStatus.profile === 'pending' && 'Fetching user profile...'}
                {testStatus.profile === 'success' && 'User profile retrieved successfully'}
                {testStatus.profile === 'error' && 'Failed to get profile'}
                {testStatus.profile === null && 'Not tested yet'}
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <StatusIcon status={testStatus.refresh} />
              <span className="font-medium w-32">3. Token Refresh:</span>
              <span className="text-sm text-gray-600">
                {testStatus.refresh === 'pending' && 'Refreshing token...'}
                {testStatus.refresh === 'success' && 'Token refreshed successfully'}
                {testStatus.refresh === 'error' && 'Token refresh failed'}
                {testStatus.refresh === null && 'Not tested yet'}
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <StatusIcon status={testStatus.logout} />
              <span className="font-medium w-32">4. Logout:</span>
              <span className="text-sm text-gray-600">
                {testStatus.logout === 'pending' && 'Logging out...'}
                {testStatus.logout === 'success' && 'Successfully logged out'}
                {testStatus.logout === 'error' && 'Logout failed'}
                {testStatus.logout === null && 'Not tested yet'}
              </span>
            </div>
          </div>

          {Object.values(testStatus).every(s => s === 'success') && (
            <Alert className="mt-6 border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                All authentication flow tests passed successfully! JWT authentication is working correctly.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}