import { Link } from "react-router";
import { ShieldAlert } from "lucide-react";
import { useLanguage } from "../language-context";

export const AccessDenied = () => {
  const { isArabic } = useLanguage();

  return (
    <div className="flex min-h-[70vh] items-center justify-center" dir={isArabic ? "rtl" : "ltr"}>
      <div className="w-full max-w-xl rounded-3xl border border-rose-200 bg-white p-8 text-center shadow-sm">
        <ShieldAlert className="mx-auto h-12 w-12 text-rose-500" />
        <h1 className="mt-4 text-2xl font-bold text-slate-900">{isArabic ? "??? ????" : "Access Denied"}</h1>
        <p className="mt-2 text-sm text-slate-600">
          {isArabic ? "??? ???? ?????? ?????? ??? ??? ??????." : "You do not have permission to access this page."}
        </p>
        <Link to="/" className="mt-5 inline-block rounded-xl bg-[#0b1f4d] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#08173a]">
          {isArabic ? "?????? ????????" : "Return Home"}
        </Link>
      </div>
    </div>
  );
};


