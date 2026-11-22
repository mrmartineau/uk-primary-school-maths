import { For, Show, createSignal, onCleanup, onMount } from 'solid-js'
import { sfx } from './sound'

export function Stars(props) {
  return (
    <span class="tracking-tight" aria-label={`${props.n} of 3 stars`}>
      <For each={[0, 1, 2]}>{(i) => <span class={i < props.n ? '' : 'opacity-25 grayscale'}>⭐</span>}</For>
    </span>
  )
}

export function Bar(props) {
  return (
    <div class={`h-4 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10 ${props.class || ''}`}>
      <div
        class={`h-full rounded-full transition-[width] duration-700 ease-out ${props.color || 'bg-gradient-to-r from-amber-300 to-orange-500'}`}
        style={{ width: `${Math.max(0, Math.min(100, props.value * 100))}%` }}
      />
    </div>
  )
}

export function Card(props) {
  return (
    <div class={`rounded-3xl bg-white/85 p-4 shadow-[0_6px_0_0_rgb(0_0_0/0.06)] ring-1 ring-black/5 backdrop-blur dark:bg-white/10 dark:ring-white/10 sm:p-5 ${props.class || ''}`}>
      {props.children}
    </div>
  )
}

export function BigButton(props) {
  return (
    <button
      type="button"
      disabled={props.disabled}
      onClick={(e) => { sfx.tap(); props.onClick?.(e) }}
      class={`btn-3d rounded-2xl px-5 py-4 text-lg font-extrabold text-white ${props.color || 'bg-violet-600'} ${props.class || ''}`}
    >
      {props.children}
    </button>
  )
}

export function Chip(props) {
  return (
    <button
      type="button"
      onClick={() => { sfx.tap(); props.onClick?.() }}
      aria-pressed={!!props.on}
      class={`btn-3d min-h-11 rounded-full px-4 py-2 font-bold ${props.on ? 'bg-violet-600 text-white' : 'bg-white text-violet-900 ring-1 ring-violet-200 dark:bg-white/10 dark:text-violet-100 dark:ring-white/15'} ${props.class || ''}`}
    >
      {props.children}
    </button>
  )
}

/** On-screen number pad: avoids the iOS keyboard covering the question */
export function Keypad(props) {
  const press = (k) => {
    sfx.tap()
    if (k === '⌫') props.onInput(props.value.slice(0, -1))
    else if (props.value.length < 10) props.onInput(props.value + k)
  }
  const onKey = (e) => {
    if (props.disabled) return
    if (e.key === 'Enter') { e.preventDefault(); props.onSubmit() }
    else if (e.key === 'Backspace') press('⌫')
    else if (/^[0-9]$/.test(e.key)) press(e.key)
    else if ((props.keys || []).includes(e.key.toLowerCase())) press(e.key.toLowerCase())
  }
  onMount(() => window.addEventListener('keydown', onKey))
  onCleanup(() => window.removeEventListener('keydown', onKey))

  const Key = (p) => (
    <button
      type="button"
      disabled={props.disabled}
      onClick={() => press(p.k)}
      class={`btn-3d h-13 rounded-2xl text-2xl font-black sm:h-16 sm:text-3xl lg:h-20 lg:text-4xl ${p.class || 'bg-white text-violet-900 dark:bg-violet-950 dark:text-violet-100'}`}
      aria-label={p.k === '⌫' ? 'Delete' : p.k === '-' ? 'minus' : p.k}
    >
      {p.k === '-' ? '−' : p.k}
    </button>
  )
  const extra = () => props.keys?.[0]
  return (
    <div class="mx-auto grid w-full max-w-sm grid-cols-4 gap-2 sm:gap-2.5 lg:max-w-md lg:gap-3">
      <Key k="1" /><Key k="2" /><Key k="3" />
      <Key k="⌫" class="bg-rose-100 text-rose-700 dark:bg-rose-500/25 dark:text-rose-100" />
      <Key k="4" /><Key k="5" /><Key k="6" />
      <button
        type="button"
        disabled={props.disabled || !props.value}
        onClick={() => props.onSubmit()}
        class="btn-3d row-span-3 rounded-2xl bg-emerald-500 text-xl font-black text-white sm:text-2xl"
      >
        Go
        <br />✓
      </button>
      <Key k="7" /><Key k="8" /><Key k="9" />
      <Show when={extra()} fallback={<Key k="0" class="col-span-3 bg-white text-violet-900 dark:bg-violet-950 dark:text-violet-100" />}>
        <Key k={extra()} class="bg-amber-200 text-amber-900 dark:bg-amber-500/30 dark:text-amber-100" />
        <Key k="0" class="col-span-2 bg-white text-violet-900 dark:bg-violet-950 dark:text-violet-100" />
      </Show>
    </div>
  )
}

export function Clock(props) {
  const hourAngle = () => ((props.h % 12) + props.m / 60) * 30
  const minAngle = () => props.m * 6
  return (
    <svg viewBox="0 0 200 200" class="mx-auto h-32 w-32 sm:h-48 sm:w-48" role="img" aria-label="Analogue clock">
      <circle cx="100" cy="100" r="94" fill="white" stroke="#7c3aed" stroke-width="8" />
      <For each={Array.from({ length: 60 }, (_, i) => i)}>
        {(i) => (
          <line
            x1="100" y1={i % 5 ? 12 : 14} x2="100" y2={i % 5 ? 17 : 26}
            stroke="#4c1d95" stroke-width={i % 5 ? 1.5 : 4} stroke-linecap="round"
            transform={`rotate(${i * 6} 100 100)`}
          />
        )}
      </For>
      <For each={Array.from({ length: 12 }, (_, i) => i + 1)}>
        {(n) => {
          const a = (n * 30 * Math.PI) / 180
          return (
            <text x={100 + 62 * Math.sin(a)} y={100 - 62 * Math.cos(a) + 7} text-anchor="middle" font-size="20" font-weight="800" fill="#1e1b4b">
              {n}
            </text>
          )
        }}
      </For>
      <line x1="100" y1="100" x2="100" y2="54" stroke="#1e1b4b" stroke-width="8" stroke-linecap="round" transform={`rotate(${hourAngle()} 100 100)`} />
      <line x1="100" y1="100" x2="100" y2="26" stroke="#ec4899" stroke-width="5" stroke-linecap="round" transform={`rotate(${minAngle()} 100 100)`} />
      <circle cx="100" cy="100" r="7" fill="#1e1b4b" />
    </svg>
  )
}

export function Polygon(props) {
  const pts = () =>
    Array.from({ length: props.sides }, (_, i) => {
      const a = (2 * Math.PI * i) / props.sides - Math.PI / 2 + (props.sides === 4 ? Math.PI / 4 : 0)
      return `${100 + 80 * Math.cos(a)},${100 + 80 * Math.sin(a)}`
    }).join(' ')
  return (
    <svg viewBox="0 0 200 200" class="mx-auto h-28 w-28 sm:h-44 sm:w-44" role="img" aria-label="A shape">
      <polygon points={pts()} fill="#c4b5fd" stroke="#6d28d9" stroke-width="7" stroke-linejoin="round" />
    </svg>
  )
}

const BITS = ['🎉', '⭐', '✨', '🟣', '🟡', '🟢', '🔵', '💥']
export function Confetti(props) {
  const pieces = Array.from({ length: props.count || 18 }, (_, i) => ({
    e: BITS[i % BITS.length],
    dx: `${(Math.random() - 0.5) * 360}px`,
    dy: `${-80 - Math.random() * 220}px`,
    rot: `${(Math.random() - 0.5) * 720}deg`,
    size: 16 + Math.random() * 18,
    delay: Math.random() * 120,
  }))
  return (
    <div class="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
      <For each={pieces}>
        {(p) => (
          <span
            class="confetti-bit"
            style={{ '--dx': p.dx, '--dy': p.dy, '--rot': p.rot, 'font-size': `${p.size}px`, 'animation-delay': `${p.delay}ms` }}
          >
            {p.e}
          </span>
        )}
      </For>
    </div>
  )
}

/** A Confetti burst that re-mounts each time `key` changes */
export function useBurst() {
  const [n, setN] = createSignal(0)
  return [n, () => setN((x) => x + 1)]
}

export function Modal(props) {
  return (
    <Show when={props.open}>
      <div class="fixed inset-0 z-40 flex items-end justify-center bg-black/40 p-3 sm:items-center" onClick={() => props.onClose?.()}>
        <div class="slide-up safe-bottom max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl dark:bg-violet-950" onClick={(e) => e.stopPropagation()}>
          {props.children}
        </div>
      </div>
    </Show>
  )
}
