import { For, Show, createMemo, createSignal, onCleanup, onMount } from 'solid-js'
import { Bar, BigButton, Clock, Confetti, Keypad, Polygon, useBurst } from './components'
import { checkAnswer, TOPIC_BY_ID } from './questions'
import { buildQuestions, nextQuestion, pointsFor } from './session'
import { recordAnswer } from './store'
import { sfx } from './sound'

const PRAISE = ['Brilliant!', 'Super!', 'Yes!', 'Awesome!', 'Nailed it!', 'Spot on!', 'Fantastic!', 'Wow!']
const ENCOURAGE = ['Nearly! Have a hint 👇', 'Not quite. Try again!', 'Good try! Look at the hint.']

export default function Quiz(props) {
  const cfg = props.config
  const isBlitz = cfg.mode === 'blitz'
  const [questions, setQuestions] = createSignal(isBlitz ? [nextQuestion(cfg)] : buildQuestions(cfg))
  const [i, setI] = createSignal(0)
  const [value, setValue] = createSignal('')
  const [phase, setPhase] = createSignal('ask') // ask | retry | right | reveal
  const [msg, setMsg] = createSignal('')
  const [shake, setShake] = createSignal(0)
  const [gain, setGain] = createSignal(null)
  const [burst, fire] = useBurst()
  const [levelMsg, setLevelMsg] = createSignal('')
  const [timeLeft, setTimeLeft] = createSignal(cfg.seconds || 0)

  let streak = 0
  const stats = { correct: 0, total: 0, points: 0, bestStreak: 0, wrong: [], levelUps: [] }
  const q = createMemo(() => questions()[i()])
  const topic = createMemo(() => TOPIC_BY_ID[q()?.topic])
  let timer
  let advanceTimer

  if (!questions().length) queueMicrotask(() => props.onDone(stats))

  onMount(() => {
    if (isBlitz) {
      timer = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(timer)
            finish()
            return 0
          }
          return t - 1
        })
      }, 1000)
    }
  })
  onCleanup(() => { clearInterval(timer); clearTimeout(advanceTimer) })

  let finished = false
  function finish() {
    if (finished) return
    finished = true
    clearTimeout(advanceTimer)
    props.onDone(stats)
  }

  function next() {
    clearTimeout(advanceTimer)
    setValue('')
    setMsg('')
    setGain(null)
    setLevelMsg('')
    if (isBlitz) {
      if (finished) return
      setQuestions((qs) => [...qs, nextQuestion(cfg)])
      setI((n) => n + 1)
      setPhase('ask')
      return
    }
    if (i() + 1 >= questions().length) return finish()
    setI((n) => n + 1)
    setPhase('ask')
  }

  function submit(answer) {
    const p = phase()
    if (p === 'right' || p === 'reveal') return
    const ans = answer ?? value()
    if (!ans) return
    const ok = checkAnswer(q(), ans)
    const firstTry = p === 'ask'
    if (ok) {
      streak += 1
      stats.bestStreak = Math.max(stats.bestStreak, streak)
      stats.correct += firstTry ? 1 : 0
      stats.total += 1
      const pts = pointsFor(q(), { firstTry, streak: firstTry ? streak : 0 })
      stats.points += pts
      const { levelChange } = recordAnswer(q(), true, pts, firstTry)
      if (levelChange > 0) {
        stats.levelUps.push(q().topic)
        setLevelMsg(`🚀 Level up! ${topic().name} is now level ${q().level + 1}`)
        sfx.levelUp()
      } else sfx.correct()
      setGain(pts)
      setMsg(firstTry ? PRAISE[Math.floor(Math.random() * PRAISE.length)] : 'You got there! 💪')
      setPhase('right')
      fire()
      advanceTimer = setTimeout(next, isBlitz ? 500 : levelChange > 0 ? 1800 : 1000)
    } else {
      sfx.wrong()
      setShake((n) => n + 1)
      streak = 0
      if (firstTry && !isBlitz) {
        setMsg(ENCOURAGE[Math.floor(Math.random() * ENCOURAGE.length)])
        setValue('')
        setPhase('retry')
      } else {
        stats.total += 1
        stats.wrong.push(q())
        const { levelChange } = recordAnswer(q(), false, 0, false)
        if (levelChange < 0) setLevelMsg(`We'll make ${topic().name} a bit easier for a while 🙂`)
        setMsg('Here’s how it works:')
        setPhase('reveal')
        if (isBlitz) advanceTimer = setTimeout(next, 1400)
      }
    }
  }

  const progress = () => (isBlitz ? timeLeft() / cfg.seconds : i() / questions().length)

  return (
    <div class="mx-auto flex min-h-[calc(100dvh-2rem)] w-full max-w-3xl flex-col gap-2.5 sm:gap-3">
      <div class="flex items-center gap-3">
        <button type="button" class="btn-3d grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-xl dark:bg-white/10" aria-label="Stop" onClick={() => (stats.total ? finish() : props.onQuit())}>
          ✕
        </button>
        <Bar value={progress()} color={isBlitz && timeLeft() <= 10 ? 'bg-gradient-to-r from-rose-400 to-red-600' : undefined} />
        <div class="shrink-0 rounded-full bg-white px-3 py-1.5 text-sm font-black text-violet-800 dark:bg-white/10 dark:text-violet-100">
          {isBlitz ? `⏱️ ${timeLeft()}s` : `${Math.min(i() + 1, questions().length)}/${questions().length}`}
        </div>
      </div>

      <Show when={q()}>
        <div class="relative flex flex-1 flex-col gap-3 md:flex-row md:items-stretch">
          {/* Question card */}
          <div
            class={`relative flex flex-1 flex-col items-center justify-center gap-2 overflow-hidden rounded-3xl bg-gradient-to-br p-4 pt-9 text-center sm:gap-3 sm:p-5 sm:pt-10 text-white shadow-lg ${topic().color}`}
          >
            <div class="absolute left-4 top-3 flex items-center gap-2 text-sm font-bold opacity-90">
              <span>{topic().emoji}</span> {topic().name} · L{q().level}
            </div>
            <Show when={isBlitz}>
              <div class="absolute right-4 top-3 text-sm font-black">✅ {stats.correct}</div>
            </Show>
            <div class="rounded-3xl bg-white/95 p-1.5 empty:hidden">
              <Show when={q().visual?.type === 'clock'}><Clock h={q().visual.h} m={q().visual.m} /></Show>
              <Show when={q().visual?.type === 'polygon'}><Polygon sides={q().visual.sides} /></Show>
            </div>
            <p class={`text-balance font-black leading-tight drop-shadow-sm ${q().text.length > 40 ? 'text-xl sm:text-3xl' : q().text.length > 22 ? 'text-3xl sm:text-4xl' : 'text-4xl sm:text-5xl'}`}>
              {q().text}
            </p>

            <Show when={q().kind === 'number'}>
              <Show keyed when={shake() + 1}>
                <div
                  class={`min-h-14 min-w-40 rounded-2xl bg-white/95 px-5 py-1.5 text-4xl font-black text-violet-900 shadow-inner sm:text-5xl ${shake() ? 'shake' : ''}`}
                  aria-live="polite"
                >
                  {q().unit === '£' ? '£' : ''}
                  {(phase() === 'reveal' ? q().answer : value()).replace(/-/g, '−') || <span class="opacity-30">?</span>}
                  {q().unit === 'p' ? 'p' : ''}
                </div>
              </Show>
            </Show>

            <Show when={gain()}>
              <div class="float-up pointer-events-none absolute right-6 top-1/3 text-4xl font-black text-yellow-200 drop-shadow">+{gain()}</div>
            </Show>
          </div>

          {/* Answer area */}
          <div class="flex flex-col justify-end gap-2 md:w-80 sm:gap-3 lg:w-[26rem]">
            <Show when={msg()}>
              <div
                class={`pop-in rounded-2xl px-3 py-2 text-center font-bold ${phase() === 'right' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-100' : phase() === 'reveal' ? 'bg-sky-100 text-sky-900 dark:bg-sky-500/20 dark:text-sky-100' : 'bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-100'}`}
              >
                <div>{msg()}</div>
                <Show when={phase() === 'retry'}>
                  <div class="text-sm font-semibold sm:text-base">💡 {q().hint}</div>
                </Show>
                <Show when={phase() === 'reveal'}>
                  <div class="text-sm font-semibold sm:text-base">{q().explain}</div>
                  <div class="text-sm opacity-80">Answer: {q().answer.replace(/-/g, '−')}</div>
                </Show>
                <Show when={levelMsg()}>
                  <div class="text-sm">{levelMsg()}</div>
                </Show>
              </div>
            </Show>

            <Show
              when={phase() !== 'reveal' || isBlitz}
              fallback={
                <BigButton class="w-full" color="bg-sky-500" onClick={next}>
                  Got it, next ➜
                </BigButton>
              }
            >
              <Show
                when={q().kind === 'choice'}
                fallback={<Keypad value={value()} onInput={setValue} onSubmit={() => submit()} keys={q().keys} disabled={phase() === 'right' || phase() === 'reveal'} />}
              >
                <div class="grid grid-cols-2 gap-3">
                  <For each={q().choices}>
                    {(c) => (
                      <button
                        type="button"
                        disabled={phase() === 'right'}
                        onClick={() => submit(c)}
                        class="btn-3d min-h-16 rounded-2xl bg-white px-3 py-4 text-xl font-black capitalize text-violet-900 dark:bg-violet-950 dark:text-violet-100"
                      >
                        {c}
                      </button>
                    )}
                  </For>
                </div>
              </Show>
              <Show when={phase() === 'ask' && !isBlitz}>
                <button type="button" class="py-1 text-sm font-bold text-violet-700 underline-offset-4 hover:underline dark:text-violet-200" onClick={() => { sfx.tap(); setMsg('Here’s a hint:'); setPhase('retry') }}>
                  💡 I need a hint
                </button>
              </Show>
              <Show when={phase() === 'retry'}>
                <button type="button" class="py-1 text-sm font-bold text-violet-700 underline-offset-4 hover:underline dark:text-violet-200" onClick={() => submit('__skip__')}>
                  Show me the answer
                </button>
              </Show>
            </Show>
          </div>

          <Show keyed when={burst()}>
            <Confetti />
          </Show>
        </div>
      </Show>
    </div>
  )
}
