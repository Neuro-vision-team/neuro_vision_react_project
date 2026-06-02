import { assessments } from '../constants/mockData';
import { RiskBadge } from './ui';

export function AssessmentTable() {
  return (
    <div className="overflow-auto rounded-2xl border border-slate-700/40">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-900/70 text-slate-300"><tr>{['Session ID','Patient','Team','SCAT-5','PLR','AI','Medic','Last Updated'].map((h) => <th key={h} className="px-3 py-2">{h}</th>)}</tr></thead>
        <tbody>
          {assessments.slice(0, 10).map((a) => <tr key={a.id} className="border-t border-slate-800 text-slate-200"><td className="px-3 py-2">{a.id}</td><td className="px-3 py-2">{a.patientName}</td><td className="px-3 py-2">{a.team}</td><td className="px-3 py-2 capitalize">{a.scatStatus}</td><td className="px-3 py-2 capitalize">{a.plrStatus}</td><td className="px-3 py-2"><RiskBadge level={a.aiClassification} /></td><td className="px-3 py-2">{a.assignedMedic}</td><td className="px-3 py-2">{a.lastUpdated}</td></tr>)}
        </tbody>
      </table>
    </div>
  );
}

export const AIConfidenceMeter = ({ value = 94 }: { value?: number }) => <div className="space-y-2"><div className="flex justify-between text-sm"><span>AI Confidence</span><span>{value}%</span></div><div className="h-2 rounded-full bg-slate-800"><div className="h-2 rounded-full bg-cyan-400" style={{ width: `${value}%` }} /></div></div>;
export const AnimatedChartCard = ({ title, children }: React.PropsWithChildren<{ title: string }>) => <div className="glass rounded-2xl p-4"><p className="mb-2 text-sm text-slate-300">{title}</p>{children}</div>;
export const NotificationDropdown = () => <div className="glass rounded-xl p-3 text-sm text-slate-300">No new critical notifications</div>;
export const EmergencyAlertCard = () => <div className="rounded-xl border border-rose-500/40 bg-rose-500/15 p-3 text-rose-100">Emergency escalation active</div>;
export const PLRMetricCard = ({ label, value }: { label: string; value: string }) => <div className="glass rounded-xl p-3"><p className="text-xs text-slate-400">{label}</p><p className="text-xl">{value}</p></div>;
export const TeamCard = ({ team, players }: { team: string; players: number }) => <div className="glass rounded-xl p-3"><p>{team}</p><p className="text-sm text-slate-400">{players} players</p></div>;
export const MedicalProfileCard = ({ name, role }: { name: string; role: string }) => <div className="glass rounded-xl p-3"><p>{name}</p><p className="text-sm text-slate-400">{role}</p></div>;
export const ActivityTimeline = () => <div className="space-y-2 text-sm"><div className="glass rounded-lg p-2">08:42 - PLR Scan completed</div><div className="glass rounded-lg p-2">08:49 - AI raised medium risk alert</div></div>;
