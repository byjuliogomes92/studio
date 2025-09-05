
import type { PageComponent } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

interface ComponentSettingsProps {
  component: PageComponent;
  onPropChange: (prop: string, value: any) => void;
}

export function AddToCalendarSettings({ component, onPropChange }: ComponentSettingsProps) {
    const { props } = component;
    const isAllDay = props.isAllDay || false;
    
    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="event-title">Título do Evento</Label>
                <Input id="event-title" value={props.title || ''} onChange={e => onPropChange('title', e.target.value)} placeholder="Ex: Webinar de Lançamento" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="event-description">Descrição</Label>
                <Textarea id="event-description" value={props.description || ''} onChange={e => onPropChange('description', e.target.value)} placeholder="Descreva o evento..." />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
                <Label htmlFor="event-all-day">Dia Inteiro</Label>
                <Switch id="event-all-day" checked={isAllDay} onCheckedChange={checked => onPropChange('isAllDay', checked)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="event-start-time">Início do Evento</Label>
                    <Input id="event-start-time" type={isAllDay ? "date" : "datetime-local"} value={props.startTime || ''} onChange={e => onPropChange('startTime', e.target.value)} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="event-end-time">Fim do Evento</Label>
                    <Input id="event-end-time" type={isAllDay ? "date" : "datetime-local"} value={props.endTime || ''} onChange={e => onPropChange('endTime', e.target.value)} />
                </div>
            </div>

            <Separator />

             <div className="space-y-2">
                <Label htmlFor="event-location-type">Tipo de Localização</Label>
                 <Select value={props.locationType || 'online'} onValueChange={(value) => onPropChange('locationType', value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="online">Online (URL)</SelectItem>
                        <SelectItem value="physical">Presencial (Endereço)</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="event-location">Localização</Label>
                <Input 
                    id="event-location" 
                    value={props.location || ''} 
                    onChange={e => onPropChange('location', e.target.value)} 
                    placeholder={props.locationType === 'physical' ? 'Endereço do evento' : 'Link da reunião'} 
                />
            </div>
            <Separator />
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label htmlFor="show-google">Mostrar botão do Google Calendar</Label>
                    <Switch id="show-google" checked={props.showGoogle !== false} onCheckedChange={checked => onPropChange('showGoogle', checked)} />
                </div>
                {props.showGoogle !== false && (
                    <div className="space-y-2">
                        <Label htmlFor="google-button-text">Texto do Botão (Google)</Label>
                        <Input id="google-button-text" value={props.buttonTextGoogle || 'Adicionar ao Google Calendar'} onChange={e => onPropChange('buttonTextGoogle', e.target.value)} />
                    </div>
                )}
            </div>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label htmlFor="show-outlook">Mostrar botão do Outlook</Label>
                    <Switch id="show-outlook" checked={props.showOutlook !== false} onCheckedChange={checked => onPropChange('showOutlook', checked)} />
                </div>
                 {props.showOutlook !== false && (
                    <div className="space-y-2">
                        <Label htmlFor="outlook-button-text">Texto do Botão (Outlook)</Label>
                        <Input id="outlook-button-text" value={props.buttonTextOutlook || 'Adicionar ao Outlook'} onChange={e => onPropChange('buttonTextOutlook', e.target.value)} />
                    </div>
                )}
            </div>
            <Separator />
            <div className="space-y-2">
                <Label htmlFor="button-align">Alinhamento dos Botões</Label>
                <Select value={props.align || 'center'} onValueChange={value => onPropChange('align', value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="left">Esquerda</SelectItem>
                        <SelectItem value="center">Centro</SelectItem>
                        <SelectItem value="right">Direita</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
