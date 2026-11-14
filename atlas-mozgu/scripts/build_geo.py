import nibabel as nib, numpy as np, os, nilearn, base64, json
from skimage import measure
from scipy import ndimage
import sys
E=os.environ.get('ENIGMA_DATASETS', str(__import__('pathlib').Path(__file__).resolve().parent.parent/'vendor/ENIGMA/enigmatoolbox/datasets'))+'/'
N=os.path.dirname(nilearn.__file__)+'/datasets/data/'
b64=lambda a: base64.b64encode(np.ascontiguousarray(a).tobytes()).decode()
geo={}
lab=np.loadtxt(E+'parcellations/aparc_fsa5.csv',dtype=int)
for h,hn,off in [('lh','left',0),('rh','right',10242)]:
    g=nib.load(E+f'surfaces/fsa5_{h}.gii'); v=g.darrays[0].data.astype(np.float32); f=g.darrays[1].data.astype(np.uint16)
    s=nib.load(N+f'fsaverage5/sulc_{hn}.gii.gz').darrays[0].data
    s=np.clip(s/np.abs(s).max()*127,-127,127).astype(np.int8)
    L=lab[off:off+10242].copy()
    if h=='rh': L=np.where(L>0,L-35,0)  # 36..70 -> 1..35
    geo[h]={'v':b64(v),'f':b64(f),'l':b64(L.astype(np.uint8)),'s':b64(s),'nv':len(v),'nf':len(f)}
# subcortical
counts=[867,1419,3012,3784,1446,4003,3726,7653,838,1457,3208,3742,1373,3871,3699,7180]
names=['accumbens','amygdala','caudate','hippocampus','pallidum','putamen','thalamus','ventricles']
for h,ci in [('lh',counts[:8]),('rh',counts[8:])]:
    g=nib.load(E+f'surfaces/sctx_{h}.gii'); v=g.darrays[0].data.astype(np.float32); f=g.darrays[1].data.astype(np.uint16)
    L=np.concatenate([np.full(c,i,np.uint8) for i,c in enumerate(ci)])
    assert len(L)==len(v)
    geo['sctx_'+h]={'v':b64(v),'f':b64(f),'l':b64(L),'nv':len(v),'nf':len(f)}
import pickle
cs=pickle.load(open(str(__import__('pathlib').Path(__file__).resolve().parent.parent/'data/cs.pkl'),'rb'))
for name,r in cs.items():
    d={'v':b64(r['v']),'f':b64(r['f']),'nv':len(r['v']),'nf':len(r['f']),'t':b64(r['shade'])}
    if name=='brainstem': d['l']=b64(r['lab'])
    geo[name]=d
# ENIGMA effect sizes
S=E+'summary_statistics/'
import csv
def read(fn):
    out={}
    with open(S+fn) as fh:
        r=csv.reader(fh); next(r)
        for row in r:
            if len(row)<3 or not row[1]: continue
            try: out[row[1].strip()]=round(float(row[2]),3)
            except: pass
    return out
files={
 'mdd':('mddadult_case-controls_CortThick.csv','mdd_case-controls_SubVol.csv','grubość kory, dorośli','Schmaal i in. 2016/2017'),
 'bd':('bd_case-controls_CortThick_adult.csv','bd_case-controls_SubVol_typeI.csv','grubość kory, dorośli; podkorowe: typ I','Hibar i in. 2016/2018'),
 'scz':('scz_case-controls_CortThick.csv','scz_case-controls_SubVol.csv','grubość kory','van Erp i in. 2016/2018'),
 'ocd':('ocdadults_case-controls_CortThick.csv','ocdadult_case-controls_SubVol.csv','grubość kory, dorośli','Boedhoe i in. 2017/2018'),
 'adhd':('adhdpediatric_case-controls_CortSurf.csv','adhdpediatric_case-controls_SubVol.csv','pole powierzchni kory, dzieci','Hoogman i in. 2017/2019'),
 'asd':('asd_meta-analysis_case-controls_CortThick.csv','asd_meta-analysis_case-controls_SubVol.csv','grubość kory','van Rooij i in. 2018'),
 'an':('anorexia_acAN-controls_CortThick.csv','anorexia_acAN-controls_SubVol.csv','grubość kory, ostra faza','Walton i in. 2022'),
 'asp':('Antisocial_case-controls_CortThick.csv','Antisocial_case-controls_SubVol.csv','grubość kory','ENIGMA Antisocial Behavior WG'),
}
enigma={}
for k,(c,s,metric,ref) in files.items():
    enigma[k]={'cort':read(c),'sub':read(s),'metric':metric,'ref':ref}
json.dump(geo,open(str(__import__('pathlib').Path(__file__).resolve().parent.parent/'data/geo.json'),'w')); json.dump(enigma,open(str(__import__('pathlib').Path(__file__).resolve().parent.parent/'data/enigma.json'),'w'),ensure_ascii=False,indent=0)
print({k:(v['nv'],v['nf']) for k,v in geo.items()})
for k,v in enigma.items(): print(k,len(v['cort']),len(v['sub']),list(v['sub'].items())[:3])
print(os.path.getsize(str(__import__('pathlib').Path(__file__).resolve().parent.parent/'data/geo.json'))//1024,'KB')
