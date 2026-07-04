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
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-[#0d0e15] font-sans">
      <div className="w-full max-w-sm bg-gray-50 dark:bg-[#161821] border border-gray-300 dark:border-[#2b2e40] rounded-md shadow-2xl p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-600/10 p-3 rounded-lg mb-4 border border-blue-600/20">
            <Shield className="h-8 w-8 text-blue-500" />
          </div>
          <h1 className="text-xl font-semibold text-slate-100">Sign in to Admin Portal</h1>
          <p className="text-xs text-slate-400 mt-2">Enterprise Master Control System</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-md mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Email address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
                className="w-full h-10 bg-white dark:bg-[#0f111a] border border-gray-300 dark:border-[#2b2e40] rounded-md pl-10 pr-3 text-sm text-slate-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors placeholder:text-slate-600"
                placeholder="admin@agatike.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full h-10 bg-white dark:bg-[#0f111a] border border-gray-300 dark:border-[#2b2e40] rounded-md pl-10 pr-3 text-sm text-slate-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors placeholder:text-slate-600"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium rounded-md text-sm transition-colors mt-2 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-300 dark:border-[#2b2e40] text-center">
          <p className="text-[11px] text-slate-500">Secure access provided by Agatike Core</p>
        </div>
      </div>
    </div>
  );
}
