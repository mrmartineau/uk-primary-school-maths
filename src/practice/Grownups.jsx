import { For, Show, createSignal } from 'solid-js'
import { BigButton, Card, Chip, Stars } from './components'
import { TOPICS } from './questions'
import {
  exportData, importData, resetAll, setLevel, setState, state, topicAccuracy, topicLevel, topicStars, weeklyGoal, weekTotals, pastWeeks,
} from './store'

const YEARS = ['Reception', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6']

function YearPicker() {
  return (
    <div class="flex flex-wrap gap-2">
      <For each={YEARS}>{(y, i) => <Chip on={state.profile.year === i()} onClick={() => setState('profile', 'year', i())}>{y}</Chip>}</For>
    </div>
  )
}

export function Setup() {
  const [name, setName] = createSignal(state.profile.name)
  return (
    <div class="safe-top safe-x safe-bottom mx-auto grid min-h-dvh max-w-lg grid-cols-1 content-center gap-5 py-6">
      <div class="text-center">
        <div class="wiggle inline-block text-7xl">⭐</div>
        <h1 class="mt-2 text-4xl font-black tracking-tight">Maths Quest</h1>
        <p class="mt-1 font-semibold text-slate-600 dark:text-slate-300">Practise a little every day, earn points, level up!</p>
      </div>
      <Card>
        <label class="block font-black" for="name">What’s your name?</label>
        <input
          id="name"
          class="mt-2 w-full rounded-2xl border-2 border-violet-200 bg-white px-4 py-3 text-xl font-bold outline-none focus:border-violet-500 dark:border-white/20 dark:bg-white/10"
          value={name()}
          onInput={(e) => setName(e.currentTarget.value)}
          placeholder="Your name"
          autocomplete="off"
          maxLength={20}
        />
        <p class="mt-4 font-black">Which year are you in?</p>
        <div class="mt-2"><YearPicker /></div>
      </Card>
      <BigButton
        class="text-2xl"
        color="bg-gradient-to-r from-violet-500 to-pink-500"
        onClick={() => setState('profile', { name: name().trim(), setup: true })}
      >
        Start my quest 🚀
      </BigButton>
    </div>
  )
}

export function Grownups(props) {
  const [unlocked, setUnlocked] = createSignal(false)
  const [a] = createSignal(6 + Math.floor(Math.random() * 7))
  const [b] = createSignal(6 + Math.floor(Math.random() * 7))
  const [gate, setGate] = createSignal('')
  const [msg, setMsg] = createSignal('')
  let fileInput

  const toggleFocus = (id) => {
    const f = state.profile.focus
    setState('profile', 'focus', f.includes(id) ? f.filter((x) => x !== id) : [...f, id])
  }

  const download = () => {
    const blob = new Blob([exportData()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `maths-quest-backup-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  const upload = async (e) => {
    const file = e.currentTarget.files?.[0]
    if (!file) return
    try {
      importData(await file.text())
      setMsg('Backup restored ✅')
    } catch {
      setMsg('That file is not a Maths Quest backup.')
    }
  }

  const w = () => weekTotals()
  const last = () => pastWeeks(2)[0]

  return (
    <Show
      when={unlocked()}
      fallback={
        <div class="mx-auto grid max-w-md grid-cols-1 gap-4 pt-6">
          <h1 class="text-3xl font-black">Grown-ups only 👪</h1>
          <Card>
            <p class="font-semibold">To open settings, what is {a()} × {b()}?</p>
            <form class="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (Number(gate()) === a() * b()) setUnlocked(true); else setGate('') }}>
              <input inputmode="numeric" size="4" aria-label="Answer" class="min-w-0 flex-1 rounded-2xl border-2 border-violet-200 bg-white px-4 py-3 text-xl font-bold outline-none focus:border-violet-500 dark:border-white/20 dark:bg-white/10" value={gate()} onInput={(e) => setGate(e.currentTarget.value)} />
              <button class="btn-3d shrink-0 rounded-2xl bg-violet-600 px-5 py-3 text-lg font-black text-white">Open</button>
            </form>
          </Card>
          <a href="/" class="text-center font-bold text-violet-700 underline dark:text-violet-200">📚 Open the parents’ maths guide</a>
        </div>
      }
    >
      <div class="grid grid-cols-1 gap-4">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h1 class="text-3xl font-black">Grown-ups 👪</h1>
          <a href="/" class="btn-3d whitespace-nowrap rounded-full bg-white px-4 py-2 text-sm font-bold text-violet-800 dark:bg-white/10 dark:text-violet-100">📚 Parents’ guide</a>
        </div>

        <Card>
          <p class="font-black">This week at a glance</p>
          <p class="mt-1 text-slate-600 dark:text-slate-300">
            <b>{w().points}</b> points ({last().points} last week) · <b>{w().total}</b> questions · <b>{w().total ? Math.round((w().correct / w().total) * 100) : 0}%</b> right first time · practised on <b>{w().active}</b> day{w().active === 1 ? '' : 's'}.
          </p>
        </Card>

        <Card>
          <p class="font-black">Child</p>
          <input
            class="mt-2 w-full rounded-2xl border-2 border-violet-200 bg-white px-4 py-2.5 text-lg font-bold outline-none focus:border-violet-500 dark:border-white/20 dark:bg-white/10"
            value={state.profile.name}
            onChange={(e) => setState('profile', 'name', e.currentTarget.value.trim())}
            placeholder="Name"
          />
          <p class="mt-3 text-sm font-bold">School year (sets starting levels and which topics appear)</p>
          <div class="mt-2"><YearPicker /></div>
          <label class="mt-3 flex items-center gap-3 font-semibold">
            <input type="checkbox" class="h-5 w-5 accent-violet-600" checked={!!state.profile.showAll} onChange={(e) => setState('profile', 'showAll', e.currentTarget.checked)} />
            Show every topic in “Pick a topic”, even ones above this year
          </label>
          <label class="mt-2 flex items-center gap-3 font-semibold">
            <input type="checkbox" class="h-5 w-5 accent-violet-600" checked={state.profile.sound} onChange={(e) => setState('profile', 'sound', e.currentTarget.checked)} />
            Sound effects
          </label>
        </Card>

        <Card>
          <p class="font-black">Weekly points goal</p>
          <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">
            “Auto” sets the target about 10% above the average of the last 3 weeks, so it rises steadily as they improve. Current target: <b>{weeklyGoal()}</b>. A 10-question game earns roughly 120–180 points.
          </p>
          <div class="mt-2 flex flex-wrap gap-2">
            <For each={['auto', 200, 300, 500, 750, 1000, 1500]}>
              {(g) => <Chip on={String(state.profile.goal) === String(g)} onClick={() => setState('profile', 'goal', g)}>{g === 'auto' ? 'Auto 📈' : g}</Chip>}
            </For>
          </div>
        </Card>

        <Card>
          <p class="font-black">Focus topics (double points)</p>
          <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">Pick what school is covering this week. These appear more often and earn ×2 points.</p>
          <div class="mt-2 flex flex-wrap gap-2">
            <For each={TOPICS}>{(t) => <Chip on={state.profile.focus.includes(t.id)} onClick={() => toggleFocus(t.id)}>{t.emoji} {t.name}</Chip>}</For>
          </div>
        </Card>

        <Card>
          <p class="font-black">Topic levels</p>
          <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Levels adjust automatically: 7 of 8 right first time moves up; 4 of 5 wrong moves down. You can override them here.
          </p>
          <div class="mt-3 overflow-x-auto">
            <table class="w-full min-w-[34rem] text-left text-sm">
              <thead class="text-xs uppercase text-slate-500">
                <tr><th class="py-1">Topic</th><th>Level</th><th>Recent</th><th>Answered</th><th>Last</th><th>Guide</th></tr>
              </thead>
              <tbody>
                <For each={TOPICS}>
                  {(t) => {
                    const s = () => state.topics[t.id]
                    const acc = () => topicAccuracy(t.id)
                    return (
                      <tr class="border-t border-black/5 dark:border-white/10">
                        <td class="py-2 font-bold">{t.emoji} {t.name} <Stars n={topicStars(t.id)} /></td>
                        <td>
                          <select
                            class="rounded-lg border border-violet-200 bg-white px-2 py-1 font-bold dark:border-white/20 dark:bg-violet-950"
                            value={topicLevel(t.id)}
                            onChange={(e) => setLevel(t.id, Number(e.currentTarget.value))}
                          >
                            <For each={[1, 2, 3, 4, 5]}>{(n) => <option value={n}>{n}</option>}</For>
                          </select>
                        </td>
                        <td class={acc() == null ? 'text-slate-400' : acc() >= 0.8 ? 'font-bold text-emerald-600' : acc() >= 0.6 ? 'font-bold text-amber-600' : 'font-bold text-rose-600'}>
                          {acc() == null ? '–' : `${Math.round(acc() * 100)}%`}
                        </td>
                        <td>{s()?.total || 0}</td>
                        <td class="whitespace-nowrap">{s()?.last ? new Date(s().last).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '–'}</td>
                        <td><a class="font-bold text-violet-700 underline dark:text-violet-200" href={`/#${t.chapter}`}>Read</a></td>
                      </tr>
                    )
                  }}
                </For>
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <p class="font-black">Saved mistakes ({state.mistakes.length})</p>
          <Show when={state.mistakes.length} fallback={<p class="mt-1 text-sm text-slate-500">None right now.</p>}>
            <ul class="mt-2 grid gap-1 text-sm">
              <For each={state.mistakes.slice(0, 12)}>{(m) => <li><b>{m.text}</b> <span class="text-slate-500">→ {m.answer}</span></li>}</For>
            </ul>
            <p class="mt-2 text-xs text-slate-500">They leave this list once answered correctly first time in “Fix mistakes”.</p>
          </Show>
        </Card>

        <Card>
          <p class="font-black">Backup</p>
          <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Progress is stored only on this device (in the browser). Download a backup to move it to another iPad or iPhone, or in case browser data is cleared.
          </p>
          <div class="mt-3 flex flex-wrap gap-2">
            <BigButton color="bg-violet-600" class="text-base" onClick={download}>⬇️ Download backup</BigButton>
            <BigButton color="bg-sky-500" class="text-base" onClick={() => fileInput.click()}>⬆️ Restore backup</BigButton>
            <input ref={(el) => (fileInput = el)} type="file" accept="application/json,.json" class="hidden" onChange={upload} />
          </div>
          <Show when={msg()}><p class="mt-2 font-bold">{msg()}</p></Show>
        </Card>

        <Card>
          <p class="font-black text-rose-600">Start again</p>
          <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">Deletes all points, levels, badges and settings on this device.</p>
          <BigButton color="bg-rose-500" class="mt-3 text-base" onClick={() => { if (confirm('Delete all Maths Quest progress on this device?')) { resetAll(); props.onBack() } }}>
            🗑️ Reset everything
          </BigButton>
        </Card>
      </div>
    </Show>
  )
}
