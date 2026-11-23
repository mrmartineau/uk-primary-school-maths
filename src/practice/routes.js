// Hash-based deep links, so every screen, tool and quiz has its own address
// that works on static hosting:
//
//   #/                         home
//   #/topics  #/topics/fractions
//   #/tables  #/tables/6,7,8
//   #/blitz  #/stretch  #/progress  #/badges  #/rewards  #/grownups
//   #/tools  #/tools/grid  #/tools/tricks/fractions
//   #/play/daily  #/play/mix  #/play/mistakes
//   #/play/topic/fractions?n=10&level=3&scale=100
//   #/play/tables/7,8?n=15
//   #/play/blitz?topics=add,sub&tables=7&scales=10
//   #/play/stretch?topics=bonds&scales=100,0.1
//   #/import/<code>            move progress from another device

import { STRETCHABLE, TOPIC_BY_ID, STRETCH_SCALES } from './questions'
import {
  blitz, dailyChallenge, mistakesSession, quickMix, reviewSession, stretchSession, tablesSession, topicSession,
} from './session'

export const PAGES = ['topics', 'tables', 'blitz', 'stretch', 'progress', 'badges', 'rewards', 'grownups', 'tools']
export const TOOL_IDS = ['tricks', 'line', 'grid', 'hundred', 'pv', 'frac']

const list = (s, map = (x) => x) => (s ? s.split(',').map((x) => map(decodeURIComponent(x))).filter((x) => x !== '' && x != null) : [])
const nums = (s, ok) => list(s, Number).filter((n) => Number.isFinite(n) && ok(n))
const okTable = (n) => Number.isInteger(n) && n >= 2 && n <= 12
const okTopic = (id) => !!TOPIC_BY_ID[id]
const okScale = (n) => STRETCH_SCALES.includes(n)

export function parseHash(hash = location.hash) {
  const raw = hash.replace(/^#\/?/, '')
  const [path, qs = ''] = raw.split('?')
  const parts = path.split('/').filter(Boolean)
  const q = Object.fromEntries(new URLSearchParams(qs))
  const [name, a, b] = parts

  if (!name) return { name: 'home', params: {} }
  if (name === 'import') return { name: 'import', params: { code: parts.slice(1).join('/') } }
  if (name === 'play') return { name: 'play', params: { mode: a, arg: b, q } }
  if (!PAGES.includes(name)) return { name: 'home', params: {} }
  if (name === 'topics') return { name, params: okTopic(a) ? { topic: a } : {} }
  if (name === 'tables') return { name, params: { tables: nums(a, okTable) } }
  if (name === 'tools') return { name, params: { tab: TOOL_IDS.includes(a) ? a : undefined, topic: okTopic(b) ? b : undefined } }
  return { name, params: {} }
}

/** Turn a "#/play/…" route into a quiz config (or null if it doesn't make sense) */
export function configFromPlay({ mode, arg, q }) {
  const n = Math.min(50, Math.max(1, Number(q.n) || 0)) || undefined
  const topics = list(q.topics).filter(okTopic)
  const scales = nums(q.scales, okScale)
  const tables = nums(q.tables || arg, okTable)
  switch (mode) {
    case 'daily': return dailyChallenge()
    case 'mix': return { ...quickMix(), ...(n ? { count: n } : {}) }
    case 'mistakes': return mistakesSession()
    case 'review': return topics.length ? reviewSession(topics) : null
    case 'topic': {
      if (!okTopic(arg)) return null
      const level = Number(q.level)
      const scale = Number(q.scale)
      return topicSession(arg, n || 10, level >= 1 && level <= 5 ? level : 0, okScale(scale) ? scale : 0)
    }
    case 'tables': return tables.length ? tablesSession(tables, n || 15) : null
    case 'stretch': return stretchSession(topics, scales)
    case 'blitz': {
      if (q.stretch) return { ...blitz(topics.length ? topics : STRETCHABLE), scales: scales.length ? scales : [10], stretchBlitz: true, title: 'Stretch race' }
      if (tables.length) return { ...blitz(['tables'], tables), title: 'Tables race' }
      return blitz(topics)
    }
    default: return null
  }
}

const enc = (arr) => arr.map((x) => encodeURIComponent(x)).join(',')
const qstr = (o) => {
  const s = new URLSearchParams(Object.entries(o).filter(([, v]) => v !== undefined && v !== '' && v !== 0 && !(Array.isArray(v) && !v.length)).map(([k, v]) => [k, Array.isArray(v) ? v.join(',') : String(v)])).toString()
  return s ? `?${s}` : ''
}

/** The address of a quiz config, so a running quiz can be shared or bookmarked */
export function playHash(c) {
  switch (c.mode) {
    case 'daily': return '#/play/daily'
    case 'mix': return `#/play/mix${qstr({ n: c.count !== 10 ? c.count : undefined })}`
    case 'mistakes': return '#/play/mistakes'
    case 'review': return `#/play/review${qstr({ topics: c.topics })}`
    case 'topic': return `#/play/topic/${c.topics[0]}${qstr({ n: c.count !== 10 ? c.count : undefined, level: c.level, scale: c.scale })}`
    case 'tables': return `#/play/tables/${enc(c.tables)}${qstr({ n: c.count !== 15 ? c.count : undefined })}`
    case 'stretch': return `#/play/stretch${qstr({ topics: c.topics?.length < 8 ? c.topics : undefined, scales: c.scales })}`
    case 'blitz':
      if (c.stretchBlitz) return `#/play/blitz${qstr({ stretch: 1, topics: c.topics?.length < 8 ? c.topics : undefined, scales: c.scales })}`
      if (c.tables?.length) return `#/play/blitz${qstr({ tables: c.tables })}`
      return `#/play/blitz${qstr({ topics: c.topics })}`
    default: return '#/'
  }
}

export function toHash(name, params = {}) {
  if (name === 'home') return '#/'
  if (name === 'quiz') return playHash(params.config)
  if (name === 'results') return '#/results'
  if (name === 'topics') return params.topic ? `#/topics/${params.topic}` : '#/topics'
  if (name === 'tables') return params.tables?.length ? `#/tables/${params.tables.join(',')}` : '#/tables'
  if (name === 'tools') return `#/tools${params.tab ? `/${params.tab}` : ''}${params.tab === 'tricks' && params.topic ? `/${params.topic}` : ''}`
  return `#/${name}`
}

/** Full shareable URL for a hash */
export const linkFor = (hash) => `${location.origin}${location.pathname}${hash}`
