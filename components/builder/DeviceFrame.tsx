import { ReactNode } from 'react';

interface DeviceFrameProps {
  mode: 'mobile' | 'desktop';
  children: ReactNode;
}

export function DeviceFrame({ mode, children }: DeviceFrameProps) {
  const width = mode === 'mobile' ? 'max-w-[375px]' : 'max-w-[1200px]';
  const height = mode === 'mobile' ? 'h-[667px]' : 'h-auto';

  return (
    <div
      className={`${width} mx-auto bg-white shadow-2xl rounded-lg overflow-hidden border border-gray-200`}
    >
      {mode === 'mobile' && (
        <div className="h-6 bg-gray-900 flex items-center justify-center gap-2">
          <div className="w-16 h-1 bg-gray-700 rounded-full" />
        </div>
      )}
      <div className={`overflow-y-auto ${height}`}>
        {children}
      </div>
    </div>
  );
}
