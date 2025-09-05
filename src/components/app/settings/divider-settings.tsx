
import type { PageComponent, CloudPage } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ColorInput } from "./color-input";

interface ComponentSettingsProps {
  component: PageComponent;
  onPropChange: (prop: string, value: any) => void;
  pageState: CloudPage;
}

export function DividerSettings({ component, onPropChange, pageState }: ComponentSettingsProps) {
    const { props } = component;
    return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="divider-thickness">Espessura (px)</Label>
            <Input
              id="divider-thickness"
              type="number"
              value={props.thickness || 1}
              onChange={(e) => onPropChange('thickness', parseInt(e.target.value, 10) || 1)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="divider-style">Estilo</Label>
            <Select value={props.style || 'solid'} onValueChange={(value) => onPropChange('style', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o estilo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solid">Sólido</SelectItem>
                <SelectItem value="dotted">Pontilhado</SelectItem>
                <SelectItem value="dashed">Tracejado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
             <ColorInput
                label="Cor"
                value={props.color || '#cccccc'}
                onChange={(value) => onPropChange('color', value)}
                brand={pageState.brand}
             />
          </div>
           <div className="space-y-2">
            <Label htmlFor="divider-margin">Margem Vertical (px)</Label>
            <Input
              id="divider-margin"
              type="number"
              value={props.margin || 20}
              onChange={(e) => onPropChange('margin', parseInt(e.target.value, 10) || 0)}
            />
          </div>
        </div>
    );
}
