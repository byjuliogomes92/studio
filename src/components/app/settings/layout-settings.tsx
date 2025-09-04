
"use client";

import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

interface LayoutSettingsProps {
    props: any;
    onSubPropChange: (prop: string, subProp: string, value: any) => void;
}

export function LayoutSettings({ props, onSubPropChange }: LayoutSettingsProps) {
    const styles = props.styles || {};

    const handleStyleChange = (prop: string, value: any) => {
        onSubPropChange('styles', prop, value);
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label>Posicionamento</Label>
                <Select value={styles.position || 'static'} onValueChange={(value) => handleStyleChange('position', value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="static">Padrão (Static)</SelectItem>
                        <SelectItem value="relative">Relativo</SelectItem>
                        <SelectItem value="absolute">Absoluto</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            
            {styles.position === 'absolute' && (
                <div className="p-4 border rounded-md space-y-4 bg-muted/40">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="layout-top">Top</Label>
                            <Input id="layout-top" value={styles.top || ''} onChange={e => handleStyleChange('top', e.target.value)} placeholder="Ex: -20px"/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="layout-bottom">Bottom</Label>
                            <Input id="layout-bottom" value={styles.bottom || ''} onChange={e => handleStyleChange('bottom', e.target.value)} placeholder="Ex: 1rem"/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="layout-left">Left</Label>
                            <Input id="layout-left" value={styles.left || ''} onChange={e => handleStyleChange('left', e.target.value)} placeholder="Ex: 50%"/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="layout-right">Right</Label>
                            <Input id="layout-right" value={styles.right || ''} onChange={e => handleStyleChange('right', e.target.value)} placeholder="Ex: 0"/>
                        </div>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                        <Label htmlFor="layout-z-index">Z-Index</Label>
                        <Input id="layout-z-index" type="number" value={styles.zIndex || ''} onChange={e => handleStyleChange('zIndex', e.target.value)} placeholder="Ex: 10"/>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="layout-transform">Transform</Label>
                        <Input id="layout-transform" value={styles.transform || ''} onChange={e => handleStyleChange('transform', e.target.value)} placeholder="Ex: translateX(-50%)"/>
                    </div>
                </div>
            )}
        </div>
    );
}
