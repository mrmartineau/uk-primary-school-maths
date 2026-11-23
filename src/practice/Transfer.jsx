import { Show, createResource, createSignal } from 'solid-js'
import { BigButton, Card } from './components'
import { decodeTransfer, encodeTransfer, qrSvg, transferLink } from './transfer'
import { BADGES, importData, state, totalPoints } from './store'
import { sfx } from './sound'

const YEARS = ['Reception', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6']

function summary(data) {
  const days = Object.entries(data.days || {}).filter(([, d]) => d.total || d.points)
  const points = days.reduce((a, [, d]) => a + (d.points || 0), 0)
  const last = days.map(([k]) => k).sort().pop()
  return {
    name: data.profile?.name || 'No name',
    year: YEARS[data.profile?.year] ?? '',
    points,
    badges: Object.keys(data.badges || {}).filter((id) => BADGES.some((b) => b.id === id)).length,
    topics: Object.keys(data.topics || {}).length,
    rewards: (data.rewards || []).length,
    last: last ? new Date(last).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) : 'never',
  }
}

function Summary(props) {
  const s = () => summary(props.data)
  return (
    <div class="grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
      <div class="rounded-2xl bg-violet-50 p-2 dark:bg-white/5"><div class="text-2xl font-black">{s().points}</div><div class="text-xs font-bold text-slate-500">points</div></div>
      <div class="rounded-2xl bg-violet-50 p-2 dark:bg-white/5"><div class="text-2xl font-black">{s().badges}</div><div class="text-xs font-bold text-slate-500">badges</div></div>
      <div class="rounded-2xl bg-violet-50 p-2 dark:bg-white/5"><div class="text-2xl font-black">{s().topics}</div><div class="text-xs font-bold text-slate-500">topics tried</div></div>
      <div class="rounded-2xl bg-violet-50 p-2 dark:bg-white/5"><div class="text-2xl font-black">{s().rewards}</div><div class="text-xs font-bold text-slate-500">rewards set</div></div>
    </div>
  )
}

/** Opened from a transfer link on the new device */
export function Import(props) {
  const [data] = createResource(() => props.code, (code) => decodeTransfer(code))
  const [done, setDone] = createSignal(false)
  const here = () => (state.profile.setup ? { points: totalPoints(), name: state.profile.name } : null)
  const accept = () => {
    importData(JSON.stringify(data()))
    sfx.finish()
    setDone(true)
  }
  return (
    <div class="safe-top safe-x safe-bottom mx-auto grid min-h-dvh max-w-lg grid-cols-1 content-center gap-4 py-6">
      <div class="text-center">
        <div class="text-6xl">📲</div>
        <h1 class="mt-2 text-3xl font-black">Move progress here</h1>
      </div>
      <Show when={!data.loading} fallback={<Card class="text-center font-bold">Opening the transfer link…</Card>}>
        <Show
          when={!data.error && data()}
          fallback={
            <Card class="text-center">
              <p class="font-black">Sorry, that link didn’t work.</p>
              <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">It may have been cut short when it was copied. Make a new one in 👪 Grown-ups on the old device. This browser might also be too old to unpack it.</p>
              <BigButton class="mt-4 w-full" onClick={props.onDone}>OK</BigButton>
            </Card>
          }
        >
          <Show
            when={!done()}
            fallback={
              <Card class="pop-in text-center">
                <p class="text-2xl font-black">All moved! 🎉</p>
                <p class="mt-1 font-semibold">Welcome back, {state.profile.name || 'friend'}.</p>
                <BigButton class="mt-4 w-full" color="bg-emerald-500" onClick={props.onDone}>Let’s go 🚀</BigButton>
              </Card>
            }
          >
            <Card>
              <p class="text-center text-xl font-black">{summary(data()).name}{summary(data()).year ? ` · ${summary(data()).year}` : ''}</p>
              <p class="mb-3 text-center text-sm font-semibold text-slate-500">Last practised {summary(data()).last}</p>
              <Summary data={data()} />
            </Card>
            <Show when={here()}>
              <Card class="bg-amber-50 dark:bg-amber-500/10">
                <p class="font-bold">
                  ⚠️ This device already has progress for <b>{here().name || 'someone'}</b> ({here().points} points). It will be replaced.
                </p>
              </Card>
            </Show>
            <div class="grid grid-cols-2 gap-3">
              <BigButton color="bg-slate-400" onClick={props.onDone}>Cancel</BigButton>
              <BigButton color="bg-emerald-500" onClick={accept}>Use it here ✓</BigButton>
            </div>
          </Show>
        </Show>
      </Show>
    </div>
  )
}

/** Grown-ups card: make a link / QR code that carries the progress */
export function TransferCard() {
  const [link, setLink] = createSignal('')
  const [qr, setQr] = createSignal(null)
  const [msg, setMsg] = createSignal('')
  const [qrLite, setQrLite] = createSignal(false)
  const make = async () => {
    sfx.tap()
    const url = transferLink(await encodeTransfer(state))
    setLink(url)
    let code = qrSvg(url)
    setQrLite(false)
    if (!code) {
      // Too much for a QR code: make a lighter one without saved mistakes and game history
      code = qrSvg(transferLink(await encodeTransfer(state, true)))
      setQrLite(!!code)
    }
    setQr(code)
    setMsg('')
    return url
  }
  const share = async () => {
    const url = link() || (await make())
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Maths Quest progress', text: `Open this on the new device to move ${state.profile.name || 'your'}’s Maths Quest progress.`, url })
        return
      } catch { /* cancelled or unavailable: fall back to copying */ }
    }
    try {
      await navigator.clipboard.writeText(url)
      setMsg('Link copied ✅ Paste it into a message or email to yourself.')
    } catch {
      window.prompt('Copy this link:', url)
    }
  }
  return (
    <Card>
      <p class="font-black">Move to another device 📲</p>
      <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">
        Make a link holding all the points, levels, badges, rewards and settings. Open it on the new iPad or iPhone (AirDrop, Messages or email it to yourself), or scan the QR code with the new device’s camera.
      </p>
      <div class="mt-3 flex flex-wrap gap-2">
        <BigButton color="bg-violet-600" class="text-base" onClick={share}>📤 Share transfer link</BigButton>
        <Show when={!qr()}>
          <BigButton color="bg-sky-500" class="text-base" onClick={make}>🔳 Show QR code</BigButton>
        </Show>
      </div>
      <Show when={msg()}><p class="mt-2 font-bold">{msg()}</p></Show>
      <Show when={link()}>
        <Show
          when={qr()}
          fallback={<p class="mt-3 text-sm font-semibold text-amber-700 dark:text-amber-300">There’s too much progress to fit in a QR code, so use “Share transfer link” instead.</p>}
        >
          <div class="mt-3 flex flex-col items-center gap-2">
            <svg viewBox={`0 0 ${qr().size} ${qr().size}`} class="h-64 w-64 rounded-xl bg-white p-1 sm:h-72 sm:w-72" shape-rendering="crispEdges" role="img" aria-label="QR code for the transfer link">
              <rect width={qr().size} height={qr().size} fill="white" />
              <path d={qr().d} fill="black" />
            </svg>
            <p class="text-center text-xs font-semibold text-slate-500">Point the new device’s camera at this, then tap the link that pops up.</p>
            <Show when={qrLite()}>
              <p class="text-center text-xs font-semibold text-amber-700 dark:text-amber-300">To fit in a QR code, this leaves out saved mistakes and game history. Use “Share transfer link” to keep everything.</p>
            </Show>
          </div>
        </Show>
        <p class="mt-2 text-xs text-slate-500">This is a snapshot of right now. Anyone with the link can see the progress, so only send it to yourself. Older history beyond the last 20 games isn’t included.</p>
      </Show>
    </Card>
  )
}
