
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CloudPage, PageComponent } from "@/lib/types";
import { Copy, Download } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface HowToUseDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  pageState: CloudPage;
  onCopy: () => void;
  onDownload: () => void;
}

type DeField = {
  name: string;
  type: 'Text' | 'Number' | 'Date' | 'Boolean' | 'EmailAddress' | 'Phone';
  maxLength?: number;
  required: boolean;
};

const getRequiredFields = (pageState: CloudPage): DeField[] => {
  const fields: DeField[] = [];
  
  const formComponent = pageState.components.find(c => c.type === 'Form');
  if (formComponent) {
    const formProps = formComponent.props;
    if (formProps.fields?.name) fields.push({ name: 'NOME', type: 'Text', maxLength: 100, required: true });
    if (formProps.fields?.email) fields.push({ name: 'EMAIL', type: 'EmailAddress', required: true });
    if (formProps.fields?.phone) fields.push({ name: 'TELEFONE', type: 'Phone', required: true });
    if (formProps.fields?.cpf) fields.push({ name: 'CPF', type: 'Text', maxLength: 14, required: true });
    if (formProps.fields?.birthdate) fields.push({ name: 'DATANASCIMENTO', type: 'Date', required: false });
    if (formProps.fields?.city) fields.push({ name: 'CIDADE', type: 'Text', maxLength: 100, required: false });
    if (formProps.fields?.optin) fields.push({ name: 'OPTIN', type: 'Boolean', required: true });
  }

  const npsComponent = pageState.components.find(c => c.type === 'NPS');
  if (npsComponent) {
    fields.push({ name: 'NPS_SCORE', type: 'Number', required: true });
    fields.push({ name: 'NPS_DATE', type: 'Date', required: true });
  }
  
  // You can add more logic for other components like 'Voting' here

  return fields;
};

export function HowToUseDialog({ isOpen, onOpenChange, pageState, onCopy, onDownload }: HowToUseDialogProps) {

  const requiredFields = getRequiredFields(pageState);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Como Usar sua CloudPage no Marketing Cloud</DialogTitle>
          <DialogDescription>
            Siga estes passos para configurar e publicar sua página corretamente.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-6">
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">1. Configurando a Data Extension</h3>
              <p className="text-sm text-muted-foreground">
                Crie uma nova Data Extension no Marketing Cloud com a chave externa (External Key) que você definiu nas configurações da página: <Badge variant="outline">{pageState.meta.dataExtensionKey || 'SUA_CHAVE_AQUI'}</Badge>.
                Ela deve ser "Sendable" e "Testable", e o campo de envio deve ser o que corresponde ao `EMAIL`.
              </p>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome do Campo</TableHead>
                      <TableHead>Tipo de Dado</TableHead>
                      <TableHead>Tamanho Máx.</TableHead>
                      <TableHead>Anulável</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requiredFields.map(field => (
                      <TableRow key={field.name}>
                        <TableCell className="font-medium">{field.name}</TableCell>
                        <TableCell>{field.type}</TableCell>
                        <TableCell>{field.maxLength || 'N/A'}</TableCell>
                        <TableCell>{field.required ? 'Não' : 'Sim'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="space-y-4">
                <h3 className="font-semibold text-lg">2. Cole o Código no Content Builder</h3>
                <p className="text-sm text-muted-foreground">
                    No Content Builder, crie um novo "Bloco de Conteúdo" do tipo "HTML". Cole o código que você copiou desta ferramenta no editor de HTML do Marketing Cloud.
                </p>
                <img src="https://i.postimg.cc/J0bW8Gz2/step2.png" alt="Cole o código no Content Builder" className="rounded-md border" />
            </div>

             <div className="space-y-4">
                <h3 className="font-semibold text-lg">3. Crie e Publique a CloudPage</h3>
                <p className="text-sm text-muted-foreground">
                    Crie uma nova CloudPage, selecione o layout em branco e arraste seu bloco de conteúdo HTML para a página. Salve e publique. Sua página está pronta!
                </p>
                 <img src="https://i.postimg.cc/q7yZ26Y1/step3.png" alt="Crie e publique a CloudPage" className="rounded-md border" />
            </div>

          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
          <Button onClick={onDownload}>
            <Download className="mr-2 h-4 w-4" />
            Baixar Arquivo HTML
          </Button>
          <Button onClick={onCopy}>
            <Copy className="mr-2 h-4 w-4" />
            Copiar Código
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
