
import type { PageComponent } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

interface CampaignOption {
  id: string;
  name: string;
  deKey: string;
}

function CampaignManager({
    campaigns = [],
    onPropChange,
}: {
    campaigns: CampaignOption[];
    onPropChange: (prop: string, value: any) => void;
}) {
    const handleCampaignChange = (id: string, field: 'name' | 'deKey', value: string) => {
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
        };
        onPropChange('campaigns', [...(campaigns || []), newCampaign]);
    };

    const removeCampaign = (id: string) => {
        onPropChange('campaigns', campaigns.filter((c) => c.id !== id));
    };

    return (
        <div className="space-y-3">
            {campaigns.map((campaign) => (
                <div key={campaign.id} className="p-3 border rounded-md space-y-3 bg-muted/40 relative">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-1 right-1 h-7 w-7 text-destructive"
                        onClick={() => removeCampaign(campaign.id)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                    <div className="space-y-1">
                        <Label htmlFor={`campaign-name-${campaign.id}`} className="text-xs">Nome da Campanha (visível para o usuário)</Label>
                        <Input
                            id={`campaign-name-${campaign.id}`}
                            value={campaign.name}
                            onChange={(e) => handleCampaignChange(campaign.id, 'name', e.target.value)}
                        />
                    </div>
                     <div className="space-y-1">
                        <Label htmlFor={`campaign-dekey-${campaign.id}`} className="text-xs">Chave Externa da Data Extension</Label>
                        <Input
                            id={`campaign-dekey-${campaign.id}`}
                            value={campaign.deKey}
                            onChange={(e) => handleCampaignChange(campaign.id, 'deKey', e.target.value)}
                        />
                    </div>
                </div>
            ))}
            <Button variant="outline" className="w-full" onClick={addCampaign}>
                <Plus className="mr-2 h-4 w-4" /> Adicionar Campanha
            </Button>
        </div>
    );
}

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
            <Separator />
            <div className="p-3 border rounded-md bg-muted/40">
                <h4 className="font-semibold text-sm mb-2">Campanhas e Data Extensions de Destino</h4>
                <CampaignManager campaigns={props.campaigns} onPropChange={onPropChange} />
            </div>
        </div>
    );
}
