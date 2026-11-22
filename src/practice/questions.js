// Question generators for the practice zone.
// Every generator takes (r, level, opts) where r() is a 0..1 random function
// and level is 1..5. It returns a plain, serialisable question object:
// { text, answer, kind: 'number' | 'choice', keys?, choices?, hint, explain, visual?, unit? }

export function makeRng(seed) {
  let a = typeof seed === 'string' ? hashString(seed) : seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hashString(s) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

const int = (r, a, b) => a + Math.floor(r() * (b - a + 1))
const pick = (r, arr) => arr[Math.floor(r() * arr.length)]
export function shuffle(r, arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
const gcd = (a, b) => (b === 0 ? Math.abs(a) : gcd(b, a % b))
// Avoid floating point noise like 0.30000000000000004
const fix = (n, dp = 2) => String(Number(n.toFixed(dp)))
const money = (n) => n.toFixed(2)
const pounds = (n) => `£${n.toFixed(2)}`
const fmtTime = (mins) => {
  const m = ((mins % 1440) + 1440) % 1440
  const h = Math.floor(m / 60)
  return `${h}:${String(m % 60).padStart(2, '0')}`
}
const fmt12 = (mins) => {
  const m = ((mins % 720) + 720) % 720
  const h = Math.floor(m / 60) || 12
  return `${h}:${String(m % 60).padStart(2, '0')}`
}
const NAMES = ['Sam', 'Ava', 'Leo', 'Mia', 'Noah', 'Isla', 'Max', 'Zara', 'Alfie', 'Ruby', 'Theo', 'Priya']

const num = (text, answer, hint, explain, extra = {}) => ({
  kind: 'number',
  text,
  answer: String(answer),
  hint,
  explain,
  ...extra,
})

const choice = (r, text, answer, wrong, hint, explain, extra = {}) => ({
  kind: 'choice',
  text,
  answer: String(answer),
  choices: shuffle(r, [String(answer), ...wrong.map(String)]),
  hint,
  explain,
  ...extra,
})

// ---------------------------------------------------------------------------

const TABLE_TIPS = {
  2: 'The 2s are just doubling.',
  3: 'Count up in 3s: 3, 6, 9, 12…',
  4: 'Double it, then double again.',
  5: 'Half of the 10 times answer.',
  6: 'Do the 5s, then add one more group.',
  7: 'Split it: 7 × n = 5 × n + 2 × n.',
  8: 'Double, double, double!',
  9: 'Do the 10s, then take one group away.',
  10: 'Every digit moves one place to the left.',
  11: 'Do the 10s, then add one more group.',
  12: 'Do the 10s, then add the 2s.',
}

function tables(r, level, opts = {}) {
  const sets = {
    1: [2, 5, 10],
    2: [2, 3, 4, 5, 10],
    3: [3, 4, 6, 8],
    4: [6, 7, 8, 9, 11, 12],
    5: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  }
  const pool = opts.tables?.length ? opts.tables : sets[level]
  const t = pick(r, pool)
  const n = int(r, level <= 1 ? 1 : 2, 12)
  const p = t * n
  const tip = TABLE_TIPS[t] || ''
  const style = level >= 4 ? int(r, 0, 2) : level >= 2 ? int(r, 0, 1) : 0
  if (style === 1)
    return num(`? × ${t} = ${p}`, n, `How many ${t}s make ${p}? ${tip}`, `${n} × ${t} = ${p}`, { table: t })
  if (style === 2)
    return num(`${p} ÷ ${t} = ?`, n, `Think: what × ${t} = ${p}?`, `${n} × ${t} = ${p}, so ${p} ÷ ${t} = ${n}`, { table: t })
  const [a, b] = r() < 0.5 ? [n, t] : [t, n]
  return num(`${a} × ${b} = ?`, p, tip, `${a} × ${b} = ${p}. ${tip}`, { table: t })
}

function bonds(r, level) {
  if (level === 5) {
    const a = int(r, 1, 99) / 100
    const b = fix(1 - a)
    return num(`${fix(a)} + ? = 1`, b, 'Make the hundredths up to 10, then the tenths up to 1.', `${fix(a)} + ${b} = 1`, { keys: ['.'] })
  }
  const total = { 1: 10, 2: 20, 3: 100, 4: 1000 }[level]
  const a = level === 4 ? int(r, 1, 99) * 10 : int(r, 0, total)
  const b = total - a
  const hints = {
    1: 'Use your fingers: hold up the first number, how many are down?',
    2: 'Find the bond to 10 first, then add another 10.',
    3: 'Make the ones up to the next 10, then count on in 10s to 100.',
    4: 'Think of it as tens: what goes with ' + a / 10 + ' to make 100?',
  }
  return r() < 0.5
    ? num(`${a} + ? = ${total}`, b, hints[level], `${a} + ${b} = ${total}`)
    : num(`${total} − ${a} = ?`, b, hints[level], `${a} and ${b} are a bond to ${total}`)
}

function add(r, level) {
  let a, b, dp = 0
  if (level === 1) [a, b] = [int(r, 1, 10), int(r, 1, 10)]
  else if (level === 2) [a, b] = [int(r, 11, 89), int(r, 2, 9)]
  else if (level === 3) [a, b] = [int(r, 11, 89), int(r, 11, 89)]
  else if (level === 4) [a, b] = [int(r, 101, 899), int(r, 101, 899)]
  else if (r() < 0.5) [a, b] = [int(r, 1001, 8999), int(r, 101, 4999)]
  else [a, b, dp] = [int(r, 11, 199) / 10, int(r, 11, 199) / 10, 1]
  const s = dp ? fix(a + b) : a + b
  const tens = Math.floor(b / 10) * 10
  const explain =
    level >= 2 && level <= 3 && tens
      ? `${a} + ${tens} = ${a + tens}, then + ${b - tens} = ${s}`
      : `${dp ? fix(a) : a} + ${dp ? fix(b) : b} = ${s}`
  const hint =
    level === 1
      ? 'Start with the bigger number and count on.'
      : level <= 3
        ? 'Split the second number into tens and ones. Add the tens first.'
        : 'Line up the place values. Start with the ones and carry when you make 10.'
  return num(`${dp ? fix(a) : a} + ${dp ? fix(b) : b} = ?`, s, hint, explain, dp ? { keys: ['.'] } : {})
}

function sub(r, level) {
  let a, b, dp = 0
  if (level === 1) { a = int(r, 2, 20); b = int(r, 1, Math.min(a, 10)) }
  else if (level === 2) { a = int(r, 20, 99); b = int(r, 2, 9) }
  else if (level === 3) { a = int(r, 40, 99); b = int(r, 11, a - 5) }
  else if (level === 4) { a = int(r, 300, 999); b = int(r, 101, a - 50) }
  else if (r() < 0.5) { a = int(r, 2000, 9999); b = int(r, 101, a - 100) }
  else { a = int(r, 50, 200) / 10; b = int(r, 11, a * 10 - 1) / 10; dp = 1 }
  const d = dp ? fix(a - b) : a - b
  const A = dp ? fix(a) : a, B = dp ? fix(b) : b
  const hint =
    level === 1
      ? 'Count back, or count on from the smaller number.'
      : level <= 3
        ? `Count on from ${B} to ${A}, or take away the tens then the ones.`
        : 'Line up the place values. If the top digit is smaller, exchange from the next column.'
  const explain = level <= 3 && !dp ? `Count on: ${B} + ${d} = ${A}` : `${A} − ${B} = ${d}`
  return num(`${A} − ${B} = ?`, d, hint, explain, dp ? { keys: ['.'] } : {})
}

function div(r, level) {
  if (level <= 3) {
    const pool = level === 1 ? [2, 5, 10] : level === 2 ? [2, 3, 4, 5, 10] : [3, 4, 6, 7, 8, 9]
    const d = pick(r, pool)
    const q = int(r, 1, 12)
    return num(`${d * q} ÷ ${d} = ?`, q, `How many ${d}s fit into ${d * q}? Use your ${d} times table.`, `${q} × ${d} = ${d * q}`)
  }
  if (level === 4) {
    const d = int(r, 2, 9)
    const q = int(r, 11, 30)
    return num(`${d * q} ÷ ${d} = ?`, q, `Split ${d * q} into a multiple of ${d * 10} and the rest.`, `${d * 10} ÷ ${d} = 10, ${d * q - d * 10} ÷ ${d} = ${q - 10}, so ${q}`)
  }
  const d = int(r, 3, 9)
  const q = int(r, 11, 40)
  const rem = int(r, 1, d - 1)
  const n = d * q + rem
  return num(
    `${n} ÷ ${d} = ?  (use r for remainder)`,
    `${q}r${rem}`,
    `${d} × ${q} is close. How much is left over?`,
    `${d} × ${q} = ${d * q}, with ${rem} left over: ${q} r ${rem}`,
    { keys: ['r'], check: 'remainder' },
  )
}

function doubles(r, level) {
  const halve = r() < 0.5
  if (level === 5) {
    const n = int(r, 11, 99) / 10
    return halve
      ? num(`Half of ${fix(n * 2)} = ?`, fix(n), 'Halve the whole part, then the decimal part.', `${fix(n)} + ${fix(n)} = ${fix(n * 2)}`, { keys: ['.'] })
      : num(`Double ${fix(n)} = ?`, fix(n * 2), 'Double the whole part, then the tenths.', `${fix(n)} + ${fix(n)} = ${fix(n * 2)}`, { keys: ['.'] })
  }
  const max = { 1: 10, 2: 50, 3: 100, 4: 500 }[level]
  const n = level === 4 ? int(r, 11, 49) * 10 + int(r, 0, 9) : int(r, 1, max)
  const split = n >= 10 ? `Split it: ${Math.floor(n / 10) * 10} and ${n % 10}.` : 'Add it to itself.'
  return halve
    ? num(`Half of ${n * 2} = ?`, n, n >= 10 ? 'Halve the tens, then halve the ones.' : 'Share it into 2 equal groups.', `${n} + ${n} = ${n * 2}`)
    : num(`Double ${n} = ?`, n * 2, split, `${n} + ${n} = ${n * 2}`)
}

function place(r, level) {
  if (level === 1) {
    const n = int(r, 11, 99)
    const t = int(r, 0, 2)
    if (t === 0) return num(`How many tens are in ${n}?`, Math.floor(n / 10), 'The tens digit is on the left.', `${n} = ${Math.floor(n / 10)} tens and ${n % 10} ones`)
    if (t === 1) return num(`What is 1 more than ${n}?`, n + 1, 'Count on one.', `${n} + 1 = ${n + 1}`)
    return num(`What is 10 less than ${n}?`, n - 10, 'The tens digit goes down by one.', `${n} − 10 = ${n - 10}`)
  }
  if (level <= 3) {
    const digits = level === 2 ? 3 : 4
    const n = int(r, 10 ** (digits - 1), 10 ** digits - 1)
    const s = String(n)
    const i = int(r, 0, digits - 1)
    const d = s[i]
    const value = Number(d) * 10 ** (digits - 1 - i)
    if (d === '0' || s.indexOf(d) !== i) return place(r, level)
    if (r() < 0.3) return num(`What is ${level === 2 ? 10 : 100} more than ${n}?`, n + (level === 2 ? 10 : 100), 'Only one digit changes (unless it goes past 9).', `${n} + ${level === 2 ? 10 : 100} = ${n + (level === 2 ? 10 : 100)}`)
    const names = ['ones', 'tens', 'hundreds', 'thousands']
    return num(`What is the value of the ${d} in ${n}?`, value, 'Which column is it in? Ones, tens, hundreds or thousands?', `The ${d} is in the ${names[digits - 1 - i]} column, so it is worth ${value}`)
  }
  const p = pick(r, [10, 100, 1000])
  if (level === 4) {
    const n = int(r, 2, 99)
    return r() < 0.5
      ? num(`${n} × ${p} = ?`, n * p, `Multiplying by ${p} moves every digit ${String(p).length - 1} place(s) left.`, `${n} × ${p} = ${n * p}`)
      : num(`${n * p} ÷ ${p} = ?`, n, `Dividing by ${p} moves every digit ${String(p).length - 1} place(s) right.`, `${n * p} ÷ ${p} = ${n}`)
  }
  const n = int(r, 11, 999) / 10
  const q = pick(r, [10, 100])
  return r() < 0.5
    ? num(`${fix(n)} × ${q} = ?`, fix(n * q), `Move each digit ${q === 10 ? 'one place' : 'two places'} to the left.`, `${fix(n)} × ${q} = ${fix(n * q)}`, { keys: ['.'] })
    : num(`${fix(n)} ÷ ${q} = ?`, fix(n / q, 4), `Move each digit ${q === 10 ? 'one place' : 'two places'} to the right.`, `${fix(n)} ÷ ${q} = ${fix(n / q, 4)}`, { keys: ['.'] })
}

function round(r, level) {
  const roundTo = (n, to) => Math.round(n / to) * to
  const hint = 'Look at the digit to the right. 5 or more, round up. 4 or less, round down.'
  if (level === 5) {
    const n = int(r, 101, 9999) / 100
    return r() < 0.5
      ? num(`Round ${n.toFixed(2)} to the nearest whole number`, Math.round(n), 'Look at the tenths digit.', `${n.toFixed(2)} → ${Math.round(n)}`)
      : num(`Round ${n.toFixed(2)} to 1 decimal place`, fix(Math.round(n * 10) / 10, 1), 'Look at the hundredths digit.', `${n.toFixed(2)} → ${(Math.round(n * 10) / 10).toFixed(1)}`, { keys: ['.'] })
  }
  const cfg = { 1: [11, 99, 10], 2: [101, 999, 10], 3: [101, 999, 100], 4: [1001, 9999, pick(r, [100, 1000])] }[level]
  const n = int(r, cfg[0], cfg[1])
  if (n % cfg[2] === 0) return round(r, level)
  const a = roundTo(n, cfg[2])
  return num(`Round ${n} to the nearest ${cfg[2]}`, a, hint, `${n} is between ${Math.floor(n / cfg[2]) * cfg[2]} and ${Math.ceil(n / cfg[2]) * cfg[2]}. It is closer to ${a}`)
}

function fractions(r, level) {
  if (level === 1) {
    const [f, d] = pick(r, [['half', 2], ['quarter', 4]])
    const n = int(r, 1, 10) * d
    return num(`What is a ${f} of ${n}?`, n / d, `Share ${n} into ${d} equal groups.`, `${n} ÷ ${d} = ${n / d}`)
  }
  if (level === 2) {
    const d = pick(r, [2, 3, 4, 5, 10])
    const n = d * int(r, 2, 10)
    return num(`What is 1/${d} of ${n}?`, n / d, `Divide by the bottom number (${d}).`, `${n} ÷ ${d} = ${n / d}`)
  }
  if (level === 3) {
    const d = pick(r, [3, 4, 5, 8, 10])
    const top = int(r, 2, d - 1)
    const n = d * int(r, 2, 10)
    return num(`What is ${top}/${d} of ${n}?`, (n / d) * top, `Find 1/${d} first (divide by ${d}), then multiply by ${top}.`, `${n} ÷ ${d} = ${n / d}, × ${top} = ${(n / d) * top}`)
  }
  if (level === 4) {
    const d = pick(r, [2, 3, 4, 5])
    const top = int(r, 1, d - 1)
    const k = int(r, 2, 5)
    if (r() < 0.5) return num(`${top}/${d} = ?/${d * k}`, top * k, `The bottom was multiplied by ${k}. Do the same to the top.`, `${top} × ${k} = ${top * k}, ${d} × ${k} = ${d * k}`)
    const g = gcd(top, d)
    return num(`Simplify ${top * k}/${d * k}`, `${top / g}/${d / g}`, `Divide top and bottom by the same number (try ${k}).`, `÷ ${k}: ${top * k}/${d * k} = ${top / g}/${d / g}`, { keys: ['/'], check: 'fraction', simplest: true })
  }
  // level 5: adding fractions
  const d = pick(r, [4, 5, 6, 8, 10, 12])
  const a = int(r, 1, d - 2)
  const b = int(r, 1, d - a - 1)
  if (r() < 0.5) {
    return num(`${a}/${d} + ${b}/${d} = ?`, `${a + b}/${d}`, 'Same bottom number? Just add the tops.', `${a} + ${b} = ${a + b}, so ${a + b}/${d}`, { keys: ['/'], check: 'fraction' })
  }
  const d1 = pick(r, [2, 3, 4])
  const d2 = d1 * 2
  const x = int(r, 1, d1 - 1)
  const y = int(r, 1, d2 - 1)
  return num(`${x}/${d1} + ${y}/${d2} = ?`, `${x * 2 + y}/${d2}`, `Change ${x}/${d1} into ${d2}ths first.`, `${x}/${d1} = ${x * 2}/${d2}, + ${y}/${d2} = ${x * 2 + y}/${d2}`, { keys: ['/'], check: 'fraction' })
}

function decimals(r, level) {
  if (level === 1) {
    const n = int(r, 1, 9)
    return r() < 0.5
      ? num(`Write ${n} tenths as a decimal`, fix(n / 10), '1 tenth is 0.1', `${n}/10 = ${fix(n / 10)}`, { keys: ['.'] })
      : num(`${n}/10 as a decimal = ?`, fix(n / 10), 'Tenths go straight after the decimal point.', `${n}/10 = ${fix(n / 10)}`, { keys: ['.'] })
  }
  if (level === 2) {
    const a = int(r, 1, 8), b = int(r, 1, 9 - a)
    return num(`0.${a} + 0.${b} = ?`, fix((a + b) / 10), `${a} tenths + ${b} tenths`, `${a} + ${b} = ${a + b} tenths = ${fix((a + b) / 10)}`, { keys: ['.'] })
  }
  if (level === 3) {
    const [f, dec] = pick(r, [['1/2', '0.5'], ['1/4', '0.25'], ['3/4', '0.75'], ['1/10', '0.1'], ['1/5', '0.2'], ['2/5', '0.4'], ['1/100', '0.01']])
    return num(`Write ${f} as a decimal`, dec, 'Think about money: what is that fraction of £1?', `${f} = ${dec}`, { keys: ['.'] })
  }
  if (level === 4) {
    const p = pick(r, [10, 25, 50])
    const n = pick(r, [20, 40, 60, 80, 100, 120, 200, 240, 400])
    return num(`What is ${p}% of ${n}?`, (n * p) / 100, p === 10 ? 'Divide by 10.' : p === 50 ? 'Find half.' : 'Find a quarter: halve it, then halve again.', `${p}% of ${n} = ${(n * p) / 100}`)
  }
  const p = pick(r, [5, 15, 20, 30, 75])
  const n = pick(r, [20, 40, 60, 80, 120, 200, 300])
  return num(`What is ${p}% of ${n}?`, fix((n * p) / 100), 'Find 10% (÷10), then build up the percentage you need.', `10% of ${n} = ${n / 10}, so ${p}% = ${fix((n * p) / 100)}`, { keys: ['.'] })
}

function moneyQ(r, level) {
  if (level === 1) {
    const coins = [1, 2, 5, 10, 20]
    const set = [pick(r, coins), pick(r, coins), pick(r, coins)].sort((a, b) => b - a)
    const t = set.reduce((a, b) => a + b, 0)
    return num(`${set.map((c) => c + 'p').join(' + ')} = ?p`, t, 'Start with the biggest coin and count on.', `${set.join(' + ')} = ${t}p`, { unit: 'p' })
  }
  if (level === 2) {
    const cost = int(r, 1, 19) * 5
    return num(`You buy a sweet for ${cost}p and pay with £1. How much change, in pence?`, 100 - cost, `Count on from ${cost}p to 100p.`, `${cost} + ${100 - cost} = 100`, { unit: 'p' })
  }
  if (level === 3) {
    const a = int(r, 105, 495) / 100, b = int(r, 105, 495) / 100
    return num(`${pounds(a)} + ${pounds(b)} = £?`, money(a + b), 'Add the pounds, then the pence. 100p makes £1.', `${pounds(a)} + ${pounds(b)} = ${pounds(a + b)}`, { keys: ['.'], unit: '£' })
  }
  if (level === 4) {
    const note = pick(r, [5, 10, 20])
    const cost = int(r, 100, note * 100 - 5) / 100
    return num(`Something costs ${pounds(cost)}. You pay with a £${note} note. Change = £?`, money(note - cost), `Count on to the next pound, then up to £${note}.`, `${pounds(cost)} + ${pounds(note - cost)} = £${note}.00`, { keys: ['.'], unit: '£' })
  }
  const each = pick(r, [0.25, 0.45, 0.6, 0.75, 1.2, 1.25, 1.5, 2.35, 3.99])
  const k = int(r, 2, 6)
  const item = pick(r, ['pencils', 'cookies', 'stickers', 'apples', 'comics'])
  return num(`${k} ${item} cost ${pounds(each)} each. Total = £?`, money(each * k), each === 3.99 ? 'Round to £4, then take off the extra pennies.' : 'Multiply the pence, then turn it back into pounds.', `${k} × ${pounds(each)} = ${pounds(each * k)}`, { keys: ['.'], unit: '£' })
}

function time(r, level) {
  if (level === 1) {
    if (r() < 0.6) {
      const h = int(r, 1, 12), m = pick(r, [0, 30])
      return num('What time does the clock show?', `${h}:${m ? '30' : '00'}`, 'The short hand points to the hour. The long hand at 6 means half past.', `${m ? 'Half past ' + h : h + " o'clock"} = ${h}:${m ? '30' : '00'}`, { keys: [':'], check: 'time', visual: { type: 'clock', h, m } })
    }
    const [q, a] = pick(r, [['How many days in a week?', 7], ['How many months in a year?', 12], ['How many minutes in an hour?', 60], ['How many hours in a day?', 24], ['How many seconds in a minute?', 60]])
    return num(q, a, 'Think about your calendar or clock.', `${q.replace('How many ', '').replace('?', '')}: ${a}`)
  }
  if (level === 2) {
    const h = int(r, 1, 12), m = pick(r, [0, 15, 30, 45])
    return num('What time does the clock show?', `${h}:${String(m).padStart(2, '0')}`, 'Long hand at 3 = quarter past (:15), 6 = half past (:30), 9 = quarter to (:45).', `${h}:${String(m).padStart(2, '0')}`, { keys: [':'], check: 'time', visual: { type: 'clock', h, m } })
  }
  if (level === 3) {
    if (r() < 0.5) {
      const h = int(r, 1, 12), m = int(r, 0, 11) * 5
      return num('What time does the clock show?', `${h}:${String(m).padStart(2, '0')}`, 'Count the long hand in 5s from the 12.', `${h}:${String(m).padStart(2, '0')}`, { keys: [':'], check: 'time', visual: { type: 'clock', h, m } })
    }
    const start = int(r, 12, 140) * 5, add = int(r, 1, 11) * 5
    return num(`What time is it ${add} minutes after ${fmt12(start)}?`, fmt12(start + add), 'Count on to the next o\'clock, then the rest.', `${fmt12(start)} + ${add} min = ${fmt12(start + add)}`, { keys: [':'], check: 'time' })
  }
  if (level === 4) {
    if (r() < 0.5) {
      const h = int(r, 1, 11), m = int(r, 0, 11) * 5
      const t = `${h}:${String(m).padStart(2, '0')} pm`
      return num(`Write ${t} in 24-hour time`, fmtTime((h + 12) * 60 + m), 'For pm times, add 12 to the hour.', `${h} + 12 = ${h + 12}, so ${fmtTime((h + 12) * 60 + m)}`, { keys: [':'], check: 'time' })
    }
    const start = int(r, 96, 250) * 5, mins = int(r, 7, 20) * 5
    return num(`A film starts at ${fmtTime(start)} and lasts ${mins} minutes. When does it end?`, fmtTime(start + mins), 'Split the minutes: go to the next hour first.', `${fmtTime(start)} + ${mins} min = ${fmtTime(start + mins)}`, { keys: [':'], check: 'time' })
  }
  const a = int(r, 96, 200) * 5, b = a + int(r, 7, 40) * 5
  return num(`How many minutes from ${fmtTime(a)} to ${fmtTime(b)}?`, b - a, 'Count on to the next o\'clock, then in whole hours, then the rest.', `${fmtTime(a)} → ${fmtTime(b)} = ${b - a} minutes`)
}

function measure(r, level) {
  const conv = [
    ['m', 'cm', 100], ['kg', 'g', 1000], ['l', 'ml', 1000], ['km', 'm', 1000], ['cm', 'mm', 10],
  ]
  if (level === 1) {
    const [big, small, k] = pick(r, conv)
    return num(`How many ${small} in 1 ${big}?`, k, `Remember: 1 ${big} = ? ${small}`, `1 ${big} = ${k} ${small}`)
  }
  if (level <= 3) {
    const [big, small, k] = pick(r, level === 2 ? conv.slice(0, 1).concat(conv.slice(4)) : conv)
    const n = int(r, 2, 9)
    return r() < 0.5
      ? num(`${n} ${big} = ? ${small}`, n * k, `1 ${big} = ${k} ${small}, so multiply by ${k}.`, `${n} × ${k} = ${n * k}`)
      : num(`${n * k} ${small} = ? ${big}`, n, `Divide by ${k}.`, `${n * k} ÷ ${k} = ${n}`)
  }
  const [big, small, k] = pick(r, conv.slice(0, 4))
  const n = int(r, 11, 99) / (level === 4 ? 10 : 4)
  const v = Number(n.toFixed(2))
  return r() < 0.5
    ? num(`${fix(v)} ${big} = ? ${small}`, fix(v * k), `Multiply by ${k}: move the digits ${String(k).length - 1} places left.`, `${fix(v)} × ${k} = ${fix(v * k)}`, { keys: ['.'] })
    : num(`${fix(v * k)} ${small} = ? ${big}`, fix(v), `Divide by ${k}.`, `${fix(v * k)} ÷ ${k} = ${fix(v)}`, { keys: ['.'] })
}

const SHAPES = [
  ['triangle', 3], ['square', 4], ['pentagon', 5], ['hexagon', 6], ['heptagon', 7], ['octagon', 8],
]

function shape(r, level) {
  if (level === 1) {
    const [name, sides] = pick(r, SHAPES.slice(0, 4))
    return num('How many sides does this shape have?', sides, 'Touch each side as you count.', `A ${name} has ${sides} sides`, { visual: { type: 'polygon', sides } })
  }
  if (level === 2) {
    const [name, sides] = pick(r, SHAPES)
    const wrong = shuffle(r, SHAPES.filter((s) => s[0] !== name)).slice(0, 3).map((s) => s[0])
    return choice(r, `Which shape has ${sides} sides?`, name, wrong, 'Hex = 6, pent = 5, oct = 8 (like an octopus!).', `A ${name} has ${sides} sides`)
  }
  if (level === 3) {
    const t = int(r, 0, 2)
    if (t === 0) return num('How many degrees in a right angle?', 90, 'Think of the corner of a book.', 'A right angle is 90°')
    if (t === 1) {
      const w = int(r, 2, 12), h = int(r, 2, 12)
      return num(`A rectangle is ${w} cm by ${h} cm. What is its perimeter (cm)?`, 2 * (w + h), 'Perimeter is the distance all the way round: add all 4 sides.', `${w} + ${h} + ${w} + ${h} = ${2 * (w + h)} cm`)
    }
    return num('How many degrees in a full turn?', 360, 'Four right angles make a full turn.', '4 × 90° = 360°')
  }
  if (level === 4) {
    if (r() < 0.5) {
      const a = int(r, 30, 80), b = int(r, 30, 100)
      return num(`Two angles in a triangle are ${a}° and ${b}°. What is the third?`, 180 - a - b, 'Angles in a triangle add up to 180°.', `180 − ${a} − ${b} = ${180 - a - b}°`)
    }
    const w = int(r, 2, 12), h = int(r, 2, 12)
    return num(`A rectangle is ${w} cm by ${h} cm. What is its area (cm²)?`, w * h, 'Area = length × width.', `${w} × ${h} = ${w * h} cm²`)
  }
  const t = int(r, 0, 2)
  if (t === 0) {
    const a = int(r, 20, 160)
    return num(`Angles on a straight line: one is ${a}°. What is the other?`, 180 - a, 'Angles on a straight line add to 180°.', `180 − ${a} = ${180 - a}°`)
  }
  if (t === 1) {
    const a = int(r, 50, 150), b = int(r, 50, 150)
    return num(`Angles around a point: ${a}°, ${b}° and ?°`, 360 - a - b, 'Angles around a point add to 360°.', `360 − ${a} − ${b} = ${360 - a - b}°`)
  }
  const s = int(r, 3, 15)
  return num(`A square has a perimeter of ${s * 4} cm. How long is one side?`, s, 'A square has 4 equal sides.', `${s * 4} ÷ 4 = ${s} cm`)
}

function missing(r, level) {
  if (level === 1) {
    const a = int(r, 1, 9), b = int(r, 1, 10)
    return num(`? + ${a} = ${a + b}`, b, `Count on from ${a} to ${a + b}.`, `${b} + ${a} = ${a + b}`)
  }
  if (level === 2) {
    const a = int(r, 2, 30), b = int(r, 5, 50)
    return num(`? − ${a} = ${b}`, a + b, 'Work backwards: add instead of take away.', `${b} + ${a} = ${a + b}`)
  }
  if (level === 3) {
    const a = int(r, 2, 12), b = int(r, 2, 12)
    return num(`${a} × ? = ${a * b}`, b, `Which number in the ${a} times table?`, `${a} × ${b} = ${a * b}`)
  }
  if (level === 4) {
    const a = int(r, 2, 9), n = int(r, 2, 12), c = int(r, 1, 20)
    return num(`${a} × ? + ${c} = ${a * n + c}`, n, `Undo the + ${c} first, then the × ${a}.`, `${a * n + c} − ${c} = ${a * n}, ÷ ${a} = ${n}`)
  }
  if (r() < 0.5) {
    const a = int(r, 2, 9), b = int(r, 2, 9), c = int(r, 2, 20)
    return num(`${c} + ${a} × ${b} = ?`, c + a * b, 'Multiply before you add (BIDMAS / BODMAS).', `${a} × ${b} = ${a * b}, + ${c} = ${c + a * b}`)
  }
  const a = int(r, 2, 6), n = int(r, 2, 15), c = int(r, 1, 15)
  return num(`${a}n + ${c} = ${a * n + c}. What is n?`, n, `Take away ${c}, then divide by ${a}.`, `${a * n + c} − ${c} = ${a * n}, ÷ ${a} = ${n}`)
}

function patterns(r, level) {
  let start, step
  if (level === 1) { step = pick(r, [1, 2, 5, 10]); start = step * int(r, 0, 5) }
  else if (level === 2) { step = pick(r, [3, 4, -2, -5, -10]); start = Math.abs(step) * int(r, 4, 10) }
  else if (level === 3) { step = pick(r, [25, 50, 100, -3, -4, 6]); start = Math.abs(step) * int(r, 2, 10) }
  else if (level === 4) { step = pick(r, [-3, -4, -5, -6]); start = int(r, 2, 8) }
  else {
    const kind = int(r, 0, 2)
    if (kind === 0) {
      const s = int(r, 1, 5)
      const seq = [s, s + 1, s + 2, s + 3].map((n) => n * n)
      return num(`${seq.join(', ')}, ?`, (s + 4) ** 2, 'These are square numbers: 1×1, 2×2, 3×3…', `${s + 4} × ${s + 4} = ${(s + 4) ** 2}`)
    }
    if (kind === 1) {
      const s = int(r, 1, 6)
      const seq = [s, s * 2, s * 4, s * 8]
      return num(`${seq.join(', ')}, ?`, s * 16, 'Each number is double the one before.', `${s * 8} × 2 = ${s * 16}`)
    }
    const s = int(r, 1, 3)
    const seq = [0, 1, 2, 3].map((i) => s + (i * (i + 1)) / 2)
    return num(`${seq.join(', ')}, ?`, s + 10, 'Look at the gaps: they go up by one more each time.', 'Gaps: +1, +2, +3, so next is +4')
  }
  const seq = [0, 1, 2, 3].map((i) => start + i * step)
  const nxt = start + 4 * step
  const neg = seq.some((n) => n < 0) || nxt < 0
  return num(`${seq.join(', ')}, ?`, nxt, 'What is the gap between each number?', `The pattern goes ${step > 0 ? 'up' : 'down'} by ${Math.abs(step)} each time`, neg ? { keys: ['-'] } : {})
}

function negatives(r, level) {
  const keys = { keys: ['-'] }
  if (level === 1) {
    const t = int(r, 1, 6), f = int(r, t + 1, t + 6)
    return num(`It is ${t}°C. The temperature falls by ${f} degrees. What is it now?`, t - f, 'Count down past zero on a number line.', `${t} − ${f} = ${t - f}°C`, keys)
  }
  if (level === 2) {
    const a = -int(r, 1, 8), b = int(r, 1, 9)
    return num(`How many degrees from ${a}°C to ${b}°C?`, b - a, 'Count up to 0, then on to the top number.', `${-a} up to 0, then ${b} more = ${b - a}`)
  }
  if (level === 3) {
    const a = -int(r, 2, 12), b = int(r, 1, 15)
    return num(`${a} + ${b} = ?`, a + b, 'Start at the negative number and count up.', `${a} + ${b} = ${a + b}`, keys)
  }
  if (level === 4) {
    const a = int(r, -10, 5), b = int(r, 3, 12)
    return num(`${a} − ${b} = ?`, a - b, 'Taking away moves you down the number line.', `${a} − ${b} = ${a - b}`, keys)
  }
  const a = -int(r, 5, 25), b = int(r, 5, 30)
  return num(`What is the difference between ${a} and ${b}?`, b - a, 'Distance to zero, plus the distance from zero.', `${-a} + ${b} = ${b - a}`)
}

function words(r, level) {
  const name = pick(r, NAMES)
  const t = int(r, 0, 3)
  if (level <= 2) {
    const a = int(r, 3, level === 1 ? 10 : 40), b = int(r, 2, level === 1 ? 10 : 30)
    if (t === 0) return num(`${name} has ${a} stickers and gets ${b} more. How many now?`, a + b, '"More" means add.', `${a} + ${b} = ${a + b}`)
    if (t === 1 && a > b) return num(`${name} had ${a} sweets and ate ${b}. How many are left?`, a - b, '"Left" means take away.', `${a} − ${b} = ${a - b}`)
    const g = int(r, 2, 5), e = int(r, 2, level === 1 ? 5 : 10)
    return num(`There are ${g} bags with ${e} apples in each. How many apples?`, g * e, 'Equal groups means multiply.', `${g} × ${e} = ${g * e}`)
  }
  if (level <= 4) {
    if (t === 0) {
      const k = int(r, 3, 9), q = int(r, 3, level === 3 ? 10 : 25)
      return num(`${k * q} children get into teams of ${k}. How many teams?`, q, 'Sharing into equal groups means divide.', `${k * q} ÷ ${k} = ${q}`)
    }
    if (t === 1) {
      const p = int(r, 120, 480), s = int(r, 30, p - 20)
      return num(`A book has ${p} pages. ${name} has read ${s}. How many pages are left?`, p - s, 'Find the difference.', `${p} − ${s} = ${p - s}`)
    }
    if (t === 2) {
      const per = int(r, 12, 35), d = int(r, 3, 7)
      return num(`${name} reads ${per} pages a day for ${d} days. How many pages?`, per * d, 'Multiply pages by days.', `${per} × ${d} = ${per * d}`)
    }
    const s = int(r, 4, 9), c = int(r, 3, 6)
    return num(`A box holds ${s} cupcakes. How many boxes for ${s * c + int(r, 1, s - 1)} cupcakes so none are left out?`, c + 1, 'Divide, then think: do the leftovers need another box?', `You need ${c} full boxes and 1 more for the leftovers = ${c + 1}`)
  }
  if (t === 0) {
    const price = pick(r, [12, 15, 18, 24, 30]), pct = pick(r, [10, 20, 25, 50])
    return num(`A game costs £${price}. It is ${pct}% off. What does it cost now (£)?`, fix(price * (1 - pct / 100)), `Find ${pct}% of £${price}, then take it away.`, `${pct}% of ${price} = ${fix((price * pct) / 100)}, ${price} − ${fix((price * pct) / 100)} = ${fix(price * (1 - pct / 100))}`, { keys: ['.'] })
  }
  if (t === 1) {
    const a = int(r, 2, 5), b = int(r, 2, 5), total = (a + b) * int(r, 2, 8)
    return num(`${name} shares ${total} marbles in the ratio ${a}:${b}. How many in the bigger share?`, (total / (a + b)) * Math.max(a, b), `There are ${a + b} parts altogether. Find one part first.`, `${total} ÷ ${a + b} = ${total / (a + b)}, × ${Math.max(a, b)} = ${(total / (a + b)) * Math.max(a, b)}`)
  }
  if (t === 2) {
    const sp = pick(r, [30, 40, 50, 60]), h = int(r, 2, 5)
    return num(`A car travels at ${sp} mph for ${h} hours. How many miles?`, sp * h, 'Miles = speed × hours.', `${sp} × ${h} = ${sp * h}`)
  }
  const n = [int(r, 2, 10), int(r, 2, 10), int(r, 2, 10), int(r, 2, 10)]
  n[3] += (4 - (n.reduce((a, b) => a + b, 0) % 4)) % 4
  const sum = n.reduce((a, b) => a + b, 0)
  return num(`What is the mean (average) of ${n.join(', ')}?`, sum / 4, 'Add them all up, then divide by how many there are.', `${n.join(' + ')} = ${sum}, ÷ 4 = ${sum / 4}`)
}

// ---------------------------------------------------------------------------

export const TOPICS = [
  { id: 'bonds', name: 'Number bonds', emoji: '🤝', color: 'from-pink-400 to-rose-500', minYear: 0, gen: bonds, chapter: 'ch6' },
  { id: 'add', name: 'Adding', emoji: '➕', color: 'from-emerald-400 to-green-600', minYear: 0, gen: add, chapter: 'ch6' },
  { id: 'sub', name: 'Taking away', emoji: '➖', color: 'from-sky-400 to-blue-600', minYear: 1, gen: sub, chapter: 'ch7' },
  { id: 'tables', name: 'Times tables', emoji: '✖️', color: 'from-violet-400 to-purple-600', minYear: 1, gen: tables, chapter: 'ch8' },
  { id: 'div', name: 'Dividing', emoji: '➗', color: 'from-amber-400 to-orange-500', minYear: 2, gen: div, chapter: 'ch10' },
  { id: 'doubles', name: 'Double & half', emoji: '👯', color: 'from-fuchsia-400 to-pink-600', minYear: 1, gen: doubles, chapter: 'ch6' },
  { id: 'place', name: 'Place value', emoji: '🏠', color: 'from-teal-400 to-cyan-600', minYear: 1, gen: place, chapter: 'ch5' },
  { id: 'round', name: 'Rounding', emoji: '🎯', color: 'from-lime-400 to-green-500', minYear: 3, gen: round, chapter: 'ch5' },
  { id: 'fractions', name: 'Fractions', emoji: '🍕', color: 'from-orange-400 to-red-500', minYear: 1, gen: fractions, chapter: 'ch11' },
  { id: 'decimals', name: 'Decimals & %', emoji: '💯', color: 'from-indigo-400 to-blue-600', minYear: 4, gen: decimals, chapter: 'ch11' },
  { id: 'money', name: 'Money', emoji: '🪙', color: 'from-yellow-400 to-amber-500', minYear: 1, gen: moneyQ, chapter: 'ch2' },
  { id: 'time', name: 'Time', emoji: '⏰', color: 'from-cyan-400 to-sky-600', minYear: 1, gen: time, chapter: 'ch13' },
  { id: 'measure', name: 'Measuring', emoji: '📏', color: 'from-green-400 to-emerald-600', minYear: 2, gen: measure, chapter: 'ch13' },
  { id: 'shape', name: 'Shapes & angles', emoji: '🔷', color: 'from-blue-400 to-indigo-600', minYear: 0, gen: shape, chapter: 'ch12' },
  { id: 'missing', name: 'Missing numbers', emoji: '🕵️', color: 'from-slate-400 to-slate-600', minYear: 1, gen: missing, chapter: 'ch16' },
  { id: 'patterns', name: 'Patterns', emoji: '🔁', color: 'from-rose-400 to-red-500', minYear: 0, gen: patterns, chapter: 'ch16' },
  { id: 'negatives', name: 'Negative numbers', emoji: '🥶', color: 'from-blue-300 to-cyan-500', minYear: 4, gen: negatives, chapter: 'ch5' },
  { id: 'words', name: 'Word problems', emoji: '📖', color: 'from-purple-400 to-fuchsia-600', minYear: 1, gen: words, chapter: 'ch16' },
]

export const TOPIC_BY_ID = Object.fromEntries(TOPICS.map((t) => [t.id, t]))

export function makeQuestion(topicId, level, r = Math.random, opts = {}) {
  const topic = TOPIC_BY_ID[topicId]
  const lv = Math.max(1, Math.min(5, level))
  // A few generators retry on unlucky numbers; guard against odd results.
  for (let i = 0; i < 20; i++) {
    const q = topic.gen(r, lv, opts)
    if (q && q.answer !== 'NaN' && q.answer !== '') return { ...q, topic: topicId, level: lv }
  }
  return { ...topic.gen(r, 1, opts), topic: topicId, level: 1 }
}

// ---------------------------------------------------------------------------
// Answer checking

const cleanNum = (s) => String(s).replace(/[−–]/g, '-').replace(/[£p,\s°a-qs-z²]/gi, '')

function parseFraction(s) {
  const m = cleanNum(s).match(/^(-?\d+)\/(\d+)$/)
  return m ? [Number(m[1]), Number(m[2])] : null
}

function parseTime(s) {
  const m = cleanNum(s).replace('.', ':').match(/^(\d{1,2}):(\d{2})$/)
  return m ? Number(m[1]) * 60 + Number(m[2]) : null
}

export function checkAnswer(q, input) {
  if (input == null || String(input).trim() === '') return false
  if (q.kind === 'choice') return String(input) === q.answer
  const a = cleanNum(input).toLowerCase()
  const e = cleanNum(q.answer).toLowerCase()
  if (a === e) return true
  if (q.check === 'fraction') {
    const x = parseFraction(a), y = parseFraction(e)
    if (!x || !y || x[1] === 0) return false
    if (q.simplest) return x[0] === y[0] && x[1] === y[1]
    return x[0] * y[1] === y[0] * x[1]
  }
  if (q.check === 'time') {
    const x = parseTime(a), y = parseTime(e)
    return x != null && x === y
  }
  if (q.check === 'remainder') return a.replace(/r/g, 'r') === e
  const x = Number(a), y = Number(e)
  return a !== '' && !Number.isNaN(x) && Math.abs(x - y) < 1e-9
}
