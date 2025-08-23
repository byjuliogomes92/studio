
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
} from "lucide-react";
import type { ComponentType } from "@/lib/types";
import { useState } from "react";

const componentList: {
  category: string;
  components: { name: ComponentType; icon: LucideIcon }[];
}[] = [
  {
    category: "Estrutura",
    components: [
      { name: "Header", icon: AlignStartVertical },
      { name: "Banner", icon: Image },
      { name: "Stripe", icon: PanelTop },
      { name: "Footer", icon: AlignEndVertical },
    ],
  },
  {
    category: "Conteúdo",
    components: [
      { name: "Title", icon: Heading1 },
      { name: "Subtitle", icon: Heading2 },
      { name: "Paragraph", icon: Text },
      { name: "Image", icon: Image },
      { name: "Video", icon: Film },
      { name: "Map", icon: MapPin },
    ],
  },
  {
    category: "Layout",
    components: [
      { name: "Button", icon: MousePointerClick },
      { name: "Countdown", icon: Timer },
      { name: "Divider", icon: Minus },
      { name: "Spacer", icon: StretchHorizontal },
      { name: "SocialIcons", icon: Share2 },
    ],
  },
  {
    category: "Interativos",
    components: [
      { name: "Form", icon: Text },
      { name: "Accordion", icon: Layers },
      { name: "Tabs", icon: PanelTop },
      { name: "Voting", icon: Vote },
      { name: "NPS", icon: Smile },
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
                {group.components.map(({ name, icon: Icon }) => (
                  <Button
                    key={name}
                    variant="outline"
                    className="h-24 flex-col gap-2"
                    onClick={() => handleComponentClick(name)}
                  >
                    <Icon className="h-6 w-6" />
                    {name}
                  </Button>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
