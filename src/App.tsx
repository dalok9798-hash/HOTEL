import React, { useState, useEffect } from "react";
import { 
  Bell, ChefHat, Sparkles, LogIn, LogOut, Loader2, UtensilsCrossed, 
  Layers, Map, Monitor, Settings, CheckCircle2, ShoppingCart 
} from "lucide-react";

// Types
import { MenuItem, Order, WaiterCall, Reservation, InventoryItem } from "./types";

// Components
import Splash from "./components/Splash";
import LoginPortal from "./components/LoginPortal";
import CustomerPortal from "./components/CustomerPortal";
import StaffPortal from "./components/StaffPortal";
import KitchenPortal from "./components/KitchenPortal";
import AdminPortal from "./components/AdminPortal";

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  
  // States fetched from backend
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [calls, setCalls] = useState<WaiterCall[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  // Simulation controls
  const [currentTab, setCurrentTab] = useState<"customer" | "staff" | "kitchen" | "admin">("customer");
  const [tableNum, setTableNum] = useState<number>(5);
  const [session, setSession] = useState<{ role: string; username: string } | null>(null);

  // Global toasts
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sound generator using Web Audio API
  const playOperatorBuzzer = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      // Fun double-tone sweet restaurant chime
      osc.type = "sine";
      osc.frequency.setValueAtTime(659.25, audioCtx.currentTime); // E5 note
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);

      setTimeout(() => {
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5 note
        gain2.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        osc2.start();
        osc2.stop(audioCtx.currentTime + 0.4);
      }, 150);

    } catch (e) {
      console.log("Audio feedback requires user interaction gesture", e);
    }
  };

  // Triggers custom text float alerts
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Fetch initial data
  const loadDatabaseStates = async () => {
    try {
      const pMenu = fetch("/api/menu").then(r => r.json());
      const pOrders = fetch("/api/orders").then(r => r.json());
      const pCalls = fetch("/api/calls").then(r => r.json());
      const pReservations = fetch("/api/reservations").then(r => r.json());
      const pInventory = fetch("/api/inventory").then(r => r.json());

      const [dMenu, dOrders, dCalls, dRes, dInv] = await Promise.all([
        pMenu, pOrders, pCalls, pReservations, pInventory
      ]);

      setMenu(dMenu);
      setOrders(dOrders);
      setCalls(dCalls);
      setReservations(dRes);
      setInventory(dInv);

      // Reconstruct tables occupancy locally
      const computedTables = Array.from({ length: 15 }, (_, i) => {
        const num = i + 1;
        const activeOrd = dOrders.find((o: Order) => o.tableNum === num && o.status !== "served");
        const hasRes = dRes.some((r: Reservation) => r.tableNum === num && r.status === "confirmed");
        return {
          tableNum: num,
          status: activeOrd ? "occupied" : hasRes ? "reserved" : "available",
          currentOrderId: activeOrd ? activeOrd.id : null
        };
      });
      setTables(computedTables);

    } catch (err) {
      console.error("Database connection failure", err);
    }
  };

  // Query String Table Parameter Loader
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tbl = params.get("table");
    if (tbl) {
      const val = parseInt(tbl);
      if (!isNaN(val) && val > 0 && val <= 100) {
        setTableNum(val);
      }
    }
  }, []);

  useEffect(() => {
    loadDatabaseStates();
  }, []);

  // Set up EventSource pipeline for automatic Server synchronizations
  useEffect(() => {
    const sse = new EventSource("/api/updates");

    sse.addEventListener("message", (msg) => {
      try {
        const event = JSON.parse(msg.data);
        const { type, data } = event;

        // Perform fast incremental merges or force safe reload states
        if (type === "order_created") {
          setOrders(prev => [...prev, data]);
          playOperatorBuzzer();
          triggerToast(`🔔 New Table Order placed from Table ${data.tableNum} (Order #${data.id})`);
          loadDatabaseStates();
        } else if (type === "order_updated") {
          setOrders(prev => prev.map(o => o.id === data.id ? data : o));
          if (data.status === "ready") {
            playOperatorBuzzer();
            triggerToast(`🍳 Order #${data.id} is now Ready for table ${data.tableNum}!`);
          }
          loadDatabaseStates();
        } else if (type === "call_created") {
          setCalls(prev => [...prev, data]);
          playOperatorBuzzer();
          triggerToast(`🚨 Table ${data.tableNum} buzzer triggered: "${data.type}"`);
          loadDatabaseStates();
        } else if (type === "call_resolved") {
          setCalls(prev => prev.map(c => c.id === data.id ? data : c));
          loadDatabaseStates();
        } else if (type === "menu_changed") {
          setMenu(data);
          loadDatabaseStates();
        } else if (type === "inventory_changed") {
          setInventory(data);
          loadDatabaseStates();
        } else if (type === "tables_changed") {
          setTables(data);
        } else if (type === "reservation_created") {
          setReservations(prev => [...prev, data]);
          playOperatorBuzzer();
          triggerToast(`📅 New Reservation booking received for ${data.name}!`);
          loadDatabaseStates();
        } else if (type === "timers_ticked") {
          // Dynamic ticker sync without heavy console pollution
          setOrders(prev => prev.map(o => {
            const up = data.find((x: any) => x.id === o.id);
            if (up) {
              return { ...o, timeRemainingSeconds: up.timeRemainingSeconds, status: up.status };
            }
            return o;
          }));
        }
      } catch (e) {
        console.error("SSE parse error", e);
      }
    });

    return () => sse.close();
  }, []);

  // Post changes inside Customer Portal
  const handleOrderSuccess = (order: Order, msg: string) => {
    triggerToast(`🎉 Order Placed Successfully at Table ${order.tableNum}!`);
    if (msg) {
      console.log(msg); // Log simulator text
    }
    loadDatabaseStates();
  };

  // Call waiter trigger
  const handleCallWaiter = async (type: WaiterCall["type"]) => {
    try {
      await fetch("/api/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableNum, type })
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Operator Actions
  const handleUpdateOrderStatus = async (orderId: string, status: Order["status"]) => {
    try {
      await fetch(`/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleStartTimer = async (orderId: string) => {
    try {
      await fetch(`/api/orders/${orderId}/start-timer`, {
        method: "POST"
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleResolveCall = async (callId: string) => {
    try {
      await fetch(`/api/calls/${callId}/resolve`, {
        method: "PUT"
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateReservation = async (resId: string, status: Reservation["status"]) => {
    try {
      await fetch(`/api/reservations/${resId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handlePayBill = async (orderId: string, method: string) => {
    try {
      await fetch(`/api/orders/${orderId}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod: method })
      });
      triggerToast(`💰 Bill paid for Order #${orderId} via ${method}!`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearTable = async (num: number) => {
    try {
      await fetch(`/api/tables/${num}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "available" })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleTriggerMockCall = async (num: number, type: WaiterCall["type"]) => {
    try {
      await fetch("/api/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableNum: num, type })
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Admin Config actions
  const handleAddMenuItem = async (itemPayload: Partial<MenuItem>) => {
    try {
      await fetch("/api/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itemPayload)
      });
      triggerToast(`🍔 Successfully added dish "${itemPayload.name}"!`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateMenuItem = async (id: string, itemPayload: Partial<MenuItem>) => {
    try {
      await fetch(`/api/menu/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itemPayload)
      });
      triggerToast(`📊 Menu updated!`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteMenuItem = async (id: string) => {
    try {
      await fetch(`/api/menu/${id}`, {
        method: "DELETE"
      });
      triggerToast(`🗑️ Menu Item successfully deleted!`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateInventoryStock = async (id: string, stockPercent: number) => {
    try {
      await fetch(`/api/inventory/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stockPercent })
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Logout admin/staff
  const handleLogout = () => {
    setSession(null);
    setCurrentTab("customer");
  };

  if (showSplash) {
    return <Splash onComplete={() => setShowSplash(false)} />;
  }

  // Guards portals with the authorized login check
  const renderOperatorPortal = () => {
    if (!session) {
      return (
        <LoginPortal 
          onLoginSuccess={(role, name) => {
            setSession({ role, username: name });
            if (role === "admin") setCurrentTab("admin");
            else if (role === "kitchen") setCurrentTab("kitchen");
            else setCurrentTab("staff");
            triggerToast(`🔒 Signed in as Authorized ${role.toUpperCase()}`);
          }}
          onBack={() => setCurrentTab("customer")}
        />
      );
    }

    if (currentTab === "staff") {
      return (
        <StaffPortal
          orders={orders}
          calls={calls}
          reservations={reservations}
          tables={tables}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onStartTimer={handleStartTimer}
          onResolveCall={handleResolveCall}
          onUpdateReservation={handleUpdateReservation}
          onPayBill={handlePayBill}
          onClearTable={handleClearTable}
          onTriggerCall={handleTriggerMockCall}
        />
      );
    }

    if (currentTab === "kitchen") {
      return (
        <KitchenPortal
          orders={orders}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onStartTimer={handleStartTimer}
        />
      );
    }

    return (
      <AdminPortal
        menu={menu}
        inventory={inventory}
        onAddMenuItem={handleAddMenuItem}
        onUpdateMenuItem={handleUpdateMenuItem}
        onDeleteMenuItem={handleDeleteMenuItem}
        onUpdateInventoryStock={handleUpdateInventoryStock}
      />
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 font-sans relative">
      {/* Simulation Helper Rail block to switch views instantly */}
      <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 text-xs text-slate-400 flex flex-wrap justify-between items-center gap-3 relative z-40 font-semibold shadow-md">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 block animate-pulse"></span>
          <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Evaluation Simulator Switchboard:</span>
        </div>

        <div className="flex gap-1">
          <button
            onClick={() => setCurrentTab("customer")}
            className={`py-1 px-3 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
              currentTab === "customer" 
                ? "bg-emerald-500 text-slate-950 font-bold shadow-xs" 
                : "hover:bg-slate-800 text-slate-450 hover:text-slate-100"
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Table Menu</span>
          </button>

          <button
            onClick={() => {
              if (!session) {
                // Keep customer menu as is, will prompt login inside viewport
              }
              setCurrentTab("staff");
            }}
            className={`py-1 px-3 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
              currentTab === "staff" 
                ? "bg-slate-900 border border-slate-800 text-slate-100 font-bold scale-[1.02]" 
                : "hover:bg-slate-800 text-slate-450 hover:text-slate-100"
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Staff Portal {session?.role === "staff" && "✅"}</span>
          </button>

          <button
            onClick={() => setCurrentTab("kitchen")}
            className={`py-1 px-3 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
              currentTab === "kitchen" 
                ? "bg-slate-900 border border-slate-800 text-slate-100 font-bold scale-[1.02]" 
                : "hover:bg-slate-800 text-slate-450 hover:text-slate-100"
            }`}
          >
            <ChefHat className="w-3.5 h-3.5" />
            <span>Kitchen KDS {session?.role === "kitchen" && "✅"}</span>
          </button>

          <button
            onClick={() => setCurrentTab("admin")}
            className={`py-1 px-3 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
              currentTab === "admin" 
                ? "bg-slate-900 border border-slate-800 text-slate-100 font-bold scale-[1.02]" 
                : "hover:bg-slate-800 text-slate-450 hover:text-slate-100"
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Admin Tools {session?.role === "admin" && "✅"}</span>
          </button>
        </div>

        {session && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-slate-800 text-slate-300 font-bold border border-slate-700 py-1 px-2.5 rounded-lg whitespace-nowrap">
              👤 {session.username} ({session.role.toUpperCase()})
            </span>
            <button
              onClick={handleLogout}
              className="bg-linear-to-r from-red-500/10 to-red-500/20 text-red-400 hover:text-white border border-red-900/50 hover:bg-red-900/30 rounded-lg py-1 px-2.5 transition-colors cursor-pointer text-[10px] font-extrabold flex items-center gap-1.5"
            >
              <LogOut className="w-3 h-3" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>

      {/* Main View rendering wrapper */}
      <div className="relative">
        {currentTab === "customer" ? (
          <CustomerPortal
            tableNum={tableNum}
            onTableChange={setTableNum}
            menu={menu}
            onOrderSuccess={handleOrderSuccess}
            activeOrders={orders}
            onCallWaiter={handleCallWaiter}
          />
        ) : (
          renderOperatorPortal()
        )}
      </div>

      {/* Universal Floater Toast notifications */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-55 max-w-sm bg-slate-950 text-white rounded-2xl p-4 shadow-2xl border border-slate-800 flex items-start gap-3 animate-fade-in-down animate-pulse">
          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h5 className="font-extrabold text-xs text-white">System Synchronized Update</h5>
            <p className="text-[11px] text-slate-350 font-semibold mt-0.5 leading-relaxed">{toastMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}
