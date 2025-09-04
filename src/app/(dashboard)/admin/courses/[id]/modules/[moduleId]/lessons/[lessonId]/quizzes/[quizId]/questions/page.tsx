"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  ArrowLeft,
  Search,
  FileText,
  Settings,
  Copy,
  Share,
  BarChart3,
  Timer,
  Award,
  CheckCircle,
  XCircle,
  GripVertical,
  Hash,
  HelpCircle,
  Type,
  List,
  Target,
} from "lucide-react";
import {
  useQuiz,
  useQuizQuestions,
  useCreateQuestion,
  useUpdateQuestion,
  useDeleteQuestion,
  type QuizQuestion,
  type CreateQuestionData,
  type UpdateQuestionData,
} from "@/hooks/useQuizApi";
import { toast } from "sonner";

export default function QuizQuestionsPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const moduleId = params.moduleId as string;
  const lessonId = params.lessonId as string;
  const quizId = params.quizId as string;

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Form state
  const [formData, setFormData] = useState<CreateQuestionData>({
    quizId,
    question: "",
    type: "MULTIPLE_CHOICE",
    options: ["", "", "", ""],
    correctAnswer: "",
    explanation: "",
    points: 1,
    orderIndex: 1,
  });

  // Hooks
  const { data: quiz, isLoading: quizLoading } = useQuiz(quizId);
  const quizData = quiz as any;
  const { data: questionsData, isLoading: questionsLoading } =
    useQuizQuestions(quizId);
  const questions = (questionsData as any)?.questions || [];
  const createQuestion = useCreateQuestion();
  const updateQuestion = useUpdateQuestion();
  const deleteQuestion = useDeleteQuestion();

  // Filter questions
  const filteredQuestions = questions.filter((question: any) =>
    question.question.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Efecto para manejar automáticamente las opciones según el tipo de pregunta
  useEffect(() => {
    if (formData.type === "TRUE_FALSE") {
      setFormData((prev) => ({
        ...prev,
        options: ["Verdadero", "Falso"],
        correctAnswer: prev.correctAnswer || "Verdadero",
      }));
    } else if (
      formData.type === "MULTIPLE_CHOICE" &&
      formData.options.length === 0
    ) {
      setFormData((prev) => ({
        ...prev,
        options: ["", "", "", ""],
        correctAnswer: "",
      }));
    }
  }, [formData.type]);

  // Efecto para resetear el formulario cuando se abre el diálogo de crear
  useEffect(() => {
    if (isCreateDialogOpen) {
      setFormData({
        quizId,
        question: "",
        type: "MULTIPLE_CHOICE",
        options: ["", "", "", ""],
        correctAnswer: "",
        explanation: "",
        points: 1,
        orderIndex: 1,
      });
    }
  }, [isCreateDialogOpen, quizId]);

  const handleCreateQuestion = async () => {
    try {
      // Validar que la pregunta no esté vacía
      if (!formData.question.trim()) {
        toast.error("Debes escribir una pregunta");
        return;
      }

      // Validar que se haya seleccionado una respuesta correcta
      if (!formData.correctAnswer.trim()) {
        toast.error("Debes seleccionar una respuesta correcta");
        return;
      }

      // Validar que al menos haya una opción válida para preguntas de opción múltiple
      if (formData.type === "MULTIPLE_CHOICE") {
        const validOptions = formData.options.filter(
          (option) => option.trim() !== ""
        );
        if (validOptions.length < 2) {
          toast.error("Debes agregar al menos 2 opciones");
          return;
        }

        // Validar que la respuesta correcta esté en las opciones
        if (!validOptions.includes(formData.correctAnswer)) {
          toast.error(
            "La respuesta correcta debe estar entre las opciones disponibles"
          );
          return;
        }

        await createQuestion.mutateAsync({
          ...formData,
          options: validOptions,
          orderIndex: questions.length + 1,
        });
      } else {
        // Para otros tipos de pregunta
        await createQuestion.mutateAsync({
          ...formData,
          options: [],
          orderIndex: questions.length + 1,
        });
      }

      setIsCreateDialogOpen(false);
      setFormData({
        quizId,
        question: "",
        type: "MULTIPLE_CHOICE",
        options: ["", "", "", ""],
        correctAnswer: "",
        explanation: "",
        points: 1,
        orderIndex: 1,
      });
      toast.success("Pregunta creada exitosamente");
    } catch (error) {
      toast.error("Error al crear la pregunta");
    }
  };

  const handleEditQuestion = async () => {
    if (!editingQuestion) return;

    try {
      // Validar que la pregunta no esté vacía
      if (!formData.question.trim()) {
        toast.error("Debes escribir una pregunta");
        return;
      }

      // Validar que se haya seleccionado una respuesta correcta
      if (!formData.correctAnswer.trim()) {
        toast.error("Debes seleccionar una respuesta correcta");
        return;
      }

      // Validar que al menos haya una opción válida para preguntas de opción múltiple
      if (formData.type === "MULTIPLE_CHOICE") {
        const validOptions = formData.options.filter(
          (option) => option.trim() !== ""
        );
        if (validOptions.length < 2) {
          toast.error("Debes agregar al menos 2 opciones");
          return;
        }

        // Validar que la respuesta correcta esté en las opciones
        if (!validOptions.includes(formData.correctAnswer)) {
          toast.error(
            "La respuesta correcta debe estar entre las opciones disponibles"
          );
          return;
        }

        await updateQuestion.mutateAsync({
          id: editingQuestion.id,
          ...formData,
          options: validOptions,
        });
      } else {
        // Para otros tipos de pregunta
        await updateQuestion.mutateAsync({
          id: editingQuestion.id,
          ...formData,
          options: [],
        });
      }

      setIsEditDialogOpen(false);
      setEditingQuestion(null);
      setFormData({
        quizId,
        question: "",
        type: "MULTIPLE_CHOICE",
        options: ["", "", "", ""],
        correctAnswer: "",
        explanation: "",
        points: 1,
        orderIndex: 1,
      });
      toast.success("Pregunta actualizada exitosamente");
    } catch (error) {
      toast.error("Error al actualizar la pregunta");
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (
      window.confirm("¿Estás seguro de que quieres eliminar esta pregunta?")
    ) {
      try {
        await deleteQuestion.mutateAsync(questionId);
        toast.success("Pregunta eliminada exitosamente");
      } catch (error) {
        toast.error("Error al eliminar la pregunta");
      }
    }
  };

  const openEditDialog = (question: QuizQuestion) => {
    setEditingQuestion(question);
    setFormData({
      quizId,
      question: question.question,
      type: question.type,
      options: [...question.options, "", ""].slice(0, 6), // Asegurar que tenga al menos 6 slots
      correctAnswer: question.correctAnswer,
      explanation: question.explanation || "",
      points: question.points,
      orderIndex: question.orderIndex,
    });
    setIsEditDialogOpen(true);
  };

  const addOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, ""],
    });
  };

  const removeOption = (index: number) => {
    const newOptions = formData.options.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      options: newOptions,
      // Si la respuesta correcta era la opción eliminada, limpiarla
      correctAnswer:
        formData.correctAnswer === formData.options[index]
          ? ""
          : formData.correctAnswer,
    });
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({
      ...formData,
      options: newOptions,
    });
  };

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case "MULTIPLE_CHOICE":
        return "Opción Múltiple";
      case "TRUE_FALSE":
        return "Verdadero/Falso";
      case "FILL_BLANK":
        return "Completar Espacios";
      case "ESSAY":
        return "Ensayo";
      default:
        return "Otro";
    }
  };

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case "MULTIPLE_CHOICE":
        return <List className="h-4 w-4" />;
      case "TRUE_FALSE":
        return <CheckCircle className="h-4 w-4" />;
      case "FILL_BLANK":
        return <Type className="h-4 w-4" />;
      case "ESSAY":
        return <FileText className="h-4 w-4" />;
      default:
        return <HelpCircle className="h-4 w-4" />;
    }
  };

  if (quizLoading || questionsLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-96 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link
              href={`/admin/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/quizzes`}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Quizzes
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">❓ Gestión de Preguntas</h1>
            <p className="text-muted-foreground">
              {quizData?.title} - Administra las preguntas del quiz
            </p>
          </div>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Pregunta
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Agregar Nueva Pregunta</DialogTitle>
              <DialogDescription>
                Crea una nueva pregunta para el quiz.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="question">Pregunta</label>
                <Textarea
                  id="question"
                  value={formData.question}
                  onChange={(e) =>
                    setFormData({ ...formData, question: e.target.value })
                  }
                  placeholder="Escribe la pregunta aquí..."
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="type">Tipo de Pregunta</label>
                <Select
                  value={formData.type}
                  onValueChange={(value: any) => {
                    setFormData({
                      ...formData,
                      type: value,
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MULTIPLE_CHOICE">
                      Opción Múltiple
                    </SelectItem>
                    <SelectItem value="TRUE_FALSE">Verdadero/Falso</SelectItem>
                    <SelectItem value="FILL_BLANK">
                      Completar Espacios
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Opciones para preguntas de opción múltiple */}
              {formData.type === "MULTIPLE_CHOICE" && (
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">
                      Opciones de Respuesta
                    </label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addOption}
                      disabled={formData.options.length >= 6}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Agregar Opción
                    </Button>
                  </div>
                  {formData.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder={`Opción ${index + 1}`}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOption(index)}
                        disabled={formData.options.length <= 2}
                      >
                        <XCircle className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Información para preguntas de Verdadero/Falso */}
              {formData.type === "TRUE_FALSE" && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      Pregunta de Verdadero/Falso
                    </span>
                  </div>
                  <p className="text-xs text-blue-700">
                    Las opciones "Verdadero" y "Falso" se configuran
                    automáticamente.
                  </p>
                </div>
              )}

              <div className="grid gap-2">
                <label htmlFor="correctAnswer">Respuesta Correcta *</label>
                {formData.type === "MULTIPLE_CHOICE" ? (
                  <Select
                    value={formData.correctAnswer}
                    onValueChange={(value) =>
                      setFormData({ ...formData, correctAnswer: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona la respuesta correcta" />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.options
                        .filter((option) => option.trim() !== "")
                        .map((option, index) => (
                          <SelectItem key={index} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                ) : formData.type === "TRUE_FALSE" ? (
                  <Select
                    value={formData.correctAnswer}
                    onValueChange={(value) =>
                      setFormData({ ...formData, correctAnswer: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona la respuesta correcta" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Verdadero">Verdadero</SelectItem>
                      <SelectItem value="Falso">Falso</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="correctAnswer"
                    value={formData.correctAnswer}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        correctAnswer: e.target.value,
                      })
                    }
                    placeholder="Escribe la respuesta correcta..."
                  />
                )}
                {formData.type === "MULTIPLE_CHOICE" &&
                  formData.correctAnswer && (
                    <p className="text-xs text-muted-foreground">
                      Respuesta seleccionada:{" "}
                      <span className="font-medium text-green-600">
                        {formData.correctAnswer}
                      </span>
                    </p>
                  )}
                {formData.type === "MULTIPLE_CHOICE" &&
                  !formData.correctAnswer && (
                    <p className="text-xs text-amber-600">
                      ⚠️ Debes seleccionar una respuesta correcta de las
                      opciones disponibles
                    </p>
                  )}
              </div>

              <div className="grid gap-2">
                <label htmlFor="explanation">Explicación (opcional)</label>
                <Textarea
                  id="explanation"
                  value={formData.explanation}
                  onChange={(e) =>
                    setFormData({ ...formData, explanation: e.target.value })
                  }
                  placeholder="Explica por qué esta es la respuesta correcta..."
                  rows={2}
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="points">Puntos</label>
                <Input
                  id="points"
                  type="number"
                  value={formData.points}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      points: parseInt(e.target.value),
                    })
                  }
                  min="1"
                  max="10"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateQuestion}
                disabled={
                  createQuestion.isPending ||
                  !formData.question.trim() ||
                  !formData.correctAnswer.trim()
                }
              >
                {createQuestion.isPending ? "Creando..." : "Crear Pregunta"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quiz Info */}
      {quizData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Información del Quiz
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Total Preguntas:</span>
                <span className="text-sm">{questions.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Tiempo Límite:</span>
                <span className="text-sm">{quizData.timeLimit || 0} min</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Puntaje Mínimo:</span>
                <span className="text-sm">{quizData.passingScore}%</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={quizData.isActive ? "default" : "secondary"}>
                  {quizData.isActive ? "Activo" : "Inactivo"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar preguntas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Pregunta</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Respuesta Correcta</TableHead>
                  <TableHead>Puntos</TableHead>
                  <TableHead>Orden</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuestions.map((question: any) => (
                  <TableRow key={question.id}>
                    <TableCell>
                      <div className="flex items-center justify-center">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-md">
                        <div className="font-medium line-clamp-2">
                          {question.question}
                        </div>
                        {question.explanation && (
                          <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
                            {question.explanation}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1 w-fit"
                      >
                        {getQuestionTypeIcon(question.type)}
                        <span>{getQuestionTypeLabel(question.type)}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <span className="text-sm font-medium text-green-600">
                          {question.correctAnswer}
                        </span>
                        {question.type === "MULTIPLE_CHOICE" && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {question.options.length} opciones
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {question.points}{" "}
                        {question.points === 1 ? "punto" : "puntos"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        #{question.orderIndex}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => openEditDialog(question)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteQuestion(question.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredQuestions.length === 0 && (
            <div className="text-center py-12">
              <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No se encontraron preguntas
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? "Intenta ajustar los filtros de búsqueda"
                  : "Comienza agregando preguntas al quiz"}
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Pregunta
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Question Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Pregunta</DialogTitle>
            <DialogDescription>
              Modifica la pregunta seleccionada.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="edit-question">Pregunta</label>
              <Textarea
                id="edit-question"
                value={formData.question}
                onChange={(e) =>
                  setFormData({ ...formData, question: e.target.value })
                }
                placeholder="Escribe la pregunta aquí..."
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="edit-type">Tipo de Pregunta</label>
              <Select
                value={formData.type}
                onValueChange={(value: any) => {
                  setFormData({
                    ...formData,
                    type: value,
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MULTIPLE_CHOICE">
                    Opción Múltiple
                  </SelectItem>
                  <SelectItem value="TRUE_FALSE">Verdadero/Falso</SelectItem>
                  <SelectItem value="FILL_BLANK">Completar Espacios</SelectItem>
                  <SelectItem value="ESSAY">Ensayo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Opciones para preguntas de opción múltiple */}
            {formData.type === "MULTIPLE_CHOICE" && (
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">
                    Opciones de Respuesta
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addOption}
                    disabled={formData.options.length >= 6}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Agregar Opción
                  </Button>
                </div>
                {formData.options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`Opción ${index + 1}`}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOption(index)}
                      disabled={formData.options.length <= 2}
                    >
                      <XCircle className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Información para preguntas de Verdadero/Falso */}
            {formData.type === "TRUE_FALSE" && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    Pregunta de Verdadero/Falso
                  </span>
                </div>
                <p className="text-xs text-blue-700">
                  Las opciones "Verdadero" y "Falso" se configuran
                  automáticamente.
                </p>
              </div>
            )}

            <div className="grid gap-2">
              <label htmlFor="edit-correctAnswer">Respuesta Correcta *</label>
              {formData.type === "MULTIPLE_CHOICE" ? (
                <Select
                  value={formData.correctAnswer}
                  onValueChange={(value) =>
                    setFormData({ ...formData, correctAnswer: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona la respuesta correcta" />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.options
                      .filter((option) => option.trim() !== "")
                      .map((option, index) => (
                        <SelectItem key={index} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              ) : formData.type === "TRUE_FALSE" ? (
                <Select
                  value={formData.correctAnswer}
                  onValueChange={(value) =>
                    setFormData({ ...formData, correctAnswer: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona la respuesta correcta" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Verdadero">Verdadero</SelectItem>
                    <SelectItem value="Falso">Falso</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="edit-correctAnswer"
                  value={formData.correctAnswer}
                  onChange={(e) =>
                    setFormData({ ...formData, correctAnswer: e.target.value })
                  }
                  placeholder="Escribe la respuesta correcta..."
                />
              )}
              {formData.type === "MULTIPLE_CHOICE" &&
                formData.correctAnswer && (
                  <p className="text-xs text-muted-foreground">
                    Respuesta seleccionada:{" "}
                    <span className="font-medium text-green-600">
                      {formData.correctAnswer}
                    </span>
                  </p>
                )}
            </div>

            <div className="grid gap-2">
              <label htmlFor="edit-explanation">Explicación (opcional)</label>
              <Textarea
                id="edit-explanation"
                value={formData.explanation}
                onChange={(e) =>
                  setFormData({ ...formData, explanation: e.target.value })
                }
                placeholder="Explica por qué esta es la respuesta correcta..."
                rows={2}
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="edit-points">Puntos</label>
              <Input
                id="edit-points"
                type="number"
                value={formData.points}
                onChange={(e) =>
                  setFormData({ ...formData, points: parseInt(e.target.value) })
                }
                min="1"
                max="10"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleEditQuestion}
              disabled={
                updateQuestion.isPending ||
                !formData.question.trim() ||
                !formData.correctAnswer.trim()
              }
            >
              {updateQuestion.isPending
                ? "Actualizando..."
                : "Actualizar Pregunta"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
