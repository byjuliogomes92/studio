"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
  CommandSeparator,
  CommandItem,
} from "@/components/ui/command";
import { useAuth } from '@/hooks/use-auth';
import { Folder, FileText, Library, User, Palette, Image as ImageIcon, Plus } from 'lucide-react';
import { defaultTemplates } from '@/lib/default-templates';
import { DialogTitle, DialogDescription } from '../ui/dialog';

// Componente customizado com filtro manual
const ClickableItem = ({ children, onItemClick, searchTerm, searchableText, className = "" }: any) => {
  const matchesSearch = (text: string, search: string) => {
    if (!search) return true;
    return text.toLowerCase().includes(search.toLowerCase());
  };

  if (!matchesSearch(searchableText, searchTerm)) {
    return null;
  }

  return (
    <CommandItem // 👈 embrulha no CommandItem
      onSelect={onItemClick}
      className={`flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm transition-colors ${className}`}
    >
    <div
      className={`flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground transition-colors ${className}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onItemClick();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onItemClick();
        }
      }}
      tabIndex={0}
      role="button"
      style={{
        pointerEvents: 'auto',
        userSelect: 'none'
      }}
    >
      {children}
    </div>
    </CommandItem>
  );
};

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [commandValue, setCommandValue] = useState('');
  const router = useRouter();
  const { projects, pages, templates } = useAuth();

  const allTemplates = React.useMemo(() => {
    const defaults = defaultTemplates.map(t => ({
      ...t,
      id: t.id || t.name,
      isDefault: true
    }));
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

  useEffect(() => {
    if (!open) {
      setSearchTerm('');
      setCommandValue('');
    }
  }, [open]);

  useEffect(() => {
    setSearchTerm(commandValue);
  }, [commandValue]);

  useEffect(() => {
    if (open) {
      console.log('📊 Dados disponíveis:');
      console.log('- Projetos:', projects?.length || 0, projects?.map(p => p.name));
      console.log('- Páginas:', pages?.length || 0, pages?.map(p => p.name));
      console.log('- Templates:', allTemplates?.length || 0, allTemplates?.map(t => t.name));
    }
  }, [open, projects, pages, allTemplates]);

  const handleNavigation = (path: string) => {
    setOpen(false);
    setSearchTerm('');
    setCommandValue('');
    router.push(path);
  };

  const hasVisibleItems = (items: any[], searchTerm: string, textExtractor: (item: any) => string) => {
    if (!searchTerm) return items.length > 0;
    return items.some(item => textExtractor(item).toLowerCase().includes(searchTerm.toLowerCase()));
  };

  const hasAnyResults = () => {
    if (!searchTerm) return true;

    const quickActions = ['Criar Novo Projeto'].some(action =>
      action.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const navigation = ['Ver Projetos', 'Ver Templates', 'Ver Kits de Marca', 'Ver Biblioteca de Mídia', 'Minha Conta'].some(nav =>
      nav.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const hasProjects = hasVisibleItems(projects || [], searchTerm, (p) => p.name);
    const hasPages = hasVisibleItems(pages || [], searchTerm, (p) => p.name);
    const hasTemplates = hasVisibleItems(allTemplates || [], searchTerm, (t) => t.name);

    return quickActions || navigation || hasProjects || hasPages || hasTemplates;
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <DialogTitle className="sr-only">Paleta de Comandos</DialogTitle>
      <DialogDescription className="sr-only">
        Use esta paleta para navegar rapidamente pela plataforma
      </DialogDescription>

      <CommandInput
        placeholder="Digite um comando ou busque..."
        value={commandValue}
        onValueChange={(value) => {
          console.log('🔍 Buscando:', value);
          setCommandValue(value);
        }}
      />

      {/* 👇 Aqui desabilitamos o filtro interno */}
      <CommandList className="!filter-none">
        {!hasAnyResults() ? (
          <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
        ) : (
          <>
            <CommandGroup heading="Ações Rápidas">
              <ClickableItem
                searchTerm={searchTerm}
                searchableText="Criar Novo Projeto"
                onItemClick={() => handleNavigation('/')}
              >
                <Plus className="mr-2 h-4 w-4" />
                <span>Criar Novo Projeto</span>
              </ClickableItem>
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup heading="Navegação">
              <ClickableItem
                searchTerm={searchTerm}
                searchableText="Ver Projetos"
                onItemClick={() => handleNavigation('/')}
              >
                <Folder className="mr-2 h-4 w-4" />
                <span>Ver Projetos</span>
              </ClickableItem>
              <ClickableItem
                searchTerm={searchTerm}
                searchableText="Ver Templates"
                onItemClick={() => handleNavigation('/templates')}
              >
                <Library className="mr-2 h-4 w-4" />
                <span>Ver Templates</span>
              </ClickableItem>
              <ClickableItem
                searchTerm={searchTerm}
                searchableText="Ver Kits de Marca"
                onItemClick={() => handleNavigation('/brands')}
              >
                <Palette className="mr-2 h-4 w-4" />
                <span>Ver Kits de Marca</span>
              </ClickableItem>
              <ClickableItem
                searchTerm={searchTerm}
                searchableText="Ver Biblioteca de Mídia"
                onItemClick={() => handleNavigation('/media')}
              >
                <ImageIcon className="mr-2 h-4 w-4" />
                <span>Ver Biblioteca de Mídia</span>
              </ClickableItem>
              <ClickableItem
                searchTerm={searchTerm}
                searchableText="Minha Conta"
                onItemClick={() => handleNavigation('/account')}
              >
                <User className="mr-2 h-4 w-4" />
                <span>Minha Conta</span>
              </ClickableItem>
            </CommandGroup>

            <CommandSeparator />

            {hasVisibleItems(projects || [], searchTerm, (p) => p.name) && (
              <CommandGroup heading="Projetos">
                {projects?.map((project) => (
                  <ClickableItem
                    key={`project-${project.id}`}
                    searchTerm={searchTerm}
                    searchableText={project.name}
                    onItemClick={() => handleNavigation(`/project/${project.id}`)}
                  >
                    <Folder className="mr-2 h-4 w-4" />
                    <span>{project.name}</span>
                  </ClickableItem>
                ))}
              </CommandGroup>
            )}

            {hasVisibleItems(pages || [], searchTerm, (p) => p.name) && (
              <CommandGroup heading="Páginas">
                {pages?.map((page) => (
                  <ClickableItem
                    key={`page-${page.id}`}
                    searchTerm={searchTerm}
                    searchableText={page.name}
                    onItemClick={() => handleNavigation(`/editor/${page.id}`)}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    <span>{page.name}</span>
                  </ClickableItem>
                ))}
              </CommandGroup>
            )}

            {hasVisibleItems(allTemplates || [], searchTerm, (t) => t.name) && (
              <CommandGroup heading="Templates">
                {allTemplates?.map((template) => {
                  const templatePath = template.isDefault
                    ? `/templates/${template.id}`
                    : `/editor/${template.id}?isTemplate=true`;

                  return (
                    <ClickableItem
                      key={`template-${template.id}`}
                      searchTerm={searchTerm}
                      searchableText={template.name}
                      onItemClick={() => handleNavigation(templatePath)}
                    >
                      <Library className="mr-2 h-4 w-4" />
                      <span>{template.name}</span>
                      {template.isDefault && (
                        <span className="ml-auto text-xs text-muted-foreground">padrão</span>
                      )}
                    </ClickableItem>
                  );
                })}
              </CommandGroup>
            )}
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
