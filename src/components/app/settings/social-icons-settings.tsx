
import type { PageComponent } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ComponentSettingsProps {
  component: PageComponent;
  onSubPropChange: (prop: string, subProp: string, value: any) => void;
}

const socials: {key: string, label: string}[] = [
    { key: 'facebook', label: 'Facebook' },
    { key: 'instagram', label: 'Instagram' },
    { key: 'twitter', label: 'X (Twitter)' },
    { key: 'linkedin', label: 'LinkedIn' },
    { key: 'youtube', label: 'YouTube' },
    { key: 'tiktok', label: 'TikTok' },
    { key: 'pinterest', label: 'Pinterest' },
    { key: 'snapchat', label: 'Snapchat' },
];

export function SocialIconsSettings({ component, onSubPropChange }: ComponentSettingsProps) {
    const { props } = component;
    return (
        <div className="space-y-4">
             <div className="space-y-3">
                <Label className="font-semibold">Links das Redes Sociais</Label>
                {socials.map(social => (
                    <div key={social.key} className="space-y-2">
                        <Label htmlFor={`social-${social.key}`}>{social.label}</Label>
                        <Input
                            id={`social-${social.key}`}
                            value={props.links?.[social.key] || ''}
                            onChange={(e) => onSubPropChange('links', social.key, e.target.value)}
                            placeholder={`URL do perfil do ${social.label}`}
                        />
                    </div>
                ))}
            </div>
            <Separator />
            <div className="space-y-3">
                <Label className="font-semibold">Estilos</Label>
                <div className="space-y-2">
                    <Label htmlFor="social-align">Alinhamento</Label>
                    <Select value={props.styles?.align || 'center'} onValueChange={(value) => onSubPropChange('styles', 'align', value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione o alinhamento" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="left">Esquerda</SelectItem>
                            <SelectItem value="center">Centro</SelectItem>
                            <SelectItem value="right">Direita</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="social-size">Tamanho do Ícone (px)</Label>
                    <Input
                        id="social-size"
                        type="number"
                        value={props.styles?.iconSize?.replace('px','') || 24}
                        onChange={(e) => onSubPropChange('styles', 'iconSize', `${e.target.value}px`)}
                    />
                </div>
            </div>
        </div>
    );
}
