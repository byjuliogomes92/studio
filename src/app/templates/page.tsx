
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { Template } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Library, Plus, Trash2, Home, MoreVertical, Server, ArrowUpDown, Loader2, Bell, Search, X, List, LayoutGrid } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "@/components/icons";
import { useAuth } from "@/hooks/use-auth";
import { getTemplates, deleteTemplate } from "@/lib/firestore";
import { defaultTemplates } from "@/lib/default-templates";
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

type SortOption = "createdAt-desc" | "createdAt-asc" | "name-asc" | "name-desc" | "updatedAt-desc" | "updatedAt-asc";
type ViewMode = "grid" | "list";

export default function TemplatesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [userTemplates, setUserTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State for modals and actions
  const [templateToDelete, setTemplateToDelete] = useState<Template | null>(null);

  // State for search, sort, and view
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("updatedAt-desc");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  useEffect(() => {
    const fetchTemplates = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const fetchedTemplates = await getTemplates(user.uid);
        setUserTemplates(fetchedTemplates);
      } catch (err) {
        console.error(err);
        toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar os templates.' });
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      if (user) {
        fetchTemplates();
      } else {
        router.push('/login');
      }
    }
  }, [user, authLoading, toast, router]);

  const handleDeleteTemplate = async () => {
    if (!templateToDelete || templateToDelete.isDefault) return;
    try {
      await deleteTemplate(templateToDelete.id);
      setUserTemplates(prev => prev.filter(t => t.id !== templateToDelete.id));
      toast({ title: "Template excluído!" });
    } catch (error) {
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível excluir o template." });
    } finally {
      setTemplateToDelete(null);
    }
  };

  const openDeleteModal = (template: Template) => {
    setTemplateToDelete(template);
  };
  
  const handleEditTemplate = (template: Template) => {
    if (template.isDefault) {
        toast({variant: "default", title: "Ação não permitida", description: "Templates padrão não podem ser editados."});
        return;
    }
    // A template is edited using the same editor as a page.
    // We can pass a query param to indicate that we are editing a template.
    router.push(`/editor/${template.id}?isTemplate=true`);
  };

  const filteredAndSortedTemplates = useMemo(() => {
    const combined = [
        ...defaultTemplates.map(t => ({ ...t, id: t.name, isDefault: true, createdAt: new Date(), updatedAt: new Date() })),
        ...userTemplates
    ];
    
    return combined
      .filter(template => template.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => {
        switch (sortOption) {
          case 'name-asc':
            return a.name.localeCompare(b.name);
          case 'name-desc':
            return b.name.localeCompare(a.name);
          case 'createdAt-asc':
            return (a.createdAt?.toDate ? a.createdAt.toDate() : a.createdAt) > (b.createdAt?.toDate ? b.createdAt.toDate() : b.createdAt) ? 1 : -1;
          case 'createdAt-desc':
            return (a.createdAt?.toDate ? a.createdAt.toDate() : a.createdAt) < (b.createdAt?.toDate ? b.createdAt.toDate() : b.createdAt) ? 1 : -1;
          case 'updatedAt-asc':
            return (a.updatedAt?.toDate ? a.updatedAt.toDate() : a.updatedAt) > (b.updatedAt?.toDate ? b.updatedAt.toDate() : b.updatedAt) ? 1 : -1;
          case 'updatedAt-desc':
          default:
            return (a.updatedAt?.toDate ? a.updatedAt.toDate() : a.updatedAt) < (b.updatedAt?.toDate ? b.updatedAt.toDate() : b.updatedAt) ? 1 : -1;
        }
      });
  }, [userTemplates, searchTerm, sortOption]);

  if (isLoading || authLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Logo className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const getSortDirection = (column: 'name' | 'createdAt' | 'updatedAt') => {
    if (sortOption.startsWith(column)) {
      return sortOption.endsWith('-desc') ? 'desc' : 'asc';
    }
    return 'none';
  };

  const handleSort = (column: 'name' | 'createdAt' | 'updatedAt') => {
    const currentDirection = getSortDirection(column);
    if (currentDirection === 'desc') {
      setSortOption(`${column}-asc`);
    } else {
      setSortOption(`${column}-desc`);
    }
  };

  const templateActions = (template: Template) => (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 data-[state=open]:bg-muted"
                onClick={(e) => e.stopPropagation()}
            >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Abrir menu</span>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent onClick={(e) => e.stopPropagation()} align="end">
            <DropdownMenuItem onClick={() => handleEditTemplate(template)} disabled={template.isDefault}>
                Editar
            </DropdownMenuItem>
            {!template.isDefault && (
                <>
                    <DropdownMenuSeparator />
                    <AlertDialog onOpenChange={(open) => !open && setTemplateToDelete(null)}>
                    <AlertDialogTrigger asChild>
                        <DropdownMenuItem 
                        className="text-destructive" 
                        onSelect={(e) => { e.preventDefault(); openDeleteModal(template); }}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                        </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Isso excluirá permanentemente o template "{template.name}".
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={(e) => { e.stopPropagation(); handleDeleteTemplate() }}>Excluir</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                    </AlertDialog>
                </>
            )}
        </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between h-16 px-6 border-b bg-card">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 font-semibold text-lg">
            <Logo className="h-6 w-6 text-primary" />
            <h1>Templates</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => router.push('/')}>
                <Home className="mr-2 h-4 w-4" />
                Voltar aos Projetos
            </Button>
        </div>
      </header>

      <main className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Buscar templates..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                        onClick={() => setSearchTerm("")}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 rounded-md border bg-background p-1">
                <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('grid')} className="h-8 w-8">
                  <LayoutGrid className="h-4 w-4"/>
                </Button>
                <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('list')} className="h-8 w-8">
                  <List className="h-4 w-4"/>
                </Button>
              </div>
              <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                      <Button variant="outline">
                          <ArrowUpDown className="mr-2 h-4 w-4"/>
                          Ordenar por
                      </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setSortOption('updatedAt-desc')}>Última Modificação</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortOption('name-asc')}>Nome (A-Z)</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortOption('name-desc')}>Nome (Z-A)</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortOption('createdAt-desc')}>Mais Recentes</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortOption('createdAt-asc')}>Mais Antigos</DropdownMenuItem>
                  </DropdownMenuContent>
              </DropdownMenu>
            </div>
        </div>

        {filteredAndSortedTemplates.length === 0 ? (
          <div className="text-center py-16">
            <Library size={48} className="mx-auto text-muted-foreground" />
            <h2 className="mt-4 text-xl font-semibold">Nenhum template encontrado</h2>
            <p className="mt-2 text-muted-foreground">Crie templates a partir de suas páginas para reutilizá-los.</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredAndSortedTemplates.map((template) => (
              <div
                key={template.id}
                className="group relative flex flex-col justify-between bg-card p-4 rounded-lg border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleEditTemplate(template)}
              >
                <div>
                    <div className="w-full aspect-video bg-muted rounded-md mb-2 flex items-center justify-center">
                        <Server className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-lg">{template.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{template.description || 'Sem descrição'}</p>
                </div>
                <div className="flex justify-between items-end mt-4 pt-4 border-t">
                    <div>
                         {template.isDefault ? (
                            <Badge variant="secondary">Padrão</Badge>
                         ) : (
                            <Badge variant={template.brand === 'Natura' ? 'default' : 'destructive'} className="shrink-0 capitalize">
                                {template.brand}
                            </Badge>
                         )}
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        {templateActions(template)}
                    </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]" onClick={() => handleSort('name')}>Nome do Template</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead onClick={() => handleSort('updatedAt')}>Última Modificação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedTemplates.map((template) => (
                  <TableRow key={template.id} className="cursor-pointer" onClick={() => handleEditTemplate(template)}>
                    <TableCell className="font-medium">{template.name}</TableCell>
                    <TableCell>
                        {template.isDefault ? (
                            <Badge variant="secondary">Padrão</Badge>
                         ) : (
                            <Badge variant={template.brand === 'Natura' ? 'default' : 'destructive'} className="capitalize">{template.brand}</Badge>
                         )}
                    </TableCell>
                    <TableCell>{template.updatedAt?.toDate ? format(template.updatedAt.toDate(), 'dd/MM/yyyy, HH:mm') : '-'}</TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                       {templateActions(template)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
    </div>
  );
}
