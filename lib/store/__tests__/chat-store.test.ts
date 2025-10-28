import { describe, it, expect, beforeEach } from 'vitest';
import { useChatStore } from '../chat-store';

describe('ChatStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useChatStore.setState({
      messages: [],
      isStreaming: false,
    });
  });

  it('adds messages correctly', () => {
    const { addMessage } = useChatStore.getState();

    addMessage('user', 'Hello');
    addMessage('assistant', 'Hi there!');

    const { messages } = useChatStore.getState();
    expect(messages).toHaveLength(2);
    expect(messages[0].content).toBe('Hello');
    expect(messages[1].role).toBe('assistant');
  });

  it('sets streaming status', () => {
    const { setStreaming } = useChatStore.getState();

    setStreaming(true);
    expect(useChatStore.getState().isStreaming).toBe(true);

    setStreaming(false);
    expect(useChatStore.getState().isStreaming).toBe(false);
  });

  it('clears history', () => {
    const { addMessage, clearHistory } = useChatStore.getState();

    addMessage('user', 'Test');
    expect(useChatStore.getState().messages).toHaveLength(1);

    clearHistory();
    expect(useChatStore.getState().messages).toHaveLength(0);
  });

  it('generates unique IDs for messages', () => {
    const { addMessage } = useChatStore.getState();

    addMessage('user', 'Message 1');
    addMessage('user', 'Message 2');

    const { messages } = useChatStore.getState();
    expect(messages[0].id).not.toBe(messages[1].id);
  });
});
