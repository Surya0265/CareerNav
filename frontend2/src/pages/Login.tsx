import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { login as loginRequest } from "../services/auth.ts";
import { useAuth } from "../hooks/useAuth.ts";
import { useToast } from "../components/shared/ToastContext.ts";
import { Input } from "../components/shared/Input.tsx";
import { Button } from "../components/shared/Button.tsx";
import { FormField } from "../components/shared/FormField.tsx";
import { Spinner } from "../components/shared/Spinner.tsx";

export const LoginPage = () => {
  const [email, setEmail] = useState("23n212@psgtech.ac.in");
  const [password, setPassword] = useState("11111111");
  const { login } = useAuth();
  const navigate = useNavigate();
  const { push } = useToast();

  const mutation = useMutation({
    mutationFn: () => loginRequest({ email, password }),
    onSuccess: (data) => {
      login(data, data.token);
  push({ title: "Welcome back", description: "Let's keep the momentum going!", tone: "success" });
      navigate("/");
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Unable to sign you in right now.";
      push({ title: "Login failed", description: message, tone: "error" });
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
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </FormField>
      <Button type="submit" disabled={mutation.isPending} className="w-full">
        {mutation.isPending ? (
          <span className="flex items-center justify-center gap-2">
            <Spinner /> Signing in
          </span>
        ) : (
          "Sign in"
        )}
      </Button>
      <p className="text-center text-xs text-slate-500">
        Need an account? <Link to="/signup" className="text-blue-400">Create one</Link>
      </p>
    </form>
  );
};
