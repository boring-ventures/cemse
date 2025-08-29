import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiCall } from '@/lib/api';

// ===== TIPOS =====
export interface Quiz {
  id: string;
  courseId?: string;
  lessonId?: string;
  title: string;
  description?: string;
  timeLimit?: number; // en minutos
  passingScore: number;
  showCorrectAnswers: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  questions?: QuizQuestion[];
  attempts?: QuizAttempt[];
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  question: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'FILL_BLANK' | 'ESSAY';
  options: string[];
  correctAnswer: string;
  explanation?: string;
  points: number;
  orderIndex: number;
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
  timeSpent: number; // en segundos
  answers?: QuizAnswer[];
}

export interface QuizAnswer {
  id: string;
  attemptId: string;
  questionId: string;
  answer: string;
  isCorrect: boolean;
  points: number;
}

export interface CreateQuizData {
  courseId?: string;
  lessonId?: string;
  title: string;
  description?: string;
  timeLimit?: number;
  passingScore?: number;
  showCorrectAnswers?: boolean;
  isActive?: boolean;
}

export interface UpdateQuizData {
  id: string;
  title?: string;
  description?: string;
  timeLimit?: number;
  passingScore?: number;
  showCorrectAnswers?: boolean;
  isActive?: boolean;
}

export interface CreateQuestionData {
  quizId: string;
  question: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'FILL_BLANK' | 'ESSAY';
  options: string[];
  correctAnswer: string;
  explanation?: string;
  points?: number;
  orderIndex?: number;
}

export interface UpdateQuestionData {
  id: string;
  question?: string;
  type?: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'FILL_BLANK' | 'ESSAY';
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  points?: number;
  orderIndex?: number;
}

export interface CreateAttemptData {
  quizId: string;
  studentId: string;
  enrollmentId?: string;
}

export interface SubmitAnswerData {
  attemptId: string;
  questionId: string;
  answer: string;
}

// ===== HOOKS DE QUIZ =====

// Obtener quizzes de una lección
export const useLessonQuizzes = (lessonId?: string) => {
  return useQuery({
    queryKey: ['lessonQuizzes', lessonId],
    queryFn: async () => {
      if (!lessonId) return { quizzes: [] };
      
      const params = new URLSearchParams({ lessonId });
      const data = await apiCall(`/quizzes?${params}`);
      
      if (Array.isArray(data)) {
        return { quizzes: data };
      }
      
      return data;
    },
    enabled: !!lessonId,
  });
};

// Obtener quizzes de un curso
export const useCourseQuizzes = (courseId?: string) => {
  return useQuery({
    queryKey: ['courseQuizzes', courseId],
    queryFn: async () => {
      if (!courseId) return { quizzes: [] };
      
      const params = new URLSearchParams({ courseId });
      const data = await apiCall(`/quizzes?${params}`);
      
      if (Array.isArray(data)) {
        return { quizzes: data };
      }
      
      return data;
    },
    enabled: !!courseId,
  });
};



// Obtener un quiz específico con sus preguntas
export const useQuiz = (quizId?: string) => {
  return useQuery({
    queryKey: ['quiz', quizId],
    queryFn: async () => {
      if (!quizId) return null;
      
      const data = await apiCall(`/quizzes/${quizId}`);
      return data;
    },
    enabled: !!quizId,
  });
};

// Crear quiz
export const useCreateQuiz = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (quizData: CreateQuizData) => {
      const data = await apiCall('/quizzes', {
        method: 'POST',
        body: JSON.stringify(quizData),
      });
      
      return data;
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      if (variables.lessonId) {
        queryClient.invalidateQueries({
          queryKey: ['lessonQuizzes', variables.lessonId],
        });
      }
      if (variables.courseId) {
        queryClient.invalidateQueries({
          queryKey: ['courseQuizzes', variables.courseId],
        });
      }
    },
  });
};

// Actualizar quiz
export const useUpdateQuiz = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (quizData: UpdateQuizData) => {
      const data = await apiCall(`/quizzes/${quizData.id}`, {
        method: 'PUT',
        body: JSON.stringify(quizData),
      });
      
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['quiz', variables.id],
      });
    },
  });
};

// Eliminar quiz
export const useDeleteQuiz = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (quizId: string) => {
      const data = await apiCall(`/quizzes/${quizId}`, {
        method: 'DELETE',
      });
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['lessonQuizzes'],
      });
      queryClient.invalidateQueries({
        queryKey: ['courseQuizzes'],
      });
    },
  });
};

// ===== HOOKS DE PREGUNTAS =====

// Obtener preguntas de un quiz
export const useQuizQuestions = (quizId?: string) => {
  return useQuery({
    queryKey: ['quizQuestions', quizId],
    queryFn: async () => {
      if (!quizId) return { questions: [] };
      
      const params = new URLSearchParams({ quizId });
      const data = await apiCall(`/quizquestion?${params}`);
      
      if (Array.isArray(data)) {
        return { questions: data };
      }
      
      return data;
    },
    enabled: !!quizId,
  });
};

// Crear pregunta
export const useCreateQuestion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (questionData: CreateQuestionData) => {
      const data = await apiCall('/quizquestion', {
        method: 'POST',
        body: JSON.stringify(questionData),
      });
      
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['quizQuestions', variables.quizId],
      });
    },
  });
};

// Actualizar pregunta
export const useUpdateQuestion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (questionData: UpdateQuestionData) => {
      const data = await apiCall(`/quizquestion/${questionData.id}`, {
        method: 'PUT',
        body: JSON.stringify(questionData),
      });
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['quizQuestions'],
      });
    },
  });
};

// Eliminar pregunta
export const useDeleteQuestion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (questionId: string) => {
      const data = await apiCall(`/quizquestion/${questionId}`, {
        method: 'DELETE',
      });
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['quizQuestions'],
      });
    },
  });
};

// ===== HOOKS DE INTENTOS =====

// Obtener intentos de un quiz
export const useQuizAttempts = (quizId?: string) => {
  return useQuery({
    queryKey: ['quizAttempts', quizId],
    queryFn: async () => {
      if (!quizId) return { attempts: [] };
      
      const params = new URLSearchParams({ quizId });
      const data = await apiCall(`/quizattempt?${params}`);
      
      if (Array.isArray(data)) {
        return { attempts: data };
      }
      
      return data;
    },
    enabled: !!quizId,
  });
};

// Crear intento
export const useCreateAttempt = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (attemptData: CreateAttemptData) => {
      const data = await apiCall('/quizattempt', {
        method: 'POST',
        body: JSON.stringify(attemptData),
      });
      
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['quizAttempts', variables.quizId],
      });
    },
  });
};

// Finalizar intento
export const useCompleteAttempt = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (attemptId: string) => {
      const data = await apiCall(`/quizattempt/${attemptId}/complete`, {
        method: 'PUT',
      });
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['quizAttempts'],
      });
    },
  });
};

// ===== HOOKS DE RESPUESTAS =====

// Enviar respuesta
export const useSubmitAnswer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (answerData: SubmitAnswerData) => {
      const data = await apiCall('/quizanswer', {
        method: 'POST',
        body: JSON.stringify(answerData),
      });
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['quizAttempts'],
      });
    },
  });
}; 