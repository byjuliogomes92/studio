
"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { HelpCircle, Trash2 } from "lucide-react";
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "../ui/button";

interface ChartSettingsProps {
  props: any;
  onPropChange: (prop: string, value: any) => void;
}

export function ChartSettings({ props, onPropChange }: ChartSettingsProps) {

  const handleDataKeyChange = (index: number, value: string) => {
    const newDataKeys = [...(props.dataKeys || [])];
    newDataKeys[index] = value;
    onPropChange('dataKeys', newDataKeys);
  };

  const addDataKey = () => {
    const newDataKeys = [...(props.dataKeys || []), ''];
    onPropChange('dataKeys', newDataKeys);
  };

  const removeDataKey = (index: number) => {
    const newDataKeys = [...(props.dataKeys || [])];
    newDataKeys.splice(index, 1);
    onPropChange('dataKeys', newDataKeys);
  };

  const handleColorChange = (index: number, value: string) => {
    const newColors = [...(props.colors || [])];
    newColors[index] = value;
    onPropChange('colors', newColors);
  };

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="chart-type">Tipo de Gráfico</Label>
          <Select value={props.type || 'bar'} onValueChange={(value) => onPropChange('type', value)}>
            <SelectTrigger id="chart-type">
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bar">Barras</SelectItem>
              <SelectItem value="line">Linhas</SelectItem>
              <SelectItem value="pie">Pizza</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <Label htmlFor="chart-data">Dados (JSON)</Label>
            <Tooltip>
              <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
              <TooltipContent>
                <div className="max-w-xs">
                    <p>Cole um array de objetos JSON. Você pode usar AMPScript para gerar este JSON dinamicamente.</p>
                    <p className="mt-2"><b>Exemplo:</b></p>
                    <pre className="text-xs bg-muted p-2 rounded-md mt-1 whitespace-pre-wrap">
{`[
  {"name": "Jan", "value": 400},
  {"name": "Fev", "value": 300}
]`}
                    </pre>
                     <p className="mt-2"><b>Exemplo com AMPScript:</b></p>
                     <p>Coloque `%%=v(@jsonData)=%%` aqui e defina a variável `@jsonData` em seu bloco AMPScript personalizado.</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
          <Textarea
            id="chart-data"
            value={props.data || ''}
            onChange={(e) => onPropChange('data', e.target.value)}
            rows={8}
            placeholder='[{"name": "Página A", "uv": 4000, "pv": 2400}]'
            className="font-mono text-xs"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="chart-nameKey">Chave para Rótulos (Eixo X)</Label>
          <Input
            id="chart-nameKey"
            value={props.nameKey || ''}
            onChange={(e) => onPropChange('nameKey', e.target.value)}
            placeholder="Ex: name"
          />
        </div>

        <div className="space-y-2">
          <Label>Chaves de Dados e Cores</Label>
          {(props.dataKeys || []).map((key: string, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={key}
                onChange={(e) => handleDataKeyChange(index, e.target.value)}
                placeholder="Ex: value"
                className="flex-grow"
              />
              <Input
                type="color"
                value={(props.colors || [])[index] || '#000000'}
                onChange={(e) => handleColorChange(index, e.target.value)}
                className="p-1 h-10 w-16"
              />
              <Button variant="ghost" size="icon" onClick={() => removeDataKey(index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {props.type !== 'pie' && (
            <Button variant="outline" size="sm" onClick={addDataKey}>Adicionar Série de Dados</Button>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
