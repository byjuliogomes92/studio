
import type { PageComponent, CloudPage } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ColorInput } from "./color-input";

interface ComponentSettingsProps {
  component: PageComponent;
  onPropChange: (prop: string, value: any) => void;
  pageState: CloudPage;
}

export function CountdownSettings({ component, onPropChange, pageState }: ComponentSettingsProps) {
    const { props } = component;
    return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="countdown-date">Data e Hora do Fim</Label>
            <Input
              id="countdown-date"
              type="datetime-local"
              value={props.targetDate || ''}
              onChange={(e) => onPropChange('targetDate', e.target.value)}
            />
          </div>
          <Separator />
          <div className="space-y-2">
            <Label>Estilo do Contador</Label>
            <Select value={props.style || 'blocks'} onValueChange={(value) => onPropChange('style', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="blocks">Blocos</SelectItem>
                    <SelectItem value="circles">Círculos</SelectItem>
                    <SelectItem value="simple">Minimalista</SelectItem>
                </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-3 gap-2">
             <ColorInput 
                label="Fundo"
                value={props.backgroundColor || '#000000'}
                onChange={value => onPropChange('backgroundColor', value)}
                brand={pageState.brand}
             />
             <ColorInput 
                label="Dígitos"
                value={props.digitColor || '#FFFFFF'}
                onChange={value => onPropChange('digitColor', value)}
                brand={pageState.brand}
             />
              <ColorInput 
                label="Rótulos"
                value={props.labelColor || '#374151'}
                onChange={value => onPropChange('labelColor', value)}
                brand={pageState.brand}
             />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <Label>Tamanho dos Dígitos</Label>
                <Input value={props.digitFontSize || '2rem'} onChange={(e) => onPropChange('digitFontSize', e.target.value)} />
             </div>
              <div className="space-y-2">
                  <Label>Tamanho dos Rótulos</Label>
                  <Input value={props.labelFontSize || '0.8rem'} onChange={(e) => onPropChange('labelFontSize', e.target.value)} />
              </div>
          </div>
           <div className="space-y-2">
              <Label>Espaçamento</Label>
              <Input value={props.gap || '1rem'} onChange={(e) => onPropChange('gap', e.target.value)} placeholder="Ex: 10px ou 1rem"/>
           </div>
           <div className="space-y-2">
              <Label>Rótulos (Labels)</Label>
              <div className="grid grid-cols-4 gap-2">
                  <Input value={props.labelDays || 'Dias'} onChange={(e) => onPropChange('labelDays', e.target.value)} />
                  <Input value={props.labelHours || 'Horas'} onChange={(e) => onPropChange('labelHours', e.target.value)} />
                  <Input value={props.labelMinutes || 'Min'} onChange={(e) => onPropChange('labelMinutes', e.target.value)} />
                  <Input value={props.labelSeconds || 'Seg'} onChange={(e) => onPropChange('labelSeconds', e.target.value)} />
              </div>
           </div>
        </div>
    );
}
