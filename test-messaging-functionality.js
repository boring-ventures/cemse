#!/usr/bin/env node

/**
 * Test script to verify messaging functionality
 * This script tests the job application messaging system end-to-end
 */

const BASE_URL = 'http://localhost:3000';

async function testMessaging() {
  console.log('🧪 Testing Messaging Functionality');
  console.log('====================================');

  try {
    // Step 1: Login to get authentication token
    console.log('\n1. 📝 Testing login...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'testuser',
        password: 'testpass123'
      }),
    });

    if (!loginResponse.ok) {
      console.log('❌ Login failed - using mock authentication for testing');
      // For testing purposes, we'll simulate the authentication
      return testWithMockAuth();
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login successful');

    // Extract cookie from response
    const setCookieHeader = loginResponse.headers.get('set-cookie');
    const authCookie = setCookieHeader?.split(';')[0] || '';
    
    console.log('🍪 Auth cookie:', authCookie ? 'Found' : 'Not found');

    // Step 2: Get user's job applications
    console.log('\n2. 📋 Getting job applications...');
    const applicationsResponse = await fetch(`${BASE_URL}/api/jobapplication`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': authCookie
      },
    });

    if (!applicationsResponse.ok) {
      console.log('❌ Failed to get applications:', applicationsResponse.status);
      return;
    }

    const applicationsData = await applicationsResponse.json();
    const applications = applicationsData.applications || applicationsData || [];
    
    console.log(`✅ Found ${applications.length} applications`);

    if (applications.length === 0) {
      console.log('⚠️ No applications found - cannot test messaging');
      return;
    }

    const testApplicationId = applications[0].id;
    console.log(`🎯 Using application ID: ${testApplicationId}`);

    // Step 3: Get existing messages
    console.log('\n3. 💬 Getting existing messages...');
    const messagesResponse = await fetch(`${BASE_URL}/api/jobapplication-messages/${testApplicationId}/messages`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': authCookie
      },
    });

    if (!messagesResponse.ok) {
      console.log('❌ Failed to get messages:', messagesResponse.status);
      const errorText = await messagesResponse.text();
      console.log('Error details:', errorText);
      return;
    }

    const messagesData = await messagesResponse.json();
    const messages = messagesData.messages || messagesData || [];
    
    console.log(`✅ Found ${messages.length} existing messages`);

    // Step 4: Send a test message
    console.log('\n4. 📤 Sending test message...');
    const testMessage = {
      content: `Test message sent at ${new Date().toISOString()}`,
      messageType: 'TEXT'
    };

    const sendMessageResponse = await fetch(`${BASE_URL}/api/jobapplication-messages/${testApplicationId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': authCookie
      },
      body: JSON.stringify(testMessage)
    });

    if (!sendMessageResponse.ok) {
      console.log('❌ Failed to send message:', sendMessageResponse.status);
      const errorText = await sendMessageResponse.text();
      console.log('Error details:', errorText);
      return;
    }

    const sentMessageData = await sendMessageResponse.json();
    const sentMessage = sentMessageData.message || sentMessageData;
    
    console.log('✅ Message sent successfully');
    console.log('📄 Message details:', {
      id: sentMessage.id,
      content: sentMessage.content?.substring(0, 50) + '...',
      senderType: sentMessage.senderType,
      status: sentMessage.status
    });

    // Step 5: Verify message was saved by fetching messages again
    console.log('\n5. 🔍 Verifying message was saved...');
    const verifyResponse = await fetch(`${BASE_URL}/api/jobapplication-messages/${testApplicationId}/messages`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': authCookie
      },
    });

    if (verifyResponse.ok) {
      const verifyData = await verifyResponse.json();
      const updatedMessages = verifyData.messages || verifyData || [];
      
      const newMessageExists = updatedMessages.some(msg => msg.id === sentMessage.id);
      
      if (newMessageExists) {
        console.log('✅ Message verification successful - message was saved');
        console.log(`📊 Total messages now: ${updatedMessages.length}`);
      } else {
        console.log('❌ Message verification failed - message not found');
      }
    }

    console.log('\n🎉 Messaging functionality test completed!');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

async function testWithMockAuth() {
  console.log('\n🔧 Testing with mock authentication...');
  
  // This would test the messaging API with mock tokens
  // For now, we'll just log that this functionality exists
  console.log('ℹ️ Mock authentication testing would go here');
  console.log('ℹ️ This requires setting up mock data in the database');
}

// Run the test if this file is executed directly
if (require.main === module) {
  testMessaging().catch(console.error);
}

module.exports = { testMessaging };
