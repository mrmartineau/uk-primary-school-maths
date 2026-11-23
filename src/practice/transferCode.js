// Move progress between devices with a link (or QR code) that carries the
// data itself, compressed. Nothing is uploaded anywhere: the link is the data.

import { encode } from 'uqr'

const toB64url = (bytes) => {
  let s = ''
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
const fromB64url = (str) => {
  const s = atob(str.replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from(s, (c) => c.charCodeAt(0))
}

async function pipe(bytes, stream) {
  const out = new Blob([bytes]).stream().pipeThrough(stream)
  return new Uint8Array(await new Response(out).arrayBuffer())
}

/** Keep the link short: drop history that isn't needed to carry on.
 *  Days older than 9 weeks are folded into one entry, so total points stay
 *  exact while the weekly chart, streaks and goal still have what they need.
 *  `lite` also drops saved mistakes and game history (for QR codes). */
export function slim(state, lite = false) {
  const s = JSON.parse(JSON.stringify(state))
  const cutoff = new Date(Date.now() - 63 * 86400000).toISOString().slice(0, 10)
  const days = Object.entries(s.days || {}).sort(([a], [b]) => a.localeCompare(b))
  const old = days.filter(([k]) => k < cutoff)
  if (old.length > 1) {
    const sum = old.reduce((a, [, d]) => ({ points: a.points + (d.points || 0), correct: a.correct + (d.correct || 0), total: a.total + (d.total || 0) }), { points: 0, correct: 0, total: 0 })
    s.days = Object.fromEntries([[old[0][0], sum], ...days.filter(([k]) => k >= cutoff)])
  }
  s.sessions = (s.sessions || []).slice(0, lite ? 3 : 20)
  s.mistakes = (s.mistakes || []).slice(0, lite ? 0 : 25).map(({ text, answer, topic, level, kind, keys, check, simplest, choices, hint, explain, visual, unit, stretch, table }) => ({ text, answer, topic, level, kind, keys, check, simplest, choices, hint, explain, visual, unit, stretch, table }))
  for (const t of Object.values(s.topics || {})) t.recent = (t.recent || []).slice(-12)
  return s
}

export async function encodeTransfer(state, lite = false) {
  const json = new TextEncoder().encode(JSON.stringify(slim(state, lite)))
  if (typeof CompressionStream !== 'undefined') {
    try {
      return 'z' + toB64url(await pipe(json, new CompressionStream('deflate-raw')))
    } catch { /* fall through */ }
  }
  return 'j' + toB64url(json)
}

export async function decodeTransfer(code) {
  const kind = code[0]
  const bytes = fromB64url(code.slice(1))
  let json
  if (kind === 'z') json = await pipe(bytes, new DecompressionStream('deflate-raw'))
  else if (kind === 'j') json = bytes
  else throw new Error('Unknown transfer code')
  const data = JSON.parse(new TextDecoder().decode(json))
  if (!data?.profile) throw new Error('Not Maths Quest progress')
  return data
}

export const transferLink = (code) => `${location.origin}${location.pathname}#/import/${code}`

/** QR code as an SVG path string, or null if the link is too long to scan comfortably */
export function qrSvg(text) {
  if (text.length > 2200) return null
  try {
    const { data, size } = encode(text, { ecc: 'L', border: 2 })
    let d = ''
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (data[y][x]) d += `M${x} ${y}h1v1h-1z`
    return { d, size }
  } catch {
    return null
  }
}
