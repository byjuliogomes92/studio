
import type { PageComponent } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SpacingSettings } from "./spacing-settings";
import { AnimationSettings } from "./animation-settings";
import { Separator } from "@/components/ui/separator";

interface ResponsiveSettingsProps {
    component: PageComponent;
    onPropChange: (prop: string, value: any) => void;
    onSubPropChange: (prop: string, subProp: string, value: any) => void;
}

export function ResponsiveSettings({ component, onSubPropChange }: ResponsiveSettingsProps) {
    const { props } = component;
    const responsiveProps = props.responsive || {};
    const mobileStyles = responsiveProps.mobileStyles || {};

    const handleResponsiveChange = (prop: string, value: any) => {
        onSubPropChange('responsive', prop, value);
    };
    
    const handleMobileStyleChange = (prop: string, value: any) => {
        const newMobileStyles = { ...mobileStyles, [prop]: value };
        handleResponsiveChange('mobileStyles', newMobileStyles);
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2 p-2 border rounded-md">
                <h4 className="text-sm font-medium mb-2">Visibilidade</h4>
                <div className="flex items-center justify-between">
                    <Label htmlFor="show-desktop">Mostrar em Desktop</Label>
                    <Switch
                        id="show-desktop"
                        checked={!responsiveProps.hiddenOnDesktop}
                        onCheckedChange={(checked) => handleResponsiveChange('hiddenOnDesktop', !checked)}
                    />
                </div>
                <div className="flex items-center justify-between">
                    <Label htmlFor="show-mobile">Mostrar em Mobile</Label>
                    <Switch
                        id="show-mobile"
                        checked={!responsiveProps.hiddenOnMobile}
                        onCheckedChange={(checked) => handleResponsiveChange('hiddenOnMobile', !checked)}
                    />
                </div>
            </div>

            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="mobile-styles">
                    <AccordionTrigger>Estilos Específicos para Mobile</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-2">
                        <p className="text-xs text-muted-foreground">
                            As configurações abaixo irão sobrescrever os estilos padrão apenas em telas menores (abaixo de 768px).
                        </p>
                        <Separator />
                        <h4 className="text-sm font-medium pt-2">Espaçamento (Mobile)</h4>
                        <SpacingSettings props={{ styles: mobileStyles }} onPropChange={(_, value) => handleResponsiveChange('mobileStyles', value)} />
                        
                        <Separator />
                        <h4 className="text-sm font-medium pt-2">Animações (Mobile)</h4>
                        <AnimationSettings props={{ styles: mobileStyles }} onPropChange={(_, value) => handleResponsiveChange('mobileStyles', value)} />
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
}
