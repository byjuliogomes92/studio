"use client";

import type { Dispatch, SetStateAction } from "react";
import type { CloudPage, ComponentType, PageComponent } from "@/lib/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ComponentSettings } from "./component-settings";
import { ArrowDown, ArrowUp, GripVertical, Plus, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SettingsPanelProps {
  pageState: CloudPage;
  setPageState: Dispatch<SetStateAction<CloudPage>>;
  selectedComponentId: string | null;
  setSelectedComponentId: Dispatch<SetStateAction<string | null>>;
}

export function SettingsPanel({
  pageState,
  setPageState,
  selectedComponentId,
  setSelectedComponentId,
}: SettingsPanelProps) {

  const handleStyleChange = (prop: keyof CloudPage["styles"], value: string) => {
    setPageState((prev) => ({ ...prev, styles: { ...prev.styles, [prop]: value } }));
  };

  const handleMetaChange = (prop: keyof CloudPage["meta"], value: string) => {
    setPageState((prev) => ({ ...prev, meta: { ...prev.meta, [prop]: value } }));
  };

  const addComponent = (type: ComponentType) => {
    const newComponent: PageComponent = {
      id: Date.now().toString(),
      type,
      props: {},
    };
    setPageState((prev) => ({
      ...prev,
      components: [...prev.components, newComponent],
    }));
    setSelectedComponentId(newComponent.id);
  };

  const removeComponent = (id: string) => {
    setPageState((prev) => ({
      ...prev,
      components: prev.components.filter((c) => c.id !== id),
    }));
    if (selectedComponentId === id) {
      setSelectedComponentId(null);
    }
  };
  
  const moveComponent = (id: string, direction: 'up' | 'down') => {
    const index = pageState.components.findIndex(c => c.id === id);
    if (index === -1) return;

    const newComponents = [...pageState.components];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newComponents.length) return;

    [newComponents[index], newComponents[targetIndex]] = [newComponents[targetIndex], newComponents[index]];
    setPageState(prev => ({...prev, components: newComponents}));
  }

  const handlePropChange = (id: string, prop: string, value: any) => {
    setPageState((prev) => ({
      ...prev,
      components: prev.components.map((c) =>
        c.id === id ? { ...c, props: { ...c.props, [prop]: value } } : c
      ),
    }));
  };

  const selectedComponent = pageState.components.find((c) => c.id === selectedComponentId);

  return (
    <ScrollArea className="h-full">
    <div className="p-4 space-y-6">
      <Accordion type="multiple" defaultValue={["components"]} className="w-full">
        <AccordionItem value="styles">
          <AccordionTrigger>Global Styles</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Background Color</Label>
              <Input type="color" value={pageState.styles.backgroundColor} onChange={(e) => handleStyleChange('backgroundColor', e.target.value)} className="p-1"/>
            </div>
            <div className="space-y-2">
              <Label>Primary Color</Label>
              <Input type="color" value={pageState.styles.primaryColor} onChange={(e) => handleStyleChange('primaryColor', e.target.value)} className="p-1"/>
            </div>
            <div className="space-y-2">
              <Label>Accent Color</Label>
              <Input type="color" value={pageState.styles.accentColor} onChange={(e) => handleStyleChange('accentColor', e.target.value)} className="p-1"/>
            </div>
             <div className="space-y-2">
              <Label>Text Color</Label>
              <Input type="color" value={pageState.styles.textColor} onChange={(e) => handleStyleChange('textColor', e.target.value)} className="p-1"/>
            </div>
            <div className="space-y-2">
              <Label>Font Family</Label>
              <Select value={pageState.styles.fontFamily} onValueChange={(value) => handleStyleChange('fontFamily', value)}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Inter">Inter</SelectItem>
                  <SelectItem value="Roboto">Roboto</SelectItem>
                  <SelectItem value="Lato">Lato</SelectItem>
                  <SelectItem value="Georgia">Georgia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="components">
          <AccordionTrigger>Components</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div className="space-y-2">
                {pageState.components.map((c, index) => (
                    <div key={c.id} className="flex items-center gap-2 group">
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                        <Button
                            variant={selectedComponentId === c.id ? "secondary" : "ghost"}
                            className="flex-grow justify-start"
                            onClick={() => setSelectedComponentId(c.id)}
                        >
                            {c.type}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => moveComponent(c.id, 'up')} disabled={index === 0}>
                            <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => moveComponent(c.id, 'down')} disabled={index === pageState.components.length - 1}>
                            <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive/80 hover:text-destructive" onClick={() => removeComponent(c.id)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Plus className="mr-2 h-4 w-4" /> Add Component
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => addComponent("Header")}>Header</DropdownMenuItem>
                <DropdownMenuItem onClick={() => addComponent("TextBlock")}>Text Block</DropdownMenuItem>
                <DropdownMenuItem onClick={() => addComponent("Image")}>Image</DropdownMenuItem>
                <DropdownMenuItem onClick={() => addComponent("Form")}>Form</DropdownMenuItem>
                <DropdownMenuItem onClick={() => addComponent("Footer")}>Footer</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </AccordionContent>
        </AccordionItem>
         {selectedComponent && (
          <AccordionItem value="component-settings">
            <AccordionTrigger>{selectedComponent.type} Settings</AccordionTrigger>
            <AccordionContent className="pt-2">
                <ComponentSettings
                component={selectedComponent}
                onPropChange={(prop, value) => handlePropChange(selectedComponent.id, prop, value)}
                />
            </AccordionContent>
          </AccordionItem>
        )}
         <AccordionItem value="meta">
          <AccordionTrigger>Page Settings</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Page Title</Label>
              <Input value={pageState.meta.title} onChange={(e) => handleMetaChange('title', e.target.value)} />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
    </ScrollArea>
  );
}
