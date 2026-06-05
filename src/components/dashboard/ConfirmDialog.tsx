import * as RadixDialog from '@radix-ui/react-dialog';
import { Button } from '../ui/Button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmLabel?: string;
  confirmVariant?: 'primary' | 'destructive';
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title         = 'Are you sure?',
  message       = 'This action cannot be undone.',
  confirmLabel  = 'Confirm',
  confirmVariant = 'destructive',
  loading       = false,
}: ConfirmDialogProps) {
  return (
    <RadixDialog.Root open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <RadixDialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-700/60 bg-slate-900 p-6 shadow-2xl">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-400">
              <AlertTriangle size={24} />
            </div>
            <RadixDialog.Title className="text-lg font-semibold text-slate-50">
              {title}
            </RadixDialog.Title>
            <RadixDialog.Description className="text-sm text-slate-400">
              {message}
            </RadixDialog.Description>
            <div className="mt-2 flex w-full gap-3">
              <Button variant="secondary" className="flex-1" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button variant={confirmVariant} className="flex-1" onClick={onConfirm} loading={loading}>
                {confirmLabel}
              </Button>
            </div>
          </div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
