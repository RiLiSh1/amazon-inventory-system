export interface Product {
  id: string;
  asin: string;
  sku: string;
  title: string;
  brand: string | null;
  category: string | null;
  price: number | null;
  imageUrl: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductInput {
  asin: string;
  sku: string;
  title: string;
  brand?: string;
  category?: string;
  price?: number;
  imageUrl?: string;
}

export interface UpdateProductInput {
  title?: string;
  brand?: string;
  category?: string;
  price?: number;
  imageUrl?: string;
  status?: string;
}
