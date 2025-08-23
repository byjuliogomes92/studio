

"use client";

import type { PageComponent, ComponentType } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { HelpCircle, AlignLeft, AlignCenter, AlignRight, Bold, Trash2, Plus, Star, Scaling } from "lucide-react";
import {
  Tooltip,
  TooltipProvider,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { produce } from 'immer';

interface ComponentSettingsProps {
  component: PageComponent;
  onComponentChange: (id: string, newProps: Partial<PageComponent>) => void;
}

const formFields: {id: keyof PageComponent['props']['fields'], label: string}[] = [
    { id: 'name', label: 'Nome' },
    { id: 'email', label: 'Email' },
    { id: 'phone', label: 'Telefone' },
    { id: 'cpf', label: 'CPF' },
    { id: 'city', label: 'Cidades' },
    { id: 'birthdate', label: 'Data de Nascimento' },
];

function SpacingSettings({ props, onPropChange }: { props: any, onPropChange: (prop: string, value: any) => void }) {
    const styles = props.styles || {};
    const handleStyleChange = (prop: string, value: any) => {
      onPropChange('styles', { ...styles, [prop]: value });
    };
  
    return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label>Margem</Label>
                <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Topo" value={styles.marginTop || ''} onChange={e => handleStyleChange('marginTop', e.target.value)} />
                    <Input placeholder="Direita" value={styles.marginRight || ''} onChange={e => handleStyleChange('marginRight', e.target.value)} />
                    <Input placeholder="Baixo" value={styles.marginBottom || ''} onChange={e => handleStyleChange('marginBottom', e.target.value)} />
                    <Input placeholder="Esquerda" value={styles.marginLeft || ''} onChange={e => handleStyleChange('marginLeft', e.target.value)} />
                </div>
            </div>
            <div className="space-y-2">
                <Label>Padding</Label>
                <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Topo" value={styles.paddingTop || ''} onChange={e => handleStyleChange('paddingTop', e.target.value)} />
                    <Input placeholder="Direita" value={styles.paddingRight || ''} onChange={e => handleStyleChange('paddingRight', e.target.value)} />
                    <Input placeholder="Baixo" value={styles.paddingBottom || ''} onChange={e => handleStyleChange('paddingBottom', e.target.value)} />
                    <Input placeholder="Esquerda" value={styles.paddingLeft || ''} onChange={e => handleStyleChange('paddingLeft', e.target.value)} />
                </div>
            </div>
        </div>
        </div>
    )
  }

function TextStyleSettings({ props, onPropChange }: { props: any, onPropChange: (prop: string, value: any) => void }) {
  const styles = props.styles || {};
  
  const handleStyleChange = (prop: string, value: any) => {
    onPropChange('styles', { ...styles, [prop]: value });
  };

  return (
    <div className="space-y-4">
        <div className="space-y-2">
            <Label>Alinhamento</Label>
            <ToggleGroup 
                type="single" 
                value={styles.textAlign || 'left'} 
                onValueChange={(value) => handleStyleChange('textAlign', value)}
                className="w-full"
            >
                <ToggleGroupItem value="left" aria-label="Alinhar à esquerda" className="flex-1">
                    <AlignLeft className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="center" aria-label="Centralizar" className="flex-1">
                    <AlignCenter className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="right" aria-label="Alinhar à direita" className="flex-1">
                    <AlignRight className="h-4 w-4" />
                </ToggleGroupItem>
            </ToggleGroup>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Tamanho Fonte</Label>
            <Input 
              type="text"
              value={styles.fontSize || ''} 
              onChange={(e) => handleStyleChange('fontSize', e.target.value)}
              placeholder="ex: 16px ou 1em"
            />
          </div>
           <div className="space-y-2">
            <Label>Cor</Label>
            <Input 
              type="color"
              value={styles.color || '#000000'} 
              onChange={(e) => handleStyleChange('color', e.target.value)}
              className="p-1 h-10"
            />
          </div>
        </div>
         <div className="space-y-2">
            <Label>Estilo</Label>
             <ToggleGroup 
                type="single" 
                variant="outline"
                value={styles.fontWeight} 
                onValueChange={(value) => handleStyleChange('fontWeight', value)}
            >
                <ToggleGroupItem value="bold" aria-label="Negrito">
                    <Bold className="h-4 w-4" />
                </ToggleGroupItem>
            </ToggleGroup>
        </div>
    </div>
  );
}

function ListManager({
    items,
    onPropChange,
  }: {
    items: { id: string; title: string; content: string }[];
    onPropChange: (prop: string, value: any) => void;
  }) {
    const handleItemChange = (itemId: string, field: 'title' | 'content', value: string) => {
      const newItems = items.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item
      );
      onPropChange('items', newItems);
    };
  
    const addItem = () => {
      const newItem = {
        id: `item-${Date.now()}`,
        title: 'Novo Item',
        content: 'Conteúdo do novo item.',
      };
      onPropChange('items', [...items, newItem]);
    };
  
    const removeItem = (itemId: string) => {
      onPropChange(
        'items',
        items.filter((item) => item.id !== itemId)
      );
    };
  
    return (
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={item.id} className="p-3 border rounded-md space-y-3 relative">
             <Button
                variant="ghost"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 text-destructive/80 hover:text-destructive"
                onClick={() => removeItem(item.id)}
            >
                <Trash2 className="h-4 w-4" />
            </Button>

            <div className="space-y-2">
              <Label htmlFor={`item-title-${item.id}`}>Título {index + 1}</Label>
              <Input
                id={`item-title-${item.id}`}
                value={item.title}
                onChange={(e) => handleItemChange(item.id, 'title', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`item-content-${item.id}`}>Conteúdo {index + 1}</Label>
              <Textarea
                id={`item-content-${item.id}`}
                value={item.content}
                onChange={(e) => handleItemChange(item.id, 'content', e.target.value)}
                rows={4}
              />
            </div>
          </div>
        ))}
        <Button variant="outline" className="w-full" onClick={addItem}>
          <Plus className="h-4 w-4 mr-2" /> Adicionar Item
        </Button>
      </div>
    );
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

const renderComponentSettings = (type: ComponentType, props: any, onPropChange: (prop: string, value: any) => void, onSubPropChange: (prop: string, subProp: string, value: any) => void) => {
    switch (type) {
      case "Header":
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="logo-url">URL do Logo</Label>
              <Tooltip>
                  <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground"/></TooltipTrigger>
                  <TooltipContent><p>URL para a imagem do logo no cabeçalho.</p></TooltipContent>
              </Tooltip>
            </div>
            <Input
              id="logo-url"
              value={props.logoUrl || ""}
              onChange={(e) => onPropChange("logoUrl", e.target.value)}
            />
          </div>
        );
      case "Banner":
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="image-url">URL da Imagem</Label>
              <Tooltip>
                  <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground"/></TooltipTrigger>
                  <TooltipContent><p>URL para a imagem principal do banner.</p></TooltipContent>
              </Tooltip>
            </div>
            <Input
              id="image-url"
              value={props.imageUrl || ""}
              onChange={(e) => onPropChange("imageUrl", e.target.value)}
            />
          </div>
        );
      case "Title":
      case "Subtitle":
         return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="text-content">Texto</Label>
              <Textarea
                id="text-content"
                value={props.text || ""}
                onChange={(e) => onPropChange("text", e.target.value)}
                rows={4}
              />
            </div>
            <Separator />
            <TextStyleSettings props={props} onPropChange={onPropChange} />
          </div>
        );
      case "Paragraph":
         return (
          <div className="space-y-4">
            <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="text-content">Texto</Label>
                   <Tooltip>
                        <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground"/></TooltipTrigger>
                        <TooltipContent>
                            <p>Você pode usar tags HTML básicas para formatar:</p>
                            <ul className="list-disc pl-4 mt-2">
                                <li>{'<b>Negrito</b>'}</li>
                                <li>{'<i>Itálico</i>'}</li>
                                <li>{'<u>Sublinhado</u>'}</li>
                                <li>{'<a href="..." target="_blank">Link</a>'}</li>
                            </ul>
                        </TooltipContent>
                    </Tooltip>
                </div>
                <Textarea
                id="text-content"
                value={props.text || ""}
                onChange={(e) => onPropChange("text", e.target.value)}
                rows={8}
                />
            </div>
            <Separator />
            <TextStyleSettings props={props} onPropChange={onPropChange} />
          </div>
        );
      case "Image":
        return (
          <div className="space-y-4">
             <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="image-src">URL da Imagem</Label>
                   <Tooltip>
                    <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground"/></TooltipTrigger>
                    <TooltipContent><p>URL de origem para a imagem.</p></TooltipContent>
                  </Tooltip>
                </div>
                <Input
                    id="image-src"
                    value={props.src || ""}
                    onChange={(e) => onPropChange("src", e.target.value)}
                    placeholder="https://placehold.co/800x200.png"
                />
             </div>
              <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Label htmlFor="image-alt">Texto Alternativo</Label>
                    <Tooltip>
                      <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground"/></TooltipTrigger>
                      <TooltipContent><p>Texto descritivo para acessibilidade.</p></TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                      id="image-alt"
                      value={props.alt || ""}
                      onChange={(e) => onPropChange("alt", e.target.value)}
                      placeholder="Texto descritivo para a imagem"
                  />
              </div>
          </div>
        );
    case 'Video':
        return (
          <div className="space-y-2">
            <Label htmlFor="video-url">URL do Vídeo (YouTube)</Label>
            <Input
              id="video-url"
              value={props.url || ''}
              onChange={(e) => onPropChange('url', e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>
        );
      case 'Countdown':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="countdown-date">Data e Hora do Fim</Label>
              <Input
                id="countdown-date"
                type="datetime-local"
                value={props.targetDate || ''}
                onChange={(e) => onPropChange('targetDate', e.target.value)}
              />
            </div>
            <Separator />
            <TextStyleSettings props={props} onPropChange={onPropChange} />
          </div>
        );
      case 'Divider':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="divider-thickness">Espessura (px)</Label>
              <Input
                id="divider-thickness"
                type="number"
                value={props.thickness || 1}
                onChange={(e) => onPropChange('thickness', parseInt(e.target.value, 10) || 1)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="divider-style">Estilo</Label>
              <Select value={props.style || 'solid'} onValueChange={(value) => onPropChange('style', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o estilo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solid">Sólido</SelectItem>
                  <SelectItem value="dotted">Pontilhado</SelectItem>
                  <SelectItem value="dashed">Tracejado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="divider-color">Cor</Label>
              <Input
                id="divider-color"
                type="color"
                value={props.color || '#cccccc'}
                onChange={(e) => onPropChange('color', e.target.value)}
                className="p-1 h-10"
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="divider-margin">Margem Vertical (px)</Label>
              <Input
                id="divider-margin"
                type="number"
                value={props.margin || 20}
                onChange={(e) => onPropChange('margin', parseInt(e.target.value, 10) || 0)}
              />
            </div>
          </div>
        );
      case 'Spacer':
        return (
            <div className="space-y-2">
                <Label htmlFor="spacer-height">Altura (px)</Label>
                <Input
                id="spacer-height"
                type="number"
                value={props.height || 20}
                onChange={(e) => onPropChange('height', parseInt(e.target.value, 10))}
                />
            </div>
        );
    case 'Button':
        return (
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="button-text">Texto do Botão</Label>
                    <Input
                        id="button-text"
                        value={props.text || ''}
                        onChange={(e) => onPropChange('text', e.target.value)}
                        placeholder="Clique Aqui"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="button-href">URL do Link</Label>
                    <Input
                        id="button-href"
                        value={props.href || ''}
                        onChange={(e) => onPropChange('href', e.target.value)}
                        placeholder="https://exemplo.com"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="button-align">Alinhamento</Label>
                     <Select value={props.align || 'center'} onValueChange={(value) => onPropChange('align', value)}>
                        <SelectTrigger>
                        <SelectValue placeholder="Selecione o alinhamento" />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="left">Esquerda</SelectItem>
                        <SelectItem value="center">Centro</SelectItem>
                        <SelectItem value="right">Direita</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        );
      case "Form":
        return (
          <div className="space-y-4">
             <div>
                <Label className="font-semibold">Campos do Formulário</Label>
                <div className="space-y-3 mt-2">
                    {formFields.map((field) => (
                        <div key={field.id} className="flex items-center justify-between">
                            <Label htmlFor={`field-${field.id}`}>{field.label}</Label>
                            <Switch
                                id={`field-${field.id}`}
                                checked={props.fields?.[field.id] || false}
                                onCheckedChange={(checked) => onSubPropChange('fields', field.id, checked)}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <Separator />

            <div>
                <Label className="font-semibold">Placeholders dos Campos</Label>
                <div className="space-y-3 mt-2">
                    {formFields.filter(f => props.fields?.[f.id] && f.id !== 'city').map((field) => (
                         <div className="space-y-2" key={`placeholder-${field.id}`}>
                            <Label htmlFor={`placeholder-${field.id}`}>{field.label}</Label>
                            <Input
                                id={`placeholder-${field.id}`}
                                value={props.placeholders?.[field.id] || ''}
                                onChange={(e) => onSubPropChange('placeholders', field.id, e.target.value)}
                             />
                        </div>
                    ))}
                </div>
            </div>

            {props.fields?.city && (
                 <>
                    <Separator />
                    <div className="space-y-2">
                         <div className="flex items-center gap-1.5">
                            <Label htmlFor="form-cities">Lista de Cidades</Label>
                            <Tooltip>
                                <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground"/></TooltipTrigger>
                                <TooltipContent><p>Uma cidade por linha. Serão exibidas no dropdown.</p></TooltipContent>
                            </Tooltip>
                         </div>
                        <Textarea
                            id="form-cities"
                            value={props.cities || ''}
                            onChange={(e) => onPropChange('cities', e.target.value)}
                            rows={6}
                        />
                    </div>
                 </>
            )}
            
            <Separator />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="field-optin" className="font-semibold">Opt-in de Consentimento</Label>
                <Switch
                    id="field-optin"
                    checked={props.fields?.optin || false}
                    onCheckedChange={(checked) => onSubPropChange('fields', 'optin', checked)}
                />
              </div>
              {props.fields?.optin && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-1.5">
                    <Label htmlFor="form-consent-text">Texto de Consentimento</Label>
                    <Tooltip>
                      <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground"/></TooltipTrigger>
                      <TooltipContent><p>O texto legal para o consentimento do usuário. Suporta HTML.</p></TooltipContent>
                    </Tooltip>
                  </div>
                  <Textarea
                    id="form-consent-text"
                    value={props.consentText || ""}
                    onChange={(e) => onPropChange("consentText", e.target.value)}
                    rows={10}
                  />
                </div>
              )}
            </div>

            <Separator />
            
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="form-button-text">Texto do Botão de Envio</Label>
                    <Input
                        id="form-button-text"
                        value={props.buttonText || ""}
                        onChange={(e) => onPropChange("buttonText", e.target.value)}
                    />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="form-button-align">Alinhamento do Botão</Label>
                     <Select value={props.buttonAlign || 'center'} onValueChange={(value) => onPropChange('buttonAlign', value)}>
                        <SelectTrigger>
                        <SelectValue placeholder="Selecione o alinhamento" />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="left">Esquerda</SelectItem>
                        <SelectItem value="center">Centro</SelectItem>
                        <SelectItem value="right">Direita</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
          </div>
        );
      case 'Accordion':
      case 'Tabs':
        return <ListManager items={props.items || []} onPropChange={onPropChange} />;
      case 'Voting':
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
        case 'Stripe':
            return (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="stripe-text">Texto da Tarja</Label>
                        <Textarea
                            id="stripe-text"
                            value={props.text || ''}
                            onChange={(e) => onPropChange('text', e.target.value)}
                            rows={3}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="stripe-link">URL do Link (Opcional)</Label>
                        <Input
                            id="stripe-link"
                            value={props.linkUrl || ''}
                            onChange={(e) => onPropChange('linkUrl', e.target.value)}
                            placeholder="https://exemplo.com"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="stripe-bg-color">Cor de Fundo</Label>
                            <Input
                                id="stripe-bg-color"
                                type="color"
                                value={props.backgroundColor || '#000000'}
                                onChange={(e) => onPropChange('backgroundColor', e.target.value)}
                                className="p-1 h-10"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="stripe-text-color">Cor do Texto</Label>
                            <Input
                                id="stripe-text-color"
                                type="color"
                                value={props.textColor || '#FFFFFF'}
                                onChange={(e) => onPropChange('textColor', e.target.value)}
                                className="p-1 h-10"
                            />
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <Label htmlFor="stripe-closable">Permitir Fechar</Label>
                        <Switch
                            id="stripe-closable"
                            checked={props.isClosable}
                            onCheckedChange={(checked) => onPropChange('isClosable', checked)}
                        />
                    </div>
                </div>
            );
        case 'NPS':
            return (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="nps-question">Pergunta Principal</Label>
                        <Textarea
                            id="nps-question"
                            value={props.question || ''}
                            onChange={(e) => onPropChange('question', e.target.value)}
                            rows={3}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="nps-type">Tipo de Escala</Label>
                        <Select value={props.type || 'numeric'} onValueChange={(value) => onPropChange('type', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="numeric">Numérica (0-10)</SelectItem>
                                <SelectItem value="faces">Carinhas (Emojis)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="nps-low-label">Rótulo Inferior</Label>
                        <Input
                            id="nps-low-label"
                            value={props.lowLabel || ''}
                            onChange={(e) => onPropChange('lowLabel', e.target.value)}
                            placeholder="Ex: Pouco provável"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="nps-high-label">Rótulo Superior</Label>
                        <Input
                            id="nps-high-label"
                            value={props.highLabel || ''}
                            onChange={(e) => onPropChange('highLabel', e.target.value)}
                            placeholder="Ex: Muito provável"
                        />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="nps-thanks">Mensagem de Agradecimento</Label>
                        <Textarea
                            id="nps-thanks"
                            value={props.thankYouMessage || ''}
                            onChange={(e) => onPropChange('thankYouMessage', e.target.value)}
                            rows={3}
                        />
                    </div>
                </div>
            );
      case "Map":
        return (
            <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                    <Label htmlFor="map-embed-url">URL de Incorporação do Google Maps</Label>
                    <Tooltip>
                        <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground"/></TooltipTrigger>
                        <TooltipContent>
                            <p className="max-w-xs">
                                No Google Maps, encontre um local, clique em "Compartilhar", depois em "Incorporar um mapa" e copie a URL que está dentro do atributo `src` do iframe.
                            </p>
                        </TooltipContent>
                    </Tooltip>
                </div>
                <Textarea
                    id="map-embed-url"
                    value={props.embedUrl || ""}
                    onChange={(e) => onPropChange("embedUrl", e.target.value)}
                    rows={5}
                    placeholder='Cole aqui a URL do atributo "src" do iframe de incorporação do Google Maps'
                />
            </div>
        );
      case "Footer":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="footer-text-1">Texto do Rodapé 1</Label>
                  <Tooltip>
                    <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground"/></TooltipTrigger>
                    <TooltipContent><p>Primeira linha de texto no rodapé (ex: copyright).</p></TooltipContent>
                  </Tooltip>
                </div>
                <Textarea id="footer-text-1" value={props.footerText1 || ""} onChange={(e) => onPropChange("footerText1", e.target.value)} rows={3}/>
            </div>
            <div className="space-y-2">
                 <div className="flex items-center gap-1.5">
                  <Label htmlFor="footer-text-2">Texto do Rodapé 2</Label>
                   <Tooltip>
                    <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground"/></TooltipTrigger>
                    <TooltipContent><p>Segunda linha de texto no rodapé (ex: informações da empresa).</p></TooltipContent>
                  </Tooltip>
                </div>
                <Textarea id="footer-text-2" value={props.footerText2 || ""} onChange={(e) => onPropChange("footerText2", e.target.value)} rows={6} />
            </div>
            <div className="space-y-2">
                 <div className="flex items-center gap-1.5">
                  <Label htmlFor="footer-text-3">Texto do Rodapé 3</Label>
                   <Tooltip>
                    <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground"/></TooltipTrigger>
                    <TooltipContent><p>Terceira linha de texto no rodapé (ex: aviso legal).</p></TooltipContent>
                  </Tooltip>
                </div>
                <Textarea id="footer-text-3" value={props.footerText3 || ""} onChange={(e) => onPropChange("footerText3", e.target.value)} rows={4}/>
            </div>
          </div>
        );
      default:
        return <p className="text-sm text-muted-foreground">Nenhuma configuração disponível para este componente.</p>;
    }
}

export function ComponentSettings({ component, onComponentChange }: ComponentSettingsProps) {

  const abTestEnabled = component.abTestEnabled || false;
  const variantProps = (component.abTestVariants && component.abTestVariants[0]) || {};

  const handlePropChange = (prop: string, value: any) => {
    const updatedComponent = produce(component, draft => {
      draft.props[prop] = value;
    });
    onComponentChange(component.id, updatedComponent);
  };

  const handleSubPropChange = (prop: string, subProp: string, value: any) => {
    const updatedComponent = produce(component, draft => {
        if (!draft.props[prop]) {
            draft.props[prop] = {};
        }
        draft.props[prop][subProp] = value;
    });
    onComponentChange(component.id, updatedComponent);
  };

  const handleAbTestToggle = (checked: boolean) => {
    const updatedComponent = produce(component, draft => {
      draft.abTestEnabled = checked;
      if (checked && (!draft.abTestVariants || draft.abTestVariants.length === 0)) {
        draft.abTestVariants = [{}];
      }
    });
    onComponentChange(component.id, updatedComponent);
  };
  

  const handleVariantPropChange = (variantIndex: number, prop: string, value: any) => {
    const updatedComponent = produce(component, draft => {
      if (!draft.abTestVariants) {
        draft.abTestVariants = [];
      }
      while (draft.abTestVariants.length <= variantIndex) {
        draft.abTestVariants.push({});
      }
      draft.abTestVariants[variantIndex] = {
        ...draft.abTestVariants[variantIndex],
        [prop]: value,
      };
    });
    onComponentChange(component.id, updatedComponent);
  };
  
  const handleVariantSubPropChange = (variantIndex: number, prop: string, subProp: string, value: any) => {
    const updatedComponent = produce(component, draft => {
        if (!draft.abTestVariants) {
            draft.abTestVariants = [{}];
        }
        if (!draft.abTestVariants[variantIndex]) {
            draft.abTestVariants[variantIndex] = {};
        }
        if (!draft.abTestVariants[variantIndex][prop]) {
            draft.abTestVariants[variantIndex][prop] = {};
        }
        draft.abTestVariants[variantIndex][prop][subProp] = value;
    });
    onComponentChange(component.id, updatedComponent);
  };


  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div>
            <h3 className="text-sm font-medium mb-4">Configurações Gerais</h3>
            {renderComponentSettings(component.type, component.props, handlePropChange, handleSubPropChange)}
        </div>
        
        <Separator />
        
        <div>
            <h3 className="text-sm font-medium mb-4 flex items-center gap-2"><Scaling className="h-4 w-4" /> Espaçamento</h3>
            <SpacingSettings props={component.props} onPropChange={handlePropChange} />
        </div>

        <Separator />
        
        <div className="space-y-4">
             <div className="flex items-center justify-between">
                <Label htmlFor="ab-test-enabled" className="flex items-center gap-2 font-semibold">
                    <Star className="h-4 w-4 text-yellow-500"/>
                    Teste A/B
                </Label>
                <Switch
                    id="ab-test-enabled"
                    checked={abTestEnabled}
                    onCheckedChange={handleAbTestToggle}
                />
            </div>
            {abTestEnabled && (
                <div className="p-4 border rounded-md space-y-6 bg-muted/30">
                     <h4 className="font-medium text-sm text-muted-foreground">Configurações da Variante B</h4>
                     <div>
                        <h3 className="text-sm font-medium mb-4">Configurações Gerais (Variante)</h3>
                         {renderComponentSettings(
                             component.type, 
                             variantProps, 
                             (prop, value) => handleVariantPropChange(0, prop, value), 
                             (prop, subProp, value) => handleVariantSubPropChange(0, prop, subProp, value)
                          )}
                     </div>
                     <Separator/>
                     <div>
                        <h3 className="text-sm font-medium mb-4 flex items-center gap-2"><Scaling className="h-4 w-4" /> Espaçamento (Variante)</h3>
                        <SpacingSettings props={variantProps} onPropChange={(prop, value) => handleVariantPropChange(0, prop, value)} />
                     </div>
                </div>
            )}
        </div>
      </div>
    </TooltipProvider>
  )
}
