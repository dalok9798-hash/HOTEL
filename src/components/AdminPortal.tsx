import React, { useState } from "react";
import { 
  Plus, Edit2, Trash2, Sliders, AlertTriangle, CheckCircle2, ShoppingCart, 
  Trash, Save, X, Sparkles, ChefHat 
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
  const [activeTab, setActiveTab] = useState<"menu" | "inventory">("menu");
  
  // Create / Edit states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

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

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("menu")}
            className={`py-2 px-4 rounded-xl text-xs font-black cursor-pointer ${
              activeTab === "menu" ? "bg-emerald-500 text-slate-950" : "bg-slate-900 text-slate-400 hover:text-slate-200"
            }`}
          >
            📋 Menu Manager
          </button>
          <button
            onClick={() => setActiveTab("inventory")}
            className={`py-2 px-4 rounded-xl text-xs font-black cursor-pointer ${
              activeTab === "inventory" ? "bg-emerald-500 text-slate-950" : "bg-slate-900 text-slate-400 hover:text-slate-200"
            }`}
          >
            🌾 Ingredient Level Tracker
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
                <tbody className="divide-y divide-slate-850 text-xs">
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
      ) : (
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
      )}
    </div>
  );
}
