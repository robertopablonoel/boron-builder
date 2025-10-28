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
