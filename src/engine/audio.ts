// Dźwięki komnaty generowane w przeglądarce (Web Audio), bez plików nagrań:
// cichy szum ognia z trzaskami, ciepły bordunowy akord oraz efekty kart i dzwonków.
// Przeglądarki pozwalają grać dopiero po geście użytkownika, więc kontekst budzi się przy pierwszym kliknięciu.

let ctx: AudioContext | null = null
let master: GainNode | null = null
let fx: GainNode | null = null
let ambientBus: GainNode | null = null
let noise: AudioBuffer | null = null
let ambientNodes: { stop: () => void } | null = null

const state = { effects: true, ambient: true, volume: 0.7 }

function ensure(): AudioContext | null {
  if (ctx) return ctx
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AC) return null
  ctx = new AC()
  master = ctx.createGain()
  master.gain.value = state.volume
  master.connect(ctx.destination)
  fx = ctx.createGain()
  fx.connect(master)
  ambientBus = ctx.createGain()
  ambientBus.gain.value = 0
  ambientBus.connect(master)
  // dwie sekundy szumu: źródło szelestu kart i trzasków ognia
  noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate)
  const d = noise.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  return ctx
}

/** Wywoływane przy pierwszej interakcji: uruchamia dźwięk zgodnie z ustawieniami */
export function unlockAudio() {
  const c = ensure()
  if (!c) return
  if (c.state === 'suspended') void c.resume()
  syncAmbient()
}

export function configureAudio(opts: { effects: boolean; ambient: boolean; volume: number }) {
  Object.assign(state, opts)
  if (master && ctx) master.gain.setTargetAtTime(state.volume, ctx.currentTime, 0.1)
  syncAmbient()
}

export function audioAvailable() {
  return 'AudioContext' in window || 'webkitAudioContext' in window
}

// ── Tło: ogień i bordun ──

function startAmbient() {
  const c = ctx!
  const out = ambientBus!
  const nodes: AudioScheduledSourceNode[] = []

  // ciepły akord (d, a, d1, f1) przez łagodny filtr, z powolnym „oddechem”
  const pad = c.createGain()
  pad.gain.value = 0.06
  const lp = c.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 700
  lp.Q.value = 0.4
  pad.connect(lp).connect(out)
  ;[73.42, 110, 146.83, 174.61].forEach((f, i) => {
    for (const det of [-4, 4]) {
      const o = c.createOscillator()
      o.type = i === 0 ? 'sine' : 'triangle'
      o.frequency.value = f
      o.detune.value = det
      const g = c.createGain()
      g.gain.value = i === 0 ? 0.6 : 0.28
      o.connect(g).connect(pad)
      o.start()
      nodes.push(o)
    }
  })
  const lfo = c.createOscillator()
  lfo.frequency.value = 0.07
  const lfoGain = c.createGain()
  lfoGain.gain.value = 0.025
  lfo.connect(lfoGain).connect(pad.gain)
  lfo.start()
  nodes.push(lfo)
  const lfo2 = c.createOscillator()
  lfo2.frequency.value = 0.045
  const lfo2Gain = c.createGain()
  lfo2Gain.gain.value = 260
  lfo2.connect(lfo2Gain).connect(lp.frequency)
  lfo2.start()
  nodes.push(lfo2)

  // szum ognia w kominku
  const fire = c.createBufferSource()
  fire.buffer = noise
  fire.loop = true
  const fireLp = c.createBiquadFilter()
  fireLp.type = 'lowpass'
  fireLp.frequency.value = 380
  const fireGain = c.createGain()
  fireGain.gain.value = 0.05
  fire.connect(fireLp).connect(fireGain).connect(out)
  fire.start()
  nodes.push(fire)

  // trzaski drewna w losowych chwilach
  let timer = 0
  const crackle = () => {
    const t = c.currentTime
    const n = 1 + Math.floor(Math.random() * 3)
    for (let k = 0; k < n; k++) {
      const s = c.createBufferSource()
      s.buffer = noise
      const bp = c.createBiquadFilter()
      bp.type = 'bandpass'
      bp.frequency.value = 1500 + Math.random() * 3500
      bp.Q.value = 1.5
      const g = c.createGain()
      const at = t + k * (0.03 + Math.random() * 0.08)
      g.gain.setValueAtTime(0, at)
      g.gain.linearRampToValueAtTime(0.12 + Math.random() * 0.18, at + 0.002)
      g.gain.exponentialRampToValueAtTime(0.0001, at + 0.03 + Math.random() * 0.05)
      s.connect(bp).connect(g).connect(out)
      s.start(at, Math.random() * 1.5, 0.12)
    }
    timer = window.setTimeout(crackle, 250 + Math.random() * 1600)
  }
  crackle()

  out.gain.cancelScheduledValues(c.currentTime)
  out.gain.setTargetAtTime(0.9, c.currentTime, 1.5)
  return {
    stop: () => {
      clearTimeout(timer)
      out.gain.setTargetAtTime(0, c.currentTime, 0.4)
      const end = c.currentTime + 2
      nodes.forEach((n) => n.stop(end))
    },
  }
}

function syncAmbient() {
  if (!ctx || ctx.state === 'closed') return
  const want = state.ambient && state.volume > 0
  if (want && !ambientNodes) ambientNodes = startAmbient()
  else if (!want && ambientNodes) {
    ambientNodes.stop()
    ambientNodes = null
  }
}

// ── Efekty ──

function ready(): AudioContext | null {
  if (!state.effects || !ctx || ctx.state !== 'running') return null
  return ctx
}

/** szelest lecącej karty */
export function sfxDeal() {
  const c = ready()
  if (!c) return
  const t = c.currentTime
  const s = c.createBufferSource()
  s.buffer = noise
  const bp = c.createBiquadFilter()
  bp.type = 'bandpass'
  bp.Q.value = 0.9
  bp.frequency.setValueAtTime(500, t)
  bp.frequency.exponentialRampToValueAtTime(3200, t + 0.22)
  const g = c.createGain()
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(0.35, t + 0.05)
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.3)
  s.connect(bp).connect(g).connect(fx!)
  s.start(t, Math.random(), 0.35)
  // stuknięcie karty o stół
  const o = c.createOscillator()
  o.type = 'sine'
  o.frequency.setValueAtTime(180, t + 0.27)
  o.frequency.exponentialRampToValueAtTime(70, t + 0.33)
  const og = c.createGain()
  og.gain.setValueAtTime(0, t + 0.27)
  og.gain.linearRampToValueAtTime(0.25, t + 0.275)
  og.gain.exponentialRampToValueAtTime(0.001, t + 0.36)
  o.connect(og).connect(fx!)
  o.start(t + 0.27)
  o.stop(t + 0.4)
}

/** odwrócenie karty: krótki szmer i dzwonek */
export function sfxFlip(bright = true) {
  const c = ready()
  if (!c) return
  const t = c.currentTime
  const s = c.createBufferSource()
  s.buffer = noise
  const hp = c.createBiquadFilter()
  hp.type = 'highpass'
  hp.frequency.value = 2500
  const g = c.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(0.12, t + 0.08)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25)
  s.connect(hp).connect(g).connect(fx!)
  s.start(t, Math.random(), 0.3)
  bell(c, bright ? [659.25, 987.77] : [440, 523.25], t + 0.35, 0.09)
}

function bell(c: AudioContext, freqs: number[], at: number, level: number) {
  freqs.forEach((f, k) => {
    ;[1, 2.76, 5.4].forEach((ratio, j) => {
      const o = c.createOscillator()
      o.type = 'sine'
      o.frequency.value = f * ratio
      const g = c.createGain()
      const start = at + k * 0.12
      const peak = level / (j * 2 + 1)
      g.gain.setValueAtTime(0, start)
      g.gain.linearRampToValueAtTime(peak, start + 0.005)
      g.gain.exponentialRampToValueAtTime(0.0001, start + 2.4 / (j + 1))
      o.connect(g).connect(fx!)
      o.start(start)
      o.stop(start + 2.6)
    })
  })
}

/** tasowanie: seria szybkich szelestów */
export function sfxShuffle() {
  const c = ready()
  if (!c) return
  const t = c.currentTime
  for (let k = 0; k < 18; k++) {
    const s = c.createBufferSource()
    s.buffer = noise
    const bp = c.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = 2200 + Math.random() * 1500
    bp.Q.value = 2
    const g = c.createGain()
    const at = t + k * 0.045 + Math.random() * 0.01
    g.gain.setValueAtTime(0, at)
    g.gain.linearRampToValueAtTime(0.16, at + 0.004)
    g.gain.exponentialRampToValueAtTime(0.0001, at + 0.04)
    s.connect(bp).connect(g).connect(fx!)
    s.start(at, Math.random() * 1.8, 0.06)
  }
}

/** magiczny akord na koniec wróżby */
export function sfxFinale() {
  const c = ready()
  if (!c) return
  const t = c.currentTime
  ;[523.25, 659.25, 783.99, 1046.5].forEach((f, i) => bell(c, [f], t + i * 0.16, 0.05))
}

/** krótki dźwięk przycisku */
export function sfxTap() {
  const c = ready()
  if (!c) return
  bell(c, [1318.5], c.currentTime, 0.025)
}
