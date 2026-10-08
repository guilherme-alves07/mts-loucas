let D,cat='Todos',cart=JSON.parse(localStorage.mtsCart||'{}');
const $=s=>document.querySelector(s),brl=n=>n.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const save=()=>{localStorage.mtsCart=JSON.stringify(cart);drawCart()};
const fmt=n=>String(n).replace(/^(\d{2})(\d{2})(\d{4,5})(\d{4})$/,'+$1 ($2) $3-$4');
fetch('/api/site').then(r=>r.json()).then(d=>{D=d;const s=d.settings,wa='https://wa.me/'+s.whatsapp,ig=(s.instagram||'').replace(/^.*instagram\.com\//,'').replace('@','').replace(/\/$/,'');
$('#store').textContent=s.storeName;$('#tag').textContent=s.tagline;$('#fTag').textContent=s.tagline;$('#about').textContent=s.about||'';$('#aboutSec').hidden=!s.about;
$('#copy').textContent='© '+new Date().getFullYear()+' '+s.storeName+'. Todos os direitos reservados.';document.title=s.storeName+' | Aluguel de louças';
document.querySelectorAll('.wa-link').forEach(x=>x.href=wa);
$('#contacts').innerHTML=[['WhatsApp',`<a href="${wa}" target="_blank" rel="noopener">${esc(fmt(s.whatsapp))}</a>`],s.email&&['E-mail',`<a href="mailto:${esc(s.email)}">${esc(s.email)}</a>`],ig&&['Instagram',`<a href="https://instagram.com/${esc(ig)}" target="_blank" rel="noopener">@${esc(ig)}</a>`],s.address&&['Região de atendimento',esc(s.address)],s.hours&&['Horário de atendimento',esc(s.hours)]].filter(Boolean).map(([k,v])=>`<li><b>${k}</b><br>${v}</li>`).join('');
drawChips();drawGrid();drawCart()}).catch(()=>{$('#grid').innerHTML='<p class="empty">Não foi possível carregar o catálogo. Abra o site pelo endereço do servidor (http://localhost:3000).</p>'});
function drawChips(){$('#chips').innerHTML=['Todos',...D.settings.categories].map(c=>`<button class="chip ${c===cat?'on':''}" data-c="${esc(c)}">${esc(c)}</button>`).join('')}
function drawGrid(){
const L=D.items.filter(i=>i.available&&(cat==='Todos'||i.category===cat));
$('#grid').innerHTML=L.length?L.map(i=>`<article class="card"><div class="gal">${i.photos.length?i.photos.map(p=>`<img src="${p}" alt="${esc(i.name)}" loading="lazy">`).join(''):'<div class="nop">Sem foto</div>'}</div>
<div class="in"><h3>${esc(i.name)}</h3><small>${esc(i.description)}</small><span class="price">${brl(i.price)} por unidade</span>
<div class="row"><div class="qty"><button data-m="${i.id}" aria-label="Diminuir">−</button><span id="q${i.id}">1</span><button data-p="${i.id}" aria-label="Aumentar">+</button></div><button class="btn" data-a="${i.id}">Adicionar</button></div></div></article>`).join(''):'<p class="empty">Nenhum item nesta categoria ainda.</p>'}
function drawCart(){
const L=Object.entries(cart).map(([id,q])=>({i:D.items.find(x=>x.id===id),q})).filter(x=>x.i);
$('#count').textContent=L.reduce((a,x)=>a+x.q,0);
$('#lines').innerHTML=L.length?L.map(({i,q})=>`<div class="line"><div><b>${esc(i.name)}</b><br><small>${brl(i.price)} × ${q}</small></div><div class="qty"><button data-cm="${i.id}">−</button><span>${q}</span><button data-cp="${i.id}">+</button></div></div>`).join(''):'<p class="empty">Seu pedido está vazio. Adicione itens do catálogo.</p>';
$('#total').textContent='Total estimado: '+brl(L.reduce((a,x)=>a+x.q*x.i.price,0));
$('#send').disabled=!L.length}
document.addEventListener('click',e=>{const t=e.target,g=k=>t.dataset[k];
if(g('c')){cat=g('c');drawChips();drawGrid()}
const n=id=>+$('#q'+id).textContent;
if(g('p'))$('#q'+g('p')).textContent=n(g('p'))+1;
if(g('m'))$('#q'+g('m')).textContent=Math.max(1,n(g('m'))-1);
if(g('a')){cart[g('a')]=(cart[g('a')]||0)+n(g('a'));$('#q'+g('a')).textContent=1;save();$('#cart').classList.add('open')}
if(g('cp')){cart[g('cp')]++;save()}
if(g('cm')){if(--cart[g('cm')]<1)delete cart[g('cm')];save()}});
$('#cartBtn').onclick=()=>$('#cart').classList.add('open');
$('#close').onclick=()=>$('#cart').classList.remove('open');
$('#send').onclick=()=>{
const L=Object.entries(cart).map(([id,q])=>({i:D.items.find(x=>x.id===id),q})).filter(x=>x.i);
const d=$('#date').value?$('#date').value.split('-').reverse().join('/'):'a combinar';
const txt=`Olá! Gostaria de um orçamento para alugar:\n\n`+L.map(({i,q})=>`• ${q}x ${i.name} (${brl(i.price)} cada)`).join('\n')+`\n\nTotal estimado: ${brl(L.reduce((a,x)=>a+x.q*x.i.price,0))}\nData do evento: ${d}`;
window.open(`https://wa.me/${D.settings.whatsapp}?text=${encodeURIComponent(txt)}`,'_blank')};
