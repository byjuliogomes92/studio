
"use client";

import { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AnimationType, LoopAnimationType } from "@/lib/types";
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Film } from 'lucide-react';

const loopAnimations: { value: LoopAnimationType, label: string }[] = [
    { value: 'none', label: 'Nenhuma' },
    { value: 'pulse', label: 'Pulsar' },
    { value: 'bounce', label: 'Pular (Bounce)' },
    { value: 'rotate', label: 'Girar' },
    { value: 'floating', label: 'Flutuar' },
    { value: 'shake', label: 'Tremer' },
    { value: 'wave', label: 'Onda' },
    { value: 'swing', label: 'Balançar' },
];

export function AnimationSettings({ props, onPropChange }: { props: any, onPropChange: (prop: string, value: any) => void }) {
    const styles = props.styles || {};
    const [hoverAnimation, setHoverAnimation] = useState<LoopAnimationType | null>(null);

    const handleStyleChange = (prop: string, value: any) => {
        onPropChange('styles', { ...styles, [prop]: value });
    };

    return (
        <div className="space-y-4">
            <div>
                <Label className="text-xs font-semibold text-muted-foreground">Animação de Entrada</Label>
                <div className="space-y-2 mt-1">
                    <Select value={styles.animationType || 'none'} onValueChange={(value: AnimationType) => handleStyleChange('animationType', value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Sem animação" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">Nenhuma</SelectItem>
                            <SelectItem value="fadeIn">Surgir (Fade In)</SelectItem>
                            <SelectItem value="fadeInUp">Surgir de Baixo</SelectItem>
                            <SelectItem value="fadeInLeft">Surgir da Esquerda</SelectItem>
                            <SelectItem value="fadeInRight">Surgir da Direita</SelectItem>
                        </SelectContent>
                    </Select>
                    {(styles.animationType && styles.animationType !== 'none') && (
                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <div className="space-y-2">
                                <Label htmlFor="animation-duration" className="text-xs">Duração (s)</Label>
                                <Input id="animation-duration" type="number" step="0.1" value={styles.animationDuration || 1} onChange={e => handleStyleChange('animationDuration', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="animation-delay" className="text-xs">Atraso (s)</Label>
                                <Input id="animation-delay" type="number" step="0.1" value={styles.animationDelay || 0} onChange={e => handleStyleChange('animationDelay', e.target.value)} />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Separator />

            <div>
                <Label className="text-xs font-semibold text-muted-foreground">Animação em Loop</Label>
                 <div className="space-y-2 mt-1">
                    <Select value={styles.loopAnimation || 'none'} onValueChange={(value: LoopAnimationType) => handleStyleChange('loopAnimation', value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Sem animação" />
                        </SelectTrigger>
                        <SelectContent>
                            {loopAnimations.map(anim => (
                                <SelectItem 
                                    key={anim.value} 
                                    value={anim.value}
                                    onPointerEnter={() => setHoverAnimation(anim.value)}
                                    onPointerLeave={() => setHoverAnimation(null)}
                                >
                                    <div className="flex justify-between items-center w-full">
                                        <span>{anim.label}</span>
                                        <Film className={cn(
                                            "h-5 w-5 ml-4 transition-all",
                                            hoverAnimation === anim.value && `animation-loop--${anim.value}`
                                        )} />
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                 </div>
            </div>
        </div>
    );
}
