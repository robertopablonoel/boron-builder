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
