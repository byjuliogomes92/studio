
import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";

export const DebouncedTextInput = ({ value, onBlur, ...props }: { value: string; onBlur: (value: string) => void;[key: string]: any; }) => {
    const [localValue, setLocalValue] = useState(value);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    return (
        <Textarea
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={() => onBlur(localValue)}
            {...props}
        />
    );
}
