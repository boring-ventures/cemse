const https = require('https');

const API_BASE = 'https://localhost:3000';

// Test enrollment functionality
async function testEnrollment() {
  console.log('🔍 Testing Course Enrollment API...\n');

  try {
    // First, get a test JWT token (you'll need to replace this with a real token)
    const testToken = 'your-jwt-token-here';
    
    if (testToken === 'your-jwt-token-here') {
      console.log('❌ Please replace testToken with a real JWT token from your browser dev tools');
      console.log('   1. Open browser dev tools');
      console.log('   2. Go to Application/Storage > Cookies');
      console.log('   3. Find the auth token');
      console.log('   4. Replace testToken in this script\n');
      return;
    }

    // Test 1: Get current enrollments
    console.log('📚 Test 1: Getting current enrollments...');
    const enrollmentsResponse = await fetch(`${API_BASE}/api/course-enrollments`, {
      headers: {
        'Authorization': `Bearer ${testToken}`,
        'Content-Type': 'application/json',
      }
    });
    
    const enrollments = await enrollmentsResponse.json();
    console.log('✅ Current enrollments:', enrollments.enrollments?.length || 0);
    console.log('   Data:', JSON.stringify(enrollments, null, 2));

    // Test 2: Get available courses
    console.log('\n📚 Test 2: Getting available courses...');
    const coursesResponse = await fetch(`${API_BASE}/api/course`, {
      headers: {
        'Authorization': `Bearer ${testToken}`,
        'Content-Type': 'application/json',
      }
    });
    
    const courses = await coursesResponse.json();
    const availableCourses = courses.courses || [];
    console.log('✅ Available courses:', availableCourses.length);
    
    if (availableCourses.length > 0) {
      const testCourse = availableCourses[0];
      console.log('   Test course:', testCourse.title, '(ID:', testCourse.id + ')');

      // Test 3: Enroll in first course
      console.log('\n📚 Test 3: Enrolling in course...');
      const enrollResponse = await fetch(`${API_BASE}/api/course-enrollments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${testToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId: testCourse.id
        })
      });

      if (enrollResponse.ok) {
        const enrollment = await enrollResponse.json();
        console.log('✅ Successfully enrolled!');
        console.log('   Enrollment ID:', enrollment.id);
        console.log('   Status:', enrollment.status);
        console.log('   Progress:', enrollment.progress);
      } else {
        const error = await enrollResponse.json();
        console.log('❌ Enrollment failed:', enrollResponse.status);
        console.log('   Error:', error);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testEnrollment();
