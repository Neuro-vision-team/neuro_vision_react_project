import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Activity, BrainCircuit, Eye, EyeOff, Languages, Loader2, ShieldCheck } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useAuth, type UserRole } from "../auth/auth-context";
import { useLanguage } from "../language-context";

export const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, pending2FA, pending2FASetup, verifyTwoFactor, cancelTwoFactor } = useAuth();
  const { isArabic, toggleLanguage } = useLanguage();
  const [email, setEmail] = useState(() => localStorage.getItem("remember_email") || "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("admin");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(!!email);
  const [twoFactorCode, setTwoFactorCode] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      await login(email.trim(), password, role);
      if (rememberMe) localStorage.setItem("remember_email", email);
      else localStorage.removeItem("remember_email");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) navigate("/", { replace: true });
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eaf0ff] via-[#f8faff] to-[#dde8ff] p-6 sm:p-10">
      <div className="mx-auto grid min-h-[85vh] w-full max-w-6xl overflow-hidden rounded-3xl border border-[#c9d7ff] bg-white shadow-xl shadow-[#c4d3ff]/60 lg:grid-cols-2">
        <section className="hidden bg-[#0b1f4d] p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3"><BrainCircuit className="h-6 w-6" /><span className="text-lg font-bold">Neuro Vision</span></div>
            <h1 className="mt-8 text-4xl font-bold leading-tight">Medical Sports Intelligence</h1>
            <p className="mt-4 text-sm text-cyan-100">AI-powered athlete health and concussion monitoring for professional medical teams.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/20 bg-white/10 p-4"><ShieldCheck className="h-5 w-5" /><p className="mt-2 text-xs text-blue-100">Secure Access</p></div>
            <div className="rounded-2xl border border-white/20 bg-white/10 p-4"><Activity className="h-5 w-5" /><p className="mt-2 text-xs text-blue-100">Live Monitoring</p></div>
          </div>
        </section>

        <section className="flex items-center justify-center p-6 sm:p-10">
          <form onSubmit={onSubmit} className="w-full max-w-md space-y-5" dir={isArabic ? "rtl" : "ltr"}>
            <div>
              <div className="mb-3 flex justify-end"><button type="button" onClick={toggleLanguage} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-[#0b1f4d]"><Languages className="h-4 w-4" />{isArabic ? "EN" : "AR"}</button></div>
              <h2 className="text-3xl font-bold text-slate-900">{isArabic ? "????? ??????" : "Login"}</h2>
            </div>

            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@neurovision.com" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3" />
            <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3">
              <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-transparent px-1 py-3" />
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="text-slate-500">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
            </div>
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
              <button type="button" onClick={() => setRole("admin")} className={`rounded-lg px-3 py-2 text-sm font-semibold ${role === "admin" ? "bg-[#0b1f4d] text-white" : "text-slate-600"}`}>Admin</button>
              <button type="button" onClick={() => setRole("team_manager")} className={`rounded-lg px-3 py-2 text-sm font-semibold ${role === "team_manager" ? "bg-[#0b1f4d] text-white" : "text-slate-600"}`}>Team Manager</button>
            </div>
            <label className="flex items-center gap-2"><input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} /><span className="text-sm text-slate-600">Remember my email</span></label>

            <button type="submit" disabled={isLoading} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0b1f4d] px-4 py-3 font-semibold text-white">{isLoading && <Loader2 className="h-4 w-4 animate-spin" />}Continue</button>

            {pending2FA && (
              <div className="rounded-xl border border-[#d5deff] bg-[#f6f9ff] p-4 space-y-3">
                <p className="text-sm text-slate-700">{pending2FASetup ? "Scan with Google Authenticator, then enter the 6-digit code" : "Enter your Google Authenticator code"}</p>
                {pending2FASetup ? (
                  <div className="space-y-2">
                    <div className="inline-block rounded-lg bg-white p-2 border"><QRCodeSVG value={pending2FASetup.otpAuthUri} size={150} /></div>
                    <p className="text-xs break-all text-slate-600">Secret: {pending2FASetup.secret}</p>
                  </div>
                ) : null}
                <input value={twoFactorCode} onChange={(e) => setTwoFactorCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))} placeholder="123456" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-center tracking-[0.35em]" />
                <div className="flex gap-2">
                  <button type="button" onClick={async () => { try { setError(""); await verifyTwoFactor(twoFactorCode); navigate("/", { replace: true }); } catch (err) { setError(err instanceof Error ? err.message : "Invalid verification code"); } }} className="flex-1 rounded-xl bg-[#0b1f4d] px-4 py-3 font-semibold text-white">Verify</button>
                  <button type="button" onClick={() => { cancelTwoFactor(); setTwoFactorCode(""); }} className="rounded-xl border border-slate-300 px-4 py-3 text-slate-700">Cancel</button>
                </div>
              </div>
            )}

            {error && <div className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700 border border-rose-200">{error}</div>}
          </form>
        </section>
      </div>
    </div>
  );
};
