import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Edit3, Heart, Image as ImageIcon, Plus, Stethoscope, Users, Zap } from 'lucide-react';
import { Pie } from 'react-chartjs-2';
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import { getSessionUser } from '../services/authMock';
import { createPlayer, getTeamById, isJerseyNumberUniqueInTeam, updatePlayer, updateTeam } from '../app/data/teams';
import { useI18n } from '../app/i18n';
import type { Player, PlayerFormInput, Team, TeamFormInput } from '../app/types/team';

ChartJS.register(ArcElement, Tooltip, Legend);

const defaultPlayerForm: PlayerFormInput = {
  photo: '',
  fullName: '',
  shirtName: '',
  dateOfBirth: '',
  nationality: '',
  gender: 'Male',
  heightCm: 0,
  weightKg: 0,
  jerseyNumber: 0,
  preferredSide: 'Right',
  joinDate: new Date().toISOString().slice(0, 10),
  phoneCountryCode: '+963',
  phoneNumber: '',
  email: '',
  guardianName: '',
  status: 'Active',
  position: '',
};

const teamToForm = (team: Team): TeamFormInput => ({
  teamName: team.teamName,
  teamLogo: team.teamLogo,
  sportType: team.sportType,
  ageCategory: team.ageCategory,
  teamGender: team.teamGender,
  country: team.country,
  city: team.city,
  affiliatedClub: team.affiliatedClub || '',
  foundedYear: team.foundedYear,
  coachName: team.coachName,
  phoneCountryCode: team.phoneCountryCode,
  phoneNumber: team.phoneNumber,
  contactEmail: team.contactEmail,
  medicalStaffName: team.medicalStaffName || '',
  medicalStaffEmail: team.medicalStaffEmail || '',
  medicalStaffPassword: team.medicalStaffPassword || '',
  loginEmail: team.loginEmail,
  password: team.password,
  teamStatus: team.teamStatus,
  subscriptionType: team.subscriptionType,
  permissions: team.permissions,
});

const playerToForm = (player: Player): PlayerFormInput => ({
  photo: player.photo || '',
  fullName: player.fullName,
  shirtName: player.shirtName,
  dateOfBirth: player.dateOfBirth,
  nationality: player.nationality,
  gender: player.gender,
  heightCm: player.heightCm,
  weightKg: player.weightKg,
  jerseyNumber: player.jerseyNumber,
  preferredSide: player.preferredSide,
  joinDate: player.joinDate,
  phoneCountryCode: player.phoneCountryCode,
  phoneNumber: player.phoneNumber,
  email: player.email || '',
  guardianName: player.guardianName || '',
  status: player.status,
  position: player.position,
});

export default function MedicalTeamPage() {
  const { t, isArabic } = useI18n();
  const navigate = useNavigate();
  const session = getSessionUser();

  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [playerEditorOpen, setPlayerEditorOpen] = useState(false);
  const [staffEditorOpen, setStaffEditorOpen] = useState(false);
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [playerForm, setPlayerForm] = useState<PlayerFormInput>(defaultPlayerForm);
  const [staffForm, setStaffForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadTeam = async () => {
    if (!session?.teamId) {
      navigate('/auth/login', { replace: true });
      return;
    }

    try {
      const teamData = await getTeamById(session.teamId);
      setTeam(teamData ?? null);
      if (teamData) {
        setStaffForm({
          name: teamData.medicalStaffName || '',
          email: teamData.medicalStaffEmail || '',
          password: teamData.medicalStaffPassword || '',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.teamId]);

  const stats = useMemo(() => {
    const players = team?.players ?? [];
    return {
      total: players.length,
      active: players.filter((player) => player.status === 'Active').length,
      injured: players.filter((player) => player.status === 'Injured').length,
    };
  }, [team?.players]);

  const riskData = {
    labels: [t('Active'), t('Injured')],
    datasets: [
      {
        data: [stats.active, stats.injured],
        backgroundColor: ['#10B981', '#F43F5E'],
        borderWidth: 0,
      },
    ],
  };

  const patchPlayer = <K extends keyof PlayerFormInput>(key: K, value: PlayerFormInput[K]) => {
    setPlayerForm((prev) => ({ ...prev, [key]: value }));
  };

  const openAddPlayer = () => {
    setError('');
    setMessage('');
    setEditingPlayerId(null);
    setPlayerForm({ ...defaultPlayerForm, phoneCountryCode: team?.phoneCountryCode || '+963' });
    setPlayerEditorOpen(true);
    setStaffEditorOpen(false);
    setDetailsOpen(true);
  };

  const openEditPlayer = (player: Player) => {
    setError('');
    setMessage('');
    setEditingPlayerId(player.id);
    setPlayerForm(playerToForm(player));
    setPlayerEditorOpen(true);
    setStaffEditorOpen(false);
    setDetailsOpen(true);
  };

  const savePlayer = async () => {
    if (!team) return;
    setError('');

    if (!playerForm.fullName.trim()) return setError(t('Full name is required'));
    if (!playerForm.dateOfBirth) return setError(t('Date of birth is required'));
    if (!playerForm.jerseyNumber) return setError(t('Jersey number is required'));
    if (!isJerseyNumberUniqueInTeam(team.id, playerForm.jerseyNumber, editingPlayerId || undefined)) {
      return setError(t('Jersey number already exists in this team'));
    }

    try {
      if (editingPlayerId) await updatePlayer(team.id, editingPlayerId, playerForm);
      else await createPlayer(team.id, playerForm);
      await loadTeam();
      setPlayerEditorOpen(false);
      setMessage(editingPlayerId ? t('Player updated.') : t('Player added.'));
    } catch (e) {
      setError(e instanceof Error ? e.message : t('Player save failed'));
    }
  };

  const saveMedicalStaff = async () => {
    if (!team) return;
    setError('');

    if (!staffForm.name.trim()) return setError(t('Medical staff name is required'));
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(staffForm.email)) return setError(t('Invalid medical staff email'));
    if (!staffForm.password.trim()) return setError(t('Medical staff password is required'));

    try {
      await updateTeam(team.id, {
        ...teamToForm(team),
        medicalStaffName: staffForm.name.trim(),
        medicalStaffEmail: staffForm.email.trim(),
        medicalStaffPassword: staffForm.password,
      });
      await loadTeam();
      setStaffEditorOpen(false);
      setMessage(t('Medical staff updated.'));
    } catch (e) {
      setError(e instanceof Error ? e.message : t('Medical staff update failed'));
    }
  };

  if (loading) {
    return <div className="theme-panel h-64 animate-pulse rounded-3xl border" />;
  }

  if (!team) {
    return (
      <div className="theme-panel rounded-2xl border p-8 text-center" dir={isArabic ? 'rtl' : 'ltr'}>
        <p className="text-rose-500">{t('Team not found.')}</p>
      </div>
    );
  }

  const players = [...(team.players ?? [])].sort((left, right) => left.jerseyNumber - right.jerseyNumber || left.fullName.localeCompare(right.fullName));

  return (
    <div className="theme-page space-y-6" dir={isArabic ? 'rtl' : 'ltr'}>
      <button
        type="button"
        onClick={() => setDetailsOpen((open) => !open)}
        className="theme-panel relative w-full overflow-hidden rounded-3xl border p-8 text-left transition hover:border-cyan-400/40"
      >
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.10),transparent_35%)]" />
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-5">
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-cyan-400/15 bg-white/70 p-3 dark:bg-slate-900/40">
              {team.teamLogo ? <img src={team.teamLogo} alt={team.teamName} className="h-full w-full rounded-xl object-contain" /> : <ImageIcon className="h-10 w-10 text-cyan-600/70" />}
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700">
                {team.sportType} - {team.ageCategory}
              </p>
              <h1 className="text-3xl font-black tracking-tight">{team.teamName}</h1>
              <p className="mt-1 text-sm theme-muted">{team.coachName} - {team.city}, {team.country}</p>
              <p className="mt-2 text-xs font-semibold text-cyan-700">
                {detailsOpen ? t('Hide details') : t('Click to view team details and players')}
              </p>
            </div>
          </div>
          <div className="inline-flex items-center rounded-full border border-emerald-400/25 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-700">
            {team.teamStatus}
          </div>
        </div>
      </button>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={Users} label={t('Total Players')} value={stats.total} />
        <MetricCard icon={Activity} label={t('Active Players')} value={stats.active} />
        <MetricCard icon={Heart} label={t('Injuries')} value={stats.injured} />
        <MetricCard icon={Zap} label={t('Assessments')} value={team.players?.length ? team.players.length * 2 : 0} />
      </div>

      {detailsOpen ? (
        <section className="theme-surface rounded-3xl border p-5 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">{t('Team Details')}</h2>
              <p className="text-sm theme-muted">{t('Players, staff, and team profile information.')}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={openAddPlayer}
                className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-500/15 px-4 py-2 text-sm font-semibold text-cyan-700"
              >
                <Plus size={16} /> {t('Add / Edit Players')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStaffEditorOpen((open) => !open);
                  setPlayerEditorOpen(false);
                  setError('');
                  setMessage('');
                }}
                className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold theme-surface-soft"
              >
                <Stethoscope size={16} /> {t('Edit Medical Staff')}
              </button>
            </div>
          </div>

          {error ? <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-700">{error}</div> : null}
          {message ? <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-700">{message}</div> : null}

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <InfoTile label={t('Coach')} value={team.coachName} />
            <InfoTile label={t('Location')} value={`${team.city}, ${team.country}`} />
            <InfoTile label={t('Contact email')} value={team.contactEmail} />
            <InfoTile label={t('Founded Year')} value={String(team.foundedYear)} />
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
            <div className="theme-surface-soft rounded-2xl border p-4">
              <h3 className="mb-3 text-lg font-semibold">{t('Medical Staff')}</h3>
              <div className="space-y-3">
                <InfoTile label={t('Name')} value={team.medicalStaffName || '-'} />
                <InfoTile label={t('Email')} value={team.medicalStaffEmail || '-'} />
              </div>
            </div>

            <div className="theme-surface-soft rounded-2xl border p-4">
              <h3 className="mb-3 text-lg font-semibold">{t('Players')}</h3>
              {players.length ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {players.map((player) => (
                    <button
                      key={player.id}
                      type="button"
                      onClick={() => openEditPlayer(player)}
                      className="rounded-2xl border border-slate-200 bg-white p-3 text-left transition hover:border-cyan-400/30 hover:bg-slate-50 dark:border-slate-700/40 dark:bg-slate-900/40 dark:hover:bg-slate-900/70"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-slate-300 bg-slate-100 text-sm font-bold dark:border-slate-600 dark:bg-slate-800/60">
                          {player.photo ? <img src={player.photo} alt={player.fullName} className="h-full w-full object-cover" /> : `#${player.jerseyNumber}`}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold">{player.fullName}</p>
                          <p className="text-xs theme-muted">#{player.jerseyNumber} - {player.position || '-'} - {player.status}</p>
                        </div>
                        <Edit3 size={16} className="text-cyan-700" />
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm theme-muted">{t('No players yet.')}</p>
              )}
            </div>
          </div>

          {playerEditorOpen ? (
            <div className="theme-surface-soft rounded-2xl border p-4">
              <h3 className="mb-4 text-lg font-semibold">{editingPlayerId ? t('Edit Player') : t('Add Player')}</h3>
              <PlayerEditor form={playerForm} onPatch={patchPlayer} onCancel={() => setPlayerEditorOpen(false)} onSave={savePlayer} t={t} />
            </div>
          ) : null}

          {staffEditorOpen ? (
            <div className="theme-surface-soft rounded-2xl border p-4">
              <h3 className="mb-4 text-lg font-semibold">{t('Edit Medical Staff')}</h3>
              <div className="grid gap-3 md:grid-cols-3">
                <FieldInput value={staffForm.name} onChange={(value) => setStaffForm((prev) => ({ ...prev, name: value }))} placeholder={t('Name')} />
                <FieldInput value={staffForm.email} onChange={(value) => setStaffForm((prev) => ({ ...prev, email: value }))} placeholder={t('Email')} type="email" />
                <FieldInput value={staffForm.password} onChange={(value) => setStaffForm((prev) => ({ ...prev, password: value }))} placeholder={t('Password')} type="password" />
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button type="button" className="rounded-xl border px-4 py-2 text-sm theme-surface-soft" onClick={() => setStaffEditorOpen(false)}>{t('Cancel')}</button>
                <button type="button" className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white" onClick={saveMedicalStaff}>{t('Save')}</button>
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      <div className="theme-panel rounded-3xl border p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">{t('Team Risk Overview')}</h2>
          <p className="text-sm theme-muted">{t('Overall player status distribution')}</p>
        </div>
        <div className="mx-auto w-full max-w-md">
          <Pie data={riskData} />
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: number }) {
  return (
    <div className="theme-panel rounded-3xl border p-5">
      <Icon className="mb-3 h-5 w-5 text-cyan-700" />
      <p className="text-xs font-semibold uppercase tracking-[0.2em] theme-muted">{label}</p>
      <p className="mt-2 text-3xl font-black">{value}</p>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700/40 dark:bg-slate-900/40">
      <p className="text-xs font-semibold uppercase theme-muted">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold">{value || '-'}</p>
    </div>
  );
}

function FieldInput({
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/15 dark:border-slate-700/40 dark:bg-slate-900/40"
    />
  );
}

function PlayerEditor({
  form,
  onPatch,
  onCancel,
  onSave,
  t,
}: {
  form: PlayerFormInput;
  onPatch: <K extends keyof PlayerFormInput>(key: K, value: PlayerFormInput[K]) => void;
  onCancel: () => void;
  onSave: () => void;
  t: (key: string) => string;
}) {
  const fieldClass = 'h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/15 dark:border-slate-700/40 dark:bg-slate-900/40';

  return (
    <>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <input className={fieldClass} placeholder={t('Full name')} value={form.fullName} onChange={(e) => onPatch('fullName', e.target.value)} />
        <input className={fieldClass} placeholder={t('Shirt name')} value={form.shirtName} onChange={(e) => onPatch('shirtName', e.target.value)} />
        <input className={fieldClass} type="date" value={form.dateOfBirth} onChange={(e) => onPatch('dateOfBirth', e.target.value)} />
        <input className={fieldClass} placeholder={t('Nationality')} value={form.nationality} onChange={(e) => onPatch('nationality', e.target.value)} />
        <input className={fieldClass} placeholder={t('Position')} value={form.position} onChange={(e) => onPatch('position', e.target.value)} />
        <input className={fieldClass} type="number" placeholder={t('Jersey number')} value={form.jerseyNumber || ''} onChange={(e) => onPatch('jerseyNumber', Number(e.target.value))} />
        <select className={fieldClass} value={form.status} onChange={(e) => onPatch('status', e.target.value as PlayerFormInput['status'])}>
          <option>Active</option>
          <option>Injured</option>
          <option>Suspended</option>
        </select>
        <select className={fieldClass} value={form.gender} onChange={(e) => onPatch('gender', e.target.value as PlayerFormInput['gender'])}>
          <option>Male</option>
          <option>Female</option>
        </select>
        <input className={fieldClass} type="number" placeholder={t('Height (cm)')} value={form.heightCm || ''} onChange={(e) => onPatch('heightCm', Number(e.target.value))} />
        <input className={fieldClass} type="number" placeholder={t('Weight (kg)')} value={form.weightKg || ''} onChange={(e) => onPatch('weightKg', Number(e.target.value))} />
        <input className={fieldClass} type="date" value={form.joinDate} onChange={(e) => onPatch('joinDate', e.target.value)} />
        <input className={fieldClass} placeholder={t('Phone number')} value={form.phoneNumber} onChange={(e) => onPatch('phoneNumber', e.target.value)} />
        <input className={fieldClass} placeholder={t('Photo URL (optional)')} value={form.photo} onChange={(e) => onPatch('photo', e.target.value)} />
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <button type="button" className="rounded-xl border px-4 py-2 text-sm theme-surface-soft" onClick={onCancel}>{t('Cancel')}</button>
        <button type="button" className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white" onClick={onSave}>{t('Save')}</button>
      </div>
    </>
  );
}
