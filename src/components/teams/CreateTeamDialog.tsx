/**
 * Create Team dialog — Admin only.
 * POST /admin/teams requires an existing manager (manager_user_id),
 * so the form includes a manager selector populated from /admin/users.
 * Logo is sent as a base64 data URI string (optional).
 */
import { useMemo, useState } from 'react';
import * as RadixDialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/Input';
import { Avatar } from '../ui/Avatar';
import { useCreateTeam } from '../../hooks/mutations/useTeamMutations';
import { useAdminUsers } from '../../hooks/queries/useAdminUsers';
import { SPORTS, AGE_CATEGORIES, COUNTRIES, CITIES_BY_COUNTRY, COUNTRY_CODES } from '../../utils/locations';
import type { CreateTeamPayload, TeamGender } from '../../types/team';

interface CreateTeamDialogProps {
  open: boolean;
  onClose: () => void;
}

type FormState = {
  teamName: string;
  managerUserId: string;
  sportType: string;
  ageCategory: string;
  gender: TeamGender;
  country: string;
  city: string;
  clubAcademy: string;
  foundedYear: string;
  coachName: string;
  phoneCode: string;
  phoneNumber: string;
  coachEmail: string;
  logo: string;
};

const EMPTY: FormState = {
  teamName: '', managerUserId: '', sportType: '', ageCategory: '', gender: 'male',
  country: '', city: '', clubAcademy: '', foundedYear: '',
  coachName: '', phoneCode: '+963', phoneNumber: '', coachEmail: '', logo: '',
};

const CURRENT_YEAR = new Date().getFullYear();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function CreateTeamBody({ onClose }: { onClose: () => void }) {
  const createTeam = useCreateTeam();
  const { data: usersData, isLoading: loadUsers } = useAdminUsers();

  const [form, setForm] = useState<FormState>(() => ({ ...EMPTY }));
  const [error, setError] = useState('');

  // Only active managers who don't already have a team (manager_user_id is unique)
  const managers = useMemo(
    () => (usersData?.items ?? []).filter(
      (u) => u.roleName === 'medical_team_manager' && u.status === 'active' && !u.hasTeam,
    ),
    [usersData],
  );
  const cities = useMemo(() => CITIES_BY_COUNTRY[form.country] ?? [], [form.country]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const onLogo = (file?: File) => {
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) { setError('Logo must be PNG, JPG, or WEBP.'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('Logo must be under 5MB.'); return; }
    const reader = new FileReader();
    reader.onloadend = () => set('logo', String(reader.result));
    reader.readAsDataURL(file);
  };

  const validate = (): string => {
    if (!form.teamName.trim())                       return 'Team name is required.';
    if (!form.managerUserId)                          return 'A manager must be selected. Create one in Settings first.';
    if (!form.sportType)                              return 'Sport type is required.';
    if (!form.ageCategory)                            return 'Age category is required.';
    if (!form.country)                                return 'Country is required.';
    if (!form.city.trim())                            return 'City is required.';
    if (form.foundedYear && (Number(form.foundedYear) < 1800 || Number(form.foundedYear) > CURRENT_YEAR))
      return `Founded year must be between 1800 and ${CURRENT_YEAR}.`;
    if (!form.coachName.trim())                       return 'Coach name is required.';
    if (!/^\d{6,14}$/.test(form.phoneNumber.replace(/\D/g, ''))) return 'Valid coach phone number is required.';
    if (!EMAIL_RE.test(form.coachEmail))              return 'Valid coach email is required.';
    return '';
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate();
    if (v) { setError(v); return; }
    setError('');

    const payload: CreateTeamPayload = {
      manager_user_id: Number(form.managerUserId),
      team_name:    form.teamName.trim(),
      sport_type:   form.sportType,
      age_category: form.ageCategory,
      gender:       form.gender,
      country:      form.country,
      city:         form.city.trim(),
      club_academy: form.clubAcademy.trim() || undefined,
      founded_year: form.foundedYear ? Number(form.foundedYear) : undefined,
      coach_name:   form.coachName.trim(),
      coach_phone:  `${form.phoneCode} ${form.phoneNumber.replace(/\D/g, '')}`.trim(),
      coach_email:  form.coachEmail.trim().toLowerCase(),
      status:       'active',
      ...(form.logo.startsWith('data:') ? { logo: form.logo } : {}),
    };

    try {
      await createTeam.mutateAsync(payload);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create team.');
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Logo */}
      <div className="flex items-center gap-4">
        <Avatar src={form.logo || null} name={form.teamName} size="xl" />
        <label className="cursor-pointer rounded-xl border border-dashed border-slate-600 px-4 py-2 text-sm text-slate-300 hover:border-cyan-400/40">
          Upload Logo (optional)
          <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => onLogo(e.target.files?.[0])} />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Team Name" value={form.teamName} onChange={(e) => set('teamName', e.target.value)} required />

        <Select label="Manager" value={form.managerUserId} onChange={(e) => set('managerUserId', e.target.value)} required>
          <option value="">{loadUsers ? 'Loading managers...' : 'Select manager...'}</option>
          {managers.map((m) => <option key={m.id} value={m.id}>{m.fullName} — {m.email}</option>)}
        </Select>

        <Select label="Sport Type" value={form.sportType} onChange={(e) => set('sportType', e.target.value)} required>
          <option value="">Select...</option>
          {SPORTS.map((s) => <option key={s} value={s}>{s}</option>)}
        </Select>
        <Select label="Age Category" value={form.ageCategory} onChange={(e) => set('ageCategory', e.target.value)} required>
          <option value="">Select...</option>
          {AGE_CATEGORIES.map((a) => <option key={a} value={a}>{a}</option>)}
        </Select>

        <Select label="Gender" value={form.gender} onChange={(e) => set('gender', e.target.value as TeamGender)}>
          <option value="male">Men</option>
          <option value="female">Women</option>
          <option value="mixed">Mixed</option>
        </Select>
        <Select label="Country" value={form.country} onChange={(e) => { set('country', e.target.value); set('city', ''); }} required>
          <option value="">Select...</option>
          {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </Select>

        {cities.length > 0 ? (
          <Select label="City" value={form.city} onChange={(e) => set('city', e.target.value)} required>
            <option value="">Select...</option>
            {cities.map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>
        ) : (
          <Input label="City" value={form.city} onChange={(e) => set('city', e.target.value)} required />
        )}
        <Input label="Club / Academy (optional)" value={form.clubAcademy} onChange={(e) => set('clubAcademy', e.target.value)} />

        <Input label="Founded Year (optional)" type="number" value={form.foundedYear} onChange={(e) => set('foundedYear', e.target.value)} placeholder="2003" />
        <Input label="Coach Name" value={form.coachName} onChange={(e) => set('coachName', e.target.value)} required />

        <div className="grid grid-cols-[100px_1fr] gap-2">
          <Select label="Code" value={form.phoneCode} onChange={(e) => set('phoneCode', e.target.value)}>
            {COUNTRY_CODES.map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>
          <Input label="Coach Phone" value={form.phoneNumber} onChange={(e) => set('phoneNumber', e.target.value)} required />
        </div>
        <Input label="Coach Email" type="email" value={form.coachEmail} onChange={(e) => set('coachEmail', e.target.value)} required />
      </div>

      {managers.length === 0 && !loadUsers && (
        <p className="rounded-xl border border-amber-400/20 bg-amber-500/10 px-3 py-2 text-sm text-amber-300">
          No available managers. Each manager can lead only one team — create a new Medical Team Manager in Settings first.
        </p>
      )}

      {error && (
        <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{error}</p>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" className="flex-1" onClick={onClose} disabled={createTeam.isPending}>Cancel</Button>
        <Button type="submit" className="flex-1" loading={createTeam.isPending}>Create Team</Button>
      </div>
    </form>
  );
}

export function CreateTeamDialog({ open, onClose }: CreateTeamDialogProps) {
  return (
    <RadixDialog.Root open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <RadixDialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-slate-700/60 bg-slate-900 p-6 shadow-2xl">
          <div className="mb-4 flex items-center justify-between">
            <RadixDialog.Title className="text-lg font-semibold text-slate-50">Add Team</RadixDialog.Title>
            <RadixDialog.Description className="sr-only">Create a new team</RadixDialog.Description>
            <button type="button" aria-label="Close" onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:text-slate-100">
              <X size={18} />
            </button>
          </div>

          {open && <CreateTeamBody onClose={onClose} />}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
