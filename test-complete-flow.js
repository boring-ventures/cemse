#!/usr/bin/env node

/**
 * Complete test for company creation and authentication flow
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testCompleteFlow() {
  console.log('🧪 Testing Complete Company Creation and Authentication Flow\n');

  // Generate unique test data
  const timestamp = Date.now();
  const companyData = {
    name: `Test Company ${timestamp}`,
    description: 'A test company for validation',
    businessSector: 'Technology',
    companySize: 'SMALL',
    foundedYear: 2020,
    website: 'https://testcompany.com',
    email: `test${timestamp}@testcompany.com`,
    phone: '+1234567890',
    address: '123 Test Street',
    municipalityId: 'municipality_1',
    username: `testcompany_${timestamp}`,
    password: 'TestPass123!'
  };

  try {
    console.log('📝 Step 1: Creating company with credentials...');
    console.log('Company data:', {
      name: companyData.name,
      username: companyData.username,
      email: companyData.email,
      municipalityId: companyData.municipalityId
    });

    const createResponse = await fetch(`${BASE_URL}/api/company`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'cemse-auth-token=mock-dev-token-admin-12345'
      },
      body: JSON.stringify(companyData)
    });

    const createResponseText = await createResponse.text();
    console.log('Create response status:', createResponse.status);
    console.log('Create response headers:', Object.fromEntries(createResponse.headers));

    if (!createResponse.ok) {
      console.error('❌ Company creation failed');
      console.error('Response:', createResponseText);
      return;
    }

    const createdCompany = JSON.parse(createResponseText);
    console.log('✅ Company created successfully:', {
      id: createdCompany.id,
      name: createdCompany.name,
      username: createdCompany.username,
      hasPassword: !!createdCompany.password,
      municipality: createdCompany.municipality?.name
    });

    // Wait a moment to ensure database consistency
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('\n🔐 Step 2: Testing login with company credentials...');
    console.log('Login attempt with:', {
      username: companyData.username,
      passwordLength: companyData.password.length
    });

    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: companyData.username,
        password: companyData.password
      })
    });

    const loginResponseText = await loginResponse.text();
    console.log('Login response status:', loginResponse.status);
    console.log('Login response headers:', Object.fromEntries(loginResponse.headers));

    if (!loginResponse.ok) {
      console.error('❌ Login failed');
      console.error('Response:', loginResponseText);
      
      // Try alternative login methods
      console.log('\n🔄 Trying login with email...');
      const emailLoginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: companyData.email,
          password: companyData.password
        })
      });

      if (emailLoginResponse.ok) {
        console.log('✅ Email login successful!');
      } else {
        const emailLoginText = await emailLoginResponse.text();
        console.error('❌ Email login also failed:', emailLoginText);
      }
      
      return;
    }

    const loginResult = JSON.parse(loginResponseText);
    console.log('✅ Login successful:', {
      success: loginResult.success,
      userRole: loginResult.user?.role,
      companyName: loginResult.company?.name,
      userId: loginResult.user?.id
    });

    // Extract cookies for authenticated requests
    const setCookieHeader = loginResponse.headers.get('set-cookie');
    console.log('Auth cookie set:', !!setCookieHeader);

    console.log('\n🔍 Step 3: Testing authenticated request...');
    const meResponse = await fetch(`${BASE_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Cookie': setCookieHeader || ''
      }
    });

    if (!meResponse.ok) {
      const meErrorText = await meResponse.text();
      console.error('❌ Authenticated request failed:', meErrorText);
      return;
    }

    const meResult = await meResponse.json();
    console.log('✅ Authenticated request successful:', {
      userId: meResult.user?.id,
      role: meResult.user?.role,
      companyName: meResult.company?.name,
      authenticated: true
    });

    console.log('\n🎉 All tests passed! Company creation and authentication flow is working correctly.');
    console.log('\nSummary:');
    console.log(`- Company "${companyData.name}" created successfully`);
    console.log(`- User "${companyData.username}" can authenticate`);
    console.log(`- Authentication tokens work properly`);
    console.log(`- Company role "${loginResult.user?.role}" is correctly assigned`);

  } catch (error) {
    console.error('💥 Test failed with error:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
if (require.main === module) {
  testCompleteFlow();
}

module.exports = { testCompleteFlow };

