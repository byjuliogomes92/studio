
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { produce } from "immer";

interface LayoutSettingsProps {
    props: any;
    onPropChange: (prop: string, value: any) => void;
}

export function LayoutSettings({ props, onPropChange }: LayoutSettingsProps) {
    const layout = props.layout || {};

    const handleLayoutChange = (prop: string, value: any) => {
        const newLayout = produce(layout, (draft: any) => {
            draft[prop] = value;
        });
        onPropChange('layout', newLayout);
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label>Alinhamento do Item na Coluna</Label>
                <Select value={layout.alignSelf || 'auto'} onValueChange={(value) => handleLayoutChange('alignSelf', value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="auto">Automático (usar da coluna)</SelectItem>
                        <SelectItem value="flex-start">Início</SelectItem>
                        <SelectItem value="center">Centro</SelectItem>
                        <SelectItem value="flex-end">Fim</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
