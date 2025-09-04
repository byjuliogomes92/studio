
"use client";

import type { PageComponent, CloudPage } from "@/lib/types";
import React from 'react';
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { TooltipProvider } from "@/components/ui/tooltip";
import { produce } from 'immer';
import { Star, Scaling, Film, Layers } from "lucide-react";
import { Input } from "../ui/input";

// Importe os novos componentes de configuração
import { HeaderSettings } from './settings/header-settings';
import { ColumnsSettings } from './settings/columns-settings';
import { BannerSettings } from './settings/banner-settings';
import { TextSettings } from './settings/text-settings';
import { ImageSettings } from './settings/image-settings';
import { FloatingImageSettings } from './settings/floating-image-settings';
import { VideoSettings } from './settings/video-settings';
import { CarouselSettings } from './settings/carousel-settings';
import { CountdownSettings } from './settings/countdown-settings';
import { DividerSettings } from './settings/divider-settings';
import { SpacerSettings } from './settings/spacer-settings';
import { ButtonSettings } from './settings/button-settings';
import { DownloadButtonSettings } from './settings/download-button-settings';
import { FloatingButtonSettings } from './settings/floating-button-settings';
import { FormSettings } from './settings/form-settings';
import { ListManagerSettings } from './settings/list-managers';
import { VotingSettings } from './settings/voting-settings';
import { StripeSettings } from './settings/stripe-settings';
import { NPSSettings } from './settings/nps-settings';
import { MapSettings } from './settings/map-settings';
import { SocialIconsSettings } from './settings/social-icons-settings';
import { WhatsAppSettings } from './settings/whatsapp-settings';
import { FTPUploadSettings } from './settings/ftpupload-settings';
import { DataExtensionUploadSettings } from './settings/data-extension-upload-settings';
import { CalendlySettings } from './settings/calendly-settings';
import { SpacingSettings } from "./settings/spacing-settings";
import { AnimationSettings } from "./settings/animation-settings";

interface ComponentSettingsProps {
  component: PageComponent;
  onComponentChange: (id: string, newProps: Partial<PageComponent>) => void;
  projectPages: CloudPage[];
}

const renderComponentSettings = (
  component: PageComponent,
  onPropChange: (prop: string, value: any) => void,
  onSubPropChange: (prop: string, subProp: string, value: any) => void,
  projectPages: CloudPage[]
) => {
    const props = { component, onPropChange, onSubPropChange, projectPages };

    console.log('--- DENTRO DE renderComponentSettings ---');
    console.log('Tipo do componente recebido:', `"${component.type}"`); // Aspas para revelar espaços em branco
    console.log('A comparação (component.type === "Div") resulta em:', component.type === "Div");


    switch (component.type) {
      case "Header": return <HeaderSettings {...props} />;
      case "Columns": return <ColumnsSettings {...props} />;
      case "Banner": return <BannerSettings {...props} />;
      case "Title":
      case "Subtitle":
      case "Paragraph": return <TextSettings {...props} />;
      case "Image": return <ImageSettings {...props} />;
      case "FloatingImage": return <FloatingImageSettings {...props} />;
      case "Video": return <VideoSettings {...props} />;
      case "Carousel": return <CarouselSettings {...props} />;
      case "Countdown": return <CountdownSettings {...props} />;
      case "Divider": return <DividerSettings {...props} />;
      case "Spacer": return <SpacerSettings {...props} />;
      case "Button": return <ButtonSettings {...props} />;
      case "DownloadButton": return <DownloadButtonSettings {...props} />;
      case "FloatingButton": return <FloatingButtonSettings {...props} />;
      case "Form": return <FormSettings {...props} />;
      case 'Accordion':
      case 'Tabs': return <ListManagerSettings {...props} />;
      case 'Voting': return <VotingSettings {...props} />;
      case 'Stripe': return <StripeSettings {...props} />;
      case 'NPS': return <NPSSettings {...props} />;
      case 'Map': return <MapSettings {...props} />;
      case 'SocialIcons': return <SocialIconsSettings {...props} />;
      case 'WhatsApp': return <WhatsAppSettings {...props} />;
      case 'FTPUpload': return <FTPUploadSettings {...props} />;
      case 'DataExtensionUpload': return <DataExtensionUploadSettings {...props} />;
      case 'Calendly': return <CalendlySettings {...props} />;
      default:
        return <p className="text-sm text-muted-foreground">Nenhuma configuração disponível para este componente.</p>;
    }
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
