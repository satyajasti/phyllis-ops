import { useState, useEffect } from "react";

// ─── Static ingredient list ───
const INGREDIENTS = [
  { id:"p1",  name:"Chicken Wings (whole)",     unit:"case/40lb",     category:"Proteins",    par:"2 cases/wk" },
  { id:"p2",  name:"Chicken Wingettes",          unit:"case/40lb",     category:"Proteins",    par:"1 case/wk" },
  { id:"p3",  name:"Chicken Breast",             unit:"bag/5 breasts", category:"Proteins",    par:"6 bags/wk" },
  { id:"p4",  name:"Turkey Bacon",               unit:"pack/1lb",      category:"Proteins",    par:"8 packs/wk" },
  { id:"p5",  name:"Ground Beef 80/20",          unit:"pack/5lb",      category:"Proteins",    par:"3 packs/wk" },
  { id:"p6",  name:"Ground Turkey",              unit:"pack/3lb",      category:"Proteins",    par:"4 packs/wk" },
  { id:"p7",  name:"Chicken Sausage",            unit:"pack/5lb",      category:"Proteins",    par:"3 packs/wk" },
  { id:"p8",  name:"Steak Filets",               unit:"case/10lb",     category:"Proteins",    par:"1 case/wk" },
  { id:"p9",  name:"Pulled Pork",                unit:"bag/10lb",      category:"Proteins",    par:"2 bags/wk" },
  { id:"p10", name:"Frozen Salmon",              unit:"case/10lb",     category:"Proteins",    par:"2 cases/wk" },
  { id:"p11", name:"Shrimp 16/20",               unit:"bag/5lb",       category:"Proteins",    par:"3 bags/wk" },
  { id:"p12", name:"Catfish Fillets",            unit:"case/10lb",     category:"Proteins",    par:"2 cases/wk" },
  { id:"p13", name:"Turkey Sausage Links",       unit:"box/5lb",       category:"Proteins",    par:"2 boxes/wk" },
  { id:"p14", name:"Turkey Sausage Patties",     unit:"box/5lb",       category:"Proteins",    par:"1 box/wk" },
  { id:"p15", name:"Bacon Thick-Cut",            unit:"pack/3lb",      category:"Proteins",    par:"5 packs/wk" },
  { id:"p16", name:"Eggs (large)",               unit:"case/15doz",    category:"Proteins",    par:"1.5 cases/wk" },
  { id:"p17", name:"Hard-Boiled Eggs (prepped)", unit:"dozen",         category:"Proteins",    par:"2 doz/day" },
  { id:"d1",  name:"Whole Milk",                 unit:"gallon",        category:"Dairy",       par:"4 gal/wk" },
  { id:"d2",  name:"Heavy Cream",                unit:"quart",         category:"Dairy",       par:"3 qt/wk" },
  { id:"d3",  name:"Half & Half",                unit:"box/18ct",      category:"Dairy",       par:"1 box/wk" },
  { id:"d4",  name:"Butter (unsalted)",          unit:"pack/4 sticks", category:"Dairy",       par:"5 packs/wk" },
  { id:"d5",  name:"Cream Cheese",               unit:"pack/3lb",      category:"Dairy",       par:"2 packs/wk" },
  { id:"d6",  name:"Shredded Cheddar",           unit:"bag/5lb",       category:"Dairy",       par:"1 bag/wk" },
  { id:"d7",  name:"Sour Cream",                 unit:"tub/5lb",       category:"Dairy",       par:"1 tub/wk" },
  { id:"d8",  name:"Parmesan (grated)",          unit:"bag/5lb",       category:"Dairy",       par:"1 bag/wk" },
  { id:"d9",  name:"American Cheese Slices",     unit:"pack/48sl",     category:"Dairy",       par:"2 packs/wk" },
  { id:"d10", name:"Pepper Jack Slices",         unit:"pack/48sl",     category:"Dairy",       par:"1 pack/wk" },
  { id:"d11", name:"Oat Milk (hospital)",        unit:"each/32oz",     category:"Dairy",       par:"12 units/wk" },
  { id:"d12", name:"Buttermilk",                 unit:"gallon",        category:"Dairy",       par:"3 gal/wk" },
  { id:"ds1", name:"Stone-Ground Grits",         unit:"bag/5lb",       category:"Dry Storage", par:"6 bags/wk" },
  { id:"ds2", name:"All-Purpose Flour",          unit:"bag/25lb",      category:"Dry Storage", par:"1 bag/wk" },
  { id:"ds3", name:"Self-Rising Flour",          unit:"bag/25lb",      category:"Dry Storage", par:"1 bag/wk" },
  { id:"ds4", name:"Cornmeal",                   unit:"bag/25lb",      category:"Dry Storage", par:"1 bag/wk" },
  { id:"ds5", name:"Cornstarch",                 unit:"box/1lb",       category:"Dry Storage", par:"2 boxes/wk" },
  { id:"ds6", name:"Panko Breadcrumbs",          unit:"bag/2.5lb",     category:"Dry Storage", par:"2 bags/wk" },
  { id:"ds7", name:"Chickpeas (canned)",         unit:"can/15oz",      category:"Dry Storage", par:"4 cans/wk" },
  { id:"ds8", name:"Crushed Tomatoes",           unit:"can/28oz",      category:"Dry Storage", par:"4 cans/wk" },
  { id:"ds9", name:"Chicken Broth/Stock",        unit:"qt carton",     category:"Dry Storage", par:"12 qt/wk" },
  { id:"ds10",name:"Canola Oil",                 unit:"jug/35lb",      category:"Dry Storage", par:"1 jug/wk" },
  { id:"ds11",name:"Brown Sugar",                unit:"bag/4lb",       category:"Dry Storage", par:"2 bags/wk" },
  { id:"ds12",name:"Granulated Sugar",           unit:"bag/25lb",      category:"Dry Storage", par:"1 bag/wk" },
  { id:"ds13",name:"Honey",                      unit:"bottle/5lb",    category:"Dry Storage", par:"1 bottle/wk" },
  { id:"ds14",name:"Vanilla Extract (pure)",     unit:"bottle/8oz",    category:"Dry Storage", par:"1 bottle/wk" },
  { id:"ds15",name:"Hot Sauce (Crystal)",        unit:"bottle/gallon", category:"Dry Storage", par:"1 bottle/wk" },
  { id:"ds16",name:"Soy Sauce",                  unit:"bottle/0.5gal", category:"Dry Storage", par:"1 bottle/wk" },
  { id:"pr1", name:"Yellow Onions",              unit:"bag/10lb",      category:"Produce",     par:"2 bags/wk" },
  { id:"pr2", name:"Red Onions",                 unit:"bag/3lb",       category:"Produce",     par:"1 bag/wk" },
  { id:"pr3", name:"Green Onions (scallions)",   unit:"bunch",         category:"Produce",     par:"3 bunches/wk" },
  { id:"pr4", name:"Garlic (fresh)",             unit:"bag/3lb",       category:"Produce",     par:"2 bags/wk" },
  { id:"pr5", name:"Jalapeños",                  unit:"gallon jar",    category:"Produce",     par:"1 jar/wk" },
  { id:"pr6", name:"Bell Peppers (red)",         unit:"each",          category:"Produce",     par:"8/wk" },
  { id:"pr7", name:"Bell Peppers (green)",       unit:"each",          category:"Produce",     par:"4/wk" },
  { id:"pr8", name:"Roma Tomatoes",              unit:"case/25lb",     category:"Produce",     par:"1 case/wk" },
  { id:"pr9", name:"Sweet Potatoes",             unit:"box/40lb",      category:"Produce",     par:"1 box/wk" },
  { id:"pr10",name:"Russet Potatoes",            unit:"bag/10lb",      category:"Produce",     par:"2 bags/wk" },
  { id:"pr11",name:"Collard Greens",             unit:"box/20lb",      category:"Produce",     par:"1 box/wk" },
  { id:"pr12",name:"Spinach (baby)",             unit:"bag/2lb",       category:"Produce",     par:"2 bags/wk" },
  { id:"pr13",name:"Lemons",                     unit:"bag/5lb",       category:"Produce",     par:"1 bag/wk" },
  { id:"pr14",name:"Avocados",                   unit:"each",          category:"Produce",     par:"6/wk" },
  { id:"pr15",name:"Cilantro",                   unit:"bunch",         category:"Produce",     par:"2 bunches/wk" },
  { id:"pr16",name:"Ginger (fresh root)",        unit:"lb",            category:"Produce",     par:"1 lb/wk" },
];

const CATS = ["Proteins","Dairy","Dry Storage","Produce"];

const DEFAULT_RECIPES = [
  { id:"r1", name:"Chicken & Waffles",     price:22, ingredients:[] },
  { id:"r2", name:"Catfish & Grits",       price:21, ingredients:[] },
  { id:"r3", name:"Shrimp & Grits",        price:23, ingredients:[] },
  { id:"r4", name:"Sweet Potato Pancakes", price:16, ingredients:[] },
  { id:"r5", name:"Chicken Wings (full)",  price:18, ingredients:[] },
  { id:"r6", name:"Lobster & Waffles",     price:44, ingredients:[] },
  { id:"r7", name:"Biscuits & Gravy",      price:14, ingredients:[] },
  { id:"r8", name:"Salmon & Grits",        price:24, ingredients:[] },
];

const DESIGNATIONS = [
  "General Manager","Kitchen Manager","Line Cook","Prep Cook",
  "Server","Host/Hostess","Dishwasher","Cashier","Catering Staff","Other"
];

const ADMIN = { id:"admin", firstName:"Satya", lastName:"", designation:"Owner", pin:"satya", isAdmin:true };

// ─── localStorage ───
const ls = {
  get:(k)=>{ try{ const v=localStorage.getItem(k); return v?JSON.parse(v):null; }catch{ return null; }},
  set:(k,v)=>{ try{ localStorage.setItem(k,JSON.stringify(v)); }catch{} },
};

function calcMetrics(sales, recipes, costs) {
  let rev=0, cogs=0;
  const details=[];
  recipes.forEach(r=>{
    const qty=parseInt(sales[r.id]||0);
    if(!qty) return;
    const r2=qty*r.price;
    const pc=r.ingredients.reduce((s,ri)=>s+(parseFloat(costs[ri.id]||0)*ri.qty),0);
    rev+=r2; cogs+=pc*qty;
    details.push({name:r.name,qty,revenue:r2,cogs:pc*qty,plateCost:pc});
  });
  return {rev,cogs,profit:rev-cogs,pct:rev>0?(cogs/rev*100).toFixed(1):"—",details};
}

// ─── Add ingredient to recipe ───
function AddIngRow({recipe,recipes,saveRecipes}) {
  const [selId,setSel]=useState(INGREDIENTS[0].id);
  const [qty,setQty]=useState("");
  return (
    <div style={{display:"flex",gap:"8px",alignItems:"center",flexWrap:"wrap",
      padding:"10px 16px",background:"#0e100e",borderTop:"1px solid #1e2a1e"}}>
      <span style={{fontSize:"11px",color:"#5a8a5a"}}>+ Ingredient:</span>
      <select value={selId} onChange={e=>setSel(e.target.value)} style={{
        flex:1,minWidth:"160px",background:"#0c0b09",border:"1px solid #2a3a2a",
        color:"#d4c9b8",padding:"5px 8px",fontSize:"12px",borderRadius:"2px",outline:"none"}}>
        {INGREDIENTS.map(i=><option key={i.id} value={i.id}>{i.name} ({i.unit})</option>)}
      </select>
      <input type="number" min="0" step="0.001" value={qty}
        onChange={e=>setQty(e.target.value)} placeholder="qty"
        style={{width:"64px",background:"#0c0b09",border:"1px solid #2a3a2a",
          color:"#c8a96e",padding:"5px 8px",fontSize:"12px",borderRadius:"2px",outline:"none"}}/>
      <button onClick={()=>{
        if(!qty||isNaN(parseFloat(qty))) return;
        saveRecipes(recipes.map(r=>r.id===recipe.id
          ?{...r,ingredients:[...r.ingredients,{id:selId,qty:parseFloat(qty)}]}:r));
        setQty("");
      }} style={{background:"#1e2a1e",color:"#7eb87e",border:"1px solid #3a5a3a",
        padding:"5px 12px",fontSize:"12px",cursor:"pointer",borderRadius:"2px"}}>Add</button>
    </div>
  );
}

// ─── Price comparison panel ───
function PricePanel({ing,yourCost,onClose}) {
  const [data,setData]=useState(null);
  const [loading,setLoading]=useState(true);
  const [err,setErr]=useState("");
  useEffect(()=>{
    (async()=>{
      try {
        const res=await fetch("/api/price-check",{
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify({ingredient:ing.name,unit:ing.unit,yourCost})
        });
        const json=await res.json();
        if(json.error) throw new Error(json.error);
        setData(json);
      } catch(e){ setErr("Could not fetch prices — check API key in Vercel settings."); }
      setLoading(false);
    })();
  },[]);
  return (
    <div style={{background:"#080f08",border:"1px solid #1e3a1e",padding:"14px 16px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}}>
        <span style={{fontSize:"11px",letterSpacing:"2px",textTransform:"uppercase",color:"#4a8a4a"}}>
          🔍 Price Compare — {ing.name} ({ing.unit})
        </span>
        <button onClick={onClose} style={{background:"none",border:"none",color:"#3a5a3a",cursor:"pointer",fontSize:"18px"}}>×</button>
      </div>
      {loading&&<div style={{color:"#4a7a4a",fontSize:"13px"}}>Checking Marietta GA supplier prices…</div>}
      {err&&<div style={{color:"#c07070",fontSize:"13px"}}>{err}</div>}
      {data&&!loading&&(
        <>
          <table style={{width:"100%",borderCollapse:"collapse",marginBottom:"10px"}}>
            <thead>
              <tr style={{borderBottom:"1px solid #1a2e1a"}}>
                {["Supplier","Est. Price","vs Your Cost","Notes"].map(h=>(
                  <th key={h} style={{padding:"6px 10px",textAlign:"left",fontSize:"10px",
                    letterSpacing:"1px",textTransform:"uppercase",color:"#3a6a3a"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.suppliers?.map((s,i)=>{
                const diff=yourCost>0&&s.price>0?((s.price-yourCost)/yourCost*100):null;
                const cheaper=diff!==null&&diff<0;
                return (
                  <tr key={i} style={{borderBottom:"1px solid #0e1e0e",background:s.recommended?"#0e1e0e":"transparent"}}>
                    <td style={{padding:"7px 10px",fontSize:"13px",color:s.recommended?"#a0d4a0":"#b0a898",fontWeight:s.recommended?"700":"400"}}>
                      {s.recommended&&"⭐ "}{s.name}
                    </td>
                    <td style={{padding:"7px 10px",fontSize:"13px",color:"#c8a96e",fontWeight:"600"}}>
                      {s.price>0?`$${s.price.toFixed(2)}`:"Call for quote"}
                    </td>
                    <td style={{padding:"7px 10px"}}>
                      {diff!==null&&yourCost>0?(
                        <span style={{fontSize:"12px",fontWeight:"600",color:cheaper?"#7eb87e":"#c07070"}}>
                          {cheaper?`Save $${(yourCost-s.price).toFixed(2)} (${Math.abs(diff).toFixed(0)}% less)`:`$${(s.price-yourCost).toFixed(2)} more`}
                        </span>
                      ):<span style={{fontSize:"11px",color:"#2a4a2a"}}>{yourCost===0?"Enter cost to compare":"—"}</span>}
                    </td>
                    <td style={{padding:"7px 10px",fontSize:"11px",color:"#4a6a4a"}}>{s.note}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{background:"#0a160a",border:"1px solid #1a3a1a",borderRadius:"2px",
            padding:"10px 12px",fontSize:"12px",color:"#7eb87e",lineHeight:"1.6"}}>
            <strong style={{color:"#9aca6a"}}>💡 Tip: </strong>{data.tip}
          </div>
          <div style={{marginTop:"6px",fontSize:"10px",color:"#254025"}}>
            AI estimates for Marietta GA market. Verify with supplier before ordering.
          </div>
        </>
      )}
    </div>
  );
}

// ══════════════════════════════════════
//  MAIN APP
// ══════════════════════════════════════
export default function PhyllisOps() {
  const [me,setMe]         = useState(null);
  const [selEmp,setSelEmp] = useState("");
  const [pin,setPin]       = useState("");
  const [pinErr,setPinErr] = useState("");
  const [tab,setTab]       = useState("Dashboard");

  // data
  const [costs,setCosts]     = useState({});
  const [recipes,setRecipes] = useState(DEFAULT_RECIPES);
  const [employees,setEmps]  = useState([]);
  const [par,setPar]         = useState({});
  const [parStaff,setPS]     = useState("");
  const [sales,setSales]     = useState({});
  const [date,setDate]       = useState(new Date().toISOString().split("T")[0]);
  const [ready,setReady]     = useState(false);
  const [flash,setFlash]     = useState("");
  const [editRec,setEditRec] = useState(null);
  const [pricePanel,setPP]   = useState(null);

  // new item / recipe form
  const [newName,setNN]  = useState("");
  const [newPx,setNP]    = useState("");

  // employee form
  const [empForm,setEmpForm] = useState({firstName:"",lastName:"",designation:DESIGNATIONS[0],rate:"",pin:""});
  const [editEmpId,setEditEmpId] = useState(null);

  const showFlash=m=>{setFlash(m);setTimeout(()=>setFlash(""),2400);};
  const isAdmin=me?.isAdmin;

  useEffect(()=>{
    const c=ls.get("phyllis-costs"),r=ls.get("phyllis-recipes"),e=ls.get("phyllis-employees");
    if(c) setCosts(c);
    if(r) setRecipes(r);
    if(e) setEmps(e);
    setReady(true);
  },[]);

  useEffect(()=>{
    const p=ls.get(`phyllis-par:${date}`),s=ls.get(`phyllis-sales:${date}`);
    if(p){setPar(p.entries||{});setPS(p.staff||"");}
    else{setPar({});setPS("");}
    setSales(s||{});
  },[date]);

  const saveCosts  =c=>{ls.set("phyllis-costs",c);setCosts(c);showFlash("Costs saved ✓");};
  const saveRecipes=r=>{ls.set("phyllis-recipes",r);setRecipes(r);showFlash("Recipe saved ✓");};
  const saveEmps   =e=>{ls.set("phyllis-employees",e);setEmps(e);showFlash("Employee saved ✓");};
  const savePAR    =()=>{ls.set(`phyllis-par:${date}`,{staff:parStaff,entries:par});showFlash("PAR saved ✓");};
  const saveSales  =()=>{ls.set(`phyllis-sales:${date}`,sales);showFlash("Sales saved ✓");};

  const M=calcMetrics(sales,recipes,costs);

  // ─── login logic ───
  const doLogin=()=>{
    if(selEmp==="admin"){
      if(pin===ADMIN.pin){setMe(ADMIN);setPinErr("");}
      else setPinErr("Incorrect PIN");
      return;
    }
    const emp=employees.find(e=>e.id===selEmp);
    if(!emp){setPinErr("Select a staff member");return;}
    if(pin===emp.pin){setMe(emp);setPinErr("");}
    else setPinErr("Incorrect PIN");
  };

  // ─── TABS per role ───
  const TABS = isAdmin
    ? ["Dashboard","PAR Entry","Ingredient Costs","Recipes","Sales Entry","COGS Report","Employees"]
    : ["Dashboard","PAR Entry","Sales Entry"];

  // ─── styles ───
  const S={
    page:{minHeight:"100vh",background:"#0c0b09",color:"#d4c9b8",fontFamily:"'Trebuchet MS',sans-serif"},
    card:{background:"#141210",border:"1px solid #252220",borderRadius:"3px"},
    lbl:{fontSize:"10px",letterSpacing:"3px",textTransform:"uppercase",color:"#666"},
    inp:{background:"#0c0b09",border:"1px solid #2e2b26",color:"#d4c9b8",
      padding:"6px 10px",fontSize:"13px",borderRadius:"2px",outline:"none"},
    btn:{background:"#c8a96e",color:"#0c0b09",border:"none",padding:"8px 18px",
      fontSize:"12px",fontWeight:"700",letterSpacing:"1px",cursor:"pointer",borderRadius:"2px"},
    btnSm:{background:"#1e2820",color:"#7eb87e",border:"1px solid #2e4830",
      padding:"5px 12px",fontSize:"11px",cursor:"pointer",borderRadius:"2px"},
    btnDanger:{background:"none",border:"1px solid #3a1e1e",color:"#8a5555",
      padding:"5px 12px",fontSize:"11px",cursor:"pointer",borderRadius:"2px"},
    th:{padding:"8px 12px",textAlign:"left",fontSize:"10px",letterSpacing:"1px",
      textTransform:"uppercase",color:"#555",background:"#100f0d"},
    td:{padding:"8px 12px",fontSize:"13px"},
    amber:{color:"#c8a96e"}, green:{color:"#7eb87e"}, red:{color:"#c07070"},
  };

  if(!ready) return (
    <div style={{...S.page,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <span style={S.lbl}>Loading…</span>
    </div>
  );

  // ══ LOGIN SCREEN ══
  if(!me) return (
    <div style={{...S.page,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{...S.card,padding:"44px 40px",width:"380px",maxWidth:"92vw"}}>
        <div style={{textAlign:"center",marginBottom:"32px"}}>
          <div style={{...S.lbl,marginBottom:"6px"}}>Phyllis Brunch · Marietta GA</div>
          <div style={{fontSize:"22px",color:"#f0e8d8",letterSpacing:"1px"}}>Operations Portal</div>
          <div style={{fontSize:"12px",color:"#555",marginTop:"4px"}}>PAR · Sales · COGS · Price Compare</div>
        </div>

        <div style={{marginBottom:"14px"}}>
          <div style={{...S.lbl,marginBottom:"6px"}}>Who are you?</div>
          <select value={selEmp} onChange={e=>setSelEmp(e.target.value)}
            style={{...S.inp,width:"100%",boxSizing:"border-box"}}>
            <option value="">— Select your name —</option>
            <option value="admin">👑 Satya (Admin)</option>
            {employees.map(e=>(
              <option key={e.id} value={e.id}>
                {e.firstName} {e.lastName} — {e.designation}
              </option>
            ))}
          </select>
        </div>

        <div style={{marginBottom:"18px"}}>
          <div style={{...S.lbl,marginBottom:"6px"}}>PIN</div>
          <input type="password" value={pin} placeholder="Enter your PIN"
            onChange={e=>setPin(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&doLogin()}
            style={{...S.inp,width:"100%",boxSizing:"border-box"}}/>
        </div>

        {pinErr&&<div style={{color:"#c07070",fontSize:"12px",marginBottom:"12px"}}>{pinErr}</div>}

        <button onClick={doLogin} style={{...S.btn,width:"100%"}}>SIGN IN</button>

        <div style={{marginTop:"16px",fontSize:"11px",color:"#444",textAlign:"center",lineHeight:"1.6"}}>
          Admin PIN: <span style={{color:"#666"}}>satya</span><br/>
          Employee PINs are set by admin in the Employees tab
        </div>
      </div>
    </div>
  );

  // ══ MAIN APP ══
  const fullName=me.isAdmin?"Satya (Admin)":`${me.firstName} ${me.lastName}`;

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={{background:"#141210",borderBottom:"1px solid #252220",
        padding:"10px 20px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
          <span style={{...S.amber,fontSize:"14px",fontWeight:"700",letterSpacing:"1px"}}>PHYLLIS</span>
          <span style={{fontSize:"11px",color:"#444"}}>|</span>
          <span style={{fontSize:"11px",color:"#666"}}>Operations</span>
          {isAdmin&&<span style={{background:"#2a1e0a",border:"1px solid #c8a96e44",color:"#c8a96e",
            fontSize:"10px",padding:"2px 7px",borderRadius:"10px",letterSpacing:"1px"}}>ADMIN</span>}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:"14px"}}>
          {flash&&<span style={{fontSize:"12px",...S.green}}>{flash}</span>}
          <span style={{fontSize:"12px",color:"#888"}}>{fullName}</span>
          <button onClick={()=>{setMe(null);setPin("");setSelEmp("");}}
            style={{background:"none",border:"1px solid #2e2b26",color:"#666",
              padding:"4px 10px",fontSize:"11px",cursor:"pointer",borderRadius:"2px"}}>
            Sign Out
          </button>
        </div>
      </div>

      {/* Date bar */}
      <div style={{background:"#100f0d",borderBottom:"1px solid #1e1c18",
        padding:"8px 20px",display:"flex",alignItems:"center",gap:"12px"}}>
        <span style={S.lbl}>Date</span>
        <input type="date" value={date} onChange={e=>setDate(e.target.value)}
          style={{...S.inp,padding:"4px 8px",fontSize:"12px"}}/>
        <span style={{fontSize:"12px",color:"#555"}}>
          {new Date(date+"T12:00:00").toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}
        </span>
      </div>

      {/* Tabs */}
      <div style={{background:"#100f0d",borderBottom:"1px solid #1e1c18",
        display:"flex",overflowX:"auto",padding:"0 12px"}}>
        {TABS.map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{
            background:"none",border:"none",
            borderBottom:tab===t?"2px solid #c8a96e":"2px solid transparent",
            color:tab===t?"#c8a96e":"#555",padding:"11px 14px",fontSize:"11px",
            letterSpacing:"1.5px",cursor:"pointer",whiteSpace:"nowrap",textTransform:"uppercase"}}>
            {t}{t==="Employees"&&isAdmin&&` (${employees.length})`}
          </button>
        ))}
      </div>

      <div style={{padding:"20px",maxWidth:"1100px",margin:"0 auto"}}>

        {/* ══ DASHBOARD ══ */}
        {tab==="Dashboard"&&(
          <div>
            <div style={{...S.lbl,marginBottom:"16px"}}>Summary — {date}</div>
            {!isAdmin&&(
              <div style={{background:"#0a120a",border:"1px solid #1a3a1a",borderRadius:"3px",
                padding:"10px 14px",marginBottom:"16px",fontSize:"12px",color:"#5a9a5a"}}>
                Welcome, {me.firstName}! Log your PAR counts and sales using the tabs above.
              </div>
            )}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:"12px",marginBottom:"20px"}}>
              {[
                {l:"Revenue",     v:`$${M.rev.toFixed(2)}`,    c:"#7eb87e"},
                {l:"Food COGS",   v:`$${M.cogs.toFixed(2)}`,   c:"#c07070"},
                {l:"Gross Profit",v:`$${M.profit.toFixed(2)}`, c:"#c8a96e"},
                {l:"COGS %",      v:`${M.pct}%`, c:parseFloat(M.pct)>35?"#c07070":"#7eb87e"},
              ].map(c=>(
                <div key={c.l} style={{...S.card,padding:"18px"}}>
                  <div style={{...S.lbl,marginBottom:"6px"}}>{c.l}</div>
                  <div style={{fontSize:"26px",color:c.c}}>{c.v}</div>
                </div>
              ))}
            </div>
            <div style={{...S.card,overflow:"hidden"}}>
              <div style={{padding:"12px 14px",borderBottom:"1px solid #1e1c18",...S.lbl}}>Sales breakdown</div>
              {M.details.length===0
                ?<div style={{padding:"24px",color:"#444",fontSize:"13px"}}>No sales for {date} — use Sales Entry tab.</div>
                :<table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead><tr>{["Item","Qty","Revenue","COGS","Plate Cost"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {M.details.map(r=>(
                      <tr key={r.name} style={{borderTop:"1px solid #1a1916"}}>
                        <td style={S.td}>{r.name}</td>
                        <td style={{...S.td,color:"#888"}}>{r.qty}</td>
                        <td style={{...S.td,...S.green}}>${r.revenue.toFixed(2)}</td>
                        <td style={{...S.td,...S.red}}>${r.cogs.toFixed(2)}</td>
                        <td style={{...S.td,...S.amber}}>${r.plateCost.toFixed(2)}</td>
                      </tr>
                    ))}
                    <tr style={{borderTop:"2px solid #252220",background:"#100f0d"}}>
                      <td style={{...S.td,...S.lbl}} colSpan={2}>Total</td>
                      <td style={{...S.td,fontWeight:"700",...S.green}}>${M.rev.toFixed(2)}</td>
                      <td style={{...S.td,fontWeight:"700",...S.red}}>${M.cogs.toFixed(2)}</td>
                      <td style={{...S.td,fontWeight:"700",...S.amber}}>${M.profit.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>}
            </div>
          </div>
        )}

        {/* ══ PAR ENTRY ══ */}
        {tab==="PAR Entry"&&(
          <div>
            <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"18px",flexWrap:"wrap"}}>
              <span style={S.lbl}>Completed by:</span>
              <input value={parStaff||fullName} onChange={e=>setPS(e.target.value)}
                style={{...S.inp,width:"200px"}}/>
              <button onClick={savePAR} style={S.btn}>Save PAR Sheet</button>
            </div>
            {CATS.map(cat=>(
              <div key={cat} style={{marginBottom:"20px"}}>
                <div style={{...S.amber,...S.lbl,marginBottom:"10px",paddingBottom:"6px",borderBottom:"1px solid #c8a96e22"}}>{cat}</div>
                <div style={{...S.card,overflow:"hidden"}}>
                  <table style={{width:"100%",borderCollapse:"collapse"}}>
                    <thead><tr>
                      <th style={S.th}>Item</th><th style={S.th}>Unit · PAR</th>
                      <th style={S.th}>On Hand</th><th style={S.th}>Order Qty</th>
                    </tr></thead>
                    <tbody>
                      {INGREDIENTS.filter(i=>i.category===cat).map((ing,idx)=>(
                        <tr key={ing.id} style={{borderTop:idx>0?"1px solid #1a1916":"none"}}>
                          <td style={S.td}>{ing.name}</td>
                          <td style={{...S.td,fontSize:"11px",color:"#555"}}>{ing.unit} · {ing.par}</td>
                          <td style={{padding:"4px 12px"}}>
                            <input type="number" min="0" step="0.5"
                              value={par[ing.id]?.on_hand??""} placeholder="—"
                              onChange={e=>setPar(p=>({...p,[ing.id]:{...(p[ing.id]||{}),on_hand:e.target.value}}))}
                              style={{...S.inp,width:"72px",padding:"5px 7px"}}/>
                          </td>
                          <td style={{padding:"4px 12px"}}>
                            <input type="number" min="0" step="0.5"
                              value={par[ing.id]?.order_qty??""} placeholder="—"
                              onChange={e=>setPar(p=>({...p,[ing.id]:{...(p[ing.id]||{}),order_qty:e.target.value}}))}
                              style={{...S.inp,width:"72px",padding:"5px 7px",color:"#7eb87e"}}/>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ══ INGREDIENT COSTS (admin only) ══ */}
        {tab==="Ingredient Costs"&&isAdmin&&(
          <div>
            <div style={{background:"#080f08",border:"1px solid #1a3a1a",borderRadius:"2px",
              padding:"10px 14px",marginBottom:"18px",fontSize:"12px",color:"#5a9a5a",lineHeight:"1.6"}}>
              💡 Enter what you pay per unit. Click <strong style={{color:"#7eb87e"}}>🔍 Compare Prices</strong> to see other suppliers.
            </div>
            {CATS.map(cat=>(
              <div key={cat} style={{marginBottom:"22px"}}>
                <div style={{...S.amber,...S.lbl,marginBottom:"10px",paddingBottom:"6px",borderBottom:"1px solid #c8a96e22"}}>{cat}</div>
                <div style={{...S.card,overflow:"hidden"}}>
                  <table style={{width:"100%",borderCollapse:"collapse"}}>
                    <thead><tr>
                      <th style={S.th}>Ingredient</th><th style={S.th}>Purchase Unit</th>
                      <th style={S.th}>Your Cost</th><th style={S.th}>Supplier Compare</th>
                    </tr></thead>
                    <tbody>
                      {INGREDIENTS.filter(i=>i.category===cat).map((ing,idx)=>(
                        <>
                          <tr key={ing.id} style={{borderTop:idx>0?"1px solid #1a1916":"none"}}>
                            <td style={S.td}>{ing.name}</td>
                            <td style={{...S.td,fontSize:"11px",color:"#555"}}>{ing.unit}</td>
                            <td style={{padding:"4px 12px"}}>
                              <div style={{display:"flex",alignItems:"center",gap:"4px"}}>
                                <span style={{color:"#555"}}>$</span>
                                <input type="number" min="0" step="0.01"
                                  value={costs[ing.id]??""}
                                  onChange={e=>saveCosts({...costs,[ing.id]:parseFloat(e.target.value)||0})}
                                  style={{...S.inp,width:"90px",padding:"5px 7px",color:"#c8a96e"}}/>
                              </div>
                            </td>
                            <td style={{padding:"4px 12px"}}>
                              <button onClick={()=>setPP(pricePanel===ing.id?null:ing.id)}
                                style={{background:"#0a160a",border:"1px solid #1e3e1e",color:"#5ab05a",
                                  padding:"5px 12px",fontSize:"11px",cursor:"pointer",borderRadius:"2px"}}>
                                {pricePanel===ing.id?"▲ Close":"🔍 Compare Prices"}
                              </button>
                            </td>
                          </tr>
                          {pricePanel===ing.id&&(
                            <tr key={ing.id+"-pp"}>
                              <td colSpan={4} style={{padding:0,background:"#080f08"}}>
                                <PricePanel ing={ing} yourCost={parseFloat(costs[ing.id]||0)} onClose={()=>setPP(null)}/>
                              </td>
                            </tr>
                          )}
                        </>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ══ RECIPES (admin only) ══ */}
        {tab==="Recipes"&&isAdmin&&(
          <div>
            <div style={{...S.lbl,marginBottom:"16px"}}>Map menu items → raw ingredients for COGS</div>
            <div style={{...S.card,padding:"14px 16px",marginBottom:"18px",
              display:"flex",gap:"8px",alignItems:"center",flexWrap:"wrap"}}>
              <input value={newName} onChange={e=>setNN(e.target.value)}
                placeholder="New menu item name" style={{...S.inp,flex:1,minWidth:"160px"}}/>
              <span style={{color:"#555"}}>$</span>
              <input type="number" value={newPx} onChange={e=>setNP(e.target.value)}
                placeholder="Sell price" min="0" style={{...S.inp,width:"80px",...S.amber}}/>
              <button onClick={()=>{
                if(!newName) return;
                saveRecipes([...recipes,{id:"r"+Date.now(),name:newName,price:parseFloat(newPx)||0,ingredients:[]}]);
                setNN(""); setNP("");
              }} style={S.btn}>+ Add Item</button>
            </div>
            {recipes.map(rec=>{
              const pc=rec.ingredients.reduce((s,ri)=>s+(parseFloat(costs[ri.id]||0)*ri.qty),0);
              const margin=rec.price-pc;
              const pct=rec.price>0?(pc/rec.price*100).toFixed(1):0;
              return (
                <div key={rec.id} style={{...S.card,marginBottom:"14px",overflow:"hidden"}}>
                  <div style={{padding:"12px 16px",borderBottom:"1px solid #1e1c18",
                    display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"8px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:"10px",flexWrap:"wrap"}}>
                      <span style={{fontSize:"15px",color:"#e8dfc8"}}>{rec.name}</span>
                      <span style={{...S.amber,fontSize:"13px"}}>${rec.price.toFixed(2)}</span>
                      {pc>0&&<>
                        <span style={{fontSize:"11px",color:"#444"}}>·</span>
                        <span style={{fontSize:"12px",...S.red}}>Cost ${pc.toFixed(2)}</span>
                        <span style={{fontSize:"12px",...S.green}}>Margin ${margin.toFixed(2)}</span>
                        <span style={{fontSize:"11px",color:parseFloat(pct)>35?"#c07070":"#7eb87e"}}>({pct}%)</span>
                      </>}
                    </div>
                    <div style={{display:"flex",gap:"6px"}}>
                      <button onClick={()=>setEditRec(editRec===rec.id?null:rec.id)}
                        style={{background:"none",border:"1px solid #2e2b26",color:"#888",
                          padding:"4px 10px",fontSize:"11px",cursor:"pointer",borderRadius:"2px"}}>
                        {editRec===rec.id?"✓ Done":"Edit"}
                      </button>
                      <button onClick={()=>saveRecipes(recipes.filter(r=>r.id!==rec.id))}
                        style={S.btnDanger}>Remove</button>
                    </div>
                  </div>
                  {rec.ingredients.length>0&&(
                    <div style={{padding:"8px 0"}}>
                      <table style={{width:"100%",borderCollapse:"collapse"}}>
                        <tbody>
                          {rec.ingredients.map((ri,i)=>{
                            const ing=INGREDIENTS.find(x=>x.id===ri.id);
                            const lc=parseFloat(costs[ri.id]||0)*ri.qty;
                            return (
                              <tr key={i} style={{borderTop:i>0?"1px solid #191714":"none"}}>
                                <td style={{...S.td,color:"#aaa"}}>{ing?.name??ri.id}</td>
                                <td style={{...S.td,fontSize:"11px",color:"#555"}}>{ri.qty} × {ing?.unit}</td>
                                <td style={{...S.td,...S.red,textAlign:"right"}}>${lc.toFixed(3)}</td>
                                {editRec===rec.id&&(
                                  <td style={{...S.td,textAlign:"right"}}>
                                    <button onClick={()=>saveRecipes(recipes.map(r=>r.id===rec.id
                                      ?{...r,ingredients:r.ingredients.filter((_,j)=>j!==i)}:r))}
                                      style={{background:"none",border:"none",color:"#8a5555",cursor:"pointer",fontSize:"16px"}}>×</button>
                                  </td>
                                )}
                              </tr>
                            );
                          })}
                          <tr style={{borderTop:"1px solid #252220",background:"#100f0d"}}>
                            <td style={{...S.td,...S.lbl}} colSpan={2}>Total plate cost</td>
                            <td style={{...S.td,...S.red,textAlign:"right",fontWeight:"700"}}>${pc.toFixed(2)}</td>
                            {editRec===rec.id&&<td/>}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                  {rec.ingredients.length===0&&editRec!==rec.id&&(
                    <div style={{padding:"12px 16px",fontSize:"12px",color:"#444"}}>No ingredients mapped. Click Edit to add.</div>
                  )}
                  {editRec===rec.id&&<AddIngRow recipe={rec} recipes={recipes} saveRecipes={saveRecipes}/>}
                </div>
              );
            })}
          </div>
        )}

        {/* ══ SALES ENTRY ══ */}
        {tab==="Sales Entry"&&(
          <div>
            <div style={{...S.lbl,marginBottom:"16px"}}>Enter units sold — {date}</div>
            <div style={{...S.card,overflow:"hidden",marginBottom:"14px"}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead><tr>
                  <th style={S.th}>Menu Item</th><th style={S.th}>Price</th>
                  <th style={S.th}>Qty Sold</th><th style={S.th}>Revenue</th><th style={S.th}>COGS</th>
                </tr></thead>
                <tbody>
                  {recipes.map((rec,idx)=>{
                    const qty=parseInt(sales[rec.id]||0);
                    const pc=rec.ingredients.reduce((s,ri)=>s+(parseFloat(costs[ri.id]||0)*ri.qty),0);
                    return (
                      <tr key={rec.id} style={{borderTop:idx>0?"1px solid #1a1916":"none"}}>
                        <td style={S.td}>{rec.name}</td>
                        <td style={{...S.td,...S.amber}}>${rec.price.toFixed(2)}</td>
                        <td style={{padding:"4px 12px"}}>
                          <input type="number" min="0" step="1"
                            value={sales[rec.id]??""} placeholder="0"
                            onChange={e=>setSales(p=>({...p,[rec.id]:parseInt(e.target.value)||0}))}
                            style={{...S.inp,width:"72px",padding:"5px 7px",fontSize:"14px"}}/>
                        </td>
                        <td style={{...S.td,...S.green}}>${(qty*rec.price).toFixed(2)}</td>
                        <td style={{...S.td,...S.red}}>{pc>0?`$${(qty*pc).toFixed(2)}`:"—"}</td>
                      </tr>
                    );
                  })}
                  <tr style={{borderTop:"2px solid #252220",background:"#100f0d"}}>
                    <td style={{...S.td,...S.lbl}} colSpan={2}>Totals</td>
                    <td style={{...S.td,fontWeight:"700",color:"#e8dfc8"}}>
                      {Object.values(sales).reduce((s,v)=>s+(parseInt(v)||0),0)} plates
                    </td>
                    <td style={{...S.td,fontWeight:"700",...S.green}}>${M.rev.toFixed(2)}</td>
                    <td style={{...S.td,fontWeight:"700",...S.red}}>${M.cogs.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <button onClick={saveSales} style={S.btn}>Save Sales Data</button>
          </div>
        )}

        {/* ══ COGS REPORT (admin only) ══ */}
        {tab==="COGS Report"&&isAdmin&&(
          <div>
            <div style={{...S.lbl,marginBottom:"20px"}}>P&L Report — {date}</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:"14px",marginBottom:"22px"}}>
              {[
                {l:"Gross Revenue",v:`$${M.rev.toFixed(2)}`,   c:"#7eb87e"},
                {l:"Food COGS",    v:`$${M.cogs.toFixed(2)}`,  c:"#c07070"},
                {l:"Gross Profit", v:`$${M.profit.toFixed(2)}`,c:"#c8a96e"},
                {l:"COGS %",v:`${M.pct}%`,c:parseFloat(M.pct)>35?"#c07070":"#7eb87e",sub:"Target ≤ 30%"},
              ].map(c=>(
                <div key={c.l} style={{background:"#141210",border:`1px solid ${c.c}33`,borderRadius:"3px",padding:"22px"}}>
                  <div style={{...S.lbl,color:c.c,marginBottom:"6px"}}>{c.l}</div>
                  <div style={{fontSize:"32px",color:c.c}}>{c.v}</div>
                  {c.sub&&<div style={{fontSize:"10px",color:"#555",marginTop:"4px"}}>{c.sub}</div>}
                </div>
              ))}
            </div>
            <div style={{...S.card,overflow:"hidden"}}>
              <div style={{padding:"12px 14px",borderBottom:"1px solid #1e1c18",...S.lbl}}>Item-level breakdown</div>
              {M.details.length===0
                ?<div style={{padding:"24px",color:"#444",fontSize:"13px"}}>No sales for {date}.</div>
                :<table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead><tr>{["Item","Qty","Revenue","COGS","Margin","COGS%"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {M.details.sort((a,b)=>b.revenue-a.revenue).map(r=>{
                      const pct=r.revenue>0?(r.cogs/r.revenue*100).toFixed(1):0;
                      return (
                        <tr key={r.name} style={{borderTop:"1px solid #1a1916"}}>
                          <td style={S.td}>{r.name}</td>
                          <td style={{...S.td,color:"#888"}}>{r.qty}</td>
                          <td style={{...S.td,...S.green}}>${r.revenue.toFixed(2)}</td>
                          <td style={{...S.td,...S.red}}>${r.cogs.toFixed(2)}</td>
                          <td style={{...S.td,...S.amber}}>${(r.revenue-r.cogs).toFixed(2)}</td>
                          <td style={{...S.td,color:parseFloat(pct)>35?"#c07070":"#7eb87e"}}>{pct}%</td>
                        </tr>
                      );
                    })}
                    <tr style={{borderTop:"2px solid #252220",background:"#100f0d"}}>
                      <td style={{...S.td,...S.lbl}} colSpan={2}>Total</td>
                      <td style={{...S.td,fontWeight:"700",...S.green}}>${M.rev.toFixed(2)}</td>
                      <td style={{...S.td,fontWeight:"700",...S.red}}>${M.cogs.toFixed(2)}</td>
                      <td style={{...S.td,fontWeight:"700",...S.amber}}>${M.profit.toFixed(2)}</td>
                      <td style={{...S.td,fontWeight:"700",color:parseFloat(M.pct)>35?"#c07070":"#7eb87e"}}>{M.pct}%</td>
                    </tr>
                  </tbody>
                </table>}
            </div>
          </div>
        )}

        {/* ══ EMPLOYEES (admin only) ══ */}
        {tab==="Employees"&&isAdmin&&(
          <div>
            <div style={{...S.lbl,marginBottom:"20px"}}>Staff Directory & Access Management</div>

            {/* ADD / EDIT FORM */}
            <div style={{...S.card,padding:"20px",marginBottom:"24px"}}>
              <div style={{...S.lbl,marginBottom:"14px",...S.amber}}>
                {editEmpId?"Edit Employee":"Add New Employee"}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:"10px",marginBottom:"12px"}}>
                <div>
                  <div style={{...S.lbl,marginBottom:"4px"}}>First Name *</div>
                  <input value={empForm.firstName} onChange={e=>setEmpForm(f=>({...f,firstName:e.target.value}))}
                    placeholder="Jennifer" style={{...S.inp,width:"100%",boxSizing:"border-box"}}/>
                </div>
                <div>
                  <div style={{...S.lbl,marginBottom:"4px"}}>Last Name *</div>
                  <input value={empForm.lastName} onChange={e=>setEmpForm(f=>({...f,lastName:e.target.value}))}
                    placeholder="Smith" style={{...S.inp,width:"100%",boxSizing:"border-box"}}/>
                </div>
                <div>
                  <div style={{...S.lbl,marginBottom:"4px"}}>Designation *</div>
                  <select value={empForm.designation} onChange={e=>setEmpForm(f=>({...f,designation:e.target.value}))}
                    style={{...S.inp,width:"100%",boxSizing:"border-box"}}>
                    {DESIGNATIONS.map(d=><option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <div style={{...S.lbl,marginBottom:"4px"}}>Hourly Rate ($) *</div>
                  <input type="number" min="0" step="0.50" value={empForm.rate}
                    onChange={e=>setEmpForm(f=>({...f,rate:e.target.value}))}
                    placeholder="15.00" style={{...S.inp,width:"100%",boxSizing:"border-box",color:"#c8a96e"}}/>
                </div>
                <div>
                  <div style={{...S.lbl,marginBottom:"4px"}}>Login PIN *</div>
                  <input type="text" value={empForm.pin}
                    onChange={e=>setEmpForm(f=>({...f,pin:e.target.value}))}
                    placeholder="e.g. 5678" maxLength={10}
                    style={{...S.inp,width:"100%",boxSizing:"border-box"}}/>
                </div>
              </div>
              <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
                <button onClick={()=>{
                  if(!empForm.firstName||!empForm.lastName||!empForm.pin) return showFlash("First name, last name & PIN required");
                  if(editEmpId){
                    saveEmps(employees.map(e=>e.id===editEmpId?{...e,...empForm}:e));
                    setEditEmpId(null);
                  } else {
                    saveEmps([...employees,{...empForm,id:"e"+Date.now()}]);
                  }
                  setEmpForm({firstName:"",lastName:"",designation:DESIGNATIONS[0],rate:"",pin:""});
                }} style={S.btn}>
                  {editEmpId?"Update Employee":"Save Employee"}
                </button>
                {editEmpId&&(
                  <button onClick={()=>{setEditEmpId(null);setEmpForm({firstName:"",lastName:"",designation:DESIGNATIONS[0],rate:"",pin:""}};}}
                    style={{...S.btnDanger,padding:"8px 16px"}}>Cancel</button>
                )}
              </div>
            </div>

            {/* EMPLOYEE TABLE */}
            {employees.length===0?(
              <div style={{...S.card,padding:"32px",textAlign:"center",color:"#444",fontSize:"13px"}}>
                No employees added yet. Use the form above to add your first staff member.
              </div>
            ):(
              <div style={{...S.card,overflow:"hidden"}}>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead><tr>
                    {["Name","Designation","Rate / hr","Login PIN","Actions"].map(h=>(
                      <th key={h} style={S.th}>{h}</th>))}
                  </tr></thead>
                  <tbody>
                    {employees.map((emp,idx)=>(
                      <tr key={emp.id} style={{borderTop:idx>0?"1px solid #1a1916":"none"}}>
                        <td style={S.td}>
                          <div style={{fontWeight:"600",color:"#e8dfc8"}}>{emp.firstName} {emp.lastName}</div>
                        </td>
                        <td style={{...S.td,color:"#888"}}>{emp.designation}</td>
                        <td style={{...S.td,...S.amber}}>${parseFloat(emp.rate||0).toFixed(2)}/hr</td>
                        <td style={{...S.td}}>
                          <span style={{background:"#1a1814",border:"1px solid #2e2b26",
                            padding:"2px 8px",borderRadius:"2px",fontSize:"12px",
                            fontFamily:"monospace",color:"#999",letterSpacing:"2px"}}>
                            {emp.pin}
                          </span>
                        </td>
                        <td style={{padding:"4px 12px"}}>
                          <div style={{display:"flex",gap:"6px"}}>
                            <button onClick={()=>{
                              setEditEmpId(emp.id);
                              setEmpForm({firstName:emp.firstName,lastName:emp.lastName,
                                designation:emp.designation,rate:emp.rate,pin:emp.pin});
                              window.scrollTo({top:0,behavior:"smooth"});
                            }} style={S.btnSm}>Edit</button>
                            <button onClick={()=>{
                              if(window.confirm(`Remove ${emp.firstName} ${emp.lastName}?`))
                                saveEmps(employees.filter(e=>e.id!==emp.id));
                            }} style={S.btnDanger}>Remove</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{padding:"10px 14px",borderTop:"1px solid #1e1c18",
                  fontSize:"11px",color:"#444",display:"flex",justifyContent:"space-between"}}>
                  <span>{employees.length} staff member{employees.length!==1?"s":""}</span>
                  <span>Weekly payroll estimate: ${employees.reduce((s,e)=>s+(parseFloat(e.rate||0)*40),0).toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
