
import { Product, ProductCategory } from '../types/product';

let MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Elegant Velvet Armchair',
    sku: 'FURN-CHR-001',
    category: 'Furniture',
    price: 499.99,
    buyingPrice: 250,
    productionCost: 200,
    stockLevel: 15,
    supplierName: 'Luxury Furnishings Co.',
    description: 'A luxurious velvet armchair with golden legs, perfect for a modern living room. Upholstered in high-quality stain-resistant velvet.',
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YXJtY2hhaXJ8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60',
    images: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YXJtY2hhaXJ8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1567016432779-094069c58ea6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8YXJtY2hhaXJ8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=80'
    ],
    dimensions: { length: 80, width: 75, height: 90, unit: 'cm' },
    weight: { value: 20, unit: 'kg' },
    material: 'Velvet, Metal',
    color: 'Emerald Green',
    isVisible: true,
    tags: ['living room', 'armchair', 'velvet', 'modern', 'luxury'],
    dateAdded: new Date(2023, 0, 15, 10, 0, 0).toISOString(),
    lastUpdated: new Date(2024, 4, 1, 10, 0, 0).toISOString(),
  },
  {
    id: 'prod-2',
    name: 'Minimalist Oak Coffee Table',
    sku: 'FURN-TBL-002',
    category: 'Furniture',
    price: 299.00,
    buyingPrice: 120,
    stockLevel: 8, // Low stock example
    supplierName: 'Nordic Designs',
    description: 'A sleek coffee table made from solid oak, featuring clean lines and a minimalist aesthetic. Perfect for contemporary spaces.',
    imageUrl: 'https://images.unsplash.com/photo-1611219479030-645460f59932?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Y29mZmVlJTIwdGFibGV8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60',
    isVisible: true,
    tags: ['living room', 'coffee table', 'oak', 'minimalist', 'scandinavian'],
    dateAdded: new Date(2023, 1, 20, 11, 30, 0).toISOString(),
    lastUpdated: new Date(2024, 4, 15, 11, 30, 0).toISOString(),
  },
  {
    id: 'prod-3',
    name: 'Abstract Canvas Wall Art',
    sku: 'DECO-ART-003',
    category: 'Decor',
    price: 120.50,
    stockLevel: 0, 
    description: 'Vibrant abstract canvas print to add a pop of color to any space. Hand-painted details.',
    imageUrl: 'https://images.unsplash.com/photo-1501781039149-9f9a96931037?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGFic3RyYWN0JTIwYXJ0fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60',
    isVisible: true,
    tags: ['wall art', 'abstract', 'canvas', 'colorful', 'decor'],
    dateAdded: new Date(2023, 2, 10, 14, 0, 0).toISOString(),
    lastUpdated: new Date(2024, 3, 10, 14, 0, 0).toISOString(),
  },
   {
    id: 'prod-4',
    name: 'Linen Throw Pillow Set',
    sku: 'TEXT-PIL-004',
    category: 'Textiles',
    price: 75.00,
    stockLevel: 30,
    supplierName: 'Comfort Textiles',
    description: 'Set of two linen throw pillows, available in multiple colors. Includes plush feather inserts.',
    imageUrl: 'https://images.unsplash.com/photo-1588058365548-681ff5679c73?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dGhyb3clMjBwaWxsb3dzfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60',
    isVisible: false, 
    tags: ['pillow', 'textile', 'linen', 'home decor'],
    dateAdded: new Date(2023, 3, 5, 9, 15, 0).toISOString(),
    lastUpdated: new Date(2024, 2, 5, 9, 15, 0).toISOString(),
  },
  {
    id: 'prod-5',
    name: 'Industrial Style Bookshelf',
    sku: 'FURN-SHF-005',
    category: 'Furniture',
    price: 350.00,
    stockLevel: 18, // Moderate stock
    supplierName: 'Urban Designs',
    description: 'Tall bookshelf with metal frame and rustic wood shelves. Great for industrial or modern interiors.',
    imageUrl: 'https://images.unsplash.com/photo-1594622942050-235c0ac750ae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Ym9va3NoZWxmfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60',
    isVisible: true,
    tags: ['bookshelf', 'industrial', 'storage', 'furniture'],
    dateAdded: new Date(2023, 4, 1, 12, 0, 0).toISOString(),
    lastUpdated: new Date(2024, 4, 20, 12, 0, 0).toISOString(),
  }
];

const API_DELAY = 300;

export const fetchProducts = (): Promise<Product[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...MOCK_PRODUCTS]), API_DELAY);
  });
};

export const fetchProductById = (id: string): Promise<Product | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const product = MOCK_PRODUCTS.find(p => p.id === id);
      resolve(product ? {...product} : undefined);
    }, API_DELAY);
  });
};

export const addProduct = (productData: Omit<Product, 'id' | 'dateAdded' | 'lastUpdated'>): Promise<Product> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newProduct: Product = {
        ...productData,
        id: `prod-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        dateAdded: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      };
      MOCK_PRODUCTS.unshift(newProduct); 
      resolve({...newProduct});
    }, API_DELAY);
  });
};

export const updateProduct = (productId: string, productData: Partial<Omit<Product, 'id' | 'dateAdded' | 'lastUpdated'>>): Promise<Product> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const productIndex = MOCK_PRODUCTS.findIndex(p => p.id === productId);
      if (productIndex !== -1) {
        MOCK_PRODUCTS[productIndex] = {
          ...MOCK_PRODUCTS[productIndex],
          ...productData,
          lastUpdated: new Date().toISOString(),
        };
        resolve({...MOCK_PRODUCTS[productIndex]});
      } else {
        reject(new Error('Product not found for update.'));
      }
    }, API_DELAY);
  });
};

export const deleteProduct = (productId: string): Promise<{ success: boolean; id: string }> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const initialLength = MOCK_PRODUCTS.length;
      MOCK_PRODUCTS = MOCK_PRODUCTS.filter(p => p.id !== productId);
      if (MOCK_PRODUCTS.length < initialLength) {
        resolve({ success: true, id: productId });
      } else {
        reject(new Error('Product not found for deletion.'));
      }
    }, API_DELAY);
  });
};

export const adjustStockLevel = (productId: string, newStockLevel: number): Promise<Product> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const productIndex = MOCK_PRODUCTS.findIndex(p => p.id === productId);
      if (productIndex !== -1) {
        MOCK_PRODUCTS[productIndex].stockLevel = newStockLevel;
        MOCK_PRODUCTS[productIndex].lastUpdated = new Date().toISOString();
        resolve({ ...MOCK_PRODUCTS[productIndex] });
      } else {
        reject(new Error('Product not found for stock adjustment.'));
      }
    }, API_DELAY);
  });
};
