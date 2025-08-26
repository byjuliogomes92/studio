

"use client";

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, AlertTriangle, ExternalLink } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import type { CloudPage } from "@/lib/types";

interface HowToUseDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  pageState: CloudPage;
}

interface DeField {
    name: string;
    type: string;
    length?: number;
    primaryKey: boolean;
    nullable: boolean;
}

// Function to generate the required Data Extension fields based on the page state
const generateDeFields = (page: CloudPage): DeField[] => {
    const fields: DeField[] = [
        { name: 'SubscriberKey', type: 'Text', length: 254, primaryKey: true, nullable: false },
        { name: 'CreatedDate', type: 'Date', primaryKey: false, nullable: true },
    ];
    const fieldNames = new Set(fields.map(f => f.name.toUpperCase()));

    const addField = (name: string, type: string, length?: number, pk: boolean = false, nullable: boolean = true) => {
        if (!fieldNames.has(name.toUpperCase())) {
            fields.push({ name, type, length, primaryKey: pk, nullable });
            fieldNames.add(name.toUpperCase());
        }
    };

    page.components.forEach(component => {
        if (component.type === 'Form' && component.props.fields) {
            if (component.props.fields.name) addField('NOME', 'Text', 100);
            if (component.props.fields.email) {
                // If email is a field, it's often better as the PK than SubscriberKey
                const skIndex = fields.findIndex(f => f.name === 'SubscriberKey');
                if (skIndex > -1) fields[skIndex].primaryKey = false;
                addField('EMAIL', 'EmailAddress', 254, true, false);
            }
            if (component.props.fields.phone) addField('TELEFONE', 'Phone');
            if (component.props.fields.cpf) addField('CPF', 'Text', 11);
            if (component.props.fields.city) addField('CIDADE', 'Text', 100);
            if (component.props.fields.birthdate) addField('DATANASCIMENTO', 'Date');
            if (component.props.fields.optin) addField('OPTIN', 'Boolean');
        }

        if (component.type === 'NPS') {
            addField('NPS_SCORE', 'Number');
            addField('NPS_DATE', 'Date');
        }

        if (component.abTestEnabled) {
            addField(`VARIANTE_${component.id.toUpperCase()}`, 'Text', 1);
        }
    });

    return fields;
};


export function HowToUseDialog({ isOpen, onOpenChange, pageState }: HowToUseDialogProps) {
  const { toast } = useToast();
  const [pageUrl, setPageUrl] = useState('');
  const deFields = generateDeFields(pageState);

  useEffect(() => {
    // This ensures the URL is constructed only on the client-side where `window.location` is available.
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/api/pages/${pageState.id}`;
      setPageUrl(url);
    }
  }, [pageState.id]);

  const proxySnippet = `%%=TreatAsContentArea("CONTENT", HTTPGet("${pageUrl}", false, 0, @status))=%%`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado para a Área de Transferência!",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Como Publicar sua CloudPage (Método Rápido)</DialogTitle>
          <DialogDescription>
            Use este método para publicar suas alterações instantaneamente, sem o cache do Marketing Cloud.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto pr-6 -mr-6">
          <div className="space-y-6 py-4">

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Como Funciona?</AlertTitle>
              <AlertDescription>
                Você colará um pequeno código na sua CloudPage **apenas uma vez**. A partir daí, todas as alterações salvas aqui serão refletidas na sua página publicada instantaneamente, sem precisar editar nada no Marketing Cloud novamente.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Passo 1: Cole este Snippet na sua CloudPage</h3>
              <p className="text-sm text-muted-foreground">
                No Content Builder, crie uma CloudPage, selecione o layout em branco e cole o código AMPScript abaixo em um bloco de conteúdo "HTML". **Faça isso apenas uma vez por página.**
              </p>
              <div className="relative rounded-lg bg-[#1e1e1e]">
                  <SyntaxHighlighter language="ampscript" style={vscDarkPlus} customStyle={{ margin: 0, background: 'transparent', padding: '1rem', overflowX: 'auto' }} wrapLongLines={true}>
                    {proxySnippet}
                  </SyntaxHighlighter>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute top-2 right-2 h-8"
                    onClick={() => handleCopy(proxySnippet)}
                  >
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar
                  </Button>
              </div>
            </div>

            <div className="space-y-4">
                <h3 className="font-semibold text-lg">Passo 2: Configure sua Data Extension</h3>
                <p className="text-sm text-muted-foreground">
                    Crie uma Data Extension no Marketing Cloud com o Identificador (Nome ou Chave Externa) <strong>{pageState.meta.dataExtensionKey || '[NÃO DEFINIDO]'}</strong>. Use os seguintes campos para garantir que todos os dados da sua página sejam salvos corretamente:
                </p>
                 <div className="relative w-full overflow-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome do Campo</TableHead>
                                <TableHead>Tipo de Dados</TableHead>
                                <TableHead>Tamanho</TableHead>
                                <TableHead>Chave Primária</TableHead>
                                <TableHead>Anulável</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {deFields.map(field => (
                                <TableRow key={field.name}>
                                    <TableCell className="font-mono text-xs whitespace-nowrap">{field.name}</TableCell>
                                    <TableCell>{field.type}</TableCell>
                                    <TableCell>{field.length || '-'}</TableCell>
                                    <TableCell>{field.primaryKey ? 'Sim' : 'Não'}</TableCell>
                                    <TableCell>{field.nullable ? 'Sim' : 'Não'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                 </div>
            </div>

             <div className="space-y-4">
                <h3 className="font-semibold text-lg">Passo 3: Salve e Publique</h3>
                <p className="text-sm text-muted-foreground">
                    Salve e publique sua CloudPage no Marketing Cloud. É isso! A partir de agora, qualquer alteração que você salvar aqui na plataforma aparecerá automaticamente na sua página publicada.
                </p>
            </div>

          </div>
        </div>
        <DialogFooter className="flex-shrink-0 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
          <Button onClick={() => window.open(pageUrl, '_blank')}>
            <ExternalLink className="mr-2 h-4 w-4" />
            Testar URL da Página
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

