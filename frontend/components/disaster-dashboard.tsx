'use client'

import { useEffect, useState } from 'react'
// @ts-ignore
import Papa from 'papaparse'
import CountrySelector from '@/components/country-selector'
import RegionSelector from '@/components/region-selector'
import SummaryStats from '@/components/summary-stats'
import DisasterCharts from '@/components/disaster-charts'
import { DisasterMap } from '@/components/disaster-map'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export interface Disaster {
  id: string
  disasterNo: string
  disasterSubgroup: string
  disasterType: string
  disasterSubtype: string
  eventName: string
  iso: string
  country: string
  subregion: string
  region: string
  location: string
  origin: string
  associatedTypes: string[]
  aidContribution: number
  magnitude: number
  magnitudeScale: string
  latitude: number
  longitude: number
  startYear: number
  startMonth: number
  startDay: number
  endYear: number
  endMonth: number
  endDay: number
  totalDeaths: number
  injured: number
  affected: number
  homeless: number
  totalAffected: number
  totalDamage: number
}

export default function DisasterDashboard() {
  const [disasters, setDisasters] = useState<Disaster[]>([])
  const [filteredDisasters, setFilteredDisasters] = useState<Disaster[]>([])
  const [countries, setCountries] = useState<string[]>([])
  const [regions, setRegions] = useState<string[]>([])
  const [selectedCountry, setSelectedCountry] = useState<string>('')
  const [selectedRegion, setSelectedRegion] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const extractDisasterType = (comment: string) => {
    const match = comment
      .toLowerCase()
      .match(/(polio|typhoid|dysentery|smallpox|encephalitis)/)
    if (match) {
      return match[0]
    }
    return ''
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch('/public-disasters.csv')
        if (!response.ok) {
          throw new Error('Failed to fetch data')
        }

        const csvText = await response.text()

        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results: any) => {
            const parsedData = results.data
              .filter((item: any) => item['Country'] && item['Start Year'])
              .map((item: any) => {
                return {
                  id: item.DisNo || `disaster-${Math.random()}`,
                  disasterNo: item.DisNo || '',
                  disasterSubgroup: item['Disaster Subgroup'] || '',
                  disasterType: item['Disaster Type'] || '',
                  disasterSubtype: item['Disaster Subtype'] || '',
                  eventName: item['Event Name'] || '',
                  iso: item.ISO || '',
                  country: item.Country || '',
                  subregion: item.Subregion || '',
                  region: item.Region || '',
                  location: item.Location || '',
                  origin: item.Origin || '',
                  associatedTypes: item['Associated Types']
                    ? item['Associated Types'].split('|')
                    : [],
                  aidContribution:
                    parseFloat(item["AID Contribution ('000 US$)"]) || 0,
                  magnitude: parseFloat(item.Magnitude) || 0,
                  magnitudeScale: item['Magnitude Scale'] || '',
                  latitude: parseFloat(item.Latitude) || 0,
                  longitude: parseFloat(item.Longitude) || 0,
                  startYear: parseInt(item['Start Year']) || 0,
                  startMonth: parseInt(item['Start Month']) || 0,
                  startDay: parseInt(item['Start Day']) || 0,
                  endYear: parseInt(item['End Year']) || 0,
                  endMonth: parseInt(item['End Month']) || 0,
                  endDay: parseInt(item['End Day']) || 0,
                  totalDeaths: parseInt(item['Total Deaths']) || 0,
                  injured: parseInt(item['No. Injured']) || 0,
                  affected: parseInt(item['No. Affected']) || 0,
                  homeless: parseInt(item['No. Homeless']) || 0,
                  totalAffected: parseInt(item['Total Affected']) || 0,
                  totalDamage: parseFloat(item["Total Damage ('000 US$)"]) || 0,
                }
              })

            setDisasters(parsedData)

            // Extract unique categories from disaster types
            const uniqueCategories = Array.from(
              new Set(parsedData.map((d: Disaster) => d.disasterType))
            )
              .filter(Boolean)
              .sort() as string[]
            setCategories(uniqueCategories)

            // Extract unique countries
            const uniqueCountries = Array.from(
              new Set(parsedData.map((d: Disaster) => d.country))
            ).sort() as string[]
            setCountries(uniqueCountries)

            if (uniqueCountries.length > 0) {
              setSelectedCountry(uniqueCountries[0])
            }

            setLoading(false)
          },
          error: (error: any) => {
            setError(`Error parsing CSV: ${error.message}`)
            setLoading(false)
          },
        })
      } catch (err) {
        setError(
          `Failed to fetch data: ${
            err instanceof Error ? err.message : String(err)
          }`
        )
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Update regions when country changes
  useEffect(() => {
    if (selectedCountry) {
      const countryDisasters = disasters.filter(
        (d) => d.country === selectedCountry
      )

      const uniqueRegions = Array.from(
        new Set(countryDisasters.map((d) => d.region))
      )
        .filter(Boolean)
        .sort()

      setRegions(uniqueRegions)
      setSelectedRegion('')
    } else {
      setRegions([])
      setSelectedRegion('')
    }
  }, [selectedCountry, disasters])

  // Filter disasters based on selections
  useEffect(() => {
    let filtered = disasters

    if (selectedCountry) {
      filtered = filtered.filter((d) => d.country === selectedCountry)
    }

    if (selectedRegion) {
      filtered = filtered.filter((d) => d.region === selectedRegion)
    }

    setFilteredDisasters(filtered)
  }, [selectedCountry, selectedRegion, disasters])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-destructive/10 p-6 rounded-lg max-w-lg">
          <h2 className="text-xl font-bold text-destructive mb-2">
            Error Loading Data
          </h2>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          Natural Disaster Historical Visualization
        </h1>
        <p className="text-muted-foreground">
          Explore historical natural disasters around the world
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left sidebar */}
        <div className="lg:col-span-3 space-y-4">
          <div className="border rounded-lg p-4 bg-card">
            <h2 className="text-lg font-semibold mb-4">Filter Disasters</h2>
            <CountrySelector
              countries={countries}
              selectedCountry={selectedCountry}
              onSelectCountry={setSelectedCountry}
            />

            <div className="mt-4">
              <RegionSelector
                regions={regions}
                selectedRegion={selectedRegion}
                onSelectRegion={setSelectedRegion}
              />
            </div>
          </div>

          <div className="border rounded-lg p-4 bg-card">
            <SummaryStats
              disasters={filteredDisasters}
              selectedCategory={selectedCategory}
            />
          </div>
        </div>

        {/* Main content */}
        <div className="lg:col-span-9 space-y-6">
          <div className="border rounded-lg p-4 bg-card">
            <Tabs defaultValue="map">
              <TabsList className="mb-4">
                <TabsTrigger value="map">Map View</TabsTrigger>
                <TabsTrigger value="charts">Charts</TabsTrigger>
              </TabsList>

              <TabsContent value="map" className="h-[600px]">
                <DisasterMap
                  disasters={filteredDisasters}
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  categories={categories}
                />
              </TabsContent>

              <TabsContent value="charts">
                <DisasterCharts
                  disasters={filteredDisasters}
                  selectedCategory={selectedCategory}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
