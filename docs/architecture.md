# Shipping Management Platform Architecture

## 1. System Overview
- **Platform purpose:** Manage consolidated shipments from China stores (Alibaba/1688/Taobao) through China and Libya warehouses to end customers in Libya.
- **User roles:** Admin, Purchase Officer, China Warehouse Worker, Libya Warehouse Worker, Customer.
- **Core entities:** Orders, Shipments (with consolidation), Warehouses, Customers, Messages.
- **Tech stack:** Next.js 14 App Router + Route Handlers, Prisma ORM, Redux Toolkit + Zustand, JWT auth (access + refresh), Zod validations.

## 2. Feature-Based Folder Structure
```
src/
  app/                     # Pages (App Router), layouts, providers
  api/                     # Shared API route helpers (if needed)
  features/
    auth/
      components/
      hooks/
      api/
      slices/
    orders/
      components/
      hooks/
      api/
      slices/
    shipments/
      components/
      hooks/
      api/
      slices/
    warehouses/
      components/
      hooks/
      api/
      slices/
    messaging/
      components/
      hooks/
      api/
      slices/
  lib/
    auth.ts
    rbac.ts
    pagination.ts
    prisma.ts
    validation.ts
  db/
    prisma/
      schema.prisma
      seed.ts
  hooks/
    useHydrateAuth.ts
  components/
    shared/
  middleware.ts
  redux/
    store.ts
    rootReducer.ts
  utils/
    logger.ts
```
- **Responsibilities:**
  - `features/*/api`: Route handlers for each domain, leveraging Zod validation and RBAC helpers.
  - `features/*/slices`: Redux Toolkit slices for server-driven collections (orders, shipments, messaging, warehouses, auth).
  - `features/*/hooks`: `useOrdersFilters`, `useShipmentModal`, `useMessageThread` bridging UI and API/pagination logic.
  - `components/`: Shared UI primitives; feature components import here for reuse.
  - `lib/`: Cross-cutting helpers for authentication, pagination, logging, DB client.
  - `middleware.ts`: Auth middleware for Next.js App Router and API protection.

## 3. State Management Strategy
- **Redux Toolkit (global server data):**
  - Orders list/details, shipments, messaging threads, warehouse inventories, user/session metadata.
  - Stores pagination cursors, filters, API statuses; supports hydration for SSR/CSR.
  - Enables consistent caching across routes and mobile-aligned endpoints.
- **Zustand (local UI state):**
  - Filter UI (selected status/customer), modal/open/close states, sort direction toggles, shopping-style selections.
  - Polling toggles for live status updates.
  - Keeps frequent UI-only updates out of Redux to prevent unnecessary re-renders.
- **Rationale:** Redux manages expensive, shared server data that benefits from immutability and middleware; Zustand keeps lightweight, component-scoped interactions snappy, minimizing global store churn.

## 4. Authentication & Authorization
- **JWT stack:**
  - Access token (~15m) stored in `httpOnly` cookie header or `Authorization` bearer header for APIs.
  - Refresh token (~7d) stored securely (httpOnly cookie + hashed record in DB) with versioning.
  - `token_version` field on `users` increments on logout/credential change.
- **Middleware (`src/middleware.ts`):**
  - Reads `Authorization` header or cookies; verifies access token.
  - Attaches `req.user` payload (id, role, customerId).
  - Guards API routes via `matchers`.
- **Role-Based Access Control (RBAC):**
  - Helper map ensures `Purchase Officer` cannot manage warehouses; `Customer` limited to own orders/messages; `China Warehouse` handles statuses up to `shipping_to_libya`.
  - Route-level guard e.g., `requireRole(request, ["Admin", "Purchase Officer"])`.
- **Token rotation + blacklisting:**
  - `/api/auth/refresh` verifies refresh JWT, compares hashed token + version stored in `users`.
  - Issues new access + refresh tokens, updates stored version to block reuse (rotate version per refresh).
  - Logout increments `token_version`, invalidating outstanding refresh tokens.

## 5. Backend API Conventions
- **Route organization:** All APIs live under `src/app/api/<feature>/route.ts`.
- **REST practices:** `GET /orders`, `GET /orders/:id`, `POST /orders`, `PATCH /orders/:id/status`, `POST /shipments`, etc.
- **Validation:** Use Zod schemas for query/body; respond `400` with parsed errors. Example request schema for listing orders includes `status`, `customerId`, `limit`, `cursor`.
- **Error handling:** Wrap handler logic in try/catch, return consistent shape `{ status: "error", message, details? }`.
- **Pagination/filtering:** Accept `limit`, `cursor`, `status`, `warehouseId`, `customerId`. Response includes `meta: { nextCursor, total }`.
- **Auth-secured:** Every route uses `requireAuth` helper to verify JWT and RBAC. Mobile and frontend share same endpoints.
- **Reusable for mobile:** Strict REST, consistent JSON payloads, tokens via `Authorization` header.

## 6. Mobile App Integration
- **Token handling:** Mobile stores access & refresh token securely; includes `Authorization: Bearer <access>` header. On `401`, call `/api/auth/refresh` using refresh token, update tokens, retry.
- **Data fetching:** Orders list via `/api/orders?customerId=...`; shipments via `/api/shipments?cursor=...`; messages via `/api/orders/:id/messages`. Responses include pagination metadata for infinite scroll.
- **Push-ready:** API responses include `updatedAt` for background sync; future webhooks can notify mobile to poll for status changes.

## 7. Database Schema (Prisma)
```prisma
enum Role { ADMIN PURCHASE_OFFICER CHINA_WAREHOUSE LIBYA_WAREHOUSE CUSTOMER }
enum OrderStatus { purchased arrived_to_china shipping_to_libya arrived_libya ready_for_pickup delivered }
enum ShipmentStatus { pending_inbound in_transit arrived ready_for_pickup delivered }

model User {
  id             Int             @id @default(autoincrement())
  name           String
  email          String          @unique
  passwordHash   String
  role           Role
  customerId     Int?
  tokenVersion   Int             @default(0)
  messages       OrderMessage[]
  createdAt      DateTime        @default(now())
}

model Customer {
  id       Int     @id @default(autoincrement())
  name     String
  orders   Order[]
  userId   Int?
  user     User?   @relation(fields: [userId], references: [id])
}

model Order {
  id             Int           @id @default(autoincrement())
  trackingNumber String        @unique
  name           String
  usdPrice       Float
  cnyPrice       Float?
  productUrl     String?
  notes          String?
  status         OrderStatus   @default(purchased)
  weight         Float?
  customerId     Int
  customer       Customer      @relation(fields: [customerId], references: [id])
  shipmentItems  ShipmentItem[]
  logs           OrderLog[]
  messages       OrderMessage[]
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt
}

model OrderLog {
  id        Int         @id @default(autoincrement())
  orderId   Int
  status    OrderStatus
  note      String?
  createdAt DateTime    @default(now())
  order     Order       @relation(fields: [orderId], references: [id])
}

model Warehouse {
  id      Int        @id @default(autoincrement())
  name    String
  country String
  fromShipments Shipment[] @relation("FromWarehouse")
  toShipments   Shipment[] @relation("ToWarehouse")
}

model Shipment {
  id               Int            @id @default(autoincrement())
  shipmentId       String         @unique
  weight           Float
  fromWarehouseId  Int
  toWarehouseId    Int
  status           ShipmentStatus @default(pending_inbound)
  items            ShipmentItem[]
  fromWarehouse    Warehouse      @relation("FromWarehouse", fields: [fromWarehouseId], references: [id])
  toWarehouse      Warehouse      @relation("ToWarehouse", fields: [toWarehouseId], references: [id])
}

model ShipmentItem {
  id         Int      @id @default(autoincrement())
  shipmentId Int
  orderId    Int
  shipment   Shipment @relation(fields: [shipmentId], references: [id])
  order      Order    @relation(fields: [orderId], references: [id])
}

model OrderMessage {
  id        Int      @id @default(autoincrement())
  orderId   Int
  authorId  Int
  content   String
  createdAt DateTime @default(now())
  order     Order    @relation(fields: [orderId], references: [id])
  author    User     @relation(fields: [authorId], references: [id])
}
```
- **Relations:**
  - `Customer` 1→N `Order`.
  - `Order` 1→N `OrderLog`, `OrderMessage`.
  - `Order` ↔ `Shipment` via `ShipmentItem` (many-to-many).
  - `Shipment` has two `Warehouse` relations (from/to).
  - `User` ↔ `OrderMessage`; `User` optionally linked to `Customer`.

## 8. Business Rules & Constraints
- **Order workflow enforcement:** Status can only progress: `purchased` → `arrived_to_china` → `shipping_to_libya` → `arrived_libya` → `ready_for_pickup` → `delivered`. Each transition triggers log entry and validation (e.g., weight recorded before moving warehouses).
- **Shipment constraints:** Total weight must equal sum of included orders (tolerance ±0.1 kg). Only Admin/China warehouse can create shipments; Libya warehouse marks arrival.
- **Messaging:** Only Customer + Admin exchange messages per order. Purchase Officer/warehouse can view but not send. Enforce rate limits (e.g., 1 message/30s) to avoid spam.
- **Security:** All APIs require valid JWT. Role check done via shared helper. Prisma transactions wrap multi-step operations (shipment creation + order updates).
- **Edge cases:** Prevent deleting orders tied to active shipment; when shipment cancelled, orders revert to prior status and new log entries are created; customer data soft delete and message history locked.

## 9. Code Examples

### `/api/orders/route.ts`
```ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { parsePaginationMeta } from "@/lib/pagination";

const querySchema = z.object({
  status: z.nativeEnum(OrderStatus).optional(),
  customerId: z.number().optional(),
  cursor: z.string().optional(),
  limit: z.number().min(10).max(50).default(20),
});

export async function GET(request: Request) {
  const user = await requireAuth(request);
  const query = querySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
  const where = {
    ...(query.status && { status: query.status }),
    ...(user.role !== Role.ADMIN ? { customerId: user.customerId } : {}),
  };

  const orders = await prisma.order.findMany({
    where,
    orderBy: { id: "desc" },
    take: query.limit,
    cursor: query.cursor ? { id: Number(query.cursor) } : undefined,
    include: { customer: true, shipmentItems: { include: { shipment: true } } },
  });

  return NextResponse.json({
    data: orders,
    meta: parsePaginationMeta(orders, query.limit),
  });
}
```

### JWT Middleware (`src/lib/auth.ts`)
```ts
import jwt from "jsonwebtoken";
import { prisma } from "./prisma";

export async function requireAuth(request: Request) {
  const token = request.headers.get("authorization")?.split(" ")[1] ?? "";
  if (!token) throw new Error("Unauthorized");
  const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!);
  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user || user.tokenVersion !== payload.tokenVersion) throw new Error("Token invalid");
  return { ...user, role: payload.role };
}
```

### Redux Slice (`features/orders/slices/orderSlice.ts`)
```ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchOrders } from "@/lib/api";

export const loadOrders = createAsyncThunk("orders/load", async (params) => {
  const response = await fetchOrders(params);
  return response.data;
});

const orderSlice = createSlice({
  name: "orders",
  initialState: { list: [], status: "idle" },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(loadOrders.fulfilled, (state, action) => {
      state.list = action.payload;
      state.status = "succeeded";
    });
  },
});

export default orderSlice.reducer;
```

### Zustand UI Store Example
```ts
import { create } from "zustand";

export const useOrderFilters = create((set) => ({
  status: "all",
  warehouse: null,
  setFilter: (field, value) =>
    set((state) => ({ ...state, [field]: value })),
}));
```

### Prisma Models
(See section 7)

### Utility Helper (Pagination)
```ts
export function parsePaginationMeta(data, limit) {
  return {
    count: data.length,
    nextCursor: data.length === limit ? data[data.length - 1].id : null,
  };
}
```

## 10. System Workflows
- **Order lifecycle:** Purchase Officer creates order → logs added → China warehouse updates to `arrived_to_china` → Admin consolidates shipments → China warehouse triggers `shipping_to_libya` → Libya warehouse updates arrival → Order marked ready → Customer picks up/delivered.
- **Shipment creation:** Admin/China worker selects orders ready for consolidation, validates weight, creates shipment and `ShipmentItem` records, updates related orders statuses in a transaction, notifies both warehouses.
- **Messaging:** Customer sends message via `/api/orders/:id/messages`; Admin receives notifications, responds; stored with author role for audit.

## 11. Security & Edge Cases
- Token rotation ensures refresh reuse blocked via `tokenVersion`.
- All role-critical mutations wrap `requireRole`.
- Customer-only access enforced by checking `customerId`.
- Incomplete shipments cannot be deleted; they must be cancelled (order statuses revert, logs created).
- Messaging limited to Admin/Customer pair per order; other roles read-only.

## 12. Next Steps
1. Scaffold `features/{auth,orders,shipments,warehouses,messaging}` folders with slices, API handlers, and presentational components.
2. Implement Prisma migrations (`prisma migrate`) and seed data for warehouses/customers.
3. Build shared `lib/` helpers (auth, pagination, RBAC) and wire middleware into Next.js.
4. Add integration tests that cover workflow transitions and RBAC enforcement.
