import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { signup as signupRequest } from "../services/auth.ts";
import { useAuth } from "../hooks/useAuth.ts";
import { useToast } from "../components/shared/ToastContext.ts";
import { Input } from "../components/shared/Input.tsx";
import { Button } from "../components/shared/Button.tsx";
import { FormField } from "../components/shared/FormField.tsx";
import { Spinner } from "../components/shared/Spinner.tsx";
import { Eye, EyeOff } from "lucide-react";
import {
  validatePasswordStrength,
  getPasswordStrengthLabel,
  getPasswordStrengthColor,
} from "../utils/passwordValidator.ts";

export const SignupPage = () => {
  const [name, setName] = useState("Fresh Grad");
  const [email, setEmail] = useState("grad@example.com");
  const [password, setPassword] = useState("password123");
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);

  // don't auto-login until verification is complete
  useAuth();
  const navigate = useNavigate();
  const { push } = useToast();

  // Handle password change and validation
  const handlePasswordChange = (value: string) => {
    setPassword(value);
    const validation = validatePasswordStrength(value);
    setPasswordErrors(validation.errors);
  };

  const passwordValidation = validatePasswordStrength(password);
  const isPasswordValid = passwordValidation.isValid;

  const mutation = useMutation({
    mutationFn: () => signupRequest({ name, email, password }),
    onSuccess: () => {
      // After signup, redirect to verification sent page. Do not auto-login until verified.
      push({ title: "Account created", description: "Verification email sent — please verify before signing in", tone: "success" });
      navigate('/verification-sent', { state: { email } });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Could not create account.";
      push({ title: "Signup failed", description: message, tone: "error" });
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    // Validate password strength before submitting
    if (!isPasswordValid) {
      push({
        title: "Weak password",
        description: passwordErrors.join(", "),
        tone: "error",
      });
      return;
    }

    mutation.mutate();
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <FormField label="Full name">
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoComplete="name"
          required
        />
      </FormField>
      <FormField label="Email">
        <Input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </FormField>
      <FormField label="Password">
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            value={password}
            onChange={(event) => handlePasswordChange(event.target.value)}
            required
            className={
              password && !isPasswordValid ? "border-red-500 pr-10" : "pr-10"
            }
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
            title={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
        
        {/* Password strength indicator */}
        {password && (
          <div className="mt-2 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600">
                Password strength:
              </span>
              <span
                className={`text-xs font-semibold ${getPasswordStrengthColor(
                  passwordValidation.score
                )}`}
              >
                {getPasswordStrengthLabel(passwordValidation.score)}
              </span>
            </div>
            
            {/* Strength meter */}
            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  passwordValidation.score === 3
                    ? "w-full bg-green-500"
                    : passwordValidation.score === 2
                    ? "w-2/3 bg-yellow-500"
                    : passwordValidation.score === 1
                    ? "w-1/3 bg-orange-500"
                    : "w-0 bg-red-500"
                }`}
              />
            </div>

            {/* Error messages */}
            {passwordErrors.length > 0 && (
              <ul className="text-xs text-red-600 space-y-1">
                {passwordErrors.map((error, index) => (
                  <li key={index} className="flex items-start gap-1">
                    <span className="text-red-400 mt-0.5">•</span>
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Success message */}
            {isPasswordValid && (
              <p className="text-xs text-green-600">
                ✓ Password meets all security requirements
              </p>
            )}
          </div>
        )}
      </FormField>

      <Button
        type="submit"
        disabled={mutation.isPending || !isPasswordValid}
        className="w-full"
      >
        {mutation.isPending ? (
          <span className="flex items-center justify-center gap-2">
            <Spinner /> Creating account
          </span>
        ) : (
          "Sign up"
        )}
      </Button>
      <p className="text-center text-xs text-slate-500">
        Already have an account? <Link to="/login" className="text-blue-400">Sign in</Link>
      </p>
    </form>
  );
};
