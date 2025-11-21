import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/slices/authSlice";
import orderReducer from "@/features/orders/slices/orderSlice";
import shipmentReducer from "@/features/shipments/slices/shipmentSlice";
import messageReducer from "@/features/messaging/slices/messageSlice";
import warehouseReducer from "@/features/warehouses/slices/warehouseSlice";
import userReducer from "@/features/users/slices/userSlice";
import customerReducer from "@/features/customers/slices/customerSlice";
import shippingReducer from "@/features/shipping/slices/shippingSlice";
import transactionReducer from "@/features/transactions/slices/transactionSlice";

export const rootReducer = combineReducers({
  auth: authReducer,
  orders: orderReducer,
  shipments: shipmentReducer,
  messages: messageReducer,
  warehouses: warehouseReducer,
  users: userReducer,
  customers: customerReducer,
  shipping: shippingReducer,
  transactions: transactionReducer,
});
