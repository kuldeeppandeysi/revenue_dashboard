import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MapPin, X } from "lucide-react";

const regionNames = {
  "IN": "India",
  "SEA": "Southeast Asia"
};

export default function RegionalFilter({ onFilterChange, activeFilters = {} }) {
  const [selectedRegions, setSelectedRegions] = useState(activeFilters.regions || []);

  useEffect(() => {
    onFilterChange({
      regions: selectedRegions
    });
  }, [selectedRegions, onFilterChange]);

  const handleRegionToggle = (regionCode) => {
    setSelectedRegions(prev => 
      prev.includes(regionCode) 
        ? prev.filter(r => r !== regionCode)
        : [...prev, regionCode]
    );
  };

  const clearFilters = () => {
    setSelectedRegions([]);
  };

  return (
    <Card className="p-6 bg-gradient-to-r from-white via-navy-50/30 to-white backdrop-blur-xl border-navy-200 shadow-lg">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-navy-600" />
            <h3 className="font-bold text-navy-800">Regional Filters</h3>
          </div>
          {selectedRegions.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters}
              className="text-navy-500 hover:text-navy-700"
            >
              <X className="w-4 h-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>

        <div className="space-y-3">
          <label className="text-xs font-bold text-navy-600 uppercase tracking-wider">
            Regions
          </label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(regionNames).map(([code, name]) => (
              <Button
                key={code}
                variant="outline"
                size="sm"
                className={`transition-all duration-300 ${
                  selectedRegions.includes(code)
                    ? 'bg-light-blue-500 text-white border-light-blue-500 hover:bg-light-blue-600'
                    : 'border-navy-200 text-navy-600 hover:bg-light-blue-50 hover:border-light-blue-300'
                }`}
                onClick={() => handleRegionToggle(code)}
              >
                <MapPin className="w-3 h-3 mr-1" />
                {name}
              </Button>
            ))}
          </div>
        </div>

        {/* Active Filters Display */}
        {selectedRegions.length > 0 && (
          <div className="pt-4 border-t border-navy-200">
            <div className="flex flex-wrap gap-2">
              {selectedRegions.map(region => (
                <Badge
                  key={region}
                  className="flex items-center gap-2 px-3 py-1 bg-light-blue-50 text-light-blue-700 border border-light-blue-200 rounded-lg font-medium"
                >
                  <MapPin className="w-3 h-3" />
                  {regionNames[region]}
                  <button
                    onClick={() => handleRegionToggle(region)}
                    className="ml-1 hover:bg-light-blue-200 rounded-full p-1 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}