import {
  AlertTriangle,
  Thermometer,
  Filter,
  DollarSign,
  Users,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { Disaster } from './disaster-dashboard'

interface SummaryStatsProps {
  disasters: Disaster[]
  selectedCategory: string
}

export default function SummaryStats({
  disasters,
  selectedCategory,
}: SummaryStatsProps) {
  // Filter disasters based on category if one is selected
  const filteredDisasters =
    selectedCategory === 'All'
      ? disasters
      : disasters.filter((d) => d.disasterType === selectedCategory)

  // Calculate summary statistics
  const totalDisasters = filteredDisasters.length
  const totalDeaths = filteredDisasters.reduce(
    (sum, d) => sum + d.totalDeaths,
    0
  )
  const totalAffected = filteredDisasters.reduce(
    (sum, d) => sum + d.totalAffected,
    0
  )
  const totalInjured = filteredDisasters.reduce((sum, d) => sum + d.injured, 0)
  const totalHomeless = filteredDisasters.reduce(
    (sum, d) => sum + d.homeless,
    0
  )
  const totalDamage = filteredDisasters.reduce(
    (sum, d) => sum + d.totalDamage,
    0
  )
  const totalAid = filteredDisasters.reduce(
    (sum, d) => sum + d.aidContribution,
    0
  )

  // Calculate disaster subgroups distribution
  const subgroupDistribution = filteredDisasters.reduce((acc, disaster) => {
    const subgroup = disaster.disasterSubgroup
    if (subgroup) {
      acc[subgroup] = (acc[subgroup] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  // Get the most common subgroup
  let mostCommonSubgroup = ''
  let maxCount = 0

  Object.entries(subgroupDistribution).forEach(([subgroup, count]) => {
    if (count > maxCount) {
      mostCommonSubgroup = subgroup
      maxCount = count
    }
  })

  const subgroupPercentage =
    totalDisasters > 0 ? ((maxCount / totalDisasters) * 100).toFixed(1) : '0'

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <Filter className="h-5 w-5" />
        {selectedCategory === 'All' ? 'All Disasters' : selectedCategory}
      </h2>

      <div className="grid grid-cols-1 gap-4">
        {/* Disaster Type Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Thermometer className="h-5 w-5 text-orange-500" />
              {subgroupPercentage}%
            </CardTitle>
            <CardDescription>
              {mostCommonSubgroup
                ? `${mostCommonSubgroup} disasters`
                : 'No data available'}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Impact Statistics */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              {totalDeaths.toLocaleString()}
            </CardTitle>
            <CardDescription>Total fatalities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {totalInjured.toLocaleString()} injured
                </p>
                {totalHomeless > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {totalHomeless.toLocaleString()} homeless
                  </p>
                )}
                {totalAffected > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {totalAffected.toLocaleString()} total affected
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />$
                  {(totalDamage / 1000).toFixed(1)}M in damages
                </p>
                {totalAid > 0 && (
                  <p className="text-sm text-muted-foreground">
                    ${(totalAid / 1000).toFixed(1)}M in aid
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
