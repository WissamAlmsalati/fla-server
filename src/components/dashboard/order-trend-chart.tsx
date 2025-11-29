"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

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

const chartConfig = {
  orders: {
    label: "الطلبات",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

interface OrderTrendChartProps {
  data: Array<{ date: string; count: number }>;
}

export function OrderTrendChart({ data }: OrderTrendChartProps) {
  const chartData = data.map((item) => ({
    date: new Date(item.date).toLocaleDateString("ar-LY", {
      month: "short",
      day: "numeric",
    }),
    orders: item.count,
  }));

  const totalOrders = React.useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.count, 0);
  }, [data]);

  const averageOrders = React.useMemo(() => {
    return data.length > 0 ? Math.round(totalOrders / data.length) : 0;
  }, [data, totalOrders]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>اتجاه الطلبات</CardTitle>
        <CardDescription>
          آخر {data.length} أيام - متوسط {averageOrders} طلب يومياً
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="orders" fill="var(--color-orders)" radius={8} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
