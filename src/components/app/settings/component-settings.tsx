
"use client";

import type { PageComponent, CloudPage } from "@/lib/types";
import React from 'react';
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { TooltipProvider } from "@/components/ui/tooltip";
import { produce } from 'immer';
import { Star, Scaling, Film, Layers, LayoutGrid } from "lucide-react";
import { Input } from "../ui/input";

// Importe os novos componentes de configuração
import { DivSettings } from './div-settings';
import { HeaderSettings } from './header-settings';
import { FooterSettings } from './footer-settings';
import { ColumnsSettings } from './columns-settings';
import { BannerSettings } from './banner-settings';
import { TextSettings } from './text-settings';
import { ImageSettings } from './image-settings';
import { FloatingImageSettings } from './floating-image-settings';
import { VideoSettings } from './video-settings';
import { CarouselSettings } from './carousel-settings';
import { CountdownSettings } from './countdown-settings';
import { DividerSettings } from './divider-settings';
import { SpacerSettings } from './spacer-settings';
import { ButtonSettings } from './button-settings';
import { DownloadButtonSettings } from './download-button-settings';
import { FloatingButtonSettings } from './floating-button-settings';
import { FormSettings } from './form-settings';
import { ListManagerSettings } from './list-managers';
import { VotingSettings } from './voting-settings';
import { StripeSettings } from './stripe-settings';
import { NPSSettings } from './nps-settings';
import { MapSettings } from './map-settings';
import { SocialIconsSettings } from './social-icons-settings';
import { WhatsAppSettings } from './whatsapp-settings';
import { FTPUploadSettings } from './ftpupload-settings';
import { DataExtensionUploadSettings } from './data-extension-upload-settings';
import { CalendlySettings } from './calendly-settings';
import { SpacingSettings } from "./spacing-settings";
import { AnimationSettings } from "./animation-settings";
import { LayoutSettings } from "./layout-settings";

interface ComponentSettingsProps {
  component: PageComponent;
  onComponentChange: (id: string, newProps: Partial<PageComponent>) => void;
  projectPages: CloudPage[];
}

const componentMap: { [key: string]: React.FC<any> } = {
    Div: DivSettings,
    Header: HeaderSettings,
    Footer: FooterSettings,
    Columns: ColumnsSettings,
    Banner: BannerSettings,
    Title: TextSettings,
    Subtitle: TextSettings,
    Paragraph: TextSettings,
    Image: ImageSettings,
    FloatingImage: FloatingImageSettings,
    Video: VideoSettings,
    Carousel: CarouselSettings,
    Countdown: CountdownSettings,
    Divider: DividerSettings,
    Spacer: SpacerSettings,
    Button: ButtonSettings,
    DownloadButton: DownloadButtonSettings,
    FloatingButton: FloatingButtonSettings,
    Form: FormSettings,
    Accordion: ListManagerSettings,
    Tabs: ListManagerSettings,
    Voting: VotingSettings,
    Stripe: StripeSettings,
    NPS: NPSSettings,
    Map: MapSettings,
    SocialIcons: SocialIconsSettings,
    WhatsApp: WhatsAppSettings,
    FTPUpload: FTPUploadSettings,
    DataExtensionUpload: DataExtensionUploadSettings,
    Calendly: CalendlySettings,
};

const renderComponentSettings = (
  component: PageComponent,
  onPropChange: (prop: string, value: any) => void,
  onSubPropChange: (prop: string, subProp: string, value: any) => void,
  projectPages: CloudPage[]
) => {
    const props = { component, onPropChange, onSubPropChange, projectPages };

    const SettingsComponent = componentMap[component.type];

    if (SettingsComponent) {
        return <SettingsComponent {...props} />;
    }

    return <p className="text-sm text-muted-foreground">Nenhuma configuração disponível para este componente.</p>;
}

export function ComponentSettings({ component, onComponentChange, projectPages }: ComponentSettingsProps) {
  const abTestEnabled = component.abTestEnabled || false;
  const variantProps = (component.abTestVariants && component.abTestVariants[0]) || {};

  const handlePropChange = (prop: string, value: any) => {
    const updatedComponent = produce(component, draft => {
      draft.props[prop] = value;
    });
    onComponentChange(component.id, updatedComponent);
  };
  
  const handleLayerNameChange = (name: string) => {
    const updatedComponent = produce(component, draft => {
        draft.layerName = name;
    });
    onComponentChange(component.id, updatedComponent);
  };

  const handleSubPropChange = (prop: string, subProp: string, value: any) => {
    const updatedComponent = produce(component, draft => {
        if (!draft.props[prop]) {
            draft.props[prop] = {};
        }
        draft.props[prop][subProp] = value;
    });
    onComponentChange(component.id, updatedComponent);
  };

  const handleAbTestToggle = (checked: boolean) => {
    const updatedComponent = produce(component, draft => {
      draft.abTestEnabled = checked;
      if (checked && (!draft.abTestVariants || draft.abTestVariants.length === 0)) {
        draft.abTestVariants = [{}];
      }
    });
    onComponentChange(component.id, updatedComponent);
  };
  
  const handleVariantPropChange = (variantIndex: number, prop: string, value: any) => {
    const updatedComponent = produce(component, draft => {
      if (!draft.abTestVariants) {
        draft.abTestVariants = [];
      }
      while (draft.abTestVariants.length <= variantIndex) {
        draft.abTestVariants.push({});
      }
      draft.abTestVariants[variantIndex] = {
        ...draft.abTestVariants[variantIndex],
        [prop]: value,
      };
    });
    onComponentChange(component.id, updatedComponent);
  };
  
  const handleVariantSubPropChange = (variantIndex: number, prop: string, subProp: string, value: any) => {
    const updatedComponent = produce(component, draft => {
        if (!draft.abTestVariants) {
            draft.abTestVariants = [{}];
        }
        if (!draft.abTestVariants[variantIndex]) {
            draft.abTestVariants[variantIndex] = {};
        }
        if (!draft.abTestVariants[variantIndex][prop]) {
            draft.abTestVariants[variantIndex][prop] = {};
        }
        draft.abTestVariants[variantIndex][prop][subProp] = value;
    });
    onComponentChange(component.id, updatedComponent);
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="space-y-2">
            <Label htmlFor="layer-name" className="flex items-center gap-2 text-xs uppercase text-muted-foreground">
                <Layers className="h-3 w-3"/>
                Nome da Camada
            </Label>
            <Input
                id="layer-name"
                value={component.layerName || ''}
                onChange={(e) => handleLayerNameChange(e.target.value)}
                placeholder={component.type}
            />
        </div>
        
        <Separator />

        <div>
            <h3 className="text-sm font-medium mb-4">Configurações Gerais</h3>
            {renderComponentSettings(component, handlePropChange, handleSubPropChange, projectPages)}
        </div>
        
        {component.parentId && (
            <>
                <Separator />
                <div>
                    <h3 className="text-sm font-medium mb-4 flex items-center gap-2"><LayoutGrid className="h-4 w-4" /> Layout</h3>
                    <LayoutSettings props={component.props} onPropChange={handlePropChange} />
                </div>
            </>
        )}
        
        <Separator />
        
        <div>
            <h3 className="text-sm font-medium mb-4 flex items-center gap-2"><Scaling className="h-4 w-4" /> Espaçamento</h3>
            <SpacingSettings props={component.props} onPropChange={handlePropChange} />
        </div>

        <Separator />
        
        <div>
            <h3 className="text-sm font-medium mb-4 flex items-center gap-2"><Film className="h-4 w-4" /> Animações</h3>
            <AnimationSettings props={component.props} onPropChange={handlePropChange} />
        </div>

        <Separator />
        
        <div className="space-y-4">
             <div className="flex items-center justify-between">
                <Label htmlFor="ab-test-enabled" className="flex items-center gap-2 font-semibold">
                    <Star className="h-4 w-4 text-yellow-500"/>
                    Teste A/B
                </Label>
                <Switch
                    id="ab-test-enabled"
                    checked={abTestEnabled}
                    onCheckedChange={handleAbTestToggle}
                />
            </div>
            {abTestEnabled && (
                <div className="p-4 border rounded-md space-y-6 bg-muted/30">
                     <h4 className="font-medium text-sm text-muted-foreground">Configurações da Variante B</h4>
                     <div>
                        <h3 className="text-sm font-medium mb-4">Configurações Gerais (Variante)</h3>
                         {renderComponentSettings(
                            {...component, props: variantProps}, 
                             (prop, value) => handleVariantPropChange(0, prop, value), 
                             (prop, subProp, value) => handleVariantSubPropChange(0, prop, subProp, value),
                             projectPages
                          )}
                     </div>
                     <Separator/>
                     <div>
                        <h3 className="text-sm font-medium mb-4 flex items-center gap-2"><Scaling className="h-4 w-4" /> Espaçamento (Variante)</h3>
                        <SpacingSettings props={variantProps} onPropChange={(prop, value) => handleVariantPropChange(0, prop, value)} />
                     </div>
                     <Separator/>
                     <div>
                        <h3 className="text-sm font-medium mb-4 flex items-center gap-2"><Film className="h-4 w-4" /> Animações (Variante)</h3>
                        <AnimationSettings props={variantProps} onPropChange={(prop, value) => handleVariantPropChange(0, prop, value)} />
                     </div>
                </div>
            )}
        </div>
      </div>
    </TooltipProvider>
  )
}
