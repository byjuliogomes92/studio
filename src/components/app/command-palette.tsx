
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useAuth } from '@/hooks/use-auth';
import { Folder, FileText, Library, User, Palette, Image as ImageIcon, Plus } from 'lucide-react';
import { defaultTemplates } from '@/lib/default-templates';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { projects, pages, templates } = useAuth();
  
  const allTemplates = React.useMemo(() => {
    const defaults = defaultTemplates.map(t => ({...t, id: t.name, isDefault: true}));
    return [...defaults, ...templates];
  }, [templates]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);
  
  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Digite um comando ou busque..." />
      <CommandList>
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
        
        <CommandGroup heading="Ações Rápidas">
          <CommandItem onSelect={() => runCommand(() => router.push('/'))}>
            <Plus className="mr-2 h-4 w-4" />
            <span>Criar Novo Projeto</span>
          </CommandItem>
        </CommandGroup>
        
        <CommandSeparator />

        <CommandGroup heading="Navegação">
          <CommandItem onSelect={() => runCommand(() => router.push('/'))}>
            <Folder className="mr-2 h-4 w-4" />
            <span>Ver Projetos</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/templates'))}>
            <Library className="mr-2 h-4 w-4" />
            <span>Ver Templates</span>
          </CommandItem>
           <CommandItem onSelect={() => runCommand(() => router.push('/brands'))}>
            <Palette className="mr-2 h-4 w-4" />
            <span>Ver Kits de Marca</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/media'))}>
            <ImageIcon className="mr-2 h-4 w-4" />
            <span>Ver Biblioteca de Mídia</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/account'))}>
            <User className="mr-2 h-4 w-4" />
            <span>Minha Conta</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />
        
        {projects.length > 0 && (
            <CommandGroup heading="Projetos">
            {projects.map((project) => (
                <CommandItem key={project.id} onSelect={() => runCommand(() => router.push(`/project/${project.id}`))}>
                <Folder className="mr-2 h-4 w-4" />
                <span>{project.name}</span>
                </CommandItem>
            ))}
            </CommandGroup>
        )}

        {pages.length > 0 && (
          <CommandGroup heading="Páginas">
            {pages.map((page) => (
              <CommandItem key={page.id} onSelect={() => runCommand(() => router.push(`/editor/${page.id}`))}>
                <FileText className="mr-2 h-4 w-4" />
                <span>{page.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {allTemplates.length > 0 && (
            <CommandGroup heading="Templates">
                {allTemplates.map((template) => (
                <CommandItem key={template.id} onSelect={() => runCommand(() => router.push(`/editor/${template.id}?isTemplate=true`))} disabled={template.isDefault}>
                    <Library className="mr-2 h-4 w-4" />
                    <span>{template.name}</span>
                </CommandItem>
                ))}
            </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
