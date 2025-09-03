
import type { PageComponent } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ImageInput } from "./image-input";

interface ComponentSettingsProps {
  component: PageComponent;
  onPropChange: (prop: string, value: any) => void;
}

export function FloatingImageSettings({ component, onPropChange }: ComponentSettingsProps) {
    const { props } = component;
    return (
        <div className="space-y-4">
           <ImageInput 
              label="URL da Imagem"
              value={props.imageUrl || ""}
              onPropChange={onPropChange}
              propName="imageUrl"
              tooltipText="URL da imagem flutuante. Use PNGs com fundo transparente para melhores resultados."
          />
          <div className="space-y-2">
              <Label htmlFor="fi-width">Largura</Label>
              <Input id="fi-width" value={props.width || '150px'} onChange={e => onPropChange('width', e.target.value)} placeholder="Ex: 150px ou 10%" />
          </div>
           <div className="space-y-2">
              <Label>Posicionamento</Label>
               <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Topo" value={props.top || ''} onChange={e => onPropChange('top', e.target.value)} />
                  <Input placeholder="Direita" value={props.right || ''} onChange={e => onPropChange('right', e.target.value)} />
                  <Input placeholder="Baixo" value={props.bottom || ''} onChange={e => onPropChange('bottom', e.target.value)} />
                  <Input placeholder="Esquerda" value={props.left || ''} onChange={e => onPropChange('left', e.target.value)} />
               </div>
          </div>
           <div className="space-y-2">
              <Label htmlFor="fi-zindex">Ordem da Camada (z-index)</Label>
              <Input id="fi-zindex" type="number" value={props.zIndex || 10} onChange={e => onPropChange('zIndex', parseInt(e.target.value, 10))} />
          </div>
        </div>
    );
}
