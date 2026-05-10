import { useState, useEffect } from "react";

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
    details.push({
      name:r.name, qty, revenue:r2, cogs:pc*qty, plateCost:pc,
      margin:r2-(pc*qty),
      marginPct:r2>0?((r2-(pc*qty))/r2*100):0,
      cogsPct:r2>0?((pc*qty)/r2*100):0,
    });
  });
  return {rev,cogs,profit:rev-cogs,pct:rev>0?(cogs/rev*100).toFixed(1):"—",details};
}

// ── Mini horizontal bar ──
function Bar({value, max, color}) {
  const pct = max > 0 ? Math.min((value/max)*100, 100) : 0;
  return (
    <div style={{background:"#1a1916",borderRadius:"2px",height:"8px",width:"100%",minWidth:"80px"}}>
      <div style={{background:color,height:"8px",borderRadius:"2px",width:`${pct}%`,transition:"width 0.3s"}}/>
    </div>
  );
}

// ── Add ingredient row ──
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
      <input type="number" min="0" step="0.001" value={qty} onChange={e=>setQty(e.target.value)}
        placeholder="qty" style={{width:"64px",background:"#0c0b09",border:"1px solid #2a3a2a",
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

// ── Price comparison panel ──
function PricePanel({ing,yourCost,onClose}) {
  const [data,setData]=useState(null);
  const [loading,setLoading]=useState(true);
  const [err,setErr]=useState("");
  useEffect(()=>{
    (async()=>{
      try {
        const res=await fetch("/api/price-check",{
          method:"POST",headers:{"Content-Type":"application/json"},
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
            <thead><tr style={{borderBottom:"1px solid #1a2e1a"}}>
              {["Supplier","Est. Price","vs Your Cost","Notes"].map(h=>(
                <th key={h} style={{padding:"6px 10px",textAlign:"left",fontSize:"10px",
                  letterSpacing:"1px",textTransform:"uppercase",color:"#3a6a3a"}}>{h}</th>
              ))}
            </tr></thead>
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
        </>
      )}
    </div>
  );
}

// ══════════════════════════════════════
//  MAIN APP
// ══════════════════════════════════════
export default function PhyllisOps() {
  const [me,setMe]           = useState(null);
  const [selEmp,setSelEmp]   = useState("");
  const [pin,setPin]         = useState("");
  const [pinErr,setPinErr]   = useState("");
  const [tab,setTab]         = useState("Dashboard");
  const [costs,setCosts]     = useState({});
  const [recipes,setRecipes] = useState(DEFAULT_RECIPES);
  const [employees,setEmps]  = useState([]);
  const [par,setPar]         = useState({});
  const [parStaff,setPS]     = useState("");
  const [sales,setSales]     = useState({});
  const [labor,setLabor]     = useState({}); // {empId: hours}
  const [date,setDate]       = useState(new Date().toISOString().split("T")[0]);
  const [ready,setReady]     = useState(false);
  const [flash,setFlash]     = useState("");
  const [editRec,setEditRec] = useState(null);
  const [pricePanel,setPP]   = useState(null);
  const [newName,setNN]      = useState("");
  const [newPx,setNP]        = useState("");
  const [empForm,setEmpForm] = useState({firstName:"",lastName:"",designation:DESIGNATIONS[0],rate:"",pin:""});
  const [editEmpId,setEditEmpId] = useState(null);
  const [analyticView,setAV] = useState("profit"); // profit | volume | drain | cogspct

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
    const p=ls.get(`phyllis-par:${date}`);
    const s=ls.get(`phyllis-sales:${date}`);
    const l=ls.get(`phyllis-labor:${date}`);
    if(p){setPar(p.entries||{});setPS(p.staff||"");}
    else{setPar({});setPS("");}
    setSales(s||{});
    setLabor(l||{});
  },[date]);

  const saveCosts  =c=>{ls.set("phyllis-costs",c);setCosts(c);showFlash("Costs saved ✓");};
  const saveRecipes=r=>{ls.set("phyllis-recipes",r);setRecipes(r);showFlash("Recipe saved ✓");};
  const saveEmps   =e=>{ls.set("phyllis-employees",e);setEmps(e);showFlash("Employee saved ✓");};
  const savePAR    =()=>{ls.set(`phyllis-par:${date}`,{staff:parStaff,entries:par});showFlash("PAR saved ✓");};
  const saveSales  =()=>{ls.set(`phyllis-sales:${date}`,sales);showFlash("Sales saved ✓");};
  const saveLabor  =()=>{ls.set(`phyllis-labor:${date}`,labor);showFlash("Labor saved ✓");};

  const M = calcMetrics(sales,recipes,costs);

  // ── Labor cost calculation ──
  const laborCost = employees.reduce((sum,emp)=>{
    const hrs = parseFloat(labor[emp.id]||0);
    return sum + hrs * parseFloat(emp.rate||0);
  },0);
  const totalCost  = M.cogs + laborCost;
  const netProfit  = M.rev - totalCost;
  const laborPct   = M.rev>0?(laborCost/M.rev*100).toFixed(1):"—";
  const totalCostPct = M.rev>0?(totalCost/M.rev*100).toFixed(1):"—";

  // ── Analytics sorted lists ──
  const sorted = {
    profit: [...M.details].sort((a,b)=>b.margin-a.margin),
    volume: [...M.details].sort((a,b)=>b.qty-a.qty),
    drain:  [...M.details].sort((a,b)=>b.cogs-a.cogs),   // biggest food cost drain
    cogspct:[...M.details].sort((a,b)=>b.cogsPct-a.cogsPct), // worst margin %
  };

  const TABS = isAdmin
    ? ["Dashboard","PAR Entry","Ingredient Costs","Recipes","Sales Entry","Staff Hours","Analytics","COGS Report","Employees"]
    : ["Dashboard","PAR Entry","Sales Entry","Staff Hours","Analytics"];

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

  // ══ LOGIN ══
  if(!me) return (
    <div style={{...S.page,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{...S.card,padding:"44px 40px",width:"380px",maxWidth:"92vw"}}>
        <div style={{textAlign:"center",marginBottom:"32px"}}>
          <div style={{...S.lbl,marginBottom:"6px"}}>Phyllis Brunch · Marietta GA</div>
          <div style={{fontSize:"22px",color:"#f0e8d8",letterSpacing:"1px"}}>Operations Portal</div>
          <div style={{fontSize:"12px",color:"#555",marginTop:"4px"}}>PAR · Sales · COGS · Analytics · Staff</div>
        </div>
        <div style={{marginBottom:"14px"}}>
          <div style={{...S.lbl,marginBottom:"6px"}}>Who are you?</div>
          <select value={selEmp} onChange={e=>setSelEmp(e.target.value)}
            style={{...S.inp,width:"100%",boxSizing:"border-box"}}>
            <option value="">— Select your name —</option>
            <option value="admin">👑 Satya (Admin)</option>
            {employees.map(e=>(
              <option key={e.id} value={e.id}>{e.firstName} {e.lastName} — {e.designation}</option>
            ))}
          </select>
        </div>
        <div style={{marginBottom:"18px"}}>
          <div style={{...S.lbl,marginBottom:"6px"}}>PIN</div>
          <input type="password" value={pin} placeholder="Enter your PIN"
            onChange={e=>setPin(e.target.value)}
            onKeyDown={e=>{
              if(e.key!=="Enter") return;
              if(selEmp==="admin"){pin===ADMIN.pin?setMe(ADMIN):setPinErr("Incorrect PIN");}
              else{const emp=employees.find(x=>x.id===selEmp);
                emp&&pin===emp.pin?setMe(emp):setPinErr("Incorrect PIN");}
            }}
            style={{...S.inp,width:"100%",boxSizing:"border-box"}}/>
        </div>
        {pinErr&&<div style={{color:"#c07070",fontSize:"12px",marginBottom:"12px"}}>{pinErr}</div>}
        <button onClick={()=>{
          if(selEmp==="admin"){pin===ADMIN.pin?setMe(ADMIN):setPinErr("Incorrect PIN");}
          else{const emp=employees.find(x=>x.id===selEmp);
            if(!emp){setPinErr("Select a name");return;}
            pin===emp.pin?setMe(emp):setPinErr("Incorrect PIN");}
        }} style={{...S.btn,width:"100%"}}>SIGN IN</button>
        <div style={{marginTop:"16px",fontSize:"11px",color:"#444",textAlign:"center",lineHeight:"1.6"}}>
          Admin PIN: satya · Employee PINs set by admin
        </div>
      </div>
    </div>
  );

  const fullName=me.isAdmin?"Satya (Admin)":`${me.firstName} ${me.lastName}`;

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={{background:"#141210",borderBottom:"1px solid #252220",
        padding:"10px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"8px"}}>
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
          <button onClick={()=>{setMe(null);setPin("");setSelEmp("");setPinErr("");}}
            style={{background:"none",border:"1px solid #2e2b26",color:"#666",
              padding:"4px 10px",fontSize:"11px",cursor:"pointer",borderRadius:"2px"}}>Sign Out</button>
        </div>
      </div>

      {/* Date bar */}
      <div style={{background:"#100f0d",borderBottom:"1px solid #1e1c18",
        padding:"8px 20px",display:"flex",alignItems:"center",gap:"12px",flexWrap:"wrap"}}>
        <span style={S.lbl}>Date</span>
        <input type="date" value={date} onChange={e=>setDate(e.target.value)}
          style={{...S.inp,padding:"4px 8px",fontSize:"12px"}}/>
        <span style={{fontSize:"12px",color:"#555"}}>
          {new Date(date+"T12:00:00").toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}
        </span>
      </div>

      {/* Tabs */}
      <div style={{background:"#100f0d",borderBottom:"1px solid #1e1c18",display:"flex",overflowX:"auto",padding:"0 12px"}}>
        {TABS.map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{
            background:"none",border:"none",
            borderBottom:tab===t?"2px solid #c8a96e":"2px solid transparent",
            color:tab===t?"#c8a96e":"#555",padding:"11px 14px",fontSize:"11px",
            letterSpacing:"1.5px",cursor:"pointer",whiteSpace:"nowrap",textTransform:"uppercase"}}>
            {t}
          </button>
        ))}
      </div>

      <div style={{padding:"20px",maxWidth:"1100px",margin:"0 auto"}}>

        {/* ══ DASHBOARD ══ */}
        {tab==="Dashboard"&&(
          <div>
            <div style={{...S.lbl,marginBottom:"16px"}}>Summary — {date}</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:"12px",marginBottom:"20px"}}>
              {[
                {l:"Revenue",       v:`$${M.rev.toFixed(2)}`,        c:"#7eb87e"},
                {l:"Food COGS",     v:`$${M.cogs.toFixed(2)}`,       c:"#c07070"},
                {l:"Labor Cost",    v:`$${laborCost.toFixed(2)}`,    c:"#d4a060"},
                {l:"Total Cost",    v:`$${totalCost.toFixed(2)}`,    c:"#c07070"},
                {l:"Net Profit",    v:`$${netProfit.toFixed(2)}`,    c:netProfit>=0?"#7eb87e":"#c07070"},
                {l:"Food COGS %",   v:`${M.pct}%`,                  c:parseFloat(M.pct)>35?"#c07070":"#7eb87e"},
                {l:"Labor %",       v:`${laborPct}%`,                c:parseFloat(laborPct)>30?"#c07070":"#7eb87e"},
                {l:"Total Cost %",  v:`${totalCostPct}%`,            c:parseFloat(totalCostPct)>65?"#c07070":"#7eb87e"},
              ].map(c=>(
                <div key={c.l} style={{...S.card,padding:"16px"}}>
                  <div style={{...S.lbl,marginBottom:"6px"}}>{c.l}</div>
                  <div style={{fontSize:"22px",color:c.c,fontWeight:"600"}}>{c.v}</div>
                </div>
              ))}
            </div>
            {/* Quick top performers */}
            {M.details.length>0&&(
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:"14px"}}>
                <div style={{...S.card,padding:"16px"}}>
                  <div style={{...S.lbl,marginBottom:"12px",...S.green}}>🏆 Top Profit Makers</div>
                  {[...M.details].sort((a,b)=>b.margin-a.margin).slice(0,4).map((r,i)=>(
                    <div key={r.name} style={{display:"flex",justifyContent:"space-between",
                      padding:"6px 0",borderBottom:"1px solid #1a1916",alignItems:"center"}}>
                      <span style={{fontSize:"13px",color:"#ccc"}}>#{i+1} {r.name}</span>
                      <span style={{...S.green,fontSize:"13px",fontWeight:"600"}}>${r.margin.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div style={{...S.card,padding:"16px"}}>
                  <div style={{...S.lbl,marginBottom:"12px",color:"#d4a060"}}>📦 Most Ordered</div>
                  {[...M.details].sort((a,b)=>b.qty-a.qty).slice(0,4).map((r,i)=>(
                    <div key={r.name} style={{display:"flex",justifyContent:"space-between",
                      padding:"6px 0",borderBottom:"1px solid #1a1916",alignItems:"center"}}>
                      <span style={{fontSize:"13px",color:"#ccc"}}>#{i+1} {r.name}</span>
                      <span style={{color:"#d4a060",fontSize:"13px",fontWeight:"600"}}>{r.qty} plates</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {M.details.length===0&&(
              <div style={{...S.card,padding:"24px",textAlign:"center",color:"#444",fontSize:"13px"}}>
                No sales for {date} — enter data in Sales Entry tab.
              </div>
            )}
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
                            <input type="number" min="0" step="0.5" value={par[ing.id]?.on_hand??""} placeholder="—"
                              onChange={e=>setPar(p=>({...p,[ing.id]:{...(p[ing.id]||{}),on_hand:e.target.value}}))}
                              style={{...S.inp,width:"72px",padding:"5px 7px"}}/>
                          </td>
                          <td style={{padding:"4px 12px"}}>
                            <input type="number" min="0" step="0.5" value={par[ing.id]?.order_qty??""} placeholder="—"
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

        {/* ══ INGREDIENT COSTS ══ */}
        {tab==="Ingredient Costs"&&isAdmin&&(
          <div>
            <div style={{background:"#080f08",border:"1px solid #1a3a1a",borderRadius:"2px",
              padding:"10px 14px",marginBottom:"18px",fontSize:"12px",color:"#5a9a5a",lineHeight:"1.6"}}>
              💡 Enter what you pay per unit. Click <strong style={{color:"#7eb87e"}}>🔍 Compare Prices</strong> to check other suppliers.
            </div>
            {CATS.map(cat=>(
              <div key={cat} style={{marginBottom:"22px"}}>
                <div style={{...S.amber,...S.lbl,marginBottom:"10px",paddingBottom:"6px",borderBottom:"1px solid #c8a96e22"}}>{cat}</div>
                <div style={{...S.card,overflow:"hidden"}}>
                  <table style={{width:"100%",borderCollapse:"collapse"}}>
                    <thead><tr>
                      <th style={S.th}>Ingredient</th><th style={S.th}>Unit</th>
                      <th style={S.th}>Your Cost</th><th style={S.th}>Compare</th>
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
                                <input type="number" min="0" step="0.01" value={costs[ing.id]??""}
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

        {/* ══ RECIPES ══ */}
        {tab==="Recipes"&&isAdmin&&(
          <div>
            <div style={{...S.lbl,marginBottom:"16px"}}>Map menu items → ingredients for COGS</div>
            <div style={{...S.card,padding:"14px 16px",marginBottom:"18px",
              display:"flex",gap:"8px",alignItems:"center",flexWrap:"wrap"}}>
              <input value={newName} onChange={e=>setNN(e.target.value)}
                placeholder="New menu item" style={{...S.inp,flex:1,minWidth:"160px"}}/>
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
              const pct=rec.price>0?(pc/rec.price*100).toFixed(1):0;
              return (
                <div key={rec.id} style={{...S.card,marginBottom:"14px",overflow:"hidden"}}>
                  <div style={{padding:"12px 16px",borderBottom:"1px solid #1e1c18",
                    display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"8px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:"10px",flexWrap:"wrap"}}>
                      <span style={{fontSize:"15px",color:"#e8dfc8"}}>{rec.name}</span>
                      <span style={{...S.amber,fontSize:"13px"}}>${rec.price.toFixed(2)}</span>
                      {pc>0&&<>
                        <span style={{fontSize:"12px",...S.red}}>Cost ${pc.toFixed(2)}</span>
                        <span style={{fontSize:"12px",...S.green}}>Margin ${(rec.price-pc).toFixed(2)}</span>
                        <span style={{fontSize:"11px",color:parseFloat(pct)>35?"#c07070":"#7eb87e"}}>({pct}%)</span>
                      </>}
                    </div>
                    <div style={{display:"flex",gap:"6px"}}>
                      <button onClick={()=>setEditRec(editRec===rec.id?null:rec.id)}
                        style={{background:"none",border:"1px solid #2e2b26",color:"#888",
                          padding:"4px 10px",fontSize:"11px",cursor:"pointer",borderRadius:"2px"}}>
                        {editRec===rec.id?"✓ Done":"Edit"}
                      </button>
                      <button onClick={()=>saveRecipes(recipes.filter(r=>r.id!==rec.id))} style={S.btnDanger}>Remove</button>
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
                  <th style={S.th}>Qty Sold</th><th style={S.th}>Revenue</th><th style={S.th}>Food COGS</th>
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
                          <input type="number" min="0" step="1" value={sales[rec.id]??""} placeholder="0"
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

        {/* ══ STAFF HOURS ══ */}
        {tab==="Staff Hours"&&(
          <div>
            <div style={{...S.lbl,marginBottom:"8px"}}>Log hours worked — {date}</div>
            <div style={{fontSize:"12px",color:"#555",marginBottom:"16px"}}>
              Enter hours each staff member worked today. Labor cost auto-calculates from their hourly rate.
            </div>
            {employees.length===0?(
              <div style={{...S.card,padding:"32px",textAlign:"center",color:"#444",fontSize:"13px"}}>
                No employees added. Admin must add staff in the Employees tab first.
              </div>
            ):(
              <>
                <div style={{...S.card,overflow:"hidden",marginBottom:"14px"}}>
                  <table style={{width:"100%",borderCollapse:"collapse"}}>
                    <thead><tr>
                      <th style={S.th}>Staff Member</th>
                      <th style={S.th}>Designation</th>
                      <th style={S.th}>Rate / hr</th>
                      <th style={S.th}>Hours Worked</th>
                      <th style={S.th}>Labor Cost</th>
                    </tr></thead>
                    <tbody>
                      {employees.map((emp,idx)=>{
                        const hrs=parseFloat(labor[emp.id]||0);
                        const cost=hrs*parseFloat(emp.rate||0);
                        return (
                          <tr key={emp.id} style={{borderTop:idx>0?"1px solid #1a1916":"none"}}>
                            <td style={S.td}>
                              <div style={{fontWeight:"600",color:"#e8dfc8"}}>{emp.firstName} {emp.lastName}</div>
                            </td>
                            <td style={{...S.td,color:"#888",fontSize:"12px"}}>{emp.designation}</td>
                            <td style={{...S.td,...S.amber}}>${parseFloat(emp.rate||0).toFixed(2)}</td>
                            <td style={{padding:"4px 12px"}}>
                              <input type="number" min="0" step="0.5" max="24"
                                value={labor[emp.id]??""} placeholder="0"
                                onChange={e=>setLabor(p=>({...p,[emp.id]:parseFloat(e.target.value)||0}))}
                                style={{...S.inp,width:"72px",padding:"5px 7px"}}/>
                            </td>
                            <td style={{...S.td,color:"#d4a060",fontWeight:"600"}}>
                              {hrs>0?`$${cost.toFixed(2)}`:"—"}
                            </td>
                          </tr>
                        );
                      })}
                      <tr style={{borderTop:"2px solid #252220",background:"#100f0d"}}>
                        <td style={{...S.td,...S.lbl}} colSpan={3}>Total Labor</td>
                        <td style={{...S.td,fontWeight:"700",color:"#e8dfc8"}}>
                          {Object.values(labor).reduce((s,v)=>s+(parseFloat(v)||0),0).toFixed(1)} hrs
                        </td>
                        <td style={{...S.td,fontWeight:"700",color:"#d4a060"}}>${laborCost.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <button onClick={saveLabor} style={S.btn}>Save Staff Hours</button>

                {/* Labor vs Revenue summary */}
                {M.rev>0&&(
                  <div style={{...S.card,padding:"16px",marginTop:"16px"}}>
                    <div style={{...S.lbl,marginBottom:"12px"}}>Labor cost impact</div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:"12px"}}>
                      {[
                        {l:"Revenue",         v:`$${M.rev.toFixed(2)}`,        c:"#7eb87e"},
                        {l:"Food COGS",        v:`$${M.cogs.toFixed(2)} (${M.pct}%)`,c:"#c07070"},
                        {l:"Labor Cost",       v:`$${laborCost.toFixed(2)} (${laborPct}%)`,c:"#d4a060"},
                        {l:"Net Profit",       v:`$${netProfit.toFixed(2)}`,   c:netProfit>=0?"#7eb87e":"#c07070"},
                        {l:"Total Cost %",     v:`${totalCostPct}%`,           c:parseFloat(totalCostPct)>65?"#c07070":"#7eb87e"},
                      ].map(c=>(
                        <div key={c.l} style={{background:"#100f0d",borderRadius:"3px",padding:"12px"}}>
                          <div style={{...S.lbl,marginBottom:"4px"}}>{c.l}</div>
                          <div style={{fontSize:"16px",color:c.c,fontWeight:"600"}}>{c.v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ══ ANALYTICS ══ */}
        {tab==="Analytics"&&(
          <div>
            <div style={{...S.lbl,marginBottom:"8px"}}>Item Performance — {date}</div>
            <div style={{fontSize:"12px",color:"#555",marginBottom:"16px"}}>
              See which items make you the most money and which are costing you most.
            </div>

            {/* View selector */}
            <div style={{display:"flex",gap:"6px",marginBottom:"20px",flexWrap:"wrap"}}>
              {[
                {k:"profit", l:"💰 Most Profitable",  c:"#7eb87e"},
                {k:"volume", l:"📦 Most Ordered",      c:"#d4a060"},
                {k:"drain",  l:"🔻 Biggest Cost Drain",c:"#c07070"},
                {k:"cogspct",l:"⚠️ Worst Margin %",    c:"#c07070"},
              ].map(v=>(
                <button key={v.k} onClick={()=>setAV(v.k)} style={{
                  background:analyticView===v.k?"#1e1c18":"none",
                  border:`1px solid ${analyticView===v.k?v.c:"#2e2b26"}`,
                  color:analyticView===v.k?v.c:"#666",
                  padding:"7px 14px",fontSize:"12px",cursor:"pointer",borderRadius:"2px",
                  fontWeight:analyticView===v.k?"700":"400"}}>
                  {v.l}
                </button>
              ))}
            </div>

            {M.details.length===0?(
              <div style={{...S.card,padding:"40px",textAlign:"center",color:"#444",fontSize:"13px"}}>
                No sales data for {date}. Enter sales in the Sales Entry tab to see analytics.
              </div>
            ):(
              <>
                {/* Main analytics table */}
                <div style={{...S.card,overflow:"hidden",marginBottom:"20px"}}>
                  <div style={{padding:"12px 14px",borderBottom:"1px solid #1e1c18",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={S.lbl}>
                      {analyticView==="profit"&&"Ranked by total profit generated"}
                      {analyticView==="volume"&&"Ranked by quantity sold"}
                      {analyticView==="drain" &&"Ranked by food cost (biggest drain on cash)"}
                      {analyticView==="cogspct"&&"Ranked by food cost % (worst margin items)"}
                    </span>
                  </div>
                  <table style={{width:"100%",borderCollapse:"collapse"}}>
                    <thead><tr>
                      <th style={S.th}>#</th>
                      <th style={S.th}>Item</th>
                      <th style={S.th}>Qty</th>
                      <th style={S.th}>Revenue</th>
                      <th style={S.th}>Food COGS</th>
                      <th style={S.th}>Profit</th>
                      <th style={S.th}>COGS %</th>
                      <th style={S.th}>Visual</th>
                    </tr></thead>
                    <tbody>
                      {sorted[analyticView].map((r,i)=>{
                        const isGood = analyticView==="profit"||analyticView==="volume";
                        const rank0Color = isGood
                          ? (i===0?"#c8a96e":i===1?"#888":i===2?"#7a5a30":"#555")
                          : (i===0?"#c07070":i===1?"#d4a060":"#555");
                        const maxVal = {
                          profit: Math.max(...M.details.map(x=>x.margin)),
                          volume: Math.max(...M.details.map(x=>x.qty)),
                          drain:  Math.max(...M.details.map(x=>x.cogs)),
                          cogspct:Math.max(...M.details.map(x=>x.cogsPct)),
                        }[analyticView];
                        const barVal = {profit:r.margin,volume:r.qty,drain:r.cogs,cogspct:r.cogsPct}[analyticView];
                        const barColor = analyticView==="profit"?"#7eb87e":analyticView==="volume"?"#c8a96e":"#c07070";
                        return (
                          <tr key={r.name} style={{borderTop:"1px solid #1a1916",
                            background:i===0&&isGood?"#141e14":i===0&&!isGood?"#1e1010":"transparent"}}>
                            <td style={{...S.td,color:rank0Color,fontWeight:"700",fontSize:"16px"}}>
                              {i===0?"★":i+1}
                            </td>
                            <td style={{...S.td,fontWeight:i===0?"700":"400",color:i===0?"#e8dfc8":"#ccc"}}>
                              {r.name}
                            </td>
                            <td style={{...S.td,color:"#888"}}>{r.qty}</td>
                            <td style={{...S.td,...S.green}}>${r.revenue.toFixed(2)}</td>
                            <td style={{...S.td,...S.red}}>${r.cogs.toFixed(2)}</td>
                            <td style={{...S.td,fontWeight:"600",color:r.margin>=0?"#7eb87e":"#c07070"}}>
                              ${r.margin.toFixed(2)}
                            </td>
                            <td style={{...S.td,color:r.cogsPct>35?"#c07070":"#7eb87e"}}>
                              {r.cogsPct.toFixed(1)}%
                            </td>
                            <td style={{padding:"8px 12px",minWidth:"100px"}}>
                              <Bar value={barVal} max={maxVal} color={barColor}/>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Insight cards */}
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:"14px"}}>
                  {[
                    {
                      title:"🏆 Star Item",
                      sub:"Highest total profit",
                      item:sorted.profit[0],
                      val:`$${sorted.profit[0]?.margin.toFixed(2)} profit`,
                      color:"#7eb87e",bg:"#0a160a",
                      tip:`Push this item — every extra order = $${sorted.profit[0]?.plateCost>0?(sorted.profit[0]?.revenue/sorted.profit[0]?.qty - sorted.profit[0]?.plateCost).toFixed(2):"—"} in your pocket.`
                    },
                    {
                      title:"📦 Volume King",
                      sub:"Most plates sold",
                      item:sorted.volume[0],
                      val:`${sorted.volume[0]?.qty} plates`,
                      color:"#d4a060",bg:"#160e00",
                      tip:"This is what customers want most. Make sure it's always available and consistently good."
                    },
                    {
                      title:"🔻 Cost Drain",
                      sub:"Eating most of your food budget",
                      item:sorted.drain[0],
                      val:`$${sorted.drain[0]?.cogs.toFixed(2)} in food cost`,
                      color:"#c07070",bg:"#160a0a",
                      tip:`Check the recipe cost breakdown for ${sorted.drain[0]?.name} — there may be a cheaper ingredient swap.`
                    },
                    {
                      title:"⚠️ Worst Margin",
                      sub:"Lowest profit % item",
                      item:sorted.cogspct[0],
                      val:`${sorted.cogspct[0]?.cogsPct.toFixed(1)}% food cost`,
                      color:"#c07070",bg:"#160a0a",
                      tip:`Consider raising the price or reducing portion cost. Target is under 30% food cost.`
                    },
                  ].filter(c=>c.item).map(c=>(
                    <div key={c.title} style={{background:c.bg,border:`1px solid ${c.color}33`,borderRadius:"3px",padding:"16px"}}>
                      <div style={{fontSize:"13px",color:c.color,fontWeight:"700",marginBottom:"2px"}}>{c.title}</div>
                      <div style={{...S.lbl,marginBottom:"8px"}}>{c.sub}</div>
                      <div style={{fontSize:"18px",color:"#e8dfc8",marginBottom:"4px"}}>{c.item?.name}</div>
                      <div style={{fontSize:"14px",color:c.color,fontWeight:"600",marginBottom:"10px"}}>{c.val}</div>
                      <div style={{fontSize:"11px",color:"#666",lineHeight:"1.5",borderTop:`1px solid ${c.color}22`,paddingTop:"8px"}}>
                        {c.tip}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ══ COGS REPORT ══ */}
        {tab==="COGS Report"&&isAdmin&&(
          <div>
            <div style={{...S.lbl,marginBottom:"20px"}}>Full P&L Report — {date}</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:"14px",marginBottom:"22px"}}>
              {[
                {l:"Gross Revenue",   v:`$${M.rev.toFixed(2)}`,         c:"#7eb87e"},
                {l:"Food COGS",       v:`$${M.cogs.toFixed(2)} (${M.pct}%)`, c:"#c07070"},
                {l:"Labor Cost",      v:`$${laborCost.toFixed(2)} (${laborPct}%)`, c:"#d4a060"},
                {l:"Total Cost",      v:`$${totalCost.toFixed(2)} (${totalCostPct}%)`, c:"#c07070"},
                {l:"Net Profit",      v:`$${netProfit.toFixed(2)}`,      c:netProfit>=0?"#7eb87e":"#c07070",
                  sub:netProfit>=0?"":"⚠️ Loss day"},
              ].map(c=>(
                <div key={c.l} style={{background:"#141210",border:`1px solid ${c.c}33`,borderRadius:"3px",padding:"20px"}}>
                  <div style={{...S.lbl,color:c.c,marginBottom:"6px"}}>{c.l}</div>
                  <div style={{fontSize:"24px",color:c.c,fontWeight:"600"}}>{c.v}</div>
                  {c.sub&&<div style={{fontSize:"11px",color:c.c,marginTop:"4px"}}>{c.sub}</div>}
                </div>
              ))}
            </div>

            {/* Labor breakdown */}
            {laborCost>0&&(
              <div style={{...S.card,overflow:"hidden",marginBottom:"16px"}}>
                <div style={{padding:"12px 14px",borderBottom:"1px solid #1e1c18",...S.lbl,color:"#d4a060"}}>
                  Staff labor breakdown
                </div>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead><tr>
                    {["Staff","Designation","Rate","Hours","Cost"].map(h=><th key={h} style={S.th}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {employees.filter(e=>parseFloat(labor[e.id]||0)>0).map((emp,i)=>{
                      const hrs=parseFloat(labor[emp.id]||0);
                      const cost=hrs*parseFloat(emp.rate||0);
                      return (
                        <tr key={emp.id} style={{borderTop:i>0?"1px solid #1a1916":"none"}}>
                          <td style={S.td}>{emp.firstName} {emp.lastName}</td>
                          <td style={{...S.td,color:"#888",fontSize:"12px"}}>{emp.designation}</td>
                          <td style={{...S.td,...S.amber}}>${parseFloat(emp.rate).toFixed(2)}/hr</td>
                          <td style={{...S.td,color:"#ccc"}}>{hrs}h</td>
                          <td style={{...S.td,color:"#d4a060",fontWeight:"600"}}>${cost.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                    <tr style={{borderTop:"2px solid #252220",background:"#100f0d"}}>
                      <td style={{...S.td,...S.lbl}} colSpan={4}>Total Labor</td>
                      <td style={{...S.td,fontWeight:"700",color:"#d4a060"}}>${laborCost.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* Item breakdown */}
            <div style={{...S.card,overflow:"hidden"}}>
              <div style={{padding:"12px 14px",borderBottom:"1px solid #1e1c18",...S.lbl}}>Item-level food breakdown</div>
              {M.details.length===0
                ?<div style={{padding:"24px",color:"#444",fontSize:"13px"}}>No sales for {date}.</div>
                :<table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead><tr>
                    {["Item","Qty","Revenue","Food COGS","Profit","COGS%"].map(h=><th key={h} style={S.th}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {M.details.sort((a,b)=>b.margin-a.margin).map(r=>{
                      const pct=r.revenue>0?(r.cogs/r.revenue*100).toFixed(1):0;
                      return (
                        <tr key={r.name} style={{borderTop:"1px solid #1a1916"}}>
                          <td style={S.td}>{r.name}</td>
                          <td style={{...S.td,color:"#888"}}>{r.qty}</td>
                          <td style={{...S.td,...S.green}}>${r.revenue.toFixed(2)}</td>
                          <td style={{...S.td,...S.red}}>${r.cogs.toFixed(2)}</td>
                          <td style={{...S.td,fontWeight:"600",color:r.margin>=0?"#7eb87e":"#c07070"}}>${r.margin.toFixed(2)}</td>
                          <td style={{...S.td,color:parseFloat(pct)>35?"#c07070":"#7eb87e"}}>{pct}%</td>
                        </tr>
                      );
                    })}
                    <tr style={{borderTop:"2px solid #252220",background:"#100f0d"}}>
                      <td style={{...S.td,...S.lbl}} colSpan={2}>Food Total</td>
                      <td style={{...S.td,fontWeight:"700",...S.green}}>${M.rev.toFixed(2)}</td>
                      <td style={{...S.td,fontWeight:"700",...S.red}}>${M.cogs.toFixed(2)}</td>
                      <td style={{...S.td,fontWeight:"700",...S.green}}>${M.profit.toFixed(2)}</td>
                      <td style={{...S.td,fontWeight:"700",color:parseFloat(M.pct)>35?"#c07070":"#7eb87e"}}>{M.pct}%</td>
                    </tr>
                  </tbody>
                </table>}
            </div>
          </div>
        )}

        {/* ══ EMPLOYEES ══ */}
        {tab==="Employees"&&isAdmin&&(
          <div>
            <div style={{...S.lbl,marginBottom:"20px"}}>Staff Directory</div>
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
                  if(!empForm.firstName||!empForm.lastName||!empForm.pin){
                    showFlash("First name, last name & PIN required"); return;
                  }
                  if(editEmpId){
                    saveEmps(employees.map(e=>e.id===editEmpId?{...e,...empForm}:e));
                    setEditEmpId(null);
                  } else {
                    saveEmps([...employees,{...empForm,id:"e"+Date.now()}]);
                  }
                  setEmpForm({firstName:"",lastName:"",designation:DESIGNATIONS[0],rate:"",pin:""});
                }} style={S.btn}>{editEmpId?"Update Employee":"Save Employee"}</button>
                {editEmpId&&(
                  <button onClick={()=>{
                    setEditEmpId(null);
                    setEmpForm({firstName:"",lastName:"",designation:DESIGNATIONS[0],rate:"",pin:""});
                  }} style={{...S.btnDanger,padding:"8px 16px"}}>Cancel</button>
                )}
              </div>
            </div>

            {employees.length===0?(
              <div style={{...S.card,padding:"32px",textAlign:"center",color:"#444",fontSize:"13px"}}>
                No employees yet. Add your first staff member above.
              </div>
            ):(
              <div style={{...S.card,overflow:"hidden"}}>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead><tr>
                    {["Name","Designation","Rate / hr","Weekly Est.","PIN","Actions"].map(h=><th key={h} style={S.th}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {employees.map((emp,idx)=>(
                      <tr key={emp.id} style={{borderTop:idx>0?"1px solid #1a1916":"none"}}>
                        <td style={S.td}>
                          <div style={{fontWeight:"600",color:"#e8dfc8"}}>{emp.firstName} {emp.lastName}</div>
                        </td>
                        <td style={{...S.td,color:"#888",fontSize:"12px"}}>{emp.designation}</td>
                        <td style={{...S.td,...S.amber}}>${parseFloat(emp.rate||0).toFixed(2)}/hr</td>
                        <td style={{...S.td,color:"#666",fontSize:"12px"}}>
                          ${(parseFloat(emp.rate||0)*40).toFixed(2)}
                        </td>
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
                  <span>Est. weekly payroll (40h): ${employees.reduce((s,e)=>s+(parseFloat(e.rate||0)*40),0).toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
