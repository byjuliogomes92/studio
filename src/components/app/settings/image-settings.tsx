
import type { PageComponent } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import { ImageInput } from "./image-input";

interface ComponentSettingsProps {
  component: PageComponent;
  onPropChange: (prop: string, value: any) => void;
}

export function ImageSettings({ component, onPropChange }: ComponentSettingsProps) {
    const { props } = component;
    return (
        <div className="space-y-4">
           <ImageInput 
              label="URL da Imagem"
              value={props.src || ""}
              onPropChange={onPropChange}
              propName="src"
              tooltipText="URL de origem para a imagem."
          />
            <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="image-alt">Texto Alternativo</Label>
                  <Tooltip>
                    <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground"/></TooltipTrigger>
                    <TooltipContent><p>Texto descritivo para acessibilidade.</p></TooltipContent>
                  </Tooltip>
                </div>
                <Input
                    id="image-alt"
                    value={props.alt || ""}
                    onChange={(e) => onPropChange("alt", e.target.value)}
                    placeholder="Texto descritivo para a imagem"
                />
            </div>
             <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="image-width">Largura</Label>
                   <Tooltip>
                    <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground"/></TooltipTrigger>
                    <TooltipContent><p>Ex: 100%, 300px, 50vw. Deixe em branco para o tamanho original.</p></TooltipContent>
                  </Tooltip>
                </div>
                <Input
                    id="image-width"
                    value={props.width || ""}
                    onChange={(e) => onPropChange("width", e.target.value)}
                    placeholder="Ex: 100%"
                />
            </div>
        </div>
    );
}
