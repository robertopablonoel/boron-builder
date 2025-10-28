import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Banner } from '../Banner';
import { Callout } from '../Callout';
import { Text } from '../Text';
import { IconGroup } from '../IconGroup';

describe('Core Blocks', () => {
  it('renders Banner', () => {
    render(
      <Banner
        content="Test Banner"
        background="#FF0000"
        textColor="#FFFFFF"
      />
    );
    expect(screen.getByText('Test Banner')).toBeInTheDocument();
  });

  it('renders Banner with dismiss button', () => {
    render(
      <Banner
        content="Dismissible Banner"
        background="#FF0000"
        textColor="#FFFFFF"
        dismissible={true}
      />
    );
    expect(screen.getByText('Dismissible Banner')).toBeInTheDocument();
    expect(screen.getByLabelText('Dismiss banner')).toBeInTheDocument();
  });

  it('renders Callout', () => {
    render(<Callout title="Test Title" subtitle="Test Subtitle" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
  });

  it('renders Callout with icon', () => {
    render(<Callout title="Test" subtitle="Subtitle" icon="✨" />);
    expect(screen.getByText('✨')).toBeInTheDocument();
  });

  it('renders Text', () => {
    render(<Text content="Test content" />);
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders Text with different sizes', () => {
    const { rerender } = render(<Text content="Small" size="sm" />);
    expect(screen.getByText('Small')).toHaveClass('text-sm');

    rerender(<Text content="Large" size="lg" />);
    expect(screen.getByText('Large')).toHaveClass('text-lg');
  });

  it('renders IconGroup', () => {
    render(
      <IconGroup
        icons={[
          { label: 'Test', src: '✓' },
          { label: 'Test 2', src: '★' },
        ]}
      />
    );
    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.getByText('Test 2')).toBeInTheDocument();
    expect(screen.getByText('✓')).toBeInTheDocument();
    expect(screen.getByText('★')).toBeInTheDocument();
  });

  it('renders IconGroup with grid layout', () => {
    const { container } = render(
      <IconGroup
        icons={[
          { label: 'Icon 1', src: '🌟' },
          { label: 'Icon 2', src: '🚀' },
        ]}
        layout="grid"
      />
    );
    const gridContainer = container.querySelector('.grid');
    expect(gridContainer).toBeInTheDocument();
  });
});
