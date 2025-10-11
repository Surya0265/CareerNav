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

export const SignupPage = () => {
  const [name, setName] = useState("Fresh Grad");
  const [email, setEmail] = useState("grad@example.com");
  const [password, setPassword] = useState("password123");

  const { login } = useAuth();
  const navigate = useNavigate();
  const { push } = useToast();

  const mutation = useMutation({
    mutationFn: () => signupRequest({ name, email, password }),
    onSuccess: (data) => {
      login(data, data.token);
  push({ title: "Account created", description: "Let's build your roadmap!", tone: "success" });
      navigate("/");
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Could not create account.";
      push({ title: "Signup failed", description: message, tone: "error" });
    },
  });

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        mutation.mutate();
      }}
    >
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
        <Input
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </FormField>
      <Button type="submit" disabled={mutation.isPending} className="w-full">
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
