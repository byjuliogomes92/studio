
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { generateText } from "@/ai/flows/text-generator";
import { Loader2 } from "lucide-react";

export function AiGenerateTextDialog({
  componentType,
  currentText,
  onTextGenerated,
  trigger
}: {
  componentType: string;
  currentText: string;
  onTextGenerated: (newText: string) => void;
  trigger: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Por favor, insira um comando.' });
      return;
    }
    setIsGenerating(true);
    try {
      const result = await generateText({
        prompt,
        componentType,
        context: currentText
      });
      onTextGenerated(result.suggestion);
      setIsOpen(false);
      setPrompt("");
      toast({ title: 'Texto gerado com sucesso!' });
    } catch (error) {
      console.error("AI text generation failed:", error);
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível gerar o texto." });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gerar Texto com IA</DialogTitle>
          <DialogDescription>
            Descreva o que você quer para o texto do seu componente de {componentType.toLowerCase()}.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-2">
          <Label htmlFor="ai-prompt">Comando</Label>
          <Textarea
            id="ai-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ex: um título chamativo para uma promoção de batom"
            rows={4}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
          <Button onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Gerar Texto"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
