import { useMemo, useState } from 'react';

import { getSessionUser } from '../services/authMock';
import { getTeamAssessments, type PlayerAssessment } from '../services/assessmentHistoryMock';

export default function AssessmentsPage() {
  const session = getSessionUser();

  const history = useMemo(
    () => (session?.teamName ? getTeamAssessments(session.teamName) : []),
    [session?.teamName]
  );

  const [selectedAssessment, setSelectedAssessment] =
    useState<PlayerAssessment | null>(null);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Assessments</h1>

      <div className="theme-panel overflow-hidden rounded-2xl border">
        <table className="theme-table text-sm">
          <thead>
            <tr>
              <th>Player</th>
              <th>Injury</th>
              <th>Risk</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            {history.map((item) => (
              <tr
                key={item.id}
                onClick={() => setSelectedAssessment(item)}
                className="cursor-pointer"
              >
                <td>{item.playerName}</td>
                <td>{item.injuryType}</td>
                <td>{item.riskLevel}</td>
                <td>{new Date(item.assessedAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedAssessment ? (
        <div className="theme-card rounded-xl border p-4 text-sm">
          <p className="font-semibold">{selectedAssessment.playerName}</p>
          <p className="theme-muted">
            {selectedAssessment.injuryType} - {selectedAssessment.riskLevel}
          </p>
        </div>
      ) : null}
    </div>
  );
}
