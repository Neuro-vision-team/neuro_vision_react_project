import { useLanguage } from "../language-context";

export const Assessments = () => {
  const { isArabic } = useLanguage();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 min-h-[70vh] p-6" dir={isArabic ? "rtl" : "ltr"}>
      <h1 className="text-xl font-bold text-slate-900">{isArabic ? "التقييمات الأساسية" : "Baseline Assessments"}</h1>
      <p className="text-slate-500 mt-2">{isArabic ? "سيتم عرض بيانات التقييم الأساسية هنا." : "Baseline assessment data will appear here."}</p>
    </div>
  );
};
