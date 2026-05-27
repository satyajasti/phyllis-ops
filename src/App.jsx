import { useState, useEffect, useCallback } from "react";
import StaffLogin from "./StaffLogin";


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
  // ─── Authentication State ───
  const [me,setMe]           = useState(()=>{
    try{ const s=sessionStorage.getItem("phyllis_user"); return s?JSON.parse(s):null; }catch{ return null; }
  });
  const [oauthLoading,setOauthLoading] = useState(false);
  const [loginErr,setLoginErr]         = useState("");
  const [showPinFallback,setShowPinFallback] = useState(false);
  const [pin,setPin]         = useState("");
  const [loginTab, setLoginTab] = useState("manager");

  const [pinErr,setPinErr]   = useState("");
  
  // ─── Staff Login State (NEW) ───
  const [loginTab, setLoginTab] = useState("zoho"); // "zoho" or "staff"
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [staffPin, setStaffPin] = useState("");
  const [staffPinErr, setStaffPinErr] = useState("");
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  
  // ─── App State ───
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

  // ─── Staff Login Functions (NEW) ───
  const fetchEmployees = async () => {
    setLoadingEmployees(true);
    try {
      const res = await fetch("/api/employees");
      const data = await res.json();
      if (data.success && data.employees) {
        setFilteredEmployees(data.employees);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      setLoginErr("Failed to load employees. Please try again.");
    } finally {
      setLoadingEmployees(false);
    }
  };

  useEffect(() => {
    if (loginTab === "staff" && filteredEmployees.length === 0) {
      fetchEmployees();
    }
  }, [loginTab]);

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    
    if (query === "") {
      fetchEmployees();
    } else {
      const filtered = filteredEmployees.filter(emp =>
        emp.name.toLowerCase().includes(query) ||
        emp.role.toLowerCase().includes(query)
      );
      setFilteredEmployees(filtered);
    }
  };

  const handleSelectEmployee = (emp) => {
    setSelectedEmployee(emp);
    setSearchQuery(emp.name);
    setFilteredEmployees([]);
    setStaffPin("");
    setStaffPinErr("");
  };

  const doStaffLogin = async () => {
    if (!selectedEmployee) {
      setStaffPinErr("Please select an employee");
      return;
    }
    if (!staffPin) {
      setStaffPinErr("Please enter PIN");
      return;
    }

    setOauthLoading(true);
    setStaffPinErr("");
    
    try {
      const res = await fetch("/api/auth?action=verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: selectedEmployee.id,
          pin: staffPin,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMe(data.user);
        sessionStorage.setItem("phyllis_user", JSON.stringify(data.user));
        setPin("");
        setStaffPin("");
        setSelectedEmployee(null);
        setSearchQuery("");
      } else {
        setStaffPinErr(data.message || data.error || "Invalid PIN");
      }
    } catch (error) {
      console.error("Login error:", error);
      setStaffPinErr("Network error. Please try again.");
    } finally {
      setOauthLoading(false);
    }
  };

  // ─── Existing Login Functions ───
  const doZohoLogin=async()=>{
    setOauthLoading(true); setLoginErr("");
    try{
      const r=await fetch("/api/auth?action=login-url");
      const d=await r.json();
      if(d.url) window.location.href=d.url;
      else { setLoginErr("Could not get login URL."); setOauthLoading(false); }
    }catch(e){ setLoginErr("Network error."); setOauthLoading(false); }
  };

  const doLogin=()=>{
    setPinErr("");
    if(pin===process.env.REACT_APP_ADMIN_PIN||pin==="satya"){
      setMe(ADMIN);
      setPin("");
    }else{
      setPinErr("Invalid PIN");
    }
  };

  // ─── Styling ───
  const S={
    page:{background:"#0a0906",color:"#b0a898",fontFamily:"system-ui, sans-serif",minHeight:"100vh",display:"flex",flexDirection:"column"},
    lbl:{fontSize:"11px",letterSpacing:"2px",textTransform:"uppercase",color:"#888"},
    inp:{background:"#1a1814",border:"1px solid #2e2b26",color:"#b0a898",padding:"8px 12px",borderRadius:"2px",fontSize:"13px"},
    btn:{background:"#2a1e0a",border:"1px solid #3a2e20",color:"#c8a96e",padding:"8px 12px",borderRadius:"2px",cursor:"pointer",fontSize:"13px",fontWeight:"600"},
    amber:{color:"#c8a96e"},
    green:{color:"#7eb87e"},
  };

  // ──────────────────────────────────────────────────────────────────
// LOGIN PAGE (with Staff Login tab)
// ──────────────────────────────────────────────────────────────────

if(!me) return(
  <div style={{...S.page,display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh"}}>
    <div style={{...S.card,padding:"44px 40px",width:"420px",maxWidth:"92vw"}}>
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
          {/* Tabs */}
          <div style={{
            display:"flex",
            gap:"8px",
            marginBottom:"20px",
            borderBottom:"1px solid #1e1c18",
          }}>
            <button
              onClick={()=>{setLoginTab("manager");setLoginErr("");setPinErr("");}}
              style={{
                flex:1,
                padding:"12px 16px",
                background:loginTab==="manager"?"#2a1e0a":"transparent",
                border:"none",
                color:loginTab==="manager"?"#c8a96e":"#666",
                fontSize:"13px",
                fontWeight:loginTab==="manager"?"600":"400",
                cursor:"pointer",
                borderBottom:loginTab==="manager"?"2px solid #c8a96e":"none",
                transition:"all 0.2s",
              }}
            >
              👔 Manager Login
            </button>
            <button
              onClick={()=>{setLoginTab("staff");setLoginErr("");setPinErr("");}}
              style={{
                flex:1,
                padding:"12px 16px",
                background:loginTab==="staff"?"#0a160a":"transparent",
                border:"none",
                color:loginTab==="staff"?"#5a9a5a":"#666",
                fontSize:"13px",
                fontWeight:loginTab==="staff"?"600":"400",
                cursor:"pointer",
                borderBottom:loginTab==="staff"?"2px solid #5a9a5a":"none",
                transition:"all 0.2s",
              }}
            >
              👨‍🍳 Staff Login
            </button>
          </div>

          {/* Manager Login Tab */}
          {loginTab==="manager"&&(
            <div>
              <button onClick={doZohoLogin} style={{...S.btn,width:"100%",marginBottom:"12px"}}>
                🔐 Sign In with Zoho
              </button>
              <div style={{fontSize:"11px",color:"#666",textAlign:"center",marginBottom:"12px"}}>or</div>
              <div>
                <label style={{...S.lbl,marginBottom:"6px",display:"block"}}>Admin PIN</label>
                <input type="password" placeholder="Enter PIN" value={pin} onChange={e=>setPin(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doLogin()} style={{...S.inp,width:"100%",boxSizing:"border-box",marginBottom:"8px"}}/>
                {pinErr&&<div style={{color:"#c07070",fontSize:"12px",marginBottom:"10px"}}>{pinErr}</div>}
                <button onClick={doLogin} style={{...S.btn,width:"100%"}}>Sign In as Admin</button>
              </div>
            </div>
          )}

          {/* Staff Login Tab */}
          {loginTab==="staff"&&(
            <StaffLogin onLoginSuccess={(user)=>{setMe(user);setLoginErr("");}} S={S}/>
          )}
        </>
      )}
    </div>
  </div>
);

// ──────────────────────────────────────────────────────────────────
// END OF LOGIN PAGE
// ──────────────────────────────────────────────────────────────────

// IMPORTANT: Also add these state variables at the top of your App component (around line 180-190):
// const [loginTab, setLoginTab] = useState("manager");


  // ═══════════════════════════════════════════════════════════════════════════
  // MAIN APP (after login) - Keep your existing code here
  // ═══════════════════════════════════════════════════════════════════════════
  
  // NOTE: Copy your entire existing app JSX code here (from the original App.jsx after line ~600)
  // This is just the login page. The rest of your app code remains the same.
  
  return (
    <div style={S.page}>
      {/* Your existing app code goes here */}
      <div style={{padding:"20px",textAlign:"center"}}>
        <h1>Welcome {me.firstName}!</h1>
        <p>Your app content goes here...</p>
        <button onClick={()=>setMe(null)} style={{...S.btn}}>Logout</button>
      </div>
    </div>
  );
}
