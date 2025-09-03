
import type { PageComponent, HeaderLayout, MobileMenuBehavior, CloudPage } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { produce } from 'immer';
import { ImageInput } from "./image-input";
import { HeaderLinksManager } from './list-managers';

interface ComponentSettingsProps {
  component: PageComponent;
  onPropChange: (prop: string, value: any) => void;
  onSubPropChange: (prop: string, subProp: string, value: any) => void;
  projectPages: CloudPage[];
}

const headerLayouts: { value: HeaderLayout; label: string; viz: React.ReactNode }[] = [
    { value: 'logo-left-menu-right', label: 'Logo Esquerda, Menu Direita', viz: <div className="space-y-1 w-full"><div className="w-4 h-2 rounded-sm bg-current"></div><div className="w-full h-1 rounded-sm bg-current/50"></div><div className="w-full h-1 rounded-sm bg-current/50"></div></div> },
    { value: 'logo-left-menu-button-right', label: 'Logo Esquerda, Menu e Botão Direita', viz: <div className="space-y-1 w-full"><div className="w-4 h-2 rounded-sm bg-current"></div><div className="w-full h-1 rounded-sm bg-current/50"></div><div className="w-4 h-2 ml-auto rounded-sm bg-primary"></div></div> },
    { value: 'logo-left-menu-center-button-right', label: 'Logo Esq, Menu Centro, Botão Dir', viz: <div className="flex justify-between items-center w-full"><div className="w-4 h-2 rounded-sm bg-current"></div><div className="w-8 h-1 rounded-sm bg-current/50"></div><div className="w-4 h-2 rounded-sm bg-primary"></div></div> },
    { value: 'logo-center-menu-below', label: 'Logo Central, Menu Abaixo', viz: <div className="flex flex-col items-center w-full space-y-1"><div className="w-4 h-2 rounded-sm bg-current"></div><div className="w-full h-1 rounded-sm bg-current/50"></div></div> },
    { value: 'logo-left-button-right', label: 'Logo Esquerda, Botão Direita', viz: <div className="flex justify-between w-full items-center"><div className="w-4 h-2 rounded-sm bg-current"></div><div className="w-4 h-2 rounded-sm bg-primary"></div></div> },
    { value: 'logo-only-center', label: 'Apenas Logo (Centro)', viz: <div className="flex justify-center w-full"><div className="w-6 h-3 rounded-sm bg-current"></div></div> },
    { value: 'logo-only-left', label: 'Apenas Logo (Esquerda)', viz: <div className="flex justify-start w-full"><div className="w-6 h-3 rounded-sm bg-current"></div></div> },
];

const lucideIcons = [
    { value: 'none', label: 'Sem ícone' },
    { value: 'send', label: 'Enviar' },
    { value: 'arrow-right', label: 'Seta para a Direita' },
    { value: 'check-circle', label: 'Círculo de Verificação' },
    { value: 'plus', label: 'Mais' },
    { value: 'download', label: 'Download' },
    { value: 'star', label: 'Estrela' },
    { value: 'zap', label: 'Raio' },
];


export function HeaderSettings({ component, onPropChange, onSubPropChange }: ComponentSettingsProps) {
    const { props } = component;
    const layout = props.layout || 'logo-left-menu-right';
    const showMenu = layout.includes('menu');
    const showButton = layout.includes('button');
    const backgroundType = props.backgroundType || 'solid';
    const buttonProps = props.buttonProps || {};
    const styles = props.styles || {};

    return (
        <div className="space-y-4">
            <ImageInput 
                label="URL do Logo"
                value={props.logoUrl || ""}
                onPropChange={onPropChange}
                propName="logoUrl"
                tooltipText="URL para a imagem do logo no cabeçalho."
            />
             <div className="space-y-2">
                <Label htmlFor="header-logo-height">Altura do Logo (px)</Label>
                <Input 
                    id="header-logo-height"
                    type="number"
                    value={props.logoHeight || 40} 
                    onChange={(e) => onPropChange('logoHeight', parseInt(e.target.value, 10))}
                    placeholder="40"
                />
            </div>
             <div className="space-y-2">
                <Label htmlFor="header-layout">Layout do Cabeçalho</Label>
                <RadioGroup 
                    value={layout} 
                    onValueChange={(value) => onPropChange('layout', value)} 
                    className="grid grid-cols-2 gap-2"
                >
                    {headerLayouts.map(item => (
                         <Label
                            key={item.value}
                            htmlFor={`layout-${item.value}`}
                            className={cn(
                                "flex flex-col items-start gap-2 rounded-lg border-2 p-3 cursor-pointer transition-all text-foreground",
                                "hover:bg-accent/50 hover:border-primary/50",
                                layout === item.value && "border-primary bg-primary/5"
                            )}
                        >
                            <RadioGroupItem value={item.value} id={`layout-${item.value}`} className="sr-only" />
                            <div className="h-10 w-full flex items-center text-muted-foreground">{item.viz}</div>
                            <span className="text-xs font-semibold">{item.label}</span>
                        </Label>
                    ))}
                </RadioGroup>
            </div>
            {showMenu && (
                <div className="p-3 border rounded-md space-y-3 bg-muted/30">
                    <h4 className="font-medium text-sm">Itens de Menu</h4>
                    <HeaderLinksManager links={props.links || []} onPropChange={onPropChange} />
                     <Separator/>
                     <div className="grid grid-cols-2 gap-2 pt-2">
                         <div className="space-y-1">
                            <Label htmlFor="header-link-color">Cor do Texto</Label>
                            <Input id="header-link-color" type="color" value={props.linkColor || '#333333'} onChange={(e) => onPropChange('linkColor', e.target.value)} className="p-1 h-10"/>
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="header-link-hover-color">Cor (Hover)</Label>
                            <Input id="header-link-hover-color" type="color" value={props.linkHoverColor || '#000000'} onChange={(e) => onPropChange('linkHoverColor', e.target.value)} className="p-1 h-10"/>
                        </div>
                    </div>
                </div>
            )}
            {showButton && (
                <div className="p-3 border rounded-md space-y-3 bg-muted/30">
                     <h4 className="font-medium text-sm">Botão de Ação</h4>
                     <div className="space-y-2">
                        <Label htmlFor="header-button-text">Texto do Botão</Label>
                        <Input id="header-button-text" value={props.buttonText || ''} onChange={(e) => onPropChange('buttonText', e.target.value)} />
                     </div>
                     <div className="space-y-2">
                        <Label htmlFor="header-button-url">URL do Botão</Label>
                        <Input id="header-button-url" value={props.buttonUrl || ''} onChange={(e) => onPropChange('buttonUrl', e.target.value)} />
                     </div>
                     <Separator />
                     <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                            <Label htmlFor="header-btn-bg-color">Cor do Fundo</Label>
                            <Input id="header-btn-bg-color" type="color" value={buttonProps.bgColor || '#3b82f6'} onChange={(e) => onSubPropChange('buttonProps', 'bgColor', e.target.value)} className="p-1 h-10"/>
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="header-btn-text-color">Cor do Texto</Label>
                            <Input id="header-btn-text-color" type="color" value={buttonProps.textColor || '#FFFFFF'} onChange={(e) => onSubPropChange('buttonProps', 'textColor', e.target.value)} className="p-1 h-10"/>
                        </div>
                     </div>
                     <div className="space-y-2">
                        <Label htmlFor="header-btn-icon">Ícone do Botão</Label>
                        <Select value={buttonProps.icon || 'none'} onValueChange={(value) => onSubPropChange('buttonProps', 'icon', value)}>
                            <SelectTrigger id="header-btn-icon"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {lucideIcons.map(icon => <SelectItem key={icon.value} value={icon.value}>{icon.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                     </div>
                      {buttonProps.icon && buttonProps.icon !== 'none' && (
                        <div className="space-y-2">
                           <Label>Posição do Ícone</Label>
                           <Select value={buttonProps.iconPosition || 'left'} onValueChange={(value) => onSubPropChange('buttonProps', 'iconPosition', value)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="left">Esquerda</SelectItem>
                                    <SelectItem value="right">Direita</SelectItem>
                                </SelectContent>
                           </Select>
                        </div>
                     )}
                </div>
            )}
            <Separator />
            <h4 className="font-medium text-sm pt-2">Posicionamento e Estilo</h4>
            <div className="flex items-center justify-between">
                <Label htmlFor="header-full-width">Largura Total</Label>
                <Switch
                    id="header-full-width"
                    checked={props.isFullWidth || false}
                    onCheckedChange={(checked) => onPropChange('isFullWidth', checked)}
                />
            </div>
            {!props.isFullWidth && (
                <div className="space-y-2">
                    <Label htmlFor="header-max-width">Largura Máxima do Conteúdo</Label>
                    <Input
                        id="header-max-width"
                        value={styles.maxWidth || '1200px'}
                        onChange={(e) => onSubPropChange('styles', 'maxWidth', e.target.value)}
                        placeholder="Ex: 1200px ou 90%"
                    />
                </div>
            )}
            <div className="flex items-center justify-between">
                <Label htmlFor="header-overlay">Sobrepor na primeira seção</Label>
                <Switch
                    id="header-overlay"
                    checked={props.overlay || false}
                    onCheckedChange={(checked) => onPropChange('overlay', checked)}
                />
            </div>
             <div className="flex items-center justify-between">
                <Label htmlFor="header-sticky">Fixo no Topo (Sticky)</Label>
                <Switch
                    id="header-sticky"
                    checked={props.isSticky || false}
                    onCheckedChange={(checked) => onPropChange('isSticky', checked)}
                />
            </div>
            <div className="space-y-2">
                <Label>Cantos do Cabeçalho</Label>
                <Input id="header-border-radius" value={props.borderRadius || ''} onChange={e => onPropChange('borderRadius', e.target.value)} placeholder="Ex: 0px ou 0.5rem" />
            </div>
             <div className="p-4 border rounded-lg bg-muted/40 space-y-4">
                <Label>Estilo de Fundo</Label>
                <Select value={backgroundType} onValueChange={(value) => onPropChange('backgroundType', value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="solid">Cor Sólida</SelectItem>
                        <SelectItem value="gradient">Gradiente</SelectItem>
                    </SelectContent>
                </Select>

                {backgroundType === 'solid' && (
                    <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <Label htmlFor="header-bg-color">Cor de Fundo Inicial</Label>
                            <Input id="header-bg-color" type="color" value={props.backgroundColor || '#ffffff'} onChange={(e) => onPropChange('backgroundColor', e.target.value)} className="p-1 h-10"/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="header-bg-scroll-color">Cor de Fundo (na Rolagem)</Label>
                            <Input id="header-bg-scroll-color" type="color" value={props.backgroundColorOnScroll || '#ffffff'} onChange={(e) => onPropChange('backgroundColorOnScroll', e.target.value)} className="p-1 h-10"/>
                        </div>
                    </div>
                )}
                 {backgroundType === 'gradient' && (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Cor Inicial</Label>
                            <Input type="color" value={props.gradientFrom || '#000000'} onChange={(e) => onPropChange('gradientFrom', e.target.value)} className="p-1 h-10" />
                        </div>
                        <div className="space-y-2">
                            <Label>Cor Final</Label>
                            <Input type="color" value={props.gradientTo || '#434343'} onChange={(e) => onPropChange('gradientTo', e.target.value)} className="p-1 h-10" />
                        </div>
                    </div>
                )}
             </div>
            <Separator />
            <h4 className="font-medium text-sm pt-2">Menu Mobile</h4>
            <div className="space-y-2">
                <Label>Comportamento do Menu Mobile</Label>
                <Select value={props.mobileMenuBehavior || 'push'} onValueChange={(value: MobileMenuBehavior) => onPropChange('mobileMenuBehavior', value)}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="push">Empurrar Conteúdo</SelectItem>
                        <SelectItem value="drawer">Deslizar da Direita (Drawer)</SelectItem>
                        <SelectItem value="overlay">Tela Cheia (Overlay)</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
