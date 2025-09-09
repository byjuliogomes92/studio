
import { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from '@/components/ui/slider';
import { ColorInput } from './color-input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { produce } from 'immer';
import type { Brand } from '@/lib/types';

interface GradientColor {
  color: string;
  position: number;
}

interface GradientValue {
  type: 'linear' | 'radial';
  angle: number;
  colors: GradientColor[];
}

interface GradientEditorProps {
  value?: GradientValue;
  onChange: (newValue: GradientValue) => void;
  brand?: Brand | null;
}

const defaultGradient: GradientValue = {
  type: 'linear',
  angle: 90,
  colors: [
    { color: '#000000', position: 0 },
    { color: '#ffffff', position: 100 },
  ],
};

export function GradientEditor({ value, onChange, brand }: GradientEditorProps) {
  const gradient = value || defaultGradient;

  const handlePropChange = (prop: keyof GradientValue, propValue: any) => {
    onChange({ ...gradient, [prop]: propValue });
  };

  const handleColorChange = (index: number, newColor: string) => {
    const newColors = produce(gradient.colors, (draft) => {
      draft[index].color = newColor;
    });
    handlePropChange('colors', newColors);
  };
  
  const handlePositionChange = (index: number, newPosition: number) => {
    const newColors = produce(gradient.colors, (draft) => {
      draft[index].position = newPosition;
    });
    // Sort colors by position after changing
    newColors.sort((a, b) => a.position - b.position);
    handlePropChange('colors', newColors);
  };
  
  const addColor = () => {
    const newColor: GradientColor = { color: '#cccccc', position: 50 };
    const newColors = [...gradient.colors, newColor].sort((a, b) => a.position - b.position);
    handlePropChange('colors', newColors);
  };
  
  const removeColor = (index: number) => {
    if (gradient.colors.length <= 2) return;
    const newColors = gradient.colors.filter((_, i) => i !== index);
    handlePropChange('colors', newColors);
  };
  
  const gradientPreview = `${gradient.type}-gradient(${
      gradient.type === 'linear' ? `${gradient.angle}deg` : 'circle'
    }, ${gradient.colors.map(c => `${c.color} ${c.position}%`).join(', ')})`;

  return (
    <div className="space-y-4">
      <div className="w-full h-10 rounded-md" style={{ background: gradientPreview }} />
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={gradient.type} onValueChange={(val: 'linear' | 'radial') => handlePropChange('type', val)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="linear">Linear</SelectItem>
                    <SelectItem value="radial">Radial</SelectItem>
                </SelectContent>
            </Select>
        </div>
        {gradient.type === 'linear' && (
             <div className="space-y-2">
                <Label>Ângulo ({gradient.angle}°)</Label>
                <Slider 
                    value={[gradient.angle]}
                    min={0} max={360} step={1}
                    onValueChange={([val]) => handlePropChange('angle', val)}
                />
            </div>
        )}
      </div>

      <div className="space-y-3">
        <Label>Cores</Label>
        {gradient.colors.map((colorStop, index) => (
            <div key={index} className="p-3 border rounded-md space-y-3 bg-muted/20">
                <div className="flex items-start justify-between">
                    <ColorInput 
                        label={`Cor ${index + 1}`}
                        value={colorStop.color}
                        onChange={val => handleColorChange(index, val)}
                        brand={brand}
                    />
                     <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeColor(index)} disabled={gradient.colors.length <= 2}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
                 <div className="space-y-2">
                    <Label className="text-xs">Posição ({colorStop.position}%)</Label>
                    <Slider 
                        value={[colorStop.position]}
                        min={0} max={100} step={1}
                        onValueChange={([val]) => handlePositionChange(index, val)}
                    />
                </div>
            </div>
        ))}
        <Button variant="outline" size="sm" className="w-full" onClick={addColor}>
            <Plus className="h-4 w-4 mr-2" /> Adicionar Cor
        </Button>
      </div>
    </div>
  );
}
