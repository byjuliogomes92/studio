
"use client";

import type { PageComponent } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ColorInput } from "./color-input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { produce } from "immer";

interface ComponentSettingsProps {
  component: PageComponent;
  onPropChange: (prop: string, value: any) => void;
  onSubPropChange: (prop: string, subProp: string, value: any) => void;
  pageState: any; // Simplified for this component
}

export function PopUpSettings({ component, onPropChange, onSubPropChange, pageState }: ComponentSettingsProps) {
    const { props } = component;
    const styles = props.styles || {};
    const overlayStyles = props.overlayStyles || {};

    const handleStyleChange = (prop: string, value: any) => {
        onSubPropChange('styles', prop, value);
    };
    
    const handleOverlayStyleChange = (prop: string, value: any) => {
        onSubPropChange('overlayStyles', prop, value);
    };

    return (
        <div className="space-y-4">
            <Accordion type="multiple" defaultValue={['trigger', 'style']} className="w-full">
                <AccordionItem value="trigger">
                    <AccordionTrigger>Gatilho de Exibição</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-2">
                        <div className="space-y-2">
                            <Label>Como o pop-up deve abrir?</Label>
                            <Select value={props.trigger || 'delay'} onValueChange={(value) => onPropChange('trigger', value)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="entry">Na Entrada</SelectItem>
                                    <SelectItem value="delay">Atraso de Tempo</SelectItem>
                                    <SelectItem value="scroll">Rolagem da Página</SelectItem>
                                    <SelectItem value="exit_intent">Intenção de Saída</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {props.trigger === 'delay' && (
                            <div className="space-y-2">
                                <Label htmlFor="popup-delay">Atraso (em segundos)</Label>
                                <Input id="popup-delay" type="number" value={props.delay || 3} onChange={(e) => onPropChange('delay', parseInt(e.target.value, 10))} />
                            </div>
                        )}
                         {props.trigger === 'scroll' && (
                            <div className="space-y-2">
                                <Label htmlFor="popup-scroll">Rolagem (%)</Label>
                                <Input id="popup-scroll" type="number" value={props.scrollPercentage || 50} onChange={(e) => onPropChange('scrollPercentage', parseInt(e.target.value, 10))} />
                            </div>
                        )}
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="style">
                    <AccordionTrigger>Estilo do Pop-up</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-2">
                        <div className="space-y-2">
                            <Label htmlFor="popup-width">Largura</Label>
                            <Input id="popup-width" value={styles.width || '500px'} onChange={e => handleStyleChange('width', e.target.value)} placeholder="Ex: 500px ou 80%" />
                        </div>
                         <div className="space-y-2">
                            <ColorInput label="Cor de Fundo" value={styles.backgroundColor || '#FFFFFF'} onChange={value => handleStyleChange('backgroundColor', value)} brand={pageState.brand} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="popup-padding">Espaçamento Interno</Label>
                            <Input id="popup-padding" value={styles.padding || '1.5rem'} onChange={e => handleStyleChange('padding', e.target.value)} placeholder="Ex: 2rem" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="popup-border-radius">Arredondamento da Borda</Label>
                            <Input id="popup-border-radius" value={styles.borderRadius || '0.75rem'} onChange={e => handleStyleChange('borderRadius', e.target.value)} placeholder="Ex: 12px" />
                        </div>
                    </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="overlay">
                    <AccordionTrigger>Estilo do Fundo (Overlay)</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-2">
                         <div className="space-y-2">
                             <ColorInput label="Cor do Fundo" value={overlayStyles.backgroundColor || 'rgba(0, 0, 0, 0.6)'} onChange={value => handleOverlayStyleChange('backgroundColor', value)} brand={pageState.brand} />
                         </div>
                    </AccordionContent>
                 </AccordionItem>
                 <AccordionItem value="behavior">
                    <AccordionTrigger>Comportamento</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="popup-close-outside">Fechar ao clicar fora</Label>
                            <Switch
                                id="popup-close-outside"
                                checked={props.closeOnOutsideClick !== false}
                                onCheckedChange={(checked) => onPropChange('closeOnOutsideClick', checked)}
                            />
                        </div>
                         <div className="flex items-center justify-between">
                            <Label htmlFor="popup-prevent-scroll">Impedir rolagem do fundo</Label>
                            <Switch
                                id="popup-prevent-scroll"
                                checked={props.preventBodyScroll === true}
                                onCheckedChange={(checked) => onPropChange('preventBodyScroll', checked)}
                            />
                        </div>
                    </AccordionContent>
                 </AccordionItem>
            </Accordion>
        </div>
    );
}
