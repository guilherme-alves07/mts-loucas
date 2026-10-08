const express=require('express'),multer=require('multer'),fs=require('fs'),path=require('path'),crypto=require('crypto');
const app=express(),PORT=process.env.PORT||3000,ADMIN_PASSWORD=process.env.ADMIN_PASSWORD||'mts123';
const DB=path.join(__dirname,'data','db.json'),UP=path.join(__dirname,'public','uploads');
fs.mkdirSync(UP,{recursive:true});fs.mkdirSync(path.dirname(DB),{recursive:true});
if(!fs.existsSync(DB))fs.writeFileSync(DB,JSON.stringify({settings:{storeName:'MTS Louças',tagline:'Aluguel de louças para a sua festa',whatsapp:'5511999999999',categories:['Pratos','Talheres','Copos','Travessas']},items:[]},null,2));
const read=()=>JSON.parse(fs.readFileSync(DB,'utf8')),write=d=>fs.writeFileSync(DB,JSON.stringify(d,null,2));
const sessions=new Set();
const upload=multer({storage:multer.diskStorage({destination:UP,filename:(q,f,cb)=>cb(null,Date.now()+'-'+crypto.randomBytes(3).toString('hex')+path.extname(f.originalname).toLowerCase())}),limits:{fileSize:5e6},fileFilter:(q,f,cb)=>cb(null,/^image\/(jpeg|png|webp)$/.test(f.mimetype))});
const auth=(q,s,n)=>sessions.has(q.headers['x-token'])?n():s.status(401).json({error:'Sessão expirada. Entre novamente.'});
const rm=p=>fs.unlink(path.join(__dirname,'public',p),()=>{});
const build=(q,old={})=>{let keep=[];try{keep=JSON.parse(q.body.keep||'[]')}catch{}
return{id:old.id||crypto.randomUUID(),name:(q.body.name||'').trim(),category:q.body.category||'',price:Number(q.body.price)||0,description:q.body.description||'',available:q.body.available!=='false',
photos:[...keep.filter(p=>(old.photos||[]).includes(p)),...(q.files||[]).map(f=>'/uploads/'+f.filename)]}};
app.use(express.json());app.use(express.static(path.join(__dirname,'public')));
app.get('/api/site',(q,s)=>s.json(read()));
app.post('/api/login',(q,s)=>{if(q.body.password!==ADMIN_PASSWORD)return s.status(401).json({error:'Senha incorreta'});const t=crypto.randomUUID();sessions.add(t);s.json({token:t})});
app.put('/api/settings',auth,(q,s)=>{const d=read(),b=q.body;if(b.whatsapp)b.whatsapp=String(b.whatsapp).replace(/\D/g,'');d.settings={...d.settings,...b};write(d);s.json(d.settings)});
app.post('/api/items',auth,upload.array('photos',8),(q,s)=>{const d=read(),i=build(q);if(!i.name)return s.status(400).json({error:'Informe o nome do item'});d.items.push(i);write(d);s.json(i)});
app.put('/api/items/:id',auth,upload.array('photos',8),(q,s)=>{const d=read(),k=d.items.findIndex(x=>x.id===q.params.id);if(k<0)return s.status(404).json({error:'Item não encontrado'});const o=d.items[k],n=build(q,o);o.photos.filter(p=>!n.photos.includes(p)).forEach(rm);d.items[k]=n;write(d);s.json(n)});
app.delete('/api/items/:id',auth,(q,s)=>{const d=read(),o=d.items.find(x=>x.id===q.params.id);if(o)o.photos.forEach(rm);d.items=d.items.filter(x=>x!==o);write(d);s.json({ok:true})});
app.listen(PORT,()=>console.log('MTS no ar: http://localhost:'+PORT+'  |  Admin: /admin.html'));
