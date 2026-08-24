const masters=[
{element:'Madera',roman:'Jia',han:'甲',desc:'Madera Yang',name:'Roble',pol:'Yang',caption:'Dirección y constancia.',color:'#4F7A52',wash:'#E3EBD8',path:'M11 19c0-5 3-9 5-12 2 3 5 7 5 12M16 11c-2 0-4-1-5-3'},
{element:'Madera',roman:'Yi',han:'乙',desc:'Madera Yin',name:'Hiedra',pol:'Yin',caption:'Adaptación y estrategia.',color:'#4F7A52',wash:'#E3EBD8',path:'M6 16c4-6 7-8 12-10-1 5-4 9-10 13-1-2-2-2-2-3z'},
{element:'Fuego',roman:'Bing',han:'丙',desc:'Fuego Yang',name:'Sol',pol:'Yang',caption:'Impulso y presencia.',color:'#C65A3D',wash:'#F6DED2',path:'M12 5v2M12 17v2M5 12h2M17 12h2M7.5 7.5l1.5 1.5M15 15l1.5 1.5M16.5 7.5 15 9M9 15l-1.5 1.5M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8z'},
{element:'Fuego',roman:'Ding',han:'丁',desc:'Fuego Yin',name:'Brasa',pol:'Yin',caption:'Detalle y continuidad.',color:'#C65A3D',wash:'#F6DED2',path:'M14 20c0-4 5-5 5-9 0-3-2-5-4-7 0 3-2 4-4 6-2 2-3 4-3 7 0 4 3 7 6 7s5-2 5-4z'},
{element:'Tierra',roman:'Wu',han:'戊',desc:'Tierra Yang',name:'Montaña',pol:'Yang',caption:'Estabilidad y sostén.',color:'#B28747',wash:'#F1E3C6',path:'M5 17 12 7l7 10H5z'},
{element:'Tierra',roman:'Ji',han:'己',desc:'Tierra Yin',name:'Huerto',pol:'Yin',caption:'Cuidado y mantenimiento.',color:'#B28747',wash:'#F1E3C6',path:'M7 17h10M9 17v-4m6 4v-6M8 10c1-2 3-3 4-5 1 2 3 3 4 5'},
{element:'Metal',roman:'Geng',han:'庚',desc:'Metal Yang',name:'Acero',pol:'Yang',caption:'Decisión y firmeza.',color:'#66707A',wash:'#ECEFF1',path:'M12 4l7 7-7 9-7-9 7-7z'},
{element:'Metal',roman:'Xin',han:'辛',desc:'Metal Yin',name:'Joya',pol:'Yin',caption:'Precisión y criterio.',color:'#66707A',wash:'#ECEFF1',path:'M12 5l6 4-2 8h-8L6 9l6-4z'},
{element:'Agua',roman:'Ren',han:'壬',desc:'Agua Yang',name:'Marea',pol:'Yang',caption:'Movimiento y conexión.',color:'#2E5E7E',wash:'#DCEAF0',path:'M4 14c2-2 4-2 6 0s4 2 6 0 4-2 4-2M4 10c2-2 4-2 6 0s4 2 6 0 4-2 4-2'},
{element:'Agua',roman:'Gui',han:'癸',desc:'Agua Yin',name:'Rocío',pol:'Yin',caption:'Contexto e imaginación.',color:'#2E5E7E',wash:'#DCEAF0',path:'M12 4c3 4 6 7 6 11a6 6 0 0 1-12 0c0-4 3-7 6-11z'}
];

const animals=[
{roman:'Zi',han:'子',name:'Rata',desc:'Agua Yang',color:'#2E5E7E',wash:'#DCEAF0',path:'M5 15c1.5-3 4.2-4.8 7.4-4.8 3.7 0 6.2 2 6.2 4.8 0 2.4-2 4.2-5.2 4.2H8.5C6.6 19 5 17.5 5 15Zm10.9-3.7c.2-1.5 1.1-2.7 2.4-3.3M8.5 10.6 7 8.8M10.1 10.1c-.1-1.1.5-2 1.4-2.5'},
{roman:'Chou',han:'丑',name:'Buey',desc:'Tierra Yin',color:'#B28747',wash:'#F1E3C6',path:'M7 8c-1.5-.6-2.6-1.8-3-3 2.3-.2 4 .6 5 2M17 8c1.5-.6 2.6-1.8 3-3-2.3-.2-4 .6-5 2M7.5 8.5C8.5 7.5 10 7 12 7s3.5.5 4.5 1.5v5.8c0 3-1.9 5.2-4.5 5.2s-4.5-2.2-4.5-5.2V8.5ZM9.5 12h.01M14.5 12h.01M10 16c1.2.8 2.8.8 4 0'},
{roman:'Yin',han:'寅',name:'Tigre',desc:'Madera Yang',color:'#4F7A52',wash:'#E3EBD8',path:'M7 8 5.5 5 9 6M17 8 18.5 5 15 6M7 8.5C8.2 7.4 9.9 7 12 7s3.8.4 5 1.5v5.6c0 3.2-2.2 5.4-5 5.4s-5-2.2-5-5.4V8.5ZM9.2 12h.01M14.8 12h.01M10 15.5c1.2.7 2.8.7 4 0M12 8.5v2M9.5 9l1 1M14.5 9l-1 1'},
{roman:'Mao',han:'卯',name:'Conejo',desc:'Madera Yin',color:'#4F7A52',wash:'#E3EBD8',path:'M8.5 9C7.5 6 8 3.5 9.5 3c1.3 1.3 2 3.7 2 6M15.5 9c1-3 .5-5.5-1-6-1.3 1.3-2 3.7-2 6M7 11c1-1.5 2.7-2.2 5-2.2s4 .7 5 2.2v3.5c0 3-2.1 5.2-5 5.2s-5-2.2-5-5.2V11ZM9.5 13h.01M14.5 13h.01M11 16h2'},
{roman:'Chen',han:'辰',name:'Dragón',desc:'Tierra Yang',color:'#B28747',wash:'#F1E3C6',path:'M5 15c2.5-5 7-7.5 12.5-6.5L16 6l3 .5-1 2.5 2 1.5-3 1c.5 4-2 7.5-6 8.5M8 14c2 1.5 4.5 1.5 6.5 0M10 10.5 8.5 9M13 9.5l1-2'},
{roman:'Si',han:'巳',name:'Víbora',desc:'Fuego Yin',color:'#C65A3D',wash:'#F6DED2',path:'M7 5c6-2 9 1 7.5 3.5S8 11 8 14s4 5 8 3.5c2.3-.9 2.4-3.6.5-4.5-1.4-.7-3-.2-4 .7M16.8 13.2l2-1M18.8 12.2l1.2.3'},
{roman:'Wu',han:'午',name:'Caballo',desc:'Fuego Yang',color:'#C65A3D',wash:'#F6DED2',path:'M8 19c.5-4.5-.4-7.5-2.5-10L9 5l3 1 2.5-2 1.2 3.2 3.3 2.3-2 2.5.5 7H11l-3 2Zm2-10c1.5 1 3.5 1.4 6 .8M14.5 9h.01'},
{roman:'Wei',han:'未',name:'Cabra',desc:'Tierra Yin',color:'#B28747',wash:'#F1E3C6',path:'M8 8C6 7 5 5.5 5.2 4c2.6-.4 4.3.5 5.2 2.6M16 8c2-1 3-2.5 2.8-4-2.6-.4-4.3.5-5.2 2.6M8 8.5c1-1 2.3-1.5 4-1.5s3 .5 4 1.5v6c0 3-1.8 5-4 5s-4-2-4-5v-6ZM10 12h.01M14 12h.01M10.5 16c1 .5 2 .5 3 0'},
{roman:'Shen',han:'申',name:'Mono',desc:'Metal Yang',color:'#66707A',wash:'#ECEFF1',path:'M8 8c1-1.4 2.3-2 4-2s3 .6 4 2M7 10c-1.5 0-2.5 1-2.5 2.5S5.5 15 7 15m10-5c1.5 0 2.5 1 2.5 2.5S18.5 15 17 15M8 8.5c1.2-1 2.5-1.5 4-1.5s2.8.5 4 1.5v5.5c0 3.2-1.7 5.5-4 5.5s-4-2.3-4-5.5V8.5ZM10 12h.01M14 12h.01M10.5 16h3'},
{roman:'You',han:'酉',name:'Gallo',desc:'Metal Yin',color:'#66707A',wash:'#ECEFF1',path:'M8 19c.4-3.2.5-6.3-.4-9.2L11 7l2.2 1L15 5l1 3 3 .5-2.2 2.2c.6 3.8-.6 6.8-3.3 8.3H8ZM10.5 11h.01M16.7 10.7 20 12l-3.2 1.2M7.7 15 5 16.5l3 .5'},
{roman:'Xu',han:'戌',name:'Perro',desc:'Tierra Yang',color:'#B28747',wash:'#F1E3C6',path:'M7.5 9 5 6l4 .3M16.5 9 19 6l-4 .3M7 9c1.2-1.2 2.8-1.8 5-1.8s3.8.6 5 1.8v5c0 3.2-2 5.5-5 5.5S7 17.2 7 14V9ZM9.5 12h.01M14.5 12h.01M10 15.5c1.3.8 2.7.8 4 0'},
{roman:'Hai',han:'亥',name:'Cerdo',desc:'Agua Yin',color:'#2E5E7E',wash:'#DCEAF0',path:'M7 9 5.5 6.5 9 7M17 9l1.5-2.5L15 7M7 9c1.3-1.2 3-1.8 5-1.8s3.7.6 5 1.8v5.2c0 3.2-2.1 5.3-5 5.3s-5-2.1-5-5.3V9ZM9.5 12h.01M14.5 12h.01M9.5 15.2c1-1 4-1 5 0-.2 1.4-1.1 2.1-2.5 2.1s-2.3-.7-2.5-2.1Z'}
];

const slug=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const svg=path=>`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg>`;

function renderMasters(){
  const root=document.querySelector('[data-group="masters"]');
  const order=['Madera','Fuego','Tierra','Metal','Agua'];
  root.innerHTML=order.map(element=>{
    const pair=masters.filter(x=>x.element===element);
    return `<div class="pairLabel" style="--accent:${pair[0].color}"><i></i><b>${element}</b><span>${pair.map(x=>x.roman).join(' · ')}</span></div>`+pair.map(x=>`<article class="card downloadable" data-file="mapa-maestro-${x.roman.toLowerCase()}-${slug(x.name)}" style="--accent:${x.color};--wash:${x.wash}"><div class="stem">${x.roman} ${x.han} · ${x.desc}</div><div class="icon">${svg(x.path)}</div><div class="cardTitleRow"><div><h3>${x.name}</h3><div class="meta"><b>${x.pol}</b><span>·</span><span>${x.element}</span></div></div><button class="downloadBtn" type="button">PNG ↓</button></div><p class="caption">${x.caption}</p></article>`).join('');
  }).join('');
}

function renderAnimals(){
  const root=document.querySelector('[data-group="animals"]');
  root.innerHTML=animals.map(x=>`<article class="card animalCard downloadable" data-file="mapa-animal-${slug(x.name)}" style="--accent:${x.color};--wash:${x.wash}"><div class="stem">${x.roman} ${x.han} · ${x.desc}</div><div class="icon animalIcon">${svg(x.path)}</div><div class="cardTitleRow"><div><h3>${x.name}</h3><div class="meta"><b>${x.roman}</b><span>·</span><span>${x.desc}</span></div></div><button class="downloadBtn" type="button">PNG ↓</button></div></article>`).join('');
}

const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
function explicitSvg(source,accent){
  const clone=source.cloneNode(true);
  clone.setAttribute('xmlns','http://www.w3.org/2000/svg');
  clone.setAttribute('width','24');
  clone.setAttribute('height','24');
  clone.setAttribute('viewBox',source.getAttribute('viewBox')||'0 0 24 24');
  clone.querySelectorAll('path,circle,ellipse,line,polyline,polygon,rect').forEach(node=>{
    node.setAttribute('fill','none');node.setAttribute('stroke',accent);node.setAttribute('stroke-width','1.75');node.setAttribute('stroke-linecap','round');node.setAttribute('stroke-linejoin','round');
  });
  return clone;
}

async function downloadCard(card){
  const sourceSvg=card.querySelector('svg');
  const button=card.querySelector('.downloadBtn');
  if(!sourceSvg)return;
  const accent=getComputedStyle(card).getPropertyValue('--accent').trim()||'#2E3338';
  const clone=explicitSvg(sourceSvg,accent);
  const markup=new XMLSerializer().serializeToString(clone);
  const source=new Blob([markup],{type:'image/svg+xml;charset=utf-8'});
  const sourceUrl=URL.createObjectURL(source);
  const img=new Image();
  try{
    await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;img.src=sourceUrl});
    const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=1024;
    const ctx=canvas.getContext('2d');ctx.clearRect(0,0,1024,1024);ctx.drawImage(img,128,128,768,768);
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
    if(!blob)throw new Error('No se pudo crear el PNG');
    const pngUrl=URL.createObjectURL(blob);const link=document.createElement('a');
    link.href=pngUrl;link.download=`${card.dataset.file||'mapa-icono'}.png`;document.body.appendChild(link);link.click();link.remove();
    setTimeout(()=>URL.revokeObjectURL(pngUrl),1200);
    if(button){const original=button.textContent;button.textContent='Listo ✓';button.classList.add('done');setTimeout(()=>{button.textContent=original;button.classList.remove('done')},1200)}
  }finally{URL.revokeObjectURL(sourceUrl)}
}

function bindDownloads(){
  document.querySelectorAll('.downloadBtn').forEach(button=>button.addEventListener('click',()=>downloadCard(button.closest('.downloadable'))));
  document.querySelectorAll('[data-download-group]').forEach(button=>button.addEventListener('click',async()=>{
    const cards=[...document.querySelectorAll(`[data-group="${button.dataset.downloadGroup}"] .downloadable`)];const original=button.textContent;button.disabled=true;
    for(let i=0;i<cards.length;i++){button.textContent=`Descargando ${i+1}/${cards.length}…`;await downloadCard(cards[i]);await wait(180)}
    button.textContent='Listo ✓';await wait(900);button.textContent=original;button.disabled=false;
  }));
}

renderMasters();renderAnimals();bindDownloads();