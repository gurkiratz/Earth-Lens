'use client'

import { CardFooter } from '@/components/ui/card'

import { useMemo } from 'react'
import type { Disaster } from './disaster-dashboard'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import {
  XAxis,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  Label,
} from 'recharts'

interface DisasterChartsProps {
  disasters: Disaster[]
  selectedCategory: string
}

export default function DisasterCharts({
  disasters,
  selectedCategory,
}: DisasterChartsProps) {
  // Filter disasters based on category if one is selected
  const filteredDisasters =
    selectedCategory === 'All'
      ? disasters
      : disasters.filter((d) => d.disasterType === selectedCategory)

  // Prepare data for frequency over time chart (line chart)
  const frequencyData = useMemo(() => {
    const yearCounts: Record<string, number> = {}

    // Group disasters by year
    filteredDisasters.forEach((disaster) => {
      try {
        const date = new Date(disaster.date)
        if (!isNaN(date.getTime())) {
          const year = date.getFullYear().toString()
          yearCounts[year] = (yearCounts[year] || 0) + 1
        }
      } catch (e) {
        // Skip invalid dates
      }
    })

    // Convert to array and sort by year
    return Object.entries(yearCounts)
      .map(([year, count]) => ({ month: year, desktop: count }))
      .sort((a, b) => a.month.localeCompare(b.month))
  }, [filteredDisasters])
  console.log('Frequency Data:', frequencyData)

  // Prepare data for impact by type chart (pie chart)
  const impactData = useMemo(() => {
    const typeImpact: Record<string, number> = {}

    // Group deaths by disaster type
    filteredDisasters.forEach((disaster) => {
      const type = disaster.disasterType || 'Unknown'
      if (!typeImpact[type]) {
        typeImpact[type] = 0
      }

      typeImpact[type] += disaster.deaths
    })

    // Convert to array and sort by impact
    return Object.entries(typeImpact)
      .map(([type, deaths]) => ({
        browser: type,
        visitors: deaths,
        fill: `var(--color-${type.toLowerCase().replace(/\s+/g, '-')})`,
      }))
      .sort((a, b) => b.visitors - a.visitors)
      .slice(0, 5) // Take top 5 for readability
  }, [filteredDisasters])
  console.log('Impact Data:', impactData)

  // Calculate total deaths for pie chart center
  const totalDeaths = useMemo(() => {
    return filteredDisasters.reduce((sum, d) => sum + d.deaths, 0)
  }, [filteredDisasters])

  // Chart configs
  const lineChartConfig = {
    desktop: {
      label: 'Frequency',
      color: 'hsl(var(--chart-1))',
    },
  }

  const pieChartConfig = {
    visitors: {
      label: 'Deaths',
    },
    ...impactData.reduce((acc, curr) => {
      const key = curr.browser.toLowerCase().replace(/\s+/g, '-')
      acc[key] = {
        label: curr.browser,
        color: 'hsl(var(--chart-' + ((Object.keys(acc).length % 5) + 1) + '))',
      }
      return acc
    }, {} as Record<string, { label: string; color: string }>),
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Line Chart for Disaster Frequency */}
      <Card>
        <CardHeader>
          <CardTitle>Frequency of Disasters Over Time</CardTitle>
          <CardDescription>Number of disasters per year</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={lineChartConfig}>
            <LineChart
              accessibilityLayer
              data={frequencyData}
              margin={{
                left: 12,
                right: 12,
                top: 20,
                bottom: 20,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Line
                dataKey="desktop"
                type="natural"
                stroke="var(--color-desktop)"
                strokeWidth={2}
                dot={{
                  fill: 'var(--color-desktop)',
                }}
                activeDot={{
                  r: 6,
                }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Pie Chart for Disaster Impact */}
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>Disaster Impact by Type</CardTitle>
          <CardDescription>Fatalities by disaster type</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <ChartContainer
            config={pieChartConfig}
            className="mx-auto aspect-square max-h-[300px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={impactData}
                dataKey="visitors"
                nameKey="browser"
                innerRadius={60}
                strokeWidth={5}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
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
                            {totalDeaths.toLocaleString()}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground"
                          >
                            Deaths
                          </tspan>
                        </text>
                      )
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col gap-2 text-sm">
          <div className="leading-none text-muted-foreground">
            Showing total fatalities by disaster type
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
