
import type { PageComponent } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

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
                <Input id="de-upload-title" value={props.title || ''} onChange={e => onPropChange('title', e.target.value)} placeholder="Upload para Data Extension" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="de-upload-instruction">Texto de Instrução</Label>
                <Input id="de-upload-instruction" value={props.instructionText || ''} onChange={e => onPropChange('instructionText', e.target.value)} placeholder="Arraste e solte o arquivo CSV aqui" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="de-upload-key">Chave Externa da Data Extension</Label>
                <Input id="de-upload-key" value={props.dataExtensionKey || ''} onChange={e => onPropChange('dataExtensionKey', e.target.value)} placeholder="Chave da DE de destino" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="de-upload-button-text">Texto do Botão</Label>
                <Input id="de-upload-button-text" value={props.buttonText || "Processar Arquivo"} onChange={e => onPropChange('buttonText', e.target.value)} />
            </div>
        </div>
    );
}
