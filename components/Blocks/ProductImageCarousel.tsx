'use client';

import { useState } from 'react';

interface ProductImage {
  src: string;
  alt: string;
}

interface ProductImageCarouselProps {
  images: ProductImage[];
  zoomEnabled?: boolean;
}

export function ProductImageCarousel({
  images,
  zoomEnabled = false,
}: ProductImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const currentImage = images[currentIndex];

  return (
    <div className="py-8 px-6 max-w-3xl mx-auto">
      {/* Main image */}
      <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
        <img
          src={currentImage.src}
          alt={currentImage.alt}
          className={`w-full h-full object-cover ${
            zoomEnabled ? 'cursor-zoom-in hover:scale-110 transition-transform duration-500' : ''
          }`}
        />

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg"
              aria-label="Previous image"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg"
              aria-label="Next image"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Thumbnail navigation */}
      {images.length > 1 && (
        <div className="flex gap-2 justify-center overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 ${
                index === currentIndex ? 'border-indigo-600' : 'border-gray-200'
              }`}
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
