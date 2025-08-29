"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VideoUploadWithConversion } from "./VideoUploadWithConversion";
import { ArrowLeft, FileVideo, Settings } from "lucide-react";

interface VideoLessonFormProps {
  moduleId: string;
  onSuccess?: (lessonId: string) => void;
  onCancel?: () => void;
}

interface LessonFormData {
  title: string;
  description: string;
  content: string;
  duration: number;
  orderIndex: number;
  isRequired: boolean;
  isPreview: boolean;
}

export const VideoLessonForm: React.FC<VideoLessonFormProps> = ({
  moduleId,
  onSuccess,
  onCancel,
}) => {
  const [step, setStep] = useState<"form" | "upload">("form");
  const [formData, setFormData] = useState<LessonFormData>({
    title: "",
    description: "",
    content: "",
    duration: 15,
    orderIndex: 1,
    isRequired: true,
    isPreview: false,
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      return;
    }
    setStep("upload");
  };

  const handleBackToForm = () => {
    setStep("form");
  };

  const handleUploadSuccess = (lessonId: string) => {
    if (onSuccess) {
      onSuccess(lessonId);
    }
  };

  const handleUploadCancel = () => {
    if (step === "upload") {
      setStep("form");
    } else {
      if (onCancel) {
        onCancel();
      }
    }
  };

  if (step === "upload") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBackToForm}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Form
          </Button>
          <h2 className="text-xl font-semibold">
            Upload Video for: {formData.title}
          </h2>
        </div>

        <VideoUploadWithConversion
          moduleId={moduleId}
          onSuccess={handleUploadSuccess}
          onCancel={handleUploadCancel}
          lessonData={{
            ...formData,
            contentType: "VIDEO",
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <FileVideo className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Create Video Lesson</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lesson Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid gap-2">
              <label htmlFor="title" className="text-sm font-medium">
                Lesson Title *
              </label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="e.g., Introduction to React Hooks"
                required
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe what students will learn in this lesson..."
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="content" className="text-sm font-medium">
                Lesson Content
              </label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                placeholder="Additional lesson content, notes, or instructions..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="duration" className="text-sm font-medium">
                  Duration (minutes)
                </label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      duration: parseInt(e.target.value) || 15,
                    })
                  }
                  min="1"
                  max="300"
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="orderIndex" className="text-sm font-medium">
                  Order
                </label>
                <Input
                  id="orderIndex"
                  type="number"
                  value={formData.orderIndex}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      orderIndex: parseInt(e.target.value) || 1,
                    })
                  }
                  min="1"
                />
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isRequired"
                  checked={formData.isRequired}
                  onChange={(e) =>
                    setFormData({ ...formData, isRequired: e.target.checked })
                  }
                />
                <label htmlFor="isRequired" className="text-sm font-medium">
                  Required lesson
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPreview"
                  checked={formData.isPreview}
                  onChange={(e) =>
                    setFormData({ ...formData, isPreview: e.target.checked })
                  }
                />
                <label htmlFor="isPreview" className="text-sm font-medium">
                  Preview available
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit">
                <Settings className="h-4 w-4 mr-2" />
                Continue to Video Upload
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
