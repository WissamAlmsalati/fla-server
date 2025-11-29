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

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

interface OrderDistributionChartProps {
  data: Record<string, number>;
  type: "country" | "status";
}

export function OrderDistributionChart({ data, type }: OrderDistributionChartProps) {
  const chartData = Object.entries(data).map(([key, value], index) => ({
    name: formatLabel(key, type),
    value,
    fill: COLORS[index % COLORS.length],
  }));

  const totalOrders = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.value, 0);
  }, [chartData]);

  const chartConfig = chartData.reduce((acc, item, index) => {
    acc[item.name] = {
      label: item.name,
      color: COLORS[index % COLORS.length],
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
      china: "الصين",
      usa: "أمريكا",
      turkey: "تركيا",
      dubai: "دبي",
      UNKNOWN: "غير محدد",
    };
    return countryMap[key] || key;
  } else {
    const statusMap: Record<string, string> = {
      pending: "قيد الانتظار",
      confirmed: "مؤكد",
      arrived_to_china: "وصل للصين",
      shipped_from_china: "شُحن من الصين",
      arrived_libya: "وصل ليبيا",
      ready_for_delivery: "جاهز للتسليم",
      delivered: "تم التسليم",
      cancelled: "ملغي",
    };
    return statusMap[key] || key;
  }
}
