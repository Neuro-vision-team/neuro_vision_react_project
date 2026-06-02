import { useState } from "react";
import { Card, CardContent } from "../app/components/UI/card";
import { Button } from "../app/components/UI/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../app/components/UI/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../app/components/UI/tabs";
import { Download } from "lucide-react";
import {
  Line
} from 'react-chartjs-2';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { useUiStore } from "../store/uiStore";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

interface Player {
  id: string;
  name: string;
  team: string;
  injury?: string;
  risk?: string;
  date?: string;
}

interface MedicalReport {
  plr: {
    videos: {
      title: string;
      videoUrl: string;
      thumbnail: string;
    }[];
    charts: string[];
    plrData: {
      leftEye: Array<{ text: string; value?: number }>;
      rightEye: Array<{ text: string; value?: number }>;
    };
  };
  scatOnField: {
    redFlags: Array<{ text: string; value?: number }>;
    observableSigns: string[];
    gcsAttempts: string[];
    cervicalSpineScreen: string[];
    coordinationScreen: Array<{ text: string; value?: number }>;
    maddocksScore: number;
  };
  scatOffField: {
    // Add off-field data structure as needed
  };
}

const mockPlayers: Player[] = [
  {
    id: "1",
    name: "Mohamed Salah",
    team: "Liverpool FC",
    injury: "Concussion",
    risk: "High",
    date: "2026-05-28"
  },
  {
    id: "2",
    name: "Kevin De Bruyne",
    team: "Manchester City",
    injury: "Head Impact",
    risk: "Medium",
    date: "2026-05-27"
  },
  {
    id: "3",
    name: "Harry Kane",
    team: "Bayern Munich",
    injury: "Suspected Concussion",
    risk: "High",
    date: "2026-05-26"
  }
];

const mockReport: MedicalReport = {
  plr: {
    videos: [
      {
        title: "Left Eye Recording",
        videoUrl: "/videos/left-eye.mp4",
        thumbnail: "/images/no-video.png",
      },
      {
        title: "Right Eye Recording",
        videoUrl: "/videos/right-eye.mp4",
        thumbnail: "/images/no-video.png",
      },
    ],
    charts: ["Chart 1 - Left Eye", "Chart 2 - Right Eye"],
    plrData: {
      leftEye: [
        { text: "Max Diameter" },
        { text: "Min Diameter" },
        { text: "Latency" },
        { text: "Constriction Velocity (CV)" },
        { text: "Dilation Velocity (ADV)" },
        { text: "T75 Recovery Time" },
        { text: "Constriction Percent" },
      ],

      rightEye: [
        { text: "Max Diameter" },
        { text: "Min Diameter" },
        { text: "Latency" },
        { text: "Constriction Velocity (CV)" },
        { text: "Dilation Velocity (ADV)" },
        { text: "T75 Recovery Time" },
        { text: "Constriction Percent" },
      ],
    },
  },
  scatOnField: {
    redFlags: [
      { text: "Neck pain or tenderness", value: 0 },
      { text: "Double vision", value: 0 },
      { text: "Weakness or tingling/burning", value: 1 },
      { text: "Severe or increasing headache", value: 0 }
    ],
    observableSigns: [
      "Lying motionless on ground",
      "Facial injury after head trauma",
      "Dazed, blank or vacant look"
    ],
    gcsAttempts: [
      "Eye response: 4",
      "Verbal response: 5",
      "Motor response: 6"
    ],
    cervicalSpineScreen: [
      "No midline tenderness",
      "Full range of motion",
      "No neurological deficits"
    ],
    coordinationScreen: [
      { text: "Finger to nose test", value: 1 },
      { text: "Tandem gait", value: 0 }
    ],
    maddocksScore: 4
  },
  scatOffField: {}
};

export default function AssessmentsPage() {
  const theme = useUiStore((state) => state.theme);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleViewDetails = (player: Player) => {
    setSelectedPlayer(player);
    setIsDialogOpen(true);
  };

  const handleExportPDF = () => {
    const printWindow = window.open("", "_blank", "width=900,height=650");
    if (!printWindow || !selectedPlayer) return;

    const { name, team, injury, date } = selectedPlayer;

    const content = `
  <!DOCTYPE html>
  <html>
    <head>
      <title>Medical Report - ${name}</title>

      <style>
        * {
          box-sizing: border-box;
        }

        body {
          font-family: Arial, sans-serif;
          padding: 30px;
          color: #111;
          background: #fff;
        }

        h1 {
          font-size: 26px;
          margin-bottom: 5px;
        }

        h2 {
          font-size: 18px;
          margin-top: 30px;
          padding-bottom: 6px;
          border-bottom: 2px solid #222;
        }

        h3 {
          font-size: 14px;
          margin-top: 18px;
          color: #333;
        }

        .header {
          margin-bottom: 25px;
          padding-bottom: 15px;
          border-bottom: 1px solid #ddd;
        }

        .meta {
          font-size: 13px;
          margin: 3px 0;
        }

        .section {
          margin-bottom: 35px;
          page-break-inside: avoid;
        }

        .card {
          border: 1px solid #e5e5e5;
          border-radius: 6px;
          padding: 10px 12px;
          margin-bottom: 6px;
          display: flex;
          justify-content: space-between;
          font-size: 13px;
        }

        .value {
          color: #333;
          font-weight: 500;
        }

        .label {
          color: #666;
        }

        .score {
          font-size: 22px;
          font-weight: bold;
          padding: 12px;
          text-align: center;
          border: 2px solid #111;
          border-radius: 8px;
          width: fit-content;
        }

        .badge {
          display: inline-block;
          padding: 6px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
          margin-top: 10px;
        }

        .high {
          background: #fee2e2;
          color: #b91c1c;
        }

        .medium {
          background: #fef3c7;
          color: #b45309;
        }

        @media print {
          body {
            padding: 15px;
          }
        }
      </style>
    </head>

    <body>

      <!-- HEADER -->
      <div class="header">
        <h1>Medical Report</h1>
        <div class="meta"><strong>Player:</strong> ${name}</div>
        <div class="meta"><strong>Team:</strong> ${team}</div>
        <div class="meta"><strong>Injury:</strong> ${injury ?? "-"}</div>
        <div class="meta"><strong>Date:</strong> ${date ?? "-"}</div>
      </div>

      <!-- PLR -->
      <div class="section">
        <h2>PLR (Pupillary Light Reflex)</h2>

        <h3>Videos</h3>
       ${mockReport.plr.videos.map(video => `
  <div class="item" style="display:block">
    <p><strong>${video.title}</strong></p>

    <img
      src="${video.thumbnail}"
      style="
        width: 250px;
        margin-top: 10px;
        border-radius: 8px;
      "
    />
  </div>
`).join('')}

        <h3>Charts</h3>
        ${mockReport.plr.charts
        .map(c => `<div class="card"><span class="label">${c}</span></div>`)
        .join("")}

        <h3>PLR Data</h3>
      <h3>Left Eye</h3>
${mockReport.plr.plrData.leftEye
        .map(
          (v) => `
      <div class="card">
        <span class="label">${v.text}</span>
        <span class="value">${v.value ?? "-"}</span>
      </div>
    `
        )
        .join("")}

<h3>Right Eye</h3>
${mockReport.plr.plrData.rightEye
        .map(
          (v) => `
      <div class="card">
        <span class="label">${v.text}</span>
        <span class="value">${v.value ?? "-"}</span>
      </div>
    `
        )
        .join("")}
      </div>

      <!-- SCAT -->
      <div class="section">
        <h2>SCAT-5 On-Field Assessment</h2>

        <h2>Red Flags</h2>
        ${mockReport.scatOnField.redFlags
        .map(
          f => `
            <div class="card">
              <span class="label">${f.text}</span>
              <span class="value">${f.value ?? 0}</span>
            </div>`
        )
        .join("")}

        <h2>Observable Signs</h2>
        ${mockReport.scatOnField.observableSigns
        .map(s => `<div class="card"><span class="label">${s}</span></div>`)
        .join("")}

        <h2>GCS</h2>
        ${mockReport.scatOnField.gcsAttempts
        .map(g => `<div class="card"><span class="label">${g}</span></div>`)
        .join("")}

        <h2>Cervical Spine</h2>
        ${mockReport.scatOnField.cervicalSpineScreen
        .map(c => `<div class="card"><span class="label">${c}</span></div>`)
        .join("")}

        <h2>Coordination</h2>
        ${mockReport.scatOnField.coordinationScreen
        .map(
          c => `
            <div class="card">
              <span class="label">${c.text}</span>
              <span class="value">${c.value}</span>
            </div>`
        )
        .join("")}

        <h2>Maddocks Score</h2>
        <div class="score">${mockReport.scatOnField.maddocksScore}</div>

        ${mockReport.scatOnField.maddocksScore >= 4
        ? `<div class="badge high">HIGH RISK</div>`
        : `<div class="badge medium">MEDIUM RISK</div>`
      }
      </div>

      <!-- FOOTER -->
      <div class="section">
        <h2>SCAT-5 Off-Field Assessment</h2>
        <p style="color:#666;">No off-field data available.</p>
      </div>

    </body>
  </html>
  `;

    printWindow.document.open();
    printWindow.document.write(content);
    printWindow.document.close();

    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
  };
const leftEyeChartData = {
  labels: [
    '0s',
    '1s',
    '2s',
    '3s',
    '4s',
    '5s',
    '6s',
    '7s',
    '8s',
    '9s',
  ],

  datasets: [
   {
  label: 'Left Eye Baseline',

  data: [
    2.1,
    2.4,
    2.8,
    3.0,
    2.7,
    4.2,
    3.8,
    5.1,
    5.4,
    5.0,
  ],

  borderColor: '#2563EB',

  backgroundColor: '#2563EB',

  borderWidth: 3,

  tension: 0.35,

  pointRadius: 4,

  pointHoverRadius: 8,
}
  ],
  
};
const rightEyeChartData = {
  labels: [
    '0s',
    '1s',
    '2s',
    '3s',
    '4s',
    '5s',
    '6s',
    '7s',
    '8s',
    '9s',
  ],

  datasets: [
   {
  label: 'Right Eye Baseline',

  data: [
    2.1,
    2.4,
    2.8,
    3.0,
    2.7,
    4.2,
    3.8,
    5.1,
    5.4,
    5.0,
  ],

  borderColor: '#2563EB',

  backgroundColor: '#2563EB',

  borderWidth: 3,

  tension: 0.35,

  pointRadius: 4,

  pointHoverRadius: 8,
}
  ],
};
const chartOptions = {
  responsive: true,

  plugins: {
    legend: {
      labels: {
        color: theme === 'light' ? '#0f2238' : 'white',
      },
    },
  },

  scales: {
    x: {
      ticks: {
        color: theme === 'light' ? '#4b607a' : '#94A3B8',
      },
      grid: {
        color: theme === 'light' ? '#d5e3f2' : '#1E293B',
      },
    },

    y: {
      ticks: {
        color: theme === 'light' ? '#4b607a' : '#94A3B8',
      },
      grid: {
        color: theme === 'light' ? '#d5e3f2' : '#1E293B',
      },
    },
  },
};
  return (
    <div className="theme-page min-h-screen">

      <div className="min-h-screen flex justify-center items-start pt-10">

        {/* Assessments Table */}
        <Card className="theme-panel w-full max-w-5xl overflow-hidden rounded-2xl">
          <CardContent className="p-0">
            <div className="border-b p-4">
              <h3 className="text-sm font-semibold">All BaseLine Exams ({mockPlayers.length})</h3>
            </div>
            {mockPlayers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="theme-table">
                  <thead>
                    <tr>
                      <th>Player</th>
                      <th>Injury</th>
                      <th>Risk</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockPlayers.map((player) => (
                      <tr key={player.id}>
                        <td>
                          <div>
                            <p className="text-sm font-semibold">{player.name}</p>
                            <p className="text-xs theme-muted">{player.team}</p>
                          </div>
                        </td>
                        <td className="text-sm">{player.injury}</td>
                        <td>
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${player.risk === "High"
                              ? "border-red-400/30 bg-red-500/15 text-red-400"
                              : "border-yellow-400/30 bg-yellow-500/15 text-yellow-400"
                              }`}
                          >
                            {player.risk}
                          </span>
                        </td>
                        <td className="text-sm theme-muted">{player.date}</td>
                        <td>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(player)}
                          >
                            Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-sm theme-muted">
                No assessments found for this team.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Medical Report Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="theme-panel max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between gap-2 pr-8">
              <div className="flex-1">
                <DialogTitle>
                  Medical Report - {selectedPlayer?.name}
                </DialogTitle>
                <DialogDescription>
                  {selectedPlayer?.team}
                </DialogDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPDF}
                className="flex items-center gap-1.5 h-7 px-2.5 text-xs"
              >
                <Download className="size-3.5" />
                Export PDF
              </Button>
            </div>
          </DialogHeader>

          <Tabs defaultValue="plr" className="w-full">
            <TabsList className="theme-card w-full">
              <TabsTrigger value="plr" className="flex-1">PLR</TabsTrigger>
              <TabsTrigger value="scat-on" className="flex-1">SCAT-5 On-Field</TabsTrigger>
              <TabsTrigger value="scat-off" className="flex-1">SCAT-5 Off-Field</TabsTrigger>
            </TabsList>

            {/* PLR Tab */}
            <TabsContent value="plr" className="space-y-6 mt-6">
              <div>
                <h2 className="text-2xl font-semibold mb-6 text-white">
                  Videos
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {mockReport.plr.videos.map((video, idx) => (
                    <div
                      key={idx}
                      className="theme-card overflow-hidden rounded-lg border transition-colors hover:opacity-90"
                    >
                      <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex flex-col items-center justify-center relative">
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors"></div>
                        <video
                          controls
                          className="w-full h-full object-cover"
                        >
                          <source src={video.videoUrl} />
                        </video>
                        <p className="text-xs text-gray-400 mt-3 relative z-10">00:00 / 02:45</p>
                      </div>
                      <div className="p-3 border-t border-gray-700/50">
                        <p className="text-sm text-gray-300">{video.title}</p>
                        <p className="text-xs text-gray-500 mt-1">Recorded: {selectedPlayer?.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-semibold mb-6 text-white">
                  Charts
                </h2>
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

  {/* Left Eye */}
  <div className="theme-card rounded-xl border p-4">
    <h3 className="mb-4 text-lg font-semibold text-white">
      Left Eye Analysis
    </h3>
<Line data={leftEyeChartData} options={chartOptions} />
  </div>

  {/* Right Eye */}
  <div className="theme-card rounded-xl border p-4">
    <h3 className="mb-4 text-lg font-semibold text-white">
      Right Eye Analysis
    </h3>

    <Line data={rightEyeChartData} options={chartOptions} />
  </div>

</div>
              </div>

              <div>
                <h2 className="text-2xl font-semibold mb-6 text-white">
                  PLR Results :
                </h2>
                <h3 className="mb-4">Left Eye</h3>

                <div className="grid grid-cols-2 gap-4">
                  {mockReport.plr.plrData.leftEye.map((item, idx) => (
                    <div key={idx} className="space-y-2">
                      <label className="text-sm text-gray-400">
                        {item.text}
                      </label>

                      <div className="bg-gray-800/50 border border-gray-700 rounded-md px-3 py-2 text-sm text-white min-h-[40px]">
                        {item.value || "-"}
                      </div>
                    </div>
                  ))}
                </div>

                <h3 className="mb-4 mt-8">Right Eye</h3>

                <div className="grid grid-cols-2 gap-4">
                  {mockReport.plr.plrData.rightEye.map((item, idx) => (
                    <div key={idx} className="space-y-2">
                      <label className="text-sm text-gray-400">
                        {item.text}
                      </label>

                      <div className="bg-gray-800/50 border border-gray-700 rounded-md px-3 py-2 text-sm text-white min-h-[40px]">
                        {item.value || "-"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* SCAT-5 On-Field Tab */}
            <TabsContent value="scat-on" className="space-y-6 mt-6">
              <div>
                <h3 className="mb-4">Red Flags</h3>
                <div className="space-y-2">
                  {mockReport.scatOnField.redFlags.map((flag, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-gray-800/50 border border-gray-700 rounded-lg p-3"
                    >
                      <span className="text-sm">{flag.text}</span>
                      <span className="text-sm text-gray-400">{flag.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-4">Observable Signs</h3>
                <div className="space-y-2">
                  {mockReport.scatOnField.observableSigns.map((sign, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-800/50 border border-gray-700 rounded-lg p-3"
                    >
                      <span className="text-sm">{sign}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-4">GCS Attempts</h3>
                <div className="space-y-2">
                  {mockReport.scatOnField.gcsAttempts.map((attempt, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-800/50 border border-gray-700 rounded-lg p-3"
                    >
                      <span className="text-sm">{attempt}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-4">Cervical Spine Screen</h3>
                <div className="space-y-2">
                  {mockReport.scatOnField.cervicalSpineScreen.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-800/50 border border-gray-700 rounded-lg p-3"
                    >
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-4">Coordination Screen</h3>
                <div className="space-y-2">
                  {mockReport.scatOnField.coordinationScreen.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-gray-800/50 border border-gray-700 rounded-lg p-3"
                    >
                      <span className="text-sm">{item.text}</span>
                      <span className="text-sm text-gray-400">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-4">Maddocks Score</h3>
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                  <p className="text-2xl">{mockReport.scatOnField.maddocksScore}</p>
                </div>
              </div>
            </TabsContent>

            {/* SCAT-5 Off-Field Tab */}
            <TabsContent value="scat-off" className="space-y-6 mt-6">
              <div className="text-center py-12 text-gray-400">
                <p>Off-field assessment data will be displayed here</p>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
