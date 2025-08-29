"use client";

import { useState } from "react";
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
  Play,
  Clock,
  Target,
  Users,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Search,
  FileText,
  Settings,
  Copy,
  Share,
  BarChart3,
  Timer,
  Award,
} from "lucide-react";
import { 
  useLessonQuizzes, 
  useCreateQuiz, 
  useUpdateQuiz, 
  useDeleteQuiz,
  type Quiz,
  type CreateQuizData,
  type UpdateQuizData
} from "@/hooks/useQuizApi";
import { toast } from "sonner";

export default function LessonQuizzesPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const moduleId = params.moduleId as string;
  const lessonId = params.lessonId as string;

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Form state
  const [formData, setFormData] = useState<CreateQuizData>({
    title: "",
    description: "",
    timeLimit: 30,
    passingScore: 70,
    showCorrectAnswers: true,
    isActive: true,
  });

  // Hooks
  const { data: quizzesData, isLoading: quizzesLoading } = useLessonQuizzes(lessonId);
  const quizzes: Quiz[] = (quizzesData as { quizzes?: Quiz[] })?.quizzes || [];
  const createQuiz = useCreateQuiz();
  const updateQuiz = useUpdateQuiz();
  const deleteQuiz = useDeleteQuiz();

  // Filter quizzes
  const filteredQuizzes = quizzes.filter((quiz) =>
    quiz.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateQuiz = async () => {
    try {
      await createQuiz.mutateAsync({
        ...formData,
        lessonId,
      });
      
      setIsCreateDialogOpen(false);
      setFormData({
        title: "",
        description: "",
        timeLimit: 30,
        passingScore: 70,
        showCorrectAnswers: true,
        isActive: true,
      });
      toast.success("Quiz creado exitosamente");
    } catch (error) {
      toast.error("Error al crear el quiz");
    }
  };

  const handleEditQuiz = async () => {
    if (!editingQuiz) return;
    
    try {
      await updateQuiz.mutateAsync({
        id: editingQuiz.id,
        ...formData,
      });
      
      setIsEditDialogOpen(false);
      setEditingQuiz(null);
      setFormData({
        title: "",
        description: "",
        timeLimit: 30,
        passingScore: 70,
        showCorrectAnswers: true,
        isActive: true,
      });
      toast.success("Quiz actualizado exitosamente");
    } catch (error) {
      toast.error("Error al actualizar el quiz");
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este quiz?")) {
      try {
        await deleteQuiz.mutateAsync(quizId);
        toast.success("Quiz eliminado exitosamente");
      } catch (error) {
        toast.error("Error al eliminar el quiz");
      }
    }
  };

  const openEditDialog = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setFormData({
      title: quiz.title,
      description: quiz.description || "",
      timeLimit: quiz.timeLimit || 30,
      passingScore: quiz.passingScore,
      showCorrectAnswers: quiz.showCorrectAnswers,
      isActive: quiz.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const getQuizStats = (quiz: Quiz) => {
    // Mock stats - in real implementation, fetch from API
    return {
      totalAttempts: 45,
      averageScore: 78,
      passRate: 85,
      totalQuestions: quiz.questions?.length || 0,
    };
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
  };

  if (quizzesLoading) {
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
            <Link href={`/admin/courses/${courseId}/modules/${moduleId}/lessons`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Lecciones
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">📝 Gestión de Quizzes</h1>
            <p className="text-muted-foreground">
              Administra los exámenes y evaluaciones de la lección
            </p>
          </div>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Crear Quiz
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Quiz</DialogTitle>
              <DialogDescription>
                Crea un nuevo examen para evaluar el conocimiento de los estudiantes.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="title">Título del Quiz</label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ej: Quiz sobre Variables en JavaScript"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="description">Descripción</label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe el contenido del quiz..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label htmlFor="timeLimit">Límite de Tiempo (minutos)</label>
                  <Input
                    id="timeLimit"
                    type="number"
                    value={formData.timeLimit}
                    onChange={(e) => setFormData({ ...formData, timeLimit: parseInt(e.target.value) })}
                    min="1"
                    max="180"
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="passingScore">Puntaje Mínimo (%)</label>
                  <Input
                    id="passingScore"
                    type="number"
                    value={formData.passingScore}
                    onChange={(e) => setFormData({ ...formData, passingScore: parseInt(e.target.value) })}
                    min="0"
                    max="100"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showCorrectAnswers"
                  checked={formData.showCorrectAnswers}
                  onChange={(e) => setFormData({ ...formData, showCorrectAnswers: e.target.checked })}
                />
                <label htmlFor="showCorrectAnswers">Mostrar respuestas correctas</label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <label htmlFor="isActive">Quiz activo</label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateQuiz} disabled={createQuiz.isPending}>
                {createQuiz.isPending ? "Creando..." : "Crear Quiz"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quiz Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quizzes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quizzes.length}</div>
            <p className="text-xs text-muted-foreground">
              {quizzes.filter(q => q.isActive).length} activos
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Intentos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {quizzes.reduce((total, quiz) => total + getQuizStats(quiz).totalAttempts, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Promedio por quiz
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Aprobación</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {quizzes.length > 0 
                ? Math.round(quizzes.reduce((total, quiz) => total + getQuizStats(quiz).passRate, 0) / quizzes.length)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Promedio general
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Puntaje Promedio</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {quizzes.length > 0 
                ? Math.round(quizzes.reduce((total, quiz) => total + getQuizStats(quiz).averageScore, 0) / quizzes.length)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Promedio general
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar quizzes..."
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
                  <TableHead>Quiz</TableHead>
                  <TableHead>Configuración</TableHead>
                  <TableHead>Estadísticas</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Última actualización</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuizzes.map((quiz) => {
                  const stats = getQuizStats(quiz);
                  return (
                    <TableRow key={quiz.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-medium">{quiz.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {quiz.description || "Sin descripción"}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {quiz.questions?.length || 0} preguntas
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Timer className="h-3 w-3 text-muted-foreground" />
                            <span>{formatTime(quiz.timeLimit || 0)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Target className="h-3 w-3 text-muted-foreground" />
                            <span>{quiz.passingScore}% mínimo</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            {quiz.showCorrectAnswers ? (
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            ) : (
                              <XCircle className="h-3 w-3 text-red-500" />
                            )}
                            <span className="text-xs">
                              {quiz.showCorrectAnswers ? "Muestra respuestas" : "No muestra respuestas"}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="h-3 w-3 text-muted-foreground" />
                            <span>{stats.totalAttempts} intentos</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <BarChart3 className="h-3 w-3 text-muted-foreground" />
                            <span>{stats.averageScore}% promedio</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Award className="h-3 w-3 text-muted-foreground" />
                            <span>{stats.passRate}% aprobación</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={quiz.isActive ? "default" : "secondary"}>
                          {quiz.isActive ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {quiz.updatedAt ? new Date(quiz.updatedAt).toLocaleDateString() : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/quizzes/${quiz.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                Ver detalles
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/quizzes/${quiz.id}/questions`}>
                                <FileText className="h-4 w-4 mr-2" />
                                Gestionar preguntas
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/quizzes/${quiz.id}/attempts`}>
                                <BarChart3 className="h-4 w-4 mr-2" />
                                Ver intentos
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditDialog(quiz)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteQuiz(quiz.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {filteredQuizzes.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No se encontraron quizzes
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? "Intenta ajustar los filtros de búsqueda"
                  : "Comienza creando quizzes para evaluar el conocimiento de los estudiantes"}
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Quiz
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Quiz Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Quiz</DialogTitle>
            <DialogDescription>
              Modifica la configuración del quiz seleccionado.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="edit-title">Título del Quiz</label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ej: Quiz sobre Variables en JavaScript"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="edit-description">Descripción</label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe el contenido del quiz..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="edit-timeLimit">Límite de Tiempo (minutos)</label>
                <Input
                  id="edit-timeLimit"
                  type="number"
                  value={formData.timeLimit}
                  onChange={(e) => setFormData({ ...formData, timeLimit: parseInt(e.target.value) })}
                  min="1"
                  max="180"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="edit-passingScore">Puntaje Mínimo (%)</label>
                <Input
                  id="edit-passingScore"
                  type="number"
                  value={formData.passingScore}
                  onChange={(e) => setFormData({ ...formData, passingScore: parseInt(e.target.value) })}
                  min="0"
                  max="100"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-showCorrectAnswers"
                checked={formData.showCorrectAnswers}
                onChange={(e) => setFormData({ ...formData, showCorrectAnswers: e.target.checked })}
              />
              <label htmlFor="edit-showCorrectAnswers">Mostrar respuestas correctas</label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
              <label htmlFor="edit-isActive">Quiz activo</label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditQuiz} disabled={updateQuiz.isPending}>
              {updateQuiz.isPending ? "Actualizando..." : "Actualizar Quiz"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
