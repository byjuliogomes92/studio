
import type { PageComponent } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ComponentSettingsProps {
  component: PageComponent;
  onPropChange: (prop: string, value: any) => void;
  onSubPropChange: (prop: string, subProp: string, value: any) => void;
}

const lucideIcons = [
    { value: 'none', label: 'Sem ícone' },
    { value: 'send', label: 'Enviar' },
    { value: 'arrow-right', label: 'Seta para a Direita' },
    { value: 'check-circle', label: 'Círculo de Verificação' },
    { value: 'plus', label: 'Mais' },
    { value: 'download', label: 'Download' },
    { value: 'star', label: 'Estrela' },
    { value: 'zap', label: 'Raio' },
];

export function FTPUploadSettings({ component, onPropChange, onSubPropChange }: ComponentSettingsProps) {
    const { props } = component;
    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="ftp-title">Título do Bloco</Label>
                <Input id="ftp-title" value={props.title || ''} onChange={e => onPropChange('title', e.target.value)} placeholder="Upload de Base de Clientes" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="ftp-instruction">Texto de Instrução</Label>
                <Input id="ftp-instruction" value={props.instructionText || ''} onChange={e => onPropChange('instructionText', e.target.value)} placeholder="Arraste e solte o arquivo ou clique aqui" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="ftp-path">Caminho de Destino no FTP</Label>
                <Input id="ftp-path" value={props.destinationPath || ''} onChange={e => onPropChange('destinationPath', e.target.value)} placeholder="/Import" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="ftp-filename">Nome do Arquivo no FTP</Label>
                <Input id="ftp-filename" value={props.destinationFilename || ''} onChange={e => onPropChange('destinationFilename', e.target.value)} placeholder="arquivo_%%Date%%.csv" />
            </div>
             <div className="space-y-2">
                <Label htmlFor="ftp-de">Data Extension Alvo (Informativo)</Label>
                <Input id="ftp-de" value={props.dataExtensionName || ''} onChange={e => onPropChange('dataExtensionName', e.target.value)} placeholder="Nome da DE que receberá os dados" />
            </div>
            <Separator />
            <h4 className="font-semibold">Estilo do Botão de Envio</h4>
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="ftp-button-text">Texto do Botão</Label>
                    <Input id="ftp-button-text" value={props.buttonProps?.text || "Enviar Arquivo"} onChange={(e) => onSubPropChange('buttonProps', 'text', e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Cor de Fundo</Label>
                        <Input type="color" value={props.buttonProps?.bgColor || '#000000'} onChange={(e) => onSubPropChange('buttonProps', 'bgColor', e.target.value)} className="p-1 h-10" />
                    </div>
                    <div className="space-y-2">
                        <Label>Cor do Texto</Label>
                        <Input type="color" value={props.buttonProps?.textColor || '#FFFFFF'} onChange={(e) => onSubPropChange('buttonProps', 'textColor', e.target.value)} className="p-1 h-10" />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>Ícone</Label>
                    <Select value={props.buttonProps?.icon || 'none'} onValueChange={(value) => onSubPropChange('buttonProps', 'icon', value)}>
                        <SelectTrigger><SelectValue placeholder="Sem ícone"/></SelectTrigger>
                        <SelectContent>
                            {lucideIcons.map(icon => <SelectItem key={icon.value} value={icon.value}>{icon.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
}
