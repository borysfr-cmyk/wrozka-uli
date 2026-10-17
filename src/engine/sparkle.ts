// Złote iskry w miejscu odkrytej karty: krótkie, lekkie elementy DOM, które same znikają.

const GLYPHS = ['✦', '✧', '·', '✶', '⋆']

export function sparkleAt(el: Element | null, count = 18) {
  if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const r = el.getBoundingClientRect()
  const cx = r.left + r.width / 2
  const cy = r.top + r.height / 2
  const layer = document.createElement('div')
  layer.className = 'sparkle-layer'
  layer.setAttribute('aria-hidden', 'true')
  for (let i = 0; i < count; i++) {
    const s = document.createElement('span')
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4
    const dist = 40 + Math.random() * Math.max(60, r.width * 1.2)
    s.textContent = GLYPHS[i % GLYPHS.length]
    s.style.left = `${cx}px`
    s.style.top = `${cy}px`
    s.style.setProperty('--dx', `${Math.cos(angle) * dist}px`)
    s.style.setProperty('--dy', `${Math.sin(angle) * dist - 20}px`)
    s.style.setProperty('--s', `${0.6 + Math.random() * 0.9}`)
    s.style.animationDelay = `${Math.random() * 0.15}s`
    layer.appendChild(s)
  }
  // pierścień światła
  const ring = document.createElement('i')
  ring.style.left = `${cx}px`
  ring.style.top = `${cy}px`
  ring.style.width = ring.style.height = `${Math.max(r.width, r.height) * 1.6}px`
  layer.appendChild(ring)
  document.body.appendChild(layer)
  setTimeout(() => layer.remove(), 1600)
}
