import { useState } from 'react';
import * as RadixDialog from '@radix-ui/react-dialog';
import { X, Send } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { sendInsuranceEmail } from '../../services/api/assessments.api';

interface SendInsuranceEmailDialogProps {
  open: boolean;
  onClose: () => void;
  assessmentId: string;
  onSuccess: () => void;
}

export function SendInsuranceEmailDialog({
  open,
  onClose,
  assessmentId,
  onSuccess,
}: SendInsuranceEmailDialogProps) {
  return (
    <RadixDialog.Root open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <RadixDialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-700/60 bg-slate-900 p-6 shadow-2xl">
          <div className="mb-5 flex items-center justify-between">
            <RadixDialog.Title className="text-lg font-semibold text-slate-50">
              Send Report PDF to Insurance
            </RadixDialog.Title>
            <RadixDialog.Description className="sr-only">
              Send the medical report PDF to an insurance provider via email.
            </RadixDialog.Description>
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 hover:text-slate-100"
            >
              <X size={18} />
            </button>
          </div>

          {open && (
            <SendInsuranceEmailForm
              key={assessmentId}
              assessmentId={assessmentId}
              onClose={onClose}
              onSuccess={onSuccess}
            />
          )}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}

interface FormState {
  email: string;
  subject: string;
  message: string;
}

const DEFAULT_FORM: FormState = {
  email: '',
  subject: 'Neuro Vision Medical Report',
  message: 'Please find the attached Neuro Vision medical report PDF for review.',
};

interface FormProps {
  assessmentId: string;
  onClose: () => void;
  onSuccess: () => void;
}

function SendInsuranceEmailForm({ assessmentId, onClose, onSuccess }: FormProps) {
  const [form, setForm] = useState<FormState>({ ...DEFAULT_FORM });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    setError('');
    try {
      await sendInsuranceEmail(assessmentId, {
        email: form.email.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send report. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        label="Insurance Email"
        type="email"
        value={form.email}
        onChange={(e) => set('email', e.target.value)}
        placeholder="insurance@provider.com"
        required
        autoFocus
      />
      <Input
        label="Subject"
        value={form.subject}
        onChange={(e) => set('subject', e.target.value)}
        required
      />
      <div className="w-full space-y-1">
        <label htmlFor="insurance-email-message" className="block text-xs font-semibold uppercase tracking-wide text-slate-400">
          Message{' '}
          <span className="normal-case font-normal text-slate-500">(optional)</span>
        </label>
        <textarea
          id="insurance-email-message"
          value={form.message}
          onChange={(e) => set('message', e.target.value)}
          rows={4}
          placeholder="Enter a message for the insurance provider..."
          className="w-full resize-none rounded-xl border border-slate-700/60 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20"
        />
      </div>

      {error && (
        <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
          {error}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="secondary"
          className="flex-1"
          onClick={onClose}
          disabled={sending}
        >
          Cancel
        </Button>
        <Button type="submit" className="flex-1" loading={sending}>
          <Send size={14} />
          Send Report
        </Button>
      </div>
    </form>
  );
}
