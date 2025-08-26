
"use client";

import { CheckCircle2, Circle, File, Folder, FilePlus, FileText, Code } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { OnboardingObjectives } from '@/lib/types';

interface OnboardingGuideProps {
  objectives: OnboardingObjectives;
}

const objectivesConfig = [
  { key: 'createdFirstProject', label: 'Criar primeiro projeto', icon: Folder },
  { key: 'createdFirstPage', label: 'Criar primeira página', icon: File },
  { key: 'addedFirstForm', label: 'Adicionar primeiro formulário', icon: FileText },
  { key: 'createdFirstTemplate', label: 'Criar primeiro template', icon: FilePlus },
  { key: 'addedFirstAmpscript', label: 'Adicionar primeiro AMPScript', icon: Code },
];

export function OnboardingGuide({ objectives }: OnboardingGuideProps) {
  const completedCount = Object.values(objectives).filter(Boolean).length;
  const totalCount = objectivesConfig.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Guia de Início Rápido</CardTitle>
        <CardDescription>Complete estes passos para dominar a plataforma.</CardDescription>
      </CardHeader>
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
                  <span className={isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'}>
                    {obj.label}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
