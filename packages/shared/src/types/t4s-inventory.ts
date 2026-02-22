export interface T4sInventoryData {
  id: string;
  sellerId: string;
  marketplaceId: string;
  asin: string;
  sku: string;
  fnsku: string | null;
  type: string | null;
  afnFulfillableQty: number;
  afnReservedQty: number;
  status: string | null;
  updateTime: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface T4sInventoryDataQuery {
  sellerId: string;
  marketplaceId?: string;
  asin?: string;
  sku?: string;
}
