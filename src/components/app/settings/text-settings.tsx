
import type { PageComponent, CloudPage } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { HelpCircle, AlignLeft, AlignCenter, AlignRight, Bold, Wand2, Zap } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DebouncedTextInput } from "./debounced-text-input";
import { AiGenerateTextDialog } from "./ai-generate-text-dialog";
import { ColorInput } from "./color-input";

interface ComponentSettingsProps {
  component: PageComponent;
  onPropChange: (prop: string, value: any) => void;
  onSubPropChange: (prop: string, subProp: string, value: any) => void;
  pageState: CloudPage;
}

function TextStyleSettings({ props, onPropChange, brand }: { props: any, onPropChange: (prop: string, value: any) => void, brand: CloudPage['brand'] }) {
  const styles = props.styles || {};
  
  const handleStyleChange = (prop: string, value: any) => {
    onPropChange('styles', { ...styles, [prop]: value });
  };

  return (
    <div className="space-y-4">
        <div className="space-y-2">
            <Label>Alinhamento</Label>
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
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Tamanho Fonte</Label>
            <Input 
              type="text"
              value={styles.fontSize || ''} 
              onChange={(e) => handleStyleChange('fontSize', e.target.value)}
              placeholder="ex: 16px ou 1em"
            />
          </div>
           <div className="space-y-2">
             <ColorInput
                label="Cor"
                value={styles.color || '#000000'}
                onChange={(value) => handleStyleChange('color', value)}
                brand={brand}
             />
          </div>
        </div>
         <div className="space-y-2">
            <Label>Estilo</Label>
             <ToggleGroup 
                type="single" 
                variant="outline"
                value={styles.fontWeight} 
                onValueChange={(value) => handleStyleChange('fontWeight', value)}
            >
                <ToggleGroupItem value="bold" aria-label="Negrito">
                    <Bold className="h-4 w-4" />
                </ToggleGroupItem>
            </ToggleGroup>
        </div>
    </div>
  );
}

export function TextSettings({ component, onPropChange, pageState }: ComponentSettingsProps) {
    const isParagraph = component.type === 'Paragraph';
    return (
        <div className="space-y-4">
          <div className="space-y-2">
              <div className="flex items-center justify-between gap-1.5">
                <Label htmlFor="text-content">Texto Padrão</Label>
                 <Tooltip>
                      <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground"/></TooltipTrigger>
                      <TooltipContent>
                          <p className="max-w-xs">Este é o texto exibido se o campo de dados conectado não for encontrado. {isParagraph && 'Suporta HTML básico.'}</p>
                      </TooltipContent>
                  </Tooltip>
              </div>
               <div className="relative">
                  <DebouncedTextInput
                      id="text-content"
                      value={component.props.text || ""}
                      onBlur={(value: any) => onPropChange("text", value)}
                      rows={isParagraph ? 8 : 4}
                      className="pr-10"
                  />
                  <AiGenerateTextDialog
                      componentType={component.type}
                      currentText={component.props.text || ""}
                      onTextGenerated={(newText: string) => onPropChange("text", newText)}
                      trigger={
                          <button className="absolute top-2 right-2 h-7 w-7 text-primary hover:bg-accent rounded-md grid place-items-center">
                              <Wand2 className="h-4 w-4" />
                          </button>
                      }
                  />
              </div>
          </div>
          <Separator />
           <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                  <Label htmlFor="data-binding">Conectar a um Campo de Dados</Label>
                  <Tooltip>
                      <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground"/></TooltipTrigger>
                      <TooltipContent>
                          <p className="max-w-xs">Insira o nome da variável AMPScript (sem @ ou %%) para exibir dados dinâmicos. Ex: 'FirstName' para usar `%%=v(@FirstName)=%%`.</p>
                      </TooltipContent>
                  </Tooltip>
              </div>
              <div className="flex items-center gap-2">
                 <Zap className="h-4 w-4 text-muted-foreground" />
                 <Input
                    id="data-binding"
                    value={component.props.dataBinding || ''}
                    onChange={(e) => onPropChange('dataBinding', e.target.value)}
                    placeholder="Ex: FirstName"
                 />
              </div>
          </div>
          <Separator />
          <TextStyleSettings props={component.props} onPropChange={onPropChange} brand={pageState.brand} />
        </div>
      );
}
