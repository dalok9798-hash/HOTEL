import React, { useState } from "react";
import { LogIn, Key, ShieldCheck, Eye, EyeOff, Loader2, UtensilsCrossed } from "lucide-react";

interface LoginPortalProps {
  onLoginSuccess: (role: "admin" | "staff" | "kitchen", username: string) => void;
  onBack: () => void;
}

export default function LoginPortal({ onLoginSuccess, onBack }: LoginPortalProps) {
  const [role, setRole] = useState<"admin" | "staff" | "kitchen">("staff");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      let isSuccess = false;

      if (role === "admin" && userId === "admin" && password === "admin@123") {
        isSuccess = true;
      } else if (role === "staff" && userId === "staff001" && password === "staff@123") {
        isSuccess = true;
      } else if (role === "kitchen" && userId === "kitchen001" && password === "kitchen@123") {
        isSuccess = true;
      }

      setLoading(false);

      if (isSuccess) {
        onLoginSuccess(role, userId);
      } else {
        setError(`Invalid credentials for ${role.toUpperCase()} portal`);
      }
    }, 700);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative font-sans text-slate-100">
      {/* Dynamic blurred decorations */}
      <div className="absolute top-1/3 left-1/4 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl"></div>
      <div className="absolute bottom-1/3 right-1/4 w-72 h-72 rounded-full bg-sky-500/10 blur-3xl"></div>

      {/* Main Glassmorphic Container */}
      <div className="max-w-md w-full bg-slate-900/60 border border-slate-800 backdrop-blur-xl p-8 rounded-3xl shadow-2xl relative z-10 transition-all duration-300 hover:border-slate-700/80">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-tr from-emerald-400 to-sky-400 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-3">
            <UtensilsCrossed className="w-8 h-8 text-slate-950" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-transparent">
            TULSI RESTO PORTAL
          </h2>
          <p className="text-xs text-slate-400 mt-1">Authorized Restaurant Operator Login</p>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-3 gap-2 bg-slate-950/80 p-1 rounded-2xl mb-6 border border-slate-800">
          {(["staff", "kitchen", "admin"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => {
                setRole(r);
                setUserId(r === "admin" ? "admin" : r === "staff" ? "staff001" : "kitchen001");
                setPassword(r === "admin" ? "admin@123" : r === "staff" ? "staff@123" : "kitchen@123");
                setError("");
              }}
              className={`py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                role === r
                  ? "bg-gradient-to-r from-emerald-400 to-sky-400 text-slate-950 shadow-sm font-bold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/10"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/60 border border-red-800/80 text-red-300 rounded-xl text-xs flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
              {role.toUpperCase()} Username
            </label>
            <div className="relative">
              <Key className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                required
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder={`Enter your ${role} ID`}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500/80 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
              Secure Credentials
            </label>
            <div className="relative">
              <ShieldCheck className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-3 pl-11 pr-11 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500/80 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <input
                id="remember"
                type="checkbox"
                defaultChecked
                className="w-3.5 h-3.5 rounded bg-slate-900 border-slate-800 text-emerald-500 focus:ring-0"
              />
              <label htmlFor="remember" className="text-xs text-slate-500 cursor-pointer select-none">
                Remember credentials
              </label>
            </div>
            <span className="text-[11px] text-slate-500 hover:underline cursor-pointer">Reset Password?</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-400 to-sky-400 hover:opacity-90 text-slate-950 font-bold py-3.5 px-4 rounded-xl text-sm shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In Securely</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between items-center">
          <button
            onClick={onBack}
            className="text-xs text-slate-400 hover:text-emerald-300 transition-colors"
          >
            ← Back to Guest Menu
          </button>
          <div className="text-[10px] text-slate-600 font-mono">
            V1.02 Sec-Lock
          </div>
        </div>
      </div>
    </div>
  );
}
