
import type { PageComponent, ButtonVariant, CloudPage } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AiGenerateTextDialog } from "./ai-generate-text-dialog";
import { Wand2 } from "lucide-react";

interface ComponentSettingsProps {
  component: PageComponent;
  onPropChange: (prop: string, value: any) => void;
  projectPages: CloudPage[];
}

export function ButtonSettings({ component, onPropChange, projectPages }: ComponentSettingsProps) {
    const { props } = component;
    return (
        <div className="space-y-4">
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
            <div className="space-y-2">
                <Label htmlFor="button-variant">Variante</Label>
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
                <Label htmlFor="button-align">Alinhamento</Label>
                 <Select value={props.align || 'center'} onValueChange={(value) => onPropChange('align', value)}>
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
        </div>
    );
}
