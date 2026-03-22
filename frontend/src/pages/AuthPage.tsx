import React, { useState, useEffect } from "react";
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const extractAuthErrorMessage = (err: any): string => {
  const status = err?.response?.status;
  const data = err?.response?.data;

  if (err?.message === "Network Error") {
    return "Unable to reach server. This is usually a CORS or deployment configuration issue.";
  }

  if (status === 403) {
    if (data?.error_code === "email_not_verified") {
      return "Email not verified. Please verify your email with OTP before logging in.";
    }
    if (data?.error_code === "account_inactive") {
      return "Your account is inactive. Please contact support.";
    }
    return data?.detail || "Access denied.";
  }

  if (status === 400 && data && typeof data === "object") {
    const firstKey = Object.keys(data)[0];
    const value = firstKey ? data[firstKey] : null;
    if (Array.isArray(value) && value.length > 0) {
      return String(value[0]);
    }
    if (typeof value === "string") {
      return value;
    }
    if (typeof data.detail === "string") {
      return data.detail;
    }
  }

  return (
    data?.detail ||
    data?.error ||
    err?.message ||
    "Authentication failed. Please try again."
  );
};

const InputField = ({
  label,
  type,
  placeholder,
  icon: Icon,
  value,
  onChange,
  name,
}: any) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="mb-5">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400" />
        </div>

        <input
          type={isPassword && showPassword ? "text" : type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full pl-11 pr-12 py-3 bg-white border border-gray-200 rounded-xl text-slate-900 placeholder-gray-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition"
          required
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-violet-700 transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
};

const SocialButton = ({ label, bg }: { label: string; bg: string }) => (
  <button className="w-full flex items-center justify-center space-x-2 py-3 border border-gray-200 rounded-xl bg-white text-slate-600 font-medium text-sm hover:bg-violet-50 hover:border-violet-200 transition">
    <div className={`w-4 h-4 rounded-full ${bg}`}></div>
    <span>{label}</span>
  </button>
);

const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const modeParam = searchParams.get("mode");
  const [isLogin, setIsLogin] = useState(modeParam === "register" ? false : true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const { login, register } = useAuth();

  // Update form mode when URL parameter changes
  useEffect(() => {
    if (modeParam === "register") {
      setIsLogin(false);
    } else {
      setIsLogin(true);
    }
  }, [modeParam]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        // Validate username/email and password
        const loginIdentifier = formData.username || formData.email;
        if (!loginIdentifier || !formData.password) {
          setError("Please enter both username/email and password");
          setLoading(false);
          return;
        }

        await runLogin(loginIdentifier, formData.password);
      } else {
        // Register - validate all fields
        if (!formData.username || !formData.email || !formData.password) {
          setError("Please fill in all fields");
          setLoading(false);
          return;
        }

        const result = await register(
          formData.username,
          formData.email,
          formData.password,
        );

        // Redirect to email verification page
        if (result) {
          navigate("/verify-email", { state: { email: formData.email } });
        } else {
          setError("Registration failed. Please try again.");
        }
      }
    } catch (err: any) {
      setError(extractAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const runLogin = async (loginIdentifier: string, password: string) => {
    const response = await login(loginIdentifier, password);
    const userRole = response.user?.role || "student";

    if (userRole === "admin") {
      navigate("/admin");
    } else {
      navigate("/user-portal");
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[linear-gradient(135deg,#2b0a6f,#5a1db5,#c72c6c)]">
      {/* Left Panel */}
      <div className="relative w-full lg:w-1/2 min-h-[34vh] lg:min-h-screen flex items-center p-8 lg:p-14 overflow-hidden">
        <div className="relative z-10 max-w-xl text-white">
          <div className="inline-block px-3 py-1 rounded-full text-[11px] font-semibold tracking-[0.18em] uppercase border border-white/30 bg-white/10 mb-5">
            Webinar Management Platform
          </div>

          <h1 className="text-4xl lg:text-6xl font-extrabold leading-tight mb-4">
            {isLogin ? "Welcome Back, Presenter" : "Start Your Webinar Journey"}
          </h1>

          {isLogin ? (
            <p className="text-violet-100 text-base lg:text-lg leading-relaxed max-w-lg">
              Host powerful webinars, manage speakers, and organize events from one
              simple dashboard.
            </p>
          ) : (
            <>
              <p className="text-violet-100 text-base lg:text-lg leading-relaxed max-w-lg mb-3">
                Create your account and begin hosting powerful webinars with confidence.
              </p>
              <p className="text-violet-100/80 text-sm lg:text-base leading-relaxed max-w-lg">
                Manage speakers, schedule events, and connect with your audience through one powerful platform.
              </p>
            </>
          )}
        </div>

        {/* Subtle brand watermark */}
        <div
          aria-hidden="true"
          className="hidden lg:block absolute bottom-[40px] right-[60px] z-0 pointer-events-none select-none"
        >
          <div className="absolute -inset-16 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.15)_0%,rgba(255,255,255,0)_70%)]"></div>
          <div className="relative text-[13px] font-semibold tracking-[0.3em] uppercase text-white/40 ml-2 mb-1">
            ALTRIX
          </div>
          <div className="relative text-[200px] leading-none font-black text-white/12">06</div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 bg-violet-50 flex items-center justify-center px-5 py-10 lg:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl lg:text-4xl font-bold text-violet-950 mb-2">
              {isLogin ? "Sign In" : "Create Account"}
            </h2>
            <p className="text-gray-600">
              {isLogin
                ? "Access your dashboard and continue managing webinars."
                : "Create your account and start hosting with confidence."}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
            <form onSubmit={handleSubmit}>
              {error && (
                <div
                  className={`mb-5 p-4 rounded-xl border text-sm ${
                    error.includes("successful")
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-red-50 text-red-700 border-red-200"
                  }`}
                >
                  {error}
                </div>
              )}

              {!isLogin && (
                <InputField
                  label="Username"
                  type="text"
                  placeholder="johndoe"
                  icon={User}
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                />
              )}

              <InputField
                label={isLogin ? "Username or Email" : "Email Address"}
                type={isLogin ? "text" : "email"}
                placeholder={isLogin ? "username or email" : "name@company.com"}
                icon={Mail}
                name={isLogin ? "username" : "email"}
                value={isLogin ? formData.username : formData.email}
                onChange={handleInputChange}
              />

              <InputField
                label="Password"
                type="password"
                placeholder="Enter your password"
                icon={Lock}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
              />

              {isLogin && (
                <div className="flex justify-end mb-6">
                  <a
                    href="#"
                    className="text-sm font-semibold text-pink-600 hover:text-pink-700"
                  >
                    Forgot Password?
                  </a>
                </div>
              )}

              {!isLogin && (
                <div className="flex items-start mb-6">
                  <div className="flex items-center h-5">
                    <input
                      id="terms"
                      type="checkbox"
                      className="w-4 h-4 border border-gray-300 rounded bg-white focus:ring-2 focus:ring-violet-300 cursor-pointer accent-violet-600"
                    />
                  </div>
                  <label htmlFor="terms" className="ml-3 text-sm text-gray-700">
                    I agree to the{" "}
                    <a
                      href="#"
                      className="font-semibold text-pink-600 hover:text-pink-700"
                    >
                      Terms and Conditions
                    </a>
                  </label>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-violet-700 to-pink-600 hover:from-violet-800 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition flex items-center justify-center"
              >
                <span>{loading ? "Processing..." : isLogin ? "Sign In" : "Create Account"}</span>
                {!loading && <ArrowRight className="ml-2 w-5 h-5" />}
              </button>
            </form>

            <div className="relative my-7">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <SocialButton label="Google" bg="bg-red-500" />
              <SocialButton label="Twitter" bg="bg-blue-400" />
            </div>
          </div>

          <div className="mt-7 text-center">
            <p className="text-gray-600">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 font-semibold text-pink-600 hover:text-pink-700"
              >
                {isLogin ? "Sign up" : "Log in"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
