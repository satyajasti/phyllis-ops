import { useState, useEffect, useCallback } from "react";

// ─── Shifts API helper ───
const shifts = async (action, payload = {}) => {
  const res = await fetch("/api/shifts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...payload }),
  });
  return res.json();
};

// ─── All available modules ───
const ALL_MODULES = [
  "Dashboard","PAR Entry","Ingredient Costs","Recipes","Sales Entry",
  "Staff Hours","Analytics","COGS Report","Employees","Role Templates",
  "My Schedule","Clock In/Out","My Timesheet","Time Off",
  "Scheduling","Time Off Requests",
  "Temp Log","Checklists","Waste Log","SOPs","Receipts","Export"
];
const DEFAULT_STAFF_MODULES = [
  "Dashboard","PAR Entry","Sales Entry","Staff Hours",
  "My Schedule","Clock In/Out","My Timesheet","Time Off",
  "Temp Log","Checklists","Waste Log"
];

// ─── Zoho API helper ───
const zoho = async (action, form, payload = {}) => {
  const res = await fetch("/api/zoho", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, form, ...payload }),
  });
  return res.json();
};

// ─── Static ingredients list ───
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
  { id:"d1",  name:"Whole Milk",                 unit:"gallon",        category:"Dairy",       par:"4 gal/wk" },
  { id:"d2",  name:"Heavy Cream",                unit:"quart",         category:"Dairy",       par:"3 qt/wk" },
  { id:"d3",  name:"Butter (unsalted)",          unit:"pack/4 sticks", category:"Dairy",       par:"5 packs/wk" },
  { id:"d4",  name:"Shredded Cheddar",           unit:"bag/5lb",       category:"Dairy",       par:"1 bag/wk" },
  { id:"d5",  name:"Buttermilk",                 unit:"gallon",        category:"Dairy",       par:"3 gal/wk" },
  { id:"ds1", name:"Stone-Ground Grits",         unit:"bag/5lb",       category:"Dry Storage", par:"6 bags/wk" },
  { id:"ds2", name:"All-Purpose Flour",          unit:"bag/25lb",      category:"Dry Storage", par:"1 bag/wk" },
  { id:"ds3", name:"Self-Rising Flour",          unit:"bag/25lb",      category:"Dry Storage", par:"1 bag/wk" },
  { id:"ds4", name:"Panko Breadcrumbs",          unit:"bag/2.5lb",     category:"Dry Storage", par:"2 bags/wk" },
  { id:"ds5", name:"Canola Oil",                 unit:"jug/35lb",      category:"Dry Storage", par:"1 jug/wk" },
  { id:"ds6", name:"Brown Sugar",                unit:"bag/4lb",       category:"Dry Storage", par:"2 bags/wk" },
  { id:"pr1", name:"Yellow Onions",              unit:"bag/10lb",      category:"Produce",     par:"2 bags/wk" },
  { id:"pr2", name:"Garlic (fresh)",             unit:"bag/3lb",       category:"Produce",     par:"2 bags/wk" },
  { id:"pr3", name:"Roma Tomatoes",              unit:"case/25lb",     category:"Produce",     par:"1 case/wk" },
  { id:"pr4", name:"Sweet Potatoes",             unit:"box/40lb",      category:"Produce",     par:"1 box/wk" },
  { id:"pr5", name:"Collard Greens",             unit:"box/20lb",      category:"Produce",     par:"1 box/wk" },
  { id:"pr6", name:"Avocados",                   unit:"each",          category:"Produce",     par:"6/wk" },
];

const CATS = ["Proteins","Dairy","Dry Storage","Produce"];
const DESIGNATIONS = [
  "General Manager","Kitchen Manager","Line Cook","Prep Cook",
  "Server","Bartender","Host/Hostess","Dishwasher","Cashier",
  "Catering Staff","Catering Manager","Delivery Driver",
  "Sous Chef","Head Chef","Pastry Cook","Expeditor",
  "Busser","Food Runner","Kitchen Assistant","Prep Lead",
  "Opening Manager","Closing Manager","Shift Lead","Other"
];
const ADMIN = { id:"admin", firstName:"Satya", lastName:"", designation:"Owner", isAdmin:true, allowedModules:["ALL"] };

function calcMetrics(sales, recipes, costs) {
  let rev=0, cogs=0;
  const details=[];
  recipes.forEach(r=>{
    const qty=parseInt(sales[r.ID||r.id]||0);
    if(!qty) return;
    const price=parseFloat(r.selling_price||r.price||0);
    const r2=qty*price;
    const pc=(r.ingredients||[]).reduce((s,ri)=>{
      const cost=parseFloat(costs[ri.ingredient_id]||0);
      return s+(cost*parseFloat(ri.quantity_per_plate||0));
    },0);
    rev+=r2; cogs+=pc*qty;
    details.push({name:r.recipe_name||r.name,qty,revenue:r2,cogs:pc*qty,plateCost:pc,
      margin:r2-(pc*qty),marginPct:r2>0?((r2-(pc*qty))/r2*100):0,
      cogsPct:r2>0?((pc*qty)/r2*100):0});
  });
  return {rev,cogs,profit:rev-cogs,pct:rev>0?(cogs/rev*100).toFixed(1):"—",details};
}

function Bar({value,max,color}){
  const pct=max>0?Math.min((value/max)*100,100):0;
  return <div style={{background:"#1a1916",borderRadius:"2px",height:"8px",width:"100%",minWidth:"80px"}}>
    <div style={{background:color,height:"8px",borderRadius:"2px",width:`${pct}%`,transition:"width 0.3s"}}/>
  </div>;
}

function PricePanel({ing,yourCost,onClose}){
  const [data,setData]=useState(null);
  const [loading,setLoading]=useState(true);
  const [err,setErr]=useState("");
  useEffect(()=>{
    (async()=>{
      try{
        const res=await fetch("/api/price-check",{method:"POST",headers:{"Content-Type":"application/json"},
          body:JSON.stringify({ingredient:ing.name,unit:ing.unit,yourCost})});
        const json=await res.json();
        if(json.error)throw new Error(json.error);
        setData(json);
      }catch(e){setErr("Could not fetch prices.");}
      setLoading(false);
    })();
  },[]);
  return(
    <div style={{background:"#080f08",border:"1px solid #1e3a1e",padding:"14px 16px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}}>
        <span style={{fontSize:"11px",letterSpacing:"2px",textTransform:"uppercase",color:"#4a8a4a"}}>
          🔍 {ing.name} ({ing.unit})
        </span>
        <button onClick={onClose} style={{background:"none",border:"none",color:"#3a5a3a",cursor:"pointer",fontSize:"18px"}}>×</button>
      </div>
      {loading&&<div style={{color:"#4a7a4a",fontSize:"13px"}}>Checking Marietta GA prices…</div>}
      {err&&<div style={{color:"#c07070",fontSize:"13px"}}>{err}</div>}
      {data&&!loading&&(
        <>
          <table style={{width:"100%",borderCollapse:"collapse",marginBottom:"10px"}}>
            <thead><tr style={{borderBottom:"1px solid #1a2e1a"}}>
              {["Supplier","Price","vs Yours","Notes"].map(h=>(
                <th key={h} style={{padding:"6px 10px",textAlign:"left",fontSize:"10px",letterSpacing:"1px",textTransform:"uppercase",color:"#3a6a3a"}}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {data.suppliers?.map((s,i)=>{
                const diff=yourCost>0&&s.price>0?((s.price-yourCost)/yourCost*100):null;
                const cheaper=diff!==null&&diff<0;
                return(
                  <tr key={i} style={{borderBottom:"1px solid #0e1e0e",background:s.recommended?"#0e1e0e":"transparent"}}>
                    <td style={{padding:"7px 10px",fontSize:"13px",color:s.recommended?"#a0d4a0":"#b0a898",fontWeight:s.recommended?"700":"400"}}>{s.recommended&&"⭐ "}{s.name}</td>
                    <td style={{padding:"7px 10px",fontSize:"13px",color:"#c8a96e",fontWeight:"600"}}>{s.price>0?`$${s.price.toFixed(2)}`:"Call"}</td>
                    <td style={{padding:"7px 10px"}}>
                      {diff!==null&&yourCost>0?<span style={{fontSize:"12px",fontWeight:"600",color:cheaper?"#7eb87e":"#c07070"}}>
                        {cheaper?`Save $${(yourCost-s.price).toFixed(2)}`:`$${(s.price-yourCost).toFixed(2)} more`}
                      </span>:<span style={{fontSize:"11px",color:"#2a4a2a"}}>—</span>}
                    </td>
                    <td style={{padding:"7px 10px",fontSize:"11px",color:"#4a6a4a"}}>{s.note}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{background:"#0a160a",border:"1px solid #1a3a1a",borderRadius:"2px",padding:"10px 12px",fontSize:"12px",color:"#7eb87e",lineHeight:"1.6"}}>
            <strong style={{color:"#9aca6a"}}>💡 </strong>{data.tip}
          </div>
        </>
      )}
    </div>
  );
}

// ══════════════════════════════════════
export default function PhyllisOps(){
  const [me,setMe]           = useState(()=>{
    try{ const s=sessionStorage.getItem("phyllis_user"); return s?JSON.parse(s):null; }catch{ return null; }
  });
  const [oauthLoading,setOauthLoading] = useState(false);
  const [loginErr,setLoginErr]         = useState("");
  const [showPinFallback,setShowPinFallback] = useState(false);
  const [selEmp,setSelEmp]   = useState("");
  const [pin,setPin]         = useState("");
  const [pinErr,setPinErr]   = useState("");
  const [tab,setTab]         = useState("Dashboard");
  const [date,setDate]       = useState(new Date().toISOString().split("T")[0]);

  // Zoho data
  const [employees,setEmps]  = useState([]);
  const [recipes,setRecipes] = useState([]);
  const [recipeIngs,setRecipeIngs] = useState([]); // all recipe_ingredients records
  const [costs,setCosts]     = useState({});        // {ingredient_id: cost}
  const [parData,setParData] = useState({});        // {ingredient_id: {on_hand, order_qty, zohoId}}
  const [salesData,setSalesData] = useState({});    // {recipe_id: {qty, zohoId}}
  const [laborData,setLaborData] = useState({});    // {emp_id: {hours, zohoId}}

  const [loading,setLoading] = useState(true);
  const [saving,setSaving]   = useState("");
  const [flash,setFlash]     = useState("");
  const [pricePanel,setPP]   = useState(null);
  const [editRec,setEditRec] = useState(null);
  const [analyticView,setAV] = useState("profit");
  const [newName,setNN]      = useState("");
  const [newPx,setNP]        = useState("");
  const [empForm,setEmpForm] = useState({firstName:"",lastName:"",designation:DESIGNATIONS[0],rate:"",pin:""});
  const [editEmpId,setEditEmpId] = useState(null);
  const [parStaff,setPS]     = useState("");

  const showFlash=m=>{setFlash(m);setTimeout(()=>setFlash(""),2500);};
  const isAdmin=me?.isAdmin;

  // Persist session
  useEffect(()=>{
    if(me) sessionStorage.setItem("phyllis_user",JSON.stringify(me));
    else sessionStorage.removeItem("phyllis_user");
  },[me]);

  // Handle OAuth callback code in URL
  useEffect(()=>{
    const params=new URLSearchParams(window.location.search);
    const code=params.get("code");
    if(code&&!me){
      setOauthLoading(true);
      setLoginErr("");
      fetch("/api/auth?action=callback",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({code}),
      })
      .then(r=>r.json())
      .then(data=>{
        if(data.success){ setMe(data.user); window.history.replaceState({},'','/'); }
        else setLoginErr(data.message||data.error||"Login failed. Contact your manager.");
      })
      .catch(()=>setLoginErr("Network error. Please try again."))
      .finally(()=>setOauthLoading(false));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  // ─── Load master data on mount ───
  useEffect(()=>{
    (async()=>{
      try{
        const [emps,recs,rIngs,ingCosts]=await Promise.all([
          zoho("getAll","Employees"),
          zoho("getAll","Recipes"),
          zoho("getAll","Recipe_Ingredients"),
          zoho("getAll","Ingredients_Report"),
        ]);
        setEmps(emps||[]);
        setRecipes(recs||[]);
        setRecipeIngs(rIngs||[]);
        // Build cost map from Ingredients form
        const cm={};
        (ingCosts||[]).forEach(r=>{ cm[r.ingredient_id||r.Ingredient_ID]=parseFloat(r.cost_per_unit||r.Cost_Per_Unit||0); });
        setCosts(cm);
      }catch(e){console.error("Load error",e);}
      setLoading(false);
    })();
  },[]);

  // ─── Load daily data when date changes ───
  useEffect(()=>{
    if(!date) return;
    (async()=>{
      try{
        const months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
        const dp=date.split("-");
        const zohoDate=`${dp[2]}-${months[parseInt(dp[1])-1]}-${dp[0]}`;
        const [pars,sales,labor]=await Promise.all([
          zoho("getAll","PAR_Entries",{criteria:`Entry_Date=="${zohoDate}"`}),
          zoho("getAll","Sales_Entries",{criteria:`Sale_Date=="${zohoDate}"`}),
          zoho("getAll","Labor_Entries",{criteria:`Work_Date=="${zohoDate}"`}),
        ]);
        // Build PAR map
        const pm={};
        (pars||[]).forEach(r=>{pm[r.ingredient_id||r.Ingredient_ID]={on_hand:r.on_hand||r.On_Hand||"",order_qty:r.order_qty||r.Order_Quantity||"",zohoId:r.ID};});
        setParData(pm);
        setPS((pars||[])[0]?.completed_by||(pars||[])[0]?.Completed_By||"");
        // Build sales map
        const sm={};
        (sales||[]).forEach(r=>{sm[r.recipe_id||r.Recipe_ID]={qty:r.qty_sold||r.Quantity_Sold||0,zohoId:r.ID};});
        setSalesData(sm);
        // Build labor map
        const lm={};
        (labor||[]).forEach(r=>{lm[r.employee_id||r.Employee_ID]={hours:r.hours_worked||r.Hours_Worked||0,zohoId:r.ID};});
        setLaborData(lm);
      }catch(e){console.error("Daily load error",e);}
    })();
  },[date]);

  // ─── Attach ingredients to recipes ───
  const recipesWithIngs = recipes.map(r=>{
    const id=r.ID||r.id;
    const ings=recipeIngs.filter(ri=>(ri.recipe_id||ri.Recipe_ID)===id);
    return {...r,ingredients:ings};
  });

  // ─── Metrics ───
  const M=calcMetrics(salesData,recipesWithIngs,costs);
  const laborCost=employees.reduce((sum,emp)=>{
    const hrs=parseFloat(laborData[emp.ID||emp.id]?.hours||0);
    return sum+hrs*parseFloat(emp.hourly_rate||emp.Hourly_Rate||0);
  },0);
  const totalCost=M.cogs+laborCost;
  const netProfit=M.rev-totalCost;
  const laborPct=M.rev>0?(laborCost/M.rev*100).toFixed(1):"—";
  const totalCostPct=M.rev>0?(totalCost/M.rev*100).toFixed(1):"—";

  // ─── Save PAR ───
  const savePAR=async()=>{
    setSaving("Saving PAR...");
    try{
      for(const ing of INGREDIENTS){
        const entry=parData[ing.id];
        if(!entry?.on_hand&&!entry?.order_qty) continue;
        const d={
          entry_date:date,
          ingredient_id:ing.id,
          ingredient_name:ing.name,
          on_hand:parseFloat(entry.on_hand||0),
          order_qty:parseFloat(entry.order_qty||0),
          completed_by:parStaff||me?.firstName||"",
        };
        if(entry.zohoId){
          await zoho("update","PAR_Entries_Report",{data:d,recordId:entry.zohoId});
        } else {
          const r=await zoho("create","PAR_Entries",{data:d});
          if(r.data?.ID) setParData(p=>({...p,[ing.id]:{...entry,zohoId:r.data.ID}}));
        }
      }
      showFlash("PAR saved to Zoho ✓");
    }catch(e){showFlash("Save error — check connection");}
    setSaving("");
  };

  // ─── Save Sales ───
  const saveSales=async()=>{
    setSaving("Saving sales...");
    try{
      for(const rec of recipesWithIngs){
        const recId=rec.ID||rec.id;
        const entry=salesData[recId];
        if(!entry?.qty) continue;
        const plateCost=(rec.ingredients||[]).reduce((s,ri)=>{
          return s+(parseFloat(costs[ri.ingredient_id||ri.Ingredient_ID]||0)*parseFloat(ri.quantity_per_plate||ri.Quantity_Per_Plate||0));
        },0);
        const price=parseFloat(rec.selling_price||rec.price||0);
        const d={
          sale_date:date,
          recipe_id:recId,
          recipe_name:rec.recipe_name||rec.name,
          qty_sold:parseInt(entry.qty||0),
          selling_price:price,
          entered_by:me?.firstName||"",
        };
        if(entry.zohoId){
          await zoho("update","Sales_Entries_Report",{data:d,recordId:entry.zohoId});
        } else {
          const r=await zoho("create","Sales_Entries",{data:d});
          if(r.data?.ID) setSalesData(p=>({...p,[recId]:{...entry,zohoId:r.data.ID}}));
        }
      }
      showFlash("Sales saved to Zoho ✓");
    }catch(e){showFlash("Save error: "+e.message);}
    setSaving("");
  };

  // ─── Save Labor ───
  const saveLabor=async()=>{
    setSaving("Saving hours...");
    try{
      for(const emp of employees){
        const empId=emp.ID||emp.id;
        const entry=laborData[empId];
        if(!entry?.hours) continue;
        const rate=parseFloat(emp.hourly_rate||emp.Hourly_Rate||0);
        const d={
          work_date:date,
          employee_id:empId,
          employee_name:`${emp.first_name||emp.First_Name} ${emp.last_name||emp.Last_Name}`,
          designation:emp.designation||emp.Designation,
          hours_worked:parseFloat(entry.hours||0),
          hourly_rate:rate,
          labor_cost:parseFloat(entry.hours||0)*rate,
        };
        if(entry.zohoId){
          await zoho("update","Labor_Entries_Report",{data:d,recordId:entry.zohoId});
        } else {
          const r=await zoho("create","Labor_Entries",{data:d});
          if(r.data?.ID) setLaborData(p=>({...p,[empId]:{...entry,zohoId:r.data.ID}}));
        }
      }
      showFlash("Hours saved to Zoho ✓");
    }catch(e){showFlash("Save error: "+e.message);}
    setSaving("");
  };

  // ─── Save Employee ───
  const saveEmployee=async()=>{
    if(!empForm.firstName||!empForm.lastName||!empForm.pin){showFlash("Name & PIN required");return;}
    setSaving("Saving...");
    try{
      const d={
        first_name:empForm.firstName,
        last_name:empForm.lastName,
        designation:empForm.designation,
        hourly_rate:parseFloat(empForm.rate||0),
        pin:empForm.pin,
        is_active:true,
      };
      if(editEmpId){
        await zoho("update","Employees_Report",{data:d,recordId:editEmpId});
        setEmps(prev=>prev.map(e=>(e.ID||e.id)===editEmpId?{...e,...d}:e));
        setEditEmpId(null);
      } else {
        const r=await zoho("create","Employees",{data:d});
        if(r.data) setEmps(prev=>[...prev,{...d,ID:r.data.ID}]);
      }
      setEmpForm({firstName:"",lastName:"",designation:DESIGNATIONS[0],rate:"",pin:""});
      showFlash("Employee saved to Zoho ✓");
    }catch(e){showFlash("Save error: "+e.message);}
    setSaving("");
  };

  // ─── Save Recipe ───
  const saveNewRecipe=async()=>{
    if(!newName) return;
    setSaving("Saving...");
    try{
      const d={recipe_name:newName,selling_price:parseFloat(newPx)||0,is_active:true};
      const r=await zoho("create","Recipes",{data:d});
      if(r.data) setRecipes(prev=>[...prev,{...d,ID:r.data.ID}]);
      setNN(""); setNP("");
      showFlash("Recipe saved to Zoho ✓");
    }catch(e){showFlash("Save error: "+e.message);}
    setSaving("");
  };

  // ─── Save ingredient cost ───
  const saveCost=async(ingId,value)=>{
    setCosts(p=>({...p,[ingId]:value}));
    // Update Ingredients form in Zoho
    try{
      const existing=await zoho("getAll","Ingredients",{criteria:`ingredient_id=="${ingId}"`});
      if(existing&&existing.length>0){
        await zoho("update","Ingredients_Report",{data:{cost_per_unit:value},recordId:existing[0].ID});
      } else {
        const ing=INGREDIENTS.find(i=>i.id===ingId);
        await zoho("create","Ingredients",{data:{
          ingredient_id:ingId,
          ingredient_name:ing?.name||ingId,
          purchase_unit:ing?.unit||"",
          category:ing?.category||"",
          weekly_par:ing?.par||"",
          cost_per_unit:value,
        }});
      }
    }catch(e){console.error("Cost save error",e);}
  };

  // ─── Zoho OAuth Login ───
  const doZohoLogin=async()=>{
    setOauthLoading(true); setLoginErr("");
    try{
      const r=await fetch("/api/auth?action=login-url");
      const d=await r.json();
      if(d.url) window.location.href=d.url;
      else { setLoginErr("Could not get login URL."); setOauthLoading(false); }
    }catch(e){ setLoginErr("Network error."); setOauthLoading(false); }
  };

  // ─── Admin PIN fallback ───
  const doLogin=()=>{
    if(pin==="satya"){ setMe(ADMIN); setPinErr(""); }
    else setPinErr("Incorrect PIN");
  };

  // Dynamic tabs based on allowed modules
  const TAB_ORDER=["Dashboard","My Schedule","Clock In/Out","My Timesheet","Time Off","PAR Entry","Sales Entry","Staff Hours","Ingredient Costs","Recipes","Analytics","COGS Report","Employees","Role Templates","Scheduling","Time Off Requests","Temp Log","Checklists","Waste Log","SOPs","Receipts","Export"];
  const allowed=isAdmin?["ALL"]:(me?.allowedModules||DEFAULT_STAFF_MODULES);
  const canSee=(mod)=>allowed.includes("ALL")||allowed.includes(mod);
  const TABS=TAB_ORDER.filter(t=>canSee(t));

  const S={
    page:{minHeight:"100vh",background:"#0c0b09",color:"#d4c9b8",fontFamily:"'Trebuchet MS',sans-serif"},
    card:{background:"#141210",border:"1px solid #252220",borderRadius:"3px"},
    lbl:{fontSize:"10px",letterSpacing:"3px",textTransform:"uppercase",color:"#666"},
    inp:{background:"#0c0b09",border:"1px solid #2e2b26",color:"#d4c9b8",padding:"6px 10px",fontSize:"13px",borderRadius:"2px",outline:"none"},
    btn:{background:"#c8a96e",color:"#0c0b09",border:"none",padding:"8px 18px",fontSize:"12px",fontWeight:"700",letterSpacing:"1px",cursor:"pointer",borderRadius:"2px"},
    btnSm:{background:"#1e2820",color:"#7eb87e",border:"1px solid #2e4830",padding:"5px 12px",fontSize:"11px",cursor:"pointer",borderRadius:"2px"},
    btnDanger:{background:"none",border:"1px solid #3a1e1e",color:"#8a5555",padding:"5px 12px",fontSize:"11px",cursor:"pointer",borderRadius:"2px"},
    th:{padding:"8px 12px",textAlign:"left",fontSize:"10px",letterSpacing:"1px",textTransform:"uppercase",color:"#555",background:"#100f0d"},
    td:{padding:"8px 12px",fontSize:"13px"},
    amber:{color:"#c8a96e"},green:{color:"#7eb87e"},red:{color:"#c07070"},
  };

  if(loading) return(
    <div style={{...S.page,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"16px"}}>
      <div style={{...S.lbl}}>Connecting to Zoho Creator…</div>
      <div style={{fontSize:"12px",color:"#444"}}>Loading your data</div>
    </div>
  );

  // ══ LOGIN ══
  if(!me) return(
    <div style={{...S.page,display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh"}}>
      <div style={{...S.card,padding:"44px 40px",width:"400px",maxWidth:"92vw"}}>
        <div style={{textAlign:"center",marginBottom:"36px"}}>
          <div style={{fontSize:"36px",marginBottom:"10px"}}>🍳</div>
          <div style={{...S.lbl,marginBottom:"6px"}}>Phyllis Brunch · Marietta GA</div>
          <div style={{fontSize:"22px",color:"#f0e8d8",letterSpacing:"1px",fontWeight:"600"}}>Operations Portal</div>
          <div style={{fontSize:"12px",color:"#555",marginTop:"6px"}}>Powered by Zoho Creator & Zoho Shifts</div>
        </div>
        {oauthLoading&&(
          <div style={{textAlign:"center",padding:"20px 0"}}>
            <div style={{...S.lbl,marginBottom:"8px"}}>Signing you in…</div>
            <div style={{fontSize:"12px",color:"#555"}}>Verifying your Zoho account</div>
          </div>
        )}
        {loginErr&&(
          <div style={{background:"#1a0a0a",border:"1px solid #3a1e1e",borderRadius:"3px",padding:"12px 14px",marginBottom:"18px",fontSize:"12px",color:"#c07070",lineHeight:"1.6"}}>
            {loginErr}
          </div>
        )}
        {!oauthLoading&&(
          <>
            <button onClick={doZohoLogin}
              style={{...S.btn,width:"100%",padding:"14px",fontSize:"14px",display:"flex",alignItems:"center",justifyContent:"center",gap:"10px",boxSizing:"border-box"}}>
              <span style={{fontSize:"18px"}}>🔐</span> Sign in with Zoho
            </button>
            <div style={{marginTop:"10px",fontSize:"11px",color:"#444",textAlign:"center",lineHeight:"1.6"}}>
              Use the same email & password you use for Zoho Shifts
            </div>
            <div style={{marginTop:"24px",borderTop:"1px solid #1e1c18",paddingTop:"16px"}}>
              <button onClick={()=>setShowPinFallback(p=>!p)}
                style={{background:"none",border:"none",color:"#333",fontSize:"11px",cursor:"pointer",width:"100%",textAlign:"center"}}>
                {showPinFallback?"▲ Hide":"▼ Admin PIN login"}
              </button>
              {showPinFallback&&(
                <div style={{marginTop:"12px"}}>
                  <div style={{...S.lbl,marginBottom:"6px"}}>Admin PIN</div>
                  <input type="password" value={pin} placeholder="Enter admin PIN"
                    onChange={e=>setPin(e.target.value)}
                    onKeyDown={e=>e.key==="Enter"&&doLogin()}
                    style={{...S.inp,width:"100%",boxSizing:"border-box",marginBottom:"10px"}}/>
                  {pinErr&&<div style={{color:"#c07070",fontSize:"12px",marginBottom:"10px"}}>{pinErr}</div>}
                  <button onClick={doLogin} style={{...S.btn,width:"100%"}}>Sign In as Admin</button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );

  const fullName=me.isAdmin?"Satya (Admin)":`${me.firstName} ${me.lastName}`;
  const sorted={
    profit:[...M.details].sort((a,b)=>b.margin-a.margin),
    volume:[...M.details].sort((a,b)=>b.qty-a.qty),
    drain:[...M.details].sort((a,b)=>b.cogs-a.cogs),
    cogspct:[...M.details].sort((a,b)=>b.cogsPct-a.cogsPct),
  };

  return(
    <div style={S.page}>
      {/* Header */}
      <div style={{background:"#141210",borderBottom:"1px solid #252220",padding:"10px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"8px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
          <span style={{...S.amber,fontSize:"14px",fontWeight:"700",letterSpacing:"1px"}}>PHYLLIS</span>
          <span style={{fontSize:"11px",color:"#444"}}>|</span>
          <span style={{fontSize:"11px",color:"#666"}}>Operations</span>
          {isAdmin&&<span style={{background:"#2a1e0a",border:"1px solid #c8a96e44",color:"#c8a96e",fontSize:"10px",padding:"2px 7px",borderRadius:"10px"}}>ADMIN</span>}
          <span style={{fontSize:"10px",color:"#2a5a2a",background:"#0a160a",border:"1px solid #1a3a1a",padding:"2px 7px",borderRadius:"10px"}}>● Zoho Live</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:"14px"}}>
          {(flash||saving)&&<span style={{fontSize:"12px",...S.green}}>{saving||flash}</span>}
          <span style={{fontSize:"12px",color:"#888"}}>{fullName}</span>
          <button onClick={()=>{setMe(null);setPin("");setSelEmp("");setPinErr("");sessionStorage.removeItem("phyllis_user");}}
            style={{background:"none",border:"1px solid #2e2b26",color:"#666",padding:"4px 10px",fontSize:"11px",cursor:"pointer",borderRadius:"2px"}}>
            Sign Out
          </button>
        </div>
      </div>

      {/* Date bar */}
      <div style={{background:"#100f0d",borderBottom:"1px solid #1e1c18",padding:"8px 20px",display:"flex",alignItems:"center",gap:"12px",flexWrap:"wrap"}}>
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
                {l:"Revenue",      v:`$${M.rev.toFixed(2)}`,        c:"#7eb87e"},
                {l:"Food COGS",    v:`$${M.cogs.toFixed(2)}`,       c:"#c07070"},
                {l:"Labor Cost",   v:`$${laborCost.toFixed(2)}`,    c:"#d4a060"},
                {l:"Net Profit",   v:`$${netProfit.toFixed(2)}`,    c:netProfit>=0?"#7eb87e":"#c07070"},
                {l:"Food COGS %",  v:`${M.pct}%`,                  c:parseFloat(M.pct)>35?"#c07070":"#7eb87e"},
                {l:"Labor %",      v:`${laborPct}%`,                c:parseFloat(laborPct)>30?"#c07070":"#7eb87e"},
                {l:"Total Cost %", v:`${totalCostPct}%`,            c:parseFloat(totalCostPct)>65?"#c07070":"#7eb87e"},
              ].map(c=>(
                <div key={c.l} style={{...S.card,padding:"16px"}}>
                  <div style={{...S.lbl,marginBottom:"6px"}}>{c.l}</div>
                  <div style={{fontSize:"22px",color:c.c,fontWeight:"600"}}>{c.v}</div>
                </div>
              ))}
            </div>
            {M.details.length>0?(
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:"14px"}}>
                <div style={{...S.card,padding:"16px"}}>
                  <div style={{...S.lbl,marginBottom:"12px",...S.green}}>🏆 Top Profit Makers</div>
                  {[...M.details].sort((a,b)=>b.margin-a.margin).slice(0,4).map((r,i)=>(
                    <div key={r.name} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid #1a1916",alignItems:"center"}}>
                      <span style={{fontSize:"13px",color:"#ccc"}}>#{i+1} {r.name}</span>
                      <span style={{...S.green,fontSize:"13px",fontWeight:"600"}}>${r.margin.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div style={{...S.card,padding:"16px"}}>
                  <div style={{...S.lbl,marginBottom:"12px",color:"#d4a060"}}>📦 Most Ordered</div>
                  {[...M.details].sort((a,b)=>b.qty-a.qty).slice(0,4).map((r,i)=>(
                    <div key={r.name} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid #1a1916",alignItems:"center"}}>
                      <span style={{fontSize:"13px",color:"#ccc"}}>#{i+1} {r.name}</span>
                      <span style={{color:"#d4a060",fontSize:"13px",fontWeight:"600"}}>{r.qty} plates</span>
                    </div>
                  ))}
                </div>
              </div>
            ):(
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
              <button onClick={savePAR} style={S.btn} disabled={!!saving}>
                {saving?"Saving…":"Save to Zoho"}
              </button>
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
                              value={parData[ing.id]?.on_hand??""} placeholder="—"
                              onChange={e=>setParData(p=>({...p,[ing.id]:{...(p[ing.id]||{}),on_hand:e.target.value}}))}
                              style={{...S.inp,width:"72px",padding:"5px 7px"}}/>
                          </td>
                          <td style={{padding:"4px 12px"}}>
                            <input type="number" min="0" step="0.5"
                              value={parData[ing.id]?.order_qty??""} placeholder="—"
                              onChange={e=>setParData(p=>({...p,[ing.id]:{...(p[ing.id]||{}),order_qty:e.target.value}}))}
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
            <div style={{background:"#080f08",border:"1px solid #1a3a1a",borderRadius:"2px",padding:"10px 14px",marginBottom:"18px",fontSize:"12px",color:"#5a9a5a",lineHeight:"1.6"}}>
              💡 Costs save to Zoho automatically as you type. Click 🔍 to compare supplier prices.
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
                                <input type="number" min="0" step="0.01"
                                  value={costs[ing.id]??""}
                                  onChange={e=>saveCost(ing.id,parseFloat(e.target.value)||0)}
                                  style={{...S.inp,width:"90px",padding:"5px 7px",color:"#c8a96e"}}/>
                              </div>
                            </td>
                            <td style={{padding:"4px 12px"}}>
                              <button onClick={()=>setPP(pricePanel===ing.id?null:ing.id)}
                                style={{background:"#0a160a",border:"1px solid #1e3e1e",color:"#5ab05a",padding:"5px 12px",fontSize:"11px",cursor:"pointer",borderRadius:"2px"}}>
                                {pricePanel===ing.id?"▲ Close":"🔍 Compare"}
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
            <div style={{...S.lbl,marginBottom:"16px"}}>Menu items saved in Zoho Creator</div>
            <div style={{...S.card,padding:"14px 16px",marginBottom:"18px",display:"flex",gap:"8px",alignItems:"center",flexWrap:"wrap"}}>
              <input value={newName} onChange={e=>setNN(e.target.value)} placeholder="New menu item"
                style={{...S.inp,flex:1,minWidth:"160px"}}/>
              <span style={{color:"#555"}}>$</span>
              <input type="number" value={newPx} onChange={e=>setNP(e.target.value)} placeholder="Price" min="0"
                style={{...S.inp,width:"80px",...S.amber}}/>
              <button onClick={saveNewRecipe} style={S.btn} disabled={!!saving}>+ Add</button>
            </div>
            {recipesWithIngs.map(rec=>{
              const pc=(rec.ingredients||[]).reduce((s,ri)=>{
                return s+(parseFloat(costs[ri.ingredient_id||ri.Ingredient_ID]||0)*parseFloat(ri.quantity_per_plate||ri.Quantity_Per_Plate||0));
              },0);
              const price=parseFloat(rec.selling_price||rec.price||0);
              const pct=price>0?(pc/price*100).toFixed(1):0;
              return(
                <div key={rec.ID||rec.id} style={{...S.card,marginBottom:"14px",overflow:"hidden"}}>
                  <div style={{padding:"12px 16px",borderBottom:"1px solid #1e1c18",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"8px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:"10px",flexWrap:"wrap"}}>
                      <span style={{fontSize:"15px",color:"#e8dfc8"}}>{rec.recipe_name||rec.name}</span>
                      <span style={{...S.amber,fontSize:"13px"}}>${price.toFixed(2)}</span>
                      {pc>0&&<>
                        <span style={{fontSize:"12px",...S.red}}>Cost ${pc.toFixed(2)}</span>
                        <span style={{fontSize:"12px",...S.green}}>Margin ${(price-pc).toFixed(2)}</span>
                        <span style={{fontSize:"11px",color:parseFloat(pct)>35?"#c07070":"#7eb87e"}}>({pct}%)</span>
                      </>}
                    </div>
                    <button onClick={()=>setEditRec(editRec===(rec.ID||rec.id)?null:(rec.ID||rec.id))}
                      style={{background:"none",border:"1px solid #2e2b26",color:"#888",padding:"4px 10px",fontSize:"11px",cursor:"pointer",borderRadius:"2px"}}>
                      {editRec===(rec.ID||rec.id)?"✓ Done":"Edit Ingredients"}
                    </button>
                  </div>
                  {(rec.ingredients||[]).length>0&&(
                    <div style={{padding:"8px 0"}}>
                      <table style={{width:"100%",borderCollapse:"collapse"}}>
                        <tbody>
                          {(rec.ingredients||[]).map((ri,i)=>{
                            const ing=INGREDIENTS.find(x=>x.id===(ri.ingredient_id||ri.Ingredient_ID));
                            const lc=parseFloat(costs[ri.ingredient_id||ri.Ingredient_ID]||0)*parseFloat(ri.quantity_per_plate||ri.Quantity_Per_Plate||0);
                            return(
                              <tr key={i} style={{borderTop:i>0?"1px solid #191714":"none"}}>
                                <td style={{...S.td,color:"#aaa"}}>{ri.ingredient_name||ri.Ingredient_Name||ing?.name}</td>
                                <td style={{...S.td,fontSize:"11px",color:"#555"}}>{ri.quantity_per_plate||ri.Quantity_Per_Plate} × {ing?.unit}</td>
                                <td style={{...S.td,...S.red,textAlign:"right"}}>${lc.toFixed(3)}</td>
                              </tr>
                            );
                          })}
                          <tr style={{borderTop:"1px solid #252220",background:"#100f0d"}}>
                            <td style={{...S.td,...S.lbl}} colSpan={2}>Total plate cost</td>
                            <td style={{...S.td,...S.red,textAlign:"right",fontWeight:"700"}}>${pc.toFixed(2)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                  {editRec===(rec.ID||rec.id)&&(
                    <AddIngToRecipe recipe={rec} costs={costs} onAdd={async(ingId,qty)=>{
                      const ing=INGREDIENTS.find(i=>i.id===ingId);
                      const d={
                        recipe_id:rec.ID||rec.id,
                        recipe_name:rec.recipe_name||rec.name,
                        ingredient_id:ingId,
                        ingredient_name:ing?.name||ingId,
                        quantity_per_plate:qty,
                      };
                      const r=await zoho("create","Recipe_Ingredients",{data:d});
                      if(r.data) setRecipeIngs(prev=>[...prev,{...d,ID:r.data.ID}]);
                      showFlash("Ingredient added to Zoho ✓");
                    }}/>
                  )}
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
                  {recipesWithIngs.map((rec,idx)=>{
                    const recId=rec.ID||rec.id;
                    const qty=parseInt(salesData[recId]?.qty||0);
                    const price=parseFloat(rec.selling_price||rec.price||0);
                    const pc=(rec.ingredients||[]).reduce((s,ri)=>s+(parseFloat(costs[ri.ingredient_id||ri.Ingredient_ID]||0)*parseFloat(ri.quantity_per_plate||ri.Quantity_Per_Plate||0)),0);
                    return(
                      <tr key={recId} style={{borderTop:idx>0?"1px solid #1a1916":"none"}}>
                        <td style={S.td}>{rec.recipe_name||rec.name}</td>
                        <td style={{...S.td,...S.amber}}>${price.toFixed(2)}</td>
                        <td style={{padding:"4px 12px"}}>
                          <input type="number" min="0" step="1"
                            value={salesData[recId]?.qty??""} placeholder="0"
                            onChange={e=>setSalesData(p=>({...p,[recId]:{...(p[recId]||{}),qty:parseInt(e.target.value)||0}}))}
                            style={{...S.inp,width:"72px",padding:"5px 7px",fontSize:"14px"}}/>
                        </td>
                        <td style={{...S.td,...S.green}}>${(qty*price).toFixed(2)}</td>
                        <td style={{...S.td,...S.red}}>{pc>0?`$${(qty*pc).toFixed(2)}`:"—"}</td>
                      </tr>
                    );
                  })}
                  <tr style={{borderTop:"2px solid #252220",background:"#100f0d"}}>
                    <td style={{...S.td,...S.lbl}} colSpan={2}>Totals</td>
                    <td style={{...S.td,fontWeight:"700",color:"#e8dfc8"}}>
                      {Object.values(salesData).reduce((s,v)=>s+(parseInt(v?.qty)||0),0)} plates
                    </td>
                    <td style={{...S.td,fontWeight:"700",...S.green}}>${M.rev.toFixed(2)}</td>
                    <td style={{...S.td,fontWeight:"700",...S.red}}>${M.cogs.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <button onClick={saveSales} style={S.btn} disabled={!!saving}>
              {saving?"Saving to Zoho…":"Save to Zoho"}
            </button>
          </div>
        )}

        {/* ══ STAFF HOURS ══ */}
        {tab==="Staff Hours"&&(
          <div>
            <div style={{...S.lbl,marginBottom:"8px"}}>Log hours worked — {date}</div>
            <div style={{fontSize:"12px",color:"#555",marginBottom:"16px"}}>Hours save to Zoho Creator. Labor cost auto-calculates from hourly rate.</div>
            {employees.length===0?(
              <div style={{...S.card,padding:"32px",textAlign:"center",color:"#444",fontSize:"13px"}}>
                No employees in Zoho yet. Admin must add staff in the Employees tab.
              </div>
            ):(
              <>
                <div style={{...S.card,overflow:"hidden",marginBottom:"14px"}}>
                  <table style={{width:"100%",borderCollapse:"collapse"}}>
                    <thead><tr>
                      <th style={S.th}>Staff Member</th><th style={S.th}>Designation</th>
                      <th style={S.th}>Rate/hr</th><th style={S.th}>Hours</th><th style={S.th}>Cost</th>
                    </tr></thead>
                    <tbody>
                      {employees.map((emp,idx)=>{
                        const empId=emp.ID||emp.id;
                        const hrs=parseFloat(laborData[empId]?.hours||0);
                        const rate=parseFloat(emp.hourly_rate||emp.Hourly_Rate||0);
                        return(
                          <tr key={empId} style={{borderTop:idx>0?"1px solid #1a1916":"none"}}>
                            <td style={S.td}><div style={{fontWeight:"600",color:"#e8dfc8"}}>{emp.first_name||emp.First_Name} {emp.last_name||emp.Last_Name}</div></td>
                            <td style={{...S.td,color:"#888",fontSize:"12px"}}>{emp.designation||emp.Designation}</td>
                            <td style={{...S.td,...S.amber}}>${rate.toFixed(2)}</td>
                            <td style={{padding:"4px 12px"}}>
                              <input type="number" min="0" step="0.5" max="24"
                                value={laborData[empId]?.hours??""} placeholder="0"
                                onChange={e=>setLaborData(p=>({...p,[empId]:{...(p[empId]||{}),hours:parseFloat(e.target.value)||0}}))}
                                style={{...S.inp,width:"72px",padding:"5px 7px"}}/>
                            </td>
                            <td style={{...S.td,color:"#d4a060",fontWeight:"600"}}>
                              {hrs>0?`$${(hrs*rate).toFixed(2)}`:"—"}
                            </td>
                          </tr>
                        );
                      })}
                      <tr style={{borderTop:"2px solid #252220",background:"#100f0d"}}>
                        <td style={{...S.td,...S.lbl}} colSpan={3}>Total Labor</td>
                        <td style={{...S.td,fontWeight:"700",color:"#e8dfc8"}}>
                          {Object.values(laborData).reduce((s,v)=>s+(parseFloat(v?.hours)||0),0).toFixed(1)} hrs
                        </td>
                        <td style={{...S.td,fontWeight:"700",color:"#d4a060"}}>${laborCost.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <button onClick={saveLabor} style={S.btn} disabled={!!saving}>
                  {saving?"Saving to Zoho…":"Save to Zoho"}
                </button>
              </>
            )}
          </div>
        )}

        {/* ══ ANALYTICS ══ */}
        {tab==="Analytics"&&(
          <div>
            <div style={{...S.lbl,marginBottom:"8px"}}>Item Performance — {date}</div>
            <div style={{display:"flex",gap:"6px",marginBottom:"20px",flexWrap:"wrap"}}>
              {[
                {k:"profit",l:"💰 Most Profitable",c:"#7eb87e"},
                {k:"volume",l:"📦 Most Ordered",c:"#d4a060"},
                {k:"drain", l:"🔻 Cost Drain",c:"#c07070"},
                {k:"cogspct",l:"⚠️ Worst Margin",c:"#c07070"},
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
                No sales data for {date}. Enter sales to see analytics.
              </div>
            ):(
              <>
                <div style={{...S.card,overflow:"hidden",marginBottom:"20px"}}>
                  <table style={{width:"100%",borderCollapse:"collapse"}}>
                    <thead><tr>
                      {["#","Item","Qty","Revenue","COGS","Profit","COGS%",""].map(h=><th key={h} style={S.th}>{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {sorted[analyticView].map((r,i)=>{
                        const isGood=analyticView==="profit"||analyticView==="volume";
                        const maxVal=Math.max(...M.details.map(x=>({profit:x.margin,volume:x.qty,drain:x.cogs,cogspct:x.cogsPct}[analyticView])));
                        const barVal={profit:r.margin,volume:r.qty,drain:r.cogs,cogspct:r.cogsPct}[analyticView];
                        const barColor=analyticView==="profit"?"#7eb87e":analyticView==="volume"?"#c8a96e":"#c07070";
                        return(
                          <tr key={r.name} style={{borderTop:"1px solid #1a1916",background:i===0&&isGood?"#141e14":i===0&&!isGood?"#1e1010":"transparent"}}>
                            <td style={{...S.td,color:i===0?"#c8a96e":"#555",fontWeight:"700"}}>{i===0?"★":i+1}</td>
                            <td style={{...S.td,fontWeight:i===0?"700":"400",color:i===0?"#e8dfc8":"#ccc"}}>{r.name}</td>
                            <td style={{...S.td,color:"#888"}}>{r.qty}</td>
                            <td style={{...S.td,...S.green}}>${r.revenue.toFixed(2)}</td>
                            <td style={{...S.td,...S.red}}>${r.cogs.toFixed(2)}</td>
                            <td style={{...S.td,fontWeight:"600",color:r.margin>=0?"#7eb87e":"#c07070"}}>${r.margin.toFixed(2)}</td>
                            <td style={{...S.td,color:r.cogsPct>35?"#c07070":"#7eb87e"}}>{r.cogsPct.toFixed(1)}%</td>
                            <td style={{padding:"8px 12px",minWidth:"100px"}}><Bar value={barVal} max={maxVal} color={barColor}/></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:"14px"}}>
                  {[
                    {title:"🏆 Star Item",sub:"Highest total profit",item:sorted.profit[0],val:`$${sorted.profit[0]?.margin.toFixed(2)} profit`,color:"#7eb87e",bg:"#0a160a",tip:"Push this item — it makes you the most money per plate."},
                    {title:"📦 Volume King",sub:"Most plates sold",item:sorted.volume[0],val:`${sorted.volume[0]?.qty} plates`,color:"#d4a060",bg:"#160e00",tip:"Your most popular item. Keep it consistent and always available."},
                    {title:"🔻 Cost Drain",sub:"Eating most food budget",item:sorted.drain[0],val:`$${sorted.drain[0]?.cogs.toFixed(2)} cost`,color:"#c07070",bg:"#160a0a",tip:"Check ingredient costs for this dish — may need a price increase."},
                    {title:"⚠️ Worst Margin",sub:"Lowest profit %",item:sorted.cogspct[0],val:`${sorted.cogspct[0]?.cogsPct.toFixed(1)}% food cost`,color:"#c07070",bg:"#160a0a",tip:"Consider raising price or reducing portion cost. Target under 30%."},
                  ].filter(c=>c.item).map(c=>(
                    <div key={c.title} style={{background:c.bg,border:`1px solid ${c.color}33`,borderRadius:"3px",padding:"16px"}}>
                      <div style={{fontSize:"13px",color:c.color,fontWeight:"700",marginBottom:"2px"}}>{c.title}</div>
                      <div style={{...S.lbl,marginBottom:"8px"}}>{c.sub}</div>
                      <div style={{fontSize:"18px",color:"#e8dfc8",marginBottom:"4px"}}>{c.item?.name}</div>
                      <div style={{fontSize:"14px",color:c.color,fontWeight:"600",marginBottom:"10px"}}>{c.val}</div>
                      <div style={{fontSize:"11px",color:"#666",lineHeight:"1.5",borderTop:`1px solid ${c.color}22`,paddingTop:"8px"}}>{c.tip}</div>
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
            <div style={{...S.lbl,marginBottom:"20px"}}>Full P&L — {date} — Live from Zoho</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:"14px",marginBottom:"22px"}}>
              {[
                {l:"Gross Revenue",  v:`$${M.rev.toFixed(2)}`,c:"#7eb87e"},
                {l:"Food COGS",      v:`$${M.cogs.toFixed(2)} (${M.pct}%)`,c:"#c07070"},
                {l:"Labor Cost",     v:`$${laborCost.toFixed(2)} (${laborPct}%)`,c:"#d4a060"},
                {l:"Total Cost",     v:`$${totalCost.toFixed(2)} (${totalCostPct}%)`,c:"#c07070"},
                {l:"Net Profit",     v:`$${netProfit.toFixed(2)}`,c:netProfit>=0?"#7eb87e":"#c07070",sub:netProfit<0?"⚠️ Loss day":""},
              ].map(c=>(
                <div key={c.l} style={{background:"#141210",border:`1px solid ${c.c}33`,borderRadius:"3px",padding:"20px"}}>
                  <div style={{...S.lbl,color:c.c,marginBottom:"6px"}}>{c.l}</div>
                  <div style={{fontSize:"24px",color:c.c,fontWeight:"600"}}>{c.v}</div>
                  {c.sub&&<div style={{fontSize:"11px",color:c.c,marginTop:"4px"}}>{c.sub}</div>}
                </div>
              ))}
            </div>
            {laborCost>0&&(
              <div style={{...S.card,overflow:"hidden",marginBottom:"16px"}}>
                <div style={{padding:"12px 14px",borderBottom:"1px solid #1e1c18",...S.lbl,color:"#d4a060"}}>Labor breakdown</div>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead><tr>{["Staff","Role","Rate","Hours","Cost"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {employees.filter(e=>parseFloat(laborData[e.ID||e.id]?.hours||0)>0).map((emp,i)=>{
                      const empId=emp.ID||emp.id;
                      const hrs=parseFloat(laborData[empId]?.hours||0);
                      const rate=parseFloat(emp.hourly_rate||emp.Hourly_Rate||0);
                      return(
                        <tr key={empId} style={{borderTop:i>0?"1px solid #1a1916":"none"}}>
                          <td style={S.td}>{emp.first_name||emp.First_Name} {emp.last_name||emp.Last_Name}</td>
                          <td style={{...S.td,color:"#888",fontSize:"12px"}}>{emp.designation||emp.Designation}</td>
                          <td style={{...S.td,...S.amber}}>${rate.toFixed(2)}/hr</td>
                          <td style={{...S.td,color:"#ccc"}}>{hrs}h</td>
                          <td style={{...S.td,color:"#d4a060",fontWeight:"600"}}>${(hrs*rate).toFixed(2)}</td>
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
            <div style={{...S.card,overflow:"hidden"}}>
              <div style={{padding:"12px 14px",borderBottom:"1px solid #1e1c18",...S.lbl}}>Item breakdown</div>
              {M.details.length===0?(
                <div style={{padding:"24px",color:"#444",fontSize:"13px"}}>No sales for {date}.</div>
              ):(
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead><tr>{["Item","Qty","Revenue","COGS","Profit","COGS%"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {M.details.sort((a,b)=>b.margin-a.margin).map(r=>{
                      const pct=r.revenue>0?(r.cogs/r.revenue*100).toFixed(1):0;
                      return(
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
                      <td style={{...S.td,...S.lbl}} colSpan={2}>Total</td>
                      <td style={{...S.td,fontWeight:"700",...S.green}}>${M.rev.toFixed(2)}</td>
                      <td style={{...S.td,fontWeight:"700",...S.red}}>${M.cogs.toFixed(2)}</td>
                      <td style={{...S.td,fontWeight:"700",...S.green}}>${M.profit.toFixed(2)}</td>
                      <td style={{...S.td,fontWeight:"700",color:parseFloat(M.pct)>35?"#c07070":"#7eb87e"}}>{M.pct}%</td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ══ EMPLOYEES ══ */}
        {tab==="Employees"&&isAdmin&&(
          <div>
            <div style={{...S.lbl,marginBottom:"20px"}}>Staff Directory — Stored in Zoho Creator</div>
            <div style={{...S.card,padding:"20px",marginBottom:"24px"}}>
              <div style={{...S.lbl,marginBottom:"14px",...S.amber}}>{editEmpId?"Edit Employee":"Add New Employee"}</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:"10px",marginBottom:"12px"}}>
                {[
                  {l:"First Name *",  k:"firstName",  ph:"Jennifer", type:"text"},
                  {l:"Last Name *",   k:"lastName",   ph:"Smith",    type:"text"},
                  {l:"Hourly Rate ($)",k:"rate",      ph:"15.00",    type:"number"},
                  {l:"Login PIN *",   k:"pin",        ph:"5678",     type:"text"},
                ].map(f=>(
                  <div key={f.k}>
                    <div style={{...S.lbl,marginBottom:"4px"}}>{f.l}</div>
                    <input type={f.type} value={empForm[f.k]} placeholder={f.ph}
                      onChange={e=>setEmpForm(p=>({...p,[f.k]:e.target.value}))}
                      style={{...S.inp,width:"100%",boxSizing:"border-box",color:f.k==="rate"?"#c8a96e":"#d4c9b8"}}/>
                  </div>
                ))}
                <div>
                  <div style={{...S.lbl,marginBottom:"4px"}}>Designation *</div>
                  <select value={empForm.designation} onChange={e=>setEmpForm(p=>({...p,designation:e.target.value}))}
                    style={{...S.inp,width:"100%",boxSizing:"border-box"}}>
                    {DESIGNATIONS.map(d=><option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
                <button onClick={saveEmployee} style={S.btn} disabled={!!saving}>
                  {saving?"Saving…":editEmpId?"Update Employee":"Save to Zoho"}
                </button>
                {editEmpId&&(
                  <button onClick={()=>{setEditEmpId(null);setEmpForm({firstName:"",lastName:"",designation:DESIGNATIONS[0],rate:"",pin:""});}}
                    style={{...S.btnDanger,padding:"8px 16px"}}>Cancel</button>
                )}
              </div>
            </div>
            {employees.length===0?(
              <div style={{...S.card,padding:"32px",textAlign:"center",color:"#444",fontSize:"13px"}}>
                No employees in Zoho yet. Add your first staff member above.
              </div>
            ):(
              <div style={{...S.card,overflow:"hidden"}}>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead><tr>
                    {["Name","Designation","Rate/hr","Weekly Est.","PIN","Actions"].map(h=><th key={h} style={S.th}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {employees.map((emp,idx)=>{
                      const empId=emp.ID||emp.id;
                      const rate=parseFloat(emp.hourly_rate||emp.Hourly_Rate||0);
                      return(
                        <tr key={empId} style={{borderTop:idx>0?"1px solid #1a1916":"none"}}>
                          <td style={S.td}><div style={{fontWeight:"600",color:"#e8dfc8"}}>{emp.first_name||emp.First_Name} {emp.last_name||emp.Last_Name}</div></td>
                          <td style={{...S.td,color:"#888",fontSize:"12px"}}>{emp.designation||emp.Designation}</td>
                          <td style={{...S.td,...S.amber}}>${rate.toFixed(2)}/hr</td>
                          <td style={{...S.td,color:"#666",fontSize:"12px"}}>${(rate*40).toFixed(2)}</td>
                          <td style={S.td}>
                            <span style={{background:"#1a1814",border:"1px solid #2e2b26",padding:"2px 8px",borderRadius:"2px",fontSize:"12px",fontFamily:"monospace",color:"#999",letterSpacing:"2px"}}>
                              {emp.pin||emp.PIN}
                            </span>
                          </td>
                          <td style={{padding:"4px 12px"}}>
                            <div style={{display:"flex",gap:"6px"}}>
                              <button onClick={()=>{
                                setEditEmpId(empId);
                                setEmpForm({firstName:emp.first_name||emp.First_Name||"",lastName:emp.last_name||emp.Last_Name||"",designation:emp.designation||emp.Designation||DESIGNATIONS[0],rate:emp.hourly_rate||emp.Hourly_Rate||"",pin:emp.pin||emp.PIN||""});
                                window.scrollTo({top:0,behavior:"smooth"});
                              }} style={S.btnSm}>Edit</button>
                              <button onClick={async()=>{
                                if(!window.confirm(`Remove ${emp.first_name||emp.First_Name}?`)) return;
                                await zoho("delete","Employees_Report",{recordId:empId});
                                setEmps(prev=>prev.filter(e=>(e.ID||e.id)!==empId));
                                showFlash("Employee removed from Zoho ✓");
                              }} style={S.btnDanger}>Remove</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div style={{padding:"10px 14px",borderTop:"1px solid #1e1c18",fontSize:"11px",color:"#444",display:"flex",justifyContent:"space-between"}}>
                  <span>{employees.length} staff in Zoho</span>
                  <span>Est. weekly payroll (40h): ${employees.reduce((s,e)=>s+(parseFloat(e.hourly_rate||e.Hourly_Rate||0)*40),0).toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ ROLE TEMPLATES ══ */}
        {tab==="Role Templates"&&isAdmin&&(
          <RoleTemplates S={S} showFlash={showFlash} employees={employees} setEmps={setEmps}/>
        )}

        {/* ══ MY SCHEDULE ══ */}
        {tab==="My Schedule"&&(
          <MySchedule S={S} me={me} shifts={shifts}/>
        )}

        {/* ══ CLOCK IN/OUT ══ */}
        {tab==="Clock In/Out"&&(
          <ClockInOut S={S} me={me} shifts={shifts} showFlash={showFlash}/>
        )}

        {/* ══ MY TIMESHEET ══ */}
        {tab==="My Timesheet"&&(
          <MyTimesheet S={S} me={me} shifts={shifts}/>
        )}

        {/* ══ TIME OFF ══ */}
        {tab==="Time Off"&&(
          <TimeOff S={S} me={me} shifts={shifts} showFlash={showFlash}/>
        )}

        {/* ══ SCHEDULING (Admin) ══ */}
        {tab==="Scheduling"&&isAdmin&&(
          <Scheduling S={S} employees={employees} shifts={shifts} showFlash={showFlash}/>
        )}

        {/* ══ TIME OFF REQUESTS (Admin) ══ */}
        {tab==="Time Off Requests"&&isAdmin&&(
          <TimeOffRequests S={S} employees={employees} shifts={shifts} showFlash={showFlash}/>
        )}

        {/* ══ TEMP LOG ══ */}
        {(tab==="Temp Log")&&(
          <TempLog date={date} me={me} zoho={zoho} showFlash={showFlash} S={S}/>
        )}

        {/* ══ CHECKLISTS ══ */}
        {(tab==="Checklists")&&(
          <Checklists date={date} me={me} zoho={zoho} showFlash={showFlash} S={S}/>
        )}

        {/* ══ WASTE LOG ══ */}
        {(tab==="Waste Log")&&(
          <WasteLog date={date} me={me} zoho={zoho} showFlash={showFlash} S={S} recipes={recipesWithIngs}/>
        )}

        {/* ══ SOPs ══ */}
        {(tab==="SOPs")&&isAdmin&&(
          <SOPs S={S} showFlash={showFlash}/>
        )}

        {/* ══ RECEIPTS ══ */}
        {(tab==="Receipts")&&isAdmin&&(
          <Receipts S={S} showFlash={showFlash} zoho={zoho}/>
        )}

        {/* ══ EXPORT ══ */}
        {(tab==="Export")&&isAdmin&&(
          <ExportPanel
            S={S} date={date}
            M={M} employees={employees}
            laborCost={laborCost} netProfit={netProfit}
            laborPct={laborPct} totalCostPct={totalCostPct}
            recipes={recipesWithIngs} costs={costs}
            zoho={zoho}
          />
        )}

      </div>
    </div>
  );
}

// ── Add ingredient to recipe sub-component ──
function AddIngToRecipe({recipe,costs,onAdd}){
  const [selId,setSel]=useState(INGREDIENTS[0].id);
  const [qty,setQty]=useState("");
  return(
    <div style={{display:"flex",gap:"8px",alignItems:"center",flexWrap:"wrap",padding:"10px 16px",background:"#0e100e",borderTop:"1px solid #1e2a1e"}}>
      <span style={{fontSize:"11px",color:"#5a8a5a"}}>+ Add ingredient:</span>
      <select value={selId} onChange={e=>setSel(e.target.value)} style={{flex:1,minWidth:"160px",background:"#0c0b09",border:"1px solid #2a3a2a",color:"#d4c9b8",padding:"5px 8px",fontSize:"12px",borderRadius:"2px",outline:"none"}}>
        {INGREDIENTS.map(i=><option key={i.id} value={i.id}>{i.name} ({i.unit})</option>)}
      </select>
      <input type="number" min="0" step="0.001" value={qty} onChange={e=>setQty(e.target.value)} placeholder="qty"
        style={{width:"64px",background:"#0c0b09",border:"1px solid #2a3a2a",color:"#c8a96e",padding:"5px 8px",fontSize:"12px",borderRadius:"2px",outline:"none"}}/>
      <button onClick={()=>{
        if(!qty||isNaN(parseFloat(qty))) return;
        onAdd(selId,parseFloat(qty));
        setQty("");
      }} style={{background:"#1e2a1e",color:"#7eb87e",border:"1px solid #3a5a3a",padding:"5px 12px",fontSize:"12px",cursor:"pointer",borderRadius:"2px"}}>Add to Zoho</button>
    </div>
  );
}

// ══════════════════════════════════════
// TEMP LOG COMPONENT
// ══════════════════════════════════════
function TempLog({date,me,zoho,showFlash,S}){
  const ITEMS=[
    "Walk-in Cooler","Walk-in Freezer","Prep Cooler","Line Cooler",
    "Hot Hold Cabinet","Steam Table","Fryer Oil","Cooked Chicken",
    "Cooked Grits","Sanitizer Solution"
  ];
  const LIMITS={
    "Walk-in Cooler":"≤ 41°F","Walk-in Freezer":"≤ 0°F",
    "Prep Cooler":"≤ 41°F","Line Cooler":"≤ 41°F",
    "Hot Hold Cabinet":"≥ 135°F","Steam Table":"≥ 135°F",
    "Fryer Oil":"325-375°F","Cooked Chicken":"≥ 165°F",
    "Cooked Grits":"≥ 165°F","Sanitizer Solution":"50-200 ppm"
  };
  const [logs,setLogs]=useState({});
  const [saved,setSaved]=useState(false);
  const [loading,setLoading]=useState(false);
  const times=["7:00 AM","9:00 AM","11:00 AM","1:00 PM","3:00 PM"];

  const save=async()=>{
    setLoading(true);
    try{
      for(const item of ITEMS){
        for(const t of times){
          const val=logs[`${item}-${t}`];
          if(!val) continue;
          await zoho("create","Temp_Log",{data:{
            log_date:date,check_time:t,item_name:item,
            temperature:parseFloat(val)||0,
            logged_by:me?.firstName||"",
            safe_range:LIMITS[item]||"",
          }});
        }
      }
      setSaved(true);
      showFlash("Temp log saved to Zoho ✓");
    }catch(e){showFlash("Save error: "+e.message);}
    setLoading(false);
  };

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px",flexWrap:"wrap",gap:"8px"}}>
        <div>
          <div style={{...S.lbl,marginBottom:"4px"}}>Temperature Log — {date}</div>
          <div style={{fontSize:"12px",color:"#555"}}>Enter temperatures in °F every 2 hours. Required for health code compliance.</div>
        </div>
        <button onClick={save} disabled={loading} style={S.btn}>{loading?"Saving…":"Save to Zoho"}</button>
      </div>
      <div style={{...S.card,overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr>
            <th style={S.th}>Item</th>
            <th style={S.th}>Safe Range</th>
            {times.map(t=><th key={t} style={S.th}>{t}</th>)}
          </tr></thead>
          <tbody>
            {ITEMS.map((item,idx)=>(
              <tr key={item} style={{borderTop:idx>0?"1px solid #1a1916":"none"}}>
                <td style={S.td}>{item}</td>
                <td style={{...S.td,fontSize:"11px",color:"#5a9a5a"}}>{LIMITS[item]}</td>
                {times.map(t=>{
                  const key=`${item}-${t}`;
                  const val=parseFloat(logs[key]||0);
                  const isHot=item.includes("Hot")||item.includes("Steam")||item.includes("Cooked")||item.includes("Fryer");
                  const isBad=val>0&&(isHot?val<135:item.includes("Freezer")?val>0:item.includes("Sanitizer")?false:val>41);
                  return(
                    <td key={t} style={{padding:"4px 8px"}}>
                      <input type="number" step="0.1"
                        value={logs[key]||""}
                        onChange={e=>setLogs(p=>({...p,[key]:e.target.value}))}
                        placeholder="°F"
                        style={{...S.inp,width:"60px",padding:"4px 6px",fontSize:"12px",
                          color:isBad?"#c07070":val>0?"#7eb87e":"#d4c9b8",
                          border:isBad?"1px solid #c07070":"1px solid #2e2b26"}}/>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{marginTop:"12px",fontSize:"11px",color:"#444"}}>
        🌡️ Red = out of safe range. All temps in °F. Sanitizer in ppm.
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// CHECKLISTS COMPONENT
// ══════════════════════════════════════
function Checklists({date,me,zoho,showFlash,S}){
  const OPENING=[
    "Unlock doors and disarm alarm",
    "Turn on all equipment (grills, fryers, ovens)",
    "Check walk-in cooler and freezer temps",
    "Set up sanitizer buckets (50-200 ppm)",
    "Stock line stations with prepped ingredients",
    "Check PAR levels — restock from walk-in",
    "Turn on POS system and printers",
    "Set up host stand and menus",
    "Brief staff on specials and 86'd items",
    "Complete opening temp log",
  ];
  const CLOSING=[
    "Break down and clean all line stations",
    "Clean and sanitize all prep surfaces",
    "Empty and clean fryers (or filter oil)",
    "Store all food properly labeled with date",
    "Complete closing temp log",
    "Sweep and mop kitchen floor",
    "Empty all trash cans",
    "Turn off all equipment",
    "Lock walk-in cooler and freezer",
    "Set alarm and lock doors",
  ];

  const [openChecks,setOC]=useState({});
  const [closeChecks,setCC]=useState({});
  const [type,setType]=useState("opening");
  const checks=type==="opening"?OPENING:CLOSING;
  const setChecks=type==="opening"?setOC:setCC;
  const checkedItems=type==="opening"?openChecks:closeChecks;
  const done=checks.filter((_,i)=>checkedItems[i]).length;

  const save=async()=>{
    try{
      await zoho("create","Checklist_Log",{data:{
        log_date:date,checklist_type:type,
        completed_by:me?.firstName||"",
        items_done:done,total_items:checks.length,
        completion_pct:Math.round(done/checks.length*100),
      }});
      showFlash(`${type} checklist saved ✓`);
    }catch(e){showFlash("Save error — add Checklist_Log form to Zoho");}
  };

  return(
    <div>
      <div style={{display:"flex",gap:"8px",marginBottom:"16px",flexWrap:"wrap",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",gap:"8px"}}>
          {["opening","closing"].map(t=>(
            <button key={t} onClick={()=>setType(t)} style={{
              background:type===t?"#1e1c18":"none",
              border:`1px solid ${type===t?"#c8a96e":"#2e2b26"}`,
              color:type===t?"#c8a96e":"#666",
              padding:"7px 16px",fontSize:"12px",cursor:"pointer",borderRadius:"2px",
              textTransform:"capitalize",fontWeight:type===t?"700":"400"}}>
              {t==="opening"?"🌅 Opening":"🌙 Closing"}
            </button>
          ))}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <span style={{fontSize:"12px",color:done===checks.length?"#7eb87e":"#888"}}>
            {done}/{checks.length} complete
          </span>
          <button onClick={save} style={S.btn}>Save to Zoho</button>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{background:"#1a1916",borderRadius:"2px",height:"6px",width:"100%",marginBottom:"16px"}}>
        <div style={{background:done===checks.length?"#7eb87e":"#c8a96e",height:"6px",
          borderRadius:"2px",width:`${done/checks.length*100}%`,transition:"width 0.3s"}}/>
      </div>

      <div style={{...S.card,overflow:"hidden"}}>
        {checks.map((item,i)=>(
          <div key={i} onClick={()=>setChecks(p=>({...p,[i]:!p[i]}))}
            style={{display:"flex",alignItems:"center",gap:"12px",padding:"12px 16px",
              borderTop:i>0?"1px solid #1a1916":"none",cursor:"pointer",
              background:checkedItems[i]?"#0e160e":"transparent",
              transition:"background 0.2s"}}>
            <div style={{width:"20px",height:"20px",borderRadius:"3px",flexShrink:0,
              border:checkedItems[i]?"none":"1px solid #333",
              background:checkedItems[i]?"#7eb87e":"transparent",
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:"14px"}}>
              {checkedItems[i]&&"✓"}
            </div>
            <span style={{fontSize:"13px",color:checkedItems[i]?"#7eb87e":"#ccc",
              textDecoration:checkedItems[i]?"line-through":"none"}}>
              {item}
            </span>
          </div>
        ))}
      </div>
      <div style={{marginTop:"10px",fontSize:"11px",color:"#444"}}>
        Completed by: {me?.firstName||"Staff"} — {date}
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// WASTE LOG COMPONENT
// ══════════════════════════════════════
function WasteLog({date,me,zoho,showFlash,S,recipes}){
  const REASONS=["Overcooked","Expired","Dropped","Wrong Order","Prep Error","Spoiled","Other"];
  const [entries,setEntries]=useState([{item:"",qty:"",unit:"",reason:REASONS[0],cost:""}]);
  const [saving,setSaving]=useState(false);

  const addRow=()=>setEntries(p=>[...p,{item:"",qty:"",unit:"",reason:REASONS[0],cost:""}]);
  const updateRow=(i,field,val)=>setEntries(p=>p.map((r,idx)=>idx===i?{...r,[field]:val}:r));

  const save=async()=>{
    setSaving(true);
    try{
      for(const e of entries){
        if(!e.item) continue;
        await zoho("create","Waste_Log",{data:{
          log_date:date,item_name:e.item,
          quantity:parseFloat(e.qty)||0,unit:e.unit,
          reason:e.reason,estimated_cost:parseFloat(e.cost)||0,
          logged_by:me?.firstName||"",
        }});
      }
      showFlash("Waste log saved to Zoho ✓");
      setEntries([{item:"",qty:"",unit:"",reason:REASONS[0],cost:""}]);
    }catch(e){showFlash("Save error — add Waste_Log form to Zoho");}
    setSaving(false);
  };

  const totalWaste=entries.reduce((s,e)=>s+(parseFloat(e.cost)||0),0);

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px",flexWrap:"wrap",gap:"8px"}}>
        <div>
          <div style={{...S.lbl,marginBottom:"4px"}}>Waste Log — {date}</div>
          <div style={{fontSize:"12px",color:"#555"}}>Track all food waste to reduce costs and identify problem areas.</div>
        </div>
        <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
          {totalWaste>0&&<span style={{fontSize:"13px",color:"#c07070",fontWeight:"600"}}>Total waste: ${totalWaste.toFixed(2)}</span>}
          <button onClick={addRow} style={{...S.btn,background:"#1e2820",color:"#7eb87e",border:"1px solid #2e4830"}}>+ Add Row</button>
          <button onClick={save} disabled={saving} style={S.btn}>{saving?"Saving…":"Save to Zoho"}</button>
        </div>
      </div>
      <div style={{...S.card,overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr>
            {["Item Name","Qty","Unit","Reason","Est. Cost",""].map(h=><th key={h} style={S.th}>{h}</th>)}
          </tr></thead>
          <tbody>
            {entries.map((row,i)=>(
              <tr key={i} style={{borderTop:i>0?"1px solid #1a1916":"none"}}>
                <td style={{padding:"4px 8px"}}>
                  <input value={row.item} onChange={e=>updateRow(i,"item",e.target.value)}
                    placeholder="e.g. Chicken Wings" list="waste-items"
                    style={{...S.inp,width:"100%",boxSizing:"border-box",fontSize:"12px"}}/>
                  <datalist id="waste-items">
                    {recipes.map(r=><option key={r.ID} value={r.recipe_name||r.name}/>)}
                  </datalist>
                </td>
                <td style={{padding:"4px 8px"}}>
                  <input type="number" value={row.qty} onChange={e=>updateRow(i,"qty",e.target.value)}
                    placeholder="0" style={{...S.inp,width:"60px",fontSize:"12px"}}/>
                </td>
                <td style={{padding:"4px 8px"}}>
                  <input value={row.unit} onChange={e=>updateRow(i,"unit",e.target.value)}
                    placeholder="lbs/oz/ea" style={{...S.inp,width:"70px",fontSize:"12px"}}/>
                </td>
                <td style={{padding:"4px 8px"}}>
                  <select value={row.reason} onChange={e=>updateRow(i,"reason",e.target.value)}
                    style={{...S.inp,fontSize:"12px"}}>
                    {REASONS.map(r=><option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
                <td style={{padding:"4px 8px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:"2px"}}>
                    <span style={{color:"#555",fontSize:"12px"}}>$</span>
                    <input type="number" value={row.cost} onChange={e=>updateRow(i,"cost",e.target.value)}
                      placeholder="0.00" style={{...S.inp,width:"70px",fontSize:"12px",color:"#c07070"}}/>
                  </div>
                </td>
                <td style={{padding:"4px 8px"}}>
                  {entries.length>1&&(
                    <button onClick={()=>setEntries(p=>p.filter((_,idx)=>idx!==i))}
                      style={{background:"none",border:"none",color:"#8a5555",cursor:"pointer",fontSize:"16px"}}>×</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// SOPs COMPONENT
// ══════════════════════════════════════
function SOPs({S,showFlash}){
  const [sops,setSops]=useState([
    {id:1,title:"Chicken & Waffles — Prep & Plate",category:"Kitchen",content:`1. Season chicken with house blend 30 min before service\n2. Fry at 350°F for 12-14 min until internal temp ≥165°F\n3. Waffle batter: mix until just combined, do not overmix\n4. Cook waffle 3-4 min until golden brown\n5. Plate: waffle on bottom, 2 pieces chicken on top\n6. Drizzle with honey butter, serve with syrup on side\n7. Call time: 12 min max`},
    {id:2,title:"Catfish & Grits — Prep & Plate",category:"Kitchen",content:`1. Season catfish with seasoned salt, garlic, cayenne\n2. Dredge in cornmeal mix\n3. Fry at 365°F for 4-5 min per side until golden\n4. Internal temp must reach ≥145°F\n5. Grits: cook stone-ground grits 20 min, finish with butter and cream\n6. Plate: grits base, catfish on top, garnish with green onions`},
    {id:3,title:"Opening Procedures",category:"Operations",content:`7:00 AM - Arrive, unlock, disarm alarm\n7:15 AM - Turn on all equipment, check temps\n7:30 AM - Stock stations from walk-in\n8:00 AM - Complete opening checklist\n8:30 AM - Staff briefing: specials, 86'd items\n9:00 AM - Open for service`},
    {id:4,title:"Food Safety & Temperature",category:"Safety",content:`Cold foods: ≤41°F at all times\nFrozen: ≤0°F\nHot hold: ≥135°F\nCooked poultry: ≥165°F\nCooked fish: ≥145°F\nSanitizer solution: 50-200 ppm\nCheck and log temps every 2 hours\nDiscard any food in danger zone (41-135°F) >4 hours`},
    {id:5,title:"Catering — Setup & Service",category:"Catering",content:`1. Confirm headcount and menu 48hrs before event\n2. Pack all equipment: chafing dishes, sternos, serving utensils\n3. Arrive 90 min before service time\n4. Set up chafing dishes, heat sternos 20 min before\n5. Food must be at temp before transferring to chafing dishes\n6. Label all dishes clearly\n7. Keep backup food in cambros at temp\n8. Tear down: collect all equipment, leave venue clean`},
  ]);
  const [editing,setEditing]=useState(null);
  const [newSop,setNewSop]=useState({title:"",category:"Kitchen",content:""});
  const [showAdd,setShowAdd]=useState(false);
  const CATS=["Kitchen","Operations","Safety","Catering","Service","Other"];

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px",flexWrap:"wrap",gap:"8px"}}>
        <div style={{...S.lbl}}>Standard Operating Procedures</div>
        <button onClick={()=>setShowAdd(!showAdd)} style={S.btn}>+ Add SOP</button>
      </div>

      {showAdd&&(
        <div style={{...S.card,padding:"16px",marginBottom:"16px"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:"8px",marginBottom:"8px"}}>
            <input value={newSop.title} onChange={e=>setNewSop(p=>({...p,title:e.target.value}))}
              placeholder="SOP Title" style={{...S.inp,fontSize:"13px"}}/>
            <select value={newSop.category} onChange={e=>setNewSop(p=>({...p,category:e.target.value}))}
              style={{...S.inp,fontSize:"13px"}}>
              {CATS.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <textarea value={newSop.content} onChange={e=>setNewSop(p=>({...p,content:e.target.value}))}
            placeholder="Write the SOP steps here..." rows={6}
            style={{...S.inp,width:"100%",boxSizing:"border-box",fontSize:"12px",lineHeight:"1.6",resize:"vertical"}}/>
          <div style={{display:"flex",gap:"8px",marginTop:"8px"}}>
            <button onClick={()=>{
              if(!newSop.title) return;
              setSops(p=>[...p,{id:Date.now(),...newSop}]);
              setNewSop({title:"",category:"Kitchen",content:""});
              setShowAdd(false);
              showFlash("SOP added ✓");
            }} style={S.btn}>Save SOP</button>
            <button onClick={()=>setShowAdd(false)} style={{...S.btnDanger,padding:"8px 16px"}}>Cancel</button>
          </div>
        </div>
      )}

      {CATS.map(cat=>{
        const catSops=sops.filter(s=>s.category===cat);
        if(!catSops.length) return null;
        return(
          <div key={cat} style={{marginBottom:"20px"}}>
            <div style={{...S.lbl,color:"#c8a96e",marginBottom:"10px",paddingBottom:"6px",borderBottom:"1px solid #c8a96e22"}}>{cat}</div>
            {catSops.map(sop=>(
              <div key={sop.id} style={{...S.card,marginBottom:"10px",overflow:"hidden"}}>
                <div style={{padding:"12px 16px",borderBottom:"1px solid #1e1c18",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:"14px",color:"#e8dfc8",fontWeight:"600"}}>{sop.title}</span>
                  <div style={{display:"flex",gap:"6px"}}>
                    <button onClick={()=>setEditing(editing===sop.id?null:sop.id)}
                      style={{background:"none",border:"1px solid #2e2b26",color:"#888",padding:"4px 10px",fontSize:"11px",cursor:"pointer",borderRadius:"2px"}}>
                      {editing===sop.id?"✓ Done":"Edit"}
                    </button>
                    <button onClick={()=>{if(window.confirm("Remove this SOP?")) setSops(p=>p.filter(s=>s.id!==sop.id));}}
                      style={S.btnDanger}>Remove</button>
                  </div>
                </div>
                {editing===sop.id?(
                  <textarea value={sop.content}
                    onChange={e=>setSops(p=>p.map(s=>s.id===sop.id?{...s,content:e.target.value}:s))}
                    rows={8} style={{...S.inp,width:"100%",boxSizing:"border-box",border:"none",borderRadius:"0",
                      fontSize:"12px",lineHeight:"1.8",resize:"vertical",background:"#0e0d0b"}}/>
                ):(
                  <div style={{padding:"14px 16px",fontSize:"12px",color:"#aaa",lineHeight:"1.9",whiteSpace:"pre-line"}}>
                    {sop.content}
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ══════════════════════════════════════
// RECEIPTS COMPONENT
// ══════════════════════════════════════
function Receipts({S,showFlash,zoho}){
  const [receipts,setReceipts]=useState([]);
  const [loading,setLoading]=useState(true);
  const [form,setForm]=useState({vendor:"",amount:"",category:"Food",date:new Date().toISOString().split("T")[0],notes:"",submittedBy:""});
  const CATS=["Food","Supplies","Equipment","Utilities","Marketing","Other"];

  useEffect(()=>{
    (async()=>{
      try{
        const r=await zoho("getAll","Receipts");
        setReceipts(r||[]);
      }catch(e){}
      setLoading(false);
    })();
  },[]);

  const save=async()=>{
    if(!form.vendor||!form.amount){showFlash("Vendor and amount required");return;}
    try{
      const r=await zoho("create","Receipts",{data:{
        vendor_name:form.vendor,
        amount:parseFloat(form.amount)||0,
        category:form.category,
        receipt_date:form.date,
        notes:form.notes,
        submitted_by:form.submittedBy,
      }});
      if(r.data) setReceipts(p=>[{...form,ID:r.data.ID},...p]);
      setForm({vendor:"",amount:"",category:"Food",date:new Date().toISOString().split("T")[0],notes:"",submittedBy:""});
      showFlash("Receipt saved to Zoho ✓");
    }catch(e){showFlash("Save error — add Receipts form to Zoho");}
  };

  const total=receipts.reduce((s,r)=>s+(parseFloat(r.amount)||0),0);

  return(
    <div>
      <div style={{...S.lbl,marginBottom:"16px"}}>Purchase Receipts</div>

      {/* Email instruction */}
      <div style={{background:"#0a0e1a",border:"1px solid #1a2a4a",borderRadius:"3px",padding:"14px 16px",marginBottom:"20px",fontSize:"12px",color:"#6a8ab8",lineHeight:"1.7"}}>
        <div style={{fontWeight:"700",color:"#8ab0d8",marginBottom:"6px"}}>📧 Email Receipt Automation (Coming Soon)</div>
        Staff can forward receipts to <strong style={{color:"#a0c0e8"}}>receipts@phyllisbrunch.com</strong> and they will appear here automatically via Zoho Flow.
        <br/>For now, enter receipts manually below.
      </div>

      {/* Manual entry form */}
      <div style={{...S.card,padding:"16px",marginBottom:"20px"}}>
        <div style={{...S.lbl,marginBottom:"12px",color:"#c8a96e"}}>Add Receipt Manually</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:"8px",marginBottom:"8px"}}>
          <div>
            <div style={{...S.lbl,marginBottom:"3px"}}>Vendor *</div>
            <input value={form.vendor} onChange={e=>setForm(p=>({...p,vendor:e.target.value}))}
              placeholder="Restaurant Depot" style={{...S.inp,width:"100%",boxSizing:"border-box"}}/>
          </div>
          <div>
            <div style={{...S.lbl,marginBottom:"3px"}}>Amount ($) *</div>
            <input type="number" value={form.amount} onChange={e=>setForm(p=>({...p,amount:e.target.value}))}
              placeholder="0.00" style={{...S.inp,width:"100%",boxSizing:"border-box",color:"#c8a96e"}}/>
          </div>
          <div>
            <div style={{...S.lbl,marginBottom:"3px"}}>Category</div>
            <select value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))}
              style={{...S.inp,width:"100%",boxSizing:"border-box"}}>
              {CATS.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <div style={{...S.lbl,marginBottom:"3px"}}>Date</div>
            <input type="date" value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))}
              style={{...S.inp,width:"100%",boxSizing:"border-box"}}/>
          </div>
          <div>
            <div style={{...S.lbl,marginBottom:"3px"}}>Submitted By</div>
            <input value={form.submittedBy} onChange={e=>setForm(p=>({...p,submittedBy:e.target.value}))}
              placeholder="Staff name" style={{...S.inp,width:"100%",boxSizing:"border-box"}}/>
          </div>
          <div>
            <div style={{...S.lbl,marginBottom:"3px"}}>Notes</div>
            <input value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))}
              placeholder="Optional" style={{...S.inp,width:"100%",boxSizing:"border-box"}}/>
          </div>
        </div>
        <button onClick={save} style={S.btn}>Save Receipt</button>
      </div>

      {/* Receipt list */}
      {loading?<div style={{color:"#555",fontSize:"13px"}}>Loading receipts…</div>:(
        <div style={{...S.card,overflow:"hidden"}}>
          <div style={{padding:"12px 14px",borderBottom:"1px solid #1e1c18",display:"flex",justifyContent:"space-between"}}>
            <span style={S.lbl}>All Receipts</span>
            <span style={{fontSize:"12px",color:"#c8a96e",fontWeight:"600"}}>Total: ${total.toFixed(2)}</span>
          </div>
          {receipts.length===0?(
            <div style={{padding:"24px",color:"#444",fontSize:"13px"}}>No receipts yet. Add one above.</div>
          ):(
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead><tr>
                {["Date","Vendor","Amount","Category","Submitted By","Notes"].map(h=><th key={h} style={S.th}>{h}</th>)}
              </tr></thead>
              <tbody>
                {receipts.map((r,i)=>(
                  <tr key={r.ID||i} style={{borderTop:i>0?"1px solid #1a1916":"none"}}>
                    <td style={{...S.td,fontSize:"12px",color:"#888"}}>{r.date||r.receipt_date}</td>
                    <td style={S.td}>{r.vendor||r.vendor_name}</td>
                    <td style={{...S.td,color:"#c8a96e",fontWeight:"600"}}>${parseFloat(r.amount).toFixed(2)}</td>
                    <td style={{...S.td,fontSize:"12px",color:"#777"}}>{r.category}</td>
                    <td style={{...S.td,fontSize:"12px",color:"#777"}}>{r.submittedBy||r.submitted_by}</td>
                    <td style={{...S.td,fontSize:"12px",color:"#555"}}>{r.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════
// EXPORT PANEL COMPONENT (Owner only)
// ══════════════════════════════════════
function ExportPanel({S,date,M,employees,laborCost,netProfit,laborPct,totalCostPct,recipes,costs,zoho}){
  const [exporting,setExporting]=useState(false);
  const [range,setRange]=useState("today");

  const exportToExcel=async()=>{
    setExporting(true);
    try{
      // Build CSV data for each sheet
      const sheets=[];

      // Sheet 1: Daily P&L Summary
      const plRows=[
        ["PHYLLIS BRUNCH — Daily P&L Report"],
        ["Date:",date],
        [""],
        ["Metric","Value"],
        ["Gross Revenue",`$${M.rev.toFixed(2)}`],
        ["Food COGS",`$${M.cogs.toFixed(2)}`],
        ["Food COGS %",`${M.pct}%`],
        ["Labor Cost",`$${laborCost.toFixed(2)}`],
        ["Labor %",`${laborPct}%`],
        ["Total Cost",`$${(M.cogs+laborCost).toFixed(2)}`],
        ["Total Cost %",`${totalCostPct}%`],
        ["Net Profit",`$${netProfit.toFixed(2)}`],
        [""],
        ["Item Breakdown"],
        ["Item","Qty Sold","Revenue","Food COGS","Gross Profit","COGS %"],
        ...M.details.map(r=>[
          r.name,r.qty,
          `$${r.revenue.toFixed(2)}`,
          `$${r.cogs.toFixed(2)}`,
          `$${r.margin.toFixed(2)}`,
          `${r.cogsPct.toFixed(1)}%`
        ]),
      ];

      // Sheet 2: Employees
      const empRows=[
        ["PHYLLIS BRUNCH — Staff Directory"],
        [""],
        ["First Name","Last Name","Designation","Hourly Rate","Weekly Est (40h)","PIN"],
        ...employees.map(e=>[
          e.first_name,e.last_name,e.designation,
          `$${parseFloat(e.hourly_rate||0).toFixed(2)}`,
          `$${(parseFloat(e.hourly_rate||0)*40).toFixed(2)}`,
          e.pin
        ]),
        [""],
        ["Total Weekly Payroll Est:",`$${employees.reduce((s,e)=>s+(parseFloat(e.hourly_rate||0)*40),0).toFixed(2)}`],
      ];

      // Sheet 3: Recipe Costs
      const recRows=[
        ["PHYLLIS BRUNCH — Recipe Cost Sheet"],
        [""],
        ["Recipe","Sell Price","Food Cost","Margin","COGS %"],
        ...recipes.map(r=>{
          const pc=(r.ingredients||[]).reduce((s,ri)=>s+(parseFloat(costs[ri.ingredient_id]||0)*parseFloat(ri.quantity_per_plate||0)),0);
          const price=parseFloat(r.selling_price||0);
          const pct=price>0?(pc/price*100).toFixed(1):0;
          return[r.recipe_name||r.name,`$${price.toFixed(2)}`,`$${pc.toFixed(2)}`,`$${(price-pc).toFixed(2)}`,`${pct}%`];
        }),
      ];

      // Convert to CSV and download as zip of CSVs
      const toCSV=rows=>rows.map(r=>r.map(c=>`"${(c||"").toString().replace(/"/g,'""')}"`).join(",")).join("\n");

      // Create a workbook-style HTML that Excel can open
      const wb=`
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><style>
  td{font-family:Arial,sans-serif;font-size:11pt;border:1px solid #ddd;padding:4px 8px;}
  th{background:#1a1814;color:#c8a96e;font-weight:bold;padding:6px 8px;border:1px solid #555;}
  h2{background:#0f0e0b;color:#c8a96e;padding:8px;margin:16px 0 4px;}
</style></head><body>
<h2>Phyllis Brunch — Export Report — ${date}</h2>

<h3 style="color:#7eb87e">Daily P&L</h3>
<table><tr><th>Metric</th><th>Value</th></tr>
${[["Gross Revenue",`$${M.rev.toFixed(2)}`],["Food COGS",`$${M.cogs.toFixed(2)}`],["Food COGS %",`${M.pct}%`],["Labor Cost",`$${laborCost.toFixed(2)}`],["Labor %",`${laborPct}%`],["Net Profit",`$${netProfit.toFixed(2)}`]]
  .map(([k,v])=>`<tr><td>${k}</td><td>${v}</td></tr>`).join("")}
</table>

<br/><h3 style="color:#7eb87e">Sales Breakdown</h3>
<table><tr><th>Item</th><th>Qty</th><th>Revenue</th><th>Food COGS</th><th>Profit</th><th>COGS%</th></tr>
${M.details.map(r=>`<tr><td>${r.name}</td><td>${r.qty}</td><td>$${r.revenue.toFixed(2)}</td><td>$${r.cogs.toFixed(2)}</td><td>$${r.margin.toFixed(2)}</td><td>${r.cogsPct.toFixed(1)}%</td></tr>`).join("")}
</table>

<br/><h3 style="color:#7eb87e">Recipe Cost Sheet</h3>
<table><tr><th>Recipe</th><th>Sell Price</th><th>Food Cost</th><th>Margin</th><th>COGS%</th></tr>
${recipes.map(r=>{
  const pc=(r.ingredients||[]).reduce((s,ri)=>s+(parseFloat(costs[ri.ingredient_id]||0)*parseFloat(ri.quantity_per_plate||0)),0);
  const price=parseFloat(r.selling_price||0);
  const pct=price>0?(pc/price*100).toFixed(1):0;
  return`<tr><td>${r.recipe_name||r.name}</td><td>$${price.toFixed(2)}</td><td>$${pc.toFixed(2)}</td><td>$${(price-pc).toFixed(2)}</td><td>${pct}%</td></tr>`;
}).join("")}
</table>

<br/><h3 style="color:#7eb87e">Staff Directory</h3>
<table><tr><th>Name</th><th>Designation</th><th>Rate/hr</th><th>Weekly Est</th></tr>
${employees.map(e=>`<tr><td>${e.first_name} ${e.last_name}</td><td>${e.designation}</td><td>$${parseFloat(e.hourly_rate||0).toFixed(2)}</td><td>$${(parseFloat(e.hourly_rate||0)*40).toFixed(2)}</td></tr>`).join("")}
</table>

</body></html>`;

      const blob=new Blob([wb],{type:"application/vnd.ms-excel"});
      const url=URL.createObjectURL(blob);
      const a=document.createElement("a");
      a.href=url;
      a.download=`Phyllis_Report_${date}.xls`;
      a.click();
      URL.revokeObjectURL(url);

    }catch(e){console.error(e);}
    setExporting(false);
  };

  return(
    <div>
      <div style={{...S.lbl,marginBottom:"20px"}}>Export Reports — Owner Only</div>

      <div style={{...S.card,padding:"24px",marginBottom:"20px",textAlign:"center"}}>
        <div style={{fontSize:"40px",marginBottom:"12px"}}>📊</div>
        <div style={{fontSize:"16px",color:"#e8dfc8",marginBottom:"6px"}}>Export to Excel</div>
        <div style={{fontSize:"12px",color:"#555",marginBottom:"20px",lineHeight:"1.6"}}>
          Downloads a complete Excel report for <strong style={{color:"#c8a96e"}}>{date}</strong> including:<br/>
          Daily P&L · Sales Breakdown · Recipe Cost Sheet · Staff Directory
        </div>
        <button onClick={exportToExcel} disabled={exporting}
          style={{...S.btn,fontSize:"14px",padding:"12px 32px"}}>
          {exporting?"Generating…":"⬇ Download Excel Report"}
        </button>
      </div>

      {/* Summary preview */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:"12px"}}>
        {[
          {l:"Revenue",v:`$${M.rev.toFixed(2)}`,c:"#7eb87e"},
          {l:"Net Profit",v:`$${netProfit.toFixed(2)}`,c:netProfit>=0?"#7eb87e":"#c07070"},
          {l:"Food COGS",v:`$${M.cogs.toFixed(2)} (${M.pct}%)`,c:"#c07070"},
          {l:"Labor",v:`$${laborCost.toFixed(2)} (${laborPct}%)`,c:"#d4a060"},
          {l:"Items Sold",v:`${M.details.reduce((s,r)=>s+r.qty,0)} plates`,c:"#c8a96e"},
          {l:"Staff on Payroll",v:`${employees.length} people`,c:"#888"},
        ].map(c=>(
          <div key={c.l} style={{...S.card,padding:"14px"}}>
            <div style={{...S.lbl,marginBottom:"4px"}}>{c.l}</div>
            <div style={{fontSize:"18px",color:c.c,fontWeight:"600"}}>{c.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// ROLE TEMPLATES COMPONENT
// ══════════════════════════════════════
function RoleTemplates({ S, showFlash, employees, setEmps }) {
  const [roles, setRoles]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState("");
  const [editRole, setEditRole] = useState(null);
  const [roleForm, setRoleForm] = useState({ role_name: "", allowed_modules: [] });
  const [editEmpModules, setEditEmpModules] = useState(null); // empId being edited
  const [empModules, setEmpModules]         = useState({});   // {empId: [modules]}
  const [empTemplate, setEmpTemplate]       = useState({});   // {empId: roleName}

  const ALL_MODS = [
    "Dashboard","PAR Entry","Ingredient Costs","Recipes","Sales Entry",
    "Staff Hours","Analytics","COGS Report","Employees","Role Templates",
    "My Schedule","Clock In/Out","My Timesheet","Time Off",
    "Scheduling","Time Off Requests",
    "Temp Log","Checklists","Waste Log","SOPs","Receipts","Export"
  ];

  const rolesApi = async (action, data, recordId) => {
    const res = await fetch("/api/roles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, data, recordId }),
    });
    return res.json();
  };

  useEffect(() => {
    (async () => {
      const r = await rolesApi("getRoles");
      setRoles(r || []);
      setLoading(false);
    })();
  }, []);

  const saveRole = async () => {
    if (!roleForm.role_name) { showFlash("Role name required"); return; }
    setSaving("Saving…");
    const data = {
      role_name: roleForm.role_name,
      allowed_modules: roleForm.allowed_modules.join(","),
    };
    if (editRole) {
      await rolesApi("updateRole", data, editRole.ID || editRole.id);
      setRoles(prev => prev.map(r => (r.ID || r.id) === (editRole.ID || editRole.id) ? { ...r, ...data } : r));
    } else {
      const res = await rolesApi("createRole", data);
      if (res.data) setRoles(prev => [...prev, { ...data, ID: res.data.ID }]);
    }
    setRoleForm({ role_name: "", allowed_modules: [] });
    setEditRole(null);
    setSaving("");
    showFlash("Role saved ✓");
  };

  const deleteRole = async (role) => {
    if (!window.confirm(`Delete role "${role.role_name}"?`)) return;
    await rolesApi("deleteRole", {}, role.ID || role.id);
    setRoles(prev => prev.filter(r => (r.ID || r.id) !== (role.ID || role.id)));
    showFlash("Role deleted ✓");
  };

  const applyTemplate = (empId, roleName) => {
    const role = roles.find(r => r.role_name === roleName);
    if (!role) return;
    const mods = (role.allowed_modules || "").split(",").map(m => m.trim()).filter(Boolean);
    setEmpModules(p => ({ ...p, [empId]: mods }));
    setEmpTemplate(p => ({ ...p, [empId]: roleName }));
  };

  const saveEmpModules = async (emp) => {
    const empId = emp.ID || emp.id;
    setSaving("Saving…");
    const mods = empModules[empId] || [];
    await rolesApi("updateEmployeeModules", {
      allowed_modules: mods.join(","),
      role_template: empTemplate[empId] || "",
    }, empId);
    setEmps(prev => prev.map(e => (e.ID || e.id) === empId
      ? { ...e, Allowed_Modules: mods.join(","), Role_Template: empTemplate[empId] || "" }
      : e
    ));
    setEditEmpModules(null);
    setSaving("");
    showFlash(`Permissions saved for ${emp.first_name || emp.First_Name} ✓`);
  };

  const toggleMod = (empId, mod) => {
    setEmpModules(p => {
      const cur = p[empId] || [];
      return { ...p, [empId]: cur.includes(mod) ? cur.filter(m => m !== mod) : [...cur, mod] };
    });
  };

  if (loading) return <div style={{ color: "#555", padding: "32px" }}>Loading roles…</div>;

  return (
    <div>
      {/* ── Role Template Builder ── */}
      <div style={{ ...S.card, padding: "20px", marginBottom: "24px" }}>
        <div style={{ ...S.lbl, ...S.amber, marginBottom: "14px" }}>
          {editRole ? `Edit Role: ${editRole.role_name}` : "Create New Role Template"}
        </div>
        <div style={{ marginBottom: "12px" }}>
          <div style={{ ...S.lbl, marginBottom: "4px" }}>Role Name</div>
          <input value={roleForm.role_name} onChange={e => setRoleForm(p => ({ ...p, role_name: e.target.value }))}
            placeholder="e.g. Line Cook, Server, Kitchen Manager"
            style={{ ...S.inp, width: "100%", maxWidth: "360px", boxSizing: "border-box" }} />
        </div>
        <div style={{ ...S.lbl, marginBottom: "8px" }}>Modules this role can access</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "14px" }}>
          {ALL_MODS.map(mod => {
            const checked = roleForm.allowed_modules.includes(mod);
            return (
              <label key={mod} style={{ display: "flex", alignItems: "center", gap: "5px", cursor: "pointer",
                background: checked ? "#1e2820" : "#0c0b09", border: `1px solid ${checked ? "#2e4830" : "#2e2b26"}`,
                borderRadius: "3px", padding: "5px 10px", fontSize: "11px", color: checked ? "#7eb87e" : "#555" }}>
                <input type="checkbox" checked={checked} onChange={() => {
                  setRoleForm(p => ({
                    ...p,
                    allowed_modules: checked
                      ? p.allowed_modules.filter(m => m !== mod)
                      : [...p.allowed_modules, mod]
                  }));
                }} style={{ margin: 0 }} />
                {mod}
              </label>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={saveRole} style={S.btn} disabled={!!saving}>
            {saving ? saving : editRole ? "Update Role" : "Save Role Template"}
          </button>
          {editRole && (
            <button onClick={() => { setEditRole(null); setRoleForm({ role_name: "", allowed_modules: [] }); }}
              style={{ ...S.btnDanger, padding: "8px 16px" }}>Cancel</button>
          )}
        </div>
      </div>

      {/* ── Existing Role Templates ── */}
      {roles.length > 0 && (
        <div style={{ marginBottom: "28px" }}>
          <div style={{ ...S.lbl, marginBottom: "12px" }}>Existing Role Templates</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
            {roles.map(role => {
              const mods = (role.allowed_modules || "").split(",").filter(Boolean);
              return (
                <div key={role.ID || role.id} style={{ ...S.card, padding: "14px 16px", minWidth: "220px", flex: "1" }}>
                  <div style={{ fontWeight: "700", color: "#e8dfc8", marginBottom: "8px" }}>{role.role_name}</div>
                  <div style={{ fontSize: "11px", color: "#555", marginBottom: "10px" }}>
                    {mods.length} modules · {mods.slice(0, 3).join(", ")}{mods.length > 3 ? "…" : ""}
                  </div>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button onClick={() => {
                      setEditRole(role);
                      setRoleForm({ role_name: role.role_name, allowed_modules: mods });
                    }} style={S.btnSm}>Edit</button>
                    <button onClick={() => deleteRole(role)} style={S.btnDanger}>Delete</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Employee Permission Editor ── */}
      <div style={{ ...S.lbl, marginBottom: "12px" }}>Employee Module Permissions</div>
      <div style={{ ...S.card, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr>
            {["Employee", "Designation", "Role Template", "Modules", "Actions"].map(h =>
              <th key={h} style={S.th}>{h}</th>
            )}
          </tr></thead>
          <tbody>
            {employees.map((emp, idx) => {
              const empId = emp.ID || emp.id;
              const currentMods = (emp.Allowed_Modules || emp.allowed_modules || "").split(",").filter(Boolean);
              const currentTemplate = emp.Role_Template || emp.role_template || "—";
              const isEditing = editEmpModules === empId;
              const editMods = empModules[empId] || currentMods;
              return (
                <tr key={empId} style={{ borderTop: idx > 0 ? "1px solid #1a1916" : "none" }}>
                  <td style={S.td}>
                    <div style={{ fontWeight: "600", color: "#e8dfc8" }}>
                      {emp.first_name || emp.First_Name} {emp.last_name || emp.Last_Name}
                    </div>
                    <div style={{ fontSize: "11px", color: "#555" }}>{emp.email || emp.Email || "No email set"}</div>
                  </td>
                  <td style={{ ...S.td, color: "#888", fontSize: "12px" }}>{emp.designation || emp.Designation}</td>
                  <td style={{ ...S.td, fontSize: "12px", color: "#c8a96e" }}>{currentTemplate}</td>
                  <td style={{ ...S.td, fontSize: "11px", color: "#666" }}>
                    {currentMods.length > 0 ? `${currentMods.length} modules` : "Default"}
                  </td>
                  <td style={{ padding: "4px 12px" }}>
                    <button onClick={() => {
                      if (isEditing) { setEditEmpModules(null); return; }
                      setEditEmpModules(empId);
                      setEmpModules(p => ({ ...p, [empId]: currentMods }));
                      setEmpTemplate(p => ({ ...p, [empId]: currentTemplate === "—" ? "" : currentTemplate }));
                    }} style={S.btnSm}>{isEditing ? "Close" : "Edit Access"}</button>
                  </td>
                </tr>
              );
            })}
            {employees.length === 0 && (
              <tr><td colSpan={5} style={{ ...S.td, color: "#444", textAlign: "center", padding: "24px" }}>
                No employees found. Add employees first.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Inline module editor ── */}
      {editEmpModules && (() => {
        const emp = employees.find(e => (e.ID || e.id) === editEmpModules);
        if (!emp) return null;
        const empId = emp.ID || emp.id;
        const editMods = empModules[empId] || [];
        return (
          <div style={{ ...S.card, padding: "20px", marginTop: "16px" }}>
            <div style={{ ...S.lbl, ...S.amber, marginBottom: "12px" }}>
              Editing: {emp.first_name || emp.First_Name} {emp.last_name || emp.Last_Name}
            </div>
            {roles.length > 0 && (
              <div style={{ marginBottom: "14px" }}>
                <div style={{ ...S.lbl, marginBottom: "6px" }}>Apply Role Template</div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {roles.map(role => (
                    <button key={role.ID || role.id}
                      onClick={() => applyTemplate(empId, role.role_name)}
                      style={{ ...S.btnSm, background: empTemplate[empId] === role.role_name ? "#2e4830" : "#1e2820" }}>
                      {role.role_name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div style={{ ...S.lbl, marginBottom: "8px" }}>Individual Module Access</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "14px" }}>
              {ALL_MODS.map(mod => {
                const checked = editMods.includes(mod);
                return (
                  <label key={mod} style={{ display: "flex", alignItems: "center", gap: "5px", cursor: "pointer",
                    background: checked ? "#1e2820" : "#0c0b09", border: `1px solid ${checked ? "#2e4830" : "#2e2b26"}`,
                    borderRadius: "3px", padding: "5px 10px", fontSize: "11px", color: checked ? "#7eb87e" : "#555" }}>
                    <input type="checkbox" checked={checked} onChange={() => toggleMod(empId, mod)} style={{ margin: 0 }} />
                    {mod}
                  </label>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => saveEmpModules(emp)} style={S.btn} disabled={!!saving}>
                {saving ? saving : "Save Permissions"}
              </button>
              <button onClick={() => setEditEmpModules(null)} style={{ ...S.btnDanger, padding: "8px 16px" }}>Cancel</button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ══════════════════════════════════════
// MY SCHEDULE COMPONENT
// ══════════════════════════════════════
function MySchedule({ S, me, shifts }) {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);

  const getWeekDates = (offset = 0) => {
    const now = new Date();
    const day = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - day + 1 + offset * 7);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return {
      start: monday.toISOString().split("T")[0],
      end: sunday.toISOString().split("T")[0],
      label: `${monday.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${sunday.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
    };
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { start, end } = getWeekDates(weekOffset);
      const data = await shifts("getMySchedule", {
        employeeId: me?.shiftsEmployeeId,
        startDate: start,
        endDate: end,
      });
      setSchedule(Array.isArray(data) ? data : []);
      setLoading(false);
    })();
  }, [weekOffset, me?.shiftsEmployeeId]);

  const week = getWeekDates(weekOffset);
  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const formatTime = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
        <div style={{ ...S.lbl }}>My Schedule</div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button onClick={() => setWeekOffset(p => p - 1)} style={{ ...S.btnSm, padding: "4px 10px" }}>◀</button>
          <span style={{ fontSize: "13px", color: "#c8a96e", minWidth: "200px", textAlign: "center" }}>{week.label}</span>
          <button onClick={() => setWeekOffset(p => p + 1)} style={{ ...S.btnSm, padding: "4px 10px" }}>▶</button>
          {weekOffset !== 0 && (
            <button onClick={() => setWeekOffset(0)} style={{ ...S.btnSm, fontSize: "10px" }}>This Week</button>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ color: "#555", padding: "32px", textAlign: "center" }}>Loading schedule from Zoho Shifts…</div>
      ) : schedule.length === 0 ? (
        <div style={{ ...S.card, padding: "40px", textAlign: "center", color: "#444" }}>
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>📅</div>
          <div style={{ fontSize: "14px", color: "#666" }}>No shifts scheduled for this week</div>
          <div style={{ fontSize: "12px", color: "#444", marginTop: "6px" }}>Check with your manager if you expected to be scheduled</div>
        </div>
      ) : (
        <div style={{ ...S.card, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr>
              {["Date", "Day", "Start", "End", "Hours", "Position", "Location"].map(h =>
                <th key={h} style={S.th}>{h}</th>
              )}
            </tr></thead>
            <tbody>
              {schedule.map((shift, idx) => {
                const start = new Date(shift.start_time || shift.start_datetime || "");
                const end   = new Date(shift.end_time   || shift.end_datetime   || "");
                const hrs   = (end - start) / 3600000;
                return (
                  <tr key={shift.id || idx} style={{ borderTop: idx > 0 ? "1px solid #1a1916" : "none" }}>
                    <td style={S.td}>{start.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</td>
                    <td style={{ ...S.td, color: "#888" }}>{DAYS[start.getDay() === 0 ? 6 : start.getDay() - 1]}</td>
                    <td style={{ ...S.td, color: "#7eb87e" }}>{formatTime(shift.start_time || shift.start_datetime)}</td>
                    <td style={{ ...S.td, color: "#c07070" }}>{formatTime(shift.end_time || shift.end_datetime)}</td>
                    <td style={{ ...S.td, color: "#c8a96e" }}>{isNaN(hrs) ? "—" : `${hrs.toFixed(1)}h`}</td>
                    <td style={{ ...S.td, fontSize: "12px", color: "#888" }}>{shift.position_name || shift.position || "—"}</td>
                    <td style={{ ...S.td, fontSize: "12px", color: "#555" }}>{shift.location_name || shift.location || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════
// CLOCK IN/OUT COMPONENT
// ══════════════════════════════════════
function ClockInOut({ S, me, shifts, showFlash }) {
  const [status, setStatus]     = useState(null); // "in" | "out" | null
  const [activeEntry, setActive] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [working, setWorking]   = useState(false);
  const [elapsed, setElapsed]   = useState(0);

  useEffect(() => {
    (async () => {
      const today = new Date().toISOString().split("T")[0];
      const entries = await shifts("getTimesheets", {
        employeeId: me?.shiftsEmployeeId,
        startDate: today,
        endDate: today,
      });
      const open = (entries || []).find(e => e.start_time && !e.end_time);
      if (open) { setStatus("in"); setActive(open); }
      else setStatus("out");
      setLoading(false);
    })();
  }, [me?.shiftsEmployeeId]);

  useEffect(() => {
    if (status !== "in" || !activeEntry) return;
    const start = new Date(activeEntry.start_time).getTime();
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(timer);
  }, [status, activeEntry]);

  const formatElapsed = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const doClock = async () => {
    if (!me?.shiftsEmployeeId) {
      showFlash("Your Shifts employee ID is not set. Contact admin.");
      return;
    }
    setWorking(true);
    try {
      if (status === "out") {
        const res = await shifts("clockIn", { employeeId: me.shiftsEmployeeId });
        if (res.time_entry || res.id || res.ID) {
          setActive(res.time_entry || res);
          setStatus("in");
          setElapsed(0);
          showFlash("Clocked in ✓");
        } else {
          showFlash("Clock in failed — " + (res.message || "try again"));
        }
      } else {
        const entryId = activeEntry?.id || activeEntry?.ID;
        const res = await shifts("clockOut", { timesheetId: entryId });
        if (res.time_entry || res.id || res.ID) {
          setStatus("out");
          setActive(null);
          showFlash("Clocked out ✓");
        } else {
          showFlash("Clock out failed — " + (res.message || "try again"));
        }
      }
    } catch (e) {
      showFlash("Error: " + e.message);
    }
    setWorking(false);
  };

  if (loading) return <div style={{ color: "#555", padding: "32px", textAlign: "center" }}>Checking clock status…</div>;

  const isIn = status === "in";
  const clockedInAt = activeEntry?.start_time ? new Date(activeEntry.start_time).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }) : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "40px" }}>
      <div style={{ ...S.card, padding: "40px 48px", textAlign: "center", maxWidth: "400px", width: "100%" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>{isIn ? "🟢" : "⚪"}</div>
        <div style={{ fontSize: "18px", color: "#e8dfc8", fontWeight: "700", marginBottom: "6px" }}>
          {me?.firstName} {me?.lastName}
        </div>
        <div style={{ fontSize: "12px", color: "#555", marginBottom: "24px" }}>{me?.designation}</div>

        {isIn && (
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "36px", fontFamily: "monospace", color: "#c8a96e", letterSpacing: "2px" }}>
              {formatElapsed(elapsed)}
            </div>
            <div style={{ fontSize: "11px", color: "#555", marginTop: "6px" }}>
              Clocked in at {clockedInAt}
            </div>
          </div>
        )}

        {!isIn && (
          <div style={{ fontSize: "13px", color: "#555", marginBottom: "24px" }}>
            You are currently clocked out
          </div>
        )}

        <button onClick={doClock} disabled={working} style={{
          ...S.btn,
          width: "100%",
          padding: "16px",
          fontSize: "16px",
          background: isIn ? "#3a1e1e" : "#c8a96e",
          color: isIn ? "#c07070" : "#0c0b09",
          border: isIn ? "1px solid #5a2e2e" : "none",
        }}>
          {working ? "…" : isIn ? "⏹ Clock Out" : "▶ Clock In"}
        </button>

        {!me?.shiftsEmployeeId && (
          <div style={{ marginTop: "16px", fontSize: "11px", color: "#8a5555", background: "#1a0a0a", border: "1px solid #3a1e1e", borderRadius: "3px", padding: "10px" }}>
            ⚠ Your Shifts Employee ID is not configured. Ask your admin to set it in the Employees tab.
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// MY TIMESHEET COMPONENT
// ══════════════════════════════════════
function MyTimesheet({ S, me, shifts }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange]     = useState("week");

  useEffect(() => {
    (async () => {
      setLoading(true);
      const now = new Date();
      let startDate, endDate = now.toISOString().split("T")[0];
      if (range === "week") {
        const d = new Date(now); d.setDate(d.getDate() - 7);
        startDate = d.toISOString().split("T")[0];
      } else if (range === "month") {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
      } else {
        const d = new Date(now); d.setDate(d.getDate() - 14);
        startDate = d.toISOString().split("T")[0];
      }
      const data = await shifts("getTimesheets", {
        employeeId: me?.shiftsEmployeeId,
        startDate, endDate,
      });
      setEntries(Array.isArray(data) ? data : []);
      setLoading(false);
    })();
  }, [range, me?.shiftsEmployeeId]);

  const totalHours = entries.reduce((sum, e) => {
    if (!e.start_time || !e.end_time) return sum;
    return sum + (new Date(e.end_time) - new Date(e.start_time)) / 3600000;
  }, 0);

  const fmt = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  };
  const fmtDate = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
        <div style={{ ...S.lbl }}>My Timesheet</div>
        <div style={{ display: "flex", gap: "6px" }}>
          {["week", "2weeks", "month"].map(r => (
            <button key={r} onClick={() => setRange(r)} style={{
              ...S.btnSm, background: range === r ? "#2e4830" : "#1e2820",
              color: range === r ? "#a0d4a0" : "#7eb87e",
            }}>
              {r === "week" ? "7 Days" : r === "2weeks" ? "14 Days" : "This Month"}
            </button>
          ))}
        </div>
        <div style={{ marginLeft: "auto", fontSize: "13px", color: "#c8a96e", fontWeight: "700" }}>
          Total: {totalHours.toFixed(1)}h
        </div>
      </div>

      {loading ? (
        <div style={{ color: "#555", padding: "32px", textAlign: "center" }}>Loading timesheet…</div>
      ) : entries.length === 0 ? (
        <div style={{ ...S.card, padding: "40px", textAlign: "center", color: "#444" }}>No timesheet entries found for this period</div>
      ) : (
        <div style={{ ...S.card, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr>
              {["Date", "Clock In", "Clock Out", "Hours", "Status"].map(h =>
                <th key={h} style={S.th}>{h}</th>
              )}
            </tr></thead>
            <tbody>
              {entries.map((e, idx) => {
                const hrs = e.start_time && e.end_time
                  ? ((new Date(e.end_time) - new Date(e.start_time)) / 3600000).toFixed(1)
                  : null;
                const open = e.start_time && !e.end_time;
                return (
                  <tr key={e.id || idx} style={{ borderTop: idx > 0 ? "1px solid #1a1916" : "none" }}>
                    <td style={S.td}>{fmtDate(e.start_time)}</td>
                    <td style={{ ...S.td, color: "#7eb87e" }}>{fmt(e.start_time)}</td>
                    <td style={{ ...S.td, color: open ? "#c8a96e" : "#c07070" }}>{open ? "Active" : fmt(e.end_time)}</td>
                    <td style={{ ...S.td, color: "#c8a96e", fontWeight: "600" }}>{hrs ? `${hrs}h` : "—"}</td>
                    <td style={{ ...S.td, fontSize: "11px" }}>
                      <span style={{ background: open ? "#1e2a0a" : "#0a0a0a", border: `1px solid ${open ? "#4a7a1a" : "#2e2b26"}`,
                        color: open ? "#8aca4a" : "#555", padding: "2px 8px", borderRadius: "10px" }}>
                        {open ? "Clocked In" : "Complete"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════
// TIME OFF COMPONENT
// ══════════════════════════════════════
function TimeOff({ S, me, shifts, showFlash }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [form, setForm]         = useState({ start_date: "", end_date: "", reason: "", type: "Vacation" });
  const [submitting, setSubmitting] = useState(false);

  const TIME_OFF_TYPES = ["Vacation", "Sick Leave", "Personal", "Unpaid Leave", "Other"];

  useEffect(() => {
    (async () => {
      const data = await shifts("getTimeOff", { employeeId: me?.shiftsEmployeeId });
      setRequests(Array.isArray(data) ? data : []);
      setLoading(false);
    })();
  }, [me?.shiftsEmployeeId]);

  const submitRequest = async () => {
    if (!form.start_date || !form.end_date) { showFlash("Start and end date required"); return; }
    setSubmitting(true);
    const res = await shifts("requestTimeOff", {
      data: {
        employee_id: me?.shiftsEmployeeId,
        start_date: form.start_date,
        end_date: form.end_date,
        reason: form.reason,
        type: form.type,
      }
    });
    if (res.time_off_request || res.id || res.ID) {
      setRequests(p => [res.time_off_request || res, ...p]);
      setForm({ start_date: "", end_date: "", reason: "", type: "Vacation" });
      showFlash("Time off request submitted ✓");
    } else {
      showFlash("Request failed — " + (res.message || "try again"));
    }
    setSubmitting(false);
  };

  const statusColor = (s) => s === "approved" ? "#7eb87e" : s === "denied" ? "#c07070" : "#c8a96e";

  return (
    <div>
      <div style={{ ...S.card, padding: "20px", marginBottom: "24px" }}>
        <div style={{ ...S.lbl, ...S.amber, marginBottom: "14px" }}>Request Time Off</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: "10px", marginBottom: "12px" }}>
          <div>
            <div style={{ ...S.lbl, marginBottom: "4px" }}>Start Date</div>
            <input type="date" value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))}
              style={{ ...S.inp, width: "100%", boxSizing: "border-box" }} />
          </div>
          <div>
            <div style={{ ...S.lbl, marginBottom: "4px" }}>End Date</div>
            <input type="date" value={form.end_date} onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))}
              style={{ ...S.inp, width: "100%", boxSizing: "border-box" }} />
          </div>
          <div>
            <div style={{ ...S.lbl, marginBottom: "4px" }}>Type</div>
            <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
              style={{ ...S.inp, width: "100%", boxSizing: "border-box" }}>
              {TIME_OFF_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <div style={{ ...S.lbl, marginBottom: "4px" }}>Reason (optional)</div>
            <input value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))}
              placeholder="Brief note…"
              style={{ ...S.inp, width: "100%", boxSizing: "border-box" }} />
          </div>
        </div>
        <button onClick={submitRequest} style={S.btn} disabled={submitting}>
          {submitting ? "Submitting…" : "Submit Request"}
        </button>
      </div>

      <div style={{ ...S.lbl, marginBottom: "12px" }}>My Requests</div>
      {loading ? (
        <div style={{ color: "#555", padding: "24px" }}>Loading…</div>
      ) : requests.length === 0 ? (
        <div style={{ ...S.card, padding: "32px", textAlign: "center", color: "#444" }}>No time off requests yet</div>
      ) : (
        <div style={{ ...S.card, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr>
              {["Start", "End", "Type", "Reason", "Status"].map(h => <th key={h} style={S.th}>{h}</th>)}
            </tr></thead>
            <tbody>
              {requests.map((r, idx) => (
                <tr key={r.id || idx} style={{ borderTop: idx > 0 ? "1px solid #1a1916" : "none" }}>
                  <td style={S.td}>{r.start_date}</td>
                  <td style={S.td}>{r.end_date}</td>
                  <td style={{ ...S.td, fontSize: "12px", color: "#888" }}>{r.type || r.leave_type || "—"}</td>
                  <td style={{ ...S.td, fontSize: "12px", color: "#666" }}>{r.reason || "—"}</td>
                  <td style={{ ...S.td }}>
                    <span style={{ fontSize: "11px", fontWeight: "600", color: statusColor(r.status), textTransform: "capitalize" }}>
                      {r.status || "Pending"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════
// SCHEDULING COMPONENT (Admin)
// ══════════════════════════════════════
function Scheduling({ S, employees, shifts, showFlash }) {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ employee_id: "", start_time: "", end_time: "", notes: "" });
  const [saving, setSaving] = useState(false);

  const getWeekDates = (offset = 0) => {
    const now = new Date();
    const day = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - day + 1 + offset * 7);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return {
      start: monday.toISOString().split("T")[0],
      end: sunday.toISOString().split("T")[0],
      label: `${monday.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${sunday.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
    };
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { start, end } = getWeekDates(weekOffset);
      const data = await shifts("getAllShifts", { startDate: start, endDate: end });
      setSchedule(Array.isArray(data) ? data : []);
      setLoading(false);
    })();
  }, [weekOffset]);

  const week = getWeekDates(weekOffset);

  const createShift = async () => {
    if (!form.employee_id || !form.start_time || !form.end_time) {
      showFlash("Employee, start and end time required");
      return;
    }
    setSaving(true);
    const res = await shifts("createShift", {
      data: {
        employee_ids: [form.employee_id],
        start_time: new Date(form.start_time).toISOString(),
        end_time: new Date(form.end_time).toISOString(),
        notes: form.notes,
      }
    });
    if (res.shift || res.id || res.ID) {
      showFlash("Shift created ✓");
      setShowForm(false);
      setForm({ employee_id: "", start_time: "", end_time: "", notes: "" });
      // Reload
      const { start, end } = getWeekDates(weekOffset);
      const data = await shifts("getAllShifts", { startDate: start, endDate: end });
      setSchedule(Array.isArray(data) ? data : []);
    } else {
      showFlash("Failed to create shift — " + (res.message || "check Shifts settings"));
    }
    setSaving(false);
  };

  const deleteShift = async (shiftId) => {
    if (!window.confirm("Delete this shift?")) return;
    await shifts("deleteShift", { shiftId });
    setSchedule(p => p.filter(s => (s.id || s.ID) !== shiftId));
    showFlash("Shift deleted ✓");
  };

  const fmt = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true });
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
        <div style={{ ...S.lbl }}>Schedule Management</div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button onClick={() => setWeekOffset(p => p - 1)} style={{ ...S.btnSm, padding: "4px 10px" }}>◀</button>
          <span style={{ fontSize: "13px", color: "#c8a96e", minWidth: "200px", textAlign: "center" }}>{week.label}</span>
          <button onClick={() => setWeekOffset(p => p + 1)} style={{ ...S.btnSm, padding: "4px 10px" }}>▶</button>
        </div>
        <button onClick={() => setShowForm(p => !p)} style={S.btn}>
          {showForm ? "Cancel" : "+ Add Shift"}
        </button>
      </div>

      {showForm && (
        <div style={{ ...S.card, padding: "20px", marginBottom: "20px" }}>
          <div style={{ ...S.lbl, ...S.amber, marginBottom: "14px" }}>New Shift</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "10px", marginBottom: "12px" }}>
            <div>
              <div style={{ ...S.lbl, marginBottom: "4px" }}>Employee</div>
              <select value={form.employee_id} onChange={e => setForm(p => ({ ...p, employee_id: e.target.value }))}
                style={{ ...S.inp, width: "100%", boxSizing: "border-box" }}>
                <option value="">— Select employee —</option>
                {employees.filter(e => e.shifts_employee_id || e.Shifts_Employee_ID).map(e => (
                  <option key={e.ID || e.id} value={e.shifts_employee_id || e.Shifts_Employee_ID}>
                    {e.first_name || e.First_Name} {e.last_name || e.Last_Name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div style={{ ...S.lbl, marginBottom: "4px" }}>Start Date & Time</div>
              <input type="datetime-local" value={form.start_time} onChange={e => setForm(p => ({ ...p, start_time: e.target.value }))}
                style={{ ...S.inp, width: "100%", boxSizing: "border-box" }} />
            </div>
            <div>
              <div style={{ ...S.lbl, marginBottom: "4px" }}>End Date & Time</div>
              <input type="datetime-local" value={form.end_time} onChange={e => setForm(p => ({ ...p, end_time: e.target.value }))}
                style={{ ...S.inp, width: "100%", boxSizing: "border-box" }} />
            </div>
            <div>
              <div style={{ ...S.lbl, marginBottom: "4px" }}>Notes</div>
              <input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                placeholder="Optional notes…"
                style={{ ...S.inp, width: "100%", boxSizing: "border-box" }} />
            </div>
          </div>
          <button onClick={createShift} style={S.btn} disabled={saving}>
            {saving ? "Creating…" : "Create Shift"}
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ color: "#555", padding: "32px", textAlign: "center" }}>Loading schedule from Zoho Shifts…</div>
      ) : schedule.length === 0 ? (
        <div style={{ ...S.card, padding: "40px", textAlign: "center", color: "#444" }}>
          No shifts scheduled for this week. Click "+ Add Shift" to create one.
        </div>
      ) : (
        <div style={{ ...S.card, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr>
              {["Employee", "Start", "End", "Hours", "Notes", "Actions"].map(h =>
                <th key={h} style={S.th}>{h}</th>
              )}
            </tr></thead>
            <tbody>
              {schedule.map((shift, idx) => {
                const start = new Date(shift.start_time || shift.start_datetime || "");
                const end   = new Date(shift.end_time   || shift.end_datetime   || "");
                const hrs   = (end - start) / 3600000;
                return (
                  <tr key={shift.id || idx} style={{ borderTop: idx > 0 ? "1px solid #1a1916" : "none" }}>
                    <td style={S.td}>{shift.employee_name || shift.employee?.name || "—"}</td>
                    <td style={{ ...S.td, color: "#7eb87e", fontSize: "12px" }}>{fmt(shift.start_time || shift.start_datetime)}</td>
                    <td style={{ ...S.td, color: "#c07070", fontSize: "12px" }}>{fmt(shift.end_time || shift.end_datetime)}</td>
                    <td style={{ ...S.td, color: "#c8a96e" }}>{isNaN(hrs) ? "—" : `${hrs.toFixed(1)}h`}</td>
                    <td style={{ ...S.td, fontSize: "12px", color: "#555" }}>{shift.notes || "—"}</td>
                    <td style={{ padding: "4px 12px" }}>
                      <button onClick={() => deleteShift(shift.id || shift.ID)} style={S.btnDanger}>Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════
// TIME OFF REQUESTS COMPONENT (Admin)
// ══════════════════════════════════════
function TimeOffRequests({ S, employees, shifts, showFlash }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [working, setWorking]   = useState("");

  useEffect(() => {
    (async () => {
      const data = await shifts("getTimeOff", {});
      setRequests(Array.isArray(data) ? data : []);
      setLoading(false);
    })();
  }, []);

  const updateStatus = async (timeOffId, status) => {
    setWorking(timeOffId);
    const res = await shifts("updateTimeOff", { data: { timeOffId, status } });
    if (res.time_off_request || res.id || res.ID || res.code === 0) {
      setRequests(p => p.map(r => (r.id || r.ID) === timeOffId ? { ...r, status } : r));
      showFlash(`Request ${status} ✓`);
    } else {
      showFlash("Update failed — " + (res.message || "try again"));
    }
    setWorking("");
  };

  const statusColor = (s) => s === "approved" ? "#7eb87e" : s === "denied" ? "#c07070" : "#c8a96e";

  if (loading) return <div style={{ color: "#555", padding: "32px" }}>Loading time off requests…</div>;

  const pending = requests.filter(r => !r.status || r.status === "pending");
  const resolved = requests.filter(r => r.status && r.status !== "pending");

  return (
    <div>
      <div style={{ ...S.lbl, marginBottom: "16px" }}>
        Time Off Requests — {pending.length} pending
      </div>

      {requests.length === 0 ? (
        <div style={{ ...S.card, padding: "40px", textAlign: "center", color: "#444" }}>No time off requests</div>
      ) : (
        <div style={{ ...S.card, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr>
              {["Employee", "Start", "End", "Type", "Reason", "Status", "Actions"].map(h =>
                <th key={h} style={S.th}>{h}</th>
              )}
            </tr></thead>
            <tbody>
              {[...pending, ...resolved].map((r, idx) => {
                const id = r.id || r.ID;
                const isPending = !r.status || r.status === "pending";
                return (
                  <tr key={id || idx} style={{ borderTop: idx > 0 ? "1px solid #1a1916" : "none" }}>
                    <td style={S.td}>{r.employee_name || r.employee?.name || "—"}</td>
                    <td style={S.td}>{r.start_date}</td>
                    <td style={S.td}>{r.end_date}</td>
                    <td style={{ ...S.td, fontSize: "12px", color: "#888" }}>{r.type || r.leave_type || "—"}</td>
                    <td style={{ ...S.td, fontSize: "12px", color: "#666" }}>{r.reason || "—"}</td>
                    <td style={S.td}>
                      <span style={{ fontSize: "11px", fontWeight: "600", color: statusColor(r.status), textTransform: "capitalize" }}>
                        {r.status || "Pending"}
                      </span>
                    </td>
                    <td style={{ padding: "4px 12px" }}>
                      {isPending ? (
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button onClick={() => updateStatus(id, "approved")} disabled={!!working}
                            style={{ ...S.btnSm, fontSize: "10px" }}>✓ Approve</button>
                          <button onClick={() => updateStatus(id, "denied")} disabled={!!working}
                            style={{ ...S.btnDanger, fontSize: "10px" }}>✗ Deny</button>
                        </div>
                      ) : (
                        <span style={{ fontSize: "11px", color: "#444" }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}