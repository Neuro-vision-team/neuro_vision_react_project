import type { Team } from "../app/types/team";

export type RiskLevel = 'low' | 'medium' | 'high';

export interface ScatSymptomItem {
  name: string;
  severity: number;
}

export interface ScatDetails {
  symptoms: ScatSymptomItem[];
  totalSymptomsCount: number;
  totalSeverityScore: number;
  worseWithActivity: boolean;
  worseWithMentalEffort: boolean;
  normalFeelingPercent: number;
  orientation: { month: boolean; date: boolean; day: boolean; year: boolean; time: boolean };
  immediateMemory: { trial1: number; trial2: number; trial3: number; total: number };
  concentration: { digitsBackward: number; monthsReverse: 'pass' | 'fail' };
  neuro: { speech: string; coordination: string; neckMovement: string; eyeTracking: string; gait: string; gcs?: number };
  bess: { doubleLeg: number; singleLeg: number; tandem: number; total: number; instabilityNotes: string; coordinationNotes: string };
  delayedRecall: { score: number; words: string[]; completionTimeSec: number };
}

export interface PlrDetails {
  capture: { testId: string; resolution: string; fps: number; ambientLight: string; flashIntensity: string; durationSec: number; detectionConfidence: number; environment: string; device: string };
  detection: { eyeConfidence: number; pupilConfidence: number; irisQuality: number; frameStability: number; trackingQuality: number };
  measurements: {
    baselineDiameter: number;
    constrictionVelocity: number;
    maximumConstriction: number;
    reflexLatencyMs: number;
    timeToMinDiameterMs: number;
    dilationVelocity: number;
    recoveryTimeMs: number;
    timeToBaselineMs: number;
  };
  quality: { stabilityScore: number; noiseLevel: number; motionInterference: number; lightingStability: number; reliability: number };
}

export interface FullAssessmentReport {
  reportMetadata: {
    reportId: string;
    sessionId: string;
    assessmentDate: string;
    startTime: string;
    endTime: string;
    totalDuration: string;
    status: string;
    version: string;
    language: string;
    generatedBy: string;
  };
  patientInfo: {
    fullName: string;
    patientId: string;
    age: number;
    gender: string;
    dateOfBirth: string;
    heightCm: number;
    weightKg: number;
    bloodType: string;
    teamName: string;
    organization: string;
    playerPosition: string;
    jerseyNumber: string;
    emergencyContactName: string;
    emergencyContactNumber: string;
  };
  incident: {
    incidentDate: string;
    incidentTime: string;
    incidentLocation: string;
    eventType: string;
    mechanism: string;
    shortNotes: string;
    witnessNotes: string;
  };
  examiner: { name: string; role: string; organization: string; signature: string; timestamp: string };
  emergencyScreening: {
    redFlags: Record<string, boolean>;
    emergencyDecision: 'Continue Evaluation' | 'Emergency Referral' | 'Hospital Transfer';
  };
  observableSigns: {
    signs: Record<string, boolean>;
    lossOfConsciousness: boolean;
    lossDuration: string;
    memoryLossPresent: boolean;
    memoryLossDuration: string;
  };
  scat5: ScatDetails;
  plr: PlrDetails;
  ai: {
    classification: 'Low Risk' | 'Moderate Risk' | 'High Risk';
    confidence: number;
    indicators: Record<string, boolean>;
    explanation: string;
    contributingFactors: string[];
  };
  decision: {
    recommendedAction: 'Continue Monitoring' | 'Remove From Activity' | 'Medical Referral' | 'Emergency Transfer';
    returnToPlay: 'Cleared' | 'Restricted' | 'Not Cleared';
    followUp: 'Reassessment in 24h' | 'Specialist Review' | 'Hospital Evaluation';
  };
  history: {
    previousAssessmentsCount: number;
    previousInjuryHistory: string;
    previousAiRiskLevels: string[];
    previousPlrAbnormalities: string[];
    improvementTrend: string;
    recoveryTrend: string;
    cognitiveTrend: string;
  };
  attachments: { plrVideo: string; eyeScanImages: string[]; incidentPhotos: string[]; medicalFiles: string[] };
  signatures: { examiner: string; patient: string; guardian: string; timestamp: string; qrCode: string };
  audit: { createdBy: string; lastUpdatedBy: string; deviceId: string; sessionLog: string; ipAddress: string };
  finalSummary: string;
}

export interface PlayerAssessment {
  id: string;
  teamName: string;
  playerName: string;
  injuryType: string;
  riskLevel: RiskLevel;
  notes: string;
  assessedAt: string;
  report: FullAssessmentReport;
}

const ASSESSMENTS_KEY = 'nv_player_assessments';
const BASELINE_KEY = 'nv_player_baselines';

function defaultSymptoms(base: RiskLevel): ScatSymptomItem[] {
  const factor = base === 'high' ? 4 : base === 'medium' ? 2 : 1;
  return [
    'Headache','Pressure in Head','Neck Pain','Nausea','Dizziness','Blurred Vision','Balance Problems','Light Sensitivity','Noise Sensitivity','Feeling Slowed Down','Brain Fog','Difficulty Concentrating','Difficulty Remembering','Fatigue','Confusion','Drowsiness','Emotional Changes','Irritability','Sadness','Anxiety','Sleep Problems'
  ].map((name, idx) => ({ name, severity: Math.min(6, (idx % 3) + factor - 1) }));
}

function createReport(seed: Omit<PlayerAssessment, 'id' | 'assessedAt' | 'report'>): FullAssessmentReport {
  const symptoms = defaultSymptoms(seed.riskLevel);
  const totalSeverityScore = symptoms.reduce((a, s) => a + s.severity, 0);
  const now = new Date().toISOString();

  return {
    reportMetadata: {
      reportId: `REP-${crypto.randomUUID().slice(0, 8)}`,
      sessionId: `SES-${crypto.randomUUID().slice(0, 8)}`,
      assessmentDate: now.slice(0, 10),
      startTime: now,
      endTime: now,
      totalDuration: '00:12:00',
      status: 'Completed',
      version: '1.0',
      language: 'EN',
      generatedBy: 'Neuro Vision System',
    },
    patientInfo: {
      fullName: seed.playerName,
      patientId: `P-${crypto.randomUUID().slice(0, 6)}`,
      age: 22,
      gender: 'Male',
      dateOfBirth: '2004-01-01',
      heightCm: 180,
      weightKg: 76,
      bloodType: 'O+',
      teamName: seed.teamName,
      organization: 'Neuro Vision Club',
      playerPosition: 'Midfielder',
      jerseyNumber: '10',
      emergencyContactName: 'Family Contact',
      emergencyContactNumber: '+1-555-0100',
    },
    incident: {
      incidentDate: now.slice(0, 10),
      incidentTime: now,
      incidentLocation: 'Main Stadium',
      eventType: 'Match',
      mechanism: 'Impact',
      shortNotes: seed.notes || 'No short notes.',
      witnessNotes: 'Witness observed impact and temporary disorientation.',
    },
    examiner: { name: 'Team Manager', role: 'Medical Team Manager', organization: 'Neuro Vision', signature: 'Signed Digitally', timestamp: now },
    emergencyScreening: {
      redFlags: { neckPain: false, vomiting: false, seizure: false, lossOfConsciousness: false, severeHeadache: seed.riskLevel !== 'low', confusion: seed.riskLevel !== 'low', weakness: false, doubleVision: false },
      emergencyDecision: seed.riskLevel === 'high' ? 'Emergency Referral' : 'Continue Evaluation',
    },
    observableSigns: {
      signs: { balanceProblems: true, blankStare: seed.riskLevel !== 'low', disorientation: seed.riskLevel !== 'low', slowResponse: true, emotionalInstability: false, visibleFacialInjury: false },
      lossOfConsciousness: false,
      lossDuration: '0s',
      memoryLossPresent: seed.riskLevel !== 'low',
      memoryLossDuration: seed.riskLevel === 'high' ? '5 min' : '1 min',
    },
    scat5: {
      symptoms,
      totalSymptomsCount: symptoms.filter((s) => s.severity > 0).length,
      totalSeverityScore,
      worseWithActivity: true,
      worseWithMentalEffort: true,
      normalFeelingPercent: seed.riskLevel === 'high' ? 42 : seed.riskLevel === 'medium' ? 68 : 88,
      orientation: { month: true, date: true, day: true, year: true, time: true },
      immediateMemory: { trial1: 5, trial2: 6, trial3: 6, total: 17 },
      concentration: { digitsBackward: 3, monthsReverse: 'pass' },
      neuro: { speech: 'Normal', coordination: 'Mildly Reduced', neckMovement: 'Normal', eyeTracking: 'Slight Delay', gait: 'Stable', gcs: 15 },
      bess: { doubleLeg: 1, singleLeg: 3, tandem: 2, total: 6, instabilityNotes: 'Mild single-leg sway', coordinationNotes: 'Adequate' },
      delayedRecall: { score: 4, words: ['apple', 'train', 'river', 'table'], completionTimeSec: 25 },
    },
    plr: {
      capture: { testId: `PLR-${crypto.randomUUID().slice(0, 8)}`, resolution: '1080p', fps: 60, ambientLight: 'Controlled', flashIntensity: 'Medium', durationSec: 8, detectionConfidence: 0.95, environment: 'Indoor', device: 'Mobile Camera' },
      detection: { eyeConfidence: 0.96, pupilConfidence: 0.94, irisQuality: 0.91, frameStability: 0.93, trackingQuality: 0.92 },
      measurements: { baselineDiameter: 4.2, constrictionVelocity: 2.8, maximumConstriction: 1.9, reflexLatencyMs: seed.riskLevel === 'high' ? 260 : 190, timeToMinDiameterMs: 520, dilationVelocity: 1.7, recoveryTimeMs: 980, timeToBaselineMs: 1450 },
      quality: { stabilityScore: 0.92, noiseLevel: 0.12, motionInterference: 0.09, lightingStability: 0.9, reliability: 0.93 },
    },
    ai: {
      classification: seed.riskLevel === 'high' ? 'High Risk' : seed.riskLevel === 'medium' ? 'Moderate Risk' : 'Low Risk',
      confidence: seed.riskLevel === 'high' ? 0.9 : 0.84,
      indicators: { delayedPLRResponse: seed.riskLevel !== 'low', weakConstriction: seed.riskLevel === 'high', abnormalDilation: seed.riskLevel !== 'low', cognitiveConcern: true, balanceConcern: true },
      explanation: 'AI model detected PLR delay and elevated SCAT-5 symptom burden.',
      contributingFactors: ['Reflex latency', 'Symptom severity score', 'BESS instability'],
    },
    decision: {
      recommendedAction: seed.riskLevel === 'high' ? 'Emergency Transfer' : 'Medical Referral',
      returnToPlay: seed.riskLevel === 'low' ? 'Restricted' : 'Not Cleared',
      followUp: seed.riskLevel === 'high' ? 'Hospital Evaluation' : 'Specialist Review',
    },
    history: {
      previousAssessmentsCount: 2,
      previousInjuryHistory: 'Previous mild concussion in last season.',
      previousAiRiskLevels: ['Low Risk', 'Moderate Risk'],
      previousPlrAbnormalities: ['Mild latency increase'],
      improvementTrend: 'Stable',
      recoveryTrend: 'Gradual improvement',
      cognitiveTrend: 'Slight decline vs last baseline',
    },
    attachments: { plrVideo: 'plr-video.mp4', eyeScanImages: ['eye-1.png'], incidentPhotos: ['incident-1.jpg'], medicalFiles: ['medical-note.pdf'] },
    signatures: { examiner: 'Digital Signature', patient: 'Digital Signature', guardian: 'N/A', timestamp: now, qrCode: `QR-${crypto.randomUUID().slice(0, 8)}` },
    audit: { createdBy: 'Medical Team Manager', lastUpdatedBy: 'Medical Team Manager', deviceId: 'NV-DEVICE-01', sessionLog: 'Session logged', ipAddress: '127.0.0.1' },
    finalSummary: `SCAT-5 and PLR indicate ${seed.riskLevel} risk profile. Recommend supervised follow-up and activity restriction.`
  };
}

function normalize(item: Partial<PlayerAssessment>): PlayerAssessment {
  const base = {
    id: item.id ?? crypto.randomUUID(),
    teamName: item.teamName ?? 'Unknown Team',
    playerName: item.playerName ?? 'Unknown Player',
    injuryType: item.injuryType ?? 'Concussion',
    riskLevel: (item.riskLevel ?? 'medium') as RiskLevel,
    notes: item.notes ?? '',
    assessedAt: item.assessedAt ?? new Date().toISOString(),
  };

  return {
    ...base,
    report: item.report ?? createReport(base),
  };
}

function seedDefaultAssessments() {
  const raw = localStorage.getItem(ASSESSMENTS_KEY);
  if (raw) return;

  const teamName = 'Sports Medicine Team';

  const seeds: Array<Omit<PlayerAssessment, 'id' | 'assessedAt' | 'report'>> = [
    {
      teamName,
      playerName: 'Omar El-Sayed',
      injuryType: 'Concussion',
      riskLevel: 'low',
      notes: 'Mild symptoms, stable vitals.',
    },
    {
      teamName,
      playerName: 'Hassan Al-Zahrani',
      injuryType: 'Head Impact',
      riskLevel: 'medium',
      notes: 'Transient dizziness and slower recall.',
    },
    {
      teamName,
      playerName: 'Yousef Nasser',
      injuryType: 'Neck Strain',
      riskLevel: 'medium',
      notes: 'Neck pain improved after rest.',
    },
    {
      teamName,
      playerName: 'Khalid Farouk',
      injuryType: 'Concussion (Severe)',
      riskLevel: 'high',
      notes: 'Elevated SCAT-5 symptoms and delayed PLR reflex.',
    },
  ];

  const now = Date.now();
  const entries: PlayerAssessment[] = seeds.map((s, idx) => {
    const assessedAt = new Date(now - idx * 1000 * 60 * 60 * 24).toISOString();
    const base: PlayerAssessment = normalize({
      ...s,
      assessedAt,
      id: crypto.randomUUID(),
    });
    return base;
  });

  save(entries);
}

function parse(): PlayerAssessment[] {
  try {
    seedDefaultAssessments();


    const raw = localStorage.getItem(ASSESSMENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Partial<PlayerAssessment>[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalize);
  } catch {
    return [];
  }
}


function save(items: PlayerAssessment[]) {
  localStorage.setItem(ASSESSMENTS_KEY, JSON.stringify(items));
}

export function addAssessment(input: Omit<PlayerAssessment, 'id' | 'assessedAt' | 'report'> & { report?: FullAssessmentReport }) {
  const entry: PlayerAssessment = normalize({
    ...input,
    report: input.report,
    id: crypto.randomUUID(),
    assessedAt: new Date().toISOString(),
  });

  save([entry, ...parse()]);
  return entry;
}

export function getAssessmentHistory(teamName: string, playerName: string) {
  return parse().filter((a) => a.teamName === teamName && a.playerName === playerName);
}

export function getTeamAssessments(teamName: string) {
  return parse().filter((a) => a.teamName === teamName);
}

export function getAllAssessments() {
  return parse();
}

export function setPlayerBaseline(teamName: string, playerName: string, assessment: PlayerAssessment) {
  const raw = localStorage.getItem(BASELINE_KEY);
  const all = raw ? (JSON.parse(raw) as Record<string, PlayerAssessment>) : {};
  all[`${teamName}::${playerName}`] = assessment;
  localStorage.setItem(BASELINE_KEY, JSON.stringify(all));
}

export function getPlayerBaseline(teamName: string, playerName: string): PlayerAssessment | null {
  const raw = localStorage.getItem(BASELINE_KEY);
  const all = raw ? (JSON.parse(raw) as Record<string, Partial<PlayerAssessment>>) : {};
  const found = all[`${teamName}::${playerName}`];
  return found ? normalize(found) : null;
}

export function seedTemporaryMedicalDemoData(team: Team) {
  if (typeof window === "undefined") return;

  const assessmentsRaw = window.localStorage.getItem(ASSESSMENTS_KEY);
  const baselinesRaw = window.localStorage.getItem(BASELINE_KEY);

  const assessments = assessmentsRaw ? (JSON.parse(assessmentsRaw) as Partial<PlayerAssessment>[]).map(normalize) : [];
  const baselines = baselinesRaw ? (JSON.parse(baselinesRaw) as Record<string, Partial<PlayerAssessment>>) : {};

  let didChange = false;
  const now = Date.now();

  team.players.forEach((player, playerIndex) => {
    const baselineKey = `${team.teamName}::${player.fullName}`;
    const existingPlayerAssessments = assessments.filter((entry) => entry.teamName === team.teamName && entry.playerName === player.fullName);

    if (!baselines[baselineKey]) {
      baselines[baselineKey] = normalize({
        teamName: team.teamName,
        playerName: player.fullName,
        injuryType: "Baseline Screening",
        riskLevel: "low",
        notes: "Temporary demo baseline for testing Medical Info and Compare.",
        assessedAt: new Date(now - (playerIndex + 14) * 86400000).toISOString(),
        id: crypto.randomUUID(),
      });
      didChange = true;
    }

    const templates = [
      {
        injuryType: "Training Collision",
        riskLevel: "low" as RiskLevel,
        notes: "Mild symptoms with stable balance and quick recovery.",
      },
      {
        injuryType: "Head Impact Review",
        riskLevel: "medium" as RiskLevel,
        notes: "Compare this card with the baseline to see the difference in risk indicators.",
      },
      {
        injuryType: "Post-Match Check",
        riskLevel: "high" as RiskLevel,
        notes: "Temporary demo case to highlight the compare and export flow.",
      },
    ];

    const missingCount = Math.max(0, 3 - existingPlayerAssessments.length);
    if (missingCount > 0) {
      const newAssessments = templates.slice(0, missingCount).map((template, assessmentIndex) =>
        normalize({
          teamName: team.teamName,
          playerName: player.fullName,
          injuryType: template.injuryType,
          riskLevel: template.riskLevel,
          notes: template.notes,
          assessedAt: new Date(now - (playerIndex * 4 + assessmentIndex + 1) * 86400000).toISOString(),
          id: crypto.randomUUID(),
        }),
      );

      assessments.push(...newAssessments);
      didChange = true;
    }
  });

  if (didChange) {
    window.localStorage.setItem(ASSESSMENTS_KEY, JSON.stringify(assessments));
    window.localStorage.setItem(BASELINE_KEY, JSON.stringify(baselines));
  }
}
