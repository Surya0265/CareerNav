import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  verifyResetToken,
  resetPassword,
} from "../services/passwordReset.ts";
import { useToast } from "../components/shared/ToastContext.ts";
import { Input } from "../components/shared/Input.tsx";
import { Button } from "../components/shared/Button.tsx";
import { FormField } from "../components/shared/FormField.tsx";
import { Spinner } from "../components/shared/Spinner.tsx";
import { Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { push } = useToast();

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token || !email) {
        setTokenValid(false);
        push({
          title: "Invalid link",
          description: "Password reset link is missing required parameters.",
          tone: "error",
        });
        return;
      }

      try {
        await verifyResetToken(token, email);
        setTokenValid(true);
      } catch (error) {
        setTokenValid(false);
        const message =
          error instanceof Error
            ? error.message
            : "Password reset link has expired or is invalid.";
        push({
          title: "Invalid or expired link",
          description: message,
          tone: "error",
        });
      }
    };

    verifyToken();
  }, [token, email, push]);

  const resetMutation = useMutation({
    mutationFn: async () => {
      if (!token || !email) {
        throw new Error("Invalid reset request");
      }

      if (newPassword.length < 8) {
        throw new Error("Password must be at least 8 characters long");
      }

      if (newPassword !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      setIsResetting(true);
      try {
        return await resetPassword(token, email, newPassword, confirmPassword);
      } finally {
        setIsResetting(false);
      }
    },
    onSuccess: () => {
      push({
        title: "Success",
        description: "Your password has been reset. Please sign in with your new password.",
        tone: "success",
      });
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to reset password. Please try again.";
      push({
        title: "Reset failed",
        description: message,
        tone: "error",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    resetMutation.mutate();
  };

  // Show loading state while verifying token
  if (tokenValid === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 px-4">
        <div className="flex flex-col items-center gap-4">
          <Spinner />
          <p className="text-slate-400">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  // Show error if token is invalid
  if (!tokenValid) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 px-4">
        <div className="w-full max-w-md rounded-lg bg-slate-800 p-8 shadow-xl">
          <div className="mb-6 flex justify-center">
            <AlertCircle className="h-12 w-12 text-red-500" />
          </div>
          <h1 className="mb-2 text-center text-2xl font-bold text-white">
            Invalid Link
          </h1>
          <p className="mb-6 text-center text-slate-400">
            This password reset link has expired or is invalid. Please request a new one.
          </p>
          <button
            onClick={() => navigate("/forgot-password")}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Request New Reset Link
          </button>
        </div>
      </div>
    );
  }

  // Show success state
  if (resetMutation.isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 px-4">
        <div className="w-full max-w-md rounded-lg bg-slate-800 p-8 shadow-xl">
          <div className="mb-6 flex justify-center">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <h1 className="mb-2 text-center text-2xl font-bold text-white">
            Password Reset
          </h1>
          <p className="mb-6 text-center text-slate-400">
            Your password has been successfully reset. You will be redirected to the login page.
          </p>
          <div className="flex items-center justify-center">
            <Spinner />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Reset Password</h1>
          <p className="mt-2 text-slate-400">
            Enter your new password below.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-lg bg-slate-800 p-8 shadow-xl"
        >
          <FormField label="New Password" description="Must be at least 8 characters">
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isResetting}
                className="pr-10"
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </FormField>

          <FormField label="Confirm Password">
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isResetting}
                className="pr-10"
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </FormField>

          {newPassword && confirmPassword && newPassword !== confirmPassword && (
            <p className="mb-4 text-sm text-red-500">Passwords do not match</p>
          )}

          <Button
            type="submit"
            disabled={
              isResetting ||
              resetMutation.isPending ||
              !newPassword ||
              !confirmPassword ||
              newPassword !== confirmPassword ||
              newPassword.length < 8
            }
            className="mb-4 w-full"
          >
            {resetMutation.isPending || isResetting ? (
              <span className="flex items-center gap-2">
                <Spinner />
                Resetting...
              </span>
            ) : (
              "Reset Password"
            )}
          </Button>

          {resetMutation.isError && (
            <div className="rounded-lg bg-red-500/10 p-4 text-red-500 text-sm">
              {resetMutation.error instanceof Error
                ? resetMutation.error.message
                : "Failed to reset password. Please try again."}
            </div>
          )}
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => navigate("/login")}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
};
