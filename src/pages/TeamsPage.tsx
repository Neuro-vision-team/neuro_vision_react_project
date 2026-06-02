import { PageTitle } from '../components/ui';
import { TeamCard } from '../components/featureBlocks';
export default function TeamsPage() { return <div className="space-y-4"><PageTitle title="Team Management" subtitle="Players, injuries, assigned medics, and historical trends." /><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3"><TeamCard team="Falcons" players={31} /><TeamCard team="Titans" players={27} /><TeamCard team="Pioneers" players={35} /></div></div>; }
