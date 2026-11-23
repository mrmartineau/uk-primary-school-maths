import { For, Show } from 'solid-js'
import { f } from './methods'

/** Number line with jumps drawn as arcs. Positive jumps arc above, negative below. */
export function JumpLine(props) {
  const W = 340, PAD = 26
  const pts = () => {
    const out = [props.start]
    for (const j of props.jumps) out.push(Math.round((out[out.length - 1] + j) * 10000) / 10000)
    return out
  }
  // Space points by order of size but keep tiny jumps visible
  const xs = () => {
    const p = pts()
    const sorted = [...new Set(p)].sort((a, b) => a - b)
    const lo = sorted[0], hi = sorted[sorted.length - 1]
    if (hi === lo) return p.map(() => W / 2)
    // blend linear with even spacing so 2 and 228 both show
    const rank = (v) => sorted.indexOf(v) / Math.max(1, sorted.length - 1)
    return p.map((v) => PAD + (W - 2 * PAD) * (0.5 * ((v - lo) / (hi - lo)) + 0.5 * rank(v)))
  }
  const anyNeg = () => props.jumps.some((j) => j < 0)
  const anyPos = () => props.jumps.some((j) => j >= 0)
  // leave room above for positive arcs and below for negative ones
  const Y = 0
  const top = () => (anyPos() ? -86 : -40)
  const bottom = () => (anyNeg() ? 86 : 50)
  const label = (i) => (props.labels ? props.labels[i] : f(pts()[i]))
  return (
    <svg viewBox={`0 ${top()} ${W} ${bottom() - top()}`} class="w-full max-w-md" role="img" aria-label="Number line with jumps">
      <line x1="8" y1={Y} x2={W - 8} y2={Y} stroke="currentColor" stroke-width="3" stroke-linecap="round" class="text-violet-300" />
      <For each={props.jumps}>
        {(j, i) => {
          const x1 = () => xs()[i()], x2 = () => xs()[i() + 1]
          const up = j >= 0
          const h = () => Math.min(34, 12 + Math.abs(x2() - x1()) / 5)
          const path = () => `M ${x1()} ${Y} Q ${(x1() + x2()) / 2} ${up ? Y - h() * 2 : Y + h() * 2} ${x2()} ${Y}`
          return (
            <g>
              <path d={path()} fill="none" stroke={up ? '#10b981' : '#f43f5e'} stroke-width="3" stroke-linecap="round" />
              <text x={(x1() + x2()) / 2} y={up ? Y - h() - 4 : Y + h() + 14} text-anchor="middle" font-size="13" font-weight="800" fill={up ? '#059669' : '#e11d48'}>
                {up ? '+' : '−'}{props.labels && props.start === 0 ? `${Math.abs(j)}m` : f(Math.abs(j))}
              </text>
            </g>
          )
        }}
      </For>
      <For each={pts()}>
        {(_, i) => (
          <g>
            <circle cx={xs()[i()]} cy={Y} r="5" fill={i() === pts().length - 1 ? '#7c3aed' : '#a78bfa'} />
            <text x={xs()[i()]} y={props.jumps.some((j) => j < 0) ? Y - 12 - (i() % 2) * 14 : Y + 22 + (i() % 2) * 14} text-anchor="middle" font-size="12" font-weight="800" fill="currentColor">
              {label(i())}
            </text>
          </g>
        )}
      </For>
    </svg>
  )
}

/** Grid / area method: rows × cols partitions */
export function GridMethod(props) {
  const total = () => props.rows.reduce((s, r) => s + props.cols.reduce((t, c) => t + r * c, 0), 0)
  return (
    <div class="overflow-x-auto">
      <table class="mx-auto border-separate border-spacing-1 text-center font-black">
        <thead>
          <tr>
            <th class="px-2 text-violet-500">×</th>
            <For each={props.cols}>{(c) => <th class="rounded-lg bg-violet-200 px-3 py-1 text-violet-900 dark:bg-violet-500/30 dark:text-violet-100">{f(c)}</th>}</For>
          </tr>
        </thead>
        <tbody>
          <For each={props.rows}>
            {(r) => (
              <tr>
                <th class="rounded-lg bg-violet-200 px-3 py-1 text-violet-900 dark:bg-violet-500/30 dark:text-violet-100">{f(r)}</th>
                <For each={props.cols}>{(c) => <td class="rounded-lg bg-amber-100 px-3 py-2 text-amber-900 dark:bg-amber-500/20 dark:text-amber-100">{f(r * c)}</td>}</For>
              </tr>
            )}
          </For>
        </tbody>
      </table>
      <p class="mt-1 text-center text-sm font-bold">Total = {f(total())}</p>
    </div>
  )
}

export function FractionBar(props) {
  return (
    <div class="w-full max-w-md">
      <div class="flex overflow-hidden rounded-xl border-2 border-violet-500">
        <For each={Array.from({ length: props.parts }, (_, i) => i)}>
          {(i) => (
            <div class={`flex h-12 flex-1 items-center justify-center border-r-2 border-violet-500 text-sm font-black last:border-r-0 ${i < props.shaded ? 'bg-orange-300 text-orange-950' : 'bg-white text-violet-900 dark:bg-white/10 dark:text-violet-100'}`}>
              {props.total != null ? f(props.total / props.parts) : `1/${props.parts}`}
            </div>
          )}
        </For>
      </div>
      <Show when={props.total != null}>
        <p class="mt-1 text-center text-sm font-bold">Whole bar = {f(props.total)}</p>
      </Show>
    </div>
  )
}

/** Array of dots: rows of cols */
export function Dots(props) {
  return (
    <div class="mx-auto grid w-fit gap-1" aria-label={`${props.rows} rows of ${props.cols}`}>
      <For each={Array.from({ length: props.rows })}>
        {() => (
          <div class="flex gap-1">
            <For each={Array.from({ length: props.cols })}>{() => <span class="h-3.5 w-3.5 rounded-full bg-violet-500" />}</For>
          </div>
        )}
      </For>
    </div>
  )
}

export function RoundLine(props) {
  const W = 340, Y = 50, P = 30
  const x = (v) => P + ((v - props.lo) / (props.hi - props.lo)) * (W - 2 * P)
  const mid = () => (props.lo + props.hi) / 2
  return (
    <svg viewBox={`0 0 ${W} 90`} class="w-full max-w-md" role="img" aria-label="Rounding number line">
      <line x1={P} y1={Y} x2={W - P} y2={Y} stroke="#a78bfa" stroke-width="3" />
      <For each={[props.lo, mid(), props.hi]}>
        {(v) => (
          <g>
            <line x1={x(v)} y1={Y - 8} x2={x(v)} y2={Y + 8} stroke="#7c3aed" stroke-width="3" />
            <text x={x(v)} y={Y + 26} text-anchor="middle" font-size="13" font-weight="800" fill="currentColor">{f(v)}</text>
          </g>
        )}
      </For>
      <text x={x(mid())} y={Y + 42} text-anchor="middle" font-size="10" font-weight="700" fill="#94a3b8">halfway</text>
      <circle cx={x(props.n)} cy={Y} r="7" fill="#ec4899" />
      <text x={x(props.n)} y={Y - 14} text-anchor="middle" font-size="13" font-weight="900" fill="#db2777">{f(props.n)}</text>
    </svg>
  )
}

const PV_COLS = [
  ['Th', 1000], ['H', 100], ['T', 10], ['O', 1], ['.', 0], ['t', 0.1], ['h', 0.01],
]
export function PlaceValueChart(props) {
  const digits = () => {
    const s = String(Math.round(Math.abs(props.n) * 100) / 100)
    const [w, d = ''] = s.split('.')
    const map = {}
    for (let i = 0; i < w.length; i++) map[10 ** (w.length - 1 - i)] = w[i]
    for (let i = 0; i < d.length; i++) map[Math.round(10 ** -(i + 1) * 100) / 100] = d[i]
    return map
  }
  const cols = () => PV_COLS.filter(([, v]) => v === 0 || v <= Math.max(1, Math.abs(props.n)) || (v < 1 && digits()[v] != null) || v === 1)
  return (
    <div class="flex justify-center gap-1">
      <For each={cols()}>
        {([name, v]) =>
          v === 0 ? (
            <div class="flex items-end pb-2 text-2xl font-black">.</div>
          ) : (
            <div class="flex w-12 flex-col items-center overflow-hidden rounded-xl bg-white ring-2 ring-violet-300 dark:bg-white/10">
              <div class="w-full bg-violet-200 py-0.5 text-center text-xs font-black text-violet-900 dark:bg-violet-500/30 dark:text-violet-100">{name}</div>
              <div class="py-1 text-2xl font-black">{digits()[v] ?? (v >= 1 && v < Math.abs(props.n) ? '0' : '')}</div>
            </div>
          )
        }
      </For>
    </div>
  )
}

export function MethodVisual(props) {
  const v = () => props.visual
  return (
    <Show when={v()}>
      <div class="mt-2 flex justify-center text-violet-950 dark:text-violet-50">
        <Show when={v().type === 'jumps'}><JumpLine start={v().start} jumps={v().jumps} labels={v().labels} /></Show>
        <Show when={v().type === 'grid'}><GridMethod rows={v().rows} cols={v().cols} /></Show>
        <Show when={v().type === 'bar'}><FractionBar parts={v().parts} shaded={v().shaded} total={v().total} /></Show>
        <Show when={v().type === 'dots'}><Dots rows={v().rows} cols={v().cols} /></Show>
        <Show when={v().type === 'round'}><RoundLine n={v().n} lo={v().lo} hi={v().hi} /></Show>
        <Show when={v().type === 'pv'}><PlaceValueChart n={v().n} /></Show>
      </div>
    </Show>
  )
}
