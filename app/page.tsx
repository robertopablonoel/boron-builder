'use client';

import { ChatPane } from '@/components/Builder/ChatPane';
import { PreviewPane } from '@/components/Builder/PreviewPane';

export default function Home() {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Chat Pane - Left */}
      <div className="w-1/2 border-r border-gray-200 flex flex-col">
        <ChatPane />
      </div>

      {/* Preview Pane - Right */}
      <div className="w-1/2 flex flex-col">
        <PreviewPane />
      </div>
    </div>
  );
}
