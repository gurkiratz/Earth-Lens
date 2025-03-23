import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  CalendarDays,
  MapPin,
  AlertTriangle,
  Waves,
  Thermometer,
  Users,
  Home,
  DollarSign,
  HeartHandshake,
  Sparkles,
} from 'lucide-react'
import type { Disaster } from './disaster-dashboard'
import { useCompletion } from '@ai-sdk/react'
import { useState } from 'react'

interface DisasterModalProps {
  disaster: Disaster | null
  isOpen: boolean
  onClose: () => void
}

export function DisasterModal({
  disaster,
  isOpen,
  onClose,
}: DisasterModalProps) {
  const [showAiSummary, setShowAiSummary] = useState(false)

  const { complete, completion, isLoading, error } = useCompletion({
    api: '/api/generate',
    streamProtocol: 'text',
  })

  if (!disaster) return null

  const formatDate = (year: number, month: number, day: number) => {
    if (!year) return 'Unknown'
    const date = new Date(year, month - 1, day)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const startDate = formatDate(
    disaster.startYear,
    disaster.startMonth,
    disaster.startDay
  )
  const endDate = formatDate(
    disaster.endYear,
    disaster.endMonth,
    disaster.endDay
  )

  const handleGenerateInsights = async () => {
    const location = disaster.location || disaster.country
    const deaths = disaster.totalDeaths?.toLocaleString() || 0
    const totalAffected = disaster.totalAffected?.toLocaleString() || 0
    const economicImpact = disaster.totalDamage
      ? `$${(disaster.totalDamage / 1000).toLocaleString()}M`
      : 'unknown'

    const prompt = `Generate a concise summary of a ${
      disaster.disasterSubgroup
    } disaster that occurred between ${startDate} and ${endDate} in ${location}. Include key details such as ${deaths} deaths, ${totalAffected} total affected individuals, and an economic impact of ${economicImpact}. Mention the probable cause (${
      disaster.origin || 'unknown'
    }), early warning indicators, and personal and general mitigation strategies for future safety. Do not mention magnitude.`
    console.log('Prompt:', prompt)
    console.log('Disaster Data:', disaster)
    setShowAiSummary(true)
    await complete(prompt)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {disaster.eventName || disaster.disasterType}
            <Badge variant="outline">{disaster.disasterSubgroup}</Badge>
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {disaster.location ||
              `${disaster.country}, ${disaster.subregion}, ${disaster.region}`}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="space-y-6 p-1">
            {/* Date Information */}
            <div className="flex items-start gap-2">
              <CalendarDays className="h-5 w-5 mt-0.5 text-muted-foreground" />
              <div>
                <p className="font-medium">Date</p>
                <p className="text-sm text-muted-foreground">
                  {startDate}{' '}
                  {endDate !== startDate &&
                    endDate !== 'Unknown' &&
                    `- ${endDate}`}
                </p>
              </div>
            </div>

            {/* Disaster Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Impact Statistics */}
              <div className="space-y-2">
                <h3 className="font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  Impact Statistics
                </h3>
                <div className="space-y-1 text-sm">
                  {disaster.totalDeaths > 0 && (
                    <p>Deaths: {disaster.totalDeaths.toLocaleString()}</p>
                  )}
                  {disaster.injured > 0 && (
                    <p>Injured: {disaster.injured.toLocaleString()}</p>
                  )}
                  {disaster.affected > 0 && (
                    <p>Affected: {disaster.affected.toLocaleString()}</p>
                  )}
                  {disaster.homeless > 0 && (
                    <p>Homeless: {disaster.homeless.toLocaleString()}</p>
                  )}
                  {disaster.totalAffected > 0 && (
                    <p>
                      Total Affected: {disaster.totalAffected.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>

              {/* Economic Impact */}
              <div className="space-y-2">
                <h3 className="font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-emerald-500" />
                  Economic Impact
                </h3>
                <div className="space-y-1 text-sm">
                  {disaster.totalDamage > 0 && (
                    <p>
                      Total Damage: $
                      {(disaster.totalDamage / 1000).toLocaleString()}M
                    </p>
                  )}
                  {disaster.aidContribution > 0 && (
                    <p>
                      Aid Contribution: $
                      {(disaster.aidContribution / 1000).toLocaleString()}M
                    </p>
                  )}
                </div>
              </div>

              {/* Disaster Characteristics */}
              <div className="space-y-2">
                <h3 className="font-medium flex items-center gap-2">
                  <Thermometer className="h-4 w-4 text-orange-500" />
                  Characteristics
                </h3>
                <div className="space-y-1 text-sm">
                  <p>Type: {disaster.disasterType}</p>
                  {disaster.disasterSubtype && (
                    <p>Subtype: {disaster.disasterSubtype}</p>
                  )}
                  {disaster.magnitude > 0 && (
                    <p>
                      Magnitude: {disaster.magnitude} {disaster.magnitudeScale}
                    </p>
                  )}
                  {disaster.origin && <p>Origin: {disaster.origin}</p>}
                </div>
              </div>

              {/* Associated Types */}
              {disaster.associatedTypes.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-medium">Associated Types</h3>
                  <div className="flex flex-wrap gap-2">
                    {disaster.associatedTypes.map((type) => (
                      <Badge key={type} variant="secondary">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* AI Summary */}
            {showAiSummary && (
              <div className="space-y-2 border-t pt-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-500" />
                  AI Analysis & Insights
                </h3>
                <div className="text-sm text-muted-foreground">
                  {/* {error ? (
                    <div className="text-red-500">
                      {error.message || 'An error occurred'}
                    </div>
                  ) : completion ? (
                    <div className="whitespace-pre-wrap">{completion}</div>
                  ) : (
                    <div className="text-muted-foreground italic">
                      No insights available yet
                    </div>
                  )} */}
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                      Generating insights...
                    </div>
                  ) : completion ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none max-h-48 overflow-y-auto">
                      {completion}
                    </div>
                  ) : (
                    'No insights available yet'
                  )}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="sm:justify-start">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleGenerateInsights}
            disabled={isLoading}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            {isLoading ? 'Generating...' : 'Generate AI Summary'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
