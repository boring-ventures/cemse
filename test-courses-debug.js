const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testCourses() {
  try {
    console.log('🔍 Testing course retrieval...');
    
    // Get all courses
    const allCourses = await prisma.course.findMany({
      include: {
        instructor: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            role: true,
          }
        },
        _count: {
          select: {
            enrollments: true,
            modules: true,
          }
        }
      }
    });
    
    console.log('📚 Total courses found:', allCourses.length);
    
    if (allCourses.length > 0) {
      console.log('📚 Course details:');
      allCourses.forEach((course, index) => {
        console.log(`  ${index + 1}. ${course.title}`);
        console.log(`     - ID: ${course.id}`);
        console.log(`     - Slug: ${course.slug || 'MISSING'}`);
        console.log(`     - Active: ${course.isActive}`);
        console.log(`     - Instructor: ${course.instructorId}`);
        console.log(`     - Modules: ${course._count.modules}`);
        console.log(`     - Enrollments: ${course._count.enrollments}`);
      });
    } else {
      console.log('❌ No courses found in database');
    }
    
    // Check active courses specifically
    const activeCourses = await prisma.course.findMany({
      where: { isActive: true }
    });
    console.log('📚 Active courses found:', activeCourses.length);
    
  } catch (error) {
    console.error('❌ Error testing courses:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCourses();
