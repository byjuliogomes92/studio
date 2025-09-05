"use client";

import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

interface LayoutSettingsProps {
    props: any;
    onSubPropChange: (prop: string, subProp: string, value: any) => void;
}

// Este arquivo não é mais usado e seu conteúdo foi movido para component-settings.tsx.
// Ele está sendo esvaziado para evitar confusão futura.
export function LayoutSettings({ props, onSubPropChange }: LayoutSettingsProps) {
    return null;
}
