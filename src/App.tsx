import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { asset, useI18n } from './i18n'
import { useActiveSection, useDialogFlag, useMenu } from './hooks'
import { nowInKL, useOpenStatus } from './hours'
import { Reveal } from './Reveal'
import { BIZ, DISHES, WEEK, type Content, type DishId } from './content'

const PITCH_WA = 'https://wa.me/601151198497'
const wa = (t: string) => `https://wa.me/${BIZ.wa}?text=${encodeURIComponent(t)}`
const IDS = ['menu', 'reviews', 'reserve', 'visit', 'faq']

function WaIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.4-.5c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.1 4.9 4.3 2.4.9 2.9.8 3.4.7.5-.1 1.7-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3zM12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2z" />
    </svg>
  )
}

const Star8 = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true"><path d="M12 1l3.2 4.3 5.3-.8-.8 5.3L24 12l-4.3 3.2.8 5.3-5.3-.8L12 24l-3.2-4.3-5.3.8.8-5.3L0 12l4.3-3.2-.8-5.3 5.3.8z" /></svg>
)

function Eyebrow({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return <p className={`eyebrow ${dark ? 'text-saffron' : 'text-pom'}`}><Star8 className="h-3.5 w-3.5" />{children}</p>
}

function Logo({ small = false }: { small?: boolean }) {
  return (
    <span className="flex flex-col leading-none text-cream">
      <span className={`font-display font-bold tracking-[0.02em] ${small ? 'text-[22px]' : 'text-[30px]'}`}>Khalids</span>
      <span className={`mt-1 font-semibold uppercase tracking-[0.34em] text-saffron ${small ? 'text-[8.5px]' : 'text-[10px]'}`}>Global Kitchen</span>
    </span>
  )
}

const fmtClock = (mins: number, lang: string) => {
  const h = Math.floor(mins / 60) % 24, m = mins % 60, h12 = h % 12 || 12, mm = String(m).padStart(2, '0')
  if (lang === 'ms') return `${h12}:${mm} ${h < 12 ? 'pagi' : h < 14 ? 'tengah hari' : h < 19 ? 'petang' : 'malam'}`
  return `${h12}:${mm} ${h < 12 ? 'AM' : 'PM'}`
}

function StatusPill({ compact = false }: { compact?: boolean }) {
  const { c } = useI18n<Content>()
  const s = useOpenStatus(WEEK)
  const S = c.status
  if (!s) return <span className="status-pill"><span className="h-2 w-2 rounded-full bg-cream/40" aria-hidden />{S.checking}</span>
  return (
    <span className="status-pill" role="status">
      <span className={`relative h-2 w-2 rounded-full ${s.open ? 'bg-mint live-dot' : 'bg-pom-glow'}`} aria-hidden />
      <span className="font-semibold text-cream">{s.open ? S.open : S.closed}</span>
      {!compact && <span className="text-cream/75">· {s.open ? S.closes : S.opens}</span>}
    </span>
  )
}

function Header({ active, onMenu, menuOpen, btnRef }: { active: string; onMenu: () => void; menuOpen: boolean; btnRef: React.RefObject<HTMLButtonElement | null> }) {
  const { c, lang, setLang } = useI18n<Content>()
  return (
    <header className="sticky top-0 z-40 border-b border-cream/10 bg-char/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-5 sm:px-8">
        <a href="#top" className="tap flex items-center rounded-lg"><Logo small /></a>
        <nav aria-label={c.a11y.main} className="hidden items-center gap-7 lg:flex">
          {c.nav.map(([id, l]) => (
            <a key={id} href={`#${id}`} aria-current={active === id ? 'true' : undefined} className={`nav-link py-2 text-[15px] font-medium transition hover:text-saffron ${active === id ? 'text-saffron' : 'text-cream/85'}`}>{l}</a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <span className="hidden md:inline-flex"><StatusPill compact /></span>
          <button data-lang-toggle onClick={() => setLang(lang === 'en' ? 'ms' : 'en')} aria-label={c.langAria} className="tap rounded-full border border-cream/20 px-3 text-xs font-bold tracking-wider text-cream transition hover:border-saffron hover:text-saffron">{c.langLabel}</button>
          <a href={wa(c.waMsg)} target="_blank" rel="noopener" className="tap hidden items-center gap-2 rounded-full bg-saffron px-4 text-sm font-bold text-char transition hover:bg-cream sm:inline-flex"><WaIcon className="h-4 w-4" />{c.waCta}</a>
          <button ref={btnRef} onClick={onMenu} aria-expanded={menuOpen} aria-controls="mobile-menu" aria-label={menuOpen ? c.a11y.menuClose : c.a11y.menuOpen} className="tap grid place-items-center rounded-full border border-cream/20 lg:hidden">
            <span className="relative block h-3 w-5" aria-hidden>
              <span className={`absolute left-0 h-[2px] w-5 bg-cream transition ${menuOpen ? 'top-[5px] rotate-45' : 'top-0'}`} />
              <span className={`absolute left-0 top-[5px] h-[2px] w-5 bg-cream transition ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`absolute left-0 h-[2px] w-5 bg-cream transition ${menuOpen ? 'top-[5px] -rotate-45' : 'top-[10px]'}`} />
            </span>
          </button>
        </div>
      </div>
    </header>
  )
}

function MobileMenu({ close, active }: { close: () => void; active: string }) {
  const { c } = useI18n<Content>()
  useDialogFlag()
  return (
    <div id="mobile-menu" role="dialog" aria-modal="true" aria-label={c.a11y.mobile} className="pattern fixed inset-x-0 bottom-0 top-16 z-30 overflow-y-auto bg-char px-5 pb-10 pt-6 text-cream lg:hidden">
      <StatusPill />
      <nav aria-label={c.a11y.mobile} className="mt-6">
        <ol className="divide-y divide-cream/10 border-y border-cream/10">
          {c.nav.map(([id, l], i) => (
            <li key={id}>
              <a href={`#${id}`} onClick={close} aria-current={active === id ? 'true' : undefined} className={`flex min-h-[64px] items-center justify-between font-display text-[26px] font-bold ${active === id ? 'text-saffron' : ''}`}>
                {l}<span className="text-[13px] font-sans font-semibold text-cream/60" aria-hidden>0{i + 1}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>
      <div className="mt-8 flex flex-col gap-3">
        <a href={wa(c.waMsg)} target="_blank" rel="noopener" className="tap inline-flex items-center justify-center gap-2 rounded-full bg-saffron px-5 font-bold text-char"><WaIcon />{c.menu.askCta}</a>
        <a href={`tel:${BIZ.tel}`} className="tap inline-flex items-center justify-center rounded-full border border-cream/25 px-5 font-semibold">{c.visit.call} {BIZ.phone}</a>
      </div>
    </div>
  )
}

/** 24-hour dial: saffron arc = opening hours (11:00 → 02:00), marker = now in KL. Midnight at the top. */
function Dial() {
  const { c, lang } = useI18n<Content>()
  const [now, setNow] = useState<number | null>(null)
  useEffect(() => { const t = () => setNow(nowInKL().mins); t(); const id = window.setInterval(t, 60_000); return () => window.clearInterval(id) }, [])
  const R = 186, C = 210
  const pt = (h: number, r: number) => { const a = ((h / 24) * 360 - 90) * (Math.PI / 180); return [C + r * Math.cos(a), C + r * Math.sin(a)] }
  const [x1, y1] = pt(11, R), [x2, y2] = pt(26, R)
  const arc = `M ${x1} ${y1} A ${R} ${R} 0 1 1 ${x2} ${y2}`
  const nowPt = now === null ? null : pt(now / 60, R)
  return (
    <figure className="relative mx-auto w-full max-w-[320px] sm:max-w-[400px] lg:max-w-[470px]">
      <div className="relative aspect-square">
        <div className="absolute inset-[13%] overflow-hidden rounded-full bg-char-3 shadow-[0_30px_80px_-20px_rgba(0,0,0,.8)]">
          <picture>
            <source media="(max-width: 1023px)" srcSet={asset('images/plate-560.webp')} width={560} height={560} />
            <img src={asset('images/plate-880.webp')} width={880} height={880} alt="" fetchPriority="high" decoding="async" className="h-full w-full object-cover" />
          </picture>
        </div>
        <svg viewBox="0 0 420 420" className="absolute inset-0 h-full w-full" role="img" aria-label={c.a11y.dial}>
          <circle cx={C} cy={C} r={R} fill="none" stroke="#30241D" strokeWidth="14" />
          <path d={arc} fill="none" stroke="#E9A93B" strokeWidth="14" strokeLinecap="round" />
          {Array.from({ length: 24 }, (_, h) => { const [a, b] = pt(h, 203), [d, e] = pt(h, h % 6 === 0 ? 212 : 207); return <line key={h} x1={a} y1={b} x2={d} y2={e} stroke="#BFAE98" strokeWidth={h % 6 === 0 ? 2.5 : 1.2} opacity={h % 6 === 0 ? 0.9 : 0.5} /> })}
          {[[11, lang === 'ms' ? '11 pg' : '11 AM'], [2, lang === 'ms' ? '2 pg' : '2 AM']].map(([h, t]) => { const [x, y] = pt(h as number, R); return <g key={t}><circle cx={x} cy={y} r="17" fill="#17110E" stroke="#E9A93B" strokeWidth="2" /><text x={x} y={y + 4} textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#F7EEDD" fontFamily="Karla, sans-serif">{t}</text></g> })}
          {nowPt && <g><circle cx={nowPt[0]} cy={nowPt[1]} r="12" fill="#E0695C" opacity=".3" className="pulse" /><circle cx={nowPt[0]} cy={nowPt[1]} r="7" fill="#E0695C" stroke="#F7EEDD" strokeWidth="2.5" /></g>}
        </svg>
      </div>
      <figcaption className="mt-3 flex items-center justify-between gap-3 text-[12.5px] text-cream/75">
        <span>{now !== null && <><span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-pom-glow align-middle" aria-hidden />{fmtClock(now, lang)} {c.hero.dialNow}</>}</span>
        <span>{c.hero.photo}</span>
      </figcaption>
    </figure>
  )
}

function Hero() {
  const { c, lang } = useI18n<Content>()
  return (
    <section id="top" className="pattern relative overflow-hidden bg-char text-cream">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 pb-12 pt-10 sm:px-8 lg:grid-cols-12 lg:items-center lg:pb-16 lg:pt-16">
        <div className="lg:col-span-7">
          <Eyebrow dark>{c.hero.eyebrow}</Eyebrow>
          <div className="mt-5"><StatusPill /></div>
          <h1 className={`mt-6 font-display font-bold leading-[1.02] tracking-[-0.01em] ${lang === 'ms' ? 'text-[clamp(2.35rem,7.6vw,5rem)]' : 'text-[clamp(2.5rem,8vw,5.4rem)]'}`}>
            <span className="block">{c.hero.h1a}</span><span className="block text-saffron">{c.hero.h1b}</span>
          </h1>
          <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-cream/85 sm:text-[18px]">{c.hero.sub}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#reserve" className="tap inline-flex items-center justify-center gap-2 rounded-full bg-saffron px-7 text-[16px] font-bold text-char transition hover:bg-cream">{c.hero.cta}<span aria-hidden>→</span></a>
            <a href={BIZ.foodpanda} target="_blank" rel="noopener" className="tap inline-flex items-center justify-center gap-2 rounded-full border border-cream/30 px-7 text-[16px] font-semibold text-cream transition hover:border-cream">{c.hero.cta2}<span aria-hidden>↗</span></a>
          </div>
          <a href={BIZ.maps} target="_blank" rel="noopener" className="mt-8 inline-flex min-h-[44px] items-center gap-3 rounded-lg text-[14px] text-cream/80">
            <span className="font-display text-[28px] font-bold leading-none text-cream">{BIZ.rating}</span>
            <span className="flex text-saffron" aria-hidden>{[0, 1, 2, 3, 4].map((i) => <Star8 key={i} className="h-3.5 w-3.5" />)}</span>
            <span>{BIZ.reviews} {c.hero.reviewsWord} ↗</span>
          </a>
        </div>
        <div className="lg:col-span-5"><Dial /></div>
      </div>
      <div className="border-t border-cream/10 bg-char-2/70">
        <dl className="mx-auto grid max-w-7xl grid-cols-3 divide-x divide-cream/10 px-2 sm:px-8">
          {c.facts.map(([n, l]) => (
            <div key={n} className="flex flex-col-reverse gap-1 px-3 py-5 sm:px-6 sm:py-7">
              <dt className="text-[12.5px] leading-snug text-cream/75 sm:text-[14px]">{l}</dt>
              <dd className="font-display text-[26px] font-bold leading-none text-saffron sm:text-[38px]">{n}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

function Ribbon() {
  const { c } = useI18n<Content>()
  const row = (k: string) => (
    <div className="flex shrink-0 items-center" key={k}>
      {c.ribbon.map((t) => <span key={t} className="flex items-center gap-6 pr-6 font-display text-[19px] font-bold uppercase tracking-[0.06em] text-char sm:text-[22px]">{t}<Star8 className="h-3.5 w-3.5 text-pom" /></span>)}
    </div>
  )
  return (
    <div className="overflow-hidden bg-saffron py-4" aria-hidden>
      <div className="marquee flex w-max">{row('a')}{row('b')}</div>
    </div>
  )
}

function AddBtn({ id, picked, toggle, full = false }: { id: DishId; picked: DishId[]; toggle: (d: DishId) => void; full?: boolean }) {
  const { c } = useI18n<Content>()
  const on = picked.includes(id)
  const name = DISHES.find((d) => d.id === id)!.name
  return (
    <button type="button" onClick={() => toggle(id)} aria-pressed={on} aria-label={`${on ? c.menu.added : c.menu.add}: ${name}`}
      className={`tap inline-flex items-center justify-center gap-1.5 rounded-full border px-3 text-[13.5px] font-bold transition ${full ? 'w-full' : ''} ${on ? 'border-pom bg-pom text-cream' : 'border-char/25 text-char hover:border-char'}`}>
      <span aria-hidden>{on ? '✓' : '+'}</span>{on ? c.menu.added : <><span className="sm:hidden">{c.menu.add.split(' ')[0]}</span><span className="hidden sm:inline">{c.menu.add}</span></>}
    </button>
  )
}

function Menu({ picked, toggle }: { picked: DishId[]; toggle: (d: DishId) => void }) {
  const { c } = useI18n<Content>()
  const M = c.menu
  const photo = DISHES.filter((d) => d.img)
  const also = DISHES.filter((d) => !d.img)
  return (
    <section id="menu" className="bg-cream">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7"><Eyebrow>{M.eyebrow}</Eyebrow><h2 className="h2 mt-5">{M.title}</h2></div>
          <p className="text-[16px] leading-relaxed text-muted lg:col-span-5">{M.sub}</p>
        </div>
        <ul className="mt-12 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-6 lg:grid-cols-3 lg:gap-y-12">
          {photo.map((d, i) => (
            <Reveal as="li" key={d.id} delay={(i % 3) * 80} className="flex flex-col">
              <div className="arch relative overflow-hidden bg-cream-2">
                <img src={asset(`images/${d.img}-440.webp`)} srcSet={`${asset(`images/${d.img}-440.webp`)} 440w, ${asset(`images/${d.img}-720.webp`)} 720w`} sizes="(min-width:1024px) 380px, 46vw" width={720} height={900} loading="lazy" decoding="async" alt="" className="h-full w-full object-cover" />
                <span className="absolute bottom-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-char/80 px-2.5 py-0.5 text-[10.5px] font-medium text-cream">{c.hero.photo}</span>
              </div>
              <p className="mt-4 text-[11.5px] font-bold uppercase tracking-[0.14em] text-saffron-ink">{d.src === 'fp' ? M.srcFp : M.srcL8}</p>
              <h3 className="mt-1.5 font-display text-[19px] font-bold leading-tight text-char sm:text-[24px]">{d.name}</h3>
              <p className="mt-2 flex-1 text-[14px] leading-relaxed text-muted sm:text-[15.5px]">{M.desc[d.id]}</p>
              <div className="mt-4"><AddBtn id={d.id} picked={picked} toggle={toggle} full /></div>
            </Reveal>
          ))}
          <Reveal as="li" className="col-span-2 lg:col-span-1">
            <div className="flex h-full flex-col rounded-[28px] bg-char p-6 text-cream sm:p-7">
              <h3 className="font-display text-[22px] font-bold">{M.alsoTitle}</h3>
              <ul className="mt-4 divide-y divide-cream/10">
                {also.map((d) => (
                  <li key={d.id} className="flex items-center justify-between gap-4 py-3">
                    <div><p className="font-semibold">{d.name}</p><p className="text-[13.5px] text-muted-dark">{M.desc[d.id]}</p></div>
                    <button type="button" onClick={() => toggle(d.id)} aria-pressed={picked.includes(d.id)} aria-label={`${picked.includes(d.id) ? M.added : M.add}: ${d.name}`} className={`tap grid shrink-0 place-items-center rounded-full border text-lg font-bold transition ${picked.includes(d.id) ? 'border-saffron bg-saffron text-char' : 'border-cream/30 text-cream hover:border-saffron'}`}><span aria-hidden>{picked.includes(d.id) ? '✓' : '+'}</span></button>
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-6">
                <p className="font-display text-[17px] font-bold text-saffron">{M.askTitle}</p>
                <p className="mt-1.5 text-[14px] leading-relaxed text-cream/80">{M.askText}</p>
                <a href={wa(c.waMsg)} target="_blank" rel="noopener" className="tap mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-saffron px-5 text-[15px] font-bold text-char transition hover:bg-cream"><WaIcon className="h-[18px] w-[18px]" />{M.askCta}</a>
              </div>
            </div>
          </Reveal>
        </ul>
        <p className="mt-10 text-[13px] text-muted">{M.note}</p>
      </div>
    </section>
  )
}

function Reviews() {
  const { c, lang } = useI18n<Content>()
  const R = c.reviews
  return (
    <section id="reviews" className="relative overflow-hidden bg-pom text-cream">
      <div className="pattern-light pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-12 lg:py-28">
        <div className="lg:col-span-5">
          <p className="eyebrow text-cream"><Star8 className="h-3.5 w-3.5" />{R.eyebrow}</p>
          <p className="mt-6 font-display text-[clamp(6rem,22vw,11rem)] font-bold leading-[0.85]" aria-hidden>{BIZ.rating}</p>
          <div className="mt-4 flex gap-1.5 text-cream" aria-hidden>{[0, 1, 2, 3, 4].map((i) => <Star8 key={i} className="h-6 w-6" />)}</div>
          <h2 className="mt-6 max-w-sm font-display text-[26px] font-bold leading-tight sm:text-[30px]">{R.title}</h2>
          <a href={BIZ.maps} target="_blank" rel="noopener" className="tap mt-6 inline-flex items-center gap-2 rounded-full border border-cream/50 px-5 text-[15px] font-semibold transition hover:bg-cream hover:text-pom">{R.read} ↗</a>
          <p className="mt-4 text-[13px] text-cream/85">{R.asOf}</p>
        </div>
        <div className="grid content-center gap-5 lg:col-span-7">
          {R.quotes.map((q, i) => (
            <Reveal key={q.by} delay={i * 90}>
              <figure className={`rounded-[28px] bg-cream p-7 text-char sm:p-9 ${i === 1 ? 'lg:ml-16' : ''}`}>
                <blockquote lang="ms" className={`font-display font-bold leading-snug text-pom ${i === 1 ? 'text-[34px] sm:text-[44px]' : 'text-[21px] sm:text-[25px]'}`}>“{q.text}”</blockquote>
                {lang === 'en' && q.tr && <p className="mt-3 text-[15px] text-muted"><span className="font-semibold">{R.trLabel}:</span> {q.tr}</p>}
                <figcaption className="mt-5 text-[14px] font-semibold">— {q.by} <span className="font-normal text-muted">· {q.where}</span></figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function useDays(lang: string) {
  const [days, setDays] = useState<{ key: number; label: string; long: string }[]>([])
  useEffect(() => {
    const loc = lang === 'ms' ? 'ms-MY' : 'en-GB'
    const fmt = new Intl.DateTimeFormat(loc, { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Asia/Kuala_Lumpur' })
    const fmtL = new Intl.DateTimeFormat(loc, { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Asia/Kuala_Lumpur' })
    const base = Date.now()
    setDays(Array.from({ length: 7 }, (_, i) => { const d = new Date(base + i * 864e5); return { key: i, label: fmt.format(d), long: fmtL.format(d) } }))
  }, [lang])
  return days
}

const SLOTS = Array.from({ length: 30 }, (_, i) => 660 + i * 30) // 11:00 → 01:30

function Reserve({ picked, toggle }: { picked: DishId[]; toggle: (d: DishId) => void }) {
  const { c, lang } = useI18n<Content>()
  const V = c.reserve
  const days = useDays(lang)
  const [mode, setMode] = useState(0)
  const [guests, setGuests] = useState(2)
  const [day, setDay] = useState(0)
  const [time, setTime] = useState(-1)
  const [name, setName] = useState('')
  const [note, setNote] = useState('')
  const [nowMins, setNowMins] = useState<number | null>(null)
  useEffect(() => { setNowMins(nowInKL().mins) }, [])
  const slots = SLOTS.filter((m) => day !== 0 || nowMins === null || m >= 1440 || nowMins < 120 || m >= nowMins + 30)
  useEffect(() => { if (time >= 0 && !slots.includes(time)) setTime(-1) }, [day, slots, time])
  const label = (m: number) => `${fmtClock(m, lang)}${m >= 1440 ? ` (${V.late})` : ''}`
  const dayName = (i: number) => (i === 0 ? V.today : i === 1 ? V.tomorrow : days[i]?.label || '')
  const dishNames = DISHES.filter((d) => picked.includes(d.id)).map((d) => d.name)
  const M = V.msg
  const when = `${days[day]?.long || dayName(day)}`
  const lines = mode === 0
    ? [M.hiTable, '', name ? `${M.name}: ${name}` : null, `${M.guests}: ${guests}`, `${M.day}: ${when}`, `${M.time}: ${time >= 0 ? label(time) : V.any}`, dishNames.length ? `${M.dishes}: ${dishNames.join(', ')}` : null, note ? `${M.note}: ${note}` : null, '', M.endTable]
    : [M.hiTake, '', name ? `${M.name}: ${name}` : null, `${M.pickup}: ${when}, ${time >= 0 ? label(time) : V.any}`, dishNames.length ? `${M.order}: ${dishNames.join(', ')}` : null, note ? `${M.note}: ${note}` : null, '', M.endTake]
  const msg = lines.filter((l): l is string => l !== null).join('\n')
  const pill = (on: boolean) => `tap inline-flex items-center justify-center rounded-full border px-4 text-[15px] font-semibold transition ${on ? 'border-char bg-char text-cream' : 'border-char/20 bg-white/60 text-char hover:border-char'}`
  return (
    <section id="reserve" className="bg-cream-2">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
        <div className="max-w-2xl"><Eyebrow>{V.eyebrow}</Eyebrow><h2 className="h2 mt-5">{V.title}</h2><p className="mt-4 text-[16.5px] leading-relaxed text-muted">{V.sub}</p></div>
        <div className="mt-12 grid gap-10 lg:grid-cols-12">
          <form className="space-y-9 lg:col-span-7" onSubmit={(e) => e.preventDefault()}>
            <fieldset>
              <legend className="step">{V.mode}</legend>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:max-w-md">
                {V.modes.map((t, i) => <label key={t} className={`radio ${pill(mode === i)}`}><input type="radio" name="mode" className="sr-only" checked={mode === i} onChange={() => setMode(i)} />{t}</label>)}
              </div>
            </fieldset>
            <div className="grid gap-9 sm:grid-cols-[auto_1fr]">
              {mode === 0 && (
                <fieldset>
                  <legend className="step">{V.guests}</legend>
                  <div className="mt-3 inline-flex items-center gap-1 rounded-full border border-char/20 bg-white/60 p-1">
                    <button type="button" onClick={() => setGuests((g) => Math.max(1, g - 1))} aria-label={V.less} className="tap grid place-items-center rounded-full text-xl font-bold hover:bg-char/10">−</button>
                    <output aria-live="polite" className="min-w-[3ch] text-center font-display text-[22px] font-bold tabular-nums">{guests}</output>
                    <button type="button" onClick={() => setGuests((g) => Math.min(40, g + 1))} aria-label={V.more} className="tap grid place-items-center rounded-full text-xl font-bold hover:bg-char/10">+</button>
                  </div>
                </fieldset>
              )}
              <div>
                <label htmlFor="time" className="step">{V.time}</label>
                <select id="time" value={time} onChange={(e) => setTime(Number(e.target.value))} className="field mt-3">
                  <option value={-1}>{V.timePick}</option>
                  {slots.map((m) => <option key={m} value={m}>{label(m)}</option>)}
                </select>
              </div>
            </div>
            <fieldset>
              <legend className="step">{V.day}</legend>
              <div className="mt-3 flex min-h-[48px] flex-wrap gap-2">
                {days.map((d) => <label key={d.key} className={`radio ${pill(day === d.key)}`}><input type="radio" name="day" className="sr-only" checked={day === d.key} onChange={() => setDay(d.key)} />{dayName(d.key)}</label>)}
              </div>
            </fieldset>
            <fieldset>
              <legend className="step">{V.dishes}</legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {DISHES.map((d) => { const on = picked.includes(d.id); return <label key={d.id} className={`radio ${pill(on)} !text-[14px]`}><input type="checkbox" className="sr-only" checked={on} onChange={() => toggle(d.id)} />{on ? '✓ ' : ''}{d.name}</label> })}
              </div>
            </fieldset>
            <div className="grid gap-6 sm:grid-cols-2">
              <div><label htmlFor="name" className="step">{V.name}</label><input id="name" value={name} onChange={(e) => setName(e.target.value.slice(0, 60))} autoComplete="name" className="field mt-3" /></div>
              <div><label htmlFor="note" className="step">{V.note}</label><input id="note" value={note} onChange={(e) => setNote(e.target.value.slice(0, 160))} placeholder={V.notePh} className="field mt-3" /></div>
            </div>
          </form>
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-24">
              <div className="slip relative bg-[#FFFCF5] px-6 pb-10 pt-7 text-char shadow-[0_24px_50px_-24px_rgba(23,17,14,.45)]">
                <div className="text-center">
                  <p className="font-display text-[22px] font-bold leading-none">Khalids</p>
                  <p className="mt-1 text-[9.5px] font-bold uppercase tracking-[0.34em] text-saffron-ink">Global Kitchen · Bukit Bintang</p>
                  <p className="mt-4 inline-block rounded-full bg-char px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-cream">{mode === 0 ? V.slip : V.slipTake}</p>
                </div>
                <div className="my-5 border-t-2 border-dashed border-char/20" />
                <p className="whitespace-pre-line text-[14.5px] leading-relaxed" aria-live="polite">{msg}</p>
                <div className="my-5 border-t-2 border-dashed border-char/20" />
                <a href={wa(msg)} target="_blank" rel="noopener" className="tap flex items-center justify-center gap-2 rounded-full bg-pom px-5 text-[16px] font-bold text-cream transition hover:bg-char"><WaIcon />{V.send}</a>
                <p className="mt-3 text-center text-[12.5px] leading-snug text-muted">{V.hint}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Visit() {
  const { c } = useI18n<Content>()
  const V = c.visit
  const [today, setToday] = useState(-1)
  useEffect(() => { setToday(nowInKL().day) }, [])
  return (
    <section id="visit" className="pattern relative overflow-hidden bg-char text-cream">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-12 lg:py-28">
        <div className="lg:col-span-6">
          <Eyebrow dark>{V.eyebrow}</Eyebrow>
          <h2 className="h2 mt-5 text-cream">{V.title}</h2>
          <div className="mt-10">
            <p className="dt">{V.hours}</p>
            <ol className="mt-3 grid grid-cols-7 gap-1.5">
              {V.days.map((d, i) => (
                <li key={d} className={`rounded-xl border px-1 py-2.5 text-center ${today === i ? 'border-saffron bg-saffron text-char' : 'border-cream/15'}`}>
                  <span className="block text-[12.5px] font-bold">{d}</span>
                  <span className={`mt-0.5 block text-[10.5px] ${today === i ? 'text-char/80' : 'text-cream/70'}`}>11–2</span>
                </li>
              ))}
            </ol>
            <p className="mt-3 text-[15px]"><span className="font-semibold">{V.daily}: {V.hoursText}</span> <span className="text-muted-dark">· {V.hoursNote}</span></p>
          </div>
          <dl className="mt-10 grid gap-8 sm:grid-cols-2">
            <div className="sm:col-span-2"><dt className="dt">{V.address}</dt><dd className="mt-2 text-[16px] leading-relaxed">{BIZ.address}</dd></div>
            <div><dt className="dt">{V.plus}</dt><dd className="mt-2 text-[16px]">{BIZ.plus}</dd></div>
            <div><dt className="dt">{V.call}</dt><dd className="mt-2"><a href={`tel:${BIZ.tel}`} className="inline-flex min-h-[44px] items-center text-[16px] font-semibold underline decoration-saffron/50 underline-offset-4 hover:text-saffron">{BIZ.phone}</a></dd></div>
          </dl>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={BIZ.directions} target="_blank" rel="noopener" className="tap inline-flex items-center gap-2 rounded-full bg-saffron px-6 text-[15px] font-bold text-char transition hover:bg-cream">{V.maps} ↗</a>
            <a href={BIZ.waze} target="_blank" rel="noopener" className="tap inline-flex items-center gap-2 rounded-full border border-cream/30 px-6 text-[15px] font-semibold transition hover:border-cream">{V.waze} ↗</a>
          </div>
        </div>
        <div className="flex flex-col gap-5 lg:col-span-6">
          <a href={BIZ.maps} target="_blank" rel="noopener" className="group block overflow-hidden rounded-[28px] border border-cream/12 bg-char-2">
            <svg viewBox="0 0 520 330" className="h-auto w-full" aria-hidden>
              <rect width="520" height="330" fill="#221915" />
              <g stroke="#30241D" strokeWidth="18" fill="none" strokeLinecap="round"><path d="M-10 250 L530 120" /><path d="M150 -10 L240 340" /><path d="M-10 70 C160 110 330 40 530 60" /><path d="M380 -10 L330 340" /></g>
              <g stroke="#3D2E25" strokeWidth="6" fill="none"><path d="M-10 170 L530 200" /><path d="M60 -10 L90 340" /><path d="M470 -10 L450 340" /></g>
              <text x="26" y="300" fill="#BFAE98" fontSize="13" fontFamily="Karla, sans-serif" letterSpacing="2">{V.mapLabel.toUpperCase()}</text>
              <circle cx="285" cy="168" r="44" fill="#E9A93B" opacity=".12" />
              <path d="M285 128l9 12 15-2-2 15 12 9-12 9 2 15-15-2-9 12-9-12-15 2 2-15-12-9 12-9-2-15 15 2z" fill="#E9A93B" stroke="#17110E" strokeWidth="3" />
              <circle cx="285" cy="164" r="6" fill="#A3312A" />
            </svg>
            <div className="flex items-center justify-between gap-4 p-5">
              <div><p className="font-display text-[19px] font-bold">Khalids Global Kitchen</p><p className="text-[13.5px] text-muted-dark">{BIZ.addressShort}</p></div>
              <span className="shrink-0 rounded-full bg-saffron px-3 py-1.5 text-[13px] font-bold text-char transition group-hover:bg-cream">{V.maps} ↗</span>
            </div>
          </a>
          <div className="grid gap-5 sm:grid-cols-2">
            <a href={BIZ.foodpanda} target="_blank" rel="noopener" className="group rounded-[24px] border border-cream/12 bg-char-2 p-6 transition hover:border-saffron">
              <p className="dt">{V.delivery}</p>
              <p className="mt-3 font-display text-[22px] font-bold">foodpanda</p>
              <p className="mt-1 text-[14.5px] text-cream/80">{V.deliveryText}</p>
              <p className="mt-4 text-[14px] font-bold text-saffron">{V.fp} ↗</p>
            </a>
            <a href={BIZ.tiktok} target="_blank" rel="noopener" className="group rounded-[24px] border border-cream/12 bg-char-2 p-6 transition hover:border-saffron">
              <p className="dt">{V.follow}</p>
              <p className="mt-3 font-display text-[22px] font-bold">TikTok</p>
              <p className="mt-1 text-[14.5px] text-cream/80">@khalidsglobalkitchen</p>
              <p className="mt-4 text-[14px] font-bold text-saffron">{V.tiktok} ↗</p>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

function Faq() {
  const { c } = useI18n<Content>()
  return (
    <section id="faq" className="bg-cream">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-12 lg:py-28">
        <div className="lg:col-span-4"><Eyebrow>{c.faq.eyebrow}</Eyebrow><h2 className="h2 mt-5">{c.faq.title}</h2></div>
        <div className="divide-y divide-char/10 border-y border-char/10 lg:col-span-8">
          {c.faq.items.map(([q, a]) => (
            <details key={q} className="group">
              <summary className="flex min-h-[64px] cursor-pointer items-center justify-between gap-6 py-4 font-display text-[18px] font-bold text-char sm:text-[20px]">
                {q}
                <span className="faq-i grid h-9 w-9 shrink-0 place-items-center rounded-full border border-char/20 text-lg transition" aria-hidden>+</span>
              </summary>
              <p className="max-w-2xl pb-6 text-[16px] leading-relaxed text-muted">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

function Footer() {
  const { c } = useI18n<Content>()
  return (
    <footer className="bg-[#0F0B09] text-cream">
      <div className="mx-auto max-w-7xl px-5 pb-28 pt-14 sm:px-8 sm:pb-12">
        <div className="flex flex-col justify-between gap-10 lg:flex-row">
          <div><Logo /><p className="mt-4 text-[14.5px] text-cream/75">{c.footer.tagline}</p></div>
          <ul className="grid gap-x-10 gap-y-1 text-[15px] sm:grid-cols-2">
            <li><a href={`tel:${BIZ.tel}`} className="inline-flex min-h-[44px] items-center hover:text-saffron">{BIZ.phone}</a></li>
            <li><a href={wa(c.waMsg)} target="_blank" rel="noopener" className="inline-flex min-h-[44px] items-center gap-2 hover:text-saffron"><WaIcon className="h-4 w-4" />WhatsApp</a></li>
            <li><a href={BIZ.foodpanda} target="_blank" rel="noopener" className="inline-flex min-h-[44px] items-center hover:text-saffron">foodpanda ↗</a></li>
            <li><a href={BIZ.tiktok} target="_blank" rel="noopener" className="inline-flex min-h-[44px] items-center hover:text-saffron">TikTok ↗</a></li>
            <li className="sm:col-span-2"><a href={BIZ.maps} target="_blank" rel="noopener" className="inline-flex min-h-[44px] items-center hover:text-saffron">{BIZ.address} ↗</a></li>
          </ul>
          <a href="#top" className="tap inline-flex items-center gap-2 self-start rounded-full border border-cream/20 px-5 text-sm font-semibold transition hover:border-saffron hover:text-saffron">{c.footer.toTop} <span aria-hidden>↑</span></a>
        </div>
        <p className="mt-12 text-[12.5px] text-cream/70">{c.footer.photos}</p>
        <div className="mt-6 flex flex-col gap-3 border-t border-cream/10 pt-6 text-[13px] text-cream/75 sm:flex-row sm:items-center sm:justify-between">
          <p>{c.footer.pitch}</p>
          <a href={PITCH_WA} target="_blank" rel="noopener" className="tap inline-flex shrink-0 items-center gap-2 font-bold text-saffron hover:text-cream"><WaIcon className="h-4 w-4" />{c.footer.pitchLink}</a>
        </div>
        <p className="mt-4 text-[12px] text-cream/60">© {new Date().getFullYear()} {BIZ.name}. {c.footer.rights}</p>
      </div>
    </footer>
  )
}

function Fab() {
  const { c } = useI18n<Content>()
  const [show, setShow] = useState(false)
  useEffect(() => {
    const on = () => setShow(window.scrollY > window.innerHeight * 0.9)
    on(); window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return (
    <a href={wa(c.waMsg)} target="_blank" rel="noopener" aria-label={c.a11y.fab} aria-hidden={!show} tabIndex={show ? 0 : -1} data-fab
      className={`fixed bottom-5 right-5 z-30 grid h-14 w-14 place-items-center rounded-full bg-saffron text-char shadow-[0_12px_30px_rgba(23,17,14,.45)] transition duration-300 md:hidden ${show ? 'opacity-100' : 'pointer-events-none translate-y-4 opacity-0'}`}>
      <WaIcon className="h-6 w-6" />
    </a>
  )
}

export default function App() {
  const { c } = useI18n<Content>()
  const [open, setOpen] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)
  const closeMenu = useCallback(() => setOpen(false), [])
  useMenu(open, closeMenu, btnRef)
  const ids = useMemo(() => IDS, [])
  const active = useActiveSection(ids)
  const [picked, setPicked] = useState<DishId[]>([])
  const toggle = useCallback((d: DishId) => setPicked((p) => (p.includes(d) ? p.filter((x) => x !== d) : [...p, d])), [])
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-saffron focus:px-4 focus:py-2 focus:text-char">{c.a11y.skip}</a>
      <Header active={active} onMenu={() => setOpen((o) => !o)} menuOpen={open} btnRef={btnRef} />
      {open && <MobileMenu close={closeMenu} active={active} />}
      <main id="main" tabIndex={-1} className="outline-none">
        <Hero />
        <Ribbon />
        <Menu picked={picked} toggle={toggle} />
        <Reviews />
        <Reserve picked={picked} toggle={toggle} />
        <Visit />
        <Faq />
      </main>
      <Footer />
      <Fab />
    </>
  )
}
