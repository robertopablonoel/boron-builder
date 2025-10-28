import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MessageInput } from '../MessageInput';
import { MessageList } from '../MessageList';
import { DeviceFrame } from '../DeviceFrame';
import type { Message } from '@/lib/store/chat-store';

describe('Builder Components', () => {
  describe('MessageInput', () => {
    it('renders with placeholder', () => {
      const onSend = vi.fn();
      render(<MessageInput onSend={onSend} placeholder="Test placeholder" />);
      expect(screen.getByPlaceholderText('Test placeholder')).toBeInTheDocument();
    });

    it('calls onSend when send button is clicked', () => {
      const onSend = vi.fn();
      render(<MessageInput onSend={onSend} />);

      const textarea = screen.getByRole('textbox');
      const sendButton = screen.getByRole('button', { name: /send/i });

      fireEvent.change(textarea, { target: { value: 'Test message' } });
      fireEvent.click(sendButton);

      expect(onSend).toHaveBeenCalledWith('Test message');
    });

    it('calls onSend when Enter is pressed', () => {
      const onSend = vi.fn();
      render(<MessageInput onSend={onSend} />);

      const textarea = screen.getByRole('textbox');

      fireEvent.change(textarea, { target: { value: 'Test message' } });
      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });

      expect(onSend).toHaveBeenCalledWith('Test message');
    });

    it('does not call onSend when Shift+Enter is pressed', () => {
      const onSend = vi.fn();
      render(<MessageInput onSend={onSend} />);

      const textarea = screen.getByRole('textbox');

      fireEvent.change(textarea, { target: { value: 'Test message' } });
      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true });

      expect(onSend).not.toHaveBeenCalled();
    });

    it('clears input after sending', () => {
      const onSend = vi.fn();
      render(<MessageInput onSend={onSend} />);

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      const sendButton = screen.getByRole('button', { name: /send/i });

      fireEvent.change(textarea, { target: { value: 'Test message' } });
      fireEvent.click(sendButton);

      expect(textarea.value).toBe('');
    });

    it('disables input and button when disabled prop is true', () => {
      const onSend = vi.fn();
      render(<MessageInput onSend={onSend} disabled={true} />);

      const textarea = screen.getByRole('textbox');
      const sendButton = screen.getByRole('button', { name: /send/i });

      expect(textarea).toBeDisabled();
      expect(sendButton).toBeDisabled();
    });

    it('disables send button when input is empty', () => {
      const onSend = vi.fn();
      render(<MessageInput onSend={onSend} />);

      const sendButton = screen.getByRole('button', { name: /send/i });
      expect(sendButton).toBeDisabled();
    });

    it('does not send empty or whitespace-only messages', () => {
      const onSend = vi.fn();
      render(<MessageInput onSend={onSend} />);

      const textarea = screen.getByRole('textbox');
      const sendButton = screen.getByRole('button', { name: /send/i });

      fireEvent.change(textarea, { target: { value: '   ' } });
      fireEvent.click(sendButton);

      expect(onSend).not.toHaveBeenCalled();
    });
  });

  describe('MessageList', () => {
    const mockMessages: Message[] = [
      {
        id: '1',
        role: 'user',
        content: 'Hello',
        timestamp: Date.now(),
      },
      {
        id: '2',
        role: 'assistant',
        content: 'Hi there!',
        timestamp: Date.now(),
      },
      {
        id: '3',
        role: 'system',
        content: 'Error occurred',
        timestamp: Date.now(),
      },
    ];

    it('renders empty state when no messages', () => {
      render(<MessageList messages={[]} />);
      expect(screen.getByText('Start a conversation')).toBeInTheDocument();
    });

    it('displays example prompts in empty state', () => {
      render(<MessageList messages={[]} />);
      expect(screen.getByText(/Organic sleep gummies/i)).toBeInTheDocument();
    });

    it('renders all messages', () => {
      render(<MessageList messages={mockMessages} />);
      expect(screen.getByText('Hello')).toBeInTheDocument();
      expect(screen.getByText('Hi there!')).toBeInTheDocument();
      expect(screen.getByText('Error occurred')).toBeInTheDocument();
    });

    it('applies correct styling to user messages', () => {
      render(<MessageList messages={mockMessages} />);
      const userMessage = screen.getByText('Hello').parentElement;
      expect(userMessage).toHaveClass('bg-indigo-600', 'text-white');
    });

    it('applies correct styling to assistant messages', () => {
      render(<MessageList messages={mockMessages} />);
      const assistantMessage = screen.getByText('Hi there!').parentElement;
      expect(assistantMessage).toHaveClass('bg-gray-100', 'text-gray-900');
    });

    it('applies correct styling to system messages', () => {
      render(<MessageList messages={mockMessages} />);
      const systemMessage = screen.getByText('Error occurred').parentElement;
      expect(systemMessage).toHaveClass('bg-red-50', 'text-red-800');
    });

    it('displays AI Assistant label for assistant messages', () => {
      render(<MessageList messages={mockMessages} />);
      expect(screen.getByText('AI Assistant')).toBeInTheDocument();
    });

    it('shows streaming indicator when isStreaming is true', () => {
      render(<MessageList messages={mockMessages} isStreaming={true} />);
      expect(screen.getByText('Thinking...')).toBeInTheDocument();
    });

    it('does not show streaming indicator when isStreaming is false', () => {
      render(<MessageList messages={mockMessages} isStreaming={false} />);
      expect(screen.queryByText('Thinking...')).not.toBeInTheDocument();
    });

    it('displays timestamps for messages', () => {
      render(<MessageList messages={mockMessages} />);
      const timestamps = screen.getAllByText(/\d{1,2}:\d{2}/);
      expect(timestamps.length).toBeGreaterThan(0);
    });
  });

  describe('DeviceFrame', () => {
    it('renders children', () => {
      render(
        <DeviceFrame mode="mobile">
          <div>Test Content</div>
        </DeviceFrame>
      );
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('applies mobile width for mobile mode', () => {
      const { container } = render(
        <DeviceFrame mode="mobile">
          <div>Content</div>
        </DeviceFrame>
      );
      const frame = container.firstChild;
      expect(frame).toHaveClass('max-w-[375px]');
    });

    it('applies desktop width for desktop mode', () => {
      const { container } = render(
        <DeviceFrame mode="desktop">
          <div>Content</div>
        </DeviceFrame>
      );
      const frame = container.firstChild;
      expect(frame).toHaveClass('max-w-[1200px]');
    });

    it('shows notch for mobile mode', () => {
      const { container } = render(
        <DeviceFrame mode="mobile">
          <div>Content</div>
        </DeviceFrame>
      );
      const notch = container.querySelector('.bg-gray-900');
      expect(notch).toBeInTheDocument();
    });

    it('does not show notch for desktop mode', () => {
      const { container } = render(
        <DeviceFrame mode="desktop">
          <div>Content</div>
        </DeviceFrame>
      );
      const notch = container.querySelector('.bg-gray-900');
      expect(notch).not.toBeInTheDocument();
    });
  });
});
