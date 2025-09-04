
import type { PageComponent } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { ImageInput } from "./image-input";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface ComponentSettingsProps {
  component: PageComponent;
  onPropChange: (prop: string, value: any) => void;
  onSubPropChange: (prop: string, subProp: string, value: any) => void;
}

export function ImageSettings({ component, onPropChange, onSubPropChange }: ComponentSettingsProps) {
    const { props } = component;
    const styles = props.styles || {};

    const handleStyleChange = (prop: string, value: any) => {
        onSubPropChange('styles', prop, value);
    };

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
            <Separator />
             <div className="space-y-2">
                <Label>Largura</Label>
                 <div className="flex items-center gap-1.5">
                   <Tooltip>
                    <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground"/></TooltipTrigger>
                    <TooltipContent><p>Ex: 100%, 300px, 50vw. Deixe em branco para o tamanho original.</p></TooltipContent>
                  </Tooltip>
                   <Input
                        id="image-width"
                        value={props.width || ""}
                        onChange={(e) => onPropChange("width", e.target.value)}
                        placeholder="Ex: 100%"
                    />
                </div>
            </div>
             <div className="space-y-2">
                <Label>Alinhamento Horizontal</Label>
                <ToggleGroup 
                    type="single" 
                    value={styles.textAlign || 'left'} 
                    onValueChange={(value) => handleStyleChange('textAlign', value)}
                    className="w-full"
                >
                    <ToggleGroupItem value="left" aria-label="Alinhar à esquerda" className="flex-1">
                        <AlignLeft className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="center" aria-label="Centralizar" className="flex-1">
                        <AlignCenter className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="right" aria-label="Alinhar à direita" className="flex-1">
                        <AlignRight className="h-4 w-4" />
                    </ToggleGroupItem>
                </ToggleGroup>
            </div>
        </div>
    );
}
