import { apiCall, getAuthHeaders } from '@/lib/api';

// Tipos de datos para las postulaciones de jóvenes
export interface YouthApplication {
    id: string;
    title: string;
    description: string;
    cvFile?: string;
    coverLetterFile?: string;
    status: 'ACTIVE' | 'PAUSED' | 'CLOSED' | 'HIRED';
    isPublic: boolean;
    viewsCount: number;
    applicationsCount: number;
    youthProfileId: string;
    createdAt: string;
    youthProfile?: YouthProfile;
    messages?: YouthApplicationMessage[];
    companyInterests?: CompanyInterest[];
}

export interface YouthProfile {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
    skills?: string[];
    educationLevel?: string;
    currentDegree?: string;
    universityName?: string;
    workExperience?: WorkExperience[];
    languages?: Language[];
    projects?: Project[];
}

export interface WorkExperience {
    company: string;
    position: string;
    duration: string;
}

export interface Language {
    language: string;
    level: string;
}

export interface Project {
    name: string;
    description: string;
    url?: string;
}

export interface YouthApplicationMessage {
    id: string;
    applicationId: string;
    senderId: string;
    senderType: 'YOUTH' | 'COMPANY';
    content: string;
    messageType: 'TEXT' | 'FILE';
    status: 'SENT' | 'DELIVERED' | 'READ';
    createdAt: string;
    readAt?: string;
}

export interface CompanyInterest {
    id: string;
    applicationId: string;
    companyId: string;
    status: 'INTERESTED' | 'CONTACTED' | 'INTERVIEW_SCHEDULED' | 'HIRED' | 'NOT_INTERESTED';
    message?: string;
    createdAt: string;
    updatedAt: string;
    company?: Company;
}

export interface Company {
    id: string;
    name: string;
    businessSector?: string;
    email?: string;
    website?: string;
}

// Interfaces para las peticiones
export interface CreateYouthApplicationRequest {
    title: string;
    description: string;
    isPublic?: boolean;
    cvUrl?: string;
    coverLetterUrl?: string;
    cvFile?: File;
    coverLetterFile?: File;
}

export interface UpdateYouthApplicationRequest {
    title?: string;
    description?: string;
    status?: 'ACTIVE' | 'PAUSED' | 'CLOSED' | 'HIRED';
    isPublic?: boolean;
    cvUrl?: string;
    coverLetterUrl?: string;
    cvFile?: File;
    coverLetterFile?: File;
}

export interface SendMessageRequest {
    content: string;
    senderType?: 'YOUTH' | 'COMPANY'; // Optional - will be determined by API based on user type
}

export interface ExpressInterestRequest {
    companyId: string;
    status: 'INTERESTED' | 'CONTACTED' | 'INTERVIEW_SCHEDULED' | 'HIRED' | 'NOT_INTERESTED';
    message?: string;
}

export class YouthApplicationService {
    /**
     * Crear una nueva postulación de joven
     */
    static async createYouthApplication(data: CreateYouthApplicationRequest): Promise<YouthApplication> {
        try {
            console.log('👥 YouthApplicationService.createYouthApplication - Creating application:', data);
            console.log('🔐 YouthApplicationService.createYouthApplication - Using cookie-based authentication');

            let cvUrl: string | undefined;
            let coverLetterUrl: string | undefined;

            // Upload CV file if provided
            if (data.cvFile) {
                console.log('📄 Uploading CV file:', data.cvFile.name);
                try {
                    const cvFormData = new FormData();
                    cvFormData.append('cvFile', data.cvFile);

                    const cvUploadResponse = await apiCall('/files/upload/cv', {
                        method: 'POST',
                        headers: getAuthHeaders(true), // excludeContentType for FormData
                        body: cvFormData
                    }) as { cvUrl: string };

                    cvUrl = cvUploadResponse.cvUrl;
                    console.log('✅ CV file uploaded successfully:', cvUrl);
                } catch (error) {
                    console.error('❌ Error uploading CV file:', error);
                    throw new Error('Error al subir el archivo CV. Por favor, inténtalo de nuevo.');
                }
            }

            // Upload cover letter file if provided
            if (data.coverLetterFile) {
                console.log('📄 Uploading cover letter file:', data.coverLetterFile.name);
                try {
                    const coverLetterFormData = new FormData();
                    coverLetterFormData.append('coverLetterFile', data.coverLetterFile);

                    const coverLetterUploadResponse = await apiCall('/files/upload/cover-letter', {
                        method: 'POST',
                        headers: getAuthHeaders(true), // excludeContentType for FormData
                        body: coverLetterFormData
                    }) as { coverLetterUrl: string };

                    coverLetterUrl = coverLetterUploadResponse.coverLetterUrl;
                    console.log('✅ Cover letter file uploaded successfully:', coverLetterUrl);
                } catch (error) {
                    console.error('❌ Error uploading cover letter file:', error);
                    throw new Error('Error al subir la carta de presentación. Por favor, inténtalo de nuevo.');
                }
            }

            // Create application payload with file URLs
            const payload = {
                title: data.title,
                description: data.description,
                isPublic: data.isPublic ?? true,
                cvUrl: cvUrl || data.cvUrl,
                coverLetterUrl: coverLetterUrl || data.coverLetterUrl
            };

            console.log('🔐 YouthApplicationService.createYouthApplication - Sending payload:', payload);

            const response = await apiCall('/youthapplication', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(payload)
            });

            console.log('✅ YouthApplicationService.createYouthApplication - Application created:', response);
            return response;
        } catch (error) {
            console.error('❌ YouthApplicationService.createYouthApplication - Error:', error);
            throw error;
        }
    }

    /**
     * Obtener todas las postulaciones de jóvenes
     */
    static async getYouthApplications(filters?: {
        youthProfileId?: string;
        status?: string;
        isPublic?: boolean;
    }): Promise<YouthApplication[]> {
        try {
            console.log('👥 YouthApplicationService.getYouthApplications - Getting applications with filters:', filters);

            const params = new URLSearchParams();
            if (filters?.youthProfileId) params.append('youthProfileId', filters.youthProfileId);
            if (filters?.status) params.append('status', filters.status);
            if (filters?.isPublic !== undefined) params.append('isPublic', filters.isPublic.toString());

            const url = `/youthapplication${params.toString() ? `?${params.toString()}` : ''}`;
            const response = await apiCall(url, {
                method: 'GET',
                headers: getAuthHeaders()
            });

            console.log('✅ YouthApplicationService.getYouthApplications - Applications retrieved:', response);
            return response;
        } catch (error) {
            console.error('❌ YouthApplicationService.getYouthApplications - Error:', error);
            throw error;
        }
    }

    /**
     * Obtener una postulación específica
     */
    static async getYouthApplication(id: string): Promise<YouthApplication> {
        try {
            console.log('👥 YouthApplicationService.getYouthApplication - Getting application:', id);

            const response = await apiCall(`/youthapplication/${id}`, {
                method: 'GET',
                headers: getAuthHeaders()
            });

            console.log('✅ YouthApplicationService.getYouthApplication - Application retrieved:', response);
            return response;
        } catch (error) {
            console.error('❌ YouthApplicationService.getYouthApplication - Error:', error);
            throw error;
        }
    }

    /**
     * Actualizar una postulación
     */
    static async updateYouthApplication(id: string, data: UpdateYouthApplicationRequest): Promise<YouthApplication> {
        try {
            console.log('👥 YouthApplicationService.updateYouthApplication - Updating application:', id, data);

            const formData = new FormData();

            if (data.title) formData.append('title', data.title);
            if (data.description) formData.append('description', data.description);
            if (data.status) formData.append('status', data.status);
            if (data.isPublic !== undefined) formData.append('isPublic', data.isPublic.toString());
            if (data.cvUrl) formData.append('cvUrl', data.cvUrl);
            if (data.coverLetterUrl) formData.append('coverLetterUrl', data.coverLetterUrl);
            if (data.cvFile) formData.append('cvFile', data.cvFile);
            if (data.coverLetterFile) formData.append('coverLetterFile', data.coverLetterFile);

            const response = await apiCall(`/youthapplication/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders(true), // excludeContentType = true para FormData
                body: formData
            });

            console.log('✅ YouthApplicationService.updateYouthApplication - Application updated:', response);
            return response;
        } catch (error) {
            console.error('❌ YouthApplicationService.updateYouthApplication - Error:', error);
            throw error;
        }
    }

    /**
     * Eliminar una postulación
     */
    static async deleteYouthApplication(id: string): Promise<void> {
        try {
            console.log('👥 YouthApplicationService.deleteYouthApplication - Deleting application:', id);

            await apiCall(`/youthapplication/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            console.log('✅ YouthApplicationService.deleteYouthApplication - Application deleted');
        } catch (error) {
            console.error('❌ YouthApplicationService.deleteYouthApplication - Error:', error);
            throw error;
        }
    }

    /**
     * Obtener mensajes de una postulación
     */
    static async getMessages(applicationId: string): Promise<YouthApplicationMessage[]> {
        try {
            console.log('👥 YouthApplicationService.getMessages - Getting messages for application:', applicationId);

            const response = await apiCall(`/youthapplication/${applicationId}/message`, {
                method: 'GET',
                headers: getAuthHeaders()
            });

            console.log('✅ YouthApplicationService.getMessages - Messages retrieved:', response);
            return response;
        } catch (error) {
            console.error('❌ YouthApplicationService.getMessages - Error:', error);
            throw error;
        }
    }

    /**
     * Enviar mensaje en una postulación
     */
    static async sendMessage(applicationId: string, data: SendMessageRequest): Promise<YouthApplicationMessage> {
        try {
            console.log('👥 YouthApplicationService.sendMessage - Sending message for application:', applicationId, data);

            // The API will determine senderType based on authenticated user's profile
            const response = await apiCall(`/youthapplication/${applicationId}/message`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ content: data.content })
            });

            console.log('✅ YouthApplicationService.sendMessage - Message sent:', response);
            return response;
        } catch (error) {
            console.error('❌ YouthApplicationService.sendMessage - Error:', error);
            throw error;
        }
    }

    /**
     * Obtener intereses de empresas en una postulación
     */
    static async getCompanyInterests(applicationId: string): Promise<CompanyInterest[]> {
        try {
            console.log('👥 YouthApplicationService.getCompanyInterests - Getting company interests for application:', applicationId);

            const response = await apiCall(`/youthapplication/${applicationId}/company-interest`, {
                method: 'GET',
                headers: getAuthHeaders()
            });

            console.log('✅ YouthApplicationService.getCompanyInterests - Company interests retrieved:', response);
            return response;
        } catch (error) {
            console.error('❌ YouthApplicationService.getCompanyInterests - Error:', error);
            throw error;
        }
    }

    /**
     * Expresar interés de empresa en una postulación
     */
    static async expressCompanyInterest(applicationId: string, data: ExpressInterestRequest): Promise<CompanyInterest> {
        try {
            console.log('👥 YouthApplicationService.expressCompanyInterest - Expressing interest for application:', applicationId, data);

            const response = await apiCall(`/youthapplication/${applicationId}/company-interest`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(data)
            });

            console.log('✅ YouthApplicationService.expressCompanyInterest - Interest expressed:', response);
            return response;
        } catch (error) {
            console.error('❌ YouthApplicationService.expressCompanyInterest - Error:', error);
            throw error;
        }
    }

    /**
     * Obtener mis postulaciones (para jóvenes)
     */
    static async getMyApplications(): Promise<YouthApplication[]> {
        try {
            console.log('👥 YouthApplicationService.getMyApplications - Getting my applications');

            // Use cookie-based authentication - the API endpoint will handle user identification
            const response = await apiCall('/youthapplication/my', {
                method: 'GET',
                headers: getAuthHeaders()
            });

            console.log('✅ YouthApplicationService.getMyApplications - My applications retrieved:', response);
            return response;
        } catch (error) {
            console.error('❌ YouthApplicationService.getMyApplications - Error:', error);
            throw error;
        }
    }

    /**
     * Obtener postulaciones públicas (para empresas)
     */
    static async getPublicApplications(): Promise<YouthApplication[]> {
        try {
            console.log('👥 YouthApplicationService.getPublicApplications - Getting public applications');

            const response = await apiCall('/youthapplication?isPublic=true', {
                method: 'GET',
                headers: getAuthHeaders()
            });

            console.log('✅ YouthApplicationService.getPublicApplications - Public applications retrieved:', response);
            return response;
        } catch (error) {
            console.error('❌ YouthApplicationService.getPublicApplications - Error:', error);
            throw error;
        }
    }
} 