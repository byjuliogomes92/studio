
import type { PageComponent } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";


interface ComponentSettingsProps {
  component: PageComponent;
  onPropChange: (prop: string, value: any) => void;
}

export function DataExtensionUploadSettings({ component, onPropChange }: ComponentSettingsProps) {
    const { props } = component;
    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="de-upload-title">Título do Bloco</Label>
                <Input id="de-upload-title" value={props.title || 'Upload para Data Extension (V2)'} onChange={e => onPropChange('title', e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="de-upload-instruction">Texto de Instrução</Label>
                <Input id="de-upload-instruction" value={props.instructionText || 'Arraste e solte o arquivo CSV aqui'} onChange={e => onPropChange('instructionText', e.target.value)} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="de-upload-button-text">Texto do Botão</Label>
                <Input id="de-upload-button-text" value={props.buttonText || "Processar Arquivo"} onChange={e => onPropChange('buttonText', e.target.value)} />
            </div>
            <Separator />
            <div className="p-3 border rounded-md bg-muted/40">
                <h4 className="font-semibold text-sm mb-2">Configuração do Marketing Cloud</h4>
                <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                        <Label htmlFor="de-upload-key">Chave Externa da Data Extension</Label>
                         <Tooltip>
                            <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground"/></TooltipTrigger>
                            <TooltipContent><p>A chave da DE de produção. A versão de teste será prefixada automaticamente.</p></TooltipContent>
                        </Tooltip>
                    </div>
                    <Input id="de-upload-key" value={props.dataExtensionKey || ''} onChange={e => onPropChange('dataExtensionKey', e.target.value)} placeholder="Chave da DE de destino" />
                </div>
                 <div className="space-y-2 mt-2">
                    <Label htmlFor="de-upload-env">Ambiente</Label>
                    <Select value={props.environment || 'prod'} onValueChange={(value) => onPropChange('environment', value)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="prod">Produção</SelectItem>
                            <SelectItem value="test">Teste (Adiciona o prefixo "TEST_")</SelectItem>
                        </SelectContent>
                    </Select>
                 </div>
            </div>
        </div>
    );
}
