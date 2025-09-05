
import type { PageComponent, ButtonVariant, CloudPage } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AiGenerateTextDialog } from "./ai-generate-text-dialog";
import { Wand2, Square, Circle, Hand, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ColorInput } from "./color-input";

interface ComponentSettingsProps {
  component: PageComponent;
  onPropChange: (prop: string, value: any) => void;
  onSubPropChange: (prop: string, subProp: string, value: any) => void;
  projectPages: CloudPage[];
  pageState: CloudPage;
}

export function ButtonSettings({ component, onPropChange, onSubPropChange, projectPages, pageState }: ComponentSettingsProps) {
    const { props } = component;
    const styles = props.styles || {};
    
    const handleStyleChange = (prop: string, value: any) => {
        onSubPropChange('styles', prop, value);
    };

    return (
        <div className="space-y-6">
            
            <div>
                <h4 className="font-semibold text-sm mb-2">Conteúdo</h4>
                <div className="space-y-4 p-4 border rounded-md bg-muted/30">
                    <div className="space-y-2">
                        <Label htmlFor="button-text">Texto do Botão</Label>
                        <div className="relative">
                            <Input
                                id="button-text"
                                value={props.text || ''}
                                onChange={(e) => onPropChange('text', e.target.value)}
                                placeholder="Clique Aqui"
                                className="pr-10"
                            />
                            <AiGenerateTextDialog
                                componentType="Button"
                                currentText={props.text || ""}
                                onTextGenerated={(newText: string) => onPropChange("text", newText)}
                                trigger={
                                    <button className="absolute top-1/2 right-1 -translate-y-1/2 h-8 w-8 text-primary grid place-items-center hover:bg-accent rounded-md">
                                        <Wand2 className="h-4 w-4" />
                                    </button>
                                }
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                    <Label htmlFor="button-action-type">Ação do Botão</Label>
                    <Select
                        value={props.action?.type || 'URL'}
                        onValueChange={(value) => onPropChange('action', { ...props.action, type: value })}
                    >
                        <SelectTrigger id="button-action-type">
                        <SelectValue placeholder="Selecione uma ação" />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="URL">Ir para URL externa</SelectItem>
                        <SelectItem value="PAGE">Ir para outra página</SelectItem>
                        <SelectItem value="CLOSE_POPUP">Fechar Pop-up</SelectItem>
                        </SelectContent>
                    </Select>
                    </div>

                    {(!props.action || props.action.type === 'URL') && (
                    <div className="space-y-2">
                        <Label htmlFor="button-href">URL do Link</Label>
                        <Input
                        id="button-href"
                        value={props.action?.url || ''}
                        onChange={(e) => onPropChange('action', { ...props.action, url: e.target.value, type: 'URL' })}
                        placeholder="https://exemplo.com"
                        />
                    </div>
                    )}

                    {(props.action?.type === 'PAGE') && (
                    <div className="space-y-2">
                        <Label htmlFor="button-page-id">Página de Destino</Label>
                        <Select
                        value={props.action?.pageId || ''}
                        onValueChange={(value) => onPropChange('action', { ...props.action, pageId: value, type: 'PAGE' })}
                        >
                        <SelectTrigger id="button-page-id">
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
                </div>
            </div>

            <div>
                <h4 className="font-semibold text-sm mb-2">Estilo</h4>
                <div className="space-y-4 p-4 border rounded-md bg-muted/30">
                    <div className="space-y-2">
                        <Label htmlFor="button-variant">Variante Visual</Label>
                        <Select value={props.variant || 'default'} onValueChange={(value: ButtonVariant) => onPropChange('variant', value)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="default">Padrão</SelectItem>
                                <SelectItem value="destructive">Destrutivo</SelectItem>
                                <SelectItem value="outline">Contorno</SelectItem>
                                <SelectItem value="secondary">Secundário</SelectItem>
                                <SelectItem value="ghost">Fantasma</SelectItem>
                                <SelectItem value="link">Link</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Alinhamento do Bloco</Label>
                        <ToggleGroup type="single" value={props.align || 'center'} onValueChange={(value) => value && onPropChange('align', value)} className="w-full">
                           <ToggleGroupItem value="left" aria-label="Alinhar à esquerda"><AlignLeft className="h-4 w-4"/></ToggleGroupItem>
                           <ToggleGroupItem value="center" aria-label="Centralizar"><AlignCenter className="h-4 w-4"/></ToggleGroupItem>
                           <ToggleGroupItem value="right" aria-label="Alinhar à direita"><AlignRight className="h-4 w-4"/></ToggleGroupItem>
                        </ToggleGroup>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <ColorInput 
                            label="Cor de Fundo" 
                            value={styles.backgroundColor || ''}
                            onChange={value => handleStyleChange('backgroundColor', value)}
                            brand={pageState.brand}
                            tooltip="Define a cor de fundo do botão. Deixe em branco para usar o estilo da Variante."
                        />
                        <ColorInput 
                            label="Cor do Texto" 
                            value={styles.color || ''}
                            onChange={value => handleStyleChange('color', value)}
                            brand={pageState.brand}
                             tooltip="Define a cor do texto do botão. Deixe em branco para usar o estilo da Variante."
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Cantos do Botão (Específico)</Label>
                        <ToggleGroup type="single" value={styles.borderRadius} onValueChange={(value) => value && handleStyleChange('borderRadius', value)} className="w-full">
                            <ToggleGroupItem value="0.25rem" aria-label="Reto"><Square className="h-5 w-5"/></ToggleGroupItem>
                            <ToggleGroupItem value="0.5rem" aria-label="Curvado"><div className="w-5 h-5 border-2 border-current rounded-md"></div></ToggleGroupItem>
                            <ToggleGroupItem value="9999px" aria-label="Redondo"><Circle className="h-5 w-5"/></ToggleGroupItem>
                        </ToggleGroup>
                        <p className="text-xs text-muted-foreground">Deixe em branco para usar o estilo global do Kit de Marca.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
