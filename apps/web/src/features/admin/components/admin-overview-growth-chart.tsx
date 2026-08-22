"use client";

import { ArrowTrendingUpIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AdminOverviewGrowthPoint } from "@/features/admin/types/admin-overview";
import { formatAdminChartDate } from "@/features/admin/utils/admin-overview-formatters";
import { formatPersianNumber } from "@/lib/utils/formatters";

type GrowthMetric = "publishedEntries" | "users";

const chartConfig = {
  publishedEntries: {
    label: "مطالب",
    color: "#0F766E",
  },
  users: {
    label: "کاربران",
    color: "#2563EB",
  },
} satisfies ChartConfig;

function AdminOverviewGrowthChart({ data }: { data: AdminOverviewGrowthPoint[] }) {
  const [metric, setMetric] = useState<GrowthMetric>("publishedEntries");

  return (
    <Card className="rounded-xl shadow-[0_2px_10px_rgba(0,0,0,.035)]">
      <CardHeader className="flex-row items-start justify-between gap-4 px-5">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-[16px]">
            <ArrowTrendingUpIcon className="size-5 text-muted-foreground" aria-hidden="true" />
            رشد پلتفرم
          </CardTitle>
          <p className="text-[12px] text-muted-foreground">روند تجمعی ۳۰ روز اخیر</p>
        </div>
        <Tabs
          value={metric}
          onValueChange={(value) => {
            if (value === "publishedEntries" || value === "users") {
              setMetric(value);
            }
          }}
        >
          <TabsList aria-label="انتخاب داده نمودار" className="h-8">
            <TabsTrigger value="publishedEntries" className="px-3 text-[12px]">
              مطالب
            </TabsTrigger>
            <TabsTrigger value="users" className="px-3 text-[12px]">
              کاربران
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="px-2 pb-1 sm:px-5">
        <ChartContainer
          config={chartConfig}
          className="h-[280px] w-full aspect-auto"
          initialDimension={{ width: 720, height: 280 }}
          dir="ltr"
        >
          <AreaChart data={data} margin={{ top: 16, right: 8, bottom: 4, left: 4 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              minTickGap={38}
              tickFormatter={formatAdminChartDate}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={42}
              tickFormatter={(value: number) => formatPersianNumber(value)}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="line"
                  labelFormatter={(label) =>
                    typeof label === "string" ? formatAdminChartDate(label) : label
                  }
                  formatter={(value) => (
                    <span className="font-semibold tabular-nums text-foreground">
                      {formatPersianNumber(Number(value))}
                    </span>
                  )}
                />
              }
            />
            <Area
              key={metric}
              dataKey={metric}
              type="monotone"
              stroke={`var(--color-${metric})`}
              fill={`var(--color-${metric})`}
              fillOpacity={0.1}
              strokeWidth={2.25}
              dot={{ r: 2.5, fill: "var(--background)", strokeWidth: 2 }}
              activeDot={{ r: 4 }}
              isAnimationActive
              animationDuration={260}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export { AdminOverviewGrowthChart };
