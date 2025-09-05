
"use client";

import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { generateHtml } from '@/lib/html-generator';
import type { PageComponent, CloudPage } from '@/lib/types';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface EditCodeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  component: PageComponent;
  allComponents: PageComponent[];
  onSave: (componentId: string, newHtml: string) => void;
  pageState: CloudPage;
}

export function EditCodeDialog({
  isOpen,
  onOpenChange,
  component,
  allComponents,
  onSave,
  pageState,
}: EditCodeDialogProps) {
  const [code, setCode] = useState('');
  const [previewHtml, setPreviewHtml] = useState('');

  // Generate HTML for the component and its children
  const initialHtml = useMemo(() => {
    if (!component) return '';

    const getChildrenRecursive = (parentId: string): PageComponent[] => {
      const children = allComponents.filter(c => c.parentId === parentId);
      return children.concat(...children.flatMap(c => getChildrenRecursive(c.id)));
    };

    const componentAndChildren = [component, ...getChildrenRecursive(component.id)];
    
    // Create a temporary page state with only the relevant components to render
    const tempPageState = {
        ...pageState,
        components: componentAndChildren,
    };

    return generateHtml(tempPageState, true, '', true);
  }, [component, allComponents, pageState]);

  useEffect(() => {
    if (isOpen && initialHtml) {
      setCode(initialHtml);
      setPreviewHtml(initialHtml);
    }
  }, [isOpen, initialHtml]);

  const handleUpdatePreview = () => {
    setPreviewHtml(code);
  };

  const handleSave = () => {
    onSave(component.id, code);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Editar Código do Componente: {component?.layerName || component?.type}</DialogTitle>
          <DialogDescription>
            Edite o código HTML diretamente. As alterações salvas irão substituir o componente visual por um bloco de HTML customizado.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow min-h-0">
          {/* Editor Column */}
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold">Código HTML</h3>
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="font-mono text-xs flex-grow resize-none h-full"
              placeholder="Digite seu HTML aqui..."
            />
          </div>

          {/* Preview Column */}
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold">Preview</h3>
            <div className="flex-grow border rounded-md bg-muted/40 overflow-hidden">
              <iframe
                srcDoc={previewHtml}
                title="Preview do Código"
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          </div>
        </div>

        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Atenção</AlertTitle>
            <AlertDescription>
                Salvar as alterações irá converter este componente em um bloco de HTML customizado, e você perderá a capacidade de editá-lo com os controles visuais. Esta ação não pode ser desfeita.
            </AlertDescription>
        </Alert>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button variant="secondary" onClick={handleUpdatePreview}>Atualizar Preview</Button>
          <Button onClick={handleSave}>Salvar Código</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
