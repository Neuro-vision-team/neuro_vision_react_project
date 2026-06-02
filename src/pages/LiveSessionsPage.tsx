import { PageTitle, GlassCard } from '../components/ui';
import { useLiveActivityFeed } from '../hooks/useLiveActivityFeed';

export default function LiveSessionsPage() {
  const feed = useLiveActivityFeed();
  return <div className="space-y-4"><PageTitle title="Live Sessions" subtitle="Monitor active assessments and in-progress triage." /><GlassCard><div className="space-y-2 text-sm">{feed.map((f) => <div key={f.id} className="rounded-lg bg-slate-800/70 p-2">{f.time} - {f.message}</div>)}</div></GlassCard></div>;
}
