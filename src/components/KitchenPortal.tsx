import React from "react";
import { Clock, Check, Play, AlertTriangle, ChevronRight, Layers } from "lucide-react";
import { Order } from "../types";

interface KitchenPortalProps {
  orders: Order[];
  onUpdateOrderStatus: (id: string, status: Order["status"]) => void;
  onStartTimer: (id: string) => void;
}

export default function KitchenPortal({ orders, onUpdateOrderStatus, onStartTimer }: KitchenPortalProps) {
  // Kitchen is concerned with received and preparing orders
  const kitchenOrders = orders.filter((o) => o.status === "received" || o.status === "preparing" || o.status === "ready");

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans pb-12 p-6">
      {/* KDS Header */}
      <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-transparent flex items-center gap-2">
            👨‍🍳 KITCHEN DISPLAY SYSTEM (KDS)
          </h2>
          <p className="text-xs text-slate-400 font-medium">Real-Time Cooking Line Command Board</p>
        </div>

        <div className="flex gap-4 text-xs font-bold font-mono">
          <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-center">
            <span className="text-slate-500 block uppercase text-[9px] mb-1">Received Queue</span>
            <span className="text-md font-black text-amber-400">{orders.filter(o => o.status === "received").length}</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-center">
            <span className="text-slate-500 block uppercase text-[9px] mb-1">Cooking Active</span>
            <span className="text-md font-black text-sky-400">{orders.filter(o => o.status === "preparing").length}</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-center">
            <span className="text-slate-500 block uppercase text-[9px] mb-1">dispatched ready</span>
            <span className="text-md font-black text-emerald-400">{orders.filter(o => o.status === "ready").length}</span>
          </div>
        </div>
      </div>

      {/* Main KDS Grid with high visibility */}
      {kitchenOrders.length === 0 ? (
        <div className="bg-slate-950 border border-slate-850 rounded-3xl p-16 text-center text-slate-400 max-w-xl mx-auto">
          🧁 Standard cooking queues are idle. High-quality thalis or paneer recipes can be initiated at the guest tables!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {kitchenOrders.map((ord) => (
            <div 
              key={ord.id}
              className={`rounded-3xl p-6 flex flex-col justify-between border-2 transition-all duration-300 relative ${
                ord.status === "received" 
                  ? "bg-slate-950 border-amber-500/50 shadow-amber-500/5 shadow-md" 
                  : "bg-slate-900 border-sky-500/40"
              }`}
            >
              {ord.status === "received" && (
                <div className="absolute top-0 right-6 bg-amber-400 text-slate-950 px-3 py-1 rounded-b-xl text-[10px] font-black uppercase tracking-widest animate-pulse">
                  Unaccepted Ticket
                </div>
              )}

              {/* Card Header information */}
              <div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-4">
                  <div>
                    <span className="text-xs bg-slate-800 text-slate-300 font-black px-2.5 py-1 rounded-lg">
                      Table {ord.tableNum}
                    </span>
                    <span className="text-xs text-slate-400 font-mono ml-2">#{ord.id}</span>
                  </div>

                  <span className="text-xs font-mono font-bold text-slate-500">
                    {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Big Readability Dishes line instructions list */}
                <div className="space-y-3 mb-4">
                  {ord.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-start bg-slate-950/45 p-2 rounded-xl">
                      <div className="flex items-start gap-1.5 flex-1">
                        <span className={`w-2 h-2 mt-1 rounded-full shrink-0 ${item.isVeg ? "bg-emerald-400" : "bg-red-400"}`}></span>
                        <div>
                          <p className="font-extrabold text-sm ml-0.5 text-slate-100">{item.name}</p>
                        </div>
                      </div>
                      <span className="text-xl font-black text-emerald-400 font-mono px-2 py-0.5 bg-slate-950 rounded-lg">
                        x{item.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Cooking / prep timing metrics */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
                  <div className="flex justify-between items-center text-xs text-slate-400 font-bold">
                    <span>Estimated Prep Time:</span>
                    <span className="text-slate-200">{ord.prepTimeMinutes} Minutes</span>
                  </div>

                  {ord.specialInstructions && (
                    <div className="bg-amber-950/40 p-2.5 rounded-xl text-xs text-amber-300 border border-amber-900/40">
                      ⚠️ <strong>Chef Warning Note:</strong> {ord.specialInstructions}
                    </div>
                  )}

                  {ord.status === "preparing" && ord.timeRemainingSeconds !== null && (
                    <div className="bg-sky-950/30 p-2.5 rounded-xl flex items-center justify-between text-xs text-slate-300 font-bold border border-sky-900/30">
                      <p className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 animate-spin text-sky-400" />
                        Ticking Timer clock:
                      </p>
                      <span className="font-mono text-sky-400 font-black text-sm">
                        {Math.floor(ord.timeRemainingSeconds / 60)}:
                        {String(ord.timeRemainingSeconds % 60).padStart(2, "0")}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Touch actions */}
              <div className="mt-6 pt-4 border-t border-slate-800/60">
                {ord.status === "received" ? (
                  <button
                    onClick={() => onStartTimer(ord.id)}
                    className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black py-3 rounded-2xl text-xs flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-slate-950" />
                    <span>ACCEPT & START COOKING</span>
                  </button>
                ) : ord.status === "preparing" ? (
                  <button
                    onClick={() => onUpdateOrderStatus(ord.id, "ready")}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3 rounded-2xl text-xs flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>MARK AS GOURMET READY</span>
                  </button>
                ) : (
                  <div className="bg-emerald-950/40 border border-emerald-900/60 p-3 rounded-2xl text-emerald-400 text-center text-xs font-black uppercase tracking-widest animate-pulse">
                    🔔 Dispatch Waiting
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
