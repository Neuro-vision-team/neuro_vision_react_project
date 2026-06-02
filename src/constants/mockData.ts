import type { AssessmentRecord } from '../types';

export const stats = [
  { label: 'Total Assessments', value: 1482, trend: 14, key: 'assessments' },
  { label: 'Active Emergency Cases', value: 9, trend: -2, key: 'emergency' },
  { label: 'High Risk Patients', value: 41, trend: 6, key: 'risk' },
  { label: 'Teams Registered', value: 36, trend: 8, key: 'teams' },
  { label: 'Average AI Accuracy', value: 96.4, trend: 1.5, key: 'accuracy' },
  { label: 'PLR Scans Today', value: 127, trend: 12, key: 'plr' },
];

export const assessments: AssessmentRecord[] = Array.from({ length: 18 }).map((_, i) => ({
  id: `NV-${1000 + i}`,
  patientName: ['Noah Carter', 'Yasmin Ali', 'Daniel Brooks', 'Rami Haddad'][i % 4],
  team: ['Falcons', 'Titans', 'Pioneers'][i % 3],
  injuryDate: `2026-05-${(i % 9) + 1}`,
  scatStatus: ['pending', 'in-progress', 'completed'][i % 3] as AssessmentRecord['scatStatus'],
  plrStatus: ['pending', 'in-progress', 'completed'][(i + 1) % 3] as AssessmentRecord['plrStatus'],
  aiClassification: ['low', 'medium', 'high'][i % 3] as AssessmentRecord['aiClassification'],
  assignedMedic: ['Dr. Lina Saleh', 'Dr. Omar Nasser', 'Dr. Hana Aziz'][i % 3],
  lastUpdated: `2026-05-${(i % 9) + 10} 14:${(i * 3) % 60}`,
  assessmentStatus: ['active', 'saved', 'completed'][i % 3] as AssessmentRecord['assessmentStatus'],
}));

export const riskDistribution = [
  { name: 'Low', value: 52, fill: '#00C853' },
  { name: 'Medium', value: 33, fill: '#FFAB00' },
  { name: 'High', value: 15, fill: '#FF3D57' },
];

export const trendSeries = [
  { month: 'Jan', low: 45, medium: 27, high: 12 },
  { month: 'Feb', low: 48, medium: 30, high: 10 },
  { month: 'Mar', low: 50, medium: 31, high: 13 },
  { month: 'Apr', low: 52, medium: 29, high: 11 },
  { month: 'May', low: 55, medium: 33, high: 15 },
];
