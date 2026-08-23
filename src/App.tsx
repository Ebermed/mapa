import { useEffect, useState } from 'react'
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
  type TenGodKey,
} from './engine'

type Screen = 'home' | 'form' | 'brief' | 'explore'
type Feedback = 'Muchísimo' | 'Bastante' | 'Poco'
type PointKey = 'year' | 'month' | 'day' | 'hour'
type SourceNode = { label: string; detail?: string; element?: ElementKey }

const STORE = 'mapa.saved.v1'
const FEEDBACK = 'mapa.feedback.v1'
const ELEMENTS: ElementKey[] = ['wood', 'fire', 'earth', 'metal', 'water']
const POINTS: PointKey[] = ['year', 'month', 'day', 'hour']

function Topo() {
  return <div className="topo" aria-hidden="true"><span/><span/><span/><span/></div>
}
function Brand() {
  return <div className="brand"><div className="brandMark">M</div><b>MAPA</b></div>
}
function Pill({ children }: { children: any }) {
  return <span className="pill">{children}</span>
}

function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [result, setResult] = useState<BriefResult | null>(null)
  const [saved, setSaved] = useState<BriefResult | null>(null)
  const [trace, setTrace] = useState(false)
  const [feedback, setFeedback] = useState<Record<string, Feedback>>({})

  useEffect(() => {
    try {
      const s = localStorage.getItem(STORE)
      if (s) setSaved(JSON.parse(s))
      const f = localStorage.getItem(FEEDBACK)
      if (f) setFeedback(JSON.parse(f))
    } catch {}
  }, [])

  const openResult = (r: BriefResult) => {
    setResult(r)
    setScreen('brief')
    localStorage.setItem(STORE, JSON.stringify(r))
    setSaved(r)
    window.scrollTo(0, 0)
  }
  const run = (input: BirthInput) => {
    try { openResult(analyze(input)) }
    catch (e) { alert(e instanceof Error ? e.message : 'No pudimos calcular esta carta.') }
  }
  const rate = (id: string, value: Feedback) => {
    const next = { ...feedback, [id]: value }
    setFeedback(next)
    localStorage.setItem(FEEDBACK, JSON.stringify(next))
  }

  const current = result || saved
  return <div className="app">
    <Topo/>
    <header>
      <Brand/>
      {screen !== 'home' && <button className="ghost" onClick={() => setScreen('home')}>← Inicio</button>}
    </header>
    <main>
      {screen === 'home' && <Home saved={saved} onStart={() => setScreen('form')} onResume={() => { if (saved) { setResult(saved); setScreen('brief') } }} onFixture={run}/>} 
      {screen === 'form' && <BirthForm onSubmit={run} onFixture={run}/>} 
      {screen === 'brief' && current && <Brief result={current} feedback={feedback} onRate={rate} onExplore={() => setScreen('explore')} onTrace={() => setTrace(true)}/>} 
      {screen === 'explore' && current && <Explore result={current} onTrace={() => setTrace(true)}/>} 
    </main>
    {screen !== 'form' && <BottomNav active={screen} onHome={() => current ? setScreen('brief') : setScreen('home')} onMap={() => current ? setScreen('explore') : setScreen('form')}/>} 
    {trace && current && <Trace result={current} onClose={() => setTrace(false)}/>} 
  </div>
}

function Home({ saved, onStart, onResume, onFixture }: { saved: BriefResult | null; onStart: () => void; onResume: () => void; onFixture: (i: BirthInput) => void }) {
  return <section className="hero page">
    <div className="kicker">UN ATLAS PERSONAL</div>
    {saved ? <>
      <h1>Bienvenido de nuevo.</h1>
      <p className="lead">Aquí está tu mapa. Puedes volver a tu lectura o calcular otra carta cuando quieras.</p>
      <div className="savedCard">
        <div><small>MAPA GUARDADO</small><h2>{saved.chart.birth.name || 'Tu mapa'}</h2><p>{stemLabel(saved.chart.dayMaster.stem)} · {saved.chart.birth.date}</p></div>
        <button className="primary" onClick={onResume}>Ver mi mapa</button>
      </div>
      <button className="textBtn" onClick={onStart}>+ Calcular otro mapa</button>
    </> : <>
      <h1>Entenderte también puede ser práctico.</h1>
      <p className="lead">Escribe cuándo naciste. Mapa traduce tu carta a cosas que puedes reconocer en cómo decides, trabajas, te relacionas y reaccionas cuando algo importa.</p>
      <button className="primary big" onClick={onStart}>Descubrir mi mapa <span>→</span></button>
    </>}
    <details className="devDetails">
      <summary>Pruebas de desarrollo</summary>
      <p>Estas cartas tienen referencias conocidas y sirven para revisar que el cálculo y los filtros sigan funcionando.</p>
      <div className="fixtureButtons"><button onClick={() => onFixture(fixtures.eber)}>Probar Eber</button><button onClick={() => onFixture(fixtures.anju)}>Probar Anju</button></div>
    </details>
  </section>
}

function BirthForm({ onSubmit, onFixture }: { onSubmit: (i: BirthInput) => void; onFixture: (i: BirthInput) => void }) {
  const [form, setForm] = useState<BirthInput>({ name: '', date: '', time: '', timezone: 'local', place: '', dstAdjustment: false })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const change = (k: keyof BirthInput, v: any) => {
    setForm({ ...form, [k]: v })
    setErrors(prev => ({ ...prev, [k]: '' }))
  }
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const next: Record<string, string> = {}
    if (!form.date) next.date = 'Necesitamos tu fecha de nacimiento.'
    if (!form.time) next.time = 'Necesitamos una hora para calcular la carta completa.'
    if (!form.place?.trim()) next.place = 'Escribe la ciudad o localidad donde naciste.'
    setErrors(next)
    if (Object.keys(next).length) return
    onSubmit({ ...form, timezone: 'local', dstAdjustment: false })
  }

  return <section className="page formPage">
    <div className="formCompass" aria-hidden="true"><i/><i/><span>+</span></div>
    <div className="kicker">TU PUNTO DE PARTIDA</div>
    <h1>Cuéntame cuándo naciste.</h1>
    <p className="lead compact">Usamos tu fecha, hora y lugar de nacimiento para calcular tu mapa.</p>
    <form onSubmit={submit} className="birthForm" noValidate>
      <label className={errors.date ? 'hasError' : ''}>
        <span className="fieldLabel">Fecha de nacimiento</span>
        <input type="date" value={form.date} onChange={e => change('date', e.target.value)} aria-invalid={!!errors.date}/>
        {errors.date && <small className="fieldError">{errors.date}</small>}
      </label>

      <label className={errors.time ? 'hasError' : ''}>
        <span className="fieldLabel">Hora de nacimiento</span>
        <input type="time" value={form.time} onChange={e => change('time', e.target.value)} aria-invalid={!!errors.time}/>
        <small className="fieldHelp">La hora cambia una parte de la carta.</small>
        <details className="timeHelp"><summary>¿No sabes la hora?</summary><p>En esta versión necesitamos una hora para calcular la carta completa. No vamos a inventar una por ti.</p></details>
        {errors.time && <small className="fieldError">{errors.time}</small>}
      </label>

      <label className={errors.place ? 'hasError' : ''}>
        <span className="fieldLabel">¿Dónde naciste?</span>
        <input value={form.place || ''} onChange={e => change('place', e.target.value)} placeholder="León, Guanajuato" aria-invalid={!!errors.place}/>
        <small className="fieldHelp">Ciudad o localidad y país son suficientes por ahora.</small>
        {errors.place && <small className="fieldError">{errors.place}</small>}
      </label>

      <label>
        <span className="fieldLabel">Nombre <em>opcional</em></span>
        <input value={form.name || ''} onChange={e => change('name', e.target.value)} placeholder="¿Cómo te llamas?"/>
      </label>

      <button className="primary big full" type="submit">Ver mi mapa <span>→</span></button>
    </form>

    <details className="devDetails formDev">
      <summary>Pruebas de desarrollo</summary>
      <div className="fixtureButtons"><button onClick={() => onFixture(fixtures.eber)}>Usar Eber</button><button onClick={() => onFixture(fixtures.anju)}>Usar Anju</button></div>
    </details>
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
  const name = result.chart.birth.name?.trim()
  return <section className="page briefPage">
    <div className="mapStamp">MI MAPA EN BREVE</div>
    <h1>{name ? `${name}, estas son las señales que más destacan.` : 'Estas son las señales que más destacan.'}</h1>
    <p className="lead compact">Primero mira la estructura. Después lee cómo la traduce Mapa a situaciones que puedes reconocer en tu día a día.</p>
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
    <button className="primary big" onClick={onExplore}>Seguir explorando mi mapa <span>→</span></button>
    <button className="traceBtn" onClick={onTrace}>Ver trazabilidad de desarrollo</button>
  </section>
}

function Explore({ result, onTrace }: { result: BriefResult; onTrace: () => void }) {
  const c = result.chart
  const elementRows = (Object.entries(c.elements) as [ElementKey, number][]).sort((a, b) => b[1] - a[1])
  const max = Math.max(...elementRows.map(x => x[1]))
  const godRows = (Object.entries(c.tenGods) as [TenGodKey, number][]).filter(x => x[1] > 0).sort((a, b) => b[1] - a[1])
  const maxG = Math.max(1, ...godRows.map(x => x[1]))

  return <section className="page explore">
    <div className="kicker">MI MAPA</div>
    <h1>Ahora mira cada parte.</h1>
    <p className="lead compact">Cada sección responde una pregunta distinta. Los números sirven para calcular; el texto explica qué puede cambiar en tu manera de responder.</p>

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
function BottomNav({ active, onHome, onMap }: { active: Screen; onHome: () => void; onMap: () => void }) {
  return <nav className="bottom"><button className={active === 'brief' || active === 'home' ? 'active' : ''} onClick={onHome}><i>⌖</i><span>Aquí</span></button><button className={active === 'explore' ? 'active' : ''} onClick={onMap}><i>◇</i><span>Mi mapa</span></button><button disabled><i>▦</i><span>Calendario</span></button><button disabled><i>↗</i><span>Mi ruta</span></button><button disabled><i>•••</i><span>Más</span></button></nav>
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
