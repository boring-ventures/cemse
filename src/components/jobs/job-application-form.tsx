"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Send, 
  Loader2,
  AlertCircle,
  CheckCircle,
  FileText,
  Upload,
  Download
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { JobQuestion, JobOffer } from "@/types/jobs";
import { useCVStatus } from "@/hooks/use-cv-status";

import { extractFilePath, buildFileUrl } from "@/lib/utils";
import { API_BASE, apiCall } from "@/lib/api";

interface JobApplicationFormProps {
  jobOffer: JobOffer;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface QuestionAnswer {
  questionId: string;
  question: string;
  answer: string;
}

export default function JobApplicationForm({ jobOffer, onSuccess, onCancel }: JobApplicationFormProps) {
  const { toast } = useToast();
  const { hasCV, hasCoverLetter, cvUrl, coverLetterUrl, cvData, checkCVStatus } = useCVStatus();
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<JobQuestion[]>([]);

  const [uploadingCV, setUploadingCV] = useState(false);
  const [uploadingCoverLetter, setUploadingCoverLetter] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null);
  const [uploadedCvUrl, setUploadedCvUrl] = useState<string>("");
  const [uploadedCoverLetterUrl, setUploadedCoverLetterUrl] = useState<string>("");
  const [formData, setFormData] = useState({
    notes: "",
    questionAnswers: [] as QuestionAnswer[],
    cvFile: "",
    coverLetterFile: ""
  });

  useEffect(() => {
    fetchQuestions();
  }, [jobOffer.id]);

  const fetchQuestions = async () => {
    try {
      // Use direct fetch to Next.js API route with cookies for authentication
      const response = await fetch(`/api/jobquestion?jobOfferId=${jobOffer.id}`, {
        method: 'GET',
        credentials: 'include', // Include cookies for authentication
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('🎯 fetchQuestions - Questions loaded:', data);
      setQuestions(data);
      // Initialize question answers
      setFormData(prev => ({
        ...prev,
        questionAnswers: data.map((q: JobQuestion) => ({
          questionId: q.id,
          question: q.question,
          answer: ""
        }))
      }));
    } catch (error) {
      console.error("Error fetching questions:", error);
      // Set some default questions if the API fails
      const defaultQuestions: JobQuestion[] = [
        {
          id: 'default_1',
          jobOfferId: jobOffer.id,
          question: '¿Por qué te interesa esta posición?',
          type: 'text',
          required: true,
          orderIndex: 1,
          options: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      setQuestions(defaultQuestions);
      setFormData(prev => ({
        ...prev,
        questionAnswers: defaultQuestions.map((q) => ({
          questionId: q.id,
          question: q.question,
          answer: ""
        }))
      }));
    }
  };

  const handleQuestionAnswer = (questionId: string, answer: string) => {
    setFormData(prev => ({
      ...prev,
      questionAnswers: prev.questionAnswers.map(qa => 
        qa.questionId === questionId ? { ...qa, answer } : qa
      )
    }));
  };

  const handleCVFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setCvFile(file);
    } else {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo PDF",
        variant: "destructive",
      });
    }
  };

  const handleCoverLetterFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setCoverLetterFile(file);
    } else {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo PDF",
        variant: "destructive",
      });
    }
  };

  const handleUploadCV = async () => {
    if (!cvFile) return;

    setUploadingCV(true);
    try {
      const formData = new FormData();
      formData.append('cvFile', cvFile);

      const response = await fetch('/api/files/upload/cv', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Error uploading CV');
      }

      const result = await response.json();
      setUploadedCvUrl(result.cvUrl);
      setCvFile(null);

      toast({
        title: "¡CV subido exitosamente!",
        description: "Tu CV ha sido guardado correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo subir el CV. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setUploadingCV(false);
    }
  };

  const handleUploadCoverLetter = async () => {
    if (!coverLetterFile) return;

    setUploadingCoverLetter(true);
    try {
      const formData = new FormData();
      formData.append('coverLetterFile', coverLetterFile);

      const response = await fetch('/api/files/upload/cover-letter', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Error uploading cover letter');
      }

      const result = await response.json();
      setUploadedCoverLetterUrl(result.coverLetterUrl);
      setCoverLetterFile(null);

      toast({
        title: "¡Carta subida exitosamente!",
        description: "Tu carta de presentación ha sido guardada correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo subir la carta. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setUploadingCoverLetter(false);
    }
  };

  const validateForm = () => {
    // Check if user has at least one document (existing or uploaded)
    const hasAnyDocument = hasCV || hasCoverLetter || uploadedCvUrl || uploadedCoverLetterUrl;
    
    if (!hasAnyDocument) {
      toast({
        title: "Documentos requeridos",
        description: "Necesitas subir al menos un CV o carta de presentación PDF para aplicar",
        variant: "destructive",
      });
      return false;
    }

    // Check required questions
    const requiredQuestions = questions.filter(q => q.required);
    for (const question of requiredQuestions) {
      const answer = formData.questionAnswers.find(qa => qa.questionId === question.id);
      if (!answer || !answer.answer.trim()) {
        toast({
          title: "Error",
          description: `Debes responder la pregunta: "${question.question}"`,
          variant: "destructive",
        });
        return false;
      }
    }

    return true;
  };

  const canSubmit = () => {
    // Must have at least one document (existing or uploaded)
    const hasAnyDocument = hasCV || hasCoverLetter || uploadedCvUrl || uploadedCoverLetterUrl;
    
    console.log('🔍 canSubmit - Debug info:', {
      hasCV,
      hasCoverLetter,
      uploadedCvUrl,
      uploadedCoverLetterUrl,
      hasAnyDocument,
      questionsCount: questions.length,
      requiredQuestionsCount: questions.filter(q => q.required).length,
      answeredQuestionsCount: formData.questionAnswers.filter(qa => qa.answer.trim()).length
    });
    
    if (!hasAnyDocument) {
      console.log('🔍 canSubmit - No documents available');
      return false;
    }
    
    // Must answer all required questions
    const requiredQuestions = questions.filter(q => q.required);
    for (const question of requiredQuestions) {
      const answer = formData.questionAnswers.find(qa => qa.questionId === question.id);
      if (!answer || !answer.answer.trim()) {
        console.log('🔍 canSubmit - Missing answer for question:', question.question);
        return false;
      }
    }
    
    console.log('🔍 canSubmit - All validations passed, can submit!');
    return true;
  };

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user has at least one document (existing or newly uploaded) before proceeding
    const hasAnyDocument = hasCV || hasCoverLetter || uploadedCvUrl || uploadedCoverLetterUrl;
    if (!hasAnyDocument) {
      console.log('🚨 No documents available - but we should not show modal anymore');
      // Instead of showing modal, just prevent submission - the UI already shows upload options
      return;
    }
    
    if (!validateForm()) return;

    setLoading(true);
    
        try {
      // Use direct fetch to Next.js API route with cookies for authentication
      // Prioritize uploaded documents over existing ones
      const finalCvUrl = uploadedCvUrl || (hasCV ? cvUrl : null);
      const finalCoverLetterUrl = uploadedCoverLetterUrl || (hasCoverLetter ? coverLetterUrl : null);
      
      const applicationData = {
        jobOfferId: jobOffer.id,
        cvUrl: finalCvUrl,
        coverLetterUrl: finalCoverLetterUrl,
        status: 'SENT',
        message: formData.notes.trim() || '',
        questionAnswers: formData.questionAnswers.filter(qa => qa.answer.trim())
      };

      console.log('🚀 Submitting application data:', applicationData);

      // Test API endpoint first
      console.log('🧪 Testing API endpoint...');
      
      try {
        // First test if we can reach the API at all
        const testResponse = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include'
        });
        console.log('🧪 Auth test response status:', testResponse.status);
      } catch (testError) {
        console.log('🧪 Auth test failed:', testError);
      }
      
      const response = await fetch('/api/jobapplication', {
        method: 'POST',
        credentials: 'include', // Include cookies for authentication
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(applicationData)
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast({
            title: "Error de autenticación",
            description: "Por favor, inicia sesión nuevamente.",
            variant: "destructive",
          });
          return;
        }
        const errorData = await response.json();
        console.error('🚨 API Error Response:', errorData);
        throw new Error(errorData.error || errorData.message || "Failed to submit application");
      }

      const result = await response.json();
      
      toast({
        title: "¡Aplicación enviada!",
        description: "Tu aplicación ha sido enviada correctamente",
      });
      onSuccess?.();
    } catch (error) {
      console.error("Error submitting application:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo enviar la aplicación. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };



  const renderQuestionInput = (question: JobQuestion) => {
    const answer = formData.questionAnswers.find(qa => qa.questionId === question.id);
    
    console.log('🎯 renderQuestionInput - Question:', question.question, 'Type:', question.type, 'Answer:', answer?.answer);
    
    switch (question.type?.toUpperCase()) {
      case "TEXT":
        return (
          <Textarea
            value={answer?.answer || ""}
            onChange={(e) => handleQuestionAnswer(question.id, e.target.value)}
            placeholder="Escribe tu respuesta aquí..."
            rows={3}
            required={question.required}
            className="w-full"
          />
        );
      
      case "MULTIPLE_CHOICE":
        return (
          <Select
            value={answer?.answer || ""}
            onValueChange={(value) => handleQuestionAnswer(question.id, value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona una opción" />
            </SelectTrigger>
            <SelectContent>
              {question.options?.map((option, index) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case "BOOLEAN":
        return (
          <Select
            value={answer?.answer || ""}
            onValueChange={(value) => handleQuestionAnswer(question.id, value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona Sí o No" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Sí">Sí</SelectItem>
              <SelectItem value="No">No</SelectItem>
            </SelectContent>
          </Select>
        );
      
      default:
        console.log('🚨 renderQuestionInput - Unknown question type:', question.type);
        return (
          <div className="p-3 bg-red-50 rounded border">
            <p className="text-red-600 text-sm">
              Tipo de pregunta no soportado: {question.type}
            </p>
            <Textarea
              value={answer?.answer || ""}
              onChange={(e) => handleQuestionAnswer(question.id, e.target.value)}
              placeholder="Escribe tu respuesta aquí..."
              rows={3}
              className="w-full mt-2"
            />
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Aplicar a: {jobOffer.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Documents Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Documentos</h3>
                </div>
                <span className="text-sm text-gray-600">
                  Sube tus documentos directamente aquí
                </span>
              </div>
              
              {/* CV Upload Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    {(hasCV || uploadedCvUrl) ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-orange-600" />
                    )}
                    <span className={(hasCV || uploadedCvUrl) ? "text-green-800" : "text-orange-800"}>
                      CV / Currículum Vitae
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {(hasCV && cvUrl) && (
                      <Button variant="outline" size="sm" onClick={() => {
                        const fullCVUrl = buildFileUrl(cvUrl);
                        window.open(fullCVUrl, '_blank');
                      }}>
                        <Download className="h-4 w-4 mr-1" />
                        Ver CV Existente
                      </Button>
                    )}
                    {uploadedCvUrl && (
                      <Button variant="outline" size="sm" onClick={() => {
                        window.open(uploadedCvUrl, '_blank');
                      }}>
                        <Download className="h-4 w-4 mr-1" />
                        Ver CV Subido
                      </Button>
                    )}
                  </div>
                </div>
                
                {!uploadedCvUrl && (
                  <div className="flex gap-2">
                    <Input
                      type="file"
                      accept=".pdf"
                      onChange={handleCVFileChange}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleUploadCV}
                      disabled={!cvFile || uploadingCV}
                    >
                      {uploadingCV ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {/* Cover Letter Upload Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    {(hasCoverLetter || uploadedCoverLetterUrl) ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-orange-600" />
                    )}
                    <span className={(hasCoverLetter || uploadedCoverLetterUrl) ? "text-green-800" : "text-orange-800"}>
                      Carta de Presentación (PDF)
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {(hasCoverLetter && coverLetterUrl) && (
                      <Button variant="outline" size="sm" onClick={() => {
                        const fullCoverLetterUrl = buildFileUrl(coverLetterUrl);
                        window.open(fullCoverLetterUrl, '_blank');
                      }}>
                        <Download className="h-4 w-4 mr-1" />
                        Ver Carta Existente
                      </Button>
                    )}
                    {uploadedCoverLetterUrl && (
                      <Button variant="outline" size="sm" onClick={() => {
                        window.open(uploadedCoverLetterUrl, '_blank');
                      }}>
                        <Download className="h-4 w-4 mr-1" />
                        Ver Carta Subida
                      </Button>
                    )}
                  </div>
                </div>
                
                {!uploadedCoverLetterUrl && (
                  <div className="flex gap-2">
                    <Input
                      type="file"
                      accept=".pdf"
                      onChange={handleCoverLetterFileChange}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleUploadCoverLetter}
                      disabled={!coverLetterFile || uploadingCoverLetter}
                    >
                      {uploadingCoverLetter ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                )}
              </div>


            </div>



            {/* Notes Section */}
            <div className="space-y-2">
              <Label htmlFor="notes">
                Notas Adicionales
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Información adicional, disponibilidad para entrevistas, comentarios especiales..."
                rows={3}
              />
              <p className="text-sm text-muted-foreground">
                Información adicional que consideres relevante para tu aplicación
              </p>
            </div>

            {/* Job Questions */}
            {questions.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">Preguntas del Empleo</h3>
                  <Badge variant="outline">{questions.length} pregunta{questions.length !== 1 ? 's' : ''}</Badge>
                </div>
                
                <div className="space-y-4">
                  {questions.map((question, index) => (
                    <Card key={question.id} className="border-l-4 border-l-primary">
                      <CardContent className="pt-6">
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Label className="text-base font-medium">
                                  {question.question}
                                </Label>
                                {question.required && (
                                  <Badge variant="destructive" className="text-xs">
                                    Obligatoria
                                  </Badge>
                                )}
                              </div>
                              
                              {renderQuestionInput(question)}
                              
                              {question.type === "multiple_choice" && question.options && (
                                <p className="text-sm text-muted-foreground mt-2">
                                  Opciones: {question.options.join(", ")}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
               {onCancel && (
                 <Button type="button" variant="outline" onClick={onCancel}>
                   Cancelar
                 </Button>
               )}
               <Button 
                 type="submit" 
                 disabled={loading || !canSubmit()} 
                 className="flex-1"
               >
                 {loading ? (
                   <>
                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                     Enviando aplicación...
                   </>
                 ) : (
                   <>
                     <Send className="mr-2 h-4 w-4" />
                     Enviar Aplicación
                   </>
                 )}
               </Button>

             </div>
            
            {/* Validation Message */}
            {!canSubmit() && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <span className="text-yellow-800 text-sm font-medium">
                    Para enviar la aplicación necesitas:
                  </span>
                </div>
                <ul className="mt-2 text-yellow-700 text-sm space-y-1">
                  {(!hasCV && !hasCoverLetter && !uploadedCvUrl && !uploadedCoverLetterUrl) && (
                    <li>• Al menos un CV o carta de presentación PDF</li>
                  )}
                  {questions.filter(q => q.required).map(question => {
                    const answer = formData.questionAnswers.find(qa => qa.questionId === question.id);
                    if (!answer || !answer.answer.trim()) {
                      return (
                        <li key={question.id}>• Responder: "{question.question}"</li>
                      );
                    }
                    return null;
                  })}
                </ul>
              </div>
            )}
          </form>
        </CardContent>
      </Card>


    </div>
  );
}
