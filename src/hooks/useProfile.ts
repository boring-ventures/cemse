import { useState, useEffect, useCallback } from "react";
import { useAuthContext } from "./use-auth";

export interface ProfileData {
  id: string;
  userId: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  municipality: string | null;
  department: string | null;
  country: string | null;
  birthDate: string | null;
  gender: string | null;
  documentType: string | null;
  documentNumber: string | null;
  educationLevel: string | null;
  currentInstitution: string | null;
  graduationYear: number | null;
  isStudying: boolean | null;
  currentDegree: string | null;
  universityName: string | null;
  universityStartDate: string | null;
  universityEndDate: string | null;
  universityStatus: string | null;
  gpa: number | null;
  skills: string[];
  interests: string[];
  workExperience: any;
  companyName: string | null;
  businessSector: string | null;
  companySize: string | null;
  companyDescription: string | null;
  website: string | null;
  foundedYear: number | null;
  institutionName: string | null;
  institutionType: string | null;
  serviceArea: string | null;
  specialization: string[];
  institutionDescription: string | null;
  avatarUrl: string | null;
  profileCompletion: number;
  bio: string | null;
  jobTitle: string | null;
  addressLine: string | null;
  cityState: string | null;
  languages: any;
  websites: any;
  skillsWithLevel: any;
  extracurricularActivities: any;
  projects: any;
  achievements: any;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  municipality?: string;
  department?: string;
  country?: string;
  birthDate?: string;
  gender?: string;
  documentType?: string;
  documentNumber?: string;
  educationLevel?: string;
  currentInstitution?: string;
  graduationYear?: number;
  isStudying?: boolean;
  currentDegree?: string;
  universityName?: string;
  universityStartDate?: string;
  universityEndDate?: string;
  universityStatus?: string;
  gpa?: number;
  skills?: string[];
  interests?: string[];
  workExperience?: any;
  companyName?: string;
  businessSector?: string;
  companySize?: string;
  companyDescription?: string;
  website?: string;
  foundedYear?: number;
  institutionName?: string;
  institutionType?: string;
  serviceArea?: string;
  specialization?: string[];
  institutionDescription?: string;
  bio?: string;
  jobTitle?: string;
  addressLine?: string;
  cityState?: string;
  languages?: any;
  websites?: any;
  skillsWithLevel?: any;
  extracurricularActivities?: any;
  projects?: any;
  achievements?: any;
}

export function useProfile() {
  const { user, isAuthenticated } = useAuthContext();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/profile", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch profile: ${response.statusText}`);
      }

      const data = await response.json();
      setProfile(data);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const updateProfile = useCallback(
    async (updateData: UpdateProfileData) => {
      if (!isAuthenticated || !user) {
        throw new Error("User not authenticated");
      }

      try {
        setUpdating(true);
        setError(null);

        const response = await fetch("/api/profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(updateData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error ||
              `Failed to update profile: ${response.statusText}`
          );
        }

        const data = await response.json();
        setProfile(data.profile);
        return data.profile;
      } catch (err) {
        console.error("Error updating profile:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update profile";
        setError(errorMessage);
        throw err;
      } finally {
        setUpdating(false);
      }
    },
    [isAuthenticated, user]
  );

  const uploadProfileImage = useCallback(
    async (file: File) => {
      if (!isAuthenticated || !user) {
        throw new Error("User not authenticated");
      }

      try {
        setUpdating(true);
        setError(null);

        const formData = new FormData();
        formData.append("image", file);

        console.log("🖼️ Uploading profile image:", {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
        });

        const response = await fetch("/api/files/upload/profile-image", {
          method: "POST",
          credentials: "include",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || `Failed to upload image: ${response.statusText}`
          );
        }

        const data = await response.json();

        // Update local profile state with new avatar URL
        if (profile) {
          setProfile({
            ...profile,
            avatarUrl: data.imageUrl,
          });
        }

        return data.imageUrl;
      } catch (err) {
        console.error("Error uploading profile image:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to upload image";
        setError(errorMessage);
        throw err;
      } finally {
        setUpdating(false);
      }
    },
    [isAuthenticated, user, profile]
  );

  const deleteProfileImage = useCallback(async () => {
    if (!isAuthenticated || !user) {
      throw new Error("User not authenticated");
    }

    try {
      setUpdating(true);
      setError(null);

      const response = await fetch("/api/profile/avatar", {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Failed to delete image: ${response.statusText}`
        );
      }

      // Update local profile state to remove avatar URL
      if (profile) {
        setProfile({
          ...profile,
          avatarUrl: null,
        });
      }

      return true;
    } catch (err) {
      console.error("Error deleting profile image:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete image";
      setError(errorMessage);
      throw err;
    } finally {
      setUpdating(false);
    }
  }, [isAuthenticated, user, profile]);

  const calculateProfileCompletion = useCallback(
    (profileData: ProfileData | null): number => {
      if (!profileData) return 0;

      const fields = [
        "firstName",
        "lastName",
        "phone",
        "address",
        "municipality",
        "birthDate",
        "gender",
        "educationLevel",
        "currentDegree",
        "skills",
        "interests",
        "avatarUrl",
      ];

      const completedFields = fields.filter((field) => {
        const value = profileData[field as keyof ProfileData];
        if (Array.isArray(value)) {
          return value.length > 0;
        }
        return value !== null && value !== undefined && value !== "";
      });

      return Math.round((completedFields.length / fields.length) * 100);
    },
    []
  );

  // Fetch profile on mount and when user changes
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    error,
    updating,
    updateProfile,
    uploadProfileImage,
    deleteProfileImage,
    refetch: fetchProfile,
    profileCompletion: calculateProfileCompletion(profile),
  };
}
