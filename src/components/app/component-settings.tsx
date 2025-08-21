
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
              <Label htmlFor="logo-url">Logo URL</Label>
              <Tooltip>
                  <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground"/></TooltipTrigger>
                  <TooltipContent><p>URL for the header logo image.</p></TooltipContent>
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
              <Label htmlFor="image-url">Image URL</Label>
              <Tooltip>
                  <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground"/></TooltipTrigger>
                  <TooltipContent><p>URL for the main banner image.</p></TooltipContent>
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
              <Label htmlFor="text-block-content">Text</Label>
              <Tooltip>
                  <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground"/></TooltipTrigger>
                  <TooltipContent><p>Content for the text block. Supports basic HTML.</p></TooltipContent>
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
                  <Label htmlFor="image-src">Image URL</Label>
                   <Tooltip>
                    <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground"/></TooltipTrigger>
                    <TooltipContent><p>Source URL for the image.</p></TooltipContent>
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
                    <Label htmlFor="image-alt">Alt Text</Label>
                    <Tooltip>
                      <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground"/></TooltipTrigger>
                      <TooltipContent><p>Descriptive text for accessibility.</p></TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                      id="image-alt"
                      value={component.props.alt || ""}
                      onChange={(e) => onPropChange("alt", e.target.value)}
                      placeholder="Descriptive text for the image"
                  />
              </div>
          </div>
        );
      case "Form":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="form-name-placeholder">Name Placeholder</Label>
                 <Tooltip>
                    <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground"/></TooltipTrigger>
                    <TooltipContent><p>Placeholder text for the name field.</p></TooltipContent>
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
                <Label htmlFor="form-email-placeholder">Email Placeholder</Label>
                 <Tooltip>
                    <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground"/></TooltipTrigger>
                    <TooltipContent><p>Placeholder text for the email field.</p></TooltipContent>
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
                <Label htmlFor="form-phone-placeholder">Phone Placeholder</Label>
                <Tooltip>
                  <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground"/></TooltipTrigger>
                  <TooltipContent><p>Placeholder text for the phone field.</p></TooltipContent>
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
                <Label htmlFor="form-cpf-placeholder">CPF Placeholder</Label>
                <Tooltip>
                  <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground"/></TooltipTrigger>
                  <TooltipContent><p>Placeholder text for the CPF field.</p></TooltipContent>
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
                <Label htmlFor="form-button-text">Button Text</Label>
                <Tooltip>
                  <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground"/></TooltipTrigger>
                  <TooltipContent><p>Text displayed on the form submission button.</p></TooltipContent>
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
                <Label htmlFor="form-consent-text">Consent Text</Label>
                <Tooltip>
                  <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground"/></TooltipTrigger>
                  <TooltipContent><p>The legal text for user consent. Supports HTML.</p></TooltipContent>
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
                  <Label htmlFor="footer-text-1">Footer Text 1</Label>
                  <Tooltip>
                    <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground"/></TooltipTrigger>
                    <TooltipContent><p>First line of text in the footer (e.g., copyright).</p></TooltipContent>
                  </Tooltip>
                </div>
                <Textarea id="footer-text-1" value={component.props.footerText1 || ""} onChange={(e) => onPropChange("footerText1", e.target.value)} rows={3}/>
            </div>
            <div className="space-y-2">
                 <div className="flex items-center gap-1.5">
                  <Label htmlFor="footer-text-2">Footer Text 2</Label>
                   <Tooltip>
                    <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground"/></TooltipTrigger>
                    <TooltipContent><p>Second line of text in the footer (e.g., company info).</p></TooltipContent>
                  </Tooltip>
                </div>
                <Textarea id="footer-text-2" value={component.props.footerText2 || ""} onChange={(e) => onPropChange("footerText2", e.target.value)} rows={6} />
            </div>
            <div className="space-y-2">
                 <div className="flex items-center gap-1.5">
                  <Label htmlFor="footer-text-3">Footer Text 3</Label>
                   <Tooltip>
                    <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground"/></TooltipTrigger>
                    <TooltipContent><p>Third line of text in the footer (e.g., legal disclaimer).</p></TooltipContent>
                  </Tooltip>
                </div>
                <Textarea id="footer-text-3" value={component.props.footerText3 || ""} onChange={(e) => onPropChange("footerText3", e.target.value)} rows={4}/>
            </div>
          </div>
        );
      default:
        return <p className="text-sm text-muted-foreground">No settings available for this component.</p>;
    }
  };

  return <div className="space-y-4">{renderSettings()}</div>;
}
