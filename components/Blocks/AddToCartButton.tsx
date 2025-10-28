interface AddToCartButtonProps {
  text: string;
  link: string;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  subtext?: string;
}

export function AddToCartButton({
  text,
  link,
  variant = 'primary',
  size = 'lg',
  subtext,
}: AddToCartButtonProps) {
  const variantClasses = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900',
  }[variant];

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }[size];

  return (
    <div className="py-8 px-6 flex flex-col items-center">
      <a
        href={link}
        className={`${variantClasses} ${sizeClasses} font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 w-full max-w-md text-center`}
      >
        {text}
      </a>
      {subtext && (
        <p className="mt-3 text-sm text-gray-600 text-center max-w-md">
          {subtext}
        </p>
      )}
    </div>
  );
}
