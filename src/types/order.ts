
export type OrderStatusType = 'Pending' | 'In Production' | 'Completed' | 'Shipped' | 'Cancelled';

export interface OrderItem {
  productId: string; // Reference to a Product
  productName: string;
  quantity: number;
  unitPrice: number; // Price at the time of order
  totalPrice: number; // quantity * unitPrice
}

export interface Order {
  id: string; // e.g., ORD-2024-001
  clientId: string; // Reference to a Client
  clientName: string;
  projectId?: string; // Optional: link to a project
  projectName?: string;
  items: OrderItem[];
  totalQuantity: number; // Sum of all item quantities
  subtotal: number; // Sum of all item totalPrices
  discountAmount?: number;
  taxAmount?: number;
  shippingCost?: number;
  grandTotal: number;
  status: OrderStatusType;
  orderDate: string; // ISO date string
  expectedDeliveryDate?: string; // ISO date string
  actualDeliveryDate?: string; // ISO date string
  notes?: string;
}
