/**
 * Player create/edit dialog — Manager only.
 * Photo is uploaded as a base64 data URI string in the JSON payload.
 *
 * The form body is a separate, keyed component so its state initializes
 * directly from props (no reset-in-effect needed).
 */
import { useMemo, useState } from 'react';
import * as RadixDialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/Input';
import { Avatar } from '../ui/Avatar';
import { useCreatePlayer, useUpdatePlayer } from '../../hooks/mutations/usePlayerMutations';
import { COUNTRIES } from '../../utils/locations';
import type { Player, CreatePlayerPayload, PlayerGender, PreferredSide, PlayerStatus } from '../../types/player';

interface PlayerFormDialogProps {
  open: boolean;
  onClose: () => void;
  player?: Player | null;     // edit mode if provided
  existingJerseyNumbers: number[];
}

type FormState = {
  photo: string;
  fullName: string;
  shirtName: string;
  dateOfBirth: string;
  nationality: string;
  gender: PlayerGender;
  heightCm: string;
  weightKg: string;
  jerseyNumber: string;
  position: string;
  preferredSide: PreferredSide;
  joinDate: string;
  email: string;
  guardianName: string;
  status: PlayerStatus;
};

function buildInitialForm(player?: Player | null): FormState {
  if (!player) {
    return {
      photo: '', fullName: '', shirtName: '', dateOfBirth: '', nationality: '',
      gender: 'male', heightCm: '', weightKg: '', jerseyNumber: '', position: '',
      preferredSide: 'right', joinDate: new Date().toISOString().slice(0, 10),
      email: '', guardianName: '', status: 'active',
    };
  }
  return {
    photo:        player.photoUrl ?? '',
    fullName:     player.fullName,
    shirtName:    player.shirtName ?? '',
    dateOfBirth:  player.dateOfBirth?.slice(0, 10) ?? '',
    nationality:  player.nationality,
    gender:       player.gender,
    heightCm:     String(player.heightCm || ''),
    weightKg:     String(player.weightKg || ''),
    jerseyNumber: String(player.jerseyNumber || ''),
    position:     player.position,
    preferredSide: player.preferredSide,
    joinDate:     player.joinYear ? `${player.joinYear}-01-01` : new Date().toISOString().slice(0, 10),
    email:        player.email ?? '',
    guardianName: '',
    status:       player.status,
  };
}

function calcAge(dob: string): number {
  if (!dob) return 0;
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return Math.max(0, age);
}

interface PlayerFormBodyProps {
  player?: Player | null;
  existingJerseyNumbers: number[];
  onClose: () => void;
}

function PlayerFormBody({ player, existingJerseyNumbers, onClose }: PlayerFormBodyProps) {
  const isEdit = !!player;
  const createPlayer = useCreatePlayer();
  const updatePlayer = useUpdatePlayer(player?.id ?? '');

  const [form, setForm] = useState<FormState>(() => buildInitialForm(player));
  const [error, setError] = useState('');

  const age = useMemo(() => calcAge(form.dateOfBirth), [form.dateOfBirth]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const onPhotoChange = (file?: File) => {
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setError('Photo must be PNG, JPG, or WEBP.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Photo must be under 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => set('photo', String(reader.result));
    reader.readAsDataURL(file);
  };

  const validate = (): string => {
    if (!form.fullName.trim())          return 'Full name is required.';
    if (!form.dateOfBirth)              return 'Date of birth is required.';
    if (!form.nationality)             return 'Nationality is required.';
    if (!form.position.trim())          return 'Position is required.';
    const jersey = Number(form.jerseyNumber);
    if (!jersey)                        return 'Jersey number is required.';
    const otherNumbers = isEdit
      ? existingJerseyNumbers.filter((n) => n !== player?.jerseyNumber)
      : existingJerseyNumbers;
    if (otherNumbers.includes(jersey))  return 'Jersey number already used in this team.';
    if (age < 18 && !form.guardianName.trim()) return 'Guardian name required for players under 18.';
    return '';
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate();
    if (v) { setError(v); return; }
    setError('');

    const payload: CreatePlayerPayload = {
      full_name:      form.fullName.trim(),
      shirt_name:     form.shirtName.trim() || undefined,
      date_of_birth:  form.dateOfBirth,
      nationality:    form.nationality,
      gender:         form.gender,
      height_cm:      Number(form.heightCm) || 0,
      weight_kg:      Number(form.weightKg) || 0,
      jersey_number:  Number(form.jerseyNumber),
      preferred_side: form.preferredSide,
      join_date:      form.joinDate,
      email:          form.email.trim() || undefined,
      guardian_name:  form.guardianName.trim() || undefined,
      status:         form.status,
      position:       form.position.trim(),
      // Only send photo if it's a fresh base64 upload (not an existing URL)
      ...(form.photo.startsWith('data:') ? { photo: form.photo } : {}),
    };

    try {
      if (isEdit && player) {
        await updatePlayer.mutateAsync(payload);
      } else {
        await createPlayer.mutateAsync(payload);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save player.');
    }
  };

  const saving = createPlayer.isPending || updatePlayer.isPending;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Photo */}
      <div className="flex items-center gap-4">
        <Avatar src={form.photo || null} name={form.fullName} size="xl" />
        <label className="cursor-pointer rounded-xl border border-dashed border-slate-600 px-4 py-2 text-sm text-slate-300 hover:border-cyan-400/40">
          Upload Photo
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => onPhotoChange(e.target.files?.[0])}
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Full Name"    value={form.fullName}  onChange={(e) => set('fullName', e.target.value)}  required />
        <Input label="Shirt Name"   value={form.shirtName} onChange={(e) => set('shirtName', e.target.value)} />
        <Input label="Date of Birth" type="date" value={form.dateOfBirth} onChange={(e) => set('dateOfBirth', e.target.value)} required />
        <Input label={`Age${age ? ` (${age})` : ''}`} value={age || ''} disabled />

        <Select label="Nationality" value={form.nationality} onChange={(e) => set('nationality', e.target.value)} required>
          <option value="">Select...</option>
          {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </Select>
        <Select label="Gender" value={form.gender} onChange={(e) => set('gender', e.target.value as PlayerGender)}>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </Select>

        <Input label="Height (cm)" type="number" value={form.heightCm} onChange={(e) => set('heightCm', e.target.value)} />
        <Input label="Weight (kg)" type="number" value={form.weightKg} onChange={(e) => set('weightKg', e.target.value)} />

        <Input label="Jersey Number" type="number" value={form.jerseyNumber} onChange={(e) => set('jerseyNumber', e.target.value)} required />
        <Select label="Position" value={form.position} onChange={(e) => set('position', e.target.value)} required>
          <option value="">Select...</option>
          {['Goalkeeper', 'Defender', 'Midfielder', 'Forward', 'Other'].map((p) => <option key={p} value={p}>{p}</option>)}
        </Select>

        <Select label="Preferred Side" value={form.preferredSide} onChange={(e) => set('preferredSide', e.target.value as PreferredSide)}>
          <option value="right">Right</option>
          <option value="left">Left</option>
          <option value="both">Both</option>
        </Select>
        <Select label="Status" value={form.status} onChange={(e) => set('status', e.target.value as PlayerStatus)}>
          <option value="active">Active</option>
          <option value="injured">Injured</option>
          <option value="suspended">Suspended</option>
        </Select>

        <Input label="Join Date" type="date" value={form.joinDate} onChange={(e) => set('joinDate', e.target.value)} />
        <Input label="Email (optional)" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />

        {age > 0 && age < 18 && (
          <Input label="Guardian Name" value={form.guardianName} onChange={(e) => set('guardianName', e.target.value)} className="sm:col-span-2" required />
        )}
      </div>

      {error && (
        <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{error}</p>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" className="flex-1" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1" loading={saving}>
          {isEdit ? 'Update Player' : 'Create Player'}
        </Button>
      </div>
    </form>
  );
}

export function PlayerFormDialog({ open, onClose, player, existingJerseyNumbers }: PlayerFormDialogProps) {
  const isEdit = !!player;

  return (
    <RadixDialog.Root open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <RadixDialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-slate-700/60 bg-slate-900 p-6 shadow-2xl">
          <div className="mb-4 flex items-center justify-between">
            <RadixDialog.Title className="text-lg font-semibold text-slate-50">
              {isEdit ? 'Edit Player' : 'Add Player'}
            </RadixDialog.Title>
            <RadixDialog.Description className="sr-only">
              {isEdit ? 'Edit player details' : 'Create a new player'}
            </RadixDialog.Description>
            <button type="button" aria-label="Close" onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:text-slate-100">
              <X size={18} />
            </button>
          </div>

          {/* Keyed body: fresh state per player / open cycle, no reset effect */}
          {open && (
            <PlayerFormBody
              key={player?.id ?? 'new'}
              player={player}
              existingJerseyNumbers={existingJerseyNumbers}
              onClose={onClose}
            />
          )}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
