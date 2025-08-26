import { Client } from 'minio';

// MinIO Client Configuration
const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin'
});

// Bucket names
export const BUCKETS = {
  VIDEOS: 'videos',
  IMAGES: 'images', 
  DOCUMENTS: 'documents',
  COURSES: 'courses',
  LESSONS: 'lessons',
  RESOURCES: 'resources',
} as const;

// Initialize buckets function
export const initializeBuckets = async () => {
  try {
    console.log('🚀 Initializing MinIO buckets...\n');
    
    const buckets = Object.values(BUCKETS);
    
    for (const bucketName of buckets) {
      try {
        const exists = await minioClient.bucketExists(bucketName);
        
        if (!exists) {
          await minioClient.makeBucket(bucketName, 'us-east-1');
          console.log(`✅ Bucket '${bucketName}' created successfully`);
          
          // Set public policy for videos and images
          if (bucketName === BUCKETS.VIDEOS || bucketName === BUCKETS.IMAGES) {
            const policy = {
              Version: '2012-10-17',
              Statement: [
                {
                  Effect: 'Allow',
                  Principal: { AWS: ['*'] },
                  Action: ['s3:GetObject'],
                  Resource: [`arn:aws:s3:::${bucketName}/*`]
                }
              ]
            };
            
            await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
            console.log(`✅ Public policy configured for bucket '${bucketName}'`);
          }
        } else {
          console.log(`ℹ️ Bucket '${bucketName}' already exists`);
        }
      } catch (error) {
        console.error(`❌ Error with bucket '${bucketName}':`, error instanceof Error ? error.message : 'Unknown error');
      }
    }
    
    console.log('\n🎉 MinIO initialization completed!');
    console.log('\n📋 Access Information:');
    console.log('🌐 Web Console: http://127.0.0.1:9001');
    console.log('🔑 Username: minioadmin');
    console.log('🔐 Password: minioadmin');
    console.log('\n📁 Buckets created:');
    buckets.forEach(bucket => {
      console.log(`   - ${bucket}`);
    });
    
  } catch (error) {
    console.error('❌ Error initializing buckets:', error);
    throw error;
  }
};

// Upload file function
export const uploadFile = async (
  bucketName: string, 
  fileName: string, 
  buffer: Buffer, 
  metadata?: Record<string, string>
) => {
  try {
    const uploadInfo = await minioClient.putObject(
      bucketName, 
      fileName, 
      buffer, 
      buffer.length, 
      metadata
    );
    
    const url = `${process.env.MINIO_BASE_URL || 'http://localhost:9000'}/${bucketName}/${fileName}`;
    
    return {
      success: true,
      url,
      etag: uploadInfo.etag,
      fileName,
      bucketName
    };
  } catch (error) {
    console.error('❌ Error uploading file:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Get file URL function
export const getFileUrl = (bucketName: string, fileName: string) => {
  return `${process.env.MINIO_BASE_URL || 'http://localhost:9000'}/${bucketName}/${fileName}`;
};

// Delete file function
export const deleteFile = async (bucketName: string, fileName: string) => {
  try {
    await minioClient.removeObject(bucketName, fileName);
    return { success: true };
  } catch (error) {
    console.error('❌ Error deleting file:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Check MinIO health
export const checkMinIOHealth = async () => {
  try {
    await minioClient.listBuckets();
    return { status: 'healthy', timestamp: new Date().toISOString() };
  } catch (error) {
    return { 
      status: 'unhealthy', 
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString() 
    };
  }
};

export default minioClient;