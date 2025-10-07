import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function FeatureAdoptionHeatmap({ features = [], accounts = [] }) {
    // This is a simplified simulation. A real implementation would process event data.
    const adoptionData = features.map(feature => ({
        ...feature,
        adoption: Math.random() * 100, // Simulate adoption percentage
        userCount: Math.floor(Math.random() * accounts.length)
    }));

    const getColor = (percentage) => {
        if (percentage > 75) return 'bg-navy-800 text-white';
        if (percentage > 50) return 'bg-navy-600 text-white';
        if (percentage > 25) return 'bg-light-blue-500 text-white';
        if (percentage > 10) return 'bg-light-blue-300 text-navy-800';
        return 'bg-light-blue-100 text-navy-700';
    };

    return (
        <Card className="border-2 border-navy-300 bg-white backdrop-blur-sm shadow-lg">
            <CardHeader>
                <CardTitle className="text-xl font-black text-navy-900">Feature Adoption Heatmap</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-4">
                    {adoptionData.map(feature => (
                        <div key={feature.id} className="group relative">
                            <div className={`p-4 rounded-xl w-40 h-24 flex flex-col justify-between transition-transform group-hover:scale-105 shadow-md border-2 border-navy-300 ${getColor(feature.adoption)}`}>
                                <div className="font-bold text-shadow">{feature.name}</div>
                                <div className="text-2xl font-black text-shadow text-right">
                                    {feature.adoption.toFixed(0)}%
                                </div>
                            </div>
                            <div className="absolute inset-0 bg-navy-900/90 rounded-xl p-3 text-white opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center border-2 border-navy-600">
                                <p className="text-xs font-bold">Category: {feature.category}</p>
                                <p className="text-xs font-bold">Users: {feature.userCount}</p>
                                {feature.is_key_value_event && <Badge className="mt-2 w-fit bg-light-blue-400 text-navy-900 font-bold">Key Event</Badge>}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}