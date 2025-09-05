
"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import type { Brand } from "@/lib/types";

interface ColorInputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    tooltip?: string;
    brand?: Brand | null;
}

export function ColorInput({ label, value, onChange, tooltip, brand }: ColorInputProps) {
    const brandColors = brand?.colors.light
        ? [
            { name: 'Primária', value: brand.colors.light.primary },
            { name: 'Fundo', value: brand.colors.light.background },
            { name: 'Texto', value: brand.colors.light.foreground },
        ]
        : [];
    
    return (
        <div className="space-y-2">
            <div className="flex items-center gap-1.5">
                <Label className="text-xs">{label}</Label>
                {tooltip && (
                    <Tooltip>
                        <TooltipTrigger asChild><HelpCircle className="h-3 w-3 text-muted-foreground"/></TooltipTrigger>
                        <TooltipContent><p>{tooltip}</p></TooltipContent>
                    </Tooltip>
                )}
            </div>
            <div className="relative flex items-center">
                <Input 
                    type="text" 
                    value={value || ''} 
                    onChange={e => onChange(e.target.value)} 
                    className="pl-10 text-xs h-9"
                    placeholder="#RRGGBB"
                />
                <div className="absolute left-1.5 h-6 w-6 rounded-md border" style={{ backgroundColor: value }}>
                     <Input 
                        type="color" 
                        value={value || '#000000'} 
                        onChange={e => onChange(e.target.value)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                </div>
            </div>
            {brand && brandColors.length > 0 && (
                 <div className="flex items-center gap-2 pt-1">
                    <span className="text-xs text-muted-foreground">Marca:</span>
                    {brandColors.map(color => (
                         <Tooltip key={color.name}>
                            <TooltipTrigger asChild>
                                <button
                                    type="button"
                                    className="h-5 w-5 rounded-full border"
                                    style={{ backgroundColor: color.value }}
                                    onClick={() => onChange(color.value)}
                                />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{color.name}</p>
                            </TooltipContent>
                        </Tooltip>
                    ))}
                 </div>
            )}
        </div>
    );
}
