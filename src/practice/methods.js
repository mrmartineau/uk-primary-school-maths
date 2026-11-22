// "Ways to work it out": several methods for a question, in the language of
// the parents' guide (partitioning, counting up, friendly numbers, grid
// method, chunking, inverse facts…). Methods are worked out from the
// question itself, so every generator gets them for free.
//
// A method is { name, emoji, steps: string[], visual? }
// visual: { type: 'jumps', start, jumps: number[] }
//       | { type: 'grid', rows: number[], cols: number[] }
//       | { type: 'bar', parts, shaded, total }
//       | { type: 'dots', rows, cols }
//       | { type: 'round', n, lo, hi }

const r4 = (n) => Math.round(n * 10000) / 10000
export const f = (n) => {
  const x = r4(n)
  return Math.abs(x) >= 10000 ? x.toLocaleString('en-GB', { maximumFractionDigits: 4 }) : String(x).replace('-', '−')
}
const isInt = (n) => Number.isInteger(r4(n))
const dp = (n) => (String(r4(n)).split('.')[1] || '').length

/** 278 → [200, 70, 8]; 12.9 → [10, 2, 0.9] */
export function places(n) {
  const s = String(r4(Math.abs(n)))
  const [w, d = ''] = s.split('.')
  const out = []
  for (let i = 0; i < w.length; i++) if (w[i] !== '0') out.push(Number(w[i]) * 10 ** (w.length - 1 - i))
  for (let i = 0; i < d.length; i++) if (d[i] !== '0') out.push(r4(Number(d[i]) / 10 ** (i + 1)))
  return out.length ? out : [0]
}

const num = (s) => Number(String(s).replace(/[,£p°C\s]/g, '').replace(/[−–]/g, '-'))
const N = String.raw`(-?[\d,]*\.?\d+)`

// ---------------------------------------------------------------------------
// Parse a question into an operation

function parse(q) {
  const t = q.text.replace(/[−–]/g, '-').replace(/\s+\(use r for remainder\)/, '').trim()
  let m
  const op = (o, a, b, extra = {}) => ({ op: o, a: num(a), b: num(b), ...extra })

  if ((m = t.match(new RegExp(`^${N} \\+ \\? = ${N}$`)))) return op('bond', m[1], m[2])
  if ((m = t.match(new RegExp(`^\\? \\+ ${N} = ${N}$`)))) return op('bond', m[1], m[2])
  if ((m = t.match(new RegExp(`^\\? - ${N} = ${N}$`)))) return op('add', m[2], m[1], { inverse: 'sub' })
  if ((m = t.match(new RegExp(`^\\? × ${N} = ${N}$`)))) return op('div', m[2], m[1], { inverse: 'mul' })
  if ((m = t.match(new RegExp(`^${N} × \\? = ${N}$`)))) return op('div', m[2], m[1], { inverse: 'mul' })
  if ((m = t.match(new RegExp(`^${N} \\+ ${N} = \\?$`)))) return op('add', m[1], m[2])
  if ((m = t.match(new RegExp(`^${N} - ${N} = \\?$`)))) return op('sub', m[1], m[2])
  if ((m = t.match(new RegExp(`^${N} × ${N} = \\?$`)))) return op('mul', m[1], m[2])
  if ((m = t.match(new RegExp(`^${N} ÷ ${N} = \\?$`)))) return op('div', m[1], m[2])
  if ((m = t.match(new RegExp(`^Double ${N} = \\?$`)))) return op('mul', m[1], 2, { double: true })
  if ((m = t.match(new RegExp(`^Half of ${N} = \\?$`)))) return op('div', m[1], 2, { half: true })
  if ((m = t.match(new RegExp(`^Round ${N} to the nearest ${N}$`)))) return op('round', m[1], m[2])
  if ((m = t.match(new RegExp(`^Round ${N} to the nearest whole number$`)))) return op('round', m[1], 1)
  if ((m = t.match(new RegExp(`^Round ${N} to 1 decimal place$`)))) return op('round', m[1], 0.1)
  if ((m = t.match(new RegExp(`^What is (\\d+)/(\\d+) of ${N}\\?$`)))) return { op: 'fracOf', top: +m[1], bottom: +m[2], n: num(m[3]) }
  if ((m = t.match(new RegExp(`^What is a (half|quarter) of ${N}\\?$`)))) return { op: 'fracOf', top: 1, bottom: m[1] === 'half' ? 2 : 4, n: num(m[2]) }
  if ((m = t.match(new RegExp(`^What is ${N}% of ${N}\\?$`)))) return op('pct', m[1], m[2])
  if ((m = t.match(/^It is (-?\d+)°C\. The temperature falls by (\d+) degrees/))) return op('sub', m[1], m[2])
  if ((m = t.match(/^How many degrees from (-?\d+)°C to (-?\d+)°C\?$/))) return op('diff', m[1], m[2])
  if ((m = t.match(/^What is the difference between (-?\d+) and (-?\d+)\?$/))) return op('diff', m[1], m[2])
  if ((m = t.match(/^What time is it (\d+) minutes after (\d+):(\d\d)\?$/))) return { op: 'timeAdd', start: +m[2] * 60 + +m[3], add: +m[1], twelve: true }
  if ((m = t.match(/^A film starts at (\d+):(\d\d) and lasts (\d+) minutes/))) return { op: 'timeAdd', start: +m[1] * 60 + +m[2], add: +m[3] }
  if ((m = t.match(/^How many minutes from (\d+):(\d\d) to (\d+):(\d\d)\?$/))) return { op: 'timeDiff', a: +m[1] * 60 + +m[2], b: +m[3] * 60 + +m[4] }
  if ((m = t.match(/^(\d+)p \+ (\d+)p \+ (\d+)p = \?p$/))) return { op: 'addMany', list: [+m[1], +m[2], +m[3]] }
  if ((m = t.match(/costs £([\d.]+)\. You pay with a £(\d+) note/))) return op('sub', m[2], m[1])
  if ((m = t.match(/for (\d+)p and pay with £1/))) return op('sub', 100, m[1])
  if ((m = t.match(new RegExp(`^${N}, ${N}, ${N}, ${N}, \\?$`)))) return { op: 'pattern', seq: [m[1], m[2], m[3], m[4]].map(num) }
  if ((m = t.match(/^What is the value of the (\d) in (\d+)\?$/))) return { op: 'pv', digit: m[1], n: +m[2] }
  if ((m = t.match(/^How many tens are in (\d+)\?$/))) return { op: 'pv', digit: m[1][0], n: +m[1], tens: true }
  if (q.visual?.type === 'clock') return { op: 'clock', h: q.visual.h, m: q.visual.m }

  // Word problems etc: use the first sum in the explanation
  const e = (q.explain || '').replace(/[−–]/g, '-').replace(/£/g, '')
  if ((m = e.match(new RegExp(`${N} ([+\\-×÷]) ${N} = ${N}`)))) {
    const o = { '+': 'add', '-': 'sub', '×': 'mul', '÷': 'div' }[m[2]]
    return op(o, m[1], m[3])
  }
  return null
}

// ---------------------------------------------------------------------------
// Method builders

const M = (name, emoji, steps, visual) => ({ name, emoji, steps, visual })

function addMethods(a, b) {
  const out = []
  const ans = r4(a + b)
  // Start from the bigger number when adding a small one
  if (a < b && b - a > 5) [a, b] = [b, a]
  const parts = places(b)

  if (parts.length > 1) {
    let cur = a
    const steps = [`Split ${f(b)} into ${parts.map(f).join(' + ')}.`]
    for (const p of parts) {
      steps.push(`${f(cur)} + ${f(p)} = ${f(r4(cur + p))}`)
      cur = r4(cur + p)
    }
    out.push(M('Partitioning', '✂️', steps, parts.length <= 4 ? { type: 'jumps', start: a, jumps: parts } : null))
  }

  if (isInt(a) && isInt(b) && a % 10 !== 0 && b > 10 - (a % 10) && b < 100) {
    const need = 10 - (a % 10)
    const rest = b - need
    out.push(
      M('Make the next 10', '🔟', [
        `${f(a)} needs ${need} more to make ${a + need}.`,
        `Split ${f(b)} into ${need} + ${rest}.`,
        `${f(a)} + ${need} = ${a + need}, then + ${rest} = ${f(ans)}`,
      ], { type: 'jumps', start: a, jumps: [need, rest] }),
    )
  }

  if (isInt(b) && b > 5 && [7, 8, 9].includes(b % 10)) {
    const R = b + (10 - (b % 10))
    const back = R - b
    out.push(
      M('Friendly number', '🤝', [
        `${f(b)} is close to ${f(R)}, which is easier.`,
        `${f(a)} + ${f(R)} = ${f(a + R)}`,
        `You added ${back} too many, so take ${back} away: ${f(ans)}`,
      ], { type: 'jumps', start: a, jumps: [R, -back] }),
    )
  }

  if (isInt(a) && isInt(b) && a >= 100 && b >= 100) {
    const pa = places(a), pb = places(b)
    const cols = [1000, 100, 10, 1].map((p) => [p, (pa.find((x) => x >= p && x < p * 10) || 0) + (pb.find((x) => x >= p && x < p * 10) || 0)]).filter(([, s]) => s)
    out.push(
      M('Expanded columns', '🧱', [
        ...cols.map(([p, s]) => `${{ 1000: 'Thousands', 100: 'Hundreds', 10: 'Tens', 1: 'Ones' }[p]}: ${f(s)}`),
        `Add them up: ${cols.map(([, s]) => f(s)).join(' + ')} = ${f(ans)}`,
      ]),
    )
  }

  if (isInt(a) && isInt(b) && Math.abs(a - b) <= 3 && Math.min(a, b) >= 3 && a !== b) {
    const lo = Math.min(a, b)
    out.push(M('Near double', '👯', [`${f(lo)} + ${f(lo)} = ${f(lo * 2)} (a double you know)`, `Then add the extra ${Math.abs(a - b)}: ${f(ans)}`]))
  } else if (a === b) {
    out.push(M('Double it', '👯', [`${f(a)} + ${f(a)} is double ${f(a)} = ${f(ans)}`]))
  }

  if (!isInt(a) || !isInt(b)) {
    const k = 10 ** Math.max(dp(a), dp(b))
    out.push(M('Make it whole', '🔍', [`Pretend they are whole numbers: ${f(a * k)} + ${f(b * k)} = ${f(r4(a * k + b * k))}`, `Now make it ${k} times smaller: ${f(ans)}`]))
  }

  if (out.length < 2) out.push(M('Count on', '👉', [`Start at ${f(a)} and count on ${f(b)}.`, `You land on ${f(ans)}`], { type: 'jumps', start: a, jumps: parts.length > 1 ? parts : [b] }))
  return out
}

function subMethods(a, b) {
  const out = []
  const ans = r4(a - b)

  if (ans < 0 || a < 0) {
    if (a > 0) {
      out.push(M('Number line through zero', '🌡️', [`Go down ${f(a)} to get to 0.`, `You still need to go down ${f(b - a)} more.`, `0 − ${f(b - a)} = ${f(ans)}`], { type: 'jumps', start: a, jumps: [-a, -(b - a)] }))
    } else {
      out.push(M('Go further down', '🌡️', [`Start at ${f(a)}. Taking away moves you down the number line.`, `Down ${f(b)} more lands on ${f(ans)}`], { type: 'jumps', start: a, jumps: [-b] }))
    }
    out.push(M('Check it', '✅', [`${f(ans)} + ${f(b)} = ${f(a)} ✔️`]))
    return out
  }

  // Counting up (find the difference)
  if (isInt(a) && isInt(b) && b > 0) {
    const jumps = []
    let cur = b
    for (const step of [10, 100, 1000]) {
      const next = Math.ceil((cur + 0.0001) / step) * step
      if (cur % step !== 0 && next <= a && next - cur > 0) {
        jumps.push(next - cur)
        cur = next
      }
    }
    for (const step of [1000, 100, 10]) {
      const fl = Math.floor(a / step) * step
      if (fl > cur && cur % step === 0) {
        jumps.push(fl - cur)
        cur = fl
      }
    }
    if (a - cur > 0) jumps.push(a - cur)
    if (jumps.length >= 1) {
      let c = b
      const steps = [`Find the difference: count up from ${f(b)} to ${f(a)}.`]
      for (const j of jumps) {
        steps.push(`${f(c)} → ${f(c + j)} is ${f(j)}`)
        c += j
      }
      steps.push(`Add the jumps: ${jumps.map(f).join(' + ')} = ${f(ans)}`)
      out.push(M('Counting up', '🪜', steps, { type: 'jumps', start: b, jumps }))
    }
  }

  // Take away in parts
  const parts = places(b)
  if (parts.length > 1 || !isInt(a)) {
    let cur = a
    const steps = [`Split ${f(b)} into ${parts.map(f).join(' + ')}.`]
    for (const p of parts) {
      steps.push(`${f(cur)} − ${f(p)} = ${f(r4(cur - p))}`)
      cur = r4(cur - p)
    }
    out.push(M('Take away in parts', '✂️', steps, parts.length <= 4 ? { type: 'jumps', start: a, jumps: parts.map((p) => -p) } : null))
  }

  // Friendly number
  if (isInt(b) && b > 5 && [7, 8, 9].includes(b % 10)) {
    const R = b + (10 - (b % 10))
    out.push(
      M('Friendly number', '🤝', [
        `${f(b)} is close to ${f(R)}.`,
        `${f(a)} − ${f(R)} = ${f(a - R)}`,
        `You took away ${R - b} too many, so add ${R - b} back: ${f(ans)}`,
      ], { type: 'jumps', start: a, jumps: [-R, R - b] }),
    )
  }

  if (out.length < 2 && isInt(a) && a <= 20 && b <= 10) {
    out.push(M('Count back', '👈', [`Start at ${f(a)} and count back ${f(b)}.`, `You land on ${f(ans)}`], { type: 'jumps', start: a, jumps: [-b] }))
  }
  if (!isInt(a) || !isInt(b)) {
    const k = 10 ** Math.max(dp(a), dp(b))
    out.push(M('Make it whole', '🔍', [`Pretend they are whole numbers: ${f(a * k)} − ${f(b * k)} = ${f(r4(a * k - b * k))}`, `Now make it ${k} times smaller: ${f(ans)}`]))
  }
  out.push(M('Check it', '✅', [`Add back to check: ${f(ans)} + ${f(b)} = ${f(a)} ✔️`]))
  return out
}

/** Times-table shortcuts using facts children already know */
function tableTrick(x, y) {
  const p = x * y
  switch (y) {
    case 2: return M('Double it', '👯', [`× 2 is just doubling: double ${x} = ${p}`])
    case 3: return M('Double and one more', '➕', [`Double ${x} = ${x * 2}`, `Add one more ${x}: ${x * 2} + ${x} = ${p}`])
    case 4: return M('Double, double', '👯', [`Double ${x} = ${x * 2}`, `Double again = ${p}`])
    case 5: return M('Half of ×10', '✋', [`${x} × 10 = ${x * 10}`, `Half of that is ${p}`])
    case 6: return M('×5 and one more', '✋', [`${x} × 5 = ${x * 5}`, `Add one more ${x}: ${x * 5} + ${x} = ${p}`])
    case 7: return M('×5 plus ×2', '🧩', [`${x} × 5 = ${x * 5}`, `${x} × 2 = ${x * 2}`, `${x * 5} + ${x * 2} = ${p}`])
    case 8: return M('Double, double, double', '👯', [`Double ${x} = ${x * 2}`, `Double = ${x * 4}`, `Double = ${p}`])
    case 9: return M('×10 take one away', '🔟', [`${x} × 10 = ${x * 10}`, `Take away one ${x}: ${x * 10} − ${x} = ${p}`])
    case 10: return M('Shift the digits', '➡️', [`× 10 moves every digit one place left: ${p}`])
    case 11: return M('×10 and one more', '🔟', [`${x} × 10 = ${x * 10}`, `Add one more ${x}: ${p}`])
    case 12: return M('×10 plus ×2', '🧩', [`${x} × 10 = ${x * 10}`, `${x} × 2 = ${x * 2}`, `${x * 10} + ${x * 2} = ${p}`])
    default: return null
  }
}

function mulMethods(a, b, opts = {}) {
  const out = []
  const ans = r4(a * b)

  if (opts.double) {
    const parts = places(a)
    if (parts.length > 1) out.push(M('Double each part', '✂️', [`Split ${f(a)} into ${parts.map(f).join(' + ')}.`, ...parts.map((p) => `Double ${f(p)} = ${f(p * 2)}`), `${parts.map((p) => f(p * 2)).join(' + ')} = ${f(ans)}`]))
    out.push(M('Add it to itself', '➕', [`${f(a)} + ${f(a)} = ${f(ans)}`]))
    return out
  }

  // Decimals: use the whole-number fact
  if (!isInt(a) || !isInt(b)) {
    const k = 10 ** (dp(a) + dp(b))
    const A = r4(a * 10 ** dp(a)), B = r4(b * 10 ** dp(b))
    out.push(M('Use the whole-number fact', '🔍', [`Ignore the decimal point: ${f(A)} × ${f(B)} = ${f(A * B)}`, `Make it ${k} times smaller: ${f(ans)}`]))
    out.push(M('Does it make sense?', '🤔', [`${f(a)} × ${f(b)} should be about ${f(Math.round(a) * Math.round(b))}, so ${f(ans)} fits.`]))
    return out
  }

  // Multiples of 10: do the small fact, put the zeros back
  const strip = (n) => { let z = 0; while (n % 10 === 0 && n > 9) { n /= 10; z++ } return [n, z] }
  const [sa, za] = strip(a), [sb, zb] = strip(b)
  if (za + zb > 0 && sa <= 12 && sb <= 12 && (sa > 1 || sb > 1)) {
    out.push(M('Small fact, then the zeros', '0️⃣', [`Ignore the zeros: ${sa} × ${sb} = ${sa * sb}`, `Put back ${za + zb} zero${za + zb > 1 ? 's' : ''}: ${f(ans)}`]))
    if (b === 10 || b === 100 || b === 1000 || a === 10 || a === 100 || a === 1000) {
      const big = Math.max(a, b), other = Math.min(a, b)
      out.push(M('Shift the digits', '➡️', [`× ${f(big)} moves every digit ${String(big).length - 1} place${big > 10 ? 's' : ''} to the left.`, `${f(other)} becomes ${f(ans)}`]))
    }
    return out
  }

  // Order so x is the bigger, y the smaller
  const x = Math.max(a, b), y = Math.min(a, b)

  if (x <= 12) {
    // A table fact: offer shortcuts using known facts
    const tricks = [tableTrick(x, y), tableTrick(y, x)].filter(Boolean)
    const fav = [9, 5, 4, 8, 11, 12, 6, 7, 3, 2, 10]
    tricks.sort((m1, m2) => fav.indexOf(Number(m1.steps[0].match(/× (\d+)/)?.[1])) - fav.indexOf(Number(m2.steps[0].match(/× (\d+)/)?.[1])))
    out.push(...tricks.slice(0, 2))
    // Nearby fact
    if (y > 2 && ![5, 10].includes(y)) {
      const near = y === 9 || y === 4 ? y + 1 : y - 1
      if ([2, 5, 10].includes(near) || y >= 6) {
        const nf = x * near
        out.push(M('Use a nearby fact', '🧭', [`You know ${x} × ${near} = ${nf}.`, near < y ? `Add one more ${x}: ${nf} + ${x} = ${ans}` : `Take one ${x} away: ${nf} − ${x} = ${ans}`]))
      }
    }
    if (y <= 5 || ans <= 30) {
      const seq = Array.from({ length: y }, (_, i) => x * (i + 1))
      out.push(M(`Count in ${x}s`, '🔢', [`${seq.join(', ')}`, `That's ${y} lots of ${x} = ${ans}`], ans <= 40 ? { type: 'dots', rows: y, cols: x } : null))
    }
    if (a !== b) out.push(M('Swap it round', '🔄', [`${a} × ${b} is the same as ${b} × ${a}. Use whichever table you know best!`]))
    return out
  }

  // Bigger numbers
  const px = places(x)
  if (y <= 12) {
    out.push(
      M('Partitioning', '✂️', [
        `Split ${f(x)} into ${px.map(f).join(' + ')}.`,
        ...px.map((p) => `${f(p)} × ${y} = ${f(p * y)}`),
        `Add them: ${px.map((p) => f(p * y)).join(' + ')} = ${f(ans)}`,
      ], { type: 'grid', rows: px, cols: [y] }),
    )
  } else {
    const py = places(y)
    out.push(
      M('Grid method', '🔲', [
        `Split both numbers: ${px.map(f).join(' + ')} and ${py.map(f).join(' + ')}.`,
        'Multiply each pair (see the grid).',
        `Add all the boxes: ${f(ans)}`,
      ], { type: 'grid', rows: px, cols: py }),
    )
  }
  if ([8, 9].includes(x % 10)) {
    const R = x + (10 - (x % 10)), k = R - x
    out.push(M('Friendly number', '🤝', [`${f(x)} is close to ${f(R)}.`, `${f(R)} × ${y} = ${f(R * y)}`, `Take away ${k} lot${k > 1 ? 's' : ''} of ${y}: ${f(R * y)} − ${f(k * y)} = ${f(ans)}`]))
  }
  if ((x % 5 === 0 && y % 2 === 0) || (y % 5 === 0 && x % 2 === 0)) {
    const [even, five] = x % 2 === 0 && y % 5 === 0 ? [x, y] : [y, x]
    if (five % 10 !== 0) out.push(M('Double and halve', '⚖️', [`Halve ${f(even)} → ${f(even / 2)}, double ${f(five)} → ${f(five * 2)}.`, `${f(even / 2)} × ${f(five * 2)} = ${f(ans)} (easier!)`]))
  }
  if (y <= 12) out.push(M('Estimate first', '🤔', [`${f(x)} is about ${f(Math.round(x / 10) * 10)}. ${f(Math.round(x / 10) * 10)} × ${y} = ${f(Math.round(x / 10) * 10 * y)}.`, `So the answer should be close to that: ${f(ans)}`]))
  return out
}

function divMethods(a, b, opts = {}) {
  const out = []
  const q = a / b
  const whole = Math.floor(r4(q))
  const rem = r4(a - whole * b)

  if (opts.half) {
    const parts = places(a)
    if (parts.length > 1) out.push(M('Halve each part', '✂️', [`Split ${f(a)} into ${parts.map(f).join(' + ')}.`, ...parts.map((p) => `Half of ${f(p)} = ${f(p / 2)}`), `${parts.map((p) => f(p / 2)).join(' + ')} = ${f(q)}`]))
    out.push(M('Think doubles', '👯', [`What doubled makes ${f(a)}? ${f(q)} + ${f(q)} = ${f(a)}`]))
    return out
  }

  if (!isInt(a) || !isInt(q)) {
    if (isInt(a) && isInt(b) && rem > 0) {
      out.push(M('Find the nearest fact', '📦', [`What's the biggest multiple of ${b} that fits in ${a}?`, `${b} × ${whole} = ${b * whole}`, `${a} − ${b * whole} = ${rem} left over.`, `So ${whole} r ${rem}`]))
      out.push(M('Chunking', '🧱', chunkSteps(a, b), null))
      return out
    }
    const k = 10 ** Math.max(dp(a), dp(q))
    out.push(M('Use the whole-number fact', '🔍', [`Make it whole: ${f(a * k)} ÷ ${f(b)} = ${f(r4(a * k / b))}`, `Now make it ${k} times smaller: ${f(q)}`]))
    if ([10, 100, 1000].includes(b)) out.push(M('Shift the digits', '⬅️', [`÷ ${b} moves every digit ${String(b).length - 1} place${b > 10 ? 's' : ''} to the right: ${f(q)}`]))
    return out
  }

  if ([10, 100, 1000].includes(b)) {
    out.push(M('Shift the digits', '⬅️', [`÷ ${b} moves every digit ${String(b).length - 1} place${b > 10 ? 's' : ''} to the right.`, `${f(a)} becomes ${f(q)}`]))
    return out
  }

  // Multiples of 10 on top: use the small fact
  if (a % 10 === 0 && (a / 10) % b === 0 && q % 10 === 0 && b <= 12) {
    let z = 0, s = a
    while (s % 10 === 0 && (s / 10) % b === 0 && s / 10 >= b) { s /= 10; z++ }
    out.push(M('Small fact, then the zeros', '0️⃣', [`${f(s)} ÷ ${b} = ${f(s / b)}`, `${f(a)} has ${z} more zero${z > 1 ? 's' : ''}, so the answer does too: ${f(q)}`]))
  }

  if (q <= 12 && b <= 12) {
    out.push(M('Use a times table', '🔁', [`Think: ? × ${b} = ${a}`, `${q} × ${b} = ${a}, so ${a} ÷ ${b} = ${q}`]))
    out.push(M(`Count in ${b}s`, '🔢', [`${Array.from({ length: q }, (_, i) => b * (i + 1)).join(', ')}`, `That's ${q} jumps of ${b}.`], q * b <= 40 ? { type: 'dots', rows: q, cols: b } : null))
  }
  if ([2, 4, 8].includes(b)) {
    const n = Math.log2(b)
    const steps = []
    let cur = a
    for (let i = 0; i < n; i++) { steps.push(`Half of ${f(cur)} = ${f(cur / 2)}`); cur /= 2 }
    out.push(M(b === 2 ? 'Halve it' : `Halve ${n === 2 ? 'twice' : 'three times'}`, '✂️', steps))
  }
  if (b === 5) out.push(M('÷10 then double', '✋', [`${f(a)} ÷ 10 = ${f(a / 10)}`, `Double it: ${f(q)}`]))

  if (q > 10 && b <= 12) {
    const tens = Math.floor(q / 10) * 10
    const big = tens * b
    if (big < a) {
      out.push(M('Partition the number', '✂️', [`Split ${f(a)} into ${f(big)} + ${f(a - big)} (easy to divide by ${b}).`, `${f(big)} ÷ ${b} = ${tens}`, `${f(a - big)} ÷ ${b} = ${f((a - big) / b)}`, `${tens} + ${f((a - big) / b)} = ${f(q)}`]))
    }
    out.push(M('Chunking', '🧱', chunkSteps(a, b)))
  }
  out.push(M('Check it', '✅', [`Multiply back: ${f(q)} × ${b} = ${f(a)} ✔️`]))
  return out
}

function chunkSteps(a, b) {
  const steps = [`Take away big chunks of ${b} you know.`]
  let left = a, total = 0
  for (const k of [100, 50, 20, 10, 5, 2, 1]) {
    while (left >= k * b) {
      steps.push(`${f(left)} − ${f(k * b)} (${k} × ${b}) = ${f(left - k * b)}`)
      left -= k * b
      total += k
    }
  }
  steps.push(`Chunks: ${total} lots of ${b}${left ? `, with ${f(left)} left over` : ''}.`)
  return steps
}

function roundMethods(n, to) {
  const lo = Math.floor(r4(n / to)) * to, hi = r4(lo + to), mid = r4(lo + to / 2)
  const ans = n >= mid ? hi : lo
  const placeName = { 0.1: 'hundredths', 1: 'tenths', 10: 'ones', 100: 'tens', 1000: 'hundreds' }[to]
  return [
    M('Number line', '📏', [`${f(n)} is between ${f(r4(lo))} and ${f(hi)}.`, `Halfway is ${f(mid)}.`, `${f(n)} is ${n >= mid ? 'at or past' : 'before'} halfway, so it rounds ${n >= mid ? 'up' : 'down'} to ${f(r4(ans))}`], { type: 'round', n, lo: r4(lo), hi }),
    M('Look at the next digit', '👀', [`Look at the ${placeName} digit.`, '5 or more? Round up. 4 or less? Round down.', `So ${f(n)} → ${f(r4(ans))}`]),
  ]
}

function fracMethods(top, bottom, n) {
  const one = n / bottom
  const ans = one * top
  const out = [
    M('Find one part first', '🍕', [`Share ${f(n)} into ${bottom} equal parts: ${f(n)} ÷ ${bottom} = ${f(one)}`, top > 1 ? `You want ${top} parts: ${f(one)} × ${top} = ${f(ans)}` : `One part is ${f(ans)}`], { type: 'bar', parts: bottom, shaded: top, total: n }),
  ]
  if (bottom === 2) out.push(M('Halve it', '✂️', [`Half of ${f(n)} = ${f(ans)}`]))
  if (bottom === 4 && top === 1) out.push(M('Halve, then halve again', '✂️', [`Half of ${f(n)} = ${f(n / 2)}`, `Half again = ${f(ans)}`]))
  if (bottom === 4 && top === 3) out.push(M('Whole take away a quarter', '➖', [`A quarter of ${f(n)} = ${f(one)}`, `${f(n)} − ${f(one)} = ${f(ans)}`]))
  return out
}

function pctMethods(p, n) {
  const ten = n / 10
  const ans = (n * p) / 100
  const build = {
    10: [`10% means ÷ 10: ${f(n)} ÷ 10 = ${f(ten)}`],
    20: [`10% = ${f(ten)}`, `20% is double: ${f(ten * 2)}`],
    30: [`10% = ${f(ten)}`, `30% = 3 × ${f(ten)} = ${f(ten * 3)}`],
    5: [`10% = ${f(ten)}`, `5% is half of that: ${f(ten / 2)}`],
    15: [`10% = ${f(ten)}`, `5% = ${f(ten / 2)}`, `15% = ${f(ten)} + ${f(ten / 2)} = ${f(ans)}`],
    25: [`50% = half = ${f(n / 2)}`, `25% = half again = ${f(n / 4)}`],
    50: [`50% = half: ${f(n / 2)}`],
    75: [`50% = ${f(n / 2)}`, `25% = ${f(n / 4)}`, `75% = ${f(n / 2)} + ${f(n / 4)} = ${f(ans)}`],
  }[p] || [`1% = ${f(n / 100)}`, `${p}% = ${p} × ${f(n / 100)} = ${f(ans)}`]
  const out = [M('Build it from 10%', '🧱', build)]
  const frac = { 10: '1/10', 20: '1/5', 25: '1/4', 50: '1/2', 75: '3/4', 5: '1/20' }[p]
  if (frac) {
    const [t, b] = frac.split('/').map(Number)
    out.push(M('Use a fraction', '🍕', [`${p}% is the same as ${frac}.`, `${f(n)} ÷ ${b} = ${f(n / b)}${t > 1 ? `, × ${t} = ${f(ans)}` : ''}`]))
  }
  return out
}

function bondMethods(a, total) {
  const ans = r4(total - a)
  const out = [...subMethods(total, a).filter((m) => m.name === 'Counting up')]
  if (isInt(a) && isInt(total) && [10, 100, 1000, 20].includes(total) && a < total) {
    if (total === 100 && a % 10 !== 0) {
      out.push(M('Ones to 10, tens to 90', '🤝', [`The ones: ${a % 10} + ${10 - (a % 10)} = 10`, `The tens: ${Math.floor(a / 10) * 10} + ${90 - Math.floor(a / 10) * 10} = 90`, `So ${f(a)} + ${f(ans)} = 100`]))
    } else if (total === 1000 && a % 100 !== 0 && a % 10 === 0) {
      out.push(M('Tens to 100, hundreds to 900', '🤝', [`${(a % 100)} + ${100 - (a % 100)} = 100`, `${Math.floor(a / 100) * 100} + ${900 - Math.floor(a / 100) * 100} = 900`, `So ${f(a)} + ${f(ans)} = 1000`]))
    } else if (total === 10 || total === 20) {
      out.push(M('Bonds to 10', '🖐️', [total === 10 ? `Hold up ${a} fingers. How many are down? ${ans}` : `Bond to 10 first, then add 10 more.`, `${f(a)} + ${f(ans)} = ${f(total)}`]))
    }
  }
  if (!isInt(a) || !isInt(total)) {
    const k = 10 ** Math.max(dp(a), dp(total))
    out.push(M('Make it whole', '🔍', [`Make them whole: ${f(a * k)} + ? = ${f(total * k)} → ${f(r4(total * k - a * k))}`, `Now make it ${k} times smaller: ${f(ans)}`]))
  }
  out.push(M('Take away', '➖', [`${f(total)} − ${f(a)} = ${f(ans)}`]))
  return out
}

const hm = (m) => `${Math.floor(m / 60) % 24}:${String(m % 60).padStart(2, '0')}`
function timeAddMethods(start, add, twelve) {
  const show = (m) => (twelve ? `${(Math.floor(m / 60) % 12) || 12}:${String(m % 60).padStart(2, '0')}` : hm(m))
  const toHour = 60 - (start % 60)
  const out = []
  if (start % 60 && add > toHour) {
    out.push(M('Go to the next o’clock', '⏰', [`${show(start)} → ${show(start + toHour)} is ${toHour} minutes.`, `${add} − ${toHour} = ${add - toHour} minutes still to go.`, `${show(start + toHour)} + ${add - toHour} min = ${show(start + add)}`], { type: 'jumps', start: 0, jumps: [toHour, add - toHour], labels: [show(start), show(start + toHour), show(start + add)] }))
  }
  if (add >= 60) out.push(M('Hours first', '⏳', [`${add} minutes = ${Math.floor(add / 60)} hour${add >= 120 ? 's' : ''} and ${add % 60} minutes.`, `${show(start)} + ${Math.floor(add / 60)} h = ${show(start + Math.floor(add / 60) * 60)}`, `+ ${add % 60} min = ${show(start + add)}`]))
  out.push(M('Add the minutes', '➕', [`${start % 60} + ${add} = ${(start % 60) + add} minutes past ${(twelve ? Math.floor(start / 60) % 12 || 12 : Math.floor(start / 60))}.`, `60 minutes make an hour, so that's ${show(start + add)}`]))
  return out
}

function timeDiffMethods(a, b) {
  const jumps = []
  let cur = a
  if (cur % 60) { jumps.push(60 - (cur % 60)); cur += 60 - (cur % 60) }
  while (cur + 60 <= b) { jumps.push(60); cur += 60 }
  if (b - cur > 0) jumps.push(b - cur)
  const labels = [a]
  jumps.reduce((c, j) => (labels.push(c + j), c + j), a)
  return [
    M('Count up in hours', '🪜', [...jumps.map((j, i) => `${hm(labels[i])} → ${hm(labels[i + 1])} is ${j} min`), `Add the jumps: ${jumps.join(' + ')} = ${b - a} minutes`], { type: 'jumps', start: 0, jumps, labels: labels.map(hm) }),
    M('Hours and minutes', '⏳', [`${Math.floor((b - a) / 60)} whole hour${b - a >= 120 ? 's' : ''} = ${Math.floor((b - a) / 60) * 60} minutes, plus ${(b - a) % 60} more.`, `= ${b - a} minutes`]),
  ]
}

function diffMethods(a, b) {
  const lo = Math.min(a, b), hi = Math.max(a, b)
  if (lo < 0 && hi > 0) {
    return [
      M('Count through zero', '🌡️', [`From ${f(lo)} up to 0 is ${f(-lo)}.`, `From 0 up to ${f(hi)} is ${f(hi)}.`, `${f(-lo)} + ${f(hi)} = ${f(hi - lo)}`], { type: 'jumps', start: lo, jumps: [-lo, hi] }),
      M('Bigger take smaller', '➖', [`${f(hi)} − ${f(lo)} = ${f(hi)} + ${f(-lo)} = ${f(hi - lo)}`, 'Taking away a negative is like adding!']),
    ]
  }
  return subMethods(hi, lo)
}

function patternMethods(seq) {
  const gaps = seq.slice(1).map((x, i) => r4(x - seq[i]))
  const same = gaps.every((g) => g === gaps[0])
  if (same) {
    const g = gaps[0], next = r4(seq[3] + g)
    return [
      M('Find the gap', '🔍', [`${f(seq[0])} → ${f(seq[1])} is ${g > 0 ? '+' : '−'}${f(Math.abs(g))}. Check the others: they're the same!`, `${f(seq[3])} ${g > 0 ? '+' : '−'} ${f(Math.abs(g))} = ${f(next)}`], { type: 'jumps', start: seq[0], jumps: [...gaps, g] }),
      M(`Count in ${f(Math.abs(g))}s`, '🔢', [`Keep counting ${g > 0 ? 'on' : 'back'} in ${f(Math.abs(g))}s from ${f(seq[0])}: ${[...seq, next].map(f).join(', ')}`]),
    ]
  }
  const ratio = seq[1] / seq[0]
  if (seq.every((x, i) => i === 0 || r4(x / seq[i - 1]) === r4(ratio))) return [M('Multiply each time', '✖️', [`Each number is ${f(ratio)} × the one before.`, `${f(seq[3])} × ${f(ratio)} = ${f(seq[3] * ratio)}`])]
  const gg = gaps.slice(1).map((x, i) => r4(x - gaps[i]))
  return [M('Look at the gaps', '🔍', [`The gaps are ${gaps.map(f).join(', ')}.`, gg.every((x) => x === gg[0]) ? `The gaps grow by ${f(gg[0])} each time, so the next gap is ${f(gaps[2] + gg[0])}.` : 'What pattern do the gaps make?']),
    ...(seq.every((x) => Number.isInteger(Math.sqrt(x))) ? [M('Square numbers', '🟩', [`${seq.map((x) => `${Math.sqrt(x)}×${Math.sqrt(x)}`).join(', ')}…`, `Next: ${Math.sqrt(seq[3]) + 1} × ${Math.sqrt(seq[3]) + 1} = ${(Math.sqrt(seq[3]) + 1) ** 2}`])] : [])]
}

function pvMethods(digit, n, tens) {
  const s = String(n)
  const names = ['ones', 'tens', 'hundreds', 'thousands']
  const i = tens ? 0 : s.indexOf(digit)
  const col = s.length - 1 - i
  return [M('Place value chart', '🏠', [`Put ${f(n)} in columns: ${s.split('').map((d, k) => `${d} ${names[s.length - 1 - k]}`).join(', ')}.`, tens ? `The tens digit is ${s[s.length - 2]}, so there are ${Math.floor(n / 10)} tens altogether (count all of them: ${f(n)} ÷ 10, ignoring the leftover ones).` : `The ${digit} is in the ${names[col]} column, so it's worth ${digit} × ${10 ** col} = ${f(Number(digit) * 10 ** col)}`], { type: 'pv', n })]
}

function clockMethods(h, m) {
  return [M('Read the hands', '🕰️', [
    `Short hand = the hour. It's ${m ? `just past the ${h}` : `on the ${h}`}, so the hour is ${h}.`,
    m ? `Long hand = minutes. It points at the ${m / 5}: count in 5s → ${m} minutes.` : 'Long hand on the 12 means o’clock (:00).',
    `So it's ${h}:${String(m).padStart(2, '0')}${m === 30 ? ' (half past)' : m === 15 ? ' (quarter past)' : m === 45 ? ` (quarter to ${h % 12 + 1})` : ''}`,
  ])]
}

export function methodsFor(q) {
  let p
  try { p = parse(q) } catch { p = null }
  let out = []
  try {
    if (p?.op === 'add') out = addMethods(p.a, p.b)
    else if (p?.op === 'sub') out = subMethods(p.a, p.b)
    else if (p?.op === 'mul') out = mulMethods(p.a, p.b, p)
    else if (p?.op === 'div') out = divMethods(p.a, p.b, p)
    else if (p?.op === 'bond') out = bondMethods(p.a, p.b)
    else if (p?.op === 'round') out = roundMethods(p.a, p.b)
    else if (p?.op === 'fracOf') out = fracMethods(p.top, p.bottom, p.n)
    else if (p?.op === 'pct') out = pctMethods(p.a, p.b)
    else if (p?.op === 'diff') out = diffMethods(p.a, p.b)
    else if (p?.op === 'timeAdd') out = timeAddMethods(p.start, p.add, p.twelve)
    else if (p?.op === 'timeDiff') out = timeDiffMethods(p.a, p.b)
    else if (p?.op === 'pattern') out = patternMethods(p.seq)
    else if (p?.op === 'pv') out = pvMethods(p.digit, p.n, p.tens)
    else if (p?.op === 'clock') out = clockMethods(p.h, p.m)
    else if (p?.op === 'addMany') out = [M('Biggest coin first', '🪙', [`Start with ${p.list[0]}p and count on.`, `${p.list.join(' + ')} = ${p.list.reduce((x, y) => x + y)}p`]), ...addMethods(p.list[0], p.list[1] + p.list[2]).slice(0, 1)]
  } catch {
    out = []
  }
  // Questions that were already about a scaled fact keep their own explanation first
  const first = M(q.stretch ? 'Use the easy fact' : 'Quick way', '💡', [q.explain])
  // A bare sum like "831 − 182 = 649" teaches nothing, so skip it when we have real methods
  const bare = /^[-\d.,\s−+×÷=£]+$/.test(q.explain || '')
  const seen = new Set()
  return [...(bare && out.length >= 2 ? [] : [first]), ...out].filter((m) => m && m.steps?.length && !seen.has(m.name) && seen.add(m.name)).slice(0, 5)
}
