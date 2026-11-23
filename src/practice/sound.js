import { state } from './store'

let ctx
function tone(freq, start, dur, type = 'sine', gain = 0.15) {
  ctx ||= new (window.AudioContext || window.webkitAudioContext)()
  if (ctx.state === 'suspended') ctx.resume()
  const o = ctx.createOscillator()
  const g = ctx.createGain()
  o.type = type
  o.frequency.value = freq
  const t = ctx.currentTime + start
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(gain, t + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g).connect(ctx.destination)
  o.start(t)
  o.stop(t + dur + 0.05)
}

const play = (fn) => () => {
  if (!state.profile.sound) return
  try { fn() } catch { /* audio unavailable */ }
}

export const sfx = {
  tap: play(() => tone(600, 0, 0.05, 'triangle', 0.05)),
  correct: play(() => { tone(660, 0, 0.12, 'triangle'); tone(990, 0.09, 0.2, 'triangle') }),
  wrong: play(() => { tone(220, 0, 0.18, 'sawtooth', 0.06); tone(180, 0.12, 0.22, 'sawtooth', 0.06) }),
  levelUp: play(() => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.22, 'triangle'))),
  finish: play(() => [784, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.11, 0.25, 'triangle'))),
}
