import { PageTitle } from '../components/ui';
import { PLRMetricCard } from '../components/featureBlocks';

export default function PlrPage() {
  return <div className="space-y-4"><PageTitle title="PLR Analysis" subtitle="Real-time pupil reflex metrics and AI scan confidence." /><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4"><PLRMetricCard label="Constriction Velocity" value="2.9 mm/s" /><PLRMetricCard label="Dilation Velocity" value="1.7 mm/s" /><PLRMetricCard label="Reflex Latency" value="182 ms" /><PLRMetricCard label="Pupil Symmetry" value="96.2%" /></div></div>;
}
