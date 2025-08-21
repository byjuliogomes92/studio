
"use client";

import type { Dispatch, SetStateAction } from "react";
import type { CloudPage, ComponentType, PageComponent } from "@/lib/types";
import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
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
import { ComponentSettings } from "./component-settings";
import { GripVertical, Plus, Trash2 } from "lucide-react";
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
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);


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
  
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(pageState.components);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setPageState(prev => ({...prev, components: items}));
  };

  const handlePropChange = (id: string, prop: string, value: any) => {
    setPageState((prev) => ({
      ...prev,
      components: prev.components.map((c) =>
        c.id === id ? { ...c, props: { ...c.props, [prop]: value } } : c
      ),
    }));
  };

  const selectedComponent = pageState.components.find((c) => c.id === selectedComponentId);

  const renderComponentList = () => {
    if (!isClient) {
      return null;
    }

    return (
       <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="components">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
              {pageState.components.map((c, index) => (
                <Draggable key={c.id} draggableId={c.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="flex items-center gap-2 group"
                    >
                       <div {...provided.dragHandleProps}>
                         <GripVertical className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <Button
                        variant={selectedComponentId === c.id ? "secondary" : "ghost"}
                        className="flex-grow justify-start"
                        onClick={() => setSelectedComponentId(c.id)}
                      >
                        {c.type}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive/80 hover:text-destructive"
                        onClick={() => removeComponent(c.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    );
  }

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
              <Label>Background Image URL</Label>
              <Input value={pageState.styles.backgroundImage} onChange={(e) => handleStyleChange('backgroundImage', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Theme Color</Label>
              <Input type="color" value={pageState.styles.themeColor} onChange={(e) => handleStyleChange('themeColor', e.target.value)} className="p-1"/>
            </div>
             <div className="space-y-2">
              <Label>Theme Color (Hover)</Label>
              <Input type="color" value={pageState.styles.themeColorHover} onChange={(e) => handleStyleChange('themeColorHover', e.target.value)} className="p-1"/>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="components">
          <AccordionTrigger>Components</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            {renderComponentList()}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Plus className="mr-2 h-4 w-4" /> Add Component
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => addComponent("Header")}>Header</DropdownMenuItem>
                <DropdownMenuItem onClick={() => addComponent("Banner")}>Banner</DropdownMenuItem>
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
             <div className="space-y-2">
              <Label>Favicon URL</Label>
              <Input value={pageState.meta.faviconUrl} onChange={(e) => handleMetaChange('faviconUrl', e.target.value)} />
            </div>
             <div className="space-y-2">
              <Label>Loader Image URL</Label>
              <Input value={pageState.meta.loaderImageUrl} onChange={(e) => handleMetaChange('loaderImageUrl', e.target.value)} />
            </div>
             <div className="space-y-2">
              <Label>Redirect URL on Submit</Label>
              <Input value={pageState.meta.redirectUrl} onChange={(e) => handleMetaChange('redirectUrl', e.target.value)} />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
    </ScrollArea>
  );
}
