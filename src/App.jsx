import React, { useEffect, useState } from 'react'
import { Link, NavLink, Route, Routes, useNavigate, useLocation } from 'react-router-dom'
import { ArrowRight, BatteryCharging, Bike, CheckCircle2, ChevronDown, CircleHelp, ClipboardList, Gauge, Heart, LayoutDashboard, LogOut, Menu, MessageSquare, Search, Settings, ShieldCheck, SlidersHorizontal, Sparkles, Upload, Users, X, Zap } from 'lucide-react'
import { isConfigured, requireSupabase, supabase } from './lib/supabase'

const money = n => new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(Number(n||0))
const fallback = 'https://inc42.com/cdn-cgi/image/quality=90/https://asset.inc42.com/2025/02/EV-sales-January-760x570.jpg';
const demoCards = [
 {id:'sample1',brand:'Ather',model:'450X',year:2023,price:85000,odometer_km:8500,battery_capacity:'3.7 kWh',claimed_range_km:100,colour:'Grey',condition:'Excellent',status:'available',vehicle_type:'scooter',image_urls:[fallback],description:'Example layout only. Replace this sample with an actual, inspected vehicle.'},
 {id:'sample2',brand:'Ola',model:'S1 Pro',year:2022,price:72000,odometer_km:12000,battery_capacity:'3.9 kWh',claimed_range_km:120,colour:'Blue',condition:'Good',status:'available',vehicle_type:'scooter',image_urls:[fallback],description:'Example layout only. Replace this sample with an actual, inspected vehicle.'},
 {id:'sample3',brand:'TVS',model:'iQube',year:2022,price:65000,odometer_km:10500,battery_capacity:'3.0 kWh',claimed_range_km:100,colour:'Blue',condition:'Good',status:'available',vehicle_type:'scooter',image_urls:[fallback],description:'Example layout only. Replace this sample with an actual, inspected vehicle.'}
]

function Notice({message,onClose}) { if(!message) return null; return <div className="notice" role="status">{message}<button onClick={onClose} aria-label="Dismiss"><X size={16}/></button></div> }
function SiteHeader({settings}) {
 const [menu,setMenu]=useState(false)
 return <header className="site-header"><Link className="wordmark" to="/"><span className="brand-symbol"><Zap size={22}/></span><span>{settings?.business_name||'Bhabireev'}<small>E-MOBILITY</small></span></Link>
 <button className="mobile-menu icon-button" onClick={()=>setMenu(!menu)} aria-label="Toggle navigation">{menu?<X/>:<Menu/>}</button>
 <nav className={menu?'site-nav open':'site-nav'}><a href="/#inventory" onClick={()=>setMenu(false)}>Explore EVs</a><a href="/#why" onClick={()=>setMenu(false)}>Why us</a><a href="/#contact" onClick={()=>setMenu(false)}>Contact</a><Link className="button button-dark nav-cta" to="/owner/login">Owner login <ArrowRight size={15}/></Link></nav></header>
}
function Footer({settings}) {const phone1=settings?.contact_phone||'9607799171';const phone2=settings?.whatsapp_number||'9607121117';const email=settings?.contact_email||'bhabireparshva5@gmail.com';return <footer className="footer"><div className="footer-main"><Link className="wordmark" to="/"><span className="brand-symbol"><Zap size={22}/></span><span>{settings?.business_name||'Bhabireev'}<small>E-MOBILITY</small></span></Link><p>{settings?.tagline||'Premium pre-owned electric two-wheelers.'}{settings?.location?` · ${settings.location}`:''}</p><div className="footer-links"><a href="/#inventory">Browse vehicles</a><a href={`tel:${phone1}`}>{phone1}</a><a href={`tel:${phone2}`}>{phone2}</a><a href={`mailto:${email}`}>{email}</a><Link to="/owner/login">Owner access</Link></div></div><div className="footer-bottom">© {new Date().getFullYear()} {settings?.business_name||'Bhabireev E-Mobility'}. Vehicle details must be confirmed before purchase.</div></footer>}

function VehicleCard({ v, onEnquire }) {
  const [saved, setSaved] = useState(false)
  const [activePhoto, setActivePhoto] = useState(0)
  const [viewerOpen, setViewerOpen] = useState(false)

  const photos = (Array.isArray(v.image_urls) ? v.image_urls : []).filter(
    url => typeof url === 'string' && url.trim()
  )
  const gallery = photos.length ? photos : [fallback]
  const currentPhoto = gallery[activePhoto] || gallery[0]

  function previousPhoto() {
    setActivePhoto(i => (i - 1 + gallery.length) % gallery.length)
  }

  function nextPhoto() {
    setActivePhoto(i => (i + 1) % gallery.length)
  }

  useEffect(() => {
    if (!viewerOpen) return

    const handleKey = e => {
      if (e.key === 'Escape') setViewerOpen(false)
      if (e.key === 'ArrowLeft') previousPhoto()
      if (e.key === 'ArrowRight') nextPhoto()
    }

    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [viewerOpen, gallery.length])

  return (
    <>
      <article className="vehicle-card">
        <div className="vehicle-image vehicle-gallery">
          <img
            className="vehicle-main-photo"
            src={currentPhoto}
            alt={`${v.brand} ${v.model} - photo ${activePhoto + 1}`}
            loading="lazy"
            onError={e => {
              e.currentTarget.onerror = null
              e.currentTarget.src = fallback
            }}
            onClick={() => setViewerOpen(true)}
          />

          <span className="vehicle-chip">
            {v.condition || 'Pre-owned'}
          </span>

          <button
            type="button"
            className={`heart ${saved ? 'selected' : ''}`}
            aria-label="Save vehicle"
            onClick={() => setSaved(!saved)}
          >
            <Heart size={17} fill={saved ? 'currentColor' : 'none'} />
          </button>

          {gallery.length > 1 && (
            <>
              <button
                type="button"
                className="gallery-arrow gallery-prev"
                aria-label="Previous photo"
                onClick={previousPhoto}
              >
                ‹
              </button>

              <button
                type="button"
                className="gallery-arrow gallery-next"
                aria-label="Next photo"
                onClick={nextPhoto}
              >
                ›
              </button>
            </>
          )}

          <button
            type="button"
            className="gallery-count"
            onClick={() => setViewerOpen(true)}
          >
            {activePhoto + 1} / {gallery.length} · View photos
          </button>
        </div>

        {gallery.length > 1 && (
          <div className="vehicle-thumbnails">
            {gallery.map((url, index) => (
              <button
                type="button"
                key={`${url}-${index}`}
                className={`vehicle-thumbnail ${
                  activePhoto === index ? 'active' : ''
                }`}
                onClick={() => setActivePhoto(index)}
                aria-label={`View photo ${index + 1}`}
                aria-pressed={activePhoto === index}
              >
                <img
                  src={url}
                  alt={`Vehicle thumbnail ${index + 1}`}
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}

        <div className="vehicle-content">
          <div className="vehicle-title">
            <div>
              <h3>{v.brand} {v.model}</h3>
              <p>
                {v.year} ·{' '}
                {v.vehicle_type === 'bike'
                  ? 'Electric bike'
                  : 'Electric scooter'}
              </p>
            </div>
            <span className="available-dot">Available</span>
          </div>

          <div className="vehicle-price">{money(v.price)}</div>

          <div className="vehicle-specs">
            <span>
              <Gauge size={15} />
              {Number(v.odometer_km || 0).toLocaleString('en-IN')} km
            </span>
            <span>
              <BatteryCharging size={15} />
              {v.battery_capacity || 'Battery details N/A'}
            </span>
            <span>
              <Zap size={15} />
              {v.claimed_range_km
                ? `${v.claimed_range_km} km claimed`
                : 'Range not listed'}
            </span>
          </div>

          <button
            className="button button-green full"
            onClick={() => onEnquire(v)}
          >
            Enquire about this EV <ArrowRight size={16} />
          </button>
        </div>
      </article>

      {viewerOpen && (
        <div
          className="photo-viewer-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={`${v.brand} ${v.model} photo gallery`}
          onMouseDown={e => {
            if (e.target === e.currentTarget) setViewerOpen(false)
          }}
        >
          <section className="photo-viewer">
            <header className="photo-viewer-header">
              <div>
                <strong>{v.brand} {v.model}</strong>
                <span>
                  Photo {activePhoto + 1} of {gallery.length}
                </span>
              </div>

              <button
                type="button"
                className="photo-viewer-close"
                onClick={() => setViewerOpen(false)}
                aria-label="Close gallery"
              >
                <X size={24} />
              </button>
            </header>

            <div className="photo-viewer-stage">
              {gallery.length > 1 && (
                <button
                  type="button"
                  className="viewer-arrow"
                  onClick={previousPhoto}
                  aria-label="Previous photo"
                >
                  ‹
                </button>
              )}

              <img
                src={currentPhoto}
                alt={`${v.brand} ${v.model} photo ${activePhoto + 1}`}
                onError={e => {
                  e.currentTarget.onerror = null
                  e.currentTarget.src = fallback
                }}
              />

              {gallery.length > 1 && (
                <button
                  type="button"
                  className="viewer-arrow"
                  onClick={nextPhoto}
                  aria-label="Next photo"
                >
                  ›
                </button>
              )}
            </div>

            <div className="photo-viewer-thumbnails">
              {gallery.map((url, index) => (
                <button
                  type="button"
                  key={`${url}-${index}`}
                  className={activePhoto === index ? 'active' : ''}
                  onClick={() => setActivePhoto(index)}
                  aria-label={`View photo ${index + 1}`}
                >
                  <img src={url} alt={`Photo ${index + 1}`} />
                </button>
              ))}
            </div>
          </section>
        </div>
      )}
    </>
  )
}

function EnquiryDialog({vehicle,settings,onClose}) {
 const [form,setForm]=useState({name:'',phone:'',email:'',preferred_colour:vehicle?.colour||'',message:''}),[busy,setBusy]=useState(false),[note,setNote]=useState('')
 useEffect(()=>{setForm(f=>({...f,preferred_colour:vehicle?.colour||''}));setNote('')},[vehicle])
 async function submit(e){e.preventDefault();setBusy(true);setNote('');try{const db=requireSupabase();const {error}=await db.from('enquiries').insert({customer_name:form.name.trim(),phone:form.phone.trim(),email:form.email.trim()||null,vehicle_id:vehicle?.id?.startsWith('sample')?null:(vehicle?.id||null),vehicle_label:vehicle?`${vehicle.brand} ${vehicle.model}`:'General enquiry',preferred_colour:form.preferred_colour||null,message:form.message.trim()||null});if(error)throw error;setNote(settings?.enquiry_success_message||'Thank you. Your enquiry has been received.');setForm({name:'',phone:'',email:'',preferred_colour:'',message:''})}catch(err){setNote(err.message||'Enquiry could not be sent. Please try again later.')}finally{setBusy(false)}}
 return <div className="dialog-backdrop" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><section className="dialog"><div className="dialog-head"><div><span className="eyebrow">{settings?.enquiry_eyebrow||"Let's talk"}</span><h2>{vehicle?.brand||vehicle?.model?`${settings?.enquiry_title||'Enquire about'} ${vehicle.brand} ${vehicle.model}`:`${settings?.enquiry_title||'Enquire about'} an electric ride`}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close"><X/></button></div>{!isConfigured&&<div className="inline-alert">Online enquiries are disabled until you connect Supabase. Follow the setup guide to enable secure online submissions.</div>}{note&&<div className="inline-alert">{note}</div>}<form className="form-grid" onSubmit={submit}><label>{settings?.enquiry_name_label||'Your name'} *<input required maxLength="100" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label><label>{settings?.enquiry_phone_label||'Mobile number'} *<input required minLength="10" maxLength="16" pattern="[0-9 +()-]{10,16}" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></label><label>{settings?.enquiry_email_label||'Email (optional)'}<input type="email" maxLength="254" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label><label>{settings?.enquiry_colour_label||'Preferred colour'}<input maxLength="60" value={form.preferred_colour} onChange={e=>setForm({...form,preferred_colour:e.target.value})}/></label><label className="span-2">{settings?.enquiry_message_label||'Message'}<textarea rows="4" maxLength="2000" placeholder={settings?.enquiry_message_placeholder||'Ask about battery health, documents, inspection, or a viewing…'} value={form.message} onChange={e=>setForm({...form,message:e.target.value})}/></label><div className="span-2"><button className="button button-green full" disabled={busy||!isConfigured}>{busy?'Sending…':(settings?.enquiry_submit_text||'Send enquiry securely')} <ArrowRight size={16}/></button><p className="form-note">Please avoid sending identity documents or payment details through this form.</p></div></form></section></div>
}
function Home({settings}) {
 const [vehicles,setVehicles]=useState([]),[loading,setLoading]=useState(true),[q,setQ]=useState(''),[kind,setKind]=useState('all'),[budget,setBudget]=useState('all'),[enquire,setEnquire]=useState(null),[error,setError]=useState('')
 useEffect(()=>{let alive=true;async function get(){if(!isConfigured){setVehicles(demoCards);setLoading(false);return}try{const {data,error}=await supabase.from('vehicles').select('*').eq('status','available').eq('published',true).order('created_at',{ascending:false});if(error)throw error;if(alive)setVehicles(data||[])}catch(e){if(alive)setError('We could not load listings. Please refresh or try again later.')}finally{if(alive)setLoading(false)}}get();return()=>{alive=false}},[])
 const shown=vehicles.filter(v=>`${v.brand} ${v.model}`.toLowerCase().includes(q.toLowerCase())&&(kind==='all'||v.vehicle_type===kind)&&(budget==='all'||Number(v.price)<=Number(budget)))
 return <><SiteHeader settings={settings}/><main><section className="hero container"><div className="hero-copy"><span className="eyebrow"><span className="eyebrow-line"/> Curated electric mobility</span><h1>{settings?.hero_title||'Your next ride. Electrified.'}</h1><p>{settings?.hero_description||'Discover thoughtfully selected pre-owned electric scooters and bikes. Explore the details, ask the right questions, and find a ride that feels right for you.'}</p><div className="hero-actions"><a href="#inventory" className="button button-green">Explore available EVs <ArrowRight size={17}/></a><a href="#why" className="button button-ghost">Our approach</a></div><div className="hero-proof"><span><ShieldCheck size={17}/> Clear vehicle details</span><span><CheckCircle2 size={17}/> Buyer-first support</span></div></div><div className="hero-visual"><img src={fallback} alt="Electric two-wheeler lifestyle photograph"/><div className="visual-card"><span className="visual-icon"><Zap size={19}/></span><div><b>Move with purpose.</b><small>Make your next ride electric.</small></div></div><div className="vertical-label">BHABIREEV · ELECTRIC, REIMAGINED</div></div></section>
 <section className="trust-strip"><div className="container trust-items"><span><BatteryCharging/> EV details that matter</span><span><ShieldCheck/> Transparency first</span><span><Heart/> Personal buying support</span><span><Bike/> Two-wheelers only</span></div></section>
 <section className="section container" id="inventory"><div className="section-heading"><div><span className="eyebrow">The collection</span><h2>Find your kind of electric.</h2><p>Browse available listings and compare the essentials before you enquire.</p></div><span className="listing-count">{loading?'Loading…':`${shown.length} available ${shown.length===1?'ride':'rides'}`}</span></div><div className="filter-bar"><div className="search-field"><Search size={18}/><input placeholder="Search brand or model" value={q} onChange={e=>setQ(e.target.value)}/></div><select aria-label="Vehicle type" value={kind} onChange={e=>setKind(e.target.value)}><option value="all">All two-wheelers</option><option value="scooter">Electric scooters</option><option value="bike">Electric bikes</option></select><select aria-label="Budget" value={budget} onChange={e=>setBudget(e.target.value)}><option value="all">Any budget</option><option value="50000">Up to ₹50,000</option><option value="75000">Up to ₹75,000</option><option value="100000">Up to ₹1,00,000</option><option value="150000">Up to ₹1,50,000</option></select><span className="filter-icon"><SlidersHorizontal size={17}/> Refine</span></div>{!isConfigured&&<div className="inline-alert">Preview mode: these example listings are illustrative. Connect Supabase and add real inventory in the owner dashboard before publishing.</div>}{error&&<div className="inline-alert">{error}</div>}{loading?<div className="loading-grid"><div/><div/><div/></div>:shown.length?<div className="vehicle-grid">{shown.map(v=><VehicleCard key={v.id} v={v} onEnquire={setEnquire}/>)}</div>:<div className="empty-state"><Bike size={30}/><h3>No matching rides just yet</h3><p>Try changing your search or budget.</p></div>}</section>
 <section className="why-section" id="why"><div className="container"><div className="section-heading"><div><span className="eyebrow">A more considered way to buy</span><h2>Good decisions start<br/>with better information.</h2></div><p className="why-intro">Used EVs deserve more than a price tag. We make space for the practical details buyers need to ask informed questions.</p></div><div className="benefit-grid"><article><div className="benefit-icon"><BatteryCharging/></div><h3>Battery-first thinking</h3><p>Battery capacity and claimed range are clearly shown when supplied. A battery health claim should only be made when supported by a real test or report.</p></article><article><div className="benefit-icon"><ClipboardList/></div><h3>Condition in context</h3><p>Vehicle descriptions can disclose service history, charger availability, visible damage, and known defects without hiding the details.</p></article><article><div className="benefit-icon"><ShieldCheck/></div><h3>Clear buyer communication</h3><p>Ask about a listing directly. Confirm documents, ownership, battery condition, and vehicle status before any payment.</p></article></div></div></section>
 <section className="contact-band container" id="contact"><div className="contact-copy"><span className="eyebrow">{settings?.contact_eyebrow||'Personal EV buying support'}</span><h2>{settings?.contact_title||'Find your next electric ride.'}</h2><p>{settings?.contact_description||'Questions about battery health, condition or a test ride? Talk directly to Bhabireev E-Mobility.'}</p><div className="contact-details"><a href={`tel:${settings?.contact_phone||'9607799171'}`}><span>{settings?.contact_phone_label||'CALL US'}</span><b>{settings?.contact_phone||'9607799171'}</b></a><a href={`https://wa.me/91${(settings?.whatsapp_number||'9607121117').replace(/\D/g,'').replace(/^91/,'')}`} target="_blank" rel="noreferrer"><span>{settings?.contact_whatsapp_label||'WHATSAPP'}</span><b>{settings?.whatsapp_number||'9607121117'}</b></a><a href={`mailto:${settings?.contact_email||'bhabireparshva5@gmail.com'}`}><span>{settings?.contact_email_label||'EMAIL'}</span><b>{settings?.contact_email||'bhabireparshva5@gmail.com'}</b></a></div></div><button className="button button-cream contact-cta" onClick={()=>setEnquire({brand:'',model:'',id:null,colour:''})}>{settings?.contact_cta_text||'Send an enquiry'} <ArrowRight size={17}/></button></section></main><Footer settings={settings}/>{enquire&&<EnquiryDialog vehicle={enquire} settings={settings} onClose={()=>setEnquire(null)}/>}</>
}
function Auth({onSession}) {
 const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[busy,setBusy]=useState(false),[message,setMessage]=useState('')
 async function submit(e){e.preventDefault();setBusy(true);setMessage('');try{const db=requireSupabase();const {data,error}=await db.auth.signInWithPassword({email:email.trim(),password});if(error)throw error;onSession(data.session)}catch(err){setMessage(err.message||'Sign in failed. Check your credentials.')}finally{setBusy(false)}}
 return <div className="auth-page"><Link className="wordmark auth-brand" to="/"><span className="brand-symbol"><Zap size={22}/></span><span>Bhabireev<small>E-MOBILITY</small></span></Link><section className="auth-card"><div className="auth-symbol"><ShieldCheck size={25}/></div><span className="eyebrow">Private owner access</span><h1>Welcome back.</h1><p>Sign in to manage your inventory, enquiries, and website content.</p>{!isConfigured&&<div className="inline-alert">Setup required: connect Supabase using the instructions in SETUP.md. There is no hard-coded demo password.</div>}{message&&<div className="inline-alert">{message}</div>}<form onSubmit={submit}><label>Email address<input type="email" required autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Password<input type="password" required autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)}/></label><button className="button button-green full" disabled={busy||!isConfigured}>{busy?'Signing in…':'Sign in securely'} <ArrowRight size={16}/></button></form><p className="auth-foot"><ShieldCheck size={14}/> Owner accounts are created in Supabase by the project owner. Public sign-up is not provided.</p><Link to="/" className="back-home">← Back to customer website</Link></section><p className="auth-copyright">BHABIREEV E-MOBILITY · PRIVATE ADMINISTRATION</p></div>
}
const navGroups=[{title:'WORKSPACE',items:[['overview','Overview',LayoutDashboard],['inventory','Vehicle inventory',Bike],['enquiries','Customer enquiries',MessageSquare]]},{title:'BUSINESS',items:[['reports','Reports & analytics',ClipboardList],['settings','Website settings',Settings]]}]
function AdminLayout({session,onLogout}) {
 const [tab,setTab]=useState('overview'),[vehicles,setVehicles]=useState([]),[enquiries,setEnquiries]=useState([]),[settings,setSettings]=useState(null),[busy,setBusy]=useState(true),[notice,setNotice]=useState(''),[showForm,setShowForm]=useState(false),[editing,setEditing]=useState(null),[mobile,setMobile]=useState(false),[search,setSearch]=useState('')
 async function refresh(){if(!isConfigured)return;setBusy(true);try{const db=requireSupabase();const [{data:v,error:ve},{data:e,error:ee},{data:s,error:se}]=await Promise.all([db.from('vehicles').select('*').order('created_at',{ascending:false}),db.from('enquiries').select('*').order('created_at',{ascending:false}),db.from('site_settings').select('*').eq('id',1).maybeSingle()]);if(ve)throw ve;if(ee)throw ee;if(se)throw se;setVehicles(v||[]);setEnquiries(e||[]);setSettings(s||{})}catch(err){setNotice(err.message||'Could not load dashboard data.')}finally{setBusy(false)}}
 useEffect(()=>{refresh()},[])
 async function logout(){await supabase.auth.signOut();onLogout()}
 async function changeVehicleStatus(v,status){try{const {error}=await requireSupabase().from('vehicles').update({status}).eq('id',v.id);if(error)throw error;await refresh();setNotice('Vehicle status updated.')}catch(e){setNotice(e.message)}}
 async function deleteVehicle(v){if(!confirm(`Permanently delete ${v.brand} ${v.model}?`))return;try{const {error}=await requireSupabase().from('vehicles').delete().eq('id',v.id);if(error)throw error;await refresh();setNotice('Vehicle deleted.')}catch(e){setNotice(e.message)}}
 async function saveVehicle(data){try{const db=requireSupabase();let result;if(data.id){const {id,...rest}=data;result=await db.from('vehicles').update(rest).eq('id',id)}else{const {id,...rest}=data;result=await db.from('vehicles').insert(rest)}if(result.error)throw result.error;setShowForm(false);setEditing(null);await refresh();setNotice('Vehicle saved successfully.')}catch(e){setNotice(e.message)}}
 async function saveSettings(data){try{const {error}=await requireSupabase().from('site_settings').upsert({id:1,...data,updated_at:new Date().toISOString()});if(error)throw error;await refresh();setNotice('Website settings saved.')}catch(e){setNotice(e.message)}}
 async function updateEnquiry(e,status){try{const {error}=await requireSupabase().from('enquiries').update({status}).eq('id',e.id);if(error)throw error;await refresh();setNotice('Enquiry updated.')}catch(err){setNotice(err.message)}}
 function exportCsv(){const cols=['brand','model','vehicle_type','year','price','odometer_km','battery_capacity','claimed_range_km','colour','condition','status'];const rows=[cols.join(','),...vehicles.map(v=>cols.map(k=>`"${String(v[k]??'').replaceAll('"','""')}"`).join(','))];const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([rows.join('\n')],{type:'text/csv'}));a.download='bhabireev-inventory.csv';a.click();URL.revokeObjectURL(a.href)}
 const available=vehicles.filter(v=>v.status==='available'),reserved=vehicles.filter(v=>v.status==='reserved'),sold=vehicles.filter(v=>v.status==='sold')
 const filtered=vehicles.filter(v=>`${v.brand} ${v.model}`.toLowerCase().includes(search.toLowerCase()))
 return <div className="admin-shell"><aside className={'admin-sidebar '+(mobile?'mobile-open':'')}><Link to="/" className="wordmark admin-brand"><span className="brand-symbol"><Zap size={20}/></span><span>Bhabireev<small>OWNER STUDIO</small></span></Link><div className="admin-account"><div className="avatar">{(session.user.email||'O').slice(0,1).toUpperCase()}</div><div><b>Website owner</b><small>{session.user.email}</small></div></div>{navGroups.map(g=><div className="nav-group" key={g.title}><span>{g.title}</span>{g.items.map(([id,label,Icon])=><button key={id} className={tab===id?'active':''} onClick={()=>{setTab(id);setMobile(false)}}><Icon size={17}/>{label}{id==='enquiries'&&enquiries.some(e=>e.status==='new')?<i>{enquiries.filter(e=>e.status==='new').length}</i>:null}</button>)}</div>)}<div className="sidebar-bottom"><Link to="/" target="_blank"><ArrowRight size={15}/> View customer website</Link><button onClick={logout}><LogOut size={15}/> Sign out</button></div></aside><main className="admin-main"><header className="admin-topbar"><button className="icon-button admin-menu" onClick={()=>setMobile(!mobile)}><Menu/></button><div className="breadcrumb">Workspace <span>/</span> <b>{navGroups.flatMap(g=>g.items).find(x=>x[0]===tab)?.[1]}</b></div><div className="topbar-right"><span className="secure-label"><ShieldCheck size={15}/> Secure session</span><div className="avatar small">{(session.user.email||'O').slice(0,1).toUpperCase()}</div></div></header><div className="admin-content"><Notice message={notice} onClose={()=>setNotice('')}/>{busy?<div className="loading-panel">Loading your secure business records…</div>:<>
 {tab==='overview'&&<><div className="page-title-row"><div><span className="eyebrow">YOUR BUSINESS AT A GLANCE</span><h1>Good {new Date().getHours()<12?'morning':new Date().getHours()<18?'afternoon':'evening'}.</h1><p>Here is what is happening with your EV marketplace.</p></div><button className="button button-green" onClick={()=>{setEditing(null);setShowForm(true)}}>＋ Add vehicle</button></div><div className="metric-grid"><Metric icon={Bike} label="Total inventory" value={vehicles.length} sub="All listings"/><Metric icon={CheckCircle2} label="Available" value={available.length} sub="Visible to customers"/><Metric icon={MessageSquare} label="New enquiries" value={enquiries.filter(e=>e.status==='new').length} sub="Awaiting follow-up"/><Metric icon={IndianRupeeIcon} label="Available asking value" value={money(available.reduce((s,v)=>s+Number(v.price||0),0))} sub="Not sales revenue"/></div><div className="admin-panels"><section className="admin-panel panel-wide"><div className="panel-heading"><div><h2>Inventory overview</h2><p>Availability across your listings</p></div><button className="subtle-button" onClick={()=>setTab('inventory')}>Manage inventory <ArrowRight size={14}/></button></div><div className="status-bars">{[['Available',available.length,'#B38B55'],['Reserved',reserved.length,'#C5A46D'],['Sold',sold.length,'#8B8B96']].map(([label,n,color])=><div className="status-bar-row" key={label}><div><span>{label}</span><b>{n}</b></div><div className="status-track"><span style={{width:`${vehicles.length?Math.max(4,n/vehicles.length*100):0}%`,background:color}}/></div></div>)}</div><div className="chart-area"><div className="chart-label">Inventory distribution <span>Current snapshot</span></div><div className="donut-wrap"><div className="donut" style={{background:`conic-gradient(#B38B55 0 ${vehicles.length?available.length/vehicles.length*100:0}%, #C5A46D ${vehicles.length?available.length/vehicles.length*100:0}% ${vehicles.length?(available.length+reserved.length)/vehicles.length*100:0}%, #E5E1DA ${vehicles.length?(available.length+reserved.length)/vehicles.length*100:0}% 100%)`}}><div><b>{vehicles.length}</b><small>vehicles</small></div></div><div className="donut-legend"><span><i style={{background:'#B38B55'}}/> Available <b>{available.length}</b></span><span><i style={{background:'#C5A46D'}}/> Reserved <b>{reserved.length}</b></span><span><i style={{background:'#E5E1DA'}}/> Sold <b>{sold.length}</b></span></div></div></div></section><section className="admin-panel"><div className="panel-heading"><div><h2>Latest enquiries</h2><p>Recent customer interest</p></div><button className="subtle-button" onClick={()=>setTab('enquiries')}>View all <ArrowRight size={14}/></button></div>{enquiries.slice(0,5).map(e=><div className="recent-enquiry" key={e.id}><div className="enquiry-avatar">{(e.customer_name||'?').slice(0,1).toUpperCase()}</div><div className="recent-enquiry-text"><b>{e.customer_name}</b><span>{e.vehicle_label||'General enquiry'}</span></div><span className={'status-pill '+e.status}>{e.status}</span></div>)}{!enquiries.length&&<div className="empty-small">No customer enquiries yet.</div>}</section></div><section className="admin-panel recent-inventory"><div className="panel-heading"><div><h2>Recently added vehicles</h2><p>Your latest inventory updates</p></div><button className="subtle-button" onClick={()=>setTab('inventory')}>Full inventory <ArrowRight size={14}/></button></div><InventoryTable vehicles={vehicles.slice(0,5)} onStatus={changeVehicleStatus} onEdit={v=>{setEditing(v);setShowForm(true)}} onDelete={deleteVehicle}/></section></>}
 {tab==='inventory'&&<><div className="page-title-row"><div><span className="eyebrow">LISTINGS & VEHICLE DETAILS</span><h1>Vehicle inventory</h1><p>Add, update, publish, reserve, or mark vehicles as sold.</p></div><button className="button button-green" onClick={()=>{setEditing(null);setShowForm(true)}}>＋ Add vehicle</button></div><div className="inventory-toolbar"><div className="search-field"><Search size={17}/><input placeholder="Search brand or model…" value={search} onChange={e=>setSearch(e.target.value)}/></div><button className="button button-light" onClick={exportCsv}>Export CSV ↓</button></div><section className="admin-panel"><InventoryTable vehicles={filtered} onStatus={changeVehicleStatus} onEdit={v=>{setEditing(v);setShowForm(true)}} onDelete={deleteVehicle}/></section></>}
 {tab==='enquiries'&&<><div className="page-title-row"><div><span className="eyebrow">CUSTOMER RELATIONSHIPS</span><h1>Customer enquiries</h1><p>Keep track of buyer questions and follow-ups.</p></div><span className="count-chip">{enquiries.length} total</span></div><section className="admin-panel"><div className="table-scroll"><table className="data-table"><thead><tr><th>Customer</th><th>Vehicle / colour</th><th>Contact</th><th>Message</th><th>Status</th><th>Received</th></tr></thead><tbody>{enquiries.map(e=><tr key={e.id}><td><b>{e.customer_name}</b><small>{e.email||'No email supplied'}</small></td><td>{e.vehicle_label||'General enquiry'}<small>{e.preferred_colour||'Any colour'}</small></td><td>{e.phone}</td><td className="message-cell">{e.message||'—'}</td><td><select className="status-select" value={e.status} onChange={ev=>updateEnquiry(e,ev.target.value)}>{['new','contacted','negotiating','converted','closed'].map(s=><option key={s}>{s}</option>)}</select></td><td>{e.created_at?new Date(e.created_at).toLocaleDateString('en-IN'):'—'}</td></tr>)}</tbody></table>{!enquiries.length&&<div className="empty-small">No enquiries yet. New customer messages will appear here.</div>}</div></section></>}
 {tab==='reports'&&<><div className="page-title-row"><div><span className="eyebrow">BUSINESS PERFORMANCE</span><h1>Reports & analytics</h1><p>Current inventory and enquiry metrics, based on your live database.</p></div><button className="button button-light" onClick={exportCsv}>Export inventory CSV ↓</button></div><div className="metric-grid"><Metric icon={Bike} label="Total listings" value={vehicles.length} sub="Current inventory"/><Metric icon={CheckCircle2} label="Sold listings" value={sold.length} sub="Marked as sold"/><Metric icon={MessageSquare} label="Total enquiries" value={enquiries.length} sub="All time in database"/><Metric icon={Users} label="Converted enquiries" value={enquiries.filter(e=>e.status==='converted').length} sub="Marked by owner"/></div><div className="admin-panels"><section className="admin-panel"><h2>Listing status</h2><div className="report-list">{[['Available',available.length],['Reserved',reserved.length],['Sold',sold.length]].map(([name,n])=><div key={name}><span>{name}</span><b>{n}</b></div>)}</div></section><section className="admin-panel"><h2>Asking value (not revenue)</h2><div className="report-big">{money(available.reduce((s,v)=>s+Number(v.price||0),0))}</div><p className="muted">Combined asking price of available vehicles. This does not represent money received or profit.</p><div className="report-list"><div><span>Average asking price</span><b>{available.length?money(available.reduce((s,v)=>s+Number(v.price||0),0)/available.length):money(0)}</b></div><div><span>Enquiry conversion</span><b>{enquiries.length?Math.round(enquiries.filter(e=>e.status==='converted').length/enquiries.length*100):0}%</b></div></div></section></div><p className="muted report-disclaimer">Charts and totals reflect records currently stored in your connected Supabase project. Historical sales/profit reports require recording actual transaction values and dates.</p></>}
 {tab==='settings'&&<SettingsPage settings={settings||{}} onSave={saveSettings}/>}
 </>}</div></main>{showForm&&<VehicleEditor vehicle={editing} onClose={()=>{setShowForm(false);setEditing(null)}} onSave={saveVehicle}/>}</div>
}
function IndianRupeeIcon(){return <span style={{fontWeight:800,fontSize:20}}>₹</span>}
function Metric({icon:Icon,label,value,sub}){return <div className="metric-card"><div className="metric-top"><span>{label}</span><span className="metric-icon"><Icon size={18}/></span></div><strong>{value}</strong><small>{sub}</small></div>}
function InventoryTable({vehicles,onStatus,onEdit,onDelete}){return <div className="table-scroll"><table className="data-table"><thead><tr><th>Vehicle</th><th>Price</th><th>Year / km</th><th>Status</th><th>Actions</th></tr></thead><tbody>{vehicles.map(v=><tr key={v.id}><td><div className="vehicle-cell"><img src={v.image_urls?.[0]||fallback} alt="" onError={e=>e.currentTarget.src=fallback}/><div><b>{v.brand} {v.model}</b><small>{v.vehicle_type==='bike'?'Electric bike':'Electric scooter'} · {v.colour||'Colour not set'}</small></div></div></td><td><b>{money(v.price)}</b></td><td>{v.year}<small>{Number(v.odometer_km||0).toLocaleString('en-IN')} km</small></td><td><select className="status-select" value={v.status} onChange={e=>onStatus(v,e.target.value)}><option value="available">Available</option><option value="reserved">Reserved</option><option value="sold">Sold</option></select></td><td><div className="table-actions"><button onClick={()=>onEdit(v)}>Edit</button><button className="danger-action" onClick={()=>onDelete(v)}>Delete</button></div></td></tr>)}</tbody></table>{!vehicles.length&&<div className="empty-small">No vehicles here yet. Use “Add vehicle” to create your first listing.</div>}</div>}
function VehicleEditor({vehicle,onClose,onSave}) {
 const [data,setData]=useState({brand:'',model:'',vehicle_type:'scooter',year:new Date().getFullYear(),price:'',odometer_km:'',battery_capacity:'',claimed_range_km:'',colour:'',condition:'Good',status:'available',battery_health_status:'Not tested',description:'',published:true,image_urls:[],...(vehicle||{})}),[files,setFiles]=useState([]),[busy,setBusy]=useState(false),[error,setError]=useState('')
 function update(k,v){setData(d=>({...d,[k]:v}))}
 async function uploadPhotos(db){let urls=[...(data.image_urls||[])];for(const file of files){const ext=file.name.split('.').pop().toLowerCase().replace(/[^a-z0-9]/g,'')||'jpg';const path=`${crypto.randomUUID()}.${ext}`;const {error}=await db.storage.from('vehicle-photos').upload(path,file,{upsert:false,contentType:file.type});if(error)throw error;const {data:publicData}=db.storage.from('vehicle-photos').getPublicUrl(path);urls.push(publicData.publicUrl)}return urls}
 async function submit(e){e.preventDefault();setBusy(true);setError('');try{const db=requireSupabase();const image_urls=await uploadPhotos(db);await onSave({...data,year:Number(data.year),price:Number(data.price),odometer_km:Number(data.odometer_km||0),claimed_range_km:Number(data.claimed_range_km||0),image_urls})}catch(err){setError(err.message||'Could not save vehicle.')}finally{setBusy(false)}}
 return <div className="dialog-backdrop" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><section className="dialog wide-dialog"><div className="dialog-head"><div><span className="eyebrow">INVENTORY MANAGEMENT</span><h2>{vehicle?'Edit vehicle listing':'Add a vehicle listing'}</h2></div><button className="icon-button" onClick={onClose}><X/></button></div>{error&&<div className="inline-alert">{error}</div>}<form className="form-grid editor-form" onSubmit={submit}><label>Brand *<input required maxLength="80" value={data.brand} onChange={e=>update('brand',e.target.value)}/></label><label>Model *<input required maxLength="100" value={data.model} onChange={e=>update('model',e.target.value)}/></label><label>Vehicle type<select value={data.vehicle_type} onChange={e=>update('vehicle_type',e.target.value)}><option value="scooter">Electric scooter</option><option value="bike">Electric bike</option></select></label><label>Year *<input type="number" required min="2000" max={new Date().getFullYear()+1} value={data.year} onChange={e=>update('year',e.target.value)}/></label><label>Asking price (₹) *<input type="number" required min="0" max="10000000" value={data.price} onChange={e=>update('price',e.target.value)}/></label><label>Kilometres travelled<input type="number" min="0" max="2000000" value={data.odometer_km} onChange={e=>update('odometer_km',e.target.value)}/></label><label>Battery capacity<input maxLength="60" placeholder="e.g. 3.7 kWh" value={data.battery_capacity||''} onChange={e=>update('battery_capacity',e.target.value)}/></label><label>Claimed range (km)<input type="number" min="0" max="2000" value={data.claimed_range_km} onChange={e=>update('claimed_range_km',e.target.value)}/></label><label>Colour<input maxLength="60" value={data.colour||''} onChange={e=>update('colour',e.target.value)}/></label><label>Condition<select value={data.condition||'Good'} onChange={e=>update('condition',e.target.value)}>{['Excellent','Good','Fair','Needs inspection'].map(x=><option key={x}>{x}</option>)}</select></label><label>Battery health<select value={data.battery_health_status||'Not tested'} onChange={e=>update('battery_health_status',e.target.value)}>{['Not tested','Tested','Report available'].map(x=><option key={x}>{x}</option>)}</select></label><label>Listing status<select value={data.status||'available'} onChange={e=>update('status',e.target.value)}><option value="available">Available</option><option value="reserved">Reserved</option><option value="sold">Sold</option></select></label><label className="span-2">Vehicle photos<input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={e=>{const selected=[...e.target.files];if(selected.some(f=>f.size>5*1024*1024)){setError('Each photo must be 5 MB or smaller.');e.target.value='';return}if(selected.length+(data.image_urls||[]).length>8){setError('Maximum 8 photos per listing.');e.target.value='';return}setFiles(selected);setError('')}}/><small>JPG, PNG or WebP · up to 5 MB each · maximum 8 photos per listing. Uploaded files use the public vehicle photo bucket.</small><div className="photo-strip">{(data.image_urls||[]).map((url,i)=><div key={url} className="photo-thumb"><img src={url} alt="Vehicle"/><button type="button" onClick={()=>update('image_urls',data.image_urls.filter((_,j)=>i!==j))}>×</button></div>)}{files.map((f,i)=><div key={f.name+i} className="photo-thumb"><img src={URL.createObjectURL(f)} alt={f.name}/><span>New</span></div>)}</div></label><label className="span-2">Description / known defects<textarea rows="4" maxLength="5000" value={data.description||''} onChange={e=>update('description',e.target.value)} placeholder="Service history, charger included, known damage, inspection details…"/></label><label className="checkbox-label span-2"><input type="checkbox" checked={Boolean(data.published)} onChange={e=>update('published',e.target.checked)}/> Publish this listing on the customer website</label><div className="span-2 form-end"><button type="button" className="button button-light" onClick={onClose}>Cancel</button><button type="submit" className="button button-green" disabled={busy}>{busy?'Saving…':'Save listing'} <ArrowRight size={16}/></button></div></form></section></div>
}
function SettingsPage({settings,onSave}){const [data,setData]=useState({business_name:settings.business_name||'Bhabireev E-Mobility',tagline:settings.tagline||'Premium pre-owned electric two-wheelers.',contact_email:settings.contact_email||'bhabireparshva5@gmail.com',contact_phone:settings.contact_phone||'9607799171',whatsapp_number:settings.whatsapp_number||'9607121117',location:settings.location||'Sangli, Maharashtra, India',hero_title:settings.hero_title||'Your next ride. Electrified.',hero_description:settings.hero_description||'Discover thoughtfully selected pre-owned electric scooters and bikes.',accent_colour:settings.accent_colour||'#B38B55',background_colour:settings.background_colour||'#F5F2EC',surface_colour:settings.surface_colour||'#FFFEFC',dark_colour:settings.dark_colour||'#171A24',text_colour:settings.text_colour||'#20232D',contact_eyebrow:settings.contact_eyebrow||'Personal EV buying support',contact_title:settings.contact_title||'Find your next electric ride.',contact_description:settings.contact_description||'Questions about battery health, condition or a test ride? Talk directly to Bhabireev E-Mobility.',contact_cta_text:settings.contact_cta_text||'Send an enquiry',contact_phone_label:settings.contact_phone_label||'CALL US',contact_whatsapp_label:settings.contact_whatsapp_label||'WHATSAPP',contact_email_label:settings.contact_email_label||'EMAIL',enquiry_eyebrow:settings.enquiry_eyebrow||"Let's talk",enquiry_title:settings.enquiry_title||'Enquire about',enquiry_name_label:settings.enquiry_name_label||'Your name',enquiry_phone_label:settings.enquiry_phone_label||'Mobile number',enquiry_email_label:settings.enquiry_email_label||'Email (optional)',enquiry_colour_label:settings.enquiry_colour_label||'Preferred colour',enquiry_message_label:settings.enquiry_message_label||'Message',enquiry_message_placeholder:settings.enquiry_message_placeholder||'Ask about battery health, documents, inspection, or a viewing…',enquiry_submit_text:settings.enquiry_submit_text||'Send enquiry securely',enquiry_success_message:settings.enquiry_success_message||'Thank you. Your enquiry has been received.'}),[busy,setBusy]=useState(false);useEffect(()=>{setData(current=>({...current,...settings,accent_colour:settings.accent_colour||current.accent_colour||'#B38B55',background_colour:settings.background_colour||current.background_colour||'#F5F2EC',surface_colour:settings.surface_colour||current.surface_colour||'#FFFEFC',dark_colour:settings.dark_colour||current.dark_colour||'#171A24',text_colour:settings.text_colour||current.text_colour||'#20232D'}))},[settings]);function set(k,v){setData(d=>({...d,[k]:v}))}async function submit(e){e.preventDefault();setBusy(true);await onSave(data);setBusy(false)}return <><div className="page-title-row"><div><span className="eyebrow">MAKE IT YOURS</span><h1>Website settings</h1><p>Customise the business information displayed on your website.</p></div></div><section className="admin-panel settings-panel"><div className="panel-heading"><div><h2>Business identity</h2><p>Brand and contact details</p></div><Settings size={20}/></div><form className="form-grid" onSubmit={submit}><label>Business name<input required maxLength="100" value={data.business_name} onChange={e=>set('business_name',e.target.value)}/></label><label>Tagline<input maxLength="180" value={data.tagline} onChange={e=>set('tagline',e.target.value)}/></label><label>Contact email<input type="email" maxLength="254" value={data.contact_email} onChange={e=>set('contact_email',e.target.value)}/></label><label>Contact phone<input maxLength="20" value={data.contact_phone} onChange={e=>set('contact_phone',e.target.value)}/></label><label>WhatsApp number<input maxLength="20" value={data.whatsapp_number} onChange={e=>set('whatsapp_number',e.target.value)}/></label><label>Business location<input maxLength="180" value={data.location} onChange={e=>set('location',e.target.value)}/></label><label className="span-2">Homepage headline<input maxLength="180" value={data.hero_title} onChange={e=>set('hero_title',e.target.value)}/></label><label className="span-2">Homepage description<textarea rows="3" maxLength="600" value={data.hero_description} onChange={e=>set('hero_description',e.target.value)}/></label><div className="span-2 theme-editor"><h3>Contact section content</h3><p>Edit the Contact Us section and the labels shown for your phone, WhatsApp and email.</p><div className="form-grid"><label>Small heading<input maxLength="100" value={data.contact_eyebrow} onChange={e=>set('contact_eyebrow',e.target.value)}/></label><label>Contact section title<input maxLength="180" value={data.contact_title} onChange={e=>set('contact_title',e.target.value)}/></label><label className="span-2">Contact description<textarea rows="3" maxLength="600" value={data.contact_description} onChange={e=>set('contact_description',e.target.value)}/></label><label>Enquiry button text<input maxLength="80" value={data.contact_cta_text} onChange={e=>set('contact_cta_text',e.target.value)}/></label><label>Phone label<input maxLength="40" value={data.contact_phone_label} onChange={e=>set('contact_phone_label',e.target.value)}/></label><label>WhatsApp label<input maxLength="40" value={data.contact_whatsapp_label} onChange={e=>set('contact_whatsapp_label',e.target.value)}/></label><label>Email label<input maxLength="40" value={data.contact_email_label} onChange={e=>set('contact_email_label',e.target.value)}/></label></div></div><div className="span-2 theme-editor"><h3>Enquiry form content</h3><p>Change the enquiry popup heading, field labels, message hint, submit button and confirmation message.</p><div className="form-grid"><label>Small heading<input maxLength="100" value={data.enquiry_eyebrow} onChange={e=>set('enquiry_eyebrow',e.target.value)}/></label><label>Form title<input maxLength="180" value={data.enquiry_title} onChange={e=>set('enquiry_title',e.target.value)}/></label><label>Name field label<input maxLength="80" value={data.enquiry_name_label} onChange={e=>set('enquiry_name_label',e.target.value)}/></label><label>Phone field label<input maxLength="80" value={data.enquiry_phone_label} onChange={e=>set('enquiry_phone_label',e.target.value)}/></label><label>Email field label<input maxLength="80" value={data.enquiry_email_label} onChange={e=>set('enquiry_email_label',e.target.value)}/></label><label>Colour field label<input maxLength="80" value={data.enquiry_colour_label} onChange={e=>set('enquiry_colour_label',e.target.value)}/></label><label>Message field label<input maxLength="80" value={data.enquiry_message_label} onChange={e=>set('enquiry_message_label',e.target.value)}/></label><label>Submit button text<input maxLength="80" value={data.enquiry_submit_text} onChange={e=>set('enquiry_submit_text',e.target.value)}/></label><label className="span-2">Message placeholder<textarea rows="2" maxLength="300" value={data.enquiry_message_placeholder} onChange={e=>set('enquiry_message_placeholder',e.target.value)}/></label><label className="span-2">Success message<textarea rows="2" maxLength="300" value={data.enquiry_success_message} onChange={e=>set('enquiry_success_message',e.target.value)}/></label></div></div><div className="span-2 theme-editor"><h3>Website colours</h3><p>Choose colours for your public website. Changes apply after saving and refreshing.</p><div className="theme-colour-grid"><label>Brand accent<div className="colour-input"><input type="color" value={data.accent_colour} onChange={e=>set('accent_colour',e.target.value)}/><code>{data.accent_colour}</code></div></label><label>Page background<div className="colour-input"><input type="color" value={data.background_colour} onChange={e=>set('background_colour',e.target.value)}/><code>{data.background_colour}</code></div></label><label>Cards and panels<div className="colour-input"><input type="color" value={data.surface_colour} onChange={e=>set('surface_colour',e.target.value)}/><code>{data.surface_colour}</code></div></label><label>Dark sections<div className="colour-input"><input type="color" value={data.dark_colour} onChange={e=>set('dark_colour',e.target.value)}/><code>{data.dark_colour}</code></div></label><label>Main text<div className="colour-input"><input type="color" value={data.text_colour} onChange={e=>set('text_colour',e.target.value)}/><code>{data.text_colour}</code></div></label></div></div><div className="span-2 form-end"><button className="button button-green" disabled={busy}>{busy?'Saving…':'Save website settings'} <ArrowRight size={16}/></button></div></form></section><div className="inline-alert settings-note"><ShieldCheck size={17}/> Settings are stored in your connected database. To prevent unauthorised changes, database policies restrict updates to the owner account.</div></>}
export default function App(){const [session,setSession]=useState(null),[authLoading,setAuthLoading]=useState(true),[settings,setSettings]=useState({business_name:'Bhabireev E-Mobility',tagline:'Premium pre-owned electric two-wheelers.',contact_email:'bhabireparshva5@gmail.com',contact_phone:'9607799171',whatsapp_number:'9607121117',location:'Sangli, Maharashtra, India',hero_title:'Electric. Elevated. Yours.',hero_description:'Discover carefully selected pre-owned electric scooters and bikes, with the details you need to choose your next ride confidently.',accent_colour:'#B38B55',background_colour:'#F5F2EC',surface_colour:'#FFFEFC',dark_colour:'#171A24',text_colour:'#20232D',contact_eyebrow:'Personal EV buying support',contact_title:'Find your next electric ride.',contact_description:'Questions about battery health, condition or a test ride? Talk directly to Bhabireev E-Mobility.',contact_cta_text:'Send an enquiry',contact_phone_label:'CALL US',contact_whatsapp_label:'WHATSAPP',contact_email_label:'EMAIL',enquiry_eyebrow:"Let's talk",enquiry_title:'Enquire about',enquiry_name_label:'Your name',enquiry_phone_label:'Mobile number',enquiry_email_label:'Email (optional)',enquiry_colour_label:'Preferred colour',enquiry_message_label:'Message',enquiry_message_placeholder:'Ask about battery health, documents, inspection, or a viewing…',enquiry_submit_text:'Send enquiry securely',enquiry_success_message:'Thank you. Your enquiry has been received.'}),loc=useLocation();useEffect(()=>{if(!isConfigured){setAuthLoading(false);return}supabase.auth.getSession().then(({data})=>{setSession(data.session);setAuthLoading(false)});const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,s)=>setSession(s));return()=>subscription.unsubscribe()},[]);useEffect(()=>{if(!isConfigured)return;supabase.from('site_settings').select('*').eq('id',1).maybeSingle().then(({data})=>data&&setSettings(current=>({...current,...data})))},[loc.pathname]);useEffect(()=>{const root=document.documentElement;root.style.setProperty('--site-background',settings.background_colour||'#F5F2EC');root.style.setProperty('--site-surface',settings.surface_colour||'#FFFEFC');root.style.setProperty('--site-dark',settings.dark_colour||'#171A24');root.style.setProperty('--site-text',settings.text_colour||'#20232D');root.style.setProperty('--site-accent',settings.accent_colour||'#B38B55')},[settings]);if(loc.pathname.startsWith('/owner')&&authLoading)return <div className="full-loader">Preparing secure owner access…</div>;return <><style>{`
:root{--site-background:#F5F2EC;--site-surface:#FFFEFC;--site-dark:#171A24;--site-text:#20232D;--site-accent:#B38B55}
body{background:var(--site-background);color:var(--site-text)}
.site-header,.footer,.contact-band{background:var(--site-dark)!important}
.hero,.section,.why-section{background-color:var(--site-background)}
.vehicle-card,.admin-panel,.metric-card,.auth-card,.dialog,.settings-panel{background-color:var(--site-surface)}
.button-green,.brand-symbol{background-color:var(--site-accent)!important;border-color:var(--site-accent)!important}
.eyebrow,.vehicle-price{color:var(--site-accent)}
.theme-editor{border:1px solid rgba(23,26,36,.12);border-radius:16px;padding:18px;margin-top:8px;background:var(--site-background)}
.theme-editor h3{margin:0 0 6px}.theme-editor p{margin:0 0 16px;color:#777;font-size:.9rem}.theme-colour-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.theme-colour-grid label{min-width:0}.colour-input{display:flex;align-items:center;gap:10px;margin-top:8px}.colour-input input[type=color]{width:54px;height:42px;padding:3px;border:1px solid #ddd;border-radius:8px;background:white;cursor:pointer}.colour-input code{font-size:.85rem}
@media(max-width:640px){.theme-colour-grid{grid-template-columns:1fr}}
`}</style><Routes><Route path="/" element={<Home settings={settings}/>}/><Route path="/owner/login" element={session?<NavigateToDashboard/>:<Auth onSession={setSession}/>}/><Route path="/owner/*" element={session?<AdminLayout session={session} onLogout={()=>setSession(null)}/>:<Auth onSession={setSession}/>}/><Route path="*" element={<Home settings={settings}/>}/></Routes></>}
function NavigateToDashboard(){return <RedirectDashboard/>}
function RedirectDashboard(){const nav=useNavigate();useEffect(()=>nav('/owner/dashboard',{replace:true}),[nav]);return <div className="full-loader">Opening owner workspace…</div>}
