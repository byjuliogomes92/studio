
import type { PageComponent } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { ImageInput } from "./image-input";
import { produce } from "immer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SpacingSettings } from "./spacing-settings";

interface ComponentSettingsProps {
  component: PageComponent;
  onPropChange: (prop: string, value: any) => void;
  onSubPropChange: (prop: string, subProp: string, value: any) => void;
}

export function ColumnsSettings({ component, onPropChange, onSubPropChange }: ComponentSettingsProps) {
    const { props } = component;
    const styles = props.styles || {};
    const columnStyles = props.columnStyles || [];

    const handleColumnStyleChange = (index: number, prop: string, value: any) => {
        const newColumnStyles = produce(columnStyles, (draft: any[]) => {
            if (!draft[index]) {
                draft[index] = {};
            }
            draft[index][prop] = value;
        });
        onPropChange('columnStyles', newColumnStyles);
    };

    const columnCount = props.columnCount || 2;

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="column-count">Número de Colunas</Label>
                <Input id="column-count" type="number" min="1" max="6" value={columnCount} onChange={e => onPropChange('columnCount', parseInt(e.target.value, 10) || 1)} />
            </div>
            
            <Separator />

            <Accordion type="multiple" className="w-full">
                {Array.from({ length: columnCount }).map((_, index) => (
                    <AccordionItem key={index} value={`column-${index + 1}`}>
                        <AccordionTrigger>Coluna {index + 1}</AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-4 p-2">
                                <div className="space-y-2">
                                    <Label>Cor de Fundo</Label>
                                    <Input 
                                        type="color" 
                                        value={columnStyles[index]?.backgroundColor || '#ffffff'} 
                                        onChange={(e) => handleColumnStyleChange(index, 'backgroundColor', e.target.value)} 
                                        className="p-1 h-10 w-full"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Alinhamento Vertical dos Itens</Label>
                                    <Select 
                                        value={columnStyles[index]?.justifyContent || 'flex-start'} 
                                        onValueChange={(value) => handleColumnStyleChange(index, 'justifyContent', value)}
                                    >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="flex-start">Início (Padrão)</SelectItem>
                                            <SelectItem value="center">Centro</SelectItem>
                                            <SelectItem value="flex-end">Fim</SelectItem>
                                            <SelectItem value="stretch">Esticado</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Raio da Borda (Cantos)</Label>
                                    <Input 
                                        value={columnStyles[index]?.borderRadius || ''} 
                                        onChange={(e) => handleColumnStyleChange(index, 'borderRadius', e.target.value)} 
                                        placeholder="Ex: 8px ou 0.5rem"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Espaçamento Interno (Padding)</Label>
                                    <Input 
                                        value={columnStyles[index]?.padding || ''} 
                                        onChange={(e) => handleColumnStyleChange(index, 'padding', e.target.value)} 
                                        placeholder="Ex: 1rem ou 16px"
                                    />
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
}
