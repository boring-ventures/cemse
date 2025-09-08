"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { AlertModal } from "@/components/ui/alert-modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Save,
  HelpCircle,
  CheckCircle,
  Timer,
  Settings,
  X,
} from "lucide-react";

interface Question {
  id: string;
  type: "multiple_choice" | "true_false" | "short_answer" | "multiple_select";
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  points: number;
  order: number;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  instructions: string;
  questions: Question[];
  timeLimit?: number;
  passingScore: number;
  allowedAttempts: number;
  showCorrectAnswers: boolean;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
}

interface QuizBuilderProps {
  initialQuiz?: Quiz;
  onSave: (quiz: Quiz) => void;
  onCancel: () => void;
}

export function QuizBuilder({
  initialQuiz,
  onSave,
  onCancel,
}: QuizBuilderProps) {
  const [quiz, setQuiz] = useState<Quiz>(
    initialQuiz || {
      id: `quiz-${Date.now()}`,
      title: "",
      description: "",
      instructions:
        "Lee cada pregunta cuidadosamente y selecciona la mejor respuesta.",
      questions: [],
      timeLimit: undefined,
      passingScore: 70,
      allowedAttempts: 3,
      showCorrectAnswers: true,
      shuffleQuestions: false,
      shuffleOptions: false,
    }
  );

  const [activeTab, setActiveTab] = useState<
    "setup" | "questions" | "settings"
  >("setup");
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: "default" | "destructive" | "warning" | "info" | "success";
  }>({
    isOpen: false,
    title: "",
    message: "",
    variant: "default",
  });

  const updateQuiz = (updates: Partial<Quiz>) => {
    setQuiz((prev) => ({ ...prev, ...updates }));
  };

  const addQuestion = (questionData: Omit<Question, "id" | "order">) => {
    const newQuestion: Question = {
      id: `question-${Date.now()}`,
      order: quiz.questions.length + 1,
      ...questionData,
    };
    updateQuiz({
      questions: [...quiz.questions, newQuestion],
    });
  };

  const updateQuestion = (questionId: string, updates: Partial<Question>) => {
    updateQuiz({
      questions: quiz.questions.map((q) =>
        q.id === questionId ? { ...q, ...updates } : q
      ),
    });
  };

  const deleteQuestion = (questionId: string) => {
    setConfirmationModal({
      isOpen: true,
      title: "Eliminar pregunta",
      description:
        "¿Estás seguro de eliminar esta pregunta? Esta acción no se puede deshacer.",
      onConfirm: () => {
        updateQuiz({
          questions: quiz.questions.filter((q) => q.id !== questionId),
        });
        setConfirmationModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const moveQuestion = (questionId: string, direction: "up" | "down") => {
    const questions = [...quiz.questions];
    const index = questions.findIndex((q) => q.id === questionId);
    if (index === -1) return;

    if (direction === "up" && index > 0) {
      [questions[index], questions[index - 1]] = [
        questions[index - 1],
        questions[index],
      ];
    } else if (direction === "down" && index < questions.length - 1) {
      [questions[index], questions[index + 1]] = [
        questions[index + 1],
        questions[index],
      ];
    }

    // Update order numbers
    questions.forEach((q, i) => (q.order = i + 1));
    updateQuiz({ questions });
  };

  const getTotalPoints = () => {
    return quiz.questions.reduce((total, q) => total + q.points, 0);
  };

  const getQuestionTypeLabel = (type: Question["type"]) => {
    const labels = {
      multiple_choice: "Opción Múltiple",
      true_false: "Verdadero/Falso",
      short_answer: "Respuesta Corta",
      multiple_select: "Selección Múltiple",
    };
    return labels[type];
  };

  const handleSave = () => {
    if (quiz.title.trim() && quiz.questions.length > 0) {
      onSave(quiz);
    } else {
      setAlertModal({
        isOpen: true,
        title: "Información incompleta",
        message: "El quiz debe tener un título y al menos una pregunta.",
        variant: "warning",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {initialQuiz ? "Editar Examen" : "Crear Nuevo Examen"}
          </h1>
          <p className="text-muted-foreground">
            Diseña evaluaciones para medir el aprendizaje de los estudiantes
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Guardar Examen
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{quiz.questions.length}</div>
            <p className="text-sm text-muted-foreground">Preguntas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{getTotalPoints()}</div>
            <p className="text-sm text-muted-foreground">Puntos Totales</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {quiz.timeLimit || "Sin límite"}
            </div>
            <p className="text-sm text-muted-foreground">Tiempo (min)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{quiz.passingScore}%</div>
            <p className="text-sm text-muted-foreground">Nota Mínima</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex space-x-8">
          {[
            { id: "setup", label: "Configuración", icon: Settings },
            { id: "questions", label: "Preguntas", icon: HelpCircle },
            { id: "settings", label: "Opciones Avanzadas", icon: Timer },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() =>
                setActiveTab(tab.id as "setup" | "questions" | "settings")
              }
              className={`flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Setup Tab */}
      {activeTab === "setup" && (
        <Card>
          <CardHeader>
            <CardTitle>Información del Examen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quizTitle">Título del Examen</Label>
                <Input
                  id="quizTitle"
                  value={quiz.title}
                  onChange={(e) => updateQuiz({ title: e.target.value })}
                  placeholder="Ej: Evaluación Módulo 1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="passingScore">Nota Mínima (%)</Label>
                <Input
                  id="passingScore"
                  type="number"
                  min="0"
                  max="100"
                  value={quiz.passingScore}
                  onChange={(e) =>
                    updateQuiz({ passingScore: parseInt(e.target.value) || 70 })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quizDescription">Descripción</Label>
              <Textarea
                id="quizDescription"
                value={quiz.description}
                onChange={(e) => updateQuiz({ description: e.target.value })}
                placeholder="Descripción del examen y su propósito"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructions">
                Instrucciones para el Estudiante
              </Label>
              <Textarea
                id="instructions"
                value={quiz.instructions}
                onChange={(e) => updateQuiz({ instructions: e.target.value })}
                placeholder="Instrucciones específicas para el examen"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Questions Tab */}
      {activeTab === "questions" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Preguntas ({quiz.questions.length})
            </h3>
            <Button
              onClick={() => {
                setEditingQuestion(null);
                setShowQuestionDialog(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Pregunta
            </Button>
          </div>

          {quiz.questions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Sin preguntas</h3>
                <p className="text-muted-foreground mb-4">
                  Comienza agregando la primera pregunta a tu examen
                </p>
                <Button
                  onClick={() => {
                    setEditingQuestion(null);
                    setShowQuestionDialog(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Primera Pregunta
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {quiz.questions
                .sort((a, b) => a.order - b.order)
                .map((question, index) => (
                  <Card key={question.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                              {index + 1}
                            </div>
                            <Badge variant="outline">
                              {getQuestionTypeLabel(question.type)}
                            </Badge>
                            <Badge variant="secondary">
                              {question.points} pts
                            </Badge>
                          </div>

                          <h4 className="font-medium mb-2">
                            {question.question}
                          </h4>

                          {question.type === "multiple_choice" &&
                            question.options && (
                              <div className="space-y-1">
                                {question.options.map((option, optIndex) => (
                                  <div
                                    key={optIndex}
                                    className="flex items-center gap-2 text-sm"
                                  >
                                    <div
                                      className={`w-2 h-2 rounded-full ${
                                        option === question.correctAnswer
                                          ? "bg-green-500"
                                          : "bg-gray-300"
                                      }`}
                                    />
                                    {option}
                                    {option === question.correctAnswer && (
                                      <CheckCircle className="h-4 w-4 text-green-500" />
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}

                          {question.type === "true_false" && (
                            <div className="flex gap-4 text-sm">
                              <div
                                className={`flex items-center gap-2 ${
                                  question.correctAnswer === "true"
                                    ? "text-green-600 font-medium"
                                    : ""
                                }`}
                              >
                                <div
                                  className={`w-2 h-2 rounded-full ${
                                    question.correctAnswer === "true"
                                      ? "bg-green-500"
                                      : "bg-gray-300"
                                  }`}
                                />
                                Verdadero
                              </div>
                              <div
                                className={`flex items-center gap-2 ${
                                  question.correctAnswer === "false"
                                    ? "text-green-600 font-medium"
                                    : ""
                                }`}
                              >
                                <div
                                  className={`w-2 h-2 rounded-full ${
                                    question.correctAnswer === "false"
                                      ? "bg-green-500"
                                      : "bg-gray-300"
                                  }`}
                                />
                                Falso
                              </div>
                            </div>
                          )}

                          {question.explanation && (
                            <p className="text-sm text-muted-foreground mt-2">
                              <strong>Explicación:</strong>{" "}
                              {question.explanation}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-1 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveQuestion(question.id, "up")}
                            disabled={index === 0}
                          >
                            ↑
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveQuestion(question.id, "down")}
                            disabled={index === quiz.questions.length - 1}
                          >
                            ↓
                          </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingQuestion(question);
                                  setShowQuestionDialog(true);
                                }}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => deleteQuestion(question.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === "settings" && (
        <Card>
          <CardHeader>
            <CardTitle>Configuración Avanzada</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="timeLimit">Límite de Tiempo (minutos)</Label>
                  <Input
                    id="timeLimit"
                    type="number"
                    min="1"
                    value={quiz.timeLimit || ""}
                    onChange={(e) =>
                      updateQuiz({
                        timeLimit: e.target.value
                          ? parseInt(e.target.value)
                          : undefined,
                      })
                    }
                    placeholder="Sin límite"
                  />
                  <p className="text-xs text-muted-foreground">
                    Deja vacío para sin límite de tiempo
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="attempts">Intentos Permitidos</Label>
                  <Select
                    value={quiz.allowedAttempts.toString()}
                    onValueChange={(value) =>
                      updateQuiz({ allowedAttempts: parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 intento</SelectItem>
                      <SelectItem value="2">2 intentos</SelectItem>
                      <SelectItem value="3">3 intentos</SelectItem>
                      <SelectItem value="5">5 intentos</SelectItem>
                      <SelectItem value="-1">Intentos ilimitados</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="showCorrectAnswers"
                    checked={quiz.showCorrectAnswers}
                    onCheckedChange={(checked) =>
                      updateQuiz({ showCorrectAnswers: !!checked })
                    }
                  />
                  <Label htmlFor="showCorrectAnswers">
                    Mostrar respuestas correctas después del examen
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="shuffleQuestions"
                    checked={quiz.shuffleQuestions}
                    onCheckedChange={(checked) =>
                      updateQuiz({ shuffleQuestions: !!checked })
                    }
                  />
                  <Label htmlFor="shuffleQuestions">
                    Aleatorizar orden de preguntas
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="shuffleOptions"
                    checked={quiz.shuffleOptions}
                    onCheckedChange={(checked) =>
                      updateQuiz({ shuffleOptions: !!checked })
                    }
                  />
                  <Label htmlFor="shuffleOptions">
                    Aleatorizar opciones de respuesta
                  </Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Question Dialog */}
      <QuestionDialog
        isOpen={showQuestionDialog}
        onClose={() => {
          setShowQuestionDialog(false);
          setEditingQuestion(null);
        }}
        onSave={(questionData) => {
          if (editingQuestion) {
            updateQuestion(editingQuestion.id, questionData);
          } else {
            addQuestion(questionData);
          }
          setShowQuestionDialog(false);
          setEditingQuestion(null);
        }}
        question={editingQuestion}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() =>
          setConfirmationModal((prev) => ({ ...prev, isOpen: false }))
        }
        onConfirm={confirmationModal.onConfirm}
        title={confirmationModal.title}
        description={confirmationModal.description}
        variant="destructive"
      />

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal((prev) => ({ ...prev, isOpen: false }))}
        title={alertModal.title}
        message={alertModal.message}
        variant={alertModal.variant}
      />
    </div>
  );
}

// Question Dialog Component
function QuestionDialog({
  isOpen,
  onClose,
  onSave,
  question,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Question, "id" | "order">) => void;
  question?: Question | null;
}) {
  const [questionData, setQuestionData] = useState<
    Omit<Question, "id" | "order">
  >({
    type: "multiple_choice",
    question: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    explanation: "",
    points: 10,
  });

  useEffect(() => {
    if (question) {
      setQuestionData({
        type: question.type,
        question: question.question,
        options: question.options || [],
        correctAnswer: question.correctAnswer,
        explanation: question.explanation || "",
        points: question.points,
      });
    }
  }, [question]);

  const updateQuestion = (updates: Partial<typeof questionData>) => {
    setQuestionData((prev) => ({ ...prev, ...updates }));
  };

  const addOption = () => {
    updateQuestion({
      options: [...(questionData.options || []), ""],
    });
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...(questionData.options || [])];
    newOptions[index] = value;
    updateQuestion({ options: newOptions });
  };

  const removeOption = (index: number) => {
    const newOptions = (questionData.options || []).filter(
      (_, i) => i !== index
    );
    updateQuestion({ options: newOptions });
  };

  const handleSave = () => {
    if (
      questionData.question.trim() &&
      (questionData.type !== "multiple_choice" ||
        questionData.options?.some((o) => o.trim())) &&
      questionData.correctAnswer
    ) {
      onSave(questionData);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {question ? "Editar Pregunta" : "Agregar Nueva Pregunta"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Pregunta</Label>
              <Select
                value={questionData.type}
                onValueChange={(
                  value:
                    | "multiple_choice"
                    | "true_false"
                    | "short_answer"
                    | "multiple_select"
                ) => updateQuestion({ type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiple_choice">
                    Opción Múltiple
                  </SelectItem>
                  <SelectItem value="true_false">Verdadero/Falso</SelectItem>
                  <SelectItem value="short_answer">Respuesta Corta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="points">Puntos</Label>
              <Input
                id="points"
                type="number"
                min="1"
                value={questionData.points}
                onChange={(e) =>
                  updateQuestion({ points: parseInt(e.target.value) || 1 })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="questionText">Pregunta</Label>
            <Textarea
              id="questionText"
              value={questionData.question}
              onChange={(e) => updateQuestion({ question: e.target.value })}
              placeholder="Escribe la pregunta..."
              rows={3}
            />
          </div>

          {questionData.type === "multiple_choice" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Opciones de Respuesta</Label>
                <Button variant="outline" size="sm" onClick={addOption}>
                  <Plus className="h-4 w-4 mr-1" />
                  Agregar Opción
                </Button>
              </div>

              <RadioGroup
                value={questionData.correctAnswer as string}
                onValueChange={(value) =>
                  updateQuestion({ correctAnswer: value })
                }
              >
                {questionData.options?.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <RadioGroupItem value={option} id={`option-${index}`} />
                    <Input
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`Opción ${index + 1}`}
                      className="flex-1"
                    />
                    {(questionData.options?.length || 0) > 2 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOption(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </RadioGroup>
              <p className="text-xs text-muted-foreground">
                Selecciona la opción correcta
              </p>
            </div>
          )}

          {questionData.type === "true_false" && (
            <div className="space-y-2">
              <Label>Respuesta Correcta</Label>
              <RadioGroup
                value={questionData.correctAnswer as string}
                onValueChange={(value) =>
                  updateQuestion({ correctAnswer: value })
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="true" id="true" />
                  <Label htmlFor="true">Verdadero</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false" id="false" />
                  <Label htmlFor="false">Falso</Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {questionData.type === "short_answer" && (
            <div className="space-y-2">
              <Label htmlFor="correctAnswer">Respuesta Correcta</Label>
              <Input
                id="correctAnswer"
                value={questionData.correctAnswer as string}
                onChange={(e) =>
                  updateQuestion({ correctAnswer: e.target.value })
                }
                placeholder="Respuesta esperada..."
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="explanation">Explicación (Opcional)</Label>
            <Textarea
              id="explanation"
              value={questionData.explanation}
              onChange={(e) => updateQuestion({ explanation: e.target.value })}
              placeholder="Explicación de por qué esta es la respuesta correcta..."
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {question ? "Actualizar" : "Agregar"} Pregunta
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
