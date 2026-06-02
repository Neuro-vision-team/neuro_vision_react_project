import { LogOut } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useNavigate } from "react-router";
import { useState } from "react";
import { useAuth } from "../auth/auth-context";
import { useLanguage } from "../language-context";

export const Settings = () => {
  const navigate = useNavigate();
  const { logout, session, get2FAStatus, begin2FASetup, enable2FA, disable2FA } = useAuth();
  const { isArabic } = useLanguage();
  const [secret, setSecret] = useState("");
  const [otpUri, setOtpUri] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const twoFaEnabled = get2FAStatus();

  const t = isArabic
    ? {
        title: "?????????",
        subtitle: "????? ???? Neuro Vision ??????.",
        signedIn: "???? ?????? ????:",
        unknown: "??? ?????",
        logout: "????? ??????",
      }
    : {
        title: "Settings",
        subtitle: "Manage your secure Neuro Vision session.",
        signedIn: "Signed in as:",
        unknown: "Unknown",
        logout: "Logout",
      };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="space-y-6" dir={isArabic ? "rtl" : "ltr"}>
      <div className="rounded-2xl border border-[#d5deff] bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-[#0b1f4d]">{t.title}</h1>
        <p className="mt-1 text-sm text-slate-500">{t.subtitle}</p>
      </div>

      <div className="rounded-2xl border border-[#d5deff] bg-gradient-to-br from-white to-[#eef3ff] p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-600">
            {t.signedIn} <span className="font-semibold text-[#0b1f4d]">{session?.email ?? t.unknown}</span>
          </p>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#0b1f4d] text-white transition hover:bg-[#08173a]"
            title={t.logout}
            aria-label={t.logout}
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-[#d5deff] bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-xl font-semibold text-[#0b1f4d]">{isArabic ? "???????? ????????" : "Two-Factor Authentication"}</h2>
        <p className="text-sm text-slate-600">
          {twoFaEnabled
            ? (isArabic ? "Google Authenticator ???? ??????." : "Google Authenticator is currently enabled.")
            : (isArabic ? "???? Google Authenticator ?????? ??????." : "Enable Google Authenticator to protect your account.")}
        </p>

        {!twoFaEnabled ? (
          <button
            type="button"
            onClick={() => {
              const setup = begin2FASetup();
              setSecret(setup.secret);
              setOtpUri(setup.otpAuthUri);
              setCode("");
              setError("");
              setNotice("");
            }}
            className="rounded-xl bg-[#0b1f4d] px-4 py-3 text-white"
          >
            {isArabic ? "????? Google Authenticator" : "Set Up Google Authenticator"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              disable2FA();
              setSecret("");
              setOtpUri("");
              setCode("");
              setError("");
              setNotice(isArabic ? "?? ????? ???????? ????????" : "Two-factor authentication disabled");
            }}
            className="rounded-xl border border-rose-300 px-4 py-3 text-rose-700"
          >
            {isArabic ? "????? ???????? ????????" : "Disable 2FA"}
          </button>
        )}

        {otpUri && (
          <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="inline-block rounded-lg bg-white p-2"><QRCodeSVG value={otpUri} size={170} /></div>
            <p className="text-xs text-slate-600 break-all">Secret: {secret}</p>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
              placeholder="123456"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-center tracking-[0.35em]"
            />
            <button
              type="button"
              onClick={() => {
                try {
                  enable2FA(secret, code);
                  setNotice(isArabic ? "?? ????? ???????? ????????" : "Two-factor authentication enabled");
                  setError("");
                  setSecret("");
                  setOtpUri("");
                  setCode("");
                } catch (e) {
                  setError(e instanceof Error ? e.message : "Failed to enable 2FA");
                }
              }}
              className="rounded-xl bg-[#0b1f4d] px-4 py-3 text-white"
            >
              {isArabic ? "????? ???????? ????????" : "Enable 2FA"}
            </button>
          </div>
        )}

        {error && <p className="text-sm text-rose-600">{error}</p>}
        {notice && <p className="text-sm text-emerald-600">{notice}</p>}
      </div>
    </div>
  );
};
