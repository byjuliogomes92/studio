
import type { PageComponent, CloudPage, CampaignGroup, UploadTarget } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ColorInput } from "./color-input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, HelpCircle } from "lucide-react";

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

function FtpUploadTargetManager({
    targets = [],
    onTargetsChange,
}: {
    targets: Partial<UploadTarget>[];
    onTargetsChange: (targets: Partial<UploadTarget>[]) => void;
}) {
    const handleTargetChange = (id: string, field: 'name' | 'destinationPath' | 'destinationFilename', value: any) => {
        const newTargets = targets.map((t) =>
            t.id === id ? { ...t, [field]: value } : t
        );
        onTargetsChange(newTargets);
    };

    const addTarget = () => {
        const newTarget: Partial<UploadTarget> = {
            id: `target-${Date.now()}`,
            name: 'Novo Destino FTP',
            destinationPath: '/Import',
            destinationFilename: 'arquivo_%%Date%%.csv',
        };
        onTargetsChange([...(targets || []), newTarget]);
    };

    const removeTarget = (id: string) => {
        onTargetsChange(targets.filter((t) => t.id !== id));
    };
    
    return (
        <div className="space-y-3">
             <Accordion type="multiple" className="w-full space-y-3">
                {targets.map((target) => (
                    <AccordionItem key={target.id} value={target.id!} className="p-3 border rounded-md space-y-3 bg-background relative">
                        <div className="flex items-center justify-between">
                            <AccordionTrigger className="p-0 text-base font-semibold">{target.name || 'Novo Destino'}</AccordionTrigger>
                             <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeTarget(target.id!)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                        <AccordionContent className="pt-2 space-y-3">
                            <div className="space-y-1">
                                <Label htmlFor={`target-name-${target.id}`} className="text-xs">Nome do Destino (visível para o usuário)</Label>
                                <Input id={`target-name-${target.id}`} value={target.name} onChange={(e) => handleTargetChange(target.id!, 'name', e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor={`target-path-${target.id}`} className="text-xs">Caminho da Pasta no FTP</Label>
                                <Input id={`target-path-${target.id}`} value={target.destinationPath || ''} onChange={(e) => handleTargetChange(target.id!, 'destinationPath', e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor={`target-filename-${target.id}`} className="text-xs">Padrão do Nome do Arquivo</Label>
                                <Input id={`target-filename-${target.id}`} value={target.destinationFilename || ''} onChange={(e) => handleTargetChange(target.id!, 'destinationFilename', e.target.value)} />
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
            <Button variant="outline" className="w-full" onClick={addTarget}>
                <Plus className="mr-2 h-4 w-4" /> Adicionar Destino FTP
            </Button>
        </div>
    );
}

function FtpCampaignGroupManager({
    campaignGroups = [],
    onPropChange,
}: {
    campaignGroups: CampaignGroup[];
    onPropChange: (prop: string, value: any) => void;
}) {
    const handleGroupChange = (id: string, field: 'name' | 'uploadTargets', value: any) => {
        const newGroups = campaignGroups.map(g => 
            g.id === id ? { ...g, [field]: value } : g
        );
        onPropChange('campaignGroups', newGroups);
    };
    
    const addGroup = () => {
        const newGroup: CampaignGroup = {
            id: `group-${Date.now()}`,
            name: 'Nova Campanha',
            uploadTargets: [],
        };
        onPropChange('campaignGroups', [...(campaignGroups || []), newGroup]);
    };

    const removeGroup = (id: string) => {
        onPropChange('campaignGroups', campaignGroups.filter(g => g.id !== id));
    };

    return (
        <div className="space-y-3">
             <Accordion type="multiple" className="w-full space-y-3">
                {campaignGroups.map((group) => (
                    <AccordionItem key={group.id} value={group.id} className="p-3 border rounded-md space-y-3 bg-muted/40 relative">
                        <div className="flex items-center justify-between">
                            <AccordionTrigger className="p-0 text-base font-semibold">{group.name || 'Novo Grupo'}</AccordionTrigger>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeGroup(group.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                        <AccordionContent className="pt-2 space-y-3">
                            <div className="space-y-1">
                                <Label htmlFor={`group-name-${group.id}`} className="text-xs">Nome do Grupo de Campanhas</Label>
                                <Input id={`group-name-${group.id}`} value={group.name} onChange={(e) => handleGroupChange(group.id, 'name', e.target.value)} />
                            </div>
                            <Separator />
                            <h5 className="font-medium text-sm pt-2">Destinos de Upload (FTP)</h5>
                            <FtpUploadTargetManager targets={group.uploadTargets} onTargetsChange={(targets) => handleGroupChange(group.id, 'uploadTargets', targets)} />
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
            <Button variant="outline" className="w-full" onClick={addGroup}>
                <Plus className="mr-2 h-4 w-4" /> Adicionar Grupo de Campanha
            </Button>
        </div>
    );
}

interface ComponentSettingsProps {
  component: PageComponent;
  onPropChange: (prop: string, value: any) => void;
  onSubPropChange: (prop: string, subProp: string, value: any) => void;
  pageState: CloudPage;
}

export function FTPUploadSettings({ component, onPropChange, onSubPropChange, pageState }: ComponentSettingsProps) {
    const { props } = component;
    const buttonProps = props.buttonProps || {};

    const handleButtonPropsChange = (prop: string, value: string) => {
        onSubPropChange('buttonProps', prop, value);
    }
    return (
        <Accordion type="multiple" defaultValue={['general']} className="w-full">
             <AccordionItem value="general">
                <AccordionTrigger>Geral</AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2">
                    <div className="space-y-2">
                        <Label htmlFor="ftp-title">Título do Bloco</Label>
                        <Input id="ftp-title" value={props.title || 'Upload para FTP'} onChange={e => onPropChange('title', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="ftp-instruction">Texto de Instrução</Label>
                        <Input id="ftp-instruction" value={props.instructionText || 'Arraste e solte o arquivo ou clique aqui'} onChange={e => onPropChange('instructionText', e.target.value)} />
                    </div>
                </AccordionContent>
            </AccordionItem>
             <AccordionItem value="campaigns">
                <AccordionTrigger>Campanhas e Destinos</AccordionTrigger>
                 <AccordionContent className="pt-2">
                     <div className="p-3 border rounded-md bg-background">
                        <FtpCampaignGroupManager campaignGroups={props.campaignGroups} onPropChange={onPropChange} />
                    </div>
                </AccordionContent>
            </AccordionItem>
             <AccordionItem value="button-style">
                <AccordionTrigger>Estilo do Botão de Envio</AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                     <div className="space-y-2">
                        <Label htmlFor="ftp-button-text">Texto do Botão</Label>
                        <Input id="ftp-button-text" value={buttonProps?.text || "Enviar Arquivo"} onChange={(e) => handleButtonPropsChange('text', e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                             <ColorInput 
                                label="Cor de Fundo"
                                value={buttonProps?.bgColor || ''}
                                onChange={value => handleButtonPropsChange('bgColor', value)}
                                brand={pageState.brand}
                             />
                        </div>
                        <div className="space-y-2">
                            <ColorInput 
                                label="Cor do Texto"
                                value={buttonProps?.textColor || ''}
                                onChange={value => handleButtonPropsChange('textColor', value)}
                                brand={pageState.brand}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Ícone</Label>
                        <Select value={buttonProps?.icon || 'none'} onValueChange={(value) => handleButtonPropsChange('icon', value)}>
                            <SelectTrigger><SelectValue placeholder="Sem ícone"/></SelectTrigger>
                            <SelectContent>
                                {lucideIcons.map(icon => <SelectItem key={icon.value} value={icon.value}>{icon.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}
