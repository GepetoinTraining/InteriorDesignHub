
export type ProductCategory = 'Furniture' | 'Decor' | 'Lighting' | 'Textiles' | 'Accessories' | 'Kitchenware' | 'Outdoor' | 'Other';

// Define ProductModelType enum
export enum ProductModelType {
  CORTINA = "CORTINA",
  PERSIANA = "PERSIANA",
  PAPEL_DE_PAREDE = "PAPEL_DE_PAREDE",
  SERVICO = "SERVICO",
  OUTRO = "OUTRO",
}

export interface ProductVariation {
  id: string;
  name: string; // e.g., "Color", "Size"
  value: string; // e.g., "Red", "Large"
  skuSuffix?: string;
  priceModifier?: number; // Can be positive or negative
  stockLevel?: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: ProductCategory;
  price: number; // This is the selling price
  buyingPrice?: number; // Cost price for internal use
  productionCost?: number; // For items manufactured in-house
  stockLevel: number;
  supplierName?: string;
  description: string;
  imageUrl?: string; // Main image URL
  images?: string[]; // Array of additional image URLs
  dimensions?: { 
    length?: number;
    width?: number;
    height?: number;
    unit?: 'cm' | 'inch';
  };
  weight?: { 
    value?: number;
    unit?: 'kg' | 'lb';
  };
  material?: string; 
  color?: string; 
  variations?: ProductVariation[]; 
  isVisible?: boolean; 
  tags?: string[]; 
  dateAdded?: string; 
  lastUpdated?: string; 
  pricingCalculation?: 'manual' | 'apply_tenant_markup'; // How selling price is determined
  modelType: ProductModelType; // Added modelType
  preBudgetItemSchemaJson?: any; // Added preBudgetItemSchemaJson, consider a more specific type later
}
