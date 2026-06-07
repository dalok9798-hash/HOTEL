import React, { useState } from "react";
import { 
  Plus, Edit2, Trash2, Sliders, AlertTriangle, CheckCircle2, ShoppingCart, 
  Trash, Save, X, Sparkles, ChefHat, QrCode, Printer, Download, Copy, ExternalLink, Check 
} from "lucide-react";
import { MenuItem, InventoryItem, Category } from "../types";
import { CATEGORIES } from "../data";

interface AdminPortalProps {
  menu: MenuItem[];
  inventory: InventoryItem[];
  onAddMenuItem: (item: Partial<MenuItem>) => void;
  onUpdateMenuItem: (id: string, item: Partial<MenuItem>) => void;
  onDeleteMenuItem: (id: string) => void;
  onUpdateInventoryStock: (id: string, stockPercent: number) => void;
}

export default function AdminPortal({
  menu,
  inventory,
  onAddMenuItem,
  onUpdateMenuItem,
  onDeleteMenuItem,
  onUpdateInventoryStock
}: AdminPortalProps) {
  const [activeTab, setActiveTab] = useState<"menu" | "inventory" | "qr_codes">("menu");
  
  // Create / Edit states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Table QR states
  const [tableCount, setTableCount] = useState(15);
  const [copiedTable, setCopiedTable] = useState<number | null>(null);
  const [qrColor, setQrColor] = useState<"emerald" | "slate">("emerald");
  const [filterTable, setFilterTable] = useState<number | null>(null);
  const [baseUrl, setBaseUrl] = useState(() => {
    if (typeof window !== "undefined") {
      return window.location.origin;
    }
    return "https://tulsi-hotel.com";
  });

  const copyToClipboard = (text: string, num: number) => {
    navigator.clipboard.writeText(text);
    setCopiedTable(num);
    setTimeout(() => {
      setCopiedTable(null);
    }, 2000);
  };

  const [name, setName] = useState("");
  const [price, setPrice] = useState(150);
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState<Category>("Starters");
  const [isVeg, setIsVeg] = useState(true);
  const [prepTime, setPrepTime] = useState(15);
  const [isPol, setIsPol] = useState(false);
  const [isChf, setIsChf] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Partial<MenuItem> = {
      name,
      price: Number(price),
      description: desc,
      category,
      isVeg,
      prepTimeMinutes: Number(prepTime),
      isPopular: isPol,
      isChefRecommended: isChf,
      imageUrl: imageUrl || "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60"
    };

    if (editId) {
      onUpdateMenuItem(editId, payload);
    } else {
      onAddMenuItem(payload);
    }

    clearForm();
  };

  const startEdit = (item: MenuItem) => {
    setEditId(item.id);
    setName(item.name);
    setPrice(item.price);
    setDesc(item.description);
    setCategory(item.category);
    setIsVeg(item.isVeg);
    setPrepTime(item.prepTimeMinutes);
    setIsPol(item.isPopular);
    setIsChf(item.isChefRecommended);
    setImageUrl(item.imageUrl);
    setIsFormOpen(true);
  };

  const clearForm = () => {
    setIsFormOpen(false);
    setEditId(null);
    setName("");
    setPrice(150);
    setDesc("");
    setCategory("Starters");
    setIsVeg(true);
    setPrepTime(15);
    setIsPol(false);
    setIsChf(false);
    setImageUrl("");
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans pb-12 p-6">
      <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-transparent flex items-center gap-2">
            ⚙️ TULSI RESTAURANT MANAGER ADMIN
          </h2>
          <p className="text-xs text-slate-400 font-medium">Configure items of your Restaurant Live</p>
        </div>

        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("menu")}
            className={`py-2 px-4 rounded-xl text-xs font-black cursor-pointer whitespace-nowrap ${
              activeTab === "menu" ? "bg-emerald-500 text-slate-950" : "bg-slate-900 text-slate-400 hover:text-slate-200"
            }`}
          >
            📋 Menu Manager
          </button>
          <button
            onClick={() => setActiveTab("inventory")}
            className={`py-2 px-4 rounded-xl text-xs font-black cursor-pointer whitespace-nowrap ${
              activeTab === "inventory" ? "bg-emerald-500 text-slate-950" : "bg-slate-900 text-slate-400 hover:text-slate-200"
            }`}
          >
            🌾 Ingredient Level Tracker
          </button>
          <button
            onClick={() => setActiveTab("qr_codes")}
            className={`py-2 px-4 rounded-xl text-xs font-black cursor-pointer whitespace-nowrap ${
              activeTab === "qr_codes" ? "bg-emerald-500 text-slate-950" : "bg-slate-900 text-slate-400 hover:text-slate-200"
            }`}
          >
            🔲 Table QR Codes
          </button>
        </div>
      </div>

      {activeTab === "menu" ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-extrabold uppercase text-slate-400 tracking-widest">
              Digital Menu Catalog ({menu.length})
            </h3>
            <button
              onClick={() => {
                clearForm();
                setIsFormOpen(true);
              }}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-2.5 px-4 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add Food Item</span>
            </button>
          </div>

          {isFormOpen && (
            <form onSubmit={handleSave} className="bg-slate-950 border border-slate-800 rounded-3xl p-6 gap-4 grid grid-cols-1 md:grid-cols-2">
              <h4 className="text-md font-bold text-slate-200 md:col-span-2 flex items-center gap-1.5">
                ✒️ {editId ? "Edit Item Particulars" : "Define New Food Item"}
              </h4>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1 uppercase">Item Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="E.g. Paneer Tikka Masala"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-3 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1 uppercase">Price (INR/₹)</label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-3 text-xs focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] text-slate-400 font-bold mb-1 uppercase">Narrative Description</label>
                <textarea
                  required
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Rich mouth-watering explanation of premium ingredients..."
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none text-slate-200"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1 uppercase">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-white"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1 uppercase">Preparation Timing (Minutes)</label>
                <input
                  type="number"
                  required
                  value={prepTime}
                  onChange={(e) => setPrepTime(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-3 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1 uppercase">Dish Image URL</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/your-premium-image..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-3 text-xs focus:outline-none"
                />
              </div>

              <div className="flex gap-4 pt-3 items-center">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-300">
                  <input
                    type="checkbox"
                    checked={isVeg}
                    onChange={(e) => setIsVeg(e.target.checked)}
                    className="w-4 h-4 rounded-md"
                  />
                  <span>Veg Item</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-slate-300">
                  <input
                    type="checkbox"
                    checked={isPol}
                    onChange={(e) => setIsPol(e.target.checked)}
                    className="w-4 h-4 rounded-md"
                  />
                  <span>Popular Badge</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-slate-300">
                  <input
                    type="checkbox"
                    checked={isChf}
                    onChange={(e) => setIsChf(e.target.checked)}
                    className="w-4 h-4 rounded-md"
                  />
                  <span>Chef Recommended</span>
                </label>
              </div>

              <div className="md:col-span-2 pt-2 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={clearForm}
                  className="bg-slate-900 border border-slate-800 hover:bg-slate-850 py-2.5 px-6 rounded-xl text-xs cursor-pointer text-slate-300"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-2.5 px-6 rounded-xl text-xs cursor-pointer"
                >
                  Commit Changes
                </button>
              </div>
            </form>
          )}

          {/* Table display list */}
          <div className="bg-slate-950 rounded-3xl border border-slate-800 p-6 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-semibold text-slate-200">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] text-slate-500 uppercase tracking-widest">
                    <th className="pb-3 pl-2">Diet</th>
                    <th className="pb-3">Name</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3 text-right">Price</th>
                    <th className="pb-3 text-center">Prep Timing</th>
                    <th className="pb-3 text-center">In Stock Status</th>
                    <th className="pb-3 text-right pr-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-855 text-xs">
                  {menu.map((food) => (
                    <tr key={food.id} className="hover:bg-slate-900/50">
                      <td className="py-3 pl-2">
                        <span className={`w-3 h-3 rounded-full inline-block ${food.isVeg ? "bg-emerald-400" : "bg-red-400"}`}></span>
                      </td>
                      <td className="py-3 font-bold text-white">{food.name}</td>
                      <td className="py-3 text-slate-400">{food.category}</td>
                      <td className="py-3 text-right font-mono text-emerald-400 font-bold">₹{food.price}</td>
                      <td className="py-3 text-center text-slate-450 font-mono">{food.prepTimeMinutes} Mins</td>
                      <td className="py-3 text-center">
                        <button
                          onClick={() => {
                            onUpdateMenuItem(food.id, { isAvailable: !food.isAvailable });
                          }}
                          className={`py-1 px-2 rounded-lg text-[9px] font-black uppercase tracking-widest cursor-pointer ${
                            food.isAvailable ? "bg-emerald-950 text-emerald-400" : "bg-red-950 text-red-400"
                          }`}
                        >
                          {food.isAvailable ? "Available" : "Stock-out"}
                        </button>
                      </td>
                      <td className="py-3 text-right pr-2">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => startEdit(food)}
                            className="p-1 px-2.5 bg-slate-900 hover:bg-slate-800 rounded border border-slate-800 text-slate-300 hover:text-white cursor-pointer text-[10px]"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              onDeleteMenuItem(food.id);
                            }}
                            className="p-1 px-2.5 bg-red-950 hover:bg-red-900 rounded border border-red-900 text-red-400 hover:text-white cursor-pointer text-[10px]"
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : activeTab === "inventory" ? (
        <div className="space-y-6">
          <h3 className="text-sm font-extrabold uppercase text-slate-400 tracking-widest">
            Ingredient Level Tracker (Auto Out-of-Stock Synced)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inventory.map((ing) => (
              <div key={ing.id} className="bg-slate-950 border border-slate-800 rounded-3xl p-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-extrabold text-sm ml-0.5 text-white">{ing.name}</h4>
                    <span className="text-[10px] text-slate-500 font-bold">Base Unit: {ing.unit}</span>
                  </div>

                  {ing.isLowStock && (
                    <span className="bg-red-950 text-red-400 border border-red-900/60 text-[9px] font-black py-0.5 px-2 rounded uppercase tracking-widest">
                      Low stock
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={ing.stockPercent}
                    onChange={(e) => {
                      onUpdateInventoryStock(ing.id, Number(e.target.value));
                    }}
                    className="flex-1 accent-emerald-400 cursor-pointer"
                  />
                  <span className="font-mono text-xs text-white font-black">{ing.stockPercent}%</span>
                </div>

                {ing.stockPercent === 0 && ing.name.includes("Paneer") && (
                  <div className="mt-3 bg-red-950/40 p-2 rounded-xl text-[10px] text-red-300 border border-red-900/40 leading-none">
                    🚨 Warning: Out of paneer! Related paneer dishes auto disabled on consumer menus.
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-emerald-400" />
                  Table Direct QR Code Generator
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Generate and download scannable QR Codes for guest tables to view menus, request waiters, and pay.
                </p>
              </div>
              <button
                onClick={() => window.print()}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-2.5 px-4 rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-colors shadow-lg shadow-emerald-500/10"
              >
                <Printer className="w-4 h-4" />
                <span>Print All QR Cards</span>
              </button>
            </div>

            {/* Customizer settings bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1.5 uppercase">Base App URL Override</label>
                <input
                  type="text"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="e.g. https://tulsi.com"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-slate-700 font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1.5 uppercase">Generate for (Tables)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={tableCount}
                    onChange={(e) => setTableCount(Number(e.target.value))}
                    className="flex-1 accent-emerald-400 cursor-pointer"
                  />
                  <span className="font-mono text-xs text-white font-black">{tableCount} Tables</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1.5 uppercase">Color Theme</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setQrColor("emerald")}
                    className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                      qrColor === "emerald"
                        ? "bg-emerald-950/40 border-emerald-500 text-emerald-400"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850"
                    }`}
                  >
                    Emerald Green
                  </button>
                  <button
                    onClick={() => setQrColor("slate")}
                    className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                      qrColor === "slate"
                        ? "bg-slate-950/45 border-slate-600 text-slate-300"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850"
                    }`}
                  >
                    Slate Black
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1.5 uppercase">Filter Specific Table</label>
                <select
                  value={filterTable === null ? "" : filterTable}
                  onChange={(e) => setFilterTable(e.target.value ? Number(e.target.value) : null)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white cursor-pointer"
                >
                  <option value="">Show All Tables ({tableCount})</option>
                  {Array.from({ length: tableCount }, (_, i) => i + 1).map((t) => (
                    <option key={t} value={t}>Table {t}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: tableCount }, (_, i) => i + 1)
              .filter((tblNum) => filterTable === null || tblNum === filterTable)
              .map((tblNum) => {
                const targetUrl = `${baseUrl}?table=${tblNum}`;
                const qrImgSrc = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&color=${qrColor === "emerald" ? "059669" : "0f172a"}&bgcolor=ffffff&data=${encodeURIComponent(targetUrl)}`;

                return (
                  <div key={tblNum} className="bg-slate-950 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between items-center text-center relative hover:border-slate-705 transition-all duration-300 group">
                    <div className="w-full">
                      <span className="text-[9px] text-slate-500 uppercase tracking-widest font-black block border-b border-dashed border-slate-800 pb-2 mb-3">
                        ✦ TULSI PREMIUM DINING ROOM ✦
                      </span>

                      <h4 className="text-lg font-black text-white mt-1 uppercase tracking-tight">
                        Table {String(tblNum).padStart(2, "0")}
                      </h4>
                      <p className="text-[10px] text-emerald-400 font-mono mb-4 truncate text-center max-w-full px-2" title={targetUrl}>
                        {targetUrl}
                      </p>

                      <div className="bg-white p-4 rounded-2xl inline-block mb-4 shadow-xl border border-slate-100 relative overflow-hidden">
                        <img 
                          src={qrImgSrc} 
                          alt={`Table ${tblNum} QR Code`} 
                          className="w-40 h-40 object-contain block"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      <div className="bg-slate-900/60 p-2.5 rounded-xl text-[10px] text-slate-400 mb-6 border border-slate-850/50 leading-relaxed font-semibold">
                        <span>Scan to Order Thalis, Call Servers & Pay Bills</span>
                      </div>
                    </div>

                    <div className="w-full space-y-2 pt-2 border-t border-slate-900">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => copyToClipboard(targetUrl, tblNum)}
                          className="bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 py-2 rounded-xl text-xs font-bold cursor-pointer flex items-center justify-center gap-1 transition-all"
                        >
                          {copiedTable === tblNum ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Link</span>
                            </>
                          )}
                        </button>
                        <a
                          href={targetUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 py-2 rounded-xl text-xs font-bold cursor-pointer flex items-center justify-center gap-1 transition-all"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Test Link</span>
                        </a>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <a
                          href={qrImgSrc}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 py-2 rounded-xl text-xs font-bold cursor-pointer flex items-center justify-center gap-1 transition-all"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </a>

                        <button
                          onClick={() => {
                            setFilterTable(tblNum);
                            setTimeout(() => {
                              window.print();
                              setFilterTable(null);
                            }, 150);
                          }}
                          className="bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/25 text-emerald-400 hover:text-slate-950 py-2 rounded-xl text-xs font-bold cursor-pointer flex items-center justify-center gap-1 transition-all"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Print QR</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Hidden layout specifically for print operations */}
      <div id="qr-print-layer" className="hidden">
        <div className="bg-white text-black p-8 min-h-screen">
          <div className="text-center mb-8 border-b-2 border-slate-300 pb-4">
            <h1 className="text-3xl font-black tracking-widest text-emerald-700">TULSI HOTEL RESTAURANT</h1>
            <p className="text-xs uppercase tracking-wider font-bold text-slate-500">Official Table QR Scanners Sheets</p>
          </div>
          <div className="grid grid-cols-2 gap-6">
            {Array.from({ length: tableCount }, (_, i) => i + 1)
              .filter(t => filterTable === null || t === filterTable)
              .map((tblNum) => {
                const tUrl = `${baseUrl}?table=${tblNum}`;
                const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&color=${qrColor === "emerald" ? "047857" : "0f172a"}&bgcolor=ffffff&data=${encodeURIComponent(tUrl)}`;
                return (
                  <div key={tblNum} className="border-4 border-slate-900 rounded-3xl p-6 text-center bg-white flex flex-col items-center justify-center qr-card-print">
                    <div className="border-b-2 border-dashed border-slate-300 w-full pb-2 mb-3">
                      <span className="text-xs font-black tracking-widest text-emerald-600 block">✦ TULSI RESTAURANT ✦</span>
                      <span className="text-2xl font-black tracking-tight text-slate-900 block mt-1">TABLE {String(tblNum).padStart(2, "0")}</span>
                    </div>
                    <img 
                      src={qrUrl} 
                      alt={`Table ${tblNum} QR Code`} 
                      className="w-48 h-48 border-2 border-slate-900 p-2 rounded-xl bg-white mx-auto my-2 block"
                      referrerPolicy="no-referrer"
                    />
                    <div className="mt-3 text-slate-700 text-center">
                      <p className="text-[11px] font-black uppercase tracking-wider">Scan code to view live thali menu</p>
                      <p className="text-[10px] font-bold text-slate-500 mt-1">Place direct order • Call waiter assist • Quick billing payment</p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
