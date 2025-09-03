
import type { PageComponent } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { CarouselImageManager } from './list-managers';

interface ComponentSettingsProps {
  component: PageComponent;
  onPropChange: (prop: string, value: any) => void;
  onSubPropChange: (prop: string, subProp: string, value: any) => void;
}

export function CarouselSettings({ component, onPropChange, onSubPropChange }: ComponentSettingsProps) {
    const { props } = component;
    return (
        <div className="space-y-4">
            <CarouselImageManager images={props.images || []} onPropChange={onPropChange} />
            <Separator />
            <h4 className="font-medium text-sm pt-2">Opções do Carrossel</h4>
            <div className="flex items-center justify-between">
                <Label htmlFor="carousel-loop">Loop Infinito</Label>
                <Switch id="carousel-loop" checked={props.options?.loop || false} onCheckedChange={(checked) => onSubPropChange('options', 'loop', checked)} />
            </div>
             <div className="flex items-center justify-between">
                <Label htmlFor="carousel-autoplay">Autoplay</Label>
                <Switch id="carousel-autoplay" checked={props.options?.autoplay?.delay > 0} onCheckedChange={(checked) => onSubPropChange('options', 'autoplay', checked ? { delay: 4000 } : null)} />
            </div>
            {props.options?.autoplay && (
                <div className="space-y-2">
                    <Label htmlFor="carousel-speed">Velocidade do Autoplay (ms)</Label>
                    <Input id="carousel-speed" type="number" value={props.options.autoplay.delay} onChange={(e) => onSubPropChange('options', 'autoplay', { delay: parseInt(e.target.value) })} />
                </div>
            )}
             <div className="flex items-center justify-between">
                <Label htmlFor="carousel-arrows">Mostrar Setas</Label>
                <Switch id="carousel-arrows" checked={props.showArrows !== false} onCheckedChange={(checked) => onPropChange('showArrows', checked)} />
            </div>
        </div>
    );
}
