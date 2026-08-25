import {
  ArrowRight,
  BarChart3,
  Building2,
  CalendarDays,
  Check,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Cpu,
  Factory,
  FlaskConical,
  Landmark,
  Medal,
  Plus,
  ShieldCheck,
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

interface HQDashboardProps {
  onNotify: (title: string, message: string, tone?: 'success' | 'warning') => void
}

const projects = [
  { id: 1, type: 'UNDERFLOOR', name: 'UF-04 Venturi Floor', phase: 'CFD VALIDATION', progress: 76, days: 8, gain: '+0.18s', spend: '$1.84M', color: '#ff7a18' },
  { id: 2, type: 'FRONT WING', name: 'FW-07 Flex Cascade', phase: 'MANUFACTURING', progress: 48, days: 14, gain: '+0.11s', spend: '$1.26M', color: '#35d4c7' },
  { id: 3, type: 'SUSPENSION', name: 'RS-03 Heave Spring', phase: 'DESIGN', progress: 21, days: 23, gain: '+0.07s', spend: '$0.72M', color: '#8b78f6' },
]

const calendar = [
  { round: 10, flag: 'GBR', race: 'British Grand Prix', date: 'NOW', state: 'live' },
  { round: 11, flag: 'BEL', race: 'Belgian Grand Prix', date: '30 AUG', state: 'next' },
  { round: 12, flag: 'NED', race: 'Dutch Grand Prix', date: '06 SEP', state: '' },
  { round: 13, flag: 'ITA', race: 'Italian Grand Prix', date: '13 SEP', state: '' },
]

export function HQDashboard({ onNotify }: HQDashboardProps) {
  const [department, setDepartment] = useState<'aero' | 'chassis' | 'powertrain'>('aero')
  const [atrAllocation, setAtrAllocation] = useState(64)

  return (
    <main className="workspace hq-workspace">
      <div className="workspace-heading hq-heading">
        <div>
          <span className="eyebrow">McLAREN HERITAGE · WOKING, UNITED KINGDOM</span>
          <h1>Team headquarters</h1>
          <p>Control development, finances and championship operations from the factory.</p>
        </div>
        <div className="board-confidence">
          <div className="board-ring"><span>92<small>%</small></span></div>
          <div><small>BOARD CONFIDENCE</small><b>Exceeding expectations</b><span><TrendingUp size={12} /> +6 this month</span></div>
        </div>
      </div>

      <section className="hq-kpi-grid">
        <article className="hq-kpi-card budget">
          <span className="kpi-icon"><CircleDollarSign size={20} /></span>
          <div><small>AVAILABLE BUDGET</small><b>$42.8<em>M</em></b><span><TrendingUp size={11} /> +$4.2M forecast</span></div>
          <div className="kpi-sparkline"><i /><i /><i /><i /><i /><i /><i /><i /></div>
        </article>
        <article className="hq-kpi-card cost-cap">
          <span className="kpi-icon"><Landmark size={20} /></span>
          <div><small>COST CAP USED</small><b>$92.2<em>M</em></b><span>of $135.0M</span></div>
          <div className="circular-kpi" style={{ '--progress': '68%' } as React.CSSProperties}><span>68%</span></div>
        </article>
        <article className="hq-kpi-card championship">
          <span className="kpi-icon"><Trophy size={20} /></span>
          <div><small>CONSTRUCTORS</small><b>P1</b><span>286 points · +18</span></div>
          <Medal size={42} className="medal-watermark" />
        </article>
        <article className="hq-kpi-card atr">
          <span className="kpi-icon"><Wind size={20} /></span>
          <div><small>ATR PERIOD 2</small><b>614<em>h</em></b><span>87 CFD MAUh remaining</span></div>
          <span className="deadline-chip"><Clock3 size={11} /> 34 DAYS</span>
        </article>
      </section>

      <div className="hq-main-grid">
        <section className="panel development-panel">
          <div className="workspace-panel-title">
            <div><span className="eyebrow">TECHNICAL DEPARTMENT</span><h2>Development pipeline</h2></div>
            <button className="primary-action compact" onClick={() => onNotify('PROJECT SLOT READY', 'Choose a component department to begin development.', 'success')}><Plus size={14} /> NEW PROJECT</button>
          </div>
          <div className="department-tabs">
            <button className={department === 'aero' ? 'active' : ''} onClick={() => setDepartment('aero')}><Wind size={14} /> AERODYNAMICS <span>2</span></button>
            <button className={department === 'chassis' ? 'active' : ''} onClick={() => setDepartment('chassis')}><Wrench size={14} /> CHASSIS <span>1</span></button>
            <button className={department === 'powertrain' ? 'active' : ''} onClick={() => setDepartment('powertrain')}><Cpu size={14} /> POWERTRAIN <span>0</span></button>
          </div>
          <div className="project-list">
            {projects.map((project, index) => (
              <article className={`project-card ${department !== 'aero' && index > 0 ? 'muted-project' : ''}`} key={project.id} style={{ '--project-color': project.color } as React.CSSProperties}>
                <div className="project-spec-icon"><span>{project.type.slice(0, 2)}</span><i /></div>
                <div className="project-main">
                  <span className="project-phase"><i /> {project.phase}</span>
                  <b>{project.name}</b>
                  <div className="project-progress"><i style={{ width: `${project.progress}%` }} /><span>{project.progress}%</span></div>
                </div>
                <div className="project-stats"><span><small>ETA</small><b>{project.days} DAYS</b></span><span><small>EST. GAIN</small><b className="positive">{project.gain}</b></span><span><small>SPEND</small><b>{project.spend}</b></span></div>
                <button className="project-open"><ChevronRight size={16} /></button>
              </article>
            ))}
          </div>
          <div className="pipeline-capacity"><span><Factory size={14} /> DESIGN CAPACITY</span><div><i style={{ width: '74%' }} /></div><b>74 / 100</b><small>Next engineer available in 6 days</small></div>
        </section>

        <section className="panel atr-panel">
          <div className="workspace-panel-title"><div><span className="eyebrow">AERODYNAMIC TESTING RESTRICTIONS</span><h2>ATR allocation</h2></div><span className="period-chip">PERIOD 2 / 2</span></div>
          <div className="atr-rank-banner">
            <div className="rank-hex">1</div>
            <div><small>CHAMPIONSHIP POSITION</small><b>70% BASELINE ALLOCATION</b><span>−5% vs. previous period</span></div>
          </div>
          <div className="atr-resource-list">
            <div className="atr-resource">
              <span className="atr-resource-icon"><Wind size={17} /></span>
              <div><span><small>WIND TUNNEL</small><b>614 <em>/ 840 h</em></b></span><div><i style={{ width: '73%' }} /></div></div>
              <span className="resource-days">226h used</span>
            </div>
            <div className="atr-resource">
              <span className="atr-resource-icon"><Cpu size={17} /></span>
              <div><span><small>CFD COMPUTE</small><b>3.7 <em>/ 5.8 MAUh</em></b></span><div><i style={{ width: '64%' }} /></div></div>
              <span className="resource-days">2.1 remaining</span>
            </div>
          </div>
          <label className="atr-allocation-control">
            <span><small>CURRENT PROJECT ALLOCATION</small><b>{atrAllocation}% to UF-04</b></span>
            <input type="range" min="20" max="90" value={atrAllocation} onChange={(event) => setAtrAllocation(Number(event.target.value))} style={{ '--slider-fill': `${atrAllocation}%` } as React.CSSProperties} />
            <div><span>FRONT WING <b>{100 - atrAllocation}%</b></span><span>UNDERFLOOR <b>{atrAllocation}%</b></span></div>
          </label>
          <div className="atr-projection">
            <Sparkles size={14} />
            <div><small>OPTIMIZATION INSIGHT</small><b>Shift 8% CFD to front wing</b><p>Expected combined gain improves by 0.026s at no additional cost.</p></div>
            <button onClick={() => { setAtrAllocation(Math.max(20, atrAllocation - 8)); onNotify('ATR REBALANCED', '8% CFD compute moved to front wing development.', 'success') }}>APPLY</button>
          </div>
        </section>

        <aside className="hq-side-column">
          <section className="panel standings-card">
            <div className="side-card-heading"><span><BarChart3 size={15} /> CONSTRUCTORS</span><button>FULL TABLE <ArrowRight size={11} /></button></div>
            <div className="standings-list">
              {TEAM_STANDINGS.map((team) => (
                <div className={`standing-row ${team.position === 1 ? 'our-team' : ''}`} key={team.team}>
                  <span className="standing-position">{team.position}</span><i style={{ background: team.color }} /><span><b>{team.team}</b><small>{team.position === 1 ? 'YOU' : `+${286 - team.points} PTS`}</small></span><strong>{team.points}</strong>
                </div>
              ))}
            </div>
            <div className="championship-lead"><Trophy size={15} /><span><small>CHAMPIONSHIP LEAD</small><b>18 POINTS</b></span><em>10 / 24</em></div>
          </section>

          <section className="panel calendar-card">
            <div className="side-card-heading"><span><CalendarDays size={15} /> SEASON CALENDAR</span><b>ROUND 10 / 24</b></div>
            <div className="calendar-list">
              {calendar.map((event) => (
                <div className={`calendar-event ${event.state}`} key={event.round}>
                  <span className="round-number">{event.round}</span><span className="flag-code">{event.flag}</span><span><b>{event.race}</b><small>{event.date}</small></span>{event.state === 'live' ? <em>LIVE</em> : <ChevronRight size={13} />}
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>

      <section className="hq-bottom-grid">
        <article className="panel facility-summary-card">
          <div className="facility-icon"><Building2 size={21} /></div><div><small>DESIGN CENTRE</small><b>LEVEL 4</b><span><i style={{ width: '82%' }} /></span></div><button>UPGRADE <small>$8.5M</small></button>
        </article>
        <article className="panel facility-summary-card">
          <div className="facility-icon"><FlaskConical size={21} /></div><div><small>WIND TUNNEL</small><b>LEVEL 5 · MAX</b><span><i style={{ width: '100%' }} /></span></div><ShieldCheck size={18} className="facility-complete" />
        </article>
        <article className="panel facility-summary-card">
          <div className="facility-icon"><Warehouse size={21} /></div><div><small>MANUFACTURING</small><b>LEVEL 3</b><span><i style={{ width: '61%' }} /></span></div><button>UPGRADE <small>$6.2M</small></button>
        </article>
        <article className="panel facility-summary-card staffing">
          <div className="facility-icon"><Users size={21} /></div><div><small>TECHNICAL STAFF</small><b>184 / 200</b><span className="staff-trend"><Check size={10} /> 94% MORALE</span></div><button>MANAGE</button>
        </article>
      </section>
    </main>
  )
}
