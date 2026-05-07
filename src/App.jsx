import { useState, useEffect } from "react";

const INGREDIENTS = [
  // PROTEINS
  { id:"p1",  name:"Chicken Wings (whole)",    unit:"case/40lb",    category:"Proteins",    par:"2 cases/wk" },
  { id:"p2",  name:"Chicken Wingettes",         unit:"case/40lb",    category:"Proteins",    par:"1 case/wk" },
  { id:"p3",  name:"Chicken Breast",            unit:"bag/5 breasts",category:"Proteins",    par:"6 bags/wk" },
  { id:"p4",  name:"Turkey Bacon",              unit:"pack/1lb",     category:"Proteins",    par:"8 packs/wk" },
  { id:"p5",  name:"Ground Beef 80/20",         unit:"pack/5lb",     category:"Proteins",    par:"3 packs/wk" },
  { id:"p6",  name:"Ground Turkey",             unit:"pack/3lb",     category:"Proteins",    par:"4 packs/wk" },
  { id:"p7",  name:"Chicken Sausage",           unit:"pack/5lb",     category:"Proteins",    par:"3 packs/wk" },
  { id:"p8",  name:"Steak Filets",              unit:"case/10lb",    category:"Proteins",    par:"1 case/wk" },
  { id:"p9",  name:"Pulled Pork",               unit:"bag/10lb",     category:"Proteins",    par:"2 bags/wk" },
  { id:"p10", name:"Frozen Salmon",             unit:"case/10lb",    category:"Proteins",    par:"2 cases/wk" },
  { id:"p11", name:"Shrimp 16/20",              unit:"bag/5lb",      category:"Proteins",    par:"3 bags/wk" },
  { id:"p12", name:"Catfish Fillets",           unit:"case/10lb",    category:"Proteins",    par:"2 cases/wk" },
  { id:"p13", name:"Turkey Sausage Links",      unit:"box/5lb",      category:"Proteins",    par:"2 boxes/wk" },
  { id:"p14", name:"Turkey Sausage Patties",    unit:"box/5lb",      category:"Proteins",    par:"1 box/wk" },
  { id:"p15", name:"Bacon Thick-Cut",           unit:"pack/3lb",     category:"Proteins",    par:"5 packs/wk" },
  { id:"p16", name:"Eggs (large)",              unit:"case/15doz",   category:"Proteins",    par:"1.5 cases/wk" },
  { id:"p17", name:"Hard-Boiled Eggs (prepped)",unit:"dozen",        category:"Proteins",    par:"2 doz/day" },
  // DAIRY
  { id:"d1",  name:"Whole Milk",                unit:"gallon",       category:"Dairy",       par:"4 gal/wk" },
  { id:"d2",  name:"Heavy Cream",               unit:"quart",        category:"Dairy",       par:"3 qt/wk" },
  { id:"d3",  name:"Half & Half",               unit:"box/18ct",     category:"Dairy",       par:"1 box/wk" },
  { id:"d4",  name:"Butter (unsalted)",         unit:"pack/4 sticks",category:"Dairy",       par:"5 packs/wk" },
  { id:"d5",  name:"Cream Cheese",              unit:"pack/3lb",     category:"Dairy",       par:"2 packs/wk" },
  { id:"d6",  name:"Shredded Cheddar",          unit:"bag/5lb",      category:"Dairy",       par:"1 bag/wk" },
  { id:"d7",  name:"Sour Cream",                unit:"tub/5lb",      category:"Dairy",       par:"1 tub/wk" },
  { id:"d8",  name:"Parmesan (grated)",         unit:"bag/5lb",      category:"Dairy",       par:"1 bag/wk" },
  { id:"d9",  name:"American Cheese Slices",    unit:"pack/48sl",    category:"Dairy",       par:"2 packs/wk" },
  { id:"d10", name:"Pepper Jack Slices",        unit:"pack/48sl",    category:"Dairy",       par:"1 pack/wk" },
  { id:"d11", name:"Oat Milk (hospital)",       unit:"each/32oz",    category:"Dairy",       par:"12 units/wk" },
  { id:"d12", name:"Buttermilk",               unit:"gallon",        category:"Dairy",       par:"3 gal/wk" },
  // DRY STORAGE
  { id:"ds1", name:"Stone-Ground Grits",        unit:"bag/5lb",      category:"Dry Storage", par:"6 bags/wk" },
  { id:"ds2", name:"All-Purpose Flour",         unit:"bag/25lb",     category:"Dry Storage", par:"1 bag/wk" },
  { id:"ds3", name:"Self-Rising Flour",         unit:"bag/25lb",     category:"Dry Storage", par:"1 bag/wk" },
  { id:"ds4", name:"Cornmeal",                  unit:"bag/25lb",     category:"Dry Storage", par:"1 bag/wk" },
  { id:"ds5", name:"Cornstarch",               unit:"box/1lb",       category:"Dry Storage", par:"2 boxes/wk" },
  { id:"ds6", name:"Panko Breadcrumbs",         unit:"bag/2.5lb",    category:"Dry Storage", par:"2 bags/wk" },
  { id:"ds7", name:"Chickpeas (canned)",        unit:"can/15oz",     category:"Dry Storage", par:"4 cans/wk" },
  { id:"ds8", name:"Crushed Tomatoes",          unit:"can/28oz",     category:"Dry Storage", par:"4 cans/wk" },
  { id:"ds9", name:"Chicken Broth/Stock",       unit:"qt carton",    category:"Dry Storage", par:"12 qt/wk" },
  { id:"ds10",name:"Canola Oil",                unit:"jug/35lb",     category:"Dry Storage", par:"1 jug/wk" },
  { id:"ds11",name:"Brown Sugar",               unit:"bag/4lb",      category:"Dry Storage", par:"2 bags/wk" },
  { id:"ds12",name:"Granulated Sugar",          unit:"bag/25lb",     category:"Dry Storage", par:"1 bag/wk" },
  { id:"ds13",name:"Honey",                     unit:"bottle/5lb",   category:"Dry Storage", par:"1 bottle/wk" },
  { id:"ds14",name:"Vanilla Extract (pure)",    unit:"bottle/8oz",   category:"Dry Storage", par:"1 bottle/wk" },
  { id:"ds15",name:"Hot Sauce (Crystal)",       unit:"bottle/gallon",category:"Dry Storage", par:"1 bottle/wk" },
  { id:"ds16",name:"Soy Sauce",                 unit:"bottle/½gal",  category:"Dry Storage", par:"1 bottle/wk" },
  // PRODUCE
  { id:"pr1", name:"Yellow Onions",             unit:"bag/10lb",     category:"Produce",     par:"2 bags/wk" },
  { id:"pr2", name:"Red Onions",                unit:"bag/3lb",      category:"Produce",     par:"1 bag/wk" },
  { id:"pr3", name:"Green Onions (scallions)",  unit:"bunch",        category:"Produce",     par:"3 bunches/wk" },
  { id:"pr4", name:"Garlic (fresh)",            unit:"bag/3lb",      category:"Produce",     par:"2 bags/wk" },
  { id:"pr5", name:"Jalapeños",                 unit:"gallon jar",   category:"Produce",     par:"1 jar/wk" },
  { id:"pr6", name:"Bell Peppers (red)",        unit:"each",         category:"Produce",     par:"8/wk" },
  { id:"pr7", name:"Bell Peppers (green)",      unit:"each",         category:"Produce",     par:"4/wk" },
  { id:"pr8", name:"Roma Tomatoes",             unit:"case/25lb",    category:"Produce",     par:"1 case/wk" },
  { id:"pr9", name:"Sweet Potatoes",            unit:"box/40lb",     category:"Produce",     par:"1 box/wk" },
  { id:"pr10",name:"Russet Potatoes",           unit:"bag/10lb",     category:"Produce",     par:"2 bags/wk" },
  { id:"pr11",name:"Collard Greens",            unit:"box/20lb",     category:"Produce",     par:"1 box/wk" },
  { id:"pr12",name:"Spinach (baby)",            unit:"bag/2lb",      category:"Produce",     par:"2 bags/wk" },
  { id:"pr13",name:"Lemons",                    unit:"bag/5lb",      category:"Produce",     par:"1 bag/wk" },
  { id:"pr14",name:"Avocados",                  unit:"each",         category:"Produce",     par:"6/wk" },
  { id:"pr15",name:"Cilantro",                  unit:"bunch",        category:"Produce",     par:"2 bunches/wk" },
  { id:"pr16",name:"Ginger (fresh root)",       unit:"lb",           category:"Produce",     par:"1 lb/wk" },
];

const DEFAULT_RECIPES = [
  { id:"r1", name:"Chicken & Waffles",        price:22, ingredients:[] },
  { id:"r2", name:"Catfish & Grits",          price:21, ingredients:[] },
  { id:"r3", name:"Shrimp & Grits",           price:23, ingredients:[] },
  { id:"r4", name:"Sweet Potato Pancakes",    price:16, ingredients:[] },
  { id:"r5", name:"Chicken Wings (full)",     price:18, ingredients:[] },
  { id:"r6", name:"Lobster & Waffles",        price:44, ingredients:[] },
  { id:"r7", name:"Biscuits & Gravy",         price:14, ingredients:[] },
  { id:"r8", name:"Salmon & Grits",           price:24, ingredients:[] },
];

const USERS = [
  { role:"owner",   label:"Owner — Satya",   pin:"satya" },
  { role:"gm",      label:"GM — Jennifer",   pin:"1234" },
  { role:"kitchen", label:"Kitchen Staff",   pin:"kitchen" },
];

const TABS = ["Dashboard","PAR Entry","Ingredient Costs","Recipes","Sales Entry","COGS Report"];

function computeMetrics(salesEntries, recipes, ingredientCosts) {
  let revenue = 0, cogs = 0;
  const details = [];
  recipes.forEach(recipe => {
    const qty = parseInt(salesEntries[recipe.id] || 0);
    if (!qty) return;
    const itemRevenue = qty * recipe.price;
    const plateCost = recipe.ingredients.reduce(
      (s, ri) => s + (parseFloat(ingredientCosts[ri.id] || 0) * ri.qty), 0
    );
    const totalCost = plateCost * qty;
    revenue += itemRevenue;
    cogs += totalCost;
    details.push({ name: recipe.name, qty, revenue: itemRevenue, cogs: totalCost, plateCost });
  });
  return {
    revenue, cogs,
    profit: revenue - cogs,
    cogsPercent: revenue > 0 ? (cogs / revenue * 100).toFixed(1) : "—",
    details
  };
}

function AddIngredientRow({ recipe, recipes, saveRecipes }) {
  const [selId, setSelId] = useState(INGREDIENTS[0].id);
  const [qty, setQty] = useState("");
  return (
    <div style={{display:"flex",gap:"8px",alignItems:"center",flexWrap:"wrap",
      padding:"10px 16px",background:"#100f0d",borderTop:"1px solid #252220"}}>
      <span style={{fontSize:"11px",color:"#666",flexShrink:0}}>+ Ingredient:</span>
      <select value={selId} onChange={e=>setSelId(e.target.value)} style={{
        flex:1,minWidth:"160px",background:"#0c0b09",border:"1px solid #2e2b26",
        color:"#d4c9b8",padding:"5px 8px",fontSize:"12px",borderRadius:"2px",outline:"none"}}>
        {INGREDIENTS.map(i=><option key={i.id} value={i.id}>{i.name} ({i.unit})</option>)}
      </select>
      <input type="number" min="0" step="0.001" value={qty} onChange={e=>setQty(e.target.value)}
        placeholder="qty" style={{width:"64px",background:"#0c0b09",border:"1px solid #2e2b26",
        color:"#c8a96e",padding:"5px 8px",fontSize:"12px",borderRadius:"2px",outline:"none"}}/>
      <button onClick={()=>{
        if(!qty||isNaN(parseFloat(qty)))return;
        const updated=recipes.map(r=>r.id===recipe.id
          ?{...r,ingredients:[...r.ingredients,{id:selId,qty:parseFloat(qty)}]}:r);
        saveRecipes(updated); setQty("");
      }} style={{background:"#2a2520",color:"#c8a96e",border:"1px solid #3a3228",
        padding:"5px 12px",fontSize:"12px",cursor:"pointer",borderRadius:"2px",flexShrink:0}}>
        Add
      </button>
    </div>
  );
}

export default function PhyllisOps() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loginRole, setLoginRole] = useState(USERS[0]);
  const [pinInput, setPinInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [ingredientCosts, setIngredientCosts] = useState({});
  const [recipes, setRecipes] = useState(DEFAULT_RECIPES);
  const [parEntries, setParEntries] = useState({});
  const [parStaff, setParStaff] = useState("");
  const [salesEntries, setSalesEntries] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(true);
  const [flash, setFlash] = useState("");
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");

  const showFlash = (msg) => { setFlash(msg); setTimeout(()=>setFlash(""),2200); };

  const ls = {
    get: (key) => { try { const v=localStorage.getItem(key); return v?JSON.parse(v):null; } catch(e){return null;} },
    set: (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch(e){} },
  };

  // ─── Load persistent data ───
  useEffect(()=>{
    try {
      const c=ls.get("phyllis-costs");
      const r=ls.get("phyllis-recipes");
      if(c) setIngredientCosts(c);
      if(r) setRecipes(r);
    } catch(e){}
    setLoading(false);
  },[]);

  // ─── Load daily data ───
  useEffect(()=>{
    try {
      const p=ls.get(`phyllis-par:${selectedDate}`);
      const s=ls.get(`phyllis-sales:${selectedDate}`);
      if(p){setParEntries(p.entries||{});setParStaff(p.staff||"");}
      else{setParEntries({});setParStaff("");}
      if(s) setSalesEntries(s);
      else setSalesEntries({});
    } catch(e){}
  },[selectedDate]);

  const saveCosts = (c) => {
    ls.set("phyllis-costs",c); setIngredientCosts(c); showFlash("Costs saved ✓");
  };
  const saveRecipes = (r) => {
    ls.set("phyllis-recipes",r); setRecipes(r); showFlash("Recipe saved ✓");
  };
  const savePAR = () => {
    ls.set(`phyllis-par:${selectedDate}`,{staff:parStaff,entries:parEntries}); showFlash("PAR saved ✓");
  };
  const saveSales = () => {
    ls.set(`phyllis-sales:${selectedDate}`,salesEntries); showFlash("Sales saved ✓");
  };

  const doLogin = () => {
    if(pinInput===loginRole.pin){setCurrentUser(loginRole);setLoginError("");}
    else setLoginError("Incorrect PIN — try again");
  };

  const isOwner = currentUser?.role==="owner";
  const metrics = computeMetrics(salesEntries, recipes, ingredientCosts);
  const categories = [...new Set(INGREDIENTS.map(i=>i.category))];

  // ─── STYLES ───
  const S = {
    page:{minHeight:"100vh",background:"#0c0b09",color:"#d4c9b8",fontFamily:"'Trebuchet MS',sans-serif"},
    card:{background:"#141210",border:"1px solid #252220",borderRadius:"3px"},
    label:{fontSize:"10px",letterSpacing:"3px",textTransform:"uppercase",color:"#666"},
    amber:{color:"#c8a96e"},
    green:{color:"#7eb87e"},
    red:{color:"#c07070"},
    input:{background:"#0c0b09",border:"1px solid #2e2b26",color:"#d4c9b8",
      padding:"6px 10px",fontSize:"13px",borderRadius:"2px",outline:"none"},
    btn:{background:"#c8a96e",color:"#0c0b09",border:"none",padding:"8px 18px",
      fontSize:"12px",fontWeight:"700",letterSpacing:"1px",cursor:"pointer",borderRadius:"2px"},
    th:{padding:"8px 12px",textAlign:"left",fontSize:"10px",letterSpacing:"1px",
      textTransform:"uppercase",color:"#555",background:"#100f0d"},
    td:{padding:"7px 12px",fontSize:"13px"},
  };

  if(loading) return (
    <div style={{...S.page,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{...S.label}}>Loading Phyllis Operations…</div>
    </div>
  );

  // ══════════════════ LOGIN ══════════════════
  if(!currentUser) return (
    <div style={{...S.page,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{...S.card,padding:"44px 40px",width:"360px",maxWidth:"90vw"}}>
        <div style={{textAlign:"center",marginBottom:"32px"}}>
          <div style={{...S.label,marginBottom:"6px"}}>Phyllis Brunch · Marietta GA</div>
          <div style={{fontSize:"22px",color:"#f0e8d8",fontWeight:"400",letterSpacing:"1px"}}>Operations Portal</div>
          <div style={{fontSize:"12px",color:"#555",marginTop:"4px"}}>PAR · Sales · COGS</div>
        </div>
        <div style={{marginBottom:"14px"}}>
          <div style={{...S.label,marginBottom:"6px"}}>Select Role</div>
          <select value={loginRole.role} onChange={e=>setLoginRole(USERS.find(u=>u.role===e.target.value))}
            style={{...S.input,width:"100%",boxSizing:"border-box"}}>
            {USERS.map(u=><option key={u.role} value={u.role}>{u.label}</option>)}
          </select>
        </div>
        <div style={{marginBottom:"18px"}}>
          <div style={{...S.label,marginBottom:"6px"}}>PIN</div>
          <input type="password" value={pinInput} placeholder="Enter PIN"
            onChange={e=>setPinInput(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&doLogin()}
            style={{...S.input,width:"100%",boxSizing:"border-box"}}/>
        </div>
        {loginError&&<div style={{color:"#c07070",fontSize:"12px",marginBottom:"12px"}}>{loginError}</div>}
        <button onClick={doLogin} style={{...S.btn,width:"100%"}}>ENTER</button>
        <div style={{marginTop:"18px",fontSize:"10px",color:"#444",textAlign:"center"}}>
          Pins: Owner=satya · GM=1234 · Kitchen=kitchen
        </div>
      </div>
    </div>
  );

  // ══════════════════ APP SHELL ══════════════════
  return (
    <div style={S.page}>
      {/* Header */}
      <div style={{background:"#141210",borderBottom:"1px solid #252220",
        padding:"10px 20px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
          <span style={{...S.amber,fontSize:"14px",fontWeight:"700",letterSpacing:"1px"}}>PHYLLIS</span>
          <span style={{fontSize:"11px",color:"#444"}}>|</span>
          <span style={{fontSize:"11px",color:"#666"}}>Operations</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:"14px"}}>
          {flash&&<span style={{fontSize:"12px",...S.green}}>{flash}</span>}
          <span style={{fontSize:"12px",color:"#666"}}>{currentUser.label}</span>
          <button onClick={()=>setCurrentUser(null)} style={{
            background:"none",border:"1px solid #2e2b26",color:"#666",
            padding:"4px 10px",fontSize:"11px",cursor:"pointer",borderRadius:"2px"}}>
            Sign Out
          </button>
        </div>
      </div>

      {/* Date bar */}
      <div style={{background:"#100f0d",borderBottom:"1px solid #1e1c18",
        padding:"8px 20px",display:"flex",alignItems:"center",gap:"12px"}}>
        <span style={{...S.label}}>Date</span>
        <input type="date" value={selectedDate} onChange={e=>setSelectedDate(e.target.value)}
          style={{...S.input,padding:"4px 8px",fontSize:"12px"}}/>
        <span style={{fontSize:"12px",color:"#555"}}>
          {new Date(selectedDate+"T12:00:00").toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}
        </span>
      </div>

      {/* Tabs */}
      <div style={{background:"#100f0d",borderBottom:"1px solid #1e1c18",
        display:"flex",overflowX:"auto",padding:"0 12px"}}>
        {TABS.filter(t=>t!=="COGS Report"||isOwner).map(tab=>(
          <button key={tab} onClick={()=>setActiveTab(tab)} style={{
            background:"none",border:"none",
            borderBottom:activeTab===tab?"2px solid #c8a96e":"2px solid transparent",
            color:activeTab===tab?"#c8a96e":"#555",
            padding:"11px 14px",fontSize:"11px",letterSpacing:"1.5px",
            cursor:"pointer",whiteSpace:"nowrap",textTransform:"uppercase"}}>
            {tab}
          </button>
        ))}
      </div>

      <div style={{padding:"20px",maxWidth:"1080px",margin:"0 auto"}}>

        {/* ══ DASHBOARD ══ */}
        {activeTab==="Dashboard"&&(
          <div>
            <div style={{...S.label,marginBottom:"16px"}}>
              Summary — {selectedDate}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:"12px",marginBottom:"20px"}}>
              {[
                {label:"Revenue",   value:`$${metrics.revenue.toFixed(2)}`,  color:"#7eb87e"},
                {label:"Food COGS", value:`$${metrics.cogs.toFixed(2)}`,     color:"#c07070"},
                {label:"Gross Profit",value:`$${metrics.profit.toFixed(2)}`, color:"#c8a96e"},
                {label:"COGS %",    value:`${metrics.cogsPercent}%`,
                  color:parseFloat(metrics.cogsPercent)>35?"#c07070":"#7eb87e"},
              ].map(c=>(
                <div key={c.label} style={{...S.card,padding:"18px"}}>
                  <div style={{...S.label,marginBottom:"6px"}}>{c.label}</div>
                  <div style={{fontSize:"26px",color:c.color}}>{c.value}</div>
                </div>
              ))}
            </div>
            <div style={{...S.card,overflow:"hidden"}}>
              <div style={{padding:"12px 14px",borderBottom:"1px solid #1e1c18",...S.label}}>
                Sales breakdown
              </div>
              {metrics.details.length===0?(
                <div style={{padding:"24px 16px",color:"#444",fontSize:"13px"}}>
                  No sales yet for this date — use the Sales Entry tab to enter data.
                </div>
              ):(
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead><tr>
                    {["Item","Qty","Revenue","COGS","Plate Cost"].map(h=>(
                      <th key={h} style={S.th}>{h}</th>))}
                  </tr></thead>
                  <tbody>
                    {metrics.details.map(row=>(
                      <tr key={row.name} style={{borderTop:"1px solid #1a1916"}}>
                        <td style={S.td}>{row.name}</td>
                        <td style={{...S.td,color:"#888"}}>{row.qty}</td>
                        <td style={{...S.td,...S.green}}>${row.revenue.toFixed(2)}</td>
                        <td style={{...S.td,...S.red}}>${row.cogs.toFixed(2)}</td>
                        <td style={{...S.td,...S.amber}}>${row.plateCost.toFixed(2)}</td>
                      </tr>
                    ))}
                    <tr style={{borderTop:"2px solid #252220",background:"#100f0d"}}>
                      <td style={{...S.td,...S.label}} colSpan={2}>Total</td>
                      <td style={{...S.td,fontWeight:"700",...S.green}}>${metrics.revenue.toFixed(2)}</td>
                      <td style={{...S.td,fontWeight:"700",...S.red}}>${metrics.cogs.toFixed(2)}</td>
                      <td style={{...S.td,fontWeight:"700",...S.amber}}>${metrics.profit.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ══ PAR ENTRY ══ */}
        {activeTab==="PAR Entry"&&(
          <div>
            <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"18px",flexWrap:"wrap"}}>
              <span style={{...S.label}}>Completed by:</span>
              <input value={parStaff} onChange={e=>setParStaff(e.target.value)} placeholder="Staff name"
                style={{...S.input,width:"180px"}}/>
              <button onClick={savePAR} style={S.btn}>Save PAR Sheet</button>
            </div>
            {categories.map(cat=>(
              <div key={cat} style={{marginBottom:"20px"}}>
                <div style={{...S.amber,...S.label,marginBottom:"10px",
                  paddingBottom:"6px",borderBottom:"1px solid #c8a96e22"}}>
                  {cat}
                </div>
                <div style={{...S.card,overflow:"hidden"}}>
                  <table style={{width:"100%",borderCollapse:"collapse"}}>
                    <thead><tr>
                      <th style={S.th}>Item</th>
                      <th style={S.th}>Unit · Weekly PAR</th>
                      <th style={S.th}>On Hand</th>
                      <th style={S.th}>Order Qty</th>
                    </tr></thead>
                    <tbody>
                      {INGREDIENTS.filter(i=>i.category===cat).map((ing,idx)=>(
                        <tr key={ing.id} style={{borderTop:idx>0?"1px solid #1a1916":"none"}}>
                          <td style={S.td}>{ing.name}</td>
                          <td style={{...S.td,fontSize:"11px",color:"#555"}}>{ing.unit} · {ing.par}</td>
                          <td style={{padding:"4px 12px"}}>
                            <input type="number" min="0" step="0.5"
                              value={parEntries[ing.id]?.on_hand??""} placeholder="—"
                              onChange={e=>setParEntries(p=>({...p,[ing.id]:{...(p[ing.id]||{}),on_hand:e.target.value}}))}
                              style={{...S.input,width:"72px",padding:"5px 7px"}}/>
                          </td>
                          <td style={{padding:"4px 12px"}}>
                            <input type="number" min="0" step="0.5"
                              value={parEntries[ing.id]?.order_qty??""} placeholder="—"
                              onChange={e=>setParEntries(p=>({...p,[ing.id]:{...(p[ing.id]||{}),order_qty:e.target.value}}))}
                              style={{...S.input,width:"72px",padding:"5px 7px",color:"#7eb87e"}}/>
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
        {activeTab==="Ingredient Costs"&&(
          <div>
            {!isOwner&&(
              <div style={{background:"#1e1010",border:"1px solid #5a2020",borderRadius:"3px",
                padding:"10px 14px",marginBottom:"16px",fontSize:"12px",...S.red}}>
                View only — Owner login required to edit costs.
              </div>
            )}
            <div style={{...S.label,marginBottom:"16px"}}>
              Enter the total cost per purchase unit (e.g. cost of 1 full case, 1 bag, 1 gallon)
            </div>
            {categories.map(cat=>(
              <div key={cat} style={{marginBottom:"20px"}}>
                <div style={{...S.amber,...S.label,marginBottom:"10px",paddingBottom:"6px",borderBottom:"1px solid #c8a96e22"}}>
                  {cat}
                </div>
                <div style={{...S.card,overflow:"hidden"}}>
                  <table style={{width:"100%",borderCollapse:"collapse"}}>
                    <thead><tr>
                      <th style={S.th}>Ingredient</th>
                      <th style={S.th}>Purchase Unit</th>
                      <th style={S.th}>Cost per Unit</th>
                      <th style={S.th}>Cost per Recipe Use*</th>
                    </tr></thead>
                    <tbody>
                      {INGREDIENTS.filter(i=>i.category===cat).map((ing,idx)=>(
                        <tr key={ing.id} style={{borderTop:idx>0?"1px solid #1a1916":"none"}}>
                          <td style={S.td}>{ing.name}</td>
                          <td style={{...S.td,fontSize:"11px",color:"#555"}}>{ing.unit}</td>
                          <td style={{padding:"4px 12px"}}>
                            <div style={{display:"flex",alignItems:"center",gap:"4px"}}>
                              <span style={{color:"#555"}}>$</span>
                              <input type="number" min="0" step="0.01"
                                disabled={!isOwner}
                                value={ingredientCosts[ing.id]??""}
                                onChange={e=>{
                                  const v=parseFloat(e.target.value)||0;
                                  saveCosts({...ingredientCosts,[ing.id]:v});
                                }}
                                style={{...S.input,width:"90px",padding:"5px 7px",
                                  color:isOwner?"#c8a96e":"#444",
                                  background:isOwner?"#0c0b09":"#0a0909"}}/>
                            </div>
                          </td>
                          <td style={{...S.td,fontSize:"11px",color:"#666"}}>
                            Set quantity in Recipes tab
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
            <div style={{fontSize:"11px",color:"#444",marginTop:"8px"}}>
              * Actual plate cost = (cost per unit × qty used per plate) — set in Recipes tab
            </div>
          </div>
        )}

        {/* ══ RECIPES ══ */}
        {activeTab==="Recipes"&&(
          <div>
            <div style={{...S.label,marginBottom:"16px"}}>
              Map each menu item to its raw ingredients & portions
            </div>
            {isOwner&&(
              <div style={{...S.card,padding:"14px 16px",marginBottom:"18px",
                display:"flex",gap:"8px",alignItems:"center",flexWrap:"wrap"}}>
                <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="New menu item"
                  style={{...S.input,flex:1,minWidth:"160px"}}/>
                <span style={{color:"#555"}}>$</span>
                <input type="number" value={newPrice} onChange={e=>setNewPrice(e.target.value)}
                  placeholder="Price" min="0"
                  style={{...S.input,width:"80px",...S.amber}}/>
                <button onClick={()=>{
                  if(!newName)return;
                  const r=[...recipes,{id:"r"+Date.now(),name:newName,price:parseFloat(newPrice)||0,ingredients:[]}];
                  saveRecipes(r); setNewName(""); setNewPrice("");
                }} style={S.btn}>+ Add Item</button>
              </div>
            )}

            {recipes.map(recipe=>{
              const plateCost=recipe.ingredients.reduce(
                (s,ri)=>s+(parseFloat(ingredientCosts[ri.id]||0)*ri.qty),0);
              const margin=recipe.price-plateCost;
              const costPct=recipe.price>0?(plateCost/recipe.price*100).toFixed(1):0;
              return (
                <div key={recipe.id} style={{...S.card,marginBottom:"14px",overflow:"hidden"}}>
                  <div style={{padding:"12px 16px",borderBottom:"1px solid #1e1c18",
                    display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"8px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:"10px",flexWrap:"wrap"}}>
                      <span style={{fontSize:"15px",color:"#e8dfc8"}}>{recipe.name}</span>
                      <span style={{...S.amber,fontSize:"13px"}}>${recipe.price.toFixed(2)}</span>
                      {plateCost>0&&(
                        <>
                          <span style={{fontSize:"11px",color:"#555"}}>·</span>
                          <span style={{fontSize:"12px",...S.red}}>Cost ${plateCost.toFixed(2)}</span>
                          <span style={{fontSize:"12px",...S.green}}>Margin ${margin.toFixed(2)}</span>
                          <span style={{fontSize:"11px",color:parseFloat(costPct)>35?"#c07070":"#7eb87e"}}>
                            ({costPct}%)
                          </span>
                        </>
                      )}
                    </div>
                    {isOwner&&(
                      <div style={{display:"flex",gap:"6px"}}>
                        <button onClick={()=>setEditingRecipe(editingRecipe===recipe.id?null:recipe.id)}
                          style={{background:"none",border:"1px solid #2e2b26",color:"#888",
                            padding:"4px 10px",fontSize:"11px",cursor:"pointer",borderRadius:"2px"}}>
                          {editingRecipe===recipe.id?"✓ Done":"Edit"}
                        </button>
                        <button onClick={()=>saveRecipes(recipes.filter(r=>r.id!==recipe.id))}
                          style={{background:"none",border:"1px solid #3a1e1e",color:"#8a5555",
                            padding:"4px 10px",fontSize:"11px",cursor:"pointer",borderRadius:"2px"}}>
                          Remove
                        </button>
                      </div>
                    )}
                  </div>

                  {recipe.ingredients.length>0&&(
                    <div style={{padding:"8px 0"}}>
                      <table style={{width:"100%",borderCollapse:"collapse"}}>
                        <tbody>
                          {recipe.ingredients.map((ri,idx)=>{
                            const ing=INGREDIENTS.find(i=>i.id===ri.id);
                            const lineCost=parseFloat(ingredientCosts[ri.id]||0)*ri.qty;
                            return (
                              <tr key={idx} style={{borderTop:idx>0?"1px solid #191714":"none"}}>
                                <td style={{...S.td,color:"#aaa"}}>{ing?.name??ri.id}</td>
                                <td style={{...S.td,fontSize:"11px",color:"#555"}}>{ri.qty} × {ing?.unit}</td>
                                <td style={{...S.td,...S.red,textAlign:"right"}}>
                                  ${lineCost.toFixed(3)}
                                </td>
                                {isOwner&&editingRecipe===recipe.id&&(
                                  <td style={{...S.td,textAlign:"right"}}>
                                    <button onClick={()=>{
                                      const updated=recipes.map(r=>r.id===recipe.id
                                        ?{...r,ingredients:r.ingredients.filter((_,i)=>i!==idx)}:r);
                                      saveRecipes(updated);
                                    }} style={{background:"none",border:"none",color:"#8a5555",
                                      cursor:"pointer",fontSize:"16px",padding:"0 4px"}}>×</button>
                                  </td>
                                )}
                              </tr>
                            );
                          })}
                          <tr style={{borderTop:"1px solid #252220",background:"#100f0d"}}>
                            <td style={{...S.td,...S.label}} colSpan={2}>Total plate cost</td>
                            <td style={{...S.td,...S.red,textAlign:"right",fontWeight:"700"}}>
                              ${plateCost.toFixed(2)}
                            </td>
                            {isOwner&&editingRecipe===recipe.id&&<td/>}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}

                  {recipe.ingredients.length===0&&editingRecipe!==recipe.id&&(
                    <div style={{padding:"12px 16px",fontSize:"12px",color:"#444"}}>
                      No ingredients mapped. {isOwner?"Click Edit to link raw materials.":""}
                    </div>
                  )}

                  {isOwner&&editingRecipe===recipe.id&&(
                    <AddIngredientRow recipe={recipe} recipes={recipes} saveRecipes={saveRecipes}/>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ══ SALES ENTRY ══ */}
        {activeTab==="Sales Entry"&&(
          <div>
            <div style={{...S.label,marginBottom:"16px"}}>
              Enter units sold — {selectedDate}
            </div>
            <div style={{...S.card,overflow:"hidden",marginBottom:"14px"}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead><tr>
                  <th style={S.th}>Menu Item</th>
                  <th style={S.th}>Sell Price</th>
                  <th style={S.th}>Qty Sold</th>
                  <th style={S.th}>Line Revenue</th>
                  <th style={S.th}>Line COGS</th>
                </tr></thead>
                <tbody>
                  {recipes.map((recipe,idx)=>{
                    const qty=parseInt(salesEntries[recipe.id]||0);
                    const plateCost=recipe.ingredients.reduce(
                      (s,ri)=>s+(parseFloat(ingredientCosts[ri.id]||0)*ri.qty),0);
                    return (
                      <tr key={recipe.id} style={{borderTop:idx>0?"1px solid #1a1916":"none"}}>
                        <td style={S.td}>{recipe.name}</td>
                        <td style={{...S.td,...S.amber}}>${recipe.price.toFixed(2)}</td>
                        <td style={{padding:"4px 12px"}}>
                          <input type="number" min="0" step="1"
                            value={salesEntries[recipe.id]??""}  placeholder="0"
                            onChange={e=>setSalesEntries(p=>({...p,[recipe.id]:parseInt(e.target.value)||0}))}
                            style={{...S.input,width:"72px",padding:"5px 7px",fontSize:"14px"}}/>
                        </td>
                        <td style={{...S.td,...S.green}}>${(qty*recipe.price).toFixed(2)}</td>
                        <td style={{...S.td,...S.red}}>
                          ${plateCost>0?(qty*plateCost).toFixed(2):"—"}
                        </td>
                      </tr>
                    );
                  })}
                  <tr style={{borderTop:"2px solid #252220",background:"#100f0d"}}>
                    <td style={{...S.td,...S.label}} colSpan={2}>Totals</td>
                    <td style={{...S.td,fontWeight:"700",color:"#e8dfc8"}}>
                      {Object.values(salesEntries).reduce((s,v)=>s+(parseInt(v)||0),0)} plates
                    </td>
                    <td style={{...S.td,fontWeight:"700",...S.green}}>${metrics.revenue.toFixed(2)}</td>
                    <td style={{...S.td,fontWeight:"700",...S.red}}>${metrics.cogs.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <button onClick={saveSales} style={S.btn}>Save Sales Data</button>
          </div>
        )}

        {/* ══ COGS REPORT (Owner) ══ */}
        {activeTab==="COGS Report"&&isOwner&&(
          <div>
            <div style={{...S.label,marginBottom:"20px"}}>
              P&L Report — {selectedDate}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:"14px",marginBottom:"22px"}}>
              {[
                {label:"Gross Revenue",  value:`$${metrics.revenue.toFixed(2)}`, clr:"#7eb87e", border:"#7eb87e"},
                {label:"Food COGS",      value:`$${metrics.cogs.toFixed(2)}`,    clr:"#c07070", border:"#c07070"},
                {label:"Gross Profit",   value:`$${metrics.profit.toFixed(2)}`,  clr:"#c8a96e", border:"#c8a96e"},
                {label:"COGS %",
                  value:`${metrics.cogsPercent}%`,
                  clr:parseFloat(metrics.cogsPercent)>35?"#c07070":"#7eb87e",
                  border:parseFloat(metrics.cogsPercent)>35?"#c07070":"#7eb87e",
                  sub:"Target ≤ 30%"},
              ].map(c=>(
                <div key={c.label} style={{background:"#141210",border:`1px solid ${c.border}33`,
                  borderRadius:"3px",padding:"22px"}}>
                  <div style={{...S.label,color:c.clr,marginBottom:"6px"}}>{c.label}</div>
                  <div style={{fontSize:"32px",color:c.clr}}>{c.value}</div>
                  {c.sub&&<div style={{fontSize:"10px",color:"#555",marginTop:"4px"}}>{c.sub}</div>}
                </div>
              ))}
            </div>

            <div style={{...S.card,overflow:"hidden"}}>
              <div style={{padding:"12px 14px",borderBottom:"1px solid #1e1c18",...S.label}}>
                Item-level breakdown
              </div>
              {metrics.details.length===0?(
                <div style={{padding:"24px",color:"#444",fontSize:"13px"}}>
                  No sales data for {selectedDate}. Enter data in Sales Entry tab.
                </div>
              ):(
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead><tr>
                    {["Item","Qty","Revenue","COGS","Margin","COGS%"].map(h=>(
                      <th key={h} style={S.th}>{h}</th>))}
                  </tr></thead>
                  <tbody>
                    {metrics.details.sort((a,b)=>b.revenue-a.revenue).map(row=>{
                      const pct=row.revenue>0?(row.cogs/row.revenue*100).toFixed(1):0;
                      return (
                        <tr key={row.name} style={{borderTop:"1px solid #1a1916"}}>
                          <td style={S.td}>{row.name}</td>
                          <td style={{...S.td,color:"#888"}}>{row.qty}</td>
                          <td style={{...S.td,...S.green}}>${row.revenue.toFixed(2)}</td>
                          <td style={{...S.td,...S.red}}>${row.cogs.toFixed(2)}</td>
                          <td style={{...S.td,...S.amber}}>${(row.revenue-row.cogs).toFixed(2)}</td>
                          <td style={{...S.td,color:parseFloat(pct)>35?"#c07070":"#7eb87e"}}>
                            {pct}%
                          </td>
                        </tr>
                      );
                    })}
                    <tr style={{borderTop:"2px solid #252220",background:"#100f0d"}}>
                      <td style={{...S.td,...S.label}} colSpan={2}>Total</td>
                      <td style={{...S.td,fontWeight:"700",...S.green}}>${metrics.revenue.toFixed(2)}</td>
                      <td style={{...S.td,fontWeight:"700",...S.red}}>${metrics.cogs.toFixed(2)}</td>
                      <td style={{...S.td,fontWeight:"700",...S.amber}}>${metrics.profit.toFixed(2)}</td>
                      <td style={{...S.td,fontWeight:"700",color:parseFloat(metrics.cogsPercent)>35?"#c07070":"#7eb87e"}}>
                        {metrics.cogsPercent}%
                      </td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
