import type { Funnel } from '@/lib/schemas/funnel.schema';
import { BlockRegistry } from './BlockRegistry';

interface FunnelRendererProps {
  funnel: Funnel;
}

export function FunnelRenderer({ funnel }: FunnelRendererProps) {
  return (
    <div className="w-full min-h-screen bg-white">
      {funnel.blocks.map((block) => {
        const Component = BlockRegistry[block.type];

        if (!Component) {
          console.warn(`Unknown block type: ${block.type}`);
          return (
            <div
              key={block.id}
              className="p-4 bg-yellow-50 border border-yellow-200 text-yellow-800"
            >
              <p className="font-medium">Unknown block type: {block.type}</p>
              <p className="text-sm mt-1">Block ID: {block.id}</p>
            </div>
          );
        }

        return (
          <div key={block.id} data-block-id={block.id} data-block-type={block.type}>
            <Component {...block.props} />
          </div>
        );
      })}
    </div>
  );
}
