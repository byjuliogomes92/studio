
import type { PageComponent } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ImageInput } from "./image-input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface ComponentSettingsProps {
  component: PageComponent;
  onPropChange: (prop: string, value: any) => void;
  onSubPropChange: (prop: string, subProp: string, value: any) => void;
}

export function DivSettings({ component, onSubPropChange }: ComponentSettingsProps) {
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
            <Accordion type="multiple" defaultValue={['width-bg', 'layout', 'style']}>
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
                                onPropChange={(_, val) => handleStyleChange('backgroundImageUrl', val)}
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
                                        <Label>Cor da Sobreposição</Label>
                                        <Input type="color" value={styles.overlayColor || '#000000'} onChange={e => handleStyleChange('overlayColor', e.target.value)} className="p-1 h-10 w-full"/>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Opacidade</Label>
                                        <Input type="number" min="0" max="1" step="0.1" value={styles.overlayOpacity || 0.5} onChange={e => handleStyleChange('overlayOpacity', parseFloat(e.target.value))}/>
                                    </div>
                                </div>
                            )}
                           </>
                        )}
                        {styles.backgroundType === 'gradient' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Cor Inicial</Label>
                                    <Input type="color" value={styles.gradientFrom || '#000000'} onChange={e => handleStyleChange('gradientFrom', e.target.value)} className="p-1 h-10 w-full" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Cor Final</Label>
                                    <Input type="color" value={styles.gradientTo || '#434343'} onChange={e => handleStyleChange('gradientTo', e.target.value)} className="p-1 h-10 w-full" />
                                </div>
                            </div>
                        )}
                         {styles.backgroundType === 'solid' && (
                            <div className="space-y-2">
                                <Label>Cor de Fundo</Label>
                                <Input type="color" value={styles.backgroundColor || '#ffffff'} onChange={(e) => handleStyleChange('backgroundColor', e.target.value)} className="p-1 h-10 w-full"/>
                            </div>
                        )}
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="layout">
                    <AccordionTrigger>Layout Interno</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-2">
                        <div className="space-y-2">
                            <Label>Alinhamento Vertical (Justify)</Label>
                             <Select value={layout.verticalAlign || 'flex-start'} onValueChange={(value) => handleLayoutChange('verticalAlign', value)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="flex-start">Topo</SelectItem>
                                    <SelectItem value="center">Meio</SelectItem>
                                    <SelectItem value="flex-end">Base</SelectItem>
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
                            <Input value={props.idOverride || ''} onChange={e => onSubPropChange('', 'idOverride', e.target.value)} placeholder="ID único para âncoras"/>
                        </div>
                        <div className="space-y-2">
                            <Label>Classes CSS Customizadas</Label>
                            <Input value={props.customClasses || ''} onChange={e => onSubPropChange('', 'customClasses', e.target.value)} placeholder="classe-1 classe-2"/>
                        </div>
                    </AccordionContent>
                 </AccordionItem>
            </Accordion>
        </div>
    );
}
