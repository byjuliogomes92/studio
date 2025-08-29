
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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Guia de Início Rápido</CardTitle>
            <CardDescription>Complete estes passos para dominar a plataforma.</CardDescription>
          </div>
          <div className="flex items-center gap-1">
             <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon">
                  <ChevronUp className={cn("h-4 w-4", isOpen && "rotate-180")} />
                  <span className="sr-only">Minimizar</span>
                </Button>
            </CollapsibleTrigger>
            <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
                <span className="sr-only">Fechar</span>
            </Button>
          </div>
        </CardHeader>
        <CollapsibleContent>
            <CardContent>
                <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <div className="w-full bg-muted rounded-full h-2.5">
                    <div
                        className="bg-primary h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                    ></div>
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">
                    {completedCount}/{totalCount}
                    </span>
                </div>
                <ul className="space-y-3">
                    {objectivesConfig.map((obj) => {
                    const isCompleted = objectives[obj.key as keyof OnboardingObjectives];
                    const Icon = obj.icon;
                    return (
                        <li key={obj.key} className="flex items-center gap-3">
                        {isCompleted ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                            <Circle className="h-5 w-5 text-muted-foreground" />
                        )}
                        <Icon className="h-5 w-5 text-muted-foreground" />
                        <span className={isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'}>
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
