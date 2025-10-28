# Task 05: Block Components - Core

⏱ **Estimated Time:** 6 hours

## Objectives

- Implement core content blocks: Banner, Callout, Text, IconGroup
- Create responsive, mobile-first components
- Add proper TypeScript prop types
- Style with Tailwind CSS
- Test rendering

## Prerequisites

- ✅ Task 01 completed (schemas)
- ✅ Understanding of block prop contracts

## Block Implementations

### 1. Banner Component

Create `components/Blocks/Banner.tsx`:

```typescript
interface BannerProps {
  content: string;
  background: string;
  textColor: string;
  dismissible?: boolean;
}

export function Banner({
  content,
  background,
  textColor,
  dismissible = false,
}: BannerProps) {
  return (
    <div
      className="w-full py-3 px-4 text-center font-medium text-sm relative"
      style={{ backgroundColor: background, color: textColor }}
    >
      {content}
      {dismissible && (
        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100"
          aria-label="Dismiss banner"
        >
          ✕
        </button>
      )}
    </div>
  );
}
```

### 2. Callout Component

Create `components/Blocks/Callout.tsx`:

```typescript
interface CalloutProps {
  title: string;
  subtitle: string;
  icon?: string;
  align?: 'left' | 'center' | 'right';
}

export function Callout({
  title,
  subtitle,
  icon,
  align = 'center',
}: CalloutProps) {
  const alignClass = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end',
  }[align];

  return (
    <div className={`py-12 px-6 flex flex-col ${alignClass}`}>
      {icon && (
        <div className="text-5xl mb-4" role="img" aria-label="Icon">
          {icon}
        </div>
      )}
      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
        {title}
      </h1>
      <p className="text-xl text-gray-600 max-w-2xl">
        {subtitle}
      </p>
    </div>
  );
}
```

### 3. Text Component

Create `components/Blocks/Text.tsx`:

```typescript
interface TextProps {
  content: string;
  align?: 'left' | 'center' | 'right';
  size?: 'sm' | 'base' | 'lg';
}

export function Text({ content, align = 'left', size = 'base' }: TextProps) {
  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[align];

  const sizeClass = {
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
  }[size];

  return (
    <div className={`py-6 px-6 ${alignClass}`}>
      <p className={`${sizeClass} text-gray-700 leading-relaxed max-w-3xl ${align === 'center' ? 'mx-auto' : ''}`}>
        {content}
      </p>
    </div>
  );
}
```

### 4. IconGroup Component

Create `components/Blocks/IconGroup.tsx`:

```typescript
interface Icon {
  label: string;
  src: string;
}

interface IconGroupProps {
  icons: Icon[];
  layout?: 'horizontal' | 'grid';
}

export function IconGroup({ icons, layout = 'horizontal' }: IconGroupProps) {
  const layoutClass =
    layout === 'horizontal'
      ? 'flex flex-wrap justify-center gap-6'
      : 'grid grid-cols-2 md:grid-cols-3 gap-6';

  return (
    <div className="py-8 px-6">
      <div className={`max-w-4xl mx-auto ${layoutClass}`}>
        {icons.map((icon, index) => (
          <div
            key={index}
            className="flex flex-col items-center gap-2 text-center"
          >
            <div className="text-3xl" role="img" aria-label={icon.label}>
              {icon.src}
            </div>
            <span className="text-sm font-medium text-gray-700">
              {icon.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Testing

Create test file `components/Blocks/__tests__/core.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react';
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

  it('renders Callout', () => {
    render(<Callout title="Test Title" subtitle="Test Subtitle" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('renders Text', () => {
    render(<Text content="Test content" />);
    expect(screen.getByText('Test content')).toBeInTheDocument();
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
  });
});
```

---

**Status:** ✅ Complete before Task 06
