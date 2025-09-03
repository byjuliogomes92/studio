
import type { PageComponent } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DebouncedTextInput } from "./debounced-text-input";

interface ComponentSettingsProps {
  component: PageComponent;
  onPropChange: (prop: string, value: any) => void;
}

export function WhatsAppSettings({ component, onPropChange }: ComponentSettingsProps) {
    const { props } = component;
    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="wa-phone">Número de Telefone</Label>
                <Input
                    id="wa-phone"
                    value={props.phoneNumber || ''}
                    onChange={(e) => onPropChange('phoneNumber', e.target.value)}
                    placeholder="Ex: 5511999999999"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="wa-message">Mensagem Padrão</Label>
                <DebouncedTextInput
                    id="wa-message"
                    value={props.defaultMessage || ''}
                    onBlur={(value: any) => onPropChange('defaultMessage', value)}
                    rows={4}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="wa-position">Posição do Botão</Label>
                <Select value={props.position || 'bottom-right'} onValueChange={(value) => onPropChange('position', value)}>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="bottom-right">Canto Inferior Direito</SelectItem>
                        <SelectItem value="bottom-left">Canto Inferior Esquerdo</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
