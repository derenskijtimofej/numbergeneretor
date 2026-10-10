const letters='АВЕКМНОРСТУХ';
const regions=['23','93','123','77','97','99','50','90','150','116','716','178','198','66','196'];
const $=id=>document.getElementById(id);
let balance=50000,current=null,owned=[],vault=[];
const money=n=>n.toLocaleString('ru-RU')+' ₽';
const pick=a=>a[Math.floor(Math.random()*a.length)];
function makeNumber(){
 let region=$('region').value;if(region==='random')region=pick(regions);
 let digits=Array.from({length:3},()=>Math.floor(Math.random()*10));
 let l=Array.from({length:3},()=>pick(letters)),status='ОБЫЧНЫЙ',price=1000;
 const mode=$('mode').value;
 // Most combinations are ordinary; special ones occur randomly rather than via a rarity selector.
 let roll=Math.random();
 if(mode==='plain'||(mode==='any'&&roll<.55)){status='ОБЫЧНЫЙ';price=1000+Math.floor(Math.random()*1001)}
 else if(mode==='special'&&roll<.25){status='ОБЫЧНЫЙ';price=1000+Math.floor(Math.random()*1001)}
 else {
   const kind=Math.floor(Math.random()*4);
   if(kind===0){digits=[digits[0],digits[0],digits[0]];status='ПОВТОР ЦИФР';price=3000+Math.floor(Math.random()*2001)}
   else if(kind===1){digits=[digits[0],digits[1],digits[0]];status='ЗЕРКАЛЬНЫЙ';price=4000+Math.floor(Math.random()*2001)}
   else if(kind===2){const x=pick(letters);l=[x,x,x];status='ОДИНАКОВЫЕ БУКВЫ';price=5000+Math.floor(Math.random()*3001)}
   else {digits=[7,7,7];l=[pick(letters),pick(letters),pick(letters)];status='ЛЕГЕНДАРНЫЙ';price=9000+Math.floor(Math.random()*1001)}
 }
 if(mode==='special'&&status==='ОБЫЧНЫЙ'){digits=[digits[0],digits[0],digits[0]];status='ПОВТОР ЦИФР';price=3000+Math.floor(Math.random()*2001)}
 return {id:Date.now().toString(36)+Math.random().toString(36).slice(2,7),num:`${l[0]}${digits.join('')}${l[1]}${l[2]} ${region}`,status,price};
}
function updateBalance(){$('balance').textContent=money(balance)}
function generate(){current=makeNumber();$('number').textContent=current.num;$('rarity').textContent=current.status;$('price').textContent=money(current.price);$('feedback').textContent='';$('result').classList.add('show')}
function buy(){
 if(!current)return;
 if(owned.some(x=>x.num===current.num)){ $('feedback').textContent='Этот номер уже есть в коллекции. Сгенерируй другой!';return}
 if(balance<current.price){$('feedback').textContent='Не хватает игровых рублей. Получи бонус или выбери другой номер.';return}
 balance-=current.price;owned.unshift({...current});updateBalance();renderOwned();$('feedback').textContent='Покупка успешна! Номер добавлен в коллекцию.';current=null;
}
function addVault(id){const item=owned.find(x=>x.id===id);if(!item||vault.some(x=>x.id===id))return;vault.unshift(item);renderVault()}
function removeVault(id){vault=vault.filter(x=>x.id!==id);renderVault()}
function makeEntry(item,isVault=false){
 const el=document.createElement('div');el.className='entry';
 const main=document.createElement('div');main.className='entry-main';
 const num=document.createElement('div');num.className='entry-number';num.textContent=item.num;
 const meta=document.createElement('div');meta.className='entry-meta';meta.textContent=item.status+' · '+money(item.price);main.append(num,meta);
 const actions=document.createElement('div');actions.className='entry-actions';
 const btn=document.createElement('button');btn.className='btn secondary mini';
 if(isVault){btn.textContent='Убрать из сейфа';btn.addEventListener('click',()=>removeVault(item.id))}
 else{btn.textContent=vault.some(x=>x.id===item.id)?'✓ В сейфе':'＋ В сейф';btn.disabled=vault.some(x=>x.id===item.id);btn.addEventListener('click',()=>addVault(item.id))}
 actions.append(btn);el.append(main,actions);return el;
}
function renderOwned(){$('count').textContent=owned.length+' номеров';const box=$('collection');box.replaceChildren();if(!owned.length){box.innerHTML='<div class="empty">Коллекция пока пуста. Сгенерируй и купи первый номер!</div>';return}owned.forEach(x=>box.append(makeEntry(x)))}
function renderVault(){$('vaultCount').textContent=vault.length+' в сейфе';const box=$('vault');box.replaceChildren();if(!vault.length){box.innerHTML='<div class="empty">В сейфе пока ничего нет.</div>';return}vault.forEach(x=>box.append(makeEntry(x,true)))}
$('generate').addEventListener('click',generate);$('reroll').addEventListener('click',generate);$('buy').addEventListener('click',buy);
$('daily').addEventListener('click',()=>{balance+=2000;updateBalance();$('daily').disabled=true;$('daily').textContent='✓ Бонус получен';});
updateBalance();renderOwned();renderVault();generate();
