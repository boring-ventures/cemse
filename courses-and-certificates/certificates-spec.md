# Certificates Module - Technical Specification for YOUTH Users

## Metadata
- **Generated**: 2025-01-09
- **Target Platform**: React Native / Expo SDK 50+
- **User Role**: YOUTH (JOVENES) - Certificate Management System
- **Priority**: MEDIUM-HIGH
- **Status**: Production Ready

---

## Executive Summary

The Certificates module provides a comprehensive certificate management system for YOUTH users, featuring automatic certificate generation upon course/module completion, certificate verification, PDF downloads, sharing capabilities, and a complete portfolio view of educational achievements.

### Key Features for YOUTH:
- **Automatic Generation**: Certificates auto-generated upon module/course completion
- **Dual Certificate Types**: Module certificates and course completion certificates
- **PDF Download**: High-quality PDF certificate downloads
- **Certificate Verification**: Unique verification codes for authenticity
- **Portfolio Dashboard**: Visual overview of all earned certificates
- **Share Functionality**: Social sharing and professional portfolio integration
- **Verification System**: Public certificate verification for employers

---

## 1. MODULE OVERVIEW FOR YOUTH

### Certificate Types:
1. **Module Certificates**: Generated when completing individual course modules
2. **Course Certificates**: Generated when completing entire courses (all modules)

### User Journey Flow:
```
Course/Module Completion → Auto Certificate Generation → Certificate Dashboard → View/Download/Share → Verification
```

### Certificate Portfolio Features:
- **Visual Dashboard**: Grid view of all earned certificates
- **Achievement Statistics**: Total certificates, completion rates
- **Course Progress Integration**: Shows ongoing courses vs completed
- **Verification Status**: Valid/invalid certificate tracking
- **Export Options**: PDF download and sharing capabilities

---

## 2. TECHNICAL ARCHITECTURE

### Page Structure:
```
src/app/(dashboard)/certificates/
└── page.tsx                    # Main certificates dashboard

src/components/certificates/
├── CertificateCard.tsx         # Individual certificate display
├── CourseCertificatePDF.tsx    # Course certificate PDF template
└── ModuleCertificatePDF.tsx    # Module certificate PDF template
```

### API Structure:
```
src/app/api/
├── certificates/
│   ├── route.ts                # List all certificates
│   └── generate-missing/
│       └── route.ts            # Generate missing certificates
├── certificate/
│   ├── [id]/
│   │   └── route.ts            # Get specific certificate
│   ├── route.ts                # Certificate operations
│   └── verify/
│       └── [code]/
│           └── route.ts        # Certificate verification
```

### Hook Structure:
```
src/hooks/
├── useCertificates.ts          # Main certificates management
├── useCertificateApi.ts        # API operations
└── useModuleCertificateApi.ts  # Module-specific certificates
```

---

## 3. YOUTH-SPECIFIC FEATURES & INTERACTIONS

### 3.1 Certificate Dashboard (src/app/(dashboard)/certificates/page.tsx)

**Dashboard Features:**
- **Achievement Header**: Total certificates earned with visual icon
- **Course Progress Summary**: Integration with enrolled courses
- **Tabbed Interface**: Separate tabs for Module and Course certificates
- **Smart Empty States**: Contextual guidance based on enrollment status
- **Action Buttons**: Download, preview, and verification options

**Statistics Integration:**
```typescript
interface CertificateStats {
  totalCertificates: number;        // Module + Course certificates
  enrolledCourses: number;          // Currently enrolled courses
  completedCourses: number;         // Finished courses
  inProgressCourses: number;        // Active enrollments
  modulesCertificates: number;      // Individual module certificates
  courseCertificates: number;       // Full course certificates
}
```

### 3.2 Certificate Types & Structure

**Module Certificates:**
```typescript
interface ModuleCertificate {
  id: string;
  moduleId: string;
  studentId: string;
  certificateUrl: string;
  issuedAt: string;
  grade: number;                    // 0-100 score
  completedAt: string;
  module: {
    id: string;
    title: string;
    course: {
      id: string;
      title: string;
    };
  };
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}
```

**Course Certificates:**
```typescript
interface CourseCertificate {
  id: string;
  userId: string;
  courseId: string;
  template: string;                 // Certificate design template
  issuedAt: string;
  verificationCode: string;         // Unique verification code
  digitalSignature: string;         // Security signature
  isValid: boolean;                 // Validity status
  url: string;                      // PDF download URL
  course: {
    id: string;
    title: string;
    description?: string;
  };
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
  };
}
```

### 3.3 Certificate Generation System

**Automatic Generation Triggers:**
1. **Module Completion**: When user completes all lessons in a module and passes quiz
2. **Course Completion**: When user completes all modules in a course
3. **Manual Generation**: For missing certificates from completed courses

**Generation Process:**
```typescript
// Triggered by course progress API
POST /api/course-progress/complete-lesson
// If lesson completion triggers module/course completion:
// → Automatic certificate generation
// → PDF creation with user details
// → Storage in file system
// → Database record creation
// → Email notification (optional)
```

---

## 4. API ENDPOINTS & DATA FLOW

### 4.1 Certificate Listing APIs

**GET /api/certificates**
```typescript
// Get all user certificates
interface CertificatesResponse {
  moduleCertificates: ModuleCertificate[];
  courseCertificates: CourseCertificate[];
  stats: {
    total: number;
    modules: number;
    courses: number;
  };
}
```

**GET /api/certificate/[id]**
```typescript
// Get specific certificate details
interface CertificateDetailResponse {
  certificate: ModuleCertificate | CourseCertificate;
  downloadUrl: string;
  verificationUrl: string;
}
```

### 4.2 Certificate Generation APIs

**POST /api/certificates/generate-missing**
```typescript
// Generate certificates for completed but uncertified courses
interface GenerateMissingRequest {
  userId?: string;  // Optional - defaults to current user
}

interface GenerateMissingResponse {
  generated: number;
  certificates: CourseCertificate[];
  errors: string[];
}
```

### 4.3 Certificate Verification API

**GET /api/certificate/verify/[verificationCode]**
```typescript
// Public certificate verification
interface VerificationResponse {
  valid: boolean;
  certificate?: {
    id: string;
    recipientName: string;
    courseName: string;
    issuedDate: string;
    issuer: string;
  };
  error?: string;
}
```

### 4.4 Certificate Operations

**Certificate Download Process:**
```typescript
// Frontend download flow
const handleDownload = async (certificate: Certificate) => {
  try {
    // 1. Get download URL
    const downloadUrl = certificate.url || certificate.certificateUrl;
    
    // 2. For mobile: Use react-native-share
    await Share.open({
      url: downloadUrl,
      type: 'application/pdf',
      filename: `Certificate_${certificate.id}.pdf`
    });
    
    // 3. For web: Direct download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `Certificate_${certificate.id}.pdf`;
    link.click();
  } catch (error) {
    console.error('Download failed:', error);
  }
};
```

---

## 5. STATE MANAGEMENT

### 5.1 Certificates Hook Implementation
```typescript
// src/hooks/useCertificates.ts
export const useCertificates = () => {
  const [moduleCertificates, setModuleCertificates] = useState<ModuleCertificate[]>([]);
  const [courseCertificates, setCourseCertificates] = useState<CourseCertificate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  const loadModuleCertificates = async (): Promise<ModuleCertificate[]> => {
    try {
      setLoading(true);
      const response = await fetch('/api/certificates');
      const data = await response.json();
      setModuleCertificates(data.moduleCertificates);
      return data.moduleCertificates;
    } catch (error) {
      setError('Error loading module certificates');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const downloadCertificate = async (certificate: Certificate): Promise<boolean> => {
    try {
      setDownloading(certificate.id);
      
      // Mobile download using react-native-share
      const result = await Share.open({
        url: certificate.url,
        type: 'application/pdf',
        filename: `Certificate_${certificate.id}.pdf`
      });
      
      return result;
    } catch (error) {
      console.error('Download error:', error);
      return false;
    } finally {
      setDownloading(null);
    }
  };

  const generateMissingCertificates = async (): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await fetch('/api/certificates/generate-missing', {
        method: 'POST',
      });
      
      if (response.ok) {
        // Reload certificates after generation
        await loadModuleCertificates();
        await loadCourseCertificates();
        return true;
      }
      return false;
    } catch (error) {
      setError('Error generating certificates');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    moduleCertificates,
    courseCertificates,
    loading,
    error,
    downloading,
    loadModuleCertificates,
    loadCourseCertificates,
    downloadCertificate,
    previewCertificate,
    generateMissingCertificates,
    setError
  };
};
```

---

## 6. USER FLOWS & INTERACTIONS

### 6.1 Certificate Dashboard Flow
```
1. User navigates to /certificates
2. System loads all user certificates
3. Dashboard shows:
   - Achievement header with total count
   - Course progress summary (if enrolled in courses)
   - Tabbed interface: Modules | Courses
4. User can:
   - View certificate details
   - Download PDF certificates
   - Preview certificates in new tab
   - Generate missing certificates
   - Navigate to courses to earn more
```

### 6.2 Certificate Generation Flow
```
1. User completes course module/lesson
2. Course progress API triggers completion check
3. If module/course completed:
   - Certificate generation API called
   - PDF created with user details and course info
   - Certificate record saved to database
   - File uploaded to storage system
4. Certificate appears in user dashboard
5. Optional: Email notification sent
```

### 6.3 Certificate Verification Flow
```
1. External party (employer) gets verification code
2. Visits public verification URL: /verify/[code]
3. System validates code against database
4. Returns certificate details:
   - Recipient name
   - Course/module name
   - Issue date
   - Validity status
   - Issuing institution
```

### 6.4 Smart Empty States
```typescript
// Different empty states based on user context
const getEmptyStateContent = (userContext: UserContext) => {
  if (userContext.completedCourses > 0) {
    return {
      title: "Certificados no generados",
      description: "Parece que completaste cursos pero no se generaron certificados",
      action: "Generar Certificados",
      actionType: "generate"
    };
  } else if (userContext.enrolledCourses > 0) {
    return {
      title: "Completa tus cursos",
      description: "Tienes cursos en progreso. Completa todos los módulos para obtener certificados",
      action: "Ver Mis Cursos",
      actionType: "navigate"
    };
  } else {
    return {
      title: "Comienza tu educación",
      description: "Inscríbete en cursos para comenzar a obtener certificados",
      action: "Explorar Cursos", 
      actionType: "navigate"
    };
  }
};
```

---

## 7. MOBILE MIGRATION GUIDE

### 7.1 React Native Navigation
```typescript
type CertificatesStackParamList = {
  CertificatesDashboard: undefined;
  CertificateDetail: { 
    certificateId: string;
    type: 'module' | 'course';
  };
  CertificatePreview: {
    certificateUrl: string;
  };
  CertificateVerification: {
    verificationCode: string;
  };
};
```

### 7.2 Mobile Certificate Dashboard
```typescript
import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  Share,
  Alert
} from 'react-native';

export const CertificatesDashboardScreen: React.FC = () => {
  const {
    moduleCertificates,
    courseCertificates,
    loading,
    error,
    loadCertificates,
    downloadCertificate
  } = useCertificates();

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadCertificates();
    } finally {
      setRefreshing(false);
    }
  };

  const handleDownload = async (certificate: Certificate) => {
    try {
      await downloadCertificate(certificate);
    } catch (error) {
      Alert.alert('Error', 'No se pudo descargar el certificado');
    }
  };

  const handleShare = async (certificate: Certificate) => {
    try {
      await Share.share({
        message: `¡He completado el curso ${certificate.course.title}! Verifica mi certificado en: ${getVerificationUrl(certificate.verificationCode)}`,
        url: certificate.url
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      }
    >
      <AchievementHeader 
        totalCertificates={moduleCertificates.length + courseCertificates.length}
      />
      
      <CourseProgressSummary />
      
      <TabView
        navigationState={{ index: 0, routes: certificateTabs }}
        renderScene={renderCertificateScene}
        renderTabBar={renderTabBar}
      />
    </ScrollView>
  );
};
```

### 7.3 Certificate Card Component (Mobile)
```typescript
export const CertificateCard: React.FC<CertificateCardProps> = ({
  certificate,
  type,
  onDownload,
  onShare,
  onPreview
}) => {
  const getGradeColor = (grade: number) => {
    if (grade >= 90) return '#10B981'; // Green
    if (grade >= 80) return '#3B82F6'; // Blue
    if (grade >= 70) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  return (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <MaterialIcons
            name={type === 'module' ? 'assignment' : 'school'}
            size={24}
            color="#FFFFFF"
          />
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.title} numberOfLines={2}>
            {certificate.module?.title || certificate.course.title}
          </Text>
          {certificate.module && (
            <Text style={styles.subtitle}>
              {certificate.module.course.title}
            </Text>
          )}
        </View>
        {type === 'module' && (
          <Badge
            value={`${certificate.grade}%`}
            badgeStyle={{
              backgroundColor: getGradeColor(certificate.grade)
            }}
          />
        )}
      </View>

      <View style={styles.cardContent}>
        <View style={styles.dateInfo}>
          <MaterialIcons name="event" size={16} color="#6B7280" />
          <Text style={styles.dateText}>
            Emitido: {formatDate(certificate.issuedAt)}
          </Text>
        </View>

        {type === 'course' && (
          <View style={styles.verificationInfo}>
            <MaterialIcons name="verified" size={16} color="#6B7280" />
            <Text style={styles.verificationText}>
              Código: {certificate.verificationCode}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.primaryAction]}
          onPress={() => onDownload(certificate)}
        >
          <MaterialIcons name="download" size={16} color="#FFFFFF" />
          <Text style={styles.primaryActionText}>Descargar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryAction]}
          onPress={() => onPreview(certificate)}
        >
          <MaterialIcons name="visibility" size={16} color="#3B82F6" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryAction]}
          onPress={() => onShare(certificate)}
        >
          <MaterialIcons name="share" size={16} color="#3B82F6" />
        </TouchableOpacity>
      </View>
    </Card>
  );
};
```

### 7.4 Required Mobile Dependencies
```json
{
  "dependencies": {
    "react-native-share": "^10.0.2",
    "react-native-pdf": "^6.7.3",
    "react-native-webview": "^13.6.4",
    "@react-native-async-storage/async-storage": "^1.21.0",
    "react-native-vector-icons": "^10.0.3",
    "react-native-elements": "^3.4.3",
    "react-native-tab-view": "^3.5.2"
  }
}
```

---

## 8. OFFLINE CAPABILITIES

### 8.1 Certificate Caching Strategy
```typescript
class CertificateOfflineManager {
  static async cacheCertificates(certificates: Certificate[]): Promise<void> {
    await AsyncStorage.setItem(
      'cached_certificates',
      JSON.stringify({
        certificates,
        timestamp: Date.now()
      })
    );
  }

  static async getCachedCertificates(): Promise<Certificate[]> {
    try {
      const cached = await AsyncStorage.getItem('cached_certificates');
      if (cached) {
        const { certificates, timestamp } = JSON.parse(cached);
        // Return cached certificates if less than 24 hours old
        if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
          return certificates;
        }
      }
    } catch (error) {
      console.error('Error loading cached certificates:', error);
    }
    return [];
  }

  static async downloadCertificateForOffline(certificate: Certificate): Promise<string> {
    try {
      // Download PDF and store locally
      const localPath = `${RNFS.DocumentDirectoryPath}/certificate_${certificate.id}.pdf`;
      await RNFS.downloadFile({
        fromUrl: certificate.url,
        toFile: localPath
      }).promise;
      
      // Store local path reference
      await AsyncStorage.setItem(
        `cert_local_${certificate.id}`,
        localPath
      );
      
      return localPath;
    } catch (error) {
      throw new Error('Failed to download certificate for offline use');
    }
  }
}
```

---

## 9. CERTIFICATE TEMPLATES & PDF GENERATION

### 9.1 Certificate Templates
The system includes two main PDF templates:

**Module Certificate Template:**
- Student name and details
- Module title and course context
- Completion date and grade
- Institution branding
- Verification QR code

**Course Certificate Template:**
- Student name and details
- Complete course title
- Course duration and level
- Institution seal and signatures
- Verification code and QR code

### 9.2 PDF Generation Process
```typescript
// Server-side PDF generation (Node.js)
import PDFDocument from 'pdfkit';

class CertificateGenerator {
  static async generateModuleCertificate(data: ModuleCertificateData): Promise<Buffer> {
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape' });
    
    // Add institution logo
    doc.image('logo.png', 50, 30, { width: 100 });
    
    // Certificate title
    doc.fontSize(28).text('CERTIFICADO DE MÓDULO', 0, 100, { align: 'center' });
    
    // Student information
    doc.fontSize(16).text(`Se certifica que ${data.student.firstName} ${data.student.lastName}`, 0, 200, { align: 'center' });
    doc.text(`ha completado exitosamente el módulo`, 0, 230, { align: 'center' });
    doc.fontSize(20).text(data.module.title, 0, 260, { align: 'center' });
    doc.fontSize(16).text(`del curso ${data.module.course.title}`, 0, 290, { align: 'center' });
    
    // Grade and date
    doc.text(`con una calificación de ${data.grade}%`, 0, 340, { align: 'center' });
    doc.text(`Emitido el ${formatDate(data.issuedAt)}`, 0, 370, { align: 'center' });
    
    // Verification QR code
    doc.text(`Código de verificación: ${data.verificationCode}`, 0, 450, { align: 'center' });
    
    return doc;
  }
}
```

---

## 10. SECURITY & VERIFICATION

### 10.1 Certificate Security Features
- **Digital Signatures**: Each certificate includes a cryptographic signature
- **Verification Codes**: Unique alphanumeric codes for public verification
- **QR Codes**: Machine-readable verification links
- **Tamper Detection**: PDF modification detection
- **Expiration Dates**: Optional expiration for time-sensitive certifications

### 10.2 Verification System
```typescript
// Public certificate verification
export const verifyCertificate = async (verificationCode: string): Promise<VerificationResult> => {
  try {
    const response = await fetch(`/api/certificate/verify/${verificationCode}`);
    const result = await response.json();
    
    if (result.valid) {
      return {
        valid: true,
        certificate: {
          recipientName: result.certificate.recipientName,
          courseName: result.certificate.courseName,
          issuedDate: result.certificate.issuedDate,
          institution: 'CEMSE - Centro de Educación y Capacitación',
          verificationDate: new Date().toISOString()
        }
      };
    } else {
      return {
        valid: false,
        error: 'Certificate not found or invalid'
      };
    }
  } catch (error) {
    return {
      valid: false,
      error: 'Verification service unavailable'
    };
  }
};
```

---

## 11. TESTING CHECKLIST

### 11.1 Certificate Generation Tests
- [ ] **Module Completion**: Certificates generated on module completion
- [ ] **Course Completion**: Certificates generated on course completion  
- [ ] **Grade Calculation**: Module grades calculated correctly
- [ ] **PDF Quality**: Generated PDFs are high quality and readable
- [ ] **Verification Codes**: Unique codes generated for each certificate
- [ ] **Auto-generation**: Missing certificates can be generated retroactively

### 11.2 Dashboard Functionality Tests
- [ ] **Certificate Loading**: All certificates load correctly
- [ ] **Tab Navigation**: Module/Course tabs work properly
- [ ] **Empty States**: Appropriate empty states for different scenarios
- [ ] **Statistics Display**: Certificate counts and stats are accurate
- [ ] **Course Integration**: Progress integration with enrolled courses

### 11.3 Download & Sharing Tests
- [ ] **PDF Download**: Certificates download as PDFs successfully
- [ ] **Mobile Sharing**: Share functionality works on mobile
- [ ] **File Quality**: Downloaded PDFs maintain quality
- [ ] **Offline Access**: Downloaded certificates accessible offline
- [ ] **Multiple Downloads**: Can download same certificate multiple times

### 11.4 Verification Tests
- [ ] **Valid Codes**: Valid verification codes return correct information
- [ ] **Invalid Codes**: Invalid codes return appropriate errors
- [ ] **Public Access**: Verification works without authentication
- [ ] **QR Codes**: QR codes link to correct verification URLs
- [ ] **Security**: Verification doesn't expose sensitive information

---

## 12. PERFORMANCE CONSIDERATIONS

### 12.1 Mobile Optimization
- **Image Caching**: Certificate thumbnails cached for offline viewing
- **Lazy Loading**: Certificate cards lazy loaded in large lists
- **PDF Optimization**: Compressed PDFs for faster downloads
- **Background Downloads**: Certificate downloads don't block UI

### 12.2 API Optimization
- **Batch Loading**: Load all certificate types in single request
- **Caching**: Aggressive caching of certificate data
- **CDN Delivery**: PDF files served through CDN
- **Compression**: API responses compressed

---

## 13. CONCLUSION

The Certificates module provides a comprehensive digital credentialing system that:

- **Validates Learning**: Automatically recognizes course and module completion
- **Provides Proof**: Generates verifiable digital certificates
- **Enhances Portfolios**: Gives YOUTH users professional credentials
- **Ensures Security**: Implements robust verification and anti-fraud measures
- **Mobile-Optimized**: Designed for mobile-first certificate management

**Mobile Development Priority**: MEDIUM-HIGH - Important for user engagement and credibility
**Estimated Development Time**: 3-4 weeks
**Technical Complexity**: MODERATE - PDF generation and verification system

The module integrates seamlessly with the Courses module and provides essential credentialing functionality for the CEMSE educational platform.

---

**Document Status**: ✅ Complete Technical Specification
**Ready for Mobile Development**: 🚀 All APIs and user flows documented
**Next Steps**: Implement mobile certificate dashboard with PDF download capabilities