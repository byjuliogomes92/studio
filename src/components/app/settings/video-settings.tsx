
import type { PageComponent } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ComponentSettingsProps {
  component: PageComponent;
  onPropChange: (prop: string, value: any) => void;
}

export function VideoSettings({ component, onPropChange }: ComponentSettingsProps) {
    const { props } = component;
    return (
        <div className="space-y-2">
          <Label htmlFor="video-url">URL do Vídeo (YouTube)</Label>
          <Input
            id="video-url"
            value={props.url || ''}
            onChange={(e) => onPropChange('url', e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
          />
        </div>
    );
}
