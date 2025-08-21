"use client";

import type { PageComponent } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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
            <Label htmlFor="header-title">Title</Label>
            <Input
              id="header-title"
              value={component.props.title || ""}
              onChange={(e) => onPropChange("title", e.target.value)}
            />
          </div>
        );
      case "TextBlock":
        return (
          <div className="space-y-2">
            <Label htmlFor="text-block-content">Text</Label>
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
                <Label htmlFor="image-src">Image URL</Label>
                <Input
                    id="image-src"
                    value={component.props.src || ""}
                    onChange={(e) => onPropChange("src", e.target.value)}
                    placeholder="https://placehold.co/1200x600.png"
                />
             </div>
              <div className="space-y-2">
                  <Label htmlFor="image-alt">Alt Text</Label>
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
              <Label htmlFor="form-title">Title</Label>
              <Input
                id="form-title"
                value={component.props.title || ""}
                onChange={(e) => onPropChange("title", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="form-button-text">Button Text</Label>
              <Input
                id="form-button-text"
                value={component.props.buttonText || ""}
                onChange={(e) => onPropChange("buttonText", e.target.value)}
              />
            </div>
          </div>
        );
      case "Footer":
        return (
          <div className="space-y-2">
            <Label htmlFor="footer-text">Text</Label>
            <Input
              id="footer-text"
              value={component.props.text || ""}
              onChange={(e) => onPropChange("text", e.target.value)}
            />
          </div>
        );
      default:
        return <p className="text-sm text-muted-foreground">No settings available for this component.</p>;
    }
  };

  return <div className="space-y-4">{renderSettings()}</div>;
}
