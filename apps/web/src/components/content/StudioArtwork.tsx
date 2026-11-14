export function StudioArtwork({ variant = 0 }: { variant?: number }) {
  const palettes = [['#ede4ff', '#7c3aed', '#f6ab74', '#76cdd4'], ['#e0f4f6', '#16879b', '#bfa3f5', '#ffc077'], ['#fff0e3', '#e17635', '#9ec7ec', '#b7a2e7']];
  const colors = palettes[variant % palettes.length]!;
  return <svg viewBox="0 0 640 460" role="img" aria-label="Illustration of an artist's sketchbook with colourful abstract shapes" className="h-full w-full">
    <rect width="640" height="460" fill={colors[0]} />
    <circle cx="550" cy="80" r="125" fill={colors[3]} opacity=".4" />
    <path d="M-20 390Q100 190 215 400T520 350V480H-20Z" fill={colors[2]} opacity=".5" />
    <g transform="rotate(-9 320 230)"><rect x="172" y="63" width="300" height="340" rx="12" fill="#221837" opacity=".09" transform="translate(9 10)" /><rect x="172" y="63" width="300" height="340" rx="12" fill="#fffdf7" /><path d="M204 63V403" stroke="#e2ddd3" strokeWidth="2" />
      <circle cx="340" cy="173" r="68" fill={colors[1]} opacity=".9" /><path d="M240 292Q298 190 368 285T435 260V358H240Z" fill={colors[3]} /><path d="M253 304Q304 233 353 292T427 311" fill="none" stroke="#221837" strokeWidth="3" strokeLinecap="round" /><circle cx="407" cy="112" r="19" fill={colors[2]} /><path d="M244 113L260 96M252 122L274 100" stroke={colors[2]} strokeWidth="5" strokeLinecap="round" />
    </g>
    <g transform="rotate(19 115 230)"><rect x="107" y="115" width="17" height="230" rx="4" fill={colors[1]} /><path d="M107 115L115.5 88 124 115" fill="#dfb993" /><path d="M112 100L115.5 88 119 100" fill="#221837" /><rect x="107" y="327" width="17" height="18" rx="3" fill="#f2a7ba" /></g>
    <g transform="rotate(-25 520 300)"><rect x="513" y="222" width="13" height="160" rx="5" fill="#c68d5e" /><rect x="510" y="203" width="19" height="30" rx="3" fill="#bcc4d6" /><path d="M510 205Q506 165 520 157Q536 180 529 205Z" fill={colors[1]} /></g>
    <path d="M509 111L520 91 531 111 520 131Z" fill={colors[1]} opacity=".65" /><circle cx="98" cy="372" r="8" fill={colors[1]} opacity=".6" />
  </svg>;
}
