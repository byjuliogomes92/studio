
import type { PageComponent, DataExtensionColumn, CampaignOption, CloudPage } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, HelpCircle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ColorInput } from './color-input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";


function ColumnManager({
    columns = [],
    onColumnsChange,
}: {
    columns: DataExtensionColumn[];
    onColumnsChange: (columns: DataExtensionColumn[]) => void;
}) {
    const handleColumnChange = (id: string, field: keyof DataExtensionColumn, value: any) => {
        const newColumns = columns.map(col =>
            col.id === id ? { ...col, [field]: value } : col
        );
        onColumnsChange(newColumns);
    };

    const addColumn = () => {
        const newColumn: DataExtensionColumn = {
            id: `col-${Date.now()}`,
            name: '',
            dataType: 'Text',
            isNullable: true,
            isPrimaryKey: false
        };
        onColumnsChange([...(columns || []), newColumn]);
    };

    const removeColumn = (id: string) => {
        onColumnsChange(columns.filter(col => col.id !== id));
    };

    return (
        <div className="space-y-3">
            {columns.map(col => (
                <div key={col.id} className="p-2 border rounded-md space-y-2 bg-muted/20 relative">
                     <Button variant="ghost" size="icon" className="absolute top-0 right-0 h-7 w-7 text-destructive" onClick={() => removeColumn(col.id)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                            <Label htmlFor={`col-name-${col.id}`} className="text-xs">Nome da Coluna</Label>
                            <Input id={`col-name-${col.id}`} value={col.name} onChange={e => handleColumnChange(col.id, 'name', e.target.value)} />
                        </div>
                        <div className="space-y-1">
                             <Label htmlFor={`col-type-${col.id}`} className="text-xs">Tipo de Dado</Label>
                             <Select value={col.dataType} onValueChange={(value) => handleColumnChange(col.id, 'dataType', value)}>
                                <SelectTrigger id={`col-type-${col.id}`}><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Text">Text</SelectItem>
                                    <SelectItem value="Number">Number</SelectItem>
                                    <SelectItem value="Date">Date</SelectItem>
                                    <SelectItem value="Boolean">Boolean</SelectItem>
                                    <SelectItem value="EmailAddress">EmailAddress</SelectItem>
                                    <SelectItem value="Phone">Phone</SelectItem>
                                </SelectContent>
                             </Select>
                        </div>
                    </div>
                     <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2">
                             <Switch id={`col-nullable-${col.id}`} checked={col.isNullable} onCheckedChange={(checked) => handleColumnChange(col.id, 'isNullable', checked)} />
                            <Label htmlFor={`col-nullable-${col.id}`} className="text-xs">Pode ser Nulo</Label>
                        </div>
                         <div className="flex items-center gap-2">
                             <Switch id={`col-pk-${col.id}`} checked={col.isPrimaryKey} onCheckedChange={(checked) => handleColumnChange(col.id, 'isPrimaryKey', checked)} />
                            <Label htmlFor={`col-pk-${col.id}`} className="text-xs">Chave Primária</Label>
                        </div>
                    </div>
                </div>
            ))}
            <Button variant="outline" size="sm" className="w-full" onClick={addColumn}>
                <Plus className="mr-2 h-4 w-4" /> Adicionar Coluna
            </Button>
        </div>
    )
}

function CampaignManager({
    campaigns = [],
    onPropChange,
}: {
    campaigns: CampaignOption[];
    onPropChange: (prop: string, value: any) => void;
}) {
    const handleCampaignChange = (id: string, field: 'name' | 'deKey' | 'columns', value: any) => {
        const newCampaigns = campaigns.map((c) =>
            c.id === id ? { ...c, [field]: value } : c
        );
        onPropChange('campaigns', newCampaigns);
    };

    const addCampaign = () => {
        const newCampaign: CampaignOption = {
            id: `campaign-${Date.now()}`,
            name: 'Nova Campanha',
            deKey: '',
            columns: []
        };
        onPropChange('campaigns', [...(campaigns || []), newCampaign]);
    };

    const removeCampaign = (id: string) => {
        onPropChange('campaigns', campaigns.filter((c) => c.id !== id));
    };

    return (
        <div className="space-y-3">
             <Accordion type="multiple" className="w-full space-y-3">
                {campaigns.map((campaign) => (
                    <AccordionItem key={campaign.id} value={campaign.id} className="p-3 border rounded-md space-y-3 bg-muted/40 relative">
                        <div className="flex items-center justify-between">
                            <AccordionTrigger className="p-0 text-base font-semibold">{campaign.name || 'Nova Campanha'}</AccordionTrigger>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeCampaign(campaign.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                        <AccordionContent className="pt-2 space-y-3">
                            <div className="space-y-1">
                                <Label htmlFor={`campaign-name-${campaign.id}`} className="text-xs">Nome da Campanha (visível para o usuário)</Label>
                                <Input id={`campaign-name-${campaign.id}`} value={campaign.name} onChange={(e) => handleCampaignChange(campaign.id, 'name', e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor={`campaign-dekey-${campaign.id}`} className="text-xs">Chave Externa da Data Extension</Label>
                                <Input id={`campaign-dekey-${campaign.id}`} value={campaign.deKey} onChange={(e) => handleCampaignChange(campaign.id, 'deKey', e.target.value)} />
                            </div>
                            <Separator />
                            <h5 className="font-medium text-sm pt-2">Estrutura de Colunas</h5>
                            <ColumnManager columns={campaign.columns} onColumnsChange={(cols) => handleCampaignChange(campaign.id, 'columns', cols)} />
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
            <Button variant="outline" className="w-full" onClick={addCampaign}>
                <Plus className="mr-2 h-4 w-4" /> Adicionar Campanha
            </Button>
        </div>
    );
}

function HelpDialog() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
                    <HelpCircle className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Como Usar o Upload para Data Extension</DialogTitle>
                    <DialogDescription>
                        Este componente permite que usuários com acesso à página enviem um arquivo CSV para ser importado em uma Data Extension específica no Marketing Cloud.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4 text-sm">
                    <p><strong>Passo 1: Configure as Campanhas</strong></p>
                    <p>Na seção "Campanhas", adicione uma ou mais opções. Cada opção representa uma Data Extension de destino. Para cada uma, você deve fornecer:</p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li><strong>Nome da Campanha:</strong> O nome que o usuário verá no seletor da página.</li>
                        <li><strong>Chave Externa da DE:</strong> O "External Key" exato da sua Data Extension no SFMC.</li>
                    </ul>
                     <p><strong>Passo 2: Defina as Colunas (Opcional, mas recomendado)</strong></p>
                     <p>Para cada campanha, você pode pré-definir as colunas da Data Extension. Isso serve como um guia visual na página, mostrando ao usuário qual a estrutura esperada do arquivo CSV.</p>

                    <p><strong>Passo 3: Preparação do Arquivo CSV</strong></p>
                    <p>O arquivo CSV que o usuário enviar deve seguir uma regra crucial: <strong>a primeira linha (cabeçalho) do CSV deve conter os nomes das colunas que correspondem exatamente aos nomes dos campos na sua Data Extension.</strong></p>

                     <p><strong>Passo 4: Funcionalidade na Página</strong></p>
                     <p>Na página publicada, o usuário selecionará a campanha desejada (se houver mais de uma), escolherá o arquivo CSV e o componente fará o upload dos dados para a Data Extension correspondente.</p>
                </div>
            </DialogContent>
        </Dialog>
    )
}

interface ComponentSettingsProps {
  component: PageComponent;
  onPropChange: (prop: string, value: any) => void;
  onSubPropChange: (prop: string, subProp: string, value: any) => void;
  pageState: CloudPage;
}

export function DataExtensionUploadSettings({ component, onPropChange, onSubPropChange, pageState }: ComponentSettingsProps) {
    const { props } = component;
    const styles = props.styles || {};
    const animations = props.animations || {};

    const handleStyleChange = (prop: string, value: string) => {
        onSubPropChange('styles', prop, value);
    };

    const handleAnimationChange = (prop: string, value: string) => {
        onSubPropChange('animations', prop, value);
    };

    return (
        <TooltipProvider>
        <Accordion type="multiple" defaultValue={['general']} className="w-full">
            <AccordionItem value="general">
                <AccordionTrigger>Geral</AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2">
                    <div className="space-y-2">
                        <Label htmlFor="de-upload-title">Título do Bloco</Label>
                        <Input id="de-upload-title" value={props.title || 'Upload para Data Extension'} onChange={e => onPropChange('title', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="de-upload-instruction">Texto de Instrução</Label>
                        <Input id="de-upload-instruction" value={props.instructionText || 'Arraste e solte o arquivo CSV aqui'} onChange={e => onPropChange('instructionText', e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="de-upload-button-text">Texto do Botão</Label>
                        <Input id="de-upload-button-text" value={props.buttonText || "Processar Arquivo"} onChange={e => onPropChange('buttonText', e.target.value)} />
                    </div>
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="campaigns">
                <AccordionTrigger>
                    <div className="flex items-center gap-2">
                        <span>Campanhas</span>
                        <HelpDialog />
                    </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2">
                     <div className="p-3 border rounded-md bg-background">
                        <h4 className="font-semibold text-sm mb-2">Campanhas e Data Extensions de Destino</h4>
                        <CampaignManager campaigns={props.campaigns} onPropChange={onPropChange} />
                    </div>
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="style">
                <AccordionTrigger>Estilo</AccordionTrigger>
                <AccordionContent className="pt-4 space-y-4">
                     <div className="space-y-2">
                        <Label>Cores da Área de Upload</Label>
                        <div className="grid grid-cols-2 gap-4">
                            <ColorInput label="Fundo" value={styles.dropZoneBg || ''} onChange={value => handleStyleChange('dropZoneBg', value)} brand={pageState.brand} />
                            <ColorInput label="Fundo (Hover)" value={styles.dropZoneBgHover || ''} onChange={value => handleStyleChange('dropZoneBgHover', value)} brand={pageState.brand} />
                            <ColorInput label="Borda" value={styles.dropZoneBorder || ''} onChange={value => handleStyleChange('dropZoneBorder', value)} brand={pageState.brand} />
                            <ColorInput label="Borda (Hover)" value={styles.dropZoneBorderHover || ''} onChange={value => handleStyleChange('dropZoneBorderHover', value)} brand={pageState.brand} />
                        </div>
                     </div>
                      <div className="space-y-2">
                        <Label>Cores do Ícone e Texto</Label>
                        <div className="grid grid-cols-2 gap-4">
                            <ColorInput label="Ícone" value={styles.iconColor || ''} onChange={value => handleStyleChange('iconColor', value)} brand={pageState.brand} />
                            <ColorInput label="Texto" value={styles.textColor || ''} onChange={value => handleStyleChange('textColor', value)} brand={pageState.brand} />
                        </div>
                     </div>
                      <div className="space-y-2">
                        <Label>Cores do Feedback</Label>
                        <div className="grid grid-cols-3 gap-4">
                            <ColorInput label="Progresso" value={styles.progressBarColor || ''} onChange={value => handleStyleChange('progressBarColor', value)} brand={pageState.brand} />
                            <ColorInput label="Sucesso" value={styles.successColor || ''} onChange={value => handleStyleChange('successColor', value)} brand={pageState.brand} />
                            <ColorInput label="Erro" value={styles.errorColor || ''} onChange={value => handleStyleChange('errorColor', value)} brand={pageState.brand} />
                        </div>
                     </div>
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="animation">
                <AccordionTrigger>Animação do Ícone</AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2">
                    <div className="space-y-2">
                        <Label htmlFor="icon-loop-anim">Animação em Loop</Label>
                        <Select value={animations.loop || 'none'} onValueChange={v => handleAnimationChange('loop', v)}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Nenhuma</SelectItem>
                                <SelectItem value="pulse">Pulsar</SelectItem>
                                <SelectItem value="bounce">Pular</SelectItem>
                                <SelectItem value="floating">Flutuar</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="icon-hover-anim">Animação no Hover</Label>
                        <Select value={animations.hover || 'none'} onValueChange={v => handleAnimationChange('hover', v)}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Nenhuma</SelectItem>
                                <SelectItem value="shake">Tremer</SelectItem>
                                <SelectItem value="scale-up">Aumentar</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
        </TooltipProvider>
    );
}
