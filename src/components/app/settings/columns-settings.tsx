
import type { PageComponent, CloudPage } from "@/lib/types";
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
import { Switch } from "@/components/ui/switch";
import { ColorInput } from "./color-input";
import { ImageInput } from "./image-input";
import { GradientEditor } from "./gradient-editor";


interface ComponentSettingsProps {
  component: PageComponent;
  onPropChange: (prop: string, value: any) => void;
  onSubPropChange: (prop: string, subProp: string, value: any) => void;
  pageState: CloudPage;
}

export function ColumnsSettings({ component, onPropChange, onSubPropChange, pageState }: ComponentSettingsProps) {
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
    const columnWidths = props.columnWidths || [];

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
                        <div className="flex items-center justify-between">
                            <Label htmlFor="reverse-on-mobile">Inverter ordem no mobile</Label>
                            <Switch
                                id="reverse-on-mobile"
                                checked={styles.reverseOnMobile || false}
                                onCheckedChange={(checked) => handleStyleChange('reverseOnMobile', checked)}
                            />
                        </div>
                    </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="background">
                    <AccordionTrigger>Fundo</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="div-full-width">Largura Total da Tela</Label>
                            <Switch
                                id="div-full-width"
                                checked={styles.isFullWidth || false}
                                onCheckedChange={(checked) => handleStyleChange('isFullWidth', checked)}
                            />
                        </div>
                         <div className="space-y-2">
                            <Label>Tipo de Fundo</Label>
                            <Select value={styles.backgroundType || 'solid'} onValueChange={(value) => handleStyleChange('backgroundType', value)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="solid">Cor Sólida</SelectItem>
                                    <SelectItem value="gradient">Gradiente</SelectItem>
                                    <SelectItem value="image">Imagem</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {styles.backgroundType === 'image' && (
                           <>
                            <ImageInput 
                                label="URL da Imagem de Fundo"
                                value={styles.backgroundImageUrl || ''}
                                onPropChange={handleStyleChange}
                                propName="backgroundImageUrl"
                                tooltipText="URL para a imagem de fundo da seção."
                            />
                            <div className="flex items-center justify-between">
                                <Label htmlFor="div-overlay-enabled">Habilitar Sobreposição</Label>
                                <Switch
                                    id="div-overlay-enabled"
                                    checked={styles.overlayEnabled || false}
                                    onCheckedChange={(c) => handleStyleChange('overlayEnabled', c)}
                                />
                            </div>
                            {styles.overlayEnabled && (
                                <div className="grid grid-cols-2 gap-4">
                                     <div className="space-y-2">
                                        <ColorInput label="Cor da Sobreposição" value={styles.overlayColor || '#000000'} onChange={value => handleStyleChange('overlayColor', value)} brand={pageState.brand} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Opacidade ({Math.round((styles.overlayOpacity || 0.5) * 100)}%)</Label>
                                        <Slider defaultValue={[styles.overlayOpacity || 0.5]} min={0} max={1} step={0.05} onValueChange={([val]) => handleStyleChange('overlayOpacity', val)} />
                                    </div>
                                </div>
                            )}
                           </>
                        )}
                        {styles.backgroundType === 'gradient' && (
                           <GradientEditor
                                value={styles.gradient}
                                onChange={value => handleStyleChange('gradient', value)}
                           />
                        )}
                         {(styles.backgroundType === 'solid' || !styles.backgroundType) && (
                            <div className="space-y-2">
                                <ColorInput label="Cor de Fundo" value={styles.backgroundColor || '#ffffff'} onChange={value => handleStyleChange('backgroundColor', value)} brand={pageState.brand} />
                            </div>
                        )}
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
                                            <ColorInput 
                                                label=""
                                                value={columnStyles[index]?.backgroundColor || ''} 
                                                onChange={(value) => handleColumnStyleChange(index, 'backgroundColor', value)}
                                                brand={pageState.brand}
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
