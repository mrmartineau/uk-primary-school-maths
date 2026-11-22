import { makeQuestion, makeRng, shuffle, TOPIC_BY_ID } from './questions'
import { state, topicLevel, topicAccuracy, isDue, visibleTopics, dayKey } from './store'

export const POINTS = {
  base: 10,
  perLevel: 2,
  streakEvery: 5,
  streakBonus: 5,
  finish: 20,
  perfect: 30,
  daily: 50,
}

export function pointsFor(q, { firstTry, streak }) {
  let p = POINTS.base + POINTS.perLevel * (q.level - 1)
  if (!firstTry) p = Math.ceil(p / 2)
  if (state.profile.focus.includes(q.topic)) p *= 2
  if (firstTry && streak > 0 && streak % POINTS.streakEvery === 0) p += POINTS.streakBonus
  return p
}

/** Weighted pick favouring weak, due and focus topics */
function weightedTopic(r, ids) {
  const weights = ids.map((id) => {
    let w = 1
    const acc = topicAccuracy(id)
    if (acc == null) w += 0.5
    else w += (1 - acc) * 2
    if (isDue(id)) w += 1
    if (state.profile.focus.includes(id)) w += 1.5
    return w
  })
  let x = r() * weights.reduce((a, b) => a + b, 0)
  for (let i = 0; i < ids.length; i++) {
    x -= weights[i]
    if (x <= 0) return ids[i]
  }
  return ids[ids.length - 1]
}

/** Build the next question for a session config */
export function nextQuestion(cfg, r = Math.random) {
  const ids = cfg.topics?.length ? cfg.topics : visibleTopics().map((t) => t.id)
  const id = ids.length === 1 ? ids[0] : weightedTopic(r, ids)
  let level = cfg.level || topicLevel(id)
  let practiceLevel = !!cfg.level
  if (!cfg.level && cfg.mode !== 'blitz') {
    // Mostly at their level, with the odd confidence-builder and stretch
    const x = r()
    if (x < 0.12 && level > 1) level -= 1
    else if (x > 0.92 && level < 5) level += 1
  }
  const q = makeQuestion(id, level, r, { tables: cfg.tables })
  return { ...q, practiceLevel }
}

export function buildQuestions(cfg) {
  if (cfg.questions) return cfg.questions
  const r = cfg.seed ? makeRng(cfg.seed) : Math.random
  const out = []
  const seen = new Set()
  let guard = 0
  while (out.length < cfg.count && guard++ < cfg.count * 20) {
    const q = nextQuestion(cfg, r)
    if (seen.has(q.text + JSON.stringify(q.visual || ''))) continue
    seen.add(q.text + JSON.stringify(q.visual || ''))
    out.push(q)
  }
  return out
}

// ---- preset session configs ----------------------------------------------

export const quickMix = () => ({ mode: 'mix', title: 'Quick mix', emoji: '🎲', count: 10 })

export function dailyChallenge() {
  const today = dayKey()
  const r = makeRng('daily-' + today)
  const pool = visibleTopics().map((t) => t.id)
  const due = pool.filter(isDue)
  const focus = state.profile.focus.filter((id) => pool.includes(id))
  const picks = shuffle(r, [...new Set([...focus, ...due, ...shuffle(r, pool)])]).slice(0, 5)
  return {
    mode: 'daily',
    title: 'Daily challenge',
    emoji: '📆',
    count: 10,
    topics: picks,
    seed: 'daily-' + today + '-' + picks.join(','),
  }
}

export const topicSession = (id, count = 10, level = 0) => ({
  mode: 'topic',
  title: TOPIC_BY_ID[id].name,
  emoji: TOPIC_BY_ID[id].emoji,
  topics: [id],
  count,
  level,
})

export const tablesSession = (tables, count = 15) => ({
  mode: 'tables',
  title: tables.length === 1 ? `${tables[0]} times table` : 'Times tables',
  emoji: '✖️',
  topics: ['tables'],
  tables,
  count,
  level: 5, // all question styles, judged as practice only
})

export const blitz = (topics, tables) => ({
  mode: 'blitz',
  title: 'Beat the clock',
  emoji: '⏱️',
  topics,
  tables,
  count: 999,
  seconds: 60,
})

export function mistakesSession() {
  const qs = state.mistakes.slice(0, 10).map((m) => ({ ...m, fromMistakes: true, practiceLevel: true }))
  return { mode: 'mistakes', title: 'Fix my mistakes', emoji: '🔧', count: qs.length, questions: qs }
}

export function reviewSession(ids) {
  return { mode: 'review', title: 'Time to review', emoji: '🔁', topics: ids, count: 10 }
}
