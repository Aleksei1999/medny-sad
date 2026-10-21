const NAV = [
  { href: '#about', label: 'О проекте' },
  { href: '#flats', label: 'Квартиры' },
  { href: '#location', label: 'Локация' },
  { href: '#progress', label: 'Ход строительства' },
];

export function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-30 bg-gradient-to-b from-night/70 to-transparent">
      <div className="mx-auto flex h-20 max-w-[1600px] items-center justify-between px-4 md:px-10">
        <a href="#top" className="flex items-center gap-3">
          <Mark />
          <span className="leading-none">
            <span className="display block text-[22px] tracking-[0.18em]">Медный сад</span>
            <span className="eyebrow mt-1 block text-[9px] text-cream/60">жилой комплекс</span>
          </span>
        </a>

        <nav className="hidden items-center gap-9 lg:flex">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className="eyebrow text-cream/75 transition-colors hover:text-cream">
              {n.label}
            </a>
          ))}
        </nav>

        <a
          href="#contact"
          className="eyebrow rounded-full border border-cream/40 px-5 py-3 transition-colors hover:border-copper hover:bg-copper hover:text-night"
        >
          <span className="hidden sm:inline">Записаться на показ</span>
          <span className="sm:hidden">Показ</span>
        </a>
      </div>
    </header>
  );
}

// три лепестка — как башни комплекса
function Mark() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden className="text-copper">
      <path d="M15 27C11 21 10.5 11 15 3c4.5 8 4 18 0 24Z" stroke="currentColor" strokeWidth="1.2" />
      <path d="M13.5 27C8 23.5 4.5 16 5.5 8.5c5 3.5 8 10 8 18.5Z" stroke="currentColor" strokeWidth="1.2" />
      <path d="M16.5 27c5.5-3.5 9-11 8-18.5-5 3.5-8 10-8 18.5Z" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}
