
import type { PageComponent } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { produce } from "immer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, ClipboardPaste } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface ComponentSettingsProps {
  component: PageComponent;
  onPropChange: (prop: string, value: any) => void;
  onSubPropChange: (prop: string, subProp: string, value: any) => void;
}

export function ColumnsSettings({ component, onPropChange, onSubPropChange }: ComponentSettingsProps) {
    const { props } = component;
    const styles = props.styles || {};
    const columnStyles = props.columnStyles || [];
    const [copiedStyle, setCopiedStyle] = useState<any | null>(null);

    const handleStyleChange = (prop: string, value: any) => {
        onSubPropChange('styles', prop, value);
    }
    
    const handleColumnStyleChange = (index: number, prop: string, value: any) => {
        const newColumnStyles = produce(columnStyles, (draft: any[]) => {
            if (!draft[index]) {
                draft[index] = {};
            }
            draft[index][prop] = value;
        });
        onPropChange('columnStyles', newColumnStyles);
    };

    const handlePasteStyle = (index: number) => {
        if (!copiedStyle) return;
        const newColumnStyles = produce(columnStyles, (draft: any[]) => {
            draft[index] = copiedStyle;
        });
        onPropChange('columnStyles', newColumnStyles);
    }

    const columnCount = props.columnCount || 2;
    const columnWidths = props.columnWidths || Array(columnCount).fill(100 / columnCount);

    const handleWidthChange = (index: number, value: number) => {
        const newWidths = [...columnWidths];
        newWidths[index] = value;
        onPropChange('columnWidths', newWidths);
    };


    return (
        <div className="space-y-4">
            <Accordion type="multiple" defaultValue={['layout', 'columns']} className="w-full">
                <AccordionItem value="layout">
                    <AccordionTrigger>Layout Geral</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-2">
                        <div className="space-y-2">
                            <Label htmlFor="column-count">Número de Colunas</Label>
                            <Input id="column-count" type="number" min="1" max="6" value={columnCount} onChange={e => onPropChange('columnCount', parseInt(e.target.value, 10) || 1)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="columns-height">Altura da Seção (Height)</Label>
                            <Input
                                id="columns-height"
                                value={styles.height || ''}
                                onChange={(e) => handleStyleChange('height', e.target.value)}
                                placeholder="Ex: 500px, 100vh, auto"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="column-gap">Espaçamento entre Colunas (Gap)</Label>
                            <Input id="column-gap" value={styles.gap || '20px'} onChange={e => handleStyleChange('gap', e.target.value)} placeholder="Ex: 20px ou 1.5rem" />
                        </div>
                        <div className="space-y-2">
                            <Label>Alinhamento Vertical (Itens)</Label>
                            <Select value={styles.alignItems || 'flex-start'} onValueChange={(value) => handleStyleChange('alignItems', value)}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="flex-start">Início</SelectItem>
                                    <SelectItem value="center">Centro</SelectItem>
                                    <SelectItem value="flex-end">Fim</SelectItem>
                                    <SelectItem value="stretch">Esticado (Padrão)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="columns">
                    <AccordionTrigger>Configurar Colunas Individuais</AccordionTrigger>
                    <AccordionContent>
                        <Accordion type="multiple" className="w-full">
                            {Array.from({ length: columnCount }).map((_, index) => (
                                <AccordionItem key={index} value={`column-${index + 1}`}>
                                    <AccordionTrigger>Coluna {index + 1}</AccordionTrigger>
                                    <AccordionContent className="space-y-4 p-2">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" size="sm" onClick={() => setCopiedStyle(columnStyles[index] || {})}>
                                                <Copy className="h-3 w-3 mr-1.5" />
                                                Copiar Estilo
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={() => handlePasteStyle(index)} disabled={!copiedStyle}>
                                                <ClipboardPaste className="h-3 w-3 mr-1.5" />
                                                Colar Estilo
                                            </Button>
                                        </div>
                                         <div className="space-y-2">
                                            <Label>Largura da Coluna ({Math.round(columnWidths[index] || 0)}%)</Label>
                                            <Slider
                                                value={[columnWidths[index] || 100 / columnCount]}
                                                max={100}
                                                step={1}
                                                onValueChange={([val]) => handleWidthChange(index, val)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Cor de Fundo</Label>
                                            <Input 
                                                type="color" 
                                                value={columnStyles[index]?.backgroundColor || ''} 
                                                onChange={(e) => handleColumnStyleChange(index, 'backgroundColor', e.target.value)} 
                                                className="p-1 h-10 w-full"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Alinhamento Vertical do Conteúdo</Label>
                                            <Select 
                                                value={columnStyles[index]?.justifyContent || 'flex-start'} 
                                                onValueChange={(value) => handleColumnStyleChange(index, 'justifyContent', value)}
                                            >
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="flex-start">Início (Padrão)</SelectItem>
                                                    <SelectItem value="center">Centro</SelectItem>
                                                    <SelectItem value="flex-end">Fim</SelectItem>
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
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
}
