import type { PageComponent, DataExtensionColumn, CampaignGroup, UploadTarget, CloudPage } from "@/lib/types";
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
                <Plus className="mr-2 h-4 w-4" /> Adicionar Coluna Guia
            </Button>
        </div>
    )
}

function UploadTargetManager({
    targets = [],
    onTargetsChange,
}: {
    targets: UploadTarget[];
    onTargetsChange: (targets: UploadTarget[]) => void;
}) {
    const handleTargetChange = (id: string, field: 'name' | 'deKey' | 'columns', value: any) => {
        const newTargets = targets.map((t) =>
            t.id === id ? { ...t, [field]: value } : t
        );
        onTargetsChange(newTargets);
    };

    const addTarget = () => {
        const newTarget: UploadTarget = {
            id: `target-${Date.now()}`,
            name: 'Nova DE',
            deKey: '',
            columns: []
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
                    <AccordionItem key={target.id} value={target.id} className="p-3 border rounded-md space-y-3 bg-background relative">
                        <div className="flex items-center justify-between">
                            <AccordionTrigger className="p-0 text-base font-semibold">{target.name || 'Novo Destino'}</AccordionTrigger>
                             <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeTarget(target.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                        <AccordionContent className="pt-2 space-y-3">
                            <div className="space-y-1">
                                <Label htmlFor={`target-name-${target.id}`} className="text-xs">Nome do Destino (visível para o usuário)</Label>
                                <Input id={`target-name-${target.id}`} value={target.name} onChange={(e) => handleTargetChange(target.id, 'name', e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor={`target-dekey-${target.id}`} className="text-xs">Chave Externa da Data Extension</Label>
                                <Input id={`target-dekey-${target.id}`} value={target.deKey} onChange={(e) => handleTargetChange(target.id, 'deKey', e.target.value)} />
                            </div>
                            <Separator />
                            <h5 className="font-medium text-sm pt-2">Colunas Guias (Opcional)</h5>
                             <ColumnManager columns={target.columns} onColumnsChange={(cols) => handleTargetChange(target.id, 'columns', cols)} />
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
            <Button variant="outline" className="w-full" onClick={addTarget}>
                <Plus className="mr-2 h-4 w-4" /> Adicionar Destino de Upload
            </Button>
        </div>
    );
}

function CampaignGroupManager({
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
                            <h5 className="font-medium text-sm pt-2">Destinos de Upload</h5>
                            <UploadTargetManager targets={group.uploadTargets} onTargetsChange={(targets) => handleGroupChange(group.id, 'uploadTargets', targets)} />
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

function HelpDialog() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground" onClick={e => e.stopPropagation()}>
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
                    <p><strong>Passo 1: Configure os Grupos e Destinos</strong></p>
                    <p>Use esta seção para organizar seus uploads:</p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li><strong>Grupo de Campanha:</strong> É uma pasta para organizar seus uploads. Ex: "Campanhas 2024".</li>
                        <li><strong>Destino de Upload:</strong> Representa a Data Extension final. Para cada destino, você deve fornecer um nome amigável (Ex: "Novos Leads") e a Chave Externa (Customer Key) exata da sua DE no SFMC.</li>
                    </ul>
                     <p><strong>Passo 2: Defina as Colunas (Opcional, mas recomendado)</strong></p>
                     <p>Para cada destino, você pode pré-definir as colunas da Data Extension. Isso serve como um guia visual na página, mostrando ao usuário qual a estrutura esperada do arquivo CSV.</p>

                    <p><strong>Passo 3: Preparação do Arquivo CSV</strong></p>
                    <p>O arquivo CSV que o usuário enviar deve seguir uma regra crucial: <strong>a primeira linha (cabeçalho) do CSV deve conter os nomes das colunas que correspondem exatamente aos nomes dos campos na sua Data Extension.</strong></p>

                     <p><strong>Passo 4: Funcionalidade na Página</strong></p>
                     <p>Na página publicada, o usuário selecionará o grupo e o destino (se houver mais de um), escolherá o arquivo CSV e o componente fará o upload dos dados para a Data Extension correspondente.</p>
                </div>
            </DialogContent>
        </Dialog>
    )
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
    const buttonProps = props.buttonProps || {};

    const handleStyleChange = (prop: string, value: string) => {
        onSubPropChange('styles', prop, value);
    };

    const handleAnimationChange = (prop: string, value: string) => {
        onSubPropChange('animations', prop, value);
    };

    const handleButtonPropsChange = (prop: string, value: string) => {
        onSubPropChange('buttonProps', prop, value);
    }

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
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="campaigns">
                <div className="flex items-center w-full">
                    <AccordionTrigger className="flex-1">
                        Campanhas e Destinos
                    </AccordionTrigger>
                    <HelpDialog />
                </div>
                <AccordionContent className="pt-2">
                     <div className="p-3 border rounded-md bg-background">
                        <CampaignGroupManager campaignGroups={props.campaignGroups} onPropChange={onPropChange} />
                    </div>
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="style">
                <AccordionTrigger>Estilo</AccordionTrigger>
                <AccordionContent className="pt-4 space-y-4">
                     <div className="space-y-2">
                        <Label>Cores Gerais</Label>
                        <div className="grid grid-cols-2 gap-4">
                           <ColorInput label="Fundo do Componente" value={styles.containerBackgroundColor || ''} onChange={value => handleStyleChange('containerBackgroundColor', value)} brand={pageState.brand} tooltip="Deixe em branco para transparente" />
                        </div>
                     </div>
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
                     <Separator />
                      <div className="space-y-4 pt-2">
                        <h4 className="font-semibold">Estilo do Botão de Envio</h4>
                        <div className="space-y-2">
                            <Label htmlFor="de-button-text">Texto do Botão</Label>
                            <Input id="de-button-text" value={buttonProps.text || "Processar Arquivo"} onChange={(e) => handleButtonPropsChange('text', e.target.value)} />
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                            <ColorInput label="Cor de Fundo" value={buttonProps.bgColor || ''} onChange={value => handleButtonPropsChange('bgColor', value)} brand={pageState.brand} />
                            <ColorInput label="Cor do Texto" value={buttonProps.textColor || ''} onChange={value => handleButtonPropsChange('textColor', value)} brand={pageState.brand} />
                         </div>
                         <div className="space-y-2">
                            <Label>Ícone</Label>
                            <Select value={buttonProps.icon || 'none'} onValueChange={(value) => handleButtonPropsChange('icon', value)}>
                                <SelectTrigger><SelectValue placeholder="Sem ícone"/></SelectTrigger>
                                <SelectContent>
                                    {lucideIcons.map(icon => <SelectItem key={icon.value} value={icon.value}>{icon.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
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