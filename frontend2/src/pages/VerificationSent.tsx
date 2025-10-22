import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/shared/Button.tsx";
import { resendVerification as resendRequest } from "../services/auth.ts";
import { useToast } from "../components/shared/ToastContext.ts";

export const VerificationSentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { push } = useToast();
  const email = (location.state as any)?.email;

  const handleResend = async () => {
    try {
      await resendRequest({ email });
      push({ title: 'Verification email resent', tone: 'success' });
    } catch (err) {
      push({ title: 'Error', description: 'Could not resend verification', tone: 'error' });
    }
  };

  return (
    <div className="max-w-xl mx-auto text-center">
      <h2 className="text-2xl font-semibold">Verify your email</h2>
      <p className="mt-4 text-sm text-slate-600">
        A verification email has been sent to <strong>{email}</strong>. Please check your inbox and click the verification link to activate your account.
      </p>
      <div className="mt-6 flex gap-3 justify-center">
        <Button onClick={() => navigate('/login')}>Back to sign in</Button>
        <Button variant="secondary" onClick={handleResend}>Resend email</Button>
      </div>
    </div>
  );
};

export default VerificationSentPage;
