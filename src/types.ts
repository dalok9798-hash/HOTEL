export type Category =
  | 'Starters'
  | 'Soups'
  | 'Veg Main Course'
  | 'Non-Veg Main Course'
  | 'Chinese'
  | 'South Indian'
  | 'Biryani'
  | 'Snacks'
  | 'Beverages'
  | 'Desserts'
  | 'Special Combos';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: Category;
  price: number;
  isVeg: boolean;
  isPopular: boolean;
  isChefRecommended: boolean;
  prepTimeMinutes: number;
  imageUrl: string;
  isAvailable: boolean;
}

export type OrderStatus = 'received' | 'preparing' | 'ready' | 'served';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  isVeg: boolean;
}

export interface Order {
  id: string;
  tableNum: number;
  customerName?: string;
  customerPhone?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: OrderStatus;
  specialInstructions?: string;
  createdAt: string; // ISO String
  prepTimeMinutes: number;
  timeRemainingSeconds: number | null;
  timerStartedAt?: string | null; // ISO String
  billingStatus: 'pending' | 'paid';
  paymentMethod?: 'Cash' | 'UPI' | 'GPay' | 'PhonePe' | 'Paytm' | null;
}

export interface WaiterCall {
  id: string;
  tableNum: number;
  type: 'Call Waiter' | 'Need Water' | 'Need Extra Plates' | 'Need Tissue' | 'Need Assistance' | 'Need Bill';
  status: 'pending' | 'resolved';
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  stockPercent: number; // 0 - 100
  unit: string;
  isLowStock: boolean;
}

export interface Reservation {
  id: string;
  name: string;
  phone: string;
  guests: number;
  date: string;
  time: string;
  tableNum: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

export interface Feedback {
  id: string;
  customerName: string;
  foodRating: number; // 1-5
  serviceRating: number; // 1-5
  review: string;
  createdAt: string;
}

export interface LoyaltyAccount {
  phone: string;
  name: string;
  points: number;
}

export type StaffRole = 'admin' | 'staff' | 'kitchen';

export interface ActiveStaffSession {
  role: StaffRole;
  username: string;
  token: string;
}

export type TranslationKey =
  | 'welcome_title'
  | 'welcome_subtitle'
  | 'scan_browse_order'
  | 'call_waiter'
  | 'categories'
  | 'add_to_cart'
  | 'view_cart'
  | 'bill_generated_notif'
  | 'need_water'
  | 'need_plates'
  | 'need_tissue'
  | 'need_assistance'
  | 'need_bill'
  | 'order_placed_success'
  | 'order_status_received'
  | 'order_status_preparing'
  | 'order_status_ready'
  | 'order_status_served'
  | 'gst'
  | 'grand_total'
  | 'confirm_table'
  | 'customer_name'
  | 'mobile_number'
  | 'special_instructions'
  | 'place_order'
  | 'loyalty_program'
  | 'feedback'
  | 'select_lang';
