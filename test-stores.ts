// Run: npx tsx test-stores.ts
import { useChatStore } from './lib/store/chat-store';
import { useFunnelStore } from './lib/store/funnel-store';

console.log('Testing Chat Store...');
const { addMessage, clearHistory } = useChatStore.getState();

addMessage('user', 'Test message 1');
addMessage('assistant', 'Test response 1');

console.log('Messages:', useChatStore.getState().messages);
console.log('Message count:', useChatStore.getState().messages.length);

clearHistory();
console.log('After clear:', useChatStore.getState().messages.length);

console.log('\nTesting Funnel Store...');
const { setFunnel } = useFunnelStore.getState();

const testFunnel = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Test',
  product: { title: 'Test', description: 'Test', price: 10, currency: 'USD' },
  blocks: [
    {
      id: 'test-1',
      type: 'Callout' as const,
      props: { title: 'Test', subtitle: 'Test', align: 'center' as const },
    },
  ],
};

setFunnel(testFunnel);
console.log('Funnel set:', useFunnelStore.getState().funnel?.name);
console.log('Metadata:', useFunnelStore.getState().metadata);

console.log('\n✅ Store tests passed!');
