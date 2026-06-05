/**
 * PLR eye video card - read-only display inside reports.
 *
 * Two-step flow (per eye):
 *   1. GET /players/{id}/assessments/{id}/plr/video?eye=left  (Bearer token, returns JSON)
 *      returns { url: "https://.../plr/stream/abc123", expires_in: 300 }
 *   2. Put the returned url directly into <video src> - no auth header needed,
 *      the token is embedded in the URL. Token expires in 5 minutes.
 *
 * Fetch a fresh token every time the component mounts - never cache.
 */
import { useEffect, useState } from 'react';
import { Video } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import { formatPercent } from '../../utils/formatters';
import type { PlrAnalysisStatus } from '../../types/plr';
import { buildApiHeaders, buildApiUrl } from '../../services/api/client';

// ─── Token-URL hook ───────────────────────────────────────────────────────────
// Fetches the short-lived stream URL from the backend, then puts it straight
// into the video element. No blob, no object URL - the token handles auth.
function useVideoStreamUrl(apiUrl: string | null) {
  const [state, setState] = useState<{
    apiUrl: string | null;
    streamUrl: string | null;
    loading: boolean;
    error: string | null;
  }>({
    apiUrl: null,
    streamUrl: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!apiUrl) return;

    let cancelled = false;

    fetch(apiUrl, {
      headers: buildApiHeaders(),
    })
      .then((res) => {
        if (res.status === 404) throw new Error('VIDEO_NOT_FOUND');
        if (res.status === 403) throw new Error('Access denied.');
        if (res.status === 401) throw new Error('Session expired - please log in again.');
        if (!res.ok)            throw new Error(`Could not load video (HTTP ${res.status}).`);
        return res.json() as Promise<{ url: string; expires_in: number }>;
      })
      .then((data) => {
        if (!cancelled) {
          setState({ apiUrl, streamUrl: data.url, loading: false, error: null });
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setState({
            apiUrl,
            streamUrl: null,
            loading: false,
            error: err instanceof Error ? err.message : 'Could not load video.',
          });
        }
      });

    return () => { cancelled = true; };
  }, [apiUrl]);

  if (!apiUrl) return { streamUrl: null, loading: false, error: null };
  if (state.apiUrl !== apiUrl) return { streamUrl: null, loading: true, error: null };
  return state;
}

// ─── Component ────────────────────────────────────────────────────────────────
const STATUS_VARIANT: Record<PlrAnalysisStatus, 'success' | 'info' | 'danger' | 'neutral'> = {
  completed:  'success',
  pending:    'info',
  processing: 'info',
  failed:     'danger',
  skipped:    'neutral',
};

interface PlrEyeVideoCardProps {
  eyeSide:        'left' | 'right';
  playerId:       string;
  assessmentId:   string;
  analysisStatus: PlrAnalysisStatus;
  qualityPassed:  boolean;
  qualityScore:   number | null;
}

export function PlrEyeVideoCard({
  eyeSide,
  playerId,
  assessmentId,
  analysisStatus,
  qualityPassed,
  qualityScore,
}: PlrEyeVideoCardProps) {
  const title  = eyeSide === 'left' ? 'Left Eye Video' : 'Right Eye Video';
  const apiUrl = playerId && assessmentId
    ? buildApiUrl(`/players/${playerId}/assessments/${assessmentId}/plr/video?eye=${eyeSide}`)
    : null;

  const { streamUrl, loading, error } = useVideoStreamUrl(apiUrl);

  return (
    <Card className="flex flex-col">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Video size={16} className="text-cyan-300" />
          <p className="text-sm font-semibold text-slate-200">{title}</p>
        </div>
        <div className="flex items-center gap-2">
          {qualityScore !== null && (
            <Badge variant={qualityPassed ? 'success' : 'warning'}>
              Quality: {formatPercent(qualityScore)}
            </Badge>
          )}
          <Badge variant={STATUS_VARIANT[analysisStatus]}>{analysisStatus}</Badge>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center gap-2 py-10">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
          <p className="text-xs text-slate-500">Loading video...</p>
        </div>
      ) : error === 'VIDEO_NOT_FOUND' ? (
        <EmptyState
          title="No video available"
          message="No video file was found for this eye."
          className="py-10"
        />
      ) : error ? (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-center text-sm text-rose-300">
          {error}
        </div>
      ) : streamUrl ? (
        <video
          src={streamUrl}
          controls
          preload="metadata"
          className="w-full rounded-xl border border-slate-700/50 bg-black"
        >
          Your browser does not support the video element.
        </video>
      ) : null}
    </Card>
  );
}
