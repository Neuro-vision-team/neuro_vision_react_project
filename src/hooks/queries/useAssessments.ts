import { useQuery } from '@tanstack/react-query';
import {
  getAssessments,
  getAssessment,
  getAssessmentReport,
  getAssessmentPlr,
  getAssessmentScatOnField,
  getAssessmentScatOffField,
  compareAssessments,
} from '../../services/api/assessments.api';
import { getManagerAssessments } from '../../services/api/manager.api';
import { mapAssessment, mapPaginatedAssessments } from '../../mappers/assessment.mapper';
import { mapAssessmentReport } from '../../mappers/report.mapper';
import { mapPlrTests } from '../../mappers/plr.mapper';
import { mapScatOnField, mapScatOffField } from '../../mappers/scat.mapper';
import { getStoredSessionUser } from '../../services/api/auth-session';
import { QUERY_KEYS } from '../queryKeys';
import type { AssessmentsParams } from '../../types/assessment';

/** Role-aware assessment list */
export function useAssessments(params: AssessmentsParams = {}) {
  const user    = getStoredSessionUser();
  const isAdmin = user?.role === 'Admin';

  return useQuery({
    queryKey: isAdmin
      ? QUERY_KEYS.assessments(params)
      : QUERY_KEYS.managerAssessments(params),
    queryFn: () =>
      isAdmin
        ? getAssessments(params).then(mapPaginatedAssessments)
        : getManagerAssessments(params).then(mapPaginatedAssessments),
  });
}

export function useAssessment(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.assessment(id),
    queryFn:  () => getAssessment(id).then(mapAssessment),
    enabled:  !!id,
  });
}

export function useAssessmentReport(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.assessmentReport(id),
    queryFn:  () => getAssessmentReport(id).then(mapAssessmentReport),
    enabled:  !!id,
  });
}

export function useAssessmentPlr(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.assessmentPlr(id),
    queryFn:  () => getAssessmentPlr(id).then(mapPlrTests),
    enabled:  !!id,
  });
}

export function useAssessmentScatOnField(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.assessmentScatOn(id),
    queryFn:  () =>
      getAssessmentScatOnField(id).then((raw) => (raw ? mapScatOnField(raw) : null)),
    enabled:  !!id,
  });
}

export function useAssessmentScatOffField(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.assessmentScatOff(id),
    queryFn:  () =>
      getAssessmentScatOffField(id).then((raw) => (raw ? mapScatOffField(raw) : null)),
    enabled:  !!id,
  });
}

export function useCompareAssessments(ids: [string, string] | null) {
  return useQuery({
    queryKey: ids ? QUERY_KEYS.compareAssessments(ids) : ['compare-assessments-disabled'],
    queryFn:  () => compareAssessments(ids!),
    enabled:  !!ids && ids[0] !== '' && ids[1] !== '',
  });
}
