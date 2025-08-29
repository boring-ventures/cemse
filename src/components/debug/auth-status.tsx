"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function AuthStatus() {
  const [authStatus, setAuthStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkAuthStatus = async () => {
    setLoading(true);
    try {
      // Check cookies
      const cookies = document.cookie;
      console.log('🔍 All cookies:', cookies);

      // Test token endpoint
      const tokenResponse = await fetch('/api/auth/get-token', { 
        credentials: 'include',
        method: 'GET'
      });
      
      console.log('🔍 Token response status:', tokenResponse.status);
      
      const tokenData = await tokenResponse.json();
      console.log('🔍 Token data:', tokenData);

      // Test auth/me endpoint
      let userData = null;
      try {
        const userResponse = await fetch('/api/auth/me', { 
          credentials: 'include',
          method: 'GET'
        });
        if (userResponse.ok) {
          userData = await userResponse.json();
        }
      } catch (e) {
        console.log('🔍 Auth/me not available');
      }

      setAuthStatus({
        cookies,
        tokenResponse: {
          status: tokenResponse.status,
          data: tokenData
        },
        userResponse: userData,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('🔍 Auth check error:', error);
      setAuthStatus({
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const testEnrollment = async () => {
    try {
      // First get token
      const tokenResponse = await fetch('/api/auth/get-token', { 
        credentials: 'include'
      });
      
      if (!tokenResponse.ok) {
        throw new Error('No token available');
      }

      const { token } = await tokenResponse.json();
      
      if (!token) {
        throw new Error('Token is empty');
      }

      // Test enrollment API
      const enrollResponse = await fetch('/api/course-enrollments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({ courseId: 'test-course-id' })
      });

      const enrollData = await enrollResponse.json();
      
      console.log('🎓 Enrollment test result:', {
        status: enrollResponse.status,
        data: enrollData
      });

      alert(`Enrollment test: ${enrollResponse.status} - ${JSON.stringify(enrollData)}`);
      
    } catch (error) {
      console.error('🎓 Enrollment test error:', error);
      alert(`Enrollment test failed: ${error}`);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔍 Authentication Debug Panel
          <Button 
            onClick={checkAuthStatus} 
            disabled={loading}
            size="sm"
            variant="outline"
          >
            {loading ? 'Checking...' : 'Refresh'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {authStatus && (
          <div className="space-y-3">
            <div>
              <h4 className="font-medium">Cookies Status:</h4>
              <code className="text-xs bg-gray-100 p-2 rounded block">
                {authStatus.cookies || 'No cookies found'}
              </code>
            </div>

            <div>
              <h4 className="font-medium">Token Endpoint:</h4>
              <div className="flex items-center gap-2">
                <Badge variant={authStatus.tokenResponse?.status === 200 ? "default" : "destructive"}>
                  {authStatus.tokenResponse?.status || 'No Response'}
                </Badge>
                <code className="text-xs">
                  {JSON.stringify(authStatus.tokenResponse?.data || {})}
                </code>
              </div>
            </div>

            {authStatus.userResponse && (
              <div>
                <h4 className="font-medium">User Data:</h4>
                <code className="text-xs bg-gray-100 p-2 rounded block">
                  {JSON.stringify(authStatus.userResponse, null, 2)}
                </code>
              </div>
            )}

            {authStatus.error && (
              <div>
                <h4 className="font-medium text-red-600">Error:</h4>
                <code className="text-xs bg-red-100 p-2 rounded block">
                  {authStatus.error}
                </code>
              </div>
            )}

            <div className="pt-4 border-t">
              <Button 
                onClick={testEnrollment}
                className="w-full"
                variant="outline"
              >
                🎓 Test Course Enrollment API
              </Button>
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500 mt-4">
          Last updated: {authStatus?.timestamp}
        </div>
      </CardContent>
    </Card>
  );
}