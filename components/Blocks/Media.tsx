interface MediaProps {
  src: string;
  alt?: string;
  caption?: string;
  type: 'image' | 'video';
}

export function Media({ src, alt = '', caption, type }: MediaProps) {
  return (
    <div className="py-8 px-6">
      <div className="max-w-4xl mx-auto">
        {type === 'image' ? (
          <img
            src={src}
            alt={alt}
            className="w-full h-auto rounded-lg shadow-md"
          />
        ) : (
          <video
            src={src}
            controls
            className="w-full h-auto rounded-lg shadow-md"
            aria-label={alt}
          >
            Your browser does not support the video tag.
          </video>
        )}
        {caption && (
          <p className="mt-4 text-center text-sm text-gray-600 italic">
            {caption}
          </p>
        )}
      </div>
    </div>
  );
}
