'use client'

import { useMemo } from 'react'
import type { Disaster } from './disaster-dashboard'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  Label,
  ResponsiveContainer,
  Tooltip,
  Cell,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  ZAxis,
  Legend,
} from 'recharts'

interface DisasterChartsProps {
  disasters: Disaster[]
  selectedCategory: string
}

interface ViewBox {
  cx: number
  cy: number
  innerRadius: number
  outerRadius: number
  startAngle: number
  endAngle: number
  width: number
  height: number
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
      const year = disaster.startYear.toString()
      yearCounts[year] = (yearCounts[year] || 0) + 1
    })

    // Convert to array and sort by year
    return Object.entries(yearCounts)
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => a.year.localeCompare(b.year))
  }, [filteredDisasters])

  // Prepare data for impact by type chart (pie chart)
  const impactData = useMemo(() => {
    const typeImpact: Record<string, { deaths: number; affected: number }> = {}

    // Group by disaster type
    filteredDisasters.forEach((disaster) => {
      const type = disaster.disasterType || 'Unknown'
      if (!typeImpact[type]) {
        typeImpact[type] = { deaths: 0, affected: 0 }
      }
      typeImpact[type].deaths += disaster.totalDeaths
      typeImpact[type].affected += disaster.totalAffected
    })

    // Convert to array and sort by impact
    return Object.entries(typeImpact)
      .map(([type, impact]) => ({
        name: type,
        value: impact.deaths,
        affected: impact.affected,
      }))
      .sort((a, b) => b.value - a.value)
  }, [filteredDisasters])

  // Prepare data for economic impact chart (bar chart)
  const economicData = useMemo(() => {
    const yearlyData: Record<string, { damage: number; aid: number }> = {}

    filteredDisasters.forEach((disaster) => {
      const year = disaster.startYear.toString()
      if (!yearlyData[year]) {
        yearlyData[year] = { damage: 0, aid: 0 }
      }
      yearlyData[year].damage += disaster.totalDamage / 1000 // Convert to millions
      yearlyData[year].aid += disaster.aidContribution / 1000 // Convert to millions
    })

    return Object.entries(yearlyData)
      .map(([year, data]) => ({
        year,
        'Total Damage': Math.round(data.damage),
        'Aid Contribution': Math.round(data.aid),
      }))
      .sort((a, b) => a.year.localeCompare(b.year))
  }, [filteredDisasters])

  // Prepare data for affected population breakdown (stacked bar chart)
  const affectedData = useMemo(() => {
    const yearlyData: Record<
      string,
      { injured: number; homeless: number; affected: number }
    > = {}

    filteredDisasters.forEach((disaster) => {
      const year = disaster.startYear.toString()
      if (!yearlyData[year]) {
        yearlyData[year] = { injured: 0, homeless: 0, affected: 0 }
      }
      yearlyData[year].injured += disaster.injured
      yearlyData[year].homeless += disaster.homeless
      yearlyData[year].affected += disaster.affected
    })

    return Object.entries(yearlyData)
      .map(([year, data]) => ({
        year,
        Injured: data.injured,
        Homeless: data.homeless,
        Affected: data.affected,
      }))
      .sort((a, b) => a.year.localeCompare(b.year))
  }, [filteredDisasters])

  // Prepare data for deaths vs damage scatter plot
  const scatterData = useMemo(() => {
    return filteredDisasters
      .filter((d) => d.totalDeaths > 0 && d.totalDamage > 0)
      .map((d) => ({
        name: d.eventName || d.disasterType,
        deaths: d.totalDeaths,
        damage: d.totalDamage / 1000, // Convert to millions
        type: d.disasterType,
      }))
  }, [filteredDisasters])

  // Calculate totals
  const totalDeaths = useMemo(() => {
    return filteredDisasters.reduce((sum, d) => sum + d.totalDeaths, 0)
  }, [filteredDisasters])

  const totalAffected = useMemo(() => {
    return filteredDisasters.reduce((sum, d) => sum + d.totalAffected, 0)
  }, [filteredDisasters])

  // Custom colors for the charts
  const COLORS = {
    Geophysical: '#FF6B6B', // Red
    Meteorological: '#4ECDC4', // Teal
    Hydrological: '#45B7D1', // Blue
    Climatological: '#96CEB4', // Green
    Biological: '#FFEEAD', // Yellow
    Other: '#6C5B7B', // Purple
    Unknown: '#C06C84', // Pink
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Line Chart for Disaster Frequency */}
      <Card>
        <CardHeader>
          <CardTitle>Frequency Over Time</CardTitle>
          <CardDescription>Number of disasters per year</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={frequencyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="year"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-background/95 p-2 rounded-lg shadow border">
                        <p className="font-medium">{label}</p>
                        <p className="text-sm">{payload[0].value} disasters</p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke={
                  selectedCategory === 'All'
                    ? '#FF6B6B'
                    : COLORS[selectedCategory as keyof typeof COLORS] ||
                      '#FF6B6B'
                }
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Pie Chart for Impact by Type */}
      <Card>
        <CardHeader>
          <CardTitle>Impact by Disaster Type</CardTitle>
          <CardDescription>Deaths by disaster type</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={impactData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
              >
                {impactData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={
                      COLORS[entry.name as keyof typeof COLORS] || COLORS.Other
                    }
                  />
                ))}
                <Label
                  content={({ viewBox }) => {
                    if (!viewBox) return null
                    const { cx = 0, cy = 0 } = viewBox as ViewBox
                    return (
                      <text
                        x={cx}
                        y={cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={cx}
                          y={cy - 10}
                          className="fill-foreground text-2xl font-bold"
                        >
                          {totalDeaths.toLocaleString()}
                        </tspan>
                        <tspan
                          x={cx}
                          y={cy + 10}
                          className="fill-muted-foreground text-sm"
                        >
                          Deaths
                        </tspan>
                      </text>
                    )
                  }}
                />
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="bg-background/95 p-2 rounded-lg shadow border">
                        <p className="font-medium">{data.name}</p>
                        <p className="text-sm">
                          Deaths: {data.value.toLocaleString()}
                        </p>
                        <p className="text-sm">
                          Affected: {data.affected.toLocaleString()}
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">
          Total affected: {totalAffected.toLocaleString()} people
        </CardFooter>
      </Card>

      {/* Economic Impact Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Economic Impact Over Time</CardTitle>
          <CardDescription>
            Total damage and aid contribution (millions USD)
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={economicData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-background/95 p-2 rounded-lg shadow border">
                        <p className="font-medium">{label}</p>
                        {payload.map((entry) => (
                          <p key={entry.name} className="text-sm">
                            {entry.name}: ${(entry.value || 0).toLocaleString()}
                            M
                          </p>
                        ))}
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Legend />
              <Bar dataKey="Total Damage" fill="#FF6B6B" />
              <Bar dataKey="Aid Contribution" fill="#4ECDC4" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Population Impact Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Population Impact Over Time</CardTitle>
          <CardDescription>Breakdown of affected populations</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={affectedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-background/95 p-2 rounded-lg shadow border">
                        <p className="font-medium">{label}</p>
                        {payload.map((entry) => (
                          <p key={entry.name} className="text-sm">
                            {entry.name}: {(entry.value || 0).toLocaleString()}
                          </p>
                        ))}
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Legend />
              <Bar dataKey="Injured" stackId="a" fill="#FF6B6B" />
              <Bar dataKey="Homeless" stackId="a" fill="#4ECDC4" />
              <Bar dataKey="Affected" stackId="a" fill="#45B7D1" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Deaths vs Damage Scatter Plot */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Deaths vs Economic Damage</CardTitle>
          <CardDescription>
            Relationship between fatalities and economic damage
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                dataKey="deaths"
                name="Deaths"
                label={{ value: 'Deaths', position: 'bottom' }}
              />
              <YAxis
                type="number"
                dataKey="damage"
                name="Damage (millions USD)"
                label={{
                  value: 'Damage (millions USD)',
                  angle: -90,
                  position: 'left',
                }}
              />
              <ZAxis range={[50, 400]} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="bg-background/95 p-2 rounded-lg shadow border">
                        <p className="font-medium">{data.name}</p>
                        <p className="text-sm">
                          Deaths: {data.deaths.toLocaleString()}
                        </p>
                        <p className="text-sm">
                          Damage: ${data.damage.toLocaleString()}M
                        </p>
                        <p className="text-sm">Type: {data.type}</p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Scatter
                name="Disasters"
                data={scatterData}
                fill={
                  selectedCategory === 'All'
                    ? '#FF6B6B'
                    : COLORS[selectedCategory as keyof typeof COLORS] ||
                      '#FF6B6B'
                }
              />
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
