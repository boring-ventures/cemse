import { apiCall, API_BASE } from '@/lib/api';
import { NewsArticle } from '@/types/news';

// Helper function to ensure image URLs are complete
const processImageUrl = (imageUrl: string): string => {
  if (!imageUrl) return '';

  // Replace localhost URLs with production URL
  if (imageUrl.includes('localhost:3000') || imageUrl.includes('localhost:3001')) {
    return imageUrl.replace(/localhost:\d+/, 'cemse-back-production-56da.up.railway.app').replace('http://', 'https://');
  }

  // If it's already a full URL, return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // If it starts with /uploads, make it a full URL using API_BASE like in job applications
  if (imageUrl.startsWith('/uploads/')) {
    return `${API_BASE.replace('/api', '')}${imageUrl}`;
  }

  // If it's just a filename, assume it's in uploads
  if (!imageUrl.includes('/')) {
    return `${API_BASE.replace('/api', '')}/uploads/${imageUrl}`;
  }

  return imageUrl;
};

export class NewsArticleService {
  // GET /api/newsarticle - Obtener mis noticias (Empresa/Municipio)
  static async getAll(): Promise<NewsArticle[]> {
    console.log("📰 NewsArticleService.getAll() - Calling apiCall('/newsarticle')");
    try {
      const result = await apiCall('/newsarticle');
      console.log("✅ NewsArticleService.getAll() - Success:", result);

      // Process image URLs
      if (Array.isArray(result)) {
        return result.map(news => ({
          ...news,
          imageUrl: processImageUrl(news.imageUrl)
        }));
      }

      return result;
    } catch (error) {
      console.error("❌ NewsArticleService.getAll() - Error:", error);
      throw error;
    }
  }

  // GET /api/newsarticle/{id} - Obtener noticia específica
  static async getById(id: string): Promise<NewsArticle> {
    console.log("📰 NewsArticleService.getById() - Calling apiCall(`/newsarticle/${id}`)");
    try {
      const result = await apiCall(`/newsarticle/${id}`);
      console.log("✅ NewsArticleService.getById() - Success:", result);

      // Process image URL
      return {
        ...result,
        imageUrl: processImageUrl(result.imageUrl)
      };
    } catch (error) {
      console.error("❌ NewsArticleService.getById() - Error:", error);
      throw error;
    }
  }

  // POST /api/newsarticle - Crear noticia (JSON data)
  static async create(data: Partial<NewsArticle>): Promise<NewsArticle> {
    console.log("📰 NewsArticleService.create() - Calling apiCall('/newsarticle') with data:", data);
    try {
      const result = await apiCall('/newsarticle', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      console.log("✅ NewsArticleService.create() - Success:", result);
      return result;
    } catch (error) {
      console.error("❌ NewsArticleService.create() - Error:", error);
      throw error;
    }
  }

  // PUT /api/newsarticle/{id} - Editar noticia (JSON data)
  static async update(id: string, data: Partial<NewsArticle>): Promise<NewsArticle> {
    console.log("📰 NewsArticleService.update() - Calling apiCall(`/newsarticle/${id}`) with data:", data);
    try {
      const result = await apiCall(`/newsarticle/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      console.log("✅ NewsArticleService.update() - Success:", result);
      return result;
    } catch (error) {
      console.error("❌ NewsArticleService.update() - Error:", error);
      throw error;
    }
  }

  // DELETE /api/newsarticle/{id} - Eliminar noticia
  static async delete(id: string): Promise<void> {
    console.log("📰 NewsArticleService.delete() - Calling apiCall(`/newsarticle/${id}`)");
    try {
      await apiCall(`/newsarticle/${id}`, {
        method: 'DELETE'
      });
      console.log("✅ NewsArticleService.delete() - Success");
    } catch (error) {
      console.error("❌ NewsArticleService.delete() - Error:", error);
      throw error;
    }
  }

  // GET /api/newsarticle - Obtener noticias públicas (para jóvenes)
  static async getPublicNews(): Promise<NewsArticle[]> {
    console.log("📰 NewsArticleService.getPublicNews() - Calling apiCall('/newsarticle')");
    try {
      const result = await apiCall('/newsarticle');
      console.log("✅ NewsArticleService.getPublicNews() - Success:", result);

      // Handle different response formats
      let newsArray: NewsArticle[] = [];

      if (result && typeof result === 'object') {
        if (Array.isArray(result)) {
          newsArray = result;
        } else if (result.news && Array.isArray(result.news)) {
          newsArray = result.news;
        } else if (result.data && Array.isArray(result.data)) {
          newsArray = result.data;
        }
      }

      console.log("📰 NewsArticleService.getPublicNews() - Processed newsArray:", newsArray);

      // Process image URLs and ensure we return an array
      if (Array.isArray(newsArray)) {
        return newsArray.map(news => ({
          ...news,
          imageUrl: processImageUrl(news.imageUrl || '')
        }));
      }

      // Return empty array if no valid data found
      console.warn("📰 NewsArticleService.getPublicNews() - No valid news array found, returning empty array");
      return [];
    } catch (error) {
      console.error("❌ NewsArticleService.getPublicNews() - Error:", error);
      throw error;
    }
  }

  // GET /api/newsarticle?authorId={id} - Obtener noticias por autor
  static async getByAuthor(authorId: string): Promise<NewsArticle[]> {
    console.log("📰 NewsArticleService.getByAuthor() - Calling apiCall(`/newsarticle?authorId=${authorId}`)");
    try {
      const result = await apiCall(`/newsarticle?authorId=${authorId}`);
      console.log("✅ NewsArticleService.getByAuthor() - Success:", result);

      // Process image URLs
      if (Array.isArray(result)) {
        return result.map(news => ({
          ...news,
          imageUrl: processImageUrl(news.imageUrl)
        }));
      }

      return result;
    } catch (error) {
      console.error("❌ NewsArticleService.getByAuthor() - Error:", error);
      throw error;
    }
  }

  // GET /api/newsarticle?category={category} - Obtener noticias por categoría
  static async getByCategory(category: string): Promise<NewsArticle[]> {
    console.log("📰 NewsArticleService.getByCategory() - Calling apiCall(`/newsarticle?category=${category}`)");
    try {
      const result = await apiCall(`/newsarticle?category=${category}`);
      console.log("✅ NewsArticleService.getByCategory() - Success:", result);
      return result;
    } catch (error) {
      console.error("❌ NewsArticleService.getByCategory() - Error:", error);
      throw error;
    }
  }

  // GET /api/newsarticle?status={status} - Obtener noticias por estado
  static async getByStatus(status: string): Promise<NewsArticle[]> {
    console.log("📰 NewsArticleService.getByStatus() - Calling apiCall(`/newsarticle?status=${status}`)");
    try {
      const result = await apiCall(`/newsarticle?status=${status}`);
      console.log("✅ NewsArticleService.getByStatus() - Success:", result);
      return result;
    } catch (error) {
      console.error("❌ NewsArticleService.getByStatus() - Error:", error);
      throw error;
    }
  }

  // GET /api/newsarticle?authorType={type} - Obtener noticias por tipo de autor
  static async getByType(type: string): Promise<NewsArticle[]> {
    console.log("📰 NewsArticleService.getByType() - Calling apiCall(`/newsarticle?authorType=${type}`)");
    try {
      const result = await apiCall(`/newsarticle?authorType=${type}`);
      console.log("✅ NewsArticleService.getByType() - Success:", result);
      return result;
    } catch (error) {
      console.error("❌ NewsArticleService.getByType() - Error:", error);
      throw error;
    }
  }

  // GET /api/newsarticle/public?featured=true - Obtener noticias destacadas
  static async getFeatured(): Promise<NewsArticle[]> {
    console.log("📰 NewsArticleService.getFeatured() - Calling apiCall('/newsarticle/public?featured=true')");
    try {
      const result = await apiCall('/newsarticle/public?featured=true');
      console.log("✅ NewsArticleService.getFeatured() - Success:", result);
      return result.news || result;
    } catch (error) {
      console.error("❌ NewsArticleService.getFeatured() - Error:", error);
      throw error;
    }
  }

  // GET /api/newsarticle/public?status=PUBLISHED - Obtener noticias publicadas
  static async getPublished(): Promise<NewsArticle[]> {
    console.log("📰 NewsArticleService.getPublished() - Calling apiCall('/newsarticle/public')");
    try {
      const result = await apiCall('/newsarticle/public');
      console.log("✅ NewsArticleService.getPublished() - Success:", result);
      return result.news || result;
    } catch (error) {
      console.error("❌ NewsArticleService.getPublished() - Error:", error);
      throw error;
    }
  }

  // GET /api/newsarticle/public?search={query} - Buscar noticias
  static async searchNews(query: string): Promise<NewsArticle[]> {
    console.log("📰 NewsArticleService.searchNews() - Calling apiCall(`/newsarticle/public?search=${query}`)");
    try {
      const result = await apiCall(`/newsarticle/public?search=${encodeURIComponent(query)}`);
      console.log("✅ NewsArticleService.searchNews() - Success:", result);
      return result.news || result;
    } catch (error) {
      console.error("❌ NewsArticleService.searchNews() - Error:", error);
      throw error;
    }
  }

  // GET /api/newsarticle - Obtener estadísticas de noticias
  static async getNewsStats(): Promise<any> {
    console.log("📰 NewsArticleService.getNewsStats() - Calling apiCall('/newsarticle')");
    try {
      const result = await apiCall('/newsarticle');
      console.log("✅ NewsArticleService.getNewsStats() - Success:", result);
      return result;
    } catch (error) {
      console.error("❌ NewsArticleService.getNewsStats() - Error:", error);
      throw error;
    }
  }

  // POST /api/newsarticle/{id}/views - Incrementar vistas
  static async incrementViews(id: string): Promise<NewsArticle> {
    console.log("📰 NewsArticleService.incrementViews() - Calling apiCall(`/newsarticle/${id}/views`)");
    try {
      const result = await apiCall(`/newsarticle/${id}/views`, {
        method: 'POST'
      });
      console.log("✅ NewsArticleService.incrementViews() - Success:", result);
      return result;
    } catch (error) {
      console.error("❌ NewsArticleService.incrementViews() - Error:", error);
      throw error;
    }
  }

  // POST /api/newsarticle/{id}/featured - Cambiar estado destacado
  static async toggleFeatured(id: string): Promise<NewsArticle> {
    console.log("📰 NewsArticleService.toggleFeatured() - Calling apiCall(`/newsarticle/${id}/featured`)");
    try {
      const result = await apiCall(`/newsarticle/${id}/featured`, {
        method: 'POST'
      });
      console.log("✅ NewsArticleService.toggleFeatured() - Success:", result);
      return result;
    } catch (error) {
      console.error("❌ NewsArticleService.toggleFeatured() - Error:", error);
      throw error;
    }
  }

  // PUT /api/newsarticle/{id} - Actualizar estado
  static async updateStatus(id: string, status: string): Promise<NewsArticle> {
    console.log("📰 NewsArticleService.updateStatus() - Calling apiCall(`/newsarticle/${id}`) with status:", status);
    try {
      const result = await apiCall(`/newsarticle/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      console.log("✅ NewsArticleService.updateStatus() - Success:", result);
      return result;
    } catch (error) {
      console.error("❌ NewsArticleService.updateStatus() - Error:", error);
      throw error;
    }
  }

  // POST /api/newsarticle - Crear noticia con imagen (multipart/form-data)
  // USAR ESTE MÉTODO cuando hay imágenes o archivos
  static async createWithImage(formData: FormData): Promise<NewsArticle> {
    console.log("📰 NewsArticleService.createWithImage() - Calling apiCall('/newsarticle') with FormData");
    try {
      const result = await apiCall('/newsarticle', {
        method: 'POST',
        body: formData
        // No headers needed - apiCall will handle FormData correctly
      });
      console.log("✅ NewsArticleService.createWithImage() - Success:", result);

      // Process image URL
      return {
        ...result,
        imageUrl: processImageUrl(result.imageUrl)
      };
    } catch (error) {
      console.error("❌ NewsArticleService.createWithImage() - Error:", error);
      throw error;
    }
  }

  // PUT /api/newsarticle/{id} - Editar noticia con imagen (multipart/form-data)
  // USAR ESTE MÉTODO cuando hay imágenes o archivos
  static async updateWithImage(id: string, formData: FormData): Promise<NewsArticle> {
    console.log("📰 NewsArticleService.updateWithImage() - Calling apiCall(`/newsarticle/${id}`) with FormData");
    try {
      const result = await apiCall(`/newsarticle/${id}`, {
        method: 'PUT',
        body: formData
        // No headers needed - apiCall will handle FormData correctly
      });
      console.log("✅ NewsArticleService.updateWithImage() - Success:", result);

      // Process image URL
      return {
        ...result,
        imageUrl: processImageUrl(result.imageUrl)
      };
    } catch (error) {
      console.error("❌ NewsArticleService.updateWithImage() - Error:", error);
      throw error;
    }
  }
} 