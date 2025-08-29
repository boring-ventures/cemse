"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Target, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Timer,
  Award,
  BookOpen
} from "lucide-react";
import { useQuizSystem } from "@/hooks/useQuizSystem";

interface QuizQuestion {
  id: string;
  question: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'MULTIPLE_SELECT' | 'SHORT_ANSWER' | 'FILL_BLANK';
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  points: number;
  orderIndex: number;
}

interface Quiz {
  id: string;
  title: string;
  description?: string;
  timeLimit?: number; // en minutos
  passingScore: number;
  questions: QuizQuestion[];
}

interface QuizComponentProps {
  quiz: Quiz;
  enrollmentId: string;
  onComplete: (results: QuizResults) => void;
  onCancel?: () => void;
}

interface QuizResults {
  quizId: string;
  score: number;
  totalPoints: number;
  percentage: number;
  passed: boolean;
  timeSpent: number;
  answers: QuizAnswer[];
  completedAt: Date;
}

interface QuizAnswer {
  questionId: string;
  answer: string | string[];
  isCorrect: boolean;
  points: number;
}

export const QuizComponent: React.FC<QuizComponentProps> = ({
  quiz,
  enrollmentId,
  onComplete,
  onCancel
}) => {
  const { completeQuiz, loading: submittingQuiz } = useQuizSystem();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [timeSpent, setTimeSpent] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<QuizResults | null>(null);
  const [showExplanations, setShowExplanations] = useState(false);

  // Validate quiz data
  if (!quiz || !quiz.questions || !Array.isArray(quiz.questions) || quiz.questions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Quiz no disponible</h3>
              <p className="text-muted-foreground mb-4">
                No se pudieron cargar las preguntas del quiz. Por favor, intenta nuevamente.
              </p>
              {onCancel && (
                <Button onClick={onCancel}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const totalQuestions = quiz.questions.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  // Timer
  useEffect(() => {
    if (quiz.timeLimit && !isCompleted) {
      const interval = setInterval(() => {
        setTimeSpent(prev => {
          const newTime = prev + 1;
          if (newTime >= quiz.timeLimit! * 60) {
            handleComplete();
            return newTime;
          }
          return newTime;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [quiz.timeLimit, isCompleted]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (answer: string | string[]) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answer
    }));
  };

  const handleNext = () => {
    if (!quiz?.questions || quiz.questions.length === 0) return;
    
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (!quiz?.questions || quiz.questions.length === 0) return;
    
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    if (!quiz?.questions || quiz.questions.length === 0) {
      console.error('Cannot complete quiz: no questions available');
      return;
    }
    
    setIsCompleted(true);
    
    try {
      // Preparar las respuestas para el endpoint
      const answersForSubmission = quiz.questions.map(question => {
        const userAnswer = answers[question.id];
        return {
          questionId: question.id,
          answer: Array.isArray(userAnswer) ? userAnswer.join(', ') : (userAnswer || ''),
          timeSpent: Math.floor(timeSpent / quiz.questions.length) // Tiempo promedio por pregunta
        };
      });

      console.log('🔍 QuizComponent: Submitting answers:', {
        quizId: quiz.id,
        enrollmentId,
        answers: answersForSubmission
      });

      // Enviar al endpoint de quiz attempts usando el hook
      const attemptResult = await completeQuiz(quiz.id, enrollmentId, answersForSubmission);

      if (!attemptResult) {
        throw new Error('Failed to complete quiz');
      }

      console.log('🔍 QuizComponent: Quiz attempt result:', attemptResult);

      // Calcular puntos totales basado en las preguntas del quiz
      const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);
      
      // Crear resultados basados en la respuesta del servidor
      const quizResults: QuizResults = {
        quizId: quiz.id,
        score: attemptResult.score,
        totalPoints,
        percentage: totalPoints > 0 ? (attemptResult.score / totalPoints) * 100 : 0,
        passed: attemptResult.passed,
        timeSpent,
        answers: attemptResult.answers.map(answer => ({
          questionId: answer.questionId,
          answer: answer.answer,
          isCorrect: answer.isCorrect,
          points: answer.isCorrect ? quiz.questions.find(q => q.id === answer.questionId)?.points || 0 : 0
        })),
        completedAt: new Date(attemptResult.completedAt)
      };

      setResults(quizResults);
      setShowResults(true);
      onComplete(quizResults);

    } catch (error) {
      console.error('Error submitting quiz:', error);
      
      // Fallback: calcular resultados localmente si falla el servidor
      let totalScore = 0;
      let totalPoints = 0;
      const quizAnswers: QuizAnswer[] = [];

      quiz.questions.forEach(question => {
        totalPoints += question.points;
        const userAnswer = answers[question.id];
        let isCorrect = false;
        let points = 0;

        if (userAnswer) {
          if (Array.isArray(question.correctAnswer)) {
            isCorrect = Array.isArray(userAnswer) && 
              userAnswer.length === question.correctAnswer.length &&
              userAnswer.every(ans => question.correctAnswer.includes(ans));
          } else {
            isCorrect = userAnswer === question.correctAnswer;
          }

          if (isCorrect) {
            points = question.points;
            totalScore += question.points;
          }
        }

        quizAnswers.push({
          questionId: question.id,
          answer: userAnswer || '',
          isCorrect,
          points
        });
      });

      const percentage = (totalScore / totalPoints) * 100;
      const passed = percentage >= quiz.passingScore;

      const quizResults: QuizResults = {
        quizId: quiz.id,
        score: totalScore,
        totalPoints,
        percentage,
        passed,
        timeSpent,
        answers: quizAnswers,
        completedAt: new Date()
      };

      setResults(quizResults);
      setShowResults(true);
      onComplete(quizResults);
    }
  };

  const renderQuestion = () => {
    if (!currentQuestion) {
      return (
        <div className="text-center py-8">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-muted-foreground">Error al cargar la pregunta actual.</p>
        </div>
      );
    }

    const userAnswer = answers[currentQuestion.id];

    switch (currentQuestion.type) {
      case 'MULTIPLE_CHOICE':
        return (
          <RadioGroup
            value={userAnswer as string || ''}
            onValueChange={handleAnswerChange}
            className="space-y-3"
          >
            {currentQuestion.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value={option} id={`option-${index}`} />
                <label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                  {option}
                </label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'TRUE_FALSE':
        return (
          <RadioGroup
            value={userAnswer as string || ''}
            onValueChange={handleAnswerChange}
            className="space-y-3"
          >
            <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
              <RadioGroupItem value="Verdadero" id="true" />
              <label htmlFor="true" className="flex-1 cursor-pointer">Verdadero</label>
            </div>
            <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
              <RadioGroupItem value="Falso" id="false" />
              <label htmlFor="false" className="flex-1 cursor-pointer">Falso</label>
            </div>
          </RadioGroup>
        );

      case 'MULTIPLE_SELECT':
        return (
          <div className="space-y-3">
            {currentQuestion.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                <Checkbox
                  id={`checkbox-${index}`}
                  checked={(userAnswer as string[] || []).includes(option)}
                  onCheckedChange={(checked) => {
                    const currentAnswers = userAnswer as string[] || [];
                    if (checked) {
                      handleAnswerChange([...currentAnswers, option]);
                    } else {
                      handleAnswerChange(currentAnswers.filter(ans => ans !== option));
                    }
                  }}
                />
                <label htmlFor={`checkbox-${index}`} className="flex-1 cursor-pointer">
                  {option}
                </label>
              </div>
            ))}
          </div>
        );

      case 'SHORT_ANSWER':
        return (
          <Textarea
            placeholder="Escribe tu respuesta aquí..."
            value={userAnswer as string || ''}
            onChange={(e) => handleAnswerChange(e.target.value)}
            className="min-h-[100px]"
          />
        );

      case 'FILL_BLANK':
        return (
          <Input
            placeholder="Completa el espacio en blanco..."
            value={userAnswer as string || ''}
            onChange={(e) => handleAnswerChange(e.target.value)}
          />
        );

      default:
        return <p>Tipo de pregunta no soportado</p>;
    }
  };

  const renderResults = () => {
    if (!results) return null;

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Resultados Generales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Resultados del Quiz
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{results.percentage.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Puntuación</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{results.score}</div>
                <div className="text-sm text-muted-foreground">Puntos Obtenidos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{formatTime(results.timeSpent)}</div>
                <div className="text-sm text-muted-foreground">Tiempo</div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Badge variant={results.passed ? "default" : "destructive"} className="text-lg px-4 py-2">
                {results.passed ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    ¡Aprobado!
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    No Aprobado
                  </>
                )}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Respuestas Detalladas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Respuestas Detalladas</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExplanations(!showExplanations)}
              >
                {showExplanations ? "Ocultar" : "Mostrar"} Explicaciones
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {quiz.questions.map((question, index) => {
                const userAnswer = results.answers.find(a => a.questionId === question.id);
                const isCorrect = userAnswer?.isCorrect;

                return (
                  <div key={question.id} className="border rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm ${
                        isCorrect ? 'bg-green-500' : 'bg-red-500'
                      }`}>
                        {isCorrect ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">Pregunta {index + 1}</span>
                          <Badge variant="outline">{question.type}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {userAnswer?.points || 0}/{question.points} puntos
                          </span>
                        </div>
                        <p className="mb-3">{question.question}</p>
                        
                        <div className="space-y-2">
                          <div>
                            <span className="text-sm font-medium text-green-600">Respuesta correcta:</span>
                            <p className="text-sm">
                              {Array.isArray(question.correctAnswer) 
                                ? question.correctAnswer.join(', ') 
                                : question.correctAnswer}
                            </p>
                          </div>
                          
                          <div>
                            <span className="text-sm font-medium text-blue-600">Tu respuesta:</span>
                            <p className="text-sm">
                              {Array.isArray(userAnswer?.answer) 
                                ? userAnswer.answer.join(', ') 
                                : userAnswer?.answer || 'Sin responder'}
                            </p>
                          </div>

                          {showExplanations && question.explanation && (
                            <div>
                              <span className="text-sm font-medium text-purple-600">Explicación:</span>
                              <p className="text-sm">{question.explanation}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (showResults) {
    return renderResults();
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header del Quiz */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                {quiz.title}
              </CardTitle>
              {quiz.description && (
                <p className="text-muted-foreground mt-1">{quiz.description}</p>
              )}
            </div>
            <div className="flex items-center gap-4">
              {quiz.timeLimit && (
                <div className="flex items-center gap-2">
                  <Timer className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {formatTime(quiz.timeLimit * 60 - timeSpent)}
                  </span>
                </div>
              )}
              <Badge variant="outline">
                {currentQuestionIndex + 1} de {totalQuestions}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={progress} className="w-full" />
        </CardContent>
      </Card>

      {/* Pregunta Actual */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Pregunta {currentQuestionIndex + 1}
            </CardTitle>
            <Badge variant="outline">{currentQuestion?.points || 0} puntos</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-lg mb-4">{currentQuestion?.question || 'Pregunta no disponible'}</p>
            {renderQuestion()}
          </div>

          {/* Navegación */}
          <div className="flex items-center justify-between pt-6 border-t">
            <div className="flex items-center gap-2">
              {onCancel && (
                <Button variant="outline" onClick={onCancel}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0 || submittingQuiz}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>

              {currentQuestionIndex < totalQuestions - 1 ? (
                <Button 
                  onClick={handleNext}
                  disabled={!currentQuestion || !answers[currentQuestion.id] || submittingQuiz}
                >
                  {submittingQuiz ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      Siguiente
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              ) : (
                <Button 
                  onClick={handleComplete} 
                  className="bg-green-600 hover:bg-green-700"
                  disabled={submittingQuiz}
                >
                  {submittingQuiz ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Enviando Quiz...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Completar Quiz
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
