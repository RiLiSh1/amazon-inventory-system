export interface T4sInboundShipment {
  id: string;
  sellerId: string;
  shipmentId: string;
  shipmentName: string | null;
  shipmentStatus: string | null;
  centerId: string | null;
  estimatedTime: Date | null;
  updateTime: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface T4sInboundShipmentItem {
  id: string;
  shipmentId: string;
  sku: string;
  networkSku: string | null;
  qtyShipped: number;
  qtyReceived: number;
  qtyInCase: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface T4sInboundShipmentQuery {
  sellerId: string;
  shipmentId?: string;
  shipmentStatus?: string;
}
