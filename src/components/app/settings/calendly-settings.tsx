
import type { PageComponent, CalendlyEmbedType, CloudPage } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ComponentSettingsProps {
  component: PageComponent;
  onPropChange: (prop: string, value: any) => void;
  onSubPropChange: (prop: string, subProp: string, value: any) => void;
}

export function CalendlySettings({ component, onPropChange, onSubPropChange }: ComponentSettingsProps) {
    const { props } = component;
    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="calendly-url">URL do Evento Calendly</Label>
                <Input
                    id="calendly-url"
                    value={props.calendlyUrl || ''}
                    onChange={(e) => onPropChange('calendlyUrl', e.target.value)}
                    placeholder="https://calendly.com/seu-usuario/seu-evento"
                />
            </div>
            <div className="space-y-2">
                <Label>Tipo de Incorporação</Label>
                <Select
                    value={props.embedType || 'inline'}
                    onValueChange={(value: CalendlyEmbedType) => onPropChange('embedType', value)}
                >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="inline">Inline (na página)</SelectItem>
                        <SelectItem value="popup_button">Botão Popup</SelectItem>
                        <SelectItem value="popup_text">Link Popup</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            {props.embedType === 'inline' && (
                <div className="space-y-2">
                    <Label htmlFor="calendly-height">Altura</Label>
                    <Input
                        id="calendly-height"
                        value={props.height || '700px'}
                        onChange={(e) => onPropChange('height', e.target.value)}
                        placeholder="Ex: 700px"
                    />
                </div>
            )}
            {(props.embedType === 'popup_button' || props.embedType === 'popup_text') && (
                <div className="space-y-2">
                    <Label htmlFor="calendly-button-text">Texto do Botão/Link</Label>
                    <Input
                        id="calendly-button-text"
                        value={props.buttonText || 'Agende um Horário'}
                        onChange={(e) => onPropChange('buttonText', e.target.value)}
                    />
                </div>
            )}
            <Separator />
            <h4 className="font-medium text-sm">Pré-preenchimento (Opcional)</h4>
            <div className="space-y-2">
                <Label htmlFor="calendly-prefill-name" className="text-xs">Variável para Nome</Label>
                <Input id="calendly-prefill-name" value={props.prefill?.name || ''} onChange={e => onSubPropChange('prefill', 'name', e.target.value)} placeholder="Ex: NOME"/>
            </div>
            <div className="space-y-2">
                <Label htmlFor="calendly-prefill-email" className="text-xs">Variável para Email</Label>
                <Input id="calendly-prefill-email" value={props.prefill?.email || ''} onChange={e => onSubPropChange('prefill', 'email', e.target.value)} placeholder="Ex: EMAIL"/>
            </div>
        </div>
    );
}
