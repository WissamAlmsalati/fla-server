import { z } from "zod";

export const orderFiltersSchema = z.object({
  status: z.string().optional(),
  customerId: z.coerce.number().optional(),
  search: z.string().optional(),
  limit: z.coerce.number().min(10).max(1000).default(1000), // Increased max to 1000 for pagination
  cursor: z.string().optional(),
  country: z.string().optional(),
});

export const createOrderSchema = z.object({
  tracking_number: z.string().min(1),
  name: z.string().min(1),
  usd_price: z.number().positive(),
  cny_price: z.number().optional(),
  product_url: z.string().url().optional(),
  notes: z.string().optional(),
  customer_id: z.number(),
  weight: z.number().optional(),
  country: z.string().default("CHINA"),
});

export const updateOrderSchema = z.object({
  status: z.enum(["purchased", "arrived_to_china", "shipping_to_libya", "arrived_libya", "ready_for_pickup", "delivered"]).optional(),
  weight: z.number().optional(),
  tracking_number: z.string().optional(),
  name: z.string().optional(),
  usd_price: z.number().optional(),
  cny_price: z.number().optional(),
  product_url: z.string().url().optional(),
  notes: z.string().optional(),
  shippingRateId: z.number().optional(),
});
