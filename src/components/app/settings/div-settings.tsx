
import type { PageComponent, CloudPage } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Slider } from "@/components/ui/slider";
import { ImageInput } from "./image-input";
import { produce } from "immer";
import { ColorInput } from "./color-input";

interface ComponentSettingsProps {
  component: PageComponent;
  onPropChange: (prop: string, value: any) => void;
  onSubPropChange: (prop: string, subProp: string, value: any) => void;
  pageState: CloudPage;
}

function hexToRgba(hex: string, alpha: number): string {
    if (!hex || !/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
        return `rgba(0,0,0,${alpha})`; // fallback
    }
    let c = hex.substring(1).split('');
    if (c.length === 3) {
        c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    const i = parseInt(c.join(''), 16);
    const r = (i >> 16) & 255;
    const g = (i >> 8) & 255;
    const b = i & 255;
    return `rgba(${r},${g},${b},${alpha})`;
}

export function DivSettings({ component, onSubPropChange, onPropChange, pageState }: ComponentSettingsProps) {
    const { props } = component;
    const styles = props.styles || {};
    const layout = props.layout || {};

    const handleStyleChange = (prop: string, value: any) => {
        onSubPropChange('styles', prop, value);
    };
    
    const handleLayoutChange = (prop: string, value: any) => {
        onSubPropChange('layout', prop, value);
    };

    return (
        <div className="space-y-4">
            <Accordion type="multiple" defaultValue={['width-bg', 'layout', 'style']} className="w-full">
                <AccordionItem value="width-bg">
                    <AccordionTrigger>Largura e Fundo</AccordionTrigger>
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
                                onPropChange={(propName, value) => handleStyleChange(propName, value)}
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
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <ColorInput label="Cor Inicial" value={styles.gradientFrom || '#000000'} onChange={value => handleStyleChange('gradientFrom', value)} brand={pageState.brand} />
                                </div>
                                <div className="space-y-2">
                                    <ColorInput label="Cor Final" value={styles.gradientTo || '#434343'} onChange={value => handleStyleChange('gradientTo', value)} brand={pageState.brand} />
                                </div>
                            </div>
                        )}
                         {(styles.backgroundType === 'solid' || !styles.backgroundType) && (
                            <div className="space-y-2">
                                <ColorInput label="Cor de Fundo" value={styles.backgroundColor || '#ffffff'} onChange={value => handleStyleChange('backgroundColor', value)} brand={pageState.brand} />
                            </div>
                        )}
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="layout">
                    <AccordionTrigger>Layout Interno</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-2">
                         <div className="space-y-2">
                            <Label>Direção do Layout (Flex Direction)</Label>
                             <Select value={layout.flexDirection || 'column'} onValueChange={(value) => handleLayoutChange('flexDirection', value)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="column">Vertical</SelectItem>
                                    <SelectItem value="row">Horizontal</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Alinhamento Vertical (Justify)</Label>
                             <Select value={layout.verticalAlign || 'flex-start'} onValueChange={(value) => handleLayoutChange('verticalAlign', value)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="flex-start">Início</SelectItem>
                                    <SelectItem value="center">Centro</SelectItem>
                                    <SelectItem value="flex-end">Fim</SelectItem>
                                    <SelectItem value="space-between">Distribuído</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Alinhamento Horizontal (Align)</Label>
                             <Select value={layout.horizontalAlign || 'stretch'} onValueChange={(value) => handleLayoutChange('horizontalAlign', value)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="stretch">Esticado (Padrão)</SelectItem>
                                    <SelectItem value="flex-start">Esquerda</SelectItem>
                                    <SelectItem value="center">Centro</SelectItem>
                                    <SelectItem value="flex-end">Direita</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Espaçamento entre Itens (Gap)</Label>
                            <Input value={layout.gap || '10px'} onChange={e => handleLayoutChange('gap', e.target.value)} placeholder="Ex: 10px ou 1rem"/>
                        </div>
                    </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="style">
                    <AccordionTrigger>Estilo da Seção</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-2">
                         <div className="space-y-2">
                            <Label>Raio da Borda (Cantos)</Label>
                            <Input value={styles.borderRadius || ''} onChange={e => handleStyleChange('borderRadius', e.target.value)} placeholder="Ex: 8px ou 0.5rem"/>
                        </div>
                        <div className="space-y-2">
                            <Label>Borda</Label>
                            <Input value={styles.border || ''} onChange={e => handleStyleChange('border', e.target.value)} placeholder="Ex: 1px solid #000"/>
                        </div>
                         <div className="space-y-2">
                            <Label>Sombra (Box Shadow)</Label>
                            <Input value={styles.boxShadow || ''} onChange={e => handleStyleChange('boxShadow', e.target.value)} placeholder="Ex: 0px 4px 12px rgba(0,0,0,0.1)"/>
                        </div>
                    </AccordionContent>
                 </AccordionItem>
                 <AccordionItem value="advanced">
                    <AccordionTrigger>Avançado</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-2">
                        <div className="space-y-2">
                            <Label>ID do Elemento</Label>
                            <Input value={props.idOverride || ''} onChange={e => onPropChange('idOverride', e.target.value)} placeholder="ID único para âncoras"/>
                        </div>
                        <div className="space-y-2">
                            <Label>Classes CSS Customizadas</Label>
                            <Input value={props.customClasses || ''} onChange={e => onPropChange('customClasses', e.target.value)} placeholder="classe-1 classe-2"/>
                        </div>
                    </AccordionContent>
                 </AccordionItem>
            </Accordion>
        </div>
    );
}
