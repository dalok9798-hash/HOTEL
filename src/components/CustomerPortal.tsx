import React, { useState, useEffect } from "react";
import { 
  Sparkles, Soup, ShoppingCart, Search, Filter, Phone, User, Clock, Bell, Globe, 
  Award, Star, ThumbsUp, Plus, Minus, Trash2, X, ChefHat, Check, Heart 
} from "lucide-react";
import { MenuItem, Category, Order, TranslationKey, WaiterCall } from "../types";
import { CATEGORIES, TRANSLATIONS } from "../data";

interface CustomerPortalProps {
  tableNum: number;
  onTableChange: (num: number) => void;
  menu: MenuItem[];
  onOrderSuccess: (order: Order, msg: string) => void;
  activeOrders: Order[];
  onCallWaiter: (type: WaiterCall["type"]) => void;
}

export default function CustomerPortal({
  tableNum,
  onTableChange,
  menu,
  onOrderSuccess,
  activeOrders,
  onCallWaiter
}: CustomerPortalProps) {
  const [lang, setLang] = useState<"en" | "hi" | "mr" | "kok">("en");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | "All">("All");
  const [dietFilter, setDietFilter] = useState<"all" | "veg" | "non-veg">("all");
  const [popularFilter, setPopularFilter] = useState(false);
  const [cart, setCart] = useState<{ item: MenuItem; quantity: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Checkout particulars
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [orderSubmitting, setOrderSubmitting] = useState(false);

  // Loyalty Program States
  const [loyaltyAccount, setLoyaltyAccount] = useState<{ name: string; points: number } | null>(null);
  const [checkingLoyalty, setCheckingLoyalty] = useState(false);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  // AI recommendations
  const [aiRecommendation, setAiRecommendation] = useState<{ name: string; reason: string; source: string } | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  // Call waiter trigger modal
  const [isWaiterModalOpen, setIsWaiterModalOpen] = useState(false);
  const [waiterCallStatus, setWaiterCallStatus] = useState<string | null>(null);

  // Active tracking order ID
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);
  const trackingOrder = activeOrders.find(o => o.id === trackingOrderId) || activeOrders[activeOrders.length - 1];

  const t = (key: TranslationKey): string => {
    return TRANSLATIONS[lang][key] || TRANSLATIONS["en"][key] || "";
  };

  // Triggers AI Sommelier Pairing recommendation on cart modification
  useEffect(() => {
    if (cart.length === 0) {
      setAiRecommendation(null);
      return;
    }

    const timer = setTimeout(async () => {
      setLoadingAi(true);
      try {
        const payload = cart.map(it => ({ name: it.item.name, quantity: it.quantity }));
        const response = await fetch("/api/ai-recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cartItems: payload })
        });
        const data = await response.json();
        if (data.recommendation) {
          setAiRecommendation(data.recommendation);
        }
      } catch (err) {
        console.error("AI recommendation error", err);
      } finally {
        setLoadingAi(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [cart]);

  // Lookup loyalty score
  const handleCheckLoyalty = async () => {
    if (!customerPhone || customerPhone.length < 10) return;
    setCheckingLoyalty(true);
    try {
      const response = await fetch(`/api/loyalty/${customerPhone}`);
      const data = await response.json();
      if (data) {
        setLoyaltyAccount({
          name: data.name || "Loyal Guest",
          points: data.points || 0
        });
        // Auto prefill customer name if found in database
        if (data.name && data.name !== "Guest") {
          setCustomerName(data.name);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCheckingLoyalty(false);
    }
  };

  // Add Item
  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((it) => it.item.id === item.id);
      if (existing) {
        return prev.map((it) => (it.item.id === item.id ? { ...it, quantity: it.quantity + 1 } : it));
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  // Remove Item
  const removeFromCart = (itemId: string) => {
    setCart((prev) =>
      prev
        .map((it) => (it.item.id === itemId ? { ...it, quantity: it.quantity - 1 } : it))
        .filter((it) => it.quantity > 0)
    );
  };

  // Direct set
  const updateQuantity = (itemId: string, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((it) => it.item.id !== itemId));
    } else {
      setCart((prev) => prev.map((it) => (it.item.id === itemId ? { ...it, quantity: qty } : it)));
    }
  };

  // Totals calculations
  const cartSubtotal = cart.reduce((sum, c) => sum + c.item.price * c.quantity, 0);
  const cartTax = Math.round(cartSubtotal * 0.05); // 5% GST
  const estimatedDiscount = pointsToRedeem > 0 ? Math.min(pointsToRedeem, cartSubtotal) : 0;
  const cartGrandTotal = Math.max(0, cartSubtotal + cartTax - estimatedDiscount);

  // Handle Order Submit
  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    setOrderSubmitting(true);

    try {
      const payload = {
        tableNum,
        customerName: customerName || `Table Guest ${tableNum}`,
        customerPhone,
        specialInstructions,
        items: cart.map((c) => ({
          id: c.item.id,
          name: c.item.name,
          quantity: c.quantity,
          price: c.item.price,
          isVeg: c.item.isVeg
        }))
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (data.success && data.order) {
        // Loyalty Point redemption simulation
        if (loyaltyAccount && pointsToRedeem > 0) {
          await fetch("/api/loyalty/redeem", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone: customerPhone, pointsToRedeem })
          });
        }

        setCart([]);
        setPointsToRedeem(0);
        setAppliedDiscount(0);
        setLoyaltyAccount(null);
        setIsCartOpen(false);
        setTrackingOrderId(data.order.id);
        onOrderSuccess(data.order, data.whatsappSimulated);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setOrderSubmitting(false);
    }
  };

  const filteredMenu = menu.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          item.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesDiet = dietFilter === "all" || 
                        (dietFilter === "veg" && item.isVeg) || 
                        (dietFilter === "non-veg" && !item.isVeg);
    const matchesPopular = !popularFilter || item.isPopular || item.isChefRecommended;
    return matchesSearch && matchesCategory && matchesDiet && matchesPopular;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-24 font-sans selection:bg-emerald-200">
      {/* Top Brand Header */}
      <header className="sticky top-0 bg-white/85 backdrop-blur-md border-b border-emerald-100 shadow-xs z-30 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-emerald-400 to-sky-400 p-0.5 shadow-sm">
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
              <ChefHat className="w-5 h-5 text-emerald-300 animate-pulse" />
            </div>
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-slate-900 flex items-center gap-1.5 leading-none">
              {t("welcome_title")}
              <span className="text-[10px] py-0.5 px-2 rounded-full bg-emerald-100 text-emerald-800 font-extrabold border border-emerald-200 animate-pulse">
                Premium
              </span>
            </h1>
            <p className="text-[10px] text-slate-500 font-medium">Table Smart QR Menu</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Language Selector */}
          <div className="relative flex items-center gap-1 bg-emerald-50 rounded-lg p-1 border border-emerald-100">
            <Globe className="w-3.5 h-3.5 text-emerald-600" />
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as any)}
              className="text-xs bg-transparent border-none text-emerald-800 font-bold focus:ring-0 pr-1 py-0.5 cursor-pointer outline-none"
            >
              <option value="en">English (EN)</option>
              <option value="hi">हिन्दी (HI)</option>
              <option value="mr">मराठी (MR)</option>
              <option value="kok">कोंकणी (KOK)</option>
            </select>
          </div>

          <div className="text-xs bg-slate-900 text-white rounded-lg px-2.5 py-1.5 font-bold shadow-xs">
            Table {tableNum}
          </div>
        </div>
      </header>

      {/* Floating active tracking status if order is preparing */}
      {trackingOrder && trackingOrder.status !== "served" && (
        <div className="mx-4 mt-4 bg-slate-900 text-white rounded-2xl p-4 shadow-xl border border-emerald-400/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 bg-emerald-500 text-slate-950 rounded-bl-2xl text-[10px] font-black uppercase tracking-wider">
            Live Track
          </div>
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Order #{trackingOrder.id}</p>
              <h4 className="text-md font-bold text-slate-100 mt-0.5">
                {trackingOrder.status === "received" && "👨‍🍳 Kitchen Received"}
                {trackingOrder.status === "preparing" && "🔥 Cooking Progress..."}
                {trackingOrder.status === "ready" && "🔔 Ready to Serve!"}
              </h4>
            </div>
            {trackingOrder.timeRemainingSeconds !== null && trackingOrder.timeRemainingSeconds > 0 && (
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-widest">Est Remaining</span>
                <span className="text-xl font-mono text-emerald-400 font-black animate-pulse">
                  {Math.floor(trackingOrder.timeRemainingSeconds / 60)}:
                  {String(trackingOrder.timeRemainingSeconds % 60).padStart(2, "0")}
                </span>
              </div>
            )}
          </div>

          {/* Progress Timeline */}
          <div className="relative mt-2">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-800 -translate-y-1/2 rounded-full"></div>
            <div 
              className="absolute top-1/2 left-0 h-1 bg-linear-to-r from-emerald-400 to-sky-400 -translate-y-1/2 rounded-full transition-all duration-500"
              style={{
                width: 
                  trackingOrder.status === "received" ? "25%" :
                  trackingOrder.status === "preparing" ? "65%" : "100%"
              }}
            ></div>

            <div className="flex justify-between relative z-10">
              {["received", "preparing", "ready"].map((st, i) => {
                const isCurrentType = trackingOrder.status === st;
                const isCompleted = 
                  (st === "received") ||
                  (st === "preparing" && trackingOrder.status !== "received") ||
                  (st === "ready" && trackingOrder.status === "ready");

                return (
                  <div key={st} className="flex flex-col items-center">
                    <div 
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        isCurrentType ? "bg-emerald-400 text-slate-900 border-2 border-white animate-bounce" :
                        isCompleted ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-500"
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span className="text-[9px] text-slate-400 font-extrabold uppercase mt-1">
                      {st}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Promo banner */}
      <div className="bg-linear-to-br from-emerald-100 to-sky-100 m-4 rounded-3xl p-6 relative overflow-hidden shadow-xs border border-emerald-100/50">
        <div className="relative z-10 max-w-xs">
          <span className="text-[10px] bg-slate-900 text-white py-1 px-2.5 rounded-full uppercase tracking-widest font-black">
            Welcome To Tulsi Hotel
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-3">
            {t("welcome_subtitle")}
          </h2>
          <p className="text-xs text-slate-600 mt-2 font-medium">
            Scan QR Code, select your royal starters or main course with direct cashless orders today.
          </p>
        </div>
        {/* Abstract shapes */}
        <div className="absolute -bottom-10 -right-10 w-44 h-44 rounded-full bg-emerald-400/20 blur-3xl"></div>
        <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-sky-400/20 blur-2xl"></div>
      </div>

      {/* Categories & Search block */}
      <div className="px-4 space-y-4">
        {/* Search */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search dishes, drinks, thali combos..."
              className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-10 pr-4 text-xs font-semibold focus:outline-none focus:border-emerald-500 transition-colors shadow-xs placeholder-slate-400"
            />
          </div>
          
          <button
            onClick={() => setPopularFilter(!popularFilter)}
            className={`px-4 rounded-2xl border transition-all text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer ${
              popularFilter 
                ? "bg-slate-900 text-white border-slate-900" 
                : "bg-white text-slate-700 border-slate-200"
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${popularFilter ? "fill-emerald-400 text-emerald-400" : ""}`} />
            <span>Popular</span>
          </button>
        </div>

        {/* Dietary toggle tabs */}
        <div className="flex gap-2 bg-slate-200/50 p-1 rounded-2xl">
          <button
            onClick={() => setDietFilter("all")}
            className={`flex-1 py-2 text-xs font-bold transition-all rounded-xl cursor-pointer ${
              dietFilter === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            All Items
          </button>
          <button
            onClick={() => setDietFilter("veg")}
            className={`flex-1 py-2 text-xs font-bold flex items-center justify-center gap-1.5 transition-all rounded-xl cursor-pointer ${
              dietFilter === "veg" ? "bg-emerald-500 text-white shadow-xs" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <span className="w-2.5 h-2.5 border-2 border-emerald-600 bg-emerald-200 rounded-sm inline-block"></span>
            Pure Veg
          </button>
          <button
            onClick={() => setDietFilter("non-veg")}
            className={`flex-1 py-1.5 text-xs font-bold flex items-center justify-center gap-1.5 transition-all rounded-xl cursor-pointer ${
              dietFilter === "non-veg" ? "bg-red-500 text-white shadow-xs" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <span className="w-2.5 h-2.5 border-2 border-red-600 bg-red-200 rounded-full inline-block"></span>
            Non-Veg
          </button>
        </div>

        {/* Categories Pills Horizontal list */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs uppercase font-extrabold text-slate-500 tracking-wider">
              {t("categories")}
            </h3>
            <span className="text-[10px] text-slate-400 font-bold">{filteredMenu.length} items found</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCategory("All")}
              className={`px-4 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-xs cursor-pointer ${
                selectedCategory === "All"
                  ? "bg-emerald-500 text-white"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              🏆 All Categories
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-xs cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-emerald-500 text-white"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {cat === "Starters" && "🍢 "}
                {cat === "Soups" && "🍵 "}
                {cat === "Veg Main Course" && "🥘 "}
                {cat === "Non-Veg Main Course" && "🍗 "}
                {cat === "Chinese" && "🥡 "}
                {cat === "South Indian" && "🥞 "}
                {cat === "Biryani" && "🍚 "}
                {cat === "Snacks" && "🍟 "}
                {cat === "Beverages" && "🍹 "}
                {cat === "Desserts" && "🍰 "}
                {cat === "Special Combos" && "🎁 "}
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Grid */}
      <main className="px-4 mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMenu.map((item) => (
          <div 
            key={item.id}
            className={`bg-white rounded-3xl p-3 border border-slate-100 shadow-xs flex gap-3 relative transition-all duration-300 hover:border-emerald-200 hover:shadow-md ${
              !item.isAvailable ? "opacity-60" : ""
            }`}
          >
            {/* Badges */}
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-1">
              {item.isVeg ? (
                <span className="bg-emerald-50 text-emerald-800 text-[9px] font-black tracking-widest uppercase py-0.5 px-2 rounded-md border border-emerald-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 block"></span>
                  veg
                </span>
              ) : (
                <span className="bg-red-50 text-red-800 text-[9px] font-black tracking-widest uppercase py-0.5 px-2 rounded-md border border-red-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 block"></span>
                  nonveg
                </span>
              )}
            </div>

            {/* Food Image */}
            <div className="w-28 h-28 rounded-2xl overflow-hidden bg-slate-100 relative shrink-0">
              <img 
                src={item.imageUrl} 
                alt={item.name} 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover" 
              />
              {!item.isAvailable && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-2 text-center text-[10px] font-black text-white uppercase">
                  Out Of Stock
                </div>
              )}
            </div>

            {/* Detail Section */}
            <div className="flex-1 flex flex-col justify-between py-1">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-extrabold text-sm ml-0.5 text-slate-900 leading-tight">
                    {item.name}
                  </h4>
                  {item.isChefRecommended && (
                    <span className="bg-amber-50 text-amber-700 text-[8px] font-black uppercase tracking-widest py-0.5 px-1.5 rounded border border-amber-300">
                      Recommendation
                    </span>
                  )}
                  {item.isPopular && (
                    <span className="bg-indigo-50 text-indigo-700 text-[8px] font-black uppercase tracking-widest py-0.5 px-1.5 rounded border border-indigo-300">
                      Popular
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="flex items-center justify-between gap-1.5 pt-2">
                <div className="flex flex-col">
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {item.prepTimeMinutes} Mins
                  </span>
                  <span className="text-md font-black text-slate-900 mt-0.5">₹{item.price}</span>
                </div>

                {item.isAvailable && (
                  <div className="flex items-center">
                    {cart.find(c => c.item.id === item.id) ? (
                      <div className="flex items-center bg-slate-900 text-white rounded-xl py-1.5 px-3 gap-2 border border-slate-900 shadow-sm">
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-white hover:text-emerald-300"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-bold font-mono">
                          {cart.find(c => c.item.id === item.id)?.quantity}
                        </span>
                        <button 
                          onClick={() => addToCart(item)}
                          className="text-white hover:text-emerald-300"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(item)}
                        className="bg-emerald-500 hover:bg-emerald-600 active:scale-[0.97] transition-all text-white py-1.5 px-3.5 rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                      >
                        {t("add_to_cart")}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </main>

      {/* Persistent floating helper button: Call waiter / Cart view */}
      <div className="fixed bottom-6 left-6 right-6 z-40 flex justify-between gap-3 pointer-events-none">
        {/* Call Waiter floating button */}
        <button
          onClick={() => setIsWaiterModalOpen(true)}
          className="pointer-events-auto bg-slate-900 hover:bg-slate-850 text-white py-3.5 px-4 rounded-2xl shadow-xl flex items-center gap-2 active:scale-[0.95] transition-all border border-slate-800 cursor-pointer text-xs font-extrabold tracking-tight"
        >
          <Bell className="w-4 h-4 text-emerald-400 animate-bounce" />
          <span>Call Waiter</span>
        </button>

        {/* View Cart button */}
        {cart.length > 0 && (
          <button
            onClick={() => setIsCartOpen(true)}
            className="pointer-events-auto flex-1 max-w-xs bg-gradient-to-r from-emerald-500 to-sky-500 text-slate-950 py-3.5 px-6 rounded-2xl font-black shadow-xl flex items-center justify-between active:scale-[0.97] border border-white/20 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-slate-950 animate-pulse" />
              <span className="text-xs uppercase tracking-widest">{t("view_cart")}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold tracking-widest block text-emerald-900 uppercase">Total ({cart.reduce((a,b)=>a+b.quantity,0)})</span>
              <span className="text-sm font-black text-slate-950">₹{cartGrandTotal}</span>
            </div>
          </button>
        )}
      </div>

      {/* Cart Modal Overlay */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-end justify-center p-0 md:p-4">
          <div className="bg-white w-full max-w-lg rounded-t-[32px] md:rounded-[32px] max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col justify-between border border-slate-100">
            {/* Cart Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-lg text-slate-900">Your Basket</h3>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="p-6 space-y-4 flex-1">
              {cart.map((c) => (
                <div key={c.item.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full inline-block ${c.item.isVeg ? "bg-emerald-500" : "bg-red-500"}`}></span>
                      <h5 className="font-bold text-sm text-slate-800 leading-none">{c.item.name}</h5>
                    </div>
                    <span className="text-xs text-slate-500 font-semibold block mt-1">₹{c.item.price} each</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-white border border-slate-200 rounded-xl py-1 px-2.5 gap-2.5 shadow-xs">
                      <button 
                        onClick={() => removeFromCart(c.item.id)}
                        className="text-slate-500 hover:text-emerald-500 cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-extrabold font-mono text-slate-800">{c.quantity}</span>
                      <button 
                        onClick={() => addToCart(c.item)}
                        className="text-slate-500 hover:text-emerald-500 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="text-sm font-black text-slate-900 w-16 text-right">₹{c.item.price * c.quantity}</span>
                  </div>
                </div>
              ))}

              {/* AI Recommendations panel inside Cart! */}
              {cart.length > 0 && (
                <div className="relative mt-2 p-4 bg-gradient-to-r from-emerald-50 to-sky-50 border border-emerald-100 rounded-2xl overflow-hidden shadow-xs">
                  <div className="absolute top-0 right-0 p-1.5 bg-sky-200 text-sky-800 rounded-bl-xl text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    AI Sommelier
                  </div>
                  <h6 className="text-[11px] uppercase tracking-wider text-emerald-800 font-extrabold mb-1">
                    Perfect Dining Combo Recommendation:
                  </h6>
                  {loadingAi ? (
                    <p className="text-xs text-slate-400 animate-pulse">Generating perfect pairing suggestions...</p>
                  ) : aiRecommendation ? (
                    <div>
                      <h4 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                        🌟 {aiRecommendation.name}
                        <button
                          onClick={() => {
                            const found = menu.find(m => m.name === aiRecommendation.name);
                            if (found) {
                              addToCart(found);
                            }
                          }}
                          className="text-[9px] bg-slate-900 text-white rounded-lg px-2 py-0.5 font-bold cursor-pointer"
                        >
                          Add to Meal
                        </button>
                      </h4>
                      <p className="text-xs text-slate-600 font-medium italic mt-1 leading-relaxed">
                        &ldquo;{aiRecommendation.reason}&rdquo;
                      </p>
                    </div>
                  ) : null}
                </div>
              )}

              {/* Checkout details form */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="text-xs uppercase tracking-widest font-extrabold text-slate-500">{t("confirm_table")}</h4>

                <div className="grid grid-cols-1 gap-3">
                  {/* Customer phone for Loyalty Club */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Loyalty Points Mobile Number (Indian Style)
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <input
                          type="tel"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="9876543210"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-xs font-semibold focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleCheckLoyalty}
                        disabled={!customerPhone}
                        className="bg-slate-900 border border-slate-800 hover:bg-slate-850 text-white rounded-xl px-4 text-xs font-bold cursor-pointer"
                      >
                        Apply Points
                      </button>
                    </div>
                    
                    {/* Loyalty Points result dialog */}
                    {loyaltyAccount && (
                      <div className="mt-2 text-xs bg-emerald-50 text-emerald-800 p-2.5 rounded-xl border border-emerald-100 flex items-center justify-between">
                        <div>
                          <p className="font-bold">Member: {loyaltyAccount.name}</p>
                          <p className="text-[11px] text-emerald-600 font-medium">Available Points Balance: {loyaltyAccount.points}</p>
                        </div>
                        {loyaltyAccount.points > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              const points = Math.min(loyaltyAccount.points, cartSubtotal);
                              setPointsToRedeem(points);
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold py-1 px-2 rounded cursor-pointer"
                          >
                            Redeem ₹{Math.min(loyaltyAccount.points, cartSubtotal)}
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Customer Name */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        {t("customer_name")}
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Your Name (E.g. Vikram)"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-xs font-semibold focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Active Table Number
                      </label>
                      <select
                        value={tableNum}
                        onChange={(e) => onTableChange(parseInt(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-bold focus:outline-none focus:border-emerald-500 cursor-pointer"
                      >
                        {[1, 2, 3, 4, 5, 8, 10, 15, 20, 50, 100].map((num) => (
                          <option key={num} value={num}>Table {num}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Special Instructions */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      {t("special_instructions")}
                    </label>
                    <textarea
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      placeholder="E.g. No onion, spicy Paneer Tikka, extra ice in Coffee..."
                      rows={2}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Price list details summary */}
              <div className="mt-4 pt-4 border-t border-slate-100 text-xs font-semibold space-y-2 text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{cartSubtotal}</span>
                </div>
                {pointsToRedeem > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Applied Loyalty Points Applied</span>
                    <span>- ₹{estimatedDiscount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>{t("gst")}</span>
                  <span>₹{cartTax}</span>
                </div>
                <div className="flex justify-between text-slate-900 font-extrabold text-sm pt-1.5 border-t border-slate-100">
                  <span>{t("grand_total")}</span>
                  <span className="text-md ml-0.5">₹{cartGrandTotal}</span>
                </div>
              </div>
            </div>

            {/* Cart Place Order CTA */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-2">
              <button
                onClick={() => setIsCartOpen(false)}
                className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold py-3.5 px-6 rounded-2xl text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handlePlaceOrder}
                disabled={orderSubmitting}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-sky-500 hover:opacity-90 active:scale-[0.97] transition-all text-slate-950 font-black py-3.5 px-6 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 cursor-pointer"
              >
                <ChefHat className="w-4 h-4 animate-bounce" />
                <span>{t("place_order")}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hover Assistance call buzzer select modal */}
      {isWaiterModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[32px] p-6 shadow-2xl border border-slate-100 text-center relative overflow-hidden">
            <button 
              onClick={() => setIsWaiterModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <Bell className="w-12 h-12 text-emerald-500 mx-auto animate-bounce mb-3" />
            <h3 className="font-extrabold text-lg text-slate-900">How can we serve you?</h3>
            <p className="text-xs text-slate-400 font-medium">Select an request, staff receives alert immediately.</p>

            {/* Assistance Choices */}
            <div className="grid grid-cols-2 gap-2 mt-6">
              {[
                { label: "Water/पानी", type: "Need Water" },
                { label: "Assistance/मदत", type: "Need Assistance" },
                { label: "Spelt Plates/प्लेट", type: "Need Extra Plates" },
                { label: "Tissue/टिशू", type: "Need Tissue" },
                { label: "Call Waiter/वेटर", type: "Call Waiter" },
                { label: "Get Bill/बिल", type: "Need Bill" }
              ].map((act) => (
                <button
                  key={act.type}
                  onClick={() => {
                    onCallWaiter(act.type as WaiterCall["type"]);
                    setWaiterCallStatus(`Sent: Table request "${act.type}" issued! Standard staff notification sent.`);
                    setTimeout(() => {
                      setIsWaiterModalOpen(false);
                      setWaiterCallStatus(null);
                    }, 1200);
                  }}
                  className="bg-slate-50 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-200 py-3 rounded-2xl text-xs font-bold transition-all text-slate-800 hover:text-emerald-800 cursor-pointer text-left px-3 block"
                >
                  🛎️ {act.label}
                </button>
              ))}
            </div>

            {waiterCallStatus && (
              <div className="mt-4 p-2 bg-emerald-50 text-emerald-800 rounded-xl text-[11px] font-semibold border border-emerald-100">
                {waiterCallStatus}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
