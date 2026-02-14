"use client";

import * as React from "react";
import { Label, Pie, PieChart, Cell } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const COUNTRY_COLORS: Record<string, string> = {
  "CHINA": "#ef4444", // Red
  "china": "#ef4444",
  "USA": "#3b82f6", // Blue
  "usa": "#3b82f6",
  "TURKEY": "#f59e0b", // Amber
  "turkey": "#f59e0b",
  "DUBAI": "#10b981", // Green
  "dubai": "#10b981",
  "UNKNOWN": "#6b7280", // Gray
};

const STATUS_COLORS: Record<string, string> = {
  "purchased": "#8b5cf6", // Purple
  "arrived_to_china": "#ec4899", // Pink
  "shipping_to_libya": "#f59e0b", // Amber
  "arrived_libya": "#3b82f6", // Blue
  "ready_for_pickup": "#10b981", // Green
  "delivered": "#22c55e", // Bright Green
  "canceled": "#ef4444", // Red
  "cancelled": "#ef4444", // Red
};

const FALLBACK_COLORS = [
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#f59e0b", // Amber
  "#3b82f6", // Blue
  "#10b981", // Green
];

interface OrderDistributionChartProps {
  data: Record<string, number>;
  type: "country" | "status";
}

export function OrderDistributionChart({ data, type }: OrderDistributionChartProps) {
  const chartData = Object.entries(data).map(([key, value], index) => {
    const colorMap = type === "country" ? COUNTRY_COLORS : STATUS_COLORS;
    const fill = colorMap[key] || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
    
    return {
      name: formatLabel(key, type),
      value,
      fill,
    };
  });

  const totalOrders = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.value, 0);
  }, [chartData]);

  const chartConfig = chartData.reduce((acc, item, index) => {
    acc[item.name] = {
      label: item.name,
      color: item.fill,
    };
    return acc;
  }, {} as ChartConfig);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>
          {type === "country" ? "التوزيع حسب الدولة" : "التوزيع حسب الحالة"}
        </CardTitle>
        <CardDescription>
          {type === "country" 
            ? "توزيع الطلبات على الدول المختلفة" 
            : "توزيع الطلبات حسب الحالة الحالية"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              outerRadius={100}
              strokeWidth={5}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalOrders.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          إجمالي
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: item.fill }}
              />
              <span className="text-sm text-muted-foreground">
                {item.name}: {item.value}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function formatLabel(key: string, type: "country" | "status"): string {
  if (type === "country") {
    const countryMap: Record<string, string> = {
      CHINA: "الصين",
      china: "الصين",
      USA: "أمريكا",
      usa: "أمريكا",
      TURKEY: "تركيا",
      turkey: "تركيا",
      DUBAI: "دبي",
      dubai: "دبي",
      UNKNOWN: "غير محدد",
    };
    return countryMap[key] || key;
  } else {
    const statusMap: Record<string, string> = {
      purchased: "تم الشراء",
      arrived_to_china: "وصل للصين",
      shipping_to_libya: "قيد الشحن لليبيا",
      arrived_libya: "وصل ليبيا",
      ready_for_pickup: "جاهز للاستلام",
      delivered: "تم التسليم",
      canceled: "ملغي",
      cancelled: "ملغي",
    };
    return statusMap[key] || key;
  }
}
