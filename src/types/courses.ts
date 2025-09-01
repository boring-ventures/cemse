// Course and Learning Management System Types

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  thumbnail: string;
  videoPreview?: string;
  instructor: Instructor;
  institution: string;
  category: CourseCategory;
  level: CourseLevel;
  duration: number; // in hours
  totalLessons: number;
  rating: number;
  studentCount: number;
  isMandatory: boolean;
  isActive: boolean;
  objectives: string[];
  prerequisites: string[];
  includedMaterials: string[];
  certification: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  sections: CourseSection[];
  totalQuizzes: number;
  totalResources: number;
  progress?: number;
  enrolledAt?: Date;
  completedAt?: Date;
  certificate?: {
    id: string;
    url: string;
    issuedAt: Date;
  };
}

export interface Instructor {
  id: string;
  name: string;
  title: string;
  avatar: string;
  bio: string;
  rating: number;
  totalStudents: number;
  totalCourses: number;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  duration: number; // in minutes
  lessons: Lesson[];
  isLocked: boolean;
  prerequisites?: string[]; // module IDs
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  type: LessonType;
  content: LessonContent;
  duration: number; // in minutes
  order: number;
  isPreview: boolean;
  attachments?: Attachment[];
  quiz?: Quiz;
}

export interface LessonContent {
  video?: {
    url: string;
    duration: number;
    subtitles?: Subtitle[];
    thumbnails?: string[];
  };
  text?: string; // markdown content
  images?: string[];
  documents?: Attachment[];
  externalLinks?: ExternalLink[];
  exercises?: Exercise[];
}

export interface Subtitle {
  language: string;
  url: string;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
}

export interface ExternalLink {
  title: string;
  url: string;
  description?: string;
}

export interface Exercise {
  id: string;
  title: string;
  description: string;
  instructions: string[];
  solution?: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  timeLimit?: number;
  passingScore: number;
  showCorrectAnswers: boolean;
}

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  points: number;
  order: number;
}

export interface QuizAnswer {
  questionId: string;
  answer: string | string[];
  isCorrect: boolean;
  timeSpent: number;
  correctAnswer?: string;
  explanation?: string;
}

export interface QuizAttempt {
  id: string;
  enrollmentId?: string;
  quizId: string;
  studentId: string;
  startedAt: Date;
  completedAt?: Date;
  score?: number;
  passed?: boolean;
  timeSpent: number; // in minutes
  answers?: QuizAnswer[];
}

export interface CourseSection {
  id: string;
  title: string;
  description: string;
  order: number;
  videoUrl?: string;
  videoDuration?: string;
  content?: string;
  resources: CourseResource[];
  quiz?: Quiz;
}

export interface CourseResource {
  id: string;
  title: string;
  description?: string;
  type: ResourceType;
  url: string;
  fileSize?: string;
  duration?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: Date;
  completedAt?: Date;
  lastAccessedAt: Date;
  status: EnrollmentStatus;
  progress: CourseProgress;
}

export interface CourseProgress {
  userId: string;
  courseId: string;
  completedLessons: string[];
  completedModules: string[];
  currentLesson?: string;
  currentModule?: string;
  totalProgress: number;
  timeSpent: number;
  quizScores: {
    quizId: string;
    score: number;
    attempts: number;
    passed: boolean;
    lastAttemptAt: Date;
  }[];
  certificates: string[];
  completedSections?: string[];
  quizAttempts?: {
    quizId: string;
    attempts: number;
    bestScore: number;
    passed: boolean;
    lastAttemptAt: Date;
  }[];
  downloadedResources?: string[];
  isCompleted?: boolean;
  completedAt?: Date;
}

export interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  template: string;
  issuedAt: Date;
  verificationCode: string;
  digitalSignature: string;
  isValid: boolean;
}

export interface StudentNote {
  id: string;
  userId: string;
  lessonId: string;
  content: string;
  timestamp?: number; // for video notes
  createdAt: Date;
  updatedAt: Date;
}

export interface Discussion {
  id: string;
  lessonId: string;
  userId: string;
  content: string;
  parentId?: string; // for replies
  likes: number;
  createdAt: Date;
  updatedAt: Date;
  replies: Discussion[];
}

// Enums
export enum CourseCategory {
  SOFT_SKILLS = "SOFT_SKILLS",
  BASIC_COMPETENCIES = "BASIC_COMPETENCIES",
  JOB_PLACEMENT = "JOB_PLACEMENT",
  ENTREPRENEURSHIP = "ENTREPRENEURSHIP",
  TECHNICAL_SKILLS = "TECHNICAL_SKILLS",
  DIGITAL_LITERACY = "DIGITAL_LITERACY",
  COMMUNICATION = "COMMUNICATION",
  LEADERSHIP = "LEADERSHIP",
}

export enum CourseLevel {
  BEGINNER = "BEGINNER",
  INTERMEDIATE = "INTERMEDIATE",
  ADVANCED = "ADVANCED",
}

export enum LessonType {
  VIDEO = "video",
  TEXT = "text",
  QUIZ = "quiz",
  EXERCISE = "exercise",
  DOCUMENT = "document",
  INTERACTIVE = "interactive",
}

export enum QuestionType {
  MULTIPLE_CHOICE = "multiple_choice",
  TRUE_FALSE = "true_false",
  FILL_BLANK = "fill_blank",
  SORT_ELEMENTS = "sort_elements",
  MULTIPLE_SELECT = "multiple_select",
  SHORT_ANSWER = "short_answer",
}

export enum EnrollmentStatus {
  ENROLLED = "enrolled",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  DROPPED = "dropped",
  SUSPENDED = "suspended",
}

export enum ResourceType {
  PDF = "PDF",
  VIDEO = "VIDEO",
  LINK = "LINK",
  IMAGE = "IMAGE",
}

// Filter and Search Types
export interface CourseFilters {
  category?: CourseCategory[];
  level?: CourseLevel[];
  duration?: {
    min: number;
    max: number;
  };
  rating?: number;
  isFree?: boolean;
  isMandatory?: boolean;
  instructor?: string;
  tags?: string[];
}

export interface CourseSearchParams {
  query?: string;
  filters?: CourseFilters;
  sortBy?: "popularity" | "date" | "rating" | "title" | "duration";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

// Response Types
export interface CourseCatalogResponse {
  courses: Course[];
  total: number;
  page: number;
  totalPages: number;
  filters: {
    categories: { value: CourseCategory; count: number }[];
    levels: { value: CourseLevel; count: number }[];
    instructors: { value: string; count: number }[];
    tags: { value: string; count: number }[];
  };
}

// Mandatory Courses Content Structure
export interface MandatoryCourse {
  id: string;
  title: string;
  duration: number;
  modules: {
    title: string;
    lessons: {
      title: string;
      type: LessonType;
      duration: number;
      content: string;
    }[];
  }[];
}

// The 5 mandatory courses
export const MANDATORY_COURSES = {
  SOFT_SKILLS: "soft-skills-empowerment",
  BASIC_COMPETENCIES: "basic-competencies",
  JOB_PLACEMENT: "job-placement-skills",
  ENTREPRENEURSHIP: "entrepreneurship-fundamentals",
  TECHNICAL_SKILLS: "technical-skills-digital",
} as const;

export interface LessonProgress {
  id: string;
  enrollmentId: string;
  lessonId: string;
  isCompleted: boolean;
  completedAt?: Date;
  timeSpent: number; // in minutes
  enrollment?: CourseEnrollment;
  lesson?: Lesson;
}
