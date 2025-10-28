'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChatPane } from '@/components/Builder/ChatPane';
import { PreviewPane } from '@/components/Builder/PreviewPane';
import { BuilderHeader } from '@/components/builder/builder-header';

export default function BuilderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const funnelId = searchParams.get('funnelId');
  const storeId = searchParams.get('storeId');

  const [funnel, setFunnel] = useState<any>(null);
  const [loading, setLoading] = useState(!!funnelId);
  const [isSaving, setIsSaving] = useState(false);

  // Load existing funnel if funnelId is provided
  useEffect(() => {
    if (funnelId) {
      const loadFunnel = async () => {
        try {
          const response = await fetch(`/api/funnels/${funnelId}`);
          if (response.ok) {
            const data = await response.json();
            setFunnel(data.funnel);
          } else {
            console.error('Failed to load funnel');
            router.push('/stores');
          }
        } catch (error) {
          console.error('Error loading funnel:', error);
          router.push('/stores');
        } finally {
          setLoading(false);
        }
      };
      loadFunnel();
    }
  }, [funnelId, router]);

  const handleSaveFunnel = async (name: string, selectedStoreId: string) => {
    setIsSaving(true);
    try {
      // TODO: Get actual funnel data from ChatPane/PreviewPane context
      // For now, use placeholder data
      const funnelData = {
        pages: [],
        chatHistory: [],
        theme: {},
        metadata: {},
      };

      if (funnelId) {
        // Update existing funnel
        const response = await fetch(`/api/funnels/${funnelId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            funnel_data: funnelData,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to save funnel');
        }

        const data = await response.json();
        setFunnel(data.funnel);
      } else {
        // Create new funnel
        const response = await fetch(`/api/stores/${selectedStoreId}/funnels`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            funnel_data: funnelData,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create funnel');
        }

        const data = await response.json();
        setFunnel(data.funnel);

        // Update URL with new funnel ID
        router.push(`/builder?funnelId=${data.funnel.id}`);
      }
    } catch (error) {
      console.error('Error saving funnel:', error);
      alert('Failed to save funnel. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
      <BuilderHeader
        funnelId={funnel?.id}
        funnelName={funnel?.name}
        storeId={funnel?.store_id || storeId || undefined}
        onSave={handleSaveFunnel}
        isSaving={isSaving}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Chat Pane - Left */}
        <div className="w-1/2 border-r border-gray-200 flex flex-col">
          <ChatPane />
        </div>

        {/* Preview Pane - Right */}
        <div className="w-1/2 flex flex-col">
          <PreviewPane />
        </div>
      </div>
    </div>
  );
}
