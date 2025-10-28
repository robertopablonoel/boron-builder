import type { Message } from './chat-store';
import type { Funnel } from '@/lib/schemas/funnel.schema';

/**
 * Format conversation history for API
 */
export function formatConversationHistory(
  messages: Message[]
): Array<{ role: 'user' | 'assistant'; content: string }> {
  return messages
    .filter((msg): msg is Message & { role: 'user' | 'assistant' } =>
      msg.role !== 'system'
    )
    .map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));
}

/**
 * Get last N messages
 */
export function getLastMessages(messages: Message[], count: number): Message[] {
  return messages.slice(-count);
}

/**
 * Export funnel as JSON file
 */
export function exportFunnelJSON(funnel: Funnel): void {
  const dataStr = JSON.stringify(funnel, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${funnel.name.toLowerCase().replace(/\s+/g, '-')}-funnel.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Import funnel from JSON
 */
export function importFunnelJSON(file: File): Promise<Funnel> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        resolve(json as Funnel);
      } catch (error) {
        reject(new Error('Invalid JSON file'));
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

/**
 * Clear all persisted storage
 */
export function clearAllStorage(): void {
  localStorage.removeItem('boron-chat-storage');
  localStorage.removeItem('boron-funnel-storage');
}
