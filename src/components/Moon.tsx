/** Tarcza Księżyca w danej fazie (age: 0 nów, 0,5 pełnia), oświetlona z właściwej strony */
export default function Moon({ age, size = 32 }: { age: number; size?: number }) {
  const r = 15
  const c = 16
  const rx = Math.abs(Math.cos(age * 2 * Math.PI)) * r
  const waxing = age < 0.5
  const crescent = age < 0.25 || age > 0.75
  // zewnętrzny półokrąg po oświetlonej stronie, potem linia cienia jako półelipsa
  const outer = waxing ? 1 : 0
  const inner = waxing ? (crescent ? 0 : 1) : crescent ? 1 : 0
  const d = `M ${c} ${c - r} A ${r} ${r} 0 0 ${outer} ${c} ${c + r} A ${rx} ${r} 0 0 ${inner} ${c} ${c - r} Z`
  return (
    <svg className="moon" width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <defs>
        <radialGradient id="moon-lit" cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#fbf3dc" />
          <stop offset="100%" stopColor="#d9c48e" />
        </radialGradient>
      </defs>
      <circle cx={c} cy={c} r={r} fill="#2a2116" stroke="rgba(232,207,138,0.5)" strokeWidth="0.8" />
      <path d={d} fill="url(#moon-lit)" />
    </svg>
  )
}
