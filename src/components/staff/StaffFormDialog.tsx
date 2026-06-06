/**
 * Staff create / edit dialog — Medical Team Manager only.
 * Created staff are auto-assigned to the manager's team by the backend.
 */
import { useState } from 'react';
import * as RadixDialog from '@radix-ui/react-dialog';
import { Eye, EyeOff, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useCreateStaff, useUpdateStaff } from '../../hooks/mutations/useStaffMutations';
import type { Staff } from '../../types/staff';

interface StaffFormDialogProps {
  open:    boolean;
  onClose: () => void;
  staff?:  Staff | null;   // edit mode if provided
}

type FormState = {
  fullName:             string;
  email:                string;
  password:             string;
  passwordConfirmation: string;
};

function buildInitial(staff?: Staff | null): FormState {
  return {
    fullName:             staff?.fullName ?? '',
    email:                staff?.email    ?? '',
    password:             '',
    passwordConfirmation: '',
  };
}

interface StaffFormBodyProps {
  staff?:  Staff | null;
  onClose: () => void;
}

function StaffFormBody({ staff, onClose }: StaffFormBodyProps) {
  const isEdit = !!staff;

  const createStaff = useCreateStaff();
  const updateStaff = useUpdateStaff(staff?.id ?? '');

  const [form,     setForm]     = useState<FormState>(() => buildInitial(staff));
  const [showPwd,  setShowPwd]  = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [error,    setError]    = useState('');

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const validate = (): string => {
    if (!form.fullName.trim()) return 'Full name is required.';
    if (!form.email.trim())    return 'Email is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return 'Enter a valid email address.';
    if (!isEdit) {
      if (!form.password)                           return 'Password is required.';
      if (form.password.length < 8)                 return 'Password must be at least 8 characters.';
      if (form.password !== form.passwordConfirmation) return 'Passwords do not match.';
    }
    return '';
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate();
    if (v) { setError(v); return; }
    setError('');

    try {
      if (isEdit) {
        await updateStaff.mutateAsync({
          full_name: form.fullName.trim(),
          email:     form.email.trim(),
        });
      } else {
        await createStaff.mutateAsync({
          full_name:             form.fullName.trim(),
          email:                 form.email.trim(),
          password:              form.password,
          password_confirmation: form.passwordConfirmation,
        });
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save staff member.');
    }
  };

  const saving = createStaff.isPending || updateStaff.isPending;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        label="Full Name"
        value={form.fullName}
        onChange={(e) => set('fullName', e.target.value)}
        placeholder="Dr. Jane Smith"
        required
        disabled={saving}
      />

      <Input
        label="Email"
        type="email"
        value={form.email}
        onChange={(e) => set('email', e.target.value)}
        placeholder="jane.smith@clinic.com"
        required
        disabled={saving}
      />

      {/* Password fields — only shown when creating a new staff member */}
      {!isEdit && (
        <>
          <div className="relative">
            <Input
              label="Password"
              type={showPwd ? 'text' : 'password'}
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              placeholder="Min. 8 characters"
              required
              disabled={saving}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPwd((v) => !v)}
              className="absolute right-3 top-9 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <div className="relative">
            <Input
              label="Confirm Password"
              type={showConf ? 'text' : 'password'}
              value={form.passwordConfirmation}
              onChange={(e) => set('passwordConfirmation', e.target.value)}
              placeholder="Repeat password"
              required
              disabled={saving}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowConf((v) => !v)}
              className="absolute right-3 top-9 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              {showConf ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </>
      )}

      {/* Team assignment note */}
      {!isEdit && (
        <p className="rounded-xl border border-cyan-300/60 bg-cyan-50 px-3 py-2 text-xs text-cyan-700 dark:border-cyan-400/20 dark:bg-cyan-500/5 dark:text-cyan-300">
          This staff member will be automatically assigned to your team.
        </p>
      )}

      {error && (
        <p className="rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
          {error}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" className="flex-1" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1" loading={saving}>
          {isEdit ? 'Save Changes' : 'Create Staff Member'}
        </Button>
      </div>
    </form>
  );
}

export function StaffFormDialog({ open, onClose, staff }: StaffFormDialogProps) {
  return (
    <RadixDialog.Root open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <RadixDialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700/60 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between">
            <RadixDialog.Title className="text-lg font-semibold text-slate-800 dark:text-slate-50">
              {staff ? 'Edit Staff Member' : 'Add Medical Staff'}
            </RadixDialog.Title>
            <RadixDialog.Description className="sr-only">
              {staff ? 'Edit staff member details' : 'Create a new medical staff member for your team'}
            </RadixDialog.Description>
            <button type="button" aria-label="Close" onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-100">
              <X size={18} />
            </button>
          </div>

          {/* Keyed so form state resets on each open cycle */}
          {open && (
            <StaffFormBody
              key={staff?.id ?? 'new'}
              staff={staff}
              onClose={onClose}
            />
          )}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
