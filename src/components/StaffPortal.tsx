import React, { useState } from "react";
import { 
  Bell, Clock, Check, Printer, Layers, Sliders, Calendar, ChevronRight, 
  Trash2, Plus, DollarSign, Award, Star, BookOpen, AlertTriangle, Play 
} from "lucide-react";
import { Order, WaiterCall, Reservation, InventoryItem, Category } from "../types";

interface StaffPortalProps {
  orders: Order[];
  calls: WaiterCall[];
  reservations: Reservation[];
  tables: any[];
  onUpdateOrderStatus: (orderId: string, status: Order["status"]) => void;
  onStartTimer: (orderId: string) => void;
  onResolveCall: (callId: string) => void;
  onUpdateReservation: (resId: string, status: Reservation["status"]) => void;
  onPayBill: (orderId: string, method: string) => void;
  onClearTable: (tableNum: number) => void;
  onTriggerCall: (tableNum: number, type: WaiterCall["type"]) => void;
}

export default function StaffPortal({
  orders,
  calls,
  reservations,
  tables,
  onUpdateOrderStatus,
  onStartTimer,
  onResolveCall,
  onUpdateReservation,
  onPayBill,
  onClearTable,
  onTriggerCall
}: StaffPortalProps) {
  const [activeTab, setActiveTab] = useState<"orders" | "tables" | "calls" | "reservations">("orders");
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [billingOrder, setBillingOrder] = useState<Order | null>(null);
  const [payMethod, setPayMethod] = useState<string>("UPI");

  // Filter lists inside operator views
  const pendingCalls = calls.filter((c) => c.status === "pending");
  const activeOrders = orders.filter((o) => o.status !== "served");
  const todayReservations = reservations;

  // Revenue analytics aggregates
  const totalRevenue = orders.filter((o) => o.billingStatus === "paid").reduce((sum, o) => sum + o.total, 0);
  const pendingRevenue = orders.filter((o) => o.billingStatus === "pending").reduce((sum, o) => sum + o.total, 0);
  
  // Table info lookup
  const getTableInfo = (num: number) => {
    return tables.find((t) => t.tableNum === num) || { tableNum: num, status: "available" };
  };

  const getActiveOrderForTable = (num: number) => {
    return orders.find((o) => o.tableNum === num && o.status !== "served");
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans pb-12">
      {/* Upper Dashboard Tickers */}
      <div className="bg-slate-950 p-6 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-transparent">
              TULSI STAFF OPERATIONS CENTER
            </h2>
            <p className="text-xs text-slate-400 font-medium">Real-Time Dining Room Sync Monitor</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full md:w-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest block">Today Revenue</span>
              <span className="text-lg font-black text-emerald-400 font-mono">₹{totalRevenue}</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest block">Active Orders</span>
              <span className="text-lg font-black text-sky-400 font-mono">{activeOrders.length}</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 text-center relative">
              {pendingCalls.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold animate-pulse">
                  {pendingCalls.length}
                </span>
              )}
              <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest block">Pending Calls</span>
              <span className="text-lg font-black text-amber-400 font-mono">{pendingCalls.length}</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest block">Reservations</span>
              <span className="text-lg font-black text-pink-400 font-mono">{todayReservations.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary tab controllers */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="flex gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
          {[
            { id: "orders", label: `📦 Active Orders Queue (${activeOrders.length})` },
            { id: "tables", label: `🗺️ Floor Table Map (${tables.length})` },
            { id: "calls", label: `🛎️ Waiter Assist Bells (${pendingCalls.length})` },
            { id: "reservations", label: `📅 Table Reservations` }
          ].map((tb) => (
            <button
              key={tb.id}
              onClick={() => setActiveTab(tb.id as any)}
              className={`py-2 px-4 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tb.id
                  ? "bg-gradient-to-r from-emerald-400 to-sky-400 text-slate-950 font-black shadow-md"
                  : "bg-slate-950 text-slate-400 hover:text-slate-100 hover:bg-slate-800"
              }`}
            >
              {tb.label}
            </button>
          ))}
        </div>

        {/* Tab content panels */}
        <div className="mt-6">
          {/* Active Orders Queue */}
          {activeTab === "orders" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Order Lists */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold uppercase text-slate-400 tracking-widest">
                    Dining Room Tickets Feed
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">Live Sync Queue</span>
                </div>

                {activeOrders.length === 0 ? (
                  <div className="bg-slate-950 border border-slate-800 rounded-3xl p-12 text-center text-slate-500">
                    🍻 No active orders in session. All customers fully served and satisfied!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {activeOrders.map((ord) => (
                      <div 
                        key={ord.id}
                        className={`bg-slate-950 border rounded-2xl p-4 transition-all ${
                          ord.status === "ready" ? "border-emerald-500/50" : "border-slate-800"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs bg-slate-800 text-slate-300 font-bold px-2 py-0.5 rounded">
                                Table {ord.tableNum}
                              </span>
                              <span className="text-xs font-mono text-slate-400 font-black">#{ord.id}</span>
                              {ord.billingStatus === "paid" ? (
                                <span className="bg-emerald-950 text-emerald-400 text-[9px] font-black border border-emerald-800 px-2 py-0.5 rounded-full uppercase tracking-widest">
                                  Paid
                                </span>
                              ) : (
                                <button
                                  onClick={() => setBillingOrder(ord)}
                                  className="bg-sky-950 hover:bg-sky-850 text-sky-300 text-[9px] font-black border border-sky-800 px-2.5 py-0.5 rounded-full uppercase tracking-widest cursor-pointer"
                                >
                                  Collect Bill (₹{ord.total})
                                </button>
                              )}
                            </div>
                            <p className="text-xs font-bold text-slate-200 mt-1">Customer: {ord.customerName}</p>
                          </div>

                          <div className="flex items-center gap-2">
                            {ord.status === "received" && (
                              <button
                                onClick={() => onStartTimer(ord.id)}
                                className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold py-1.5 px-3 rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                              >
                                <Play className="w-3.5 h-3.5 fill-slate-950" />
                                <span>Start Prep</span>
                              </button>
                            )}

                            {ord.status === "preparing" && (
                              <button
                                onClick={() => onUpdateOrderStatus(ord.id, "ready")}
                                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-1.5 px-3 rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                              >
                                <Check className="w-4 h-4 stroke-[3]" />
                                <span>Dispatch Food</span>
                              </button>
                            )}

                            {ord.status === "ready" && (
                              <button
                                onClick={() => onUpdateOrderStatus(ord.id, "served")}
                                className="bg-pink-500 hover:bg-pink-400 text-white font-bold py-1.5 px-3 rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                              >
                                <Check className="w-4 h-4 stroke-[3]" />
                                <span>Complete Served</span>
                              </button>
                            )}

                            <span className={`text-[10px] font-extrabold uppercase py-1 px-2.5 rounded-md ${
                              ord.status === "received" ? "bg-slate-850 text-slate-300 border border-slate-700" :
                              ord.status === "preparing" ? "bg-amber-950/50 text-amber-400 border border-amber-900" :
                              ord.status === "ready" ? "bg-emerald-950/50 text-emerald-400 border border-emerald-900 animate-pulse" :
                              "bg-purple-950 text-purple-300"
                            }`}>
                              {ord.status}
                            </span>
                          </div>
                        </div>

                        {/* Items listed */}
                        <div className="bg-slate-900 rounded-xl p-3 border border-slate-800 text-xs">
                          <table className="w-full text-left font-semibold">
                            <thead>
                              <tr className="text-slate-500 border-b border-slate-800 text-[10px] uppercase tracking-wider">
                                <th className="pb-1.5">Dish</th>
                                <th className="pb-1.5 text-center">Qty</th>
                                <th className="pb-1.5 text-right">Rate</th>
                                <th className="pb-1.5 text-right whitespace-nowrap">Line total</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800 text-slate-300">
                              {ord.items.map((it) => (
                                <tr key={it.id}>
                                  <td className="py-2 flex items-center gap-1">
                                    <span className={`w-1.5 h-1.5 rounded-full inline-block ${it.isVeg ? "bg-emerald-400" : "bg-red-400"}`}></span>
                                    <span>{it.name}</span>
                                  </td>
                                  <td className="py-2 text-center font-mono">{it.quantity}</td>
                                  <td className="py-2 text-right font-mono">₹{it.price}</td>
                                  <td className="py-2 text-right font-mono">₹{it.price * it.quantity}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>

                          {ord.specialInstructions && (
                            <div className="mt-3 bg-slate-950 p-2 rounded-lg border border-yellow-950 text-yellow-300 text-[11px] leading-tight">
                              💡 <strong>Note instructions:</strong> {ord.specialInstructions}
                            </div>
                          )}
                        </div>

                        {/* Track Timer countdown info display */}
                        {ord.status === "preparing" && ord.timeRemainingSeconds !== null && (
                          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 font-bold bg-slate-900 py-1.5 px-3 rounded-lg border border-slate-800">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 animate-spin text-amber-400" />
                              Preparation time remaining countdown:
                            </span>
                            <span className="font-mono text-amber-400 text-sm font-black">
                              {Math.floor(ord.timeRemainingSeconds / 60)}:
                              {String(ord.timeRemainingSeconds % 60).padStart(2, "0")}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sidebar Active Assist Calls alerts */}
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold uppercase text-slate-400 tracking-widest flex items-center gap-2">
                  <Bell className="w-4 h-4 text-amber-400" />
                  Waiter Calls Buzzer ({pendingCalls.length})
                </h3>

                {pendingCalls.length === 0 ? (
                  <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 text-center text-slate-400 text-xs">
                    🔔 No assistance buzzers currently. Table servers are free.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingCalls.map((call) => (
                      <div 
                        key={call.id}
                        className="bg-linear-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-4 flex justify-between items-center shadow-lg relative overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-amber-400 animate-pulse"></div>
                        <div className="pl-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-slate-800 text-white font-bold py-0.5 px-2 rounded">
                              Table {call.tableNum}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {new Date(call.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                          </div>
                          <span className="text-xs font-black block text-amber-300 mt-2">
                            🛎️ {call.type}
                          </span>
                        </div>

                        <button
                          onClick={() => {
                            onResolveCall(call.id);
                          }}
                          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold py-1.5 px-3 rounded-lg cursor-pointer"
                        >
                          Resolve
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Table Floor Map representation */}
          {activeTab === "tables" && (
            <div className="p-6 bg-slate-950 rounded-3xl border border-slate-800">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                    Visual Floormap & Tables Tracker
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">Click on any table check info, place simulated waiter call or generate bills</p>
                </div>

                <div className="flex items-center gap-3 text-xs font-bold">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 bg-emerald-500 rounded"></span>
                    <span>Available</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 bg-amber-400 rounded"></span>
                    <span>Occupied</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 bg-sky-500 rounded"></span>
                    <span>Reserved</span>
                  </div>
                </div>
              </div>

              {/* Table Grid representation */}
              <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-8 gap-4">
                {tables.map((tbl) => {
                  const hasOrder = getActiveOrderForTable(tbl.tableNum);
                  let stateColor = "border-emerald-500/50 hover:bg-emerald-900/10 text-emerald-400";
                  if (tbl.status === "occupied") {
                    stateColor = "border-amber-400/50 hover:bg-amber-900/10 text-amber-300 bg-amber-950/10";
                  } else if (tbl.status === "reserved") {
                    stateColor = "border-sky-400/50 hover:bg-sky-900/10 text-sky-300";
                  }

                  return (
                    <button
                      key={tbl.tableNum}
                      onClick={() => setSelectedTable(tbl.tableNum)}
                      className={`border-2 p-4 rounded-2xl text-center cursor-pointer transition-all ${stateColor} ${
                        selectedTable === tbl.tableNum ? "ring-2 ring-emerald-400 scale-[1.03]" : ""
                      }`}
                    >
                      <h4 className="text-lg font-extrabold leading-none">Table {tbl.tableNum}</h4>
                      <span className="text-[9px] uppercase tracking-wider block mt-1 font-bold">
                        {tbl.status}
                      </span>
                      {hasOrder && (
                        <span className="text-[8px] bg-slate-800 text-slate-300 font-mono py-0.5 px-1 rounded block mt-2">
                          Order #{hasOrder.id}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Detailed interactive drawer for selected table */}
              {selectedTable !== null && (
                <div className="mt-6 p-6 border-t border-slate-800 bg-slate-900/50 rounded-2xl relative">
                  <button 
                    onClick={() => setSelectedTable(null)}
                    className="absolute top-4 right-4 text-xs font-bold text-slate-400 hover:text-white"
                  >
                    Close [X]
                  </button>

                  <h3 className="font-extrabold text-md text-slate-100 flex items-center gap-2">
                    Active Details for Table {selectedTable}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                    {/* Status actions */}
                    <div className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300">
                      <p className="font-bold text-white mb-2">Modify Table Status:</p>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            onClearTable(selectedTable);
                          }}
                          className="bg-emerald-950/40 hover:bg-emerald-900 border border-emerald-800/80 text-emerald-400 font-bold py-2 rounded-lg cursor-pointer"
                        >
                          Mark Available
                        </button>
                        <button
                          onClick={() => {
                            onTriggerCall(selectedTable, "Call Waiter");
                          }}
                          className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold py-2 rounded-lg cursor-pointer"
                        >
                          Place Call Alert
                        </button>
                      </div>
                    </div>

                    {/* Order details */}
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs text-slate-400 lg:col-span-2">
                      <p className="font-bold text-white mb-2">Order Information:</p>
                      {getActiveOrderForTable(selectedTable) ? (
                        (() => {
                          const tableOrd = getActiveOrderForTable(selectedTable)!;
                          return (
                            <div>
                              <p className="font-bold text-slate-200">Order ID: {tableOrd.id} ({tableOrd.status})</p>
                              <p className="mt-1 font-semibold text-slate-300">Customer: {tableOrd.customerName} ({tableOrd.customerPhone || "N/A"})</p>
                              <p className="mt-0.5 text-slate-400">Total: ₹{tableOrd.total} | Special instructions: {tableOrd.specialInstructions || "None"}</p>
                              
                              <div className="mt-4 flex gap-2">
                                <button
                                  onClick={() => setBillingOrder(tableOrd)}
                                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-1.5 px-4 rounded-lg font-bold cursor-pointer"
                                >
                                  Collect Billing & Print Invoice
                                </button>
                              </div>
                            </div>
                          );
                        })()
                      ) : (
                        <p className="text-xs text-slate-500 italic pb-2">No active ticket running on Table {selectedTable}. Available to assign new scanning diners!</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Active Help Calls buzzer panel */}
          {activeTab === "calls" && (
            <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 max-w-lg mx-auto">
              <h3 className="font-bold text-lg text-white mb-4">Pending Dining room buzzers</h3>
              {pendingCalls.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-6 text-center">No operator buzzer alerts pending resolution!</p>
              ) : (
                <div className="space-y-3">
                  {pendingCalls.map((bell) => (
                    <div key={bell.id} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex justify-between items-center gap-4">
                      <div>
                        <p className="font-bold text-white">Table {bell.tableNum}</p>
                        <p className="text-xs text-amber-400 font-extrabold mt-1">🛎️ request: {bell.type}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5 font-mono">Timestamp: {new Date(bell.createdAt).toLocaleTimeString()}</p>
                      </div>
                      <button
                        onClick={() => onResolveCall(bell.id)}
                        className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-1.5 px-3 rounded-lg text-xs cursor-pointer"
                      >
                        Resolve assistance
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Reservations calendar view */}
          {activeTab === "reservations" && (
            <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800">
              <h3 className="font-extrabold text-md text-slate-100 mb-4 uppercase tracking-wider">
                Guests Table Reservations Logbook
              </h3>

              <div className="grid grid-cols-1 gap-3">
                {todayReservations.map((res) => (
                  <div 
                    key={res.id} 
                    className="bg-slate-900 p-4 rounded-2xl border border-slate-850 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-sm text-white">{res.name}</h4>
                        <span className="bg-slate-800 text-slate-400 font-mono text-[10px] py-0.5 px-2 rounded-full">
                          {res.phone}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        🗓️ Booking: <strong>{res.date}</strong> at <strong>{res.time}</strong> | Guests Count: <strong>{res.guests}</strong> | Proposed Table: <strong>{res.tableNum}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-extrabold uppercase py-1 px-2.5 rounded-md ${
                        res.status === "confirmed" ? "bg-emerald-950 text-emerald-400" :
                        res.status === "cancelled" ? "bg-red-950 text-red-400" :
                        "bg-amber-950 text-amber-400 animate-pulse"
                      }`}>
                        {res.status}
                      </span>
                      
                      {res.status === "pending" && (
                        <>
                          <button
                            onClick={() => onUpdateReservation(res.id, "confirmed")}
                            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold py-1 px-2.5 rounded cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => onUpdateReservation(res.id, "cancelled")}
                            className="bg-red-500 hover:bg-red-400 text-white text-xs font-bold py-1 px-2.5 rounded cursor-pointer"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Collect Billing payment Modal Drawer */}
      {billingOrder && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 w-full max-w-md rounded-3xl p-6 border border-slate-800 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
              <Printer className="w-5 h-5 text-emerald-400" />
              Restaurant Billing System
            </h3>
            <p className="text-xs text-slate-400">Order verification & checkout for <strong>Table {billingOrder.tableNum}</strong></p>

            <div className="bg-slate-900 rounded-2xl p-4 text-xs space-y-2 border border-slate-800 font-mono">
              <p className="font-bold text-center border-b border-slate-850 pb-2 text-slate-300">TULSI HOTEL INVOICE</p>
              <p className="pt-2">Receipt ID: #R-{billingOrder.id}</p>
              <p>Customer: {billingOrder.customerName}</p>
              <div className="border-b border-slate-850 py-1.5 space-y-1">
                {billingOrder.items.map((it) => (
                  <div key={it.id} className="flex justify-between">
                    <span>{it.name} x{it.quantity}</span>
                    <span>₹{it.price * it.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{billingOrder.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>GST Tax (5%)</span>
                <span>₹{billingOrder.tax}</span>
              </div>
              <div className="flex justify-between text-emerald-400 text-sm font-black pt-1">
                <span>Grand Total (Incl Taxes)</span>
                <span>₹{billingOrder.total}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 font-bold mb-1.5 uppercase">Select Payment Method</label>
              <select
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-3 text-xs font-bold text-white cursor-pointer"
              >
                <option value="UPI">Direct UPI QR Scan</option>
                <option value="GPay">Google Pay (GPay)</option>
                <option value="Paytm">Paytm wallet</option>
                <option value="Cash">Cash in Hand</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setBillingOrder(null)}
                className="flex-1 bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-400 font-bold py-3 rounded-xl text-xs cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onPayBill(billingOrder.id, payMethod);
                  setBillingOrder(null);
                }}
                className="flex-1 bg-gradient-to-r from-emerald-400 to-sky-400 text-slate-950 font-black py-3 rounded-xl text-xs cursor-pointer shadow-lg shadow-emerald-500/10"
              >
                Complete Payment & Print
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
