(function(){
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

// --- neuron: dotknij część, żeby zobaczyć opis ---
const PARTS={
 dendryty:["Dendryty i kolce dendrytyczne","Anteny odbiorcze neuronu. Na kolcach dendrytycznych powstają synapsy, a same kolce zmieniają się wraz z doświadczeniem (uczenie się to także przebudowa kolców)."],
 soma:["Ciało komórki z jądrem","Sumuje sygnały pobudzające (EPSP) i hamujące (IPSP) docierające z dendrytów. Zawiera jądro i mitochondria: mózg to ok. 2% masy ciała, ale ok. 20% zużycia energii."],
 wzgorek:["Wzgórek aksonu","Tu powstaje potencjał czynnościowy, gdy suma pobudzeń przekroczy próg. Impuls jest „wszystko albo nic”, a siłę bodźca koduje częstotliwość wyładowań."],
 akson:["Akson","Zawsze jeden, ale może się rozgałęziać. Wewnątrz biegną mikrotubule: kinezyny wiozą ładunek od ciała komórki ku synapsie, dyneiny z powrotem."],
 mielina:["Osłonka mielinowa","W mózgu tworzą ją oligodendrocyty, w nerwach obwodowych komórki Schwanna. Izoluje akson i przyspiesza przewodzenie; jej uszkodzenie to np. stwardnienie rozsiane."],
 ranvier:["Przewężenie Ranviera","Przerwa w mielinie, w której impuls „przeskakuje” z jednego przewężenia na następne (przewodzenie skokowe), dzięki czemu jest szybszy."],
 synapsa:["Zakończenia synaptyczne (kolbki)","Impuls otwiera kanały wapniowe, pęcherzyki uwalniają neuroprzekaźnik do szczeliny, a ten łączy się z receptorami następnego neuronu. Dalszy ciąg w ramce „Synapsa i leki”."]
};
(function(){
  const svg=$("#neuronsvg"); if(!svg) return;
  const dend="M110,150 C90,128 72,118 52,96 M52,96 C40,84 30,80 18,64 M52,96 C48,84 52,72 50,56 M110,150 C86,152 64,160 42,176 M42,176 C30,184 22,196 12,200 M42,176 C38,188 40,200 36,214 M118,138 C108,112 104,92 98,70 M98,70 C92,56 82,46 74,36 M98,70 C98,56 104,46 112,34 M126,170 C116,194 110,212 100,236 M100,236 C92,248 84,254 74,262 M100,236 C104,250 108,258 116,268";
  const spines=[[52,96],[18,64],[50,56],[42,176],[12,200],[36,214],[98,70],[74,36],[112,34],[100,236],[74,262],[116,268]];
  let m="";
  for(let i=0;i<4;i++){const x=196+i*58; m+=`<rect x="${x}" y="141" width="46" height="22" rx="11" fill="var(--cell3)" stroke="var(--stroke)" stroke-width="1.2"/>`;}
  svg.innerHTML=`
  <g class="part" data-part="dendryty" tabindex="0" role="button" aria-label="Dendryty i kolce dendrytyczne">
    <path d="${dend}" fill="none" stroke="var(--cell1)" stroke-width="5" stroke-linecap="round"/>
    ${spines.map(([x,y])=>`<circle cx="${x}" cy="${y}" r="5" fill="var(--cell1)" stroke="var(--surface)" stroke-width="1.5"/>`).join("")}
  </g>
  <g class="part" data-part="soma" tabindex="0" role="button" aria-label="Ciało komórki">
    <circle cx="140" cy="152" r="34" fill="var(--cell1)" stroke="var(--stroke)" stroke-width="1.5"/>
    <circle cx="140" cy="152" r="13" fill="var(--surface)" stroke="var(--stroke)" stroke-width="1.2" opacity=".9"/>
    <circle cx="140" cy="152" r="4.5" fill="var(--cell3)"/>
  </g>
  <g class="part" data-part="wzgorek" tabindex="0" role="button" aria-label="Wzgórek aksonu">
    <path d="M172,140 L196,148 L196,156 L172,164 Z" fill="var(--cell2)" stroke="var(--stroke)" stroke-width="1.2"/>
  </g>
  <g class="part" data-part="akson" tabindex="0" role="button" aria-label="Akson">
    <rect x="196" y="150" width="236" height="6" rx="3" fill="var(--cell2)"/>
  </g>
  <g class="part" data-part="mielina" tabindex="0" role="button" aria-label="Osłonka mielinowa">${m}</g>
  <g class="part" data-part="ranvier" tabindex="0" role="button" aria-label="Przewężenie Ranviera">
    ${[0,1,2].map(i=>`<rect x="${242+i*58}" y="140" width="12" height="26" fill="transparent"/><path d="M${248+i*58},138 L${248+i*58},131" stroke="var(--sel)" stroke-width="2" stroke-linecap="round"/><path d="M${244+i*58},134 L${248+i*58},129 L${252+i*58},134" stroke="var(--sel)" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`).join("")}
  </g>
  <g class="part" data-part="synapsa" tabindex="0" role="button" aria-label="Zakończenia synaptyczne">
    <path d="M432,153 C440,130 446,112 452,98 M432,153 L452,153 M432,153 C440,176 446,194 452,208" fill="none" stroke="var(--cell2)" stroke-width="3.5" stroke-linecap="round"/>
    <circle cx="454" cy="96" r="8" fill="var(--da)" stroke="var(--surface)" stroke-width="1.5"/><circle cx="456" cy="153" r="8" fill="var(--da)" stroke="var(--surface)" stroke-width="1.5"/><circle cx="454" cy="210" r="8" fill="var(--da)" stroke="var(--surface)" stroke-width="1.5"/>
  </g>
  <g aria-hidden="true">
    <text x="30" y="20">dendryty z kolcami</text>
    <text x="104" y="106" text-anchor="middle" style="font-size:10px;opacity:0"></text>
    <text x="140" y="203" text-anchor="middle" style="font-size:10.5px">ciało komórki</text>
    <text x="196" y="124" style="font-size:10.5px">wzgórek aksonu</text>
    <text x="300" y="196" text-anchor="middle" style="font-size:10.5px">osłonka mielinowa</text>
    <text x="300" y="112" text-anchor="middle" style="font-size:10.5px">przewężenia Ranviera</text>
    <text x="388" y="60" text-anchor="middle" style="font-size:10.5px">zakończenia aksonu</text>
  </g>`;
  const info=$("#neuroninfo");
  const show=el=>{
    const p=PARTS[el.dataset.part]; svg.querySelectorAll(".part").forEach(x=>x.classList.toggle("on",x===el));
    info.innerHTML=`<b>${esc(p[0])}.</b> ${esc(p[1])}`;
    if(el.dataset.part==="synapsa"&&window.ATLAS&&window.ATLAS.goSynapse) { /* opis wystarczy, rysunek synapsy jest niżej */ }
  };
  svg.querySelectorAll(".part").forEach(el=>{el.addEventListener("click",()=>show(el));el.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();show(el);}});});
})();

// --- synapsa i leki ---
const SYN={
 normal:["Normalnie","Impuls otwiera kanały wapniowe, pęcherzyki uwalniają przekaźnik, ten łączy się z receptorami następnego neuronu. Potem wraca do neuronu transporterem (wychwyt zwrotny) albo rozkładają go enzymy (MAO i COMT; acetylocholinę acetylocholinesteraza).","normalna"],
 reuptake:["Blokada wychwytu","SSRI, SNRI, bupropion i stymulanty blokują transporter, więc przekaźnika w szczelinie jest więcej i działa dłużej. Pełny efekt kliniczny przychodzi po tygodniach, bo mózg musi przestawić liczbę i czułość receptorów.","silniejsza"],
 degradation:["Blokada rozkładu","Inhibitory MAO (np. moklobemid) i acetylocholinesterazy (np. donepezil) hamują enzym rozkładający przekaźnik, więc jego zapas w neuronie i w szczelinie rośnie.","silniejsza"],
 antagonist:["Antagonista receptora","Antagonista zajmuje receptor i go blokuje, nie uruchamiając odpowiedzi. Tak działają neuroleptyki (receptor D2), ketamina i memantyna (NMDA). Przekaźnik jest, ale nie ma gdzie się związać.","zablokowana"],
 agonist:["Agonista / wzmacniacz","Agonista naśladuje przekaźnik na receptorze (np. opioidy na receptorach μ). Benzodiazepiny i alkohol wzmacniają działanie GABA na receptorze GABA-A.","wzmocniona"]
};
let synMode="normal";
function drawSynapse(mode){
  const svg=$("#synsvg"); if(!svg) return; synMode=mode;
  const rec=[150,200,250,300];
  const vesicles=[[170,70],[215,86],[260,70],[305,86]];
  const dot=(x,y,dx,dy,t,d,cls)=>`<circle class="nt-dot ${cls||""}" cx="${x}" cy="${y}" r="3.6" fill="var(--da)" style="--dx:${dx}px;--dy:${dy}px;--t:${t}s;--d:${d}s"/>`;
  const drugDot=(x,y,dx,dy,t,d)=>`<rect class="nt-dot" x="${x-4}" y="${y-4}" width="8" height="8" transform="rotate(45 ${x} ${y})" fill="var(--gaba)" stroke="var(--surface)" stroke-width=".8" style="--dx:${dx}px;--dy:${dy}px;--t:${t}s;--d:${d}s"/>`;
  let dots="";
  // uwalnianie z pęcherzyków do receptorów
  vesicles.forEach(([vx,vy],i)=>{
    const rx=rec[i];
    if(mode==="antagonist") dots+=dot(vx,vy+12,(i%2?1:-1)*38,86-i*3,3.2,i*0.7,"");
    else if(mode==="agonist") dots+=dot(vx,vy+12,rx-vx,190-vy-12,3.2,i*0.8,"");
    else dots+=dot(vx,vy+12,rx-vx,190-vy-12,3.2,i*0.7,"");
  });
  if(mode==="agonist") rec.forEach((rx,i)=>{dots+=drugDot(rx+10,150,-10,40,3.6,0.3+i*0.9);});
  // wychwyt zwrotny
  if(mode!=="reuptake"){dots+=dot(205,176,-85,-50,3.4,1.1,"");dots+=dot(280,176,60,-50,3.4,2.0,"");dots+=dot(180,170,-60,-44,3.4,2.6,"");}
  // rozkład
  if(mode!=="degradation"){dots+=dot(335,170,68,-6,3.0,0.5,"");dots+=dot(300,176,100,-8,3.6,1.8,"");}
  // dodatkowy przekaźnik w szczelinie
  let linger="";
  if(mode==="reuptake"||mode==="degradation"){linger=[[130,152],[165,166],[195,150],[232,170],[268,152],[302,168],[338,150],[368,166],[110,166]].map(([x,y],i)=>`<circle class="pulse" cx="${x}" cy="${y}" r="3.6" fill="var(--da)" style="--d:${i*0.25}s"/>`).join("");}
  const blockers=mode==="antagonist"?rec.map(x=>`<rect x="${x-6}" y="188" width="12" height="9" rx="2" fill="var(--gaba)" stroke="var(--surface)" stroke-width="1"/>`).join(""):"";
  const respCol=mode==="antagonist"?"var(--muted)":"var(--sel)";
  const respOp=mode==="antagonist"?0:mode==="normal"?0.5:0.95;
  svg.innerHTML=`
  <defs><linearGradient id="respg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${respCol}" stop-opacity=".9"/><stop offset="1" stop-color="${respCol}" stop-opacity="0"/></linearGradient></defs>
  <path d="M70,6 C70,70 100,118 150,120 L310,120 C360,118 390,70 390,6 Z" fill="var(--cell1)" stroke="var(--stroke)" stroke-width="1.4"/>
  <path d="M20,213 C120,198 340,198 440,213 L440,296 L20,296 Z" fill="var(--cell2)" stroke="var(--stroke)" stroke-width="1.4"/>
  <rect class="resp" x="130" y="196" width="190" height="40" fill="url(#respg)" style="opacity:${respOp}"/>
  <ellipse cx="108" cy="52" rx="16" ry="9" fill="var(--cell3)" stroke="var(--stroke)"/>
  ${vesicles.map(([x,y])=>`<circle cx="${x}" cy="${y}" r="13" fill="var(--surface)" stroke="var(--stroke)" stroke-width="1.2"/><circle cx="${x-4}" cy="${y-3}" r="3" fill="var(--da)"/><circle cx="${x+4}" cy="${y-2}" r="3" fill="var(--da)"/><circle cx="${x}" cy="${y+4}" r="3" fill="var(--da)"/>${mode==="degradation"?`<circle cx="${x+6}" cy="${y+5}" r="2.6" fill="var(--da)"/>`:""}`).join("")}
  <rect x="338" y="36" width="34" height="18" rx="5" fill="var(--surface)" stroke="${mode==="degradation"?"var(--gaba)":"var(--stroke)"}" stroke-width="${mode==="degradation"?2.4:1.2}"/><text x="355" y="49" text-anchor="middle">MAO</text>
  ${mode==="degradation"?`<path d="M342,58 L368,32" stroke="var(--up)" stroke-width="2.4" stroke-linecap="round"/>`:""}
  ${[118,342].map(x=>`<rect x="${x-8}" y="112" width="16" height="16" rx="4" fill="var(--cell4)" stroke="var(--stroke)" stroke-width="1.2"/>${mode==="reuptake"?`<path d="M${x-9},${x<200?110:110} l18,20 M${x+9},110 l-18,20" stroke="var(--up)" stroke-width="2.6" stroke-linecap="round"/>`:""}`).join("")}
  <g transform="translate(405,168)"><path d="M0,0 L16,-9 L16,9 Z" fill="var(--cell3)" stroke="${mode==="degradation"?"var(--gaba)":"var(--stroke)"}" stroke-width="${mode==="degradation"?2.4:1.2}"/>${mode==="degradation"?`<path d="M-2,-12 L20,12" stroke="var(--up)" stroke-width="2.4" stroke-linecap="round"/>`:""}</g>
  ${rec.map(x=>`<path d="M${x-9},204 L${x-9},194 L${x-3},194 L${x-3},199 L${x+3},199 L${x+3},194 L${x+9},194 L${x+9},204 Z" fill="var(--surface)" stroke="var(--stroke)" stroke-width="1.2"/>`).join("")}
  ${blockers}
  ${linger}${dots}
  <g style="paint-order:stroke;stroke:var(--surface);stroke-width:3px;stroke-linejoin:round">
    <text x="230" y="22" text-anchor="middle">neuron nadawczy (presynaptyczny)</text>
    <text x="230" y="105" text-anchor="middle" style="font-size:10px">pęcherzyki z przekaźnikiem</text>
    <text x="30" y="150" style="font-size:10px">transporter</text>
    <text x="362" y="104" style="font-size:10px">wychwyt</text>
    <text x="372" y="198" style="font-size:10px">enzym</text>
    <text x="230" y="186" text-anchor="middle" style="font-size:10px;opacity:0">receptory</text>
    <text x="230" y="262" text-anchor="middle">neuron odbierający (postsynaptyczny)</text>
    <text x="230" y="278" text-anchor="middle" style="font-size:10.5px">receptory na błonie · odpowiedź: ${SYN[mode][2]}</text>
    <text x="230" y="168" text-anchor="middle" style="font-size:10px;opacity:.9">szczelina synaptyczna</text>
  </g>`;
  $("#syninfo").textContent=SYN[mode][1];
  document.querySelectorAll("#synmodes button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.mode===mode));
}
$("#synmodes").innerHTML=Object.entries(SYN).map(([k,v])=>`<button data-mode="${k}" aria-pressed="false">${v[0]}</button>`).join("");
document.querySelectorAll("#synmodes button").forEach(b=>b.onclick=()=>drawSynapse(b.dataset.mode));
drawSynapse("normal");

// --- neuroprzekaźniki ---
// [nazwa, skąd, funkcje, receptory, znaczenie kliniczne, id szlaku]
const NT=[
 ["Glutaminian","Główny pobudzający; cała kora, hipokamp, wzgórze","Uczenie się, pamięć (LTP przez receptory NMDA)","Jonotropowe (AMPA, NMDA, kainianowe) i metabotropowe","Ekscytotoksyczność; hipoteza NMDA w schizofrenii; ketamina w depresji; memantyna w Alzheimerze","glu"],
 ["GABA","Główny hamujący; interneurony, prążkowie, móżdżek","Hamowanie, rytmy mózgowe, wyciszenie lęku","Jonotropowy GABA-A (szybki) i metabotropowy GABA-B","Benzodiazepiny, alkohol i barbiturany wzmacniają GABA-A; przewlekły alkohol zmniejsza liczbę receptorów; deficyt interneuronów PV w schizofrenii","gaba"],
 ["Glicyna","Rdzeń kręgowy i pień mózgu","Hamowanie (drugi przekaźnik hamujący po GABA)","Jonotropowy","Zaburzenia ruchu przy zablokowaniu (np. strychnina)",""],
 ["Dopamina","Pole brzuszne nakrywki, istota czarna, podwzgórze","Chcenie i przewidywanie nagrody, ruch, pamięć robocza","Metabotropowe D1–D5","Psychoza (nadmiar w drodze mezolimbicznej), Parkinson (niedobór), ADHD, uzależnienia","da"],
 ["Serotonina (5-HT)","Jądra szwu; ok. 80% w jelitach","Nastrój, impulsywność, sen, łaknienie, ból","Siedem klas; prawie wszystkie metabotropowe","SSRI w depresji, lęku, OCD; psychodeliki działają przez 5-HT2A; zespół serotoninowy","5ht"],
 ["Noradrenalina","Miejsce sinawe","Czujność, uwaga, reakcja „walcz albo uciekaj”","Metabotropowe α1, α2, β","Panika, PTSD (prazosyna), ADHD (atomoksetyna), SNRI","na"],
 ["Adrenalina","Rdzeń nadnerczy (i nieliczne neurony pnia)","Szybka reakcja stresowa, w ok. 2 minuty","Metabotropowe α i β","Przy ataku paniki objawy ciała (kołatanie serca, drżenie) wynikają z jej wyrzutu",""],
 ["Acetylocholina","Jądro Meynerta, przegroda, pień; nerwy ruchowe i przywspółczulne","Uwaga, pamięć, sen REM, skurcz mięśni","Nikotynowe (jonotropowe) i muskarynowe (metabotropowe)","Alzheimer (inhibitory AChE), miastenia, delirium po lekach antycholinergicznych","ach"],
 ["Histamina","Jądro guzowo-suteczkowe podwzgórza","Czuwanie","Metabotropowe H1–H4","Senność po lekach przeciwhistaminowych i części przeciwpsychotycznych",""],
 ["Oreksyna (hipokretyna)","Boczne podwzgórze","Utrzymanie czuwania, motywacja","Metabotropowe","Narkolepsja (utrata neuronów); antagoniści oreksyny w bezsenności",""],
 ["Opioidy endogenne (endorfiny)","Podwzgórze, istota szara okołowodociągowa, jądro półleżące","Ból, przyjemność, przywiązanie, kojące działanie bliskości","Metabotropowe μ, δ, κ","Uzależnienie od opioidów; naltrekson; hipotezy w samouszkodzeniach",""],
 ["Substancja P","Rdzeń kręgowy, pień, ciało migdałowate","Przekazywanie bólu, reakcja stresowa","Metabotropowy NK1","Cel badań nad bólem i lękiem",""],
 ["Tlenek azotu (NO)","Wiele neuronów (gaz, działa wstecznie)","Wsteczny przekaźnik wzmacniający synapsy, rozszerzanie naczyń","Bez klasycznego receptora (działa wewnątrzkomórkowo)","Uczenie się; udział w ekscytotoksyczności",""],
 ["Endokannabinoidy","Cały mózg (sygnał wsteczny)","Regulacja synaps, stres, apetyt, wygaszanie strachu","Metabotropowe CB1, CB2","THC, ryzyko psychozy przy intensywnym używaniu w młodości",""],
 ["Oksytocyna, wazopresyna","Podwzgórze → tylna przysadka","Więź, zaufanie, poród, karmienie, gospodarka wodna","Metabotropowe","Badane w autyzmie i lęku społecznym, bez potwierdzonej skuteczności klinicznej",""],
 ["Kortyzol (hormon, oś HPA)","Kora nadnerczy, pod kontrolą CRH i ACTH","Mobilizacja energii w stresie","Receptory wewnątrzkomórkowe (zmieniają ekspresję genów)","Przewlekle wysoki szkodzi hipokampowi; depresja, PTSD",""]
];
$("#nttable").innerHTML=`<thead><tr><th>Substancja</th><th>Skąd</th><th>Funkcje</th><th>Receptory</th><th>Znaczenie kliniczne</th><th>Na mózgu</th></tr></thead><tbody>`+NT.map(r=>`<tr>${r.slice(0,5).map((c,i)=>i===0?`<td><b>${esc(c)}</b></td>`:`<td>${esc(c)}</td>`).join("")}<td>${r[5]?`<button class="chip" data-ntshow="${r[5]}">Pokaż szlak</button>`:`<span class="src">brak szlaku na modelu</span>`}</td></tr>`).join("")+`</tbody>`;
document.querySelectorAll("[data-ntshow]").forEach(b=>b.onclick=()=>window.ATLAS&&window.ATLAS.showPathway(b.dataset.ntshow));

// --- leki ---
const groups=[...new Set(DRUGS.map(d=>d.group))];
$("#druglist").innerHTML=groups.map(g=>`<div class="group"><h4>${esc(g)}</h4><div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(290px,1fr))">`+DRUGS.filter(d=>d.group===g).map(d=>`<div class="cellcard"><h5>${esc(d.name)}</h5><div class="w">${esc(d.examples)}</div><p>${esc(d.action)}</p><p style="margin-top:6px"><b>Do czego:</b> ${esc(d.use)}</p><p class="row-wrap" style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap"><button class="chip" data-drugshow="${d.id}">Pokaż na mózgu</button><button class="chip" data-drugsyn="${d.mode==="none"?"normal":d.mode}">Pokaż na synapsie</button></p></div>`).join("")+`</div></div>`).join("")+`<p class="src">Opisy mają charakter edukacyjny i nie zastępują ulotki ani konsultacji lekarskiej. Nazwy substancji podano jako przykłady grup.</p>`;
document.querySelectorAll("[data-drugshow]").forEach(b=>b.onclick=()=>window.ATLAS&&window.ATLAS.showDrug(b.dataset.drugshow));
function goSynapse(mode){
  document.querySelectorAll("#tabs button").forEach(x=>x.setAttribute("aria-selected",x.dataset.tab==="cells"));
  document.querySelectorAll(".tabpanel").forEach(p=>p.hidden=p.id!=="tab-cells");
  drawSynapse(SYN[mode]?mode:"normal");
  const t=document.querySelector(".synapse"); if(t) t.scrollIntoView({block:"center",behavior:"smooth"});
}
document.querySelectorAll("[data-drugsyn]").forEach(b=>b.onclick=()=>goSynapse(b.dataset.drugsyn));
const prev=window.__afterApp; window.__afterApp=function(){ if(window.ATLAS) window.ATLAS.goSynapse=goSynapse; if(prev) prev(); };

// --- źródła i JSON ---
$("#srclist").innerHTML=Object.values(SOURCES).map(([t,u])=>`<li>${esc(t)} <a href="${u}" target="_blank" rel="noopener">${esc(u)}</a></li>`).join("");
const DATA={version:"2.0",language:"pl",regions:Object.fromEntries(Object.entries(REGIONS).filter(([k,v])=>!v.alias)),enigma:ENIGMA,dkParcels:"Desikan-Killiany (68)",disorders:DISORDERS,cells:CELLS,pathways:PATHWAYS,networks:NETWORKS,drugs:DRUGS,meaning:MEANING,pathwayNotes:PW_NOTES,neurotransmitters:NT.map(r=>({name:r[0],source:r[1],functions:r[2],receptors:r[3],clinical:r[4]})),sources:SOURCES};
const json=JSON.stringify(DATA,null,2);
$("#jsonpre").textContent=json.slice(0,4000)+"\n… ("+Math.round(json.length/1024)+" KB łącznie)";
$("#copyjson").onclick=async()=>{try{await navigator.clipboard.writeText(json);$("#copyok").textContent="Skopiowano do schowka.";}catch(e){$("#copyok").textContent="Przeglądarka zablokowała schowek. Zaznacz tekst ręcznie.";$("#jsonpre").textContent=json;}};

document.querySelectorAll("#tabs button").forEach(b=>b.onclick=()=>{
  document.querySelectorAll("#tabs button").forEach(x=>x.setAttribute("aria-selected",x===b));
  document.querySelectorAll(".tabpanel").forEach(p=>p.hidden=p.id!=="tab-"+b.dataset.tab);
});
})();
