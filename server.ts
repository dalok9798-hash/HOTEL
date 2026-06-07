import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory / backup database setup
const DB_FILE = path.join(process.cwd(), "data_store_db.json");

// System states
let MENU: any[] = [];
let ORDERS: any[] = [];
let CALLS: any[] = [];
let INVENTORY: any[] = [];
let RESERVATIONS: any[] = [];
let FEEDBACKS: any[] = [];
let LOYALTY: Record<string, { name: string; points: number }> = {};
let TABLES: any[] = [];

// Seed high-quality initial menu
const initialMenu = [
  // Starters
  {
    id: "m_1",
    name: "Hara Bhara Kabab",
    description: "Crispy fried spinach, green peas, and potato patties scented with royal spices.",
    category: "Starters",
    price: 180,
    isVeg: true,
    isPopular: true,
    isChefRecommended: false,
    prepTimeMinutes: 10,
    imageUrl: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    isAvailable: true
  },
  {
    id: "m_2",
    name: "Paneer Tikka Angare",
    description: "Spicy fire-grilled cottage cheese cubes marinated in rich hung curd and red chilies.",
    category: "Starters",
    price: 240,
    isVeg: true,
    isPopular: false,
    isChefRecommended: true,
    prepTimeMinutes: 12,
    imageUrl: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    isAvailable: true
  },
  // Soups
  {
    id: "m_3",
    name: "Manchow Soup Veg",
    description: "Classic hot and spicy soy-based vegetable broth with crunchy fried noodles.",
    category: "Soups",
    price: 140,
    isVeg: true,
    isPopular: true,
    isChefRecommended: false,
    prepTimeMinutes: 8,
    imageUrl: "https://images.unsplash.com/photo-1547592180-85f173990554?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    isAvailable: true
  },
  {
    id: "m_4",
    name: "Hot & Sour Chicken Soup",
    description: "Familiar fiery broth packed with shredded chicken, mushrooms, and spiced vinegar.",
    category: "Soups",
    price: 160,
    isVeg: false,
    isPopular: false,
    isChefRecommended: false,
    prepTimeMinutes: 8,
    imageUrl: "https://images.unsplash.com/photo-1603105037880-880cd4edfb0d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    isAvailable: true
  },
  // Veg Main Course
  {
    id: "m_5",
    name: "Paneer Butter Masala",
    description: "Rich and creamy charcoal-grilled paneer in soft tomato, cashew, and butter gravy.",
    category: "Veg Main Course",
    price: 220,
    isVeg: true,
    isPopular: true,
    isChefRecommended: true,
    prepTimeMinutes: 15,
    imageUrl: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    isAvailable: true
  },
  {
    id: "m_6",
    name: "Tulsi Special Handi Diwani",
    description: "Our signature mixed vegetables in rich green spinach, herbs, and cashew gravy.",
    category: "Veg Main Course",
    price: 250,
    isVeg: true,
    isPopular: false,
    isChefRecommended: true,
    prepTimeMinutes: 18,
    imageUrl: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    isAvailable: true
  },
  {
    id: "m_7",
    name: "Dal Makhani Bhukhara",
    description: "Slow-cooked black lentils simmered overnight with fresh cream, butter, and raw spices.",
    category: "Veg Main Course",
    price: 190,
    isVeg: true,
    isPopular: true,
    isChefRecommended: false,
    prepTimeMinutes: 15,
    imageUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    isAvailable: true
  },
  // Non Veg Main course
  {
    id: "m_8",
    name: "Butter Chicken Delhi Style",
    description: "Tender tandoori chicken cooked in a rich, buttery tomato gravy with dried fenugreek.",
    category: "Non-Veg Main Course",
    price: 290,
    isVeg: false,
    isPopular: true,
    isChefRecommended: true,
    prepTimeMinutes: 15,
    imageUrl: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    isAvailable: true
  },
  {
    id: "m_9",
    name: "Mutton Rara Handi",
    description: "Succulent mutton pieces cooked with deeply spiced minced lamb and aromatic essences.",
    category: "Non-Veg Main Course",
    price: 360,
    isVeg: false,
    isPopular: false,
    isChefRecommended: true,
    prepTimeMinutes: 20,
    imageUrl: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    isAvailable: true
  },
  // Chinese
  {
    id: "m_10",
    name: "Schezwan Hakka Noodles Veg",
    description: "Wok-tossed noodles with colorful crispy vegetables in house-made fiery Schezwan chutney.",
    category: "Chinese",
    price: 180,
    isVeg: true,
    isPopular: true,
    isChefRecommended: false,
    prepTimeMinutes: 10,
    imageUrl: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    isAvailable: true
  },
  {
    id: "m_11",
    name: "Veg Manchurian Dry",
    description: "Deep-fried premium mixed vegetable balls tossed in sweet, sour, and spicy Manchurian glaze.",
    category: "Chinese",
    price: 170,
    isVeg: true,
    isPopular: false,
    isChefRecommended: false,
    prepTimeMinutes: 10,
    imageUrl: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    isAvailable: true
  },
  // South Indian
  {
    id: "m_12",
    name: "Butter Masala Dosa",
    description: "Golden crispy fermented rice crepe stuffed with spiced mashed potato mash and fresh butter, served with sambar and fresh coconut chutney.",
    category: "South Indian",
    price: 130,
    isVeg: true,
    isPopular: true,
    isChefRecommended: false,
    prepTimeMinutes: 8,
    imageUrl: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    isAvailable: true
  },
  {
    id: "m_13",
    name: "Sambar Vada Combo",
    description: "Fluffy, deep-fried savory lentil donuts soaked in hot tangy vegetable and tamarind lentil stew.",
    category: "South Indian",
    price: 90,
    isVeg: true,
    isPopular: false,
    isChefRecommended: false,
    prepTimeMinutes: 5,
    imageUrl: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    isAvailable: true
  },
  // Biryani
  {
    id: "m_14",
    name: "Dum Handi Veg Biryani",
    description: "Aromatic Basmati rice layered with garden fresh vegetables, saffron, and mint, cooked in clay pot under seal.",
    category: "Biryani",
    price: 210,
    isVeg: true,
    isPopular: true,
    isChefRecommended: true,
    prepTimeMinutes: 20,
    imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    isAvailable: true
  },
  {
    id: "m_15",
    name: "Tulsi Special Chicken Dum Biryani",
    description: "Hyderabadi style long grain basmati rice loaded with perfectly spiced chicken legs cooked on low fire breath.",
    category: "Biryani",
    price: 270,
    isVeg: false,
    isPopular: true,
    isChefRecommended: true,
    prepTimeMinutes: 20,
    imageUrl: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    isAvailable: true
  },
  // Snacks
  {
    id: "m_16",
    name: "Crispy Cheese French Fries",
    description: "Crispy golden dynamic potato fries loaded with liquid cheese dressing and herbs.",
    category: "Snacks",
    price: 110,
    isVeg: true,
    isPopular: false,
    isChefRecommended: false,
    prepTimeMinutes: 5,
    imageUrl: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    isAvailable: true
  },
  // Beverages
  {
    id: "m_17",
    name: "Royal Cold Coffee with Ice Cream",
    description: "Premium smooth espresso extract blended with milk and thick chocolate ice cream scoop.",
    category: "Beverages",
    price: 120,
    isVeg: true,
    isPopular: true,
    isChefRecommended: false,
    prepTimeMinutes: 5,
    imageUrl: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    isAvailable: true
  },
  {
    id: "m_18",
    name: "Fresh Tulsi Lime Mint Mojito",
    description: "In-house signature virgin mocktail packed with sweet fresh lime juice, crushed mint, and holy tulsi leaves.",
    category: "Beverages",
    price: 90,
    isVeg: true,
    isPopular: true,
    isChefRecommended: true,
    prepTimeMinutes: 4,
    imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    isAvailable: true
  },
  // Desserts
  {
    id: "m_19",
    name: "Sizzling Chocolate Brownie",
    description: "Fuming hot sizzling plate bearing gourmet walnut dark chocolate brownie topped with cool vanilla scoop.",
    category: "Desserts",
    price: 180,
    isVeg: true,
    isPopular: true,
    isChefRecommended: true,
    prepTimeMinutes: 8,
    imageUrl: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    isAvailable: true
  },
  // Special Combos
  {
    id: "m_20",
    name: "Premium Royal Veg Thali",
    description: "Paneer butter masala, handi veg, dal makhani, raita, 2 butter tandoori rotis, premium basmati pulav, pickle, and soft Gulab Jamun.",
    category: "Special Combos",
    price: 320,
    isVeg: true,
    isPopular: true,
    isChefRecommended: true,
    prepTimeMinutes: 15,
    imageUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    isAvailable: true
  }
];

// Initial tables (1-100)
const initialTables = Array.from({ length: 15 }, (_, i) => ({
  tableNum: i + 1,
  status: i % 4 === 1 ? "occupied" : i % 5 === 2 ? "reserved" : "available",
  currentOrderId: null
}));

// Initial inventory
const initialInventory = [
  { id: "i_1", name: "Premium Basmati Rice", stockPercent: 85, unit: "kg", isLowStock: false },
  { id: "i_2", name: "Fresh Paneer Dairy", stockPercent: 20, unit: "kg", isLowStock: true },
  { id: "i_3", name: "Spicy Tandoori Masala", stockPercent: 45, unit: "kg", isLowStock: false },
  { id: "i_4", name: "Organic Vegetables Assorted", stockPercent: 15, unit: "kg", isLowStock: true },
  { id: "i_5", name: "Hygienic Whole Chicken", stockPercent: 70, unit: "kg", isLowStock: false },
  { id: "i_6", name: "Milk & Amul Fresh Cream", stockPercent: 60, unit: "liters", isLowStock: false },
  { id: "i_7", name: "Holy Fresh Tulsi Leaves", stockPercent: 95, unit: "stalks", isLowStock: false }
];

// Initial reservations
const initialReservations = [
  {
    id: "res_1",
    name: "Vikram Malhotra",
    phone: "9876543210",
    guests: 4,
    date: "2026-06-07",
    time: "20:00",
    tableNum: 4,
    status: "confirmed",
    createdAt: "2026-06-07T10:00:00.000Z"
  },
  {
    id: "res_2",
    name: "Ananya Deshmukh",
    phone: "8765432109",
    guests: 2,
    date: "2026-06-07",
    time: "19:30",
    tableNum: 8,
    status: "pending",
    createdAt: "2026-06-07T11:15:00.000Z"
  }
];

// Initial Feedbacks
const initialFeedbacks = [
  {
    id: "feed_1",
    customerName: "Rohan Sawant",
    foodRating: 5,
    serviceRating: 5,
    review: "The Paneer Butter Masala was absolutely glorious! The Tulsi Mojito was refreshing. Best QR ordering experience ever.",
    createdAt: "2026-06-07T12:00:00.000Z"
  },
  {
    id: "feed_2",
    customerName: "Sneha Gawas",
    foodRating: 5,
    serviceRating: 4,
    review: "Loved the food! Dum Biryani had excellent basmati aroma and prep details. Very quick response on Call Waiter request.",
    createdAt: "2026-06-07T12:30:00.000Z"
  }
];

// Loads DB from local JSON file if exists
function loadDB() {
  if (fs.existsSync(DB_FILE)) {
    try {
      const parsedData = JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
      MENU = parsedData.MENU || initialMenu;
      ORDERS = parsedData.ORDERS || [];
      CALLS = parsedData.CALLS || [];
      INVENTORY = parsedData.INVENTORY || initialInventory;
      RESERVATIONS = parsedData.RESERVATIONS || initialReservations;
      FEEDBACKS = parsedData.FEEDBACKS || initialFeedbacks;
      LOYALTY = parsedData.LOYALTY || {};
      TABLES = parsedData.TABLES || initialTables;
      console.log("Database successfully recovered from data_store_db.json");
    } catch (e) {
      console.error("Failed to read data_store_db.json file, utilizing default memory state", e);
      initDefaults();
    }
  } else {
    initDefaults();
  }
}

function initDefaults() {
  MENU = JSON.parse(JSON.stringify(initialMenu));
  ORDERS = [];
  CALLS = [];
  INVENTORY = JSON.parse(JSON.stringify(initialInventory));
  RESERVATIONS = JSON.parse(JSON.stringify(initialReservations));
  FEEDBACKS = JSON.parse(JSON.stringify(initialFeedbacks));
  LOYALTY = {
    "9876543210": { name: "Vikram Malhotra", points: 250 }
  };
  TABLES = JSON.parse(JSON.stringify(initialTables));
  saveDB();
}

function saveDB() {
  try {
    fs.writeFileSync(
      DB_FILE,
      JSON.stringify({ MENU, ORDERS, CALLS, INVENTORY, RESERVATIONS, FEEDBACKS, LOYALTY, TABLES }, null, 2),
      "utf-8"
    );
  } catch (e) {
    console.error("Failed to write persistence database file", e);
  }
}

loadDB();

// SSE clients container
let sseClients: express.Response[] = [];

// Send updates to all connected Dashboards in real-time
function broadcastUpdate(type: string, data: any) {
  sseClients.forEach((client) => {
    client.write(`data: ${JSON.stringify({ type, data })}\n\n`);
  });
}

// REST API Routes
// SSE Pipeline endpoint
app.get("/api/updates", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  sseClients.push(res);

  req.on("close", () => {
    sseClients = sseClients.filter((c) => c !== res);
  });
});

// Menu routes
app.get("/api/menu", (req, res) => {
  res.json(MENU);
});

app.post("/api/menu", (req, res) => {
  const newItem = {
    id: "m_" + Date.now(),
    ...req.body,
    isAvailable: true
  };
  MENU.push(newItem);
  saveDB();
  broadcastUpdate("menu_changed", MENU);
  res.status(201).json(newItem);
});

app.put("/api/menu/:id", (req, res) => {
  const { id } = req.params;
  const idx = MENU.findIndex((item) => item.id === id);
  if (idx !== -1) {
    MENU[idx] = { ...MENU[idx], ...req.body };
    saveDB();
    // Auto inventory disabling checking
    broadcastUpdate("menu_changed", MENU);
    res.json(MENU[idx]);
  } else {
    res.status(404).json({ error: "Item not found" });
  }
});

app.delete("/api/menu/:id", (req, res) => {
  const { id } = req.params;
  MENU = MENU.filter((item) => item.id !== id);
  saveDB();
  broadcastUpdate("menu_changed", MENU);
  res.json({ success: true });
});

// Orders routes
app.get("/api/orders", (req, res) => {
  res.json(ORDERS);
});

app.post("/api/orders", (req, res) => {
  const { tableNum, customerName, customerPhone, items, specialInstructions } = req.body;
  if (!tableNum || !items || items.length === 0) {
    return res.status(400).json({ error: "Table number and ordered food items are required" });
  }

  const subtotal = items.reduce((sum: number, it: any) => sum + (it.price * it.quantity), 0);
  const tax = Math.round(subtotal * 0.05); // 5% GST
  const total = subtotal + tax;

  // Maximum preparation time among ordered items
  let estPrepTime = 5; 
  items.forEach((ordItem: any) => {
    const menuItem = MENU.find((m) => m.id === ordItem.id || m.name === ordItem.name);
    if (menuItem && menuItem.prepTimeMinutes > estPrepTime) {
      estPrepTime = menuItem.prepTimeMinutes;
    }
  });

  const newOrder = {
    id: "t_" + (1000 + ORDERS.length + 1),
    tableNum: parseInt(tableNum),
    customerName: customerName || "Guest Table " + tableNum,
    customerPhone: customerPhone || "",
    items,
    subtotal,
    tax,
    total,
    status: "received",
    specialInstructions: specialInstructions || "",
    createdAt: new Date().toISOString(),
    prepTimeMinutes: estPrepTime,
    timeRemainingSeconds: null,
    timerStartedAt: null,
    billingStatus: "pending",
    paymentMethod: null
  };

  ORDERS.push(newOrder);

  // Mark Table Status occupied
  const tableIdx = TABLES.findIndex((t) => t.tableNum === parseInt(tableNum));
  if (tableIdx !== -1) {
    TABLES[tableIdx].status = "occupied";
    TABLES[tableIdx].currentOrderId = newOrder.id;
  } else {
    TABLES.push({
      tableNum: parseInt(tableNum),
      status: "occupied",
      currentOrderId: newOrder.id
    });
  }

  // Handle Loyalty Credit: credit points if phone is provided
  if (customerPhone && customerPhone.length >= 10) {
    const scoredPoints = Math.floor(total * 0.1); // 10% points credit
    if (!LOYALTY[customerPhone]) {
      LOYALTY[customerPhone] = {
        name: customerName || "Member",
        points: scoredPoints
      };
    } else {
      LOYALTY[customerPhone].points += scoredPoints;
    }
  }

  saveDB();
  broadcastUpdate("order_created", newOrder);
  broadcastUpdate("tables_changed", TABLES);

  res.status(201).json({
    success: true,
    order: newOrder,
    whatsappSimulated: `Simulated WhatsApp message sent to +91 ${customerPhone || "N/A"}: 'Hey ${customerName || "Guest"}, your order ${newOrder.id} at Table ${tableNum} for ₹${total} is successfully received and with chef! Track it at /menu?table=${tableNum}&track=${newOrder.id}'`
  });
});

// Update order status (Staff / KDS)
app.put("/api/orders/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // received -> preparing -> ready -> served
  const idx = ORDERS.findIndex((o) => o.id === id);

  if (idx !== -1) {
    ORDERS[idx].status = status;

    if (status === "preparing" && !ORDERS[idx].timerStartedAt) {
      ORDERS[idx].timerStartedAt = new Date().toISOString();
      ORDERS[idx].timeRemainingSeconds = ORDERS[idx].prepTimeMinutes * 60;
    }

    if (status === "served") {
      ORDERS[idx].timeRemainingSeconds = 0;
      // Mark table available once bill paid and served (or we can let staff clear it)
    }

    saveDB();
    broadcastUpdate("order_updated", ORDERS[idx]);
    res.json(ORDERS[idx]);
  } else {
    res.status(404).json({ error: "Order not found" });
  }
});

// Start cooking explicitly
app.post("/api/orders/:id/start-timer", (req, res) => {
  const { id } = req.params;
  const idx = ORDERS.findIndex((o) => o.id === id);

  if (idx !== -1) {
    ORDERS[idx].status = "preparing";
    ORDERS[idx].timerStartedAt = new Date().toISOString();
    ORDERS[idx].timeRemainingSeconds = ORDERS[idx].prepTimeMinutes * 60;
    saveDB();
    broadcastUpdate("order_updated", ORDERS[idx]);
    res.json(ORDERS[idx]);
  } else {
    res.status(404).json({ error: "Order not found" });
  }
});

// Trigger Waiter assistance (Call Waiter action)
app.get("/api/calls", (req, res) => {
  res.json(CALLS);
});

app.post("/api/calls", (req, res) => {
  const { tableNum, type } = req.body;
  if (!tableNum || !type) {
    return res.status(400).json({ error: "Table number and call type are required" });
  }

  const newCall = {
    id: "call_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
    tableNum: parseInt(tableNum),
    type,
    status: "pending",
    createdAt: new Date().toISOString()
  };

  CALLS.push(newCall);
  saveDB();
  broadcastUpdate("call_created", newCall);

  res.status(201).json(newCall);
});

app.put("/api/calls/:id/resolve", (req, res) => {
  const { id } = req.params;
  const idx = CALLS.findIndex((c) => c.id === id);
  if (idx !== -1) {
    CALLS[idx].status = "resolved";
    saveDB();
    broadcastUpdate("call_resolved", CALLS[idx]);
    res.json(CALLS[idx]);
  } else {
    res.status(404).json({ error: "Assistance request not found" });
  }
});

// Bill payments / checkout
app.post("/api/orders/:id/pay", (req, res) => {
  const { id } = req.params;
  const { paymentMethod } = req.body; // UPI, Cash, Paytm, PhonePe, GPay
  const idx = ORDERS.findIndex((o) => o.id === id);

  if (idx !== -1) {
    ORDERS[idx].billingStatus = "paid";
    ORDERS[idx].paymentMethod = paymentMethod || "UPI";

    const tableNum = ORDERS[idx].tableNum;
    const tableIdx = TABLES.findIndex((t) => t.tableNum === tableNum);
    if (tableIdx !== -1) {
      TABLES[tableIdx].status = "available";
      TABLES[tableIdx].currentOrderId = null;
    }

    saveDB();
    broadcastUpdate("order_updated", ORDERS[idx]);
    broadcastUpdate("tables_changed", TABLES);

    res.json({
      success: true,
      order: ORDERS[idx],
      invoicePdfSimulated: true,
      whatsappInvoiceSimulated: `Simulated Invoice WhatsApp sent to ${ORDERS[idx].customerPhone || "Guest"}: 'Thank you! Your bill for order ${id} has been resolved via ${paymentMethod} for ₹${ORDERS[idx].total}. We welcome you always at Tulsi Hotel!'`
    });
  } else {
    res.status(404).json({ error: "Order not found" });
  }
});

// Table Reservations
app.get("/api/reservations", (req, res) => {
  res.json(RESERVATIONS);
});

app.post("/api/reservations", (req, res) => {
  const { name, phone, guests, date, time, tableNum } = req.body;
  if (!name || !phone || !guests || !date || !time) {
    return res.status(400).json({ error: "Missing required reservation guidelines details" });
  }

  const assignedTable = tableNum ? parseInt(tableNum) : (TABLES.find((t) => t.status === "available")?.tableNum || 1);

  const newRes = {
    id: "res_" + Date.now(),
    name,
    phone,
    guests: parseInt(guests),
    date,
    time,
    tableNum: assignedTable,
    status: "pending",
    createdAt: new Date().toISOString()
  };

  RESERVATIONS.push(newRes);

  // Update table layout status to reserved for reservation day
  const tableIdx = TABLES.findIndex((t) => t.tableNum === assignedTable);
  if (tableIdx !== -1) {
    TABLES[tableIdx].status = "reserved";
  }

  saveDB();
  broadcastUpdate("reservation_created", newRes);
  broadcastUpdate("tables_changed", TABLES);

  res.status(201).json({
    success: true,
    reservation: newRes,
    whatsappSimulated: `Simulated WhatsApp: Dear ${name}, your table for ${guests} guests has been reserved for ${date} at ${time}. Table code: ${assignedTable}. Welcome to Tulsi Hotel!`
  });
});

app.put("/api/reservations/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // confirmed, cancelled
  const idx = RESERVATIONS.findIndex((r) => r.id === id);

  if (idx !== -1) {
    RESERVATIONS[idx].status = status;
    saveDB();
    broadcastUpdate("reservation_updated", RESERVATIONS[idx]);
    res.json(RESERVATIONS[idx]);
  } else {
    res.status(404).json({ error: "Reservation not found" });
  }
});

// Inventory stock
app.get("/api/inventory", (req, res) => {
  res.json(INVENTORY);
});

app.put("/api/inventory/:id", (req, res) => {
  const { id } = req.params;
  const { stockPercent } = req.body;
  const idx = INVENTORY.findIndex((i) => i.id === id);

  if (idx !== -1) {
    INVENTORY[idx].stockPercent = stockPercent;
    INVENTORY[idx].isLowStock = stockPercent < 25;

    // Smart logic: If key ingredients are critically low (e.g. 0), disable corresponding items
    if (INVENTORY[idx].name.includes("Paneer") && stockPercent === 0) {
      MENU.forEach((item) => {
        if (item.name.toLowerCase().includes("paneer")) {
          item.isAvailable = false;
        }
      });
      broadcastUpdate("menu_changed", MENU);
    } else if (INVENTORY[idx].name.includes("Paneer") && stockPercent > 0) {
      MENU.forEach((item) => {
        if (item.name.toLowerCase().includes("paneer")) {
          item.isAvailable = true;
        }
      });
      broadcastUpdate("menu_changed", MENU);
    }

    saveDB();
    broadcastUpdate("inventory_changed", INVENTORY);
    res.json(INVENTORY[idx]);
  } else {
    res.status(404).json({ error: "Inventory item not found" });
  }
});

// Loyalty tracking
app.get("/api/loyalty/:phone", (req, res) => {
  const { phone } = req.params;
  const acc = LOYALTY[phone] || { name: "Guest", points: 0 };
  res.json(acc);
});

app.post("/api/loyalty/redeem", (req, res) => {
  const { phone, pointsToRedeem } = req.body;
  if (!phone || !pointsToRedeem) {
    return res.status(400).json({ error: "Phone and redemption points are required" });
  }

  if (LOYALTY[phone] && LOYALTY[phone].points >= pointsToRedeem) {
    LOYALTY[phone].points -= pointsToRedeem;
    saveDB();
    res.json({ success: true, remainingPoints: LOYALTY[phone].points });
  } else {
    res.status(400).json({ error: "Insufficient loyalty points" });
  }
});

// Customer feedback
app.get("/api/feedback", (req, res) => {
  res.json(FEEDBACKS);
});

app.post("/api/feedback", (req, res) => {
  const { customerName, foodRating, serviceRating, review } = req.body;
  if (!foodRating || !serviceRating) {
    return res.status(400).json({ error: "Ratings are mandatory" });
  }

  const newFeedback = {
    id: "feed_" + Date.now(),
    customerName: customerName || "Anonymous Guest",
    foodRating: parseInt(foodRating),
    serviceRating: parseInt(serviceRating),
    review: review || "",
    createdAt: new Date().toISOString()
  };

  FEEDBACKS.push(newFeedback);
  saveDB();
  broadcastUpdate("feedback_created", newFeedback);

  res.status(201).json(newFeedback);
});

// Table management status updates directly
app.put("/api/tables/:tableNum", (req, res) => {
  const tableNum = parseInt(req.params.tableNum);
  const { status } = req.body; // available, occupied, reserved
  const idx = TABLES.findIndex((t) => t.tableNum === tableNum);

  if (idx !== -1) {
    TABLES[idx].status = status;
    if (status === "available") {
      TABLES[idx].currentOrderId = null;
    }
    saveDB();
    broadcastUpdate("tables_changed", TABLES);
    res.json(TABLES[idx]);
  } else {
    const newT = { tableNum, status, currentOrderId: null };
    TABLES.push(newT);
    saveDB();
    broadcastUpdate("tables_changed", TABLES);
    res.json(newT);
  }
});

// AI Recommendation Endpoint using modern Gemini @google/genai SDK on Server
app.post("/api/ai-recommend", async (req, res) => {
  const { cartItems } = req.body; // e.g. [{ name: "Paneer Tikka" }]
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.includes("PLACEHOLDER")) {
    // Elegant fallback AI recommendations
    const itemsList = cartItems || [];
    let recName = "Royal Cold Coffee with Ice Cream";
    let recReason = "Perfect sweetness contrast after seasoned spices!";

    if (itemsList.some((it: any) => it.name.toLowerCase().includes("biryani"))) {
      recName = "Fresh Tulsi Lime Mint Mojito / Dal Makhani";
      recReason = "The cool hint of mint cuts through royal saffron essences beautifully!";
    } else if (itemsList.some((it: any) => it.name.toLowerCase().includes("paneer"))) {
      recName = "Sizzling Chocolate Brownie";
      recReason = "Guests who order savory curry love treating themselves to rich dark warm cocoa mud!";
    }

    return res.json({
      recommendation: {
        name: recName,
        reason: recReason,
        source: "Tulsi Smart Engine"
      }
    });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });

    const cartText = (cartItems || []).map((it: any) => `${it.name} (x${it.quantity})`).join(", ");
    const prompt = `You are the master chef AI sommelier at "Tulsi Hotel", a premier dining experience.
Given the customer's current cart items: [ ${cartText || "None (Just checking starters)"} ].
Analyze their taste preferences (e.g. sweet, spicy, heavy, aromatic) and provide a highly tempting pairing recommendation from this selection of our menu:
- Hara Bhara Kabab
- Paneer Tikka Angare
- Sizzling Chocolate Brownie
- Royal Cold Coffee with Ice Cream
- Fresh Tulsi Lime Mint Mojito
- Dum Handi Veg Biryani
- Dal Makhani Bhukhara

Respond strictly with a JSON object in this format:
{
  "name": "Exact Name of recommended item from list",
  "reason": "Brief, mouth-watering gourmet explanation of why this matches their selection (maximum 18 words)"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            reason: { type: Type.STRING }
          },
          required: ["name", "reason"]
        }
      }
    });

    if (response && response.text) {
      const rec = JSON.parse(response.text.trim());
      return res.json({
        recommendation: {
          name: rec.name,
          reason: rec.reason,
          source: "Gemini AI sommelier"
        }
      });
    } else {
      throw new Error("No text output in response");
    }
  } catch (err: any) {
    console.error("Gemini recommendation error:", err);
    res.json({
      recommendation: {
        name: "Fresh Tulsi Lime Mint Mojito",
        reason: "Our signature digestive drink with holy tulsi leaves to complement your premium feast!",
        source: "Tulsi Gourmet Guide (Fallback)"
      }
    });
  }
});

// Periodic Smart Cooking Timer update background logic (fires every 1 second)
setInterval(() => {
  let changed = false;
  ORDERS.forEach((order) => {
    if (order.status === "preparing" && order.timeRemainingSeconds !== null && order.timeRemainingSeconds > 0) {
      order.timeRemainingSeconds -= 1;
      changed = true;
      if (order.timeRemainingSeconds === 0) {
        order.status = "ready";
        // Send a direct SSE broadcast indicating food is hot & ready!
        broadcastUpdate("order_timeline_ready", order);
      }
    }
  });
  if (changed) {
    saveDB();
    broadcastUpdate("timers_ticked", ORDERS.map(o => ({ id: o.id, timeRemainingSeconds: o.timeRemainingSeconds, status: o.status })));
  }
}, 1000);


// Serve Frontend build and assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Dev environment: mount Vite dev server as middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production environment: serve built files
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n======================================================`);
    console.log(`🍽️  TULSI HOTEL RESTAURANT MANAGEMENT SYSTEM ON PORT ${PORT}`);
    console.log(`🌐 Local Link: http://localhost:${PORT}`);
    console.log(`⚙️  Mime Mode: ${process.env.NODE_ENV === "production" ? "PROD" : "DEV"}`);
    console.log(`======================================================\n`);
  });
}

startServer();
