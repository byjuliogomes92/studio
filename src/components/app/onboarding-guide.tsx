
"use client";

import { useState } from 'react';
import { CheckCircle2, Circle, File, Folder, FilePlus, FileText, Code, ChevronUp, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { OnboardingObjectives } from '@/lib/types';

interface OnboardingGuideProps {
  objectives: OnboardingObjectives;
  onClose: () => void;
}

const objectivesConfig = [
  { key: 'createdFirstProject', label: 'Criar primeiro projeto', icon: Folder },
  { key: 'createdFirstPage', label: 'Criar primeira página', icon: File },
  { key: 'addedFirstForm', label: 'Adicionar primeiro formulário', icon: FileText },
  { key: 'createdFirstTemplate', label: 'Criar primeiro template', icon: FilePlus },
  { key: 'addedFirstAmpscript', label: 'Adicionar primeiro AMPScript', icon: Code },
];

export function OnboardingGuide({ objectives, onClose }: OnboardingGuideProps) {
  const [isOpen, setIsOpen] = useState(true);
  const completedCount = Object.values(objectives).filter(Boolean).length;
  const totalCount = objectivesConfig.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="w-full"
    >
      <Card className="bg-accent/40">
        <CardHeader className="flex flex-row items-center justify-between p-3">
          <div>
            <CardTitle className="text-base">Guia de Início Rápido</CardTitle>
          </div>
          <div className="flex items-center gap-0">
             <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <ChevronUp className={cn("h-4 w-4", isOpen && "rotate-180")} />
                  <span className="sr-only">Minimizar</span>
                </Button>
            </CollapsibleTrigger>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7">
                <X className="h-4 w-4" />
                <span className="sr-only">Fechar</span>
            </Button>
          </div>
        </CardHeader>
        <CollapsibleContent>
            <CardContent className="p-3 pt-0">
                <div className="space-y-3">
                <div className="flex items-center gap-2">
                     <span className="text-xs font-medium text-muted-foreground">
                        {completedCount}/{totalCount}
                    </span>
                    <div className="w-full bg-muted rounded-full h-1.5">
                    <div
                        className="bg-primary h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                    ></div>
                    </div>
                </div>
                <ul className="space-y-2">
                    {objectivesConfig.map((obj) => {
                    const isCompleted = objectives[obj.key as keyof OnboardingObjectives];
                    const Icon = obj.icon;
                    return (
                        <li key={obj.key} className="flex items-center gap-2">
                        {isCompleted ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                        ) : (
                            <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        )}
                        <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className={cn(
                            "text-sm",
                            isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'
                        )}>
                            {obj.label}
                        </span>
                        </li>
                    );
                    })}
                </ul>
                </div>
            </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
