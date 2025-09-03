
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
}

export function BannerSettings({ component, onPropChange }: ComponentSettingsProps) {
    const { props } = component;
    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label>Tipo de Mídia</Label>
                <Select value={props.mediaType || 'image'} onValueChange={(value) => onPropChange('mediaType', value)}>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="image">Imagem / GIF</SelectItem>
                        <SelectItem value="video">Vídeo</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {props.mediaType === 'video' ? (
                <ImageInput 
                    label="URL do Vídeo (MP4)"
                    value={props.videoUrl || ""}
                    onPropChange={onPropChange}
                    propName="videoUrl"
                    tooltipText="URL para o arquivo de vídeo .mp4."
                />
            ) : (
                <>
                    <ImageInput 
                        label="URL da Imagem (Desktop)"
                        value={props.imageUrl || ""}
                        onPropChange={onPropChange}
                        propName="imageUrl"
                        tooltipText="URL para a imagem principal do banner."
                    />
                     <ImageInput 
                        label="URL da Imagem (Mobile)"
                        value={props.mobileImageUrl || ""}
                        onPropChange={onPropChange}
                        propName="mobileImageUrl"
                        tooltipText="Opcional. Uma imagem vertical para melhor visualização em celulares."
                    />
                </>
            )}

            <Separator />
            <div className="space-y-2">
                <Label htmlFor="banner-link-url">URL do Link (Opcional)</Label>
                <Input
                    id="banner-link-url"
                    value={props.linkUrl || ""}
                    onChange={(e) => onPropChange("linkUrl", e.target.value)}
                    placeholder="https://exemplo.com"
                />
            </div>
            <div className="flex items-center justify-between">
                <Label htmlFor="banner-full-width">Largura Total</Label>
                <Switch
                    id="banner-full-width"
                    checked={props.isFullWidth || false}
                    onCheckedChange={(checked) => onPropChange('isFullWidth', checked)}
                />
            </div>
             <div className="space-y-2">
                <Label htmlFor="banner-padding">Espaçamento Interno</Label>
                <Input
                    id="banner-padding"
                    value={props.padding || "0"}
                    onChange={(e) => onPropChange("padding", e.target.value)}
                    placeholder="Ex: 20px ou 1rem 2rem"
                />
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="banner-height-desktop">Altura (Desktop)</Label>
                    <Input
                        id="banner-height-desktop"
                        value={props.height || ""}
                        onChange={(e) => onPropChange("height", e.target.value)}
                        placeholder="Ex: 500px, 60vh"
                    />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="banner-height-mobile">Altura (Mobile)</Label>
                    <Input
                        id="banner-height-mobile"
                        value={props.mobileHeight || ""}
                        onChange={(e) => onPropChange("mobileHeight", e.target.value)}
                        placeholder="Ex: 300px, 50vh"
                    />
                </div>
            </div>
        </div>
    );
}
