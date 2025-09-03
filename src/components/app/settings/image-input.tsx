
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { HelpCircle, Library } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MediaLibraryDialog } from "../media-library-dialog";

export function ImageInput({ label, value, onPropChange, propName, tooltipText }: { label: string, value: string, onPropChange: (prop: string, value: any) => void, propName: string, tooltipText: string }) {
    return (
        <div className="space-y-2">
            <div className="flex items-center gap-1.5">
                <Label htmlFor={`image-url-${propName}`}>{label}</Label>
                <Tooltip>
                    <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground"/></TooltipTrigger>
                    <TooltipContent><p>{tooltipText}</p></TooltipContent>
                </Tooltip>
            </div>
            <div className="flex items-center gap-2">
                <Input
                    id={`image-url-${propName}`}
                    value={value || ""}
                    onChange={(e) => onPropChange(propName, e.target.value)}
                    className="flex-grow"
                />
                <MediaLibraryDialog onSelectImage={(url) => onPropChange(propName, url)}>
                    <Button variant="outline" size="icon">
                        <Library className="h-4 w-4" />
                    </Button>
                </MediaLibraryDialog>
            </div>
        </div>
    );
}
