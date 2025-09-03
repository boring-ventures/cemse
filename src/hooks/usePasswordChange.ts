import { useState } from "react";

interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}

interface PasswordChangeResponse {
  message: string;
}

export function usePasswordChange() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const changePassword = async (data: PasswordChangeRequest): Promise<void> => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to change password");
      }

      const result: PasswordChangeResponse = await response.json();
      setSuccess(result.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setError(null);
    setSuccess(null);
  };

  return {
    changePassword,
    loading,
    error,
    success,
    reset,
  };
}
