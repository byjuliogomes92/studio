
import type { PageComponent, HeaderLink, CloudPage, ButtonVariant } from "@/lib/types";
import React, { useRef } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Bold, Italic, Underline, Link, Code, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { produce } from 'immer';
import { ImageInput } from "./image-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ColorInput } from "./color-input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";


interface ComponentSettingsProps {
  component: PageComponent;
  onPropChange: (prop: string, value: any) => void;
  onSubPropChange: (prop: string, subProp: string, value: any) => void;
  pageState: CloudPage;
}

export function HeaderLinksManager({ links, onPropChange, pageState }: { links: HeaderLink[], onPropChange: (prop: string, value: any) => void, pageState: CloudPage }) {
    const handleLinkChange = (index: number, field: keyof HeaderLink, value: any) => {
        const newLinks = produce(links, draft => {
            (draft[index] as any)[field] = value;
        });
        onPropChange('links', newLinks);
    };

    const addLink = () => {
        const newLink: HeaderLink = { id: `link-${Date.now()}`, text: 'Novo Link', url: '#', style: 'link' };
        onPropChange('links', [...(links || []), newLink]);
    };

    const removeLink = (index: number) => {
        const newLinks = links.filter((_, i) => i !== index);
        onLinksChange(newLinks);
    };

    return (
        <div className="space-y-4">
            <Label>Itens de Menu</Label>
            {links?.map((link, index) => (
                <div key={link.id} className="p-3 border rounded-md space-y-3 bg-muted/30">
                     <div className="flex items-center justify-end">
                        <Button variant="ghost" size="icon" onClick={() => removeLink(index)} className="h-7 w-7 text-destructive">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label htmlFor={`link-text-${link.id}`} className="text-xs">Texto</Label>
                            <Input id={`link-text-${link.id}`} value={link.text} onChange={e => handleLinkChange(index, 'text', e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor={`link-url-${link.id}`} className="text-xs">URL</Label>
                            <Input id={`link-url-${link.id}`} value={link.url} onChange={e => handleLinkChange(index, 'url', e.target.value)} />
                        </div>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                        <Label className="text-xs">Estilo</Label>
                        <Select value={link.style || 'link'} onValueChange={(value: 'link' | 'button') => handleLinkChange(index, 'style', value)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="link">Apenas Link</SelectItem>
                                <SelectItem value="button">Botão</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {link.style === 'button' && (
                        <div className="space-y-4 pt-2">
                            <div className="space-y-2">
                                <Label className="text-xs">Variante do Botão</Label>
                                <Select value={link.variant || 'default'} onValueChange={(value: ButtonVariant) => handleLinkChange(index, 'variant', value)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="default">Padrão</SelectItem>
                                        <SelectItem value="destructive">Destrutivo</SelectItem>
                                        <SelectItem value="outline">Contorno</SelectItem>
                                        <SelectItem value="secondary">Secundário</SelectItem>
                                        <SelectItem value="ghost">Fantasma</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="grid grid-cols-2 gap-2">
                                <ColorInput
                                    label="Cor de Fundo"
                                    value={link.backgroundColor || ''}
                                    onChange={value => handleLinkChange(index, 'backgroundColor', value)}
                                    brand={pageState.brand}
                                />
                                <ColorInput
                                    label="Cor do Texto"
                                    value={link.textColor || ''}
                                    onChange={value => handleLinkChange(index, 'textColor', value)}
                                    brand={pageState.brand}
                                />
                            </div>
                        </div>
                    )}
                </div>
            ))}
            <Button variant="outline" className="w-full" onClick={addLink}>
                <Plus className="mr-2 h-4 w-4" /> Adicionar Item de Menu
            </Button>
        </div>
    );
}

const FormattingToolbar = ({ textareaRef, onContentChange }: { textareaRef: React.RefObject<HTMLTextAreaElement>, onContentChange: (newContent: string) => void }) => {
    const wrapSelection = (tag: string, isBlock: boolean = false) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);
        let replacement = '';
        
        if (tag === 'a') {
            const url = prompt('Digite a URL do link:', 'https://');
            if (!url) return; // User cancelled
            replacement = `<a href="${url}" target="_blank">${selectedText}</a>`;
        } else if (tag === 'pre') {
             replacement = `<pre><code>${selectedText}</code></pre>`;
        } else {
            replacement = `<${tag}>${selectedText}</${tag}>`;
        }

        const newContent = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
        onContentChange(newContent);
    };

    return (
        <div className="flex items-center gap-1 border-b p-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => wrapSelection('b')}><Bold className="h-4 w-4"/></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => wrapSelection('i')}><Italic className="h-4 w-4"/></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => wrapSelection('u')}><Underline className="h-4 w-4"/></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => wrapSelection('a')}><Link className="h-4 w-4"/></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => wrapSelection('pre')}><Code className="h-4 w-4"/></Button>
        </div>
    );
};

export function ListManagerSettings({ component, onPropChange, onSubPropChange }: ComponentSettingsProps) {
    const items = component.props.items || [];
    const styles = component.props.styles || {};
    const textareaRefs = useRef<(HTMLTextAreaElement | null)[]>([]);
  
    const handleItemChange = (itemId: string, field: 'title' | 'content', value: string) => {
      const newItems = items.map((item: any) =>
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
        items.filter((item: any) => item.id !== itemId)
      );
    };

    const handleStyleChange = (prop: string, value: any) => {
        onSubPropChange('styles', prop, value);
    };
  
    return (
        <div className="space-y-6">
            <div className="space-y-4">
                {items.map((item: any, index: number) => {
                    if (!textareaRefs.current[index]) {
                        textareaRefs.current[index] = null;
                    }
                    return (
                        <div key={item.id} className="p-3 border rounded-md space-y-3 relative bg-background">
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
                                <div className="border rounded-md">
                                    <FormattingToolbar
                                        textareaRef={{ current: textareaRefs.current[index] }}
                                        onContentChange={(newContent) => handleItemChange(item.id, 'content', newContent)}
                                    />
                                    <Textarea
                                        id={`item-content-${item.id}`}
                                        ref={(el) => (textareaRefs.current[index] = el)}
                                        value={item.content}
                                        onChange={(e) => handleItemChange(item.id, 'content', e.target.value)}
                                        rows={6}
                                        className="rounded-t-none border-t-0"
                                    />
                                </div>
                            </div>
                        </div>
                    )})}
                <Button variant="outline" className="w-full" onClick={addItem}>
                <Plus className="h-4 w-4 mr-2" /> Adicionar Item
                </Button>
            </div>
             <Separator />
            <div className="space-y-4">
                <h4 className="font-semibold text-sm">Estilo do Contêiner</h4>
                 <div className="space-y-2">
                    <Label htmlFor="accordion-max-width">Largura Máxima</Label>
                    <Input
                        id="accordion-max-width"
                        value={styles.maxWidth || '100%'}
                        onChange={(e) => handleStyleChange('maxWidth', e.target.value)}
                        placeholder="Ex: 700px ou 80%"
                    />
                </div>
                 <div className="space-y-2">
                    <Label>Alinhamento</Label>
                    <ToggleGroup 
                        type="single" 
                        value={styles.align || 'left'} 
                        onValueChange={(value) => value && handleStyleChange('align', value)}
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
            </div>
      </div>
    );
}

export function CarouselImageManager({ images, onPropChange }: { images: { id: string; url: string; alt: string }[], onPropChange: (prop: string, value: any) => void }) {
    const handleImageChange = (id: string, field: 'url' | 'alt', value: string) => {
        const newImages = images.map(img => img.id === id ? { ...img, [field]: value } : img);
        onPropChange('images', newImages);
    };

    const addImage = () => {
        const newImage = { id: `slide-${Date.now()}`, url: 'https://placehold.co/800x400.png', alt: 'Novo Slide' };
        onPropChange('images', [...(images || []), newImage]);
    };

    const removeImage = (id: string) => {
        onPropChange('images', images.filter(img => img.id !== id));
    };

    return (
        <div className="space-y-4">
            <Label>Slides do Carrossel</Label>
            {images?.map(image => (
                <div key={image.id} className="p-3 border rounded-md space-y-3 bg-muted/30">
                     <div className="flex items-center justify-end">
                        <Button variant="ghost" size="icon" onClick={() => removeImage(image.id)} className="h-7 w-7 text-destructive">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                    <ImageInput
                        label="URL da Imagem"
                        value={image.url}
                        onPropChange={(_, value) => handleImageChange(image.id, 'url', value)}
                        propName={`url-${image.id}`}
                        tooltipText="URL da imagem para este slide."
                    />
                    <div className="space-y-2">
                        <Label htmlFor={`alt-${image.id}`}>Texto Alternativo</Label>
                        <Input id={`alt-${image.id}`} value={image.alt} onChange={e => handleImageChange(image.id, 'alt', e.target.value)} />
                    </div>
                </div>
            ))}
            <Button variant="outline" className="w-full" onClick={addImage}>
                <Plus className="mr-2 h-4 w-4" /> Adicionar Slide
            </Button>
        </div>
    );
}
