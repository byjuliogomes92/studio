

import type { PageComponent, HeaderLink, CloudPage } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { produce } from "immer";
import { ColorInput } from "./color-input";

const socials = [
    { key: 'facebook', label: 'Facebook' },
    { key: 'instagram', label: 'Instagram' },
    { key: 'twitter', label: 'X (Twitter)' },
    { key: 'linkedin', label: 'LinkedIn' },
    { key: 'youtube', label: 'YouTube' },
];

function LinkManager({ title, links = [], onLinksChange }: { title: string, links: HeaderLink[], onLinksChange: (newLinks: HeaderLink[]) => void }) {
    const handleLinkChange = (index: number, field: keyof HeaderLink, value: any) => {
        const newLinks = produce(links, draft => {
            (draft[index] as any)[field] = value;
        });
        onLinksChange(newLinks);
    };

    const addLink = () => {
        const newLink: HeaderLink = { id: `link-${Date.now()}`, text: 'Novo Link', url: '#' };
        onLinksChange([...links, newLink]);
    };

    const removeLink = (index: number) => {
        const newLinks = links.filter((_, i) => i !== index);
        onLinksChange(newLinks);
    };

    return (
        <div className="space-y-3">
            <h4 className="font-medium text-sm">{title}</h4>
            {links.map((link, index) => (
                <div key={link.id} className="p-2 border rounded-md space-y-2 bg-muted/40">
                     <div className="flex items-center justify-end">
                        <Button variant="ghost" size="icon" onClick={() => removeLink(index)} className="h-6 w-6 text-destructive">
                            <Trash2 className="h-3 w-3" />
                        </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                            <Label htmlFor={`link-text-${link.id}`} className="text-xs">Texto</Label>
                            <Input id={`link-text-${link.id}`} value={link.text} onChange={e => handleLinkChange(index, 'text', e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor={`link-url-${link.id}`} className="text-xs">URL</Label>
                            <Input id={`link-url-${link.id}`} value={link.url} onChange={e => handleLinkChange(index, 'url', e.target.value)} />
                        </div>
                    </div>
                </div>
            ))}
            <Button variant="outline" size="sm" className="w-full" onClick={addLink}>
                <Plus className="mr-2 h-4 w-4" /> Adicionar Link
            </Button>
        </div>
    );
}

export function FooterSettings({ component, onPropChange, pageState }: { component: PageComponent, onPropChange: (prop: string, value: any) => void, pageState: CloudPage }) {
    const { props } = component;
    const styles = props.styles || {};
    const socialLinks = props.socialLinks || {};

    const handleStyleChange = (prop: string, value: any) => {
        onPropChange('styles', { ...styles, [prop]: value });
    };

    const handleSocialLinkChange = (key: string, value: string) => {
        const newSocialLinks = { ...socialLinks, [key]: value };
        onPropChange('socialLinks', newSocialLinks);
    };

    return (
        <div className="space-y-4">
             <div className="space-y-2">
                <Label htmlFor="footer-layout">Layout do Rodapé</Label>
                <Select value={props.layout || 'default'} onValueChange={(value) => onPropChange('layout', value)}>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="default">Padrão (Centralizado)</SelectItem>
                        <SelectItem value="menus-and-social">Menus e Ícones Sociais</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            
            <Separator />
            
            <h4 className="font-medium text-sm">Estilo do Rodapé</h4>
            <div className="space-y-2">
                <ColorInput label="Cor de Fundo" value={styles.backgroundColor || '#FAFAFA'} onChange={(value) => handleStyleChange('backgroundColor', value)} brand={pageState.brand} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="footer-border-radius">Cantos Arredondados</Label>
                <Input id="footer-border-radius" value={styles.borderRadius || '0px'} onChange={(e) => handleStyleChange('borderRadius', e.target.value)} placeholder="Ex: 8px ou 0rem"/>
            </div>

            <Separator />

            {props.layout === 'menus-and-social' ? (
                <div className="space-y-4">
                     <LinkManager title="Links da Esquerda" links={props.linksLeft || []} onLinksChange={(newLinks) => onPropChange('linksLeft', newLinks)} />
                     <Separator />
                      <div className="space-y-3">
                         <h4 className="font-medium text-sm">Ícones de Redes Sociais (Centro)</h4>
                         {socials.map(social => (
                            <div key={social.key} className="space-y-1">
                                <Label htmlFor={`social-${social.key}`} className="text-xs">{social.label}</Label>
                                <Input
                                    id={`social-${social.key}`}
                                    value={socialLinks[social.key] || ''}
                                    onChange={(e) => handleSocialLinkChange(social.key, e.target.value)}
                                    placeholder={`URL do ${social.label}`}
                                />
                            </div>
                        ))}
                     </div>
                     <Separator />
                     <LinkManager title="Links da Direita" links={props.linksRight || []} onLinksChange={(newLinks) => onPropChange('linksRight', newLinks)} />
                </div>
            ) : (
                 <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="footer-text1">Linha de Texto 1</Label>
                        <Input id="footer-text1" value={props.footerText1 || ''} onChange={(e) => onPropChange('footerText1', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="footer-text2">Linha de Texto 2</Label>
                        <Input id="footer-text2" value={props.footerText2 || ''} onChange={(e) => onPropChange('footerText2', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="footer-text3">Linha de Texto 3</Label>
                        <Input id="footer-text3" value={props.footerText3 || ''} onChange={(e) => onPropChange('footerText3', e.target.value)} />
                    </div>
                 </div>
            )}
        </div>
    );
}
