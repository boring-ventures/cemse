"use client";

import { useAuthContext } from "@/hooks/use-auth";
import { useCompanyProfile } from "@/hooks/useCompanyProfile";

export default function TestCompanyAuthPage() {
  const { user, loading: authLoading } = useAuthContext();
  const {
    profile,
    loading: profileLoading,
    error: profileError,
  } = useCompanyProfile();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Company Authentication Test</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Auth Context */}
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Auth Context</h2>
          <div className="space-y-2">
            <p>
              <strong>Loading:</strong> {authLoading ? "Yes" : "No"}
            </p>
            <p>
              <strong>User:</strong> {user ? "Present" : "None"}
            </p>
            {user && (
              <div className="space-y-1 text-sm">
                <p>
                  <strong>ID:</strong> {user.id}
                </p>
                <p>
                  <strong>Username:</strong> {user.username}
                </p>
                <p>
                  <strong>Role:</strong> {user.role}
                </p>
                <p>
                  <strong>Company:</strong> {user.company ? "Present" : "None"}
                </p>
                {user.company && (
                  <div className="ml-4 space-y-1">
                    <p>
                      <strong>Company ID:</strong> {user.company.id}
                    </p>
                    <p>
                      <strong>Company Name:</strong> {user.company.name}
                    </p>
                    <p>
                      <strong>Company Email:</strong> {user.company.email}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Company Profile Hook */}
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Company Profile Hook</h2>
          <div className="space-y-2">
            <p>
              <strong>Loading:</strong> {profileLoading ? "Yes" : "No"}
            </p>
            <p>
              <strong>Profile:</strong> {profile ? "Present" : "None"}
            </p>
            <p>
              <strong>Error:</strong>{" "}
              {profileError ? profileError.message : "None"}
            </p>
            {profile && (
              <div className="space-y-1 text-sm">
                <p>
                  <strong>ID:</strong> {profile.id}
                </p>
                <p>
                  <strong>Name:</strong> {profile.name}
                </p>
                <p>
                  <strong>Description:</strong> {profile.description || "None"}
                </p>
                <p>
                  <strong>Business Sector:</strong>{" "}
                  {profile.businessSector || "None"}
                </p>
                <p>
                  <strong>Company Size:</strong> {profile.companySize || "None"}
                </p>
                <p>
                  <strong>Email:</strong> {profile.email || "None"}
                </p>
                <p>
                  <strong>Phone:</strong> {profile.phone || "None"}
                </p>
                <p>
                  <strong>Address:</strong> {profile.address || "None"}
                </p>
                <p>
                  <strong>Tax ID:</strong> {profile.taxId || "None"}
                </p>
                <p>
                  <strong>Legal Representative:</strong>{" "}
                  {profile.legalRepresentative || "None"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Raw Data */}
      <div className="border rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4">Raw Data</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">User Object:</h3>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
          <div>
            <h3 className="font-medium">Profile Object:</h3>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
              {JSON.stringify(profile, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
