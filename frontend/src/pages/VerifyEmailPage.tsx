import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { AlertCircle, CheckCircle, Loader2, Mail } from 'lucide-react';
import apiClient from '../services/api';
import Toast from '../components/Toast';

interface VerificationState {
  email: string;
  loading: boolean;
  otp: string;
  attemptCount: number;
  remainingAttempts: number;
  canResend: boolean;
  resendCountdown: number;
  showResendButton: boolean;
  error: string | null;
  success: string | null;
  isVerified: boolean;
}

const VerifyEmailPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';

  const [state, setState] = useState<VerificationState>({
    email: email,
    loading: false,
    otp: '',
    attemptCount: 0,
    remainingAttempts: 5,
    canResend: true,
    resendCountdown: 0,
    showResendButton: false,
    error: null,
    success: null,
    isVerified: false,
  });

  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: 'success' | 'error' }>>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (state.resendCountdown > 0) {
      const timer = setTimeout(() => {
        setState((prev) => ({
          ...prev,
          resendCountdown: prev.resendCountdown - 1,
        }));
      }, 1000);
      return () => clearTimeout(timer);
    } else if (state.resendCountdown === 0 && !state.canResend) {
      setState((prev) => ({
        ...prev,
        canResend: true,
        showResendButton: true,
      }));
    }
  }, [state.resendCountdown, state.canResend]);

  // Add toast notification
  const addToast = (message: string, type: 'success' | 'error') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Handle OTP input change
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setState((prev) => ({
      ...prev,
      otp: value,
      error: null,
    }));
  };

  // Handle OTP verification
  const handleVerifyOTP = async () => {
    if (state.otp.length !== 6) {
      addToast('Please enter a 6-digit OTP', 'error');
      return;
    }

    setState((prev) => ({
      ...prev,
      loading: true,
    }));

    try {
      const response = await apiClient.post('/accounts/auth/verify-email/', {
        email: state.email,
        otp: state.otp,
      });

      setState((prev) => ({
        ...prev,
        loading: false,
        isVerified: true,
        success: response.data.message,
      }));

      addToast('Email verified successfully!', 'success');

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/auth?tab=login', { state: { message: 'Email verified! Please log in.' } });
      }, 2000);
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        loading: false,
      }));

      if (error.response?.status === 429) {
        setState((prev) => ({
          ...prev,
          error: 'Maximum verification attempts exceeded. Please request a new OTP.',
        }));
        addToast('Maximum attempts exceeded. Please resend OTP.', 'error');
      } else if (error.response?.data?.error_code === 'invalid_otp') {
        const remainingAttempts = error.response?.data?.attempts_remaining || 0;
        setState((prev) => ({
          ...prev,
          attemptCount: prev.attemptCount + 1,
          remainingAttempts,
          error: `Invalid OTP. ${remainingAttempts} attempts remaining.`,
        }));
        addToast(`Invalid OTP. ${remainingAttempts} attempts remaining.`, 'error');
      } else {
        const errorMessage = error.response?.data?.detail || 'Verification failed. Please try again.';
        setState((prev) => ({
          ...prev,
          error: errorMessage,
        }));
        addToast(errorMessage, 'error');
      }
    }
  };

  // Handle resend OTP
  const handleResendOTP = async () => {
    setState((prev) => ({
      ...prev,
      loading: true,
      showResendButton: false,
    }));

    try {
      const response = await apiClient.post('/accounts/auth/resend-otp/', {
        email: state.email,
      });

      setState((prev) => ({
        ...prev,
        loading: false,
        otp: '',
        error: null,
        resendCountdown: 60,
        canResend: false,
      }));

      addToast(response.data.message, 'success');
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        loading: false,
        showResendButton: true,
      }));

      if (error.response?.status === 400 && error.response?.data?.error_code === 'already_verified') {
        setState((prev) => ({
          ...prev,
          isVerified: true,
          success: 'Your email is already verified. Redirecting to login...',
        }));
        addToast('Email already verified!', 'success');
        setTimeout(() => {
          navigate('/auth?tab=login');
        }, 2000);
      } else {
        const errorMessage = error.response?.data?.detail || 'Failed to resend OTP. Please try again.';
        setState((prev) => ({
          ...prev,
          error: errorMessage,
        }));
        addToast(errorMessage, 'error');
      }
    }
  };

  // Redirect if no email in state
  if (!state.email) {
    return <Navigate to="/auth" replace />;
  }

  if (state.isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1e1b4b] via-[#2e1065] to-[#db2777] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 text-center border border-white/10">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-pink-50 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-pink-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Email Verified!</h1>
          <p className="text-slate-600 mb-6">Your email has been successfully verified. Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e1b4b] via-[#2e1065] to-[#db2777] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 border border-white/10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-2xl bg-pink-50 flex items-center justify-center">
              <Mail className="w-7 h-7 text-pink-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Verify Your Email</h1>
          <p className="text-slate-600">We've sent a 6-digit code to:</p>
          <p className="text-lg font-semibold text-slate-900 mt-2">{state.email}</p>
        </div>

        {/* Error Message */}
        {state.error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-rose-900">{state.error}</p>
              {state.remainingAttempts > 0 && state.remainingAttempts < 5 && (
                <p className="text-xs text-rose-700 mt-1">
                  {state.remainingAttempts} attempt{state.remainingAttempts !== 1 ? 's' : ''} remaining
                </p>
              )}
            </div>
          </div>
        )}

        {/* OTP Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">Enter Verification Code</label>
          <input
            type="text"
            value={state.otp}
            onChange={handleOtpChange}
            placeholder="000000"
            maxLength={6}
            disabled={state.loading || state.remainingAttempts === 0}
            className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest text-slate-900 placeholder:text-slate-400 caret-pink-600 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 disabled:bg-gray-50 disabled:text-gray-400"
          />
          <p className="text-xs text-slate-500 mt-2 text-center">
            Code expires in 10 minutes
          </p>
        </div>

        {/* Verify Button */}
        <button
          onClick={handleVerifyOTP}
          disabled={state.loading || state.otp.length !== 6 || state.remainingAttempts === 0}
          className="w-full bg-pink-500 hover:bg-pink-600 disabled:bg-gray-300 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mb-4 shadow-lg shadow-pink-500/30"
        >
          {state.loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Verifying...
            </>
          ) : (
            'Verify Email'
          )}
        </button>

        {/* Resend Button */}
        <div className="text-center">
          <p className="text-sm text-slate-600 mb-3">Didn't receive the code?</p>
          {state.showResendButton ? (
            <button
              onClick={handleResendOTP}
              disabled={state.loading}
              className="text-sm font-semibold text-pink-600 hover:text-pink-700 transition-colors"
            >
              Resend Code
            </button>
          ) : (
            <p className="text-sm text-slate-500">
              Resend available in {state.resendCountdown} seconds
            </p>
          )}
        </div>

        {/* Back to Auth Link */}
        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-slate-600">
            Already verified?{' '}
            <button
              onClick={() => navigate('/auth?tab=login')}
              className="text-pink-600 hover:text-pink-700 font-semibold"
            >
              Log In
            </button>
          </p>
        </div>
      </div>

      {/* Toast Notifications */}
      <div className="fixed bottom-4 right-4 space-y-2 max-w-sm">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
          />
        ))}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
