"use client"

import { Check, ChevronsUpDown } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface RegionSelectorProps {
  regions: string[]
  selectedRegion: string
  onSelectRegion: (region: string) => void
}

export default function RegionSelector({ regions, selectedRegion, onSelectRegion }: RegionSelectorProps) {
  const [open, setOpen] = useState(false)

  if (regions.length === 0) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium">Select a region</label>
        <Button variant="outline" disabled className="w-full justify-between">
          No regions available
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Select a region</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
            {selectedRegion || "All regions"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search region..." />
            <CommandList>
              <CommandEmpty>No region found.</CommandEmpty>
              <CommandGroup className="max-h-60 overflow-y-auto">
                <CommandItem
                  value="all"
                  onSelect={() => {
                    onSelectRegion("")
                    setOpen(false)
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", selectedRegion === "" ? "opacity-100" : "opacity-0")} />
                  All regions
                </CommandItem>
                {regions.map((region) => (
                  <CommandItem
                    key={region}
                    value={region}
                    onSelect={() => {
                      onSelectRegion(region)
                      setOpen(false)
                    }}
                  >
                    <Check className={cn("mr-2 h-4 w-4", selectedRegion === region ? "opacity-100" : "opacity-0")} />
                    {region}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}

