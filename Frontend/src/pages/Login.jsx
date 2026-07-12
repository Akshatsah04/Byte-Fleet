import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "../context/DataContext";
import { Eye, EyeOff, ShieldAlert, Compass, CheckCircle2 } from "lucide-react";

export const Login = () => {
  const { login, currentUser } = useData();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect
  React.useEffect(() => {
    if (currentUser) {
      navigate("/");
    }
  }, [currentUser, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Simulate slightly longer network request for premium loading feel
      await new Promise(resolve => setTimeout(resolve, 800));
      login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail, demoPassword = "password") => {
    setError("");
    setLoading(true);
    setEmail(demoEmail);
    setPassword(demoPassword);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      login(demoEmail, demoPassword);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    {
      title: "Real-time fleet visibility",
      description: "Track vehicle statuses, active trips, and schedules instantly."
    },
    {
      title: "Automated operational workflows",
      description: "Seamlessly dispatch, update, and close trips with safety checks."
    },
    {
      title: "Actionable cost insights",
      description: "Evaluate fuel efficiency, ROI, and breakdown costs immediately."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 font-sans">
      {/* Left Section - Branding & Tagline */}
      <div className="w-full md:w-1/2 bg-[#0F172A] text-white p-8 md:p-16 flex flex-col justify-between relative overflow-hidden">
        {/* Subtle logistics background texture grid */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:3rem_3rem]" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center space-x-2 text-white font-semibold text-lg">
            <div className="w-9 h-9 rounded-lg bg-[#2563EB] flex items-center justify-center shadow-lg">
              <Compass className="w-5.5 h-5.5 text-white animate-spin-slow" />
            </div>
            <span className="tracking-tight text-2xl font-bold">Transit<span className="text-[#2563EB]">Ops</span></span>
          </div>
        </div>

        <div className="my-auto py-12 relative z-10 max-w-lg">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4 leading-tight">
            Move smarter. <br />
            <span className="text-[#2563EB]">Operate better.</span>
          </h1>
          <p className="text-slate-400 text-base mb-10 leading-relaxed">
            Centralized fleet operations management built for modern logistics networks. Real-time safety checks, automated dispatch, and full financial auditing.
          </p>

          <div className="space-y-6">
            {benefits.map((b) => (
              <div key={b.title} className="flex gap-3 items-start">
                <div className="w-5 h-5 rounded-full bg-blue-900/60 text-[#2563EB] flex items-center justify-center flex-shrink-0 mt-0.5 border border-blue-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">{b.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{b.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-500">
          &copy; 2026 TransitOps Platform. All rights reserved.
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 bg-[#F8FAFC]">
        <div className="w-full max-w-md bg-white border border-[#E2E8F0] rounded-2xl shadow-sm p-8">
          <div className="text-center md:text-left mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
            <p className="text-xs text-slate-500 mt-1">
              Sign in to manage your transport operations.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 flex items-start gap-2.5 animate-in fade-in duration-200">
              <ShieldAlert className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
              <div className="text-xs font-semibold leading-relaxed">{error}</div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@transitops.in"
                className="w-full"
                disabled={loading}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); alert("Use demo login details provided below."); }}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pr-10"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  tabIndex="-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                defaultChecked
              />
              <label htmlFor="remember" className="ml-2 text-xs font-semibold text-slate-600 select-none cursor-pointer">
                Remember this device for 30 days
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-sm py-2.5 px-4 rounded-lg shadow-sm flex items-center justify-center space-x-2 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-75 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Quick Access Demo Accounts section */}
          <div className="mt-8 pt-6 border-t border-[#E2E8F0]">
            <h3 className="text-xs font-bold text-slate-700 mb-3 text-center uppercase tracking-wider">
              Quick Access Demo Accounts
            </h3>
            <p className="text-[11px] text-slate-400 text-center mb-4 leading-relaxed">
              Click a role button to pre-fill credentials and sign in immediately.
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { label: "Fleet Manager", email: "karan.manager@transitops.in" },
                { label: "Dispatcher", email: "rohan.dispatch@transitops.in" },
                { label: "Safety Officer", email: "sanya.safety@transitops.in" },
                { label: "Financial Analyst", email: "anand.analyst@transitops.in" }
              ].map((role) => (
                <button
                  key={role.label}
                  type="button"
                  onClick={() => handleQuickLogin(role.email)}
                  disabled={loading}
                  className="bg-[#F1F5F9] hover:bg-[#EFF6FF] border border-[#E2E8F0] hover:border-[#BFDBFE] text-slate-700 hover:text-blue-700 text-[11px] font-semibold py-2 px-3 rounded-lg flex flex-col items-center justify-center transition-colors text-center"
                >
                  <span>{role.label}</span>
                </button>
              ))}
            </div>
            
            {/* Account locking mock trigger for evaluation */}
            <div className="mt-3 flex justify-center">
              <button
                type="button"
                onClick={() => handleQuickLogin("locked.account@transitops.in", "wrongpass")}
                className="text-[10px] text-slate-400 hover:text-red-500 font-semibold underline"
              >
                Trigger account lock demo error
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
