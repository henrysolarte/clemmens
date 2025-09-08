/* auth.js – autenticación mejorada en el navegador */
const SESSION_KEY = "app.jwt";
const API_URL = window.__API_URL__ || "http://localhost:3002/api";

function setSession(user){ localStorage.setItem(SESSION_KEY, JSON.stringify(user)); }
function getSession(){ const r=localStorage.getItem(SESSION_KEY); if(!r) return null; try{return JSON.parse(r);}catch{localStorage.removeItem(SESSION_KEY);return null;} }
function clearSession(){ localStorage.removeItem(SESSION_KEY); }
function showError(el,msg){ if(el){ el.textContent=msg||""; el.style.display=msg?"block":"none"; el.classList.remove("d-none"); } }
function hideError(el){ if(el){ el.textContent=""; el.style.display="none"; el.classList.add("d-none"); } }
function isValidEmail(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
function borrarCarritoLocal(){ localStorage.removeItem("carrito"); }

async function apiLogin(email,password,signal){
  const res = await fetch(`${API_URL}/login`,{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({email,password}),
    credentials:"include",
    signal,
  });
  let data=null; try{ data=await res.json(); }catch{}
  if(!res.ok || data?.ok===false){
    const err=new Error(data?.error||data?.message||(res.status===401?"Credenciales inválidas.":"No se pudo iniciar sesión."));
    err.fieldErrors=data?.errors||null; throw err;
  }
  return data||{};
}

function attachLoginHandler(){
  const form=document.querySelector("#loginForm"); if(!form) return;
  form.setAttribute("novalidate","");
  const emailInput=form.querySelector("#email");
  const passInput=form.querySelector("#password");
  const errorBox=form.querySelector("#loginError");
  const submitBtn=form.querySelector('button[type="submit"]');

  const params=new URLSearchParams(window.location.search);
  if(params.get("registered")==="1"){
    const ok=document.createElement("div");
    ok.className="alert alert-success";
    ok.textContent="Cuenta creada. Ya puedes iniciar sesión.";
    form.insertAdjacentElement("beforebegin",ok);
  }

  const defaultRedirect=form.dataset.redirect||"index.html";
  const nextParam=params.get("next");
  const redirectTo=nextParam?decodeURIComponent(nextParam):defaultRedirect;

  let inFlight=null;

  form.addEventListener("submit",async (e)=>{
    e.preventDefault();
    if(inFlight) inFlight.abort();
    inFlight=new AbortController();

    hideError(errorBox);
    [emailInput,passInput].forEach(el=>{ el?.classList.remove("is-invalid"); el?.removeAttribute("aria-invalid"); });

    const email=(emailInput?.value||"").trim();
    const password=(passInput?.value||""); // sin trim

    let valid=true;
    if(!isValidEmail(email)){ markInvalid(emailInput,"Correo no válido."); valid=false; }
    if(!password){ markInvalid(passInput,"Ingresa tu contraseña."); valid=false; }
    if(!valid){ showError(errorBox,"Revisa tus datos."); return; }

    setLoading(submitBtn,true);
    try{
      const data=await apiLogin(email,password,inFlight.signal);
      if(data?.token||data?.user){ setSession({token:data.token,user:data.user}); }
      borrarCarritoLocal();
      window.location.assign(redirectTo);
    }catch(err){
      if(err.name==="AbortError") return;
      if(err.fieldErrors&&typeof err.fieldErrors==="object"){
        if(err.fieldErrors.email) markInvalid(emailInput,err.fieldErrors.email);
        if(err.fieldErrors.password) markInvalid(passInput,err.fieldErrors.password);
      }else{
        markInvalid(passInput,"Credenciales inválidas.");
      }
      showError(errorBox,err.message||"No se pudo iniciar sesión.");
    }finally{
      setLoading(submitBtn,false);
      inFlight=null;
    }
  });

  function markInvalid(inputEl,message){
    if(!inputEl) return;
    inputEl.classList.add("is-invalid");
    inputEl.setAttribute("aria-invalid","true");
    const fb=inputEl.nextElementSibling;
    if(fb&&fb.classList.contains("invalid-feedback")) fb.textContent=message;
  }
  function setLoading(btn,loading){
    if(!btn) return;
    btn.disabled=loading;
    btn.dataset.originalText ??= btn.textContent;
    btn.textContent=loading?"Accediendo...":btn.dataset.originalText;
  }
}

function requireAuth(opts={}){
  const s=getSession();
  if(!s||!s.token){
    const loginPage=opts.loginUrl||"/login.html";
    const next=encodeURIComponent(window.location.pathname+window.location.search);
    window.location.replace(`${loginPage}?next=${next}`); return;
  }
  const el=document.querySelector("[data-user-name]");
  if(el) el.textContent=s.user?.name||s.user?.email||"Usuario";
}
function logout(redirectTo="/login.html"){ clearSession(); window.location.assign(redirectTo); }

window.Auth={requireAuth,logout,getSession};
document.addEventListener("DOMContentLoaded",attachLoginHandler);
