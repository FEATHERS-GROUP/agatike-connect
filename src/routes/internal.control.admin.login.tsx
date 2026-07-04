import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Shield, Lock, Mail, Loader2, ArrowRight } from "lucide-react";
import { useState } from "react";
import { loginAdmin } from "@/api/admin_auth";

export const Route = createFileRoute("/internal/control/admin/login")({
  head: () => ({
    meta: [{ title: "Admin Portal Sign In" }],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await loginAdmin({ data: { email, password } });
      router.invalidate();
      router.navigate({ to: "/internal/control/admin" });
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-gray-50 dark:bg-[#0d0e15] font-sans">
      {/* Left side: Image/Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#f97316] to-[#ea580c] items-center justify-center p-12 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-72 h-72 rounded-full bg-black blur-3xl opacity-30"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center w-full max-w-2xl">
          <div className="flex items-center gap-2 mb-12 self-start text-white">
            <Shield className="h-8 w-8" />
            <span className="text-2xl font-bold tracking-tight">Agatike</span>
            <span className="text-sm border-l border-white/30 pl-2 ml-2 font-medium opacity-90">
              Master Control
            </span>
          </div>

          <div className="w-full relative">
            <div className="absolute -inset-1 bg-white/20 rounded-xl blur"></div>
            <img
              src="/admin-dashboard-preview.png"
              alt="Agatike Admin Dashboard"
              className="relative w-full rounded-xl shadow-2xl border border-white/20"
            />
          </div>

          <div className="mt-12 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Enterprise Management System</h2>
            <p className="text-white/80 text-lg max-w-md mx-auto">
              Securely monitor operations, manage users, and oversee the entire Agatike platform
              from one unified dashboard.
            </p>
          </div>
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center lg:items-start mb-8 lg:mb-12">
            {/* Logo for mobile */}
            <div className="flex lg:hidden items-center gap-2 mb-8 text-gray-900 dark:text-white">
              <Shield className="h-8 w-8 text-[#f97316]" />
              <span className="text-2xl font-bold tracking-tight">Agatike</span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back</h1>
            <p className="text-sm text-gray-500 dark:text-[#888888] mt-2 text-center lg:text-left">
              Please enter your credentials to access the Master Control Panel.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm p-4 rounded-lg mb-6 flex items-start gap-3">
              <div className="mt-0.5">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-[#cccccc] mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-[#666666]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="username"
                  className="w-full h-11 bg-white dark:bg-[#161821] border border-gray-300 dark:border-[#2b2e40] rounded-lg pl-10 pr-4 text-sm text-gray-900 dark:text-white outline-none focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316] transition-all placeholder:text-gray-400 dark:placeholder:text-[#666666]"
                  placeholder="admin@agatike.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-[#cccccc] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-[#666666]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full h-11 bg-white dark:bg-[#161821] border border-gray-300 dark:border-[#2b2e40] rounded-lg pl-10 pr-4 text-sm text-gray-900 dark:text-white outline-none focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316] transition-all placeholder:text-gray-400 dark:placeholder:text-[#666666]"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#f97316] hover:bg-[#ea580c] text-white font-semibold rounded-lg text-sm transition-all mt-6 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm hover:shadow"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Sign in to Admin Portal
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 pt-8 text-center border-t border-gray-200 dark:border-[#2b2e40]">
            <p className="text-xs text-gray-500 dark:text-[#888888]">
              Secure access provided by Agatike Core Authentication
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
