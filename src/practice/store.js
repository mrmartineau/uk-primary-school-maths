import { createStore, produce, reconcile } from 'solid-js/store'
import { batch, createEffect, createRoot, createSignal, untrack } from 'solid-js'
import { TOPICS, TOPIC_BY_ID } from './questions'

const KEY = 'maths-practice-v1'

// ---- dates (local time, weeks start on Monday) ---------------------------
export const dayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
export function weekStart(d = new Date()) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7))
  return x
}
export function weekDays(start = weekStart()) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    return dayKey(d)
  })
}
const DAY = 86400000

// ---- defaults -------------------------------------------------------------
const fresh = () => ({
  version: 1,
  profile: { name: '', year: 3, goal: 'auto', sound: true, focus: [], setup: false },
  days: {}, // 'YYYY-MM-DD': { points, correct, total }
  topics: {}, // id: { level, recent: [0|1], correct, total, last }
  mistakes: [], // saved question objects
  sessions: [], // { ts, mode, title, correct, total, points }
  badges: {}, // id: ts
  best: { streak: 0, blitz: 0, dailyDone: '' },
  tables: {}, // '7x8': { c, t }
  rewards: [], // { id, emoji, name, cost }
  claims: [], // { id, rewardId, emoji, name, cost, ts, given }
})

function load(key) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fresh()
    const data = JSON.parse(raw)
    const base = fresh()
    return { ...base, ...data, profile: { ...base.profile, ...data.profile }, best: { ...base.best, ...data.best } }
  } catch {
    return fresh()
  }
}

// ---- children --------------------------------------------------------------
// Each child has their own saved data. The first child keeps the original key,
// so progress saved before this feature existed is still theirs.
const INDEX = 'maths-practice-kids'
const keyOf = (id) => (id === 'main' ? KEY : `${KEY}-${id}`)

function loadIndex() {
  try {
    const i = JSON.parse(localStorage.getItem(INDEX))
    if (i?.kids?.length && i.kids.includes(i.active)) return i
  } catch {
    /* use the default */
  }
  return { active: 'main', kids: ['main'] }
}

const index = loadIndex()
const [kids, setKids] = createSignal(index.kids)
const [activeId, setActiveId] = createSignal(index.active)

const saveIndex = () => {
  try {
    localStorage.setItem(INDEX, JSON.stringify({ active: activeId(), kids: kids() }))
  } catch {
    /* storage full or blocked */
  }
}

export const [state, setState] = createStore(load(keyOf(index.active)))

createRoot(() => {
  createEffect(() => {
    const json = JSON.stringify(state)
    try {
      localStorage.setItem(keyOf(untrack(activeId)), json)
    } catch {
      /* storage full or blocked: nothing we can do */
    }
  })
})

// Keep tabs in sync (eg. grown-up edits on another tab)
window.addEventListener('storage', (e) => {
  if (e.key === keyOf(activeId()) && e.newValue) {
    try {
      setState(reconcile(JSON.parse(e.newValue)))
    } catch {
      /* ignore */
    }
  }
})

const readProfile = (id) => {
  try {
    return JSON.parse(localStorage.getItem(keyOf(id)))?.profile ?? {}
  } catch {
    return {}
  }
}

/** Everyone on this device: [{ id, name, year, active }] */
export const kidList = () =>
  kids().map((id) => {
    const active = id === activeId()
    const p = active ? state.profile : readProfile(id)
    return { id, name: p.name || 'New child', year: p.year, active }
  })

// One batch, so the save effect writes the new child's data to the new child's key
function openKid(id, data) {
  batch(() => {
    setActiveId(id)
    setState(reconcile(data))
  })
  saveIndex()
}

export function switchKid(id) {
  if (id !== activeId() && kids().includes(id)) openKid(id, load(keyOf(id)))
}

/** Add an empty child and switch to them (the set-up screen shows next) */
export function addKid() {
  const id = Math.random().toString(36).slice(2, 8)
  setKids([...kids(), id])
  openKid(id, fresh())
}

/** Delete the current child's data. The last child can't be removed: reset instead. */
export function removeKid() {
  if (kids().length < 2) return resetAll()
  const gone = activeId()
  const rest = kids().filter((k) => k !== gone)
  setKids(rest)
  openKid(rest[0], load(keyOf(rest[0])))
  try {
    localStorage.removeItem(keyOf(gone))
  } catch {
    /* ignore */
  }
}

// ---- derived helpers ------------------------------------------------------
export const startLevel = (year) => [1, 1, 2, 2, 3, 4, 4][year] ?? 2

export function topicLevel(id) {
  return state.topics[id]?.level ?? Math.max(1, startLevel(state.profile.year) - (TOPIC_BY_ID[id].minYear > state.profile.year ? 1 : 0))
}

export function topicAccuracy(id) {
  const t = state.topics[id]
  if (!t?.recent?.length) return null
  return t.recent.reduce((a, b) => a + b, 0) / t.recent.length
}

/** 0–3 stars, based on level reached and recent accuracy */
export function topicStars(id) {
  const t = state.topics[id]
  if (!t || t.total < 5) return 0
  const acc = topicAccuracy(id) ?? 0
  if (t.level >= 5 && acc >= 0.85) return 3
  if (t.level >= 3 && acc >= 0.7) return 2
  return acc >= 0.5 ? 1 : 0
}

/** Spaced repetition: how many days until a topic should be practised again */
export function reviewInterval(id) {
  const acc = topicAccuracy(id)
  if (acc == null) return 0
  if (acc < 0.6) return 1
  if (acc < 0.8) return 2
  if (acc < 0.9) return 4
  return 7
}

export function isDue(id) {
  const t = state.topics[id]
  if (!t?.last) return false
  return Date.now() - t.last >= reviewInterval(id) * DAY - DAY / 4
}

export const visibleTopics = () =>
  TOPICS.filter((t) => t.minYear <= state.profile.year + 1)

export function dueTopics() {
  return visibleTopics()
    .filter((t) => isDue(t.id))
    .sort((a, b) => (topicAccuracy(a.id) ?? 0) - (topicAccuracy(b.id) ?? 0))
}

/** Topics most in need of work: weakest accuracy first, never-tried next */
export function weakTopics(n = 3) {
  return visibleTopics()
    .filter((t) => state.topics[t.id]?.total >= 5)
    .sort((a, b) => (topicAccuracy(a.id) ?? 0) - (topicAccuracy(b.id) ?? 0))
    .slice(0, n)
}

export function weekTotals(start = weekStart()) {
  let points = 0, correct = 0, total = 0, active = 0
  for (const k of weekDays(start)) {
    const d = state.days[k]
    if (!d) continue
    points += d.points
    correct += d.correct
    total += d.total
    if (d.total) active++
  }
  return { points, correct, total, active }
}

export function pastWeeks(n = 8) {
  const out = []
  const s = weekStart()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(s)
    d.setDate(d.getDate() - i * 7)
    out.push({ start: d, ...weekTotals(d) })
  }
  return out
}

/** The weekly target creeps up ~10% on recent form so improvement is steady */
export function weeklyGoal() {
  if (state.profile.goal !== 'auto') return Number(state.profile.goal) || 300
  const prev = pastWeeks(4).slice(0, 3).map((w) => w.points).filter((p) => p > 0)
  if (!prev.length) return 300
  const avg = prev.reduce((a, b) => a + b, 0) / prev.length
  return Math.max(200, Math.round((avg * 1.1) / 50) * 50)
}

export function dayStreak() {
  let n = 0
  const d = new Date()
  if (!state.days[dayKey(d)]?.total) d.setDate(d.getDate() - 1)
  while (state.days[dayKey(d)]?.total) {
    n++
    d.setDate(d.getDate() - 1)
  }
  return n
}

export const totalPoints = () => Object.values(state.days).reduce((a, d) => a + d.points, 0)

// ---- rewards ----------------------------------------------------------------
/** Points available to spend: everything earned minus rewards already claimed */
export const spent = () => (state.claims || []).reduce((a, c) => a + c.cost, 0)
export const balance = () => totalPoints() - spent()

export const REWARD_IDEAS = [
  ['🎬', 'Film night', 1000],
  ['🍦', 'Ice cream treat', 500],
  ['🎮', '30 minutes extra games', 300],
  ['🍕', 'Choose what’s for dinner', 1500],
  ['🛝', 'Trip to the park', 600],
  ['📚', 'A new book', 2000],
  ['🌙', 'Stay up 15 minutes later', 400],
  ['🎲', 'Family board game night', 800],
]

const uid = () => Math.random().toString(36).slice(2, 9)

export function addReward(emoji, name, cost) {
  setState('rewards', (r) => [...(r || []), { id: uid(), emoji: emoji || '🎁', name, cost: Math.max(1, Math.round(cost)) }])
}
export function updateReward(id, patch) {
  setState('rewards', (r) => r.map((x) => (x.id === id ? { ...x, ...patch } : x)))
}
export function removeReward(id) {
  setState('rewards', (r) => r.filter((x) => x.id !== id))
}
export function claimReward(id) {
  const r = state.rewards.find((x) => x.id === id)
  if (!r || balance() < r.cost) return false
  setState('claims', (c) => [{ id: uid(), rewardId: r.id, emoji: r.emoji, name: r.name, cost: r.cost, ts: Date.now(), given: false }, ...(c || [])])
  return true
}
export function setClaimGiven(id, given) {
  setState('claims', (c) => c.map((x) => (x.id === id ? { ...x, given } : x)))
}
export function undoClaim(id) {
  setState('claims', (c) => c.filter((x) => x.id !== id))
}

// ---- mutations ------------------------------------------------------------

/** Record one answered question. Returns { levelChange } */
export function recordAnswer(q, correct, points, firstTry) {
  const today = dayKey()
  let levelChange = 0
  setState(
    produce((s) => {
      const d = (s.days[today] ||= { points: 0, correct: 0, total: 0 })
      d.points += points
      d.total += 1
      if (correct) d.correct += 1

      const t = (s.topics[q.topic] ||= { level: q.level, recent: [], atLevel: [], correct: 0, total: 0, last: 0 })
      t.total += 1
      if (correct) t.correct += 1
      t.last = Date.now()
      t.recent = [...t.recent, correct && firstTry ? 1 : 0].slice(-20)
      // Adaptive difficulty: judged only on questions at the topic's level
      if (!q.practiceLevel && q.level === t.level) {
        t.atLevel = [...(t.atLevel || []), correct && firstTry ? 1 : 0].slice(-8)
        const hits = t.atLevel.reduce((a, b) => a + b, 0)
        if (t.atLevel.length >= 8 && hits >= 7 && t.level < 5) {
          t.level += 1
          t.atLevel = []
          levelChange = 1
        } else if (t.atLevel.length >= 5 && t.atLevel.slice(-5).reduce((a, b) => a + b, 0) <= 1 && t.level > 1) {
          t.level -= 1
          t.atLevel = []
          levelChange = -1
        }
      }

      if (q.table) {
        const tt = (s.tables[q.table] ||= { c: 0, t: 0 })
        tt.t += 1
        if (correct && firstTry) tt.c += 1
      }

      const sameQ = (m) => m.text === q.text && m.topic === q.topic
      if (!(correct && firstTry)) {
        if (!s.mistakes.some(sameQ)) s.mistakes = [{ ...q, ts: Date.now() }, ...s.mistakes].slice(0, 60)
      } else if (q.fromMistakes) {
        s.mistakes = s.mistakes.filter((m) => !sameQ(m))
        s.best.fixed = (s.best.fixed || 0) + 1
      }
    }),
  )
  return { levelChange }
}

export function recordSession(session) {
  setState(
    produce((s) => {
      s.sessions = [{ ts: Date.now(), ...session }, ...s.sessions].slice(0, 200)
      if (session.bestStreak > s.best.streak) s.best.streak = session.bestStreak
      if (session.mode === 'blitz' && session.correct > s.best.blitz) s.best.blitz = session.correct
      if (session.mode === 'daily') s.best.dailyDone = dayKey()
    }),
  )
}

export function addBonus(points) {
  const today = dayKey()
  setState(produce((s) => {
    const d = (s.days[today] ||= { points: 0, correct: 0, total: 0 })
    d.points += points
  }))
}

export function setLevel(id, level) {
  setState(produce((s) => {
    const t = (s.topics[id] ||= { level, recent: [], atLevel: [], correct: 0, total: 0, last: 0 })
    t.level = level
    t.atLevel = []
  }))
}

export function resetAll() {
  setState(fresh())
}

export function exportData() {
  return JSON.stringify(state, null, 2)
}

export function importData(json) {
  const data = JSON.parse(json)
  if (!data || typeof data !== 'object' || !data.profile) throw new Error('Not a practice backup')
  const base = fresh()
  setState({ ...base, ...data, profile: { ...base.profile, ...data.profile }, best: { ...base.best, ...data.best } })
}

// ---- badges ---------------------------------------------------------------
export const BADGES = [
  { id: 'first', emoji: '🌱', name: 'First steps', desc: 'Finish your first session', test: () => state.sessions.length >= 1 },
  { id: 'ten', emoji: '🔟', name: 'Perfect ten', desc: 'Get 10 right in a row', test: () => state.best.streak >= 10 },
  { id: 'twenty', emoji: '🔥', name: 'On fire', desc: 'Get 20 right in a row', test: () => state.best.streak >= 20 },
  { id: 'goal', emoji: '🏆', name: 'Goal getter', desc: 'Hit your weekly goal', test: () => weekTotals().points >= weeklyGoal() },
  { id: 'streak3', emoji: '📅', name: 'Three in a row', desc: 'Practise 3 days running', test: () => dayStreak() >= 3 },
  { id: 'streak7', emoji: '🗓️', name: 'Week warrior', desc: 'Practise 7 days running', test: () => dayStreak() >= 7 },
  { id: 'blitz15', emoji: '⚡', name: 'Lightning', desc: 'Score 15 in Beat the Clock', test: () => state.best.blitz >= 15 },
  { id: 'blitz30', emoji: '🚀', name: 'Rocket brain', desc: 'Score 30 in Beat the Clock', test: () => state.best.blitz >= 30 },
  { id: 'fixer', emoji: '🔧', name: 'Fixer', desc: 'Fix 10 old mistakes', test: () => (state.best.fixed || 0) >= 10 },
  { id: 'explorer', emoji: '🧭', name: 'Explorer', desc: 'Try 8 different topics', test: () => Object.keys(state.topics).length >= 8 },
  { id: 'star', emoji: '⭐', name: 'Superstar', desc: 'Get 3 stars on any topic', test: () => TOPICS.some((t) => topicStars(t.id) === 3) },
  { id: 'tables', emoji: '🧮', name: 'Table master', desc: 'Reach level 5 in times tables', test: () => (state.topics.tables?.level ?? 0) >= 5 },
  { id: 'k1', emoji: '💎', name: '1,000 club', desc: 'Earn 1,000 points in total', test: () => totalPoints() >= 1000 },
  { id: 'k5', emoji: '👑', name: '5,000 club', desc: 'Earn 5,000 points in total', test: () => totalPoints() >= 5000 },
]

/** Award any newly earned badges, returning them */
export function checkBadges() {
  const earned = BADGES.filter((b) => !state.badges[b.id] && b.test())
  if (earned.length)
    setState(produce((s) => { for (const b of earned) s.badges[b.id] = Date.now() }))
  return earned
}
