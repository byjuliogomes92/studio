
import type { PageComponent } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ComponentSettingsProps {
  component: PageComponent;
  onPropChange: (prop: string, value: any) => void;
}

export function DividerSettings({ component, onPropChange }: ComponentSettingsProps) {
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
            <Label htmlFor="divider-color">Cor</Label>
            <Input
              id="divider-color"
              type="color"
              value={props.color || '#cccccc'}
              onChange={(e) => onPropChange('color', e.target.value)}
              className="p-1 h-10"
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
