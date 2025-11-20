import { z } from "zod";

export const orderFiltersSchema = z.object({
  status: z.string().optional(),
  customerId: z.coerce.number().optional(),
  limit: z.coerce.number().min(10).max(50).default(20),
  cursor: z.string().optional(),
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
});
