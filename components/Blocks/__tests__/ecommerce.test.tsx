import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AddToCartButton } from '../AddToCartButton';
import { VariantSelector } from '../VariantSelector';
import { ProductGrid } from '../ProductGrid';
import { ProductImageCarousel } from '../ProductImageCarousel';
import { UpsellCarousel } from '../UpsellCarousel';

describe('eCommerce Blocks', () => {
  describe('AddToCartButton', () => {
    it('renders button with text and link', () => {
      render(
        <AddToCartButton text="Add to Cart" link="/checkout" />
      );
      const button = screen.getByRole('link', { name: 'Add to Cart' });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('href', '/checkout');
    });

    it('renders with subtext', () => {
      render(
        <AddToCartButton
          text="Buy Now"
          link="/checkout"
          subtext="Free shipping on orders over $50"
        />
      );
      expect(screen.getByText('Buy Now')).toBeInTheDocument();
      expect(screen.getByText('Free shipping on orders over $50')).toBeInTheDocument();
    });

    it('applies variant classes correctly', () => {
      const { rerender } = render(
        <AddToCartButton text="Primary" link="/checkout" variant="primary" />
      );
      expect(screen.getByRole('link')).toHaveClass('bg-indigo-600');

      rerender(
        <AddToCartButton text="Secondary" link="/checkout" variant="secondary" />
      );
      expect(screen.getByRole('link')).toHaveClass('bg-gray-200');
    });

    it('applies size classes correctly', () => {
      const { rerender } = render(
        <AddToCartButton text="Small" link="/checkout" size="sm" />
      );
      expect(screen.getByRole('link')).toHaveClass('px-4', 'py-2', 'text-sm');

      rerender(
        <AddToCartButton text="Large" link="/checkout" size="lg" />
      );
      expect(screen.getByRole('link')).toHaveClass('px-8', 'py-4', 'text-lg');
    });
  });

  describe('VariantSelector', () => {
    const mockOptions = [
      { label: 'Small', value: 'sm' },
      { label: 'Medium', value: 'md' },
      { label: 'Large', value: 'lg', priceDiff: 5 },
    ];

    it('renders label and options', () => {
      render(
        <VariantSelector label="Select Size" options={mockOptions} />
      );
      expect(screen.getByText('Select Size')).toBeInTheDocument();
      expect(screen.getByText('Small')).toBeInTheDocument();
      expect(screen.getByText('Medium')).toBeInTheDocument();
      expect(screen.getByText('Large')).toBeInTheDocument();
    });

    it('displays price differences', () => {
      render(
        <VariantSelector label="Size" options={mockOptions} />
      );
      expect(screen.getByText('+$5.00')).toBeInTheDocument();
    });

    it('handles option selection', () => {
      render(
        <VariantSelector label="Size" options={mockOptions} />
      );
      const mediumButton = screen.getByRole('button', { name: /Medium/i });
      fireEvent.click(mediumButton);
      expect(mediumButton).toHaveClass('border-indigo-600');
    });

    it('displays badges on options', () => {
      const optionsWithBadge = [
        { label: 'Popular', value: 'popular', badge: 'Best Seller' },
      ];
      render(
        <VariantSelector label="Option" options={optionsWithBadge} />
      );
      expect(screen.getByText('Best Seller')).toBeInTheDocument();
    });

    it('uses default value', () => {
      render(
        <VariantSelector
          label="Size"
          options={mockOptions}
          defaultValue="md"
        />
      );
      const mediumButton = screen.getByRole('button', { name: /Medium/i });
      expect(mediumButton).toHaveClass('border-indigo-600');
    });
  });

  describe('ProductGrid', () => {
    const mockProducts = [
      {
        title: 'Product 1',
        image: '/product1.jpg',
        price: 29.99,
        url: '/product1',
      },
      {
        title: 'Product 2',
        image: '/product2.jpg',
        price: 39.99,
        url: '/product2',
        badge: 'Sale',
      },
    ];

    it('renders all products', () => {
      render(<ProductGrid products={mockProducts} />);
      expect(screen.getByText('Product 1')).toBeInTheDocument();
      expect(screen.getByText('Product 2')).toBeInTheDocument();
      expect(screen.getByText('$29.99')).toBeInTheDocument();
      expect(screen.getByText('$39.99')).toBeInTheDocument();
    });

    it('renders product badges', () => {
      render(<ProductGrid products={mockProducts} />);
      expect(screen.getByText('Sale')).toBeInTheDocument();
    });

    it('renders product links correctly', () => {
      render(<ProductGrid products={mockProducts} />);
      const links = screen.getAllByRole('link');
      expect(links[0]).toHaveAttribute('href', '/product1');
      expect(links[1]).toHaveAttribute('href', '/product2');
    });

    it('applies correct grid classes for different column counts', () => {
      const { container, rerender } = render(
        <ProductGrid products={mockProducts} columns={2} />
      );
      expect(container.querySelector('.grid-cols-1')).toBeInTheDocument();

      rerender(<ProductGrid products={mockProducts} columns={3} />);
      expect(container.querySelector('.lg\\:grid-cols-3')).toBeInTheDocument();

      rerender(<ProductGrid products={mockProducts} columns={4} />);
      expect(container.querySelector('.lg\\:grid-cols-4')).toBeInTheDocument();
    });
  });

  describe('ProductImageCarousel', () => {
    const mockImages = [
      { src: '/image1.jpg', alt: 'Image 1' },
      { src: '/image2.jpg', alt: 'Image 2' },
      { src: '/image3.jpg', alt: 'Image 3' },
    ];

    it('renders the first image by default', () => {
      render(<ProductImageCarousel images={mockImages} />);
      const images = screen.getAllByAltText('Image 1');
      expect(images.length).toBeGreaterThan(0);
      expect(images[0]).toHaveAttribute('src', '/image1.jpg');
    });

    it('renders navigation arrows for multiple images', () => {
      render(<ProductImageCarousel images={mockImages} />);
      expect(screen.getByLabelText('Previous image')).toBeInTheDocument();
      expect(screen.getByLabelText('Next image')).toBeInTheDocument();
    });

    it('does not render arrows for single image', () => {
      render(<ProductImageCarousel images={[mockImages[0]]} />);
      expect(screen.queryByLabelText('Previous image')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Next image')).not.toBeInTheDocument();
    });

    it('navigates to next image on button click', () => {
      render(<ProductImageCarousel images={mockImages} />);
      const nextButton = screen.getByLabelText('Next image');
      fireEvent.click(nextButton);
      const images = screen.getAllByAltText('Image 2');
      expect(images.length).toBeGreaterThan(0);
    });

    it('navigates to previous image on button click', () => {
      render(<ProductImageCarousel images={mockImages} />);
      const prevButton = screen.getByLabelText('Previous image');
      fireEvent.click(prevButton);
      const images = screen.getAllByAltText('Image 3');
      expect(images.length).toBeGreaterThan(0);
    });

    it('renders thumbnail navigation', () => {
      render(<ProductImageCarousel images={mockImages} />);
      const thumbnails = screen.getAllByRole('button');
      expect(thumbnails.length).toBe(5); // 2 arrow buttons + 3 thumbnail buttons
    });

    it('switches image on thumbnail click', () => {
      render(<ProductImageCarousel images={mockImages} />);
      const thumbnails = screen.getAllByRole('button');
      const thirdThumbnail = thumbnails[4]; // Skip the 2 arrow buttons
      fireEvent.click(thirdThumbnail);
      const images = screen.getAllByAltText('Image 3');
      expect(images.length).toBeGreaterThan(0);
    });

    it('applies zoom class when enabled', () => {
      render(<ProductImageCarousel images={mockImages} zoomEnabled={true} />);
      const images = screen.getAllByAltText('Image 1');
      expect(images[0]).toHaveClass('cursor-zoom-in');
    });
  });

  describe('UpsellCarousel', () => {
    const mockProducts = [
      {
        title: 'Upsell Product 1',
        image: '/upsell1.jpg',
        price: 19.99,
        url: '/upsell1',
      },
      {
        title: 'Upsell Product 2',
        image: '/upsell2.jpg',
        price: 24.99,
        url: '/upsell2',
      },
      {
        title: 'Upsell Product 3',
        image: '/upsell3.jpg',
        price: 29.99,
        url: '/upsell3',
      },
    ];

    it('renders all products', () => {
      render(<UpsellCarousel products={mockProducts} />);
      expect(screen.getByText('Upsell Product 1')).toBeInTheDocument();
      expect(screen.getByText('Upsell Product 2')).toBeInTheDocument();
      expect(screen.getByText('Upsell Product 3')).toBeInTheDocument();
    });

    it('renders optional title', () => {
      render(<UpsellCarousel title="You May Also Like" products={mockProducts} />);
      expect(screen.getByText('You May Also Like')).toBeInTheDocument();
    });

    it('does not render title when not provided', () => {
      const { container } = render(<UpsellCarousel products={mockProducts} />);
      const heading = container.querySelector('h2');
      expect(heading).not.toBeInTheDocument();
    });

    it('renders product prices correctly', () => {
      render(<UpsellCarousel products={mockProducts} />);
      expect(screen.getByText('$19.99')).toBeInTheDocument();
      expect(screen.getByText('$24.99')).toBeInTheDocument();
      expect(screen.getByText('$29.99')).toBeInTheDocument();
    });

    it('renders product links', () => {
      render(<UpsellCarousel products={mockProducts} />);
      const links = screen.getAllByRole('link');
      expect(links[0]).toHaveAttribute('href', '/upsell1');
      expect(links[1]).toHaveAttribute('href', '/upsell2');
      expect(links[2]).toHaveAttribute('href', '/upsell3');
    });

    it('renders scroll container', () => {
      const { container } = render(<UpsellCarousel products={mockProducts} />);
      const scrollContainer = container.querySelector('.overflow-x-auto');
      expect(scrollContainer).toBeInTheDocument();
    });
  });
});
