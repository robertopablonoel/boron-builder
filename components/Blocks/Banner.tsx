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
