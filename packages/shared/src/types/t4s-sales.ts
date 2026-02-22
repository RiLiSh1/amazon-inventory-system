export interface T4sSalesData {
  id: string;
  date: Date;
  sellerId: string;
  marketplaceId: string;
  asin: string;
  sku: string;
  quantity: number;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface T4sSalesDataQuery {
  sellerId: string;
  marketplaceId?: string;
  startDate?: string;
  endDate?: string;
  asin?: string;
  sku?: string;
}
