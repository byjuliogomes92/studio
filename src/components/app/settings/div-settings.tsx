
import type { PageComponent } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ImageInput } from "./image-input";
import { produce } from "immer";

interface ComponentSettingsProps {
  component: PageComponent;
  onPropChange: (prop: string, value: any) => void;
  onSubPropChange: (prop: string, subProp: string, value: any) => void;
}


export function DivSettings({ component, onPropChange, onSubPropChange }: ComponentSettingsProps) {
    const styles = component.props.styles || {};
    const backgroundType = styles.backgroundType || 'solid';

    const handleStyleChange = (prop: string, value: any) => {
        const newStyles = produce(styles, (draft: any) => {
            draft[prop] = value;
        });
        onPropChange('styles', newStyles);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label htmlFor="div-full-width">Largura Total (Full Bleed)</Label>
                <Switch
                    id="div-full-width"
                    checked={styles.isFullWidth || false}
                    onCheckedChange={(checked) => handleStyleChange('isFullWidth', checked)}
                />
            </div>
            
            <Separator />
            
            <div className="p-4 border rounded-lg bg-muted/40 space-y-4">
                <Label>Estilo de Fundo</Label>
                <Select value={backgroundType} onValueChange={(value) => handleStyleChange('backgroundType', value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="solid">Cor Sólida</SelectItem>
                        <SelectItem value="gradient">Gradiente</SelectItem>
                        <SelectItem value="image">Imagem</SelectItem>
                    </SelectContent>
                </Select>
                
                {backgroundType === 'solid' && (
                    <div className="space-y-2">
                        <Label htmlFor="div-bg-color">Cor de Fundo</Label>
                        <Input id="div-bg-color" type="color" value={styles.backgroundColor || '#ffffff'} onChange={(e) => handleStyleChange('backgroundColor', e.target.value)} className="p-1 h-10"/>
                    </div>
                )}

                {backgroundType === 'gradient' && (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Cor Inicial</Label>
                            <Input type="color" value={styles.gradientFrom || '#000000'} onChange={(e) => handleStyleChange('gradientFrom', e.target.value)} className="p-1 h-10" />
                        </div>
                        <div className="space-y-2">
                            <Label>Cor Final</Label>
                            <Input type="color" value={styles.gradientTo || '#434343'} onChange={(e) => handleStyleChange('gradientTo', e.target.value)} className="p-1 h-10" />
                        </div>
                    </div>
                )}

                {backgroundType === 'image' && (
                    <div className="space-y-4">
                        <ImageInput 
                            label="URL da Imagem de Fundo"
                            value={styles.backgroundImageUrl || ""}
                            onPropChange={(_prop, value) => handleStyleChange('backgroundImageUrl', value)}
                            propName="backgroundImageUrl"
                            tooltipText="URL para a imagem de fundo da seção."
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
