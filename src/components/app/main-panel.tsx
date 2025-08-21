"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { accessibilityCheck } from "@/ai/flows/accessibility-checker";
import { Copy, Loader2, Sparkles } from "lucide-react";

interface MainPanelProps {
  htmlCode: string;
}

export function MainPanel({ htmlCode }: MainPanelProps) {
  const { toast } = useToast();
  const [checking, setChecking] = useState(false);
  const [accessibilityIssues, setAccessibilityIssues] = useState<string | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(htmlCode);
    toast({
      title: "Copied to Clipboard",
      description: "The HTML code has been copied.",
    });
  };

  const handleAccessibilityCheck = async () => {
    setChecking(true);
    setAccessibilityIssues(null);
    try {
      const result = await accessibilityCheck({ htmlCode });
      setAccessibilityIssues(result.suggestions);
    } catch (error) {
      console.error("Accessibility check failed:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to run accessibility check.",
      });
    } finally {
      setChecking(false);
    }
  };

  return (
    <Tabs defaultValue="preview" className="w-full h-full flex flex-col">
      <div className="flex-shrink-0 border-b">
        <TabsList className="grid w-full grid-cols-3 bg-transparent p-0">
          <TabsTrigger value="preview" className="rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent">Preview</TabsTrigger>
          <TabsTrigger value="code" className="rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent">Code</TabsTrigger>
          <TabsTrigger value="accessibility" className="rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent">Accessibility</TabsTrigger>
        </TabsList>
      </div>
      <div className="flex-grow overflow-auto">
        <TabsContent value="preview" className="w-full h-full m-0">
          <iframe
            srcDoc={htmlCode}
            title="Cloud Page Preview"
            className="w-full h-full border-0 bg-white"
          />
        </TabsContent>
        <TabsContent value="code" className="w-full h-full m-0 p-4 flex flex-col gap-4">
          <div className="flex-shrink-0">
            <Button onClick={handleCopy} variant="outline">
              <Copy className="mr-2 h-4 w-4" />
              Copy Code
            </Button>
          </div>
          <Textarea
            readOnly
            value={htmlCode}
            className="w-full flex-grow text-xs font-mono bg-muted/50"
            aria-label="Generated HTML Code"
          />
        </TabsContent>
        <TabsContent value="accessibility" className="w-full h-full m-0 p-6">
          <div className="flex flex-col items-start gap-4">
            <Button onClick={handleAccessibilityCheck} disabled={checking}>
              {checking ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Check for Accessibility Issues
            </Button>
            {checking && <p>Analyzing your code...</p>}
            {accessibilityIssues && (
              <div className="prose prose-sm dark:prose-invert mt-4 p-4 border rounded-md bg-muted/50 w-full max-w-none">
                <h3 className="font-semibold">Accessibility Suggestions</h3>
                <pre className="whitespace-pre-wrap font-sans text-sm">{accessibilityIssues}</pre>
              </div>
            )}
          </div>
        </TabsContent>
      </div>
    </Tabs>
  );
}
