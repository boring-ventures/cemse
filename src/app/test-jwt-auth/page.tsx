"use client";

import { useState } from 'react';
import { JWTAuthProvider, useJWTAuth } from '@/context/jwt-auth-context';
import { useAuth } from '@/hooks/useJWTAuth';
import { useRole, RoleGuard } from '@/hooks/useRole';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Test component that uses the JWT auth context
function JWTAuthTest() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [testResults, setTestResults] = useState<string[]>([]);

  // Test both hooks
  const auth = useAuth();
  const role = useRole();

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const handleLogin = async () => {
    try {
      addTestResult('🔐 Starting login test...');
      await auth.login(username, password);
      addTestResult('✅ Login successful');
    } catch (error) {
      addTestResult(`❌ Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleLogout = async () => {
    try {
      addTestResult('🔓 Starting logout test...');
      await auth.logout();
      addTestResult('✅ Logout successful');
    } catch (error) {
      addTestResult(`❌ Logout failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleRefreshToken = async () => {
    try {
      addTestResult('🔄 Testing token refresh...');
      const success = await auth.refreshToken();
      if (success) {
        addTestResult('✅ Token refresh successful');
      } else {
        addTestResult('❌ Token refresh failed');
      }
    } catch (error) {
      addTestResult(`❌ Token refresh error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const testRolePermissions = () => {
    addTestResult('🛡️ Testing role permissions...');
    addTestResult(`Current role: ${role.currentRole || 'None'}`);
    addTestResult(`Role display name: ${role.getRoleDisplayName()}`);
    addTestResult(`Role color: ${role.getRoleColor()}`);
    addTestResult(`Is admin: ${role.isAdmin}`);
    addTestResult(`Is student: ${role.isStudent}`);
    addTestResult(`Is organization: ${role.isOrganization}`);
    addTestResult(`Has SUPERADMIN role: ${role.hasRole('SUPERADMIN')}`);
    addTestResult(`Has permission 'full_access': ${role.hasPermission('full_access')}`);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">JWT Authentication Test Page</h1>
      
      {/* Auth State Display */}
      <Card>
        <CardHeader>
          <CardTitle>Authentication State</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <strong>Loading:</strong> <Badge variant={auth.loading ? "destructive" : "default"}>{auth.loading ? "Yes" : "No"}</Badge>
          </div>
          <div>
            <strong>Authenticated:</strong> <Badge variant={auth.isAuthenticated ? "default" : "destructive"}>{auth.isAuthenticated ? "Yes" : "No"}</Badge>
          </div>
          <div>
            <strong>User:</strong> {auth.user ? (
              <div className="ml-4">
                <div>ID: {auth.user.id}</div>
                <div>Username: {auth.user.username}</div>
                <div>Role: <Badge>{auth.user.role}</Badge></div>
                <div>Type: {auth.user.type}</div>
                <div>Active: <Badge variant={auth.user.isActive ? "default" : "destructive"}>{auth.user.isActive ? "Yes" : "No"}</Badge></div>
              </div>
            ) : (
              <span className="text-gray-500">Not logged in</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Role Information */}
      <Card>
        <CardHeader>
          <CardTitle>Role Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <strong>Current Role:</strong> <Badge>{role.currentRole || 'None'}</Badge>
          </div>
          <div>
            <strong>Display Name:</strong> {role.getRoleDisplayName()}
          </div>
          <div>
            <strong>Role Color:</strong> <span className={`text-${role.getRoleColor()}-600`}>{role.getRoleColor()}</span>
          </div>
          <div className="space-y-2">
            <div><strong>Role Groups:</strong></div>
            <div className="ml-4 space-x-2">
              <Badge variant={role.isAdmin ? "default" : "outline"}>Admin</Badge>
              <Badge variant={role.isStudent ? "default" : "outline"}>Student</Badge>
              <Badge variant={role.isOrganization ? "default" : "outline"}>Organization</Badge>
              <Badge variant={role.isService ? "default" : "outline"}>Service</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Login Form */}
      {!auth.isAuthenticated && (
        <Card>
          <CardHeader>
            <CardTitle>Login Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label>Username:</label>
              <Input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
              />
            </div>
            <div>
              <label>Password:</label>
              <Input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
              />
            </div>
            <Button onClick={handleLogin} disabled={auth.loading}>
              {auth.loading ? 'Logging in...' : 'Login'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {auth.isAuthenticated && (
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-x-2">
              <Button onClick={handleLogout}>Logout</Button>
              <Button onClick={handleRefreshToken}>Test Token Refresh</Button>
              <Button onClick={testRolePermissions}>Test Role Permissions</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Role-based content examples */}
      <Card>
        <CardHeader>
          <CardTitle>Role-based Content Examples</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RoleGuard allowedRoles={['SUPERADMIN']} fallback={<div className="text-gray-500">Only visible to Super Admins</div>}>
            <div className="p-4 bg-red-50 border border-red-200 rounded">
              <h3 className="text-red-800 font-bold">Super Admin Only Content</h3>
              <p className="text-red-700">This content is only visible to users with SUPERADMIN role.</p>
            </div>
          </RoleGuard>

          <RoleGuard allowedRoles={['YOUTH', 'ADOLESCENTS']} fallback={<div className="text-gray-500">Only visible to Students</div>}>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded">
              <h3 className="text-blue-800 font-bold">Student Content</h3>
              <p className="text-blue-700">This content is only visible to Youth and Adolescents.</p>
            </div>
          </RoleGuard>

          <RoleGuard allowedRoles={['COMPANIES']} fallback={<div className="text-gray-500">Only visible to Companies</div>}>
            <div className="p-4 bg-purple-50 border border-purple-200 rounded">
              <h3 className="text-purple-800 font-bold">Company Content</h3>
              <p className="text-purple-700">This content is only visible to Companies.</p>
            </div>
          </RoleGuard>
        </CardContent>
      </Card>

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {testResults.length === 0 ? (
              <div className="text-gray-500">No test results yet</div>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className="text-sm font-mono">{result}</div>
              ))
            )}
          </div>
          {testResults.length > 0 && (
            <Button onClick={() => setTestResults([])} variant="outline" className="mt-4">
              Clear Results
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Main page component with provider
export default function TestJWTAuthPage() {
  return (
    <JWTAuthProvider>
      <JWTAuthTest />
    </JWTAuthProvider>
  );
}