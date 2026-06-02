export type RiskLevel = 'low' | 'medium' | 'high';

export interface AssessmentRecord {
  id: string;
  patientName: string;
  team: string;
  injuryDate: string;
  scatStatus: 'pending' | 'in-progress' | 'completed';
  plrStatus: 'pending' | 'in-progress' | 'completed';
  aiClassification: RiskLevel;
  assignedMedic: string;
  lastUpdated: string;
  assessmentStatus: 'active' | 'saved' | 'completed' | 'cancelled';
}
