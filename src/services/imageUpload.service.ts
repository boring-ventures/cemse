import { apiCall } from '@/lib/api';

interface LogoUploadResponse {
  logoUrl: string;
  filename: string;
}

interface ImageUploadResponse {
  images: Array<{
    imageUrl: string;
    filename: string;
  }>;
}

export class ImageUploadService {
  // Upload entrepreneurship logo
  static async uploadLogo(logoFile: File): Promise<{ logoUrl: string; filename: string }> {
    try {
      console.log('🔍 ImageUploadService.uploadLogo - Uploading logo:', logoFile.name);
      
      const formData = new FormData();
      formData.append('logo', logoFile);
      
      const response = await apiCall('/files/upload/entrepreneurship-logo', {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type, let the browser set it with boundary for FormData
        }
      }) as LogoUploadResponse;
      
      console.log('✅ ImageUploadService.uploadLogo - Success:', response);
      return {
        logoUrl: response.logoUrl,
        filename: response.filename
      };
    } catch (error) {
      console.error('❌ ImageUploadService.uploadLogo - Error:', error);
      throw error;
    }
  }

  // Upload entrepreneurship images
  static async uploadImages(imageFiles: File[]): Promise<Array<{ imageUrl: string; filename: string }>> {
    try {
      console.log('🔍 ImageUploadService.uploadImages - Uploading images:', imageFiles.length);
      
      const formData = new FormData();
      imageFiles.forEach((file, index) => {
        formData.append('images', file);
      });
      
      const response = await apiCall('/files/upload/entrepreneurship-images', {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type, let the browser set it with boundary for FormData
        }
      }) as ImageUploadResponse;
      
      console.log('✅ ImageUploadService.uploadImages - Success:', response);
      return response.images.map((img) => ({
        imageUrl: img.imageUrl,
        filename: img.filename
      }));
    } catch (error) {
      console.error('❌ ImageUploadService.uploadImages - Error:', error);
      throw error;
    }
  }
}
