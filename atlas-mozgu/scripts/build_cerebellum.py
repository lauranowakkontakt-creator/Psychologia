import nibabel as nib, numpy as np, os, nilearn, base64, json
from skimage import measure
from scipy import ndimage
import sys
E=os.environ.get('ENIGMA_DATASETS', str(__import__('pathlib').Path(__file__).resolve().parent.parent/'vendor/ENIGMA/enigmatoolbox/datasets'))+'/'
N=os.path.dirname(nilearn.__file__)+'/datasets/data/'
gm=nib.load(N+'mni_icbm152_gm_tal_nlin_sym_09a_converted.nii.gz'); wm=nib.load(N+'mni_icbm152_wm_tal_nlin_sym_09a_converted.nii.gz')
t1=nib.load(N+'mni_icbm152_t1_tal_nlin_sym_09a_converted.nii.gz').get_fdata()
aff=gm.affine; inv=np.linalg.inv(aff)
B=(gm.get_fdata()+wm.get_fdata())>0.45
ii,jj,kk=np.indices(B.shape); X=ii+aff[0,3]; Y=jj+aff[1,3]; Z=kk+aff[2,3]
interior=np.zeros(B.shape,bool)
allv=np.vstack([nib.load(E+f'surfaces/fsa5_{h}.gii').darrays[0].data for h in ['lh','rh']])
Bc=B&(Z>-10)  # cerebrum-dominated part for bbox
bx=[X[Bc].min(),X[Bc].max()]; by=[Y[B].min(),Y[B].max()]; bz=Z[B].max()
vx=[allv[:,0].min(),allv[:,0].max()]; vy=[allv[:,1].min(),allv[:,1].max()]; vz=allv[:,2].max()
sx=(bx[1]-bx[0])/(vx[1]-vx[0]); sy=(by[1]-by[0])/(vy[1]-vy[0])
ox=bx[0]-vx[0]*sx; oy=by[0]-vy[0]*sy
# z: match top, scale like y
sz=sy; oz=bz-vz*sz
print('fit',sx,ox,sy,oy,sz,oz)
FIT=(sx,ox,sy,oy,sz,oz)
for h in ['lh','rh']:
    g=nib.load(E+f'surfaces/fsa5_{h}.gii'); v=g.darrays[0].data.copy(); f=g.darrays[1].data
    v[:,0]=v[:,0]*sx+ox; v[:,1]=v[:,1]*sy+oy; v[:,2]=v[:,2]*sz+oz
    # dense sampling of triangles
    sh=np.zeros(B.shape,bool)
    for a,b_ in [(0.,0.),(1/3,1/3),(0.5,0),(0,0.5),(0.5,0.5),(0.25,0.25),(0.6,0.2),(0.2,0.6)]:
        p=v[f[:,0]]*(1-a-b_)+v[f[:,1]]*a+v[f[:,2]]*b_
        idx=np.round((p-aff[:3,3])).astype(int)
        sh[idx[:,0],idx[:,1],idx[:,2]]=True
    sh=ndimage.binary_dilation(sh,iterations=2)
    interior|=ndimage.binary_fill_holes(sh)
print('interior',interior.sum())
rest=B&~ndimage.binary_dilation(interior,iterations=3)&(Z<10)&(Y<-5)
def largest(m):
    l,n=ndimage.label(m); s=ndimage.sum(m,l,range(1,n+1)); return l==(np.argmax(s)+1)
rest=ndimage.binary_opening(rest,iterations=1); rest=largest(rest)
stem=rest&(Y>-42)&(np.abs(X)<20)
cereb=largest(rest&~stem); stem=largest(stem)
print('stem',stem.sum(),'cereb',cereb.sum())
def trilin(vol,p):
    q=(p-aff[:3,3]); return ndimage.map_coordinates(vol,q.T,order=1)
out={}
for name,m in [('cerebellum',cereb),('brainstem',stem)]:
    sm=ndimage.gaussian_filter(m.astype(float),1.0)
    v,f,nrm,_=measure.marching_cubes(sm,0.5,step_size=1 if name=='brainstem' else 1)
    v=(v+aff[:3,3]).astype(np.float32)
    # decimate cerebellum by step 2 if too big
    print(name,len(v),len(f))
    out[name]=(v,f)

import pickle; pickle.dump(out,open(str(__import__('pathlib').Path(__file__).resolve().parent.parent/'data/cs.pkl'),'wb'))
# T1 texture
for name,(v,f) in out.items():
    inner=v.copy()
    tex=trilin(t1,v)
    print(name,'t1',np.percentile(tex,[5,50,95]))
import matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
fig,ax=plt.subplots(1,3,figsize=(15,5))
for a,x in zip(ax,[0,-12,-30]):
    i=int(x-aff[0,3]); img=np.zeros(B.shape[1:]+(3,))
    img[...,0]=interior[i]*0.6; img[...,1]=cereb[i]*0.8; img[...,2]=stem[i]*0.9
    img+=(t1[i]/t1.max())[...,None]*0.4
    a.imshow(np.clip(img,0,1).transpose(1,0,2),origin='lower'); a.set_title(f'x={x}')
plt.savefig(str(__import__('pathlib').Path(__file__).resolve().parent.parent/'data/seg_check.png'),dpi=60)
res={}
for name,(v,f) in out.items():
    sm=ndimage.gaussian_filter((cereb if name=='cerebellum' else stem).astype(float),1.0)
    # normals by gradient of sm (points toward inside)
    gx,gy,gz=np.gradient(sm); q=(v-aff[:3,3]).T
    n=np.stack([ndimage.map_coordinates(g,q,order=1) for g in (gx,gy,gz)],1); n/=np.linalg.norm(n,axis=1,keepdims=True)+1e-9
    tex=np.maximum(trilin(t1,v+n*1.2),trilin(t1,v+n*2.2))
    lo,hi=np.percentile(tex,[5,95]); shade=np.clip((tex-lo)/(hi-lo+1e-9),0,1)
    sx,ox,sy,oy,sz,oz=FIT
    w=v.copy(); w[:,0]=(v[:,0]-ox)/sx; w[:,1]=(v[:,1]-oy)/sy; w[:,2]=(v[:,2]-oz)/sz
    lab=np.where(v[:,2]>-16,0,np.where(v[:,2]>-40,1,2)).astype(np.uint8)
    res[name]=dict(v=w.astype(np.float32),f=f[:,::-1].astype(np.uint16),shade=(shade*255).astype(np.uint8),lab=lab)
    print(name,'shade pct',np.percentile(shade,[10,50,90]))
pickle.dump(res,open(str(__import__('pathlib').Path(__file__).resolve().parent.parent/'data/cs.pkl'),'wb'))
