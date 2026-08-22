import { Solar } from 'lunar-javascript'

export type ElementKey = 'wood' | 'fire' | 'earth' | 'metal' | 'water'
export type Polarity = 'yang' | 'yin'
export type StemKey = 'jia'|'yi'|'bing'|'ding'|'wu'|'ji'|'geng'|'xin'|'ren'|'gui'
export type BranchKey = 'rat'|'ox'|'tiger'|'rabbit'|'dragon'|'snake'|'horse'|'goat'|'monkey'|'rooster'|'dog'|'pig'
export type TenGodKey = 'bi_jian'|'jie_cai'|'shi_shen'|'shang_guan'|'pian_cai'|'zheng_cai'|'qi_sha'|'zheng_guan'|'pian_yin'|'zheng_yin'
export type SourceStatus = 'SOURCE_LOCKED'|'MAPA_SEMANTIC'|'NEEDS_VALIDATION'|'VALIDATED'|'VALIDATED_STRONG_SPECIFIC'|'PENDING_EXTRACTION'|'SOURCE_CONFLICT'|'PARTIAL_MATCH'

export type BirthInput = {
  name?: string
  date: string
  time: string
  timezone: string
  place?: string
  dstAdjustment?: boolean
}

export type Pillar = { stem: StemKey; branch: BranchKey; hidden: StemKey[] }
export type Interaction = { id: string; kind: string; branches: BranchKey[]; pillars: string[]; sourceStatus: SourceStatus; note: string }
export type ChartSnapshot = {
  birth: BirthInput & { calculationTime: string }
  pillars: { year: Pillar; month: Pillar; day: Pillar; hour: Pillar }
  dayMaster: { stem: StemKey; element: ElementKey; polarity: Polarity; strength: string; strengthStatus: SourceStatus }
  elements: Record<ElementKey, number>
  tenGods: Record<TenGodKey, number>
  interactions: Interaction[]
  calculation: { status: 'verified_fixture'|'library_match'|'library_unverified'|'fixture_fallback'; note: string }
}

export type SemanticSignal = {
  id: string
  sourceRule: string
  sourceStatus: SourceStatus
  family: 'day_master'|'element'|'ten_god'|'interaction'
  behavior: string
  context?: string
  activator?: string
  friction?: string
  sourceFamily: string
  strength: number
  confidence: number
  discrimination: number
  clarity: number
  canSurfaceDirectly: boolean
}

export type InterpretationCandidate = SemanticSignal & {
  headline: string
  body: string
  technicalScore: number
  score: number
  status: 'candidate'|'approved'|'rejected_barnum'|'rejected_conflict'|'rejected_redundant'
}

export type BriefResult = { chart: ChartSnapshot; insights: InterpretationCandidate[]; rejected: InterpretationCandidate[] }

const stems: Record<StemKey,{han:string;element:ElementKey;polarity:Polarity;label:string}> = {
  jia:{han:'甲',element:'wood',polarity:'yang',label:'Madera Yang'}, yi:{han:'乙',element:'wood',polarity:'yin',label:'Madera Yin'},
  bing:{han:'丙',element:'fire',polarity:'yang',label:'Fuego Yang'}, ding:{han:'丁',element:'fire',polarity:'yin',label:'Fuego Yin'},
  wu:{han:'戊',element:'earth',polarity:'yang',label:'Tierra Yang'}, ji:{han:'己',element:'earth',polarity:'yin',label:'Tierra Yin'},
  geng:{han:'庚',element:'metal',polarity:'yang',label:'Metal Yang'}, xin:{han:'辛',element:'metal',polarity:'yin',label:'Metal Yin'},
  ren:{han:'壬',element:'water',polarity:'yang',label:'Agua Yang'}, gui:{han:'癸',element:'water',polarity:'yin',label:'Agua Yin'},
}
const branches: Record<BranchKey,{han:string;label:string;hidden:StemKey[]}> = {
  rat:{han:'子',label:'Rata',hidden:['gui']}, ox:{han:'丑',label:'Buey',hidden:['ji','gui','xin']}, tiger:{han:'寅',label:'Tigre',hidden:['jia','bing','wu']},
  rabbit:{han:'卯',label:'Conejo',hidden:['yi']}, dragon:{han:'辰',label:'Dragón',hidden:['wu','yi','gui']}, snake:{han:'巳',label:'Víbora',hidden:['bing','wu','geng']},
  horse:{han:'午',label:'Caballo',hidden:['ding','ji']}, goat:{han:'未',label:'Cabra',hidden:['ji','ding','yi']}, monkey:{han:'申',label:'Mono',hidden:['geng','ren','wu']},
  rooster:{han:'酉',label:'Gallo',hidden:['xin']}, dog:{han:'戌',label:'Perro',hidden:['wu','xin','ding']}, pig:{han:'亥',label:'Cerdo',hidden:['ren','jia']},
}
const hanStem = Object.fromEntries(Object.entries(stems).map(([k,v])=>[v.han,k])) as Record<string,StemKey>
const hanBranch = Object.fromEntries(Object.entries(branches).map(([k,v])=>[v.han,k])) as Record<string,BranchKey>

export const elementMeta: Record<ElementKey,{label:string;article:string;root:string;color:string;wash:string}> = {
  wood:{label:'Madera',article:'la madera',root:'La madera te ayuda a empezar algo y seguir haciéndolo crecer.',color:'#4F7A52',wash:'#E3EBD8'},
  fire:{label:'Fuego',article:'el fuego',root:'El fuego te ayuda a moverte cuando algo necesita cambiar.',color:'#C65A3D',wash:'#F6DED2'},
  earth:{label:'Tierra',article:'la tierra',root:'La tierra te ayuda a mantener algo funcionando aunque requiera tiempo.',color:'#B28747',wash:'#F1E3C6'},
  metal:{label:'Metal',article:'el metal',root:'El metal te ayuda a decidir y hacer algo con esa decisión.',color:'#66707A',wash:'#ECEFF1'},
  water:{label:'Agua',article:'el agua',root:'El agua te ayuda a pensar un problema desde más de un ángulo.',color:'#2E5E7E',wash:'#DCEAF0'},
}

export const tenGodMeta: Record<TenGodKey,{name:string;territory:string;root:string}> = {
  bi_jian:{name:'Espejo',territory:'Vínculos',root:'Cuando una decisión te afecta directamente, sueles pensar primero qué quieres tú antes de preguntar qué harían los demás.'},
  jie_cai:{name:'Contrapunto',territory:'Vínculos',root:'Ver lo que otra persona quiere o propone te ayuda a descubrir con más claridad qué quieres tú.'},
  shi_shen:{name:'Flujo',territory:'Expresión',root:'Cuando una idea te interesa, te sale desarrollarla y convertirla en algo que puedas crear, explicar o compartir.'},
  shang_guan:{name:'Impacto',territory:'Expresión',root:'Cuando ves algo que podría hacerse mejor, te cuesta dejarlo pasar.'},
  pian_cai:{name:'Oportunidad',territory:'Recursos',root:'Cuando aparece una posibilidad nueva, la detectas rápido y te dan ganas de ver hasta dónde puede llegar.'},
  zheng_cai:{name:'Concreción',territory:'Recursos',root:'Antes de comprometer dinero o trabajo, te gusta saber qué va a salir de ahí y cómo se va a sostener.'},
  qi_sha:{name:'Desafío',territory:'Estructura',root:'Cuando algo se complica, puedes reaccionar con más fuerza y decisión de la que muestras cuando todo está tranquilo.'},
  zheng_guan:{name:'Orden',territory:'Estructura',root:'Cuando las reglas y responsabilidades están claras, te resulta mucho más fácil avanzar.'},
  pian_yin:{name:'Intuición',territory:'Perspectiva',root:'Sueles guardar detalles que parecen pequeños y después conectarlos cuando necesitas encontrar una respuesta.'},
  zheng_yin:{name:'Aprendizaje',territory:'Perspectiva',root:'Cuando algo te importa, te sirve entender bien cómo funciona antes de empezar a mover piezas.'},
}

const dmCopy: Record<StemKey,{headline:string;body:string;friction:string}> = {
  jia:{headline:'Cuando eliges una dirección, te cuesta abandonarla a la primera dificultad.',body:'Te sale avanzar con una idea clara de hacia dónde quieres ir y seguir empujando mientras veas que todavía tiene sentido.',friction:'Puedes tardar en revisar una dirección porque ya invertiste mucho en sostenerla.'},
  yi:{headline:'Puedes cambiar la forma de llegar sin perder de vista lo que querías conseguir.',body:'Adaptarte te sale como estrategia: miras qué hay disponible, encuentras margen y ajustas la ruta cuando hace falta.',friction:'Adaptarte tanto puede hacer que otros tarden en notar dónde están tus límites.'},
  bing:{headline:'Cuando algo te entusiasma, se te nota y puedes hacer que otros también se enganchen.',body:'Te sale poner energía visible en lo que quieres mover y contagiar impulso cuando un proyecto necesita arrancar.',friction:'Puedes mantener el acelerador puesto cuando ya convendría bajar el ritmo.'},
  ding:{headline:'Sueles arrancar mejor cuando ya entendiste cómo quieres hacer las cosas.',body:'Te sirve preparar, cuidar detalles y construir confianza antes de exponerte del todo.',friction:'Puedes esperar demasiado a sentir que todo está listo.'},
  wu:{headline:'Cuando te comprometes con algo, tiendes a sostenerlo y seguir hasta encontrar la manera de que funcione.',body:'La constancia aparece con facilidad cuando sientes que algo vale la pena o depende de ti.',friction:'Cuando algo realmente te importa, puedes terminar sosteniendo mucho más de lo que deberías.'},
  ji:{headline:'Cuando algo depende de cuidados pequeños y constantes, sueles darte cuenta de lo que hace falta.',body:'Te sale planear, mantener y ajustar cosas sobre la marcha para que sigan funcionando.',friction:'Puedes ocuparte tanto de lo que necesita todo lo demás que postergues lo tuyo.'},
  geng:{headline:'Cuando ya sabes qué sobra, te resulta más fácil cortarlo y seguir.',body:'Bajo presión puedes volverte muy directo para decidir qué sirve, qué estorba y qué toca hacer.',friction:'Puedes cerrar una opción antes de escuchar información que habría cambiado la decisión.'},
  xin:{headline:'Sueles notar detalles que otras personas dejan pasar.',body:'Antes de dar algo por terminado, te sale revisar la forma, la precisión y si cada parte quedó como querías.',friction:'Puedes seguir corrigiendo cuando el resultado ya funciona.'},
  ren:{headline:'Cuando aparece un problema, tu cabeza suele abrir varias rutas a la vez.',body:'Te sale conectar información, personas y opciones mientras sigues avanzando.',friction:'Puedes abrir más frentes de los que alcanzas a cerrar.'},
  gui:{headline:'Sueles encontrar salidas que no eran la ruta más obvia.',body:'Te sale leer el contexto, conectar señales pequeñas y cambiar de enfoque cuando aparece información nueva.',friction:'Puedes seguir explorando posibilidades cuando ya necesitas escoger una.'},
}

const generatedBy: Record<ElementKey,ElementKey> = { wood:'water', fire:'wood', earth:'fire', metal:'earth', water:'metal' }
const generates: Record<ElementKey,ElementKey> = { wood:'fire', fire:'earth', earth:'metal', metal:'water', water:'wood' }
const controls: Record<ElementKey,ElementKey> = { wood:'earth', earth:'water', water:'fire', fire:'metal', metal:'wood' }

function tenGod(day: StemKey, target: StemKey): TenGodKey {
  const d=stems[day], t=stems[target], same=d.polarity===t.polarity
  if (d.element===t.element) return same?'bi_jian':'jie_cai'
  if (generates[d.element]===t.element) return same?'shi_shen':'shang_guan'
  if (controls[d.element]===t.element) return same?'pian_cai':'zheng_cai'
  if (controls[t.element]===d.element) return same?'qi_sha':'zheng_guan'
  if (generatedBy[d.element]===t.element) return same?'pian_yin':'zheng_yin'
  return 'bi_jian'
}

function shiftHour(time:string, delta:number){
  const [h,m]=time.split(':').map(Number); const total=(h*60+m+delta*60+1440)%1440
  return `${String(Math.floor(total/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`
}

function libraryPillars(date:string,time:string){
  const [y,m,d]=date.split('-').map(Number), [hh,mm]=time.split(':').map(Number)
  const ec = Solar.fromYmdHms(y,m,d,hh,mm,0).getLunar().getEightChar()
  const p=(gan:string,zhi:string):Pillar=>{
    const stem=hanStem[gan], branch=hanBranch[zhi]
    if(!stem||!branch) throw new Error(`Pilar no reconocido: ${gan}${zhi}`)
    return {stem,branch,hidden:branches[branch].hidden}
  }
  return {year:p(ec.getYearGan(),ec.getYearZhi()),month:p(ec.getMonthGan(),ec.getMonthZhi()),day:p(ec.getDayGan(),ec.getDayZhi()),hour:p(ec.getTimeGan(),ec.getTimeZhi())}
}

const fixtureDefs = {
  eber:{ date:'1996-07-20', time:'11:45', calculationTime:'10:45', pillars:{year:{stem:'bing',branch:'rat'},month:{stem:'yi',branch:'goat'},day:{stem:'wu',branch:'horse'},hour:{stem:'ding',branch:'snake'}}, strength:'Fuerte' },
  anju:{ date:'2000-04-27', time:'02:00', calculationTime:'02:00', pillars:{year:{stem:'geng',branch:'dragon'},month:{stem:'geng',branch:'dragon'},day:{stem:'yi',branch:'rabbit'},hour:{stem:'ding',branch:'ox'}}, strength:'Próspero' },
} as const

export const fixtures: Record<'eber'|'anju',BirthInput> = {
  eber:{name:'Eber',date:'1996-07-20',time:'11:45',timezone:'America/Mexico_City',place:'León, Guanajuato',dstAdjustment:true},
  anju:{name:'Anju',date:'2000-04-27',time:'02:00',timezone:'America/Mexico_City',place:'México',dstAdjustment:false},
}

function fixtureFor(input:BirthInput){
  if(input.date===fixtureDefs.eber.date && input.time===fixtureDefs.eber.time) return 'eber' as const
  if(input.date===fixtureDefs.anju.date && input.time===fixtureDefs.anju.time) return 'anju' as const
  return null
}
function withHidden<T extends {stem:StemKey;branch:BranchKey}>(p:T):Pillar{return {...p,hidden:branches[p.branch].hidden}}
function samePillars(a:any,b:any){return ['year','month','day','hour'].every(k=>a[k].stem===b[k].stem&&a[k].branch===b[k].branch)}

function detectInteractions(p:{year:Pillar;month:Pillar;day:Pillar;hour:Pillar}):Interaction[]{
  const entries=(Object.entries(p) as [string,Pillar][]), out:Interaction[]=[]
  const pairSets:{kind:string;pairs:[BranchKey,BranchKey][];status:SourceStatus}[]=[
    {kind:'armonía',status:'SOURCE_LOCKED',pairs:[['rat','ox'],['tiger','pig'],['rabbit','dog'],['dragon','rooster'],['snake','monkey'],['horse','goat']]},
    {kind:'choque',status:'SOURCE_LOCKED',pairs:[['rat','horse'],['ox','goat'],['tiger','monkey'],['rabbit','rooster'],['dragon','dog'],['snake','pig']]},
    {kind:'daño',status:'SOURCE_LOCKED',pairs:[['rat','goat'],['ox','horse'],['tiger','snake'],['rabbit','dragon'],['rooster','dog'],['monkey','pig']]},
    {kind:'destrucción',status:'SOURCE_LOCKED',pairs:[['rat','rooster'],['ox','dragon'],['tiger','pig'],['horse','rabbit'],['goat','dog'],['snake','monkey']]},
  ]
  for(let i=0;i<entries.length;i++) for(let j=i+1;j<entries.length;j++){
    const [pi,a]=entries[i],[pj,b]=entries[j]
    for(const set of pairSets){ if(set.pairs.some(([x,y])=>(a.branch===x&&b.branch===y)||(a.branch===y&&b.branch===x))) out.push({id:`${set.kind}-${pi}-${pj}`,kind:set.kind,branches:[a.branch,b.branch],pillars:[pi,pj],sourceStatus:set.status,note:`${branches[a.branch].label} + ${branches[b.branch].label}`}) }
    if(a.branch===b.branch && ['dragon','horse','rooster','pig'].includes(a.branch) && j===i+1){
      out.push({id:`autocastigo-${a.branch}-${pi}-${pj}`,kind:'autocastigo',branches:[a.branch,b.branch],pillars:[pi,pj],sourceStatus:a.branch==='dragon'?'VALIDATED_STRONG_SPECIFIC':'SOURCE_LOCKED',note:`${branches[a.branch].label} repetido en pilares adyacentes`})
    }
  }
  const branchList=entries.map(([,v])=>v.branch), month=p.month.branch
  const triples:{kind:string;set:BranchKey[];note:string}[]=[
    {kind:'tres armonías',set:['tiger','horse','dog'],note:'produce el fuego'}, {kind:'tres armonías',set:['pig','rabbit','goat'],note:'produce la madera'},
    {kind:'tres armonías',set:['monkey','rat','dragon'],note:'produce el agua'}, {kind:'tres armonías',set:['snake','rooster','ox'],note:'produce el metal'},
    {kind:'estación',set:['tiger','rabbit','dragon'],note:'refuerza la madera'}, {kind:'estación',set:['snake','horse','goat'],note:'refuerza el fuego'},
    {kind:'estación',set:['monkey','rooster','dog'],note:'refuerza el metal'}, {kind:'estación',set:['pig','rat','ox'],note:'refuerza el agua'},
  ]
  for(const t of triples) if(t.set.every(x=>branchList.includes(x)) && (t.kind!=='estación'||t.set.includes(month))) out.push({id:`${t.kind}-${t.set.join('-')}`,kind:t.kind,branches:t.set,pillars:entries.filter(([,v])=>t.set.includes(v.branch)).map(([k])=>k),sourceStatus:'SOURCE_LOCKED',note:t.note})
  return out
}

export function calculateChart(input:BirthInput):ChartSnapshot{
  const fx=fixtureFor(input), calcTime=input.dstAdjustment?shiftHour(input.time,-1):input.time
  let lib:any=null, libError=''
  try{ lib=libraryPillars(input.date,calcTime) }catch(e){ libError=e instanceof Error?e.message:String(e) }
  let pillars:any=lib, calculation:ChartSnapshot['calculation']={status:'library_unverified',note:'Pilares calculados localmente con lunar-javascript. Falta ampliar la batería de referencias.'}, strength='Pendiente', strengthStatus:SourceStatus='PENDING_EXTRACTION'
  if(fx){
    const def=fixtureDefs[fx], expected={year:withHidden(def.pillars.year),month:withHidden(def.pillars.month),day:withHidden(def.pillars.day),hour:withHidden(def.pillars.hour)}
    strength=def.strength; strengthStatus='SOURCE_LOCKED'
    if(lib && samePillars(lib,expected)){pillars=lib;calculation={status:'verified_fixture',note:'El cálculo de la librería coincide con la carta de referencia suministrada.'}}
    else {pillars=expected;calculation={status:'fixture_fallback',note:`La referencia suministrada se conserva como autoridad para este fixture. ${libError||'La librería no reprodujo los cuatro pilares esperados.'}`}}
  }
  if(!pillars) throw new Error('No pudimos calcular los pilares con los datos ingresados.')
  const day=pillars.day.stem as StemKey
  const elements={wood:0,fire:0,earth:0,metal:0,water:0} as Record<ElementKey,number>
  const gods=Object.fromEntries(Object.keys(tenGodMeta).map(k=>[k,0])) as Record<TenGodKey,number>
  for(const [pos,p] of Object.entries(pillars) as [string,Pillar][]){
    elements[stems[p.stem].element]+=2
    if(pos!=='day') gods[tenGod(day,p.stem)] += 2
    for(const hs of p.hidden){ elements[stems[hs].element]+=1; gods[tenGod(day,hs)]+=1 }
  }
  const chart:ChartSnapshot={birth:{...input,calculationTime:calcTime},pillars,dayMaster:{stem:day,element:stems[day].element,polarity:stems[day].polarity,strength,strengthStatus},elements,tenGods:gods,interactions:detectInteractions(pillars),calculation}
  return chart
}

const tenGodFriction:Record<TenGodKey,string>={
  bi_jian:'Puedes cerrar una decisión antes de escuchar una opinión que sí te habría servido.',jie_cai:'Compararte de más puede hacer que acabes respondiendo a la otra persona en vez de decidir por ti.',
  shi_shen:'Puedes pasar tanto tiempo imaginando cómo podría quedar que tardas en terminar lo que ya empezaste.',shang_guan:'La discusión puede terminar ocupando más espacio que la mejora que querías conseguir.',
  pian_cai:'Puedes comprometer tiempo, dinero o energía antes de medir cuánto te va a costar realmente.',zheng_cai:'Puedes seguir buscando seguridad cuando ya tienes suficiente información para decidir.',
  qi_sha:'Puedes tratar un problema normal como si fuera una prueba que tienes que ganar.',zheng_guan:'Puedes seguir cumpliendo una regla o cargando una responsabilidad después de que ya dejó de servir.',
  pian_yin:'Puedes encontrar tantas conexiones posibles que te cuesta saber cuál merece convertirse en una decisión.',zheng_yin:'Puedes seguir estudiando o preparándote cuando ya tienes suficiente información para probar.'
}

function makeCandidate(signal:Omit<SemanticSignal,'clarity'|'discrimination'|'confidence'> & Partial<Pick<SemanticSignal,'clarity'|'discrimination'|'confidence'>>, headline:string, body:string):InterpretationCandidate{
  const s={clarity:signal.clarity??9,discrimination:signal.discrimination??8,confidence:signal.confidence??8,...signal} as SemanticSignal
  const technicalScore=s.strength*1.8+s.confidence*1.4+s.discrimination*1.8+s.clarity
  const score=technicalScore
  return {...s,headline,body,technicalScore,score,status:'candidate'}
}

export function buildCandidates(chart:ChartSnapshot):InterpretationCandidate[]{
  const out:InterpretationCandidate[]=[]; const dm=chart.dayMaster.stem, dmData=dmCopy[dm]
  out.push(makeCandidate({id:`dm-${dm}`,sourceRule:`day_master:${dm}`,sourceStatus:'SOURCE_LOCKED',family:'day_master',behavior:dmData.headline,friction:dmData.friction,sourceFamily:`dm:${dm}`,strength:8,canSurfaceDirectly:true},dmData.headline,`${dmData.body} ${dmData.friction}`))

  const godEntries=(Object.entries(chart.tenGods) as [TenGodKey,number][]).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1])
  for(const [god,count] of godEntries){
    const meta=tenGodMeta[god], strength=Math.min(10,4+count)
    let headline=meta.root, body=`Esta forma aparece ${count>=5?'con bastante facilidad':'como un recurso disponible'} en tu carta. ${tenGodFriction[god]}`
    let status:SourceStatus='MAPA_SEMANTIC', discrimination=7
    if(god==='jie_cai'){headline='Ver cómo otra persona hace algo puede ayudarte a descubrir cómo quieres hacerlo tú.';body='Comparar ideas, propuestas o maneras de resolver algo puede aclararte tu propia postura. La comparación te sirve mientras siga ayudándote a decidir, en vez de convertirse en una competencia que ya no necesitabas.';status='VALIDATED';discrimination=9}
    if(god==='zheng_yin'){headline='Cuando algo te importa, necesitas entender bien cómo funciona antes de sentirte listo para actuar.';body='Te sirve hacer preguntas, ordenar la información y entender qué está pasando antes de mover piezas. A veces puedes seguir preparándote incluso cuando ya tienes suficiente para probar.';status='VALIDATED';discrimination=9}
    if(god==='pian_yin'){headline='Sueles guardar detalles pequeños y conectarlos después cuando necesitas resolver algo.';body='Tu cabeza puede quedarse con piezas de información que parecían sueltas y recuperarlas cuando aparece un problema. El costo aparece cuando encuentras tantas conexiones que cuesta escoger cuál seguir.';discrimination=8}
    if(god==='bi_jian'){headline='Cuando una decisión te afecta directamente, tu propio criterio suele ser la primera referencia.';body='Puedes escuchar opiniones y aun así necesitar sentir que la decisión final sigue siendo tuya. Si esta respuesta se carga demasiado, puedes pedir una segunda opinión cuando ya cerraste el asunto por dentro.';status='VALIDATED';discrimination=8}
    if(god==='shi_shen'){headline='Las cosas que quieres hacer bien pueden pasar bastante tiempo en tu cabeza antes de salir.';body='Te sale desarrollar una idea, darle forma y pensar cómo quieres expresarla. Eso ayuda a construir con cuidado; también puede retrasar el momento de enseñarla o terminarla.';status='VALIDATED';discrimination=9}
    out.push(makeCandidate({id:`tg-${god}`,sourceRule:`ten_god:${god}`,sourceStatus:status,family:'ten_god',behavior:meta.root,friction:tenGodFriction[god],sourceFamily:`ten_god:${god}`,strength,canSurfaceDirectly:true,discrimination},headline,body))
  }

  const dd=chart.interactions.find(i=>i.kind==='autocastigo'&&i.branches[0]==='dragon')
  if(dd) out.push(makeCandidate({id:'dragon-dragon-belongings',sourceRule:'branch_self_punishment:dragon_dragon_adjacent',sourceStatus:'VALIDATED_STRONG_SPECIFIC',family:'interaction',behavior:'belongings_space_boundaries',context:'pertenencias y espacio personal',sourceFamily:'interaction:dragon_dragon',strength:10,confidence:10,discrimination:10,clarity:10,canSurfaceDirectly:true},'Te molesta muchísimo que alguien mueva o use tus cosas sin avisarte.','Puedes prestar algo cuando tú decides hacerlo. Lo que te incomoda es descubrir que alguien agarró una cosa tuya, la cambió de lugar o la usó dando por hecho que estaba bien.'))

  for(const i of chart.interactions){
    if(i.kind==='estación'&&i.note.includes('fuego')) out.push(makeCandidate({id:'season-fire',sourceRule:'branch_season:snake_horse_goat',sourceStatus:'SOURCE_LOCKED',family:'interaction',behavior:'fire_reinforcement',sourceFamily:'interaction:snake_horse_goat',strength:9,discrimination:7,canSurfaceDirectly:true},'Cuando algo te entusiasma, puedes mantenerlo encendido durante bastante tiempo.','El fuego recibe mucho respaldo en esta combinación. En Mapa lo usamos como evidencia adicional de cambio, visibilidad e impulso; por sí sola esta relación no decide una frase completa.'))
    if(i.kind==='daño'&&i.branches.includes('rabbit')&&i.branches.includes('dragon')) out.push(makeCandidate({id:'rabbit-dragon-partial',sourceRule:'branch_harm:rabbit_dragon',sourceStatus:'PARTIAL_MATCH',family:'interaction',behavior:'process_confusion',sourceFamily:'interaction:rabbit_dragon',strength:4,confidence:4,discrimination:5,canSurfaceDirectly:false},'Lo tedioso te pesa mucho menos que lo confuso.','Puedes aguantar varios pasos cuando entiendes para qué sirven y sabes qué sigue. Esta traducción todavía necesita más validación y por ahora queda fuera del resumen principal.'))
  }

  const dominant=(Object.entries(chart.elements) as [ElementKey,number][]).sort((a,b)=>b[1]-a[1])[0]
  const em=elementMeta[dominant[0]]
  out.push(makeCandidate({id:`el-${dominant[0]}`,sourceRule:`element_presence:${dominant[0]}`,sourceStatus:'MAPA_SEMANTIC',family:'element',behavior:em.root,sourceFamily:`element:${dominant[0]}`,strength:Math.min(8,dominant[1]),confidence:6,discrimination:6,clarity:9,canSurfaceDirectly:true},em.root,`En tu carta ${em.article} aparece con bastante presencia. Esto aumenta la facilidad de recurrir a esa manera de resolver cosas, aunque la cantidad por sí sola no define tu personalidad.`))
  return out
}

export function selectBrief(chart:ChartSnapshot):BriefResult{
  const all=buildCandidates(chart); const rejected:InterpretationCandidate[]=[]
  const safe=all.filter(c=>{
    if(c.sourceStatus==='SOURCE_CONFLICT'||!c.canSurfaceDirectly){c.status='rejected_conflict';rejected.push(c);return false}
    if(c.discrimination<6||c.clarity<7){c.status='rejected_barnum';rejected.push(c);return false}
    return true
  }).sort((a,b)=>b.score-a.score)
  const chosen:InterpretationCandidate[]=[]; const roots=new Set<string>(); const familyCount:Record<string,number>={}
  for(const c of safe){
    if(roots.has(c.sourceFamily)){c.status='rejected_redundant';rejected.push(c);continue}
    const count=familyCount[c.family]??0
    if(count>=2 && c.family!=='interaction'){c.status='rejected_redundant';rejected.push(c);continue}
    c.status='approved';chosen.push(c);roots.add(c.sourceFamily);familyCount[c.family]=count+1
    if(chosen.length===6) break
  }
  return {chart,insights:chosen,rejected}
}

export function analyze(input:BirthInput){return selectBrief(calculateChart(input))}
export function stemLabel(k:StemKey){return stems[k].label}
export function branchLabel(k:BranchKey){return branches[k].label}
export function pillarLabel(p:Pillar){return `${stems[p.stem].label} · ${branches[p.branch].label}`}
