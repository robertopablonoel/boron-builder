interface ProductItem {
  title: string;
  image: string;
  price: number;
  url: string;
  badge?: string;
}

interface ProductGridProps {
  products: ProductItem[];
  columns?: 2 | 3 | 4;
}

export function ProductGrid({ products, columns = 2 }: ProductGridProps) {
  const gridClass = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 lg:grid-cols-4',
  }[columns];

  return (
    <div className="py-8 px-6">
      <div className={`grid ${gridClass} gap-6 max-w-6xl mx-auto`}>
        {products.map((product, index) => (
          <a
            key={index}
            href={product.url}
            className="group block bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow"
          >
            <div className="relative aspect-square overflow-hidden bg-gray-100">
              <img
                src={product.image}
                alt={product.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {product.badge && (
                <span className="absolute top-2 right-2 px-3 py-1 text-xs font-bold bg-red-500 text-white rounded-full">
                  {product.badge}
                </span>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                {product.title}
              </h3>
              <p className="text-lg font-bold text-indigo-600">
                ${product.price.toFixed(2)}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
