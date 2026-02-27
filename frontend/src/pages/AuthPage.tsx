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

// Shared Components
const InputField = ({ label, type, placeholder, icon: Icon, value, onChange, name }: any) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="mb-5">
      <label className="block text-slate-700 text-sm font-bold mb-2 ml-1">
        {label}
      </label>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400 group-focus-within:text-pink-500 transition-colors" />
        </div>
        <input
          type={isPassword && showPassword ? "text" : type}
          name={name}
          value={value}
          onChange={onChange}
          className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all text-slate-800 placeholder-gray-400"
          placeholder={placeholder}
          required
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-pink-600 transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
};

const SocialButton = ({ label, bg }: { label: string; bg: string }) => (
  <button className="w-full flex items-center justify-center space-x-2 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-slate-600 font-medium text-sm">
    <div className={`w-5 h-5 rounded-full ${bg}`}></div>
    <span>{label}</span>
  </button>
);

const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const modeParam = searchParams.get('mode');
  const [isLogin, setIsLogin] = useState(modeParam === 'register' ? false : true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const testAccounts = {
    admin: { username: 'admin', password: 'admin123' },
    student: { username: 'student', password: 'student123' },
  };

  // Update form mode when URL parameter changes
  useEffect(() => {
    if (modeParam === 'register') {
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
          setError('Please enter both username/email and password');
          setLoading(false);
          return;
        }

        await runLogin(loginIdentifier, formData.password);
      } else {
        // Register - validate all fields
        if (!formData.username || !formData.email || !formData.password) {
          setError('Please fill in all fields');
          setLoading(false);
          return;
        }
        
        await register(formData.username, formData.email, formData.password);
        setIsLogin(true);
        setFormData({ username: '', email: '', password: '' });
        setError('Registration successful! Please log in.');
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.error || 
                          err.message ||
                          'Authentication failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const runLogin = async (loginIdentifier: string, password: string) => {
    console.log('Attempting login with:', loginIdentifier);
    const response = await login(loginIdentifier, password);
    console.log('Login successful:', response);
    const userRole = response.user?.role || 'user';

    if (userRole === 'admin') {
      navigate('/admin');
    } else {
      navigate('/user-portal');
    }
  };

  const handleQuickLogin = async (accountKey: 'admin' | 'student') => {
    const account = testAccounts[accountKey];
    setFormData({ username: account.username, email: '', password: account.password });
    setLoading(true);
    setError(null);

    try {
      await runLogin(account.username, account.password);
    } catch (err: any) {
      console.error('Auth error:', err);
      const errorMessage = err.response?.data?.detail ||
                          err.response?.data?.error ||
                          err.message ||
                          'Authentication failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-sans overflow-hidden">
      {/* Left Panel - Visuals (Themed) */}
      <div className="hidden lg:flex w-1/2 bg-[#1e1b4b] relative items-center justify-center p-12 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#1e1b4b] via-[#2e1065] to-[#db2777] opacity-80 z-0"></div>
        <div className="absolute top-10 left-10 opacity-20">
          <div className="grid grid-cols-6 gap-2">
            {[...Array(36)].map((_, i) => (
              <div key={i} className="w-1 h-1 bg-white rounded-full"></div>
            ))}
          </div>
        </div>

        {/* Pink shape */}
        <div className="absolute -bottom-20 -right-20 w-[600px] h-[600px] bg-gradient-to-t from-pink-600 to-purple-600 rounded-full blur-3xl opacity-20"></div>

        <div className="relative z-10 max-w-lg text-white">
          <div className="mb-8 inline-block px-4 py-1 rounded-full bg-pink-500/20 border border-pink-500/50 text-pink-300 text-xs font-bold tracking-widest uppercase">
            Webinar Management
          </div>
          <h1 className="text-5xl font-extrabold leading-tight mb-6">
            {isLogin
              ? "Welcome Back To The Stage."
              : "Join The World's Biggest Webinar."}
          </h1>
          <p className="text-gray-300 text-lg leading-relaxed mb-8">
            Connect with industry leaders, attend exclusive sessions, and manage
            your event schedule all in one place.
          </p>

          {/* Testimonial Mini Card */}
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 mt-12 transform hover:scale-105 transition duration-500">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 rounded-full border-2 border-pink-500 p-0.5">
                <img
                  src="https://i.pravatar.cc/150?img=32"
                  alt="User"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-bold">Sarah Jenkins</h4>
                <div className="text-pink-400 text-xs">Event Organizer</div>
              </div>
            </div>
            <p className="text-sm text-gray-200 italic">
              "The best platform to manage high-scale events smoothly.
              Registration is a breeze!"
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-24 relative">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              {isLogin ? "Log In" : "Create Account"}
            </h2>
            <p className="text-slate-500">
              {isLogin
                ? "Enter your details to access your account"
                : "Get started with your free account today"}
            </p>
            {isLogin && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                <p className="text-blue-800 font-semibold mb-1">Test Credentials:</p>
                <p className="text-blue-700">Username: <span className="font-mono font-bold">Admin</span></p>
                <p className="text-blue-700">Password: <span className="font-mono font-bold">admin123</span></p>
              </div>
            )}
            {isLogin && (
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin')}
                  disabled={loading}
                  className="w-full rounded-lg border border-pink-200 bg-pink-50 text-pink-700 font-semibold py-2.5 hover:bg-pink-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Test Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('student')}
                  disabled={loading}
                  className="w-full rounded-lg border border-blue-200 bg-blue-50 text-blue-700 font-semibold py-2.5 hover:bg-blue-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Test Student
                </button>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className={`mb-5 p-4 rounded-xl ${error.includes('successful') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
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
              placeholder="••••••••"
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
                    className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-pink-300"
                  />
                </div>
                <label
                  htmlFor="terms"
                  className="ml-2 text-sm font-medium text-gray-500"
                >
                  I agree to the{" "}
                  <a href="#" className="text-pink-600 hover:underline">
                    Terms and Conditions
                  </a>
                </label>
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-pink-500 hover:bg-pink-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg shadow-pink-500/30 transition-all flex items-center justify-center group"
            >
              <span>{loading ? 'Processing...' : (isLogin ? "Sign In" : "Create Account")}</span>
              {!loading && <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <SocialButton label="Google" bg="bg-red-500" />
            <SocialButton label="Twitter" bg="bg-blue-400" />
          </div>

          <div className="mt-10 text-center">
            <p className="text-slate-600">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 font-bold text-pink-600 hover:text-pink-700 transition-colors"
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