import { For, Show, createMemo, createSignal } from 'solid-js'
import { Chip } from './components'
import { JumpLine, MethodVisual, PlaceValueChart } from './visuals'
import { f } from './methods'
import { GENERAL_TRICKS, TRICKS } from './tricks'
import { TOPIC_BY_ID } from './questions'
import { sfx } from './sound'

/** Numbers that appear in a question, for seeding tools */
export function numbersIn(text = '') {
  return (text.replace(/[−–]/g, '-').replace(/(\d),(\d{3})/g, '$1$2').match(/-?\d+(\.\d+)?/g) || []).map(Number).filter((n) => Number.isFinite(n))
}

export function NumberLineTool(props) {
  const start0 = () => props.start ?? 0
  const [start, setStart] = createSignal(start0())
  const [hops, setHops] = createSignal([])
  const cur = () => Math.round((start() + hops().reduce((a, b) => a + b, 0)) * 1000) / 1000
  const hop = (n) => { sfx.tap(); setHops((h) => [...h, n].slice(-8)) }
  const steps = () => (props.decimals ? [0.1, 1, 10] : [1, 10, 100])
  return (
    <div class="grid gap-3">
      <p class="text-center text-sm font-semibold text-slate-600 dark:text-slate-300">Tap the jumps. Each hop is drawn on the line.</p>
      <div class="flex min-h-28 items-center justify-center text-violet-950 dark:text-violet-50">
        <Show when={hops().length} fallback={<div class="text-4xl font-black">{f(start())}</div>}>
          {/* only keep the hops on screen, the start rolls forward */}
          <JumpLine start={start()} jumps={hops()} />
        </Show>
      </div>
      <div class="text-center text-lg font-black">You’re on <span class="text-violet-600 dark:text-violet-300">{f(cur())}</span></div>
      <div class="grid grid-cols-3 gap-2">
        <For each={steps()}>{(s) => <button type="button" class="btn-3d rounded-2xl bg-emerald-500 py-3 text-xl font-black text-white" onClick={() => hop(s)}>+{f(s)}</button>}</For>
        <For each={steps()}>{(s) => <button type="button" class="btn-3d rounded-2xl bg-rose-500 py-3 text-xl font-black text-white" onClick={() => hop(-s)}>−{f(s)}</button>}</For>
      </div>
      <div class="flex flex-wrap items-center justify-center gap-2">
        <span class="text-sm font-bold">Start at:</span>
        <For each={[...new Set([0, ...(props.numbers || [])])].slice(0, 5)}>
          {(n) => <Chip on={start() === n && !hops().length} onClick={() => { setStart(n); setHops([]) }}>{f(n)}</Chip>}
        </For>
        <Chip onClick={() => { setStart(cur()); setHops([]) }}>Clear jumps</Chip>
      </div>
    </div>
  )
}

export function HundredSquare() {
  const [skip, setSkip] = createSignal(0)
  const [picked, setPicked] = createSignal(new Set())
  const toggle = (n) => { sfx.tap(); const s = new Set(picked()); s.has(n) ? s.delete(n) : s.add(n); setPicked(s) }
  return (
    <div class="grid gap-3">
      <div class="flex flex-wrap justify-center gap-1.5">
        <span class="self-center text-sm font-bold">Count in:</span>
        <For each={[2, 3, 4, 5, 6, 7, 8, 9, 10]}>{(n) => <Chip class="min-h-9 px-3 py-1" on={skip() === n} onClick={() => setSkip(skip() === n ? 0 : n)}>{n}s</Chip>}</For>
      </div>
      <div class="mx-auto grid w-full max-w-sm grid-cols-10 gap-0.5 text-xs font-bold sm:text-sm">
        <For each={Array.from({ length: 100 }, (_, i) => i + 1)}>
          {(n) => (
            <button
              type="button"
              onClick={() => toggle(n)}
              class={`aspect-square rounded ${picked().has(n) ? 'bg-pink-500 text-white' : skip() && n % skip() === 0 ? 'bg-violet-500 text-white' : 'bg-white dark:bg-white/10'}`}
            >
              {n}
            </button>
          )}
        </For>
      </div>
      <p class="text-center text-xs font-semibold text-slate-500 dark:text-slate-400">Right → +1 · Down ↓ +10 · Left ← −1 · Up ↑ −10</p>
    </div>
  )
}

export function TimesGrid(props) {
  const [sel, setSel] = createSignal(props.focus || null)
  const [hide, setHide] = createSignal(false)
  const N = Array.from({ length: 12 }, (_, i) => i + 1)
  return (
    <div class="grid gap-2">
      <div class="flex items-center justify-between gap-2">
        <p class="text-sm font-bold">
          <Show when={sel()} fallback="Tap a square to see the fact.">
            {sel()[0]} × {sel()[1]} = <span class="text-violet-600 dark:text-violet-300">{sel()[0] * sel()[1]}</span>
          </Show>
        </p>
        <Chip class="min-h-9 px-3 py-1 text-sm" on={hide()} onClick={() => setHide(!hide())}>Hide answers</Chip>
      </div>
      <div class="overflow-x-auto">
        <table class="mx-auto border-separate border-spacing-0.5 text-center text-[11px] font-bold sm:text-sm">
          <thead>
            <tr>
              <th class="h-6 w-6 text-violet-500">×</th>
              <For each={N}>{(c) => <th class={`h-6 w-6 rounded sm:h-8 sm:w-8 ${sel()?.[1] === c ? 'bg-violet-600 text-white' : 'bg-violet-200 text-violet-900 dark:bg-violet-500/30 dark:text-violet-100'}`}>{c}</th>}</For>
            </tr>
          </thead>
          <tbody>
            <For each={N}>
              {(r) => (
                <tr>
                  <th class={`h-6 w-6 rounded sm:h-8 sm:w-8 ${sel()?.[0] === r ? 'bg-violet-600 text-white' : 'bg-violet-200 text-violet-900 dark:bg-violet-500/30 dark:text-violet-100'}`}>{r}</th>
                  <For each={N}>
                    {(c) => {
                      const on = () => sel() && (sel()[0] === r || sel()[1] === c)
                      const hit = () => sel() && sel()[0] === r && sel()[1] === c
                      return (
                        <td
                          onClick={() => { sfx.tap(); setSel([r, c]) }}
                          class={`h-6 w-6 cursor-pointer rounded sm:h-8 sm:w-8 ${hit() ? 'bg-pink-500 text-white' : on() ? 'bg-amber-200 text-amber-900 dark:bg-amber-500/30 dark:text-amber-100' : r === c ? 'bg-sky-100 dark:bg-sky-500/20' : 'bg-white dark:bg-white/10'}`}
                        >
                          {hide() && !hit() ? '' : r * c}
                        </td>
                      )
                    }}
                  </For>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </div>
      <p class="text-center text-xs font-semibold text-slate-500 dark:text-slate-400">Blue squares are square numbers. The grid is the same both ways: 3 × 8 = 8 × 3!</p>
    </div>
  )
}

export function PlaceValueTool(props) {
  const [n, setN] = createSignal(props.numbers?.[0] ?? 3456)
  const shift = (k) => { sfx.tap(); setN((x) => Math.round(x * k * 1000) / 1000) }
  return (
    <div class="grid gap-3">
      <PlaceValueChart n={n()} />
      <p class="text-center text-2xl font-black">{f(n())}</p>
      <div class="grid grid-cols-2 gap-2">
        <button type="button" class="btn-3d rounded-2xl bg-emerald-500 py-3 text-lg font-black text-white" onClick={() => shift(10)}>× 10 ⬅️</button>
        <button type="button" class="btn-3d rounded-2xl bg-sky-500 py-3 text-lg font-black text-white" onClick={() => shift(0.1)}>÷ 10 ➡️</button>
      </div>
      <Show when={props.numbers?.length}>
        <div class="flex flex-wrap justify-center gap-2">
          <For each={props.numbers.slice(0, 4)}>{(x) => <Chip on={n() === x} onClick={() => setN(x)}>{f(x)}</Chip>}</For>
        </div>
      </Show>
      <p class="text-center text-xs font-semibold text-slate-500 dark:text-slate-400">× 10 slides every digit one column left. ÷ 10 slides them right.</p>
    </div>
  )
}

export function FractionWall() {
  return (
    <div class="grid gap-1">
      <For each={[1, 2, 3, 4, 5, 6, 8, 10, 12]}>
        {(d) => (
          <div class="flex gap-0.5">
            <For each={Array.from({ length: d })}>
              {() => <div class="flex h-7 flex-1 items-center justify-center rounded bg-orange-200 text-[10px] font-black text-orange-950 dark:bg-orange-500/30 dark:text-orange-100 sm:text-xs">{d === 1 ? '1' : `1/${d}`}</div>}
            </For>
          </div>
        )}
      </For>
      <p class="mt-1 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">Line up the rows to spot equivalent fractions: 1/2 = 2/4 = 3/6 = 4/8.</p>
    </div>
  )
}

export function TrickList(props) {
  const list = () => [...(TRICKS[props.topic] || []), ...(props.general ? GENERAL_TRICKS : [])]
  return (
    <ul class="grid gap-2">
      <For each={list()}>
        {([emoji, name, text]) => (
          <li class="flex gap-3 rounded-2xl bg-violet-50 p-3 dark:bg-white/5">
            <span class="text-2xl">{emoji}</span>
            <span><b class="block">{name}</b><span class="text-sm text-slate-600 dark:text-slate-300">{text}</span></span>
          </li>
        )}
      </For>
    </ul>
  )
}

const TOOL_TABS = [
  ['tricks', '💡', 'Tricks'],
  ['line', '📏', 'Number line'],
  ['grid', '✖️', 'Times grid'],
  ['hundred', '💯', '100 square'],
  ['pv', '🏠', 'Place value'],
  ['frac', '🍕', 'Fractions'],
]

/** Which tool suits a topic best */
const BEST_TOOL = {
  bonds: 'line', add: 'line', sub: 'line', negatives: 'line', time: 'line', patterns: 'hundred', money: 'line',
  tables: 'grid', div: 'grid', missing: 'grid', words: 'tricks',
  place: 'pv', round: 'line', decimals: 'pv', measure: 'pv', doubles: 'line',
  fractions: 'frac', shape: 'tricks',
}

export function Toolbox(props) {
  const nums = createMemo(() => numbersIn(props.question?.text))
  const [tab, setTab] = createSignal(BEST_TOOL[props.topic] || 'tricks')
  const decimals = () => nums().some((n) => !Number.isInteger(n))
  return (
    <div class="grid gap-3">
      <div class="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
        <For each={TOOL_TABS}>
          {([id, emoji, label]) => (
            <button
              type="button"
              onClick={() => { sfx.tap(); setTab(id) }}
              class={`shrink-0 rounded-full px-3 py-2 text-sm font-black ${tab() === id ? 'bg-violet-600 text-white' : 'bg-violet-100 text-violet-900 dark:bg-white/10 dark:text-violet-100'}`}
            >
              {emoji} {label}
            </button>
          )}
        </For>
      </div>
      <Show when={tab() === 'tricks'}>
        <p class="text-sm font-bold text-violet-600 dark:text-violet-300">{TOPIC_BY_ID[props.topic]?.emoji} {TOPIC_BY_ID[props.topic]?.name ?? 'Handy'} tricks</p>
        <TrickList topic={props.topic} general />
      </Show>
      <Show when={tab() === 'line'}><NumberLineTool start={nums()[0] ?? 0} numbers={nums()} decimals={decimals()} /></Show>
      <Show when={tab() === 'grid'}><TimesGrid /></Show>
      <Show when={tab() === 'hundred'}><HundredSquare /></Show>
      <Show when={tab() === 'pv'}><PlaceValueTool numbers={nums()} /></Show>
      <Show when={tab() === 'frac'}><FractionWall /></Show>
    </div>
  )
}

/** "Ways to work it out": swipe between methods */
export function Ways(props) {
  const [i, setI] = createSignal(0)
  const m = () => props.methods[Math.min(i(), props.methods.length - 1)]
  return (
    <div class="grid gap-2 text-left">
      <div class="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
        <For each={props.methods}>
          {(mm, k) => (
            <button
              type="button"
              onClick={() => { sfx.tap(); setI(k()) }}
              class={`shrink-0 rounded-full px-3 py-1.5 text-sm font-black ${i() === k() ? 'bg-sky-600 text-white' : 'bg-white text-sky-900 ring-1 ring-sky-200 dark:bg-white/10 dark:text-sky-100 dark:ring-white/15'}`}
            >
              {mm.emoji} {mm.name}
            </button>
          )}
        </For>
      </div>
      <Show keyed when={m()}>
        {(mm) => (
          <div class="pop-in rounded-2xl bg-white p-3 dark:bg-white/10">
            <ol class="grid gap-1">
              <For each={mm.steps}>
                {(s, k) => (
                  <li class="flex gap-2 text-base font-semibold">
                    <span class="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-sky-100 text-xs font-black text-sky-700 dark:bg-sky-500/30 dark:text-sky-100">{k() + 1}</span>
                    <span>{s}</span>
                  </li>
                )}
              </For>
            </ol>
            <MethodVisual visual={mm.visual} />
          </div>
        )}
      </Show>
      <Show when={props.methods.length > 1}>
        <p class="text-center text-xs font-bold text-slate-500 dark:text-slate-400">
          {props.methods.length} ways! Tap them to see each one. Which do you like best?
        </p>
      </Show>
    </div>
  )
}
