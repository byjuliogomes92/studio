
import type { PageComponent } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { ImageInput } from "./image-input";
import { produce } from "immer";

interface ComponentSettingsProps {
  component: PageComponent;
  onPropChange: (prop: string, value: any) => void;
  onSubPropChange: (prop: string, subProp: string, value: any) => void;
}

export function ColumnsSettings({ component, onPropChange, onSubPropChange }: ComponentSettingsProps) {
    const { props } = component;
    const styles = props.styles || {};
    const backgroundType = styles.backgroundType || 'solid';
    const columnCount = props.columnCount || 2;
    const columnWidths = props.columnWidths || [];

    const handleWidthChange = (index: number, value: string) => {
        const newWidths = produce(columnWidths, (draft: any[]) => {
            // Ensure the array is long enough
            while (draft.length < columnCount) {
                draft.push(null);
            }
            draft[index] = value === '' ? null : parseInt(value, 10);
        });
        onPropChange('columnWidths', newWidths);
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="column-count">Número de Colunas</Label>
                <Input id="column-count" type="number" min="1" max="6" value={columnCount} onChange={e => onPropChange('columnCount', parseInt(e.target.value, 10) || 1)} />
            </div>
            {columnCount > 1 && (
                <div className="space-y-2">
                    <Label>Largura das Colunas (%)</Label>
                    <p className="text-xs text-muted-foreground">A soma deve ser 100. Deixe em branco para dividir igualmente.</p>
                    <div className="grid grid-cols-4 gap-2">
                        {Array.from({ length: columnCount }).map((_, index) => (
                             <Input 
                                key={index}
                                type="number"
                                value={columnWidths[index] || ''}
                                onChange={(e) => handleWidthChange(index, e.target.value)}
                                placeholder={`${(100/columnCount).toFixed(0)}%`}
                             />
                        ))}
                    </div>
                </div>
            )}
             <div className="space-y-2">
                <Label>Alinhamento dos Itens na Coluna</Label>
                 <Select value={styles.justifyContent || 'flex-start'} onValueChange={(value) => onSubPropChange('styles', 'justifyContent', value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="flex-start">Esquerda</SelectItem>
                        <SelectItem value="center">Centro</SelectItem>
                        <SelectItem value="flex-end">Direita</SelectItem>
                        <SelectItem value="space-between">Espaçado</SelectItem>
                    </SelectContent>
                 </Select>
            </div>
            <div className="flex items-center justify-between">
                <Label htmlFor="columns-full-width">Largura Total (Full Bleed)</Label>
                 <Switch
                    id="columns-full-width"
                    checked={styles.isFullWidth || false}
                    onCheckedChange={(checked) => onSubPropChange('styles', 'isFullWidth', checked)}
                />
            </div>
             <div className="p-4 border rounded-lg bg-muted/40 space-y-4">
                    <Label>Estilo de Fundo</Label>
                    <Select value={backgroundType} onValueChange={(value) => onSubPropChange('styles', 'backgroundType', value)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="solid">Cor Sólida</SelectItem>
                            <SelectItem value="gradient">Gradiente</SelectItem>
                            <SelectItem value="image">Imagem</SelectItem>
                        </SelectContent>
                    </Select>
                    
                    {backgroundType === 'solid' && (
                        <div className="space-y-2">
                            <Label htmlFor="columns-bg-color">Cor de Fundo</Label>
                            <Input id="columns-bg-color" type="color" value={styles.backgroundColor || '#ffffff'} onChange={(e) => onSubPropChange('styles', 'backgroundColor', e.target.value)} className="p-1 h-10"/>
                        </div>
                    )}

                    {backgroundType === 'gradient' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Cor Inicial</Label>
                                <Input type="color" value={styles.gradientFrom || '#000000'} onChange={(e) => onSubPropChange('styles', 'gradientFrom', e.target.value)} className="p-1 h-10" />
                            </div>
                            <div className="space-y-2">
                                <Label>Cor Final</Label>
                                <Input type="color" value={styles.gradientTo || '#434343'} onChange={(e) => onSubPropChange('styles', 'gradientTo', e.target.value)} className="p-1 h-10" />
                            </div>
                        </div>
                    )}

                    {backgroundType === 'image' && (
                        <div className="space-y-4">
                            <ImageInput 
                                label="URL da Imagem de Fundo"
                                value={styles.backgroundImageUrl || ""}
                                onPropChange={(prop, value) => onSubPropChange('styles', prop, value)}
                                propName="backgroundImageUrl"
                                tooltipText="URL para a imagem de fundo da seção."
                            />
                            <Separator />
                             <div className="flex items-center justify-between">
                                <Label htmlFor="overlay-enabled">Habilitar Sobreposição (Overlay)</Label>
                                <Switch
                                    id="overlay-enabled"
                                    checked={styles.overlayEnabled || false}
                                    onCheckedChange={(checked) => onSubPropChange('styles', 'overlayEnabled', checked)}
                                />
                            </div>
                            {styles.overlayEnabled && (
                                <div className="space-y-4 pt-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="overlay-color">Cor da Sobreposição</Label>
                                        <Input id="overlay-color" type="color" value={styles.overlayColor || '#000000'} onChange={(e) => onSubPropChange('styles', 'overlayColor', e.target.value)} className="p-1 h-10"/>
                                    </div>
                                     <div className="space-y-2">
                                        <Label htmlFor="overlay-opacity">Opacidade da Sobreposição ({Math.round((styles.overlayOpacity || 0.5) * 100)}%)</Label>
                                        <Slider
                                            id="overlay-opacity"
                                            min={0} max={1} step={0.05}
                                            value={[styles.overlayOpacity || 0.5]}
                                            onValueChange={(value) => onSubPropChange('styles', 'overlayOpacity', value[0])}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
            </div>
             <div className="p-4 border rounded-lg bg-muted/40 space-y-4">
                <div className="flex items-center justify-between">
                    <Label htmlFor="is-hero">Seção Hero</Label>
                    <Switch
                        id="is-hero"
                        checked={styles.isHero || false}
                        onCheckedChange={(checked) => onSubPropChange('styles', 'isHero', checked)}
                    />
                </div>
                {styles.isHero && (
                    <div className="space-y-2">
                        <Label htmlFor="columns-text-color">Cor do Texto (Hero)</Label>
                        <Input id="columns-text-color" type="color" value={styles.color || '#FFFFFF'} onChange={(e) => onSubPropChange('styles', 'color', e.target.value)} className="p-1 h-10"/>
                    </div>
                )}
            </div>
        </div>
    );
}
