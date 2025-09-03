
import type { PageComponent } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface ComponentSettingsProps {
  component: PageComponent;
  onPropChange: (prop: string, value: any) => void;
  onSubPropChange: (prop: string, subProp: string, value: any) => void;
}

export function DownloadButtonSettings({ component, onPropChange, onSubPropChange }: ComponentSettingsProps) {
    const { props } = component;
    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="download-text">Texto do Botão</Label>
                <Input
                    id="download-text"
                    value={props.text || 'Download'}
                    onChange={(e) => onPropChange('text', e.target.value)}
                    placeholder="Ex: Baixar PDF"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="download-url">URL do Arquivo</Label>
                <Input
                    id="download-url"
                    value={props.fileUrl || ''}
                    onChange={(e) => onPropChange('fileUrl', e.target.value)}
                    placeholder="https://exemplo.com/arquivo.pdf"
                />
            </div>
             <div className="space-y-2">
                <Label htmlFor="download-filename">Nome do Arquivo (ao Salvar)</Label>
                <Input
                    id="download-filename"
                    value={props.fileName || ''}
                    onChange={(e) => onPropChange('fileName', e.target.value)}
                    placeholder="Ex: catalogo.pdf"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="download-align">Alinhamento</Label>
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
            <Separator />
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label htmlFor="conditional-display" className="font-semibold">Exibição Condicional</Label>
                    <Switch
                        id="conditional-display"
                        checked={props.conditionalDisplay?.enabled || false}
                        onCheckedChange={(checked) => onSubPropChange('conditionalDisplay', 'enabled', checked)}
                    />
                </div>
                {props.conditionalDisplay?.enabled && (
                    <div className="space-y-2">
                        <Label htmlFor="conditional-trigger">Gatilho de Exibição</Label>
                        <Select 
                            value={props.conditionalDisplay?.trigger || 'form_submission'}
                            onValueChange={(value) => onSubPropChange('conditionalDisplay', 'trigger', value)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="form_submission">Após envio de formulário</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </div>
        </div>
    );
}
