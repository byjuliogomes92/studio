
import type { PageComponent } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

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
                    <Label htmlFor="de-upload-key">Chave Externa da Data Extension</Label>
                    <Input id="de-upload-key" value={props.dataExtensionKey || ''} onChange={e => onPropChange('dataExtensionKey', e.target.value)} placeholder="Chave da DE de destino" />
                </div>
                 <div className="space-y-2 mt-2">
                    <Label htmlFor="de-upload-rest-url">URL da API REST do seu Tenant</Label>
                    <Input id="de-upload-rest-url" value={props.restBaseUrl || ''} onChange={e => onPropChange('restBaseUrl', e.target.value)} placeholder="Ex: https://xxxx.rest.marketingcloudapis.com" />
                </div>
            </div>
        </div>
    );
}
