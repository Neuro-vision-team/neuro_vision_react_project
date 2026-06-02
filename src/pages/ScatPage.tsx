import { useState } from 'react';
import { PageTitle, GlassCard } from '../components/ui';
import { AIConfidenceMeter } from '../components/featureBlocks';

export default function ScatPage() {
  const [symptoms, setSymptoms] = useState(7);
  const [memory, setMemory] = useState(18);
  const score = Math.max(0, 100 - symptoms * 3 - (30 - memory));
  return <div className="space-y-4"><PageTitle title="SCAT-5 Evaluations" subtitle="Interactive symptom and cognitive scoring." /><GlassCard><div className="grid gap-3 md:grid-cols-2"><label>Symptom Severity: {symptoms}<input type="range" min={0} max={22} value={symptoms} onChange={(e) => setSymptoms(Number(e.target.value))} className="w-full" /></label><label>Memory Recall: {memory}/30<input type="range" min={0} max={30} value={memory} onChange={(e) => setMemory(Number(e.target.value))} className="w-full" /></label></div><div className="mt-4"><AIConfidenceMeter value={score} /></div></GlassCard></div>;
}
