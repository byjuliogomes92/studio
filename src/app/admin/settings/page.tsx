
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { getPlatformSettings, updatePlatformSettings } from '@/lib/firestore';
import type { PlatformSettings } from '@/lib/types';
import { Textarea } from '@/components/ui/textarea';

export default function SettingsAdminPage() {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const fetchedSettings = await getPlatformSettings();
        setSettings(fetchedSettings);
      } catch (error: any) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar as configurações.' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [toast]);

  const handleSaveSettings = async () => {
    if (!settings || !user) return;
    setIsSaving(true);
    try {
      await updatePlatformSettings(settings);
      toast({ title: 'Sucesso!', description: 'As configurações da plataforma foram salvas.' });
    } catch (error: any) {
      console.error("Failed to save settings:", error);
      toast({ variant: 'destructive', title: 'Erro ao salvar', description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => prev ? { ...prev, [name]: value } : null);
  };
  
  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => {
      if (!prev) return null;
      const newBannerSettings = { ...(prev.dashboardBanner || {}), [name]: value };
      return { ...prev, dashboardBanner: newBannerSettings };
    });
  }

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Configurações da Plataforma</h1>
        <p className="text-muted-foreground">Gerencie configurações globais, feature flags e outros aspectos da aplicação.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Banner do Dashboard</CardTitle>
          <CardDescription>
            Personalize o banner de anúncio exibido na página principal dos projetos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="banner-title">Título</Label>
            <Input id="banner-title" name="title" value={settings?.dashboardBanner?.title || ''} onChange={handleBannerChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="banner-description">Descrição</Label>
            <Textarea id="banner-description" name="description" value={settings?.dashboardBanner?.description || ''} onChange={handleBannerChange} />
          </div>
           <div className="space-y-2">
            <Label htmlFor="banner-imageUrl">URL da Imagem de Fundo</Label>
            <Input id="banner-imageUrl" name="imageUrl" value={settings?.dashboardBanner?.imageUrl || ''} onChange={handleBannerChange} />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <Label htmlFor="banner-buttonText">Texto do Botão</Label>
                <Input id="banner-buttonText" name="buttonText" value={settings?.dashboardBanner?.buttonText || ''} onChange={handleBannerChange} />
             </div>
              <div className="space-y-2">
                <Label htmlFor="banner-buttonUrl">URL do Botão</Label>
                <Input id="banner-buttonUrl" name="buttonUrl" value={settings?.dashboardBanner?.buttonUrl || ''} onChange={handleBannerChange} />
             </div>
          </div>
           <div className="flex items-center space-x-2">
                <input type="checkbox" id="banner-enabled" name="enabled" checked={settings?.dashboardBanner?.enabled || false} onChange={(e) => setSettings(prev => prev ? { ...prev, dashboardBanner: {...(prev.dashboardBanner || {}), enabled: e.target.checked } } : null)} />
                <Label htmlFor="banner-enabled">Banner Ativo</Label>
            </div>
        </CardContent>
      </Card>
      
      {/* Futuras seções de configurações aqui (ex: Feature Flags) */}

      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Salvar Todas as Configurações
        </Button>
      </div>
    </div>
  );
}
