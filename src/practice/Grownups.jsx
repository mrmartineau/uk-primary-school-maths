import { For, Show, createSignal } from 'solid-js'
import { BigButton, Card, Chip, CopyLink, Stars } from './components'
import { TOPICS } from './questions'
import { TransferCard } from './Transfer'
import {
  REWARD_IDEAS, addKid, addReward, kidList, removeKid, switchKid, balance, removeReward, setClaimGiven, totalPoints, undoClaim, updateReward,
  exportData, importData, setLevel, setState, state, topicAccuracy, topicLevel, topicStars, weeklyGoal, weekTotals, pastWeeks,
} from './store'

const HANDY_LINKS = [
  ['🏠 Home', '#/'],
  ['📆 Daily challenge', '#/play/daily'],
  ['🎲 Quick mix', '#/play/mix'],
  ['✖️ 7 & 8 times tables', '#/play/tables/7,8'],
  ['✖️ All times tables', '#/play/tables/2,3,4,5,6,7,8,9,10,11,12'],
  ['⏱️ Tables race (6, 7, 9)', '#/play/blitz?tables=6,7,9'],
  ['💪 Stretch: bonds ×100', '#/play/topic/bonds?scale=100'],
  ['🍕 Fractions practice', '#/play/topic/fractions'],
  ['🔧 Fix mistakes', '#/play/mistakes'],
  ['📏 Number line tool', '#/tools/line'],
  ['✖️ Times grid tool', '#/tools/grid'],
  ['💡 Times-table tricks', '#/tools/tricks/tables'],
  ['🎁 Rewards', '#/rewards'],
  ['📈 Progress', '#/progress'],
]

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
      <details class="rounded-2xl bg-white/60 p-3 text-sm dark:bg-white/5">
        <summary class="cursor-pointer font-bold">Moving from another device? 📲</summary>
        <p class="mt-2 text-slate-600 dark:text-slate-300">
          On the old device, open 👪 Grown-ups → “Move to another device”. Then scan its QR code with this device’s camera, or open the link it shares.
        </p>
        <p class="mt-2 text-slate-600 dark:text-slate-300">Got a backup file instead?</p>
        <label class="btn-3d mt-2 inline-block cursor-pointer rounded-xl bg-sky-500 px-4 py-2 font-black text-white">
          ⬆️ Restore backup file
          <input
            type="file"
            accept="application/json,.json"
            class="hidden"
            onChange={async (e) => {
              const file = e.currentTarget.files?.[0]
              if (!file) return
              try {
                importData(await file.text())
              } catch {
                alert('That file is not a Maths Quest backup.')
              }
            }}
          />
        </label>
      </details>
    </div>
  )
}

export function Grownups(props) {
  const [unlocked, setUnlocked] = createSignal(false)
  const [a] = createSignal(6 + Math.floor(Math.random() * 7))
  const [b] = createSignal(6 + Math.floor(Math.random() * 7))
  const [gate, setGate] = createSignal('')
  const [msg, setMsg] = createSignal('')
  const [newEmoji, setNewEmoji] = createSignal('🎁')
  const [newName, setNewName] = createSignal('')
  const [newCost, setNewCost] = createSignal('500')
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
          <p class="font-black">Children on this device</p>
          <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">Each child has their own points, levels, badges and rewards. Pick who is playing.</p>
          <div class="mt-3 flex flex-wrap gap-2">
            <For each={kidList()}>{(k) => <Chip on={k.active} onClick={() => switchKid(k.id)}>{k.name}</Chip>}</For>
            <Chip onClick={() => { addKid(); props.onBack() }}>➕ Add a child</Chip>
          </div>
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
          <label class="mt-2 flex items-center gap-3 font-semibold">
            <input type="checkbox" class="h-5 w-5 accent-violet-600" checked={state.profile.stretch !== false} onChange={(e) => setState('profile', 'stretch', e.currentTarget.checked)} />
            Mix “stretch” questions into quick mix and daily challenge (easy facts with bigger numbers or decimals, e.g. 300 + 700 = 1000)
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
          <p class="font-black">Rewards 🎁</p>
          <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Set what points can buy, e.g. 1000 points = film night. Total earned: <b>{totalPoints()}</b> · available: <b>{balance()}</b>. Spending doesn’t change the weekly score.
          </p>
          <Show when={state.rewards?.length}>
            <ul class="mt-3 grid grid-cols-1 gap-2">
              <For each={state.rewards}>
                {(r) => (
                  <li class="flex items-center gap-2">
                    <input class="w-12 shrink-0 rounded-xl border-2 border-violet-200 bg-white px-1 py-2 text-center text-xl dark:border-white/20 dark:bg-white/10" value={r.emoji} onChange={(e) => updateReward(r.id, { emoji: e.currentTarget.value || '🎁' })} aria-label="Emoji" />
                    <input size="4" class="min-w-0 flex-1 rounded-xl border-2 border-violet-200 bg-white px-3 py-2 font-bold dark:border-white/20 dark:bg-white/10" value={r.name} onChange={(e) => updateReward(r.id, { name: e.currentTarget.value })} aria-label="Reward" />
                    <input type="number" inputmode="numeric" min="1" class="w-20 shrink-0 rounded-xl border-2 border-violet-200 bg-white px-2 py-2 font-bold dark:border-white/20 dark:bg-white/10" value={r.cost} onChange={(e) => updateReward(r.id, { cost: Math.max(1, Number(e.currentTarget.value) || 1) })} aria-label="Points" />
                    <button type="button" class="shrink-0 rounded-xl px-1 py-2 text-xl" aria-label="Remove reward" onClick={() => removeReward(r.id)}>🗑️</button>
                  </li>
                )}
              </For>
            </ul>
          </Show>
          <form
            class="mt-3 flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              if (!newName().trim()) return
              addReward(newEmoji(), newName().trim(), Number(newCost()) || 500)
              setNewName('')
            }}
          >
            <input class="w-12 shrink-0 rounded-xl border-2 border-violet-200 bg-white px-1 py-2 text-center text-xl dark:border-white/20 dark:bg-white/10" value={newEmoji()} onInput={(e) => setNewEmoji(e.currentTarget.value)} aria-label="Emoji" />
            <input size="4" class="min-w-0 flex-1 rounded-xl border-2 border-violet-200 bg-white px-3 py-2 font-bold dark:border-white/20 dark:bg-white/10" placeholder="New reward, e.g. Film night" value={newName()} onInput={(e) => setNewName(e.currentTarget.value)} />
            <input type="number" inputmode="numeric" min="1" class="w-20 shrink-0 rounded-xl border-2 border-violet-200 bg-white px-2 py-2 font-bold dark:border-white/20 dark:bg-white/10" value={newCost()} onInput={(e) => setNewCost(e.currentTarget.value)} aria-label="Points" />
            <button class="btn-3d shrink-0 rounded-xl bg-violet-600 px-3 py-2 font-black text-white">Add</button>
          </form>
          <p class="mt-3 text-xs font-bold uppercase tracking-wide text-slate-500">Ideas (tap to add)</p>
          <div class="mt-1 flex flex-wrap gap-2">
            <For each={REWARD_IDEAS.filter(([, n]) => !state.rewards?.some((r) => r.name === n))}>
              {([emoji, name, cost]) => <Chip class="min-h-9 px-3 py-1 text-sm" onClick={() => addReward(emoji, name, cost)}>{emoji} {name} · {cost}</Chip>}
            </For>
          </div>
          <Show when={state.claims?.length}>
            <p class="mt-4 font-black">Claimed</p>
            <ul class="mt-1 divide-y divide-black/5 text-sm dark:divide-white/10">
              <For each={state.claims}>
                {(c) => (
                  <li class="flex flex-wrap items-center justify-between gap-2 py-2">
                    <span><b>{c.emoji} {c.name}</b> <span class="text-slate-500">· {c.cost} pts · {new Date(c.ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span></span>
                    <span class="flex gap-2">
                      <Chip class="min-h-9 px-3 py-1 text-sm" on={c.given} onClick={() => setClaimGiven(c.id, !c.given)}>{c.given ? 'Given ✓' : 'Mark as given'}</Chip>
                      <Show when={!c.given}>
                        <Chip class="min-h-9 px-3 py-1 text-sm" onClick={() => { if (confirm(`Cancel "${c.name}" and give back ${c.cost} points?`)) undoClaim(c.id) }}>Refund</Chip>
                      </Show>
                    </span>
                  </li>
                )}
              </For>
            </ul>
          </Show>
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
          <p class="font-black">Handy links 🔗</p>
          <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Every screen, tool and practice has its own link. Copy one to bookmark it, add it to the Home Screen, or message it (eg “do the 7s tonight”). On a topic or tables screen, use the 🔗 button to link to exactly that practice.
          </p>
          <ul class="mt-2 grid gap-1 sm:grid-cols-2">
            <For each={HANDY_LINKS}>
              {([label, hash]) => (
                <li class="flex items-center justify-between gap-2 rounded-xl bg-violet-50 px-3 py-1 dark:bg-white/5">
                  <span class="text-sm font-bold">{label}</span>
                  <CopyLink hash={hash} label="Copy" />
                </li>
              )}
            </For>
          </ul>
        </Card>

        <TransferCard />

        <Card>
          <p class="font-black">Backup file</p>
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
          <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {kidList().length > 1 ? 'Removes this child and all their points, levels, badges and settings. Other children are kept.' : 'Deletes all points, levels, badges and settings on this device.'}
          </p>
          <BigButton color="bg-rose-500" class="mt-3 text-base" onClick={() => { if (confirm(kidList().length > 1 ? `Remove ${state.profile.name || 'this child'} and all their progress?` : 'Delete all Maths Quest progress on this device?')) { removeKid(); props.onBack() } }}>
            {kidList().length > 1 ? '🗑️ Remove this child' : '🗑️ Reset everything'}
          </BigButton>
        </Card>
      </div>
    </Show>
  )
}
