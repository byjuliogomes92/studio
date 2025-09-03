
import type { PageComponent } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ImageInput } from "./image-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
              <Label>Posição na Tela</Label>
              <Select value={props.position || 'top-left'} onValueChange={(value) => onPropChange('position', value)}>
                <SelectTrigger>
                    <SelectValue placeholder="Selecione uma posição" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="top-left">Canto Superior Esquerdo</SelectItem>
                    <SelectItem value="top-center">Topo ao Centro</SelectItem>
                    <SelectItem value="top-right">Canto Superior Direito</SelectItem>
                    <SelectItem value="center-left">Meio à Esquerda</SelectItem>
                    <SelectItem value="center">Centro da Tela</SelectItem>
                    <SelectItem value="center-right">Meio à Direita</SelectItem>
                    <SelectItem value="bottom-left">Canto Inferior Esquerdo</SelectItem>
                    <SelectItem value="bottom-center">Base ao Centro</SelectItem>
                    <SelectItem value="bottom-right">Canto Inferior Direito</SelectItem>
                </SelectContent>
              </Select>
           </div>
           <div className="grid grid-cols-2 gap-2">
               <div className="space-y-2">
                  <Label htmlFor="fi-offset-x">Offset X</Label>
                  <Input id="fi-offset-x" value={props.offsetX || '20px'} onChange={e => onPropChange('offsetX', e.target.value)} placeholder="Ex: 20px" />
               </div>
               <div className="space-y-2">
                  <Label htmlFor="fi-offset-y">Offset Y</Label>
                  <Input id="fi-offset-y" value={props.offsetY || '20px'} onChange={e => onPropChange('offsetY', e.target.value)} placeholder="Ex: 20px" />
               </div>
           </div>
           <div className="space-y-2">
              <Label htmlFor="fi-zindex">Ordem da Camada (z-index)</Label>
              <Input id="fi-zindex" type="number" value={props.zIndex || 10} onChange={e => onPropChange('zIndex', parseInt(e.target.value, 10))} />
          </div>
        </div>
    );
}
