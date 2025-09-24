# Courses Module - Technical Specification for YOUTH Users

## Metadata
- **Generated**: 2025-01-09
- **Target Platform**: React Native / Expo SDK 50+
- **User Role**: YOUTH (JOVENES) - Courses & Learning System
- **Priority**: HIGH
- **Status**: Production Ready

---

## Executive Summary

The Courses module provides a comprehensive learning management system for YOUTH users, featuring course discovery, enrollment, video-based learning, progress tracking, quiz completion, and certificate generation. This module is central to the YOUTH educational experience in the CEMSE platform.

### Key Features for YOUTH:
- **Course Discovery**: Browse and search through available courses
- **Smart Enrollment**: One-click enrollment in courses
- **Video Learning**: YouTube-based video lessons with progress tracking
- **Interactive Quizzes**: Module completion assessments
- **Progress Tracking**: Real-time progress monitoring across all enrolled courses
- **Resource Downloads**: Access to course materials and resources
- **Certificate Generation**: Automatic certificates upon course/module completion

---

## 1. MODULE OVERVIEW FOR YOUTH

### User Journey Flow:
```
Course Discovery → Course Details → Enrollment → Learning Interface → Progress Tracking → Completion → Certificates
```

### Course Categories Available:
- **SOFT_SKILLS**: Habilidades Blandas
- **BASIC_COMPETENCIES**: Competencias Básicas
- **JOB_PLACEMENT**: Inserción Laboral
- **ENTREPRENEURSHIP**: Emprendimiento
- **TECHNICAL_SKILLS**: Habilidades Técnicas
- **DIGITAL_LITERACY**: Alfabetización Digital
- **COMMUNICATION**: Comunicación
- **LEADERSHIP**: Liderazgo

### Course Levels:
- **BEGINNER**: Principiante (Green badge)
- **INTERMEDIATE**: Intermedio (Yellow badge)
- **ADVANCED**: Avanzado (Red badge)

---

## 2. TECHNICAL ARCHITECTURE

### Page Structure:
```
src/app/(dashboard)/
├── courses/
│   ├── page.tsx              # Main course discovery page
│   ├── [id]/
│   │   ├── page.tsx          # Course details page
│   │   └── learn/
│   │       └── page.tsx      # Learning interface
├── my-courses/
│   └── page.tsx              # YOUTH enrolled courses dashboard
└── development/
    └── courses/
        └── [enrollmentId]/
            ├── page.tsx      # Course enrollment details
            ├── enroll/
            │   └── page.tsx  # Enrollment confirmation
            └── learn/
                └── page.tsx  # Active learning session
```

### Component Architecture:
```
src/components/courses/
├── course-card.tsx           # Course display card (grid/list view)
├── course-detail.tsx         # Detailed course information
├── course-filters.tsx        # Search and filtering system
├── course-section.tsx        # Course content sections
├── enrollment-course-card.tsx # Enrolled course display
├── learning-progress.tsx     # Progress tracking component
├── lesson-player.tsx         # Video lesson player
├── lesson-notes.tsx          # Student notes functionality
├── quiz-component.tsx        # Interactive quiz system
├── quiz-completion-modal.tsx # Quiz result display
├── lesson-completion-modal.tsx # Lesson completion feedback
├── video-preview.tsx         # Course video preview
└── ResourcesModal.tsx        # Course resources download
```

---

## 3. YOUTH-SPECIFIC FEATURES & INTERACTIONS

### 3.1 Course Discovery (src/app/(dashboard)/courses/page.tsx)

**Features Available to YOUTH:**
- ✅ Browse all available courses
- ✅ Advanced search by title/description
- ✅ Filter by category (8 categories)
- ✅ Filter by level (3 levels)
- ✅ Switch between grid/list view modes
- ✅ View enrollment statistics dashboard
- ✅ Quick access to "My Courses"

**Statistics Dashboard:**
```typescript
interface CourseStats {
  total: number;        // Total available courses
  inProgress: number;   // Courses currently being taken
  completed: number;    // Completed courses
  certificates: number; // Earned certificates
}
```

**Search & Filter System:**
```typescript
interface CourseFilters {
  searchQuery: string;        // Text search
  categoryFilter: string;     // Course category
  levelFilter: string;        // Difficulty level
  viewMode: "grid" | "list"; // Display mode
}
```

### 3.2 Course Enrollment & Management

**Enrollment States:**
- **ENROLLED**: Just enrolled, not started
- **IN_PROGRESS**: Actively taking the course
- **COMPLETED**: All modules completed
- **DROPPED**: Discontinued course

**Enrollment Process:**
1. **Discovery**: User finds course in catalog
2. **Details**: Reviews course information, prerequisites
3. **Enrollment**: One-click enrollment (free courses)
4. **Confirmation**: Enrollment confirmation with start options
5. **Learning**: Access to learning interface

### 3.3 Learning Interface (learn/page.tsx)

**Core Learning Features:**
```typescript
interface LearningSession {
  enrollmentId: string;
  currentModule: Module;
  currentLesson: Lesson;
  progress: number;         // Overall course progress %
  moduleProgress: number;   // Current module progress %
  lessonProgress: number;   // Current lesson progress %
  timeSpent: number;        // Minutes spent
  lastAccessed: Date;
}
```

**Video Learning System:**
- **YouTube Integration**: Embedded YouTube players
- **Progress Tracking**: Automatic progress saves every 30 seconds
- **Resume Functionality**: Continue from last viewed position
- **Speed Controls**: Playback speed adjustment
- **Fullscreen Support**: Mobile-optimized video viewing

**Interactive Elements:**
- **Lesson Notes**: Student can take notes during lessons
- **Resource Downloads**: PDFs, documents, additional materials
- **Quiz Integration**: Module completion quizzes
- **Progress Indicators**: Visual progress bars throughout

---

## 4. API ENDPOINTS & DATA FLOW

### 4.1 Course Discovery APIs

**GET /api/courses/comprehensive**
```typescript
// Fetch all courses with comprehensive data
interface CourseResponse {
  courses: Course[];
  total: number;
  categories: string[];
  levels: string[];
}

interface Course {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  category: CourseCategory;
  level: CourseLevel;
  duration: number;        // Hours
  price: number;          // 0 for free courses
  rating: number;         // 1-5 stars
  studentCount: number;
  instructorName?: string;
  videoPreview?: string;  // YouTube URL
  thumbnailUrl?: string;
  isMandatory: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

**GET /api/courses/[courseId]/modules**
```typescript
// Get course modules and lessons structure
interface ModulesResponse {
  modules: CourseModule[];
}

interface CourseModule {
  id: string;
  title: string;
  description: string;
  order: number;
  duration: number;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  content: string;
  videoUrl?: string;      // YouTube URL
  duration: number;       // Minutes
  order: number;
  resources: LessonResource[];
  quiz?: Quiz;
}
```

### 4.2 Enrollment APIs

**GET /api/course-enrollments**
```typescript
// Get all user enrollments
interface EnrollmentsResponse {
  enrollments: CourseEnrollment[];
}

interface CourseEnrollment {
  id: string;
  userId: string;
  courseId: string;
  status: EnrollmentStatus;
  progress: number;        // 0-100
  enrolledAt: string;
  startedAt?: string;
  completedAt?: string;
  timeSpent: number;       // Minutes
  course: Course;
}
```

**POST /api/course-enrollments**
```typescript
// Enroll in a course
interface EnrollmentRequest {
  courseId: string;
}

interface EnrollmentResponse {
  enrollment: CourseEnrollment;
  success: boolean;
  message: string;
}
```

### 4.3 Learning Progress APIs

**GET /api/course-progress/enrollment/[enrollmentId]**
```typescript
// Get detailed progress for an enrollment
interface ProgressResponse {
  enrollment: CourseEnrollment;
  moduleProgress: ModuleProgress[];
  currentLesson?: Lesson;
  nextLesson?: Lesson;
  completionRate: number;
}

interface ModuleProgress {
  moduleId: string;
  progress: number;        // 0-100
  completedLessons: string[];
  currentLesson?: string;
  timeSpent: number;
  quizCompleted: boolean;
  quizScore?: number;
}
```

**POST /api/course-progress/update-video-progress**
```typescript
// Update video watching progress
interface VideoProgressRequest {
  enrollmentId: string;
  lessonId: string;
  currentTime: number;     // Seconds
  duration: number;        // Total video duration
  completed: boolean;
}

interface VideoProgressResponse {
  success: boolean;
  progress: number;        // Updated lesson progress %
  moduleProgress: number;  // Updated module progress %
  courseProgress: number;  // Updated course progress %
}
```

**POST /api/course-progress/complete-lesson**
```typescript
// Mark lesson as completed
interface LessonCompletionRequest {
  enrollmentId: string;
  lessonId: string;
  timeSpent: number;       // Minutes
  notes?: string;          // Optional student notes
}

interface LessonCompletionResponse {
  success: boolean;
  lessonCompleted: boolean;
  moduleCompleted: boolean;
  courseCompleted: boolean;
  certificatesGenerated: string[]; // Generated certificate IDs
}
```

---

## 5. STATE MANAGEMENT

### 5.1 Course Discovery State
```typescript
// Using React Query for server state
const { courses, loading, error } = useCourses(municipalityId);

// Local state for UI interactions
interface CourseDiscoveryState {
  searchQuery: string;
  categoryFilter: string;
  levelFilter: string;
  viewMode: "grid" | "list";
  selectedCourse?: Course;
}
```

### 5.2 Enrollment State
```typescript
const { 
  enrollments, 
  loading, 
  isEnrolledInCourse,
  enrollInCourse,
  getEnrollmentProgress 
} = useEnrollments();

// Check if user is enrolled in a specific course
const enrollment = isEnrolledInCourse(courseId);
const progress = enrollment ? enrollment.progress : 0;
```

### 5.3 Learning Session State
```typescript
interface LearningState {
  enrollmentId: string;
  currentModule: CourseModule;
  currentLesson: Lesson;
  videoProgress: number;     // 0-100
  lessonProgress: number;    // 0-100
  moduleProgress: number;    // 0-100
  courseProgress: number;    // 0-100
  timeSpent: number;         // Minutes in current session
  notes: string;             // Current lesson notes
  isVideoPlaying: boolean;
  currentVideoTime: number;  // Seconds
}
```

---

## 6. USER FLOWS & INTERACTIONS

### 6.1 Course Discovery Flow
```
1. User opens /courses
2. System loads available courses
3. User can:
   - Search by keyword
   - Filter by category/level
   - Switch view mode (grid/list)
   - Click on course card to view details
4. Course card shows:
   - Course thumbnail/video preview
   - Title, description, category, level
   - Duration, rating, student count
   - Enrollment status & progress (if enrolled)
   - Price (most are free for YOUTH)
```

### 6.2 Course Enrollment Flow
```
1. User clicks on course card → /courses/[id]
2. Course details page shows:
   - Complete course information
   - Module structure with lessons
   - Prerequisites and requirements
   - Reviews and ratings
3. User clicks "Enroll" button
4. System creates enrollment record
5. User redirected to learning interface or my-courses
```

### 6.3 Learning Session Flow
```
1. User accesses enrolled course → /development/courses/[enrollmentId]/learn
2. Learning interface loads:
   - Current module and lesson
   - Video player with YouTube integration
   - Progress indicators
   - Navigation between lessons
3. Video Progress Tracking:
   - Auto-save progress every 30 seconds
   - Mark lessons as completed when fully watched
   - Update module and course progress
4. Lesson Completion:
   - User finishes video lesson
   - Optional quiz appears (if configured)
   - Progress updated across all levels
   - Next lesson unlocked
```

### 6.4 Quiz Interaction Flow
```
1. User completes all lessons in a module
2. Module quiz becomes available
3. Quiz interface shows:
   - Multiple choice questions
   - Progress through quiz
   - Immediate feedback on answers
4. Quiz completion:
   - Score calculation
   - Pass/fail determination (usually 70%+ to pass)
   - Module marked as completed
   - Certificate generation (if final module)
```

---

## 7. DATA MODELS & TYPES

### 7.1 Core Course Types
```typescript
enum CourseCategory {
  SOFT_SKILLS = "SOFT_SKILLS",
  BASIC_COMPETENCIES = "BASIC_COMPETENCIES", 
  JOB_PLACEMENT = "JOB_PLACEMENT",
  ENTREPRENEURSHIP = "ENTREPRENEURSHIP",
  TECHNICAL_SKILLS = "TECHNICAL_SKILLS",
  DIGITAL_LITERACY = "DIGITAL_LITERACY",
  COMMUNICATION = "COMMUNICATION",
  LEADERSHIP = "LEADERSHIP"
}

enum CourseLevel {
  BEGINNER = "BEGINNER",
  INTERMEDIATE = "INTERMEDIATE", 
  ADVANCED = "ADVANCED"
}

enum EnrollmentStatus {
  ENROLLED = "ENROLLED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  DROPPED = "DROPPED"
}
```

### 7.2 Learning Progress Types
```typescript
interface LessonResource {
  id: string;
  title: string;
  type: "PDF" | "DOC" | "VIDEO" | "LINK";
  url: string;
  size?: number;        // File size in bytes
  downloadable: boolean;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  passingScore: number;    // Percentage required to pass
  timeLimit?: number;      // Minutes (null = unlimited)
}

interface QuizQuestion {
  id: string;
  question: string;
  type: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "ESSAY";
  options?: string[];      // For multiple choice
  correctAnswer: string;
  explanation?: string;    // Shown after answering
}
```

---

## 8. MOBILE MIGRATION GUIDE

### 8.1 Navigation Structure (React Native)
```typescript
// Stack Navigator for Courses
type CoursesStackParamList = {
  CourseDiscovery: undefined;
  CourseDetails: { courseId: string };
  MyCourses: undefined;
  LearningSession: { 
    enrollmentId: string;
    lessonId?: string;
  };
  QuizSession: {
    enrollmentId: string;
    moduleId: string;
    quizId: string;
  };
};

const CoursesStack = createStackNavigator<CoursesStackParamList>();
```

### 8.2 Key Mobile Components

**CourseDiscoveryScreen.tsx**
```typescript
export const CourseDiscoveryScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<CourseFilters>({});
  const { courses, loading } = useCourses();
  
  return (
    <SafeAreaView style={styles.container}>
      <SearchBar 
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Buscar cursos..."
      />
      
      <FilterSection
        categories={courseCategories}
        levels={courseLevels}
        onFiltersChange={setFilters}
      />
      
      <FlatList
        data={filteredCourses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CourseCard 
            course={item}
            onPress={() => navigation.navigate('CourseDetails', { 
              courseId: item.id 
            })}
          />
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};
```

**VideoLessonPlayer.tsx**
```typescript
import { WebView } from 'react-native-webview';

export const VideoLessonPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  onProgress,
  onComplete
}) => {
  // Convert YouTube URL to embed format
  const embedUrl = convertToYouTubeEmbed(videoUrl);
  
  return (
    <View style={styles.videoContainer}>
      <WebView
        source={{ uri: embedUrl }}
        style={styles.webView}
        allowsFullscreenVideo
        mediaPlaybackRequiresUserAction={false}
        onMessage={(event) => {
          const data = JSON.parse(event.nativeEvent.data);
          if (data.type === 'progress') {
            onProgress(data.currentTime, data.duration);
          }
          if (data.type === 'ended') {
            onComplete();
          }
        }}
        injectedJavaScript={youtubeProgressTrackingScript}
      />
      
      <ProgressBar 
        progress={lessonProgress}
        style={styles.progressBar}
      />
    </View>
  );
};
```

### 8.3 Required React Native Dependencies

```json
{
  "dependencies": {
    "@react-navigation/native": "^6.1.9",
    "@react-navigation/stack": "^6.3.20",
    "@tanstack/react-query": "^4.36.1",
    "react-native-webview": "^13.6.4",
    "react-native-video": "^5.2.1",
    "react-native-paper": "^5.11.6",
    "react-native-vector-icons": "^10.0.3",
    "@react-native-async-storage/async-storage": "^1.21.0",
    "react-native-document-picker": "^9.1.1",
    "react-native-share": "^10.0.2",
    "react-native-progress": "^5.0.1"
  }
}
```

### 8.4 Offline Support Implementation

```typescript
// Offline course data storage
class CourseOfflineManager {
  static async saveCourseData(course: Course): Promise<void> {
    await AsyncStorage.setItem(
      `course_${course.id}`, 
      JSON.stringify(course)
    );
  }
  
  static async getCachedCourse(courseId: string): Promise<Course | null> {
    const cached = await AsyncStorage.getItem(`course_${courseId}`);
    return cached ? JSON.parse(cached) : null;
  }
  
  static async saveProgressOffline(progress: LearningProgress): Promise<void> {
    const pending = await this.getPendingProgress();
    pending.push(progress);
    await AsyncStorage.setItem('pending_progress', JSON.stringify(pending));
  }
  
  static async syncPendingProgress(): Promise<void> {
    const pending = await this.getPendingProgress();
    for (const progress of pending) {
      try {
        await CourseAPI.updateProgress(progress);
      } catch (error) {
        console.error('Failed to sync progress:', error);
      }
    }
    await AsyncStorage.removeItem('pending_progress');
  }
}
```

---

## 9. PERFORMANCE OPTIMIZATIONS

### 9.1 Mobile-Specific Optimizations

**Image Loading & Caching:**
```typescript
import FastImage from 'react-native-fast-image';

// Optimized course thumbnail loading
<FastImage
  source={{
    uri: courseThumbnail,
    priority: FastImage.priority.normal,
  }}
  style={styles.thumbnail}
  resizeMode={FastImage.resizeMode.cover}
/>
```

**List Virtualization:**
```typescript
// For large course lists
<FlatList
  data={courses}
  keyExtractor={(item) => item.id}
  renderItem={renderCourseCard}
  getItemLayout={getItemLayout}
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={10}
  initialNumToRender={5}
/>
```

**Video Progress Debouncing:**
```typescript
// Debounce progress updates to reduce API calls
const debouncedProgressUpdate = useCallback(
  debounce((progress: VideoProgress) => {
    updateVideoProgress(progress);
  }, 5000), // Save every 5 seconds
  []
);
```

---

## 10. TESTING CHECKLIST

### 10.1 Course Discovery Tests
- [ ] **Course Loading**: All courses load correctly
- [ ] **Search Functionality**: Text search works across titles/descriptions  
- [ ] **Category Filtering**: All 8 categories filter correctly
- [ ] **Level Filtering**: 3 difficulty levels filter correctly
- [ ] **View Mode Toggle**: Grid/list view switching works
- [ ] **Statistics Display**: Enrollment stats are accurate
- [ ] **Navigation**: Course cards navigate to correct details

### 10.2 Enrollment Tests
- [ ] **Free Enrollment**: One-click enrollment for free courses
- [ ] **Enrollment Confirmation**: Success message and navigation
- [ ] **Duplicate Prevention**: Cannot enroll twice in same course
- [ ] **Status Updates**: Enrollment status reflects correctly
- [ ] **My Courses Integration**: New enrollments appear immediately

### 10.3 Learning Interface Tests
- [ ] **Video Playback**: YouTube videos play correctly
- [ ] **Progress Tracking**: Video progress saves automatically
- [ ] **Lesson Navigation**: Can move between lessons
- [ ] **Resume Functionality**: Resumes from last position
- [ ] **Mobile Controls**: Touch controls work on mobile
- [ ] **Offline Handling**: Graceful degradation when offline

### 10.4 Quiz System Tests  
- [ ] **Quiz Loading**: Questions display correctly
- [ ] **Answer Selection**: Can select answers
- [ ] **Score Calculation**: Scoring logic is accurate
- [ ] **Pass/Fail Logic**: 70%+ threshold works
- [ ] **Progress Update**: Module completion updates correctly
- [ ] **Certificate Trigger**: Certificates generate on completion

### 10.5 Progress Tracking Tests
- [ ] **Real-time Updates**: Progress updates immediately
- [ ] **Cross-device Sync**: Progress syncs across devices
- [ ] **Accuracy**: Progress percentages are mathematically correct
- [ ] **Persistence**: Progress survives app restarts
- [ ] **Offline Queue**: Offline progress syncs when online

---

## 11. SECURITY CONSIDERATIONS

### 11.1 Video Content Protection
- **YouTube Integration**: Videos hosted on YouTube (no local storage)
- **Progress Validation**: Server-side validation of progress claims
- **Rate Limiting**: Prevent rapid-fire progress updates

### 11.2 Quiz Integrity
- **Server-side Scoring**: Quiz answers validated on server
- **Attempt Limiting**: Limited attempts per quiz (configurable)
- **Time Validation**: Quiz completion times validated

### 11.3 Certificate Security
- **Digital Signatures**: All certificates digitally signed
- **Verification Codes**: Unique verification codes for each certificate
- **Audit Trail**: Complete audit trail of course completion

---

## 12. CONCLUSION

The Courses module provides a robust, scalable learning management system specifically optimized for YOUTH users. The architecture supports:

- **Scalable Video Learning**: YouTube integration with progress tracking
- **Mobile-First Design**: Optimized for mobile learning experiences
- **Offline Capability**: Essential features work offline with sync
- **Progress Gamification**: Visual progress tracking and achievements
- **Certificate Generation**: Automatic recognition of learning achievements

**Mobile Development Priority**: HIGH - Core educational feature
**Estimated Development Time**: 6-8 weeks
**Technical Complexity**: MODERATE - YouTube integration and progress tracking

The module is production-ready and serves as the foundation for the YOUTH educational experience in the CEMSE platform.

---

**Document Status**: ✅ Complete Technical Specification
**Ready for Mobile Development**: 🚀 All APIs and user flows documented
**Next Steps**: Begin React Native implementation focusing on video learning interface