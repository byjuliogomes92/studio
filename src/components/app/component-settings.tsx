
"use client";

import type { PageComponent } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ComponentSettingsProps {
  component: PageComponent;
  onPropChange: (prop: string, value: any) => void;
}

export function ComponentSettings({ component, onPropChange }: ComponentSettingsProps) {
  const renderSettings = () => {
    switch (component.type) {
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
              value={component.props.logoUrl || ""}
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
              value={component.props.imageUrl || ""}
              onChange={(e) => onPropChange("imageUrl", e.target.value)}
            />
          </div>
        );
      case "TextBlock":
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="text-block-content">Texto</Label>
              <Tooltip>
                  <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground"/></TooltipTrigger>
                  <TooltipContent><p>Conteúdo para o bloco de texto. Suporta HTML básico.</p></TooltipContent>
              </Tooltip>
            </div>
            <Textarea
              id="text-block-content"
              value={component.props.text || ""}
              onChange={(e) => onPropChange("text", e.target.value)}
              rows={6}
            />
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
                    value={component.props.src || ""}
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
                      value={component.props.alt || ""}
                      onChange={(e) => onPropChange("alt", e.target.value)}
                      placeholder="Texto descritivo para a imagem"
                  />
              </div>
          </div>
        );
      case "Form":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="form-name-placeholder">Placeholder do Nome</Label>
                 <Tooltip>
                    <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground"/></TooltipTrigger>
                    <TooltipContent><p>Texto de exemplo para o campo de nome.</p></TooltipContent>
                  </Tooltip>
              </div>
              <Input
                id="form-name-placeholder"
                value={component.props.namePlaceholder || ""}
                onChange={(e) => onPropChange("namePlaceholder", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="form-email-placeholder">Placeholder do Email</Label>
                 <Tooltip>
                    <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground"/></TooltipTrigger>
                    <TooltipContent><p>Texto de exemplo para o campo de email.</p></TooltipContent>
                  </Tooltip>
              </div>
              <Input
                id="form-email-placeholder"
                value={component.props.emailPlaceholder || ""}
                onChange={(e) => onPropChange("emailPlaceholder", e.target.value)}
              />
            </div>
             <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="form-phone-placeholder">Placeholder do Telefone</Label>
                <Tooltip>
                  <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground"/></TooltipTrigger>
                  <TooltipContent><p>Texto de exemplo para o campo de telefone.</p></TooltipContent>
                </Tooltip>
              </div>
              <Input
                id="form-phone-placeholder"
                value={component.props.phonePlaceholder || ""}
                onChange={(e) => onPropChange("phonePlaceholder", e.target.value)}
              />
            </div>
             <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="form-cpf-placeholder">Placeholder do CPF</Label>
                <Tooltip>
                  <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground"/></TooltipTrigger>
                  <TooltipContent><p>Texto de exemplo para o campo de CPF.</p></TooltipContent>
                </Tooltip>
              </div>
              <Input
                id="form-cpf-placeholder"
                value={component.props.cpfPlaceholder || ""}
                onChange={(e) => onPropChange("cpfPlaceholder", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="form-button-text">Texto do Botão</Label>
                <Tooltip>
                  <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground"/></TooltipTrigger>
                  <TooltipContent><p>Texto exibido no botão de envio do formulário.</p></TooltipContent>
                </Tooltip>
              </div>
              <Input
                id="form-button-text"
                value={component.props.buttonText || ""}
                onChange={(e) => onPropChange("buttonText", e.target.value)}
              />
            </div>
             <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="form-consent-text">Texto de Consentimento</Label>
                <Tooltip>
                  <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground"/></TooltipTrigger>
                  <TooltipContent><p>O texto legal para o consentimento do usuário. Suporta HTML.</p></TooltipContent>
                </Tooltip>
              </div>
              <Textarea
                id="form-consent-text"
                value={component.props.consentText || ""}
                onChange={(e) => onPropChange("consentText", e.target.value)}
                rows={10}
              />
            </div>
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
                <Textarea id="footer-text-1" value={component.props.footerText1 || ""} onChange={(e) => onPropChange("footerText1", e.target.value)} rows={3}/>
            </div>
            <div className="space-y-2">
                 <div className="flex items-center gap-1.5">
                  <Label htmlFor="footer-text-2">Texto do Rodapé 2</Label>
                   <Tooltip>
                    <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground"/></TooltipTrigger>
                    <TooltipContent><p>Segunda linha de texto no rodapé (ex: informações da empresa).</p></TooltipContent>
                  </Tooltip>
                </div>
                <Textarea id="footer-text-2" value={component.props.footerText2 || ""} onChange={(e) => onPropChange("footerText2", e.target.value)} rows={6} />
            </div>
            <div className="space-y-2">
                 <div className="flex items-center gap-1.5">
                  <Label htmlFor="footer-text-3">Texto do Rodapé 3</Label>
                   <Tooltip>
                    <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground"/></TooltipTrigger>
                    <TooltipContent><p>Terceira linha de texto no rodapé (ex: aviso legal).</p></TooltipContent>
                  </Tooltip>
                </div>
                <Textarea id="footer-text-3" value={component.props.footerText3 || ""} onChange={(e) => onPropChange("footerText3", e.target.value)} rows={4}/>
            </div>
          </div>
        );
      default:
        return <p className="text-sm text-muted-foreground">Nenhuma configuração disponível para este componente.</p>;
    }
  };

  return <div className="space-y-4">{renderSettings()}</div>;
}
