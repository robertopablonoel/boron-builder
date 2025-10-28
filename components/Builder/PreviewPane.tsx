'use client';

import { useState } from 'react';
import { useFunnelStore } from '@/lib/store/funnel-store';
import { FunnelRenderer } from '../Renderer/FunnelRenderer';
import { DeviceFrame } from './DeviceFrame';

type DeviceMode = 'mobile' | 'desktop';

export function PreviewPane() {
  const { funnel } = useFunnelStore();
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('mobile');

  return (
    <div className="flex flex-col h-full bg-gray-100">
      {/* Toolbar */}
      <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between flex-shrink-0">
        <h2 className="text-lg font-semibold text-gray-900">Live Preview</h2>

        {/* Device Toggle */}
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setDeviceMode('mobile')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              deviceMode === 'mobile'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📱 Mobile
          </button>
          <button
            onClick={() => setDeviceMode('desktop')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              deviceMode === 'desktop'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            💻 Desktop
          </button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 overflow-auto p-8 flex items-start justify-center">
        {funnel ? (
          <DeviceFrame mode={deviceMode}>
            <FunnelRenderer funnel={funnel} />
          </DeviceFrame>
        ) : (
          <div className="text-center text-gray-500 mt-20 max-w-md">
            <svg
              className="w-20 h-20 mx-auto mb-4 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-lg font-medium text-gray-700 mb-2">No funnel yet</p>
            <p className="text-sm text-gray-600">
              Start by describing your product in the chat to generate your first funnel
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
