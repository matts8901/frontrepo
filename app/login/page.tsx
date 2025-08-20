"use client";
import React, { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import {
  LuMail,
  LuLock,
  LuShield,
  LuArrowRight,
  LuEye,
  LuEyeOff,
} from "react-icons/lu";
import { API } from "../config/Config";

const LoginInner = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [projectId, setProjectId] = useState<string>("");
  const [isProjectValid, setIsProjectValid] = useState<boolean | null>(null);
  const [authConfig, setAuthConfig] = useState<{ ep: boolean; eo: boolean }>({
    ep: false,
    eo: false,
  });
  const [isCheckingProject, setIsCheckingProject] = useState(false);
  const [authMethod, setAuthMethod] = useState<"password" | "otp">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState<
    "email" | "otp" | "newPassword"
  >("email");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{
    email: string;
    password: string;
    otp: string;
    newPassword: string;
    confirmPassword: string;
  }>({
    email: "",
    password: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [touched, setTouched] = useState<{
    email: boolean;
    password: boolean;
    otp: boolean;
    newPassword: boolean;
    confirmPassword: boolean;
  }>({
    email: false,
    password: false,
    otp: false,
    newPassword: false,
    confirmPassword: false,
  });

  // Project validation function
  const checkProject = async (projectId: string) => {
    try {
      const response = await fetch(`${API}/d/check`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId,
        }),
      });

      if (!response.ok) {
        throw new Error("Project check failed");
      }

      const data = await response.json();
      return {
        success: !!data.success,
        auth: data.auth || { ep: false, eo: false },
      };
    } catch (error) {
      console.error("Project check error:", error);
      return { success: false, auth: { ep: false, eo: false } };
    }
  };

  // Extract project ID from URL and validate
  useEffect(() => {
    const p = searchParams.get("p");
    if (p) {
      setProjectId(p);
      setIsCheckingProject(true);

      // Validate project
      checkProject(p).then((result) => {
        setIsProjectValid(result.success);
        setAuthConfig(result.auth);
        setIsCheckingProject(false);
      });
    } else {
      setIsProjectValid(false);
      setIsCheckingProject(false);
    }
  }, [searchParams]);

  // Keep auth method in sync with enabled methods from server
  useEffect(() => {
    if (isProjectValid !== true) return;
    const epEnabled = authConfig.ep;
    const eoEnabled = authConfig.eo;
    if (epEnabled && eoEnabled) return; // both allowed, keep user choice
    if (epEnabled && authMethod !== "password") setAuthMethod("password");
    if (eoEnabled && authMethod !== "otp") setAuthMethod("otp");
  }, [authConfig, isProjectValid]);

  // API Functions
  const loginWithPassword = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API}/d/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          method: "pass",
          projectId,
        }),
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const loginWithOtp = async (email: string, otp: string) => {
    try {
      const response = await fetch(`${API}/d/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otp,
          projectId,
          method: "otp",
        }),
      });

      if (!response.ok) {
        throw new Error("OTP verification failed");
      }

      const data = await response.json();
      sessionStorage.setItem("token", email);
      router.back();
      return data;
    } catch (error) {
      console.error("OTP login error:", error);
      throw error;
    }
  };

  const sendOtp = async (email: string) => {
    try {
      const response = await fetch(`${API}/d/sendotp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          projectId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send OTP");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Send OTP error:", error);
      throw error;
    }
  };

  const verifyOtp = async (email: string, otp: string) => {
    try {
      const response = await fetch(`${API}/d/verifyotp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otp,
          projectId,
          method: "otp",
        }),
      });

      if (!response.ok) {
        throw new Error("OTP verification failed");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Verify OTP error:", error);
      throw error;
    }
  };

  const resetPassword = async (
    email: string,
    otp: string,
    newPassword: string
  ) => {
    try {
      const response = await fetch(`${API}/d/resetpass`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otp,
          pass: newPassword,
        }),
      });

      if (!response.ok) {
        throw new Error("Password reset failed");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Reset password error:", error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      email: true,
      password: true,
      otp: true,
      newPassword: false,
      confirmPassword: false,
    });

    // Validate all fields
    const emailError = validateEmail(email);
    const passwordError =
      authMethod === "password" ? validatePassword(password) : "";
    const otpError = authMethod === "otp" ? validateOtp(otp) : "";

    setErrors({
      email: emailError,
      password: passwordError,
      otp: otpError,
      newPassword: "",
      confirmPassword: "",
    });

    // Check if there are any errors
    if (
      emailError ||
      (authMethod === "password" && passwordError) ||
      (authMethod === "otp" && otpError)
    ) {
      return;
    }

    setIsLoading(true);

    try {
      let result;
      if (authMethod === "password") {
        result = await loginWithPassword(email, password);
      } else {
        result = await loginWithOtp(email, otp);
      }

      // Redirect to referrer with callback param if available

      const refFromParam = searchParams.get("redirect");

      if (refFromParam) {
        console.log(refFromParam + "?r=" + result.id);
        window.location.assign(refFromParam + "?r=" + result.id);
      }

      // Fallback
      // router.back();
    } catch (error) {
      console.error("Login failed:", error);
      // Handle login error (show error message, etc.)
    } finally {
      setIsLoading(false);
    }
  };

  // Email validation function
  const validateEmail = (email: string): string => {
    if (!email) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return "";
  };

  // Password validation function
  const validatePassword = (password: string): string => {
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    return "";
  };

  // OTP validation function
  const validateOtp = (otp: string): string => {
    if (!otp) return "OTP is required";
    if (otp.length !== 6) return "OTP must be 6 digits";
    if (!/^\d{6}$/.test(otp)) return "OTP must contain only numbers";
    return "";
  };

  // New password validation function
  const validateNewPassword = (password: string): string => {
    if (!password) return "New password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    return "";
  };

  // Confirm password validation function
  const validateConfirmPassword = (
    password: string,
    confirmPassword: string
  ): string => {
    if (!confirmPassword) return "Please confirm your password";
    if (password !== confirmPassword) return "Passwords do not match";
    return "";
  };

  // Handle field blur
  const handleBlur = (
    field: "email" | "password" | "otp" | "newPassword" | "confirmPassword"
  ) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    let error = "";
    switch (field) {
      case "email":
        error = validateEmail(email);
        break;
      case "password":
        error = validatePassword(password);
        break;
      case "otp":
        error = validateOtp(otp);
        break;
      case "newPassword":
        error = validateNewPassword(newPassword);
        break;
      case "confirmPassword":
        error = validateConfirmPassword(newPassword, confirmPassword);
        break;
    }

    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  // Handle field change
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (touched.email) {
      setErrors((prev) => ({ ...prev, email: validateEmail(value) }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (touched.password) {
      setErrors((prev) => ({ ...prev, password: validatePassword(value) }));
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // Only allow numbers
    setOtp(value);
    if (touched.otp) {
      setErrors((prev) => ({ ...prev, otp: validateOtp(value) }));
    }
  };

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewPassword(value);
    if (touched.newPassword) {
      setErrors((prev) => ({
        ...prev,
        newPassword: validateNewPassword(value),
      }));
    }
    if (touched.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: validateConfirmPassword(value, confirmPassword),
      }));
    }
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setConfirmPassword(value);
    if (touched.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: validateConfirmPassword(newPassword, value),
      }));
    }
  };

  const handleSendOtp = async () => {
    const emailError = validateEmail(email);
    if (emailError) {
      setErrors((prev) => ({ ...prev, email: emailError }));
      setTouched((prev) => ({ ...prev, email: true }));
      return;
    }

    try {
      await sendOtp(email);
      // Handle success (show success message, etc.)
    } catch (error) {
      console.error("Failed to send OTP:", error);
      // Handle error (show error message, etc.)
    }
  };

  const handleForgotPassword = () => {
    setShowForgotPassword(true);
    setForgotPasswordStep("email");
  };

  const handleSendForgotPasswordOtp = async () => {
    const emailError = validateEmail(email);
    if (emailError) {
      setErrors((prev) => ({ ...prev, email: emailError }));
      setTouched((prev) => ({ ...prev, email: true }));
      return;
    }

    try {
      await sendOtp(email);
      setForgotPasswordStep("otp");
    } catch (error) {
      console.error("Failed to send password reset OTP:", error);
      // Handle error (show error message, etc.)
    }
  };

  const handleVerifyForgotPasswordOtp = async () => {
    const otpError = validateOtp(otp);
    if (otpError) {
      setErrors((prev) => ({ ...prev, otp: otpError }));
      setTouched((prev) => ({ ...prev, otp: true }));
      return;
    }

    try {
      await verifyOtp(email, otp);
      setForgotPasswordStep("newPassword");
    } catch (error) {
      console.error("OTP verification failed:", error);
      // Handle error (show error message, etc.)
    }
  };

  const handleResetPassword = async () => {
    const newPasswordError = validateNewPassword(newPassword);
    const confirmPasswordError = validateConfirmPassword(
      newPassword,
      confirmPassword
    );

    if (newPasswordError || confirmPasswordError) {
      setErrors((prev) => ({
        ...prev,
        newPassword: newPasswordError,
        confirmPassword: confirmPasswordError,
      }));
      setTouched((prev) => ({
        ...prev,
        newPassword: true,
        confirmPassword: true,
      }));
      return;
    }

    try {
      await resetPassword(email, otp, newPassword);

      // Reset form and close modal
      setShowForgotPassword(false);
      setForgotPasswordStep("email");
      setEmail("");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");

      // Handle success (show success message, etc.)
    } catch (error) {
      console.error("Password reset failed:", error);
      // Handle error (show error message, etc.)
    }
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
    setForgotPasswordStep("email");
    setEmail("");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setErrors({
      email: "",
      password: "",
      otp: "",
      newPassword: "",
      confirmPassword: "",
    });
    setTouched({
      email: false,
      password: false,
      otp: false,
      newPassword: false,
      confirmPassword: false,
    });
  };

  // Show loading while checking project
  if (isCheckingProject) {
    return (
      <div className="min-h-screen bg-[#121214] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <LuShield className="text-white text-2xl" />
          </div>
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-white mb-2">
            Checking Project
          </h2>
          <p className="text-gray-400">Validating project access...</p>
        </div>
      </div>
    );
  }

  // Show project not found if invalid
  if (isProjectValid === false) {
    return (
      <div className="min-h-screen bg-[#121214] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <LuShield className="text-white text-2xl" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            Project Not Found
          </h2>
          <p className="text-gray-400 mb-6">
            The project you&apos;re trying to access doesn&apos;t exist or you
            don&apos;t have permission to access it.
          </p>
          <div className="text-sm text-gray-500">
            <p>Project ID: {projectId || "Not provided"}</p>
            <p className="mt-2">Please check your link and try again.</p>
          </div>
        </div>
      </div>
    );
  }

  // Show auth disabled ONLY if both methods are disabled by admin
  if (isProjectValid === true && !authConfig.ep && !authConfig.eo) {
    return (
      <div className="min-h-screen bg-[#121214] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <LuShield className="text-white text-2xl" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            Authentication Disabled
          </h2>
          <p className="text-gray-400 mb-2">
            Login is disabled by the project admin.
          </p>
          <div className="text-sm text-gray-500">
            <p>Allowed methods:</p>
            <p className="mt-1">
              Email/Password: {authConfig.ep ? "Enabled" : "Disabled"}
            </p>
            <p>Email OTP: {authConfig.eo ? "Enabled" : "Disabled"}</p>
          </div>
        </div>
      </div>
    );
  }

  // Show login page if project is valid
  return (
    <div className="min-h-screen bg-[#121214] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Branding */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <LuShield className="text-white text-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-400">Continue to your account</p>
        </motion.div>

        {/* Auth Method Toggle (only when both methods are enabled) */}
        {authConfig.ep && authConfig.eo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-[#141415]/60 backdrop-blur-xl border border-white/10 rounded-xl p-1 mb-6"
          >
            <div className="flex">
              <button
                onClick={() => setAuthMethod("password")}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                  authMethod === "password"
                    ? "bg-white/10 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <LuLock className="inline mr-2" />
                Password
              </button>
              <button
                onClick={() => setAuthMethod("otp")}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                  authMethod === "otp"
                    ? "bg-white/10 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <LuMail className="inline mr-2" />
                OTP
              </button>
            </div>
          </motion.div>
        )}

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-[#141415]/60 backdrop-blur-xl border border-white/10 rounded-xl p-6"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <LuMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={() => handleBlur("email")}
                  placeholder="Enter your email"
                  className={`w-full pl-10 pr-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none transition-all duration-200 ${
                    errors.email && touched.email
                      ? "border-red-400 focus:border-red-400"
                      : "border-white/20 focus:border-white/40"
                  }`}
                />
              </div>
              {errors.email && touched.email && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm mt-1"
                >
                  {errors.email}
                </motion.p>
              )}
            </div>

            <AnimatePresence mode="wait">
              {authMethod === "password" ? (
                <motion.div
                  key="password"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <LuLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={handlePasswordChange}
                      onBlur={() => handleBlur("password")}
                      placeholder="Enter your password"
                      className={`w-full pl-10 pr-12 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none transition-all duration-200 ${
                        errors.password && touched.password
                          ? "border-red-400 focus:border-red-400"
                          : "border-white/20 focus:border-white/40"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <LuEyeOff /> : <LuEye />}
                    </button>
                  </div>
                  {errors.password && touched.password && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-sm mt-1"
                    >
                      {errors.password}
                    </motion.p>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="otp"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      OTP Code
                    </label>
                    <div className="relative">
                      <LuShield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={otp}
                        onChange={handleOtpChange}
                        onBlur={() => handleBlur("otp")}
                        placeholder="Enter 6-digit OTP"
                        maxLength={6}
                        className={`w-full pl-10 pr-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none transition-all duration-200 ${
                          errors.otp && touched.otp
                            ? "border-red-400 focus:border-red-400"
                            : "border-white/20 focus:border-white/40"
                        }`}
                      />
                    </div>
                    {errors.otp && touched.otp && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-sm mt-1"
                      >
                        {errors.otp}
                      </motion.p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={!email}
                    className="w-full py-2 px-4 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed border border-white/20 rounded-lg text-white text-sm transition-all duration-200"
                  >
                    Send OTP
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-all duration-200 flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Continue</span>
                  <LuArrowRight className="text-sm" />
                </>
              )}
            </motion.button>
          </form>

          {/* Forgot Password Link - Only show for password method */}
          {authMethod === "password" && (
            <div className="mt-4 text-center">
              <button
                onClick={handleForgotPassword}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Forgot your password?
              </button>
            </div>
          )}
        </motion.div>

        {/* Forgot Password Modal */}
        <AnimatePresence>
          {showForgotPassword && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-[#141415]/95 backdrop-blur-xl border border-white/10 rounded-xl p-6 w-full max-w-md"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">
                    Reset Password
                  </h2>
                  <button
                    onClick={handleBackToLogin}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>

                {/* Step 1: Email */}
                {forgotPasswordStep === "email" && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <p className="text-gray-400 text-sm">
                      Enter your email address to receive a password reset code.
                    </p>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <LuMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="email"
                          value={email}
                          onChange={handleEmailChange}
                          onBlur={() => handleBlur("email")}
                          placeholder="Enter your email"
                          className={`w-full pl-10 pr-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none transition-all duration-200 ${
                            errors.email && touched.email
                              ? "border-red-400 focus:border-red-400"
                              : "border-white/20 focus:border-white/40"
                          }`}
                        />
                      </div>
                      {errors.email && touched.email && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-400 text-sm mt-1"
                        >
                          {errors.email}
                        </motion.p>
                      )}
                    </div>

                    <button
                      onClick={handleSendForgotPasswordOtp}
                      className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-lg text-white font-medium transition-all duration-200"
                    >
                      Send Reset Code
                    </button>
                  </motion.div>
                )}

                {/* Step 2: OTP Verification */}
                {forgotPasswordStep === "otp" && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <p className="text-gray-400 text-sm">
                      Enter the 6-digit code sent to your email.
                    </p>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Verification Code
                      </label>
                      <div className="relative">
                        <LuShield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={otp}
                          onChange={handleOtpChange}
                          onBlur={() => handleBlur("otp")}
                          placeholder="Enter 6-digit code"
                          maxLength={6}
                          className={`w-full pl-10 pr-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none transition-all duration-200 ${
                            errors.otp && touched.otp
                              ? "border-red-400 focus:border-red-400"
                              : "border-white/20 focus:border-white/40"
                          }`}
                        />
                      </div>
                      {errors.otp && touched.otp && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-400 text-sm mt-1"
                        >
                          {errors.otp}
                        </motion.p>
                      )}
                    </div>

                    <button
                      onClick={handleVerifyForgotPasswordOtp}
                      className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-lg text-white font-medium transition-all duration-200"
                    >
                      Verify Code
                    </button>
                  </motion.div>
                )}

                {/* Step 3: New Password */}
                {forgotPasswordStep === "newPassword" && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <p className="text-gray-400 text-sm">
                      Create a new password for your account.
                    </p>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <LuLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={handleNewPasswordChange}
                          onBlur={() => handleBlur("newPassword")}
                          placeholder="Enter new password"
                          className={`w-full pl-10 pr-12 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none transition-all duration-200 ${
                            errors.newPassword && touched.newPassword
                              ? "border-red-400 focus:border-red-400"
                              : "border-white/20 focus:border-white/40"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        >
                          {showNewPassword ? <LuEyeOff /> : <LuEye />}
                        </button>
                      </div>
                      {errors.newPassword && touched.newPassword && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-400 text-sm mt-1"
                        >
                          {errors.newPassword}
                        </motion.p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <LuLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={handleConfirmPasswordChange}
                          onBlur={() => handleBlur("confirmPassword")}
                          placeholder="Confirm new password"
                          className={`w-full pl-10 pr-12 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none transition-all duration-200 ${
                            errors.confirmPassword && touched.confirmPassword
                              ? "border-red-400 focus:border-red-400"
                              : "border-white/20 focus:border-white/40"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        >
                          {showConfirmPassword ? <LuEyeOff /> : <LuEye />}
                        </button>
                      </div>
                      {errors.confirmPassword && touched.confirmPassword && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-400 text-sm mt-1"
                        >
                          {errors.confirmPassword}
                        </motion.p>
                      )}
                    </div>

                    <button
                      onClick={handleResetPassword}
                      className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-lg text-white font-medium transition-all duration-200"
                    >
                      Reset Password
                    </button>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Powered by Mallow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-8"
        >
          <p className="text-gray-500 text-sm">
            Powered by <span className="text-white font-medium">Mallow</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#121214] flex items-center justify-center p-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl mx-auto mb-4" />
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
          </div>
        </div>
      }
    >
      <LoginInner />
    </Suspense>
  );
}
