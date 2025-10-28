interface Review {
  name: string;
  quote: string;
  stars: number;
  verified?: boolean;
}

interface ReviewsProps {
  items: Review[];
  layout?: 'stacked' | 'carousel';
}

export function Reviews({ items, layout = 'stacked' }: ReviewsProps) {
  if (layout === 'carousel') {
    return (
      <div className="py-12 px-6 bg-gray-50">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
          What Customers Say
        </h2>
        <div className="max-w-4xl mx-auto overflow-x-auto scrollbar-hide">
          <div className="flex gap-4 pb-4">
            {items.map((review, idx) => (
              <div
                key={idx}
                className="flex-shrink-0 w-80 bg-white p-6 rounded-lg shadow-sm"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="text-yellow-400 text-lg">
                    {'★'.repeat(review.stars)}
                    {'☆'.repeat(5 - review.stars)}
                  </div>
                  {review.verified && (
                    <span className="text-xs text-green-600 font-medium">
                      ✓ Verified
                    </span>
                  )}
                </div>
                <p className="text-gray-700 italic mb-3">&ldquo;{review.quote}&rdquo;</p>
                <p className="text-sm font-medium text-gray-900">
                  — {review.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 px-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
        What Customers Say
      </h2>
      <div className="max-w-4xl mx-auto space-y-6">
        {items.map((review, idx) => (
          <div key={idx} className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="text-yellow-400 text-lg">
                {'★'.repeat(review.stars)}
                {'☆'.repeat(5 - review.stars)}
              </div>
              {review.verified && (
                <span className="text-xs text-green-600 font-medium">
                  ✓ Verified
                </span>
              )}
            </div>
            <p className="text-gray-700 italic mb-3 leading-relaxed">
              &ldquo;{review.quote}&rdquo;
            </p>
            <p className="text-sm font-medium text-gray-900">— {review.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
