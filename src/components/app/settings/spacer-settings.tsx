
import type { PageComponent } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ComponentSettingsProps {
  component: PageComponent;
  onPropChange: (prop: string, value: any) => void;
}

export function SpacerSettings({ component, onPropChange }: ComponentSettingsProps) {
    const { props } = component;
    return (
        <div className="space-y-2">
            <Label htmlFor="spacer-height">Altura (px)</Label>
            <Input
            id="spacer-height"
            type="number"
            value={props.height || 20}
            onChange={(e) => onPropChange('height', parseInt(e.target.value, 10))}
            />
        </div>
    );
}
