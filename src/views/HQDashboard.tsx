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
} from 'lucide-react'
import { useState } from 'react'
import { TEAM_STANDINGS } from '../data/drivers'
import { PaddockNewsWidget } from '../components/PaddockNewsWidget'

interface HQDashboardProps {
  onNotify: (title: string, message: string, tone?: 'success' | 'warning') => void
}

const RND_PROJECTS = [
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
]

const RACE_CALENDAR = [
  { round: 10, flag: 'GBR', race: 'British Grand Prix', track: 'Silverstone', date: 'LIVE RACE', state: 'live' },
  { round: 11, flag: 'BEL', race: 'Belgian Grand Prix', track: 'Spa-Francorchamps', date: '30 AUG', state: 'next' },
  { round: 12, flag: 'NED', race: 'Dutch Grand Prix', track: 'Zandvoort', date: '06 SEP', state: 'upcoming' },
  { round: 13, flag: 'ITA', race: 'Italian Grand Prix', track: 'Monza', date: '13 SEP', state: 'upcoming' },
]

export function HQDashboard({ onNotify }: HQDashboardProps) {
  const [department, setDepartment] = useState<'aero' | 'chassis' | 'powertrain'>('aero')
  const [atrAllocation, setAtrAllocation] = useState(64)

  const filteredProjects =
    department === 'aero'
      ? RND_PROJECTS.filter((p) => p.dept === 'aero')
      : department === 'chassis'
        ? RND_PROJECTS.filter((p) => p.dept === 'chassis')
        : []

  return (
    <main className="workspace hq-workspace">
      {/* Workspace Header */}
      <div className="workspace-header-bar">
        <div>
          <span className="section-eyebrow">McLAREN RACING TECHNOLOGY CENTRE · WOKING, UK</span>
          <h1 className="workspace-title">Factory Operations &amp; Team Headquarters</h1>
        </div>

        <div className="board-rating-chip">
          <div className="board-score-circle">
            <strong>92%</strong>
          </div>
          <div className="board-meta">
            <small>EXECUTIVE BOARD CONFIDENCE</small>
            <strong>Exceeding Championship Target</strong>
            <span className="positive-text"><TrendingUp size={11} /> +6 pts this month</span>
          </div>
        </div>
      </div>

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
              onClick={() => onNotify('NEW R&D INITIATIVE', 'Select aerodynamic component to start CAD/CFD design phase.', 'success')}
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
              <Wind size={14} /> AERODYNAMICS <span className="tab-count">2</span>
            </button>
            <button
              className={`dept-tab ${department === 'chassis' ? 'active' : ''}`}
              onClick={() => setDepartment('chassis')}
            >
              <Wrench size={14} /> CHASSIS <span className="tab-count">1</span>
            </button>
            <button
              className={`dept-tab ${department === 'powertrain' ? 'active' : ''}`}
              onClick={() => setDepartment('powertrain')}
            >
              <Cpu size={14} /> POWERTRAIN <span className="tab-count">0</span>
            </button>
          </div>

          {/* Project List */}
          <div className="projects-card-stack">
            {filteredProjects.length === 0 ? (
              <div className="empty-projects-state">
                <Cpu size={24} />
                <strong>No active projects in this department</strong>
                <p>Click &quot;New Upgrade&quot; to queue a power unit upgrade package.</p>
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

          {/* Season Calendar */}
          <div className="calendar-subpanel">
            <div className="subpanel-title">
              <CalendarDays size={14} />
              <span>2026 GRAND PRIX CALENDAR</span>
            </div>
            <div className="calendar-events-list">
              {RACE_CALENDAR.map((race) => (
                <div key={race.round} className={`calendar-row ${race.state}`}>
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

      {/* Bottom Factory Facilities Grid */}
      <section className="hq-facilities-grid">
        <div className="facility-card">
          <Building2 size={22} className="facility-icon" />
          <div className="facility-info">
            <span className="facility-title">DESIGN HQ</span>
            <strong>LEVEL 4</strong>
            <small>100 CAD/CFD Workstations</small>
          </div>
        </div>

        <div className="facility-card">
          <FlaskConical size={22} className="facility-icon" />
          <div className="facility-info">
            <span className="facility-title">WIND TUNNEL</span>
            <strong className="green-text">LEVEL 5 · MAX</strong>
            <small>60% Scale Rolling Road</small>
          </div>
        </div>

        <div className="facility-card">
          <Warehouse size={22} className="facility-icon" />
          <div className="facility-info">
            <span className="facility-title">COMPOSITES LAB</span>
            <strong>LEVEL 3</strong>
            <small>Autoclave &amp; 3D Sintering</small>
          </div>
        </div>

        <div className="facility-card">
          <Users size={22} className="facility-icon" />
          <div className="facility-info">
            <span className="facility-title">FACTORY CREW</span>
            <strong>184 / 200 STAFF</strong>
            <small>94% Team Morale</small>
          </div>
        </div>
      </section>
    </main>
  )
}
