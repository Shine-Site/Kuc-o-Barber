// CONFIGURAÇÃO RÁPIDA — altere a senha antes de publicar.
const ADMIN_PASSWORD = "1234";
const OPEN_HOUR = 9;       // 09:00
const CLOSE_HOUR = 19;     // último horário começa às 18:30
const SLOT_MINUTES = 30;
const CLOSED_DAYS = [0];   // 0 = domingo
const STORAGE_KEY = "kucaoBarberAppointments_v1";

const $ = (s) => document.querySelector(s);
const todayISO = () => { const d = new Date(); d.setMinutes(d.getMinutes()-d.getTimezoneOffset()); return d.toISOString().slice(0,10); };
const getAppointments = () => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; } };
const saveAppointments = (items) => localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
const pad = n => String(n).padStart(2,"0");
const formatDate = s => { if(!s) return ""; const [y,m,d]=s.split("-"); return `${d}/${m}/${y}`; };
const makeSlots = () => { const out=[]; for(let mins=OPEN_HOUR*60; mins<CLOSE_HOUR*60; mins+=SLOT_MINUTES) out.push(`${pad(Math.floor(mins/60))}:${pad(mins%60)}`); return out; };

$("#year").textContent = new Date().getFullYear();
const dateInput=$("#dateInput");
dateInput.min=todayISO();
dateInput.value=todayISO();

function renderSlots(){
  const date=dateInput.value, wrap=$("#slots"), chosen=$("#timeInput");
  chosen.value="";
  if(!date){wrap.innerHTML='<span class="muted">Escolha uma data para ver os horários.</span>';return;}
  const day=new Date(date+"T12:00:00").getDay();
  if(CLOSED_DAYS.includes(day)){wrap.innerHTML='<span class="muted">Não há atendimento nesta data. Escolha outro dia.</span>';return;}
  const booked=getAppointments().filter(a=>a.date===date && a.status!=="Cancelado").map(a=>a.time);
  wrap.innerHTML="";
  makeSlots().forEach(time=>{
    const b=document.createElement("button"); b.type="button"; b.className="slot"+(booked.includes(time)?" taken":""); b.textContent=time;
    b.disabled=booked.includes(time);
    b.addEventListener("click",()=>{document.querySelectorAll(".slot").forEach(x=>x.classList.remove("selected"));b.classList.add("selected");chosen.value=time;});
    wrap.appendChild(b);
  });
  if(!wrap.children.length) wrap.innerHTML='<span class="muted">Sem horários disponíveis.</span>';
}
dateInput.addEventListener("change",renderSlots); renderSlots();

$("#bookingForm").addEventListener("submit",e=>{
  e.preventDefault();
  const data=Object.fromEntries(new FormData(e.currentTarget).entries());
  if(!data.time){alert("Selecione um horário disponível.");return;}
  if(data.date<todayISO()){alert("Escolha uma data válida.");return;}
  const items=getAppointments();
  if(items.some(a=>a.date===data.date&&a.time===data.time&&a.status!=="Cancelado")){alert("Esse horário acabou de ser reservado. Escolha outro.");renderSlots();return;}
  const appointment={...data,id:(crypto.randomUUID?crypto.randomUUID():String(Date.now())),status:"Pendente",createdAt:new Date().toISOString()};
  items.push(appointment);saveAppointments(items);
  $("#successMessage").textContent=`${data.name}, seu pedido para ${formatDate(data.date)} às ${data.time} (${data.service}) foi registrado. A barbearia poderá confirmar seu horário pelo WhatsApp informado.`;
  $("#successModal").classList.remove("hidden");e.currentTarget.reset();dateInput.value=todayISO();renderSlots();
});
function closeSuccess(){ $("#successModal").classList.add("hidden"); }
$("#closeSuccess").addEventListener("click",closeSuccess);$("#doneBtn").addEventListener("click",closeSuccess);

function route(){
  const admin=location.hash==="#admin";
  document.querySelector("main").classList.toggle("hidden",admin);
  document.querySelector(".topbar").classList.toggle("hidden",admin);
  document.querySelector(".ticker").classList.toggle("hidden",admin);
  document.querySelector("footer").classList.toggle("hidden",admin);
  $("#adminView").classList.toggle("hidden",!admin);
}
window.addEventListener("hashchange",route);route();

$("#loginForm").addEventListener("submit",e=>{
  e.preventDefault();
  if($("#adminPassword").value===ADMIN_PASSWORD){sessionStorage.setItem("bhAdmin","1");$("#loginPanel").classList.add("hidden");$("#dashboard").classList.remove("hidden");renderDashboard();}
  else $("#loginError").textContent="Senha incorreta. Tente novamente.";
});
$("#logoutBtn").addEventListener("click",()=>{sessionStorage.removeItem("bhAdmin");$("#dashboard").classList.add("hidden");$("#loginPanel").classList.remove("hidden");$("#adminPassword").value="";});
if(location.hash==="#admin"&&sessionStorage.getItem("bhAdmin")==="1"){ $("#loginPanel").classList.add("hidden");$("#dashboard").classList.remove("hidden");renderDashboard(); }

function renderDashboard(){
  if(!$("#dashboard")||$("#dashboard").classList.contains("hidden"))return;
  const all=getAppointments();
  $("#totalCount").textContent=all.length;
  $("#pendingCount").textContent=all.filter(a=>a.status==="Pendente").length;
  $("#confirmedCount").textContent=all.filter(a=>a.status==="Confirmado").length;
  const date=$("#filterDate").value, q=$("#searchClient").value.toLowerCase();
  const rows=all.filter(a=>(!date||a.date===date)&&(!q||(a.name+" "+a.phone).toLowerCase().includes(q))).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
  const body=$("#appointmentsBody");body.innerHTML="";
  rows.forEach(a=>{
    const tr=document.createElement("tr");
    const vals=[`${formatDate(a.date)}<br><b>${a.time}</b>`,escapeHTML(a.name),escapeHTML(a.phone),escapeHTML(a.service),escapeHTML(a.notes||"—"),`<span class="status ${a.status.toLowerCase()}">${a.status}</span>`];
    vals.forEach((v,i)=>{const td=document.createElement("td");td.innerHTML=v;tr.appendChild(td);});
    const actions=document.createElement("td");
    if(a.status!=="Confirmado"){const c=document.createElement("button");c.className="action-btn";c.textContent="Confirmar";c.onclick=()=>updateStatus(a.id,"Confirmado");actions.appendChild(c);}
    if(a.status!=="Cancelado"){const c=document.createElement("button");c.className="action-btn";c.textContent="Cancelar";c.onclick=()=>updateStatus(a.id,"Cancelado");actions.appendChild(c);}
    const d=document.createElement("button");d.className="action-btn";d.textContent="Excluir";d.onclick=()=>{if(confirm("Excluir este agendamento?")){saveAppointments(getAppointments().filter(x=>x.id!==a.id));renderDashboard();}};actions.appendChild(d);
    tr.appendChild(actions);body.appendChild(tr);
  });
  $("#emptyState").classList.toggle("hidden",rows.length>0);
}
function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function updateStatus(id,status){const items=getAppointments();const item=items.find(x=>x.id===id);if(item)item.status=status;saveAppointments(items);renderDashboard();}
$("#filterDate").addEventListener("change",renderDashboard);$("#searchClient").addEventListener("input",renderDashboard);
$("#exportBtn").addEventListener("click",()=>{
  const rows=[["Data","Hora","Nome","WhatsApp","Serviço","Observação","Status"],...getAppointments().map(a=>[a.date,a.time,a.name,a.phone,a.service,a.notes,a.status])];
  const csv=rows.map(r=>r.map(v=>'"'+String(v??"").replace(/"/g,'""')+'"').join(";")).join("\n");
  const blob=new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8"});const url=URL.createObjectURL(blob);const link=document.createElement("a");link.href=url;link.download="agendamentos-kucao-barber.csv";link.click();URL.revokeObjectURL(url);
});
