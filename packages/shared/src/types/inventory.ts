export interface Inventory {
  id: string;
  productId: string;
  warehouseLocation: string | null;
  quantity: number;
  availableQuantity: number;
  reservedQuantity: number;
  reorderPoint: number;
  reorderQuantity: number;
  lastSyncedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateInventoryInput {
  quantity?: number;
  availableQuantity?: number;
  reservedQuantity?: number;
  reorderPoint?: number;
  reorderQuantity?: number;
  warehouseLocation?: string;
}
