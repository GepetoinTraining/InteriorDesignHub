
import { Order, OrderItem, OrderStatusType } from '../types/order';

let MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-2024-001',
    clientId: 'client-1',
    clientName: 'Emily Carter',
    projectName: 'Modern Living Room',
    items: [
      { productId: 'prod-1', productName: 'Custom Sofa', quantity: 1, unitPrice: 1500, totalPrice: 1500 },
      { productId: 'prod-2', productName: 'Coffee Table', quantity: 1, unitPrice: 300, totalPrice: 300 },
    ],
    totalQuantity: 2,
    subtotal: 1800,
    grandTotal: 1800,
    status: 'Pending',
    orderDate: new Date(2024, 6, 1).toISOString(), // July 1, 2024
    expectedDeliveryDate: new Date(2024, 7, 1).toISOString(),
  },
  {
    id: 'ORD-2024-002',
    clientId: 'client-2',
    clientName: 'David Lee',
    projectName: 'Office Upgrade',
    items: [
      { productId: 'desk-01', productName: 'Executive Desk', quantity: 1, unitPrice: 800, totalPrice: 800 },
      { productId: 'chair-05', productName: 'Ergonomic Chair', quantity: 6, unitPrice: 150, totalPrice: 900 },
    ],
    totalQuantity: 7,
    subtotal: 1700,
    grandTotal: 1700,
    status: 'In Production',
    orderDate: new Date(2024, 6, 5).toISOString(),
    expectedDeliveryDate: new Date(2024, 7, 15).toISOString(),
  },
  {
    id: 'ORD-2024-003',
    clientId: 'client-3',
    clientName: 'Sophia Clark',
    projectName: 'Bedroom Makeover',
    items: [
      { productId: 'bed-002', productName: 'King Size Bed Frame', quantity: 1, unitPrice: 1200, totalPrice: 1200 },
      { productId: 'mattress-k', productName: 'Luxury King Mattress', quantity: 1, unitPrice: 900, totalPrice: 900 },
    ],
    totalQuantity: 2,
    subtotal: 2100,
    grandTotal: 2100,
    status: 'Completed',
    orderDate: new Date(2024, 5, 10).toISOString(),
    expectedDeliveryDate: new Date(2024, 6, 10).toISOString(),
    actualDeliveryDate: new Date(2024, 6, 8).toISOString(),
  },
    {
    id: 'ORD-2024-004',
    clientId: 'client-4',
    clientName: 'Ethan Miller',
    items: [
      { productId: 'lr-set', productName: 'Living Room Furniture Set', quantity: 3, unitPrice: 1000, totalPrice: 3000 },
    ],
    totalQuantity: 3,
    subtotal: 3000,
    grandTotal: 3000,
    status: 'Shipped',
    orderDate: new Date(2024, 6, 12).toISOString(),
    expectedDeliveryDate: new Date(2024, 7, 5).toISOString(),
  },
  {
    id: 'ORD-2024-005',
    clientId: 'client-5',
    clientName: 'Olivia Brown',
    items: [
      { productId: 'office-d', productName: 'Office Desk', quantity: 1, unitPrice: 250, totalPrice: 250 },
      { productId: 'office-c', productName: 'Office Chair', quantity: 1, unitPrice: 120, totalPrice: 120 },
    ],
    totalQuantity: 2,
    subtotal: 370,
    grandTotal: 370,
    status: 'Pending',
    orderDate: new Date(2024, 6, 18).toISOString(),
    expectedDeliveryDate: new Date(2024, 7, 20).toISOString(),
  },
];

const API_DELAY = 300;

export const fetchOrders = (): Promise<Order[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...MOCK_ORDERS]), API_DELAY);
  });
};

export const fetchOrderById = (id: string): Promise<Order | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const order = MOCK_ORDERS.find(o => o.id === id);
      resolve(order ? { ...order } : undefined);
    }, API_DELAY);
  });
};

export const addOrder = (orderData: Omit<Order, 'id' | 'orderDate'>): Promise<Order> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newOrder: Order = {
        ...orderData,
        id: `ORD-${Date.now()}`,
        orderDate: new Date().toISOString(),
      };
      MOCK_ORDERS.unshift(newOrder);
      resolve({ ...newOrder });
    }, API_DELAY);
  });
};

export const updateOrderStatus = (orderId: string, status: OrderStatusType): Promise<Order | undefined> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const orderIndex = MOCK_ORDERS.findIndex(o => o.id === orderId);
      if (orderIndex !== -1) {
        MOCK_ORDERS[orderIndex].status = status;
        if (status === 'Completed' || status === 'Shipped') {
            MOCK_ORDERS[orderIndex].actualDeliveryDate = new Date().toISOString();
        }
        resolve({ ...MOCK_ORDERS[orderIndex] });
      } else {
        reject(new Error('Order not found for status update.'));
      }
    }, API_DELAY);
  });
};
