"use client";

import { useState, useEffect } from "react";
import type { CloudPage } from "@/lib/types";
import { generateHtml } from "@/lib/html-generator";
import { SettingsPanel } from "./settings-panel";
import { MainPanel } from "./main-panel";
import { Logo } from "@/components/icons";
import { Separator } from "@/components/ui/separator";

const initialPage: CloudPage = {
  meta: {
    title: 'My Awesome Cloud Page',
  },
  styles: {
    backgroundColor: '#f8fafc',
    primaryColor: '#34495E',
    accentColor: '#E67E22',
    textColor: '#0f172a',
    fontFamily: 'Inter',
  },
  components: [
    { id: '1', type: 'Header', props: { title: 'Cloud Page Forge' } },
    { id: '2', type: 'TextBlock', props: { text: 'Welcome to your new Cloud Page. Use the panel on the left to customize it.' } },
    { id: '3', type: 'Form', props: { title: 'Subscribe to our Newsletter', buttonText: 'Sign Up' } },
    { id: '4', type: 'Footer', props: { text: `© ${new Date().getFullYear()} Cloud Page Forge. All rights reserved.` } },
  ],
};

export function CloudPageForge() {
  const [isMounted, setIsMounted] = useState(false);
  const [pageState, setPageState] = useState<CloudPage>(initialPage);
  const [htmlCode, setHtmlCode] = useState("");
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  useEffect(() => {
    if(isMounted) {
      setHtmlCode(generateHtml(pageState));
    }
  }, [pageState, isMounted]);

  if (!isMounted) {
    return null; // or a loading spinner
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center h-14 px-4 border-b flex-shrink-0">
        <div className="flex items-center gap-2 font-semibold">
          <Logo className="h-6 w-6 text-primary" />
          <h1>Cloud Page Forge</h1>
        </div>
      </header>
      <div className="flex flex-grow overflow-hidden">
        <aside className="w-[380px] border-r flex-shrink-0 bg-card/20">
          <SettingsPanel
            pageState={pageState}
            setPageState={setPageState}
            selectedComponentId={selectedComponentId}
            setSelectedComponentId={setSelectedComponentId}
          />
        </aside>
        <main className="flex-grow h-full">
          <MainPanel htmlCode={htmlCode} />
        </main>
      </div>
    </div>
  );
}
