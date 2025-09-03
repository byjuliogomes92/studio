
import type { PageComponent } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { DebouncedTextInput } from "./debounced-text-input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface ComponentSettingsProps {
  component: PageComponent;
  onPropChange: (prop: string, value: any) => void;
}

export function MapSettings({ component, onPropChange }: ComponentSettingsProps) {
    const { props } = component;
    return (
        <div className="space-y-2">
            <div className="flex items-center gap-1.5">
                <Label htmlFor="map-embed-url">URL de Incorporação do Google Maps</Label>
                <Tooltip>
                    <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground"/></TooltipTrigger>
                    <TooltipContent>
                        <p className="max-w-xs">
                            No Google Maps, encontre um local, clique em "Compartilhar", depois em "Incorporar um mapa" e copie a URL que está dentro do atributo `src` do iframe.
                        </p>
                    </TooltipContent>
                </Tooltip>
            </div>
            <DebouncedTextInput
                id="map-embed-url"
                value={props.embedUrl || ""}
                onBlur={(value: any) => onPropChange("embedUrl", value)}
                rows={5}
                placeholder='Cole aqui a URL do atributo "src" do iframe de incorporação do Google Maps'
            />
        </div>
    );
}
