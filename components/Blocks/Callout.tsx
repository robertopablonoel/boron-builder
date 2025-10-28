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
