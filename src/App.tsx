import { useEffect, useState } from 'react'
import { analyze, elementMeta, fixtures, pillarLabel, stemLabel, tenGodMeta, type BirthInput, type BriefResult, type ElementKey, type TenGodKey } from './engine'

type Screen='home'|'form'|'brief'|'explore'
type Feedback='Muchísimo'|'Bastante'|'Poco'
const STORE='mapa.saved.v1', FEEDBACK='mapa.feedback.v1'

function Topo(){return <div className="topo" aria-hidden="true"><span/><span/><span/><span/></div>}
function Brand(){return <div className="brand"><div className="brandMark">M</div><b>MAPA</b></div>}
function Pill({children}:{children:any}){return <span className="pill">{children}</span>}

function App(){
  const [screen,setScreen]=useState<Screen>('home')
  const [result,setResult]=useState<BriefResult|null>(null)
  const [saved,setSaved]=useState<BriefResult|null>(null)
  const [trace,setTrace]=useState(false)
  const [feedback,setFeedback]=useState<Record<string,Feedback>>({})
  useEffect(()=>{try{const s=localStorage.getItem(STORE);if(s)setSaved(JSON.parse(s));const f=localStorage.getItem(FEEDBACK);if(f)setFeedback(JSON.parse(f))}catch{}},[])
  const openResult=(r:BriefResult)=>{setResult(r);setScreen('brief');localStorage.setItem(STORE,JSON.stringify(r));setSaved(r);window.scrollTo(0,0)}
  const run=(input:BirthInput)=>{try{openResult(analyze(input))}catch(e){alert(e instanceof Error?e.message:'No pudimos calcular esta carta.')}}
  const rate=(id:string,value:Feedback)=>{const next={...feedback,[id]:value};setFeedback(next);localStorage.setItem(FEEDBACK,JSON.stringify(next))}
  const current=result||saved
  return <div className="app"><Topo/><header><Brand/>{screen!=='home'&&<button className="ghost" onClick={()=>setScreen('home')}>← Inicio</button>}</header>
    <main>
      {screen==='home'&&<Home saved={saved} onStart={()=>setScreen('form')} onResume={()=>{if(saved){setResult(saved);setScreen('brief')}}} onFixture={run}/>} 
      {screen==='form'&&<BirthForm onSubmit={run} onFixture={run}/>} 
      {screen==='brief'&&current&&<Brief result={current} feedback={feedback} onRate={rate} onExplore={()=>setScreen('explore')} onTrace={()=>setTrace(true)}/>} 
      {screen==='explore'&&current&&<Explore result={current} onTrace={()=>setTrace(true)}/>} 
    </main>
    {screen!=='form'&&<BottomNav active={screen} onHome={()=>current?setScreen('brief'):setScreen('home')} onMap={()=>current?setScreen('explore'):setScreen('form')}/>} 
    {trace&&current&&<Trace result={current} onClose={()=>setTrace(false)}/>} 
  </div>
}

function Home({saved,onStart,onResume,onFixture}:{saved:BriefResult|null;onStart:()=>void;onResume:()=>void;onFixture:(i:BirthInput)=>void}){
  return <section className="hero page">
    <div className="kicker">UN ATLAS PERSONAL</div>
    {saved?<><h1>Bienvenido de nuevo.</h1><p className="lead">Aquí está tu mapa. Puedes volver a tu lectura o calcular otra carta cuando quieras.</p><div className="savedCard"><div><small>MAPA GUARDADO</small><h2>{saved.chart.birth.name||'Tu mapa'}</h2><p>{stemLabel(saved.chart.dayMaster.stem)} · {saved.chart.birth.date}</p></div><button className="primary" onClick={onResume}>Ver mi mapa</button></div><button className="textBtn" onClick={onStart}>+ Calcular otro mapa</button></>:<><h1>Entenderte también puede ser práctico.</h1><p className="lead">Escribe cuándo naciste. Mapa traduce tu carta BaZi a cosas que puedes reconocer en cómo decides, trabajas, te relacionas y reaccionas cuando algo importa.</p><button className="primary big" onClick={onStart}>Descubrir mi mapa <span>→</span></button></>}
    <div className="rule"/><div className="devBlock"><span>PRUEBAS DE DESARROLLO</span><p>Estas dos cartas ya tienen referencias humanas validadas y nos sirven para comprobar que el motor siga diciendo cosas coherentes.</p><div className="fixtureButtons"><button onClick={()=>onFixture(fixtures.eber)}>Probar Eber</button><button onClick={()=>onFixture(fixtures.anju)}>Probar Anju</button></div></div>
  </section>
}

function BirthForm({onSubmit,onFixture}:{onSubmit:(i:BirthInput)=>void;onFixture:(i:BirthInput)=>void}){
  const [form,setForm]=useState<BirthInput>({name:'',date:'',time:'12:00',timezone:'America/Mexico_City',place:'',dstAdjustment:false})
  const change=(k:keyof BirthInput,v:any)=>setForm({...form,[k]:v})
  return <section className="page formPage"><div className="kicker">PRIMER PUNTO</div><h1>¿Cuándo naciste?</h1><p className="lead compact">Usamos tu fecha y hora para calcular los cuatro pilares. Todo se procesa en tu dispositivo.</p>
    <form onSubmit={e=>{e.preventDefault();onSubmit(form)}} className="birthForm">
      <label>Tu nombre <span>opcional</span><input value={form.name} onChange={e=>change('name',e.target.value)} placeholder="¿Cómo te llamas?"/></label>
      <div className="two"><label>Fecha de nacimiento<input type="date" required value={form.date} onChange={e=>change('date',e.target.value)}/></label><label>Hora de nacimiento<input type="time" required value={form.time} onChange={e=>change('time',e.target.value)}/></label></div>
      <label>Lugar <span>para guardar el contexto</span><input value={form.place} onChange={e=>change('place',e.target.value)} placeholder="León, Guanajuato"/></label>
      <label>Zona horaria<select value={form.timezone} onChange={e=>change('timezone',e.target.value)}><option value="America/Mexico_City">México centro</option><option value="America/Tijuana">Tijuana</option><option value="America/Cancun">Cancún</option><option value="America/Bogota">Bogotá / Lima</option><option value="America/New_York">Nueva York</option><option value="America/Los_Angeles">Los Ángeles</option><option value="Europe/Madrid">Madrid</option><option value="UTC">UTC</option></select></label>
      <label className="check"><input type="checkbox" checked={!!form.dstAdjustment} onChange={e=>change('dstAdjustment',e.target.checked)}/><span><b>Restar una hora para el cálculo</b><small>Úsalo solo cuando tu referencia de BaZi indique un ajuste histórico de horario de verano. El fixture de Eber lo necesita.</small></span></label>
      <button className="primary big" type="submit">Ver mi mapa <span>→</span></button>
    </form><div className="fixtureLine"><button onClick={()=>onFixture(fixtures.eber)}>Usar Eber</button><button onClick={()=>onFixture(fixtures.anju)}>Usar Anju</button></div>
  </section>
}

function Brief({result,feedback,onRate,onExplore,onTrace}:{result:BriefResult;feedback:Record<string,Feedback>;onRate:(id:string,v:Feedback)=>void;onExplore:()=>void;onTrace:()=>void}){
  const name=result.chart.birth.name?.trim();return <section className="page briefPage"><div className="mapStamp">MI MAPA EN BREVE</div><h1>{name?`${name}, esto es lo que más pesa en tu mapa.`:'Esto es lo que más pesa en tu mapa.'}</h1><p className="lead compact">Empieza por estas seis observaciones. La parte técnica está debajo; aquí queremos ver si te reconoces.</p>
    <div className="insights">{result.insights.map((x,i)=><article className="insight" key={x.id}><div className="num">0{i+1}</div><h2>{x.headline}</h2><p>{x.body}</p><div className="feedback"><span>¿Qué tanto te reconociste?</span><div>{(['Muchísimo','Bastante','Poco'] as Feedback[]).map(v=><button key={v} className={feedback[x.id]===v?'selected':''} onClick={()=>onRate(x.id,v)}>{v}</button>)}</div></div></article>)}</div>
    {result.insights.length<6&&<div className="devNotice">El motor aprobó {result.insights.length} observaciones. Durante desarrollo preferimos mostrar menos antes que rellenar con una frase genérica.</div>}
    <button className="primary big" onClick={onExplore}>Seguir explorando mi mapa <span>→</span></button><button className="traceBtn" onClick={onTrace}>Ver trazabilidad de desarrollo</button>
  </section>
}

function Explore({result,onTrace}:{result:BriefResult;onTrace:()=>void}){const c=result.chart;const elementRows=(Object.entries(c.elements) as [ElementKey,number][]).sort((a,b)=>b[1]-a[1]);const max=Math.max(...elementRows.map(x=>x[1]));const godRows=(Object.entries(c.tenGods) as [TenGodKey,number][]).filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1]);const maxG=Math.max(1,...godRows.map(x=>x[1]));
  return <section className="page explore"><div className="kicker">MI MAPA</div><h1>Ahora mira de dónde sale.</h1><p className="lead compact">Cada sección responde una pregunta distinta. Los números técnicos sirven para calcular; el texto te cuenta qué puede significar en tu vida diaria.</p>
    <Section title="Tu centro" tag={stemLabel(c.dayMaster.stem)}><h3>{centerHeadline(c.dayMaster.stem)}</h3><p>{centerBody(c.dayMaster.stem)}</p><div className="facts"><Pill>{c.dayMaster.strength}</Pill><span>{c.dayMaster.strengthStatus==='PENDING_EXTRACTION'?'La fuerza completa sigue en validación para cartas nuevas.':'Estado tomado de la carta de referencia.'}</span></div></Section>
    <Section title="Tu mezcla" tag="5 elementos"><h3>¿Qué cosas te salen fácil y cuáles te cuesta más poner en práctica?</h3><div className="elementList">{elementRows.map(([k,v])=><div className="elementRow" key={k}><div><b>{elementMeta[k].label}</b><span>{elementMeta[k].root}</span></div><div className="bar"><i style={{width:`${Math.max(12,v/max*100)}%`,background:elementMeta[k].color}}/></div><small>{v===max?'más presente':v<=2?'menos presente':'presente'}</small></div>)}</div></Section>
    <Section title="Tus formas de actuar" tag="10 respuestas"><p>Cuando tienes que decidir, resolver algo, trabajar con alguien o reaccionar ante un problema, hay respuestas que te salen más fácil que otras.</p><div className="formCards">{godRows.slice(0,6).map(([k,v])=><div key={k}><div className="formHead"><b>{tenGodMeta[k].name}</b><small>{tenGodMeta[k].territory}</small></div><p>{tenGodMeta[k].root}</p><div className="microbar"><i style={{width:`${v/maxG*100}%`}}/></div></div>)}</div></Section>
    <Section title="Tus territorios" tag="5 contextos"><div className="territories">{territoryData(c.tenGods).map(t=><div key={t.name}><span>{t.name}</span><b>{t.question}</b><small>{t.level}</small></div>)}</div></Section>
    <Section title="Tus cuatro puntos" tag="4 pilares"><div className="points">{(['year','month','day','hour'] as const).map(k=>{const data=pointMeta[k];return <div key={k}><span>{data.title}</span><h3>{pillarLabel(c.pillars[k])}</h3><p>{data.copy}</p></div>})}</div></Section>
    <Section title="Lo que aparece entre líneas" tag={`${c.interactions.length} relaciones`}><p>Algunas cosas solo aparecen cuando miramos varias partes juntas. El motor comprueba la relación y sus condiciones antes de dejarla influir en una frase.</p>{c.interactions.length?<div className="interactionList">{c.interactions.map(i=><div key={i.id}><b>{i.kind}</b><span>{i.note}</span><small>{i.pillars.join(' · ')}</small></div>)}</div>:<p className="muted">En esta primera pasada no encontramos una interacción que merezca destacarse.</p>}</Section>
    <Section title="Leyenda técnica" tag="BaZi"><div className="legendGrid">{(['year','month','day','hour'] as const).map(k=><div key={k}><small>{k.toUpperCase()}</small><b>{pillarLabel(c.pillars[k])}</b><span>Ocultos: {c.pillars[k].hidden.map(stemLabel).join(', ')}</span></div>)}</div><div className={`calcStatus ${c.calculation.status}`}>{c.calculation.note}</div></Section>
    <button className="traceBtn" onClick={onTrace}>Abrir trazabilidad completa</button>
  </section>}

function Section({title,tag,children}:{title:string;tag:string;children:any}){return <article className="sectionCard"><div className="sectionTitle"><h2>{title}</h2><Pill>{tag}</Pill></div>{children}</article>}

function Trace({result,onClose}:{result:BriefResult;onClose:()=>void}){return <div className="modal"><div className="tracePanel"><div className="traceTop"><div><small>SOLO DESARROLLO</small><h2>Trazabilidad</h2></div><button onClick={onClose}>×</button></div><p>Cada frase conserva la raíz técnica que la produjo. Los candidatos descartados también quedan visibles para detectar por qué el motor decidió callarse.</p><h3>Aprobados</h3>{result.insights.map(x=><TraceItem key={x.id} x={x}/>) }<h3>Descartados</h3>{result.rejected.map(x=><TraceItem key={x.id} x={x}/>) }<h3>Cálculo</h3><pre>{JSON.stringify({birth:result.chart.birth,pillars:result.chart.pillars,dayMaster:result.chart.dayMaster,elements:result.chart.elements,tenGods:result.chart.tenGods,interactions:result.chart.interactions,calculation:result.chart.calculation},null,2)}</pre></div></div>}
function TraceItem({x}:{x:any}){return <div className="traceItem"><b>{x.id}</b><span>{x.status} · {x.sourceStatus}</span><p>{x.headline}</p><code>{x.sourceRule} · score {x.score.toFixed(1)} · discr {x.discrimination} · claridad {x.clarity}</code></div>}
function BottomNav({active,onHome,onMap}:{active:Screen;onHome:()=>void;onMap:()=>void}){return <nav className="bottom"><button className={active==='brief'||active==='home'?'active':''} onClick={onHome}><i>⌖</i><span>Aquí</span></button><button className={active==='explore'?'active':''} onClick={onMap}><i>◇</i><span>Mi mapa</span></button><button disabled><i>▦</i><span>Calendario</span></button><button disabled><i>↗</i><span>Mi ruta</span></button><button disabled><i>•••</i><span>Más</span></button></nav>}

const centerHeadline=(s:any)=>({wu:'Cuando te comprometes con algo, tiendes a sostenerlo y seguir hasta encontrar la manera de que funcione.',yi:'Puedes cambiar la forma de llegar sin perder de vista lo que querías conseguir.',jia:'Cuando eliges una dirección, te cuesta abandonarla a la primera dificultad.',bing:'Cuando algo te entusiasma, se te nota y puedes hacer que otros también se enganchen.',ding:'Sueles arrancar mejor cuando ya entendiste cómo quieres hacer las cosas.',ji:'Cuando algo depende de cuidados pequeños y constantes, sueles darte cuenta de lo que hace falta.',geng:'Cuando ya sabes qué sobra, te resulta más fácil cortarlo y seguir.',xin:'Sueles notar detalles que otras personas dejan pasar.',ren:'Cuando aparece un problema, tu cabeza suele abrir varias rutas a la vez.',gui:'Sueles encontrar salidas que no eran la ruta más obvia.'}[s]||'')
const centerBody=(s:any)=>({wu:'Tu base tiende a apoyarse en la constancia, la responsabilidad y el criterio propio. Cuando algo realmente te importa, también puedes sostenerlo durante más tiempo del que te conviene.',yi:'Adaptarte te sale como estrategia. Puedes negociar la forma, cambiar de ruta y seguir cuidando lo que realmente querías conseguir.',jia:'Te sale avanzar con una dirección clara y seguir mientras veas que todavía tiene sentido.',bing:'Te sale poner energía visible en lo que quieres mover y contagiar impulso cuando algo necesita arrancar.',ding:'Te sirve preparar, cuidar detalles y construir confianza antes de exponerte del todo.',ji:'Te sale mantener, ajustar y cuidar lo necesario para que algo siga funcionando.',geng:'Bajo presión puedes volverte directo para decidir qué sirve, qué estorba y qué toca hacer.',xin:'Antes de dar algo por terminado, te sale revisar la forma, la precisión y los detalles.',ren:'Te sale conectar información, personas y opciones mientras sigues avanzando.',gui:'Te sale leer el contexto, conectar señales pequeñas y cambiar de enfoque cuando aparece información nueva.'}[s]||'')
const pointMeta={year:{title:'Tu origen',copy:'Aquí miramos cómo te mueves con tu familia extensa, tus amistades, tus grupos y el ambiente donde trabajas.'},month:{title:'Tu trayectoria',copy:'Aquí miramos qué haces cuando hay trabajo, responsabilidades y resultados de por medio.'},day:{title:'Tu centro',copy:'Aquí miramos lo que pasa cuando el asunto eres tú o alguien realmente cercano a ti.'},hour:{title:'Tu futuro',copy:'Aquí miramos lo que quieres desarrollar, cuidar o dejar construido con el tiempo.'}}
function territoryData(g:Record<TenGodKey,number>){const data=[['Vínculos','¿Qué haces cuando tienes que decidir, colaborar o competir con alguien más?',['bi_jian','jie_cai']],['Expresión','¿Qué haces con una idea después de tenerla?',['shi_shen','shang_guan']],['Recursos','¿Cómo decides dónde poner tu dinero, tu trabajo o tu esfuerzo?',['pian_cai','zheng_cai']],['Estructura','¿Qué haces cuando hay reglas, presión o una responsabilidad encima?',['qi_sha','zheng_guan']],['Perspectiva','¿Cómo intentas entender algo antes de decidir qué hacer?',['pian_yin','zheng_yin']]] as any[];const vals=data.map(x=>({name:x[0],question:x[1],v:g[x[2][0] as TenGodKey]+g[x[2][1] as TenGodKey]}));const max=Math.max(1,...vals.map(x=>x.v));return vals.map(x=>({...x,level:x.v===max?'aparece mucho':x.v<=1?'aparece poco':'aparece'}))}

export default App
