// Aylena: elfia wróżka narysowana w SVG, z delikatną animacją (oddech, mruganie, blask kryształu).

export default function Aylena({ speaking = false, size = 260 }: { speaking?: boolean; size?: number }) {
  return (
    <svg
      className={`aylena ${speaking ? 'is-speaking' : ''}`}
      viewBox="0 0 300 380"
      width={size}
      height={(size * 380) / 300}
      role="img"
      aria-label="Aylena, elfia wróżka"
    >
      <defs>
        <radialGradient id="ay-halo" cx="50%" cy="38%" r="55%">
          <stop offset="0%" stopColor="#e8cf8a" stopOpacity="0.55" />
          <stop offset="55%" stopColor="#c9a24a" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#c9a24a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ay-cloak" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4a2f1b" />
          <stop offset="100%" stopColor="#1f130a" />
        </linearGradient>
        <linearGradient id="ay-cloak-in" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2a3a2a" />
          <stop offset="100%" stopColor="#141c14" />
        </linearGradient>
        <linearGradient id="ay-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f1dc9c" />
          <stop offset="50%" stopColor="#c9a24a" />
          <stop offset="100%" stopColor="#8a6a26" />
        </linearGradient>
        <linearGradient id="ay-hair" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#efe3c4" />
          <stop offset="100%" stopColor="#c9b789" />
        </linearGradient>
        <radialGradient id="ay-skin" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#f8efdf" />
          <stop offset="100%" stopColor="#e3cfae" />
        </radialGradient>
        <radialGradient id="ay-orb" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="35%" stopColor="#f1dc9c" />
          <stop offset="75%" stopColor="#c9a24a" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#6b4f1c" stopOpacity="0.7" />
        </radialGradient>
        <radialGradient id="ay-orb-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f1dc9c" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#f1dc9c" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="150" cy="150" r="150" fill="url(#ay-halo)" className="ay-halo" />

      {/* runiczny krąg za postacią */}
      <g className="ay-runes" fill="none" stroke="#c9a24a" strokeOpacity="0.35">
        <circle cx="150" cy="140" r="118" strokeWidth="1" />
        <circle cx="150" cy="140" r="108" strokeWidth="0.6" strokeDasharray="2 7" />
      </g>

      <g className="ay-body">
        {/* płaszcz */}
        <path d="M150 62 C95 62 70 120 68 170 C64 240 40 300 20 380 L280 380 C260 300 236 240 232 170 C230 120 205 62 150 62 Z" fill="url(#ay-cloak)" />
        {/* złoty brzeg kaptura */}
        <path d="M150 66 C102 66 80 118 80 168 C80 200 90 222 104 238 L196 238 C210 222 220 200 220 168 C220 118 198 66 150 66 Z" fill="url(#ay-cloak-in)" stroke="url(#ay-gold)" strokeWidth="3" />

        {/* włosy za twarzą */}
        <path d="M112 128 C100 170 98 220 108 268 L130 262 C122 220 124 170 132 132 Z" fill="url(#ay-hair)" />
        <path d="M188 128 C200 170 202 220 192 268 L170 262 C178 220 176 170 168 132 Z" fill="url(#ay-hair)" />

        {/* szyja i dekolt sukni */}
        <path d="M138 196 L162 196 L166 232 L134 232 Z" fill="#e6d3b3" />
        <path d="M104 238 C120 226 136 232 150 246 C164 232 180 226 196 238 L214 380 L86 380 Z" fill="#3a2414" />
        <path d="M120 240 L150 262 L180 240" fill="none" stroke="url(#ay-gold)" strokeWidth="2.5" />
        <circle cx="150" cy="266" r="6" fill="url(#ay-gold)" />

        {/* uszy elfie */}
        <path d="M116 150 L92 122 L118 168 Z" fill="url(#ay-skin)" stroke="#d6bf98" strokeWidth="1" />
        <path d="M184 150 L208 122 L182 168 Z" fill="url(#ay-skin)" stroke="#d6bf98" strokeWidth="1" />

        {/* twarz */}
        <ellipse cx="150" cy="156" rx="35" ry="45" fill="url(#ay-skin)" />
        {/* grzywka */}
        <path d="M114 140 C118 104 140 96 150 96 C160 96 182 104 186 140 C176 124 162 114 150 114 C138 114 124 124 114 140 Z" fill="url(#ay-hair)" />

        {/* diadem */}
        <path d="M118 124 C132 116 168 116 182 124" fill="none" stroke="url(#ay-gold)" strokeWidth="2.5" />
        <path d="M150 112 L156 122 L150 132 L144 122 Z" fill="#6fa8a0" stroke="url(#ay-gold)" strokeWidth="1.5" className="ay-gem" />

        {/* oczy */}
        <g className="ay-eyes">
          <path d="M128 152 Q136 145 144 152 Q136 157 128 152 Z" fill="#fffaf0" />
          <path d="M156 152 Q164 145 172 152 Q164 157 156 152 Z" fill="#fffaf0" />
          <circle cx="136" cy="152" r="3.6" fill="#9c7a2e" />
          <circle cx="164" cy="152" r="3.6" fill="#9c7a2e" />
          <circle cx="136" cy="152" r="1.6" fill="#2b1b10" />
          <circle cx="164" cy="152" r="1.6" fill="#2b1b10" />
          <circle cx="137.2" cy="150.8" r="0.9" fill="#fff" />
          <circle cx="165.2" cy="150.8" r="0.9" fill="#fff" />
        </g>
        <path d="M126 146 Q136 140 145 145" fill="none" stroke="#8a6f4a" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M155 145 Q164 140 174 146" fill="none" stroke="#8a6f4a" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M150 158 Q148 168 151 172" fill="none" stroke="#c9ab84" strokeWidth="1.2" strokeLinecap="round" />
        <path className="ay-mouth" d="M141 182 Q150 187 159 182" fill="none" stroke="#a5645a" strokeWidth="2" strokeLinecap="round" />

        {/* dłonie i kryształ */}
        <circle cx="150" cy="318" r="46" fill="url(#ay-orb-glow)" className="ay-orb-glow" />
        <path d="M104 340 C112 318 126 312 134 322 L130 344 Z" fill="#e6d3b3" />
        <path d="M196 340 C188 318 174 312 166 322 L170 344 Z" fill="#e6d3b3" />
        <circle cx="150" cy="316" r="24" fill="url(#ay-orb)" className="ay-orb" />
        <path d="M137 304 Q143 298 150 300" fill="none" stroke="#fff" strokeOpacity="0.8" strokeWidth="2" strokeLinecap="round" />
        <path d="M120 344 L180 344 L172 356 L128 356 Z" fill="url(#ay-gold)" />
      </g>

      {/* iskry */}
      <g className="ay-sparks" fill="#f1dc9c">
        <circle cx="120" cy="300" r="1.6" />
        <circle cx="178" cy="296" r="1.2" />
        <circle cx="160" cy="286" r="1.8" />
        <circle cx="136" cy="290" r="1.1" />
        <circle cx="190" cy="310" r="1.4" />
      </g>
    </svg>
  )
}
