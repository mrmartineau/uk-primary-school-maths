import { For, Match, Show, Switch, createSignal, onCleanup, onMount } from 'solid-js'
import { Bar, BigButton, Card, Chip, Confetti, CopyLink, Modal, Stars } from './components'
import Quiz from './Quiz'
import { Grownups, Setup } from './Grownups'
import { Toolbox } from './Tools'
import { STRETCH_SCALES, TOPICS, TOPIC_BY_ID } from './questions'
import {
  BADGES, addBonus, balance, checkBadges, claimReward, dayKey, dayStreak, dueTopics, kidList, pastWeeks, recordSession, state, switchKid,
  topicAccuracy, topicLevel, topicStars, totalPoints, visibleTopics, weakTopics, weekDays, weekTotals, weeklyGoal,
} from './store'
import { POINTS, STRETCHABLE, scaleLabel, stretchScales, stretchSession, blitz, dailyChallenge, mistakesSession, quickMix, reviewSession, tablesSession, topicSession } from './session'
import { sfx } from './sound'
import { configFromPlay, parseHash, playHash, toHash } from './routes'
import { Import } from './Transfer'

// --- hash router: every screen, tool and quiz has a link, and iOS swipe-back works
function routeFromHash() {
  const r = parseHash()
  if (r.name === 'play') {
    const config = configFromPlay(r.params)
    return config ? { name: 'quiz', params: { config } } : { name: 'home', params: {} }
  }
  return r
}
const [route, setRoute] = createSignal(routeFromHash())
let depth = 0 // in-app pages we can go back to
function go(name, params = {}) {
  sfx.tap()
  depth++
  history.pushState({ name, params }, '', toHash(name, params))
  setRoute({ name, params })
  window.scrollTo(0, 0)
}
/** Update the address bar without adding a history entry (eg a tab change) */
export function replaceRoute(name, params = {}) {
  history.replaceState({ name, params }, '', toHash(name, params))
}
function goHome() {
  history.replaceState({ name: 'home', params: {} }, '', '#/')
  setRoute({ name: 'home', params: {} })
  window.scrollTo(0, 0)
}
function back() {
  if (depth > 0) {
    depth--
    history.back()
  } else goHome()
}

export default function App() {
  const onPop = (e) => setRoute(e.state?.name ? { name: e.state.name, params: e.state.params } : routeFromHash())
  // Typing or tapping a link to a different hash
  const onHash = () => {
    if (history.state?.name && toHash(history.state.name, history.state.params) === location.hash) return
    let r = routeFromHash()
    if (r.name === 'results') r = { name: 'home', params: {} }
    history.replaceState(r, '', r.name === 'quiz' || r.name === 'import' ? location.hash : toHash(r.name, r.params))
    setRoute(r)
  }
  onMount(() => {
    const r = route()
    // A results page can't be rebuilt from a link, and a bare address means home
    if (r.name === 'results' || !location.hash) replaceRouteState({ name: 'home', params: {} })
    else history.replaceState(r, '', r.name === 'quiz' || r.name === 'import' ? location.hash : toHash(r.name, r.params))
    window.addEventListener('popstate', onPop)
    window.addEventListener('hashchange', onHash)
  })
  onCleanup(() => { window.removeEventListener('popstate', onPop); window.removeEventListener('hashchange', onHash) })

  const r = () => route()
  return (
    <Show when={r().name !== 'import'} fallback={<Import code={r().params.code} onDone={goHome} />}>
    <Show when={state.profile.setup} fallback={<Setup />}>
      <div class="min-h-dvh">
        <Show when={r().name !== 'quiz'}>
          <TopBar />
        </Show>
        <main class={`safe-x mx-auto w-full max-w-5xl pt-3 ${r().name === 'quiz' ? 'safe-top' : ''} ${r().name === 'quiz' || r().name === 'results' ? 'pb-4' : 'pb-28'}`}>
          <Switch>
            <Match when={r().name === 'home'}><Home /></Match>
            <Match when={r().name === 'topics'}><Show keyed when={r().params}>{(p) => <Topics topic={p.topic} />}</Show></Match>
            <Match when={r().name === 'tables'}><Show keyed when={r().params}>{(p) => <Tables tables={p.tables} />}</Show></Match>
            <Match when={r().name === 'blitz'}><BlitzSetup /></Match>
            <Match when={r().name === 'stretch'}><StretchSetup /></Match>
            <Match when={r().name === 'progress'}><Progress /></Match>
            <Match when={r().name === 'badges'}><Badges /></Match>
            <Match when={r().name === 'rewards'}><Rewards /></Match>
            <Match when={r().name === 'tools'}><Show keyed when={r().params}>{(p) => <ToolsScreen tab={p.tab} topic={p.topic} />}</Show></Match>
            <Match when={r().name === 'grownups'}><Grownups onBack={back} /></Match>
            <Match when={r().name === 'quiz'}>
              <Show keyed when={r().params.config}>
                {(config) => (
                  <Quiz
                    config={config}
                    onQuit={back}
                    onDone={(stats) => finishSession(config, stats)}
                  />
                )}
              </Show>
            </Match>
            <Match when={r().name === 'results'}><Results {...r().params} /></Match>
          </Switch>
        </main>
        <Show when={r().name !== 'quiz' && r().name !== 'results'}>
          <BottomNav />
        </Show>
      </div>
    </Show>
    </Show>
  )
}

function replaceRouteState(r) {
  history.replaceState(r, '', toHash(r.name, r.params))
  setRoute(r)
}

function start(config) {
  go('quiz', { config })
}

function finishSession(config, stats) {
  let bonus = 0
  const notes = []
  if (stats.total >= 10 && config.mode !== 'blitz') {
    bonus += POINTS.finish
    notes.push(`+${POINTS.finish} for finishing`)
  }
  if (stats.total >= 10 && stats.correct === stats.total) {
    bonus += POINTS.perfect
    notes.push(`+${POINTS.perfect} perfect score!`)
  }
  if (config.mode === 'daily' && state.best.dailyDone !== dayKey()) {
    bonus += POINTS.daily
    notes.push(`+${POINTS.daily} daily challenge`)
  }
  if (bonus) addBonus(bonus)
  const prevBlitz = state.best.blitz
  recordSession({ mode: config.mode, title: config.title, emoji: config.emoji, correct: stats.correct, total: stats.total, points: stats.points + bonus, bestStreak: stats.bestStreak })
  const badges = checkBadges().map((b) => b.id)
  sfx.finish()
  // Replace the quiz in history so "back" doesn't restart it
  const params = { config, stats, bonus, notes, badges, newBest: config.mode === 'blitz' && stats.correct > prevBlitz }
  history.replaceState({ name: 'results', params }, '', '#/results')
  setRoute({ name: 'results', params })
}

// ---------------------------------------------------------------------------

function TopBar() {
  const week = () => weekTotals()
  return (
    <header class="safe-top safe-x sticky top-0 z-30 bg-white/70 pb-3 backdrop-blur-md dark:bg-violet-950/70">
      <div class="mx-auto flex max-w-5xl items-center justify-between gap-3">
        <button type="button" onClick={() => go('home')} class="flex items-center gap-2 text-left">
          <span class="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 text-xl shadow">⭐</span>
          <span class="text-xl font-black tracking-tight text-violet-900 dark:text-violet-50">Maths Quest</span>
        </button>
        <div class="flex items-center gap-2">
          <Show when={dayStreak() > 0}>
            <span class="rounded-full bg-orange-100 px-3 py-1.5 text-sm font-black text-orange-700 dark:bg-orange-500/20 dark:text-orange-200" title="Days in a row">
              🔥 {dayStreak()}
            </span>
          </Show>
          <button type="button" onClick={() => go('progress')} class="rounded-full bg-amber-100 px-3 py-1.5 text-sm font-black text-amber-800 dark:bg-amber-500/20 dark:text-amber-100" title="Points this week">
            ⭐ {week().points}
          </button>
        </div>
      </div>
    </header>
  )
}

function BottomNav() {
  const items = [
    ['home', '🏠', 'Play'],
    ['progress', '📈', 'Progress'],
    ['rewards', '🎁', 'Rewards'],
    ['badges', '🏅', 'Badges'],
    ['grownups', '👪', 'Grown-ups'],
  ]
  return (
    <nav class="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-black/5 bg-white/85 pt-2 backdrop-blur-md dark:border-white/10 dark:bg-violet-950/85">
      <div class="mx-auto grid max-w-lg grid-cols-5 px-1">
        <For each={items}>
          {([name, icon, label]) => (
            <button
              type="button"
              onClick={() => go(name)}
              class={`flex flex-col items-center gap-0.5 rounded-2xl py-1 text-xs font-bold ${route().name === name ? 'text-violet-700 dark:text-violet-200' : 'text-slate-500 dark:text-slate-400'}`}
            >
              <span class={`text-2xl transition-transform ${route().name === name ? 'scale-110' : ''}`}>{icon}</span>
              {label}
            </button>
          )}
        </For>
      </div>
    </nav>
  )
}

function WeekCard() {
  const w = () => weekTotals()
  const goal = () => weeklyGoal()
  const days = weekDays()
  const today = dayKey()
  const left = () => Math.max(0, goal() - w().points)
  return (
    <Card class="relative overflow-hidden">
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="text-sm font-bold uppercase tracking-wide text-violet-500 dark:text-violet-300">This week</p>
          <p class="text-4xl font-black">
            {w().points} <span class="text-lg font-bold text-slate-500 dark:text-slate-400">/ {goal()} ⭐</span>
          </p>
        </div>
        <div class={`text-5xl ${w().points >= goal() ? 'wiggle' : ''}`}>{w().points >= goal() ? '🏆' : '🚀'}</div>
      </div>
      <Bar class="mt-3 h-5" value={w().points / goal()} />
      <p class="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
        {w().points >= goal() ? 'Goal smashed! Every extra point is a bonus 🎉' : `${left()} points to go. About ${Math.ceil(left() / 120)} quick game${Math.ceil(left() / 120) === 1 ? '' : 's'}!`}
      </p>
      <div class="mt-3 grid grid-cols-7 gap-1.5 text-center text-xs font-bold">
        <For each={days}>
          {(d, i) => {
            const pts = () => state.days[d]?.points || 0
            return (
              <div class="flex flex-col items-center gap-1">
                <span class="text-slate-500 dark:text-slate-400">{'MTWTFSS'[i()]}</span>
                <span
                  class={`grid h-9 w-9 place-items-center rounded-full text-base ${pts() ? 'bg-gradient-to-br from-emerald-400 to-green-600 text-white shadow' : d === today ? 'bg-white ring-2 ring-violet-400 dark:bg-white/10' : 'bg-black/5 dark:bg-white/5'}`}
                >
                  {pts() ? '✓' : ''}
                </span>
              </div>
            )
          }}
        </For>
      </div>
    </Card>
  )
}

function Tile(props) {
  return (
    <button
      type="button"
      onClick={() => { sfx.tap(); props.onClick() }}
      disabled={props.disabled}
      class={`btn-3d relative flex min-h-32 flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br p-4 text-left text-white ${props.color} ${props.class || ''}`}
    >
      <span class="text-4xl drop-shadow">{props.emoji}</span>
      <span>
        <span class="block text-xl font-black leading-tight">{props.title}</span>
        <span class="block text-sm font-semibold opacity-90">{props.sub}</span>
      </span>
      <Show when={props.badge}>
        <span class="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-black text-violet-800">{props.badge}</span>
      </Show>
    </button>
  )
}

function Home() {
  const due = () => dueTopics()
  const weak = () => weakTopics(3)
  const dailyDone = () => state.best.dailyDone === dayKey()
  const hour = new Date().getHours()
  const hello = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  return (
    <div class="grid grid-cols-1 gap-4">
      <h1 class="text-3xl font-black tracking-tight sm:text-4xl">
        {hello}{state.profile.name ? `, ${state.profile.name}` : ''}! 👋
      </h1>

      <Show when={kidList().length > 1}>
        <div class="flex flex-wrap gap-2" role="group" aria-label="Who is playing?">
          <For each={kidList()}>{(k) => <Chip on={k.active} onClick={() => switchKid(k.id)}>{k.name}</Chip>}</For>
        </div>
      </Show>

      <RewardCard />

      <div class="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <WeekCard />
        <Card>
          <p class="text-sm font-bold uppercase tracking-wide text-violet-500 dark:text-violet-300">Practise again</p>
          <Show
            when={due().length || weak().length}
            fallback={<p class="mt-2 font-semibold text-slate-600 dark:text-slate-300">Play a few games and I’ll remind you which topics to come back to. 🧠</p>}
          >
            <p class="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
              {due().length ? 'These are ready for a quick review:' : 'These could use a little more practice:'}
            </p>
            <div class="mt-3 flex flex-wrap gap-2">
              <For each={(due().length ? due() : weak()).slice(0, 5)}>
                {(t) => (
                  <button type="button" onClick={() => start(topicSession(t.id))} class={`btn-3d rounded-full bg-gradient-to-br px-3 py-2 font-bold text-white ${t.color}`}>
                    {t.emoji} {t.name}
                  </button>
                )}
              </For>
            </div>
            <Show when={due().length > 1}>
              <BigButton class="mt-3 w-full" color="bg-gradient-to-r from-violet-500 to-fuchsia-500" onClick={() => start(reviewSession(due().map((t) => t.id)))}>
                🔁 Review all ({due().length})
              </BigButton>
            </Show>
          </Show>
          <Show when={state.profile.focus.length}>
            <p class="mt-3 text-sm font-bold text-pink-600 dark:text-pink-300">
              ✨ Double points this week: {state.profile.focus.map((id) => TOPIC_BY_ID[id]?.name).filter(Boolean).join(', ')}
            </p>
          </Show>
        </Card>
      </div>

      <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Tile emoji="📆" title="Daily challenge" sub={dailyDone() ? 'Done today! Play again?' : `10 questions · +${POINTS.daily} bonus`} color="from-orange-400 to-pink-500" badge={dailyDone() ? '✓' : 'NEW'} onClick={() => start(dailyChallenge())} class="col-span-2 sm:col-span-1" />
        <Tile emoji="🎲" title="Quick mix" sub="10 random questions" color="from-violet-500 to-indigo-600" onClick={() => start(quickMix())} />
        <Tile emoji="🎯" title="Pick a topic" sub="Choose what to practise" color="from-sky-400 to-blue-600" onClick={() => go('topics')} />
        <Tile emoji="✖️" title="Times tables" sub="Pick your tables" color="from-fuchsia-500 to-purple-600" onClick={() => go('tables')} />
        <Tile emoji="⏱️" title="Beat the clock" sub={state.best.blitz ? `Best: ${state.best.blitz} in 60s` : '60 seconds. Go!'} color="from-rose-400 to-red-600" onClick={() => go('blitz')} />
        <Tile emoji="💪" title="Stretch it" sub="Easy facts, bigger numbers" color="from-lime-500 to-emerald-600" onClick={() => go('stretch')} />
        <Tile emoji="🧰" title="Tools & tricks" sub="Number line, grids, shortcuts" color="from-amber-400 to-orange-500" onClick={() => go('tools')} />
        <Tile
          class="col-span-2 sm:col-span-2"
          emoji="🔧"
          title="Fix mistakes"
          sub={state.mistakes.length ? `${state.mistakes.length} to fix` : 'No mistakes saved!'}
          color="from-emerald-400 to-teal-600"
          badge={state.mistakes.length ? String(state.mistakes.length) : ''}
          disabled={!state.mistakes.length}
          onClick={() => start(mistakesSession())}
        />
      </div>
    </div>
  )
}

function Topics(props) {
  const [sel, _setSel] = createSignal(props.topic ? TOPIC_BY_ID[props.topic] : null)
  const setSel = (t) => {
    _setSel(t)
    replaceRoute('topics', t ? { topic: t.id } : {})
  }
  const [count, setCount] = createSignal(10)
  const [level, setLevel] = createSignal(0)
  const [scale, setScale] = createSignal(0)
  const shown = () => (state.profile.showAll ? TOPICS : visibleTopics())
  return (
    <div class="grid grid-cols-1 gap-4">
      <h1 class="text-3xl font-black">Pick a topic 🎯</h1>
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <For each={shown()}>
          {(t) => {
            const acc = () => topicAccuracy(t.id)
            return (
              <button
                type="button"
                onClick={() => { sfx.tap(); setLevel(0); setScale(0); setSel(t) }}
                class={`btn-3d relative flex min-h-36 flex-col justify-between rounded-3xl bg-gradient-to-br p-4 text-left text-white ${t.color}`}
              >
                <span class="text-4xl drop-shadow">{t.emoji}</span>
                <span>
                  <span class="block text-lg font-black leading-tight">{t.name}</span>
                  <span class="mt-1 flex items-center justify-between text-sm font-bold">
                    <span>Level {topicLevel(t.id)}</span>
                    <Stars n={topicStars(t.id)} />
                  </span>
                  <Show when={acc() != null}>
                    <Bar class="mt-1.5 h-2 bg-white/30" color="bg-white" value={acc()} />
                  </Show>
                </span>
                <Show when={state.profile.focus.includes(t.id)}>
                  <span class="absolute right-3 top-3 rounded-full bg-white/90 px-2 py-0.5 text-xs font-black text-pink-600">×2</span>
                </Show>
              </button>
            )
          }}
        </For>
      </div>
      <Modal open={!!sel()} onClose={() => setSel(null)}>
        <Show when={sel()}>
          <div class="text-center">
            <div class="text-6xl">{sel().emoji}</div>
            <h2 class="mt-1 text-2xl font-black">{sel().name}</h2>
            <p class="font-semibold text-slate-500 dark:text-slate-300">
              You’re on level {topicLevel(sel().id)} · <Stars n={topicStars(sel().id)} />
            </p>
          </div>
          <p class="mt-4 text-sm font-bold uppercase tracking-wide text-slate-500">How many questions?</p>
          <div class="mt-2 flex gap-2">
            <For each={[5, 10, 20]}>{(n) => <Chip on={count() === n} onClick={() => setCount(n)} class="flex-1">{n}</Chip>}</For>
          </div>
          <p class="mt-4 text-sm font-bold uppercase tracking-wide text-slate-500">Level</p>
          <div class="mt-2 flex flex-wrap gap-2">
            <Chip on={level() === 0} onClick={() => setLevel(0)}>Auto 🤖</Chip>
            <For each={[1, 2, 3, 4, 5]}>{(n) => <Chip on={level() === n} onClick={() => setLevel(n)}>{n}</Chip>}</For>
          </div>
          <p class="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">Auto moves you up a level when you get 7 out of 8 right.</p>
          <Show when={STRETCHABLE.includes(sel().id)}>
            <p class="mt-4 text-sm font-bold uppercase tracking-wide text-slate-500">Number size 💪</p>
            <div class="mt-2 flex flex-wrap gap-2">
              <Chip on={!scale()} onClick={() => setScale(0)}>Normal</Chip>
              <For each={STRETCH_SCALES}>{(sc) => <Chip on={scale() === sc} onClick={() => setScale(sc)}>{scaleLabel(sc)}</Chip>}</For>
            </div>
            <p class="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">Easy facts made bigger or smaller, like 300 + 700 = 1000 or 0.3 + 0.7 = 1.</p>
          </Show>
          <div class="mt-4 flex justify-center">
            <CopyLink hash={() => playHash(topicSession(sel().id, count(), level(), STRETCHABLE.includes(sel().id) ? scale() : 0))} label="Copy link to this practice" />
          </div>
          <BigButton class="mt-3 w-full" color="bg-emerald-500" onClick={() => { const t = sel(); _setSel(null); start(topicSession(t.id, count(), level(), STRETCHABLE.includes(t.id) ? scale() : 0)) }}>
            Let’s go! 🚀
          </BigButton>
        </Show>
      </Modal>
    </div>
  )
}

const TABLES = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

function TablePicker(props) {
  const toggle = (t) => props.setSel(props.sel.includes(t) ? props.sel.filter((x) => x !== t) : [...props.sel, t].sort((a, b) => a - b))
  return (
    <div class="grid grid-cols-4 gap-2.5 sm:grid-cols-6">
      <For each={TABLES}>
        {(t) => {
          const s = () => state.tables[t]
          const acc = () => (s()?.t ? s().c / s().t : null)
          const ring = () => (acc() == null ? '' : acc() >= 0.9 ? 'ring-4 ring-emerald-400' : acc() >= 0.7 ? 'ring-4 ring-amber-300' : 'ring-4 ring-rose-300')
          return (
            <button
              type="button"
              aria-pressed={props.sel.includes(t)}
              onClick={() => { sfx.tap(); toggle(t) }}
              class={`btn-3d flex h-16 flex-col items-center justify-center rounded-2xl text-2xl font-black ${ring()} ${props.sel.includes(t) ? 'bg-violet-600 text-white' : 'bg-white text-violet-900 dark:bg-white/10 dark:text-violet-100'}`}
            >
              {t}×
              <Show when={acc() != null}><span class="text-[10px] font-bold opacity-80">{Math.round(acc() * 100)}%</span></Show>
            </button>
          )
        }}
      </For>
    </div>
  )
}

function Tables(props) {
  const weakest = () =>
    TABLES.filter((t) => state.tables[t]?.t >= 5).sort((a, b) => state.tables[a].c / state.tables[a].t - state.tables[b].c / state.tables[b].t).slice(0, 3)
  const [sel, _setSel] = createSignal(props.tables?.length ? props.tables : weakest().length ? weakest() : [2, 5, 10])
  const setSel = (t) => {
    _setSel(t)
    replaceRoute('tables', { tables: t })
  }
  return (
    <div class="grid grid-cols-1 gap-4">
      <h1 class="text-3xl font-black">Times tables ✖️</h1>
      <Card>
        <p class="font-bold">Tap the tables you want to practise:</p>
        <div class="mt-3"><TablePicker sel={sel()} setSel={setSel} /></div>
        <div class="mt-3 flex flex-wrap gap-2">
          <Chip onClick={() => setSel([...TABLES])}>All</Chip>
          <Chip onClick={() => setSel([2, 5, 10])}>2, 5, 10</Chip>
          <Chip onClick={() => setSel([3, 4, 8])}>3, 4, 8</Chip>
          <Chip onClick={() => setSel([6, 7, 9])}>Tricky 6, 7, 9</Chip>
          <Show when={weakest().length}>
            <Chip onClick={() => setSel(weakest())}>My weakest 🎯</Chip>
          </Show>
        </div>
        <p class="mt-3 text-xs font-semibold text-slate-500 dark:text-slate-400">Green ring = 90%+ right, amber = 70%+, pink = needs practice.</p>
      </Card>
      <div class="grid gap-3 sm:grid-cols-2">
        <BigButton color="bg-gradient-to-r from-violet-500 to-fuchsia-500" disabled={!sel().length} onClick={() => start(tablesSession(sel()))}>
          🧠 Practise 15 questions
        </BigButton>
        <BigButton color="bg-gradient-to-r from-rose-400 to-red-500" disabled={!sel().length} onClick={() => start({ ...blitz(['tables'], sel()), title: 'Tables race' })}>
          ⏱️ 60-second race
        </BigButton>
      </div>
      <div class="flex justify-center">
        <CopyLink hash={() => playHash(tablesSession(sel()))} label="Copy link to practise these tables" />
      </div>
    </div>
  )
}

function BlitzSetup() {
  const [sel, setSel] = createSignal([])
  const toggle = (id) => setSel(sel().includes(id) ? sel().filter((x) => x !== id) : [...sel(), id])
  return (
    <div class="grid grid-cols-1 gap-4">
      <h1 class="text-3xl font-black">Beat the clock ⏱️</h1>
      <Card>
        <p class="font-semibold text-slate-600 dark:text-slate-300">How many can you get right in 60 seconds? Your best is <b>{state.best.blitz}</b>.</p>
        <p class="mt-3 font-bold">Pick topics (or leave empty for a mix):</p>
        <div class="mt-2 flex flex-wrap gap-2">
          <For each={visibleTopics()}>{(t) => <Chip on={sel().includes(t.id)} onClick={() => toggle(t.id)}>{t.emoji} {t.name}</Chip>}</For>
        </div>
      </Card>
      <BigButton class="text-2xl" color="bg-gradient-to-r from-rose-400 to-red-600" onClick={() => start(blitz(sel()))}>
        Ready… go! 🏁
      </BigButton>
    </div>
  )
}

const STRETCH_EXAMPLES = {
  10: '30 + 70 = 100',
  100: '300 + 700 = 1000',
  1000: '6000 × 4 = 24,000',
  0.1: '0.3 + 0.7 = 1',
  0.01: '0.25 + 0.75 = 1',
}

function StretchSetup() {
  const [topics, setTopics] = createSignal([])
  const [scales, setScales] = createSignal(stretchScales())
  const toggle = (get, set, v) => set(get().includes(v) ? get().filter((x) => x !== v) : [...get(), v])
  return (
    <div class="grid grid-cols-1 gap-4">
      <h1 class="text-3xl font-black">Stretch it 💪</h1>
      <Card>
        <p class="font-semibold text-slate-600 dark:text-slate-300">
          Use facts you already know to answer bigger questions. If you know <b>3 + 7 = 10</b>, you also know <b>300 + 700 = 1000</b> and <b>0.3 + 0.7 = 1</b>!
        </p>
        <p class="mt-4 font-bold">Number size</p>
        <div class="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-5">
          <For each={STRETCH_SCALES}>
            {(sc) => (
              <Chip on={scales().includes(sc)} onClick={() => toggle(scales, setScales, sc)} class="flex flex-col items-center rounded-2xl py-2">
                <span class="text-lg">{scaleLabel(sc)}</span>
                <span class="text-xs font-semibold opacity-80">{STRETCH_EXAMPLES[sc]}</span>
              </Chip>
            )}
          </For>
        </div>
        <p class="mt-4 font-bold">Topics (or leave empty for all)</p>
        <div class="mt-2 flex flex-wrap gap-2">
          <For each={STRETCHABLE}>
            {(id) => <Chip on={topics().includes(id)} onClick={() => toggle(topics, setTopics, id)}>{TOPIC_BY_ID[id].emoji} {TOPIC_BY_ID[id].name}</Chip>}
          </For>
        </div>
      </Card>
      <div class="grid gap-3 sm:grid-cols-2">
        <BigButton color="bg-gradient-to-r from-lime-500 to-emerald-600" onClick={() => start(stretchSession(topics(), scales()))}>
          💪 10 stretch questions
        </BigButton>
        <BigButton color="bg-gradient-to-r from-rose-400 to-red-500" onClick={() => start({ ...blitz(topics().length ? topics() : STRETCHABLE), mode: 'blitz', scales: scales().length ? scales() : [10], stretchBlitz: true, title: 'Stretch race' })}>
          ⏱️ 60-second stretch race
        </BigButton>
      </div>
    </div>
  )
}

function Results(props) {
  const s = props.stats
  const pct = s.total ? s.correct / s.total : 0
  const stars = pct >= 0.9 ? 3 : pct >= 0.7 ? 2 : pct >= 0.4 ? 1 : 0
  const isBlitz = props.config.mode === 'blitz'
  const title = isBlitz
    ? props.newBest ? 'New record! 🎉' : 'Time’s up!'
    : ['Keep going! 💪', 'Good effort! 👍', 'Great work! 🌟', 'Amazing! 🤩'][stars]
  const total = s.points + props.bonus
  const badges = props.badges.map((id) => BADGES.find((b) => b.id === id))
  const again = () => {
    const c = props.config
    if (c.mode === 'mistakes') return mistakesSession()
    if (c.mode === 'daily') return dailyChallenge()
    return { ...c, questions: undefined }
  }
  return (
    <div class="mx-auto grid max-w-xl grid-cols-1 gap-4 pt-4">
      <Show when={stars >= 2 || props.newBest}><Confetti count={40} /></Show>
      <Card class="pop-in text-center">
        <div class="text-6xl">{props.config.emoji}</div>
        <h1 class="mt-2 text-3xl font-black">{title}</h1>
        <Show when={!isBlitz}><div class="mt-2 text-4xl"><Stars n={stars} /></div></Show>
        <div class="mt-4 grid grid-cols-2 gap-3">
          <div class="rounded-2xl bg-emerald-100 p-3 dark:bg-emerald-500/20">
            <div class="text-3xl font-black text-emerald-700 dark:text-emerald-200">{s.correct}{isBlitz ? '' : `/${s.total}`}</div>
            <div class="text-sm font-bold text-emerald-800 dark:text-emerald-100">{isBlitz ? 'right in 60s' : 'first time right'}</div>
          </div>
          <div class="rounded-2xl bg-amber-100 p-3 dark:bg-amber-500/20">
            <div class="text-3xl font-black text-amber-700 dark:text-amber-200">+{total}</div>
            <div class="text-sm font-bold text-amber-800 dark:text-amber-100">points</div>
          </div>
        </div>
        <For each={props.notes}>{(n) => <p class="mt-2 font-bold text-violet-700 dark:text-violet-200">{n}</p>}</For>
        <Show when={s.bestStreak >= 3}><p class="mt-2 font-bold">🔥 Best streak: {s.bestStreak} in a row</p></Show>
        <For each={[...new Set(s.levelUps)]}>{(id) => <p class="mt-2 font-bold text-emerald-700 dark:text-emerald-300">🚀 Levelled up in {TOPIC_BY_ID[id].name}!</p>}</For>
      </Card>

      <Show when={badges.length}>
        <Card class="pop-in text-center">
          <p class="text-sm font-bold uppercase tracking-wide text-violet-500">New badge{badges.length > 1 ? 's' : ''}!</p>
          <div class="mt-2 flex flex-wrap justify-center gap-4">
            <For each={badges}>{(b) => <div><div class="wiggle text-5xl">{b.emoji}</div><div class="font-black">{b.name}</div></div>}</For>
          </div>
        </Card>
      </Show>

      <Show when={s.wrong.length}>
        <Card>
          <p class="font-black">Let’s remember these ({s.wrong.length}):</p>
          <ul class="mt-2 grid gap-2">
            <For each={s.wrong.slice(0, 6)}>
              {(q) => (
                <li class="rounded-2xl bg-sky-50 p-3 text-sm dark:bg-sky-500/10">
                  <div class="font-bold">{q.visual ? `${q.text} (${q.visual.type === 'clock' ? 'clock' : 'shape'})` : q.text}</div>
                  <div class="text-slate-600 dark:text-slate-300">{q.explain}</div>
                  <div class="font-bold text-emerald-700 dark:text-emerald-300">Answer: {q.answer.replace(/-/g, '−')}</div>
                </li>
              )}
            </For>
          </ul>
          <p class="mt-2 text-xs font-semibold text-slate-500">These are saved in “Fix mistakes” so you can try them again later.</p>
        </Card>
      </Show>

      <div class="grid grid-cols-2 gap-3">
        <BigButton color="bg-violet-600" onClick={goHome}>🏠 Home</BigButton>
        <BigButton color="bg-emerald-500" onClick={() => start(again())}>🔁 Again</BigButton>
      </div>
    </div>
  )
}

function Progress() {
  const weeks = () => pastWeeks(8)
  const max = () => Math.max(weeklyGoal(), ...weeks().map((w) => w.points), 1)
  const thisWeek = () => weekTotals()
  const lastWeek = () => weeks()[6]
  const tried = () => TOPICS.filter((t) => state.topics[t.id]?.total)
  return (
    <div class="grid grid-cols-1 gap-4">
      <h1 class="text-3xl font-black">My progress 📈</h1>
      <div class="grid grid-cols-3 gap-3">
        <Card class="text-center"><div class="text-3xl font-black">{totalPoints()}</div><div class="text-xs font-bold text-slate-500 dark:text-slate-400">total points</div></Card>
        <Card class="text-center"><div class="text-3xl font-black">🔥{dayStreak()}</div><div class="text-xs font-bold text-slate-500 dark:text-slate-400">day streak</div></Card>
        <Card class="text-center">
          <div class="text-3xl font-black">{thisWeek().total ? Math.round((thisWeek().correct / thisWeek().total) * 100) : 0}%</div>
          <div class="text-xs font-bold text-slate-500 dark:text-slate-400">right this week</div>
        </Card>
      </div>

      <Card>
        <div class="flex items-baseline justify-between">
          <p class="font-black">Points per week</p>
          <p class="text-sm font-semibold text-slate-500 dark:text-slate-400">
            Last week {lastWeek().points} → this week {thisWeek().points}
          </p>
        </div>
        <div class="relative mt-4 flex h-44 items-end gap-2">
          <div class="absolute inset-x-0 border-t-2 border-dashed border-pink-400" style={{ bottom: `${(weeklyGoal() / max()) * 100}%` }}>
            <span class="absolute -top-5 right-0 text-xs font-bold text-pink-500">goal {weeklyGoal()}</span>
          </div>
          <For each={weeks()}>
            {(w, i) => (
              <div class="flex h-full flex-1 flex-col items-center justify-end gap-1">
                <span class="text-xs font-bold">{w.points || ''}</span>
                <div
                  class={`w-full rounded-t-xl ${i() === 7 ? 'bg-gradient-to-t from-violet-600 to-fuchsia-400' : 'bg-violet-300 dark:bg-violet-500/50'}`}
                  style={{ height: `${(w.points / max()) * 100}%`, 'min-height': w.points ? '4px' : '0' }}
                />
                <span class="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                  {i() === 7 ? 'Now' : `${w.start.getDate()}/${w.start.getMonth() + 1}`}
                </span>
              </div>
            )}
          </For>
        </div>
      </Card>

      <Card>
        <p class="font-black">Topics</p>
        <Show when={tried().length} fallback={<p class="mt-2 text-slate-500">Play a game to see your topics here.</p>}>
          <ul class="mt-3 grid gap-3 sm:grid-cols-2">
            <For each={tried()}>
              {(t) => (
                <li class="flex items-center gap-3">
                  <span class={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-xl ${t.color}`}>{t.emoji}</span>
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center justify-between text-sm font-bold">
                      <span class="truncate">{t.name} · L{topicLevel(t.id)}</span>
                      <Stars n={topicStars(t.id)} />
                    </div>
                    <Bar class="mt-1 h-2.5" value={topicAccuracy(t.id) ?? 0} color={(topicAccuracy(t.id) ?? 0) >= 0.8 ? 'bg-emerald-500' : (topicAccuracy(t.id) ?? 0) >= 0.6 ? 'bg-amber-400' : 'bg-rose-400'} />
                  </div>
                </li>
              )}
            </For>
          </ul>
        </Show>
      </Card>

      <Card>
        <p class="font-black">Recent games</p>
        <Show when={state.sessions.length} fallback={<p class="mt-2 text-slate-500">No games yet.</p>}>
          <ul class="mt-2 divide-y divide-black/5 dark:divide-white/10">
            <For each={state.sessions.slice(0, 8)}>
              {(s) => (
                <li class="flex items-center justify-between py-2 text-sm">
                  <span class="font-bold">{s.emoji} {s.title}</span>
                  <span class="font-semibold text-slate-500 dark:text-slate-400">
                    {s.correct}/{s.total} · +{s.points} · {new Date(s.ts).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </span>
                </li>
              )}
            </For>
          </ul>
        </Show>
      </Card>
    </div>
  )
}

function RewardCard() {
  const rewards = () => [...(state.rewards || [])].sort((a, b) => a.cost - b.cost)
  const next = () => rewards().find((r) => r.cost > balance()) || rewards()[rewards().length - 1]
  const ready = () => rewards().filter((r) => r.cost <= balance())
  return (
    <Show when={rewards().length}>
      <button type="button" onClick={() => go('rewards')} class="btn-3d flex items-center gap-3 rounded-3xl bg-gradient-to-r from-amber-300 to-pink-400 p-4 text-left text-amber-950">
        <span class={`text-4xl ${ready().length ? 'wiggle' : ''}`}>{ready().length ? '🎁' : next().emoji}</span>
        <span class="min-w-0 flex-1">
          <span class="block text-sm font-black uppercase tracking-wide opacity-80">{ready().length ? 'Reward ready!' : 'Saving up for'}</span>
          <span class="block truncate text-lg font-black">
            {ready().length ? `You can get ${ready()[ready().length - 1].emoji} ${ready()[ready().length - 1].name}!` : `${next().emoji} ${next().name}`}
          </span>
          <Show when={!ready().length}>
            <Bar class="mt-1 h-3 bg-white/50" color="bg-white" value={balance() / next().cost} />
            <span class="mt-0.5 block text-xs font-bold">{balance()} / {next().cost} points</span>
          </Show>
        </span>
      </button>
    </Show>
  )
}

function Rewards() {
  const [confirm, setConfirm] = createSignal(null)
  const [party, setParty] = createSignal(0)
  const rewards = () => [...(state.rewards || [])].sort((a, b) => a.cost - b.cost)
  return (
    <div class="grid grid-cols-1 gap-4">
      <h1 class="text-3xl font-black">Rewards 🎁</h1>
      <Card class="text-center">
        <p class="text-sm font-bold uppercase tracking-wide text-violet-500 dark:text-violet-300">Points to spend</p>
        <p class="text-5xl font-black">⭐ {balance()}</p>
        <p class="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">Spending points doesn’t change your weekly score or badges.</p>
      </Card>
      <Show
        when={rewards().length}
        fallback={<Card><p class="font-semibold">No rewards yet. Ask a grown-up to add some in 👪 Grown-ups, like “1000 points = film night”.</p></Card>}
      >
        <div class="grid gap-3 sm:grid-cols-2">
          <For each={rewards()}>
            {(r) => {
              const can = () => balance() >= r.cost
              return (
                <Card class={can() ? 'ring-4 ring-amber-300' : ''}>
                  <div class="flex items-center gap-3">
                    <span class={`text-5xl ${can() ? 'wiggle' : ''}`}>{r.emoji}</span>
                    <div class="min-w-0 flex-1">
                      <p class="text-lg font-black">{r.name}</p>
                      <p class="text-sm font-bold text-slate-500 dark:text-slate-400">{r.cost} points</p>
                    </div>
                  </div>
                  <Show
                    when={can()}
                    fallback={
                      <div class="mt-3">
                        <Bar value={balance() / r.cost} />
                        <p class="mt-1 text-sm font-bold">{r.cost - balance()} more points to go</p>
                      </div>
                    }
                  >
                    <BigButton class="mt-3 w-full" color="bg-gradient-to-r from-amber-400 to-pink-500" onClick={() => setConfirm(r)}>
                      Get it! 🎉
                    </BigButton>
                  </Show>
                </Card>
              )
            }}
          </For>
        </div>
      </Show>
      <Show when={state.claims?.length}>
        <Card>
          <p class="font-black">My rewards</p>
          <ul class="mt-2 divide-y divide-black/5 dark:divide-white/10">
            <For each={state.claims.slice(0, 10)}>
              {(c) => (
                <li class="flex items-center justify-between gap-2 py-2">
                  <span class="font-bold">{c.emoji} {c.name}</span>
                  <span class={`rounded-full px-2.5 py-1 text-xs font-black ${c.given ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-100' : 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-100'}`}>
                    {c.given ? 'Enjoyed ✓' : 'Waiting for a grown-up'}
                  </span>
                </li>
              )}
            </For>
          </ul>
        </Card>
      </Show>
      <Modal open={!!confirm()} onClose={() => setConfirm(null)}>
        <Show when={confirm()}>
          <div class="text-center">
            <div class="text-6xl">{confirm().emoji}</div>
            <p class="mt-2 text-2xl font-black">{confirm().name}</p>
            <p class="mt-1 font-semibold">Spend {confirm().cost} of your {balance()} points?</p>
            <div class="mt-4 grid grid-cols-2 gap-3">
              <BigButton color="bg-slate-400" onClick={() => setConfirm(null)}>Not yet</BigButton>
              <BigButton color="bg-emerald-500" onClick={() => { if (claimReward(confirm().id)) { sfx.finish(); setParty((n) => n + 1) } setConfirm(null) }}>Yes! 🎉</BigButton>
            </div>
          </div>
        </Show>
      </Modal>
      <Show keyed when={party()}>
        <Confetti count={50} />
        <div class="pop-in fixed inset-x-4 top-1/3 z-50 mx-auto max-w-sm rounded-3xl bg-white p-5 text-center shadow-2xl dark:bg-violet-950">
          <p class="text-3xl font-black">Woohoo! 🎉</p>
          <p class="mt-1 font-bold">Show this to a grown-up to get your reward.</p>
          <BigButton class="mt-3 w-full" onClick={() => setParty(0)}>OK</BigButton>
        </div>
      </Show>
    </div>
  )
}

function ToolsScreen(props) {
  const [topic, _setTopic] = createSignal(props.topic || 'tables')
  const [tab, _setTab] = createSignal(props.tab || (props.topic ? 'tricks' : 'line'))
  const sync = () => replaceRoute('tools', { tab: tab(), topic: topic() })
  const setTopic = (t) => { _setTopic(t); _setTab('tricks'); sync() }
  const setTab = (t) => { _setTab(t); sync() }
  return (
    <div class="grid grid-cols-1 gap-4">
      <h1 class="text-3xl font-black">Tools & tricks 🧰</h1>
      <p class="font-semibold text-slate-600 dark:text-slate-300">
        There’s always more than one way! Use these to work things out, and learn the shortcuts so you can do it in your head.
      </p>
      <Card>
        <p class="text-sm font-bold">Tricks for:</p>
        <div class="mt-2 flex flex-wrap gap-1.5">
          <For each={TOPICS}>{(t) => <Chip class="min-h-9 px-3 py-1 text-sm" on={topic() === t.id} onClick={() => setTopic(t.id)}>{t.emoji} {t.name}</Chip>}</For>
        </div>
      </Card>
      <Card>
        <Show keyed when={topic()}>{(t) => <Toolbox topic={t} tab={tab()} onTab={setTab} />}</Show>
      </Card>
      <div class="flex justify-center">
        <CopyLink hash={() => toHash('tools', { tab: tab(), topic: topic() })} label="Copy link to this tool" />
      </div>
    </div>
  )
}

function Badges() {
  return (
    <div class="grid grid-cols-1 gap-4">
      <h1 class="text-3xl font-black">Badges 🏅</h1>
      <p class="font-semibold text-slate-600 dark:text-slate-300">
        {Object.keys(state.badges).length} of {BADGES.length} collected
      </p>
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <For each={BADGES}>
          {(b) => {
            const got = () => state.badges[b.id]
            return (
              <Card class={`text-center ${got() ? '' : 'opacity-60'}`}>
                <div class={`text-5xl ${got() ? '' : 'grayscale'}`}>{got() ? b.emoji : '🔒'}</div>
                <div class="mt-1 font-black">{b.name}</div>
                <div class="text-xs font-semibold text-slate-500 dark:text-slate-400">{b.desc}</div>
              </Card>
            )
          }}
        </For>
      </div>
    </div>
  )
}
