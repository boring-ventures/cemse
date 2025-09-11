"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Upload,
  FileText,
  Download,
  Trash2,
  Edit,
  Save,
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  Briefcase,
  Award,
  Languages,
  Globe,
  Printer,
  Edit3,
  ChevronRight,
  ChevronDown,
  Plus,
  Code,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { BACKEND_ENDPOINTS } from "@/lib/backend-config";
import { useCV } from "@/hooks/useCV";
import { CVTemplateSelector } from "./templates/cv-templates";
import { CoverLetterTemplateSelector } from "./templates/cover-letter-templates";
import { ImageUpload } from "./image-upload";

// Helper component for date inputs with mobile calendar button
const DateInputWithCalendar = ({
  id,
  value,
  onChange,
  placeholder,
  className = "h-12 border-gray-200 focus:border-blue-500",
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) => {
  const handleCalendarClick = () => {
    const input = document.getElementById(id) as HTMLInputElement;
    if (input) {
      input.showPicker?.();
      if (!input.showPicker) {
        input.focus();
      }
    }
  };

  return (
    <div className="relative">
      <Input
        id={id}
        type="month"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={className}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleCalendarClick}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-gray-500 hover:text-gray-700 sm:hidden"
      >
        <Calendar className="h-4 w-4" />
      </Button>
    </div>
  );
};

export function CVManager() {
  const {
    cvData,
    coverLetterData,
    loading,
    error,
    updateCVData,
    saveCoverLetterData,
  } = useCV();

  const [activeTab, setActiveTab] = useState("edit");
  const [isEditing, setIsEditing] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [newInterest, setNewInterest] = useState("");
  const [newRelevantSkill, setNewRelevantSkill] = useState("");
  const [uploading, setUploading] = useState(false);
  const [profileImage, setProfileImage] = useState("");
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Estado para secciones colapsables
  const [collapsedSections, setCollapsedSections] = useState({
    education: false,
    languages: false,
    socialLinks: false,
    workExperience: false,
    projects: false,
    skills: false,
    activities: false,
    interests: false,
    achievements: false,
  });

  // Sync profile image with CV data
  useEffect(() => {
    if (cvData?.personalInfo?.profileImage) {
      setProfileImage(cvData.personalInfo.profileImage);
    }
  }, [cvData?.personalInfo?.profileImage]);

  // Local state for immediate form updates - ALL FORM FIELDS
  const [localFormData, setLocalFormData] = useState({
    jobTitle: "",
    professionalSummary: "",
    personalInfo: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      addressLine: "",
      city: "",
      state: "",
      country: "",
      municipality: "",
      department: "",
      birthDate: "",
      gender: "",
      documentType: "",
      documentNumber: "",
    },
    education: {
      level: "",
      currentInstitution: "",
      graduationYear: null as number | null,
      isStudying: false,
      currentDegree: "",
      universityName: "",
      universityStartDate: "",
      universityEndDate: "",
      universityStatus: "",
      educationHistory: [] as any[],
      academicAchievements: [] as any[],
    },
    languages: [] as any[],
    socialLinks: [] as any[],
    workExperience: [] as any[],
    projects: [] as any[],
    skills: [] as any[],
    interests: [] as string[],
    activities: [] as any[],
    achievements: [] as any[],
    // certifications: [] as any[],
    targetPosition: "",
    targetCompany: "",
    relevantSkills: [] as string[],
  });

  // Initialize local state when CV data loads
  useEffect(() => {
    if (cvData) {
      console.log("🔄 Loading CV data into form:", cvData);
      setLocalFormData({
        jobTitle: cvData.jobTitle || "",
        professionalSummary: cvData.professionalSummary || "",
        personalInfo: {
          firstName: cvData.personalInfo?.firstName || "",
          lastName: cvData.personalInfo?.lastName || "",
          email: cvData.personalInfo?.email || "",
          phone: cvData.personalInfo?.phone || "",
          address: cvData.personalInfo?.address || "",
          addressLine: cvData.personalInfo?.addressLine || "",
          city: cvData.personalInfo?.city || "",
          state: cvData.personalInfo?.state || "",
          country: cvData.personalInfo?.country || "",
          municipality: cvData.personalInfo?.municipality || "",
          department: cvData.personalInfo?.department || "",
          // Include fields that might exist in database but not in form
          birthDate: cvData.personalInfo?.birthDate
            ? String(cvData.personalInfo.birthDate)
            : "",
          gender: cvData.personalInfo?.gender || "",
          documentType: (cvData.personalInfo as any)?.documentType || "",
          documentNumber: (cvData.personalInfo as any)?.documentNumber || "",
        },
        education: {
          level: cvData.education?.level || "",
          currentInstitution: cvData.education?.currentInstitution || "",
          graduationYear: cvData.education?.graduationYear || null,
          isStudying: cvData.education?.isStudying || false,
          currentDegree: cvData.education?.currentDegree || "",
          universityName: cvData.education?.universityName || "",
          universityStartDate: cvData.education?.universityStartDate || "",
          universityEndDate: cvData.education?.universityEndDate || "",
          universityStatus: cvData.education?.universityStatus || "",
          educationHistory: cvData.education?.educationHistory || [],
          academicAchievements: cvData.education?.academicAchievements || [],
        },
        languages: cvData.languages || [],
        socialLinks: cvData.socialLinks || [],
        workExperience: cvData.workExperience || [],
        projects: cvData.projects || [],
        skills: cvData.skills || [],
        interests: cvData.interests || [],
        activities: cvData.activities || [],
        achievements: cvData.achievements || [],
        // Note: certifications field doesn't exist in database yet
        // certifications: cvData.certifications || [],
        targetPosition: cvData.targetPosition || "",
        targetCompany: cvData.targetCompany || "",
        relevantSkills: cvData.relevantSkills || [],
      });
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
    }
  }, [cvData]);

  // Auto-save functionality
  useEffect(() => {
    // Only auto-save if we have unsaved changes, lastSaved exists, and cvData has been loaded
    if (hasUnsavedChanges && lastSaved && cvData) {
      const autoSaveTimer = setTimeout(() => {
        saveAllData();
      }, 30000); // Auto-save after 30 seconds of inactivity

      return () => clearTimeout(autoSaveTimer);
    }
  }, [hasUnsavedChanges, localFormData, cvData]);

  // Warn user about unsaved changes before leaving
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue =
          "Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Enhanced handlers with change tracking
  const handleJobTitleChange = (value: string) => {
    setLocalFormData((prev) => ({ ...prev, jobTitle: value }));
    setHasUnsavedChanges(true);
  };

  const handleProfessionalSummaryChange = (value: string) => {
    setLocalFormData((prev) => ({ ...prev, professionalSummary: value }));
    setHasUnsavedChanges(true);
  };

  const handlePersonalInfoChange = (field: string, value: string) => {
    setLocalFormData((prev) => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value,
      },
    }));
    setHasUnsavedChanges(true);
  };

  // Education field handlers
  const handleEducationFieldChange = (field: string, value: any) => {
    setLocalFormData((prev) => ({
      ...prev,
      education: {
        ...prev.education,
        [field]: value,
      },
    }));
    setHasUnsavedChanges(true);
  };

  // Education history handlers
  const handleEducationHistoryChange = (
    index: number,
    field: string,
    value: any
  ) => {
    setLocalFormData((prev) => {
      const newHistory = [...prev.education.educationHistory];
      newHistory[index] = {
        ...newHistory[index],
        [field]: value,
      };
      return {
        ...prev,
        education: {
          ...prev.education,
          educationHistory: newHistory,
        },
      };
    });
    setHasUnsavedChanges(true);
  };

  const addEducationHistory = () => {
    setLocalFormData((prev) => ({
      ...prev,
      education: {
        ...prev.education,
        educationHistory: [
          ...prev.education.educationHistory,
          {
            institution: "",
            degree: "",
            startDate: "",
            endDate: null,
            status: "",
          },
        ],
      },
    }));
    setHasUnsavedChanges(true);
  };

  const removeEducationHistory = (index: number) => {
    setLocalFormData((prev) => ({
      ...prev,
      education: {
        ...prev.education,
        educationHistory: prev.education.educationHistory.filter(
          (_, i) => i !== index
        ),
      },
    }));
    setHasUnsavedChanges(true);
  };

  // Academic achievements handlers
  const handleAcademicAchievementChange = (
    index: number,
    field: string,
    value: any
  ) => {
    setLocalFormData((prev) => {
      const newAchievements = [...prev.education.academicAchievements];
      newAchievements[index] = {
        ...newAchievements[index],
        [field]: value,
      };
      return {
        ...prev,
        education: {
          ...prev.education,
          academicAchievements: newAchievements,
        },
      };
    });
    setHasUnsavedChanges(true);
  };

  const addAcademicAchievement = () => {
    setLocalFormData((prev) => ({
      ...prev,
      education: {
        ...prev.education,
        academicAchievements: [
          ...prev.education.academicAchievements,
          {
            title: "",
            date: "",
            description: "",
            type: "honor",
          },
        ],
      },
    }));
    setHasUnsavedChanges(true);
  };

  const removeAcademicAchievement = (index: number) => {
    setLocalFormData((prev) => ({
      ...prev,
      education: {
        ...prev.education,
        academicAchievements: prev.education.academicAchievements.filter(
          (_, i) => i !== index
        ),
      },
    }));
    setHasUnsavedChanges(true);
  };

  // Language handlers
  const handleLanguageChange = (
    index: number,
    field: string,
    value: string
  ) => {
    setLocalFormData((prev) => {
      const newLanguages = [...prev.languages];
      newLanguages[index] = {
        ...newLanguages[index],
        [field]: value,
      };
      return { ...prev, languages: newLanguages };
    });
    setHasUnsavedChanges(true);
  };

  const addLanguage = () => {
    setLocalFormData((prev) => ({
      ...prev,
      languages: [...prev.languages, { name: "", proficiency: "" }],
    }));
    setHasUnsavedChanges(true);
  };

  const removeLanguage = (index: number) => {
    setLocalFormData((prev) => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index),
    }));
    setHasUnsavedChanges(true);
  };

  // Social links handlers
  const handleSocialLinkChange = (
    index: number,
    field: string,
    value: string
  ) => {
    setLocalFormData((prev) => {
      const newLinks = [...prev.socialLinks];
      newLinks[index] = {
        ...newLinks[index],
        [field]: value,
      };
      return { ...prev, socialLinks: newLinks };
    });
    setHasUnsavedChanges(true);
  };

  const addSocialLink = () => {
    setLocalFormData((prev) => ({
      ...prev,
      socialLinks: [...prev.socialLinks, { platform: "", url: "" }],
    }));
    setHasUnsavedChanges(true);
  };

  const removeSocialLink = (index: number) => {
    setLocalFormData((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== index),
    }));
    setHasUnsavedChanges(true);
  };

  // Work experience handlers
  const handleWorkExperienceChange = (
    index: number,
    field: string,
    value: string
  ) => {
    setLocalFormData((prev) => {
      const newExperience = [...prev.workExperience];
      newExperience[index] = {
        ...newExperience[index],
        [field]: value,
      };
      return { ...prev, workExperience: newExperience };
    });
    setHasUnsavedChanges(true);
  };

  const addWorkExperience = () => {
    setLocalFormData((prev) => ({
      ...prev,
      workExperience: [
        ...prev.workExperience,
        {
          jobTitle: "",
          company: "",
          startDate: "",
          endDate: "",
          description: "",
        },
      ],
    }));
    setHasUnsavedChanges(true);
  };

  const removeWorkExperience = (index: number) => {
    setLocalFormData((prev) => ({
      ...prev,
      workExperience: prev.workExperience.filter((_, i) => i !== index),
    }));
    setHasUnsavedChanges(true);
  };

  // Project handlers
  const handleProjectChange = (index: number, field: string, value: string) => {
    setLocalFormData((prev) => {
      const newProjects = [...prev.projects];
      newProjects[index] = {
        ...newProjects[index],
        [field]: value,
      };
      return { ...prev, projects: newProjects };
    });
    setHasUnsavedChanges(true);
  };

  const addProject = () => {
    setLocalFormData((prev) => ({
      ...prev,
      projects: [
        ...prev.projects,
        {
          title: "",
          location: "",
          startDate: "",
          endDate: "",
          description: "",
        },
      ],
    }));
    setHasUnsavedChanges(true);
  };

  const removeProject = (index: number) => {
    setLocalFormData((prev) => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index),
    }));
    setHasUnsavedChanges(true);
  };

  // Skills handlers
  const addSkill = () => {
    if (
      newSkill.trim() &&
      !localFormData.skills.some((skill) => skill.name === newSkill.trim())
    ) {
      setLocalFormData((prev) => ({
        ...prev,
        skills: [
          ...prev.skills,
          { name: newSkill.trim(), experienceLevel: "Skillful" },
        ],
      }));
      setNewSkill("");
      setHasUnsavedChanges(true);
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setLocalFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill.name !== skillToRemove),
    }));
    setHasUnsavedChanges(true);
  };

  // Interests handlers
  const addInterest = () => {
    if (
      newInterest.trim() &&
      !localFormData.interests.includes(newInterest.trim())
    ) {
      setLocalFormData((prev) => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()],
      }));
      setNewInterest("");
      setHasUnsavedChanges(true);
    }
  };

  const removeInterest = (interestToRemove: string) => {
    setLocalFormData((prev) => ({
      ...prev,
      interests: prev.interests.filter(
        (interest) => interest !== interestToRemove
      ),
    }));
    setHasUnsavedChanges(true);
  };

  // Activity handlers
  const handleActivityChange = (
    index: number,
    field: string,
    value: string
  ) => {
    setLocalFormData((prev) => {
      const newActivities = [...prev.activities];
      newActivities[index] = {
        ...newActivities[index],
        [field]: value,
      };
      return { ...prev, activities: newActivities };
    });
    setHasUnsavedChanges(true);
  };

  const addActivity = () => {
    setLocalFormData((prev) => ({
      ...prev,
      activities: [
        ...prev.activities,
        {
          title: "",
          organization: "",
          startDate: "",
          endDate: "",
          description: "",
        },
      ],
    }));
    setHasUnsavedChanges(true);
  };

  const removeActivity = (index: number) => {
    setLocalFormData((prev) => ({
      ...prev,
      activities: prev.activities.filter((_, i) => i !== index),
    }));
    setHasUnsavedChanges(true);
  };

  // General achievements handlers
  const handleGeneralAchievementChange = (
    index: number,
    field: string,
    value: any
  ) => {
    setLocalFormData((prev) => {
      const newAchievements = [...prev.achievements];
      newAchievements[index] = {
        ...newAchievements[index],
        [field]: value,
      };
      return { ...prev, achievements: newAchievements };
    });
    setHasUnsavedChanges(true);
  };

  const addGeneralAchievement = () => {
    setLocalFormData((prev) => ({
      ...prev,
      achievements: [
        ...prev.achievements,
        {
          title: "",
          date: "",
          description: "",
        },
      ],
    }));
    setHasUnsavedChanges(true);
  };

  const removeGeneralAchievement = (index: number) => {
    setLocalFormData((prev) => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== index),
    }));
    setHasUnsavedChanges(true);
  };

  // Relevant skills handlers
  const addRelevantSkill = () => {
    if (
      newRelevantSkill.trim() &&
      !localFormData.relevantSkills.includes(newRelevantSkill.trim())
    ) {
      setLocalFormData((prev) => ({
        ...prev,
        relevantSkills: [...prev.relevantSkills, newRelevantSkill.trim()],
      }));
      setNewRelevantSkill("");
      setHasUnsavedChanges(true);
    }
  };

  const removeRelevantSkill = (skillToRemove: string) => {
    setLocalFormData((prev) => ({
      ...prev,
      relevantSkills: prev.relevantSkills.filter(
        (skill) => skill !== skillToRemove
      ),
    }));
    setHasUnsavedChanges(true);
  };

  // Enhanced save function with validation and better error handling
  const saveAllData = async () => {
    try {
      // Don't save if cvData hasn't been loaded yet
      if (!cvData) {
        console.log("⚠️ Skipping save - cvData not loaded yet");
        return;
      }

      // Basic validation
      if (
        !localFormData.personalInfo.firstName?.trim() ||
        !localFormData.personalInfo.lastName?.trim()
      ) {
        alert("Por favor, completa al menos tu nombre y apellido.");
        return;
      }

      if (
        localFormData.personalInfo.email &&
        !isValidEmail(localFormData.personalInfo.email)
      ) {
        alert("Por favor, ingresa un email válido.");
        return;
      }

      const dataToSave = {
        jobTitle: localFormData.jobTitle.trim(),
        professionalSummary: localFormData.professionalSummary.trim(),
        personalInfo: {
          firstName: localFormData.personalInfo.firstName.trim(),
          lastName: localFormData.personalInfo.lastName.trim(),
          email: localFormData.personalInfo.email.trim(),
          phone: localFormData.personalInfo.phone.trim(),
          address: (
            localFormData.personalInfo.addressLine ||
            localFormData.personalInfo.address ||
            ""
          ).trim(),
          addressLine: localFormData.personalInfo.addressLine.trim(),
          city: localFormData.personalInfo.city.trim(),
          state: localFormData.personalInfo.state.trim(),
          municipality: localFormData.personalInfo.municipality.trim(),
          department: localFormData.personalInfo.department.trim(),
          country: localFormData.personalInfo.country.trim() || "Bolivia",
          profileImage: cvData?.personalInfo?.profileImage,
          // Include existing fields from database that aren't in the form
          birthDate: cvData?.personalInfo?.birthDate || undefined,
          gender: cvData?.personalInfo?.gender || "",
          documentType: (cvData?.personalInfo as any)?.documentType || "",
          documentNumber: (cvData?.personalInfo as any)?.documentNumber || "",
        },
        education: {
          level: localFormData.education.level,
          institution: localFormData.education.currentInstitution.trim(),
          currentInstitution: localFormData.education.currentInstitution.trim(),
          graduationYear: localFormData.education.graduationYear
            ? parseInt(localFormData.education.graduationYear.toString())
            : 0,
          isStudying: localFormData.education.isStudying,
          gpa: cvData?.education?.gpa || 0,
          educationHistory: localFormData.education.educationHistory.map(
            (item) => ({
              ...item,
              institution: item.institution?.trim() || "",
              degree: item.degree?.trim() || "",
            })
          ),
          currentDegree: localFormData.education.currentDegree.trim(),
          universityName: localFormData.education.universityName.trim(),
          universityStartDate:
            localFormData.education.universityStartDate || "",
          universityEndDate: localFormData.education.universityEndDate || "",
          universityStatus: localFormData.education.universityStatus,
          academicAchievements:
            localFormData.education.academicAchievements.map((item) => ({
              ...item,
              title: item.title?.trim() || "",
              description: item.description?.trim() || "",
            })),
        },
        languages: localFormData.languages.filter((lang) => lang.name?.trim()),
        socialLinks: localFormData.socialLinks.filter(
          (link) => link.platform && link.url?.trim()
        ),
        workExperience: localFormData.workExperience
          .map((exp) => ({
            ...exp,
            jobTitle: exp.jobTitle?.trim() || "",
            company: exp.company?.trim() || "",
            description: exp.description?.trim() || "",
          }))
          .filter((exp) => exp.jobTitle || exp.company),
        projects: localFormData.projects
          .map((proj) => ({
            ...proj,
            title: proj.title?.trim() || "",
            location: proj.location?.trim() || "",
            description: proj.description?.trim() || "",
          }))
          .filter((proj) => proj.title),
        skills: localFormData.skills.filter((skill) => skill.name?.trim()),
        interests: localFormData.interests.filter((interest) =>
          interest?.trim()
        ),
        activities: localFormData.activities.filter((activity) =>
          activity.title?.trim()
        ),
        achievements: localFormData.achievements.filter((achievement) =>
          achievement.title?.trim()
        ),
        // Note: certifications field doesn't exist in database yet
        // certifications: localFormData.certifications.filter((cert) =>
        //   cert.title?.trim()
        // ),
        targetPosition: localFormData.targetPosition.trim(),
        targetCompany: localFormData.targetCompany.trim(),
        relevantSkills: localFormData.relevantSkills.filter((skill) =>
          skill?.trim()
        ),
      };

      console.log("💾 Saving CV data:", dataToSave);
      console.log(
        "🔍 Data structure check - personalInfo:",
        dataToSave.personalInfo
      );
      console.log("🔍 Data structure check - education:", dataToSave.education);
      await updateCVData(dataToSave);
      console.log("✅ CV data saved successfully");

      // Reset unsaved changes flag and update last saved time
      setHasUnsavedChanges(false);
      setLastSaved(new Date());

      // Show success feedback
      const button = document.querySelector(
        "[data-save-button]"
      ) as HTMLButtonElement;
      if (button) {
        const originalText = button.textContent;
        button.textContent = "✓ Guardado";
        button.classList.add("bg-green-600", "hover:bg-green-700");
        setTimeout(() => {
          button.textContent = originalText;
          button.classList.remove("bg-green-600", "hover:bg-green-700");
        }, 2000);
      }
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Error al guardar los datos. Por favor, inténtalo de nuevo.");
    }
  };

  // Email validation helper
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Improved print functions that work with actual templates
  const handlePrintCV = async () => {
    try {
      // First save current data
      await saveAllData();

      // If we're on the edit tab, switch to CV tab and use default template
      if (activeTab === "edit") {
        setActiveTab("cv");
        // Wait for tab to render, then trigger print from the template
        setTimeout(() => {
          const printButton = document.querySelector(
            "[data-cv-print]"
          ) as HTMLButtonElement;
          if (printButton) {
            printButton.click();
          } else {
            // Fallback to window print with proper styling
            document.body.classList.add("printing-cv");
            window.print();
            setTimeout(() => {
              document.body.classList.remove("printing-cv");
            }, 1000);
          }
        }, 500);
      } else {
        // We're already on CV tab, trigger print from active template
        const printButton = document.querySelector(
          "[data-cv-print]"
        ) as HTMLButtonElement;
        if (printButton) {
          printButton.click();
        }
      }
    } catch (error) {
      console.error("Error printing CV:", error);
      alert("Error al imprimir el CV. Por favor, inténtalo de nuevo.");
    }
  };

  const handlePrintCoverLetter = async () => {
    try {
      // First save current data
      await saveAllData();

      // Switch to cover letter tab if not already there
      if (activeTab !== "cover-letter") {
        setActiveTab("cover-letter");
        // Wait for tab to render, then trigger print
        setTimeout(() => {
          const printButton = document.querySelector(
            "[data-cover-letter-print]"
          ) as HTMLButtonElement;
          if (printButton) {
            printButton.click();
          } else {
            document.body.classList.add("printing-cover-letter");
            window.print();
            setTimeout(() => {
              document.body.classList.remove("printing-cover-letter");
            }, 1000);
          }
        }, 500);
      } else {
        // We're already on cover letter tab, trigger print
        const printButton = document.querySelector(
          "[data-cover-letter-print]"
        ) as HTMLButtonElement;
        if (printButton) {
          printButton.click();
        }
      }
    } catch (error) {
      console.error("Error printing cover letter:", error);
      alert(
        "Error al imprimir la carta de presentación. Por favor, inténtalo de nuevo."
      );
    }
  };

  // Enhanced download functions that work with templates
  const handleDownloadCV = async () => {
    try {
      await saveAllData();

      if (activeTab === "edit") {
        setActiveTab("cv");
        setTimeout(() => {
          const downloadBtn = document.querySelector(
            "[data-cv-download]"
          ) as HTMLButtonElement;
          if (downloadBtn) downloadBtn.click();
        }, 100);
      } else {
        const downloadBtn = document.querySelector(
          "[data-cv-download]"
        ) as HTMLButtonElement;
        if (downloadBtn) downloadBtn.click();
      }
    } catch (error) {
      console.error("Error downloading CV:", error);
      alert("Error al descargar el CV. Por favor, inténtalo de nuevo.");
    }
  };

  const handleDownloadCoverLetter = async () => {
    try {
      await saveAllData();

      if (activeTab !== "cover-letter") {
        setActiveTab("cover-letter");
        setTimeout(() => {
          const downloadBtn = document.querySelector(
            "[data-cover-letter-download]"
          ) as HTMLButtonElement;
          if (downloadBtn) downloadBtn.click();
        }, 100);
      } else {
        const downloadBtn = document.querySelector(
          "[data-cover-letter-download]"
        ) as HTMLButtonElement;
        if (downloadBtn) downloadBtn.click();
      }
    } catch (error) {
      console.error("Error downloading cover letter:", error);
      alert(
        "Error al descargar la carta de presentación. Por favor, inténtalo de nuevo."
      );
    }
  };

  const handleDownloadAll = async () => {
    try {
      await saveAllData();

      // Download CV first
      if (activeTab !== "cv") {
        setActiveTab("cv");
        setTimeout(() => {
          const cvDownloadBtn = document.querySelector(
            "[data-cv-download]"
          ) as HTMLButtonElement;
          if (cvDownloadBtn) cvDownloadBtn.click();

          // Then download cover letter after a delay
          setTimeout(() => {
            setActiveTab("cover-letter");
            setTimeout(() => {
              const coverLetterDownloadBtn = document.querySelector(
                "[data-cover-letter-download]"
              ) as HTMLButtonElement;
              if (coverLetterDownloadBtn) coverLetterDownloadBtn.click();
            }, 100);
          }, 1000);
        }, 100);
      } else {
        const cvDownloadBtn = document.querySelector(
          "[data-cv-download]"
        ) as HTMLButtonElement;
        if (cvDownloadBtn) cvDownloadBtn.click();

        setTimeout(() => {
          setActiveTab("cover-letter");
          setTimeout(() => {
            const coverLetterDownloadBtn = document.querySelector(
              "[data-cover-letter-download]"
            ) as HTMLButtonElement;
            if (coverLetterDownloadBtn) coverLetterDownloadBtn.click();
          }, 100);
        }, 1000);
      }
    } catch (error) {
      console.error("Error downloading all documents:", error);
      alert(
        "Error al descargar los documentos. Por favor, inténtalo de nuevo."
      );
    }
  };

  const toggleSection = (section: keyof typeof collapsedSections) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const uploadProfileImage = async (file: File) => {
    try {
      setUploading(true);
      setUploadError("");

      const formData = new FormData();
      formData.append("image", file);

      // Use local Next.js API route with cookie authentication
      const response = await fetch("/api/files/upload/profile-image", {
        method: "POST",
        credentials: "include", // Include cookies for authentication
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Authentication failed");
        }
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      const imageUrl = data.imageUrl || data.url;

      // Update both local state and CV data
      setProfileImage(imageUrl);
      await updateProfileAvatar(imageUrl);

      setShowImageUpload(false);
    } catch (error) {
      console.error("Error uploading image:", error);
      setUploadError(
        error instanceof Error ? error.message : "Error al subir la imagen"
      );
    } finally {
      setUploading(false);
    }
  };

  const updateProfileAvatar = async (imageUrl: string | null) => {
    try {
      const updatedPersonalInfo = {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        municipality: "",
        department: "",
        country: "",
        ...cvData?.personalInfo,
        profileImage: imageUrl || undefined,
      };

      await updateCVData({
        personalInfo: updatedPersonalInfo,
      });

      setProfileImage(imageUrl || "");
    } catch (error) {
      console.error("Error updating avatar:", error);
      setUploadError("Error al actualizar el avatar");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-80" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        {/* Tabs Skeleton */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-full">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg border p-6">
                <Skeleton className="h-6 w-40 mb-4" />
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-lg border p-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="bg-white shadow-sm border-0 max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Error al cargar el CV
            </h3>
            <p className="text-gray-600 mb-6">
              No se pudieron cargar los datos del CV. Por favor, intenta
              nuevamente.
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="w-full h-11"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      {/* Enhanced Print styles for CV templates */}
      <style jsx global>{`
        @media print {
          /* Hide non-printable elements */
          .no-print,
          .print\:hidden,
          button:not([data-cv-print]):not([data-cover-letter-print]),
          .nav,
          .navigation,
          .header,
          .footer,
          .sidebar {
            display: none !important;
          }

          /* Ensure print content is visible and properly formatted */
          .print-content,
          .cv-template,
          .cover-letter-template {
            display: block !important;
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            visibility: visible !important;
          }

          /* Make sure all template content is visible */
          .print-content *,
          .cv-template *,
          .cover-letter-template * {
            visibility: visible !important;
            color: #000 !important;
            background: white !important;
          }

          /* Page settings for better print layout */
          @page {
            margin: 1.5cm;
            size: A4;
          }

          /* Typography for print */
          .print-content,
          .cv-template,
          .cover-letter-template {
            font-size: 12pt !important;
            line-height: 1.4 !important;
            color: #000 !important;
          }

          /* Headers and titles */
          h1,
          h2,
          h3,
          h4,
          h5,
          h6 {
            page-break-after: avoid;
            font-weight: bold !important;
          }

          /* Sections */
          .section,
          .cv-section {
            page-break-inside: avoid;
            margin-bottom: 1em !important;
          }

          /* Lists and items */
          ul,
          ol {
            margin: 0.5em 0 !important;
          }

          li {
            margin-bottom: 0.3em !important;
          }

          /* Remove shadows and unnecessary styling */
          * {
            box-shadow: none !important;
            border-radius: 0 !important;
            background: transparent !important;
          }

          /* Ensure proper display */
          .flex {
            display: flex !important;
          }

          .grid {
            display: grid !important;
          }

          .block {
            display: block !important;
          }

          .inline {
            display: inline !important;
          }

          .inline-block {
            display: inline-block !important;
          }

          /* Images */
          img {
            max-width: 100% !important;
            height: auto !important;
            page-break-inside: avoid;
          }

          /* Tables */
          table {
            border-collapse: collapse !important;
            width: 100% !important;
          }

          th,
          td {
            border: 1px solid #000 !important;
            padding: 4px !important;
          }

          /* CV specific styles */
          .cv-header {
            border-bottom: 2px solid #000 !important;
            margin-bottom: 1em !important;
            padding-bottom: 0.5em !important;
          }

          .cv-name {
            font-size: 18pt !important;
            font-weight: bold !important;
          }

          .cv-title {
            font-size: 14pt !important;
            margin-bottom: 0.5em !important;
          }

          .cv-contact {
            font-size: 10pt !important;
          }

          /* When printing from edit tab, hide form elements */
          body.printing-cv .no-print,
          body.printing-cover-letter .no-print {
            display: none !important;
          }

          body.printing-cv [role="tablist"],
          body.printing-cover-letter [role="tablist"] {
            display: none !important;
          }

          body.printing-cv .tabs-content > div:not(.print-content),
          body.printing-cover-letter .tabs-content > div:not(.print-content) {
            display: none !important;
          }
        }
      `}</style>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 no-print">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Gestor de CV y Carta de Presentación
              {hasUnsavedChanges && (
                <span className="text-orange-500 text-sm ml-2">
                  • Cambios sin guardar
                </span>
              )}
            </h1>
            <p className="text-gray-600 text-lg mt-2">
              Crea y personaliza tu CV y carta de presentación con múltiples
              plantillas profesionales
              {lastSaved && (
                <span className="text-sm text-gray-400 block mt-1">
                  Último guardado: {lastSaved.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={saveAllData}
              className="h-11 px-6 bg-green-600 hover:bg-green-700"
              data-save-button
            >
              <Save className="h-4 w-4 mr-2" />
              Guardar Cambios
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsEditing(!isEditing)}
              className="h-11 px-6"
            >
              {isEditing ? (
                <>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Vista Previa
                </>
              ) : (
                <>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Editar
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleDownloadCV}
              className="h-11 px-6"
            >
              <Download className="h-4 w-4 mr-2" />
              Descargar CV
            </Button>
            <Button
              variant="outline"
              onClick={handleDownloadCoverLetter}
              className="h-11 px-6"
            >
              <Download className="h-4 w-4 mr-2" />
              Descargar Carta
            </Button>
            <Button onClick={handleDownloadAll} className="h-11 px-6">
              <Download className="h-4 w-4 mr-2" />
              Descargar Todo
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-lg no-print">
            <TabsTrigger
              value="edit"
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <User className="h-4 w-4" />
              Editar Datos
            </TabsTrigger>
            <TabsTrigger
              value="cv"
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <FileText className="h-4 w-4" />
              Curriculum Vitae
            </TabsTrigger>
            <TabsTrigger
              value="cover-letter"
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Mail className="h-4 w-4" />
              Carta de Presentación
            </TabsTrigger>
          </TabsList>

          {/* Edit Data Tab */}
          <TabsContent value="edit" className="space-y-6">
            {/* Información Básica - Siempre visible */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Job Title */}
              <Card className="bg-white shadow-sm border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                    Puesto Objetivo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label
                      htmlFor="jobTitle"
                      className="text-sm font-medium text-gray-700 mb-2 block"
                    >
                      Título del Puesto
                    </Label>
                    <Input
                      id="jobTitle"
                      value={localFormData.jobTitle}
                      onChange={(e) => handleJobTitleChange(e.target.value)}
                      placeholder="Desarrollador Frontend"
                      className="h-12 border-gray-200 focus:border-blue-500"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      El rol que quieres obtener
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Photo Upload */}
              <Card className="bg-white shadow-sm border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Upload className="h-5 w-5 text-purple-600" />
                    Foto de Perfil
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ImageUpload
                    currentImage={cvData?.personalInfo?.profileImage}
                    onImageUpload={uploadProfileImage}
                    onImageRemove={() => updateProfileAvatar(null)}
                  />
                </CardContent>
              </Card>

              {/* Personal Information */}
              <Card className="bg-white shadow-sm border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="h-5 w-5 text-green-600" />
                    Información Personal
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Disclaimer Alert */}
                  <Alert className="border-amber-200 bg-amber-50">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-800">
                      <strong>Importante:</strong> Los cambios que realices en
                      la información personal se sincronizarán automáticamente
                      con tu perfil de usuario. Esto significa que cualquier
                      modificación aquí actualizará también los datos de tu
                      perfil principal.
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="firstName"
                        className="text-sm font-medium text-gray-700 mb-2 block"
                      >
                        Nombre
                      </Label>
                      <Input
                        id="firstName"
                        value={localFormData.personalInfo.firstName}
                        onChange={(e) =>
                          handlePersonalInfoChange("firstName", e.target.value)
                        }
                        placeholder="Tu nombre"
                        className="h-12 border-gray-200 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="lastName"
                        className="text-sm font-medium text-gray-700 mb-2 block"
                      >
                        Apellido
                      </Label>
                      <Input
                        id="lastName"
                        value={localFormData.personalInfo.lastName}
                        onChange={(e) =>
                          handlePersonalInfoChange("lastName", e.target.value)
                        }
                        placeholder="Tu apellido"
                        className="h-12 border-gray-200 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <Label
                      htmlFor="email"
                      className="text-sm font-medium text-gray-700 mb-2 block"
                    >
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={localFormData.personalInfo.email}
                      onChange={(e) =>
                        handlePersonalInfoChange("email", e.target.value)
                      }
                      placeholder="tu@email.com"
                      className="h-12 border-gray-200 focus:border-blue-500"
                      pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Ingresa un email válido
                    </p>
                  </div>

                  <div>
                    <Label
                      htmlFor="phone"
                      className="text-sm font-medium text-gray-700 mb-2 block"
                    >
                      Teléfono
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={localFormData.personalInfo.phone}
                      onChange={(e) =>
                        handlePersonalInfoChange("phone", e.target.value)
                      }
                      placeholder="+591 70012345"
                      className="h-12 border-gray-200 focus:border-blue-500"
                      maxLength={20}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Solo números, +, -, espacios y paréntesis
                    </p>
                  </div>

                  <div>
                    <Label
                      htmlFor="addressLine"
                      className="text-sm font-medium text-gray-700 mb-2 block"
                    >
                      Dirección
                    </Label>
                    <Input
                      id="addressLine"
                      value={localFormData.personalInfo.addressLine}
                      onChange={(e) =>
                        handlePersonalInfoChange("addressLine", e.target.value)
                      }
                      placeholder="Av. Principal 123"
                      className="h-12 border-gray-200 focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label
                        htmlFor="city"
                        className="text-sm font-medium text-gray-700 mb-2 block"
                      >
                        Ciudad
                      </Label>
                      <Input
                        id="city"
                        value={localFormData.personalInfo.city}
                        onChange={(e) =>
                          handlePersonalInfoChange("city", e.target.value)
                        }
                        placeholder="La Paz"
                        className="h-12 border-gray-200 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="state"
                        className="text-sm font-medium text-gray-700 mb-2 block"
                      >
                        Estado
                      </Label>
                      <Input
                        id="state"
                        value={localFormData.personalInfo.state}
                        onChange={(e) =>
                          handlePersonalInfoChange("state", e.target.value)
                        }
                        placeholder="La Paz"
                        className="h-12 border-gray-200 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="country"
                        className="text-sm font-medium text-gray-700 mb-2 block"
                      >
                        País
                      </Label>
                      <Input
                        id="country"
                        value={localFormData.personalInfo.country}
                        onChange={(e) =>
                          handlePersonalInfoChange("country", e.target.value)
                        }
                        placeholder="Bolivia"
                        className="h-12 border-gray-200 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Resumen Profesional - Siempre visible */}
            <Card className="bg-white shadow-sm border-0">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5 text-indigo-600" />
                  Resumen Profesional
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label
                    htmlFor="professionalSummary"
                    className="text-sm font-medium text-gray-700 mb-2 block"
                  >
                    Descripción Profesional
                  </Label>
                  <Textarea
                    id="professionalSummary"
                    value={localFormData.professionalSummary}
                    onChange={(e) =>
                      handleProfessionalSummaryChange(e.target.value)
                    }
                    placeholder="Joven profesional con sólidos conocimientos en desarrollo web y tecnologías modernas. Comprometido con el aprendizaje continuo y el desarrollo de soluciones innovadoras."
                    rows={4}
                    className="resize-none border-gray-200 focus:border-blue-500"
                    maxLength={500}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-sm text-gray-500">
                      Escribe 2-4 oraciones cortas y enérgicas sobre lo genial
                      que eres. Menciona el rol y lo que hiciste.
                    </p>
                    <p className="text-xs text-gray-400">
                      {localFormData.professionalSummary.length}/500
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Secciones Colapsables */}
            {/* Educación */}
            <Card>
              <CardHeader
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleSection("education")}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Educación
                  </CardTitle>
                  {collapsedSections.education ? (
                    <ChevronRight className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </div>
              </CardHeader>
              {!collapsedSections.education && (
                <CardContent className="space-y-6">
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                    <p className="text-sm text-indigo-800">
                      <strong>💡 Consejo:</strong> Incluye tu educación más
                      relevante. Si estás estudiando, marca "En curso" y deja la
                      fecha de fin vacía. Incluye logros académicos importantes.
                    </p>
                  </div>
                  {/* Información Básica */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="level">Nivel Educativo</Label>
                      <Select
                        value={localFormData.education.level}
                        onValueChange={(value) =>
                          handleEducationFieldChange("level", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona el nivel" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PRIMARY">Primaria</SelectItem>
                          <SelectItem value="SECONDARY">Secundaria</SelectItem>
                          <SelectItem value="TECHNICAL">Técnico</SelectItem>
                          <SelectItem value="UNIVERSITY">
                            Universidad
                          </SelectItem>
                          <SelectItem value="POSTGRADUATE">
                            Postgrado
                          </SelectItem>
                          <SelectItem value="OTHER">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="currentInstitution">
                        Institución Actual
                      </Label>
                      <Input
                        id="currentInstitution"
                        value={localFormData.education.currentInstitution}
                        onChange={(e) =>
                          handleEducationFieldChange(
                            "currentInstitution",
                            e.target.value
                          )
                        }
                        placeholder="Colegio San José"
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="graduationYear"
                        className="text-sm font-medium text-gray-700 mb-2 block"
                      >
                        Año de Graduación
                      </Label>
                      <Input
                        id="graduationYear"
                        type="number"
                        value={
                          localFormData.education.graduationYear?.toString() ||
                          ""
                        }
                        onChange={(e) => {
                          const value = e.target.value;
                          const numericValue =
                            value === "" ? null : parseInt(value);
                          handleEducationFieldChange(
                            "graduationYear",
                            numericValue
                          );
                        }}
                        placeholder="2023"
                        min="1950"
                        max="2030"
                        className="h-12 border-gray-200 focus:border-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Año entre 1950 y 2030
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="isStudying">Estado de Estudio</Label>
                      <Select
                        value={
                          localFormData.education.isStudying ? "true" : "false"
                        }
                        onValueChange={(value) =>
                          handleEducationFieldChange(
                            "isStudying",
                            value === "true"
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Estado de estudio" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">
                            Estudiando actualmente
                          </SelectItem>
                          <SelectItem value="false">Graduado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Información Universitaria */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-4">
                      Información Universitaria
                    </h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="currentDegree">Grado Actual</Label>
                        <Input
                          id="currentDegree"
                          value={localFormData.education.currentDegree}
                          onChange={(e) =>
                            handleEducationFieldChange(
                              "currentDegree",
                              e.target.value
                            )
                          }
                          placeholder="Ingeniería en Sistemas"
                        />
                      </div>

                      <div>
                        <Label htmlFor="universityName">
                          Nombre de la Universidad
                        </Label>
                        <Input
                          id="universityName"
                          value={localFormData.education.universityName}
                          onChange={(e) =>
                            handleEducationFieldChange(
                              "universityName",
                              e.target.value
                            )
                          }
                          placeholder="Universidad de La Paz"
                        />
                      </div>

                      <div>
                        <Label
                          htmlFor="universityStartDate"
                          className="text-sm font-medium text-gray-700 mb-2 block"
                        >
                          Fecha de Inicio
                        </Label>
                        <Input
                          id="universityStartDate"
                          type="month"
                          value={localFormData.education.universityStartDate}
                          onChange={(e) =>
                            handleEducationFieldChange(
                              "universityStartDate",
                              e.target.value
                            )
                          }
                          className="h-12 border-gray-200 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <Label
                          htmlFor="universityEndDate"
                          className="text-sm font-medium text-gray-700 mb-2 block"
                        >
                          Fecha de Fin (opcional)
                        </Label>
                        <Input
                          id="universityEndDate"
                          type="month"
                          value={localFormData.education.universityEndDate}
                          onChange={(e) =>
                            handleEducationFieldChange(
                              "universityEndDate",
                              e.target.value
                            )
                          }
                          className="h-12 border-gray-200 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <Label htmlFor="universityStatus">
                          Estado Universitario
                        </Label>
                        <Select
                          value={localFormData.education.universityStatus}
                          onValueChange={(value) =>
                            handleEducationFieldChange(
                              "universityStatus",
                              value
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Estado universitario" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Estudiante">
                              Estudiante
                            </SelectItem>
                            <SelectItem value="Graduado">Graduado</SelectItem>
                            <SelectItem value="Egresado">Egresado</SelectItem>
                            <SelectItem value="Truncado">Truncado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Historial Educativo */}
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">Historial Educativo</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addEducationHistory}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Educación
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {localFormData.education.educationHistory?.map(
                        (item, index) => (
                          <div
                            key={index}
                            className="border rounded-lg p-4 space-y-3"
                          >
                            <div className="flex justify-between items-start">
                              <h5 className="font-medium">
                                Educación {index + 1}
                              </h5>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeEducationHistory(index)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                              <div>
                                <Label htmlFor={`institution-${index}`}>
                                  Institución
                                </Label>
                                <Input
                                  id={`institution-${index}`}
                                  value={item.institution || ""}
                                  onChange={(e) =>
                                    handleEducationHistoryChange(
                                      index,
                                      "institution",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Nombre de la institución"
                                />
                              </div>
                              <div>
                                <Label htmlFor={`degree-${index}`}>
                                  Grado/Título
                                </Label>
                                <Input
                                  id={`degree-${index}`}
                                  value={item.degree || ""}
                                  onChange={(e) =>
                                    handleEducationHistoryChange(
                                      index,
                                      "degree",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Bachillerato, Licenciatura, etc."
                                />
                              </div>
                              <div>
                                <Label htmlFor={`startDate-${index}`}>
                                  Fecha de Inicio
                                </Label>
                                <Input
                                  id={`startDate-${index}`}
                                  type="month"
                                  value={item.startDate || ""}
                                  onChange={(e) =>
                                    handleEducationHistoryChange(
                                      index,
                                      "startDate",
                                      e.target.value
                                    )
                                  }
                                />
                              </div>
                              <div>
                                <Label htmlFor={`endDate-${index}`}>
                                  Fecha de Fin
                                </Label>
                                <Input
                                  id={`endDate-${index}`}
                                  type="month"
                                  value={item.endDate || ""}
                                  onChange={(e) =>
                                    handleEducationHistoryChange(
                                      index,
                                      "endDate",
                                      e.target.value
                                    )
                                  }
                                />
                              </div>
                              <div>
                                <Label htmlFor={`status-${index}`}>
                                  Estado
                                </Label>
                                <Select
                                  value={item.status || ""}
                                  onValueChange={(value) =>
                                    handleEducationHistoryChange(
                                      index,
                                      "status",
                                      value
                                    )
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Estado" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Graduado">
                                      Graduado
                                    </SelectItem>
                                    <SelectItem value="Estudiante">
                                      Estudiante
                                    </SelectItem>
                                    <SelectItem value="Egresado">
                                      Egresado
                                    </SelectItem>
                                    <SelectItem value="Truncado">
                                      Truncado
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {/* Logros Académicos */}
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">Logros Académicos</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addAcademicAchievement}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Logro
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {localFormData.education.academicAchievements?.map(
                        (achievement, index) => (
                          <div
                            key={index}
                            className="border rounded-lg p-4 space-y-3"
                          >
                            <div className="flex justify-between items-start">
                              <h5 className="font-medium">Logro {index + 1}</h5>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeAcademicAchievement(index)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                              <div>
                                <Label htmlFor={`achievementTitle-${index}`}>
                                  Título del Logro
                                </Label>
                                <Input
                                  id={`achievementTitle-${index}`}
                                  value={achievement.title || ""}
                                  onChange={(e) =>
                                    handleAcademicAchievementChange(
                                      index,
                                      "title",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Primer lugar en Hackathon"
                                />
                              </div>
                              <div>
                                <Label htmlFor={`achievementDate-${index}`}>
                                  Fecha
                                </Label>
                                <Input
                                  id={`achievementDate-${index}`}
                                  type="month"
                                  value={achievement.date || ""}
                                  onChange={(e) =>
                                    handleAcademicAchievementChange(
                                      index,
                                      "date",
                                      e.target.value
                                    )
                                  }
                                />
                              </div>
                              <div>
                                <Label htmlFor={`achievementType-${index}`}>
                                  Tipo
                                </Label>
                                <Select
                                  value={achievement.type || ""}
                                  onValueChange={(value) =>
                                    handleAcademicAchievementChange(
                                      index,
                                      "type",
                                      value
                                    )
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Tipo de logro" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="honor">Honor</SelectItem>
                                    <SelectItem value="award">
                                      Premio
                                    </SelectItem>
                                    <SelectItem value="certification">
                                      Certificación
                                    </SelectItem>
                                    <SelectItem value="scholarship">
                                      Beca
                                    </SelectItem>
                                    <SelectItem value="publication">
                                      Publicación
                                    </SelectItem>
                                    <SelectItem value="other">Otro</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <div>
                              <Label
                                htmlFor={`achievementDescription-${index}`}
                              >
                                Descripción
                              </Label>
                              <Textarea
                                id={`achievementDescription-${index}`}
                                value={achievement.description || ""}
                                onChange={(e) =>
                                  handleAcademicAchievementChange(
                                    index,
                                    "description",
                                    e.target.value
                                  )
                                }
                                placeholder="Descripción detallada del logro académico"
                                rows={3}
                              />
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Idiomas */}
            <Card>
              <CardHeader
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleSection("languages")}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Idiomas
                  </CardTitle>
                  {collapsedSections.languages ? (
                    <ChevronRight className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </div>
              </CardHeader>
              {!collapsedSections.languages && (
                <CardContent className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      <strong>💡 Consejo:</strong> Incluye solo los idiomas que
                      realmente dominas. Es mejor tener pocos idiomas con
                      niveles altos que muchos con niveles básicos.
                    </p>
                  </div>

                  {localFormData.languages?.length === 0 && (
                    <div className="text-center py-6 text-gray-500">
                      <Languages className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No has agregado ningún idioma aún</p>
                      <p className="text-sm">
                        Haz clic en "Agregar Idioma" para comenzar
                      </p>
                    </div>
                  )}

                  {localFormData.languages?.map((language, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">Idioma {index + 1}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLanguage(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor={`languageName-${index}`}>
                            Idioma
                          </Label>
                          <Input
                            id={`languageName-${index}`}
                            value={language.name || ""}
                            onChange={(e) =>
                              handleLanguageChange(
                                index,
                                "name",
                                e.target.value
                              )
                            }
                            placeholder="Español"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`languageProficiency-${index}`}>
                            Nivel
                          </Label>
                          <Select
                            value={language.proficiency || ""}
                            onValueChange={(value) =>
                              handleLanguageChange(index, "proficiency", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona nivel" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Native speaker">
                                Hablante nativo
                              </SelectItem>
                              <SelectItem value="Highly proficient">
                                Altamente competente
                              </SelectItem>
                              <SelectItem value="Proficient">
                                Competente
                              </SelectItem>
                              <SelectItem value="Intermediate">
                                Intermedio
                              </SelectItem>
                              <SelectItem value="Basic">Básico</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    onClick={addLanguage}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Idioma
                  </Button>
                </CardContent>
              )}
            </Card>

            {/* Enlaces Sociales */}
            <Card>
              <CardHeader
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleSection("socialLinks")}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Enlaces Web y Redes Sociales
                  </CardTitle>
                  {collapsedSections.socialLinks ? (
                    <ChevronRight className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </div>
              </CardHeader>
              {!collapsedSections.socialLinks && (
                <CardContent className="space-y-4">
                  {localFormData.socialLinks?.map((link, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">Enlace {index + 1}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSocialLink(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor={`platform-${index}`}>
                            Plataforma
                          </Label>
                          <Select
                            value={link.platform || ""}
                            onValueChange={(value) =>
                              handleSocialLinkChange(index, "platform", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona plataforma" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                              <SelectItem value="GitHub">GitHub</SelectItem>
                              <SelectItem value="Portfolio">
                                Portfolio
                              </SelectItem>
                              <SelectItem value="Website">Sitio Web</SelectItem>
                              <SelectItem value="Twitter">Twitter</SelectItem>
                              <SelectItem value="Instagram">
                                Instagram
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor={`url-${index}`}>URL</Label>
                          <Input
                            id={`url-${index}`}
                            value={link.url || ""}
                            onChange={(e) =>
                              handleSocialLinkChange(
                                index,
                                "url",
                                e.target.value
                              )
                            }
                            placeholder="https://..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    onClick={addSocialLink}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Enlace
                  </Button>
                </CardContent>
              )}
            </Card>

            {/* Experiencia Laboral */}
            <Card>
              <CardHeader
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleSection("workExperience")}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Experiencia Laboral
                  </CardTitle>
                  {collapsedSections.workExperience ? (
                    <ChevronRight className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </div>
              </CardHeader>
              {!collapsedSections.workExperience && (
                <CardContent className="space-y-4">
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <p className="text-sm text-purple-800">
                      <strong>💡 Consejo:</strong> Incluye trabajos, pasantías,
                      voluntariados o proyectos relevantes. Describe tus logros
                      con números cuando sea posible: "Aumenté las ventas en
                      20%".
                    </p>
                  </div>
                  {localFormData.workExperience?.map((experience, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">Experiencia {index + 1}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeWorkExperience(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor={`jobTitle-${index}`}>Puesto</Label>
                          <Input
                            id={`jobTitle-${index}`}
                            value={experience.jobTitle || ""}
                            onChange={(e) =>
                              handleWorkExperienceChange(
                                index,
                                "jobTitle",
                                e.target.value
                              )
                            }
                            placeholder="Desarrollador Frontend"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`company-${index}`}>Empresa</Label>
                          <Input
                            id={`company-${index}`}
                            value={experience.company || ""}
                            onChange={(e) =>
                              handleWorkExperienceChange(
                                index,
                                "company",
                                e.target.value
                              )
                            }
                            placeholder="TechCorp Bolivia"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor={`startDate-${index}`}>
                            Fecha de Inicio
                          </Label>
                          <Input
                            id={`startDate-${index}`}
                            type="month"
                            value={experience.startDate || ""}
                            onChange={(e) =>
                              handleWorkExperienceChange(
                                index,
                                "startDate",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor={`endDate-${index}`}>
                            Fecha de Fin
                          </Label>
                          <Input
                            id={`endDate-${index}`}
                            type="month"
                            value={experience.endDate || ""}
                            onChange={(e) =>
                              handleWorkExperienceChange(
                                index,
                                "endDate",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor={`description-${index}`}>
                          Descripción
                        </Label>
                        <Textarea
                          id={`description-${index}`}
                          value={experience.description || ""}
                          onChange={(e) =>
                            handleWorkExperienceChange(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                          placeholder="Desarrollo de interfaces de usuario con React y JavaScript."
                          rows={3}
                        />
                      </div>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    onClick={addWorkExperience}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Experiencia Laboral
                  </Button>
                </CardContent>
              )}
            </Card>

            {/* Proyectos */}
            <Card>
              <CardHeader
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleSection("projects")}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Proyectos
                  </CardTitle>
                  {collapsedSections.projects ? (
                    <ChevronRight className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </div>
              </CardHeader>
              {!collapsedSections.projects && (
                <CardContent className="space-y-4">
                  {localFormData.projects?.map((project, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">Proyecto {index + 1}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeProject(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor={`projectTitle-${index}`}>
                            Título del Proyecto
                          </Label>
                          <Input
                            id={`projectTitle-${index}`}
                            value={project.title || ""}
                            onChange={(e) =>
                              handleProjectChange(
                                index,
                                "title",
                                e.target.value
                              )
                            }
                            placeholder="ACTUARIUS Mobile Application"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`projectLocation-${index}`}>
                            Ubicación
                          </Label>
                          <Input
                            id={`projectLocation-${index}`}
                            value={project.location || ""}
                            onChange={(e) =>
                              handleProjectChange(
                                index,
                                "location",
                                e.target.value
                              )
                            }
                            placeholder="Querétaro"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor={`projectStartDate-${index}`}>
                            Fecha de Inicio
                          </Label>
                          <Input
                            id={`projectStartDate-${index}`}
                            type="month"
                            value={project.startDate || ""}
                            onChange={(e) =>
                              handleProjectChange(
                                index,
                                "startDate",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor={`projectEndDate-${index}`}>
                            Fecha de Fin
                          </Label>
                          <Input
                            id={`projectEndDate-${index}`}
                            type="month"
                            value={project.endDate || ""}
                            onChange={(e) =>
                              handleProjectChange(
                                index,
                                "endDate",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor={`projectDescription-${index}`}>
                          Descripción
                        </Label>
                        <Textarea
                          id={`projectDescription-${index}`}
                          value={project.description || ""}
                          onChange={(e) =>
                            handleProjectChange(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                          placeholder="Desarrollo de aplicación móvil para gestión de seguros."
                          rows={3}
                        />
                      </div>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    onClick={addProject}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Proyecto
                  </Button>
                </CardContent>
              )}
            </Card>

            {/* Habilidades */}
            <Card>
              <CardHeader
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleSection("skills")}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Habilidades
                  </CardTitle>
                  {collapsedSections.skills ? (
                    <ChevronRight className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </div>
              </CardHeader>
              {!collapsedSections.skills && (
                <CardContent className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-800">
                      <strong>💡 Consejo:</strong> Incluye habilidades técnicas
                      y blandas relevantes para tu campo. Sé específico: en
                      lugar de "computación", escribe "Microsoft Excel" o
                      "Python".
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Nueva habilidad"
                      onKeyPress={(e) => e.key === "Enter" && addSkill()}
                    />
                    <Button onClick={addSkill} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {localFormData.skills?.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="gap-1">
                        {skill.name}
                        {skill.experienceLevel && (
                          <span className="text-xs">
                            ({skill.experienceLevel})
                          </span>
                        )}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeSkill(skill.name)}
                        />
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Actividades Extracurriculares */}
            <Card>
              <CardHeader
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleSection("activities")}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Actividades Extracurriculares
                  </CardTitle>
                  {collapsedSections.activities ? (
                    <ChevronRight className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </div>
              </CardHeader>
              {!collapsedSections.activities && (
                <CardContent className="space-y-4">
                  <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
                    <p className="text-sm text-teal-800">
                      <strong>💡 Consejo:</strong> Incluye voluntariados,
                      clubes, organizaciones estudiantiles, deportes o cualquier
                      actividad que demuestre tus habilidades de liderazgo y
                      trabajo en equipo.
                    </p>
                  </div>

                  {localFormData.activities?.map((activity, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">Actividad {index + 1}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeActivity(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor={`activityTitle-${index}`}>
                            Título de la Actividad
                          </Label>
                          <Input
                            id={`activityTitle-${index}`}
                            value={activity.title || ""}
                            onChange={(e) =>
                              handleActivityChange(
                                index,
                                "title",
                                e.target.value
                              )
                            }
                            placeholder="Voluntario en ONG"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`activityOrganization-${index}`}>
                            Organización
                          </Label>
                          <Input
                            id={`activityOrganization-${index}`}
                            value={activity.organization || ""}
                            onChange={(e) =>
                              handleActivityChange(
                                index,
                                "organization",
                                e.target.value
                              )
                            }
                            placeholder="Nombre de la organización"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor={`activityStartDate-${index}`}>
                            Fecha de Inicio
                          </Label>
                          <Input
                            id={`activityStartDate-${index}`}
                            type="month"
                            value={activity.startDate || ""}
                            onChange={(e) =>
                              handleActivityChange(
                                index,
                                "startDate",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor={`activityEndDate-${index}`}>
                            Fecha de Fin
                          </Label>
                          <Input
                            id={`activityEndDate-${index}`}
                            type="month"
                            value={activity.endDate || ""}
                            onChange={(e) =>
                              handleActivityChange(
                                index,
                                "endDate",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor={`activityDescription-${index}`}>
                          Descripción
                        </Label>
                        <Textarea
                          id={`activityDescription-${index}`}
                          value={activity.description || ""}
                          onChange={(e) =>
                            handleActivityChange(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                          placeholder="Describe tu rol y logros en esta actividad"
                          rows={3}
                        />
                      </div>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    onClick={addActivity}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Actividad
                  </Button>
                </CardContent>
              )}
            </Card>

            {/* Intereses */}
            <Card>
              <CardHeader
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleSection("interests")}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Intereses
                  </CardTitle>
                  {collapsedSections.interests ? (
                    <ChevronRight className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </div>
              </CardHeader>
              {!collapsedSections.interests && (
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={newInterest}
                      onChange={(e) => setNewInterest(e.target.value)}
                      placeholder="Nuevo interés"
                      onKeyPress={(e) => e.key === "Enter" && addInterest()}
                    />
                    <Button onClick={addInterest} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {localFormData.interests?.map((interest, index) => (
                      <Badge key={index} variant="outline" className="gap-1">
                        {interest}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeInterest(interest)}
                        />
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Logros Generales */}
            <Card>
              <CardHeader
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleSection("achievements")}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Logros Generales
                  </CardTitle>
                  {collapsedSections.achievements ? (
                    <ChevronRight className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </div>
              </CardHeader>
              {!collapsedSections.achievements && (
                <CardContent className="space-y-4">
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <p className="text-sm text-orange-800">
                      <strong>💡 Consejo:</strong> Incluye logros profesionales,
                      premios, reconocimientos o certificaciones relevantes para
                      tu carrera.
                    </p>
                  </div>

                  {localFormData.achievements?.map((achievement, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">Logro {index + 1}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeGeneralAchievement(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor={`generalAchievementTitle-${index}`}>
                            Título del Logro
                          </Label>
                          <Input
                            id={`generalAchievementTitle-${index}`}
                            value={achievement.title || ""}
                            onChange={(e) =>
                              handleGeneralAchievementChange(
                                index,
                                "title",
                                e.target.value
                              )
                            }
                            placeholder="Premio al Mejor Proyecto"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`generalAchievementDate-${index}`}>
                            Fecha
                          </Label>
                          <Input
                            id={`generalAchievementDate-${index}`}
                            type="month"
                            value={achievement.date || ""}
                            onChange={(e) =>
                              handleGeneralAchievementChange(
                                index,
                                "date",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>

                      <div>
                        <Label
                          htmlFor={`generalAchievementDescription-${index}`}
                        >
                          Descripción
                        </Label>
                        <Textarea
                          id={`generalAchievementDescription-${index}`}
                          value={achievement.description || ""}
                          onChange={(e) =>
                            handleGeneralAchievementChange(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                          placeholder="Descripción detallada del logro"
                          rows={3}
                        />
                      </div>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    onClick={addGeneralAchievement}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Logro
                  </Button>
                </CardContent>
              )}
            </Card>

            {/* Objetivos Profesionales */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-indigo-600" />
                  Objetivos Profesionales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                  <p className="text-sm text-indigo-800">
                    <strong>💡 Consejo:</strong> Especifica tu posición objetivo
                    y empresa ideal para personalizar mejor tu CV y carta de
                    presentación.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="targetPosition">Posición Objetivo</Label>
                    <Input
                      id="targetPosition"
                      value={localFormData.targetPosition}
                      onChange={(e) => {
                        setLocalFormData((prev) => ({
                          ...prev,
                          targetPosition: e.target.value,
                        }));
                        setHasUnsavedChanges(true);
                      }}
                      placeholder="Desarrollador Frontend Senior"
                      className="h-12 border-gray-200 focus:border-blue-500"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      El puesto específico que buscas
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="targetCompany">Empresa Objetivo</Label>
                    <Input
                      id="targetCompany"
                      value={localFormData.targetCompany}
                      onChange={(e) => {
                        setLocalFormData((prev) => ({
                          ...prev,
                          targetCompany: e.target.value,
                        }));
                        setHasUnsavedChanges(true);
                      }}
                      placeholder="Google, Microsoft, Startup local"
                      className="h-12 border-gray-200 focus:border-blue-500"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Empresa o tipo de empresa que te interesa
                    </p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="relevantSkills">
                    Habilidades Relevantes para el Puesto
                  </Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      id="relevantSkills"
                      value={newRelevantSkill}
                      onChange={(e) => setNewRelevantSkill(e.target.value)}
                      placeholder="Nueva habilidad relevante"
                      onKeyPress={(e) =>
                        e.key === "Enter" && addRelevantSkill()
                      }
                      className="h-12 border-gray-200 focus:border-blue-500"
                    />
                    <Button onClick={addRelevantSkill} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Habilidades específicas requeridas para tu posición objetivo
                  </p>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {localFormData.relevantSkills?.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="gap-1">
                        {skill}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeRelevantSkill(skill)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent
            value="cv"
            className="space-y-6 print-content cv-template"
          >
            <CVTemplateSelector />
          </TabsContent>

          <TabsContent
            value="cover-letter"
            className="space-y-6 print-content cover-letter-template"
          >
            <CoverLetterTemplateSelector />
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card className="no-print">
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button
                variant="outline"
                className="gap-2"
                onClick={handlePrintCV}
              >
                <Printer className="h-4 w-4" />
                Imprimir CV
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                onClick={handlePrintCoverLetter}
              >
                <Printer className="h-4 w-4" />
                Imprimir Carta
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                onClick={handleDownloadCV}
              >
                <Download className="h-4 w-4" />
                Descargar CV PDF
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                onClick={handleDownloadCoverLetter}
              >
                <Download className="h-4 w-4" />
                Descargar Carta PDF
              </Button>
              <Button className="gap-2" onClick={handleDownloadAll}>
                <Download className="h-4 w-4" />
                Descargar Todo (ZIP)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
