import { useState, useRef, useEffect } from "react";
import { db, auth } from "./firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  setDoc,
  getDoc
} from "firebase/firestore";
import { signInWithEmailAndPassword } from "firebase/auth";
const DEFAULT_BUSINESS = {
  name: "Happy Car Bazaar",
  tagline: "Your Trusted Used Car Dealership",
  logo: "🚗",
  logoImg: null, // base64 image when uploaded
  address: "Near Sapa Karyalay, In Front of Dwarika Palace, Saidpur",
  city: "Uttar Pradesh 233304",
  phone: "+91 90447 92800",
  whatsapp: "919044792800",
  instagram: "happycarbazaar",
  email: "happycarbazaar@gmail.com",
  hours: "Every Day: 10:00 AM – 6:00 PM",
  googleMapsLink: "https://maps.app.goo.gl/rGGE3mLhHaWVHn6WA",
  accentColor: "#E83E5A",
  taglineSub: "Certified Pre-Owned Vehicles | Flexible Finance | Free Test Drives",
};

const DEFAULT_CARS = [
  { id:1, name:"Toyota Camry",   year:2022, price:450000, mileage:"18,400", fuel:"Petrol",  transmission:"Automatic", category:"Sedan",  color:"Pearl White",   badge:"HOT DEAL",   featured:true,  description:"One-owner, full service history, excellent condition inside and out." },
  { id:2, name:"Honda CR-V",     year:2021, price:580000, mileage:"22,100", fuel:"Hybrid",  transmission:"CVT",       category:"SUV",    color:"Midnight Black", badge:"NEW IN",     featured:true,  description:"Fuel-efficient hybrid SUV with panoramic sunroof and advanced safety." },
  { id:3, name:"Ford Mustang",   year:2020, price:720000, mileage:"14,200", fuel:"Petrol",  transmission:"Manual",    category:"Sports", color:"Race Red",       badge:"FEATURED",   featured:true,  description:"V8 muscle car in pristine condition. Turns heads wherever it goes." },
  { id:4, name:"Toyota RAV4",    year:2023, price:620000, mileage:"9,800",  fuel:"Hybrid",  transmission:"Automatic", category:"SUV",    color:"Jungle Green",   badge:"CERTIFIED",  featured:false, description:"Nearly new RAV4 hybrid with full Toyota certification and warranty." },
  { id:5, name:"BMW 3 Series",   year:2021, price:850000, mileage:"28,000", fuel:"Petrol",  transmission:"Automatic", category:"Luxury", color:"Alpine White",   badge:"LUXURY",     featured:false, description:"German engineering at its finest. Sport package, leather interior." },
  { id:6, name:"Hyundai Tucson", year:2022, price:520000, mileage:"16,500", fuel:"Diesel",  transmission:"Automatic", category:"SUV",    color:"Phantom Black",  badge:"VALUE PICK", featured:false, description:"Loaded with features. BOSE audio, wireless charging, lane-keep assist." },
];

const DEFAULT_POSTS = [
  { id:1, title:"Grand Opening Sale — Up to 15% Off!", body:"Visit Happy Car Bazaar this month and get special discounts on select vehicles. Limited time offer. Come visit us at Saidpur!", type:"offer", date:"2025-05-01", pinned:true },
  { id:2, title:"New Stock Arrived — 5 Fresh Cars!", body:"We have just added 5 brand new pre-owned vehicles to our lot. Come check them out — SUVs, Sedans & more available.", type:"update", date:"2025-04-28", pinned:false },
  { id:3, title:"Now Open on Sundays!", body:"Happy Car Bazaar is now open every day of the week from 10 AM to 6 PM. Come visit us any day at your convenience!", type:"news", date:"2025-04-20", pinned:false },
];

const CAT_EMOJI = { Sedan:"🚗", SUV:"🚙", Sports:"🏎️", Luxury:"✨", Hatchback:"🚘", Truck:"🛻", Electric:"⚡" };
const BADGE_CLR = { "HOT DEAL":"#E53E3E","NEW IN":"#3182CE","FEATURED":"#C9A84C","CERTIFIED":"#38A169","LUXURY":"#805AD5","VALUE PICK":"#DD6B20" };
const POST_TYPE_CLR = { offer:"#E53E3E", update:"#3182CE", news:"#38A169", event:"#805AD5" };
const POST_TYPE_ICON = { offer:"🏷️", update:"🚗", news:"📢", event:"🎉" };
const getCarImages = car => Array.isArray(car.images) ? car.images : [];
const getImageSrc = image => typeof image === "string" ? image : image?.src;
const getPrimaryCarImage = car => getImageSrc(getCarImages(car)[0]) || null;
const getWhatsAppUrl = number => `https://wa.me/${String(number||"").replace(/\D/g,"")}`;
const getInstagramUrl = value => {
  const raw = String(value||"").trim();
  if (!raw) return "https://instagram.com/";
  if (/^https?:\/\//i.test(raw)) return raw;
  const handle = raw.replace(/^@/,"").replace(/^instagram\.com\//i,"").replace(/^www\.instagram\.com\//i,"").replace(/\/$/,"");
  return `https://instagram.com/${handle}`;
};
const getInstagramHandle = value => {
  const raw = String(value||"").trim();
  if (!raw) return "";
  return raw.replace(/^https?:\/\/(www\.)?instagram\.com\//i,"").replace(/^@/,"").replace(/\/$/,"");
};

// ════════════════════════════════════════════════════════════════════
// ROOT
// ════════════════════════════════════════════════════════════════════
export default function App() {
  const isAdminRoute = window.location.search.includes("admin=true");

const [isLoggedIn, setIsLoggedIn] = useState(false);

const [view, setView] = useState(
  isAdminRoute ? "admin" : "website"
);
  const [cars, setCars] = useState([]);
  useEffect(() => {
  const fetchCars = async () => {
    const querySnapshot = await getDocs(collection(db, "cars"));

    const carsData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    setCars(carsData);
  };

  fetchCars();
}, []);

  const [biz,   setBiz]   = useState(DEFAULT_BUSINESS);
  const [bizForm, setBizForm] = useState(DEFAULT_BUSINESS);
  const [posts, setPosts] = useState(DEFAULT_POSTS);
  useEffect(() => {

  const loadBusiness = async () => {

    const docRef = doc(db, "settings", "business");

    const snap = await getDoc(docRef);

    if (snap.exists()) {

      setBiz(snap.data());
      setBizForm(snap.data());

    }

  };

  loadBusiness();

}, []);
  const acc = biz.accentColor;
  const saveBusinessSettings = async () => {

  const updatedData = {
    ...bizForm
  };

  await setDoc(
    doc(db, "settings", "business"),
    updatedData
  );

  setBiz(updatedData);

  setBizForm(updatedData);

  alert("Business settings saved!");

};

  return (
    <div
  style={{
    fontFamily:"'DM Sans',sans-serif",
    background:"#0A0A0A",
    minHeight:"100vh",
    width:"100vw",
    overflowX:"hidden",
    margin:0,
    padding:0
  }}
>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;}
        :root{--dark:#0A0A0A;--dark2:#111;--dark3:#1A1A1A;--cream:#F5F0E8;--cream2:#B8A98A;}
        .pf{font-family:'Playfair Display',serif;}
        .dm{font-family:'DM Sans',sans-serif;}
        input,textarea,select{font-family:'DM Sans',sans-serif;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes ticker{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        .fade-up{animation:fadeUp .55s ease forwards;}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#111}::-webkit-scrollbar-thumb{background:#2A2A2A}
        .phone-frame{width:375px;height:792px;background:#000;border-radius:44px;border:8px solid #1A1A1A;box-shadow:0 0 0 2px #333,0 32px 80px rgba(0,0,0,.85);overflow:hidden;}
        .phone-screen{width:100%;height:100%;overflow-y:auto;overflow-x:hidden;}
        .phone-screen::-webkit-scrollbar{display:none;}
        .tbl{width:100%;border-collapse:collapse;}
        .tbl th{background:#1A1A1A;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;padding:11px 14px;text-align:left;border-bottom:1px solid #2A2A2A;}
        .tbl td{padding:11px 14px;border-bottom:1px solid #1A1A1A;font-size:13px;color:#B8A98A;vertical-align:middle;}
        .tbl tr:hover td{background:#0D0D0D;}
        .overlay{position:fixed;inset:0;background:rgba(0,0,0,.9);z-index:500;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(8px);}
        .modal{background:#111;border:1px solid #2A2A2A;max-width:580px;width:100%;padding:36px;position:relative;max-height:92vh;overflow-y:auto;}
        label.lbl{display:block;font-size:10px;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;font-family:'DM Sans',sans-serif;}
        .atab{padding:9px 18px;background:transparent;border:1px solid #2A2A2A;color:#B8A98A;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;cursor:pointer;transition:all .2s;font-family:'DM Sans',sans-serif;}
        .upload-zone{border:2px dashed #333;padding:32px 20px;text-align:center;cursor:pointer;transition:border .2s;background:#0D0D0D;}
        .upload-zone:hover{border-color:#C9A84C;}
        @media(max-width:900px){.wg3{grid-template-columns:1fr 1fr!important}.wg2{grid-template-columns:1fr!important}.wfoot{grid-template-columns:1fr 1fr!important}}
        @media(max-width:600px){.wg3{grid-template-columns:1fr!important}.wfoot{grid-template-columns:1fr!important}.wnav-links{display:none!important}}
      `}</style>

      {/* TOP SWITCHER */}
      <div style={{ background:"#050505", borderBottom:"1px solid #1A1A1A", padding:"10px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <LogoDisplay biz={biz} size={30} radius={6} fontSize={15} />
          <span className="pf" style={{ color:"#F5F0E8", fontSize:14, fontWeight:700 }}>{biz.name}</span>
          
        </div>
        
      </div>

      {view==="website" && <WebsiteView cars={cars} biz={biz} posts={posts} />}
      {view==="admin" && (
  isLoggedIn ? (
    <AdminView
  cars={cars}
  setCars={setCars}

  biz={biz}
  setBiz={setBiz}

  bizForm={bizForm}
  setBizForm={setBizForm}

  posts={posts}
  setPosts={setPosts}

  saveBusinessSettings={saveBusinessSettings}
/>
  ) : (
    <div
      style={{
        background:"#000",
        color:"#fff",
        minHeight:"100vh",
        display:"flex",
        justifyContent:"center",
        alignItems:"center",
        flexDirection:"column",
        gap:"20px"
      }}
    >
      <h1>Admin Login</h1>
      <input
  type="email"
  id="adminEmail"
  placeholder="Admin Email"
/>
      <input
        type="password"
        placeholder="Enter Password"
        id="adminPass"
        style={{
          padding:"12px",
          width:"300px",
          background:"#111",
          border:"1px solid #333",
          color:"#fff"
        }}
      />

      <button
        onClick={async () => {
          

          try {

  await signInWithEmailAndPassword(
    auth,
    document.getElementById("adminEmail").value,
    document.getElementById("adminPass").value
  );

  setIsLoggedIn(true);

} catch (err) {

  alert("Invalid Email or Password");

}
        }}
        style={{
          padding:"12px 20px",
          background:"#E83E5A",
          border:"none",
          color:"#fff",
          cursor:"pointer"
        }}
      >
        Login
      </button>
    </div>
  )
)}
    </div>
  );
}

// ── Logo Display Component ──
function LogoDisplay({ biz, size=36, radius=4, fontSize=18 }) {
  const acc = biz.accentColor;
  if (biz.logoImg) {
    return <img src={biz.logoImg} alt="logo" style={{ width:size, height:size, borderRadius:radius, objectFit:"cover", border:`2px solid ${acc}` }} />;
  }
  return <div style={{ width:size, height:size, background:acc, display:"flex", alignItems:"center", justifyContent:"center", fontSize, borderRadius:radius, flexShrink:0 }}>{biz.logo}</div>;
}

// ── Shared UI ──
function Inp({ value, onChange, placeholder, type="text", rows, style={} }) {
  const base = { background:"#1A1A1A", border:"1px solid #333", color:"#F5F0E8", padding:"11px 13px", width:"100%", fontSize:13, outline:"none", fontFamily:"'DM Sans',sans-serif", ...style };
  return rows ? <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows} style={{ ...base, resize:"vertical" }} /> : <input type={type} value={value} onChange={onChange} placeholder={placeholder} style={base} />;
}
function Sel({ value, onChange, opts }) {
  return <select value={value} onChange={onChange} style={{ background:"#1A1A1A", border:"1px solid #333", color:"#F5F0E8", padding:"11px 13px", width:"100%", fontSize:13, outline:"none", fontFamily:"'DM Sans',sans-serif", appearance:"none" }}>{opts.map(o=><option key={o} value={o}>{o}</option>)}</select>;
}
function Field({ label, accentColor="#C9A84C", children }) {
  return <div><label className="lbl" style={{ color:accentColor }}>{label}</label>{children}</div>;
}
function SubHead({ label, title, accent="#C9A84C", center, titleColor="#F5F0E8" }) {
  return (
    <div style={{ textAlign:center?"center":undefined, marginBottom:32 }}>
      <div className="dm" style={{ fontSize:10, letterSpacing:4, color:accent, textTransform:"uppercase", marginBottom:10 }}>{label}</div>
      <h2 className="dm" style={{ fontSize:"clamp(24px,4vw,40px)", fontWeight:800, color:titleColor, letterSpacing:0 }}>{title}</h2>
      <div style={{ width:48, height:2, background:accent, marginTop:12, marginLeft:center?"auto":undefined, marginRight:center?"auto":undefined }} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// WEBSITE
// ════════════════════════════════════════════════════════════════════
function WebsiteView({ cars, biz, posts }) {
  const [page,   setPage]   = useState("home");
  const [filter, setFilter] = useState("All");
  const [modal,  setModal]  = useState(null);
  const [selCar, setSelCar] = useState(null);
  const [form,   setForm]   = useState({ name:"", email:"", phone:"", message:"", date:"" });
  const acc = biz.accentColor;
  const featured = cars.filter(c=>c.featured);
  const cats = ["All",...Array.from(new Set(cars.map(c=>c.category)))];
  const filtered = filter==="All" ? cars : cars.filter(c=>c.category===filter);
  const pinnedPosts = posts.filter(p=>p.pinned);
  const allPosts = [...posts].sort((a,b)=>b.id-a.id);
  const heroCar = featured[0] || cars[0];
  const heroImage = heroCar ? getPrimaryCarImage(heroCar) : null;
  const instagramHandle = getInstagramHandle(biz.instagram);
  const instagramUrl = getInstagramUrl(biz.instagram);
  const whatsappUrl = getWhatsAppUrl(biz.whatsapp);
  const purple = "#2B0048";
  const purple2 = "#5A1685";
  const lavender = "#F2EAF8";

  const G = ({children,onClick,style={}}) => <button onClick={onClick} style={{ background:acc,color:"#fff",border:"none",padding:"12px 28px",fontSize:12,fontWeight:800,letterSpacing:1.2,textTransform:"uppercase",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",transition:"all .2s",...style }}>{children}</button>;
  const O = ({children,onClick,style={}}) => <button onClick={onClick} style={{ background:"transparent",color:acc,border:`1.5px solid ${acc}`,padding:"11px 26px",fontSize:12,fontWeight:600,letterSpacing:1.5,textTransform:"uppercase",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",transition:"all .2s",...style }}>{children}</button>;
  const openDetails = car => { setSelCar(car); setModal("details"); };

  return (
    <div style={{ background:lavender, color:"#241033", minHeight:"100vh" }}>
      {/* NAV */}
      <div className="wnav-links" style={{ background:purple, borderBottom:"1px solid rgba(255,255,255,.12)", padding:"8px 32px", display:"flex", justifyContent:"space-between", alignItems:"center", gap:16, flexWrap:"wrap" }}>
        <div className="dm" style={{ color:"#D9C7E8", fontSize:11, letterSpacing:.4 }}>{biz.address}, {biz.city}</div>
        <div style={{ display:"flex", gap:18, alignItems:"center", flexWrap:"wrap" }}>
          <a href={`tel:${biz.phone}`} className="dm" style={{ color:"#F8FAFC", textDecoration:"none", fontSize:12, fontWeight:600 }}>{biz.phone}</a>
          <a href={whatsappUrl} target="_blank" rel="noreferrer" className="dm" style={{ color:"#fff", textDecoration:"none", fontSize:12, fontWeight:800 }}>WhatsApp</a>
          <a href={instagramUrl} target="_blank" rel="noreferrer" className="dm" style={{ color:acc, textDecoration:"none", fontSize:12, fontWeight:800 }}>Instagram</a>
          <span className="dm" style={{ color:"#D9C7E8", fontSize:11 }}>{biz.hours}</span>
        </div>
      </div>
      <nav style={{ position:"sticky", top:0, zIndex:50, background:purple, backdropFilter:"blur(20px)", borderBottom:"1px solid rgba(255,255,255,.14)", padding:"0 32px", height:72, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div onClick={()=>setPage("home")} style={{ cursor:"pointer", display:"flex", alignItems:"center", gap:12 }}>
          <LogoDisplay biz={biz} size={40} radius={8} fontSize={20} />
          <div>
            <div className="dm" style={{ fontSize:17, fontWeight:800, lineHeight:1, letterSpacing:.2, color:"#fff" }}>{biz.name}</div>
            <div className="dm" style={{ fontSize:9, letterSpacing:2.5, color:"#F4B5C1", marginTop:4 }}>{biz.tagline.toUpperCase()}</div>
          </div>
        </div>
        <div className="wnav-links" style={{ display:"flex", gap:30, alignItems:"center" }}>
          {["home","inventory","updates","about","contact"].map(p=>(
            <span key={p} onClick={()=>setPage(p)} className="dm" style={{ fontSize:12, letterSpacing:1.2, textTransform:"uppercase", color:page===p?acc:"#CBD5E1", cursor:"pointer", transition:"color .2s", fontWeight:600 }}>{p.charAt(0).toUpperCase()+p.slice(1)}</span>
          ))}
          <G onClick={()=>setModal("inquiry")} style={{ padding:"11px 22px", fontSize:11, borderRadius:3 }}>Enquire Now</G>
        </div>
      </nav>

      {/* TICKER */}
      <div style={{ background:purple2, overflow:"hidden", padding:"10px 0" }}>
        <div style={{ display:"inline-block", animation:"ticker 26s linear infinite", whiteSpace:"nowrap", fontSize:10, letterSpacing:2, color:"#fff", textTransform:"uppercase" }}>
          {Array(4).fill(`AVAILABLE STOCK · FINANCE OPTIONS · FREE TEST DRIVES · ${biz.taglineSub}  `).join("")}
        </div>
      </div>

      {/* ── HOME ── */}
      {page==="home" && <>
        {/* PINNED POST BANNER */}
        {pinnedPosts.length > 0 && (
          <div style={{ background:"#fff", borderBottom:"1px solid #E8DDF1", padding:"12px 32px", display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
            <span style={{ background:acc, color:"#fff", fontSize:9, fontWeight:700, letterSpacing:2, padding:"3px 8px" }}>📌 PINNED</span>
            <span className="dm" style={{ fontSize:13, color:purple, fontWeight:800 }}>{pinnedPosts[0].title}</span>
            <span className="dm" style={{ fontSize:12, color:"#6B5878" }}>— {pinnedPosts[0].body.slice(0,80)}...</span>
            <button onClick={()=>setPage("updates")} style={{ background:"transparent", color:acc, border:`1px solid ${acc}`, padding:"4px 12px", fontSize:10, letterSpacing:1, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontWeight:600, marginLeft:"auto" }}>Read More →</button>
          </div>
        )}

        {/* HERO */}
        <section style={{ minHeight:"78vh", display:"flex", alignItems:"center", background:heroImage?`linear-gradient(90deg,rgba(43,0,72,.92),rgba(43,0,72,.62),rgba(43,0,72,.2)),url(${heroImage}) center/cover`:`linear-gradient(135deg,${purple} 0%,${purple2} 58%,#7B1B8D 100%)`, position:"relative", overflow:"hidden", padding:"76px 32px 36px" }}>
          <div style={{ position:"absolute", inset:0, background:`radial-gradient(circle at 75% 18%,${acc}44,transparent 34%),linear-gradient(180deg,transparent 0%,rgba(43,0,72,.28) 100%)`, pointerEvents:"none" }} />
          <div style={{ position:"absolute", left:32, right:32, bottom:0, height:1, background:"rgba(255,255,255,.08)" }} />
          <div
  className="wg2"
  style={{
    width: "100%",
    padding: "0 40px",
    display: "grid",
    gridTemplateColumns: "1.05fr 0.95fr",
    gap: 56,
    alignItems: "center",
    position: "relative",
    zIndex: 1
  }}
>
            <div className="fade-up">
              <div className="dm" style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(255,255,255,.14)", border:"1px solid rgba(255,255,255,.24)", padding:"7px 11px", fontSize:10, letterSpacing:2.6, color:"#fff", textTransform:"uppercase", marginBottom:18 }}>Verified Used Cars</div>
              <h1 className="dm" style={{ fontSize:"clamp(34px,6vw,78px)", fontWeight:800, lineHeight:1.04, marginBottom:20, letterSpacing:0, color:"#fff" }}>
                Find a car that<br /><span style={{ color:"#fff" }}>fits your life.</span>
              </h1>
              <p className="dm" style={{ fontSize:15, color:"#F3EAF8", lineHeight:1.85, maxWidth:560, marginBottom:30 }}>{biz.name} offers inspected pre-owned vehicles, transparent pricing, quick enquiries, and test drives from our showroom at {biz.address.split(",")[0]}.</p>
              <div style={{ display:"flex", gap:12, flexWrap:"wrap", marginBottom:48 }}>
                <G onClick={()=>setPage("inventory")} style={{ borderRadius:4, padding:"14px 30px" }}>View Inventory</G>
                <O onClick={()=>setModal("testdrive")} style={{ borderRadius:4, padding:"13px 28px", color:"#F8FAFC", borderColor:"rgba(255,255,255,.5)" }}>Book Test Drive</O>
                <a href={whatsappUrl} target="_blank" rel="noreferrer" style={{ display:"flex", alignItems:"center", gap:8, background:"#fff", color:purple, padding:"14px 20px", fontSize:12, letterSpacing:1.2, textTransform:"uppercase", fontWeight:800, textDecoration:"none", fontFamily:"'DM Sans',sans-serif", borderRadius:10 }}>WhatsApp</a>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, maxWidth:560 }}>
                {[["100+","Vehicles"],["5,000+","Happy Buyers"],["10 Yrs","In Business"]].map(([n,l])=>(
                  <div key={l} style={{ background:"rgba(255,255,255,.14)", border:"1px solid rgba(255,255,255,.25)", padding:"15px 16px", borderRadius:14 }}>
                    <div className="dm" style={{ fontSize:25, fontWeight:800, color:"#fff" }}>{n}</div>
                    <div className="dm" style={{ fontSize:11, color:"#CBD5E1", letterSpacing:.8 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
            {heroCar && (
              <div style={{ background:"#fff", color:purple, border:"1px solid rgba(255,255,255,.35)", boxShadow:"0 28px 80px rgba(43,0,72,.28)", borderRadius:20, overflow:"hidden" }}>
                <div style={{ height:260, background:"#F7F0FB", position:"relative", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden" }}>
                  <span style={{ position:"absolute", top:14, left:14, background:BADGE_CLR[heroCar.badge]||"#333", display:"inline-block", padding:"5px 11px", fontSize:9, letterSpacing:1.6, color:"#fff", zIndex:2, fontWeight:700 }}>{heroCar.badge}</span>
                  {getPrimaryCarImage(heroCar) ? (
                    <img src={getPrimaryCarImage(heroCar)} alt={heroCar.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                  ) : (
                    <div style={{ width:"100%", height:"100%", background:"linear-gradient(145deg,#1F2937,#0F172A)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
                      <div style={{ fontSize:88, filter:"drop-shadow(0 18px 22px rgba(0,0,0,.35))" }}>{CAT_EMOJI[heroCar.category]||"🚗"}</div>
                      <div className="dm" style={{ fontSize:10, letterSpacing:2, color:"#CBD5E1", textTransform:"uppercase", marginTop:8 }}>Add photos from admin for real showroom images</div>
                    </div>
                  )}
                </div>
                <div style={{ padding:24 }}>
                  <div className="dm" style={{ fontSize:11, color:"#806593", letterSpacing:1.5, textTransform:"uppercase", marginBottom:6 }}>Featured vehicle</div>
                  <div className="dm" style={{ fontSize:24, fontWeight:800, color:purple, marginBottom:4 }}>{heroCar.year} {heroCar.name}</div>
                  <div className="dm" style={{ color:acc, fontSize:24, fontWeight:800, marginBottom:14 }}>₹{heroCar.price.toLocaleString()}</div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:18 }}>
                    {[heroCar.mileage+" km", heroCar.fuel, heroCar.transmission].map(t=><span key={t} style={{ background:"#F7F0FB", border:"1px solid #E8DDF1", padding:"8px 9px", fontSize:11, color:purple, textAlign:"center", fontWeight:700 }}>{t}</span>)}
                  </div>
                  <div style={{ display:"flex", gap:9 }}>
                    <G onClick={()=>openDetails(heroCar)} style={{ flex:1, borderRadius:4 }}>View Details</G>
                    <O onClick={()=>{setSelCar(heroCar);setModal("testdrive")}} style={{ flex:1, borderRadius:10, color:purple, borderColor:"#D8C4E8" }}>Test Drive</O>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* LATEST UPDATES on homepage */}
        {posts.length > 0 && (
          <section style={{ padding:"64px 32px", background:"#fff" }}>
            <div style={{ width:"100%", padding:"0 40px"}}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:32, flexWrap:"wrap", gap:12 }}>
                <SubHead label="Latest from Us" title="News & Updates" accent={acc} />
                <button onClick={()=>setPage("updates")} style={{ background:"transparent", color:acc, border:`1px solid ${acc}`, padding:"8px 18px", fontSize:11, fontWeight:600, letterSpacing:1.5, textTransform:"uppercase", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>View All →</button>
              </div>
              <div className="wg3" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:18 }}>
                {allPosts.slice(0,3).map(post=>(
                  <PostCard key={post.id} post={post} acc={acc} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* FEATURED CARS */}
        <section style={{ padding:"72px 32px", background:lavender }}>
          <div style={{ width:"100%", padding:"0 40px" }}>
            <SubHead label="Our Collection" title="Featured Vehicles" accent={acc} titleColor={purple} />
            <div className="wg3" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20 }}>
              {featured.slice(0,3).map(c=><CarCard key={c.id} car={c} acc={acc} onView={()=>openDetails(c)} onI={()=>{setSelCar(c);setModal("inquiry")}} onT={()=>{setSelCar(c);setModal("testdrive")}} />)}
            </div>
            <div style={{ textAlign:"center", marginTop:32 }}>
              <O onClick={()=>setPage("inventory")}>View All {cars.length} Cars →</O>
            </div>
          </div>
        </section>

        {/* WHY US — 7-day returns REMOVED, replaced with Finance */}
        <section style={{ padding:"72px 32px", background:"#fff" }}>
          <div style={{ width:"100%", padding:"0 40px"}}>
            <SubHead label="Why Choose Us" title={`The ${biz.name} Difference`} accent={acc} center titleColor={purple} />
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))", gap:20 }}>
              {[
                ["🔍","150-Point Inspection","Every vehicle passes our rigorous check. Zero hidden surprises, ever."],
                ["💰","No Hidden Fees","Transparent pricing. What you see is exactly what you pay."],
                ["🧪","Free Test Drives","Book online and feel the road before you decide to buy."],
                ["🏦","Easy Finance","Flexible finance options available for all types of buyers."],
              ].map(([icon,ttl,desc])=>(
                <div key={ttl} style={{ background:"#fff", border:"1px solid #E8DDF1", padding:26, transition:"border .3s", borderRadius:18, boxShadow:"0 18px 45px rgba(43,0,72,.08)" }} onMouseEnter={e=>e.currentTarget.style.borderColor=acc} onMouseLeave={e=>e.currentTarget.style.borderColor="#E8DDF1"}>
                  <div style={{ fontSize:32, marginBottom:12 }}>{icon}</div>
                  <div className="dm" style={{ fontSize:17, color:purple, fontWeight:800, marginBottom:8 }}>{ttl}</div>
                  <div className="dm" style={{ fontSize:13, color:"#6B5878", lineHeight:1.75 }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CONTACT STRIP */}
        <section style={{ padding:"64px 32px", background:lavender }}>
          <div style={{ width:"100%", padding:"0 40px" }}>
            <SubHead label="Find Us" title="Visit Our Showroom" accent={acc} titleColor={purple} />
            <div className="wg2" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:40 }}>
              <div style={{ background:"#fff", border:"1px solid #E8DDF1", height:300, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:10, borderRadius:20, boxShadow:"0 18px 45px rgba(43,0,72,.08)" }}>
                <div style={{ fontSize:48 }}>📍</div>
                <div className="dm" style={{ fontSize:18, fontWeight:800, color:purple }}>{biz.name}</div>
                <div className="dm" style={{ fontSize:13, color:"#6B5878", textAlign:"center", lineHeight:1.7 }}>{biz.address}<br/>{biz.city}</div>
                <a href={biz.googleMapsLink} target="_blank" rel="noreferrer">
                  <G onClick={()=>{}} style={{ fontSize:11, marginTop:4 }}>Open in Google Maps</G>
                </a>
              </div>
              <div>
                {[["📍","Address",`${biz.address}, ${biz.city}`],["📞","Phone",biz.phone],["💬","WhatsApp","+"+biz.whatsapp],["◎","Instagram",instagramHandle?`@${instagramHandle}`:"Add username in admin"],["✉️","Email",biz.email],["🕐","Hours",biz.hours]].map(([icon,lbl,val])=>(
                  <div key={lbl} style={{ display:"flex", gap:14, marginBottom:18 }}>
                    <span style={{ fontSize:18, width:26, flexShrink:0 }}>{icon}</span>
                    <div>
                      <div className="dm" style={{ fontSize:9, letterSpacing:2, color:acc, textTransform:"uppercase", marginBottom:2 }}>{lbl}</div>
                      <div className="dm" style={{ fontSize:13, color:"#B8A98A" }}>{val}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CONNECT / INSTAGRAM */}
        <section style={{ padding:"68px 32px", background:"#fff", borderTop:"1px solid #E8DDF1", borderBottom:"1px solid #E8DDF1" }}>
          <div className="wg2" style={{ width:"100%", padding:"0 40px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:34, alignItems:"center" }}>
            <div>
              <div className="dm" style={{ fontSize:10, letterSpacing:4, color:acc, textTransform:"uppercase", marginBottom:12 }}>Connect With Us</div>
              <h2 className="dm" style={{ fontSize:"clamp(28px,4vw,46px)", color:purple, fontWeight:800, lineHeight:1.1, marginBottom:14 }}>Follow our latest stock on Instagram.</h2>
              <p className="dm" style={{ fontSize:15, color:"#6B5878", lineHeight:1.8, maxWidth:560 }}>See fresh arrivals, walkaround clips, offers, and showroom updates directly from {biz.name}.</p>
            </div>
            <div style={{ background:`linear-gradient(145deg,${purple},${purple2})`, border:"1px solid #E8DDF1", padding:28, borderRadius:20, boxShadow:"0 24px 70px rgba(43,0,72,.18)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:18 }}>
                <div style={{ width:54, height:54, background:acc, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, borderRadius:14 }}>◎</div>
                <div>
                  <div className="dm" style={{ color:"#F8FAFC", fontSize:20, fontWeight:800 }}>@{instagramHandle || "your_instagram"}</div>
                  <div className="dm" style={{ color:"#E8DDF1", fontSize:12, marginTop:3 }}>Instagram showroom feed</div>
                </div>
              </div>
              <a href={instagramUrl} target="_blank" rel="noreferrer" style={{ display:"inline-flex", justifyContent:"center", width:"100%", background:acc, color:"#fff", textDecoration:"none", padding:"13px 20px", fontSize:12, fontWeight:800, letterSpacing:1.4, textTransform:"uppercase", fontFamily:"'DM Sans',sans-serif", borderRadius:4 }}>Follow on Instagram</a>
            </div>
          </div>
        </section>

        {/* CTA BAND */}
        <section style={{ padding:"64px 32px", background:`linear-gradient(135deg,${purple2},${purple})`, textAlign:"center" }}>
          <h2 className="dm" style={{ fontSize:"clamp(26px,5vw,50px)", fontWeight:900, color:"#fff", marginBottom:14 }}>Ready to Find Your Car?</h2>
          <p className="dm" style={{ fontSize:14, color:"#FFE4E6", marginBottom:28, lineHeight:1.8 }}>Visit {biz.name} today or browse our inventory online. Finance available for all.</p>
          <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
            <button onClick={()=>setPage("inventory")} style={{ background:"#000", color:"#fff", border:"none", padding:"13px 32px", fontFamily:"'DM Sans',sans-serif", fontSize:12, letterSpacing:2, textTransform:"uppercase", cursor:"pointer", fontWeight:800 }}>Browse Inventory</button>
            <button onClick={()=>setModal("testdrive")} style={{ background:"transparent", color:"#fff", border:"2px solid #fff", padding:"13px 32px", fontFamily:"'DM Sans',sans-serif", fontSize:12, letterSpacing:2, textTransform:"uppercase", cursor:"pointer", fontWeight:800 }}>Book Test Drive</button>
          </div>
        </section>
      </>}

      {/* ── UPDATES PAGE ── */}
      {page==="updates" && (
        <section style={{ padding:"52px 32px", minHeight:"80vh" }}>
          <div style={{ width:"100%", padding:"0 40px" }}>
            <SubHead label="Stay Informed" title="News & Updates" accent={acc} />
            {allPosts.length === 0 && (
              <div style={{ textAlign:"center", padding:"60px 0", color:"#B8A98A" }}>
                <div style={{ fontSize:48, marginBottom:16 }}>📢</div>
                <div className="pf" style={{ fontSize:22 }}>No updates yet</div>
                <div className="dm" style={{ fontSize:13, marginTop:8 }}>Check back soon for news and offers!</div>
              </div>
            )}
            <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
              {allPosts.map(post=>(
                <div key={post.id} style={{ background:"#111", border:`1px solid ${post.pinned?acc:"#1E1E1E"}`, padding:28, position:"relative" }}>
                  {post.pinned && <div style={{ position:"absolute", top:14, right:14, background:acc, color:"#000", fontSize:9, letterSpacing:2, padding:"3px 8px", fontWeight:700 }}>📌 PINNED</div>}
                  <div style={{ display:"flex", gap:12, alignItems:"center", marginBottom:14, flexWrap:"wrap" }}>
                    <span style={{ background:POST_TYPE_CLR[post.type]||"#333", color:"#fff", fontSize:9, letterSpacing:2, padding:"3px 10px" }}>{POST_TYPE_ICON[post.type]} {post.type.toUpperCase()}</span>
                    <span className="dm" style={{ fontSize:11, color:"#555" }}>{post.date}</span>
                  </div>
                  <div className="pf" style={{ fontSize:22, fontWeight:700, color:"#F5F0E8", marginBottom:10 }}>{post.title}</div>
                  <div className="dm" style={{ fontSize:14, color:"#B8A98A", lineHeight:1.8 }}>{post.body}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── INVENTORY ── */}
      {page==="inventory" && (
        <section style={{ padding:"56px 32px", minHeight:"80vh", background:lavender }}>
          <div style={{width:"100%", padding:"0 40px"}}>
            <SubHead label="Available Now" title={`Inventory (${cars.length} Vehicles)`} accent={acc} titleColor={purple} />
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:32 }}>
              {cats.map(f=><button key={f} onClick={()=>setFilter(f)} style={{ background:filter===f?purple:"#fff", border:`1px solid ${filter===f?purple:"#D8C4E8"}`, color:filter===f?"#fff":purple, padding:"9px 18px", fontSize:11, letterSpacing:1.2, textTransform:"uppercase", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontWeight:800, borderRadius:12 }}>{f}</button>)}
            </div>
            <div className="wg3" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20 }}>
              {filtered.map(c=><CarCard key={c.id} car={c} acc={acc} onView={()=>openDetails(c)} onI={()=>{setSelCar(c);setModal("inquiry")}} onT={()=>{setSelCar(c);setModal("testdrive")}} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── ABOUT ── */}
      {page==="about" && (
        <section style={{ padding:"52px 32px", minHeight:"80vh" }}>
          <div style={{ width:"100%", padding:"0 40px"}}>
            <div className="wg2" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:64, alignItems:"center" }}>
              <div>
                <SubHead label="Our Story" title={`About ${biz.name}`} accent={acc} />
                <p className="dm" style={{ fontSize:14, color:"#B8A98A", lineHeight:1.9, marginBottom:16 }}>Founded with one belief — buying a used car should feel exciting, not stressful. We hand-pick every vehicle, inspect it thoroughly, and price it fairly.</p>
                <p className="dm" style={{ fontSize:14, color:"#B8A98A", lineHeight:1.9, marginBottom:28 }}>Located at {biz.address}, {biz.city}. Open {biz.hours}.</p>
                <G onClick={()=>setModal("inquiry")}>Talk To Our Team</G>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                {[["🏆","Trusted dealership, serving customers for 10+ years"],["👨‍🔧","Master-certified mechanics on every inspection"],["📋","Full vehicle history report with every car"],["🤝","5,000+ satisfied customers and counting"]].map(([icon,text])=>(
                  <div key={text} style={{ display:"flex", gap:14, alignItems:"center", background:"#111", border:"1px solid #1E1E1E", padding:"16px 20px" }}>
                    <span style={{ fontSize:22 }}>{icon}</span>
                    <span className="dm" style={{ fontSize:13, color:"#B8A98A", lineHeight:1.6 }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── CONTACT ── */}
      {page==="contact" && (
        <section style={{ padding:"52px 32px", minHeight:"80vh" }}>
          <div style={{ width:"100%", padding:"0 40px" }}>
            <div className="wg2" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:52 }}>
              <div>
                <SubHead label="Get In Touch" title="We're Here to Help" accent={acc} />
                {[["📍","Address",`${biz.address}, ${biz.city}`],["📞","Phone",biz.phone],["💬","WhatsApp","+"+biz.whatsapp],["◎","Instagram",instagramHandle?`@${instagramHandle}`:"Add username in admin"],["✉️","Email",biz.email],["🕐","Hours",biz.hours]].map(([icon,lbl,val])=>(
                  <div key={lbl} style={{ display:"flex", gap:14, marginBottom:20 }}>
                    <span style={{ fontSize:18, width:26 }}>{icon}</span>
                    <div>
                      <div className="dm" style={{ fontSize:9, letterSpacing:2, color:acc, textTransform:"uppercase", marginBottom:2 }}>{lbl}</div>
                      <div className="dm" style={{ fontSize:13, color:"#B8A98A" }}>{val}</div>
                    </div>
                  </div>
                ))}
                <a href={whatsappUrl} target="_blank" rel="noreferrer">
                  <button style={{ background:"#25D366", border:"none", color:"#000", padding:"12px 24px", fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:12, letterSpacing:1, cursor:"pointer", marginTop:8 }}>💬 Chat on WhatsApp</button>
                </a>
                <a href={instagramUrl} target="_blank" rel="noreferrer" style={{ marginLeft:10 }}>
                  <button style={{ background:acc, border:"none", color:"#fff", padding:"12px 24px", fontFamily:"'DM Sans',sans-serif", fontWeight:800, fontSize:12, letterSpacing:1, cursor:"pointer", marginTop:8 }}>◎ Follow on Instagram</button>
                </a>
              </div>
              <div style={{ background:"#111", border:"1px solid #1E1E1E", padding:32 }}>
                <h3 className="pf" style={{ fontSize:22, marginBottom:20 }}>Send a Message</h3>
                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  {[["name","Full Name"],["email","Email"],["phone","Phone"]].map(([k,p])=>(
                    <Inp key={k} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} placeholder={p} />
                  ))}
                  <Inp value={form.message} onChange={e=>setForm({...form,message:e.target.value})} placeholder="Your Message..." rows={4} />
                  <G onClick={()=>setModal("success")} style={{ width:"100%", padding:13 }}>Send Message →</G>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer style={{ background:purple, borderTop:"1px solid rgba(255,255,255,.12)", padding:"48px 32px 24px" }}>
        <div style={{ width:"100%", padding:"0 40px" }}>
          <div className="wfoot" style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", gap:36, marginBottom:36 }}>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
                <LogoDisplay biz={biz} size={32} radius={6} fontSize={16} />
                <div className="pf" style={{ fontSize:13, fontWeight:900 }}>{biz.name.toUpperCase()}</div>
              </div>
              <p className="dm" style={{ fontSize:12, color:"#D9C7E8", lineHeight:1.8, maxWidth:240 }}>{biz.tagline}. {biz.address.split(",")[0]}, {biz.city}.</p>
            </div>
            <div>
              <div className="dm" style={{ fontSize:10, letterSpacing:2.5, color:acc, textTransform:"uppercase", marginBottom:14 }}>Navigate</div>
              <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
                {["Home","Inventory","Updates","About","Contact"].map(i=><span key={i} onClick={()=>setPage(i.toLowerCase())} className="dm" style={{ fontSize:12, color:"#D9C7E8", cursor:"pointer" }}>{i}</span>)}
              </div>
            </div>
            <div>
              <div className="dm" style={{ fontSize:10, letterSpacing:2.5, color:acc, textTransform:"uppercase", marginBottom:14 }}>Services</div>
              <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
                {["Test Drives","Inspection","Finance","Trade-In"].map(i=><span key={i} className="dm" style={{ fontSize:12, color:"#D9C7E8" }}>{i}</span>)}
              </div>
            </div>
            <div>
              <div className="dm" style={{ fontSize:10, letterSpacing:2.5, color:acc, textTransform:"uppercase", marginBottom:14 }}>Connect</div>
              <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
                <a href={whatsappUrl} target="_blank" rel="noreferrer" className="dm" style={{ fontSize:12, color:"#D9C7E8", textDecoration:"none" }}>WhatsApp</a>
                <a href={instagramUrl} target="_blank" rel="noreferrer" className="dm" style={{ fontSize:12, color:acc, textDecoration:"none", fontWeight:800 }}>Instagram</a>
                <span className="dm" style={{ fontSize:12, color:"#D9C7E8" }}>{biz.email}</span>
              </div>
            </div>
          </div>
          <div style={{ borderTop:"1px solid #1A1A1A", paddingTop:18, display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
            <span className="dm" style={{ fontSize:11, color:"#333" }}>© 2025 {biz.name}. All rights reserved.</span>
            <span className="dm" style={{ fontSize:11, color:"#333" }}>Privacy · Terms</span>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {modal==="details" && selCar && (
        <VehicleDetailsModal
          key={selCar.id}
          car={selCar}
          acc={acc}
          onClose={()=>setModal(null)}
          onI={()=>setModal("inquiry")}
          onT={()=>setModal("testdrive")}
        />
      )}
      {modal && modal!=="success" && modal!=="details" && (
        <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)setModal(null)}}>
          <div className="modal">
            <button onClick={()=>setModal(null)} style={{ position:"absolute", top:12, right:16, background:"none", border:"none", color:"#B8A98A", fontSize:20, cursor:"pointer" }}>✕</button>
            <div className="dm" style={{ fontSize:9, letterSpacing:3, color:acc, textTransform:"uppercase", marginBottom:6 }}>{modal==="inquiry"?"Vehicle Enquiry":"Test Drive Booking"}</div>
            <h2 className="pf" style={{ fontSize:24, marginBottom:14, color:"#F5F0E8" }}>{modal==="inquiry"?"Enquire About a Car":"Book Your Test Drive"}</h2>
            {selCar && <div style={{ background:"#1A1A1A", border:`1px solid ${acc}`, padding:"7px 12px", marginBottom:14, fontSize:11, color:acc }}>{selCar.year} {selCar.name} — ₹{selCar.price.toLocaleString()}</div>}
            <div style={{ width:44, height:2, background:acc, marginBottom:20 }} />
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {[["name","Name *"],["email","Email *"],["phone","Phone *"]].map(([k,p])=>(
                <Inp key={k} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} placeholder={p} />
              ))}
              {modal==="testdrive" && <Inp type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} />}
              <Inp value={form.message} onChange={e=>setForm({...form,message:e.target.value})} placeholder="Any notes..." rows={3} />
              <G onClick={()=>{setModal("success");setForm({name:"",email:"",phone:"",message:"",date:""})}} style={{ width:"100%", padding:13 }}>
                {modal==="inquiry"?"Submit Enquiry →":"Confirm Booking →"}
              </G>
            </div>
          </div>
        </div>
      )}
      {modal==="success" && (
        <div className="overlay" onClick={()=>setModal(null)}>
          <div className="modal" style={{ textAlign:"center" }}>
            <div style={{ fontSize:50, marginBottom:14 }}>✅</div>
            <h2 className="pf" style={{ fontSize:26, marginBottom:10 }}>You're All Set!</h2>
            <p className="dm" style={{ fontSize:14, color:"#B8A98A", lineHeight:1.8, marginBottom:22 }}>Thank you! The {biz.name} team will contact you within 24 hours.</p>
            <G onClick={()=>{setModal(null);setSelCar(null)}}>Back to Browsing</G>
          </div>
        </div>
      )}
    </div>
  );
}

function PostCard({ post, acc }) {
  return (
    <div style={{ background:"#0D0D0D", border:`1px solid ${post.pinned?acc:"#1E1E1E"}`, padding:22, position:"relative" }}>
      {post.pinned && <div style={{ position:"absolute", top:10, right:10, background:acc, color:"#000", fontSize:8, letterSpacing:1.5, padding:"2px 7px", fontWeight:700 }}>📌</div>}
      <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:10 }}>
        <span style={{ background:POST_TYPE_CLR[post.type]||"#333", color:"#fff", fontSize:8, letterSpacing:1.5, padding:"2px 8px" }}>{POST_TYPE_ICON[post.type]} {post.type.toUpperCase()}</span>
        <span className="dm" style={{ fontSize:10, color:"#555" }}>{post.date}</span>
      </div>
      <div className="pf" style={{ fontSize:16, fontWeight:700, color:"#F5F0E8", marginBottom:8, lineHeight:1.3 }}>{post.title}</div>
      <div className="dm" style={{ fontSize:12, color:"#B8A98A", lineHeight:1.7 }}>{post.body.length > 100 ? post.body.slice(0,100)+"..." : post.body}</div>
    </div>
  );
}

function CarCard({ car, acc, onI, onT, onView }) {
  const primaryImage = getPrimaryCarImage(car);
  return (
    <div onClick={onView} style={{ background:"#fff", border:"1px solid #E8DDF1", transition:"all .25s", position:"relative", overflow:"hidden", cursor:"pointer", borderRadius:20, boxShadow:"0 18px 45px rgba(43,0,72,.09)" }}
      onMouseEnter={e=>{ e.currentTarget.style.borderColor=acc; e.currentTarget.style.transform="translateY(-4px)"; e.currentTarget.style.boxShadow=`0 24px 58px rgba(43,0,72,.16),0 0 0 1px ${acc}22`; }}
      onMouseLeave={e=>{ e.currentTarget.style.borderColor="#E8DDF1"; e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="0 18px 45px rgba(43,0,72,.09)"; }}>
      <div style={{ background:"#F7F0FB", padding:primaryImage?0:"28px 16px", textAlign:"center", position:"relative", height:210, display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden" }}>
        <span style={{ position:"absolute", top:12, left:12, background:BADGE_CLR[car.badge]||"#333", color:"#fff", fontSize:9, letterSpacing:1.4, padding:"5px 9px", zIndex:2, fontWeight:800 }}>{car.badge}</span>
        {primaryImage ? (
          <img src={primaryImage} alt={car.name} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
        ) : (
          <div style={{ width:"100%", height:"100%", background:"linear-gradient(145deg,#F7F0FB,#fff)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
            <div style={{ fontSize:70, filter:"drop-shadow(0 12px 18px rgba(15,23,42,.18))" }}>{CAT_EMOJI[car.category]||"🚗"}</div>
            <div className="dm" style={{ fontSize:10, color:"#6B5878", letterSpacing:1.5, marginTop:8, textTransform:"uppercase", fontWeight:800 }}>{car.category}</div>
          </div>
        )}
        {primaryImage && <div className="dm" style={{ position:"absolute", right:12, bottom:12, background:"rgba(15,23,42,.84)", border:"1px solid rgba(255,255,255,.22)", color:"#F8FAFC", fontSize:10, letterSpacing:.8, padding:"5px 8px", borderRadius:3 }}>{getCarImages(car).length} Photos</div>}
      </div>
      <div style={{ padding:20 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:5 }}>
          <div>
            <div className="dm" style={{ fontSize:18, fontWeight:800, color:"#2B0048" }}>{car.name}</div>
            <div className="dm" style={{ fontSize:12, color:"#806593", marginTop:3 }}>{car.year} · {car.color}</div>
          </div>
          <div className="dm" style={{ fontSize:18, color:acc, fontWeight:900 }}>₹{car.price.toLocaleString()}</div>
        </div>
        <p className="dm" style={{ fontSize:12, color:"#6B5878", lineHeight:1.65, margin:"10px 0 12px", minHeight:40 }}>{car.description}</p>
        <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:14 }}>
          {[car.mileage+" km",car.fuel,car.transmission].map(t=><span key={t} style={{ background:"#F7F0FB", border:"1px solid #E8DDF1", padding:"5px 9px", fontSize:10, color:"#2B0048", fontWeight:800 }}>{t}</span>)}
        </div>
        <div className="dm" style={{ fontSize:10, letterSpacing:1.3, color:acc, textTransform:"uppercase", marginBottom:11, fontWeight:800 }}>Click card to view full details</div>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={e=>{e.stopPropagation();onI();}} style={{ flex:1, background:acc, color:"#000", border:"none", padding:"10px", fontSize:10, fontWeight:800, letterSpacing:1, textTransform:"uppercase", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", borderRadius:3 }}>Enquire</button>
          <button onClick={e=>{e.stopPropagation();onT();}} style={{ flex:1, background:"#fff", color:"#2B0048", border:"1px solid #D8C4E8", padding:"10px", fontSize:10, fontWeight:800, letterSpacing:1, textTransform:"uppercase", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", borderRadius:10 }}>Test Drive</button>
        </div>
      </div>
    </div>
  );
}

function VehicleDetailsModal({ car, acc, onClose, onI, onT }) {
  const images = getCarImages(car);
  const [activeImage, setActiveImage] = useState(0);
  const activeSrc = getImageSrc(images[activeImage]);
  const hasImages = images.length > 0;
  const nextImage = () => setActiveImage(i => (i + 1) % images.length);
  const prevImage = () => setActiveImage(i => (i - 1 + images.length) % images.length);

  return (
    <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="modal" style={{ maxWidth:980, padding:0, overflow:"hidden" }}>
        <button onClick={onClose} style={{ position:"absolute", top:12, right:16, background:"rgba(0,0,0,.65)", border:"1px solid #333", color:"#F5F0E8", fontSize:20, cursor:"pointer", zIndex:5, width:34, height:34 }}>×</button>
        <div className="wg2" style={{ display:"grid", gridTemplateColumns:"1.08fr .92fr", minHeight:520 }}>
          <div style={{ background:"#0A0A0A", borderRight:"1px solid #2A2A2A", padding:20 }}>
            <div style={{ position:"relative", background:"#050505", border:"1px solid #1E1E1E", minHeight:390, display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden" }}>
              <span style={{ position:"absolute", top:14, left:14, background:BADGE_CLR[car.badge]||"#333", color:"#fff", fontSize:9, letterSpacing:2, padding:"4px 10px", zIndex:2 }}>{car.badge}</span>
              {hasImages ? (
                <img src={activeSrc} alt={`${car.name} ${activeImage+1}`} style={{ width:"100%", height:390, objectFit:"cover", display:"block" }} />
              ) : (
                <div style={{ textAlign:"center" }}>
                  <div style={{ fontSize:96, marginBottom:8 }}>{CAT_EMOJI[car.category]||"🚗"}</div>
                  <div className="dm" style={{ color:"#B8A98A", fontSize:12, letterSpacing:2, textTransform:"uppercase" }}>No photos added yet</div>
                </div>
              )}
              {images.length > 1 && (
                <>
                  <button onClick={prevImage} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", width:38, height:38, background:"rgba(0,0,0,.72)", border:`1px solid ${acc}`, color:acc, fontSize:20, cursor:"pointer" }}>‹</button>
                  <button onClick={nextImage} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", width:38, height:38, background:"rgba(0,0,0,.72)", border:`1px solid ${acc}`, color:acc, fontSize:20, cursor:"pointer" }}>›</button>
                  <div className="dm" style={{ position:"absolute", right:14, bottom:14, background:"rgba(0,0,0,.72)", border:"1px solid #333", color:"#F5F0E8", fontSize:10, letterSpacing:1, padding:"4px 8px" }}>{activeImage+1} / {images.length}</div>
                </>
              )}
            </div>
            {hasImages && (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(70px,1fr))", gap:8, marginTop:12 }}>
                {images.map((image,index)=>(
                  <button key={`${getImageSrc(image)}-${index}`} onClick={()=>setActiveImage(index)} style={{ height:58, padding:0, background:"#111", border:`2px solid ${activeImage===index?acc:"#2A2A2A"}`, cursor:"pointer", overflow:"hidden" }}>
                    <img src={getImageSrc(image)} alt={`${car.name} thumbnail ${index+1}`} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div style={{ padding:"34px 32px", background:"#111" }}>
            <div className="dm" style={{ fontSize:9, letterSpacing:3, color:acc, textTransform:"uppercase", marginBottom:8 }}>{car.category} · {car.fuel}</div>
            <h2 className="pf" style={{ fontSize:30, lineHeight:1.15, color:"#F5F0E8", marginBottom:8 }}>{car.year} {car.name}</h2>
            <div className="pf" style={{ color:acc, fontSize:28, fontWeight:700, marginBottom:18 }}>₹{Number(car.price).toLocaleString()}</div>
            <p className="dm" style={{ fontSize:14, color:"#B8A98A", lineHeight:1.8, marginBottom:22 }}>{car.description}</p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:24 }}>
              {[["Mileage",`${car.mileage} km`],["Transmission",car.transmission],["Color",car.color],["Photos",`${images.length}/10`]].map(([label,value])=>(
                <div key={label} style={{ background:"#0D0D0D", border:"1px solid #2A2A2A", padding:"12px 14px" }}>
                  <div className="dm" style={{ fontSize:9, letterSpacing:2, color:acc, textTransform:"uppercase", marginBottom:4 }}>{label}</div>
                  <div className="dm" style={{ fontSize:13, color:"#F5F0E8" }}>{value}</div>
                </div>
              ))}
            </div>
            <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
              <button onClick={onI} style={{ flex:1, minWidth:140, background:acc, color:"#000", border:"none", padding:"13px 18px", fontSize:12, fontWeight:600, letterSpacing:1.5, textTransform:"uppercase", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Enquire Now</button>
              <button onClick={onT} style={{ flex:1, minWidth:140, background:"transparent", color:acc, border:`1.5px solid ${acc}`, padding:"12px 18px", fontSize:12, fontWeight:600, letterSpacing:1.5, textTransform:"uppercase", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Book Test Drive</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// MOBILE VIEW
// ════════════════════════════════════════════════════════════════════
function MobileView({ cars, biz, posts }) {
  const [tab,    setTab]    = useState("home");
  const [selCar, setSelCar] = useState(null);
  const [modal,  setModal]  = useState(null);
  const [filter, setFilter] = useState("All");
  const [form,   setForm]   = useState({ name:"", phone:"", email:"", date:"" });
  const acc = biz.accentColor;
  const featured = cars.filter(c=>c.featured);
  const cats = ["All",...Array.from(new Set(cars.map(c=>c.category)))];
  const filtered = filter==="All" ? cars : cars.filter(c=>c.category===filter);
  const sortedPosts = [...posts].sort((a,b)=>b.id-a.id);

  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"28px 16px", background:"#0A0A0A" }}>
      <div className="dm" style={{ fontSize:10, letterSpacing:3, color:"#444", textTransform:"uppercase", marginBottom:18 }}>📱 Mobile App Preview</div>
      <div className="phone-frame">
        <div style={{ background:"#000", padding:"12px 20px 5px", display:"flex", justifyContent:"space-between" }}>
          <span className="dm" style={{ fontSize:12, fontWeight:600, color:"#fff" }}>9:41</span>
          <span className="dm" style={{ fontSize:11, color:"#fff" }}>▪▪▪▪ WiFi 🔋</span>
        </div>
        <div className="phone-screen" style={{ background:"#0A0A0A" }}>
          {/* App header */}
          <div style={{ background:"#050505", padding:"10px 16px", display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:"1px solid #1A1A1A", position:"sticky", top:0, zIndex:10 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <LogoDisplay biz={biz} size={28} radius={6} fontSize={14} />
              <div>
                <div className="pf" style={{ fontSize:11, fontWeight:900, lineHeight:1 }}>{biz.name.toUpperCase()}</div>
                <div className="dm" style={{ fontSize:7, letterSpacing:2, color:acc }}>DEALERSHIP</div>
              </div>
            </div>
            <span style={{ fontSize:17, cursor:"pointer" }} onClick={()=>setModal("inquiry")}>💬</span>
          </div>

          {/* HOME */}
          {tab==="home" && (
            <div style={{ paddingBottom:72 }}>
              {/* pinned banner */}
              {posts.filter(p=>p.pinned)[0] && (
                <div style={{ background:`${acc}22`, borderBottom:`1px solid ${acc}44`, padding:"9px 14px", display:"flex", gap:8, alignItems:"center" }}>
                  <span style={{ background:acc, color:"#000", fontSize:8, fontWeight:700, letterSpacing:1, padding:"2px 6px" }}>📌</span>
                  <span className="dm" style={{ fontSize:11, color:"#F5F0E8", flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{posts.filter(p=>p.pinned)[0].title}</span>
                  <span onClick={()=>setTab("updates")} className="dm" style={{ fontSize:10, color:acc, cursor:"pointer", flexShrink:0 }}>→</span>
                </div>
              )}
              {/* Hero */}
              <div style={{ background:"linear-gradient(135deg,#111,#1A1A1A)", padding:"18px 16px 22px", position:"relative", overflow:"hidden" }}>
                <div style={{ position:"absolute", top:-20, right:-20, width:130, height:130, background:`radial-gradient(circle,${acc}15,transparent)`, borderRadius:"50%", pointerEvents:"none" }} />
                <div className="dm" style={{ fontSize:8, letterSpacing:3, color:acc, textTransform:"uppercase", marginBottom:7 }}>★ {biz.tagline}</div>
                <h2 className="pf" style={{ fontSize:24, fontWeight:900, lineHeight:1.1, marginBottom:8 }}>Drive Away <span style={{ color:acc }}>Happy.</span></h2>
                <p className="dm" style={{ fontSize:11, color:"#B8A98A", lineHeight:1.7, marginBottom:14 }}>Certified pre-owned cars at {biz.address.split(",")[0]}.</p>
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={()=>setTab("inventory")} style={{ background:acc, color:"#000", border:"none", padding:"8px 16px", fontSize:10, fontWeight:600, letterSpacing:1.5, textTransform:"uppercase", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Browse Cars</button>
                  <button onClick={()=>setModal("testdrive")} style={{ background:"transparent", color:acc, border:`1px solid ${acc}`, padding:"8px 14px", fontSize:10, fontWeight:600, letterSpacing:1.5, textTransform:"uppercase", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Test Drive</button>
                </div>
              </div>
              {/* Stats */}
              <div style={{ display:"flex", background:acc }}>
                {[["100+","Cars"],["5K+","Buyers"],["10yr","Trust"]].map(([n,l],i)=>(
                  <div key={l} style={{ flex:1, textAlign:"center", padding:"10px 0", borderRight:i<2?"1px solid rgba(0,0,0,.2)":undefined }}>
                    <div className="pf" style={{ fontSize:15, fontWeight:700, color:"#000" }}>{n}</div>
                    <div className="dm" style={{ fontSize:8, color:"#3A2800", letterSpacing:1 }}>{l}</div>
                  </div>
                ))}
              </div>
              {/* Latest Update */}
              {sortedPosts.length > 0 && (
                <div style={{ margin:"14px 14px 0" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                    <div className="pf" style={{ fontSize:15, fontWeight:700 }}>Latest Updates</div>
                    <span className="dm" style={{ fontSize:10, color:acc, cursor:"pointer" }} onClick={()=>setTab("updates")}>See all →</span>
                  </div>
                  {sortedPosts.slice(0,2).map(post=>(
                    <div key={post.id} style={{ background:"#141414", border:`1px solid ${post.pinned?acc:"#222"}`, padding:"12px 14px", marginBottom:8 }}>
                      <div style={{ display:"flex", gap:6, alignItems:"center", marginBottom:6 }}>
                        <span style={{ background:POST_TYPE_CLR[post.type]||"#333", color:"#fff", fontSize:7, letterSpacing:1, padding:"2px 6px" }}>{POST_TYPE_ICON[post.type]} {post.type.toUpperCase()}</span>
                        <span className="dm" style={{ fontSize:9, color:"#555" }}>{post.date}</span>
                      </div>
                      <div className="pf" style={{ fontSize:13, fontWeight:700, color:"#F5F0E8", marginBottom:4 }}>{post.title}</div>
                      <div className="dm" style={{ fontSize:10, color:"#B8A98A", lineHeight:1.6 }}>{post.body.slice(0,80)}...</div>
                    </div>
                  ))}
                </div>
              )}
              {/* Featured */}
              <div style={{ padding:"14px 14px 0" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                  <div className="pf" style={{ fontSize:15, fontWeight:700 }}>Featured Cars</div>
                  <span className="dm" style={{ fontSize:10, color:acc, cursor:"pointer" }} onClick={()=>setTab("inventory")}>See all →</span>
                </div>
                {featured.map(car=>(
                  <div key={car.id} style={{ background:"#141414", border:"1px solid #222", display:"flex", overflow:"hidden", marginBottom:10 }}>
                    {getPrimaryCarImage(car) ? (
                      <img src={getPrimaryCarImage(car)} alt={car.name} style={{ width:78, objectFit:"cover", flexShrink:0 }} />
                    ) : (
                      <div style={{ width:78, background:"#0D0D0D", display:"flex", alignItems:"center", justifyContent:"center", fontSize:36, flexShrink:0 }}>{CAT_EMOJI[car.category]||"🚗"}</div>
                    )}
                    <div style={{ padding:"10px 12px", flex:1 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:3 }}>
                        <div className="pf" style={{ fontSize:13, fontWeight:700 }}>{car.name}</div>
                        <span style={{ background:BADGE_CLR[car.badge]||"#333", color:"#fff", fontSize:7, letterSpacing:1, padding:"2px 5px" }}>{car.badge}</span>
                      </div>
                      <div className="dm" style={{ fontSize:9, color:"#B8A98A", marginBottom:5 }}>{car.year} · {car.mileage} km</div>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <div className="pf" style={{ fontSize:14, color:acc, fontWeight:700 }}>₹{car.price.toLocaleString()}</div>
                        <div style={{ display:"flex", gap:5 }}>
                          <button onClick={()=>{setSelCar(car);setModal("inquiry")}} style={{ background:acc, color:"#000", border:"none", padding:"4px 9px", fontSize:8, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Enquire</button>
                          <button onClick={()=>{setSelCar(car);setModal("testdrive")}} style={{ background:"transparent", color:acc, border:`1px solid ${acc}`, padding:"4px 9px", fontSize:8, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Drive</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* UPDATES TAB */}
          {tab==="updates" && (
            <div style={{ padding:"14px 14px 72px" }}>
              <div className="pf" style={{ fontSize:18, fontWeight:700, marginBottom:14 }}>News & Updates</div>
              {sortedPosts.length === 0 && <div className="dm" style={{ color:"#B8A98A", fontSize:13, textAlign:"center", padding:"40px 0" }}>No updates yet. Check back soon!</div>}
              {sortedPosts.map(post=>(
                <div key={post.id} style={{ background:"#141414", border:`1px solid ${post.pinned?acc:"#1E1E1E"}`, padding:"14px", marginBottom:12, position:"relative" }}>
                  {post.pinned && <div style={{ position:"absolute", top:8, right:8, background:acc, color:"#000", fontSize:7, letterSpacing:1, padding:"2px 6px", fontWeight:700 }}>📌 PINNED</div>}
                  <div style={{ display:"flex", gap:6, marginBottom:7 }}>
                    <span style={{ background:POST_TYPE_CLR[post.type]||"#333", color:"#fff", fontSize:7, letterSpacing:1, padding:"2px 7px" }}>{POST_TYPE_ICON[post.type]} {post.type.toUpperCase()}</span>
                    <span className="dm" style={{ fontSize:9, color:"#555" }}>{post.date}</span>
                  </div>
                  <div className="pf" style={{ fontSize:14, fontWeight:700, color:"#F5F0E8", marginBottom:6 }}>{post.title}</div>
                  <div className="dm" style={{ fontSize:11, color:"#B8A98A", lineHeight:1.7 }}>{post.body}</div>
                </div>
              ))}
            </div>
          )}

          {/* INVENTORY TAB */}
          {tab==="inventory" && (
            <div style={{ paddingBottom:72 }}>
              <div style={{ padding:"14px 14px 10px" }}>
                <div className="pf" style={{ fontSize:18, fontWeight:700, marginBottom:10 }}>All Cars</div>
                <div style={{ display:"flex", gap:5, overflowX:"auto", paddingBottom:4 }}>
                  {cats.map(f=><button key={f} onClick={()=>setFilter(f)} style={{ background:filter===f?acc:"transparent", border:`1px solid ${filter===f?acc:"#333"}`, color:filter===f?"#000":"#B8A98A", padding:"4px 12px", fontSize:9, letterSpacing:1, textTransform:"uppercase", cursor:"pointer", whiteSpace:"nowrap", fontFamily:"'DM Sans',sans-serif", fontWeight:600 }}>{f}</button>)}
                </div>
              </div>
              {filtered.map(car=>(
                <div key={car.id} style={{ borderBottom:"1px solid #1A1A1A", padding:"12px 14px" }}>
                  <div style={{ display:"flex", gap:10 }}>
                    {getPrimaryCarImage(car) ? (
                      <img src={getPrimaryCarImage(car)} alt={car.name} style={{ width:64, height:64, objectFit:"cover", flexShrink:0 }} />
                    ) : (
                      <div style={{ width:64, height:64, background:"#141414", display:"flex", alignItems:"center", justifyContent:"center", fontSize:30, flexShrink:0 }}>{CAT_EMOJI[car.category]||"🚗"}</div>
                    )}
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", justifyContent:"space-between" }}>
                        <div className="pf" style={{ fontSize:13, fontWeight:700 }}>{car.name}</div>
                        <div className="pf" style={{ fontSize:13, color:acc, fontWeight:700 }}>₹{car.price.toLocaleString()}</div>
                      </div>
                      <div className="dm" style={{ fontSize:9, color:"#B8A98A", marginBottom:5 }}>{car.year} · {car.color}</div>
                      <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginBottom:6 }}>
                        {[car.mileage+" km",car.fuel,car.transmission].map(t=><span key={t} style={{ background:"#1A1A1A", border:"1px solid #2A2A2A", padding:"1px 7px", fontSize:8, color:"#B8A98A" }}>{t}</span>)}
                      </div>
                      <div style={{ display:"flex", gap:6 }}>
                        <button onClick={()=>{setSelCar(car);setModal("inquiry")}} style={{ flex:1, background:acc, color:"#000", border:"none", padding:"5px", fontSize:8, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Enquire</button>
                        <button onClick={()=>{setSelCar(car);setModal("testdrive")}} style={{ flex:1, background:"transparent", color:acc, border:`1px solid ${acc}`, padding:"5px", fontSize:8, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Test Drive</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CONTACT TAB */}
          {tab==="contact" && (
            <div style={{ padding:"16px 14px 72px" }}>
              <div className="pf" style={{ fontSize:18, fontWeight:700, marginBottom:14 }}>Contact Us</div>
              {[["📍","Address",`${biz.address}, ${biz.city}`],["📞","Phone",biz.phone],["💬","WhatsApp","+"+biz.whatsapp],["✉️","Email",biz.email],["🕐","Hours",biz.hours]].map(([icon,lbl,val])=>(
                <div key={lbl} style={{ display:"flex", gap:12, padding:"12px 0", borderBottom:"1px solid #1A1A1A" }}>
                  <span style={{ fontSize:17 }}>{icon}</span>
                  <div>
                    <div className="dm" style={{ fontSize:8, letterSpacing:2, color:acc, textTransform:"uppercase", marginBottom:2 }}>{lbl}</div>
                    <div className="dm" style={{ fontSize:12, color:"#B8A98A", lineHeight:1.6 }}>{val}</div>
                  </div>
                </div>
              ))}
              <div style={{ display:"flex", flexDirection:"column", gap:10, marginTop:16 }}>
                <a href={`https://wa.me/${biz.whatsapp}`} target="_blank" rel="noreferrer"><button style={{ width:"100%", background:"#25D366", border:"none", color:"#000", padding:"12px", fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:11, cursor:"pointer" }}>💬 WhatsApp Us</button></a>
                <button onClick={()=>setModal("inquiry")} style={{ width:"100%", background:acc, border:"none", color:"#000", padding:"12px", fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:11, cursor:"pointer" }}>📋 Send Enquiry</button>
                <a href={biz.googleMapsLink} target="_blank" rel="noreferrer"><button style={{ width:"100%", background:"transparent", border:`1px solid ${acc}`, color:acc, padding:"12px", fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:11, cursor:"pointer" }}>📍 Open in Maps</button></a>
              </div>
            </div>
          )}

          {/* BOTTOM NAV */}
          <div style={{ position:"sticky", bottom:0, background:"#050505", borderTop:"1px solid #1A1A1A", display:"flex", height:58, zIndex:20 }}>
            {[["🏠","home","Home"],["📢","updates","Updates"],["🚗","inventory","Cars"],["📞","contact","Contact"]].map(([icon,t,label])=>(
              <button key={t} onClick={()=>setTab(t)} style={{ flex:1, background:"none", border:"none", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:2, cursor:"pointer", borderTop:tab===t?`2px solid ${acc}`:"2px solid transparent" }}>
                <span style={{ fontSize:15 }}>{icon}</span>
                <span className="dm" style={{ fontSize:7, letterSpacing:1, color:tab===t?acc:"#B8A98A", textTransform:"uppercase" }}>{label}</span>
              </button>
            ))}
          </div>

          {/* MOBILE MODALS */}
          {modal && modal!=="success" && (
            <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,.92)", zIndex:100, display:"flex", alignItems:"flex-end" }}>
              <div style={{ background:"#111", width:"100%", padding:20, borderTop:"1px solid #2A2A2A", maxHeight:"80%", overflowY:"auto" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                  <h3 className="pf" style={{ fontSize:17 }}>{modal==="inquiry"?"Enquire":"Book Test Drive"}</h3>
                  <button onClick={()=>setModal(null)} style={{ background:"none", border:"none", color:"#B8A98A", fontSize:18, cursor:"pointer" }}>✕</button>
                </div>
                {selCar && <div style={{ background:"#1A1A1A", border:`1px solid ${acc}`, padding:"6px 10px", marginBottom:12, fontSize:10, color:acc }}>{selCar.year} {selCar.name}</div>}
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {[["name","Name *"],["phone","Phone *"],["email","Email"]].map(([k,p])=>(
                    <Inp key={k} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} placeholder={p} style={{ fontSize:12 }} />
                  ))}
                  {modal==="testdrive" && <Inp type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} />}
                  <button onClick={()=>{setModal("success");setForm({name:"",phone:"",email:"",date:""})}} style={{ background:acc, color:"#000", border:"none", padding:"12px", fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:12, cursor:"pointer" }}>Submit →</button>
                </div>
              </div>
            </div>
          )}
          {modal==="success" && (
            <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,.92)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
              <div style={{ background:"#111", border:"1px solid #2A2A2A", padding:24, textAlign:"center", width:"100%" }}>
                <div style={{ fontSize:40, marginBottom:10 }}>✅</div>
                <h3 className="pf" style={{ fontSize:20, marginBottom:8 }}>Done!</h3>
                <p className="dm" style={{ fontSize:12, color:"#B8A98A", marginBottom:16 }}>We'll contact you within 24 hours.</p>
                <button onClick={()=>{setModal(null);setSelCar(null)}} style={{ background:acc, color:"#000", border:"none", padding:"10px 24px", fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:11, cursor:"pointer" }}>Back</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// ADMIN PANEL
// ════════════════════════════════════════════════════════════════════
function AdminView({ cars, setCars, biz, setBiz, posts, bizForm,
setBizForm, saveBusinessSettings, setPosts }) {
  const [tab,      setTab]      = useState("profile");
  const [carModal, setCarModal] = useState(null);
  const [editCar,  setEditCar]  = useState(null);
  const [postModal,setPostModal]= useState(null);
  const [editPost, setEditPost] = useState(null);
  const [toast,    setToast]    = useState("");
  const logoInputRef = useRef();
  const carImageInputRef = useRef();
  const acc = biz.accentColor;

  const BLANK_CAR  = { name:"", year:"", price:"", mileage:"", fuel:"Petrol", transmission:"Automatic", category:"Sedan", color:"", badge:"NEW IN", featured:false, description:"", images:[] };
  const BLANK_POST = { title:"", body:"", type:"update", date:new Date().toISOString().split("T")[0], pinned:false };
  const [carForm,  setCarForm]  = useState(BLANK_CAR);
  const [postForm, setPostForm] = useState(BLANK_POST);

  const showToast = msg => { setToast(msg); setTimeout(()=>setToast(""),3000); };
  const cf = (k,v) => setCarForm(p=>({...p,[k]:v}));
  const pf = (k,v) => setPostForm(p=>({...p,[k]:v}));
  const bf = (k,v) => setBizForm(p=>({...p,[k]:v}));

  // Logo image upload
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { showToast("⚠️ Image must be under 2MB"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => { bf("logoImg", ev.target.result); bf("logo", ""); };
    reader.readAsDataURL(file);
  };

  const removeLogoImg = () => { bf("logoImg", null); bf("logo", "🚗"); };

  const handleCarImagesUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const existingImages = getCarImages(carForm);
    const availableSlots = 10 - existingImages.length;
    if (availableSlots <= 0) {
      showToast("⚠️ Maximum 10 car images allowed");
      e.target.value = "";
      return;
    }
    const pickedFiles = files.slice(0, availableSlots);
    if (files.length > availableSlots) showToast(`⚠️ Only ${availableSlots} more image${availableSlots===1?"":"s"} allowed`);
    const oversized = pickedFiles.find(file => file.size > 3 * 1024 * 1024);
    if (oversized) {
      showToast("⚠️ Each car image must be under 3MB");
      e.target.value = "";
      return;
    }
    Promise.all(pickedFiles.map(file => new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = ev => resolve({ src:ev.target.result, name:file.name });
      reader.readAsDataURL(file);
    }))).then(newImages => {
      cf("images", [...existingImages, ...newImages]);
      e.target.value = "";
    });
  };

  const removeCarImage = index => cf("images", getCarImages(carForm).filter((_,i)=>i!==index));

  // Car CRUD
  const openAddCar  = ()    => { setCarForm(BLANK_CAR); setEditCar(null); setCarModal("add"); };
  const openEditCar = car   => { setCarForm({...car, images:getCarImages(car), year:String(car.year), price:String(car.price)}); setEditCar(car); setCarModal("edit"); };
  const openDelCar  = car   => { setEditCar(car); setCarModal("delete"); };
  const saveCar = async () => {

  if(!carForm.name || !carForm.year || !carForm.price){
    showToast("⚠️ Name, Year & Price required");
    return;
  }

  const c = {
  ...carForm,
  images: getCarImages(carForm).map(img => ({
    name: img.name || "car-image",
    src: img.src || img
  }))
};

  try {

    if(editCar){

      await updateDoc(doc(db, "cars", editCar.id), c);

    } else {

      await addDoc(collection(db, "cars"), {
        ...c,
        createdAt: Date.now()
      });

    }

    const querySnapshot = await getDocs(collection(db, "cars"));

    const carsData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    setCars(carsData);

    setCarModal(null);

    showToast("✅ Car saved!");

  } catch(err) {

    console.error(err);

    showToast("❌ Error saving car");

  }

};
  const deleteCar = async () => {

  try {

    await deleteDoc(doc(db, "cars", editCar.id));

    const querySnapshot = await getDocs(collection(db, "cars"));

    const carsData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    setCars(carsData);

    setCarModal(null);

    showToast("🗑️ Car deleted!");

  } catch(err) {

    console.error(err);

    showToast("❌ Error deleting car");
  }
};
  // Post CRUD
  const openAddPost  = ()    => { setPostForm(BLANK_POST); setEditPost(null); setPostModal("add"); };
  const openEditPost = post  => { setPostForm({...post}); setEditPost(post); setPostModal("edit"); };
  const openDelPost  = post  => { setEditPost(post); setPostModal("deletePost"); };
  const savePost = () => {
    if(!postForm.title||!postForm.body){ showToast("⚠️ Title & content required"); return; }
    const p = {...postForm, id:editPost?editPost.id:Date.now()};
    setPosts(prev => editPost ? prev.map(x=>x.id===editPost.id?p:x) : [p,...prev]);
    setPostModal(null);
    showToast(editPost?"✅ Update edited!":"✅ Update published to website!");
  };
  const deletePost = () => { setPosts(prev=>prev.filter(p=>p.id!==editPost.id)); setPostModal(null); showToast("🗑️ Update removed"); };
  const togglePin  = (post) => { setPosts(prev=>prev.map(p=>({...p, pinned: p.id===post.id ? !p.pinned : false}))); showToast(post.pinned?"📌 Unpinned":"📌 Post pinned to homepage!"); };

  const saveBiz = async () => {

  const updatedData = {
    ...bizForm
  };

  await setDoc(
    doc(db, "settings", "business"),
    updatedData
  );

  setBiz(updatedData);

  showToast("✅ Business profile updated!");

};

  const featCount = cars.filter(c=>c.featured).length;
  const totalVal  = cars.reduce((s,c)=>s+Number(c.price),0);

  const COLOR_OPTIONS = ["#E83E5A","#2B0048","#5A1685","#6A0DAD","#C9A84C","#3182CE","#38A169","#805AD5","#DD6B20","#00B5D8"];
  const LOGO_EMOJIS   = ["🚗","🏎️","🚙","🚘","🛻","⚡","🔑","🏁"];

  return (
    <div style={{ padding:"22px", minHeight:"80vh" }}>
      {/* HEADER */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22, flexWrap:"wrap", gap:12 }}>
        <div>
          <h1 className="pf" style={{ fontSize:26, fontWeight:700, color:"#F5F0E8" }}>Admin Panel</h1>
          <div className="dm" style={{ fontSize:12, color:"#B8A98A", marginTop:2 }}>Manage everything about {biz.name}</div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={openAddPost} style={{ background:"#1A1A1A", color:acc, border:`1px solid ${acc}`, padding:"10px 20px", fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:600, letterSpacing:1.5, textTransform:"uppercase", cursor:"pointer" }}>📢 Post Update</button>
          <button onClick={openAddCar}  style={{ background:acc, color:"#000", border:"none", padding:"10px 20px", fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:600, letterSpacing:1.5, textTransform:"uppercase", cursor:"pointer" }}>+ Add Car</button>
        </div>
      </div>

      {/* STATS */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(145px,1fr))", gap:12, marginBottom:22 }}>
        {[["🚗","Cars",cars.length,"in stock"],["⭐","Featured",featCount,"on homepage"],["💰","Value","₹"+totalVal.toLocaleString(),"total"],["📢","Updates",posts.length,"published"]].map(([icon,lbl,val,sub])=>(
          <div key={lbl} style={{ background:"#111", border:"1px solid #1E1E1E", padding:"16px 18px" }}>
            <div style={{ fontSize:20, marginBottom:6 }}>{icon}</div>
            <div className="dm" style={{ fontSize:9, letterSpacing:2, color:acc, textTransform:"uppercase", marginBottom:2 }}>{lbl}</div>
            <div className="pf" style={{ fontSize:20, fontWeight:700, color:"#F5F0E8" }}>{val}</div>
            <div className="dm" style={{ fontSize:10, color:"#444" }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* TABS */}
      <div style={{ display:"flex", gap:6, marginBottom:20, flexWrap:"wrap" }}>
        {[["profile","🏢 Profile"],["logo","🖼️ Logo & Brand"],["contact","📞 Contact"],["hours","🕐 Hours"],["posts","📢 Updates"],["cars","🚗 Inventory"]].map(([t,l])=>(
          <button key={t} className="atab" style={{ background:tab===t?acc:"transparent", borderColor:tab===t?acc:"#2A2A2A", color:tab===t?"#000":"#B8A98A", fontWeight:tab===t?600:400 }} onClick={()=>setTab(t)}>{l}</button>
        ))}
      </div>

      {/* ── PROFILE ── */}
      {tab==="profile" && (
        <div style={{ background:"#111", border:"1px solid #1E1E1E", padding:28 }}>
          <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:28, background:"#0D0D0D", border:"1px solid #2A2A2A", padding:"18px 20px" }}>
            <LogoDisplay biz={bizForm} size={52} radius={10} fontSize={26} />
            <div>
              <div className="pf" style={{ fontSize:20, fontWeight:700, color:"#F5F0E8" }}>{bizForm.name||"Business Name"}</div>
              <div className="dm" style={{ fontSize:12, color:"#B8A98A" }}>{bizForm.tagline||"Tagline"}</div>
            </div>
            <span className="dm" style={{ marginLeft:"auto", fontSize:10, color:"#555" }}>LIVE PREVIEW</span>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <Field label="Business Name" accentColor={acc}><Inp value={bizForm.name} onChange={e=>bf("name",e.target.value)} placeholder="e.g. Happy Car Bazaar" /></Field>
            <Field label="Tagline (shown under logo & in nav)" accentColor={acc}><Inp value={bizForm.tagline} onChange={e=>bf("tagline",e.target.value)} placeholder="e.g. Your Trusted Used Car Dealership" /></Field>
            <Field label="Scrolling Banner Text (ticker at top of website)" accentColor={acc}><Inp value={bizForm.taglineSub} onChange={e=>bf("taglineSub",e.target.value)} placeholder="e.g. Certified Pre-Owned | Free Test Drives | Finance Available" /></Field>
          </div>
          <button onClick={saveBusinessSettings} style={{ marginTop:22, background:acc, color:"#000", border:"none", padding:"12px 28px", fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:600, letterSpacing:1.5, textTransform:"uppercase", cursor:"pointer" }}>💾 Save Profile</button>
        </div>
      )}

      {/* ── LOGO & BRAND ── */}
      {tab==="logo" && (
        <div style={{ background:"#111", border:"1px solid #1E1E1E", padding:28 }}>
          <div className="pf" style={{ fontSize:20, marginBottom:6, color:"#F5F0E8" }}>Logo & Brand Appearance</div>
          <div className="dm" style={{ fontSize:12, color:"#B8A98A", marginBottom:28 }}>Upload your own logo image or choose an emoji. Changes apply instantly everywhere.</div>

          {/* LOGO UPLOAD */}
          <Field label="Business Logo — Upload from Your Computer" accentColor={acc}>
            <div style={{ marginTop:8, marginBottom:24 }}>
              {/* Current logo preview */}
              <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:16, background:"#0D0D0D", border:"1px solid #2A2A2A", padding:16 }}>
                <LogoDisplay biz={bizForm} size={64} radius={10} fontSize={32} />
                <div>
                  <div className="dm" style={{ fontSize:12, color:"#F5F0E8", marginBottom:4 }}>Current Logo</div>
                  <div className="dm" style={{ fontSize:11, color:"#B8A98A" }}>{bizForm.logoImg ? "Custom image uploaded" : `Emoji: ${bizForm.logo}`}</div>
                  {bizForm.logoImg && (
                    <button onClick={removeLogoImg} style={{ marginTop:8, background:"transparent", border:"1px solid #E53E3E", color:"#E53E3E", padding:"4px 12px", fontSize:10, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>✕ Remove Image</button>
                  )}
                </div>
              </div>

              {/* Upload button */}
              <div className="upload-zone" onClick={()=>logoInputRef.current.click()} style={{ borderColor:acc+"66" }}>
                <div style={{ fontSize:36, marginBottom:10 }}>📁</div>
                <div className="pf" style={{ fontSize:16, color:"#F5F0E8", marginBottom:6 }}>Click to Upload Your Logo</div>
                <div className="dm" style={{ fontSize:12, color:"#B8A98A", marginBottom:12 }}>PNG, JPG, SVG supported · Max 2MB · Recommended: 200×200px square</div>
                <div style={{ background:acc, color:"#000", display:"inline-block", padding:"10px 24px", fontSize:11, fontWeight:600, letterSpacing:1.5, textTransform:"uppercase", fontFamily:"'DM Sans',sans-serif" }}>Choose File from Computer</div>
              </div>
              <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} style={{ display:"none" }} />

              {/* Emoji fallback */}
              <div style={{ marginTop:20 }}>
                <div className="dm" style={{ fontSize:10, letterSpacing:2, color:acc, textTransform:"uppercase", marginBottom:10 }}>Or use an emoji logo instead</div>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
                  {LOGO_EMOJIS.map(em=>(
                    <div key={em} onClick={()=>{bf("logo",em);bf("logoImg",null);}} style={{ width:42, height:42, background:"#1A1A1A", border:`2px solid ${bizForm.logo===em&&!bizForm.logoImg?acc:"#2A2A2A"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, cursor:"pointer", borderRadius:8, transition:"all .2s" }}>{em}</div>
                  ))}
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginLeft:8 }}>
                    <span className="dm" style={{ fontSize:11, color:"#B8A98A" }}>Custom emoji:</span>
                    <input value={bizForm.logoImg ? "" : bizForm.logo} onChange={e=>{bf("logo",e.target.value);bf("logoImg",null);}} maxLength={4} placeholder="🚗" style={{ background:"#1A1A1A", border:"1px solid #333", color:"#F5F0E8", padding:"8px", width:52, fontSize:20, textAlign:"center", outline:"none", fontFamily:"'DM Sans',sans-serif" }} />
                  </div>
                </div>
              </div>
            </div>
          </Field>

          {/* COLOR */}
          <Field label="Brand Accent Color" accentColor={acc}>
            <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginTop:8, alignItems:"center", marginBottom:12 }}>
              {COLOR_OPTIONS.map(c=>(
                <div key={c} onClick={()=>bf("accentColor",c)} style={{ width:30, height:30, borderRadius:"50%", background:c, border:`3px solid ${bizForm.accentColor===c?"#fff":"transparent"}`, cursor:"pointer", transition:"all .2s" }} title={c} />
              ))}
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <span className="dm" style={{ fontSize:11, color:"#B8A98A" }}>Custom:</span>
              <input type="color" value={bizForm.accentColor} onChange={e=>bf("accentColor",e.target.value)} style={{ width:40, height:32, border:"1px solid #333", background:"transparent", cursor:"pointer", padding:2 }} />
              <Inp value={bizForm.accentColor} onChange={e=>bf("accentColor",e.target.value)} placeholder="#C9A84C" style={{ maxWidth:120 }} />
              <div style={{ width:32, height:32, background:bizForm.accentColor, borderRadius:4 }} />
            </div>
          </Field>

          {/* Live preview */}
          <div style={{ marginTop:24, background:"#0D0D0D", border:"1px solid #2A2A2A", padding:20 }}>
            <div className="dm" style={{ fontSize:9, letterSpacing:2, color:"#555", textTransform:"uppercase", marginBottom:14 }}>Live Preview</div>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
              <LogoDisplay biz={bizForm} size={46} radius={8} fontSize={24} />
              <div>
                <div className="pf" style={{ fontSize:15, fontWeight:900, color:"#F5F0E8" }}>{bizForm.name.toUpperCase()}</div>
                <div className="dm" style={{ fontSize:8, letterSpacing:3, color:bizForm.accentColor }}>{bizForm.tagline.toUpperCase()}</div>
              </div>
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button style={{ background:bizForm.accentColor, color:"#000", border:"none", padding:"9px 20px", fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:600, letterSpacing:1.5, cursor:"pointer" }}>Browse Cars</button>
              <button style={{ background:"transparent", color:bizForm.accentColor, border:`1.5px solid ${bizForm.accentColor}`, padding:"9px 18px", fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:600, letterSpacing:1.5, cursor:"pointer" }}>Test Drive</button>
            </div>
          </div>
          <button onClick={saveBiz} style={{ marginTop:22, background:acc, color:"#000", border:"none", padding:"12px 28px", fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:600, letterSpacing:1.5, textTransform:"uppercase", cursor:"pointer" }}>💾 Apply Changes</button>
        </div>
      )}

      {/* ── CONTACT ── */}
      {tab==="contact" && (
        <div style={{ background:"#111", border:"1px solid #1E1E1E", padding:28 }}>
          <div className="pf" style={{ fontSize:20, marginBottom:6, color:"#F5F0E8" }}>Contact Details</div>
          <div className="dm" style={{ fontSize:12, color:"#B8A98A", marginBottom:24 }}>Shown on website contact page, mobile app, and footer.</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            {[["Address","address","Near Sapa Karyalay...",true],["City / State / PIN","city","Uttar Pradesh 233304",true],["Phone Number","phone","+91 90447 92800",false],["WhatsApp Number","whatsapp","919044792800",false],["Instagram Username","instagram","happycarbazaar",false],["Email Address","email","happycarbazaar@gmail.com",true]].map(([lbl,k,ph,full])=>(
              <div key={k} style={{ gridColumn:full?"1/-1":"auto" }}>
                <Field label={lbl} accentColor={acc}><Inp value={bizForm[k]} onChange={e=>bf(k,e.target.value)} placeholder={ph} /></Field>
              </div>
            ))}
          </div>
          <button onClick={saveBiz} style={{ marginTop:22, background:acc, color:"#000", border:"none", padding:"12px 28px", fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:600, letterSpacing:1.5, textTransform:"uppercase", cursor:"pointer" }}>💾 Save Contact Info</button>
        </div>
      )}

      {/* ── HOURS ── */}
      {tab==="hours" && (
        <div style={{ background:"#111", border:"1px solid #1E1E1E", padding:28 }}>
          <div className="pf" style={{ fontSize:20, marginBottom:6, color:"#F5F0E8" }}>Hours & Links</div>
          <div className="dm" style={{ fontSize:12, color:"#B8A98A", marginBottom:24 }}>Update opening hours and your Google Maps link.</div>
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <Field label="Business Hours" accentColor={acc}><Inp value={bizForm.hours} onChange={e=>bf("hours",e.target.value)} placeholder="Every Day: 10:00 AM – 6:00 PM" /></Field>
            <Field label="Google Maps Link" accentColor={acc}><Inp value={bizForm.googleMapsLink} onChange={e=>bf("googleMapsLink",e.target.value)} placeholder="https://maps.app.goo.gl/..." /></Field>
          </div>
          <button onClick={saveBiz} style={{ marginTop:22, background:acc, color:"#000", border:"none", padding:"12px 28px", fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:600, letterSpacing:1.5, textTransform:"uppercase", cursor:"pointer" }}>💾 Save</button>
        </div>
      )}

      {/* ── POSTS / UPDATES ── */}
      {tab==="posts" && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <div>
              <div className="pf" style={{ fontSize:20, color:"#F5F0E8" }}>Posts & Updates</div>
              <div className="dm" style={{ fontSize:12, color:"#B8A98A", marginTop:2 }}>Publish announcements, offers & news directly to your website and mobile app.</div>
            </div>
            <button onClick={openAddPost} style={{ background:acc, color:"#000", border:"none", padding:"10px 20px", fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:600, letterSpacing:1.5, textTransform:"uppercase", cursor:"pointer" }}>📢 New Post</button>
          </div>
          {posts.length === 0 && (
            <div style={{ background:"#111", border:"1px solid #1E1E1E", padding:"48px", textAlign:"center" }}>
              <div style={{ fontSize:44, marginBottom:14 }}>📢</div>
              <div className="pf" style={{ fontSize:20, color:"#F5F0E8", marginBottom:8 }}>No updates yet</div>
              <div className="dm" style={{ fontSize:13, color:"#B8A98A", marginBottom:20 }}>Post your first announcement, offer, or news update.</div>
              <button onClick={openAddPost} style={{ background:acc, color:"#000", border:"none", padding:"11px 26px", fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:600, letterSpacing:1.5, textTransform:"uppercase", cursor:"pointer" }}>Create First Post</button>
            </div>
          )}
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {[...posts].sort((a,b)=>b.id-a.id).map(post=>(
              <div key={post.id} style={{ background:"#111", border:`1px solid ${post.pinned?acc:"#1E1E1E"}`, padding:"20px 22px", display:"flex", gap:16, alignItems:"flex-start", flexWrap:"wrap" }}>
                <div style={{ flex:1, minWidth:220 }}>
                  <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:8, flexWrap:"wrap" }}>
                    <span style={{ background:POST_TYPE_CLR[post.type]||"#333", color:"#fff", fontSize:9, letterSpacing:2, padding:"3px 10px" }}>{POST_TYPE_ICON[post.type]} {post.type.toUpperCase()}</span>
                    {post.pinned && <span style={{ background:acc, color:"#000", fontSize:9, letterSpacing:1.5, padding:"3px 8px", fontWeight:700 }}>📌 PINNED</span>}
                    <span className="dm" style={{ fontSize:11, color:"#555" }}>{post.date}</span>
                  </div>
                  <div className="pf" style={{ fontSize:17, fontWeight:700, color:"#F5F0E8", marginBottom:6 }}>{post.title}</div>
                  <div className="dm" style={{ fontSize:13, color:"#B8A98A", lineHeight:1.7 }}>{post.body}</div>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:7, flexShrink:0 }}>
                  <button onClick={()=>togglePin(post)} style={{ background:post.pinned?"#1A1A1A":"transparent", border:`1px solid ${post.pinned?acc:"#333"}`, color:post.pinned?acc:"#B8A98A", padding:"6px 14px", fontSize:10, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", whiteSpace:"nowrap" }}>{post.pinned?"📌 Unpin":"📌 Pin to Top"}</button>
                  <button onClick={()=>openEditPost(post)} style={{ background:"#1A1A1A", border:"1px solid #333", color:acc, padding:"6px 14px", fontSize:10, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Edit</button>
                  <button onClick={()=>openDelPost(post)} style={{ background:"transparent", border:"1px solid #E53E3E", color:"#E53E3E", padding:"6px 14px", fontSize:10, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── INVENTORY ── */}
      {tab==="cars" && (
        <div style={{ background:"#111", border:"1px solid #1E1E1E", overflow:"hidden" }}>
          <div style={{ overflowX:"auto" }}>
            <table className="tbl">
              <thead>
                <tr>
                  {["Vehicle","Year","Category","Price","Mileage","Fuel","Badge","Featured","Actions"].map(h=>(
                    <th key={h} style={{ color:acc, textAlign:h==="Actions"?"right":undefined }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cars.map(car=>(
                  <tr key={car.id}>
                    <td>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        {getPrimaryCarImage(car) ? (
                          <img src={getPrimaryCarImage(car)} alt={car.name} style={{ width:38, height:30, objectFit:"cover", border:"1px solid #2A2A2A" }} />
                        ) : (
                          <span style={{ fontSize:20 }}>{CAT_EMOJI[car.category]||"🚗"}</span>
                        )}
                        <div>
                          <div className="pf" style={{ fontSize:13, color:"#F5F0E8", fontWeight:700 }}>{car.name}</div>
                          <div className="dm" style={{ fontSize:10, color:"#444" }}>{car.color} {getCarImages(car).length ? `· ${getCarImages(car).length} photos` : ""}</div>
                        </div>
                      </div>
                    </td>
                    <td>{car.year}</td>
                    <td><span style={{ background:"#1A1A1A", border:"1px solid #2A2A2A", padding:"2px 8px", fontSize:9, color:"#B8A98A" }}>{car.category}</span></td>
                    <td className="pf" style={{ color:acc, fontSize:13, fontWeight:700 }}>₹{Number(car.price).toLocaleString()}</td>
                    <td>{car.mileage} km</td>
                    <td>{car.fuel}</td>
                    <td><span style={{ background:BADGE_CLR[car.badge]||"#333", color:"#fff", padding:"2px 7px", fontSize:8, letterSpacing:1 }}>{car.badge}</span></td>
                    <td style={{ textAlign:"center" }}>{car.featured?"⭐":"—"}</td>
                    <td>
                      <div style={{ display:"flex", gap:6, justifyContent:"flex-end" }}>
                        <button onClick={()=>openEditCar(car)} style={{ background:"#1A1A1A", border:"1px solid #333", color:acc, padding:"5px 12px", fontSize:10, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Edit</button>
                        <button onClick={()=>openDelCar(car)}  style={{ background:"transparent", border:"1px solid #E53E3E", color:"#E53E3E", padding:"5px 12px", fontSize:10, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══ CAR MODAL ═══ */}
      {(carModal==="add"||carModal==="edit") && (
        <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)setCarModal(null)}}>
          <div className="modal" style={{ maxWidth:720 }}>
            <button onClick={()=>setCarModal(null)} style={{ position:"absolute", top:12, right:16, background:"none", border:"none", color:"#B8A98A", fontSize:20, cursor:"pointer" }}>✕</button>
            <div className="dm" style={{ fontSize:9, letterSpacing:3, color:acc, textTransform:"uppercase", marginBottom:5 }}>{carModal==="add"?"New Vehicle":"Edit Vehicle"}</div>
            <h2 className="pf" style={{ fontSize:22, marginBottom:18, color:"#F5F0E8" }}>{carModal==="add"?"Add Car to Inventory":"Update Car Details"}</h2>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              <div style={{ gridColumn:"1/-1" }}><Field label="Car Name" accentColor={acc}><Inp value={carForm.name} onChange={e=>cf("name",e.target.value)} placeholder="e.g. Maruti Suzuki Swift" /></Field></div>
              <Field label="Year" accentColor={acc}><Inp type="number" value={carForm.year} onChange={e=>cf("year",e.target.value)} placeholder="e.g. 2022" /></Field>
              <Field label="Price (₹)" accentColor={acc}><Inp type="number" value={carForm.price} onChange={e=>cf("price",e.target.value)} placeholder="e.g. 450000" /></Field>
              <Field label="Mileage (km)" accentColor={acc}><Inp value={carForm.mileage} onChange={e=>cf("mileage",e.target.value)} placeholder="e.g. 28,000" /></Field>
              <Field label="Color" accentColor={acc}><Inp value={carForm.color} onChange={e=>cf("color",e.target.value)} placeholder="e.g. Pearl White" /></Field>
              <Field label="Fuel Type" accentColor={acc}><Sel value={carForm.fuel} onChange={e=>cf("fuel",e.target.value)} opts={["Petrol","Diesel","CNG","Hybrid","Electric"]} /></Field>
              <Field label="Transmission" accentColor={acc}><Sel value={carForm.transmission} onChange={e=>cf("transmission",e.target.value)} opts={["Automatic","Manual","AMT","CVT"]} /></Field>
              <Field label="Category" accentColor={acc}><Sel value={carForm.category} onChange={e=>cf("category",e.target.value)} opts={["Sedan","SUV","Sports","Luxury","Hatchback","Truck","Electric"]} /></Field>
              <Field label="Badge" accentColor={acc}><Sel value={carForm.badge} onChange={e=>cf("badge",e.target.value)} opts={["HOT DEAL","NEW IN","FEATURED","CERTIFIED","LUXURY","VALUE PICK"]} /></Field>
              <div style={{ gridColumn:"1/-1" }}><Field label="Description" accentColor={acc}><Inp value={carForm.description} onChange={e=>cf("description",e.target.value)} placeholder="Brief description of this car..." rows={3} /></Field></div>
              <div style={{ gridColumn:"1/-1" }}>
                <Field label={`Car Images (${getCarImages(carForm).length}/10)`} accentColor={acc}>
                  <div className="upload-zone" onClick={()=>carImageInputRef.current.click()} style={{ borderColor:acc+"66", padding:"22px 18px", marginTop:8 }}>
                    <div style={{ fontSize:30, marginBottom:8 }}>📷</div>
                    <div className="pf" style={{ fontSize:15, color:"#F5F0E8", marginBottom:5 }}>Click to Add Car Photos</div>
                    <div className="dm" style={{ fontSize:12, color:"#B8A98A", marginBottom:10 }}>Select up to 10 images from your computer · JPG/PNG/WebP · Max 3MB each</div>
                    <div style={{ background:acc, color:"#000", display:"inline-block", padding:"9px 20px", fontSize:11, fontWeight:600, letterSpacing:1.5, textTransform:"uppercase", fontFamily:"'DM Sans',sans-serif" }}>Choose Images</div>
                  </div>
                  <input ref={carImageInputRef} type="file" accept="image/*" multiple onChange={handleCarImagesUpload} style={{ display:"none" }} />
                  {getCarImages(carForm).length > 0 && (
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(92px,1fr))", gap:10, marginTop:12 }}>
                      {getCarImages(carForm).map((image,index)=>(
                        <div key={`${getImageSrc(image)}-${index}`} style={{ position:"relative", background:"#0D0D0D", border:"1px solid #2A2A2A", height:82, overflow:"hidden" }}>
                          <img src={getImageSrc(image)} alt={`Car ${index+1}`} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
                          {index===0 && <span className="dm" style={{ position:"absolute", left:5, bottom:5, background:acc, color:"#000", fontSize:8, letterSpacing:1, padding:"2px 5px", fontWeight:700 }}>MAIN</span>}
                          <button onClick={e=>{e.stopPropagation();removeCarImage(index);}} style={{ position:"absolute", top:4, right:4, width:22, height:22, background:"rgba(0,0,0,.78)", border:"1px solid #E53E3E", color:"#E53E3E", cursor:"pointer", fontSize:12, lineHeight:"18px" }}>×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </Field>
              </div>
              <div style={{ gridColumn:"1/-1", display:"flex", alignItems:"center", gap:12 }}>
                <input type="checkbox" id="feat" checked={carForm.featured} onChange={e=>cf("featured",e.target.checked)} style={{ width:18, height:18, accentColor:acc, cursor:"pointer" }} />
                <label htmlFor="feat" className="dm" style={{ fontSize:13, color:"#B8A98A", cursor:"pointer" }}>⭐ Feature this car on homepage</label>
              </div>
            </div>
            <div style={{ display:"flex", gap:10, marginTop:22 }}>
              <button onClick={saveCar} style={{ flex:1, background:acc, color:"#000", border:"none", padding:13, fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:600, letterSpacing:1.5, textTransform:"uppercase", cursor:"pointer" }}>{carModal==="add"?"Add to Inventory →":"Save Changes →"}</button>
              <button onClick={()=>setCarModal(null)} style={{ background:"transparent", color:acc, border:`1.5px solid ${acc}`, padding:"12px 20px", fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:600, cursor:"pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {carModal==="delete" && (
        <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)setCarModal(null)}}>
          <div className="modal" style={{ textAlign:"center" }}>
            <div style={{ fontSize:44, marginBottom:14 }}>🗑️</div>
            <h2 className="pf" style={{ fontSize:22, marginBottom:10, color:"#F5F0E8" }}>Remove This Car?</h2>
            <p className="dm" style={{ fontSize:13, color:"#B8A98A", lineHeight:1.8, marginBottom:22 }}>Remove <strong style={{ color:acc }}>{editCar?.year} {editCar?.name}</strong>? This cannot be undone.</p>
            <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
              <button onClick={deleteCar} style={{ background:"#E53E3E", border:"none", color:"#fff", padding:"11px 26px", fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:600, cursor:"pointer" }}>Yes, Remove</button>
              <button onClick={()=>setCarModal(null)} style={{ background:"transparent", color:acc, border:`1.5px solid ${acc}`, padding:"11px 22px", fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:600, cursor:"pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ POST MODAL ═══ */}
      {(postModal==="add"||postModal==="edit") && (
        <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)setPostModal(null)}}>
          <div className="modal" style={{ maxWidth:560 }}>
            <button onClick={()=>setPostModal(null)} style={{ position:"absolute", top:12, right:16, background:"none", border:"none", color:"#B8A98A", fontSize:20, cursor:"pointer" }}>✕</button>
            <div className="dm" style={{ fontSize:9, letterSpacing:3, color:acc, textTransform:"uppercase", marginBottom:5 }}>{postModal==="add"?"Publish New Update":"Edit Update"}</div>
            <h2 className="pf" style={{ fontSize:22, marginBottom:18, color:"#F5F0E8" }}>{postModal==="add"?"Post to Website & App":"Edit This Post"}</h2>
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <Field label="Post Title *" accentColor={acc}><Inp value={postForm.title} onChange={e=>pf("title",e.target.value)} placeholder="e.g. Grand Sale — 20% Off This Weekend!" /></Field>
              <Field label="Post Content *" accentColor={acc}><Inp value={postForm.body} onChange={e=>pf("body",e.target.value)} placeholder="Write your full announcement, offer details, or news here..." rows={5} /></Field>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                <Field label="Post Type" accentColor={acc}>
                  <Sel value={postForm.type} onChange={e=>pf("type",e.target.value)} opts={["offer","update","news","event"]} />
                </Field>
                <Field label="Date" accentColor={acc}><Inp type="date" value={postForm.date} onChange={e=>pf("date",e.target.value)} /></Field>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <input type="checkbox" id="pinPost" checked={postForm.pinned} onChange={e=>pf("pinned",e.target.checked)} style={{ width:18, height:18, accentColor:acc, cursor:"pointer" }} />
                <label htmlFor="pinPost" className="dm" style={{ fontSize:13, color:"#B8A98A", cursor:"pointer" }}>📌 Pin this post to top of homepage (replaces any existing pin)</label>
              </div>
              {/* Type preview */}
              <div style={{ background:"#0D0D0D", border:"1px solid #2A2A2A", padding:16 }}>
                <div className="dm" style={{ fontSize:9, color:"#555", letterSpacing:2, textTransform:"uppercase", marginBottom:10 }}>Preview Badge</div>
                <span style={{ background:POST_TYPE_CLR[postForm.type]||"#333", color:"#fff", fontSize:10, letterSpacing:2, padding:"4px 12px" }}>{POST_TYPE_ICON[postForm.type]} {postForm.type.toUpperCase()}</span>
              </div>
            </div>
            <div style={{ display:"flex", gap:10, marginTop:22 }}>
              <button onClick={savePost} style={{ flex:1, background:acc, color:"#000", border:"none", padding:13, fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:600, letterSpacing:1.5, textTransform:"uppercase", cursor:"pointer" }}>{postModal==="add"?"📢 Publish Now →":"💾 Save Changes →"}</button>
              <button onClick={()=>setPostModal(null)} style={{ background:"transparent", color:acc, border:`1.5px solid ${acc}`, padding:"12px 20px", fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:600, cursor:"pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {postModal==="deletePost" && (
        <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)setPostModal(null)}}>
          <div className="modal" style={{ textAlign:"center" }}>
            <div style={{ fontSize:44, marginBottom:14 }}>🗑️</div>
            <h2 className="pf" style={{ fontSize:22, marginBottom:10, color:"#F5F0E8" }}>Delete This Post?</h2>
            <p className="dm" style={{ fontSize:13, color:"#B8A98A", lineHeight:1.8, marginBottom:22 }}>Delete <strong style={{ color:acc }}>"{editPost?.title}"</strong>? It will be removed from your website and app.</p>
            <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
              <button onClick={deletePost} style={{ background:"#E53E3E", border:"none", color:"#fff", padding:"11px 26px", fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:600, cursor:"pointer" }}>Yes, Delete</button>
              <button onClick={()=>setPostModal(null)} style={{ background:"transparent", color:acc, border:`1.5px solid ${acc}`, padding:"11px 22px", fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:600, cursor:"pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div style={{ position:"fixed", bottom:24, right:24, background:"#1A1A1A", border:`1px solid ${acc}`, color:"#F5F0E8", padding:"13px 20px", fontFamily:"'DM Sans',sans-serif", fontSize:13, zIndex:999, boxShadow:"0 8px 32px rgba(0,0,0,.7)", animation:"fadeUp .3s ease" }}>{toast}</div>
      )}
    </div>
  );
}