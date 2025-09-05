
import type { PageComponent, CloudPage } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { DebouncedTextInput } from "./debounced-text-input";
import { ImageInput } from "./image-input";
import { ColorInput } from "./color-input";

interface ComponentSettingsProps {
  component: PageComponent;
  onPropChange: (prop: string, value: any) => void;
  pageState: CloudPage;
}

const stripeIcons = [
    { value: 'none', label: 'Sem ícone' },
    { value: 'megaphone', label: 'Megafone' },
    { value: 'star', label: 'Estrela' },
    { value: 'zap', label: 'Raio (Promoção)' },
];

export function StripeSettings({ component, onPropChange, pageState }: ComponentSettingsProps) {
    const { props } = component;
    const backgroundType = props.backgroundType || 'solid';
    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="stripe-text">Texto da Tarja</Label>
                <DebouncedTextInput
                    id="stripe-text"
                    value={props.text || ''}
                    onBlur={(value: any) => onPropChange('text', value)}
                    rows={3}
                />
            </div>

            <Separator />
            <h4 className="font-medium text-sm pt-2">Estilo</h4>
            <div className="space-y-2">
                <Label>Tipo de Fundo</Label>
                <Select value={backgroundType} onValueChange={(value) => onPropChange('backgroundType', value)}>
                   <SelectTrigger><SelectValue /></SelectTrigger>
                   <SelectContent>
                       <SelectItem value="solid">Cor Sólida</SelectItem>
                       <SelectItem value="gradient">Gradiente</SelectItem>
                       <SelectItem value="image">Imagem</SelectItem>
                   </SelectContent>
                </Select>
            </div>

            {backgroundType === 'solid' && (
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <ColorInput label="Cor de Fundo" value={props.backgroundColor || '#000000'} onChange={(value) => onPropChange('backgroundColor', value)} brand={pageState.brand} />
                    </div>
                </div>
            )}
             {backgroundType === 'gradient' && (
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <ColorInput label="Cor Inicial" value={props.gradientFrom || '#000000'} onChange={(value) => onPropChange('gradientFrom', value)} brand={pageState.brand} />
                    </div>
                    <div className="space-y-2">
                        <ColorInput label="Cor Final" value={props.gradientTo || '#434343'} onChange={(value) => onPropChange('gradientTo', value)} brand={pageState.brand} />
                    </div>
                </div>
            )}
             {backgroundType === 'image' && (
                <ImageInput 
                    label="URL da Imagem de Fundo"
                    value={props.backgroundImageUrl || ""}
                    onPropChange={onPropChange}
                    propName="backgroundImageUrl"
                    tooltipText="URL para a imagem de fundo da faixa."
                />
            )}

            <div className="space-y-2">
                <ColorInput label="Cor do Texto" value={props.textColor || '#FFFFFF'} onChange={(value) => onPropChange('textColor', value)} brand={pageState.brand} />
            </div>

            <Separator />
            <h4 className="font-medium text-sm pt-2">Elementos</h4>
             <div className="space-y-2">
                <Label>Ícone</Label>
                <Select value={props.icon || 'none'} onValueChange={(value) => onPropChange('icon', value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        {stripeIcons.map(icon => <SelectItem key={icon.value} value={icon.value}>{icon.label}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
             <div className="flex items-center justify-between">
                <Label htmlFor="stripe-button-enabled">Adicionar Botão</Label>
                <Switch id="stripe-button-enabled" checked={props.buttonEnabled} onCheckedChange={(checked) => onPropChange('buttonEnabled', checked)} />
            </div>

            {props.buttonEnabled && (
                <div className="p-3 border rounded-md space-y-3 bg-muted/30">
                    <div className="space-y-2">
                        <Label htmlFor="stripe-button-text">Texto do Botão</Label>
                        <Input id="stripe-button-text" value={props.buttonText || ''} onChange={(e) => onPropChange('buttonText', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="stripe-button-url">URL do Botão</Label>
                        <Input id="stripe-button-url" value={props.buttonUrl || ''} onChange={(e) => onPropChange('buttonUrl', e.target.value)} />
                    </div>
                </div>
            )}
            <Separator />
             <div className="flex items-center justify-between">
                <Label htmlFor="stripe-closable">Permitir Fechar</Label>
                <Switch id="stripe-closable" checked={props.isClosable} onCheckedChange={(checked) => onPropChange('isClosable', checked)} />
            </div>
        </div>
    );
}
