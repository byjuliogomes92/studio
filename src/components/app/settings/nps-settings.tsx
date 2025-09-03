
import type { PageComponent } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DebouncedTextInput } from "./debounced-text-input";

interface ComponentSettingsProps {
  component: PageComponent;
  onPropChange: (prop: string, value: any) => void;
}

export function NPSSettings({ component, onPropChange }: ComponentSettingsProps) {
    const { props } = component;
    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="nps-question">Pergunta Principal</Label>
                <DebouncedTextInput
                    id="nps-question"
                    value={props.question || ''}
                    onBlur={(value: any) => onPropChange('question', value)}
                    rows={3}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="nps-type">Tipo de Escala</Label>
                <Select value={props.type || 'numeric'} onValueChange={(value) => onPropChange('type', value)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="numeric">Numérica (0-10)</SelectItem>
                        <SelectItem value="faces">Carinhas (Emojis)</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="nps-low-label">Rótulo Inferior</Label>
                <Input
                    id="nps-low-label"
                    value={props.lowLabel || ''}
                    onChange={(e) => onPropChange('lowLabel', e.target.value)}
                    placeholder="Ex: Pouco provável"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="nps-high-label">Rótulo Superior</Label>
                <Input
                    id="nps-high-label"
                    value={props.highLabel || ''}
                    onChange={(e) => onPropChange('highLabel', e.target.value)}
                    placeholder="Ex: Muito provável"
                />
            </div>
             <div className="space-y-2">
                <Label htmlFor="nps-thanks">Mensagem de Agradecimento</Label>
                <DebouncedTextInput
                    id="nps-thanks"
                    value={props.thankYouMessage || ''}
                    onBlur={(value: any) => onPropChange('thankYouMessage', value)}
                    rows={3}
                />
            </div>
        </div>
    );
}
