/**
 * Formula 1 Paddock News Service
 * Provides categorized real-time news stories, technical analysis, and regulatory updates.
 */

export interface F1NewsArticle {
  id: string
  title: string
  summary: string
  category: 'Technical' | 'Paddock' | 'Regulations' | 'Race Report' | 'Driver Market'
  timestamp: string
  source: string
  author: string
  readTimeMin: number
  featured?: boolean
  url?: string
}

export const LATEST_F1_NEWS: F1NewsArticle[] = [
  {
    id: 'news-1',
    title: 'McLaren Introduces Upgraded Floor Venturi Edge Design for British Grand Prix',
    summary: 'McLaren has arrived at Silverstone with an updated underfloor fence geometry aimed at stabilizing high-speed ground effect vortex generation through Copse and Becketts.',
    category: 'Technical',
    timestamp: '2 hours ago',
    source: 'F1 Technical Bulletin',
    author: 'Mark Hughes',
    readTimeMin: 3,
    featured: true,
  },
  {
    id: 'news-2',
    title: 'FIA Clarifies 2026 Engine Electrical MGU-K Boost Deployment Restrictions',
    summary: 'The FIA World Motor Sport Council has published technical directive TD044 outlining continuous 350kW MGU-K energy recovery limits and override modes on main straights.',
    category: 'Regulations',
    timestamp: '5 hours ago',
    source: 'FIA Press Office',
    author: 'Federation Internationale de l\'Automobile',
    readTimeMin: 4,
    featured: false,
  },
  {
    id: 'news-3',
    title: 'Ferrari Paddock Debrief: Hamilton & Leclerc Praise High-Downforce Balance in FP2',
    summary: 'Lewis Hamilton and Charles Leclerc completed extensive race simulations on Medium and Hard compounds, noting significant tyre preservation improvements.',
    category: 'Race Report',
    timestamp: '7 hours ago',
    source: 'Scuderia Ferrari Media',
    author: 'Paddock Correspondent',
    readTimeMin: 2,
    featured: false,
  },
  {
    id: 'news-4',
    title: 'Pirelli Predicts One-Stop Medium-Hard as Optimal Strategy for 52-Lap Silverstone Contest',
    summary: 'Pirelli motorsport director confirms tyre degradation metrics suggest an optimal pit stop window between Laps 28 and 33 under ambient 24°C conditions.',
    category: 'Paddock',
    timestamp: '12 hours ago',
    source: 'Pirelli Motorsport',
    author: 'Mario Isola',
    readTimeMin: 3,
    featured: false,
  },
  {
    id: 'news-5',
    title: 'Red Bull Racing Brings Compact Sidepod Inlet Package to Combat Cooling vs Drag',
    summary: 'Red Bull engineers showcased revised cooling gills and narrower sidepod radiator ducts to reduce overall drag coefficient by an estimated 0.012 Cd.',
    category: 'Technical',
    timestamp: '1 day ago',
    source: 'Motorsport Tech',
    author: 'Gary Anderson',
    readTimeMin: 5,
    featured: false,
  },
  {
    id: 'news-6',
    title: 'Audi F1 Project Accelerates Hinwil & Neuburg Engine dyno Testing Ahead of 2026',
    summary: 'Nico Hülkenberg and Gabriel Bortoleto participate in full race distance simulator correlations for Audi’s proprietary 2026 synthetic e-fuel powertrain.',
    category: 'Driver Market',
    timestamp: '1 day ago',
    source: 'Autosport',
    author: 'Jonathan Noble',
    readTimeMin: 4,
    featured: false,
  },
]

// Incoming stream of breaking news dispatched during session
export const BREAKING_NEWS_POOL: F1NewsArticle[] = [
  {
    id: 'news-break-1',
    title: 'FIA Technical Directive TD048: Skid Block Plank Wear Tolerances Enforced',
    summary: 'Race Control has alerted all 10 constructor technical directors that minimum 9mm rear titanium skid block thickness will be inspected post-race.',
    category: 'Regulations',
    timestamp: 'Just Now',
    source: 'FIA Technical Delegate',
    author: 'Jo Bauer',
    readTimeMin: 2,
    featured: true,
  },
  {
    id: 'news-break-2',
    title: 'Mercedes Trackside Report: Antonelli & Russell Evaluate Low-Drag Beam Wing',
    summary: 'Mercedes telemetry confirms a 3.4 km/h straight-line speed gain through Hangar Straight with the single-element beam wing configuration.',
    category: 'Technical',
    timestamp: 'Just Now',
    source: 'Mercedes AMG F1 Tech',
    author: 'Andrew Shovlin',
    readTimeMin: 3,
    featured: false,
  },
  {
    id: 'news-break-3',
    title: 'Paddock Weather Alert: Rain Threat Cloud Cells Moving Toward Sector 2',
    summary: 'Trackside radar stations detect scattered cumulus clouds with a 35% probability of localized precipitation arriving over Stowe and Club in 15 minutes.',
    category: 'Paddock',
    timestamp: 'Just Now',
    source: 'Meteo France Motorsport',
    author: 'Race Meteorologist',
    readTimeMin: 2,
    featured: false,
  },
]

let activeNewsList: F1NewsArticle[] = [...LATEST_F1_NEWS]
let breakingPoolIndex = 0

export function fetchF1News(filterCategory?: string): F1NewsArticle[] {
  if (!filterCategory || filterCategory === 'ALL') {
    return activeNewsList
  }
  return activeNewsList.filter((item) => item.category === filterCategory)
}

export function checkForBreakingNews(): F1NewsArticle | null {
  if (breakingPoolIndex >= BREAKING_NEWS_POOL.length) {
    return null
  }
  const nextArticle = BREAKING_NEWS_POOL[breakingPoolIndex]
  breakingPoolIndex += 1

  // Prepend to active news list if not already present
  if (!activeNewsList.some((n) => n.id === nextArticle.id)) {
    activeNewsList = [nextArticle, ...activeNewsList]
  }

  return nextArticle
}
