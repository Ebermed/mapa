import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, FormEvent } from 'react'
import {
  analyze,
  branchLabel,
  elementMeta,
  fixtures,
  pillarLabel,
  stemLabel,
  tenGodMeta,
  type BirthInput,
  type BriefResult,
  type ElementKey,
  type InterpretationCandidate,
  type StemKey,
  type TenGodKey,
} from './engine'

type Screen = 'home' | 'form' | 'brief' | 'explore'
type Feedback = 'Muchísimo' | 'Bastante' | 'Poco'
type PointKey = 'year' | 'month' | 'day' | 'hour'
type MapKind = 'me' | 'other'
type SourceNode = { label: string; detail?: string; element?: ElementKey }
type SavedMap = {
  id: string
  kind: MapKind
  label: string
  result: BriefResult
  createdAt: number
}

type Identity = {
  name: string
  caption: string
  path: string
}

const LIBRARY = 'mapa.library.v2'
const ACTIVE = 'mapa.active.v2'
const LEGACY_STORE = 'mapa.saved.v1'
const FEEDBACK = 'mapa.feedback.v1'
const ELEMENTS: ElementKey[] = ['wood', 'fire', 'earth', 'metal', 'water']
const POINTS: PointKey[] = ['year', 'month', 'day', 'hour']

const identityMeta: Record<StemKey, Identity> = {
  jia: { name: 'Roble', caption: 'dirección y constancia', path: 'M11 19c0-5 3-9 5-12 2 3 5 7 5 12M16 11c-2 0-4-1-5-3' },
  yi: { name: 'Hiedra', caption: 'adaptación y estrategia', path: 'M6 16c4-6 7-8 12-10-1 5-4 9-10 13-1-2-2-2-2-3z' },
  bing: { name: 'Sol', caption: 'impulso y presencia', path: 'M12 5v2M12 17v2M5 12h2M17 12h2M7.5 7.5l1.5 1.5M15 15l1.5 1.5M16.5 7.5 15 9M9 15l-1.5 1.5M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8z' },
  ding: { name: 'Brasa', caption: 'detalle y continuidad', path: 'M14 20c0-4 5-5 5-9 0-3-2-5-4-7 0 3-2 4-4 6-2 2-3 4-3 7 0 4 3 7 6 7s5-2 5-4z' },
  wu: { name: 'Montaña', caption: 'estabilidad y sostén', path: 'M5 17 12 7l7 10H5z' },
  ji: { name: 'Huerto', caption: 'cuidado y mantenimiento', path: 'M7 17h10M9 17v-4m6 4v-6M8 10c1-2 3-3 4-5 1 2 3 3 4 5' },
  geng: { name: 'Acero', caption: 'decisión y firmeza', path: 'M12 4l7 7-7 9-7-9 7-7z' },
  xin: { name: 'Joya', caption: 'precisión y criterio', path: 'M12 5l6 4-2 8h-8L6 9l6-4z' },
  ren: { name: 'Marea', caption: 'movimiento y conexión', path: 'M4 14c2-2 4-2 6 0s4 2 6 0 4-2 4-2M4 10c2-2 4-2 6 0s4 2 6 0 4-2 4-2' },
  gui: { name: 'Rocío', caption: 'contexto e imaginación', path: 'M12 4c3 4 6 7 6 11a6 6 0 0 1-12 0c0-4 3-7 6-11z' },
}

const deepColor: Record<ElementKey, string> = {
  wood: '#3F6542', fire: '#B84A2E', earth: '#9A723B', metal: '#57616B', water: '#1F4D68',
}

function Topo() {
  return <div className="topo" aria-hidden="true"><span/><span/><span/><span/></div>
}

function Atmosphere() {
  return <div className="atmosphere" aria-hidden="true"><i/><i/><i/></div>
}

function Brand({ onClick }: { onClick: () => void }) {
  return <button className="brand brandButton" onClick={onClick}><div className="brandMark">M</div><b>MAPA</b></button>
}

function Pill({ children }: { children: any }) {
  return <span className="pill">{children}</span>
}

function IdentityGlyph({ stem, small = false }: { stem: StemKey; small?: boolean }) {
  const identity = identityMeta[stem]
  return <span className={`identityGlyph ${small ? 'small' : ''}`} aria-hidden="true"><svg viewBox="0 0 24 24"><path d={identity.path}/></svg></span>
}

function makeId() {
  return `map-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [library, setLibrary] = useState<SavedMap[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [transient, setTransient] = useState<BriefResult | null>(null)
  const [trace, setTrace] = useState(false)
  const [feedback, setFeedback] = useState<Record<string, Feedback>>({})

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LIBRARY)
      let maps: SavedMap[] = stored ? JSON.parse(stored) : []

      if (!maps.length) {
        const legacy = localStorage.getItem(LEGACY_STORE)
        if (legacy) {
          const result = JSON.parse(legacy) as BriefResult
          maps = [{
            id: 'legacy-self',
            kind: 'me',
            label: result.chart.birth.name?.trim() || 'Mi mapa',
            result,
            createdAt: Date.now(),
          }]
          localStorage.setItem(LIBRARY, JSON.stringify(maps))
        }
      }

      setLibrary(maps)
      const preferred = localStorage.getItem(ACTIVE)
      const resolved = maps.find(m => m.id === preferred)?.id || maps[0]?.id || null
      setActiveId(resolved)
      if (resolved) localStorage.setItem(ACTIVE, resolved)

      const f = localStorage.getItem(FEEDBACK)
      if (f) setFeedback(JSON.parse(f))
    } catch {}
  }, [])

  const activeMap = useMemo(() => library.find(m => m.id === activeId) || null, [library, activeId])
  const current = transient || activeMap?.result || null
  const currentElement = current?.chart.dayMaster.element
  const theme = currentElement ? elementMeta[currentElement] : null
  const appStyle = theme ? {
    '--accent': theme.color,
    '--accent-deep': deepColor[currentElement!],
    '--wash': theme.wash,
  } as CSSProperties : undefined

  const persistLibrary = (maps: SavedMap[]) => {
    setLibrary(maps)
    localStorage.setItem(LIBRARY, JSON.stringify(maps))
  }

  const activate = (id: string) => {
    setTransient(null)
    setActiveId(id)
    localStorage.setItem(ACTIVE, id)
  }

  const openSaved = (id: string, target: 'brief' | 'explore') => {
    activate(id)
    setScreen(target)
    window.scrollTo(0, 0)
  }

  const saveAndOpen = (input: BirthInput, kind: MapKind, label: string) => {
    try {
      const result = analyze(input)
      const existingSelf = kind === 'me' ? library.find(m => m.kind === 'me') : null
      const id = existingSelf?.id || makeId()
      const entry: SavedMap = {
        id,
        kind,
        label: kind === 'me' ? 'Mi mapa' : label,
        result,
        createdAt: existingSelf?.createdAt || Date.now(),
      }
      const maps = existingSelf
        ? library.map(m => m.id === existingSelf.id ? entry : m)
        : [...library, entry]
      persistLibrary(maps)
      setActiveId(id)
      localStorage.setItem(ACTIVE, id)
      setTransient(null)
      setScreen('brief')
      window.scrollTo(0, 0)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'No pudimos calcular esta carta.')
    }
  }

  const previewFixture = (input: BirthInput) => {
    try {
      setTransient(analyze(input))
      setScreen('brief')
      window.scrollTo(0, 0)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'No pudimos calcular esta carta.')
    }
  }

  const removeMap = (id: string) => {
    const item = library.find(m => m.id === id)
    if (!item) return
    if (!window.confirm(`¿Eliminar ${item.label}?`)) return
    const maps = library.filter(m => m.id !== id)
    persistLibrary(maps)
    if (activeId === id) {
      const next = maps[0]?.id || null
      setActiveId(next)
      if (next) localStorage.setItem(ACTIVE, next)
      else localStorage.removeItem(ACTIVE)
    }
  }

  const rate = (id: string, value: Feedback) => {
    const next = { ...feedback, [id]: value }
    setFeedback(next)
    localStorage.setItem(FEEDBACK, JSON.stringify(next))
  }

  const goHome = () => {
    setTransient(null)
    setScreen('home')
    window.scrollTo(0, 0)
  }

  return <div className={`app ${currentElement ? `theme-${currentElement}` : 'theme-neutral'}`} style={appStyle}>
    <Atmosphere/>
    <Topo/>
    <header>
      <Brand onClick={goHome}/>
      <div className="headerActions">
        {activeMap && screen !== 'form' && <button className="activeMapChip" onClick={goHome}><IdentityGlyph stem={activeMap.result.chart.dayMaster.stem} small/><span>{activeMap.label}</span></button>}
        {screen !== 'home' && <button className="ghost" onClick={goHome}>← Tus cartas</button>}
      </div>
    </header>

    <main>
      {screen === 'home' && <Home
        library={library}
        activeId={activeId}
        onStart={() => setScreen('form')}
        onOpen={(id) => openSaved(id, 'explore')}
        onBrief={(id) => openSaved(id, 'brief')}
        onActivate={activate}
        onDelete={removeMap}
        onFixture={previewFixture}
      />}
      {screen === 'form' && <BirthForm onSubmit={saveAndOpen} onFixture={previewFixture}/>} 
      {screen === 'brief' && current && <Brief result={current} feedback={feedback} onRate={rate} onExplore={() => setScreen('explore')} onTrace={() => setTrace(true)}/>} 
      {screen === 'explore' && current && <Explore result={current} onTrace={() => setTrace(true)}/>} 
    </main>

    {screen !== 'form' && <BottomNav
      active={screen}
      hasMap={!!current}
      onHome={goHome}
      onMap={() => current ? setScreen('explore') : setScreen('form')}
    />}
    {trace && current && <Trace result={current} onClose={() => setTrace(false)}/>} 
  </div>
}

function Home({
  library,
  activeId,
  onStart,
  onOpen,
  onBrief,
  onActivate,
  onDelete,
  onFixture,
}: {
  library: SavedMap[]
  activeId: string | null
  onStart: () => void
  onOpen: (id: string) => void
  onBrief: (id: string) => void
  onActivate: (id: string) => void
  onDelete: (id: string) => void
  onFixture: (i: BirthInput) => void
}) {
  const active = library.find(m => m.id === activeId) || library[0] || null

  if (!library.length) {
    return <section className="page landingPage">
      <div className="landingKicker">UN MAPA SOBRE TI</div>
      <h1>¿De qué estás hecho?</h1>
      <p className="lead">Tu fecha y hora de nacimiento forman una carta. Mapa la convierte en observaciones concretas sobre cómo decides, trabajas, te relacionas y reaccionas cuando algo realmente te importa.</p>
      <button className="primary big" onClick={onStart}>Descubrir mi mapa <span>→</span></button>

      <div className="identityRibbon" aria-label="Diez identidades visuales">
        {(Object.keys(identityMeta) as StemKey[]).map(stem => <div className="identityToken" key={stem}><IdentityGlyph stem={stem} small/><span>{identityMeta[stem].name}</span></div>)}
      </div>

      <details className="aboutDetails">
        <summary>¿Qué es esto exactamente?</summary>
        <p>Mapa usa la estructura de una carta BaZi por dentro y la traduce a lenguaje cotidiano por fuera. La parte técnica sigue disponible si quieres verla, pero no necesitas conocer metafísica china para empezar.</p>
      </details>

      <DevFixtures onFixture={onFixture}/>
    </section>
  }

  return <section className="page dashboardPage">
    <div className="kicker">AQUÍ</div>
    <h1>Bienvenido de nuevo.</h1>
    <p className="lead compact">Elige una carta o entra directo a lo que quieres consultar.</p>

    <div className="libraryTop">
      <div><span>Tus cartas</span><h2>Aquí están tus mapas</h2></div>
      <button className="softButton" onClick={onStart}>+ Nueva carta</button>
    </div>

    <div className="mapGrid">
      {library.map(item => <MapCard
        key={item.id}
        item={item}
        active={item.id === activeId}
        onActivate={() => onActivate(item.id)}
        onOpen={() => onOpen(item.id)}
        onBrief={() => onBrief(item.id)}
        onDelete={() => onDelete(item.id)}
      />)}
    </div>

    {active && <ToolHub item={active} onOpen={() => onOpen(active.id)} onBrief={() => onBrief(active.id)}/>} 
    <DevFixtures onFixture={onFixture}/>
  </section>
}

function MapCard({ item, active, onActivate, onOpen, onBrief, onDelete }: { item: SavedMap; active: boolean; onActivate: () => void; onOpen: () => void; onBrief: () => void; onDelete: () => void }) {
  const c = item.result.chart
  const identity = identityMeta[c.dayMaster.stem]
  const meta = elementMeta[c.dayMaster.element]
  return <article className={`mapCard ${active ? 'active' : ''}`} style={{ '--card-accent': meta.color, '--card-wash': meta.wash } as CSSProperties}>
    <div className="mapCardTop">
      <div className="identityOrb"><IdentityGlyph stem={c.dayMaster.stem}/></div>
      <div className="mapCardHeading"><small>{item.kind === 'me' ? 'TU CARTA' : 'CARTA GUARDADA'}</small><h3>{item.label}</h3><p>{identity.name} · {stemLabel(c.dayMaster.stem)}</p></div>
      <button className="deleteMap" onClick={onDelete} aria-label={`Eliminar ${item.label}`}>×</button>
    </div>
    <div className="mapCardMeta"><span>{c.birth.date}</span>{c.birth.place && <span>{c.birth.place}</span>}</div>
    <div className="mapCardActions">
      <button className="mapAction primaryAction" onClick={onOpen}>Carta</button>
      <button className="mapAction" onClick={onBrief}>En breve</button>
      {!active && <button className="mapAction subtle" onClick={onActivate}>Usar esta</button>}
      {active && <span className="activeFlag">Activa</span>}
    </div>
  </article>
}

function ToolHub({ item, onOpen, onBrief }: { item: SavedMap; onOpen: () => void; onBrief: () => void }) {
  const identity = identityMeta[item.result.chart.dayMaster.stem]
  return <section className="toolHub">
    <div className="toolHubHead">
      <div><span>Estás mirando</span><strong><IdentityGlyph stem={item.result.chart.dayMaster.stem} small/>{item.label} · {identity.name}</strong></div>
      <p>Una carta activa alimentará todas las herramientas.</p>
    </div>
    <div className="toolGrid">
      <button className="toolCard enabled" onClick={onOpen}><i>◇</i><span><b>Mi mapa</b><small>Explora tu carta completa</small></span><em>→</em></button>
      <button className="toolCard enabled" onClick={onBrief}><i>✦</i><span><b>Mi mapa en breve</b><small>Las señales que más destacan</small></span><em>→</em></button>
      <button className="toolCard" disabled><i>▦</i><span><b>Calendario</b><small>Tu día cruzado con esta carta</small></span><em>Próximo</em></button>
      <button className="toolCard" disabled><i>☾</i><span><b>Este mes</b><small>Qué gana peso durante estas semanas</small></span><em>Próximo</em></button>
      <button className="toolCard" disabled><i>⌖</i><span><b>Buscar una fecha</b><small>Encuentra un día para lo que quieres hacer</small></span><em>Próximo</em></button>
      <button className="toolCard" disabled><i>↗</i><span><b>Mi ruta</b><small>Las etapas largas de tu vida</small></span><em>Próximo</em></button>
    </div>
  </section>
}

function DevFixtures({ onFixture }: { onFixture: (i: BirthInput) => void }) {
  return <details className="devDetails"><summary>Pruebas de desarrollo</summary><p>Estas cartas tienen referencias conocidas y sirven para revisar que el cálculo y los filtros sigan funcionando.</p><div className="fixtureButtons"><button onClick={() => onFixture(fixtures.eber)}>Probar Eber</button><button onClick={() => onFixture(fixtures.anju)}>Probar Anju</button></div></details>
}

function BirthForm({ onSubmit, onFixture }: { onSubmit: (i: BirthInput, kind: MapKind, label: string) => void; onFixture: (i: BirthInput) => void }) {
  const [kind, setKind] = useState<MapKind>('me')
  const [name, setName] = useState('')
  const [day, setDay] = useState('')
  const [month, setMonth] = useState('')
  const [year, setYear] = useState('')
  const [hour, setHour] = useState('')
  const [minute, setMinute] = useState('')
  const [place, setPlace] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const clear = (key: string) => setErrors(prev => ({ ...prev, [key]: '' }))
  const submit = (e: FormEvent) => {
    e.preventDefault()
    const next: Record<string, string> = {}
    const d = Number(day), m = Number(month), y = Number(year), h = Number(hour), min = Number(minute || '0')

    if (kind === 'other' && !name.trim()) next.name = 'Pon un nombre o apodo para distinguir esta carta.'
    if (!day || !month || !year) next.date = 'Completa la fecha de nacimiento.'
    else {
      const test = new Date(Date.UTC(y, m - 1, d))
      if (y < 1900 || y > 2050 || test.getUTCFullYear() !== y || test.getUTCMonth() !== m - 1 || test.getUTCDate() !== d) next.date = 'Revisa la fecha de nacimiento.'
    }
    if (hour === '' || h < 0 || h > 23) next.time = 'Escribe una hora entre 0 y 23.'
    if (minute !== '' && (min < 0 || min > 59)) next.time = 'Los minutos deben estar entre 0 y 59.'
    if (!place.trim()) next.place = 'Escribe la ciudad o localidad donde nació.'

    setErrors(next)
    if (Object.keys(next).length) return

    const input: BirthInput = {
      name: kind === 'other' ? name.trim() : '',
      date: `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
      time: `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`,
      timezone: 'local',
      place: place.trim(),
      dstAdjustment: false,
    }
    onSubmit(input, kind, kind === 'me' ? 'Mi mapa' : name.trim())
  }

  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

  return <section className="page formPage hybridForm">
    <div className="formCompass" aria-hidden="true"><i/><i/><span>+</span></div>
    <div className="kicker">NUEVA CARTA</div>
    <h1>¿Cuándo nació?</h1>
    <p className="lead compact">Con estos datos calculamos la carta y la guardamos en este navegador para que puedas volver a ella.</p>

    <form onSubmit={submit} className="birthForm" noValidate>
      <div className="formSection whoSection">
        <span className="fieldLabel">¿Para quién es esta carta?</span>
        <div className="whoSwitch" role="group" aria-label="Para quién es la carta">
          <button type="button" className={kind === 'me' ? 'selected' : ''} onClick={() => { setKind('me'); clear('name') }}>Para mí</button>
          <button type="button" className={kind === 'other' ? 'selected' : ''} onClick={() => setKind('other')}>Para alguien más</button>
        </div>
        {kind === 'other' && <label className={`nestedField ${errors.name ? 'hasError' : ''}`}><span className="fieldLabel">¿Cómo le llamamos?</span><input value={name} onChange={e => { setName(e.target.value); clear('name') }} placeholder="Nombre o apodo" maxLength={40}/>{errors.name && <small className="fieldError">{errors.name}</small>}</label>}
      </div>

      <div className={`formSection ${errors.date ? 'hasError' : ''}`}>
        <span className="fieldLabel">Fecha de nacimiento</span>
        <div className="dateTrio">
          <input value={day} onChange={e => { setDay(e.target.value.replace(/\D/g, '').slice(0, 2)); clear('date') }} placeholder="Día" inputMode="numeric" aria-label="Día"/>
          <select value={month} onChange={e => { setMonth(e.target.value); clear('date') }} aria-label="Mes"><option value="">Mes</option>{months.map((label, i) => <option value={i + 1} key={label}>{label}</option>)}</select>
          <input value={year} onChange={e => { setYear(e.target.value.replace(/\D/g, '').slice(0, 4)); clear('date') }} placeholder="Año" inputMode="numeric" aria-label="Año"/>
        </div>
        {errors.date && <small className="fieldError">{errors.date}</small>}
      </div>

      <div className={`formSection ${errors.time ? 'hasError' : ''}`}>
        <span className="fieldLabel">Hora de nacimiento</span>
        <div className="timeDuo">
          <input value={hour} onChange={e => { setHour(e.target.value.replace(/\D/g, '').slice(0, 2)); clear('time') }} placeholder="Hora (0–23)" inputMode="numeric" aria-label="Hora"/>
          <input value={minute} onChange={e => { setMinute(e.target.value.replace(/\D/g, '').slice(0, 2)); clear('time') }} placeholder="Minutos" inputMode="numeric" aria-label="Minutos"/>
        </div>
        <small className="fieldHelp">La hora completa Tu futuro y puede cambiar algunas señales de la lectura.</small>
        <details className="timeHelp"><summary>¿No sabes la hora?</summary><p>En esta versión preferimos pedírtela antes que inventar un pilar. Más adelante podremos ofrecer una lectura parcial cuando no se conozca.</p></details>
        {errors.time && <small className="fieldError">{errors.time}</small>}
      </div>

      <div className={`formSection ${errors.place ? 'hasError' : ''}`}>
        <span className="fieldLabel">Lugar de nacimiento</span>
        <input value={place} onChange={e => { setPlace(e.target.value); clear('place') }} placeholder="León, Guanajuato" autoComplete="off"/>
        <small className="fieldHelp">Lo guardamos junto con la carta para conservar el contexto del nacimiento.</small>
        {errors.place && <small className="fieldError">{errors.place}</small>}
      </div>

      <button className="primary big full" type="submit">Ver su mapa <span>→</span></button>
    </form>

    <DevFixtures onFixture={onFixture}/>
  </section>
}

function ChartAtlas({ result }: { result: BriefResult }) {
  const c = result.chart
  const rows = ELEMENTS.map(k => [k, c.elements[k]] as [ElementKey, number]).sort((a, b) => b[1] - a[1])
  const total = Math.max(1, rows.reduce((sum, [, v]) => sum + v, 0))
  return <div className="atlasCard">
    <div className="atlasHead">
      <div><span>Tu centro</span><strong>{stemLabel(c.dayMaster.stem)}</strong></div>
      <Pill>{c.dayMaster.strength}</Pill>
    </div>
    <div className="atlasRoute" aria-hidden="true"><i/><b/><i/><b/><i/></div>
    <div className="atlasPoints">
      {POINTS.map(k => <div className={k === 'day' ? 'centerPoint' : ''} key={k}><span>{pointMeta[k].title}</span><b>{pillarLabel(c.pillars[k])}</b></div>)}
    </div>
    <div className="elementField">
      <div className="elementFieldTitle"><span>Tu mezcla</span><small>Presencia relativa en la carta</small></div>
      <div className="elementBands">
        {rows.map(([k, v]) => <div key={k} className="elementBand" style={{ flexGrow: Math.max(1, v) }} title={`${elementMeta[k].label}: ${Math.round(v / total * 100)}% de presencia relativa`}><i style={{ background: elementMeta[k].color }}/><span>{elementMeta[k].label}</span></div>)}
      </div>
    </div>
  </div>
}

function sourceFor(x: InterpretationCandidate, result: BriefResult): { nodes: SourceNode[]; explanation: string; accent: string } {
  const c = result.chart
  const neutral = '#5C4A3D'

  if (x.family === 'day_master') {
    const element = c.dayMaster.element
    return {
      nodes: [{ label: 'Tu centro', detail: stemLabel(c.dayMaster.stem), element }],
      explanation: `Esta observación se apoya en tu elemento base, ${stemLabel(c.dayMaster.stem)}, que ocupa el centro de la carta.`,
      accent: elementMeta[element].color,
    }
  }

  if (x.family === 'ten_god') {
    const raw = x.sourceRule.split(':')[1] as TenGodKey | undefined
    const meta = raw && tenGodMeta[raw]
    return {
      nodes: meta ? [{ label: meta.name, detail: meta.territory }] : [],
      explanation: meta ? `Esta observación se apoya en la forma ${meta.name}, una de las maneras de actuar que aparecen en tu carta.` : 'Esta observación se apoya en una forma de actuar detectada en tu carta.',
      accent: neutral,
    }
  }

  if (x.family === 'element') {
    const raw = x.sourceRule.split(':')[1] as ElementKey | undefined
    if (raw && elementMeta[raw]) return {
      nodes: [{ label: 'Tu mezcla', detail: elementMeta[raw].label, element: raw }],
      explanation: `Esta observación se apoya en la presencia de ${elementMeta[raw].article} dentro del conjunto de tu carta. La cantidad no significa que seas mejor o peor en algo.`,
      accent: elementMeta[raw].color,
    }
  }

  if (x.family === 'interaction') {
    const relation = x.id === 'dragon-dragon-belongings'
      ? c.interactions.find(i => i.kind === 'autocastigo' && i.branches[0] === 'dragon')
      : x.id === 'season-fire'
        ? c.interactions.find(i => i.kind === 'estación' && i.note.includes('fuego'))
        : c.interactions.find(i => x.sourceRule.includes(i.kind))
    const detail = relation ? relation.branches.map(branchLabel).join('–') : undefined
    const where = relation ? relation.pillars.map(p => pointMeta[p as PointKey]?.title || p).join(' · ') : undefined
    const nodes: SourceNode[] = [{ label: 'Entre líneas', detail }]
    if (where) nodes.push({ label: 'Se ve en', detail: where })
    const accent = x.id === 'season-fire' ? elementMeta.fire.color : x.id.includes('dragon') ? elementMeta.earth.color : neutral
    return {
      nodes,
      explanation: relation ? `Esta observación aparece al mirar juntas dos o más partes de tu carta: ${detail}${where ? `, entre ${where.toLowerCase()}` : ''}.` : 'Esta observación aparece al mirar juntas varias partes de tu carta.',
      accent,
    }
  }

  return { nodes: [], explanation: 'Esta observación se apoya en la estructura general de tu carta.', accent: neutral }
}

function SourceTrail({ x, result }: { x: InterpretationCandidate; result: BriefResult }) {
  const source = sourceFor(x, result)
  if (!source.nodes.length) return null
  return <div className="sourceBlock" style={{ borderColor: source.accent }}>
    <span className="sourceLabel">Sale sobre todo de</span>
    <div className="sourceTrail">
      {source.nodes.map((node, index) => <div className="sourceNode" key={`${node.label}-${index}`}>
        <i style={{ background: node.element ? elementMeta[node.element].color : source.accent }}/>
        <span><b>{node.label}</b>{node.detail && <small>{node.detail}</small>}</span>
      </div>)}
    </div>
    <details className="whyDetails"><summary>¿Por qué salió esto?</summary><p>{source.explanation}</p></details>
  </div>
}

function Brief({ result, feedback, onRate, onExplore, onTrace }: { result: BriefResult; feedback: Record<string, Feedback>; onRate: (id: string, v: Feedback) => void; onExplore: () => void; onTrace: () => void }) {
  const identity = identityMeta[result.chart.dayMaster.stem]
  const [shareState, setShareState] = useState('Compartir mi mapa')

  const share = async () => {
    const name = result.chart.birth.name?.trim()
    const lines = result.insights.slice(0, 3).map(x => `• ${x.headline}`).join('\n')
    const text = `${name ? `${name} · ` : ''}${identity.name} · ${stemLabel(result.chart.dayMaster.stem)}\n\n${lines}\n\nEste es mi mapa.`
    try {
      if (navigator.share) await navigator.share({ title: 'Mi mapa en breve', text })
      else if (navigator.clipboard) { await navigator.clipboard.writeText(text); setShareState('Copiado') }
    } catch {}
    window.setTimeout(() => setShareState('Compartir mi mapa'), 1800)
  }

  return <section className="page briefPage">
    <div className="briefIdentity">
      <IdentityGlyph stem={result.chart.dayMaster.stem}/>
      <div><span>IDENTIDAD VISUAL</span><h2>{identity.name}</h2><p>{stemLabel(result.chart.dayMaster.stem)} · {identity.caption}</p></div>
    </div>
    <div className="mapStamp">MI MAPA EN BREVE</div>
    <h1>Estas son las señales que más destacan.</h1>
    <p className="lead compact">Primero mira la estructura. Después lee cómo la traduce Mapa a situaciones concretas.</p>
    <ChartAtlas result={result}/>

    <div className="insights">
      {result.insights.map((x, i) => <article className="insight" key={x.id}>
        <div className="num">0{i + 1}</div>
        <h2>{x.headline}</h2>
        <p>{x.body}</p>
        <SourceTrail x={x} result={result}/>
        <div className="feedback compactFeedback">
          <span>¿Qué tanto te reconociste?</span>
          <div>{(['Muchísimo', 'Bastante', 'Poco'] as Feedback[]).map(v => <button key={v} className={feedback[x.id] === v ? 'selected' : ''} onClick={() => onRate(x.id, v)}>{v}</button>)}</div>
        </div>
      </article>)}
    </div>

    {result.insights.length < 6 && <div className="devNotice">El motor aprobó {result.insights.length} observaciones. Durante desarrollo preferimos mostrar menos antes que rellenar con una frase genérica.</div>}

    <ShareCard result={result} identity={identity} onShare={share} shareState={shareState}/>
    <button className="primary big" onClick={onExplore}>Seguir explorando mi mapa <span>→</span></button>
    <button className="traceBtn" onClick={onTrace}>Ver trazabilidad de desarrollo</button>
  </section>
}

function ShareCard({ result, identity, onShare, shareState }: { result: BriefResult; identity: Identity; onShare: () => void; shareState: string }) {
  const c = result.chart
  return <section className="shareSection">
    <div className="shareIntro"><span>PARA COMPARTIR</span><h2>Mi mapa en una tarjeta</h2><p>Una versión corta para mandar o publicar sin meter toda la parte técnica.</p></div>
    <div className="shareCard">
      <div className="shareCardHead"><IdentityGlyph stem={c.dayMaster.stem}/><div><small>MI MAPA</small><h3>{identity.name}</h3><span>{stemLabel(c.dayMaster.stem)}</span></div></div>
      <div className="shareStatements">{result.insights.slice(0, 3).map(x => <p key={x.id}>{x.headline}</p>)}</div>
      <div className="shareFooter"><span>MAPA</span><small>Este es mi mapa. Descubre el tuyo.</small></div>
    </div>
    <button className="softButton shareButton" onClick={onShare}>{shareState}</button>
  </section>
}

function Explore({ result, onTrace }: { result: BriefResult; onTrace: () => void }) {
  const c = result.chart
  const identity = identityMeta[c.dayMaster.stem]
  const elementRows = (Object.entries(c.elements) as [ElementKey, number][]).sort((a, b) => b[1] - a[1])
  const max = Math.max(...elementRows.map(x => x[1]))
  const godRows = (Object.entries(c.tenGods) as [TenGodKey, number][]).filter(x => x[1] > 0).sort((a, b) => b[1] - a[1])
  const maxG = Math.max(1, ...godRows.map(x => x[1]))

  return <section className="page explore">
    <div className="identityHero">
      <div className="identityOrb large"><IdentityGlyph stem={c.dayMaster.stem}/></div>
      <div><span>MI MAPA</span><h1>{identity.name}</h1><p>{stemLabel(c.dayMaster.stem)} · {identity.caption}</p></div>
    </div>
    <p className="lead compact exploreIntro">Aquí puedes abrir la carta por partes. Cada sección responde una pregunta distinta.</p>

    <Section title="Tu centro" tag={stemLabel(c.dayMaster.stem)}>
      <h3>{centerHeadline(c.dayMaster.stem)}</h3>
      <p>{centerBody(c.dayMaster.stem)}</p>
      <div className="facts"><Pill>{c.dayMaster.strength}</Pill><span>{c.dayMaster.strengthStatus === 'PENDING_EXTRACTION' ? 'La fuerza completa sigue en validación para cartas nuevas.' : 'Estado tomado de la carta de referencia.'}</span></div>
    </Section>

    <Section title="Tu mezcla" tag="5 elementos">
      <h3>¿Qué cosas te salen fácil y cuáles te cuesta más poner en práctica?</h3>
      <div className="elementList">{elementRows.map(([k, v]) => <div className="elementRow" key={k}><div><b>{elementMeta[k].label}</b><span>{elementMeta[k].root}</span></div><div className="bar"><i style={{ width: `${Math.max(12, v / max * 100)}%`, background: elementMeta[k].color }}/></div><small>{v === max ? 'más presente' : v <= 2 ? 'menos presente' : 'presente'}</small></div>)}</div>
    </Section>

    <Section title="Tus formas de actuar" tag="10 respuestas">
      <p>Cuando tienes que decidir, resolver algo, trabajar con alguien o reaccionar ante un problema, hay respuestas que te salen más fácil que otras.</p>
      <div className="formCards">{godRows.slice(0, 6).map(([k, v]) => <div key={k}><div className="formHead"><b>{tenGodMeta[k].name}</b><small>{tenGodMeta[k].territory}</small></div><p>{tenGodMeta[k].root}</p><div className="microbar"><i style={{ width: `${v / maxG * 100}%` }}/></div></div>)}</div>
    </Section>

    <Section title="Tus territorios" tag="5 contextos"><div className="territories">{territoryData(c.tenGods).map(t => <div key={t.name}><span>{t.name}</span><b>{t.question}</b><small>{t.level}</small></div>)}</div></Section>
    <Section title="Tus cuatro puntos" tag="4 pilares"><div className="points">{POINTS.map(k => { const data = pointMeta[k]; return <div key={k}><span>{data.title}</span><h3>{pillarLabel(c.pillars[k])}</h3><p>{data.copy}</p></div> })}</div></Section>

    <Section title="Lo que aparece entre líneas" tag={`${c.interactions.length} relaciones`}>
      <p>Hay cosas que solo aparecen cuando miramos varias partes juntas. Aquí puedes ver qué relaciones detectó el cálculo sin convertirlas automáticamente en algo bueno o malo.</p>
      {c.interactions.length ? <div className="interactionList">{c.interactions.map(i => <div key={i.id}><b>{interactionName(i.kind)}</b><span>{i.note}</span><small>{i.pillars.map(p => pointMeta[p as PointKey]?.title || p).join(' · ')}</small></div>)}</div> : <p className="muted">En esta primera pasada no encontramos una relación que necesite destacarse.</p>}
    </Section>

    <Section title="Leyenda técnica" tag="BaZi">
      <div className="legendGrid">{POINTS.map(k => <div key={k}><small>{k.toUpperCase()}</small><b>{pillarLabel(c.pillars[k])}</b><span>Ocultos: {c.pillars[k].hidden.map(stemLabel).join(', ')}</span></div>)}</div>
      <div className={`calcStatus ${c.calculation.status}`}>{c.calculation.note}</div>
    </Section>

    <button className="traceBtn" onClick={onTrace}>Abrir trazabilidad completa</button>
  </section>
}

function Section({ title, tag, children }: { title: string; tag: string; children: any }) {
  return <article className="sectionCard"><div className="sectionTitle"><h2>{title}</h2><Pill>{tag}</Pill></div>{children}</article>
}

function Trace({ result, onClose }: { result: BriefResult; onClose: () => void }) {
  return <div className="modal"><div className="tracePanel"><div className="traceTop"><div><small>SOLO DESARROLLO</small><h2>Trazabilidad</h2></div><button onClick={onClose}>×</button></div><p>Cada frase conserva la raíz técnica que la produjo. Los candidatos descartados también quedan visibles para detectar por qué el motor decidió callarse.</p><h3>Aprobados</h3>{result.insights.map(x => <TraceItem key={x.id} x={x}/>)}<h3>Descartados</h3>{result.rejected.map(x => <TraceItem key={x.id} x={x}/>)}<h3>Cálculo</h3><pre>{JSON.stringify({ birth: result.chart.birth, pillars: result.chart.pillars, dayMaster: result.chart.dayMaster, elements: result.chart.elements, tenGods: result.chart.tenGods, interactions: result.chart.interactions, calculation: result.chart.calculation }, null, 2)}</pre></div></div>
}

function TraceItem({ x }: { x: any }) {
  return <div className="traceItem"><b>{x.id}</b><span>{x.status} · {x.sourceStatus}</span><p>{x.headline}</p><code>{x.sourceRule} · score {x.score.toFixed(1)} · discr {x.discrimination} · claridad {x.clarity}</code></div>
}

function BottomNav({ active, hasMap, onHome, onMap }: { active: Screen; hasMap: boolean; onHome: () => void; onMap: () => void }) {
  return <nav className="bottom">
    <button className={active === 'home' ? 'active' : ''} onClick={onHome}><i>⌖</i><span>Aquí</span></button>
    <button className={active === 'explore' || active === 'brief' ? 'active' : ''} onClick={onMap} disabled={!hasMap}><i>◇</i><span>Mi mapa</span></button>
    <button disabled><i>▦</i><span>Calendario</span></button>
    <button disabled><i>↗</i><span>Mi ruta</span></button>
    <button disabled><i>•••</i><span>Más</span></button>
  </nav>
}

const centerHeadline = (s: any) => ({
  wu: 'Cuando te comprometes con algo, tiendes a sostenerlo y seguir hasta encontrar la manera de que funcione.',
  yi: 'Puedes cambiar la forma de hacer algo sin perder de vista lo que querías conseguir.',
  jia: 'Cuando eliges una dirección, te cuesta abandonarla a la primera dificultad.',
  bing: 'Cuando algo te entusiasma, se te nota y puedes hacer que otros también se enganchen.',
  ding: 'Sueles arrancar mejor cuando ya entendiste cómo quieres hacer las cosas.',
  ji: 'Cuando algo depende de cuidados pequeños y constantes, sueles darte cuenta de lo que hace falta.',
  geng: 'Cuando ya sabes qué sobra, te resulta más fácil cortarlo y seguir.',
  xin: 'Sueles notar detalles que otras personas dejan pasar.',
  ren: 'Cuando aparece un problema, tu cabeza suele abrir varias opciones a la vez.',
  gui: 'Sueles encontrar soluciones que no eran la opción más obvia.',
}[s] || '')

const centerBody = (s: any) => ({
  wu: 'Cuando algo te importa, puedes mantenerte encima durante mucho tiempo. También puedes terminar cargando más de lo que te conviene antes de decidir soltarlo.',
  yi: 'Cuando una forma de hacer algo deja de servirte, puedes cambiarla sin abandonar lo que querías conseguir. A veces los demás tardan en notar qué cosas sí son importantes para ti.',
  jia: 'Cuando ya elegiste qué quieres hacer, tiendes a seguir mientras todavía veas una posibilidad real de que funcione.',
  bing: 'Cuando algo te entusiasma, te sale ponerlo en movimiento y hacer visible ese entusiasmo. El reto aparece cuando toca bajar el ritmo.',
  ding: 'Antes de exponerte o empezar algo importante, te ayuda preparar lo necesario y entender cómo quieres hacerlo.',
  ji: 'Te sale notar qué necesita mantenimiento y seguir atendiendo los detalles que hacen que algo funcione día tras día.',
  geng: 'Cuando hay presión, puedes decidir rápido qué sirve, qué estorba y qué toca hacer. A veces conviene revisar si cerraste una opción demasiado pronto.',
  xin: 'Antes de dar algo por terminado, tiendes a revisar los detalles, la forma y si cada parte quedó como querías.',
  ren: 'Cuando algo se complica, puedes pensar varias soluciones al mismo tiempo y conectar información de lugares distintos.',
  gui: 'Cuando aparece información nueva, puedes cambiar de enfoque y conectar detalles que al principio parecían separados.',
}[s] || '')

const pointMeta = {
  year: { title: 'Tu origen', copy: 'Aquí miramos cómo te mueves con la gente que está alrededor de tu vida.' },
  month: { title: 'Tu trayectoria', copy: 'Aquí miramos cómo respondes cuando hay trabajo, responsabilidades y resultados de por medio.' },
  day: { title: 'Tu centro', copy: 'Aquí miramos lo que pasa cuando el asunto eres tú o alguien realmente cercano a ti.' },
  hour: { title: 'Tu futuro', copy: 'Aquí miramos lo que quieres desarrollar, cuidar o dejar construido con el tiempo.' },
}

function interactionName(kind: string) {
  return ({ armonía: 'Armonía', choque: 'Choque', daño: 'Daño', destrucción: 'Destrucción', autocastigo: 'Repetición', 'tres armonías': 'Combinación de tres', estación: 'Combinación de estación' } as Record<string, string>)[kind] || kind
}

function territoryData(g: Record<TenGodKey, number>) {
  const data = [
    ['Vínculos', '¿Qué haces cuando tienes que decidir, colaborar o competir con alguien más?', ['bi_jian', 'jie_cai']],
    ['Expresión', '¿Qué haces con una idea después de tenerla?', ['shi_shen', 'shang_guan']],
    ['Recursos', '¿Cómo decides dónde poner tu dinero, tu trabajo o tu esfuerzo?', ['pian_cai', 'zheng_cai']],
    ['Estructura', '¿Qué haces cuando hay reglas, presión o una responsabilidad encima?', ['qi_sha', 'zheng_guan']],
    ['Perspectiva', '¿Cómo intentas entender algo antes de decidir qué hacer?', ['pian_yin', 'zheng_yin']],
  ] as any[]
  const vals = data.map(x => ({ name: x[0], question: x[1], v: g[x[2][0] as TenGodKey] + g[x[2][1] as TenGodKey] }))
  const max = Math.max(1, ...vals.map(x => x.v))
  return vals.map(x => ({ ...x, level: x.v === max ? 'aparece mucho' : x.v <= 1 ? 'aparece poco' : 'aparece' }))
}

export default App
