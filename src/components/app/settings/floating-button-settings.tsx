
import type { PageComponent, CloudPage } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ImageInput } from "./image-input";

interface ComponentSettingsProps {
  component: PageComponent;
  onPropChange: (prop: string, value: any) => void;
  projectPages: CloudPage[];
}

const floatingButtonIcons = [
    { value: 'plus', label: 'Mais' },
    { value: 'message-circle', label: 'Mensagem' },
    { value: 'arrow-up', label: 'Seta para Cima' },
    { value: 'download', label: 'Download' },
];

export function FloatingButtonSettings({ component, onPropChange, projectPages }: ComponentSettingsProps) {
    const { props } = component;
    return (
        <div className="space-y-4">
           <div className="space-y-2">
               <Label>Tipo de Botão</Label>
                <Select value={props.type || 'icon'} onValueChange={value => onPropChange('type', value)}>
                   <SelectTrigger><SelectValue /></SelectTrigger>
                   <SelectContent>
                       <SelectItem value="icon">Ícone</SelectItem>
                       <SelectItem value="image">Imagem</SelectItem>
                   </SelectContent>
                </Select>
           </div>

           {props.type === 'image' ? (
                <ImageInput 
                   label="URL da Imagem"
                   value={props.imageUrl || ""}
                   onPropChange={onPropChange}
                   propName="imageUrl"
                   tooltipText="Use uma imagem quadrada ou redonda. PNG com transparência é ideal."
               />
           ) : (
               <div className="space-y-2">
                   <Label>Ícone</Label>
                   <Select value={props.icon || 'plus'} onValueChange={value => onPropChange('icon', value)}>
                       <SelectTrigger><SelectValue /></SelectTrigger>
                       <SelectContent>
                           {floatingButtonIcons.map(icon => (
                               <SelectItem key={icon.value} value={icon.value}>{icon.label}</SelectItem>
                           ))}
                       </SelectContent>
                   </Select>
               </div>
           )}
            <Separator />
           <div className="space-y-2">
             <Label htmlFor="fb-action-type">Ação do Botão</Label>
             <Select
               value={props.action?.type || 'URL'}
               onValueChange={(value) => onPropChange('action', { ...props.action, type: value })}
             >
               <SelectTrigger id="fb-action-type">
                 <SelectValue placeholder="Selecione uma ação" />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="URL">Ir para URL externa</SelectItem>
                 <SelectItem value="PAGE">Ir para outra página</SelectItem>
               </SelectContent>
             </Select>
           </div>
            {(!props.action || props.action.type === 'URL') && (
             <div className="space-y-2">
               <Label htmlFor="fb-href">URL do Link</Label>
               <Input
                 id="fb-href"
                 value={props.action?.url || ''}
                 onChange={(e) => onPropChange('action', { ...props.action, url: e.target.value, type: 'URL' })}
                 placeholder="https://exemplo.com"
               />
             </div>
           )}
            {(props.action?.type === 'PAGE') && (
             <div className="space-y-2">
               <Label htmlFor="fb-page-id">Página de Destino</Label>
               <Select
                 value={props.action?.pageId || ''}
                 onValueChange={(value) => onPropChange('action', { ...props.action, pageId: value, type: 'PAGE' })}
               >
                 <SelectTrigger id="fb-page-id">
                   <SelectValue placeholder="Selecione uma página..." />
                 </SelectTrigger>
                 <SelectContent>
                   {projectPages.map(page => (
                     <SelectItem key={page.id} value={page.id}>
                       {page.name}
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             </div>
           )}
           <Separator />
           <h4 className="font-medium text-sm pt-2">Estilo e Posição</h4>
            <div className="space-y-2">
               <Label>Posição</Label>
               <Select value={props.position || 'bottom-right'} onValueChange={value => onPropChange('position', value)}>
                   <SelectTrigger><SelectValue /></SelectTrigger>
                   <SelectContent>
                        <SelectItem value="bottom-right">Canto Inferior Direito</SelectItem>
                        <SelectItem value="bottom-left">Canto Inferior Esquerdo</SelectItem>
                        <SelectItem value="top-right">Canto Superior Direito</SelectItem>
                        <SelectItem value="top-left">Canto Superior Esquerdo</SelectItem>
                   </SelectContent>
               </Select>
           </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <Label htmlFor="fb-size">Tamanho (px)</Label>
                   <Input id="fb-size" type="number" value={props.size || 60} onChange={e => onPropChange('size', parseInt(e.target.value, 10))} />
                </div>
                <div className="space-y-2">
                   <Label>Cor de Fundo</Label>
                   <Input type="color" value={props.backgroundColor || '#000000'} onChange={e => onPropChange('backgroundColor', e.target.value)} className="p-1 h-10" />
                </div>
           </div>
           <div className="flex items-center justify-between">
               <Label htmlFor="fb-show-on-scroll">Mostrar após rolagem</Label>
               <Switch id="fb-show-on-scroll" checked={props.showOnScroll || false} onCheckedChange={c => onPropChange('showOnScroll', c)} />
           </div>
           {props.showOnScroll && (
                <div className="space-y-2">
                   <Label htmlFor="fb-scroll-offset">Offset da Rolagem (px)</Label>
                   <Input id="fb-scroll-offset" type="number" value={props.scrollOffset || 100} onChange={e => onPropChange('scrollOffset', parseInt(e.target.value, 10))} />
                </div>
           )}
        </div>
    );
}
