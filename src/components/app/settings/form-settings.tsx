
import type { PageComponent, FormFieldConfig, CustomFormField, CustomFormFieldType, CloudPage } from "@/lib/types";
import React, { useRef } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle, GripVertical, Plus, Trash2, Send, CheckCircle, Link } from "lucide-react";
import { produce } from 'immer';
import { Badge } from "@/components/ui/badge";
import { DebouncedTextInput } from "./debounced-text-input";
import { AnimationPreview } from './animation-preview';

interface ComponentSettingsProps {
  component: PageComponent;
  onPropChange: (prop: string, value: any) => void;
  onSubPropChange: (prop: string, subProp: string, value: any) => void;
}

const formFields: {id: keyof FormFieldConfig, label: string, urlParam: string, deName: string}[] = [
    { id: 'name', label: 'Nome', urlParam: 'nome', deName: 'NOME' },
    { id: 'email', label: 'Email', urlParam: 'email', deName: 'EMAIL' },
    { id: 'phone', label: 'Telefone', urlParam: 'telefone', deName: 'TELEFONE' },
    { id: 'cpf', label: 'CPF', urlParam: 'cpf', deName: 'CPF' },
    { id: 'city', label: 'Cidades', urlParam: 'cidade', deName: 'CIDADE' },
    { id: 'birthdate', label: 'Data de Nascimento', urlParam: 'datanascimento', deName: 'DATANASCIMENTO' },
];

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

function CustomFieldsManager({ fields, onPropChange }: { fields: CustomFormField[], onPropChange: (prop: string, value: any) => void }) {
    const addField = () => {
        const newField: CustomFormField = {
            id: `custom-${Date.now()}`,
            name: `CustomField${(fields?.length || 0) + 1}`,
            label: 'Novo Campo',
            type: 'text',
            required: false,
            placeholder: ''
        };
        onPropChange('customFields', [...(fields || []), newField]);
    };

    const updateField = (id: string, prop: keyof CustomFormField, value: any) => {
        const newFields = fields.map(f => f.id === id ? { ...f, [prop]: value } : f);
        onPropChange('customFields', newFields);
    };

    const removeField = (id: string) => {
        onPropChange('customFields', fields.filter(f => f.id !== id));
    };

    return (
        <div className="space-y-4">
            <Label className="font-semibold">Campos Personalizados</Label>
            <div className="space-y-3">
                {fields?.map(field => (
                    <div key={field.id} className="p-3 border rounded-md space-y-3 bg-muted/30">
                        <div className="flex items-center justify-between">
                            <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                             <Button variant="ghost" size="icon" onClick={() => removeField(field.id)} className="h-7 w-7">
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor={`label-${field.id}`} className="text-xs">Rótulo</Label>
                                <Input id={`label-${field.id}`} value={field.label} onChange={e => updateField(field.id, 'label', e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor={`name-${field.id}`} className="text-xs">Nome/Chave na DE</Label>
                                <Input id={`name-${field.id}`} value={field.name} onChange={e => updateField(field.id, 'name', e.target.value.replace(/ /g, '_'))} />
                            </div>
                        </div>
                         <div className="space-y-1">
                            <Label htmlFor={`placeholder-${field.id}`} className="text-xs">Placeholder</Label>
                            <Input id={`placeholder-${field.id}`} value={field.placeholder} onChange={e => updateField(field.id, 'placeholder', e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-3 items-end">
                            <div className="space-y-1">
                                <Label htmlFor={`type-${field.id}`} className="text-xs">Tipo de Campo</Label>
                                <Select value={field.type} onValueChange={(v: CustomFormFieldType) => updateField(field.id, 'type', v)}>
                                    <SelectTrigger id={`type-${field.id}`}><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="text">Texto</SelectItem>
                                        <SelectItem value="number">Número</SelectItem>
                                        <SelectItem value="date">Data</SelectItem>
                                        <SelectItem value="checkbox">Caixa de Seleção</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch id={`required-${field.id}`} checked={field.required} onCheckedChange={c => updateField(field.id, 'required', c)} />
                                <Label htmlFor={`required-${field.id}`} className="text-xs">Obrigatório</Label>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <Button variant="outline" className="w-full" onClick={addField}>
                <Plus className="mr-2 h-4 w-4" /> Adicionar Campo Personalizado
            </Button>
        </div>
    );
}

export function FormSettings({ component, onPropChange, onSubPropChange }: ComponentSettingsProps) {
    const { props } = component;
    const thankYouTextareaRef = useRef<HTMLTextAreaElement>(null);
    
    const submission = props.submission || { type: 'message', message: '', url: '' };

    const handleSubmissionChange = (prop: string, value: any) => {
        const newSubmission = { ...submission, [prop]: value };
        onPropChange('submission', newSubmission);
    };

    const handleFieldChange = (fieldId: string, property: keyof FormFieldConfig, value: any) => {
        const newFields = produce(props.fields || {}, (draft: any) => {
          if (typeof draft[fieldId] !== 'object' || draft[fieldId] === null) {
              draft[fieldId] = { enabled: false, conditional: null, prefillFromUrl: false };
          }
          draft[fieldId][property] = value;
        });
        onPropChange('fields', newFields);
    };

    const handleConditionalChange = (fieldId: string, property: 'field' | 'value', value: string) => {
      const newFields = produce(props.fields, (draft: any) => {
        const field = draft[fieldId];
        if (field && field.conditional) {
          field.conditional[property] = value;
        }
      });
      onPropChange('fields', newFields);
    };

    const getActiveFormFields = () => {
        if (component.type !== 'Form') return [];
        const activeFields: { label: string, deName: string }[] = [];
        
        formFields.forEach(field => {
            if (props.fields?.[field.id]?.enabled) {
                activeFields.push({ label: field.label, deName: field.deName });
            }
        });

        (props.customFields || []).forEach((field: CustomFormField) => {
            activeFields.push({ label: field.label, deName: field.name });
        });
        
        return activeFields;
    }
    
    const activeFormFields = getActiveFormFields();

    const insertAmpscriptVar = (deName: string) => {
        const textarea = thankYouTextareaRef.current;
        if (!textarea) return;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const varToInsert = `%%=v(@${deName})=%%`;
        const newText = text.substring(0, start) + varToInsert + text.substring(end);
        handleSubmissionChange('message', newText);
        setTimeout(() => {
            textarea.focus();
            textarea.selectionStart = textarea.selectionEnd = start + varToInsert.length;
        }, 0);
    };

    return (
        <div className="space-y-4">
            <div>
              <Label className="font-semibold">Campos Padrão</Label>
              <div className="space-y-3 mt-2">
                {formFields.map((field, index) => (
                  <div key={field.id} className="p-3 border rounded-md space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`field-${field.id}`}>{field.label}</Label>
                      <Switch
                        id={`field-${field.id}`}
                        checked={props.fields?.[field.id]?.enabled || false}
                        onCheckedChange={(checked) => handleFieldChange(field.id, 'enabled', checked)}
                      />
                    </div>
                     {props.fields?.[field.id]?.enabled && (
                        <div className="flex items-center justify-between border-t pt-3">
                            <Label htmlFor={`prefill-${field.id}`} className="text-xs flex items-center gap-1">
                                <Link className="h-3 w-3" />
                                Pré-preencher da URL
                            </Label>
                             <Switch
                                id={`prefill-${field.id}`}
                                checked={props.fields?.[field.id]?.prefillFromUrl || false}
                                onCheckedChange={(checked) => handleFieldChange(field.id, 'prefillFromUrl', checked)}
                            />
                        </div>
                     )}
                  </div>
                ))}
              </div>
            </div>
            <Separator />
            <CustomFieldsManager fields={props.customFields || []} onPropChange={onPropChange} />
            <Separator />
            <div>
                <h4 className="font-semibold mb-4">Estilo do Botão de Envio</h4>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="form-button-text">Texto do Botão</Label>
                        <Input id="form-button-text" value={props.buttonText || ""} onChange={(e) => onPropChange("buttonText", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="form-button-align">Alinhamento do Botão</Label>
                        <Select value={props.buttonAlign || 'center'} onValueChange={(value) => onPropChange('buttonAlign', value)}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="left">Esquerda</SelectItem>
                                <SelectItem value="center">Centro</SelectItem>
                                <SelectItem value="right">Direita</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
            <Separator />
            <div className="space-y-4">
                <h4 className="font-semibold">Ação Após Envio</h4>
                 <p className="text-sm text-muted-foreground">
                    Preencha a URL para redirecionar o usuário. Se deixado em branco, a mensagem de agradecimento será exibida.
                 </p>
                <div className="space-y-2">
                    <Label htmlFor="form-redirect-url">URL de Redirecionamento (Opcional)</Label>
                    <Input
                        id="form-redirect-url"
                        value={props.submission?.url || ''}
                        onChange={(e) => handleSubmissionChange('url', e.target.value)}
                        placeholder="https://exemplo.com/obrigado"
                    />
                </div>
                <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                        <Label htmlFor="form-thank-you">Mensagem de Agradecimento</Label>
                    </div>
                    <Textarea
                        id="form-thank-you"
                        ref={thankYouTextareaRef}
                        value={props.submission?.message || ''}
                        onChange={(e) => handleSubmissionChange('message', e.target.value)}
                        rows={8}
                        placeholder="<h2>Obrigado!</h2><p>Seus dados foram recebidos.</p>"
                    />
                    <div className="flex flex-wrap gap-2 pt-2">
                       {activeFormFields.map(field => (
                           <Badge 
                              key={field.deName}
                              variant="secondary"
                              className="cursor-pointer hover:bg-primary/20"
                              onClick={() => insertAmpscriptVar(field.deName)}
                           >
                              {field.label}
                           </Badge>
                       ))}
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="thank-you-align">Alinhamento da Mensagem</Label>
                     <Select value={props.thankYouAlign || 'center'} onValueChange={(value) => onPropChange('thankYouAlign', value)}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="left">Esquerda</SelectItem>
                            <SelectItem value="center">Centro</SelectItem>
                            <SelectItem value="right">Direita</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Animação de Agradecimento</Label>
              <Select
                value={props.thankYouAnimation || 'none'}
                onValueChange={(value) => onPropChange('thankYouAnimation', value === 'none' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sem animação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma</SelectItem>
                  <SelectItem value="confetti">Confete</SelectItem>
                </SelectContent>
              </Select>
              <AnimationPreview animation={props.thankYouAnimation || 'none'} />
            </div>
        </div>
    );
}
