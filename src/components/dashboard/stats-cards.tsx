"use client";

import { 
  Package, 
  MapPin, 
  CheckCircle, 
  TrendingUp,
  TrendingDown,
  Box,
  Users,
  Warehouse,
  Clock,
  Truck
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardsProps {
  totalOrders: number;
  ordersInChina: number;
  ordersInLibya: number;
  deliveredOrders: number;
  totalUsers?: number;
  totalWarehouses?: number;
  growthPercentage?: number;
  pendingOrders?: number;
  inTransitOrders?: number;
}

export function StatsCards({
  totalOrders,
  ordersInChina,
  ordersInLibya,
  deliveredOrders,
  totalUsers = 0,
  totalWarehouses = 0,
  growthPercentage = 0,
  pendingOrders = 0,
  inTransitOrders = 0,
}: StatsCardsProps) {
  const isPositiveGrowth = growthPercentage >= 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            إجمالي الطلبات
          </CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalOrders}</div>
          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            {isPositiveGrowth ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span className={cn(
              "font-medium",
              isPositiveGrowth ? "text-green-600" : "text-red-600"
            )}>
              {Math.abs(growthPercentage)}%
            </span>
            <span>من الشهر الماضي</span>
          </div>
        </CardContent>
      </Card>

      {/* Orders in China */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            في مخازن الصين
          </CardTitle>
          <Box className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{ordersInChina}</div>
          <p className="text-xs text-muted-foreground">
            بانتظار الشحن للخارج
          </p>
        </CardContent>
      </Card>

      {/* In Transit Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            قيد الشحن
          </CardTitle>
          <Truck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{inTransitOrders}</div>
          <p className="text-xs text-muted-foreground">
            في الطريق إلى الوجهة
          </p>
        </CardContent>
      </Card>

      {/* Orders in Libya */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            في مخازن ليبيا
          </CardTitle>
          <MapPin className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{ordersInLibya}</div>
          <p className="text-xs text-muted-foreground">
            جاهز للاستلام
          </p>
        </CardContent>
      </Card>

      {/* Delivered Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            تم التسليم
          </CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{deliveredOrders}</div>
          <p className="text-xs text-muted-foreground">
            طلبات مكتملة بنجاح
          </p>
        </CardContent>
      </Card>

      {/* Pending Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            قيد المعالجة
          </CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pendingOrders}</div>
          <p className="text-xs text-muted-foreground">
            طلبات جديدة
          </p>
        </CardContent>
      </Card>

      {/* Total Users (Admin Only) */}
      {totalUsers > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              إجمالي المستخدمين
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              مستخدمون نشطون
            </p>
          </CardContent>
        </Card>
      )}

      {/* Total Warehouses - Hidden */}
      {/* <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            المخازن
          </CardTitle>
          <Warehouse className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalWarehouses}</div>
          <p className="text-xs text-muted-foreground">
            مخازن فعالة
          </p>
        </CardContent>
      </Card> */}
    </div>
  );
}
