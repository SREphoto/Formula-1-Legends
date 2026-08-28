import {
  Building2,
  CalendarDays,
  CircleDollarSign,
  Clock3,
  Cpu,
  Factory,
  FlaskConical,
  Landmark,
  Plus,
  Sparkles,
  TrendingUp,
  Trophy,
  Users,
  Warehouse,
  Wind,
  Wrench,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { TEAM_STANDINGS } from '../data/drivers'
import { PaddockNewsWidget } from '../components/PaddockNewsWidget'
import { CircuitMapPreview } from '../components/CircuitMapPreview'
import { TeamBanner, getTeamMeta } from '../components/TeamGraphics'
import type { PaddockCredentials } from '../components/ParallaxAuthScreen'

interface HQDashboardProps {
  onNotify: (title: string, message: string, tone?: 'success' | 'warning') => void
  credentials?: PaddockCredentials | null
}

const RND_PROJECTS_INITIAL = [
  {
    id: 1,
    dept: 'aero',
    type: 'UNDERFLOOR',
    name: 'UF-06 3D Venturi Tunnel Vane',
    phase: 'CFD WIND TUNNEL',
    progress: 78,
    days: 6,
    gain: '+0.18s / lap',
    spend: '$1.85M',
    color: '#ff8000',
  },
  {
    id: 2,
    dept: 'aero',
    type: 'FRONT WING',
    name: 'FW-09 Flex Cascade Endplate',
    phase: 'RAPID PROTOTYPING',
    progress: 52,
    days: 12,
    gain: '+0.12s / lap',
    spend: '$1.20M',
    color: '#00d2be',
  },
  {
    id: 3,
    dept: 'chassis',
    type: 'SUSPENSION',
    name: 'RS-04 Third Element Heave Damper',
    phase: 'STRESS & RIG TESTING',
    progress: 26,
    days: 19,
    gain: '+0.08s / lap',
    spend: '$0.75M',
    color: '#e8002d',
  },
  {
    id: 4,
    dept: 'powertrain',
    type: 'HYBRID MGU-K',
    name: 'PU-26 350kW High-RPM Stator Wrap',
    phase: 'DYNO BENCHMARKING',
    progress: 14,
    days: 28,
    gain: '+0.22s / lap',
    spend: '$2.40M',
    color: '#ff8000',
  },
]

const FULL_RACE_CALENDAR = [
  { round: 1, circuitKey: 1, flag: 'AUS', race: 'Australian Grand Prix', track: 'Albert Park', date: 'COMPLETED', state: 'past' },
  { round: 2, circuitKey: 11, flag: 'CHN', race: 'Chinese Grand Prix', track: 'Shanghai', date: 'COMPLETED', state: 'past' },
  { round: 3, circuitKey: 46, flag: 'JPN', race: 'Japanese Grand Prix', track: 'Suzuka', date: 'COMPLETED', state: 'past' },
  { round: 4, circuitKey: 151, flag: 'USA', race: 'Miami Grand Prix', track: 'Miami', date: 'COMPLETED', state: 'past' },
  { round: 5, circuitKey: 23, flag: 'CAN', race: 'Canadian Grand Prix', track: 'Montreal', date: 'COMPLETED', state: 'past' },
  { round: 6, circuitKey: 22, flag: 'MON', race: 'Monaco Grand Prix', track: 'Monte Carlo', date: 'COMPLETED', state: 'past' },
  { round: 7, circuitKey: 15, flag: 'ESP', race: 'Gran Premio de Barcelona-Catalunya', track: 'Barcelona', date: 'COMPLETED', state: 'past' },
  { round: 8, circuitKey: 19, flag: 'AUT', race: 'Austrian Grand Prix', track: 'Red Bull Ring', date: 'COMPLETED', state: 'past' },
  { round: 9, circuitKey: 2, flag: 'GBR', race: 'British Grand Prix', track: 'Silverstone', date: 'LIVE ROUND', state: 'live' },
  { round: 10, circuitKey: 7, flag: 'BEL', race: 'Belgian Grand Prix', track: 'Spa-Francorchamps', date: 'NEXT ROUND', state: 'next' },
  { round: 11, circuitKey: 4, flag: 'HUN', race: 'Hungarian Grand Prix', track: 'Hungaroring', date: 'UPCOMING', state: 'upcoming' },
  { round: 12, circuitKey: 55, flag: 'NED', race: 'Dutch Grand Prix', track: 'Zandvoort', date: 'UPCOMING', state: 'upcoming' },
  { round: 13, circuitKey: 39, flag: 'ITA', race: 'Italian Grand Prix', track: 'Monza', date: 'UPCOMING', state: 'upcoming' },
  { round: 14, circuitKey: 153, flag: 'ESP', race: 'Gran Premio de España (Madring)', track: 'Madrid IFEMA', date: 'NEW VENUE', state: 'upcoming' },
  { round: 15, circuitKey: 144, flag: 'AZE', race: 'Azerbaijan Grand Prix', track: 'Baku', date: 'UPCOMING', state: 'upcoming' },
  { round: 16, circuitKey: 16, flag: 'MAS', race: 'Bahrain Grand Prix in Malaysia', track: 'Sepang', date: 'RELOCATED', state: 'upcoming' },
  { round: 17, circuitKey: 61, flag: 'SIN', race: 'Singapore Grand Prix', track: 'Marina Bay', date: 'UPCOMING', state: 'upcoming' },
  { round: 18, circuitKey: 9, flag: 'USA', race: 'United States Grand Prix', track: 'COTA Austin', date: 'UPCOMING', state: 'upcoming' },
  { round: 19, circuitKey: 65, flag: 'MEX', race: 'Mexico City Grand Prix', track: 'Hermanos Rodríguez', date: 'UPCOMING', state: 'upcoming' },
  { round: 20, circuitKey: 14, flag: 'BRA', race: 'São Paulo Grand Prix', track: 'Interlagos', date: 'UPCOMING', state: 'upcoming' },
  { round: 21, circuitKey: 152, flag: 'USA', race: 'Las Vegas Grand Prix', track: 'Las Vegas Strip', date: 'UPCOMING', state: 'upcoming' },
  { round: 22, circuitKey: 150, flag: 'QAT', race: 'Qatar Grand Prix', track: 'Lusail', date: 'UPCOMING', state: 'upcoming' },
  { round: 23, circuitKey: 70, flag: 'UAE', race: 'Abu Dhabi Grand Prix', track: 'Yas Marina', date: 'SEASON FINALE', state: 'upcoming' },
]

export function HQDashboard({ onNotify, credentials }: HQDashboardProps) {
  const [department, setDepartment] = useState<'aero' | 'chassis' | 'powertrain'>('aero')
  const [atrAllocation, setAtrAllocation] = useState(64)
  const [projects, setProjects] = useState(RND_PROJECTS_INITIAL)
  const [selectedCalendarRace, setSelectedCalendarRace] = useState<(typeof FULL_RACE_CALENDAR)[0] | null>(null)
  const [facilityLevels, setFacilityLevels] = useState({
    designHq: 4,
    windTunnel: 5,
    compositesLab: 3,
    factoryStaff: 184,
  })

  const handleUpgradeFacility = (facilityKey: 'designHq' | 'windTunnel' | 'compositesLab') => {
    setFacilityLevels((prev) => {
      const current = prev[facilityKey]
      if (current >= 5) {
        onNotify('FACILITY AT MAXIMUM', 'This factory department is already at Level 5 Maximum Tier.', 'warning')
        return prev
      }
      onNotify('FACILITY UPGRADED', `Factory department upgraded to Level ${current + 1}!`, 'success')
      return { ...prev, [facilityKey]: current + 1 }
    })
  }

  const handleCreateProject = () => {
    const newId = projects.length + 1
    const newProj = {
      id: newId,
      dept: department,
      type: department === 'aero' ? 'REAR BEAM WING' : department === 'chassis' ? 'BRAKE DUCT' : 'MGU-K INVERTER',
      name: `SPEC-3 2026 ${department.toUpperCase()} PACKAGE`,
      phase: 'INITIAL CAD MODELING',
      progress: 5,
      days: 24,
      gain: '+0.15s / lap',
      spend: '$1.50M',
      color: '#ff8000',
    }
    setProjects((prev) => [newProj, ...prev])
    onNotify('R&D UPGRADE COMMISSIONED', `New ${department.toUpperCase()} project queued in factory manufacturing!`, 'success')
  }

  const filteredProjects = projects.filter((p) => p.dept === department)

  const teamMeta = getTeamMeta(credentials?.teamCode || 'MCL')

  return (
    <main className="workspace hq-workspace">
      {/* Dynamic Team Constructor Hero Banner */}
      <TeamBanner
        teamCode={teamMeta.code}
        title={`${teamMeta.name.toUpperCase()} · FACTORY HQ`}
        subtitle="R&D FACILITY & CONSTRUCTOR OPERATIONS"
        className="hq-hero-banner"
      />

      {/* Top 4 KPI Cards */}
      <div className="hq-kpis-grid">
        <div className="hq-kpi-card budget">
          <div className="kpi-icon-wrap"><CircleDollarSign size={20} /></div>
          <div className="kpi-main">
            <span className="kpi-label">AVAILABLE FACTORY BUDGET</span>
            <strong className="kpi-value">$42.8M</strong>
            <small className="positive-text"><TrendingUp size={11} /> +$4.2M forecasted profit</small>
          </div>
        </div>

        <div className="hq-kpi-card cost-cap">
          <div className="kpi-icon-wrap"><Landmark size={20} /></div>
          <div className="kpi-main">
            <span className="kpi-label">FIA COST CAP USAGE</span>
            <strong className="kpi-value">$92.2M <small>/ $135.0M</small></strong>
            <div className="costcap-bar">
              <div className="costcap-fill" style={{ width: '68%' }} />
            </div>
            <small>68% of season ceiling used</small>
          </div>
        </div>

        <div className="hq-kpi-card championship">
          <div className="kpi-icon-wrap trophy"><Trophy size={20} /></div>
          <div className="kpi-main">
            <span className="kpi-label">CONSTRUCTORS CHAMPIONSHIP</span>
            <strong className="kpi-value gold">P1 · 312 PTS</strong>
            <small className="positive-text">+17 PTS lead over Ferrari</small>
          </div>
        </div>

        <div className="hq-kpi-card atr">
          <div className="kpi-icon-wrap"><Wind size={20} /></div>
          <div className="kpi-main">
            <span className="kpi-label">ATR PERIOD 2 ALLOWANCE</span>
            <strong className="kpi-value">614h <small>/ 840h</small></strong>
            <small><Clock3 size={11} /> 34 days until Period 3 reset</small>
          </div>
        </div>
      </div>

      {/* Main 3-Column Factory Dashboard */}
      <div className="hq-main-layout">
        {/* Left Column: Development Pipeline */}
        <section className="panel hq-panel-column dev-pipeline-panel">
          <div className="card-panel-header">
            <div className="header-text">
              <span className="eyebrow">R&amp;D TECHNICAL DEPARTMENT</span>
              <h2>Development Pipeline</h2>
            </div>
            <button
              className="action-pill-btn"
              onClick={handleCreateProject}
            >
              <Plus size={14} /> NEW UPGRADE
            </button>
          </div>

          {/* Department Filter Tabs */}
          <div className="dept-tabs-row">
            <button
              className={`dept-tab ${department === 'aero' ? 'active' : ''}`}
              onClick={() => setDepartment('aero')}
            >
              <Wind size={14} /> AERODYNAMICS <span className="tab-count">{projects.filter(p => p.dept === 'aero').length}</span>
            </button>
            <button
              className={`dept-tab ${department === 'chassis' ? 'active' : ''}`}
              onClick={() => setDepartment('chassis')}
            >
              <Wrench size={14} /> CHASSIS <span className="tab-count">{projects.filter(p => p.dept === 'chassis').length}</span>
            </button>
            <button
              className={`dept-tab ${department === 'powertrain' ? 'active' : ''}`}
              onClick={() => setDepartment('powertrain')}
            >
              <Cpu size={14} /> POWERTRAIN <span className="tab-count">{projects.filter(p => p.dept === 'powertrain').length}</span>
            </button>
          </div>

          {/* Project List */}
          <div className="projects-card-stack">
            {filteredProjects.length === 0 ? (
              <div className="empty-projects-state">
                <Cpu size={24} />
                <strong>No active projects in this department</strong>
                <p>Click &quot;New Upgrade&quot; to queue a package in this department.</p>
              </div>
            ) : (
              filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="rnd-project-card"
                  style={{ '--project-color': project.color } as React.CSSProperties}
                >
                  <div className="project-header">
                    <div className="project-title-block">
                      <span className="project-type-tag">{project.type}</span>
                      <strong className="project-name">{project.name}</strong>
                    </div>
                    <span className="phase-pill">{project.phase}</span>
                  </div>

                  <div className="project-progress-block">
                    <div className="progress-labels">
                      <span>MANUFACTURING PROGRESS</span>
                      <strong>{project.progress}%</strong>
                    </div>
                    <div className="progress-bar-track">
                      <div className="progress-bar-fill" style={{ width: `${project.progress}%` }} />
                    </div>
                  </div>

                  <div className="project-metrics-footer">
                    <div className="project-stat">
                      <small>ETA TO TRACK</small>
                      <strong>{project.days} DAYS</strong>
                    </div>
                    <div className="project-stat">
                      <small>EST. GAIN</small>
                      <strong className="green-gain">{project.gain}</strong>
                    </div>
                    <div className="project-stat">
                      <small>R&amp;D SPEND</small>
                      <strong>{project.spend}</strong>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="engineering-capacity-footer">
            <div className="capacity-meta">
              <Factory size={16} />
              <span>DESIGN OFFICE CAPACITY: <strong>74 / 100 ENGINEERS</strong></span>
            </div>
            <div className="capacity-bar">
              <div className="capacity-fill" style={{ width: '74%' }} />
            </div>
          </div>
        </section>

        {/* Center Column: ATR Wind Tunnel & CFD Compute Allocation */}
        <section className="panel hq-panel-column atr-allocation-panel">
          <div className="card-panel-header">
            <div className="header-text">
              <span className="eyebrow">AERO TESTING RESTRICTION (ATR)</span>
              <h2>CFD &amp; Wind Tunnel Split</h2>
            </div>
            <span className="period-chip">PERIOD 2 / 6</span>
          </div>

          <div className="atr-banner-card">
            <div className="p1-trophy-badge">P1</div>
            <div className="atr-banner-text">
              <small>CONSTRUCTORS CHAMPIONSHIP RANK</small>
              <strong>70% Baseline Aero Allocation</strong>
              <span>-5% restriction penalty applied for championship leadership</span>
            </div>
          </div>

          <div className="atr-resource-grid">
            <div className="atr-resource-card">
              <div className="res-icon"><Wind size={18} /></div>
              <div className="res-details">
                <span className="res-title">WIND TUNNEL TIME</span>
                <strong className="res-val">614h <small>/ 840h</small></strong>
                <div className="res-bar">
                  <div className="res-bar-fill" style={{ width: '73%' }} />
                </div>
                <small className="res-sub">226h remaining this period</small>
              </div>
            </div>

            <div className="atr-resource-card">
              <div className="res-icon"><Cpu size={18} /></div>
              <div className="res-details">
                <span className="res-title">CFD COMPUTE ALLOCATION</span>
                <strong className="res-val">3.7 <small>/ 5.8 MAUh</small></strong>
                <div className="res-bar">
                  <div className="res-bar-fill" style={{ width: '64%' }} />
                </div>
                <small className="res-sub">2.1 MAUh remaining</small>
              </div>
            </div>
          </div>

          <div className="atr-slider-card">
            <div className="slider-meta-header">
              <span>CFD COMPUTE BALANCE</span>
              <strong>{atrAllocation}% TO VENTURI UNDERFLOOR</strong>
            </div>
            <input
              type="range"
              min={20}
              max={80}
              value={atrAllocation}
              onChange={(e) => setAtrAllocation(Number(e.target.value))}
              className="custom-range-input atr-slider"
            />
            <div className="slider-endpoints">
              <span>FRONT WING: <strong>{100 - atrAllocation}%</strong></span>
              <span>UNDERFLOOR: <strong>{atrAllocation}%</strong></span>
            </div>
          </div>

          <div className="atr-optimization-callout">
            <Sparkles size={16} />
            <div className="callout-body">
              <strong>AERODYNAMICS INSIGHT</strong>
              <p>Underfloor Venturi channels provide 68% of total downforce with lowest drag penalty.</p>
            </div>
          </div>
        </section>

        {/* Right Column: Standings & Season Calendar */}
        <section className="panel hq-panel-column standings-calendar-panel">
          <div className="card-panel-header">
            <div className="header-text">
              <span className="eyebrow">2026 WORLD CHAMPIONSHIP</span>
              <h2>Constructor Standings</h2>
            </div>
            <Trophy size={18} className="gold-accent" />
          </div>

          <div className="standings-table-stack">
            {TEAM_STANDINGS.map((team) => (
              <div
                key={team.team}
                className={`standings-team-row ${team.position === 1 ? 'player-team' : ''}`}
                style={{ '--team-color': team.color } as React.CSSProperties}
              >
                <span className="team-rank">P{team.position}</span>
                <span className="team-accent-bar" />
                <span className="team-name-tag">
                  <strong>{team.team}</strong>
                  {team.position === 1 && <small className="player-badge">YOUR TEAM</small>}
                </span>
                <span className="team-pts"><strong>{team.points}</strong> PTS</span>
              </div>
            ))}
          </div>

          {/* Season Calendar with Clickable Previews */}
          <div className="calendar-subpanel">
            <div className="subpanel-title">
              <CalendarDays size={14} />
              <span>2026 GRAND PRIX CALENDAR <small>(Click round to view track layout)</small></span>
            </div>
            <div className="calendar-events-list">
              {FULL_RACE_CALENDAR.map((race) => (
                <div
                  key={race.round}
                  className={`calendar-row ${race.state}`}
                  onClick={() => setSelectedCalendarRace(race)}
                  style={{ cursor: 'pointer' }}
                  title={`Click to preview ${race.race} layout`}
                >
                  <span className="race-round">R{race.round}</span>
                  <span className="country-chip">{race.flag}</span>
                  <div className="race-details">
                    <strong>{race.race}</strong>
                    <small>{race.track}</small>
                  </div>
                  <span className={`race-badge ${race.state}`}>{race.date}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Paddock News & Technical Media Center */}
      <PaddockNewsWidget onNotify={onNotify} />

      {/* Bottom Factory Facilities Grid with Upgrade Controls */}
      <section className="hq-facilities-grid">
        <div
          className="facility-card"
          onClick={() => handleUpgradeFacility('designHq')}
          style={{ cursor: 'pointer' }}
          title="Click to upgrade Design HQ"
        >
          <Building2 size={22} className="facility-icon" />
          <div className="facility-info">
            <span className="facility-title">DESIGN HQ</span>
            <strong>LEVEL {facilityLevels.designHq}</strong>
            <small>{facilityLevels.designHq * 25} CAD/CFD Workstations (Click to Upgrade)</small>
          </div>
        </div>

        <div
          className="facility-card"
          onClick={() => handleUpgradeFacility('windTunnel')}
          style={{ cursor: 'pointer' }}
          title="Click to upgrade Wind Tunnel"
        >
          <FlaskConical size={22} className="facility-icon" />
          <div className="facility-info">
            <span className="facility-title">WIND TUNNEL</span>
            <strong className={facilityLevels.windTunnel >= 5 ? 'green-text' : ''}>
              LEVEL {facilityLevels.windTunnel} {facilityLevels.windTunnel >= 5 && '· MAX'}
            </strong>
            <small>60% Scale Rolling Road (Click to Upgrade)</small>
          </div>
        </div>

        <div
          className="facility-card"
          onClick={() => handleUpgradeFacility('compositesLab')}
          style={{ cursor: 'pointer' }}
          title="Click to upgrade Composites Lab"
        >
          <Warehouse size={22} className="facility-icon" />
          <div className="facility-info">
            <span className="facility-title">COMPOSITES LAB</span>
            <strong>LEVEL {facilityLevels.compositesLab}</strong>
            <small>Autoclave &amp; 3D Sintering (Click to Upgrade)</small>
          </div>
        </div>

        <div
          className="facility-card"
          onClick={() => onNotify('CREW RECRUITMENT', 'Staff recruitment active · Morale at peak.', 'success')}
          style={{ cursor: 'pointer' }}
        >
          <Users size={22} className="facility-icon" />
          <div className="facility-info">
            <span className="facility-title">FACTORY CREW</span>
            <strong>{facilityLevels.factoryStaff} / 200 STAFF</strong>
            <small>94% Team Morale</small>
          </div>
        </div>
      </section>

      {/* Calendar Circuit Map Preview Modal */}
      {selectedCalendarRace && (
        <div className="command-modal-backdrop" onClick={() => setSelectedCalendarRace(null)}>
          <div className="command-modal-card" style={{ maxWidth: '880px', width: '90%' }} onClick={(e) => e.stopPropagation()}>
            <div className="command-modal-header">
              <div className="modal-title">
                <CalendarDays size={18} />
                <span>Round {selectedCalendarRace.round} · {selectedCalendarRace.race}</span>
              </div>
              <button className="close-modal-btn" onClick={() => setSelectedCalendarRace(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="command-modal-body" style={{ padding: '20px' }}>
              <CircuitMapPreview
                circuitKey={selectedCalendarRace.circuitKey}
                meetingName={selectedCalendarRace.race}
                location={selectedCalendarRace.track}
                country={selectedCalendarRace.flag}
              />
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
