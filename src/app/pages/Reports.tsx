import { useState } from "react";
import { MedicalReports, type MedicalReport } from "../components/MedicalReports";

export const Reports = () => {
  const [medicalReports] = useState<MedicalReport[] | null>([
    {
      report_id: "R-001",
      athlete_name: "علي حسن",
      exam_type: "فحص عصبي بصري",
      report_date: "2026-05-14",
      risk_level: "Medium",
      action_text: "متابعة خلال 72 ساعة",
      profile: {
        age: 22,
        sport: "كرة قدم",
        team: "ASPU A",
      },
      vitals: {
        heart_rate: "78 bpm",
        sleep: "6.8 h",
        stress: "52%",
      },
      ai: {
        neuro_vision_score: 61,
        recommendation: "Rest Required",
      },
      recovery_trend: [
        { date: "2026-04-20", score: 45 },
        { date: "2026-04-28", score: 52 },
        { date: "2026-05-06", score: 57 },
        { date: "2026-05-14", score: 61 },
      ],
    },
  ]);

  return <MedicalReports medicalReports={medicalReports} />;
};
