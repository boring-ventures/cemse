"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getAuthHeaders } from "@/lib/api";

const jobApplicationSchema = z.object({
  jobOfferId: z.string().min(1, "Job offer is required"),
  applicantId: z.string().min(1, "Applicant is required"),
  status: z
    .enum([
      "PENDING",
      "REVIEWING",
      "INTERVIEWED",
      "ACCEPTED",
      "REJECTED",
      "WITHDRAWN",
    ])
    .default("PENDING"),
  coverLetter: z.string().optional(),
  resumeUrl: z.string().url().optional().or(z.literal("")),
});

type JobApplicationFormData = z.infer<typeof jobApplicationSchema>;

interface JobOffer {
  id: string;
  title: string;
  company?: {
    name: string;
  };
}

interface Applicant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

interface JobApplicationFormProps {
  application?: any;
  onSubmit: (data: JobApplicationFormData) => void;
  isEditing?: boolean;
}

export function JobApplicationForm({
  application,
  onSubmit,
  isEditing = false,
}: JobApplicationFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<JobApplicationFormData>({
    resolver: zodResolver(jobApplicationSchema),
    defaultValues: {
      jobOfferId: application?.jobOfferId || "",
      applicantId: application?.applicantId || "",
      status: application?.status || "PENDING",
      coverLetter: application?.coverLetter || "",
      resumeUrl: application?.resumeUrl || "",
    },
  });

  // Fetch job offers for dropdown
  const { data: jobOffers } = useQuery<JobOffer[]>({
    queryKey: ["job-offers"],
    queryFn: async () => {
      const response = await fetch("/api/joboffer", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch job offers");
      }
      return response.json();
    },
  });

  // Fetch applicants for dropdown
  const { data: applicants } = useQuery<Applicant[]>({
    queryKey: ["applicants"],
    queryFn: async () => {
      const response = await fetch("/api/applicants", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch applicants");
      }
      return response.json();
    },
  });

  const handleFormSubmit = (data: JobApplicationFormData) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Información de la Solicitud</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="jobOfferId">Posición de Trabajo *</Label>
              <Select
                value={watch("jobOfferId")}
                onValueChange={(value) => setValue("jobOfferId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una posición de trabajo" />
                </SelectTrigger>
                <SelectContent>
                  {jobOffers?.map((jobOffer) => (
                    <SelectItem key={jobOffer.id} value={jobOffer.id}>
                      <div className="flex flex-col">
                        <span>{jobOffer.title}</span>
                        {jobOffer.company && (
                          <span className="text-xs text-muted-foreground">
                            {jobOffer.company.name}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.jobOfferId && (
                <p className="text-sm text-red-600">
                  {errors.jobOfferId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="applicantId">Candidato *</Label>
              <Select
                value={watch("applicantId")}
                onValueChange={(value) => setValue("applicantId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un candidato" />
                </SelectTrigger>
                <SelectContent>
                  {applicants?.map((applicant) => (
                    <SelectItem key={applicant.id} value={applicant.id}>
                      <div className="flex flex-col">
                        <span>{`${applicant.firstName} ${applicant.lastName}`}</span>
                        <span className="text-xs text-muted-foreground">
                          {applicant.email}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.applicantId && (
                <p className="text-sm text-red-600">
                  {errors.applicantId.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Estado de la Solicitud</Label>
            <Select
              value={watch("status")}
              onValueChange={(value) => setValue("status", value as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Pendiente</SelectItem>
                <SelectItem value="REVIEWING">Revisando</SelectItem>
                <SelectItem value="INTERVIEWED">Entrevistado</SelectItem>
                <SelectItem value="ACCEPTED">Aceptado</SelectItem>
                <SelectItem value="REJECTED">Rechazado</SelectItem>
                <SelectItem value="WITHDRAWN">Retirado</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-sm text-red-600">{errors.status.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cover Letter */}
      <Card>
        <CardHeader>
          <CardTitle>Carta de Presentación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="coverLetter">
              Carta de Presentación (Opcional)
            </Label>
            <Textarea
              id="coverLetter"
              {...register("coverLetter")}
              placeholder="Ingresa el contenido de la carta de presentación..."
              rows={6}
            />
            {errors.coverLetter && (
              <p className="text-sm text-red-600">
                {errors.coverLetter.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resume */}
      <Card>
        <CardHeader>
          <CardTitle>Currículum</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="resumeUrl">URL del Currículum (Opcional)</Label>
            <Input
              id="resumeUrl"
              type="url"
              {...register("resumeUrl")}
              placeholder="https://example.com/resume.pdf"
            />
            {errors.resumeUrl && (
              <p className="text-sm text-red-600">{errors.resumeUrl.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Guardando..."
            : isEditing
              ? "Actualizar Solicitud"
              : "Crear Solicitud"}
        </Button>
      </div>
    </form>
  );
}
