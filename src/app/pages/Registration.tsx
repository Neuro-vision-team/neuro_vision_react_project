import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { CheckCircle2, ChevronLeft, ChevronRight, Eye, EyeOff, Save, ShieldCheck, Users } from "lucide-react";
import { AGE_CATEGORIES, CITIES_BY_COUNTRY, COUNTRIES, COUNTRY_CODES, SPORTS } from "../data/locations";
import { createTeam, getTeamById, isLoginEmailUnique, updateTeam } from "../data/teams";
import { saveTeamCredentials } from "../auth/auth-context";
import type { TeamFormInput, TeamGender, TeamStatus } from "../types/team";

const CURRENT_YEAR = new Date().getFullYear();

type FormErrors = Partial<Record<keyof TeamFormInput, string>>;

const initialForm: TeamFormInput = {
  teamName: "",
  teamLogo: "",
  sportType: "",
  ageCategory: "",
  teamGender: "Men",
  country: "",
  city: "",
  affiliatedClub: "",
  foundedYear: CURRENT_YEAR,
  coachName: "",
  phoneCountryCode: "+963",
  phoneNumber: "",
  contactEmail: "",
  medicalStaffName: "",
  medicalStaffEmail: "",
  medicalStaffPassword: "",
  loginEmail: "",
  password: "",
  teamStatus: "Active",
  subscriptionType: "Standard",
  permissions: ["Assessments", "Reports"],
};

export const Registration = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const editId = params.get("edit");
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<TeamFormInput>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [apiError, setApiError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [dragging, setDragging] = useState(false);

  const cities = useMemo(() => CITIES_BY_COUNTRY[form.country] || [], [form.country]);

  useEffect(() => {
    if (!editId) return;
    getTeamById(editId).then((team) => {
      if (!team) return;
      setForm({
        teamName: team.teamName,
        teamLogo: team.teamLogo,
        sportType: team.sportType,
        ageCategory: team.ageCategory,
        teamGender: team.teamGender,
        country: team.country,
        city: team.city,
        affiliatedClub: team.affiliatedClub || "",
        foundedYear: team.foundedYear,
        coachName: team.coachName,
        phoneCountryCode: team.phoneCountryCode,
        phoneNumber: team.phoneNumber,
        contactEmail: team.contactEmail,
        medicalStaffName: team.medicalStaffName || "",
        medicalStaffEmail: team.medicalStaffEmail || "",
        medicalStaffPassword: team.medicalStaffPassword || "",
        loginEmail: team.loginEmail,
        password: team.password,
        teamStatus: team.teamStatus,
        subscriptionType: team.subscriptionType,
        permissions: team.permissions,
      });
    });
  }, [editId]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const patch = <K extends keyof TeamFormInput>(key: K, value: TeamFormInput[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    setApiError("");
  };

  const validateStep = async (targetStep: number) => {
    const nextErrors: FormErrors = {};

    if (targetStep >= 1) {
      if (!form.teamName.trim()) nextErrors.teamName = "Team name is required.";
      if (form.teamName.length > 100) nextErrors.teamName = "Maximum 100 characters.";
      if (!form.teamLogo) nextErrors.teamLogo = "Team logo is required.";
      if (!form.sportType) nextErrors.sportType = "Sport type is required.";
      if (!form.ageCategory) nextErrors.ageCategory = "Age category is required.";
      if (!form.country) nextErrors.country = "Country is required.";
      if (!form.city) nextErrors.city = "City is required.";
      if (!form.foundedYear || form.foundedYear > CURRENT_YEAR) nextErrors.foundedYear = `Year must be less than or equal to ${CURRENT_YEAR}.`;
    }

    if (targetStep >= 2) {
      if (!form.coachName.trim()) nextErrors.coachName = "Coach name is required.";
      if (!/^\d{7,14}$/.test(form.phoneNumber.replace(/\s+/g, ""))) nextErrors.phoneNumber = "Enter a valid phone number.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail)) nextErrors.contactEmail = "Enter a valid email.";
    }

    if (targetStep >= 3) {
      if (!form.medicalStaffName.trim()) nextErrors.medicalStaffName = "Medical staff name is required.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.loginEmail)) nextErrors.loginEmail = "Valid login email is required.";
      if (!isLoginEmailUnique(form.loginEmail, editId || undefined)) nextErrors.loginEmail = "Login email already exists.";
      if (!/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(form.password)) {
        nextErrors.password = "Min 8 chars, one uppercase, one number, one special char.";
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.medicalStaffEmail)) nextErrors.medicalStaffEmail = "Valid medical staff email is required.";
      if (!/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(form.medicalStaffPassword)) {
        nextErrors.medicalStaffPassword = "Min 8 chars, one uppercase, one number, one special char.";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleFile = (file?: File) => {
    if (!file) return;
    const validType = ["image/png", "image/jpeg", "image/webp"].includes(file.type);
    if (!validType) {
      setErrors((prev) => ({ ...prev, teamLogo: "Only PNG/JPG/WEBP are allowed." }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, teamLogo: "Max size is 5MB." }));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => patch("teamLogo", String(reader.result));
    reader.readAsDataURL(file);
  };

  const goNext = async () => {
    const ok = await validateStep(step);
    if (ok) setStep((prev) => Math.min(prev + 1, 4));
  };

  const handleSubmit = async () => {
    const ok = await validateStep(3);
    if (!ok) return;

    try {
      setLoading(true);
      setApiError("");
      if (editId) {
        await updateTeam(editId, form);
        // Save updated credentials
        saveTeamCredentials(editId, form.teamName, form.loginEmail, form.password);
        setToast("Team updated successfully.");
      } else {
        const newTeam = await createTeam(form);
        // Save credentials for new team
        saveTeamCredentials(newTeam.id, newTeam.teamName, newTeam.loginEmail, newTeam.password);
        setToast("Team created successfully.");
        setForm(initialForm);
      }
      setStep(4);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : "Unexpected error happened.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {toast && <div className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-emerald-700 text-sm font-semibold">{toast}</div>}
      {apiError && <div className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-rose-700 text-sm font-semibold">{apiError}</div>}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><Users className="w-7 h-7 text-teal-500" /> {editId ? "Edit Team" : "Team Registration"}</h1>
        <button onClick={() => navigate("/teams-management")} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-100">Teams Management</button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {["Team Info", "Contact", "System", "Review"].map((label, index) => {
            const active = step === index + 1;
            const done = step > index + 1;
            return (
              <div key={label} className={`rounded-xl border px-3 py-2 text-sm font-semibold ${active ? "border-teal-400 bg-teal-50 text-teal-700" : done ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-500"}`}>
                {done ? <CheckCircle2 className="inline w-4 h-4 mr-1" /> : null}
                {index + 1}. {label}
              </div>
            );
          })}
        </div>

        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Team Name" error={errors.teamName}><input value={form.teamName} maxLength={100} onChange={(e) => patch("teamName", e.target.value)} className="input" /></Field>
            <Field label="Sport Type" error={errors.sportType}><select value={form.sportType} onChange={(e) => patch("sportType", e.target.value)} className="input"><option value="">Select sport</option>{SPORTS.map((sport) => <option key={sport}>{sport}</option>)}</select></Field>
            <Field label="Age Category" error={errors.ageCategory}><select value={form.ageCategory} onChange={(e) => patch("ageCategory", e.target.value)} className="input"><option value="">Select age</option>{AGE_CATEGORIES.map((age) => <option key={age}>{age}</option>)}</select></Field>
            <Field label="Gender"><div className="flex gap-2">{(["Men", "Women", "Mixed"] as TeamGender[]).map((value) => <button type="button" key={value} onClick={() => patch("teamGender", value)} className={`flex-1 rounded-xl border px-3 py-2 text-sm font-semibold ${form.teamGender === value ? "bg-teal-500 text-white border-teal-500" : "border-slate-300"}`}>{value}</button>)}</div></Field>
            <Field label="Country" error={errors.country}><input list="countries" value={form.country} onChange={(e) => { patch("country", e.target.value); patch("city", ""); }} className="input" /><datalist id="countries">{COUNTRIES.map((country) => <option key={country} value={country} />)}</datalist></Field>
            <Field label="City" error={errors.city}><input list="cities" value={form.city} onChange={(e) => patch("city", e.target.value)} className="input" /><datalist id="cities">{cities.map((city) => <option key={city} value={city} />)}</datalist></Field>
            <Field label="Club/Academy"><input value={form.affiliatedClub} onChange={(e) => patch("affiliatedClub", e.target.value)} className="input" /></Field>
            <Field label="Founded Year" error={errors.foundedYear}><input type="number" value={form.foundedYear} onChange={(e) => patch("foundedYear", Number(e.target.value))} className="input" /></Field>
            <Field label="Team Logo" error={errors.teamLogo} className="md:col-span-2">
              <label
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  handleFile(e.dataTransfer.files?.[0]);
                }}
                className={`block rounded-2xl border-2 border-dashed p-5 text-center cursor-pointer ${dragging ? "border-teal-400 bg-teal-50" : "border-slate-300"}`}
              >
                <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
                Drag & drop logo or click to upload
              </label>
              {form.teamLogo && <img src={form.teamLogo} alt="Logo" className="mt-3 h-24 w-24 rounded-xl border object-cover" />}
            </Field>
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Coach Name" error={errors.coachName}><input value={form.coachName} onChange={(e) => patch("coachName", e.target.value)} className="input" /></Field>
            <Field label="Phone" error={errors.phoneNumber}><div className="flex gap-2"><select value={form.phoneCountryCode} onChange={(e) => patch("phoneCountryCode", e.target.value)} className="input w-28">{COUNTRY_CODES.map((code) => <option key={code}>{code}</option>)}</select><input value={form.phoneNumber} onChange={(e) => patch("phoneNumber", e.target.value)} className="input" placeholder="9XXXXXXXX" /></div></Field>
            <Field label="Email" error={errors.contactEmail} className="md:col-span-2"><input type="email" value={form.contactEmail} onChange={(e) => patch("contactEmail", e.target.value)} className="input" /></Field>
          </div>
        )}

        {step === 3 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Login Email" error={errors.loginEmail}><input type="email" value={form.loginEmail} onChange={(e) => patch("loginEmail", e.target.value)} className="input" /></Field>
            <Field label="Password" error={errors.password}><div className="relative"><input type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => patch("password", e.target.value)} className="input pr-10" /><button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-2.5 text-slate-500">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></Field>
            <Field label="Medical Staff Name" error={errors.medicalStaffName}><input value={form.medicalStaffName} onChange={(e) => patch("medicalStaffName", e.target.value)} className="input" /></Field>
            <Field label="Medical Staff Email" error={errors.medicalStaffEmail}><input type="email" value={form.medicalStaffEmail} onChange={(e) => patch("medicalStaffEmail", e.target.value)} className="input" /></Field>
            <Field label="Medical Staff Password" error={errors.medicalStaffPassword}><input type={showPassword ? "text" : "password"} value={form.medicalStaffPassword} onChange={(e) => patch("medicalStaffPassword", e.target.value)} className="input" /></Field>
            <Field label="Team Status"><label className="flex items-center gap-3 rounded-xl border px-3 py-2"><input type="checkbox" checked={form.teamStatus === "Active"} onChange={(e) => patch("teamStatus", (e.target.checked ? "Active" : "Suspended") as TeamStatus)} /><span>{form.teamStatus}</span></label></Field>
            <Field label="Subscription"><select value={form.subscriptionType} onChange={(e) => patch("subscriptionType", e.target.value as TeamFormInput["subscriptionType"])} className="input"><option>Free</option><option>Standard</option><option>Premium</option></select></Field>
          </div>
        )}

        {step === 4 && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <p className="font-bold text-emerald-800 flex items-center gap-2"><ShieldCheck className="w-5 h-5" /> Review completed</p>
            <p className="text-sm text-emerald-700 mt-1">Team profile is ready. You can save it now or return to previous steps.</p>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <p><strong>Team:</strong> {form.teamName}</p>
              <p><strong>Sport:</strong> {form.sportType}</p>
              <p><strong>Coach:</strong> {form.coachName}</p>
              <p><strong>Status:</strong> {form.teamStatus}</p>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 justify-between mt-6">
          <button type="button" disabled={step === 1 || loading} onClick={() => setStep((prev) => Math.max(1, prev - 1))} className="rounded-xl border px-4 py-2 text-sm font-semibold disabled:opacity-40"><ChevronLeft className="inline w-4 h-4" /> Back</button>
          <div className="flex gap-2">
            {step < 4 ? (
              <button type="button" onClick={goNext} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Next <ChevronRight className="inline w-4 h-4" /></button>
            ) : (
              <button type="button" onClick={handleSubmit} disabled={loading} className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                {loading ? "Saving..." : <><Save className="inline w-4 h-4" /> Save Team</>}
              </button>
            )}
            <button type="button" onClick={() => navigate("/teams-management")} className="rounded-xl border border-teal-400 px-4 py-2 text-sm font-semibold text-teal-700">Go to Teams Management</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, error, className, children }: { label: string; error?: string; className?: string; children: React.ReactNode }) => (
  <div className={className}>
    <label className="block text-sm font-semibold text-slate-700 mb-1">{label}</label>
    {children}
    {error ? <p className="text-xs text-rose-600 mt-1">{error}</p> : null}
  </div>
);
