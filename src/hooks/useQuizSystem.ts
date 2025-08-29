"use client";

import { useState, useCallback } from 'react';
import { apiCall } from '@/lib/api';

interface QuizQuestion {
  id: string;
  question: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'FILL_BLANK' | 'SORT_ELEMENTS' | 'MULTIPLE_SELECT' | 'SHORT_ANSWER';
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  points: number;
  orderIndex: number;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  timeLimit?: number;
  passingScore: number;
  showCorrectAnswers: boolean;
  isActive: boolean;
  questions: QuizQuestion[];
}

interface QuizAnswer {
  questionId: string;
  answer: string | string[];
  timeSpent: number;
}

interface QuizAttempt {
  id: string;
  enrollmentId: string;
  quizId: string;
  studentId: string;
  startedAt: string;
  completedAt?: string;
  score?: number;
  passed?: boolean;
  timeSpent: number;
  answers: {
    id: string;
    questionId: string;
    answer: string;
    isCorrect: boolean;
    timeSpent: number;
    correctAnswer?: string;
    explanation?: string;
  }[];
}

interface QuizCompletionResult {
  id: string;
  enrollmentId: string;
  quizId: string;
  studentId: string;
  startedAt: string;
  completedAt: string;
  score: number;
  passed: boolean;
  timeSpent: number;
  answers: {
    id: string;
    questionId: string;
    answer: string;
    isCorrect: boolean;
    timeSpent: number;
    correctAnswer?: string;
    explanation?: string;
  }[];
}

export const useQuizSystem = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Cargar un quiz específico
  const loadQuiz = useCallback(async (quizId: string): Promise<Quiz | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiCall(`/quizzes/${quizId}`) as { quiz?: Quiz } | Quiz;
      
      // The API returns { quiz: quizData }, so we need to extract the quiz property
      return (response as any).quiz || response as Quiz;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar el quiz';
      setError(errorMessage);
      console.error('Error loading quiz:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Completar un quiz y obtener calificación
  const completeQuiz = useCallback(async (
    quizId: string, 
    enrollmentId: string, 
    answers: QuizAnswer[]
  ): Promise<QuizCompletionResult | null> => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 useQuizSystem: Completing quiz:', {
        quizId,
        enrollmentId,
        answersCount: answers.length
      });
      
      const response = await apiCall('/quiz-attempts/complete', {
        method: 'POST',
        body: JSON.stringify({
          quizId,
          enrollmentId,
          answers
        })
      });
      
      console.log('🔍 useQuizSystem: Quiz completion response:', response);
      
      return response as QuizCompletionResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al completar el quiz';
      setError(errorMessage);
      console.error('Error completing quiz:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // 3. Verificar si ya se completó un quiz
  const checkQuizAttempts = useCallback(async (
    quizId: string, 
    enrollmentId: string
  ): Promise<QuizAttempt | null> => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 useQuizSystem: Checking quiz attempts:', { quizId, enrollmentId });
      
      const response = await apiCall(`/quiz-attempts?quizId=${quizId}&enrollmentId=${enrollmentId}`);
      
      console.log('🔍 useQuizSystem: Quiz attempts response:', response);
      
      if (response && Array.isArray(response) && response.length > 0) {
        // Filtrar solo intentos completados
        const completedAttempts = response.filter((attempt: any) => attempt.completedAt);
        
        if (completedAttempts.length > 0) {
          // Retornar el intento más reciente
          return completedAttempts[0];
        }
      }
      
      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al verificar intentos del quiz';
      setError(errorMessage);
      console.error('Error checking quiz attempts:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // 4. Obtener todos los intentos de un enrollment
  const getEnrollmentAttempts = useCallback(async (enrollmentId: string): Promise<QuizAttempt[]> => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 useQuizSystem: Getting enrollment attempts:', enrollmentId);
      
      const response = await apiCall(`/quiz-attempts?enrollmentId=${enrollmentId}`);
      
      console.log('🔍 useQuizSystem: Enrollment attempts response:', response);
      
      if (response && Array.isArray(response)) {
        return response.filter((attempt: any) => attempt.completedAt);
      }
      
      return [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener intentos del enrollment';
      setError(errorMessage);
      console.error('Error getting enrollment attempts:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    loadQuiz,
    completeQuiz,
    checkQuizAttempts,
    getEnrollmentAttempts
  };
};
