'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface MediaItem {
  type: 'image' | 'video';
  src: string;
  alt?: string;
}

interface MediaCarouselProps {
  media: MediaItem[];
  autoplay?: boolean;
}

export function MediaCarousel({
  media,
  autoplay = false,
}: MediaCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % media.length);
  }, [media.length]);

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
  };

  const goToIndex = (index: number) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    if (autoplay && media.length > 1) {
      autoplayRef.current = setInterval(() => {
        goToNext();
      }, 5000);

      return () => {
        if (autoplayRef.current) {
          clearInterval(autoplayRef.current);
        }
      };
    }
  }, [autoplay, media.length, currentIndex, goToNext]);

  const currentMedia = media[currentIndex];

  return (
    <div className="py-8 px-6 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        {/* Main Media Display */}
        <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4">
          {currentMedia.type === 'image' ? (
            <img
              src={currentMedia.src}
              alt={currentMedia.alt || `Media ${currentIndex + 1}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <video
              src={currentMedia.src}
              controls
              className="w-full h-full object-cover"
              aria-label={currentMedia.alt || `Video ${currentIndex + 1}`}
            >
              Your browser does not support the video tag.
            </video>
          )}

          {/* Navigation Arrows */}
          {media.length > 1 && (
            <>
              <button
                onClick={goToPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all"
                aria-label="Previous media"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all"
                aria-label="Next media"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </>
          )}

          {/* Media Counter */}
          {media.length > 1 && (
            <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
              {currentIndex + 1} / {media.length}
            </div>
          )}
        </div>

        {/* Thumbnail Navigation */}
        {media.length > 1 && (
          <div className="flex gap-2 justify-center overflow-x-auto pb-2">
            {media.map((item, index) => (
              <button
                key={index}
                onClick={() => goToIndex(index)}
                className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-all ${
                  index === currentIndex
                    ? 'border-indigo-600 ring-2 ring-indigo-200'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {item.type === 'image' ? (
                  <img
                    src={item.src}
                    alt={item.alt || `Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
