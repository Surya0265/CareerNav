import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { requestPasswordReset } from "../services/passwordReset.ts";
import { useToast } from "../components/shared/ToastContext.ts";
import { Input } from "../components/shared/Input.tsx";
import { Button } from "../components/shared/Button.tsx";
import { FormField } from "../components/shared/FormField.tsx";
import { Spinner } from "../components/shared/Spinner.tsx";
import { ArrowLeft } from "lucide-react";

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();
  const { push } = useToast();

  const mutation = useMutation({
    mutationFn: (emailAddr: string) => requestPasswordReset(emailAddr),
    onSuccess: (data: any) => {
      setSubmitted(true);
      push({
        title: "Check your email",
        description: `Password reset instructions have been sent to ${data.email}`,
        tone: "success",
      });
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Unable to process your request.";
      push({
        title: "Request failed",
        description: message,
        tone: "error",
      });
    },
  });

  if (submitted) {
    return (
      <div className="space-y-6 text-center">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-white">Check your email</h2>
          <p className="text-slate-400">
            We've sent password reset instructions to <span className="text-blue-400 font-medium">{email}</span>
          </p>
        </div>
        <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <p className="text-sm text-slate-300">
            Follow the link in the email to reset your password. If you don't see an email, check your spam folder.
          </p>
        </div>
        <Button
          onClick={() => navigate("/login")}
          className="w-full"
        >
          Back to Sign In
        </Button>
        <p className="text-xs text-slate-500">
          Didn't receive an email?{" "}
          <button
            onClick={() => {
              setSubmitted(false);
              setEmail("");
            }}
            className="text-blue-400 hover:text-blue-300"
          >
            Try again
          </button>
        </p>
      </div>
    );
  }

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        mutation.mutate(email);
      }}
    >
      <div className="space-y-1">
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-200 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sign In
        </button>
        <h1 className="text-2xl font-semibold text-white">Reset your password</h1>
        <p className="text-sm text-slate-400">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <FormField label="Email address">
        <Input
          type="email"
          autoComplete="email"
          placeholder="your.email@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </FormField>

      <Button
        type="submit"
        disabled={mutation.isPending || !email}
        className="w-full"
      >
        {mutation.isPending ? (
          <span className="flex items-center justify-center gap-2">
            <Spinner /> Sending reset link
          </span>
        ) : (
          "Send reset link"
        )}
      </Button>
    </form>
  );
};
