import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  Save,
  Send,
  Check,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { useAuth } from "../context/AuthContext";
import { userApiService } from "../api/endpoints/user.api";
import { UpdateProfileRequest, UserProfile } from "../types/auth.types";
import { API_CONFIG, STORAGE_KEYS } from "../api/config";
import { toast } from "sonner";

const Settings: React.FC = () => {
  const { user, logout } = useAuth();

  // Form state
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    dateOfBirth: "",
    occupation: "",
  });

  // Load user profile on component mount
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setIsLoadingProfile(true);
        const profileResponse = await userApiService.getProfile();
        const profile = profileResponse.data; // Extract data from ApiResponse
        setUserProfile(profile);
        setFormData({
          firstName: profile.firstName || "",
          lastName: profile.lastName || "",
          phoneNumber: profile.phoneNumber || "",
          dateOfBirth: profile.dateOfBirth || "",
          occupation: profile.occupation || "",
        });
      } catch (error: any) {
        // Failed to load user profile
        toast.error("Failed to load profile");
        // Fall back to user data from auth context
        if (user) {
          const nameParts = user.name?.split(" ") || [];
          setFormData({
            firstName: nameParts[0] || "",
            lastName: nameParts.slice(1).join(" ") || "",
            phoneNumber: "",
            dateOfBirth: "",
            occupation: "",
          });
        }
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadUserProfile();
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveProfile = async () => {
    if (!user?.id) {
      toast.error("User not found");
      return;
    }

    setIsLoading(true);
    try {
      const updateData: UpdateProfileRequest = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        dateOfBirth: formData.dateOfBirth,
        occupation: formData.occupation,
      };

      await userApiService.updateProfile(updateData);
      toast.success("Profile updated successfully");
      setIsEditing(false);

      // Reload profile data
      const updatedProfileResponse = await userApiService.getProfile();
      setUserProfile(updatedProfileResponse.data);
    } catch (error: any) {
      // Profile update error
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendEmailOtp = async () => {
    if (!userEmail) {
      toast.error("Email not found");
      return;
    }

    setIsSendingOtp(true);
    try {
      // Call the email verification endpoint
      await fetch(`${API_CONFIG.BASE_URL}/Users/send-email-verification-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)}`,
        },
        body: JSON.stringify({ email: userEmail }),
      });

      toast.success("OTP sent to your email");
      setShowOtpInput(true);
    } catch (error: any) {
      // Send OTP error
      toast.error("Failed to send OTP");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!userEmail || !otp) {
      toast.error("Please enter the OTP");
      return;
    }

    setIsVerifyingEmail(true);
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/Users/verify-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)}`,
          },
          body: JSON.stringify({
            email: userEmail,
            otp: otp,
          }),
        }
      );

      if (response.ok) {
        toast.success("Email verified successfully");
        setShowOtpInput(false);
        setOtp("");
        // Reload profile data
        const updatedProfile = await userApiService.getProfile();
        setUserProfile(updatedProfile.data);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Invalid OTP");
      }
    } catch (error: any) {
      // Verify email error
      toast.error("Failed to verify email");
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Not provided";
    return new Date(dateString).toLocaleDateString("en-IN");
  };

  if (!user || isLoadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Use userProfile if available, otherwise fall back to user from auth context
  const displayUser = userProfile || user;
  const userEmail = userProfile?.email || user.email;
  const isEmailVerified = userProfile?.isEmailVerified || false;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link
              to="/dashboard"
              className="flex items-center justify-center w-10 h-10 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600">
                Manage your profile and account settings
              </p>
            </div>
          </div>
          <Button
            onClick={logout}
            variant="outline"
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Profile Information
                </h2>
                {!isEditing ? (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    size="sm"
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => setIsEditing(false)}
                      variant="outline"
                      size="sm"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveProfile}
                      disabled={isLoading}
                      size="sm"
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="h-4 w-4 inline mr-2" />
                    First Name
                  </label>
                  {isEditing ? (
                    <Input
                      value={formData.firstName}
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                      placeholder="Enter your first name"
                    />
                  ) : (
                    <p className="text-gray-900 py-2 px-3 bg-gray-50 rounded-md">
                      {formData.firstName || "Not provided"}
                    </p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="h-4 w-4 inline mr-2" />
                    Last Name
                  </label>
                  {isEditing ? (
                    <Input
                      value={formData.lastName}
                      onChange={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
                      placeholder="Enter your last name"
                    />
                  ) : (
                    <p className="text-gray-900 py-2 px-3 bg-gray-50 rounded-md">
                      {formData.lastName || "Not provided"}
                    </p>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="h-4 w-4 inline mr-2" />
                    Phone Number
                  </label>
                  {isEditing ? (
                    <Input
                      value={formData.phoneNumber}
                      onChange={(e) =>
                        handleInputChange("phoneNumber", e.target.value)
                      }
                      placeholder="Enter your phone number"
                    />
                  ) : (
                    <p className="text-gray-900 py-2 px-3 bg-gray-50 rounded-md">
                      {formData.phoneNumber || "Not provided"}
                    </p>
                  )}
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="h-4 w-4 inline mr-2" />
                    Date of Birth
                  </label>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) =>
                        handleInputChange("dateOfBirth", e.target.value)
                      }
                    />
                  ) : (
                    <p className="text-gray-900 py-2 px-3 bg-gray-50 rounded-md">
                      {formatDate(formData.dateOfBirth)}
                    </p>
                  )}
                </div>

                {/* Occupation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Briefcase className="h-4 w-4 inline mr-2" />
                    Occupation
                  </label>
                  {isEditing ? (
                    <Input
                      value={formData.occupation}
                      onChange={(e) =>
                        handleInputChange("occupation", e.target.value)
                      }
                      placeholder="Enter your occupation"
                    />
                  ) : (
                    <p className="text-gray-900 py-2 px-3 bg-gray-50 rounded-md">
                      {formData.occupation || "Not provided"}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Account Status */}
          <div className="space-y-6">
            {/* Email Verification */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Email Verification
              </h3>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Email Address</p>
                    <p className="font-medium text-gray-900">{userEmail}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {isEmailVerified ? (
                    <div className="flex items-center text-green-600">
                      <Check className="h-5 w-5 mr-2" />
                      <span className="text-sm font-medium">Verified</span>
                    </div>
                  ) : (
                    <div className="w-full">
                      <div className="text-yellow-600 text-sm font-medium mb-3">
                        Email not verified
                      </div>

                      {!showOtpInput ? (
                        <Button
                          onClick={handleSendEmailOtp}
                          disabled={isSendingOtp}
                          size="sm"
                          className="w-full"
                        >
                          {isSendingOtp ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          ) : (
                            <Send className="h-4 w-4 mr-2" />
                          )}
                          Send Verification OTP
                        </Button>
                      ) : (
                        <div className="space-y-3">
                          <Input
                            type="text"
                            placeholder="Enter OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            maxLength={6}
                          />
                          <div className="flex space-x-2">
                            <Button
                              onClick={handleVerifyEmail}
                              disabled={isVerifyingEmail || !otp}
                              size="sm"
                              className="flex-1"
                            >
                              {isVerifyingEmail ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              ) : (
                                <Check className="h-4 w-4 mr-2" />
                              )}
                              Verify
                            </Button>
                            <Button
                              onClick={() => {
                                setShowOtpInput(false);
                                setOtp("");
                              }}
                              variant="outline"
                              size="sm"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Account Info */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Account Information
              </h3>

              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-gray-600">User ID</p>
                  <p className="font-mono text-gray-900 break-all">
                    {displayUser.id}
                  </p>
                </div>

                <div>
                  <p className="text-gray-600">Member Since</p>
                  <p className="text-gray-900">
                    {formatDate(userProfile?.createdAt)}
                  </p>
                </div>

                <div>
                  <p className="text-gray-600">Last Login</p>
                  <p className="text-gray-900">
                    {formatDate(userProfile?.lastLoginAt)}
                  </p>
                </div>

                <div>
                  <p className="text-gray-600">Currency</p>
                  <p className="text-gray-900">
                    {userProfile?.currency || user.currency}
                  </p>
                </div>

                <div>
                  <p className="text-gray-600">Timezone</p>
                  <p className="text-gray-900">
                    {userProfile?.timezone || "Asia/Kolkata"}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
