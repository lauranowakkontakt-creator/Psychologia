(function(){
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const dirClass=t=>/↑/.test(t)?"up":/↓/.test(t)?"down":"other";
const panel=$("#panel"), tip=$("#tip");
const REDUCED=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const hex=h=>{const n=parseInt(h.replace("#",""),16);return [(n>>16&255)/255,(n>>8&255)/255,(n&255)/255];};
const mix=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];

// ---------- mapowanie anatomii ----------
const DK=['unknown','bankssts','caudalanteriorcingulate','caudalmiddlefrontal','corpuscallosum','cuneus','entorhinal','fusiform','inferiorparietal','inferiortemporal','isthmuscingulate','lateraloccipital','lateralorbitofrontal','lingual','medialorbitofrontal','middletemporal','parahippocampal','paracentral','parsopercularis','parsorbitalis','parstriangularis','pericalcarine','postcentral','posteriorcingulate','precentral','precuneus','rostralanteriorcingulate','rostralmiddlefrontal','superiorfrontal','superiorparietal','superiortemporal','supramarginal','frontalpole','temporalpole','transversetemporal','insula'];
// nazwa PL, region szczegółowy, płat
const PARCEL={
 bankssts:["Bruzda skroniowa górna (tylne brzegi)","wernicke","t"],
 caudalanteriorcingulate:["Grzbietowa część przedniego zakrętu obręczy (dACC)","acc","c"],
 caudalmiddlefrontal:["Tylna część zakrętu czołowego środkowego (czołowe pole oczne, kora przedruchowa)","fef","f"],
 corpuscallosum:["Ściana przyśrodkowa / ciało modzelowate","cc","w"],
 cuneus:["Klinek","occipital","o"],
 entorhinal:["Kora śródwęchowa","entorhinal","t"],
 fusiform:["Zakręt wrzecionowaty (rozpoznawanie twarzy i obiektów)","temporal","t"],
 inferiorparietal:["Płacik ciemieniowy dolny (zakręt kątowy)","tpj","p"],
 inferiortemporal:["Zakręt skroniowy dolny","temporal","t"],
 isthmuscingulate:["Cieśń zakrętu obręczy","pcc","c"],
 lateraloccipital:["Boczna kora potyliczna","occipital","o"],
 lateralorbitofrontal:["Boczna kora oczodołowo-czołowa","ofc","f"],
 lingual:["Zakręt językowaty","occipital","o"],
 medialorbitofrontal:["Przyśrodkowa kora oczodołowo-czołowa (vmPFC)","mpfc","f"],
 middletemporal:["Zakręt skroniowy środkowy","temporal","t"],
 parahippocampal:["Zakręt przyhipokampowy","temporal","t"],
 paracentral:["Płacik okołośrodkowy (ruch i czucie kończyny dolnej)","motor","f"],
 parsopercularis:["Część wieczkowa zakrętu czołowego dolnego (Broca)","broca","f"],
 parsorbitalis:["Część oczodołowa zakrętu czołowego dolnego","ofc","f"],
 parstriangularis:["Część trójkątna zakrętu czołowego dolnego (Broca)","broca","f"],
 pericalcarine:["Kora wokół bruzdy ostrogowej (V1)","v1","o"],
 postcentral:["Zakręt zaśrodkowy (kora somatosensoryczna)","somato","p"],
 posteriorcingulate:["Tylny zakręt obręczy","pcc","c"],
 precentral:["Zakręt przedśrodkowy (kora ruchowa)","motor","f"],
 precuneus:["Przedklinek","pcc","p"],
 rostralanteriorcingulate:["Dziobowa część przedniego zakrętu obręczy (rACC)","acc","c"],
 rostralmiddlefrontal:["Przednia część zakrętu czołowego środkowego (DLPFC)","dlpfc","f"],
 superiorfrontal:["Zakręt czołowy górny (z dodatkowym polem ruchowym i dmPFC)","frontal","f"],
 superiorparietal:["Płacik ciemieniowy górny (okolica bruzdy śródciemieniowej)","spl","p"],
 superiortemporal:["Zakręt skroniowy górny","temporal","t"],
 supramarginal:["Zakręt nadbrzeżny","tpj","p"],
 frontalpole:["Biegun czołowy","mpfc","f"],
 temporalpole:["Biegun skroniowy","temporal","t"],
 transversetemporal:["Zakręty skroniowe poprzeczne Heschla (kora słuchowa)","a1","t"],
 insula:["Wyspa","insula","i"]
};
// kolory płatów: nasycone, tak żeby podział na płaty było widać od razu
const LOBE_COLOR={f:[0.36,0.55,0.93],p:[0.46,0.80,0.44],t:[0.97,0.66,0.27],o:[0.80,0.47,0.90],c:[0.25,0.80,0.76],i:[0.97,0.45,0.52],w:[0.62,0.62,0.66]};
const LOBE_NAME={f:"Płat czołowy",p:"Płat ciemieniowy",t:"Płat skroniowy",o:"Płat potyliczny",c:"Zakręt obręczy",i:"Wyspa"};
const REGION_PARCELS={
 frontal:Object.keys(PARCEL).filter(k=>PARCEL[k][2]==="f"),
 parietal:Object.keys(PARCEL).filter(k=>PARCEL[k][2]==="p"),
 temporal:Object.keys(PARCEL).filter(k=>PARCEL[k][2]==="t"),
 occipital:Object.keys(PARCEL).filter(k=>PARCEL[k][2]==="o"),
 motor:["precentral","paracentral"], somato:["postcentral"], dlpfc:["rostralmiddlefrontal"], ofc:["lateralorbitofrontal","parsorbitalis"],
 broca:["parsopercularis","parstriangularis"], wernicke:["bankssts"], a1:["transversetemporal"], v1:["pericalcarine"], insula:["insula"],
 tpj:["inferiorparietal","supramarginal"], mpfc:["medialorbitofrontal","frontalpole"], acc:["rostralanteriorcingulate","caudalanteriorcingulate"],
 pcc:["posteriorcingulate","isthmuscingulate","precuneus"], cc:["corpuscallosum"], entorhinal:["entorhinal","parahippocampal"],
 fef:["caudalmiddlefrontal"], spl:["superiorparietal"]
};
const SCTX=["accumbens","amygdala","caudate","hippocampus","pallidum","putamen","thalamus","ventricles"];
const SCTX_REGION={accumbens:"nacc",amygdala:"amygdala",caudate:"striatum",hippocampus:"hippocampus",pallidum:"pallidum",putamen:"striatum",thalamus:"thalamus",ventricles:"ventricles"};
const SCTX_PL={accumbens:"Jądro półleżące",amygdala:"Ciało migdałowate",caudate:"Jądro ogoniaste",hippocampus:"Hipokamp",pallidum:"Gałka blada",putamen:"Skorupa",thalamus:"Wzgórze",ventricles:"Komora boczna"};
const SCTX_KEY={accumbens:"accumb",amygdala:"amyg",caudate:"caud",hippocampus:"hippo",pallidum:"pal",putamen:"put",thalamus:"thal",ventricles:"LatVent"};
const SCTX_COLOR={accumbens:[1,0.55,0.20],amygdala:[0.95,0.30,0.35],caudate:[0.30,0.72,0.95],hippocampus:[1,0.80,0.25],pallidum:[0.35,0.85,0.60],putamen:[0.33,0.48,0.98],thalamus:[0.72,0.50,0.95],ventricles:[0.60,0.85,1]};
const STEM=["midbrain","pons","medulla"];
const STEM_COLOR=[[0.95,0.78,0.40],[0.93,0.60,0.42],[0.88,0.73,0.58]];
const CEREB_COLOR=[0.93,0.58,0.62];
const CAP_CORTEX=[0.96,0.91,0.80], CAP_CEREB=[0.97,0.80,0.80], CAP_STEM=[0.97,0.88,0.70];
// punkty orientacyjne: przybliżone współrzędne MNI (mm)
const MARKERS=[
 ["sgacc",[3,22,-9],3.2],["hypothalamus",[0,-5,-11],3.6],["pituitary",[0,2,-28],3],["pineal",[0,-32,0],2.4],["habenula",[3,-25,3],2],
 ["vta",[0,-17,-13],2.4],["sn",[-11,-18,-12],2.4],["sn",[11,-18,-12],2.4],["lc",[-5,-37,-27],2],["lc",[5,-37,-27],2],["raphe",[0,-29,-18],2.4],
 ["nbm",[-17,-3,-10],2.2],["nbm",[17,-3,-10],2.2],
 ["mammillary",[-4,-13,-14],1.8],["mammillary",[4,-13,-14],1.8],
 ["lgn",[-22,-26,-4],2],["lgn",[22,-26,-4],2],["mgn",[-16,-28,-4],1.8],["mgn",[16,-28,-4],1.8]
];
const MARKER_COLOR={sgacc:"#ff8a65",hypothalamus:"#ffa94d",pituitary:"#f06595",pineal:"#b197fc",habenula:"#74c0fc",vta:"#ff4d8d",sn:"#ff4d8d",lc:"#ff9f1c",raphe:"#9b6bff",nbm:"#2fd07a",mammillary:"#63e6be",lgn:"#74c0fc",mgn:"#da77f2"};
const DEEP=new Set(["nacc","amygdala","striatum","hippocampus","pallidum","thalamus","ventricles","midbrain","pons","medulla","sgacc","hypothalamus","pituitary","pineal","habenula","vta","sn","lc","raphe","nbm","cc","mammillary","lgn","mgn","whitematter"]);
const MEDIAL=new Set(["mpfc","acc","pcc","cc","sgacc","hypothalamus","pituitary","pineal","habenula","vta","sn","lc","raphe","midbrain","pons","medulla","mammillary","thalamus"]);
const SCTX_ANCHOR={nacc:"s_accumbens",amygdala:"s_amygdala",striatum:"s_caudate",hippocampus:"s_hippocampus",pallidum:"s_pallidum",thalamus:"s_thalamus",ventricles:"s_ventricles"};
const SEL=[1,0.82,0.25], DIM=[0.93,0.93,0.95], NEUTRAL=[0.93,0.93,0.95];
const UPC=[0.93,0.35,0.24], DOWNC=[0.22,0.50,0.96], OTHC=[0.72,0.46,0.96];

// ---------- three.js ----------
const box=$("#viewer"), canvas=$("#gl");
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,stencil:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2)); renderer.localClippingEnabled=true;
const clipPlane=new THREE.Plane(new THREE.Vector3(0,1,0),1e5);
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(30,1,1,2000);
const controls=new THREE.OrbitControls(camera,canvas);
controls.enableDamping=true; controls.dampingFactor=0.12; controls.minDistance=150; controls.maxDistance=700; controls.enablePan=false;
scene.add(new THREE.HemisphereLight(0xffffff,0x6b6b80,0.62));
const key=new THREE.DirectionalLight(0xffffff,0.72); camera.add(key); key.position.set(0.3,0.6,1);
const rim=new THREE.DirectionalLight(0xb9a6ff,0.35); camera.add(rim); rim.position.set(-0.8,-0.3,-0.6);
scene.add(camera);
const root=new THREE.Group(); scene.add(root);
// MNI (x prawo, y przód, z góra) -> three (x, z, -y); środek mózgu ~ (0,-18,10)
const toV=(x,y,z)=>new THREE.Vector3(x, z-10, -(y+18));
function b64(s,T){const bin=atob(s);const u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return new T(u.buffer);}
function makeGeo(g){
  const v=b64(g.v,Float32Array), f=b64(g.f,Uint16Array);
  const pos=new Float32Array(v.length);
  for(let i=0;i<v.length;i+=3){const p=toV(v[i],v[i+1],v[i+2]);pos[i]=p.x;pos[i+1]=p.y;pos[i+2]=p.z;}
  const geo=new THREE.BufferGeometry();
  geo.setAttribute("position",new THREE.BufferAttribute(pos,3));
  geo.setIndex(new THREE.BufferAttribute(new Uint32Array(f),1));
  geo.computeVertexNormals();
  geo.setAttribute("color",new THREE.BufferAttribute(new Float32Array(v.length).fill(0.8),3));
  return geo;
}
const clipMats=[];
const cortex={}, sctx={}, objs=[];
for(const h of ["lh","rh"]){
  const g=GEO[h], geo=makeGeo(g);
  const lab=b64(g.l,Uint8Array), sulc=b64(g.s,Int8Array);
  const mat=new THREE.MeshPhongMaterial({vertexColors:true,shininess:14,specular:0x2a2a33,side:THREE.DoubleSide,clippingPlanes:[clipPlane]});
  clipMats.push(mat);
  const mesh=new THREE.Mesh(geo,mat); mesh.renderOrder=2;
  mesh.userData={kind:"cortex",h,lab,sulc};
  root.add(mesh); cortex[h]=mesh; objs.push(mesh);
}
const sctxSub={lh:[],rh:[]};
for(const h of ["lh","rh"]){
  const g=GEO["sctx_"+h], geo=makeGeo(g); const lab=b64(g.l,Uint8Array);
  const mat=new THREE.MeshPhongMaterial({vertexColors:true,shininess:36,specular:0x333340,clippingPlanes:[clipPlane]}); clipMats.push(mat);
  const mesh=new THREE.Mesh(geo,mat);
  mesh.userData={kind:"sctx",h,lab}; mesh.renderOrder=1; root.add(mesh); sctx[h]=mesh; objs.push(mesh);
  // osobne siatki każdej struktury (do kolorowych przekrojów i sprawdzania, co leży w danym punkcie)
  const idx=geo.index.array;
  for(let k=0;k<SCTX.length;k++){
    const sub=[]; for(let i=0;i<idx.length;i+=3) if(lab[idx[i]]===k) sub.push(idx[i],idx[i+1],idx[i+2]);
    const sg=new THREE.BufferGeometry(); sg.setAttribute("position",geo.attributes.position); sg.setIndex(sub);
    sctxSub[h].push(sg);
  }
}
const cerebMat=new THREE.MeshPhongMaterial({vertexColors:true,shininess:10,side:THREE.DoubleSide,clippingPlanes:[clipPlane]}); clipMats.push(cerebMat);
const cereb=new THREE.Mesh(makeGeo(GEO.cerebellum),cerebMat);
cereb.userData={kind:"cerebellum",tex:b64(GEO.cerebellum.t,Uint8Array)}; root.add(cereb); objs.push(cereb);
const stemMat=new THREE.MeshPhongMaterial({vertexColors:true,shininess:10,side:THREE.DoubleSide,clippingPlanes:[clipPlane]}); clipMats.push(stemMat);
const stem=new THREE.Mesh(makeGeo(GEO.brainstem),stemMat);
stem.userData={kind:"stem",lab:b64(GEO.brainstem.l,Uint8Array),tex:b64(GEO.brainstem.t,Uint8Array)}; root.add(stem); objs.push(stem);
const stemSub=STEM.map((_,k)=>{const idx=stem.geometry.index.array,lab=stem.userData.lab,sub=[];for(let i=0;i<idx.length;i+=3) if(lab[idx[i]]===k) sub.push(idx[i],idx[i+1],idx[i+2]);const g=new THREE.BufferGeometry();g.setAttribute("position",stem.geometry.attributes.position);g.setIndex(sub);return g;});
const markerMeshes=[];
for(const [id,c,r] of MARKERS){
  const mt=new THREE.MeshPhongMaterial({color:0x2a8a94,shininess:60,emissive:0x000000,clippingPlanes:[clipPlane]}); clipMats.push(mt);
  const m=new THREE.Mesh(new THREE.SphereGeometry(r,20,14),mt);
  m.position.copy(toV(...c)); m.userData={kind:"marker",id,base:r}; m.renderOrder=1; root.add(m); markerMeshes.push(m); objs.push(m);
}
const leftMarker=id=>markerMeshes.find(m=>m.userData.id===id&&m.position.x<=0.5)||markerMeshes.find(m=>m.userData.id===id);

// granice modelu (do suwaka przekroju)
const bbox=new THREE.Box3();
[cortex.lh,cortex.rh,cereb,stem].forEach(m=>{m.geometry.computeBoundingBox();bbox.union(m.geometry.boundingBox);});

// centroidy i punkty na powierzchni (do szlaków, etykiet)
const centroid={}, surfPt={};
(function(){
  const m=cortex.lh,p=m.geometry.attributes.position.array,lab=m.userData.lab;const acc={};
  for(let i=0;i<lab.length;i++){const n=DK[lab[i]];(acc[n]=acc[n]||[0,0,0,0]);acc[n][0]+=p[i*3];acc[n][1]+=p[i*3+1];acc[n][2]+=p[i*3+2];acc[n][3]++;}
  for(const n in acc)centroid[n]=new THREE.Vector3(acc[n][0]/acc[n][3],acc[n][1]/acc[n][3],acc[n][2]/acc[n][3]);
  const best={};
  for(let i=0;i<lab.length;i++){const n=DK[lab[i]];const c=centroid[n];const d=(p[i*3]-c.x)**2+(p[i*3+1]-c.y)**2+(p[i*3+2]-c.z)**2;if(!best[n]||d<best[n][0])best[n]=[d,i];}
  for(const n in best){const i=best[n][1];surfPt[n]=new THREE.Vector3(p[i*3],p[i*3+1],p[i*3+2]);}
  const sm=sctx.lh,sp=sm.geometry.attributes.position.array,sl=sm.userData.lab,sa={};
  for(let i=0;i<sl.length;i++){const n=SCTX[sl[i]];(sa[n]=sa[n]||[0,0,0,0]);sa[n][0]+=sp[i*3];sa[n][1]+=sp[i*3+1];sa[n][2]+=sp[i*3+2];sa[n][3]++;}
  for(const n in sa)centroid["s_"+n]=new THREE.Vector3(sa[n][0]/sa[n][3],sa[n][1]/sa[n][3],sa[n][2]/sa[n][3]);
  cereb.geometry.computeBoundingBox(); centroid.cerebellum=cereb.geometry.boundingBox.getCenter(new THREE.Vector3()); centroid.cerebellum.x=-18;
  const tp=stem.geometry.attributes.position.array,tl=stem.userData.lab,ta={};
  for(let i=0;i<tl.length;i++){const n=STEM[tl[i]];(ta[n]=ta[n]||[0,0,0,0]);ta[n][0]+=tp[i*3];ta[n][1]+=tp[i*3+1];ta[n][2]+=tp[i*3+2];ta[n][3]++;}
  for(const n in ta)centroid["stem_"+n]=new THREE.Vector3(ta[n][0]/ta[n][3],ta[n][1]/ta[n][3],ta[n][2]/ta[n][3]);
})();
function resolveKey(k){
  const mk=leftMarker(k); if(mk) return mk.position.clone();
  if(k.startsWith("s_")||k==="cerebellum") return centroid[k].clone();
  if(surfPt[k]) return surfPt[k].clone();
  return (centroid[k]||new THREE.Vector3()).clone();
}
const regionOfKey=k=>k.startsWith("s_")?SCTX_REGION[k.slice(2)]:(PARCEL[k]?PARCEL[k][1]:k);
function anchorOf(id){
  const mk=leftMarker(id); if(mk) return mk.position.clone();
  if(SCTX_ANCHOR[id]) return centroid[SCTX_ANCHOR[id]].clone();
  if(STEM.includes(id)) return centroid["stem_"+id].clone();
  if(id==="cerebellum") return centroid.cerebellum.clone();
  const ps=(REGION_PARCELS[id]||[]).filter(p=>surfPt[p]);
  if(ps.length){
    const m=new THREE.Vector3(); ps.forEach(p=>m.add(centroid[p])); m.multiplyScalar(1/ps.length);
    let bp=ps[0],bd=1e9; ps.forEach(p=>{const d=centroid[p].distanceToSquared(m);if(d<bd){bd=d;bp=p;}});
    return surfPt[bp].clone();
  }
  return null;
}

// ---------- przekrój: kolorowe „zaślepki” (stencil) ----------
const capGroup=new THREE.Group(); capGroup.visible=false; root.add(capGroup);
const capPlaneGeo=new THREE.PlaneGeometry(700,700);
const capColGeo=new THREE.PlaneGeometry(300,300,70,70);
capColGeo.setAttribute("color",new THREE.BufferAttribute(new Float32Array(capColGeo.attributes.position.count*3).fill(0.95),3));
let capStamp="";
const capSets=[]; // {cap, h, kind, k, solid(pick mesh), region, label}
const pickMat=new THREE.MeshBasicMaterial({side:THREE.DoubleSide});
function addCapSet(geo,order,meta){
  const base={depthWrite:false,depthTest:false,colorWrite:false,stencilWrite:true,stencilFunc:THREE.AlwaysStencilFunc,clippingPlanes:[clipPlane]};
  const mb=new THREE.MeshBasicMaterial({...base,side:THREE.BackSide,stencilFail:THREE.IncrementWrapStencilOp,stencilZFail:THREE.IncrementWrapStencilOp,stencilZPass:THREE.IncrementWrapStencilOp});
  const mf=new THREE.MeshBasicMaterial({...base,side:THREE.FrontSide,stencilFail:THREE.DecrementWrapStencilOp,stencilZFail:THREE.DecrementWrapStencilOp,stencilZPass:THREE.DecrementWrapStencilOp});
  const back=new THREE.Mesh(geo,mb), front=new THREE.Mesh(geo,mf);
  back.renderOrder=front.renderOrder=order; back.frustumCulled=front.frustumCulled=false;
  const capMat=new THREE.MeshBasicMaterial({color:0xffffff,vertexColors:meta.kind==="cortex",side:THREE.DoubleSide,stencilWrite:true,stencilRef:0,stencilFunc:THREE.NotEqualStencilFunc,stencilFail:THREE.ReplaceStencilOp,stencilZFail:THREE.ReplaceStencilOp,stencilZPass:THREE.ReplaceStencilOp});
  const cap=new THREE.Mesh(meta.kind==="cortex"?capColGeo:capPlaneGeo,capMat); cap.renderOrder=order+0.5; cap.frustumCulled=false;
  cap.onAfterRender=r=>r.clearStencil();
  const grp=new THREE.Group(); grp.add(back,front,cap); capGroup.add(grp);
  const solid=new THREE.Mesh(geo,pickMat);
  const set={cap,grp,solid,...meta}; capSets.push(set); return set;
}
let order=20;
for(const h of ["lh","rh"]) addCapSet(cortex[h].geometry,order++,{h,kind:"cortex",region:"whitematter",label:"Wnętrze półkuli (istota biała, uproszczenie)"});
for(const h of ["lh","rh"]) for(let k=0;k<SCTX.length;k++) addCapSet(sctxSub[h][k],order++,{h,kind:"sctx",k,region:SCTX_REGION[SCTX[k]],label:SCTX_PL[SCTX[k]]});
addCapSet(cereb.geometry,order++,{h:"mid",kind:"cerebellum",region:"cerebellum",label:"Móżdżek"});
addCapSet(stem.geometry,order++,{h:"mid",kind:"stem",region:"medulla",label:"Pień mózgu"});
// kolejność: półkule, struktury podkorowe nad nimi, potem móżdżek i pień
// próbki kory: kolor wnętrza przekroju bierze się z najbliższego obszaru kory
const capSamples=(function(){const xs=[],ys=[],zs=[],ls=[],hs=[];
  for(const h of ["lh","rh"]){const p=cortex[h].geometry.attributes.position.array,lab=cortex[h].userData.lab;for(let i=0;i<lab.length;i+=9){if(lab[i]===0)continue;xs.push(p[i*3]);ys.push(p[i*3+1]);zs.push(p[i*3+2]);ls.push(lab[i]);hs.push(h);}}
  return {xs,ys,zs,ls,hs,n:xs.length};})();
function paintCapPlane(){
  if(!lastTables||!capGroup.visible) return;
  const cap=capSets.find(s=>s.kind==="cortex").cap; cap.updateMatrixWorld(true);
  const pos=capColGeo.attributes.position, col=capColGeo.attributes.color, v=new THREE.Vector3(), S=capSamples;
  const lo=bbox.min.clone().addScalar(-6), hi=bbox.max.clone().addScalar(6);
  for(let i=0;i<pos.count;i++){
    v.set(pos.getX(i),pos.getY(i),pos.getZ(i)).applyMatrix4(cap.matrixWorld);
    let c=CAP_CORTEX;
    if(v.x>=lo.x&&v.x<=hi.x&&v.y>=lo.y&&v.y<=hi.y&&v.z>=lo.z&&v.z<=hi.z){
      let bi=0,bd=1e12; for(let j=0;j<S.n;j++){const dx=S.xs[j]-v.x,dy=S.ys[j]-v.y,dz=S.zs[j]-v.z,d=dx*dx+dy*dy+dz*dz; if(d<bd){bd=d;bi=j;}}
      c=mix(lastTables.cort[S.hs[bi]][S.ls[bi]],CAP_CORTEX,0.28);
    }
    col.setXYZ(i,c[0],c[1],c[2]);
  }
  col.needsUpdate=true;
}
let capRaf=null;
function schedulePaint(){ if(capRaf) return; capRaf=requestAnimationFrame(()=>{capRaf=null; paintCapPlane(); capStamp=modeStamp();}); }
function modeStamp(){return [state.disorder,state.network,[...state.pathways].join(","),state.enigma,state.solo&&state.solo.pw+state.solo.ri,state.section.axis,state.section.frac].join("|");}
function orientCaps(){
  const p=new THREE.Vector3(); clipPlane.coplanarPoint(p);
  for(const s of capSets){s.cap.position.copy(p); s.cap.lookAt(p.clone().add(clipPlane.normal));}
}

// ---------- szlaki neuroprzekaźników ----------
function glowTexture(){
  const c=document.createElement("canvas"); c.width=c.height=64; const g=c.getContext("2d");
  const gr=g.createRadialGradient(32,32,0,32,32,32); gr.addColorStop(0,"rgba(255,255,255,1)"); gr.addColorStop(.25,"rgba(255,255,255,.75)"); gr.addColorStop(1,"rgba(255,255,255,0)");
  g.fillStyle=gr; g.fillRect(0,0,64,64); return new THREE.CanvasTexture(c);
}
const glowTex=glowTexture();
const pwRoot=new THREE.Group(); root.add(pwRoot);
const routeObjs=[]; // {pw, route, group, tube, cone, pts, lut, phase, speed, curve}
const sourceGlows=[]; // {pw, sprite, base}
const PW=Object.fromEntries(PATHWAYS.map(p=>[p.id,p]));
for(const pw of PATHWAYS){
  const col=new THREE.Color(pw.color);
  const srcs=new Set();
  pw.routes.forEach((route,ri)=>{
    const a=resolveKey(route.from), b=resolveKey(route.to);
    const pts=[a];
    if(route.via&&route.via.length) route.via.forEach(v=>pts.push(toV(...v)));
    else {const mid=a.clone().lerp(b,0.5); mid.y+=a.distanceTo(b)*0.18; mid.x=Math.min(mid.x,-6); pts.push(mid);}
    pts.push(b);
    const curve=new THREE.CatmullRomCurve3(pts,false,"centripetal");
    const g=new THREE.Group(); g.visible=false; pwRoot.add(g);
    const tmat=new THREE.MeshBasicMaterial({color:col,depthTest:false,depthWrite:false,transparent:true,opacity:0.55});
    const tube=new THREE.Mesh(new THREE.TubeGeometry(curve,64,0.85,8,false),tmat);
    tube.renderOrder=5; tube.userData={kind:"path",label:pw.name+" · "+route.name+": "+route.label,pw:pw.id,ri};
    const cmat=new THREE.MeshBasicMaterial({color:col,depthTest:false,depthWrite:false,transparent:true,opacity:0.95});
    const cone=new THREE.Mesh(new THREE.ConeGeometry(2.4,5.5,14),cmat); cone.position.copy(b);
    cone.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),curve.getTangent(1)); cone.renderOrder=5; cone.userData=tube.userData;
    const N=8, pos=new Float32Array(N*3);
    const pgeo=new THREE.BufferGeometry(); pgeo.setAttribute("position",new THREE.BufferAttribute(pos,3));
    const pmat=new THREE.PointsMaterial({color:col,size:7,sizeAttenuation:true,map:glowTex,transparent:true,depthTest:false,depthWrite:false,blending:THREE.AdditiveBlending});
    const points=new THREE.Points(pgeo,pmat); points.renderOrder=6; points.frustumCulled=false;
    g.add(tube,cone,points); objs.push(tube,cone);
    const lut=curve.getSpacedPoints(90);
    routeObjs.push({pw:pw.id,ri,route,group:g,tube,cone,points,pgeo,lut,N,phase:Array.from({length:N},(_,i)=>i/N),speed:0.16+0.03*(ri%3),curve,a,b,tmat,cmat,pmat});
    srcs.add(route.from);
  });
  for(const s of srcs){
    const sm=new THREE.SpriteMaterial({map:glowTex,color:col,transparent:true,blending:THREE.AdditiveBlending,depthTest:false,depthWrite:false,opacity:0.9});
    const sp=new THREE.Sprite(sm); sp.position.copy(resolveKey(s)); sp.scale.setScalar(16); sp.renderOrder=6; sp.visible=false; pwRoot.add(sp);
    sourceGlows.push({pw:pw.id,sprite:sp,from:s});
  }
}

// ---------- sieci: węzły i połączenia ----------
const netGroup=new THREE.Group(); root.add(netGroup);
function buildNetwork(n){
  while(netGroup.children.length){const c=netGroup.children.pop(); c.geometry&&c.geometry.dispose(); c.material&&c.material.dispose();}
  if(!n) return;
  const col=new THREE.Color(n.color||"#b388ff");
  const pts=n.regions.map(r=>anchorOf(r)).filter(Boolean);
  for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++){
    const a=pts[i],b=pts[j],mid=a.clone().lerp(b,0.5); mid.y+=a.distanceTo(b)*0.12;
    const curve=new THREE.CatmullRomCurve3([a,mid,b]);
    const t=new THREE.Mesh(new THREE.TubeGeometry(curve,32,0.55,6,false),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:0.5,depthTest:false,depthWrite:false}));
    t.renderOrder=5; netGroup.add(t);
  }
  pts.forEach(p=>{
    const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:col,transparent:true,blending:THREE.AdditiveBlending,depthTest:false,depthWrite:false,opacity:0.85}));
    sp.position.copy(p); sp.scale.setScalar(20); sp.renderOrder=6; netGroup.add(sp);
  });
}

const fmt=d=>(d>0?"+":d<0?"−":"")+Math.abs(d).toFixed(2).replace(".",",");

// ---------- stan ----------
const state={disorder:null,network:null,region:null,enigma:true,glass:false,right:true,pathways:new Set(),solo:null,hover:null,view:"left",section:{axis:"",frac:0.5,flip:false}};
let mirror=false, flatMode=false, lastTables=null, stemTab=null, cerebTab=null; const cortTab={};
const sectionActive=()=>!!state.section.axis;
function hlMap(){
  // region -> kolor (większe obszary najpierw, szczegółowe je nadpisują)
  const m=new Map();
  if(state.network){const n=NETWORKS.find(x=>x.name===state.network); const c=hex(n.color||"#b388ff"); n.regions.forEach(r=>m.set(r,c));}
  else if(state.disorder){DISORDERS.find(d=>d.id===state.disorder).regions.forEach(([r,dir])=>{const k=dirClass(dir||"");m.set(r,k==="up"?UPC:k==="down"?DOWNC:OTHC);});}
  return m;
}
function ntTint(){
  // klucz (parcel, s_struktura, cerebellum) -> kolory przekaźników docierających
  const t={};
  for(const r of routeObjs){
    if(!state.pathways.has(r.pw)) continue; if(state.solo&&!(state.solo.pw===r.pw&&state.solo.ri===r.ri)) continue;
    (t[r.route.to]=t[r.route.to]||[]).push(hex(PW[r.pw].color));
  }
  const out={}; for(const k in t){const a=t[k];out[k]=[a.reduce((s,c)=>s+c[0],0)/a.length,a.reduce((s,c)=>s+c[1],0)/a.length,a.reduce((s,c)=>s+c[2],0)/a.length];}
  return out;
}
function enigmaData(){ if(!state.enigma||!state.disorder||state.network) return null; return ENIGMA[state.disorder]||null; }
function dColor(d,scale){ // niebieski (mniej) – biały (brak efektu) – czerwony (więcej)
  if(d===undefined||Math.abs(d)<0.03) return NEUTRAL;
  const t=Math.min(1,0.30+0.70*Math.abs(d)/scale), c=d<0?[0.16,0.40,0.92]:[0.92,0.28,0.18];
  return mix(NEUTRAL,c,t);
}
function scaleFor(e){let m=0;for(const k in e.cort)m=Math.max(m,Math.abs(e.cort[k]));for(const k in e.sub)m=Math.max(m,Math.abs(e.sub[k]));return Math.max(0.2,Math.ceil(m*10)/10);}

let animT=0, recolorCount=0, dirty=true, lastRender=0;
function recolor(){
  recolorCount++; dirty=true;
  const m=hlMap(), e=enigmaData(), scale=e?scaleFor(e):0.5, tint=(state.pathways.size&&!state.disorder&&!state.network)?ntTint():null;
  const selBoost=1;
  const anyMode=m.size>0||!!tint||!!e;
  // kolor obszaru w trybie funkcjonalnym (płat -> szczegół)
  const parcelPaint={}, sctxPaint={};
  const regs=[...m.keys()].sort((a,b)=>(REGION_PARCELS[b]||[]).length-(REGION_PARCELS[a]||[]).length);
  for(const r of regs){(REGION_PARCELS[r]||[]).forEach(p=>parcelPaint[p]=m.get(r)); for(const k of SCTX) if(SCTX_REGION[k]===r) sctxPaint[k]=m.get(r);}
  const selParcels=new Set(state.region?(REGION_PARCELS[state.region]||[]):[]);
  const selSctx=new Set(SCTX.filter(k=>SCTX_REGION[k]===state.region));
  const hov=state.hover, hovParcels=new Set(hov?(REGION_PARCELS[hov.region]||[]):[]), hovSctx=new Set(hov?SCTX.filter(k=>SCTX_REGION[k]===hov.region):[]);
  for(const h of ["lh","rh"]){
    const mesh=cortex[h], col=mesh.geometry.attributes.color.array, lab=mesh.userData.lab, sulc=mesh.userData.sulc;
    const table=DK.map((name,li)=>{
      let c;
      if(name==="unknown") c=[0.80,0.80,0.84];
      else if(e){const d=e.cort[(h==="lh"?"L_":"R_")+name]; c=dColor(d,scale);}
      else if(tint&&tint[name]) c=mix(DIM,tint[name],0.88);
      else if(parcelPaint[name]) c=parcelPaint[name];
      else c=anyMode?DIM:LOBE_COLOR[PARCEL[name][2]];
      if(selParcels.has(name)) c=mix(c,SEL,0.78).map(x=>Math.min(1,x*selBoost));
      if(hovParcels.has(name)) c=mix(c,[1,1,1],0.30);
      return c;
    });
    cortTab[h]=table;
    for(let i=0;i<lab.length;i++){
      const c=table[lab[i]]; const sh=0.80+0.20*(-sulc[i]/127);
      col[i*3]=c[0]*sh; col[i*3+1]=c[1]*sh; col[i*3+2]=c[2]*sh;
    }
    mesh.geometry.attributes.color.needsUpdate=true;
    mesh.material.transparent=state.glass; mesh.material.opacity=state.glass?0.17:1; mesh.material.depthWrite=!state.glass;
  }
  cortex.rh.visible=state.right;
  const capCol={};
  for(const h of ["lh","rh"]){
    const mesh=sctx[h], col=mesh.geometry.attributes.color.array, lab=mesh.userData.lab;
    const cache=SCTX.map(n=>{
      let c;
      if(e){const d=e.sub[(h==="lh"?"L":"R")+SCTX_KEY[n]]; c=dColor(d,scale);}
      else if(tint&&tint["s_"+n]) c=mix(DIM,tint["s_"+n],0.9);
      else if(sctxPaint[n]) c=sctxPaint[n];
      else c=anyMode?NEUTRAL:SCTX_COLOR[n];
      if(selSctx.has(n)) c=mix(c,SEL,0.7).map(x=>Math.min(1,x*selBoost));
      if(hovSctx.has(n)) c=mix(c,[1,1,1],0.30);
      return c;});
    for(let i=0;i<lab.length;i++){const c=cache[lab[i]];col[i*3]=c[0];col[i*3+1]=c[1];col[i*3+2]=c[2];}
    mesh.geometry.attributes.color.needsUpdate=true; mesh.visible=(h==="lh"||state.right);
    capCol[h]=cache;
  }
  // pień i móżdżek
  {const col=stem.geometry.attributes.color.array, lab=stem.userData.lab, tx=stem.userData.tex;
   const t=STEM.map((id,i)=>{let c=m.has(id)?m.get(id):(m.size||tint||e?NEUTRAL:STEM_COLOR[i]); if(state.region===id) c=mix(c,SEL,0.75).map(x=>Math.min(1,x*selBoost)); if(hov&&hov.region===id) c=mix(c,[1,1,1],0.25); return c;});
   stemTab=t;
   for(let i=0;i<lab.length;i++){const c=t[lab[i]];const sh=0.70+0.38*tx[i]/255;col[i*3]=c[0]*sh;col[i*3+1]=c[1]*sh;col[i*3+2]=c[2]*sh;}
   stem.geometry.attributes.color.needsUpdate=true;}
  {let c=m.has("cerebellum")?m.get("cerebellum"):(tint&&tint.cerebellum?mix(DIM,tint.cerebellum,0.9):(m.size||tint||e?NEUTRAL:CEREB_COLOR));
   if(state.region==="cerebellum") c=mix(c,SEL,0.7).map(x=>Math.min(1,x*selBoost)); if(hov&&hov.region==="cerebellum") c=mix(c,[1,1,1],0.25);
   cerebTab=c; const col=cereb.geometry.attributes.color.array, tx=cereb.userData.tex; for(let i=0;i<tx.length;i++){const sh=0.62+0.45*tx[i]/255;col[i*3]=c[0]*sh;col[i*3+1]=c[1]*sh;col[i*3+2]=c[2]*sh;} cereb.geometry.attributes.color.needsUpdate=true;}
  lastTables={cort:cortTab,sctx:capCol,stem:stemTab,cereb:cerebTab};
  if(capGroup.visible&&capStamp!==modeStamp()) schedulePaint();
  // zaślepki przekroju: kolory struktur
  for(const s of capSets){
    if(s.kind==="cortex"){s.grp.visible=s.h==="rh"?state.right:true; continue;}
    let c; if(false) c=CAP_CORTEX; else if(s.kind==="sctx") c=capCol[s.h][s.k]; else if(s.kind==="cerebellum") c=CAP_CEREB; else c=CAP_STEM;
    s.cap.material.color.setRGB(c[0],c[1],c[2]);
    s.grp.visible=s.h==="rh"?state.right:true;
  }
  // punkty orientacyjne i źródła
  for(const mk of markerMeshes){
    const id=mk.userData.id; const on=m.has(id)||state.region===id; const isHov=hov&&hov.region===id;
    const srcPw=routeObjs.find(r=>state.pathways.has(r.pw)&&r.route.from===id);
    const base=anyMode&&!srcPw?NEUTRAL:srcPw?hex(PW[srcPw.pw].color):hex(MARKER_COLOR[id]||"#3aa7b3");
    let c=on?(state.region===id?SEL:m.get(id)||base):base;
    mk.material.color.setRGB(c[0],c[1],c[2]); mk.material.emissive.setRGB(c[0]*0.35,c[1]*0.35,c[2]*0.35);
    mk.scale.setScalar((on?1.45:1)*(isHov?1.25:1)*(state.region===id?1.1:1));
    mk.visible=mk.position.x<=0.5||state.right;
  }
  // legenda
  const lg=$("#scale");
  if(e){lg.hidden=false;$("#scale-min").textContent="−"+scale.toFixed(1).replace(".",",");$("#scale-max").textContent="+"+scale.toFixed(1).replace(".",",");$("#scale-label").textContent="Cohen's d · ENIGMA · "+e.metric;}
  else lg.hidden=true;
  $("#t-glass").setAttribute("aria-pressed",state.glass); $("#t-right").setAttribute("aria-pressed",!state.right);
  const eb=$("#t-enigma"); eb.hidden=!(state.disorder&&ENIGMA[state.disorder]&&!state.network); eb.setAttribute("aria-pressed",state.enigma);
  const relPw=state.disorder?PATHWAYS.filter(p=>p.disorders.includes(state.disorder)).map(p=>p.id):null;
  for(const b of document.querySelectorAll("[data-pw]")){
    b.setAttribute("aria-pressed",state.pathways.has(b.dataset.pw));
    b.classList.toggle("rel",!!relPw&&relPw.includes(b.dataset.pw));
    b.classList.toggle("dim",!!relPw&&relPw.length>0&&!relPw.includes(b.dataset.pw));
  }
  const pn=document.getElementById("pwnote");
  if(pn) pn.textContent=state.disorder?(relPw.length?"Z tym zaburzeniem związane są szlaki: "+relPw.map(i=>PW[i].name).join(", ")+" (podświetlone). Włączenie szlaku nie zmienia kolorów zaburzenia na modelu.":"Dla tego zaburzenia atlas nie opisuje szlaków neuroprzekaźników. Możesz mimo to obejrzeć dowolny szlak."):"Włącz jeden lub kilka: źródło zaświeci, cząsteczki popłyną do celów, a obszary docelowe zabarwią się kolorem przekaźnika.";
  applyPathwayVisibility();
  if(flatMode) renderFlat();
}
const lobeLeg=$("#lobeleg");
function legend(){
  let h="";
  if(enigmaData()){lobeLeg.hidden=true;return;}
  const pw=[...state.pathways].map(id=>`<span><i style="background:${PW[id].color}"></i>${esc(PW[id].name)}</span>`).join("");
  if(state.network){const n=NETWORKS.find(x=>x.name===state.network);h=`<span><i style="background:${n.color}"></i>${esc(n.name)}</span><span><i style="background:#eeeef2"></i>poza siecią</span>`+pw;}
  else if(state.disorder){h=`<span><i style="background:#ed5a3d"></i>więcej / nadaktywność</span><span><i style="background:#3880f5"></i>mniej / niedoczynność</span><span><i style="background:#b875f5"></i>udział w zaburzeniu</span><span><i style="background:#eeeef2"></i>bez opisanego efektu</span>`+pw;}
  else if(state.pathways.size) h=pw+`<span><i style="background:#eeeef2"></i>poza szlakiem</span>`;
  else {h=Object.keys(LOBE_NAME).map(k=>`<span><i style="background:rgb(${LOBE_COLOR[k].map(x=>Math.round(x*255)).join(",")})"></i>${LOBE_NAME[k]}</span>`).join("");}
  lobeLeg.hidden=false; lobeLeg.innerHTML=h;
}
function applyPathwayVisibility(){
  for(const r of routeObjs){
    const on=state.pathways.has(r.pw); const solo=state.solo; const mine=!solo||(solo.pw===r.pw&&solo.ri===r.ri);
    r.group.visible=on; r.tmat.opacity=mine?0.55:0.10; r.cmat.opacity=mine?0.95:0.15; r.points.visible=mine;
  }
  for(const g of sourceGlows) g.sprite.visible=state.pathways.has(g.pw);
}

// ---------- widoki i kamera ----------
const VIEWS={
 left:[[-340,25,0],"Lewa"], right:[[340,25,0],"Prawa"], medial:[[340,20,0],"Przyśrodek"],
 top:[[0,340,-40],"Góra"], bottom:[[0,-340,-40],"Dół"], front:[[0,25,-340],"Przód"], back:[[0,40,340],"Tył"]
};
let tween=null;
function flyTo(p,dur){
  const to=new THREE.Vector3(...p); const from=camera.position.clone();
  if(REDUCED||dur===0){camera.position.copy(to);camera.up.set(0,1,0);controls.target.set(0,0,0);controls.update();return;}
  tween={from,to,t0:performance.now(),dur:dur||650};
}
function stepTween(now){
  if(!tween) return;
  const k=Math.min(1,(now-tween.t0)/tween.dur), e=k<0.5?2*k*k:1-Math.pow(-2*k+2,2)/2;
  const a=tween.from.clone().normalize(), b=tween.to.clone().normalize();
  const q=new THREE.Quaternion().setFromUnitVectors(a,b); const qi=new THREE.Quaternion().slerp(q,e);
  const dir=a.clone().applyQuaternion(qi); const len=tween.from.length()+(tween.to.length()-tween.from.length())*e;
  camera.position.copy(dir.multiplyScalar(len)); camera.up.set(0,1,0); controls.target.set(0,0,0);
  if(k>=1) tween=null;
}
function setView(v,instant){
  state.view=v; const [p]=VIEWS[v];
  state.right=!(v==="medial"&&!sectionActive());
  document.querySelectorAll("[data-view]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.view===v));
  flyTo(p,instant?0:650); updateClip(); recolor(); legend();
}
function resize(){
  dirty=true;
  const w=box.clientWidth,h=w<600?Math.round(Math.min(w*1.02,520)):Math.round(Math.min(w*0.74,620));
  renderer.setSize(w,h,false);canvas.style.height=h+"px";camera.aspect=w/h;camera.updateProjectionMatrix();
}
window.addEventListener("resize",resize); resize();
if(window.ResizeObserver) new ResizeObserver(resize).observe(box);

// ---------- przekrój ----------
const AX={x:{n:[-1,0,0],axis:"x"},z:{n:[0,0,1],axis:"z"},y:{n:[0,-1,0],axis:"y"}};
function secPos(){
  const s=state.section, mn=bbox.min[s.axis]-4, mx=bbox.max[s.axis]+4; return mn+(mx-mn)*s.frac;
}
function mniOf(axis,v){return axis==="x"?v:axis==="y"?v+10:-(v)-18;}
function secLabel(){
  const s=state.section; if(!s.axis) return ""; const mm=Math.round(mniOf(s.axis,secPos()));
  return (s.axis==="x"?"x":s.axis==="y"?"z":"y")+" = "+(mm>0?"+":mm<0?"−":"")+Math.abs(mm)+" mm";
}
function updateClip(){
  dirty=true;
  const s=state.section;
  if(s.axis){
    const n=new THREE.Vector3(...AX[s.axis].n), pos=secPos();
    if(s.flip) n.multiplyScalar(-1);
    // płaszczyzna n·p + c = 0, zostaje strona n·p + c >= 0
    // oś x: n=(-1,0,0) zachowuje x <= pos  =>  c = pos;  oś y: n=(0,-1,0) => c = pos;  oś z: n=(0,0,1) zachowuje z >= pos => c = -pos
    const c=(s.axis==="z"?-pos:pos)*(s.flip?-1:1);
    clipPlane.normal.copy(n); clipPlane.constant=c;
  } else if(!state.right){ clipPlane.normal.set(-1,0,0); clipPlane.constant=0.3; }
  else { clipPlane.normal.set(0,1,0); clipPlane.constant=1e5; }
  const act=sectionActive()||!state.right;
  capGroup.visible=act;
  if(act){ orientCaps(); schedulePaint(); }
  mirror=computeMirror();
  $("#sec-val").textContent=secLabel();
  if(flatMode) scheduleFlat();
}
function computeMirror(){
  const s=state.section;
  if(s.axis==="x") return s.flip;
  return camera.position.x>0&&state.right;
}
function setSection(axis,opts){
  const s=state.section; opts=opts||{};
  s.axis=axis; s.flip=!!opts.flip;
  if(axis){ s.frac=opts.frac!==undefined?opts.frac:0.5; $("#sec-range").value=Math.round(s.frac*100); if(!opts.keepCamera){
      const v=axis==="x"?(s.flip?[-340,25,0]:[340,25,0]):axis==="z"?(s.flip?[0,40,340]:[0,25,-340]):(s.flip?[0,-340,-40]:[0,340,-40]);
      flyTo(v);
    } }
  document.querySelectorAll("#sec-axis button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.axis===axis));
  $("#sec-extra").hidden=!axis;
  if(axis&&state.view==="medial"){ state.right=true; }
  if(!axis&&state.view==="medial") state.right=false;
  updateClip(); recolor();
}
function setSectionMNI(axis,mm,flip){
  const three=axis==="x"?mm:axis==="y"?mm-10:-(mm+18);
  const mn=bbox.min[axis]-4, mx=bbox.max[axis]+4; setSection(axis,{frac:Math.max(0,Math.min(1,(three-mn)/(mx-mn))),flip});
  state.glass=false; recolor();
}
document.querySelectorAll("#sec-axis button").forEach(b=>b.onclick=()=>setSection(b.dataset.axis));
$("#sec-range").addEventListener("input",e=>{state.section.frac=e.target.value/100;updateClip();});
$("#sec-flip").onclick=()=>{const s=state.section;setSection(s.axis,{flip:!s.flip,frac:s.frac});};

// ---------- etykiety ----------
const labelsEl=$("#labels"); let labelDefs=[];
function setLabels(defs){
  labelDefs=defs.map(d=>({...d,el:null}));
  labelsEl.innerHTML=""; labelDefs.forEach(d=>{const el=document.createElement("div");el.className="lbl";el.textContent=d.text;el.style.setProperty("--c",d.color||"var(--sel)");labelsEl.appendChild(el);d.el=el;});
}
const _v=new THREE.Vector3();
function updateLabels(){
  const w=canvas.clientWidth,h=canvas.clientHeight;
  for(const d of labelDefs){
    const a=d.anchor(); if(!a){d.el.style.display="none";continue;}
    _v.copy(a); if(mirror&&!d.fixed) _v.x*=-1; _v.project(camera);
    if(_v.z>1||Math.abs(_v.x)>1.05||Math.abs(_v.y)>1.05){d.el.style.display="none";continue;}
    const x=(_v.x*0.5+0.5)*w, y=(-_v.y*0.5+0.5)*h;
    d.el.style.display="block";
    const lw=d.el.offsetWidth;
    d.el.style.transform=`translate(${Math.round(Math.max(4,Math.min(w-lw-4,x-lw/2)))}px,${Math.round(Math.max(4,y-d.el.offsetHeight-12))}px)`;
  }
}
function labelsForState(){
  const defs=[];
  if(state.network){const n=NETWORKS.find(x=>x.name===state.network); n.regions.forEach(r=>{const a=anchorOf(r); if(a)defs.push({text:REGIONS[r].name.replace(/ \(.*\)/,""),color:n.color,anchor:()=>a});});}
  else if(state.pathways.size){
    const seen=new Set();
    routeObjs.forEach(r=>{ if(!state.pathways.has(r.pw)||seen.has(r.pw+r.route.from)) return; seen.add(r.pw+r.route.from); const id=regionOfKey(r.route.from); const a=resolveKey(r.route.from); defs.push({text:(REGIONS[id]?REGIONS[id].name.replace(/ \(.*\)/,""):r.route.from),color:PW[r.pw].color,anchor:()=>a});});
  }
  if(state.region){const a=state.regionAnchor||anchorOf(state.region); if(a){const fixed=!!state.regionAnchor; defs.push({text:REGIONS[state.region].name.replace(/ \(.*\)/,""),color:"var(--sel)",anchor:()=>a,fixed});}}
  setLabels(defs);
}

// ---------- wybieranie myszą ----------
const ray=new THREE.Raycaster(), mouse=new THREE.Vector2();
function planeHit(){
  const p=new THREE.Vector3(); return ray.ray.intersectPlane(clipPlane,p)?p:null;
}
function insideAt(P){
  const dir=clipPlane.normal.clone();
  if(sectionActive()===false) dir.set(-1,0,0);
  const r2=new THREE.Raycaster(); r2.set(P,dir);
  for(const s of capSets){
    if(s.h==="rh"&&!state.right) continue;
    if(s.kind==="cortex") continue;
    const n=r2.intersectObject(s.solid,false).filter(x=>x.distance>0.01).length;
    if(n%2===1) return {region:s.region,label:s.label,sctx:s.kind==="sctx"?SCTX[s.k]:undefined,h:s.h==="mid"?undefined:s.h,point:P.clone(),inside:true};
  }
  for(const s of capSets){
    if(s.kind!=="cortex"||(s.h==="rh"&&!state.right)) continue;
    const n=r2.intersectObject(s.solid,false).filter(x=>x.distance>0.01).length;
    if(n%2===1) return {region:"whitematter",label:s.label,point:P.clone(),inside:true};
  }
  return null;
}
function pick(ev){
  const r=canvas.getBoundingClientRect(); mouse.set(((ev.clientX-r.left)/r.width)*2-1,-((ev.clientY-r.top)/r.height)*2+1);
  ray.setFromCamera(mouse,camera);
  const clipOn=capGroup.visible;
  if(clipOn&&clipPlane.distanceToPoint(camera.position)<0){
    const P=planeHit(); if(P){const ins=insideAt(P); if(ins) return ins;}
  }
  const vis=objs.filter(o=>o.visible&&(o.parent.visible!==false));
  const deep=vis.filter(o=>o.userData.kind!=="cortex");
  const okHit=h=>!clipOn||clipPlane.distanceToPoint(h.point)>=0;
  let hits=state.glass?ray.intersectObjects(deep).filter(okHit):[];
  if(!hits.length) hits=ray.intersectObjects(vis).filter(okHit);
  if(!hits.length) return null;
  const h=hits[0], o=h.object, ud=o.userData;
  if(ud.kind==="cortex"){const n=DK[ud.lab[h.face.a]]; if(n==="unknown")return {region:"cc",label:"Ściana przyśrodkowa (bez kory)"}; return {parcel:n,region:PARCEL[n][1],label:PARCEL[n][0],h:ud.h};}
  if(ud.kind==="sctx"){const n=SCTX[ud.lab[h.face.a]]; return {sctx:n,region:SCTX_REGION[n],label:SCTX_PL[n],h:ud.h};}
  if(ud.kind==="stem"){const id=STEM[ud.lab[h.face.a]]; return {region:id,label:REGIONS[id].name};}
  if(ud.kind==="cerebellum") return {region:"cerebellum",label:REGIONS.cerebellum.name};
  if(ud.kind==="marker") return {region:ud.id,label:REGIONS[ud.id].name+" (punkt orientacyjny)"};
  if(ud.kind==="path") return {label:ud.label,route:{pw:ud.pw,ri:ud.ri}};
  return null;
}
let down=null;
const hintEl=$("#hint");
canvas.addEventListener("pointerdown",e=>{down=[e.clientX,e.clientY]; if(hintEl) hintEl.classList.add("gone");});
canvas.addEventListener("pointerup",e=>{
  if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>5) return; down=null;
  const p=pick(e); tip.style.opacity=0;
  if(p&&p.route){showPathway(p.route.pw,{route:p.route,keep:true,keepContext:true});return;}
  if(p&&p.region){ selectRegion(p.region,p); revealSelbar(); } else clearRegion();
});
// na telefonie pasek z nazwą może być tuż pod krawędzią ekranu: dosuwamy go, ale tylko o tyle, ile trzeba
function revealSelbar(){
  requestAnimationFrame(()=>{const s=$("#selbar"); if(s&&!s.hidden) s.scrollIntoView({block:"nearest",behavior:REDUCED?"auto":"smooth"});});
}
function setHover(p){
  const next=p&&p.region?{region:p.region}:null;
  const same=(!next&&!state.hover)||(next&&state.hover&&next.region===state.hover.region);
  if(same) return; state.hover=next; recolor();
}
const regionName=p=>p&&p.region&&REGIONS[p.region]?REGIONS[p.region].name:(p?p.label:"");
let raf=null;
canvas.addEventListener("pointermove",e=>{
  if(e.pointerType&&e.pointerType!=="mouse") return;
  if(raf) return; raf=requestAnimationFrame(()=>{raf=null;
    if(e.buttons){tip.style.opacity=0;setHover(null);return;}
    const p=pick(e), b=box.getBoundingClientRect();
    if(!p){tip.style.opacity=0;canvas.style.cursor="grab";setHover(null);return;}
    setHover(p.route?null:p);
    if(p.region&&p.region===state.region){tip.style.opacity=0;canvas.style.cursor="pointer";return;}
    let t=regionName(p); const en=enigmaData();
    if(en&&p.parcel){const d=en.cort[(p.h==="lh"?"L_":"R_")+p.parcel]; if(d!==undefined)t+=` · d = ${fmt(d)}`;}
    if(en&&p.sctx&&p.h){const d=en.sub[(p.h==="lh"?"L":"R")+SCTX_KEY[p.sctx]]; if(d!==undefined)t+=` · d = ${fmt(d)}`;}
    tip.textContent=t; tip.style.left=(e.clientX-b.left)+"px"; tip.style.top=(e.clientY-b.top)+"px"; tip.style.opacity=1; canvas.style.cursor="pointer";
  });
});
canvas.addEventListener("pointerleave",()=>{tip.style.opacity=0;setHover(null);});

// ---------- zaznaczenie: świecąca nakładka (bez przeliczania kolorów co klatkę) ----------
const selGroup=new THREE.Group(); root.add(selGroup);
function updateSelOverlay(){
  while(selGroup.children.length){const c=selGroup.children.pop(); c.material.dispose(); c.geometry.dispose();}
  const id=state.region; if(!id) return;
  const mk=()=>new THREE.MeshBasicMaterial({color:new THREE.Color(1,0.86,0.3),transparent:true,opacity:0.45,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3,side:THREE.DoubleSide,clippingPlanes:[clipPlane]});
  const add=(geo,hem)=>{const m=new THREE.Mesh(geo,mk()); m.renderOrder=3; m.userData.hem=hem; selGroup.add(m);};
  const ps=new Set(REGION_PARCELS[id]||[]);
  if(ps.size) for(const h of ["lh","rh"]){
    const m=cortex[h], lab=m.userData.lab, idx=m.geometry.index.array, sub=[];
    for(let i=0;i<idx.length;i+=3) if(ps.has(DK[lab[idx[i]]])) sub.push(idx[i],idx[i+1],idx[i+2]);
    if(sub.length){const g=new THREE.BufferGeometry(); g.setAttribute("position",m.geometry.attributes.position); g.setIndex(sub); add(g,h);}
  }
  SCTX.forEach((n,k)=>{ if(SCTX_REGION[n]===id) for(const h of ["lh","rh"]){const g=sctxSub[h][k].clone(); add(g,h);} });
  const si=STEM.indexOf(id); if(si>=0) add(stemSub[si].clone(),"mid");
  if(id==="cerebellum") add(cereb.geometry.clone(),"mid");
}
function tickOverlay(t){
  const vis=state.right, o=REDUCED?0.45:0.28+0.27*(0.5+0.5*Math.sin(t*3.2));
  for(const c of selGroup.children){c.visible=c.userData.hem!=="rh"||vis; c.material.opacity=o;}
  if(state.region&&!flatMode) for(const mk of markerMeshes) if(mk.userData.id===state.region) mk.scale.setScalar(1.45*(REDUCED?1.1:1+0.16*(0.5+0.5*Math.sin(t*3.2))));
}

// ---------- panel ----------
const dirArrow=t=>/↑/.test(t||"")?"↑":/↓/.test(t||"")?"↓":"•";
const shortName=n=>String(n).replace(/ \(.*\)/,"");
const bar=(lab,v,mx)=>`<div class="bar"><span class="bl">${esc(lab)}</span><span class="bt"><span class="bz"></span><span class="bf ${v<0?"neg":"pos"}" style="${v<0?`right:50%;width:${Math.abs(v)/mx*50}%`:`left:50%;width:${v/mx*50}%`}"></span></span><span class="bv">${fmt(v)}</span></div>`;
function disordersFor(id){return DISORDERS.filter(d=>d.regions.some(r=>r[0]===id)).map(d=>({d,role:d.regions.find(r=>r[0]===id)}));}
function pathwaysFor(id){
  const out=[]; for(const pw of PATHWAYS){
    const roles=[]; pw.routes.forEach(r=>{ if(regionOfKey(r.from)===id) roles.push("źródło"); if(regionOfKey(r.to)===id) roles.push("cel"); });
    if(roles.length) out.push({pw,roles:[...new Set(roles)]});
  } return out;
}
// wpis zaburzenia dla obszaru; gdy go nie ma, szuka obszaru nadrzędnego (np. płata) albo podrzędnego
function roleFor(d,rid){
  let e=d.regions.find(r=>r[0]===rid); if(e) return {e,rel:"exact"};
  const ps=REGION_PARCELS[rid]||[]; if(!ps.length) return null;
  e=d.regions.find(r=>{const q=REGION_PARCELS[r[0]]||[]; return q.length>ps.length&&ps.every(p=>q.includes(p));}); if(e) return {e,rel:"parent"};
  e=d.regions.find(r=>{const q=REGION_PARCELS[r[0]]||[]; return q.length&&q.length<ps.length&&q.every(p=>ps.includes(p));}); if(e) return {e,rel:"child"};
  return null;
}
function contextCard(rid){
  if(state.disorder){
    const d=DISORDERS.find(x=>x.id===state.disorder), r=roleFor(d,rid);
    let h=`<div class="ctx"><div class="ctxhead"><span class="src">W kontekście zaburzenia</span><b>${esc(shortName(d.name))}</b><button class="chip" id="backctx">Wróć do opisu zaburzenia</button></div>`;
    if(r){
      const [id,dir,note]=r.e, mean=MEANING[d.id+":"+id];
      const rel=r.rel==="parent"?` (jako część obszaru: ${esc(shortName(REGIONS[id].name))})`:r.rel==="child"?` (w tym obszarze: ${esc(shortName(REGIONS[id].name))})`:"";
      h+=`<p class="ctxrole"><span class="tag ${dirClass(dir)}">${esc(dir||"udział")}</span>${rel}</p>`;
      if(note) h+=`<p class="ctxnote">${esc(note)}</p>`;
      if(mean) h+=`<p class="ctxmean"><b>Co to znaczy:</b> ${esc(mean)}</p>`;
    } else h+=`<p class="ctxnote">Ten obszar nie jest wymieniony w badaniach nad tym zaburzeniem, dlatego na modelu jest biały.</p>`;
    return h+`</div>`;
  }
  if(state.network){
    const n=NETWORKS.find(x=>x.name===state.network);
    return `<div class="ctx"><div class="ctxhead"><span class="src">W kontekście sieci</span><b>${esc(n.name)}</b><button class="chip" id="backctx">Wróć do opisu sieci</button></div><p class="ctxnote">${n.regions.includes(rid)?"Ten obszar jest węzłem tej sieci.":"Ten obszar nie należy do tej sieci."}</p></div>`;
  }
  return "";
}
function focusRegion(id){
  if(DEEP.has(id)&&!REGION_PARCELS[id]&&!state.disorder) state.glass=true;
  if(sectionActive()||flatMode) return;
  if(MEDIAL.has(id)){ if(state.view!=="medial") setView("medial"); }
  else if(state.view==="medial"||state.view==="right") setView("left");
}
// w trybie 2D przekrój przechodzi przez wybrany obszar
function focusSlice(id){
  if(!flatMode) return; const a=anchorOf(id); if(!a) return;
  const ax=state.section.axis||"x"; let v=a[ax];
  if(ax==="x"){ if(REGION_PARCELS[id]&&!MEDIAL.has(id)) v*=0.8; if(Math.abs(v)<4) v=-4; }
  const mn=bbox.min[ax]-4, mx=bbox.max[ax]+4;
  setSection(ax,{frac:Math.max(0,Math.min(1,(v-mn)/(mx-mn))),keepCamera:true});
}
function clearRegion(){ if(!state.region) return; state.region=null; state.regionAnchor=null; updateSelOverlay(); recolor(); labelsForState(); renderCurrentPanel(); }
function selectRegion(id,pickInfo,opts){
  opts=opts||{};
  state.region=id; state.regionAnchor=pickInfo&&pickInfo.inside?pickInfo.point:null;
  state.lastPick=pickInfo||null;
  if(!opts.noFocus){ if(!pickInfo||!pickInfo.inside) focusRegion(id); if(flatMode&&!(pickInfo&&pickInfo.fromFlat)) focusSlice(id); }
  updateSelOverlay(); recolor(); labelsForState(); legend();
  const r=REGIONS[id]; const ds=disordersFor(id).filter(x=>x.d.id!==state.disorder); const nets=NETWORKS.filter(n=>n.regions.includes(id)&&n.name!==state.network); const pws=pathwaysFor(id);
  let h="";
  h+=`<h2>${esc(r.name)}</h2><p class="latin">${esc(r.latin)}</p><div class="meta"><span class="pill">${esc(r.group)}</span>${MARKERS.some(m=>m[0]===id)?'<span class="pill">punkt orientacyjny, za mały na model 3D</span>':""}</div>`;
  if(pickInfo&&(pickInfo.parcel||pickInfo.sctx||pickInfo.inside)&&pickInfo.label&&pickInfo.label!==r.name) h+=`<p class="kicker">Kliknięty fragment atlasu: ${esc(pickInfo.label)}${pickInfo.h&&pickInfo.h!=="mid"?(pickInfo.h==="lh"?" · lewa półkula":" · prawa półkula"):""}</p>`;
  h+=contextCard(id);
  const en=enigmaData();
  if(en&&pickInfo&&(pickInfo.parcel||pickInfo.sctx)&&pickInfo.h){
    const d=pickInfo.parcel?en.cort[(pickInfo.h==="lh"?"L_":"R_")+pickInfo.parcel]:en.sub[(pickInfo.h==="lh"?"L":"R")+SCTX_KEY[pickInfo.sctx]];
    if(d!==undefined) h+=`<p class="enote">${esc(DISORDERS.find(x=>x.id===state.disorder).name)}: d = <b>${fmt(d)}</b> w tym miejscu (${esc(en.metric)}).</p>`;
  }
  h+=`<h3>Za co odpowiada</h3><ul>${r.functions.map(f=>`<li>${esc(f)}</li>`).join("")}</ul>`;
  if(r.lesion&&r.lesion!=="—") h+=`<h3>Po uszkodzeniu</h3><p style="margin:0">${esc(r.lesion)}</p>`;
  if(r.chem&&r.chem!=="—") h+=`<h3>Komórki i chemia</h3><p style="margin:0">${esc(r.chem)}</p>`;
  if(pws.length) h+=`<h3>Neuroprzekaźniki w tym obszarze</h3><div class="linklist">`+pws.map(({pw,roles})=>`<button class="chip" style="--c:${pw.color}" data-pw-open="${pw.id}"><span class="dot"></span>${esc(pw.name)} · ${roles.join(", ")}</button>`).join("")+`</div>`;
  if(ds.length) h+=`<h3>${state.disorder?"Inne zaburzenia, w których ten obszar się pojawia":"Związane zaburzenia"} (${ds.length})</h3><div class="rows">`+ds.map(({d,role})=>`<button class="row" data-dis="${d.id}"><span class="tag ${dirClass(role[1])}">${esc(role[1]||"udział")}</span><b>${esc(shortName(d.name))}</b>${role[2]?`<small>${esc(role[2])}</small>`:""}${MEANING[d.id+":"+role[0]]?`<span class="mean">${esc(MEANING[d.id+":"+role[0]])}</span>`:""}</button>`).join("")+`</div>`;
  if(nets.length) h+=`<h3>Należy do sieci</h3><div class="linklist">`+nets.map(n=>`<button class="chip" style="--c:${n.color}" data-net="${esc(n.name)}"><span class="dot"></span>${esc(n.name)}</button>`).join("")+`</div>`;
  h+=`<p class="src" style="margin-top:14px"><button class="tbtn" id="deselect">Odznacz obszar</button></p>`;
  panel.innerHTML=h; panel.scrollTop=0; wirePanel();
}
function enigmaBlock(en){
  const cort=Object.entries(en.cort).filter(([k])=>k.startsWith("L_")).map(([k,v])=>{const n=k.slice(2);return [n,(v+(en.cort["R_"+n]??v))/2];}).sort((a,b)=>Math.abs(b[1])-Math.abs(a[1])).slice(0,6);
  const sub=SCTX.filter(n=>en.sub["L"+SCTX_KEY[n]]!==undefined).map(n=>[n,(en.sub["L"+SCTX_KEY[n]]+(en.sub["R"+SCTX_KEY[n]]??en.sub["L"+SCTX_KEY[n]]))/2]);
  const mx=Math.max(0.3,...sub.map(s=>Math.abs(s[1])),...cort.map(c=>Math.abs(c[1])));
  return `<details class="more"><summary>Dane liczbowe ENIGMA (${esc(en.metric)})</summary><p class="src" style="margin:6px 0">Cohen's d dla 68 obszarów kory i 7 struktur podkorowych (pacjenci vs grupa kontrolna): niebieski = mniej, czerwony = więcej, biały = praktycznie bez różnicy. Najsilniejsze efekty w korze (średnia obu półkul):</p>`+
    cort.map(([n,v])=>bar(PARCEL[n][0].replace(/ \(.*\)/,""),v,mx)).join("")+
    `<p class="src" style="margin:10px 0 6px">Objętość struktur podkorowych:</p>`+sub.map(([n,v])=>bar(SCTX_PL[n],v,mx)).join("")+
    `<p class="src" style="margin-top:6px">Źródło liczb: ${esc(en.ref)}, przez ENIGMA Toolbox (Larivière i in., 2021).</p></details>`;
}
function selectDisorder(id,opts){
  opts=opts||{};
  state.disorder=id; state.network=null; buildNetwork(null);
  if(!opts.keepPathways){state.pathways.clear(); state.solo=null;}
  if(!opts.keepRegion){state.region=null; state.regionAnchor=null; updateSelOverlay();}
  const d=DISORDERS.find(x=>x.id===id), en=ENIGMA[id];
  const deep=d.regions.filter(r=>DEEP.has(r[0])&&!REGION_PARCELS[r[0]]).length;
  state.glass=!(en&&state.enigma)&&deep>0;
  if(flatMode){ const first=d.regions.find(r=>DEEP.has(r[0])&&anchorOf(r[0]))||d.regions.find(r=>anchorOf(r[0])); if(first) focusSlice(first[0]); }
  recolor(); legend(); labelsForState();
  renderDisorderPanel(id);
}
function renderDisorderPanel(id,keepScroll){
  const d=DISORDERS.find(x=>x.id===id), en=ENIGMA[id], sc=panel.scrollTop;
  let h=`<h2>${esc(d.name)}</h2><p class="latin">ICD-11: ${esc(d.icd)}</p><div class="meta"><span class="pill">${esc(d.cat)}</span><span class="pill ev-${d.evidence}">dowody: ${esc(d.evidence)}</span>${en?'<span class="pill">dane ENIGMA</span>':""}</div>`;
  h+=`<p style="margin:0">${esc(d.summary)}</p>`;
  h+=`<div class="howto"><b>Jak czytać model.</b> <span class="sw up"></span>więcej lub nadaktywność, <span class="sw down"></span>mniej lub niedoczynność, <span class="sw oth"></span>udział w zaburzeniu, a <span class="sw none"></span>biały to obszar bez opisanego efektu. Dotknij obszaru poniżej, a podświetli się na modelu.</div>`;
  if(en) h+=`<p class="src" style="margin:8px 0 0">${state.enigma?"Kora i struktury są pokolorowane liczbowo według dużych badań (ENIGMA).":"Pokazuję obszary opisane w literaturze (bez mapy liczbowej)."} <button class="tbtn" id="showfunc">${state.enigma?"Pokaż obszary z literatury":"Pokaż mapę ENIGMA"}</button></p>`;
  h+=`<h3>Obszary i co z tego wynika</h3><div class="rows">`+d.regions.map(([rid,dir,note])=>{
    const mean=MEANING[d.id+":"+rid]; const k=dirClass(dir||"");
    return `<button class="row ${state.region===rid?"on":""}" data-reg="${rid}" style="--c:${k==="up"?"var(--up)":k==="down"?"var(--down)":"var(--accent)"}"><span class="tag ${k}">${esc(dir||"udział")}</span><b>${esc(shortName(REGIONS[rid].name))}</b>${note?`<small>${esc(note)}</small>`:""}${mean?`<span class="mean">${esc(mean)}</span>`:""}</button>`;}).join("")+`</div>`;
  const pws=PATHWAYS.filter(p=>p.disorders.includes(id));
  if(pws.length){
    h+=`<h3>Szlaki neuroprzekaźników związane z tym zaburzeniem</h3>`+pws.map(p=>{const on=state.pathways.has(p.id);
      return `<div class="ntcard" style="--c:${p.color}"><div class="nthead"><h3>${esc(p.name)}</h3><button class="chip" data-pwtoggle="${p.id}" aria-pressed="${on}">${on?"Ukryj na mózgu":"Pokaż na mózgu"}</button></div><p>${esc(PW_NOTES[id+":"+p.id]||p.role)}</p></div>`;}).join("");
  }
  if(d.chem) h+=`<h3>Neurochemia</h3><p style="margin:0">${esc(d.chem)}</p>`;
  if(en) h+=enigmaBlock(en);
  if(d.src.length) h+=`<h3>Źródła</h3><ul class="src">`+d.src.map(k=>`<li><a href="${SOURCES[k][1]}" target="_blank" rel="noopener">${esc(SOURCES[k][0])}</a></li>`).join("")+`</ul>`;
  else h+=`<p class="src">Brak dużych meta-analiz strukturalnych; opis na podstawie przeglądów narracyjnych.</p>`;
  h+=`<p class="src" style="margin-top:12px"><button class="tbtn" id="clearhl">Wyczyść zaznaczenie</button></p>`;
  panel.innerHTML=h; panel.scrollTop=keepScroll?sc:0; wirePanel();
  document.querySelectorAll(".dcard").forEach(c=>c.classList.toggle("active",c.dataset.dis===id));
}
function selectNetwork(name,opts){
  opts=opts||{};
  state.network=name; state.disorder=null; state.pathways.clear(); state.solo=null;
  if(!opts.keepRegion){state.region=null; state.regionAnchor=null; updateSelOverlay();}
  const n=NETWORKS.find(x=>x.name===name);
  state.glass=n.regions.some(r=>DEEP.has(r)&&!REGION_PARCELS[r]);
  if(flatMode){ const first=n.regions.find(r=>DEEP.has(r)&&anchorOf(r))||n.regions.find(r=>anchorOf(r)); if(first) focusSlice(first); }
  buildNetwork(n); recolor(); legend(); labelsForState();
  renderNetworkPanel(name);
}
function renderNetworkPanel(name){
  const n=NETWORKS.find(x=>x.name===name);
  let h=`<h2>${esc(n.name)}</h2><p class="latin">Sieć / obwód</p><p style="margin:0">${esc(n.text)}</p><h3>Węzły (dotknij, żeby zobaczyć szczegóły)</h3><div class="linklist">`+n.regions.map(r=>`<button class="chip" style="--c:${n.color}" data-reg="${r}"><span class="dot"></span>${esc(shortName(REGIONS[r].name))}</button>`).join("")+`</div>`;
  const dis=DISORDERS.filter(d=>d.regions.filter(r=>n.regions.includes(r[0])).length>=2);
  if(dis.length) h+=`<h3>Zaburzenia, w których te węzły się powtarzają</h3><div class="linklist">`+dis.map(d=>`<button class="chip" data-dis="${d.id}">${esc(shortName(d.name))}</button>`).join("")+`</div>`;
  if(n.src&&n.src.length) h+=`<h3>Źródła</h3><ul class="src">`+n.src.map(k=>`<li><a href="${SOURCES[k][1]}" target="_blank" rel="noopener">${esc(SOURCES[k][0])}</a></li>`).join("")+`</ul>`;
  h+=`<p class="src" style="margin-top:12px"><button class="tbtn" id="clearhl">Wyczyść zaznaczenie</button></p>`;
  panel.innerHTML=h; panel.scrollTop=0; wirePanel(); document.querySelectorAll(".dcard").forEach(c=>c.classList.remove("active"));
}
function showPathway(id,opts){
  opts=opts||{};
  const ctx=opts.keepContext&&(state.disorder||state.network);
  state.pathways.add(id); state.solo=opts.route||null;
  if(!ctx){ state.disorder=null; state.network=null; buildNetwork(null); state.glass=true; state.enigma=false; }
  recolor(); legend(); labelsForState();
  if(ctx) renderCurrentPanel(true); else renderPathwayPanel();
}
function togglePathway(id,opts){
  const ctx=state.disorder||state.network;
  if(state.pathways.has(id)){
    state.pathways.delete(id); state.solo=null; recolor(); legend(); labelsForState();
    if(state.pathways.size&&!ctx) renderPathwayPanel(); else renderCurrentPanel(true);
    return;
  }
  showPathway(id,{force:true,keepContext:!!ctx});
}
function renderPathwayPanel(){
  const ids=[...state.pathways]; if(!ids.length){renderCurrentPanel();return;}
  let h=`<h2>${ids.length>1?"Szlaki neuroprzekaźników":esc(PW[ids[0]].name)}</h2><p class="latin">${ids.length>1?ids.map(i=>PW[i].name).join(" · "):"Neuroprzekaźnik: skąd i dokąd"}</p>`;
  for(const id of ids){
    const p=PW[id];
    h+=`<div class="ntcard" style="--c:${p.color}"><h3>${esc(p.name)} · źródło: ${esc(p.sourceText)}</h3><p>${esc(p.role)}</p><p class="src" style="margin-top:6px">${esc(p.receptors)}</p></div>`;
    h+=`<div class="rows">`+p.routes.map((r,ri)=>`<button class="row ${state.solo&&state.solo.pw===id&&state.solo.ri===ri?"on":""}" style="--c:${p.color}" data-route="${id}:${ri}"><span class="tag pw">${esc(r.name.replace(/^Szlak /,""))}</span><b>${esc(r.label)}</b><small>${esc(r.effect)}</small></button>`).join("")+`</div>`;
    const drugs=DRUGS.filter(d=>d.nt.includes(id)), dis=p.disorders.map(x=>DISORDERS.find(d=>d.id===x)).filter(Boolean);
    if(dis.length) h+=`<h3>Zaburzenia</h3><div class="linklist">`+dis.map(d=>`<button class="chip" data-dis="${d.id}">${esc(shortName(d.name))}</button>`).join("")+`</div>`;
    if(drugs.length) h+=`<h3>Leki i związki</h3><div class="linklist">`+drugs.map(d=>`<button class="chip" data-drug="${d.id}">${esc(d.name)}</button>`).join("")+`</div>`;
  }
  h+=`<p class="src" style="margin-top:14px">Dotknij wiersza, żeby wyróżnić jeden szlak (ponownie, żeby wrócić do wszystkich). Dotknięcie rurki na modelu robi to samo.</p>`;
  h+=`<p class="src"><button class="tbtn" id="clearhl">Wyłącz szlaki</button></p>`;
  panel.innerHTML=h; panel.scrollTop=0; wirePanel();
}
function showDrug(id){
  const d=DRUGS.find(x=>x.id===id);
  state.pathways.clear(); d.nt.forEach(n=>state.pathways.add(n)); state.solo=null; state.disorder=null; state.network=null; buildNetwork(null); state.glass=d.nt.length>0; state.enigma=false;
  recolor(); legend(); labelsForState();
  let h=`<h2>${esc(d.name)}</h2><p class="latin">${esc(d.group)} · ${esc(d.examples)}</p>`;
  h+=`<h3>Jak działa</h3><p style="margin:0">${esc(d.action)}</p><h3>Do czego</h3><p style="margin:0">${esc(d.use)}</p><h3>Warto wiedzieć</h3><p style="margin:0">${esc(d.note)}</p>`;
  if(d.nt.length) h+=`<h3>Szlaki, na które działa</h3><div class="linklist">`+d.nt.map(n=>`<button class="chip" style="--c:${PW[n].color}" data-pw-open="${n}"><span class="dot"></span>${esc(PW[n].name)}</button>`).join("")+`</div>`;
  else h+=`<p class="src" style="margin-top:10px">Ten lek nie ma jednego szlaku do pokazania na modelu.</p>`;
  h+=`<p class="src" style="margin-top:14px"><button class="tbtn" data-syn="${d.mode}" data-syn-go="1">Pokaż na synapsie</button> <button class="tbtn" id="clearhl">Wyczyść</button></p>`;
  panel.innerHTML=h; panel.scrollTop=0; wirePanel();
}
function intro(){
  panel.innerHTML=`<h2>Zacznij od dotknięcia</h2><p class="latin">Atlas mózgu i zaburzeń</p>
  <p style="margin:0">Dotknij obszaru na modelu, żeby zobaczyć jego funkcje, skutki uszkodzenia, powiązane zaburzenia i przekaźniki. Albo wybierz zaburzenie z zakładki „Zaburzenia” pod modelem: atlas pokaże, które obszary się zmieniają i co to znaczy dla funkcjonowania. Poniżej kilka gotowych punktów startowych.</p>
  <h3>Gotowe widoki</h3><div class="rows">
   <button class="row" data-quick="mdd"><span class="tag up">mapa</span><b>Depresja</b><small>Prawdziwe wielkości efektów ENIGMA na korze</small></button>
   <button class="row" data-quick="da" style="--c:var(--da)"><span class="tag pw">szlak</span><b>Dopamina: skąd dokąd</b><small>Cztery szlaki: nagroda, kora, ruch, prolaktyna</small></button>
   <button class="row" data-quick="net-dmn"><span class="tag other">sieć</span><b>Sieć domyślna (DMN)</b><small>Węzły zaświecą się i połączą liniami</small></button>
   <button class="row" data-quick="sec-hippo"><span class="tag other">przekrój</span><b>Przekrój przez hipokamp i ciało migdałowate</b><small>Kolorowe wnętrze mózgu w płaszczyźnie strzałkowej</small></button>
   <button class="row" data-quick="drug-ssri"><span class="tag other">lek</span><b>SSRI</b><small>Serotonina: gdzie działa i co dzieje się w synapsie</small></button>
  </div>`;
  wirePanel();
}
function renderCurrentPanel(keepScroll){
  if(state.region) selectRegion(state.region,state.lastPick||undefined,{noFocus:true});
  else if(state.disorder) renderDisorderPanel(state.disorder,keepScroll);
  else if(state.network) renderNetworkPanel(state.network);
  else if(state.pathways.size) renderPathwayPanel();
  else intro();
}
function clearAll(){
  state.disorder=null; state.network=null; state.pathways.clear(); state.solo=null; state.enigma=true; state.region=null; state.regionAnchor=null; state.glass=false;
  buildNetwork(null); updateSelOverlay(); document.querySelectorAll(".dcard").forEach(x=>x.classList.remove("active"));
  recolor(); legend(); labelsForState(); intro();
}
function quick(k){
  if(k==="mdd"){state.enigma=true;setView("left");selectDisorder("mdd");}
  else if(k==="da"){setView("left");showPathway("da",{force:true});}
  else if(k==="net-dmn"){setView("medial");selectNetwork("Sieć domyślna (DMN)");}
  else if(k==="sec-hippo"){state.pathways.clear();state.disorder=null;state.network=null;buildNetwork(null);state.region=null;updateSelOverlay();state.glass=false;setSectionMNI("x",-26);labelsForState();legend();renderCurrentPanel();}
  else if(k==="drug-ssri"){setView("left");showDrug("ssri");}
}
const selbar=$("#selbar");
function updSelbar(){
  const h2=panel.querySelector("h2");
  const active=state.region||state.disorder||state.network||state.pathways.size;
  if(!active||!h2){selbar.hidden=true;return;}
  let sum="", c="var(--sel)";
  if(state.region){const r=REGIONS[state.region]; sum=(r.functions&&r.functions[0])||"";}
  else {const p=panel.querySelector("p:not(.latin):not(.kicker):not(.src)"); sum=p?p.textContent:"";}
  if(!state.region&&state.network){const n=NETWORKS.find(x=>x.name===state.network); if(n) c=n.color;}
  else if(!state.region&&!state.disorder&&state.pathways.size===1) c=PW[[...state.pathways][0]].color;
  selbar.style.setProperty("--c",c);
  $("#selbar-name").textContent=h2.textContent;
  $("#selbar-sum").textContent=sum.trim();
  selbar.hidden=false;
}
$("#selbar-more").onclick=()=>panel.scrollIntoView({block:"start",behavior:REDUCED?"auto":"smooth"});
$("#selbar-x").onclick=()=>clearAll();
function wirePanel(){
  updSelbar();
  panel.querySelectorAll("[data-dis]").forEach(b=>b.onclick=()=>{state.enigma=true;selectDisorder(b.dataset.dis);});
  panel.querySelectorAll("[data-reg]").forEach(b=>b.onclick=()=>selectRegion(b.dataset.reg));
  panel.querySelectorAll("[data-net]").forEach(b=>b.onclick=()=>selectNetwork(b.dataset.net,{keepRegion:true}));
  panel.querySelectorAll("[data-pw-open]").forEach(b=>b.onclick=()=>showPathway(b.dataset.pwOpen,{force:true,keepContext:true}));
  panel.querySelectorAll("[data-pwtoggle]").forEach(b=>b.onclick=()=>togglePathway(b.dataset.pwtoggle));
  panel.querySelectorAll("[data-drug]").forEach(b=>b.onclick=()=>showDrug(b.dataset.drug));
  panel.querySelectorAll("[data-quick]").forEach(b=>b.onclick=()=>quick(b.dataset.quick));
  panel.querySelectorAll("[data-route]").forEach(b=>b.onclick=()=>{const [id,ri]=b.dataset.route.split(":");const same=state.solo&&state.solo.pw===id&&state.solo.ri===+ri;state.solo=same?null:{pw:id,ri:+ri};recolor();renderPathwayPanel();});
  panel.querySelectorAll("[data-syn-go]").forEach(b=>b.onclick=()=>{window.ATLAS&&window.ATLAS.goSynapse&&window.ATLAS.goSynapse(b.dataset.syn);});
  const c=panel.querySelector("#clearhl"); if(c) c.onclick=()=>clearAll();
  const d=panel.querySelector("#deselect"); if(d) d.onclick=()=>clearRegion();
  const bk=panel.querySelector("#backctx"); if(bk) bk.onclick=()=>{state.region=null;state.regionAnchor=null;updateSelOverlay();recolor();labelsForState();renderCurrentPanel();};
  const f=panel.querySelector("#showfunc"); if(f) f.onclick=()=>{state.enigma=!state.enigma;recolor();legend();renderDisorderPanel(state.disorder,true);};
}

// ---------- przyciski ----------
$("#views").innerHTML=Object.entries(VIEWS).map(([k,v])=>`<button data-view="${k}" aria-pressed="false">${v[1]}</button>`).join("");
document.querySelectorAll("[data-view]").forEach(b=>b.onclick=()=>setView(b.dataset.view));
$("#t-glass").onclick=()=>{state.glass=!state.glass;recolor();};
$("#t-right").onclick=()=>{state.right=!state.right;updateClip();recolor();};
$("#t-enigma").onclick=()=>{state.enigma=!state.enigma;recolor();legend();if(state.disorder)renderDisorderPanel(state.disorder,true);};
$("#pw-btns").innerHTML=PATHWAYS.map(p=>`<button class="tbtn" data-pw="${p.id}" aria-pressed="false" style="color:${p.color}"><span class="dot" style="background:${p.color}"></span><span style="color:var(--ink)">${p.name}</span></button>`).join("");
document.querySelectorAll("[data-pw]").forEach(b=>b.onclick=()=>togglePathway(b.dataset.pw));

// ---------- zakładki z treścią ----------
(function(){
  const cats=[...new Set(DISORDERS.map(d=>d.cat))];
  $("#tab-dis").innerHTML=`<p class="lead">${DISORDERS.length} zaburzeń według kategorii ICD-11. Przy ${Object.keys(ENIGMA).length} z nich mózg pokazuje prawdziwe wielkości efektów z konsorcjum ENIGMA dla każdego obszaru; przy pozostałych podświetla obszary opisane w przeglądach badań (czerwony: więcej, niebieski: mniej, fiolet: udział).</p>`+cats.map(c=>`<div class="group"><h4>${esc(c)}</h4><div class="grid">`+DISORDERS.filter(d=>d.cat===c).map(d=>`<button class="dcard" data-dis="${d.id}"><span class="t">${esc(d.name)}</span><span class="m">ICD-11 ${esc(d.icd)} · dowody: ${esc(d.evidence)}${ENIGMA[d.id]?" · mapa ENIGMA":""}</span></button>`).join("")+`</div></div>`).join("");
  document.querySelectorAll("#tab-dis .dcard").forEach(b=>b.onclick=()=>{state.enigma=true;selectDisorder(b.dataset.dis);document.querySelector(".atlas").scrollIntoView({block:"start",behavior:"smooth"});});
})();
function renderRegions(q){
  q=(q||"").toLowerCase();
  const match=id=>{const r=REGIONS[id];return !q||[r.name,r.latin,r.group,...r.functions,r.lesion,r.chem].join(" ").toLowerCase().includes(q);};
  const groups={};
  Object.keys(REGIONS).filter(match).forEach(id=>{(groups[REGIONS[id].group]=groups[REGIONS[id].group]||[]).push(id);});
  $("#reglist").innerHTML=Object.keys(groups).length?Object.entries(groups).map(([g,list])=>`<div class="group"><h4>${esc(g)}</h4><div class="grid">`+list.map(id=>`<button class="dcard" data-reg="${id}"><span class="t">${esc(REGIONS[id].name)}</span><span class="m">${esc(REGIONS[id].functions[0])}</span></button>`).join("")+`</div></div>`).join(""):`<p class="lead">Nic nie pasuje do „${esc(q)}”. Spróbuj innego słowa, np. „pamięć” albo „dopamina”.</p>`;
  $("#reglist").querySelectorAll("[data-reg]").forEach(b=>b.onclick=()=>{selectRegion(b.dataset.reg);document.querySelector(".atlas").scrollIntoView({block:"start",behavior:"smooth"});});
}
renderRegions(); $("#regsearch").addEventListener("input",e=>renderRegions(e.target.value));
$("#netlist").innerHTML=NETWORKS.map(n=>`<div class="netcard" style="--c:${n.color}"><h4>${esc(n.name)}</h4><p>${esc(n.text)}</p><button class="tbtn" data-net="${esc(n.name)}">Pokaż na mózgu</button></div>`).join("");
$("#netlist").querySelectorAll("[data-net]").forEach(b=>b.onclick=()=>{selectNetwork(b.dataset.net);document.querySelector(".atlas").scrollIntoView({block:"start",behavior:"smooth"});});
$("#celllist").innerHTML=CELLS.map(c=>`<div class="cellcard"><span class="kind">${c.type}</span><h5>${esc(c.name)}</h5><div class="w">${esc(c.where)}</div><p>${esc(c.what)}</p></div>`).join("");

// interfejs dla extras.js (tabele, leki, synapsa)
window.ATLAS={
  showPathway:id=>{showPathway(id,{force:true});document.querySelector(".atlas").scrollIntoView({block:"start",behavior:"smooth"});},
  showDrug:id=>{showDrug(id);document.querySelector(".atlas").scrollIntoView({block:"start",behavior:"smooth"});},
  _state:state,
  _stats:()=>({recolor:recolorCount})
};
window.__afterApp && window.__afterApp();

// ---------- widok 2D: prawdziwy przekrój wyliczany z siatek modelu ----------
// Ta sama płaszczyzna co przekrój 3D (strzałkowa, czołowa, pozioma); kontur kory,
// struktury podkorowe, móżdżek i pień to dokładne przecięcia siatek, więc anatomia się zgadza.
const flatEl=document.getElementById("flat");
const FW=480, FH=340, FM=18;
const rgb=c=>`rgb(${Math.round(c[0]*255)},${Math.round(c[1]*255)},${Math.round(c[2]*255)})`;
const axIdx=a=>a==="x"?0:a==="y"?1:2;
function sliceGeo(geo,ax,pos,labs){
  const P=geo.attributes.position.array, I=geo.index.array, n=P.length/3, o=axIdx(ax), d=new Float32Array(n);
  for(let i=0;i<n;i++){const v=P[i*3+o]-pos; d[i]=v===0?1e-6:v;}
  const segs=[];
  const edge=(u,v,du,dv)=>{const k=u<v?u*100000+v:v*100000+u, t=du/(du-dv);
    return [k,P[u*3]+(P[v*3]-P[u*3])*t,P[u*3+1]+(P[v*3+1]-P[u*3+1])*t,P[u*3+2]+(P[v*3+2]-P[u*3+2])*t];};
  for(let t=0;t<I.length;t+=3){
    const a=I[t],b=I[t+1],c=I[t+2], da=d[a],db=d[b],dc=d[c], sa=da>0,sb=db>0,sc=dc>0;
    if(sa===sb&&sb===sc) continue;
    const pts=[]; if(sa!==sb) pts.push(edge(a,b,da,db)); if(sb!==sc) pts.push(edge(b,c,db,dc)); if(sc!==sa) pts.push(edge(c,a,dc,da));
    segs.push([pts[0],pts[1],labs?labs[a]:0]);
  }
  return segs;
}
function chainLoops(segs){
  const by=new Map(); segs.forEach((s,i)=>{for(const p of [s[0],s[1]]){const l=by.get(p[0]); if(l) l.push(i); else by.set(p[0],[i]);}});
  const used=new Uint8Array(segs.length), loops=[];
  for(let i=0;i<segs.length;i++){
    if(used[i]) continue; used[i]=1; const loop=[segs[i][0],segs[i][1]]; let end=segs[i][1][0];
    for(;;){
      const cand=by.get(end), j=cand&&cand.find(x=>!used[x]); if(j===undefined) break;
      used[j]=1; const s=segs[j]; const nxt=s[0][0]===end?s[1]:s[0]; loop.push(nxt); end=nxt[0];
    }
    if(loop.length>2) loops.push(loop);
  }
  return loops;
}
let flatFrame=null;
function scheduleFlat(){ if(flatFrame||!flatMode) return; flatFrame=requestAnimationFrame(()=>{flatFrame=null;renderFlat();}); }
function renderFlat(){
  if(!flatEl||!lastTables) return;
  const ax=state.section.axis||"x", o=axIdx(ax), pos=secPos(), T=lastTables;
  // rzut: oś x -> (z, -y) (przód po lewej); oś z -> (x, -y); oś y -> (x, z) (przód u góry)
  const proj=(x,y,z)=>ax==="x"?[z,-y]:ax==="z"?[x,-y]:[x,z];
  const corners=[]; for(const X of [bbox.min.x,bbox.max.x])for(const Y of [bbox.min.y,bbox.max.y])for(const Z of [bbox.min.z,bbox.max.z]) corners.push(proj(X,Y,Z));
  const mnX=Math.min(...corners.map(c=>c[0])),mxX=Math.max(...corners.map(c=>c[0])),mnY=Math.min(...corners.map(c=>c[1])),mxY=Math.max(...corners.map(c=>c[1]));
  const sc=Math.min((FW-2*FM)/(mxX-mnX),(FH-2*FM-14)/(mxY-mnY)), ox=(FW-(mxX-mnX)*sc)/2, oy=(FH-14-(mxY-mnY)*sc)/2+2;
  const T2=(x,y,z)=>{const p=proj(x,y,z); return [ox+(p[0]-mnX)*sc, oy+(p[1]-mnY)*sc];};
  const f1=v=>v.toFixed(1);
  const loopPath=loops=>loops.map(l=>"M"+l.map(p=>{const q=T2(p[1],p[2],p[3]);return f1(q[0])+","+f1(q[1]);}).join("L")+"Z").join("");
  // nazwa w tooltipie i opisie = nazwa obszaru (taka sama jak w panelu); fragment atlasu osobno
  const meta=(region,pl,extra)=>{const nm=REGIONS[region]?REGIONS[region].name:region; return `data-r="${region}" data-label="${esc(nm)}" data-pl="${esc(pl||nm)}"${extra||""} tabindex="0" role="button" aria-label="${esc(nm)}"`;};
  let h="", labels="";
  const present=new Set(), ctr={}, ctrP={};
  const addC=(map,key,x,y,w)=>{const c=map[key]||(map[key]=[0,0,0]); c[0]+=x*w;c[1]+=y*w;c[2]+=w;};
  const sel=r=>state.region===r?" sel":"";
  const bigLoop=loops=>loops.reduce((b,l)=>l.length>b.length?l:b,[]);
  const loopInfo=loops=>{const l=bigLoop(loops); if(l.length<8) return null; let sx=0,sy=0,x0=1e9,x1=-1e9,y0=1e9,y1=-1e9; l.forEach(p=>{const q=T2(p[1],p[2],p[3]);sx+=q[0];sy+=q[1];x0=Math.min(x0,q[0]);x1=Math.max(x1,q[0]);y0=Math.min(y0,q[1]);y1=Math.max(y1,q[1]);}); return {cx:sx/l.length,cy:sy/l.length,w:x1-x0,hgt:y1-y0,n:l.length};};
  const nameLabel=(loops,text,minW,region)=>{const i=loopInfo(loops); if(!i) return ""; if(region) addC(ctr,region,i.cx,i.cy,i.n); if(state.disorder||i.w<(minW||34)||i.hgt<14) return ""; return `<text x="${f1(i.cx)}" y="${f1(i.cy+3)}" text-anchor="middle">${esc(text)}</text>`;};
  let ribbon="", hemis=["lh","rh"];
  for(const hm of hemis){
    if(hm==="rh"&&!state.right) continue;
    const cm=cortex[hm], segs=sliceGeo(cm.geometry,ax,pos,cm.userData.lab);
    if(!segs.length) continue;
    const lp=loopPath(chainLoops(segs)); present.add("whitematter");
    h+=`<defs><clipPath id="cp-${hm}"><path d="${lp}" clip-rule="evenodd"/></clipPath></defs><path class="fr${sel("whitematter")}" ${meta("whitematter","Istota biała półkuli",` data-h="${hm}"`)} d="${lp}" fill="${rgb(CAP_CORTEX)}" fill-rule="evenodd"/>`;
    const bucket={};
    for(const s of segs){const a=T2(s[0][1],s[0][2],s[0][3]),b=T2(s[1][1],s[1][2],s[1][3]); (bucket[s[2]]=bucket[s[2]]||[]).push(`M${f1(a[0])},${f1(a[1])}L${f1(b[0])},${f1(b[1])}`); const nm=DK[s[2]]; if(nm!=="unknown") addC(ctrP,nm,(a[0]+b[0])/2,(a[1]+b[1])/2,1);}
    let tintG="";
    for(const li in bucket){ if(+li===0) continue; tintG+=`<path d="${bucket[li].join("")}" fill="none" stroke="${rgb(mix(T.cort[hm][li],CAP_CORTEX,0.3))}" stroke-width="60" stroke-linecap="round"/>`; }
    h+=`<g clip-path="url(#cp-${hm})" style="pointer-events:none">${tintG}</g>`;
    for(const li in bucket){
      const name=DK[li], region=name==="unknown"?"cc":PARCEL[name][1], lab=name==="unknown"?"Ściana przyśrodkowa (bez kory)":PARCEL[name][0];
      present.add(region);
      ribbon+=`<path class="fr rib${sel(region)}" ${meta(region,lab,` data-p="${name}" data-h="${hm}"`)} d="${bucket[li].join("")}" fill="none" stroke="${rgb(T.cort[hm][li])}" stroke-width="4.2" stroke-linecap="round"/>`;
    }
  }
  for(const hm of hemis){
    if(hm==="rh"&&!state.right) continue;
    for(let k=0;k<SCTX.length;k++){
      const segs=sliceGeo(sctxSub[hm][k],ax,pos); if(!segs.length) continue;
      const loops=chainLoops(segs), region=SCTX_REGION[SCTX[k]]; present.add(region);
      h+=`<path class="fr${sel(region)}" ${meta(region,SCTX_PL[SCTX[k]],` data-s="${SCTX[k]}" data-h="${hm}"`)} d="${loopPath(loops)}" fill="${rgb(T.sctx[hm][k])}" fill-rule="evenodd"/>`;
      if(hm==="lh"||ax!=="x") labels+=nameLabel(loops,SCTX_PL[SCTX[k]],38,region); else nameLabel(loops,"",0,region);
    }
  }
  for(let k=0;k<STEM.length;k++){
    const segs=sliceGeo(stemSub[k],ax,pos); if(!segs.length) continue; const loops=chainLoops(segs); present.add(STEM[k]);
    h+=`<path class="fr${sel(STEM[k])}" ${meta(STEM[k],REGIONS[STEM[k]].name)} d="${loopPath(loops)}" fill="${rgb(T.stem[k])}" fill-rule="evenodd"/>`;
    labels+=nameLabel(loops,REGIONS[STEM[k]].name,34,STEM[k]);
  }
  {const segs=sliceGeo(cereb.geometry,ax,pos); if(segs.length){const loops=chainLoops(segs); present.add("cerebellum");
    h+=`<path class="fr${sel("cerebellum")}" ${meta("cerebellum","Móżdżek")} d="${loopPath(loops)}" fill="${rgb(T.cereb)}" fill-rule="evenodd"/>`; labels+=nameLabel(loops,"Móżdżek",40,"cerebellum");}}
  h+=ribbon;
  for(const mk of markerMeshes){
    const id=mk.userData.id, r=mk.userData.base*mk.scale.x, d=mk.position.getComponent(o)-pos;
    if(!mk.visible||Math.abs(d)>r) continue; if(mk.position.x>0.5&&!state.right) continue;
    const rr=Math.sqrt(Math.max(r*r-d*d,0.6)), q=T2(mk.position.x,mk.position.y,mk.position.z), c=mk.material.color; present.add(id); addC(ctr,id,q[0],q[1],1);
    h+=`<circle class="fr${sel(id)}" ${meta(id,REGIONS[id].name)} cx="${f1(q[0])}" cy="${f1(q[1])}" r="${f1(Math.max(3.4,rr*sc))}" fill="${rgb([c.r,c.g,c.b])}" style="stroke:var(--surface);stroke-width:1.5"/>`;
    if(!state.disorder&&(state.region===id||state.pathways.size)) labels+=`<text x="${f1(q[0]+8)}" y="${f1(q[1]-6)}" style="font-size:8.5px">${esc(shortName(REGIONS[id].name).split(" ").slice(0,2).join(" "))}</text>`;
  }
  if(state.pathways.size){
    for(const r of routeObjs){
      if(!state.pathways.has(r.pw)) continue; const mine=!state.solo||(state.solo.pw===r.pw&&state.solo.ri===r.ri);
      for(const sgn of (ax==="x"?[1]:[1,-1])){
        const pts=r.lut.filter((_,i)=>i%3===0||i===r.lut.length-1).map(p=>{const q=T2(p.x*sgn,p.y,p.z);return f1(q[0])+","+f1(q[1]);});
        h+=`<path class="flow" d="M${pts.join("L")}" stroke="${PW[r.pw].color}" stroke-width="2.6" opacity="${mine?0.9:0.15}" style="pointer-events:none"/>`;
        const e=T2(r.b.x*sgn,r.b.y,r.b.z); h+=`<circle cx="${f1(e[0])}" cy="${f1(e[1])}" r="3.6" fill="${PW[r.pw].color}" opacity="${mine?1:0.2}" style="pointer-events:none"/>`;
      }
    }
    sourceGlows.forEach(g=>{ if(!state.pathways.has(g.pw)) return; const p=g.sprite.position; const q=T2(p.x,p.y,p.z); h+=`<circle cx="${f1(q[0])}" cy="${f1(q[1])}" r="9" fill="none" stroke="${PW[g.pw].color}" stroke-width="2.4" style="pointer-events:none"><animate attributeName="r" values="6;13;6" dur="1.8s" repeatCount="indefinite"/><animate attributeName="opacity" values=".95;.2;.95" dur="1.8s" repeatCount="indefinite"/></circle>`; });
  }
  // zaburzenie: podpisy obszarów ze strzałką kierunku zmiany
  let affected=[];
  if(state.disorder){
    const d=DISORDERS.find(x=>x.id===state.disorder);
    for(const [rid,dir] of d.regions){
      let c=null; const ps=REGION_PARCELS[rid];
      if(ps){let sx=0,sy=0,n=0; ps.forEach(p=>{const q=ctrP[p]; if(q){sx+=q[0];sy+=q[1];n+=q[2];}}); if(n) c=[sx/n,sy/n];}
      else if(ctr[rid]) c=[ctr[rid][0]/ctr[rid][2],ctr[rid][1]/ctr[rid][2]];
      if(!c) continue; affected.push(rid);
      const k=dirClass(dir||""), full=shortName(REGIONS[rid].name), ab=(REGIONS[rid].name.match(/\(([^)]+)\)/)||[])[1], nm=full.length>24&&ab?ab:full;
      labels+=`<text class="aff ${k}" x="${f1(Math.max(48,Math.min(FW-48,c[0])))}" y="${f1(c[1]+3)}" text-anchor="middle">${dirArrow(dir)} ${esc(nm)}</text>`;
    }
  }
  const side=ax==="x"?["przód","tył"]:["lewa","prawa"];
  const topLbl=ax==="y"?"przód":"góra", botLbl=ax==="y"?"tył":"dół";
  const bar2=20*sc;
  labels+=`<g style="fill:var(--muted)"><text x="8" y="${FH/2}" style="font-size:10px">${side[0]}</text><text x="${FW-8}" y="${FH/2}" text-anchor="end" style="font-size:10px">${side[1]}</text><text x="${FW/2}" y="12" text-anchor="middle" style="font-size:10px">${topLbl}</text><text x="${FW/2}" y="${FH-24}" text-anchor="middle" style="font-size:10px">${botLbl}</text></g>`;
  h+=`<g style="pointer-events:none"><path d="M${FM},${FH-10}h${f1(bar2)}" stroke="var(--ink)" stroke-width="2"/><text x="${FM+bar2+6}" y="${FH-6}" style="font-size:10px">20 mm</text><text x="${FW-FM}" y="${FH-6}" text-anchor="end" style="font-size:10.5px;font-weight:600">${esc(secLabel())}</text>${labels}</g>`;
  if(!present.size) h+=`<text x="${FW/2}" y="${FH/2}" text-anchor="middle" style="font-size:12px">Ten przekrój nie przecina mózgu. Przesuń suwak.</text>`;
  flatEl.innerHTML=h;
  flatEl.querySelectorAll(".fr").forEach(el=>{
    const info=()=>({label:el.dataset.pl,parcel:el.dataset.p||undefined,sctx:el.dataset.s||undefined,h:el.dataset.h||undefined,fromFlat:true});
    const go=()=>selectRegion(el.dataset.r,info());
    el.addEventListener("click",go); el.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();go();}});
    el.addEventListener("pointermove",e=>{
      const b=box.getBoundingClientRect(); let t=el.dataset.label; const en=enigmaData();
      if(en&&el.dataset.p&&el.dataset.h){const d=en.cort[(el.dataset.h==="lh"?"L_":"R_")+el.dataset.p]; if(d!==undefined)t+=` · d = ${fmt(d)}`;}
      if(en&&el.dataset.s&&el.dataset.h){const d=en.sub[(el.dataset.h==="lh"?"L":"R")+SCTX_KEY[el.dataset.s]]; if(d!==undefined)t+=` · d = ${fmt(d)}`;}
      tip.textContent=t; tip.style.left=(e.clientX-b.left)+"px"; tip.style.top=(e.clientY-b.top)+"px"; tip.style.opacity=1;
    });
    el.addEventListener("pointerleave",()=>tip.style.opacity=0);
  });
  renderFlatInfo(ax,present,affected);
}
function renderFlatInfo(ax,present,affected){
  const el=document.getElementById("flatinfo"); if(!el) return;
  const how=ax==="x"?"Przekrój strzałkowy: patrzysz na mózg z boku, przód jest po lewej. Suwak przesuwa przekrój od linii środkowej na zewnątrz."
    :ax==="z"?"Przekrój czołowy: patrzysz na mózg od przodu, lewa półkula jest po lewej. Suwak przesuwa przekrój od przodu do tyłu."
    :"Przekrój poziomy: patrzysz na mózg z góry, przód jest u góry. Suwak przesuwa przekrój od dołu do góry.";
  let colors;
  if(state.disorder){const d=DISORDERS.find(x=>x.id===state.disorder); colors=`Pokazuję: <b>${esc(shortName(d.name))}</b>. Czerwony = więcej lub nadaktywność, niebieski = mniej lub niedoczynność, fiolet = udział, biały = bez opisanego efektu. Strzałka przy nazwie pokazuje kierunek zmiany.`;}
  else if(state.network) colors=`Pokazuję sieć: <b>${esc(state.network)}</b>. Kolor oznacza węzły tej sieci, reszta jest biała.`;
  else if(state.pathways.size) colors=`Linie to rzut szlaków neuroprzekaźników na ten przekrój; kropka oznacza cel. Kolor obszaru pokazuje, do kogo trafia przekaźnik.`;
  else colors="Kolory kory odpowiadają płatom (jak w legendzie), wnętrze półkuli ma barwę najbliższego płata, a struktury podkorowe mają własne kolory.";
  let h=`<p class="flat-how">${how}</p><p class="flat-how">${colors}</p>`;
  if(state.disorder&&affected.length){
    h+=`<p class="flat-lab">Obszary zaburzenia widoczne na tym przekroju:</p><div class="linklist">`+affected.map(r=>`<button class="chip" data-reg="${r}">${esc(shortName(REGIONS[r].name))}</button>`).join("")+`</div>`;
  }
  if(state.disorder){
    const d=DISORDERS.find(x=>x.id===state.disorder), rest=d.regions.filter(r=>!affected.includes(r[0])&&anchorOf(r[0]));
    if(rest.length) h+=`<p class="flat-lab">Przesuń przekrój do innego obszaru zaburzenia:</p><div class="linklist">`+rest.map(r=>`<button class="chip" data-slice="${r[0]}">${esc(shortName(REGIONS[r[0]].name))}</button>`).join("")+`</div>`;
  } else {
    const names=[...present].filter(r=>REGIONS[r]&&r!=="whitematter").slice(0,16);
    if(names.length) h+=`<p class="flat-lab">Na tym przekroju (dotknij, żeby zobaczyć opis):</p><div class="linklist">`+names.map(r=>`<button class="chip" data-reg="${r}">${esc(shortName(REGIONS[r].name))}</button>`).join("")+`</div>`;
  }
  el.innerHTML=h;
  el.querySelectorAll("[data-reg]").forEach(b=>b.onclick=()=>selectRegion(b.dataset.reg,{fromFlat:true}));
  el.querySelectorAll("[data-slice]").forEach(b=>b.onclick=()=>{selectRegion(b.dataset.slice);});
}
function setDim(d){
  flatMode=d==="2d";
  box.classList.toggle("flat",flatMode); if(flatMode) flatEl.removeAttribute("hidden"); else flatEl.setAttribute("hidden","");
  $("#viewscroll").hidden=flatMode;
  const fi=document.getElementById("flatinfo"); if(fi) fi.hidden=!flatMode;
  const none=document.querySelector('#sec-axis [data-axis=""]'); if(none) none.hidden=flatMode;
  $("#sec-flip").hidden=flatMode; $("#sec-title").textContent=flatMode?"Płaszczyzna i położenie przekroju":"Przekrój";
  document.querySelectorAll("#dim button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.dim===d));
  tip.style.opacity=0;
  if(flatMode){ if(!state.section.axis){ setSectionMNI("x",-10); } else { state.section.flip=false; updateClip(); recolor(); } }
  else { resize(); recolor(); }
}
document.querySelectorAll("#dim button").forEach(b=>b.onclick=()=>setDim(b.dataset.dim));

// ---------- pętla ----------
let last=0, frame=0;
(function loop(now){
  requestAnimationFrame(loop);
  animT=now/1000; stepTween(now);
  const m=computeMirror(); if(m!==mirror){mirror=m;}
  pwRoot.scale.x=mirror?-1:1; netGroup.scale.x=mirror?-1:1;
  // cząsteczki płyną od źródła do celu
  if(state.pathways.size&&!REDUCED){
    const dt=Math.min(0.05,(now-last)/1000||0.016);
    for(const r of routeObjs){
      if(!r.group.visible||!r.points.visible) continue;
      const arr=r.pgeo.attributes.position.array, L=r.lut.length-1;
      for(let i=0;i<r.N;i++){
        r.phase[i]=(r.phase[i]+r.speed*dt)%1; const f=r.phase[i]*L, a=Math.floor(f), t=f-a, p=r.lut[a], q=r.lut[Math.min(L,a+1)];
        arr[i*3]=p.x+(q.x-p.x)*t; arr[i*3+1]=p.y+(q.y-p.y)*t; arr[i*3+2]=p.z+(q.z-p.z)*t;
      }
      r.pgeo.attributes.position.needsUpdate=true;
    }
  } else if(state.pathways.size&&REDUCED){
    for(const r of routeObjs){ if(!r.group.visible) continue; const arr=r.pgeo.attributes.position.array,L=r.lut.length-1; for(let i=0;i<r.N;i++){const p=r.lut[Math.floor(r.phase[i]*L)]; arr[i*3]=p.x;arr[i*3+1]=p.y;arr[i*3+2]=p.z;} r.pgeo.attributes.position.needsUpdate=true; }
  }
  for(const g of sourceGlows) if(g.sprite.visible){const s=(REDUCED?18:16+4*Math.sin(animT*3+g.from.length)); g.sprite.scale.setScalar(s);}
  netGroup.children.forEach(c=>{if(c.isSprite&&!REDUCED)c.scale.setScalar(19+3*Math.sin(animT*2.4));});
  // pulsowanie zaznaczenia (co drugą klatkę)
  if(flatMode){last=now;return;}
  tickOverlay(animT);
  last=now;
  // rysujemy tylko, gdy coś się zmienia (obrót, animacja, nowy stan), a animacje co najwyżej 30 razy na sekundę
  const moved=controls.update();
  const animating=!!tween||state.pathways.size>0||!!state.region||!!state.network;
  if(!moved&&!animating&&!dirty) return;
  if(!moved&&!dirty&&animating&&now-lastRender<33) return;
  renderer.render(scene,camera); updateLabels(); dirty=false; lastRender=now;
})(0);

setView("left",true);
updateClip(); recolor(); legend(); intro();
})();

// ---------- w aplikacji Psycho: wysokość ramki ----------
// Na telefonie atlas ma rosnąć razem z treścią, żeby przewijała się jedna strona, a nie „okno w oknie”.
// Aplikacja (src/views/AtlasView.jsx) ustawia wysokość ramki z tej wiadomości; h=null = zwykła wysokość.
(function(){
  if(window.top===window.self||!window.parent) return;
  const narrow=window.matchMedia("(max-width:900px)");
  let last=-1, raf2=0;
  const send=()=>{raf2=0;
    const h=narrow.matches?Math.ceil(document.documentElement.getBoundingClientRect().height):null;
    if(h===last) return; last=h;
    try{window.parent.postMessage({type:"psycho-atlas-height",h},location.origin);}catch(e){}
  };
  const queue=()=>{if(!raf2) raf2=requestAnimationFrame(send);};
  if(window.ResizeObserver) new ResizeObserver(queue).observe(document.documentElement);
  window.addEventListener("resize",queue); narrow.addEventListener&&narrow.addEventListener("change",queue); queue();
})();
