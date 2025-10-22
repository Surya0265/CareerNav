import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { verifyEmail as verifyRequest } from "../services/auth.ts";
import { useToast } from "../components/shared/ToastContext.ts";

export const VerifyEmailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { push } = useToast();
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const email = params.get('email');

    if (!token || !email) {
      setStatus('error');
      push({ title: 'Invalid link', description: 'Missing token or email', tone: 'error' });
      return;
    }

    (async () => {
      try {
        await verifyRequest({ token, email });
        setStatus('success');
        push({ title: 'Verified', description: 'Your email has been verified. You can now sign in.', tone: 'success' });
        navigate('/login');
      } catch (err) {
        setStatus('error');
        push({ title: 'Verification failed', description: 'Invalid or expired link', tone: 'error' });
      }
    })();
  }, [location.search]);

  if (status === 'pending') return <div>Verifying…</div>;
  if (status === 'success') return <div>Verified — redirecting to login…</div>;
  return <div>Verification failed. Please request a new verification email.</div>;
};

export default VerifyEmailPage;
