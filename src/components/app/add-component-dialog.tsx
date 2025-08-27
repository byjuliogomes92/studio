

"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Plus,
  AlignStartVertical,
  Image,
  PanelTop,
  AlignEndVertical,
  Heading1,
  Heading2,
  Text,
  Film,
  MapPin,
  MousePointerClick,
  Timer,
  Minus,
  StretchHorizontal,
  Layers,
  Vote,
  Smile,
  Share2,
  type LucideIcon,
  Columns,
  BarChart,
  Zap,
  Download,
} from "lucide-react";
import type { ComponentType } from "@/lib/types";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

const componentList: {
  category: string;
  components: { name: ComponentType; icon: LucideIcon; enabled: boolean }[];
}[] = [
  {
    category: "Estrutura",
    components: [
      { name: "Header", icon: AlignStartVertical, enabled: true },
      { name: "Banner", icon: Image, enabled: true },
      { name: "Stripe", icon: PanelTop, enabled: true },
      { name: "Footer", icon: AlignEndVertical, enabled: true },
    ],
  },
  {
    category: "Conteúdo",
    components: [
      { name: "Title", icon: Heading1, enabled: true },
      { name: "Subtitle", icon: Heading2, enabled: true },
      { name: "Paragraph", icon: Text, enabled: true },
      { name: "Image", icon: Image, enabled: true },
      { name: "Video", icon: Film, enabled: true },
      { name: "Map", icon: MapPin, enabled: true },
    ],
  },
  {
    category: "Layout",
    components: [
      { name: "Columns", icon: Columns, enabled: true },
      { name: "Button", icon: MousePointerClick, enabled: true },
      { name: "DownloadButton", icon: Download, enabled: true },
      { name: "Countdown", icon: Timer, enabled: true },
      { name: "Divider", icon: Minus, enabled: true },
      { name: "Spacer", icon: StretchHorizontal, enabled: true },
      { name: "SocialIcons", icon: Share2, enabled: true },
      { name: "WhatsApp", icon: Zap, enabled: true },
    ],
  },
  {
    category: "Interativos",
    components: [
      { name: "Form", icon: Text, enabled: true },
      { name: "Accordion", icon: Layers, enabled: true },
      { name: "Tabs", icon: PanelTop, enabled: true },
      { name: "Voting", icon: Vote, enabled: true },
      { name: "NPS", icon: Smile, enabled: true },
      { name: "Chart", icon: BarChart, enabled: false },
    ],
  },
];

interface AddComponentDialogProps {
  onAddComponent: (type: ComponentType) => void;
}

export function AddComponentDialog({ onAddComponent }: AddComponentDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleComponentClick = (type: ComponentType) => {
    onAddComponent(type);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Plus className="mr-2 h-4 w-4" /> Adicionar Componente
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Componente</DialogTitle>
        </DialogHeader>
        <TooltipProvider>
            <Tabs defaultValue={componentList[0].category} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
                {componentList.map((group) => (
                <TabsTrigger key={group.category} value={group.category}>
                    {group.category}
                </TabsTrigger>
                ))}
            </TabsList>
            {componentList.map((group) => (
                <TabsContent key={group.category} value={group.category}>
                <div className="grid grid-cols-4 gap-4 p-4">
                    {group.components.map(({ name, icon: Icon, enabled }) =>
                    enabled ? (
                        <Button
                            key={name}
                            variant="outline"
                            className="h-24 flex-col gap-2"
                            onClick={() => handleComponentClick(name)}
                        >
                            <Icon className="h-6 w-6" />
                            {name}
                        </Button>
                    ) : (
                        <Tooltip key={name}>
                            <TooltipTrigger asChild>
                                <div className="h-24 flex flex-col items-center justify-center gap-2 rounded-md border bg-muted/50 text-muted-foreground cursor-not-allowed">
                                    <Icon className="h-6 w-6" />
                                    {name}
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Em breve</p>
                            </TooltipContent>
                        </Tooltip>
                    )
                    )}
                </div>
                </TabsContent>
            ))}
            </Tabs>
        </TooltipProvider>
      </DialogContent>
    </Dialog>
  );
}
