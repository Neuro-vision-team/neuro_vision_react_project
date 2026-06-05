import type { ScatOnFieldRaw, ScatOnField, ScatOffFieldRaw, ScatOffField } from '../types/scat';

export function mapScatOnField(raw: ScatOnFieldRaw): ScatOnField {
  return {
    id:                  String(raw.id),
    assessmentId:        String(raw.assessment_id),
    redFlags:            raw.red_flags,
    observableSigns:     raw.observable_signs,
    gcsAttempts:         raw.gcs_attempts,
    cervicalSpineScreen: raw.cervical_spine_screen,
    maddocksScore:       raw.maddocks_score,
    createdAt:           raw.created_at,
  };
}

export function mapScatOffField(raw: ScatOffFieldRaw): ScatOffField {
  return {
    id:                     String(raw.id),
    assessmentId:           String(raw.assessment_id),
    symptomsDetails:        raw.symptoms_details,
    totalSymptomsCount:     raw.total_symptoms_count,
    symptomsSeverityScore:  raw.symptoms_severity_score,
    orientationScore:       raw.orientation_score,
    immediateMemoryTrials:  raw.immediate_memory_trials,
    immediateMemoryTotal:   raw.immediate_memory_total,
    digitsBackwardScore:    raw.digits_backward_score,
    monthsBackwardScore:    raw.months_backward_score,
    concentrationTotalScore: raw.concentration_total_score,
    coordinationScreen:     raw.coordination_screen,
    mbessErrorsDetails:     raw.mbess_errors_details,
    mbessTotal:             raw.mbess_total_errors,
    delayedRecallScore:     raw.delayed_recall_score,
    cognitiveTotalScore:    raw.cognitive_total_score,
    concussionDiagnosed:    raw.concussion_diagnosed,
    clinicalNotes:          raw.clinical_notes,
    createdAt:              raw.created_at,
  };
}
