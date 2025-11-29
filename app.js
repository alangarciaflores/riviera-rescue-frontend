const API_BASE = (window.API_BASE || "").trim();
const $  = s => document.querySelector(s);
$("#year").textContent = new Date().getFullYear();

function toast(text, kind="success"){
  const t = document.createElement("div");
  t.className = "rounded-xl shadow-xl border px-4 py-3 text-sm " + (
    kind==="success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" :
    kind==="error"   ? "bg-red-50 border-red-200 text-red-800" :
                       "bg-neutral-50 border-neutral-200 text-neutral-800"
  );
  ($("#toast-root")).appendChild(t);
  setTimeout(()=> t.remove(), 3000);
}
function openModal(html){
  const root = document.createElement("div");
  root.className = "fixed inset-0 z-50 flex items-center justify-center p-4";
  root.innerHTML = `<div class="absolute inset-0 bg-black/50"></div>
    <div class="relative max-w-xl w-full bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden">
      ${html}
    </div>`;
  root.addEventListener("click",(e)=>{ if(e.target===root.firstElementChild) root.remove(); });
  document.body.appendChild(root);
  return root;
}

// API client (auto fallback localStorage)
let API_OK = false;
async function api(path, opts={}){
  if(!API_OK) throw new Error("API no disponible");
  const res = await fetch((API_BASE || "") + path, {
    headers: {"Content-Type":"application/json"},
    credentials: "include",
    ...opts
  });
  if(!res.ok) throw new Error(await res.text());
  return res.json();
}
async function detectAPI(){
  try{ const r = await fetch((API_BASE||"") + "/api/health", {cache:"no-store"}); API_OK = r.ok; }
  catch{ API_OK = false; }
}
const LS = {
  get(k, def){ try{ return JSON.parse(localStorage.getItem(k) || JSON.stringify(def)); }catch{ return def; } },
  set(k, v){ localStorage.setItem(k, JSON.stringify(v)); }
};

// Datos demo
const DEMO_DOGS = [
  { id:1, nombre:"Luna",  edad:"Cachorra", tam:"Pequeño", estado:"Disponible",
    img:"https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?q=80&w=1200&auto=format&fit=crop",
    descripcion:"Energética y cariñosa, ideal para depto con paseos diarios." },
  { id:2, nombre:"Bobby", edad:"Adulto",   tam:"Mediano", estado:"Disponible",
    img:"https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=1200&auto=format&fit=crop",
    descripcion:"Tranquilo, convive con niños. Le encantan las siestas." },
  { id:3, nombre:"Canela", edad:"Joven",   tam:"Mediano", estado:"En proceso",
    img:"https://images.unsplash.com/photo-1534361960057-19889db9621e?q=80&w=1200&auto=format&fit=crop",
    descripcion:"Juguetona, necesita jardín o paseos largos." },
];

function openDonation(amount=200){
  let current = amount;
  const presets = [100,200,300,500];
  const html = `<div class="p-5">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-extrabold">Donación</h3>
        <button id="dn-close" class="text-neutral-500 hover:text-neutral-800" aria-label="Cerrar">✕</button>
      </div>
      <p class="text-sm text-neutral-600 mt-1">Simulación de checkout alojado (Stripe/PayPal).</p>
      <div class="mt-4 flex flex-wrap gap-2">
        ${presets.map(p=>`<button data-preset="${p}" class="rounded-lg px-3 py-2 border ${p===current?'bg-rr-primary text-white border-[var(--rr-primary)]':'border-neutral-200 hover:border-neutral-300'}">$${p} MXN</button>`).join("")}
      </div>
      <div class="mt-4">
        <label class="text-sm font-medium">Otra cantidad</label>
        <input id="dn-amount" type="number" min="10" step="10" value="${current}" class="mt-1 w-full rounded-xl border border-neutral-300 p-2"/>
      </div>
      <div class="mt-5 flex items-center justify-end gap-3">
        <button id="dn-cancel" class="btn-ghost">Cancelar</button>
        <button id="dn-pay" class="rounded-xl px-4 py-2 bg-neutral-900 text-white hover:bg-neutral-800">Pagar $${current} MXN</button>
      </div>
    </div>`;
  const modal = openModal(html);
  const box = modal.querySelector(".relative");
  box.addEventListener("click",(e)=>{
    const btn = e.target.closest("button"); if(!btn) return;
    if(btn.id==="dn-close"||btn.id==="dn-cancel"){ modal.remove(); return; }
    if(btn.dataset.preset){
      current = Number(btn.dataset.preset);
      box.querySelector("#dn-amount").value=current;
      box.querySelector("#dn-pay").textContent=`Pagar $${current} MXN`;
      box.querySelectorAll("[data-preset]").forEach(el=>el.className="rounded-lg px-3 py-2 border border-neutral-200 hover:border-neutral-300");
      btn.className="rounded-lg px-3 py-2 border bg-rr-primary text-white border-[var(--rr-primary)]";
    }
    if(btn.id==="dn-pay"){ modal.remove(); toast("¡Gracias! Donación registrada (simulada).","success"); }
  });
  box.querySelector("#dn-amount").addEventListener("input",(e)=>{
    const v = Number(e.target.value||0);
    current=v; box.querySelector("#dn-pay").textContent=`Pagar $${current} MXN`;
  });
}

function openDog(dog){
  const html = `<img src="${dog.img}" alt="${dog.nombre}" class="w-full aspect-[4/3] object-cover"/>
    <div class="p-5">
      <div class="flex items-center justify-between gap-4">
        <h3 class="text-xl font-extrabold tracking-tight">${dog.nombre}</h3>
        <button id="dog-close" aria-label="Cerrar" class="text-neutral-500 hover:text-neutral-800">✕</button>
      </div>
      <p class="text-sm text-neutral-600 mt-1">${dog.edad} · ${dog.tam} · ${dog.estado}</p>
      <p class="mt-3 text-neutral-800">${dog.descripcion}</p>
      <div class="mt-5 flex items-center gap-3">
        <button id="dog-adopt" class="rounded-xl px-4 py-2 bg-neutral-900 text-white hover:bg-neutral-800">Iniciar adopción</button>
        <button id="dog-close-2" class="btn-ghost">Cerrar</button>
      </div>
    </div>`;
  const modal = openModal(html);
  const box   = modal.querySelector(".relative");
  const close = ()=> modal.remove();
  box.querySelector("#dog-close").onclick=close;
  box.querySelector("#dog-close-2").onclick=close;
  box.querySelector("#dog-adopt").onclick=()=>{
    $("#c-subject").value = `Interés de adopción: ${dog.nombre} (#${dog.id})`;
    location.hash = "contacto";
    toast(`Listo. Prellené el asunto con "${dog.nombre}".`,"success");
    close();
  };
}

async function apiGetAnimals(){
  if(API_OK){
    const data = await api("/api/animals"); return data.items || [];
  }
  let items = LS.get("rr_animals", null);
  if(!items){ items = DEMO_DOGS; LS.set("rr_animals", items); }
  return items;
}
function applyFilters(items){
  const size = document.querySelector("#f-size").value;
  const age  = document.querySelector("#f-age").value;
  const q    = (document.querySelector("#f-q").value||"").toLowerCase();
  return items.filter(d =>
    (size==="Todos" || d.tam===size) &&
    (age==="Todos"  || d.edad===age) &&
    (!q || d.nombre.toLowerCase().includes(q))
  );
}
async function renderDogs(){
  const grid = document.querySelector("#pets-grid");
  grid.innerHTML = "";
  const all = await apiGetAnimals();
  const filtered = applyFilters(all);
  if(!filtered.length){ grid.innerHTML = `<div class="col-span-full text-sm text-neutral-600">Sin resultados.</div>`; return; }
  for(const d of filtered){
    const card = document.createElement("div");
    card.className = "group rounded-2xl overflow-hidden border border-neutral-200 bg-white hover:shadow-lg transition";
    card.innerHTML = `
      <img src="${d.img}" alt="${d.nombre}" class="w-full aspect-[4/3] object-cover" />
      <div class="p-4">
        <div class="flex items-center justify-between gap-3">
          <h3 class="font-bold text-lg">${d.nombre}</h3>
          <span class="text-xs px-2 py-1 rounded-full bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]">${d.tam}</span>
        </div>
        <p class="text-sm text-neutral-600 mt-1">${d.edad} · ${d.estado||"Disponible"}</p>
        <div class="mt-4 flex items-center gap-3">
          <button data-action="adopt" class="rounded-lg px-3 py-2 bg-neutral-900 text-white text-sm hover:bg-neutral-800">Quiero adoptar</button>
          <button data-action="view"  class="rounded-lg px-3 py-2 border border-neutral-200 text-sm hover:border-neutral-300">Ver detalles</button>
        </div>
      </div>`;
    card.addEventListener("click",(e)=>{
      const btn = e.target.closest("button"); if(!btn) return;
      if(btn.dataset.action==="adopt"){
        document.querySelector("#c-subject").value = `Interés de adopción: ${d.nombre} (#${d.id})`;
        location.hash = "contacto";
        toast(`Listo. Prellené el asunto con "${d.nombre}".`);
      }else if(btn.dataset.action==="view"){ openDog(d); }
    });
    grid.appendChild(card);
  }
}
document.querySelector("#contact-form").addEventListener("submit", async (e)=>{
  e.preventDefault();
  const name = document.querySelector("#c-name").value.trim();
  const email= document.querySelector("#c-email").value.trim();
  const msg  = document.querySelector("#c-message").value.trim();
  const subject=document.querySelector("#c-subject").value.trim();
  if(!name || !email || !msg) return toast("Completa nombre, correo y mensaje.","error");
  const ok = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);
  if(!ok) return toast("Correo inválido.","error");
  try{
    if(API_OK){
      await api("/api/contact", {method:"POST", body:JSON.stringify({name,email,subject,message:msg})});
    } else {
      const msgs = LS.get("rr_contacts", []);
      msgs.push({id:Date.now(),name,email,subject,message:msg,createdAt:new Date().toISOString()});
      LS.set("rr_contacts", msgs);
    }
    ["#c-name","#c-email","#c-subject","#c-message"].forEach(s=> document.querySelector(s).value="");
    toast("¡Mensaje enviado! Responderemos en 48 h hábiles.","success");
  }catch(err){ toast("No se pudo enviar. Intenta de nuevo.","error"); }
});
document.querySelector("#btn-donate-a").onclick = ()=> openDonation(200);
document.querySelector("#btn-donate-b").onclick = ()=> openDonation(300);
["#f-size","#f-age","#f-q"].forEach(sel=> document.querySelector(sel).addEventListener("input", renderDogs));
document.querySelector("#animal-form").addEventListener("submit", async (e)=>{
  e.preventDefault();
  const name = document.querySelector("#a-name").value.trim();
  const edad = document.querySelector("#a-age").value.trim();
  const tam  = document.querySelector("#a-size").value.trim();
  const img  = document.querySelector("#a-img").value.trim();
  const status = document.querySelector("#a-status").value.trim() || "Disponible";
  const desc = document.querySelector("#a-desc").value.trim();
  if(!name || !edad || !tam || !img || !desc) return toast("Completa todos los campos del animal.","error");
  const payload = { nombre:name, edad, tam, imageUrl:img, descripcion:desc, estado:status };
  try{
    if(API_OK){
      await api("/api/animals",{method:"POST", body:JSON.stringify(payload)});
    } else {
      const list = await apiGetAnimals();
      const nextId = Math.max(0, ...list.map(x=>x.id||0)) + 1;
      list.push({ id:nextId, nombre:name, edad, tam, estado:status, img, descripcion:desc });
      LS.set("rr_animals", list);
    }
    document.querySelector("#animal-form").reset();
    toast("Animal registrado.","success");
    renderDogs();
  }catch(err){ toast("No se pudo registrar. Intenta más tarde.","error"); }
});
document.querySelector("#a-cancel").addEventListener("click", ()=> document.querySelector("#animal-form").reset());
(function cookies(){
  if(localStorage.getItem("rrac_cookies_accepted")==="1") return;
  const banner = document.createElement("div");
  banner.className = "fixed inset-x-0 bottom-0 z-40";
  banner.innerHTML = `<div class="mx-auto max-w-6xl m-4 rounded-2xl border border-neutral-200 bg-white shadow-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div class="text-sm text-neutral-700">Usamos cookies propias para recordar tus preferencias. <span class="text-neutral-500">No vendemos tus datos.</span></div>
      <div class="flex items-center gap-3">
        <button id="cookies-accept" class="rounded-xl px-4 py-2 bg-neutral-900 text-white hover:bg-neutral-800">Aceptar</button>
        <a class="text-sm hover:underline" href="privacidad.html">Ver política</a>
      </div>
    </div>`;
  document.body.appendChild(banner);
  banner.querySelector("#cookies-accept").onclick = ()=>{ localStorage.setItem("rrac_cookies_accepted","1"); banner.remove(); };
})();
(async function init(){
  try{ const r = await fetch((API_BASE||"") + "/api/health", {cache:"no-store"}); API_OK = r.ok; }catch{ API_OK=false; }
  renderDogs();
})();
