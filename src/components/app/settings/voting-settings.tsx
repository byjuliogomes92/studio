
import type { PageComponent } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

interface ComponentSettingsProps {
  component: PageComponent;
  onPropChange: (prop: string, value: any) => void;
}

function VotingOptionsManager({
    options,
    onPropChange,
}: {
    options: { id: string; text: string }[];
    onPropChange: (prop: string, value: any) => void;
}) {
    const handleOptionChange = (optionId: string, value: string) => {
        const newOptions = options.map((opt) =>
            opt.id === optionId ? { ...opt, text: value } : opt
        );
        onPropChange('options', newOptions);
    };

    const addOption = () => {
        const newOption = {
            id: `opt-${Date.now()}`,
            text: 'Nova Opção',
        };
        onPropChange('options', [...options, newOption]);
    };

    const removeOption = (optionId: string) => {
        onPropChange('options', options.filter((opt) => opt.id !== optionId));
    };

    return (
        <div className="space-y-3">
            {options.map((option, index) => (
                <div key={option.id} className="flex items-center gap-2">
                    <Input
                        id={`option-text-${option.id}`}
                        value={option.text}
                        onChange={(e) => handleOptionChange(option.id, e.target.value)}
                        placeholder={`Opção ${index + 1}`}
                    />
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-destructive/80 hover:text-destructive shrink-0"
                        onClick={() => removeOption(option.id)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ))}
            <Button variant="outline" className="w-full" onClick={addOption}>
                <Plus className="h-4 w-4 mr-2" /> Adicionar Opção
            </Button>
        </div>
    );
}

export function VotingSettings({ component, onPropChange }: ComponentSettingsProps) {
    const { props } = component;
    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="voting-question">Pergunta da Votação</Label>
                <Input
                    id="voting-question"
                    value={props.question || ''}
                    onChange={(e) => onPropChange('question', e.target.value)}
                    placeholder="Qual sua pergunta?"
                />
            </div>
            <Separator />
            <div className="space-y-2">
                <Label>Opções de Voto</Label>
                <VotingOptionsManager
                    options={props.options || []}
                    onPropChange={onPropChange}
                />
            </div>
        </div>
    );
}
